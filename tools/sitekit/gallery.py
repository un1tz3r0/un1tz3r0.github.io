"""The gallery: data/gallery.json, small previews in gallery/, and optional full-size masters for a bucket or CDN.

A source is an image, a GIF, a video file or a YouTube link. Animated GIFs become silent H.264 loops (a fraction of
the size, and they play smoother); stills become WebP. Previews are sized for the page and committed. Masters, at full
resolution, go to [media].masters, which `sitekit mirror` copies to the bucket; the site switches the lightbox to
them once [media].base points at that bucket.
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import re
from pathlib import Path

import aiohttp
from yarl import URL

from .common import read_json, run, slug, write_rows

PREVIEW = 640
POSTER = 480
YOUTUBE = re.compile(r'(?:youtu\.be/|youtube\.com/(?:watch\?(?:.*&)?v=|shorts/|embed/|live/))([\w-]{11})')
H264 = ('-c:v', 'libx264', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-fps_mode', 'vfr')


def fit(h: int) -> str:
    return f"scale=-2:'min({h},ih)':flags=lanczos"


def natural(s: str):
    return [int(t) if t.isdigit() else t for t in re.split(r'(\d+)', s)]


async def probe(path: Path) -> dict:
    j = json.loads(await run('ffprobe', '-v', 'error', '-count_packets', '-of', 'json', '-show_entries',
                             'stream=codec_type,width,height,nb_read_packets:format=duration', str(path)))
    v = next(s for s in j['streams'] if s['codec_type'] == 'video')
    return {'w': v['width'], 'h': v['height'], 'frames': int(v.get('nb_read_packets') or 1),
            'duration': round(float(j['format'].get('duration') or 0), 2),
            'audio': any(s['codec_type'] == 'audio' for s in j['streams'])}


async def ffmpeg(*args: str) -> None:
    await run('ffmpeg', '-v', 'error', '-y', *args)


async def youtube(url: str, vid: str, title: str | None) -> dict:
    try:
        async with aiohttp.ClientSession() as http:
            async with http.get(URL('https://www.youtube.com/oembed').with_query(url=url, format='json')) as r:
                meta = await r.json() if r.ok else {}
    except aiohttp.ClientError:
        meta = {}
    return {'id': f'yt-{vid}', 'kind': 'youtube', 'yt': vid, 'title': title or meta.get('title'),
            'w': meta.get('width', 16), 'h': meta.get('height', 9), 'poster': f'https://i.ytimg.com/vi/{vid}/hqdefault.jpg'}


async def encode(site: Path, src: Path, item: dict, masters: Path | None) -> dict:
    info = await probe(src)
    out, stem = site / 'gallery', item['id']
    out.mkdir(exist_ok=True)
    poster = f'gallery/{stem}.thumb.webp'
    kind = 'image' if info['frames'] == 1 else 'video' if info['audio'] or src.suffix.lower() != '.gif' and info['duration'] > 30 else 'loop'
    item |= {'kind': kind, 'w': info['w'], 'h': info['h'], 'poster': poster}
    at = '0' if kind != 'video' else str(info['duration'] / 10)
    jobs = [ffmpeg('-ss', at, '-i', str(src), '-vf', fit(POSTER), '-frames:v', '1', '-c:v', 'libwebp', '-quality', '80', str(site / poster))]
    if kind == 'image':
        item['src'] = f'gallery/{stem}.webp'
        jobs.append(ffmpeg('-i', str(src), '-frames:v', '1', '-c:v', 'libwebp', '-quality', '90', str(site / item['src'])))
    else:
        item |= {'src': f'gallery/{stem}.mp4', 'duration': info['duration']}
        sound = ('-c:a', 'aac', '-b:a', '128k') if kind == 'video' else ('-an',)
        jobs.append(ffmpeg('-i', str(src), '-vf', fit(720 if kind == 'video' else PREVIEW), *H264, '-crf', '26', *sound, str(site / item['src'])))
    if masters:
        (masters / 'gallery' / 'full').mkdir(parents=True, exist_ok=True)
        ext = 'webp' if kind == 'image' else 'mp4'
        item['full'] = f'gallery/full/{stem}.{ext}'
        target = str(masters / item['full'])
        jobs.append(ffmpeg('-i', str(src), '-frames:v', '1', '-c:v', 'libwebp', '-quality', '95', target) if kind == 'image' else
                    ffmpeg('-i', str(src), '-vf', fit(1080), *H264, '-crf', '20', *(('-c:a', 'aac', '-b:a', '192k') if kind == 'video' else ('-an',)), target))
    await asyncio.gather(*jobs)
    return item


def save(path: Path, items: list[dict], base: str) -> None:
    write_rows(path, {'base': base}, 'items', items)


async def add(site: Path, sources: list[str], base: str = '', title: str | None = None, masters: Path | None = None,
              jobs: int = 4, refresh: bool = False) -> list[dict]:
    """Add sources newest first: a batch is ordered by name, highest number on top. With `refresh`, sources already in
    the gallery are encoded again in place, which is how masters get made for pieces added without them."""
    path = site / 'data' / 'gallery.json'
    items = read_json(path, {'items': []})['items']
    have = {i.get('sha'): i for i in items if i.get('sha')}
    seen = set(have) | {i['id'] for i in items}
    gate = asyncio.Semaphore(jobs)

    async def one(source: str) -> dict | None:
        if m := YOUTUBE.search(source):
            return None if f'yt-{m[1]}' in seen else await youtube(source, m[1], title)
        src = Path(source).expanduser()
        sha = hashlib.sha1(src.read_bytes()).hexdigest()[:12]
        if sha in seen and not (refresh and sha in have):
            print(f'{src.name}: already in the gallery')
            return None
        seen.add(sha)
        if old := have.pop(sha, None):
            item = {k: old[k] for k in ('id', 'sha', 'title') if k in old} | ({'title': title} if title else {})
        else:
            stem = slug(src.stem)
            item = {'id': stem if stem not in seen else f'{stem}-{sha[:6]}', 'sha': sha, **({'title': title} if title else {})}
        seen.add(item['id'])
        async with gate:
            item = await encode(site, src, item, masters)
        print(f"{item['id']}  {item['kind']}  {item['w']}x{item['h']}")
        return item

    done = [i for i in reversed(await asyncio.gather(*map(one, sorted(sources, key=natural)))) if i]
    redone = {i['id']: i for i in done}
    save(path, [i for i in done if i['id'] not in {x['id'] for x in items}] + [redone.get(i['id'], i) for i in items], base)
    return done


def remove(site: Path, ids: list[str], base: str = '') -> list[str]:
    path = site / 'data' / 'gallery.json'
    manifest = read_json(path, {'items': []})
    gone = [i for i in manifest['items'] if i['id'] in ids]
    for item in gone:
        for key in ('src', 'poster'):
            if not item.get(key, '').startswith('http'):
                (site / item.get(key, '_')).unlink(missing_ok=True)
    save(path, [i for i in manifest['items'] if i not in gone], base)
    return [i['id'] for i in gone]
