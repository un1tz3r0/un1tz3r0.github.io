"""Per-day commit history for every repo, read from git itself.

Repos come from the GitHub API (all of a user's repos, forks included) plus any listed in site.toml, which may also be
local checkouts. Remote repos are mirrored as bare, commit-only partial clones (--filter=tree:0), so even huge forks cost
a few hundred KB; forks are cut at their fork date. Output: data/github.json for the timeline, and one 'commits' feed
entry per repo per day for the activity log (public repos only).
"""
from __future__ import annotations

import asyncio
import os
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

import aiohttp
from yarl import URL

from .common import expand, iso, now, read_json, run, write_json
from .feed import Feed

API = URL('https://api.github.com')
SEP = '\x1f'


@dataclass
class Repo:
    name: str
    url: str
    fork: bool = False
    since: str | None = None
    local: bool = False
    meta: dict = field(default_factory=dict)

    @property
    def public(self) -> bool:
        return not self.local and not self.meta.get('private')


def spec(s: str | dict) -> Repo:
    """'owner/name', a local path, or a table {name, url, fork, since, meta}."""
    if isinstance(s, dict):
        return Repo(**s)
    if s.startswith(('/', '~', '.')):
        p = expand(s).resolve()
        return Repo(p.name, str(p), local=True, meta={'private': True})
    return Repo(s, f'https://github.com/{s}.git', meta={'url': f'https://github.com/{s}'})


def api_headers() -> dict:
    h = {'Accept': 'application/vnd.github+json', 'User-Agent': 'sitekit'}
    if token := os.environ.get('GITHUB_TOKEN'):
        h['Authorization'] = f'Bearer {token}'
    return h


async def discover(user: str, forks: bool, private: bool) -> list[Repo]:
    url = (API / 'user' / 'repos' % {'affiliation': 'owner'}) if private else (API / 'users' / user / 'repos' % {'type': 'owner'})
    url = url.update_query(per_page=100)
    repos = []
    async with aiohttp.ClientSession(headers=api_headers()) as http:
        while url:
            async with http.get(url) as r:
                r.raise_for_status()
                page, url = await r.json(), r.links.get('next', {}).get('url')
            for g in page:
                if g['fork'] and not forks:
                    continue
                repos.append(Repo(g['full_name'], g['clone_url'], g['fork'], g['created_at'][:10] if g['fork'] else None, meta={
                    'url': g['html_url'], 'description': g['description'], 'language': g['language'],
                    'topics': g.get('topics') or [], 'homepage': g['homepage'] or None, 'stars': g['stargazers_count'],
                    'private': g['private'], 'archived': g['archived'], 'created': g['created_at'][:10]}))
    return repos


async def mirror(repo: Repo, cache: Path) -> Path:
    if repo.local:
        return Path(repo.url)
    path = cache / (repo.name.replace('/', '__') + '.git')
    if path.exists():
        await run('git', '-C', str(path), 'fetch', '--quiet', '--prune', '--filter=tree:0', 'origin', '+refs/heads/*:refs/heads/*')
    else:
        limit = [f'--shallow-since={repo.since}'] if repo.since else ['--depth=300'] if repo.fork else []
        await run('git', 'clone', '--quiet', '--bare', '--filter=tree:0', *limit, repo.url, str(path))
    return path


async def commits(path: Path, author: re.Pattern) -> list[tuple[datetime, str, str]]:
    out = await run('git', '-C', str(path), 'log', '--branches', '--remotes', '--tags',
                    f'--format=%H{SEP}%aI{SEP}%an <%ae>{SEP}%s')
    seen, rows = set(), []
    for line in out.splitlines():
        sha, when, who, subject = line.split(SEP, 3)
        if sha not in seen and author.search(who):
            seen.add(sha)
            rows.append((datetime.fromisoformat(when), sha, subject))
    return sorted(rows)


def summarize(repo: Repo, rows) -> tuple[dict, list[dict]]:
    """Timeline record (commits per local calendar day) and the day-by-day feed entries."""
    days, last, subjects = Counter(), {}, defaultdict(list)
    for when, sha, subject in rows:
        day = when.date().isoformat()
        days[day] += 1
        last[day] = (when, sha)
        subjects[day].append(subject)
    link = repo.meta.get('url')
    record = {**{k: v for k, v in repo.meta.items() if v not in (None, '', [])}, 'fork': repo.fork or None,
              'commits': sum(days.values()), 'first': min(days), 'last': max(days), 'days': dict(sorted(days.items()))}
    entries = [] if not repo.public else [{
        'id': f'gh:{repo.name}:{day}', 'time': iso(when), 'kind': 'commits', 'source': 'github', 'repo': repo.name,
        'url': f'{link}/commit/{sha}' if link else None, 'count': days[day], 'items': subjects[day][::-1][:8],
    } for day, (when, sha) in last.items()]
    return {k: v for k, v in record.items() if v is not None}, entries


async def build(site: Path, cfg: dict, *, api: bool = True, extra: tuple = (), feed: bool = True, jobs: int = 8) -> None:
    gh = cfg.get('github', {})
    user = gh['user']
    author = re.compile(gh.get('author', re.escape(user)), re.I)
    repos = await discover(user, gh.get('forks', True), gh.get('private', False)) if api else []
    repos += [spec(s) for s in [*gh.get('repos', []), *extra]]
    ignore = set(gh.get('ignore', []))
    unique = {r.name: r for r in reversed(repos) if r.name not in ignore and r.name.split('/')[-1] not in ignore}
    cache = expand(gh.get('cache', '~/.cache/sitekit/git'))
    cache.mkdir(parents=True, exist_ok=True)
    gate = asyncio.Semaphore(jobs)

    async def one(repo: Repo):
        async with gate:
            try:
                return repo, await commits(await mirror(repo, cache), author)
            except RuntimeError as e:
                print(f'  skip {repo.name}: {e}', file=sys.stderr)
                return repo, None

    out_path = site / 'data' / 'github.json'
    previous = read_json(out_path, {}).get('repos', {})
    timeline, entries, failed = {}, [], set()
    for repo, rows in await asyncio.gather(*map(one, unique.values())):
        if rows is None:
            failed.add(repo.name)
            if repo.name in previous:
                timeline[repo.name] = previous[repo.name]
        elif rows:
            timeline[repo.name], days = summarize(repo, rows)
            entries += days
    write_json(out_path, {'generated': now(), 'user': user, 'repos': dict(sorted(timeline.items()))})
    total = sum(r['commits'] for r in timeline.values())
    print(f'{len(timeline)} of {len(unique)} repos have your commits, {total} in all → {out_path.relative_to(site)}')
    if feed:
        stale = lambda e: e.get('source') == 'github' and e.get('repo') not in failed
        print(f'{Feed(site).upsert(entries, drop=stale)} feed entries changed')
