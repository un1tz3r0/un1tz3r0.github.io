"""Per-day commit history for every repo, read from git itself.

Repos come from the GitHub API (all of a user's repos, forks included) plus any listed in site.toml, which may also be
local checkouts. Remote repos are mirrored as bare, commit-only partial clones (--filter=tree:0), so even huge forks cost
a few hundred KB; forks are cut at their fork date. Output: data/github.json for the timeline, and one 'commits' feed
entry per repo per day for the activity log (public repos only).

Commits Claude wrote (a Claude-Session trailer, a Claude co-author, or Claude as author) are marked, and in repos owned
by [claude].owners (default: [github].user) they count even though Claude, not you, is the author: you reviewed and
merged them. Their sessions feed data/claude.json; see claude.py.
"""
from __future__ import annotations

import asyncio
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

import aiohttp

from . import claude
from .common import API, api_headers, expand, iso, now, read_json, run, write_json
from .feed import Feed

SEP = '\x1f'
LOG = SEP.join(('%H', '%aI', '%an <%ae>', '%s', '%(trailers:key=Claude-Session,valueonly,separator=%x1e)',
                '%(trailers:key=Co-Authored-By,valueonly,separator=%x1e)'))
CLAUDE = re.compile(r'\bclaude\b', re.I)


@dataclass(frozen=True)
class Commit:
    when: datetime
    sha: str
    subject: str
    claude: bool
    session: str | None


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


async def commits(path: Path, author: re.Pattern, claude_counts: bool) -> list[Commit]:
    """Your commits, plus Claude's when claude_counts. Records end in NUL (-z) so multi-value trailers stay put."""
    out = await run('git', '-C', str(path), 'log', '-z', '--branches', '--remotes', '--tags', f'--format={LOG}')
    seen, rows = set(), []
    for record in filter(None, out.split('\0')):
        sha, when, who, subject, session, coauthors = record.strip('\n').split(SEP, 5)
        session = claude.SESSION.search(session)
        by_claude = bool(session) or bool(CLAUDE.search(coauthors)) or who.lower().startswith('claude <')
        if sha not in seen and (author.search(who) or by_claude and claude_counts):
            seen.add(sha)
            rows.append(Commit(datetime.fromisoformat(when), sha, subject, by_claude, session and session[1]))
    return sorted(rows, key=lambda c: c.when)


def summarize(repo: Repo, rows: list[Commit]) -> tuple[dict, list[dict]]:
    """Timeline record (commits per local calendar day, and how many of them Claude wrote) and the feed entries."""
    days, by_claude, last, subjects = Counter(), Counter(), {}, defaultdict(list)
    for c in rows:
        day = c.when.date().isoformat()
        days[day] += 1
        by_claude[day] += c.claude
        last[day] = c
        subjects[day].append(c.subject)
    link = repo.meta.get('url')
    record = {**{k: v for k, v in repo.meta.items() if v not in (None, '', [])}, 'fork': repo.fork or None,
              'commits': sum(days.values()), 'first': min(days), 'last': max(days), 'days': dict(sorted(days.items())),
              'claude': dict(sorted((d, n) for d, n in by_claude.items() if n)) or None}
    entries = [] if not repo.public else [{
        'id': f'gh:{repo.name}:{day}', 'time': iso(c.when), 'kind': 'commits', 'source': 'github', 'repo': repo.name,
        'url': f'{link}/commit/{c.sha}' if link else None, 'count': days[day], 'claude': by_claude[day] or None,
        'items': subjects[day][::-1][:8],
    } for day, c in last.items()]
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
    owners = {o.lower() for o in cfg.get('claude', {}).get('owners', [user])}

    async def one(repo: Repo):
        async with gate:
            try:
                return repo, await commits(await mirror(repo, cache), author, repo.local or repo.name.split('/')[0].lower() in owners)
            except RuntimeError as e:
                print(f'  skip {repo.name}: {e}', file=sys.stderr)
                return repo, None

    out_path = site / 'data' / 'github.json'
    previous = read_json(out_path, {}).get('repos', {})
    timeline, entries, failed, sessions = {}, [], set(), {}
    for repo, rows in await asyncio.gather(*map(one, unique.values())):
        if rows:
            sessions[repo.name] = [c for c in rows if c.session]
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
    if cfg.get('claude', {}).get('enabled', True):
        await claude.link(site, cfg, timeline, sessions, failed, api=api)
    if feed:
        stale = lambda e: e.get('source') == 'github' and e.get('repo') not in failed
        print(f'{Feed(site).upsert(entries, drop=stale)} feed entries changed')
