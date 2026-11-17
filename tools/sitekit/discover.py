"""Find project folders: local git repos that push to a public GitHub repo of yours, filtered by [discover] in pulse.toml.

A repo is added when it pushes to a repo owned by one of `owners`, that repo is public (when `public_only`), no rule
denies it, and it isn't past `max_idle` or `max_age`. Rules run in order and the first match decides: deny drops the
repo, allow exempts it from the two age limits. Folders without a repo are never found; list those under [projects].
"""
from __future__ import annotations

import asyncio
import os
import re
import time
from dataclasses import dataclass
from datetime import datetime
from fnmatch import fnmatch
from pathlib import Path

from .common import expand, read_json, run, slug, write_json

GITHUB = re.compile(r'github\.com[:/]+([^/\s]+)/([^/\s]+?)(?:\.git)?/?$')
UNITS = {'h': 3600, 'd': 86400, 'w': 604800, 'm': 2592000, 'y': 31536000}
CACHE = expand('~/.cache/sitekit/github-repos.json')
SKIP = {'node_modules', '__pycache__', 'venv', 'build', 'dist', 'site-packages'}

# name: (description, test against a folder and its remote URLs)
CONDITIONS = {
    'dir': ('subfolder is present', lambda p, r, v: any(x.is_dir() for x in p.glob(v))),
    'no-dir': ('subfolder is missing', lambda p, r, v: not any(x.is_dir() for x in p.glob(v))),
    'file': ('file or dotfile is present', lambda p, r, v: any(x.is_file() for x in p.glob(v))),
    'no-file': ('file or dotfile is missing', lambda p, r, v: not any(x.is_file() for x in p.glob(v))),
    'remote': ('a remote URL matches', lambda p, r, v: any(fnmatch(u, v) for u in r)),
    'no-remote': ('no remote URL matches', lambda p, r, v: not any(fnmatch(u, v) for u in r)),
    'name': ('folder name matches', lambda p, r, v: fnmatch(p.name, v)),
    'path': ('full path matches', lambda p, r, v: fnmatch(str(p), str(expand(v)))),
}


@dataclass
class Found:
    path: Path
    remotes: list[str]
    repo: str | None = None     # owner/name of the GitHub repo it pushes to
    touched: float = 0.0
    created: float = 0.0
    id: str | None = None       # project id; None when not added
    why: str = ''               # why it was skipped


def duration(text: str | int | None) -> int:
    """'90d', '6m', '1y', '2w', '12h' or plain seconds; empty means no limit."""
    if not text:
        return 0
    if isinstance(text, int) or text.isdigit():
        return int(text)
    if not (m := re.fullmatch(r'(\d+)\s*([hdwmy])', text.strip().lower())):
        raise ValueError(f'bad duration {text!r}: use a number and one of h, d, w, m, y')
    return int(m[1]) * UNITS[m[2]]


def scan(roots: list[Path], depth: int) -> list[Path]:
    """Folders under the roots with a real .git directory. A .git file means a submodule or worktree of something else."""
    found = []
    for root in roots:
        base = len(root.parts)
        for d, subdirs, _ in os.walk(root):
            if Path(d, '.git').is_dir():
                found.append(Path(d))
                subdirs.clear()
            elif len(Path(d).parts) - base >= depth:
                subdirs.clear()
            else:
                subdirs[:] = [s for s in subdirs if not s.startswith('.') and s not in SKIP]
    return found


async def inspect(path: Path, owners: set[str]) -> Found:
    git = lambda *a: run('git', '-C', str(path), *a, check=False)
    urls = {u for name in (await git('remote')).split() for u in (await git('remote', 'get-url', '--push', '--all', name)).split()}
    repos = [f'{m[1]}/{m[2]}' for u in sorted(urls) if (m := GITHUB.search(u))]
    # Prefer a repo of yours when a checkout pushes to several.
    repo = next((r for r in repos if r.split('/')[0].lower() in owners), repos[0] if repos else None)
    if not repo or repo.split('/')[0].lower() not in owners:
        return Found(path, sorted(urls), repo)     # won't be added, so skip the slow part on big third-party checkouts
    last = (await git('log', '-1', '--format=%ct')).strip()
    first = (await git('log', '--max-parents=0', '--format=%ct')).split()
    dirty = (await git('ls-files', '-z', '-m', '-o', '--exclude-standard')).split('\0')
    mtimes = [m for f in dirty if f and (m := _mtime(path / f))]
    return Found(path, sorted(urls), repo, max(mtimes + [int(last or 0)]), int(min(first, key=int)) if first else 0)


def _mtime(p: Path) -> float:
    try:
        return p.stat().st_mtime
    except OSError:
        return 0.0


async def listing(owners: list[str]) -> dict[str, str]:
    """Public repos of each owner, lower-cased owner/name → creation date. Falls back to the last good answer offline."""
    import aiohttp

    from .history import discover as github_repos
    try:
        repos = {}
        for owner in owners:
            repos.update({r.name.lower(): r.meta.get('created', '') for r in await github_repos(owner, True, False)})
        write_json(CACHE, repos)
        return repos
    except (OSError, aiohttp.ClientError) as e:
        if cached := read_json(CACHE):
            return cached
        raise RuntimeError(f"can't list public repos and nothing is cached: {e}") from e


def project_ids(site: Path) -> dict[str, str]:
    """Lower-cased owner/name → project id, from the site's data/projects.json."""
    doc = read_json(site / 'data' / 'projects.json', {})
    return {r.lower(): p['id'] for p in doc.get('projects', []) for r in p.get('repos', [])}


def decide(f: Found, c: dict, owners: set[str], public: dict[str, str] | None, ids: dict[str, str], t: float) -> None:
    """Sets f.id, or f.why when the repo is left out."""
    allowed = False
    for rule in c.get('rules', []):
        if CONDITIONS[rule['when']][1](f.path, f.remotes, rule['value']):
            if rule['action'] == 'deny':
                f.why = f"denied: {rule['when']} {rule['value']}"
                return
            allowed = True
            break
    if not f.repo:
        f.why = 'no GitHub remote'
    elif f.repo.split('/')[0].lower() not in owners:
        f.why = f'pushes to {f.repo}, not yours'
    elif public is not None and f.repo.lower() not in public:
        f.why = f'{f.repo} is not a public repo'
    else:
        if created := (public or {}).get(f.repo.lower()):
            f.created = datetime.fromisoformat(created).timestamp()
        idle, age = duration(c.get('max_idle')), duration(c.get('max_age'))
        if not allowed and idle and t - f.touched > idle:
            f.why = f'untouched for {(t - f.touched) / 86400:.0f} days'
        elif not allowed and age and f.created and t - f.created > age:
            f.why = f'created {(t - f.created) / 86400:.0f} days ago'
        else:
            f.id = ids.get(f.repo.lower()) or slug(f.repo.split('/')[1])


async def discover(c: dict, site: Path) -> list[Found]:
    """Every repo found under [discover].roots with its verdict, added ones first."""
    owners = c.get('owners', [])
    wanted = {o.lower() for o in owners}
    gate = asyncio.Semaphore(8)

    async def one(path: Path) -> Found:
        async with gate:
            return await inspect(path, wanted)

    found = await asyncio.gather(*map(one, scan([expand(r).resolve() for r in c.get('roots', [])], int(c.get('depth', 3)))))
    public = await listing(owners) if c.get('public_only', True) else None
    ids, t = project_ids(site), time.time()
    for f in found:
        decide(f, c, wanted, public, ids, t)
    return sorted(found, key=lambda f: (f.id is None, str(f.path)))
