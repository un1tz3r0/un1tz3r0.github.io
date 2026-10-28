"""Hand-written feed entries: posts, status updates, links (with their page's title and preview) and media."""
from __future__ import annotations

import mimetypes
import shutil
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path

import aiohttp
from yarl import URL

from .common import digest, now, parse_time, iso, slug


def stamp(when: str | None) -> str:
    return iso(parse_time(when)) if when else now()


def post(title: str, text: str, when=None, **extra) -> dict:
    day = (datetime.fromisoformat(when.replace('Z', '+00:00')) if when else datetime.now().astimezone()).date()
    return {'id': f'post:{day}-{slug(title)}', 'time': stamp(when), 'kind': 'post', 'source': 'site', 'title': title, 'text': text, **extra}


def status(text: str, when=None, **extra) -> dict:
    t = stamp(when)
    return {'id': f'status:{digest(t, text)}', 'time': t, 'kind': 'status', 'source': 'site', 'text': text, **extra}


class PageMeta(HTMLParser):
    """Collects <title> and OpenGraph/Twitter card fields from the head of a page."""

    def __init__(self):
        super().__init__()
        self.meta, self._in_title, self.title = {}, False, ''

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'title':
            self._in_title = True
        elif tag == 'meta' and (key := a.get('property') or a.get('name')) and a.get('content'):
            self.meta.setdefault(key.lower(), a['content'])

    def handle_endtag(self, tag):
        self._in_title &= tag != 'title'

    def handle_data(self, data):
        if self._in_title:
            self.title += data


async def preview(url: str) -> dict:
    timeout = aiohttp.ClientTimeout(total=15)
    async with aiohttp.ClientSession(timeout=timeout, headers={'User-Agent': 'Mozilla/5.0 (sitekit link preview)'}) as http:
        async with http.get(url) as r:
            if 'html' not in r.headers.get('Content-Type', ''):
                return {}
            head = (await r.content.read(256 * 1024)).decode(r.charset or 'utf-8', 'replace')
    p = PageMeta()
    p.feed(head)
    m = p.meta
    image = m.get('og:image') or m.get('twitter:image')
    return {'title': (m.get('og:title') or p.title).strip() or None,
            'summary': m.get('og:description') or m.get('description'),
            'image': str(URL(url).join(URL(image))) if image else None}


async def link(url: str, text: str | None = None, title: str | None = None, when=None, fetch=True, **extra) -> dict:
    info = await preview(url) if fetch else {}
    t = stamp(when)
    return {'id': f'link:{digest(url)}', 'time': t, 'kind': 'link', 'source': 'site', 'url': url,
            'title': title or info.get('title'), 'text': text,
            'meta': {k: info.get(k) for k in ('summary', 'image') if info.get(k)}, **extra}


def media(site: Path, src: str, caption: str | None = None, when=None, **extra) -> dict:
    """A local file is copied into media/YYYY/MM/ so the site serves it; a URL is referenced as is."""
    t = stamp(when)
    if '://' not in src:
        path = Path(src).expanduser()
        dest = site / 'media' / t[:4] / t[5:7] / f'{slug(path.stem)}{path.suffix.lower()}'
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dest)
        src = dest.relative_to(site).as_posix()
    kind = (mimetypes.guess_type(src)[0] or 'image/').split('/')[0]
    return {'id': f'media:{digest(src)}', 'time': t, 'kind': 'media', 'source': 'site', 'text': caption,
            'media': [{'type': kind if kind in ('image', 'video', 'audio') else 'image', 'src': src, 'alt': caption or ''}], **extra}
