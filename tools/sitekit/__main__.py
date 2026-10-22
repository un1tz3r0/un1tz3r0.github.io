"""sitekit: keeps the site's data fresh. Run `sitekit -h` for the commands."""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path

from . import compose, demos, gallery, history, importers, mirror, pulse
from .common import expand, find_site, load_toml
from .feed import Feed


def entry_args(p: argparse.ArgumentParser) -> None:
    p.add_argument('--tag', action='append', default=[], dest='tags', help='tag the entry (repeatable)')
    p.add_argument('--project', help='project id the entry belongs to')
    p.add_argument('--time', dest='when', help='ISO timestamp (default: now)')


def parser() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(prog='sitekit', description=__doc__)
    ap.add_argument('--site', type=Path, help='site checkout (default: nearest folder with a site.toml)')
    sub = ap.add_subparsers(dest='cmd', required=True)

    h = sub.add_parser('history', help='rebuild data/github.json and the commit entries of the feed from git')
    h.add_argument('--no-api', action='store_true', help="don't list repos through the GitHub API; use site.toml's list only")
    h.add_argument('--repo', action='append', default=[], help='extra repo: owner/name or a local path (repeatable)')
    h.add_argument('--repos-from', type=Path, help='JSON list of extra repo specs')
    h.add_argument('--no-feed', action='store_true', help='leave the feed alone')
    h.add_argument('--jobs', type=int, default=8)

    p = sub.add_parser('post', help='publish a blog post')
    p.add_argument('title')
    p.add_argument('body', help='markdown file, or - for stdin')
    entry_args(p)
    s = sub.add_parser('status', help='publish a short status update (markdown)')
    s.add_argument('text')
    entry_args(s)
    ln = sub.add_parser('link', help='share a link; fetches its title and preview')
    ln.add_argument('url')
    ln.add_argument('text', nargs='?', help='your comment (markdown)')
    ln.add_argument('--title')
    ln.add_argument('--no-fetch', action='store_true')
    entry_args(ln)
    m = sub.add_parser('media', help='share an image, video or audio file (copied into media/) or URL')
    m.add_argument('src')
    m.add_argument('caption', nargs='?')
    entry_args(m)
    rm = sub.add_parser('rm', help='remove a feed entry by id')
    rm.add_argument('id')

    imp = sub.add_parser('import', help='import history from another service')
    isub = imp.add_subparsers(dest='service', required=True)
    tw = isub.add_parser('twitter', help='a Twitter/X archive (.zip or unpacked folder)')
    tw.add_argument('archive', type=Path)
    tw.add_argument('--replies', action='store_true', help='include replies to other people')
    tw.add_argument('--retweets', action='store_true')
    tw.add_argument('--media', action='store_true', help='copy attached media into media/twitter/')
    lj = isub.add_parser('lj', help='LiveJournal XML exports or ljdump folders')
    lj.add_argument('paths', nargs='+', type=Path)
    lj.add_argument('--user', help='journal name, used in entry ids')
    lj.add_argument('--utc-offset', type=float, default=0, help='hours east of UTC your journal times are in')
    fd = isub.add_parser('feed', help='an RSS or Atom feed')
    fd.add_argument('url')
    fd.add_argument('--source', required=True, help='name shown on entries, e.g. mastodon')
    fd.add_argument('--kind', choices=['post', 'status', 'link', 'media', 'lj'], help='entry kind (default: post if titled)')

    sub.add_parser('sync', help="import new entries from every feed listed in site.toml's [[feeds]]")

    ga = sub.add_parser('gallery', help='add images, GIFs, videos or YouTube links to the gallery, or remove them')
    gsub = ga.add_subparsers(dest='action', required=True)
    gadd = gsub.add_parser('add', help='transcode files into gallery/ (GIFs become video loops) and list them in data/gallery.json')
    gadd.add_argument('sources', nargs='+', help='files or YouTube links')
    gadd.add_argument('--title', help='caption for every source in this batch')
    gadd.add_argument('--masters', type=Path, help='also write full-size copies here (default: [media].masters in site.toml)')
    gadd.add_argument('--refresh', action='store_true', help='encode sources already in the gallery again (e.g. to make their masters)')
    gadd.add_argument('--jobs', type=int, default=os.cpu_count() or 4)
    grm = gsub.add_parser('rm', help='remove items by id, with their previews')
    grm.add_argument('ids', nargs='+')

    sub.add_parser('mirror', help="upload [media].masters to the [media].remote bucket, then point the gallery at [media].base")
    sub.add_parser('backup', help="copy the [media].remote bucket to [media].backup, keeping replaced and deleted files by date")

    pu = sub.add_parser('pulse', help='the local activity daemon')
    pu.add_argument('action', choices=['run', 'publish', 'status'])
    pu.add_argument('--config', type=Path, default=pulse.CONFIG)

    de = sub.add_parser('demos', help='build demos that live in other repos (see data/demos.json)')
    de.add_argument('ids', nargs='*')
    return ap


