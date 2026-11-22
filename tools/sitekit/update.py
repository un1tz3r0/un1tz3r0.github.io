"""Self-update for a managed install: signed release tags on GitHub, checked out side by side, switched by a symlink.

Layout under ~/.local/share/sitekit:
  repo/             a bare, blobless clone of the site repo
  versions/<tag>/   one sparse worktree per release, holding only tools/
  current           symlink to the running release; the systemd units, launchers, panel icon and browser host run from it
  venv/             the Python that runs it, with system site packages (for GTK) and the dependencies
  pulse-launch      the unit's ExecStart, which never changes: it rolls back a release that keeps crashing, then starts
  pending, previous, bad, deps.json   update bookkeeping

A release is an annotated tag pulse-vX.Y.Z on a master commit, signed with an SSH key listed in
~/.config/sitekit/allowed_signers (`sitekitctl install` fills it from GitHub). `sitekit release X.Y.Z` makes and pushes one. The
sitekit-update timer runs `sitekitctl update` every [update] every seconds (default an hour). A tag that verifies is
checked out, its dependencies installed when they changed, and `sitekit pulse check` run with it against your config and
database. Only then does `current` switch, and the release's own installer restarts the daemon into it; the panel icon,
settings window and browser extension follow when they see the new version. A release that doesn't start (three
crashes before it confirms) is rolled back by pulse-launch. A tag that isn't trusted, fails its check or doesn't start
is recorded in `bad` and never tried again; a failure that may pass later (the network during a fetch or pip install)
is retried at the next check.
"""
from __future__ import annotations

import asyncio
import json
import os
import re
import shutil
import sys
import tomllib
from dataclasses import dataclass
from pathlib import Path

from .common import expand

PREFIX = 'pulse-v'
TAG = re.compile(r'^pulse-v(\d+)\.(\d+)\.(\d+)$')
REPO_URL = 'https://github.com/un1tz3r0/un1tz3r0.github.io.git'
TRIES = 3   # starts of a new release that may fail before pulse-launch rolls it back

LAUNCH = '''#!/bin/sh
# Starts the pulse daemon from the current release (written by `sitekitctl install`; updates never change
# it). After an update, `pending` names the new release until it confirms it started. If it has crashed on {tries} starts
# before that, go back to the previous release and never try this one again.
cd "$(dirname "$0")" || exit 1
if [ -f pending ]; then
  tries=$(( $(cat pending.tries 2>/dev/null || echo 0) + 1 ))
  echo "$tries" > pending.tries
  if [ "$tries" -gt {tries} ] && [ -f previous ]; then
    echo "$(cat pending) did not start" >> bad
    ln -sfn "versions/$(cat previous)" current.tmp && mv -Tf current.tmp current
    rm -f pending pending.tries
  fi
fi
export PYTHONPATH="$PWD/current/tools"
exec "$PWD/venv/bin/python" -m sitekit pulse run "$@"
'''


def version(tag: str) -> tuple[int, ...] | None:
    return tuple(map(int, m.groups())) if (m := TAG.match(tag)) else None


def running() -> str | None:
    """The release this code was loaded from, or None for a checkout or pip install (which never update themselves).
    Taken once at import: after `current` switches, the code already loaded is still the old release."""
    here = Path(__file__).resolve()
    return next((p.name for p in here.parents if p.parent.name == 'versions' and version(p.name)), None)


RUNNING = running()


@dataclass
class Layout:
    home: Path
    signers: Path

    @classmethod
    def default(cls) -> Layout:
        return cls(expand('~/.local/share/sitekit'), expand('~/.config/sitekit/allowed_signers'))

    def __getattr__(self, name: str) -> Path:
        files = {'repo': 'repo', 'versions': 'versions', 'current': 'current', 'venv': 'venv', 'launch': 'pulse-launch',
                 'pending': 'pending', 'previous': 'previous', 'bad_file': 'bad', 'deps': 'deps.json'}
        if name in files:
            return self.home / files[name]
        raise AttributeError(name)

    @property
    def python(self) -> Path:
        return self.venv / 'bin' / 'python'

    @property
    def package(self) -> Path:
        """Where the launchers point PYTHONPATH: through the symlink, so they follow every switch."""
        return self.current / 'tools'

    def current_tag(self) -> str | None:
        return Path(os.readlink(self.current)).name if self.current.is_symlink() else None

    def bad(self) -> set[str]:
        return {line.split()[0] for line in self.bad_file.read_text().splitlines() if line.strip()} if self.bad_file.exists() else set()

    def mark_bad(self, tag: str, why: str) -> None:
        with self.bad_file.open('a') as f:
            f.write(f'{tag} {why}\n'.replace('\n', ' ').rstrip() + '\n')


