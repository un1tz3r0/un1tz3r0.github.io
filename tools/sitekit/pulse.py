"""pulse: a local daemon that notes when you are at the keyboard, what kind of app has focus and which project
folders are changing, then publishes daily aggregates to data/pulse/YYYY-MM.json in a checkout of the site and pushes.

Raw samples stay in a local SQLite file. Only aggregates leave the machine: active minutes per hour, minutes per app
category (categories you define; app names and window titles are never published), minutes per hour in the browser and
per site category, and for publishable projects only (see `publishable`), active minutes, the kinds of activity browser
plugins saw, changed-file counts and file extensions.
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

from . import claude
from .common import expand, load_toml, now, read_json, run, write_json

CONFIG = expand('~/.config/sitekit/pulse.toml')
IGNORE = ['.git', 'node_modules', '__pycache__', '.venv', 'venv', '.cache', 'build', 'dist', '.mypy_cache',
          '*.swp', '*.swx', '*~', '4913', '.#*', '*.pyc', '*.tmp', '*.part', '*.crdownload']


LOG: deque[dict] = deque(maxlen=1000)
LOG_HOOKS: list = []
KINDS = ('lifecycle', 'sample', 'activity', 'scan', 'publish', 'warning', 'error')


def log(*a, kind: str = 'lifecycle') -> None:
    """Print to stderr (the journal) and keep the line for the settings app's log viewer, tagged with one of KINDS."""
    entry = {'t': time.time(), 'kind': kind, 'text': ' '.join(map(str, a))}
    if kind != 'sample':
        print(time.strftime('%H:%M:%S'), entry['text'], file=sys.stderr, flush=True)
    LOG.append(entry)
    for hook in LOG_HOOKS:
        hook(entry)


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
    root: Path
    depth: int | None
    owner: str | None
    rescan: int
    found: dict[Path, str]
    browser: dict
    path: Path
    pinned: dict[str, str]
    exclude: set[Path]

    @classmethod
    def load(cls, path: Path = CONFIG) -> Settings:
        if not path.exists():
            sys.exit(f'pulse: no config at {path}; copy tools/pulse.example.toml there and edit it')
        c = load_toml(path)
        d = c.get('discover', {})
        return cls(site=expand(c.get('site', '~/.local/share/sitekit/site')), remote=c.get('remote'),
                   interval=int(c.get('interval', 60)), idle=int(c.get('idle', 180)), window=int(c.get('window', 600)),
                   publish=int(c.get('publish', 3600)), push=bool(c.get('push', True)),
                   db=expand(c.get('db', '~/.local/share/sitekit/pulse.sqlite3')),
                   projects={expand(k).resolve(): v for k, v in c.get('projects', {}).items()},
                   apps=[(k, re.compile(v, re.I)) for k, v in c.get('apps', {}).items()],
                   ignore=IGNORE + c.get('ignore', []), root=expand(d.get('root', '~')).resolve(),
                   depth=int(d['depth']) if d.get('depth') else None, owner=d.get('owner') or site_owner(expand(c.get('site', '~/.local/share/sitekit/site'))),
                   rescan=int(d.get('every', 86400)) if d.get('enabled', True) else 0, found={},
                   browser=c.get('browser', {}), path=path, pinned={k.lower(): v for k, v in c.get('app_ids', {}).items()},
                   exclude={expand(x).resolve() for x in d.get('exclude', [])})

    def category(self, app: str | None) -> str | None:
        """[app_ids] pins exact app ids (to a category, or "ignore"); otherwise the first [apps] regex that matches."""
        if app is None:
            return None
        return self.pinned.get(app.lower()) or next((k for k, rx in self.apps if rx.search(app)), 'other')

    def project_ids(self) -> list[str]:
        return sorted(set(self.projects.values()) | set(self.found.values()))

    def save(self, changes: list[tuple[str, str, object]]) -> None:
        from . import tomledit
        tomledit.edit(self.path, changes)

    def tilde(self, p: Path) -> str:
        home = Path.home()
        return f'~/{p.relative_to(home)}' if p.is_relative_to(home) else str(p)

    def browser_config(self) -> dict:
        """What the browser extension needs: thresholds, URL filters, site categories, URL rules and plugin settings."""
        b = self.browser
        return {'idle': self.idle, 'interval': self.interval, 'owner': self.owner, 'titles': b.get('titles', True),
                'allow': b.get('allow', []), 'deny': b.get('deny', []), 'sites': b.get('sites', {}),
                'rules': b.get('rules', []), 'plugins': b.get('plugins', {})}


