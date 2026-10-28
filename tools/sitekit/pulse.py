"""pulse: a local daemon that notes when you are at the keyboard, what kind of app has focus and which project
folders are changing, then publishes daily aggregates to data/pulse/YYYY-MM.json in a checkout of the site and pushes.

Raw samples stay in a local SQLite file. Only aggregates leave the machine: active minutes per hour, minutes per app
category (categories you define; app names and window titles are never published), and for the folders listed under
[projects] only, active minutes, changed-file counts and file extensions.
"""
from __future__ import annotations

import asyncio
import ctypes
import ctypes.util
import errno
import json
import os
import re
import signal
import sqlite3
import struct
import sys
import time
from collections import Counter, defaultdict, deque
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from fnmatch import fnmatch
from pathlib import Path

from .common import expand, load_toml, now, read_json, run, write_json

CONFIG = expand('~/.config/sitekit/pulse.toml')
IGNORE = ['.git', 'node_modules', '__pycache__', '.venv', 'venv', '.cache', 'build', 'dist', '.mypy_cache',
          '*.swp', '*.swx', '*~', '4913', '.#*', '*.pyc', '*.tmp', '*.part', '*.crdownload']


def log(*a):
    print(time.strftime('%H:%M:%S'), *a, file=sys.stderr, flush=True)


@dataclass
class Settings:
    site: Path
    remote: str | None
    interval: int
    idle: int
    window: int
    publish: int
    push: bool
    db: Path
    projects: dict[Path, str]
    apps: list[tuple[str, re.Pattern]]
    ignore: list[str]

    @classmethod
    def load(cls, path: Path = CONFIG) -> Settings:
        if not path.exists():
            sys.exit(f'pulse: no config at {path}; copy tools/pulse.example.toml there and edit it')
        c = load_toml(path)
        return cls(site=expand(c.get('site', '~/.local/share/sitekit/site')), remote=c.get('remote'),
                   interval=int(c.get('interval', 60)), idle=int(c.get('idle', 180)), window=int(c.get('window', 600)),
                   publish=int(c.get('publish', 3600)), push=bool(c.get('push', True)),
                   db=expand(c.get('db', '~/.local/share/sitekit/pulse.sqlite3')),
                   projects={expand(k).resolve(): v for k, v in c.get('projects', {}).items()},
                   apps=[(k, re.compile(v, re.I)) for k, v in c.get('apps', {}).items()],
                   ignore=IGNORE + c.get('ignore', []))

    def category(self, app: str | None) -> str | None:
        return None if app is None else next((k for k, rx in self.apps if rx.search(app)), 'other')


async def probe(*cmd: str) -> str | None:
    try:
        return (await run(*cmd)).strip() or None
    except (RuntimeError, OSError):
        return None


# Idle probes return seconds since the last input; the first one that answers is used.
async def idle_mutter():
    out = await probe('gdbus', 'call', '--session', '--dest', 'org.gnome.Mutter.IdleMonitor', '--object-path',
                      '/org/gnome/Mutter/IdleMonitor/Core', '--method', 'org.gnome.Mutter.IdleMonitor.GetIdletime')
    return int(m[1]) / 1000 if out and (m := re.search(r'(\d+),?\)', out)) else None


async def idle_xprintidle():
    out = await probe('xprintidle')
    return int(out) / 1000 if out and out.isdigit() else None


async def idle_logind():
    session = os.environ.get('XDG_SESSION_ID') or await probe('loginctl', 'show-user', os.environ.get('USER', ''), '-p', 'Display', '--value')
    out = session and await probe('loginctl', 'show-session', session, '-p', 'IdleHint', '-p', 'IdleSinceHint', '--value')
    if not out:
        return None
    hint, since = (out.splitlines() + ['0'])[:2]
    return max(0.0, time.time() - int(since) / 1e6) if hint == 'yes' and since.isdigit() else 0.0


