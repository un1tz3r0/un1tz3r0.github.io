"""Browser activity: the native-messaging host the extension talks to, the [web] filters, and what they let out.

Every page ends up in one of four states, by the first [[web.rules]] entry that matches or else `default`:
  drop     never stored
  private  stored in the local database, never published
  domain   stored, and the domain's minutes and visits are published
  page     stored, and the page's title and URL are published too

Rules are applied again at publish time, so tightening one takes effect on everything not yet published.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import struct
import sys
from collections import defaultdict
from datetime import datetime
from fnmatch import fnmatch
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

from .common import expand

HOST = 'io.github.un1tz3r0.sitekit_pulse'
EXTENSION_ID = 'cnjlniakoneagpoaldbinpkdkojnbhcg'     # from the public key in extension/manifest.json
EXTENSION = Path(__file__).parent / 'extension'
ACTIONS = ['drop', 'private', 'domain', 'page']
BROWSERS = ['google-chrome', 'google-chrome-beta', 'chromium', 'BraveSoftware/Brave-Browser', 'vivaldi', 'microsoft-edge']
GITHUB = re.compile(r'^https://github\.com/([^/]+/[^/]+)')
MAX_SPAN = 1800     # a foreground page stops counting after this long without any event (browser crash, suspend)

CONDITIONS = {
    'domain': ('domain or a subdomain of it', lambda url, title, v: _domain_matches(domain(url), v)),
    'url': ('URL matches', lambda url, title, v: fnmatch(url, v)),
    'title': ('title matches', lambda url, title, v: fnmatch((title or '').lower(), v.lower())),
}


def domain(url: str) -> str:
    return (urlsplit(url).hostname or '').removeprefix('www.')


def _domain_matches(host: str, pattern: str) -> bool:
    return fnmatch(host, pattern) or host.endswith('.' + pattern)


def clean(url: str, keep_query: bool) -> str:
    """Query strings often carry tokens and search terms and fragments carry OAuth secrets; only keep what's asked for."""
    u = urlsplit(url)
    return urlunsplit((u.scheme, u.netloc, u.path, u.query if keep_query else '', ''))


def recordable(url: str | None) -> bool:
    return bool(url) and url.startswith(('http://', 'https://'))


def classify(url: str, title: str | None, c: dict) -> str | None:
    """The action of the first matching rule, or None when no rule matched."""
    for rule in c.get('rules', []):
        if CONDITIONS[rule['when']][1](url, title, rule['value']):
            return rule['action']
    return None


def project_of(url: str, c: dict, repos: dict[str, str]) -> str | None:
    """[web.projects] patterns first, then github.com/<owner>/<repo> of a listed project."""
    for pattern, project in c.get('projects', {}).items():
        if fnmatch(url, pattern):
            return project
    m = GITHUB.match(url)
    return repos.get(m[1].lower()) if m else None


# The extension's events. Everything else it could send is ignored, so a change there can't widen what's stored.
FIELDS = ('kind', 'tab', 'url', 'title', 'summary')
KINDS = {'focus', 'blur', 'nav', 'title', 'page', 'open', 'close', 'tabs'}


def store(db, ev: dict, c: dict) -> None:
    if ev.get('kind') not in KINDS:
        return
    ts, keep = float(ev.get('t', 0)) / 1000, bool(c.get('keep_query'))
    if ev['kind'] == 'tabs':
        rows = [(t['tab'], t.get('window'), clean(t['url'], keep), t.get('title'), int(bool(t.get('active'))))
                for t in ev.get('tabs', []) if keepable(t.get('url'), t.get('title'), c)]
        db.execute('delete from web_tabs')
        db.executemany('insert or replace into web_tabs values (?, ?, ?, ?, ?)', rows)
    elif ev['kind'] in ('blur', 'close'):
        db.execute('insert into web_events (ts, kind, tab) values (?, ?, ?)', (ts, ev['kind'], ev.get('tab')))
    elif keepable(ev.get('url'), ev.get('title'), c):
        row = [ev.get(k) for k in FIELDS]
        row[2] = clean(row[2], keep)
        db.execute('insert into web_events (ts, kind, tab, url, title, summary) values (?, ?, ?, ?, ?, ?)', (ts, *row))
    elif ev['kind'] == 'focus':     # focus moved to a dropped page: end the previous span without recording where it went
        db.execute('insert into web_events (ts, kind, tab) values (?, ?, ?)', (ts, 'blur', ev.get('tab')))
    db.commit()


def keepable(url: str | None, title: str | None, c: dict) -> bool:
    return recordable(url) and classify(url, title, c) != 'drop'


def native_host(load, stdin=None) -> None:
    """Chrome's native-messaging loop over stdin: 4-byte little-endian length, then JSON. `load` gives (settings, db)."""
    stdin = stdin or sys.stdin.buffer
    settings, db, stamp = None, None, None
    while len(head := stdin.read(4)) == 4:
        msg = stdin.read(struct.unpack('<I', head)[0])
        mtime = settings.config.stat().st_mtime if settings else None
        if mtime != stamp or settings is None:
            settings, db = load()
            stamp = settings.config.stat().st_mtime
        if not settings.paused.exists() and settings.web.get('enabled', True):
            store(db, json.loads(msg), settings.web)