def site_owner(site: Path) -> str | None:
    return load_toml(site / 'site.toml').get('github', {}).get('user')


GITHUB_REMOTE = re.compile(r'github\.com[:/]+([^/\s]+)/([^/\s]+?)(?:\.git)?/?$', re.I)


def find_repos(root: Path, depth: int | None, ignore: list[str]) -> list[Path]:
    """Directories under root (not root itself) holding a .git, without descending into repos or hidden folders."""
    out = []
    for d, subdirs, _ in os.walk(root):
        level = len(Path(d).relative_to(root).parts)
        if d != str(root) and os.path.exists(os.path.join(d, '.git')):
            out.append(Path(d))
            subdirs[:] = []
        elif depth is not None and level >= depth:
            subdirs[:] = []
        else:
            subdirs[:] = [s for s in subdirs if not s.startswith('.') and not any(fnmatch(s, pat) for pat in ignore)
                          and not os.path.islink(os.path.join(d, s))]
    return out


async def discover(s: Settings) -> dict[Path, str]:
    """Repos under s.root with a GitHub remote owned by s.owner, as {path: repo name}."""
    found = {}
    for repo in await asyncio.to_thread(find_repos, s.root, s.depth, s.ignore):
        if repo.resolve() in s.exclude:
            continue
        urls = (await run('git', '-C', str(repo), 'config', '--get-regexp', r'^remote\..*\.url$', check=False)).splitlines()
        for line in urls:
            m = GITHUB_REMOTE.search(line.split(None, 1)[-1].strip())
            if m and m[1].lower() == s.owner.lower():
                found[repo.resolve()] = m[2]
                break
    return found


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
                log('inotify watch limit reached; raise it with: sysctl fs.inotify.max_user_watches=524288', kind='warning')

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
create table if not exists pages (start real not null, end real not null, tab integer, url text, title text, site text,
                                  project text, activity text, input integer, meta text);
