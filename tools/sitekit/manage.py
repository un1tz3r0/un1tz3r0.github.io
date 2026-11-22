"""sitekitctl: the one place sitekit pulse is installed, checked, updated and removed on this machine. `sitekit settings`
edits the config of what this installs, and runs this for the rest.

  install    trust the release key; set up the managed install (or --dev: run from this checkout); write the config;
             clone the site's data/ skeleton; write the systemd units, launchers, icons and browser host; import browser
             history; start the daemon and report its first project scan. Safe to run again: it repairs what's missing.
  verify     check every part; exits 1 if any is broken
  schedule   last and next publish, project scan, update check and other sitekit timers
  errors     warnings and errors from the journal, the daemon, and refused releases
  update     install the newest signed release and restart into it (the sitekit-update timer runs this); --rollback
  uninstall  stop and remove all of it; --purge also the config, database and site checkout
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import aiohttp

from . import browsing, conversations, gitremote, native, pulse, tomledit, update
from .common import API, api_headers, expand, journal, load_toml
from .pulse_ctl import APP_ID, request

FIRST = 'pulse-v1.1.0'      # the first release that carries this file; a managed install never runs one older
PULSE, UPDATE, TIMER = 'sitekit-pulse.service', 'sitekit-update.service', 'sitekit-update.timer'
NOT_RUNNING = 'the daemon is not running'


def say(text: str, kind: str = '') -> None:
    print(journal(kind) + text, file=sys.stderr if kind in ('warning', 'error') else sys.stdout, flush=True)


def unit(name: str) -> Path:
    return expand('~/.config/systemd/user') / name


@dataclass(frozen=True)
class Runtime:
    """What the units and launchers run: the managed install's venv through `current`, or this checkout."""
    python: Path
    package: Path                       # the tools/ folder PYTHONPATH points at
    layout: update.Layout | None = None

    @classmethod
    def of(cls, layout: update.Layout | None) -> Runtime:
        return cls(layout.python, layout.package, layout) if layout else cls(Path(sys.executable), Path(__file__).resolve().parent.parent)

    @classmethod
    def detect(cls) -> Runtime:
        layout = update.Layout.default()
        return cls.of(layout if layout.current.is_symlink() else None)

    def command(self, *args: str, module: str = 'sitekit') -> str:
        return f'env PYTHONPATH={self.package} {self.python} -m {module} {" ".join(args)}'

    @property
    def icons(self) -> list[tuple[Path, Path]]:
        src, dst = self.package / 'sitekit' / 'data' / 'icons', expand('~/.local/share/icons')
        return [(p, dst / p.relative_to(src)) for p in src.rglob('*.svg')]

    @property
    def extension(self) -> Path:
        return self.package / 'sitekit' / 'extension'


def desktop(rt: Runtime, name: str, comment: str, args: str, categories: str, extra: str = '') -> str:
    return (f'[Desktop Entry]\nType=Application\nName={name}\nComment={comment}\nExec={rt.command(args)}\n'
            f'Icon=sitekit-pulse\nTerminal=false\nCategories={categories}\nStartupWMClass={APP_ID}\n{extra}')


def files(rt: Runtime, every: int) -> dict[Path, str]:
    """Everything install writes outside the managed layout, by path. The browser host is registered only with the
    browsers whose config folder exists."""
    env = f'Environment=PYTHONPATH={rt.package}\n'
    # A managed install starts through pulse-launch, which rolls back a release that doesn't start.
    start = f'ExecStart={rt.layout.launch}\n' if rt.layout else f'{env}ExecStart={rt.python} -m sitekit pulse run\n'
    apps, autostart = expand('~/.local/share/applications'), expand('~/.config/autostart')
    indicator = lambda extra: desktop(rt, 'Pulse Indicator', 'Panel icon for the sitekit pulse daemon', 'pulse indicator', 'Utility;', extra)
    out = {
        unit(PULSE): ('[Unit]\nDescription=sitekit pulse\nAfter=graphical-session.target\nPartOf=graphical-session.target\n\n'
                      f'[Service]\n{start}Restart=on-failure\nRestartSec=30\n\n[Install]\nWantedBy=graphical-session.target\n'),
        apps / 'sitekit-pulse-settings.desktop': desktop(rt, 'Pulse Settings', 'Settings and log for the sitekit pulse daemon',
                                                         'settings', 'Settings;Utility;GTK;', 'Keywords=sitekit;pulse;activity;\n'),
        apps / 'sitekit-pulse-indicator.desktop': indicator('NoDisplay=true\n'),
        autostart / 'sitekit-pulse-indicator.desktop': indicator('X-GNOME-Autostart-enabled=true\nNoDisplay=true\n'),
        native.HOST: f'#!/bin/sh\nPYTHONPATH="{rt.package}${{PYTHONPATH:+:$PYTHONPATH}}" exec "{rt.python}" -m sitekit.native\n',
        **{folder / f'{native.NAME}.json': json.dumps(m, indent=2) + '\n' for folder, m in native.manifests() if folder.parent.exists()},
    }
    if rt.layout:
        out[unit(UPDATE)] = ('[Unit]\nDescription=sitekit: install the newest signed release\n\n'
                             f'[Service]\nType=oneshot\n{env}ExecStart={rt.python} -m sitekit.manage update\n')
        out[unit(TIMER)] = ('[Unit]\nDescription=sitekit: look for a new signed release\n\n'
                            f'[Timer]\nOnStartupSec=10min\nOnUnitActiveSec={every}\nRandomizedDelaySec=5min\n\n'
                            '[Install]\nWantedBy=timers.target\n')
    return out


