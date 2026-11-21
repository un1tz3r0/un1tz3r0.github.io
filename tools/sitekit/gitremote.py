"""Clone, pull and push a GitHub checkout by whatever route works on this machine.

A fresh machine often has no SSH key on GitHub, or no git credentials for HTTPS, so one fixed remote URL fails. For a
GitHub remote each operation tries, in order, until one works:

1. the URL as configured, with your own git setup (an SSH key, or a credential helper for HTTPS);
2. the same repo over the other transport (SSH ↔ HTTPS), still with your own setup;
3. HTTPS with the GitHub CLI's login (`gh auth git-credential`), if `gh` is installed.

The first route that works is tried first next time. SSH runs in batch mode, so a missing key or unknown host key
fails at once instead of waiting for a prompt. Remotes that aren't on GitHub are used as they are, once.
"""
from __future__ import annotations

import os
import re
import shutil
from pathlib import Path

from .common import run

GITHUB = re.compile(r'^(?:git@github\.com:|ssh://git@github\.com/|https://(?:[^@/]+@)?github\.com/)([^/]+)/(.+?)(?:\.git)?/?$')
GH_LOGIN = ['-c', 'credential.helper=', '-c', 'credential.https://github.com.helper=!gh auth git-credential']
SSH = 'ssh -o BatchMode=yes -o ConnectTimeout=20'
WORKED: dict[str, str] = {}     # remote URL → name of the route that last worked for it


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
    errors = []
    for i, (name, target, opts) in enumerate(tried := routes(url)):
        try:
            out = await op(target, opts, env)
        except RuntimeError as e:
            errors.append(f'{name}: {e}')
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


async def pull(repo: Path, log=None) -> None:
    """git pull --rebase --autostash of the current branch from origin, by any route; origin/<branch> follows."""
    b = await branch(repo)
    await attempt(await origin(repo), lambda u, o, env: run(
        'git', '-C', str(repo), *o, 'fetch', '--quiet', u, f'+refs/heads/{b}:refs/remotes/origin/{b}', env=env), log)
    try:
        await run('git', '-C', str(repo), 'rebase', '--quiet', '--autostash', f'origin/{b}')
    except RuntimeError:
        await run('git', '-C', str(repo), 'rebase', '--abort', check=False)     # leave the checkout as it was
        raise


async def push(repo: Path, log=None) -> None:
    """git push of the current branch to the same branch on origin, by any route; origin/<branch> follows."""
    b = await branch(repo)
    await attempt(await origin(repo), lambda u, o, env: run(
        'git', '-C', str(repo), *o, 'push', '--quiet', u, f'HEAD:refs/heads/{b}', env=env), log)
    await run('git', '-C', str(repo), 'update-ref', f'refs/remotes/origin/{b}', 'HEAD')