async def dispatch(a: argparse.Namespace) -> None:
    if a.cmd == 'pulse':
        settings = pulse.Settings.load(expand(a.config))
        if a.action == 'run':
            return await pulse.daemon(settings)
        if a.action == 'status':
            return await pulse.status(settings, expand(a.config))
        return await pulse.publish(settings, pulse.open_db(settings.db))

    site = a.site.resolve() if a.site else find_site()
    feed = Feed(site)
    extra = {k: getattr(a, k) for k in ('tags', 'project', 'when') if getattr(a, k, None)}
    added = None
    match a.cmd:
        case 'history':
            specs = tuple(a.repo) + tuple(json.loads(a.repos_from.read_text()) if a.repos_from else ())
            await history.build(site, load_toml(site / 'site.toml'), api=not a.no_api, extra=specs, feed=not a.no_feed, jobs=a.jobs)
        case 'post':
            body = sys.stdin.read() if a.body == '-' else Path(a.body).read_text()
            added = [compose.post(a.title, body, **extra)]
        case 'status':
            added = [compose.status(a.text, **extra)]
        case 'link':
            added = [await compose.link(a.url, a.text, a.title, fetch=not a.no_fetch, **extra)]
        case 'media':
            added = [compose.media(site, a.src, a.caption, **extra)]
        case 'rm':
            print('removed' if feed.remove(a.id) else f'no entry {a.id}')
        case 'import':
            added = (importers.twitter(site, a.archive, a.replies, a.retweets, a.media) if a.service == 'twitter'
                     else importers.livejournal(a.paths, a.user, a.utc_offset) if a.service == 'lj'
                     else await importers.syndication(a.url, a.source, a.kind))
        case 'sync':
            added = await importers.sync(load_toml(site / 'site.toml').get('feeds', []), feed.urls())
        case 'gallery':
            media = load_toml(site / 'site.toml').get('media', {})
            if a.action == 'rm':
                print('\n'.join(gallery.remove(site, a.ids, media.get('base', ''))) or 'nothing removed')
            else:
                masters = a.masters or (expand(media['masters']) if media.get('masters') else None)
                await gallery.add(site, a.sources, media.get('base', ''), a.title, masters, a.jobs, a.refresh)
        case 'mirror':
            await mirror.push(site, load_toml(site / 'site.toml').get('media', {}))
        case 'backup':
            await mirror.backup(load_toml(site / 'site.toml').get('media', {}))
        case 'demos':
            await demos.build(site, a.ids)
    if added is not None:
        print(f'{feed.upsert(added)} of {len(added)} entries new or changed')
        if len(added) == 1:
            print(added[0]['id'])


def main(argv=None) -> None:
    asyncio.run(dispatch(parser().parse_args(argv)))


if __name__ == '__main__':
    main()