create index if not exists pages_start on pages (start);
create table if not exists catalog (id text primary key, type text, name text, url text, public integer, meta text, updated real);
'''


def open_db(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(path)
    db.executescript(SCHEMA)
    have = {r[1] for r in db.execute('pragma table_info(samples)')}
    for col in ('site', 'activity'):
        if col not in have:
            db.execute(f'alter table samples add column {col} text')
    return db


def aggregate(db: sqlite3.Connection, first: date, minutes_per_sample: float) -> dict[str, dict]:
    start = int(datetime.combine(first, datetime.min.time()).timestamp())
    day = lambda ts: datetime.fromtimestamp(ts).astimezone()
    days = defaultdict(lambda: {'hours': [0.0] * 24, 'web': [0.0] * 24, 'apps': Counter(), 'sites': Counter(),
                                'projects': defaultdict(lambda: {'minutes': 0.0, 'activity': Counter()})})
    rows = db.execute('select ts, category, project, site, activity from samples where active and ts >= ?', (start,))
    for ts, category, project, site, activity in rows:
        t = day(ts)
        d = days[t.date().isoformat()]
        d['hours'][t.hour] += minutes_per_sample
        d['apps'][category or 'other'] += minutes_per_sample
        if category == 'browser' or site:
            d['web'][t.hour] += minutes_per_sample
        if site:
            d['sites'][site] += minutes_per_sample
        if project:
            d['projects'][project]['minutes'] += minutes_per_sample
            if activity:
                d['projects'][project]['activity'][activity] += minutes_per_sample
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
    rounded = lambda c: {k: round(m) for k, m in c.most_common() if round(m)}
    out = {}
    for d, v in sorted(days.items()):
        hours = [round(h) for h in v['hours']]
        projects = {k: {k2: v2 for k2, v2 in {**p, 'minutes': round(p['minutes']), 'activity': rounded(p['activity'])}.items() if v2 != {}}
                    for k, p in sorted(v['projects'].items())}
        out[d] = {'active': sum(hours), 'hours': hours, 'apps': rounded(v['apps']), 'projects': projects}
        if v['sites']:
            out[d]['sites'] = rounded(v['sites'])
        if any(web := [round(h) for h in v['web']]):
            out[d]['web'] = web
    return out


def public_catalog(db: sqlite3.Connection) -> dict[str, dict]:
    """Projects that browser plugins found and marked public, e.g. your public pens: these may be named on the site."""
    rows = db.execute('select id, type, name, url from catalog where public order by id')
    return {i: {k: v for k, v in {'type': t, 'name': n, 'url': u}.items() if v} for i, t, n, u in rows}


def enrich_claude(s: Settings, db: sqlite3.Connection) -> None:
    """Names for Claude projects that data/claude.json already lists (because they have public PRs); no others leak."""
    path = s.site / 'data' / 'claude.json'
    doc = read_json(path, None)
    if not doc:
        return
    changed = False
    for i, name, meta in db.execute("select id, name, meta from catalog where type = 'claude-code'"):
        entry = doc.get('projects', {}).get(i.split(':', 1)[1])
        extra = {k: v for k, v in json.loads(meta or '{}').items() if k in ('artifacts', 'conversations')}
        if entry is not None and (name and entry.get('name') != name or any(entry.get(k) != v for k, v in extra.items())):
            entry.update({'name': name} if name else {}, **extra)
            changed = True
    if changed:
        write_json(path, doc)


async def ensure_checkout(s: Settings) -> None:
    if (s.site / '.git').exists():
        return
    if not s.remote:
        sys.exit(f'pulse: {s.site} is not a git checkout and no remote is configured to clone it from')
    log(f'cloning {s.remote} → {s.site} (sparse: data/ only)', kind='publish')
    s.site.parent.mkdir(parents=True, exist_ok=True)
    await run('git', 'clone', '--quiet', '--filter=blob:none', '--sparse', s.remote, str(s.site))
    await run('git', '-C', str(s.site), 'sparse-checkout', 'set', 'data')


def publishable(s: Settings, db: sqlite3.Connection | None = None) -> set[str]:
    """Project ids that may be named in published data: folders listed under [projects], the site's own projects, its
    public repos, Claude projects that data/claude.json lists (they have public PRs), and projects a browser plugin
    marked public. Anything else (private repos, repos and pages of other people you visited) is counted in the totals
    but never named."""
    known = {p['id'] for p in read_json(s.site / 'data' / 'projects.json', {}).get('projects', [])}
    public = {k.split('/')[-1] for k, r in read_json(s.site / 'data' / 'github.json', {}).get('repos', {}).items() if not r.get('private', True)}
    claude_listed = {f'claude-code:{c}' for c in read_json(s.site / 'data' / 'claude.json', {}).get('projects', {})}
    return set(s.projects.values()) | known | public | claude_listed | (set(public_catalog(db)) if db else set())


def private_slugs(s: Settings) -> set[str]:
    """Discovered projects whose names stay off the published data."""
    return {v for p, v in s.found.items() if p not in s.projects} - publishable(s)


async def publish(s: Settings, db: sqlite3.Connection) -> None:
    last = db.execute("select value from meta where key = 'published'").fetchone()
    first = min(date.today() - timedelta(days=1), date.fromisoformat(last[0]) if last else date.today())
    days = aggregate(db, first, s.interval / 60)
    await ensure_checkout(s)
    allowed, catalog = publishable(s, db), public_catalog(db)
    for v in days.values():
        v['projects'] = {k: p for k, p in v['projects'].items() if k in allowed}
    enrich_claude(s, db)
    git = lambda *a, **k: run('git', '-C', str(s.site), *a, **k)
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
    used = {k for v in days.values() for k in v['projects']} | set(read_json(folder / 'catalog.json', {}))
    if used & catalog.keys() or (folder / 'catalog.json').exists():
        write_json(folder / 'catalog.json', {k: v for k, v in catalog.items() if k in used})
    db.execute("insert or replace into meta values ('published', ?)", (date.today().isoformat(),))
    db.commit()
    paths = ['data/pulse'] + (['data/claude.json'] if (s.site / 'data' / 'claude.json').exists() else [])
    if claude.TRANSCRIPTS.exists():
        try:
            await claude.scan(s.site, load_toml(s.site / 'site.toml').get('claude', {}))
            paths.append('data/claude-usage')
        except (OSError, ValueError) as e:
            log(f'claude scan failed: {e}', kind='warning')
    await git('add', *paths)
    if (await git('status', '--porcelain', '--', *paths)).strip():
        await git('commit', '--quiet', '-m', f'pulse: {datetime.now():%Y-%m-%d %H:%M}', '--', *paths)
        if s.push:
            await git('push', '--quiet')
        log(f'published {len(days)} day(s)' + (' and pushed' if s.push else ''), kind='publish')


SOCKET = expand(os.environ.get('XDG_RUNTIME_DIR') or f'/tmp/sitekit-{os.getuid()}') / 'sitekit-pulse.sock'


@dataclass
class State:
    """What the daemon reports over the control socket; the tray icon and settings app render this."""
    s: Settings
    paused: bool = False
    paused_until: float | None = None
    sampled: float | None = None
    active: bool = False
    project: str | None = None
    category: str | None = None
    minutes: int = 0
    published: float | None = None
    error: str | None = None
    next_publish: float = 0
    projects: int = 0
    idle_probe: str | None = None
    focus_probe: str | None = None
    browser: dict | None = None
    app: str | None = None
    changed: Path | None = None
    roots: dict[Path, str] | None = None
    pending: int = 0

    def browsing(self, t: float) -> dict | None:
        """The browser's last focus report, while it is recent and says a browser window has focus."""
        b = self.browser
        return b if b and b.get('focused') and t - b['t'] < max(90, 2 * self.s.interval) else None

    @property
    def mode(self) -> str:
        return 'offline' if self.error else 'paused' if self.paused else 'active' if self.active else 'idle'

    def snapshot(self) -> dict:
        s = self.s
        return {'mode': self.mode, 'pid': os.getpid(), 'paused': self.paused, 'paused_until': self.paused_until,
                'sampled': self.sampled, 'active': self.active, 'project': self.project, 'category': self.category,
                'minutes': self.minutes, 'published': self.published, 'error': self.error, 'next_publish': self.next_publish,
                'projects': self.projects, 'push': s.push, 'interval': s.interval, 'idle_probe': self.idle_probe,
                'focus_probe': self.focus_probe, 'site': str(s.site), 'config': str(s.path),
                'browser': bool(self.browser and time.time() - self.browser['t'] < 120),
                'idle': s.idle, 'window': s.window, 'publish': s.publish, 'pending': round(self.pending * s.interval / 60),
                'app': self.app, 'root': self.root and str(self.root), 'root_project': self.roots.get(self.root) if self.root else None,
                'categories': [k for k, _ in s.apps], 'project_ids': s.project_ids()}

    @property
    def root(self) -> Path | None:
        """The watched project folder that the most recent file change was in."""
        return next((p for p in self.changed.parents if p in self.roots), None) if self.changed and self.roots else None


async def daemon(s: Settings) -> None:
    db = open_db(s.db)
    idle_probe, focus_probe = await first_working(IDLE), await first_working(FOCUS)
    log(f'idle: {idle_probe.__name__ if idle_probe else "none (counting minutes with file changes or focus switches)"}; '
        f'focus: {focus_probe.__name__ if focus_probe else "none"}')
    state = State(s, idle_probe=idle_probe and idle_probe.__name__, focus_probe=focus_probe and focus_probe.__name__)
    recent: deque[tuple[float, str]] = deque()
    pending: list[tuple[int, str, str, str]] = []
    noted: dict[str, float] = {}

    def changed(project: str, path: Path):
        if state.paused:
            return
        t = time.time()
        recent.append((t, project))
        pending.append((int(t), project, path.suffix.lower(), str(path)))
        state.changed = path
        if t - noted.get(project, 0) >= 60:
            noted[project] = t
            log(f'files changing in {project} ({path.name})', kind='activity')

    roots = {p: n for p, n in s.projects.items() if p not in s.exclude}
    state.roots = roots
    watcher = None
    try:
        watcher = Watcher(roots, s.ignore, changed)
        watcher.start()
    except OSError as e:
        log(f'file watching unavailable: {e}', kind='warning')

    async def scan() -> None:
        if not (s.rescan and s.owner):
            return
        try:
            s.found = await discover(s)
        except (RuntimeError, OSError) as e:
            return log(f'project scan failed: {e}', kind='error')
        new = {p: n for p, n in s.found.items() if p not in roots}
        roots.update(new)
        if watcher:
            for p, n in new.items():
                watcher.add(p, n)
        state.projects = len(roots)
        log(f'scan of {s.root}: {len(s.found)} repos owned by {s.owner}, {len(new)} new', kind='scan')

    await scan()
    state.projects = len(roots)
    if watcher:
        log(f'watching {len(watcher.dirs)} folders under {len(roots)} project roots')
    next_scan = time.time() + s.rescan

    stop, wake = asyncio.Event(), asyncio.Event()
    want = {'publish': False, 'scan': False, 'restart': False}
    for sig in (signal.SIGINT, signal.SIGTERM):
        asyncio.get_running_loop().add_signal_handler(sig, stop.set)
    watchers: set[asyncio.StreamWriter] = set()

    def notify() -> None:
        broadcast({'event': 'state', **state.snapshot()})

    LOG_HOOKS[:] = [lambda e: broadcast({'event': 'log', **e})]
    mtime = lambda: s.path.stat().st_mtime if s.path.exists() else None
    loaded = mtime()
    timing = {'next_publish': time.time() + 60}

    def save(changes: list[tuple[str, str, object]]) -> None:
        """Write settings that apply live without the restart a config change otherwise triggers."""
        nonlocal loaded
        s.save(changes)
        loaded = mtime()

    def assign(msg: dict) -> str:
        """Pin the focused app to a category or ignore it; count the last-changed folder toward a project or ignore it.
        Both edit pulse.toml, and the daemon restarts to apply them."""
        if msg.get('what') == 'app':
            app, category = msg.get('app') or state.app, msg['category']
            if not app:
                raise ValueError('no focused app to assign')
            s.save([('app_ids', app, category)])
            return f'app {app} → {category}'
        path = Path(msg['path']).resolve() if msg.get('path') else state.root
        if not path:
            raise ValueError('no project folder has changed yet')
        if msg['project'] == 'ignore':
            excluded = load_toml(s.path).get('discover', {}).get('exclude', [])
            s.save([('projects', k, None) for k in load_toml(s.path).get('projects', {}) if expand(k).resolve() == path]
                   + [('discover', 'exclude', sorted({*excluded, s.tilde(path)}))])
            return f'ignoring {path}'
        s.save([('projects', s.tilde(path), msg['project'])])
        return f'{path} → {msg["project"]}'

    def broadcast(event: dict) -> None:
        line = (json.dumps(event) + '\n').encode()
        for w in list(watchers):
            try:
                w.write(line)
            except (ConnectionError, OSError, RuntimeError):
                watchers.discard(w)

    def command(msg: dict) -> dict:
        match msg.get('cmd'):
            case 'status' | 'watch':
                pass
            case 'config':
                return {'id': msg.get('id'), 'ok': True, 'config': s.browser_config()}
            case 'log':
                return {'id': msg.get('id'), 'ok': True, 'entries': list(LOG)[-int(msg.get('limit') or len(LOG)):]}
            case 'assign':
                log(assign(msg), kind='lifecycle')
            case 'focus':
                page = (msg.get('page') or {})
                if page != ((state.browser or {}).get('page') or {}) and page:
                    log(f'browser: {page.get("site") or "page"}' + (f' · {page["project"]}' if page.get('project') else ''), kind='activity')
                state.browser = {**{k: msg.get(k) for k in ('focused', 'idle', 'browser', 'page')}, 't': time.time()}
                return {'id': msg.get('id'), 'ok': True, 'paused': state.paused}
            case 'pages':
                if not state.paused:
                    db.executemany('insert into pages values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                        (p['start'], p['end'], p.get('tab'), p.get('url'), p.get('title') if s.browser.get('titles', True) else None,
                         p.get('site'), p.get('project'), p.get('activity'), p.get('input'), json.dumps(p.get('meta') or {}))
                        for p in msg.get('spans', [])])
                    db.commit()
                return {'id': msg.get('id'), 'ok': True, 'stored': 0 if state.paused else len(msg.get('spans', []))}
            case 'catalog':
                db.executemany('''insert into catalog values (?, ?, ?, ?, ?, ?, ?) on conflict (id) do update set
                                  type = coalesce(excluded.type, type), name = coalesce(excluded.name, name), url = coalesce(excluded.url, url),
                                  public = coalesce(excluded.public, public), meta = coalesce(excluded.meta, meta), updated = excluded.updated''', [
                    (p['id'], p.get('type'), p.get('name'), p.get('url'), None if p.get('public') is None else int(bool(p['public'])),
                     json.dumps(p['meta']) if p.get('meta') else None, time.time()) for p in msg.get('projects', [])])
                db.commit()
                return {'id': msg.get('id'), 'ok': True, 'stored': len(msg.get('projects', []))}
            case 'pause':
                minutes = float(msg.get('minutes') or 0)
                state.paused, state.paused_until = True, time.time() + minutes * 60 if minutes else None
                recent.clear()
                pending.clear()
                log(f'paused for {minutes:g} min' if minutes else 'paused')
            case 'resume':
                state.paused, state.paused_until = False, None
                log('resumed')
            case 'publish':
                want['publish'] = True
            case 'rescan':
                want['scan'] = True
            case 'set':
                changes = []
                if 'push' in msg:
                    s.push = bool(msg['push'])
                    changes.append(('', 'push', s.push))
                for k in ('interval', 'idle', 'window', 'publish'):
                    if k in msg:
                        setattr(s, k, max(5, int(msg[k])))
                        changes.append(('', k, getattr(s, k)))
                if 'publish' in msg:
                    timing['next_publish'] = state.next_publish = min(timing['next_publish'], time.time() + s.publish)
                if changes and msg.get('persist', True):
                    save(changes)
                if changes:
                    log('set ' + ', '.join(f'{k} = {v}' for _, k, v in changes))
                broadcast({'event': 'config', 'config': s.browser_config()})
            case 'reload' | 'quit':
                want['restart'] = msg['cmd'] == 'reload'
                stop.set()
            case other:
                return {'id': msg.get('id'), 'ok': False, 'error': f'unknown command {other!r}'}
        wake.set()
        notify()
        return {'id': msg.get('id'), 'ok': True, **state.snapshot()}

    async def client(reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
        msg = None
        try:
            while line := await reader.readline():
                try:
                    msg = json.loads(line)
                    reply = command(msg)
                except (ValueError, TypeError, AttributeError, KeyError, sqlite3.Error) as e:
                    reply = {'id': msg.get('id') if isinstance(msg, dict) else None, 'ok': False, 'error': str(e)}
                writer.write((json.dumps(reply) + '\n').encode())
                await writer.drain()
                if isinstance(msg, dict) and msg.get('cmd') == 'watch':
                    watchers.add(writer)
        except (ConnectionError, OSError):
            pass
        finally:
            watchers.discard(writer)
            writer.close()

    server = await listen(client)

    def refresh_minutes() -> None:
        today = aggregate(db, date.today(), s.interval / 60).get(date.today().isoformat())
        state.minutes = today['active'] if today else 0

    refresh_minutes()
    last_app, next_sample = None, time.time()
    state.next_publish = timing['next_publish']
    log(f'started (pid {os.getpid()}, sampling every {s.interval} s)')
    while not stop.is_set():
        t = time.time()
        if mtime() != loaded:
            loaded = mtime()
            try:
                Settings.load(s.path)
            except (ValueError, OSError, SystemExit) as e:
                log(f'{s.path} changed but does not load, keeping the running config: {e}', kind='warning')
            else:
                log(f'{s.path} changed')
                want['restart'] = True
                break
        if state.paused and state.paused_until and t >= state.paused_until:
            state.paused, state.paused_until = False, None
            log('resumed after the pause ran out')
        if t >= next_sample:
            next_sample = t + s.interval
            while recent and recent[0][0] < t - s.window:
                recent.popleft()
            if state.paused:
                state.active, state.project, state.category = False, None, None
                log('sample: paused', kind='sample')
            else:
                idle = await idle_probe() if idle_probe else None
                app = await focus_probe() if focus_probe else None
                b = state.browsing(t)
                if b and app is None:
                    app = b.get('browser') or 'browser'
                category = s.category(app)
                b = b if b and (focus_probe is None or category == 'browser') else None
                page = (b or {}).get('page') or {}
                touched = Counter(p for ts, p in recent)
                active = (idle < s.idle if idle is not None else b['idle'] == 'active' if b
                          else bool(touched) or (app is not None and app != last_app)) and category != 'ignore'
                if app != last_app and app is not None:
                    log(f'focus: {app} ({category})', kind='activity')
                if active != state.active:
                    log('at the keyboard' if active else 'away from the keyboard', kind='activity')
                project = (page.get('project') or touched.most_common(1)[0][0] if touched else page.get('project')) if active else None
                db.execute('insert or replace into samples values (?, ?, ?, ?, ?, ?, ?, ?)',
                           (int(t), int(active), idle, app if active else None, category if active else None, project,
                            page.get('site') if active else None, page.get('activity') if active and project == page.get('project') else None))
                db.executemany('insert into changes values (?, ?, ?, ?)', pending)
                db.commit()
                pending.clear()
                last_app = state.app = app
                state.active, state.project, state.category = active, project, category if active else None
                state.sampled = t
                state.pending += active
                log('sample: ' + (' · '.join(filter(None, [category, project])) or 'active' if active else 'idle'), kind='sample')
                refresh_minutes()
        if s.rescan and t >= next_scan or want['scan']:
            next_scan, want['scan'] = t + s.rescan, False
            await scan()
        if t >= timing['next_publish'] or want['publish']:
            timing['next_publish'], want['publish'] = t + s.publish, False
            try:
                await publish(s, db)
                state.published, state.error, state.pending = time.time(), None, 0
            except (RuntimeError, OSError) as e:
                state.error = str(e) or type(e).__name__
                log(f'publish failed, will retry: {e}', kind='error')
            state.next_publish = timing['next_publish']
        notify()
        due = min(next_sample, state.paused_until or next_sample, time.time() + 5)
        wake.clear()
        try:
            await asyncio.wait_for(wake.wait(), timeout=max(0.5, due - time.time()))
        except TimeoutError:
            pass
    server.close()
    SOCKET.unlink(missing_ok=True)
    log('reloading' if want['restart'] else 'stopped')
    if want['restart']:
        os.execvp(sys.orig_argv[0], sys.orig_argv)


async def listen(handler) -> asyncio.AbstractServer:
    """Bind the control socket, refusing to start a second daemon but replacing a stale socket left by a crash."""
    SOCKET.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    if SOCKET.exists():
        try:
            _, probe_writer = await asyncio.open_unix_connection(SOCKET)
        except (ConnectionError, FileNotFoundError):
            SOCKET.unlink(missing_ok=True)
        else:
            probe_writer.close()
            sys.exit(f'pulse: a daemon is already running (control socket {SOCKET})')
    server = await asyncio.start_unix_server(handler, SOCKET)
    SOCKET.chmod(0o600)
    return server


async def status(s: Settings, config: Path = CONFIG) -> None:
    idle_probe, focus_probe = await first_working(IDLE), await first_working(FOCUS)
    print(f'config  {config}\nsite    {s.site}\ndb      {s.db}')
    print(f'idle    {idle_probe.__name__ if idle_probe else "none"} → {await idle_probe() if idle_probe else "-"}')
    app = await focus_probe() if focus_probe else None
    print(f'focus   {focus_probe.__name__ if focus_probe else "none"} → {app} ({s.category(app)})')
    if s.rescan and s.owner:
        s.found = await discover(s)
        print(f'scan    {s.root} (depth {s.depth or "unlimited"}) for github.com/{s.owner}: {len(s.found)} repos')
        for path, name in sorted(s.found.items()):
            print(f'  {name:30} {path}' + (f'  (listed under [projects] as {s.projects[path]})' if path in s.projects else ''))
        print(f'unpublished (not public on the site): {sorted(private_slugs(s)) or "none"}')
    if s.db.exists():
        today = aggregate(open_db(s.db), date.today(), s.interval / 60).get(date.today().isoformat())
        print(json.dumps(today, indent=1) if today else 'nothing recorded today yet')