async def sh(*cmd, env: dict | None = None, timeout: float = 600) -> tuple[int, str]:
    """(exit status, stdout and stderr together)."""
    proc = await asyncio.create_subprocess_exec(*map(str, cmd), stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT,
                                                env={**os.environ, 'GIT_TERMINAL_PROMPT': '0', **(env or {})})
    try:
        out, _ = await asyncio.wait_for(proc.communicate(), timeout)
    except TimeoutError:
        proc.kill()
        return -1, f'{cmd[0]} timed out after {timeout:.0f} s'
    return proc.returncode, out.decode(errors='replace').strip()


async def git(l: Layout, *args, check: bool = True) -> str:
    code, out = await sh('git', '-C', l.repo, *args)
    if check and code:
        raise RuntimeError(f'git {args[0]}: {out[-400:]}')
    return out


async def candidates(l: Layout, current: str | None, minimum: str | None = None) -> list[str]:
    """Release tags on the remote newer than `current`, at least `minimum` and not marked bad, newest first. Only lists
    refs, so it's cheap enough to run every hour."""
    out = await git(l, 'ls-remote', '--tags', '--refs', 'origin', f'{PREFIX}*')
    tags = {line.split('refs/tags/', 1)[1] for line in out.splitlines() if 'refs/tags/' in line}
    bad = l.bad()
    return sorted((t for t in tags if version(t) and t not in bad and (current is None or version(t) > version(current))
                   and (minimum is None or version(t) >= version(minimum))), key=version, reverse=True)


async def fetch(l: Layout) -> None:
    await git(l, 'fetch', '--quiet', 'origin', '+refs/heads/master:refs/heads/master', f'+refs/tags/{PREFIX}*:refs/tags/{PREFIX}*')


async def verify(l: Layout, tag: str) -> str | None:
    """Why a fetched tag can't be installed, or None when it is a signed, trusted release on master."""
    if not l.signers.exists():
        return f'no trusted keys: {l.signers} is missing (sitekitctl install --trust-github USER)'
    code, out = await sh('git', '-C', l.repo, '-c', f'gpg.ssh.allowedSignersFile={l.signers}', 'verify-tag', tag)
    if code:
        return f'signature not trusted: {out.splitlines()[-1] if out else "unsigned"}'
    code, _ = await sh('git', '-C', l.repo, 'merge-base', '--is-ancestor', f'{tag}^{{commit}}', 'refs/heads/master')
    return 'not a commit on master' if code else None


async def stage(l: Layout, tag: str) -> Path:
    """Check out tools/ of the release beside the others."""
    dest = l.versions / tag
    if not (dest / 'tools' / 'sitekit').is_dir():
        if dest.exists():
            await git(l, 'worktree', 'remove', '--force', str(dest), check=False)
            shutil.rmtree(dest, ignore_errors=True)
        await git(l, 'worktree', 'prune')
        await git(l, 'worktree', 'add', '--quiet', '--no-checkout', '--detach', str(dest), f'{tag}^{{commit}}')
        for args in (('sparse-checkout', 'set', '--cone', 'tools'), ('checkout', '--quiet')):
            code, out = await sh('git', '-C', dest, *args)
            if code:
                raise RuntimeError(f'git {args[0]}: {out[-400:]}')
    return dest


def requirements(tools: Path) -> list[str]:
    project = tomllib.loads((tools / 'pyproject.toml').read_text())['project']
    return sorted(project.get('dependencies', []) + project.get('optional-dependencies', {}).get('pulse', []))