def updates(config: Path) -> tuple[bool, int]:
    """[update] enabled and every, which set up the timer."""
    u = load_toml(config).get('update', {})
    return bool(u.get('enabled', True)), int(u.get('every', 3600))


def systemctl(*args: str) -> str | None:
    """stdout, or None when the command fails or there's no systemd user manager."""
    if not shutil.which('systemctl'):
        return None
    r = subprocess.run(['systemctl', '--user', *args], capture_output=True, text=True)
    return None if r.returncode else r.stdout.strip()


def systemd() -> bool:
    return systemctl('show-environment') is not None


def restart() -> str:
    if systemd() and systemctl('restart', PULSE) is not None:
        return f'restarted {PULSE}'
    return 'asked the daemon to reload' if request('reload') else NOT_RUNNING


def extension_profiles() -> list[str]:
    """Browser profiles that have the extension loaded (from their own preference files)."""
    found = []
    for root in [expand('~/.config') / d for d in native.CHROMIUM_DIRS]:
        found += [f'{root.name}/{p.parent.name}' for p in sorted(root.glob('*/*Preferences'))
                  if native.CHROME_ID in p.read_text(errors='replace')]
    found += [f'firefox/{p.parent.name}' for d in ('~/.mozilla/firefox', '~/.librewolf') for p in sorted(expand(d).glob('*/extensions.json'))
              if native.GECKO_ID in p.read_text(errors='replace')]
    return sorted(set(found))


async def signing_keys(user: str) -> list[str]:
    async with aiohttp.ClientSession(headers=api_headers()) as http:
        async with http.get(API / 'users' / user / 'ssh_signing_keys') as r:
            r.raise_for_status()
            keys = [k['key'] for k in await r.json()]
    if not keys:
        raise RuntimeError(f'{user} has no SSH signing keys on GitHub (Settings › SSH and GPG keys › New SSH key, type Signing)')
    return keys


async def first_scan(timeout: float = 300) -> str | None:
    """The daemon scans before it opens its socket, so its first log reply holds the scan's result."""
    end = time.time() + timeout
    while time.time() < end:
        if reply := request('log', timeout=5):
            return next((e['text'] for e in reversed(reply.get('entries', [])) if 'scan' in e['text']), None)
        await asyncio.sleep(1)
    return None


