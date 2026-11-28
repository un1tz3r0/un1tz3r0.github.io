"""Clone, pull and push a GitHub checkout by whatever route works on this machine, and commit chosen paths in it.

A fresh machine often has no SSH key on GitHub, or no git credentials for HTTPS, so one fixed remote URL fails. For a
GitHub remote each operation tries, in order, until one works:

1. the URL as configured, with your own git setup (an SSH key, or a credential helper for HTTPS);
2. the same repo over the other transport (SSH ↔ HTTPS), still with your own setup;
3. HTTPS with the GitHub CLI's login (`gh auth git-credential`), if `gh` is installed.

The first route that works is tried first next time. SSH runs in batch mode, so a missing key or unknown host key
fails at once instead of waiting for a prompt; an unknown or outdated github.com host key is replaced with the ones
GitHub publishes at api.github.com/meta, and the route tried again. A push the remote rejects (it has commits this
checkout lacks) is not a route failure: push rebases onto them and tries once more. Remotes that aren't on GitHub are
used as they are, once.

Pulls and pushes merge sitekit's generated JSON (see MERGED) with jsonmerge.py instead of line by line.
"""
from __future__ import annotations

import base64
import hashlib
import os
import re
import shlex
import shutil
import sys
from pathlib import Path

import aiohttp

from .common import API, api_headers, expand, run

GITHUB = re.compile(r'^(?:git@github\.com:|ssh://git@github\.com/|https://(?:[^@/]+@)?github\.com/)([^/]+)/(.+?)(?:\.git)?/?$')
GH_LOGIN = ['-c', 'credential.helper=', '-c', 'credential.https://github.com.helper=!gh auth git-credential']
SSH = 'ssh -o BatchMode=yes -o ConnectTimeout=20'
WORKED: dict[str, str] = {}     # remote URL → name of the route that last worked for it
REJECTED = re.compile(r'\[rejected\]|\[remote rejected\]|non-fast-forward|\(fetch first\)')
KNOWN_HOSTS = expand('~/.ssh/known_hosts')
MERGED = ('data/pulse/*.json', 'data/claude-usage/*.json', 'data/claude.json')   # written whole by pulse and refresh


class Rejected(RuntimeError):
    """The remote was reached and refused the push; another route would be refused too."""


async def github_host_keys() -> list[str]:
    """GitHub's SSH host keys from api.github.com/meta (over TLS), each checked against the fingerprints it lists."""
    headers = {k: v for k, v in api_headers().items() if k != 'Authorization'}
    async with aiohttp.ClientSession(headers=headers, trust_env=True) as http:
        async with http.get(API / 'meta') as r:
            r.raise_for_status()
            meta = await r.json()
    prints = set(meta.get('ssh_key_fingerprints', {}).values())
    sha = lambda key: base64.b64encode(hashlib.sha256(base64.b64decode(key.split()[1])).digest()).decode().rstrip('=')
    if not (keys := [k for k in meta.get('ssh_keys', []) if sha(k) in prints]):
        raise RuntimeError('api.github.com/meta lists no SSH host keys that match its fingerprints')
    return keys


async def trust_github(log=None, path: Path = KNOWN_HOSTS) -> bool:
    """Make path's github.com entries exactly GitHub's published host keys; True if it had to change anything."""
    keys = await github_host_keys()
    have = set()
    if path.exists() and shutil.which('ssh-keygen'):
        found = await run('ssh-keygen', '-F', 'github.com', '-f', str(path), check=False)
        have = {' '.join(l.split()[1:3]) for l in found.splitlines() if l and not l.startswith('#')}
    if have == set(keys):
        return False
    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    if have:        # an old or foreign github.com key: ssh refuses to connect while it is there
        await run('ssh-keygen', '-R', 'github.com', '-f', str(path))
    with path.open('a') as f:
        f.writelines(f'github.com {k}\n' for k in keys)
    if log:
        log(f'{"replaced" if have else "added"} github.com host keys in {path} (from api.github.com/meta)', kind='warning')
    return True