# Focus probes return the focused window's app id / WM class; titles are never read.
async def focus_hyprland():
    out = await probe('hyprctl', 'activewindow', '-j')
    return json.loads(out).get('class') if out and out.startswith('{') else None


async def focus_sway():
    out = await probe('swaymsg', '-t', 'get_tree')
    if not out:
        return None
    stack = [json.loads(out)]
    while stack:
        n = stack.pop()
        if n.get('focused') and n.get('type') in ('con', 'floating_con'):
            return n.get('app_id') or n.get('window_properties', {}).get('class')
        stack += n.get('nodes', []) + n.get('floating_nodes', [])
    return None


async def focus_gnome():
    """Needs the 'Focused Window D-Bus' GNOME Shell extension."""
    out = await probe('gdbus', 'call', '--session', '--dest', 'org.gnome.Shell', '--object-path',
                      '/org/gnome/shell/extensions/FocusedWindow', '--method', 'org.gnome.shell.extensions.FocusedWindow.Get')
    m = out and re.match(r"\('(.*)',\)$", out, re.S)
    return json.loads(m[1]).get('wm_class') if m else None


async def focus_kde():
    return await probe('kdotool', 'getactivewindow', 'getwindowclassname')


async def focus_x11():
    out = await probe('xprop', '-root', '_NET_ACTIVE_WINDOW')
    wid = out and re.search(r'0x[0-9a-f]+', out)
    cls = wid and int(wid[0], 16) and await probe('xprop', '-id', wid[0], 'WM_CLASS')
    return re.findall(r'"([^"]*)"', cls)[-1] if cls and '"' in cls else None


IDLE = [idle_mutter, idle_xprintidle, idle_logind]
FOCUS = [focus_hyprland, focus_sway, focus_gnome, focus_kde, focus_x11]


async def first_working(probes):
    for p in probes:
        if await p() is not None:
            return p
    return None


IN_CLOSE_WRITE, IN_MOVED_FROM, IN_MOVED_TO, IN_CREATE, IN_DELETE = 0x8, 0x40, 0x80, 0x100, 0x200
IN_IGNORED, IN_ONLYDIR, IN_DONT_FOLLOW, IN_EXCL_UNLINK, IN_ISDIR = 0x8000, 0x1000000, 0x2000000, 0x4000000, 0x40000000
WATCH_MASK = IN_CLOSE_WRITE | IN_MOVED_FROM | IN_MOVED_TO | IN_CREATE | IN_DELETE | IN_DONT_FOLLOW | IN_EXCL_UNLINK | IN_ONLYDIR


class Watcher:
    """Recursive inotify over the project roots, through libc, with no third-party dependency."""

    def __init__(self, roots: dict[Path, str], ignore: list[str], on_change):
        self.libc = ctypes.CDLL(ctypes.util.find_library('c') or 'libc.so.6', use_errno=True)
        self.fd = self.libc.inotify_init1(os.O_NONBLOCK | os.O_CLOEXEC)
        if self.fd < 0:
            raise OSError(ctypes.get_errno(), 'inotify_init1 failed')
        self.roots, self.ignore, self.on_change, self.dirs, self.full = roots, ignore, on_change, {}, False
        for root, project in roots.items():
            self.add(root, project)

    def skip(self, name: str) -> bool:
        return any(fnmatch(name, pat) for pat in self.ignore)

    def add(self, top: Path, project: str) -> None:
        for d, subdirs, _ in os.walk(top):
            subdirs[:] = [s for s in subdirs if not self.skip(s) and Path(d, s).resolve() not in self.roots]
            wd = self.libc.inotify_add_watch(self.fd, os.fsencode(d), WATCH_MASK)
            if wd >= 0:
                self.dirs[wd] = (Path(d), project)
            elif ctypes.get_errno() == errno.ENOSPC and not self.full:
                self.full = True
                log('inotify watch limit reached; raise it with: sysctl fs.inotify.max_user_watches=524288')

    def start(self) -> None:
        asyncio.get_running_loop().add_reader(self.fd, self.read)

    def read(self) -> None:
        try:
            buf = os.read(self.fd, 1 << 16)
        except BlockingIOError:
            return
        i = 0
        while i < len(buf):
            wd, mask, _, n = struct.unpack_from('iIII', buf, i)
            name = os.fsdecode(buf[i + 16:i + 16 + n].rstrip(b'\0'))
            i += 16 + n
            if mask & IN_IGNORED:
                self.dirs.pop(wd, None)
            elif wd in self.dirs and name and not self.skip(name):
                parent, project = self.dirs[wd]
                if not mask & IN_ISDIR:
                    self.on_change(project, parent / name)
                elif mask & (IN_CREATE | IN_MOVED_TO):
                    self.add(parent / name, project)


