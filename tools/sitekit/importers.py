"""Importers that turn other services' history into feed entries.

twitter: the archive from Settings › Your account › Download an archive (zip or unpacked folder).
lj:      LiveJournal XML exports (livejournal.com/export.bml, one file per month) or ljdump's per-entry files.
feed:    any RSS or Atom URL: a LiveJournal (user.livejournal.com/data/atom), Mastodon (@user.rss), Bluesky
         (bsky.app/profile/handle/rss), YouTube channel or blog feed.
"""
from __future__ import annotations

import html
import json
import re
import xml.etree.ElementTree as ET
import zipfile
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

import aiohttp

from .common import digest, iso, parse_time


class Archive:
    """A zip file or an unpacked folder, read the same way."""

    def __init__(self, path: Path):
        self.zip = zipfile.ZipFile(path) if path.is_file() else None
        self.root = path

    def names(self) -> list[str]:
        return self.zip.namelist() if self.zip else [p.relative_to(self.root).as_posix() for p in self.root.rglob('*') if p.is_file()]

    def read(self, name: str) -> bytes:
        return self.zip.read(name) if self.zip else (self.root / name).read_bytes()


def ytd(raw: bytes):
    """Archive data files are `window.YTD.<name>.partN = [...]`."""
    text = raw.decode('utf-8')
    return json.loads(text[text.index('=') + 1:])


def twitter(site: Path, path: Path, replies=False, retweets=False, copy_media=False) -> list[dict]:
    arc = Archive(path)
    names = arc.names()
    account = next((ytd(arc.read(n))[0]['account'] for n in names if n.endswith('data/account.js')), {})
    user, uid = account.get('username', 'i'), account.get('accountId')
    media_files = {}
    for n in names:
        if m := re.search(r'data/tweets?_media/(\d+)-([^/]+)$', n):
            media_files.setdefault(m[1], []).append(n)
    out = []
    for name in (n for n in names if re.search(r'data/tweets?(-part\d+)?\.js$', n)):
        for item in ytd(arc.read(name)):
            t = item.get('tweet', item)
            text = html.unescape(t['full_text'])
            reply_to = t.get('in_reply_to_user_id_str')
            if (text.startswith('RT @') and not retweets) or (reply_to and reply_to != uid and not replies):
                continue
            ents = t.get('entities', {})
            for u in ents.get('urls', []):
                text = text.replace(u['url'], u['expanded_url'])
            media = []
            for m in t.get('extended_entities', ents).get('media', []):
                text = text.replace(m['url'], '')
                kind = 'image' if m['type'] == 'photo' else 'video'
                src = m['media_url_https']
                if kind == 'video':
                    src = max(m.get('video_info', {}).get('variants', [{'url': src}]), key=lambda v: int(v.get('bitrate', 0)))['url']
                media.append({'type': kind, 'src': src, 'alt': m.get('ext_alt_text') or ''})
            if copy_media and (files := media_files.get(t['id_str'])):
                media = []
                for n in files:
                    dest = site / 'media' / 'twitter' / Path(n).name
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    dest.write_bytes(arc.read(n))
                    media.append({'type': 'video' if dest.suffix == '.mp4' else 'image', 'src': dest.relative_to(site).as_posix()})
            when = datetime.strptime(t['created_at'], '%a %b %d %H:%M:%S %z %Y')
            out.append({'id': f'tw:{t["id_str"]}', 'time': iso(when), 'kind': 'tweet', 'source': 'twitter', 'text': text.strip(),
                        'url': f'https://twitter.com/{user}/status/{t["id_str"]}', 'media': media})
    return out


LJ_USER = re.compile(r'<lj\s+(?:user|comm)\s*=\s*["\']?([\w-]+)["\']?\s*/?>', re.I)
LJ_DROP = re.compile(r'</?lj-(?:cut|raw|embed)[^>]*>', re.I)


def lj_html(body: str, preformatted: bool) -> str:
    body = LJ_USER.sub(lambda m: f'<a href="https://{m[1].replace("_", "-")}.livejournal.com/">{m[1]}</a>', body)
    body = LJ_DROP.sub('', body)
    return body if preformatted else body.replace('\r\n', '\n').replace('\n', '<br>\n')


def livejournal(paths: list[Path], user: str | None = None, offset_hours: float = 0) -> list[dict]:
    tz = timezone(timedelta(hours=offset_hours))
    files = [f for p in paths for f in (sorted(p.rglob('*')) if p.is_dir() else [p]) if f.is_file()]
    out = []
    for f in files:
        try:
            root = ET.parse(f).getroot()
        except ET.ParseError:
            continue
        for el in ([root] if root.tag == 'event' else root.iter('entry')):
            field = lambda k: (next((c.text for c in el.iter(k)), None) or '').strip()
            if (field('security') or 'public') != 'public':
                continue
            itemid = field('itemid') or field('ditemid')
            when = datetime.strptime(field('eventtime'), '%Y-%m-%d %H:%M:%S').replace(tzinfo=tz)
            out.append({'id': f'lj:{user or "journal"}:{itemid}', 'time': iso(when), 'kind': 'lj', 'source': 'livejournal',
                        'title': html.unescape(field('subject')) or None,
                        'html': lj_html(field('event'), field('opt_preformatted') == '1'), 'url': field('url') or None,
                        'tags': [t.strip() for t in field('taglist').split(',') if t.strip()],
                        'meta': {k: v for k, v in (('mood', field('current_mood')), ('music', field('current_music'))) if v}})
    return out


def local(tag: str) -> str:
    return tag.rsplit('}', 1)[-1]


async def syndication(url: str, source: str, kind: str | None = None) -> list[dict]:
    async with aiohttp.ClientSession(headers={'User-Agent': 'sitekit feed import'}) as http:
        async with http.get(url) as r:
            r.raise_for_status()
            root = ET.fromstring(await r.read())
    out = []
    for item in (e for e in root.iter() if local(e.tag) in ('item', 'entry')):
        kids = list(item)
        find = lambda *names: next((c for n in names for c in kids if local(c.tag) == n), None)
        text = lambda *names: ((el := find(*names)) is not None and (el.text or '').strip()) or None
        links = [c for c in kids if local(c.tag) == 'link']
        href = next((c.get('href') for c in links if c.get('href') and c.get('rel', 'alternate') == 'alternate'), None)
        link = href or text('link')
        date = text('pubDate', 'published', 'updated', 'date')
        when = parsedate_to_datetime(date) if date and not date[:4].isdigit() else parse_time(date) if date else None
        if when is None:
            continue
        media = [{'type': (c.get('type') or c.get('medium') or 'image').split('/')[0], 'src': c.get('url') or c.get('href')}
                 for c in item.iter() if local(c.tag) in ('enclosure', 'content', 'link')
                 and (c.get('url') or (c.get('rel') == 'enclosure' and c.get('href')))]
        title = text('title')
        out.append({'id': f'{source}:{digest(text("guid", "id") or link)}', 'time': iso(when), 'kind': kind or ('post' if title else 'status'),
                    'source': source, 'title': title, 'html': text('encoded', 'content', 'description', 'summary'), 'url': link,
                    'media': [m for m in media if m['type'] in ('image', 'video', 'audio')]})
    return out