def routes(url: str) -> list[tuple[str, str, list[str]]]:
    """(name, URL, git options) for each way to reach url, in the order to try them."""
    if not (m := GITHUB.match(url)):
        return [('as configured', url, [])]
    owner, repo = m.groups()
    ssh, https = ('ssh', f'git@github.com:{owner}/{repo}.git', []), ('https', f'https://github.com/{owner}/{repo}.git', [])
    found = [https, ssh] if url.startswith('https://') else [ssh, https]
    if shutil.which('gh'):
        found.append(('https with gh login', https[1], GH_LOGIN))
    if (last := WORKED.get(url)) and any(r[0] == last for r in found):
        found.sort(key=lambda r: r[0] != last)
    return found


async def attempt(url: str, op, log=None) -> str:
    """Run op(route URL, git options) for each route until one works; raises with every route's error if none does."""
    env = {} if os.environ.get('GIT_SSH_COMMAND') else {'GIT_SSH_COMMAND': SSH}
    errors, trusted = [], False
    for i, (name, target, opts) in enumerate(tried := routes(url)):
        try:
            try:
                out = await op(target, opts, env)
            except RuntimeError as e:
                if trusted or 'Host key verification failed' not in str(e) or 'github.com' not in target:
                    raise
                trusted = True
                try:
                    if not await trust_github(log):
                        raise
                except (aiohttp.ClientError, OSError) as fetch:
                    raise RuntimeError(f'{e}\n(could not fetch GitHub\'s host keys: {fetch})') from e
                out = await op(target, opts, env)
        except RuntimeError as e:
            if REJECTED.search(str(e)):
                raise Rejected(f'{name}: {e}') from e
            errors.append(f'{name}: {e}'.replace('\n', '\n    '))
            continue
        if i and log:
            log(f'git: {name} worked after {", ".join(r[0] for r in tried[:i])} failed', kind='warning')
        WORKED[url] = name
        return out
    raise RuntimeError('no route to the remote worked:\n  ' + '\n  '.join(errors))


async def origin(repo: Path) -> str:
    return (await run('git', '-C', str(repo), 'remote', 'get-url', 'origin')).strip()


async def branch(repo: Path) -> str:
    return (await run('git', '-C', str(repo), 'symbolic-ref', '--short', 'HEAD')).strip()


async def clone(url: str, dest: Path, *args: str, log=None) -> None:
    await attempt(url, lambda u, o, env: run('git', *o, 'clone', '--quiet', *args, u, str(dest), env=env), log)


async def unmerged(repo: Path) -> list[str]:
    return sorted({line.split('\t', 1)[1] for line in (await run('git', '-C', str(repo), 'ls-files', '-u')).splitlines()})


async def pull(repo: Path, log=None) -> None:
    """git pull --rebase --autostash of the current branch from origin, by any route; origin/<branch> follows.

    If it fails, the checkout is left as it was: commits, uncommitted changes and all. That includes the case git
    itself does not undo: the rebase works but the uncommitted changes don't re-apply on top of it. Git then leaves
    conflict markers in the files and the changes in a stash, and every later autostash is refused. So it is undone
    here, and the error names the files to commit or discard.
    """
    g = lambda *a, **k: run('git', '-C', str(repo), *a, **k)
    await merge_json(repo)
    if stuck := await unmerged(repo):
        raise RuntimeError(f'{repo} has unresolved conflicts in {", ".join(stuck)}; resolve them (git status) first')
    b = await branch(repo)
    await attempt(await origin(repo), lambda u, o, env: run(
        'git', '-C', str(repo), *o, 'fetch', '--quiet', u, f'+refs/heads/{b}:refs/remotes/origin/{b}', env=env), log)
    before = (await g('rev-parse', 'HEAD')).strip()
    stashes = len((await g('stash', 'list')).splitlines())
    try:
        await g('rebase', '--quiet', '--autostash', f'origin/{b}')
    except RuntimeError:
        await g('rebase', '--abort', check=False)     # leave the checkout as it was
        raise
    if conflicted := await unmerged(repo):
        # the autostash was kept as stash@{0}; it applies cleanly to the commit it was made on
        await g('reset', '--quiet', '--hard', before)
        if len((await g('stash', 'list')).splitlines()) > stashes:
            await g('stash', 'pop', '--quiet')
        raise RuntimeError(f'pulling origin/{b} conflicts with uncommitted changes to {", ".join(conflicted)}; '
                           f'commit or discard them in {repo}')