SCHEMA = '''
create table if not exists samples (ts integer primary key, active integer not null, idle real, app text, category text, project text);
create table if not exists changes (ts integer not null, project text not null, ext text, path text);
create index if not exists changes_ts on changes (ts);
create table if not exists meta (key text primary key, value text);
'''


def open_db(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(path)
    db.executescript(SCHEMA)
    return db


def aggregate(db: sqlite3.Connection, first: date, minutes_per_sample: float) -> dict[str, dict]:
    start = int(datetime.combine(first, datetime.min.time()).timestamp())
    day = lambda ts: datetime.fromtimestamp(ts).astimezone()
    days = defaultdict(lambda: {'hours': [0.0] * 24, 'apps': Counter(), 'projects': defaultdict(lambda: {'minutes': 0.0})})
    for ts, category, project in db.execute('select ts, category, project from samples where active and ts >= ?', (start,)):
        t = day(ts)
        d = days[t.date().isoformat()]
        d['hours'][t.hour] += minutes_per_sample
        d['apps'][category or 'other'] += minutes_per_sample
        if project:
            d['projects'][project]['minutes'] += minutes_per_sample
    files = defaultdict(set)
    exts = defaultdict(Counter)
    for ts, project, ext, path in db.execute('select ts, project, ext, path from changes where ts >= ?', (start,)):
        key = (day(ts).date().isoformat(), project)
        if path not in files[key]:
            files[key].add(path)
            exts[key][ext or 'other'] += 1
    for (d, project), paths in files.items():
        p = days[d]['projects'][project]
        p['files'], p['ext'] = len(paths), dict(exts[(d, project)].most_common(6))
    out = {}
    for d, v in sorted(days.items()):
        hours = [round(h) for h in v['hours']]
        out[d] = {'active': sum(hours), 'hours': hours, 'apps': {k: round(m) for k, m in v['apps'].most_common() if round(m)},
                  'projects': {k: {**p, 'minutes': round(p['minutes'])} for k, p in sorted(v['projects'].items())}}
    return out


async def ensure_checkout(s: Settings) -> None:
    if (s.site / '.git').exists():
        return
    if not s.remote:
        sys.exit(f'pulse: {s.site} is not a git checkout and no remote is configured to clone it from')
    log(f'cloning {s.remote} → {s.site} (sparse: data/ only)')
    s.site.parent.mkdir(parents=True, exist_ok=True)
    await run('git', 'clone', '--quiet', '--filter=blob:none', '--sparse', s.remote, str(s.site))
    await run('git', '-C', str(s.site), 'sparse-checkout', 'set', 'data')


async def publish(s: Settings, db: sqlite3.Connection) -> None:
    last = db.execute("select value from meta where key = 'published'").fetchone()
    first = min(date.today() - timedelta(days=1), date.fromisoformat(last[0]) if last else date.today())
    days = aggregate(db, first, s.interval / 60)
    git = lambda *a, **k: run('git', '-C', str(s.site), *a, **k)
    await ensure_checkout(s)
    if s.push:
        await git('pull', '--quiet', '--rebase', '--autostash', check=False)
    folder = s.site / 'data' / 'pulse'
    tz = datetime.now().astimezone().strftime('%z')
    for month in sorted({d[:7] for d in days}):
        path = folder / f'{month}.json'
        doc = read_json(path, {'month': month, 'days': {}})
        doc['tz'] = f'{tz[:3]}:{tz[3:]}'
        doc['days'].update({d: v for d, v in days.items() if d.startswith(month)})
        doc['days'] = dict(sorted(doc['days'].items()))
        write_json(path, doc)
    months = sorted((p.stem for p in folder.glob('[0-9]*-[0-9]*.json')), reverse=True)
    write_json(folder / 'index.json', {'updated': now(), 'months': months})
    db.execute("insert or replace into meta values ('published', ?)", (date.today().isoformat(),))
    db.commit()
    await git('add', 'data/pulse')
    if (await git('status', '--porcelain', '--', 'data/pulse')).strip():
        await git('commit', '--quiet', '-m', f'pulse: {datetime.now():%Y-%m-%d %H:%M}', '--', 'data/pulse')
        if s.push:
            await git('push', '--quiet')
        log(f'published {len(days)} day(s)' + (' and pushed' if s.push else ''))


async def daemon(s: Settings) -> None:
    db = open_db(s.db)
    idle_probe, focus_probe = await first_working(IDLE), await first_working(FOCUS)
    log(f'idle: {idle_probe.__name__ if idle_probe else "none (counting minutes with file changes or focus switches)"}; '
        f'focus: {focus_probe.__name__ if focus_probe else "none"}')
    recent: deque[tuple[float, str]] = deque()
    pending: list[tuple[int, str, str, str]] = []

    def changed(project: str, path: Path):
        t = time.time()
        recent.append((t, project))
        pending.append((int(t), project, path.suffix.lower(), str(path)))

    watcher = None
    if s.projects:
        try:
            watcher = Watcher(s.projects, s.ignore, changed)
            watcher.start()
            log(f'watching {len(watcher.dirs)} folders under {len(s.projects)} project roots')
        except OSError as e:
            log(f'file watching unavailable: {e}')

    stop = asyncio.Event()
    for sig in (signal.SIGINT, signal.SIGTERM):
        asyncio.get_running_loop().add_signal_handler(sig, stop.set)
    last_app, next_publish = None, time.time() + 60

    while not stop.is_set():
        t = time.time()
        while recent and recent[0][0] < t - s.window:
            recent.popleft()
        idle = await idle_probe() if idle_probe else None
        app = await focus_probe() if focus_probe else None
        touched = Counter(p for ts, p in recent)
        active = idle < s.idle if idle is not None else bool(touched) or (app is not None and app != last_app)
        project = touched.most_common(1)[0][0] if active and touched else None
        db.execute('insert or replace into samples values (?, ?, ?, ?, ?, ?)',
                   (int(t), int(active), idle, app if active else None, s.category(app) if active else None, project))
        db.executemany('insert into changes values (?, ?, ?, ?)', pending)
        db.commit()
        pending.clear()
        last_app = app
        if t >= next_publish:
            next_publish = t + s.publish
            try:
                await publish(s, db)
            except (RuntimeError, OSError) as e:
                log(f'publish failed, will retry: {e}')
        try:
            await asyncio.wait_for(stop.wait(), timeout=max(1.0, s.interval - (time.time() - t)))
        except TimeoutError:
            pass
    log('stopped')


async def status(s: Settings, config: Path = CONFIG) -> None:
    idle_probe, focus_probe = await first_working(IDLE), await first_working(FOCUS)
    print(f'config  {config}\nsite    {s.site}\ndb      {s.db}')
    print(f'idle    {idle_probe.__name__ if idle_probe else "none"} → {await idle_probe() if idle_probe else "-"}')
    app = await focus_probe() if focus_probe else None
    print(f'focus   {focus_probe.__name__ if focus_probe else "none"} → {app} ({s.category(app)})')
    if s.db.exists():
        today = aggregate(open_db(s.db), date.today(), s.interval / 60).get(date.today().isoformat())
        print(json.dumps(today, indent=1) if today else 'nothing recorded today yet')