async def pip_install(l: Layout, reqs: list[str]) -> None:
    code, out = await sh(l.python, '-m', 'pip', 'install', '--quiet', '--disable-pip-version-check', *reqs, timeout=900)
    if code:
        raise RuntimeError(f'pip install: {out[-400:]}')


async def ensure_deps(l: Layout, dest: Path) -> bool:
    """Install the release's dependencies into the venv when they differ from the last installed. True if it did."""
    reqs = requirements(dest / 'tools')
    if l.deps.exists() and json.loads(l.deps.read_text()) == reqs:
        return False
    await pip_install(l, reqs)
    l.deps.write_text(json.dumps(reqs))
    return True


async def check(l: Layout, dest: Path, config: Path) -> str:
    """Run the release's own `sitekit pulse check` against your config and database before anything switches to it."""
    code, out = await sh(l.python, '-m', 'sitekit', 'pulse', 'check', '--config', config,
                         env={'PYTHONPATH': str(dest / 'tools'), 'PYTHONSAFEPATH': '1'}, timeout=120)
    if code:
        raise RuntimeError(f'check failed: {out[-400:]}')
    return out


def switch(l: Layout, tag: str, pending: bool = True) -> None:
    """Point `current` at the release, atomically. With `pending`, pulse-launch rolls back if it never confirms."""
    if previous := l.current_tag():
        l.previous.write_text(previous)
    if pending:
        l.pending.write_text(tag)
        (l.home / 'pending.tries').unlink(missing_ok=True)
    tmp = l.home / 'current.tmp'
    tmp.unlink(missing_ok=True)
    tmp.symlink_to(Path('versions') / tag)
    os.replace(tmp, l.current)


def confirm(l: Layout) -> str | None:
    """Called by the daemon once it is up: the release it runs is good. Returns it when this ends a pending update."""
    if RUNNING and l.pending.exists() and l.pending.read_text().strip() == RUNNING:
        l.pending.unlink()
        (l.home / 'pending.tries').unlink(missing_ok=True)
        return RUNNING
    return None


def rollback(l: Layout) -> str:
    """Go back to the previous release by hand, and never update to this one again."""
    tag, previous = l.current_tag(), l.previous.read_text().strip() if l.previous.exists() else None
    if not previous or not (l.versions / previous).is_dir():
        raise RuntimeError('there is no previous release to go back to')
    l.mark_bad(tag, 'rolled back by hand')
    switch(l, previous, pending=False)
    l.pending.unlink(missing_ok=True)
    return previous


async def install_release(l: Layout, tag: str, config: Path, log) -> bool:
    """Verify, stage, install dependencies and check one release; False if any step fails. Only the release's own
    faults (not trusted, failing its check) mark it bad: checkout and pip depend on the network, so they're retried."""
    if why := await verify(l, tag):
        l.mark_bad(tag, why)
        log(f'update {tag} refused: {why}', kind='warning')
        return False
    try:
        dest = await stage(l, tag)
        if await ensure_deps(l, dest):
            log(f'update {tag}: installed its dependencies', kind='lifecycle')
    except RuntimeError as e:
        log(f'update {tag} could not be installed, will retry: {e}', kind='warning')
        return False
    try:
        await check(l, dest, config)
    except RuntimeError as e:
        l.mark_bad(tag, str(e))
        log(f'update {tag} failed its check: {e}', kind='error')
        return False
    return True


async def update(l: Layout, config: Path, log, current: str | None = RUNNING) -> str | None:
    """Switch to the newest good release newer than `current`. Returns it; the caller restarts. None when up to date."""
    tags = await candidates(l, current)
    if tags:
        await fetch(l)
    for tag in tags:
        if await install_release(l, tag, config, log):
            switch(l, tag)
            log(f'updated {current} → {tag}; restarting', kind='lifecycle')
            return tag
    return None