async def install(config: Path, layout: update.Layout, dev: bool = False, url: str = update.REPO_URL,
                  trust: list[Path] = (), github: list[str] = (), history: bool = False) -> None:
    for key in trust:
        say(f'trusting {update.trust(layout, key.read_text(), "release")}')
    for user in github:
        for key in await signing_keys(user):
            say(f'trusting {update.trust(layout, key, user)}')
    if pulse.ensure_config(config):     # first: checking a release loads it
        say(f'wrote {config} from the example; edit it with `sitekit settings`')
    if dev:
        if layout.current.is_symlink():
            raise RuntimeError(f'a managed install is in {layout.home}; sitekitctl uninstall first')
    else:
        tag = layout.current_tag()
        if not tag or update.version(tag) < update.version(FIRST):
            tag = await update.bootstrap(layout, url, config, say, minimum=FIRST)
        if update.RUNNING != tag and os.environ.get('SITEKITCTL_RELEASE') != tag:
            say(f'continuing with the installer of {tag}')
            env = {**os.environ, 'PYTHONPATH': str(layout.package), 'SITEKITCTL_RELEASE': tag}
            os.execve(layout.python, [str(layout.python), '-m', 'sitekit.manage', *sys.argv[1:]], env)

    if history:
        tomledit.edit(config, [('browser', 'history', True)])
    s = pulse.Settings.load(config)
    if (s.site / '.git').exists():
        try:
            await gitremote.pull(s.site, say)
        except RuntimeError as e:
            say(f'could not update {s.site}, using it as it is: {e}', 'warning')
    else:
        await pulse.ensure_checkout(s, say)
        s = pulse.Settings.load(config)

    rt = Runtime.of(None if dev else layout)
    enabled, every = updates(config)
    for path, text in files(rt, every).items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
    native.HOST.chmod(0o755)
    for src, dst in rt.icons:
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
    if shutil.which('gtk-update-icon-cache'):
        subprocess.run(['gtk-update-icon-cache', '-q', '-t', str(expand('~/.local/share/icons/hicolor'))], check=False)
    say(f'wrote the systemd units, launchers, icons and browser host for {rt.layout.current_tag() if rt.layout else rt.package}')

    if not s.browser.get('history'):
        say('browser history import is off (sitekitctl install --history turns it on)')
    elif not browsing.available():
        say('[browser] history is on, but browserprofile is not installed (Python 3.13+, pip install "./tools[pulse]")', 'warning')
    else:
        db = pulse.open_db(s.db)
        say(f'imported {browsing.import_history(db, s.browser)} pages from browser history')
        db.close()

    if systemd():
        systemctl('daemon-reload')
        systemctl('enable', PULSE)
        if rt.layout:
            systemctl('enable' if enabled else 'disable', '--now', TIMER)
            say(f'{TIMER} {"looks for a release every " + str(every) + " s" if enabled else "is off ([update] enabled = false)"}')
    else:
        say('no systemd user session here, so nothing starts the daemon or looks for updates on its own', 'warning')
    say(outcome := restart())
    if outcome == NOT_RUNNING:
        say(f'start it with: {rt.command("pulse", "run")}')
    elif not (s.rescan and s.owner):
        say('project discovery is off: set [discover] owner, or github.user in the site checkout\'s site.toml', 'warning')
    else:
        say(await first_scan() or 'the daemon has not reported its first project scan yet; see sitekitctl errors', 'scan')
    if os.environ.get('DISPLAY') or os.environ.get('WAYLAND_DISPLAY'):
        subprocess.Popen(rt.command('pulse', 'indicator').split(), start_new_session=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    loaded = extension_profiles()
    say(f'browser extension loaded in {", ".join(loaded)}' if loaded else
        f'browser extension: chrome://extensions › Developer mode › Load unpacked, and pick {rt.extension}')


def verify(config: Path) -> int:
    failed = 0

    def check(name: str, ok: bool | None, detail: str = '') -> None:
        nonlocal failed
        failed += ok is False
        print(f'{"!" if ok is None else "✓" if ok else "✗"} {name:12} {detail}')

    rt = Runtime.detect()
    s = None
    if not config.exists():
        check('config', False, f'{config} is missing (sitekitctl install)')
    else:
        try:
            s = pulse.Settings.load(config)
            check('config', True, str(config))
        except (ValueError, OSError) as e:
            check('config', False, f'{config}: {e}')
    if rt.layout:
        l = rt.layout
        check('release', (l.package / 'sitekit').is_dir() and l.python.exists() and l.launch.exists(), f'{l.current_tag()} in {l.home}')
        check('trust', l.signers.exists() and bool(l.signers.read_text().strip()), str(l.signers))
    else:
        check('release', None, f'runs from {rt.package}, which never updates itself')
    if s:
        check('site', (s.site / '.git').exists(), str(s.site))
        check('owner', bool(s.owner) or None, s.owner or 'unknown, so no project discovery: set [discover] owner')
    enabled, every = updates(config)
    stale = [p for p, text in files(rt, every).items() if not p.exists() or p.read_text() != text]
    stale += [dst for _, dst in rt.icons if not dst.exists()]
    check('files', not stale, f'out of date or missing (sitekitctl install rewrites them): {", ".join(map(str, stale))}' if stale
          else 'systemd units, launchers, icons and browser host are current')
    if systemd():
        check(PULSE, systemctl('is-active', PULSE) is not None, systemctl('is-enabled', PULSE) or 'not enabled')
        if rt.layout:
            on = systemctl('is-active', TIMER) is not None
            check(TIMER, on == enabled, 'active' if on else 'inactive' + ('' if not enabled else ' (should be on)'))
    else:
        check('systemd', None, 'no user session manager here')
    st = request('status')
    if not st:
        check('daemon', False, f'not answering on {pulse.SOCKET}')
    else:
        check('daemon', True, f'pid {st["pid"]}, {st["mode"]}, watching {st["projects"]} projects')
        if rt.layout and st.get('version') != rt.layout.current_tag():
            check('version', None, f'the daemon runs {st.get("version")}, current is {rt.layout.current_tag()}: sitekitctl install restarts it')
        if st.get('error'):
            check('publish', False, st['error'])
        check('probes', bool(st.get('idle_probe')) or None, f'idle {st.get("idle_probe") or "none"}, focus {st.get("focus_probe") or "none"}')
    loaded = extension_profiles()
    check('extension', bool(loaded) or None, ', '.join(loaded) + (' (connected)' if st and st.get('browser') else '') if loaded
          else f'not loaded in any browser: load it unpacked from {rt.extension}')
    if s and s.browser.get('history'):
        check('history', browsing.available(), 'browserprofile ' + ('installed' if browsing.available() else 'missing (Python 3.13+)'))
    return 1 if failed else 0


def when(t: float | None) -> str:
    if not t:
        return '-'
    d = t - time.time()
    span = f'{abs(d) / 60:.0f} min' if abs(d) < 5400 else f'{abs(d) / 3600:.1f} h'
    return f'{datetime.fromtimestamp(t):%a %H:%M} ({"in " + span if d > 0 else span + " ago"})'


def timer_times(name: str) -> tuple[float | None, float | None]:
    out = systemctl('show', name, '-p', 'LastTriggerUSec', '-p', 'NextElapseUSecRealtime', '--timestamp=unix') or ''
    props = dict(line.split('=', 1) for line in out.splitlines() if '=' in line)
    stamp = lambda v: float(v[1:]) if v and v.startswith('@') else None
    return stamp(props.get('LastTriggerUSec')), stamp(props.get('NextElapseUSecRealtime'))


def schedule() -> None:
    st = request('status')
    rows = [('publish', st.get('published'), st.get('next_publish')), ('scan', st.get('scanned'), st.get('next_scan'))] if st else []
    if not st:
        print('daemon     not running, so no publishes or scans are scheduled')
    names = [line.split()[0] for line in (systemctl('list-unit-files', 'sitekit-*.timer', '--no-legend') or '').splitlines()]
    rows += [(n.removeprefix('sitekit-').removesuffix('.timer'), *timer_times(n)) for n in names]
    for what, last, upcoming in rows:
        print(f'{what:10} last {when(last):26} next {when(upcoming)}')


def errors(layout: update.Layout, days: int) -> None:
    if shutil.which('journalctl'):
        out = subprocess.run(['journalctl', '--user', '-u', PULSE, '-u', UPDATE, '-p', 'warning', f'--since=-{days}d',
                              '--no-pager', '-q', '-o', 'short'], capture_output=True, text=True).stdout.strip()
        print(out or f'no warnings or errors in the journal in the last {days} days')
    elif reply := request('log'):
        for e in reply.get('entries', []):
            if e['kind'] in ('warning', 'error'):
                print(f'{datetime.fromtimestamp(e["t"]):%b %d %H:%M:%S} {e["kind"]}: {e["text"]}')
    if (st := request('status')) and st.get('error'):
        print(f'last publish failed: {st["error"]}')
    for name in (PULSE, UPDATE):
        if systemctl('is-failed', name) is not None:
            print(f'{name} is in the failed state (systemctl --user status {name})')
    if layout.bad_file.exists():
        print('releases refused and never tried again:\n' + layout.bad_file.read_text().rstrip())


async def upgrade(config: Path, layout: update.Layout, back: bool = False) -> None:
    if not layout.current.is_symlink():
        raise RuntimeError('not a managed install: sitekitctl install sets one up')
    if back:
        tag = update.rollback(layout)
        say(f'back on {tag}; the one before is never tried again')
    elif not (tag := await update.update(layout, config, say, current=layout.current_tag())):
        return say(f'up to date ({layout.current_tag()})')
    # The release's own installer rewrites whatever it installs differently, then restarts the daemon into it.
    proc = await asyncio.create_subprocess_exec(layout.python, '-m', 'sitekit.manage', '--config', str(config), 'install',
                                                env={**os.environ, 'PYTHONPATH': str(layout.package), 'SITEKITCTL_RELEASE': tag})
    if await proc.wait():
        say(f'the installer of {tag} failed; restarting the daemon on it anyway', 'error')
        say(restart())


def uninstall(config: Path, layout: update.Layout, purge: bool = False, force: bool = False) -> None:
    rt = Runtime.detect()
    if systemd():
        for name in (TIMER, UPDATE, PULSE):
            systemctl('disable', '--now', name)
    else:
        request('quit')
    if shutil.which('pkill'):
        subprocess.run(['pkill', '-f', 'sitekit pulse indicator'], capture_output=True)
    paths = {*files(rt, 3600), unit(UPDATE), unit(TIMER), *(f / f'{native.NAME}.json' for f, _ in native.manifests()), *(d for _, d in rt.icons)}
    paths |= {layout.launch, layout.pending, layout.previous, layout.bad_file, layout.deps, layout.home / 'pending.tries', layout.current}
    s = pulse.Settings.load(config) if purge and config.exists() else None
    if s:
        paths |= {config, config.with_suffix('.toml.bak'), layout.signers, conversations.KEY_FILE,
                  s.db, s.db.with_name(s.db.name + '-wal'), s.db.with_name(s.db.name + '-shm')}
    for path in sorted(paths):
        if path.is_symlink() or path.exists():
            path.unlink()
            say(f'removed {path}')
    for folder in (layout.repo, layout.versions, layout.venv):
        if folder.exists():
            shutil.rmtree(folder)
            say(f'removed {folder}')
    if s and (s.site / '.git').exists():
        git = lambda *a: subprocess.run(['git', '-C', str(s.site), *a], capture_output=True, text=True).stdout.strip()
        if (git('status', '--porcelain') or git('log', '--oneline', '@{u}..')) and not force:
            say(f'kept {s.site}: it has changes that are not pushed (--force removes it anyway)', 'warning')
        else:
            shutil.rmtree(s.site)
            say(f'removed {s.site}')
    for folder in (layout.home, config.parent):
        if folder.is_dir() and not any(folder.iterdir()):
            folder.rmdir()
    systemctl('daemon-reload')


def parser() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(prog='sitekitctl', description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--config', type=Path, default=pulse.CONFIG)
    sub = ap.add_subparsers(dest='cmd', required=True)
    i = sub.add_parser('install', help='install or repair everything')
    i.add_argument('--trust', type=Path, action='append', default=[], metavar='KEY.pub', help='trust release tags signed with this SSH key')
    i.add_argument('--trust-github', action='append', default=[], metavar='USER', help="trust USER's SSH signing keys on GitHub")
    i.add_argument('--dev', action='store_true', help='run from this checkout, which never updates itself')
    i.add_argument('--history', action='store_true', help='turn on importing browser history ([browser] history = true)')
    i.add_argument('--from', dest='url', default=update.REPO_URL, help='the repo a managed install follows')
    sub.add_parser('verify', help='check every part; exits 1 if any is broken')
    sub.add_parser('schedule', help='recent and upcoming publishes, scans and update checks')
    e = sub.add_parser('errors', help='recent warnings and errors')
    e.add_argument('--days', type=int, default=7)
    u = sub.add_parser('update', help='install the newest signed release now')
    u.add_argument('--rollback', action='store_true', help='go back to the previous release, and never use this one again')
    x = sub.add_parser('uninstall', help='stop and remove everything install wrote')
    x.add_argument('--purge', action='store_true', help='also the config, trusted keys, database and site checkout')
    x.add_argument('--force', action='store_true', help='with --purge: remove the site checkout even with unpushed changes')
    return ap


def main(argv: list[str] | None = None) -> None:
    a = parser().parse_args(argv)
    config, layout = expand(a.config), update.Layout.default()
    try:
        match a.cmd:
            case 'install':
                asyncio.run(install(config, layout, a.dev, a.url, a.trust, a.trust_github, a.history))
            case 'verify':
                sys.exit(verify(config))
            case 'schedule':
                schedule()
            case 'errors':
                errors(layout, a.days)
            case 'update':
                asyncio.run(upgrade(config, layout, a.rollback))
            case 'uninstall':
                uninstall(config, layout, a.purge, a.force)
    except (RuntimeError, ValueError, OSError, aiohttp.ClientError) as e:
        sys.exit(f'{journal("error")}sitekitctl: {e}')


if __name__ == '__main__':
    main()