def spans(db, start: float) -> list[tuple[float, float, str, str | None]]:
    """Time the browser spent focused on each page: (start, seconds, url, title), from focus/blur events."""
    rows = db.execute("select ts, kind, url, title from web_events where ts >= ? and kind in ('focus', 'blur') order by ts", (start,)).fetchall()
    out = []
    for (ts, kind, url, title), (nxt, *_) in zip(rows, rows[1:]):
        if kind == 'focus':
            out.append((ts, min(nxt - ts, MAX_SPAN), url, title))
    return out


def titles(db, start: float) -> dict[str, str]:
    """Latest title per URL. A navigation's own event is usually sent before the page has set one."""
    return dict(db.execute("select url, title from web_events where ts >= ? and title is not null and title != '' order by ts", (start,)).fetchall())


def day_report(db, start: float, c: dict, repos: dict[str, str]) -> dict[str, dict]:
    """day → {'sites': {domain: minutes}, 'visits': {domain: n}, 'pages': [...], 'projects': {id: minutes}}, public only."""
    days = defaultdict(lambda: {'sites': defaultdict(float), 'visits': defaultdict(int), 'pages': defaultdict(float), 'projects': defaultdict(float)})
    names, default = titles(db, start), c.get('default', 'private')
    day = lambda ts: datetime.fromtimestamp(ts).date().isoformat()

    def state(url: str, title: str | None) -> tuple[str, str | None]:
        rule = classify(url, title, c)
        # A page no rule covers still counts toward a project it belongs to; an explicit private or drop keeps it out.
        return rule or default, project_of(url, c, repos) if rule in (None, 'domain', 'page') else None

    for ts, seconds, url, title in spans(db, start):
        title = names.get(url, title)
        action, project = state(url, title)
        d = days[day(ts)]
        if project:
            d['projects'][project] += seconds / 60
        if action in ('domain', 'page'):
            d['sites'][domain(url)] += seconds / 60
        if action == 'page':
            d['pages'][url] += seconds / 60
    rows = db.execute("select ts, kind, url, title from web_events where ts >= ? and kind in ('nav', 'history')", (start,)).fetchall()
    live = {day(r[0]) for r in rows if r[1] == 'nav'}   # history rows only fill in days the extension didn't see
    for ts, kind, url, title in rows:
        if (kind == 'nav' or day(ts) not in live) and state(url, names.get(url, title))[0] in ('domain', 'page'):
            days[day(ts)]['visits'][domain(url)] += 1
    out = {}
    for k, d in days.items():
        out[k] = {'sites': {h: round(m) for h, m in sorted(d['sites'].items(), key=lambda x: -x[1]) if round(m)},
                  'visits': dict(sorted(d['visits'].items(), key=lambda x: -x[1])),
                  'pages': [{'url': u, 'title': names.get(u), 'minutes': round(m)} for u, m in sorted(d['pages'].items(), key=lambda x: -x[1])],
                  'projects': {p: round(m) for p, m in d['projects'].items() if round(m)}}
    return out


def ledger(db, start: float) -> dict[str, dict[str, float]]:
    """day → domain → minutes, private pages included: your own accounting, never published."""
    days = defaultdict(lambda: defaultdict(float))
    for ts, seconds, url, _ in spans(db, start):
        days[datetime.fromtimestamp(ts).date().isoformat()][domain(url)] += seconds / 60
    return days


def import_history(db, c: dict, since: float) -> int:
    """Copy new browser-history rows in through browserprofile, for browsing the extension didn't see. Returns rows added."""
    try:
        from browserprofile.history import extract_history
        from browserprofile.profiles import list_profiles
    except ImportError:
        return 0
    added, latest = 0, since
    for profile in list_profiles():
        try:
            rows = extract_history(profile)
        except Exception:   # a profile with no history yet, or a browser mid-upgrade, must not stop the others
            continue
        for r in rows:
            ts = r.last_visit.timestamp() if r.last_visit else 0
            if ts > since and keepable(r.url, r.title, c):
                db.execute('insert into web_events (ts, kind, url, title) values (?, ?, ?, ?)',
                           (ts, 'history', clean(r.url, bool(c.get('keep_query'))), r.title))
                added, latest = added + 1, max(latest, ts)
    db.execute("insert or replace into meta values ('history_synced', ?)", (str(latest),))
    db.commit()
    return added


def install_host(sitekit: str | None = None) -> list[Path]:
    """Register the native-messaging host with each Chromium-family browser on this machine."""
    exe = sitekit or shutil.which('sitekit') or sys.exit('sitekit is not on PATH')
    wrapper = expand('~/.local/share/sitekit/pulse-native-host')
    wrapper.parent.mkdir(parents=True, exist_ok=True)
    wrapper.write_text(f'#!/bin/sh\nexec {exe} pulse native-host\n')    # the browser passes its own arguments; drop them
    wrapper.chmod(0o755)
    manifest = {'name': HOST, 'description': 'sitekit pulse browser activity', 'path': str(wrapper), 'type': 'stdio',
                'allowed_origins': [f'chrome-extension://{EXTENSION_ID}/']}
    config = Path(os.environ.get('XDG_CONFIG_HOME') or expand('~/.config'))
    written = []
    for browser in BROWSERS:
        if (config / browser).is_dir():
            path = config / browser / 'NativeMessagingHosts' / f'{HOST}.json'
            path.parent.mkdir(exist_ok=True)
            path.write_text(json.dumps(manifest, indent=1) + '\n')
            written.append(path)
    return written