async def bootstrap(l: Layout, url: str, config: Path, log=print, minimum: str | None = None) -> str:
    """Set up a managed install: clone, venv, the newest good release (at least `minimum`) as `current`, and
    pulse-launch. Releases are checked against `config`, which must exist."""
    if not l.signers.exists():
        raise RuntimeError(f'trust a release key first: sitekitctl install --trust-github USER (writes {l.signers})')
    l.versions.mkdir(parents=True, exist_ok=True)
    if not l.repo.exists():
        log(f'cloning {url} → {l.repo}')
        code, out = await sh('git', 'clone', '--quiet', '--bare', '--filter=blob:none', url, l.repo)
        if code:
            raise RuntimeError(f'git clone: {out[-400:]}')
    if not l.python.exists():
        base = '/usr/bin/python3' if Path('/usr/bin/python3').exists() else sys.executable
        log(f'creating {l.venv} (with system site packages, for GTK)')
        code, out = await sh(base, '-m', 'venv', '--system-site-packages', l.venv)
        if code:
            raise RuntimeError(f'venv: {out[-400:]}')
        l.deps.unlink(missing_ok=True)
    tags = await candidates(l, None, minimum)
    if not tags:
        raise RuntimeError(f'no {PREFIX}X.Y.Z tags{" from " + minimum + " on" if minimum else ""} on {url} yet; '
                           'sign one with `sitekit release X.Y.Z`')
    await fetch(l)
    for tag in tags:
        if await install_release(l, tag, config, lambda text, kind=None: log(text)):
            switch(l, tag, pending=False)
            l.launch.write_text(LAUNCH.format(tries=TRIES))
            l.launch.chmod(0o755)
            log(f'installed {tag} at {l.versions / tag}')
            return tag
    raise RuntimeError('no release passed its checks; see the messages above')


def trust(l: Layout, key: str, principal: str) -> str:
    """Add an SSH public key (a .pub file's text) to the allowed signers that release tags are checked against."""
    fields = key.split()
    if len(fields) < 2 or not fields[0].startswith(('ssh-', 'ecdsa-', 'sk-')):
        raise ValueError(f'not an SSH public key: {key[:60]!r}')
    line = f'{principal} namespaces="git" {fields[0]} {fields[1]}'
    l.signers.parent.mkdir(parents=True, exist_ok=True)
    existing = l.signers.read_text().splitlines() if l.signers.exists() else []
    if not any(fields[1] in x for x in existing):
        l.signers.write_text('\n'.join(existing + [line]) + '\n')
    return line


async def release(repo: Path, number: str, message: str, signers: Path) -> str:
    """Tag HEAD as pulse-v<number>, signed, after checking it is pushed to master and verifies, then push the tag."""
    tag = f'{PREFIX}{number}'
    if not version(tag):
        raise ValueError(f'version must look like 1.4.0, not {number!r}')
    g = lambda *a: sh('git', '-C', repo, *a)
    code, fmt = await g('config', '--get', 'gpg.format')
    if fmt.strip() != 'ssh':
        raise RuntimeError('release tags are signed with SSH keys: git config --global gpg.format ssh, and '
                           'git config --global user.signingkey ~/.ssh/id_ed25519.pub')
    for args in (('fetch', '--quiet', 'origin', 'master', '--tags'), ('merge-base', '--is-ancestor', 'HEAD', 'origin/master')):
        code, out = await g(*args)
        if code:
            raise RuntimeError('HEAD is not on origin/master; push it to master first' if args[0] == 'merge-base' else out[-400:])
    newest = max((t for t in (await g('tag', '--list', f'{PREFIX}*'))[1].split() if version(t)), key=version, default=None)
    if newest and version(tag) <= version(newest):
        raise RuntimeError(f'{tag} is not newer than {newest}')
    code, out = await g('tag', '-s', tag, '-m', message or tag, 'HEAD')
    if code:
        raise RuntimeError(f'git tag: {out[-400:]}')
    if signers.exists():
        code, out = await g('-c', f'gpg.ssh.allowedSignersFile={signers}', 'verify-tag', tag)
        if code:
            await g('tag', '-d', tag)
            raise RuntimeError(f'the new tag does not verify against {signers}, so daemons would refuse it: {out[-300:]}')
    code, out = await g('push', '--quiet', 'origin', f'refs/tags/{tag}')
    if code:
        raise RuntimeError(f'git push: {out[-400:]}')
    return tag
