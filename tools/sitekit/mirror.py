"""Full-size media in a bucket, and a local delta backup of that bucket, both through rclone.

Any rclone remote works: Google Cloud Storage, Cloudflare R2, Backblaze B2, Bunny Storage, S3. Set the remote up once
with `rclone config`, then name it in site.toml's [media] table.
"""
from __future__ import annotations

import asyncio
import shutil
import sys
from datetime import datetime
from pathlib import Path

from .common import expand, read_json
from .gallery import save

CACHE = 'Cache-Control: public, max-age=604800'


def need(media: dict, key: str) -> str:
    return media.get(key) or sys.exit(f'sitekit: set {key} in the [media] table of site.toml')


async def rclone(*args: str) -> None:
    exe = shutil.which('rclone') or sys.exit('sitekit: rclone is not installed, see https://rclone.org/install/')
    proc = await asyncio.create_subprocess_exec(exe, *args, '--fast-list', '-v')
    if await proc.wait():
        sys.exit(f'sitekit: rclone {args[0]} failed')


async def push(site: Path, media: dict) -> None:
    """Make the bucket match [media].masters, then point the gallery's full-size links at [media].base."""
    await rclone('sync', str(expand(need(media, 'masters'))), need(media, 'remote'), '--header-upload', CACHE)
    path = site / 'data' / 'gallery.json'
    save(path, read_json(path, {'items': []})['items'], media.get('base', ''))


async def backup(media: dict) -> None:
    """Mirror the bucket into <backup>/current; whatever a run replaces or deletes moves to <backup>/history/<time>."""
    dest = expand(need(media, 'backup'))
    await rclone('sync', need(media, 'remote'), str(dest / 'current'), '--backup-dir', str(dest / 'history' / datetime.now().strftime('%Y-%m-%dT%H%M')))