async def push(repo: Path, log=None) -> None:
    """git push of the current branch to the same branch on origin, by any route; origin/<branch> follows.

    When origin has commits this checkout lacks, they are pulled (a rebase, see pull) and the push tried once more.
    """
    b = await branch(repo)
    for again in (True, False):
        try:
            await attempt(await origin(repo), lambda u, o, env: run(
                'git', '-C', str(repo), *o, 'push', '--quiet', u, f'HEAD:refs/heads/{b}', env=env), log)
            break
        except Rejected:
            if not again:
                raise
            if log:
                log(f'origin/{b} has commits this checkout lacks; rebasing onto them and pushing again', kind='warning')
            await pull(repo, log)
    await run('git', '-C', str(repo), 'update-ref', f'refs/remotes/origin/{b}', 'HEAD')


async def merge_json(repo: Path) -> None:
    """Have git merge the MERGED files with sitekit.jsonmerge, in this checkout (so a hand-run pull does too)."""
    info = Path((await run('git', '-C', str(repo), 'rev-parse', '--git-path', 'info/attributes')).strip())
    info = info if info.is_absolute() else repo / info
    lines = info.read_text().splitlines() if info.exists() else []
    if want := [f'{p} merge=sitekit-json' for p in MERGED if f'{p} merge=sitekit-json' not in lines]:
        info.parent.mkdir(parents=True, exist_ok=True)
        info.write_text('\n'.join(lines + want) + '\n')
    script = Path(__file__).with_name('jsonmerge.py')      # unresolved: through `current`, so it survives updates
    driver = f'{shlex.quote(sys.executable)} -I {shlex.quote(str(script))} %O %A %B'
    for key, value in (('name', 'sitekit JSON data'), ('driver', driver)):
        await run('git', '-C', str(repo), 'config', f'merge.sitekit-json.{key}', value)


async def ahead(repo: Path) -> int:
    """How many commits HEAD has that origin/<branch> doesn't (all of them if there is no origin/<branch>)."""
    b = await branch(repo)
    out = await run('git', '-C', str(repo), 'rev-list', '--count', f'origin/{b}..HEAD', check=False)
    return int(out) if out.strip() else int(await run('git', '-C', str(repo), 'rev-list', '--count', 'HEAD'))


async def commit(repo: Path, paths, message: str) -> bool:
    """Commit exactly `paths` (relative to repo; new, changed or deleted), leaving anything else staged as it is.

    Returns False without committing when repo isn't in a git checkout or none of the paths differ from HEAD. Paths
    outside a sparse checkout's folders are added too, so media copied next to a data/-only checkout is committed.
    """
    g = lambda *a, **k: run('git', '-C', str(repo), *a, **k)
    if not (paths := sorted({Path(p).as_posix() for p in paths})):
        return False
    if (await g('rev-parse', '--is-inside-work-tree', check=False)).strip() != 'true':
        return False
    here = [p for p in paths if (repo / p).exists()]
    known = set((await g('ls-files', '--sparse', '--', *paths)).splitlines())
    gone = [p for p in paths if p not in here and p in known]
    if here:
        await g('add', '--sparse', '--', *here)
    if gone:
        await g('rm', '--cached', '--quiet', '--sparse', '--', *gone)
    if not (take := here + gone) or not (await g('diff', '--cached', '--name-only', '--', *take)).strip():
        return False
    await g('commit', '--quiet', '-m', message, '--only', '--', *take)
    return True
