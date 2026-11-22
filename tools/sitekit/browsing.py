"""What the daemon publishes about the pages the browser extension recorded, and browser history for days it didn't.

Every stored page is private until a [browser] publish rule says otherwise. Publish rules are a rule map (see rules.py)
whose key is `level`; a page no rule gives a level gets `default` (private):
  private  nothing published about it (it still counts toward minutes, site categories and projects, as before)
  domain   the domain's minutes and number of pages visited are published
  page     the page's URL and title are published too

`match` is a glob on the hostname, or on host + path when it contains a "/", as in the [browser] filter that decides what
is recorded at all. Both are applied again at publish time, so tightening one takes effect on everything not yet
published.

With `history = true`, rows from the browsers' own history (through browserprofile) fill in pages visited on days the
extension recorded nothing. History has no durations, so those days only get visit counts.
"""
from __future__ import annotations

import json
import re
import sqlite3
from collections import defaultdict
from datetime import datetime
from urllib.parse import urlsplit

from . import rules

LEVELS = ['private', 'domain', 'page']


def glob(pattern: str) -> re.Pattern:
    """The extension's glob: * matches anything, everything else is literal, case doesn't matter."""
    return re.compile('^' + '.*'.join(map(re.escape, pattern.split('*'))) + '$', re.I)


def listed(patterns: list[str], url: str) -> bool:
    u = urlsplit(url)
    host = u.hostname or ''
    return any(glob(p).match(f'{host}{u.path}' if '/' in p else host) for p in patterns)


def filter_rules(c: dict) -> list[dict]:
    """[browser] filter, or the older allow and deny lists as one: denied hosts first, so they still always win."""
    if 'filter' in c:
        return list(c['filter'])
    return ([{'match': m, 'action': 'deny', 'priority': '!'} for m in c.get('deny', [])]
            + [{'match': m} for m in c.get('allow', [])])


def site_rules(c: dict) -> list[dict]:
    """[browser.sites] rules (regexes on the hostname giving a site category), or its older `name = "regex"` entries."""
    table = c.get('sites', {})
    return list(table.get('rules', [])) + [{'match': v, 'to': k} for k, v in table.items() if isinstance(v, str)]


def recordable(url: str | None, c: dict) -> bool:
    """What the extension records: http(s) pages the filter allows. Its first matching rule decides; a page no rule
    matches is recorded unless the filter has allow rules, which then list the only hosts recorded."""
    if not url or not url.startswith(('http://', 'https://')):
        return False
    found = filter_rules(c)
    hit = rules.decide(found, lambda r: listed([r['match']], url))
    return rules.allowed(hit) if hit else not any(rules.allowed(r) for r in found)


def level(url: str, c: dict) -> str:
    if not recordable(url, c):
        return 'private'
    found = rules.lookup(c.get('publish', []), lambda r: listed([r['match']], url), key='level')
    return 'private' if found is rules.STOP else found or c.get('default', 'private')


def check(c: dict) -> dict:
    rules.check(filter_rules(c), '[browser] filter')
    rules.check(c.get('publish', []), '[browser] publish')
    for r in c.get('publish', []):
        if r.get('level', 'private' if not rules.allowed(r) else None) not in LEVELS:
            raise ValueError(f'[browser] publish: an allow rule needs level = one of {", ".join(LEVELS)}: {r}')
    if c.get('default', 'private') not in LEVELS:
        raise ValueError(f'[browser] default must be one of {", ".join(LEVELS)}')
    for r in rules.check(site_rules(c), '[browser.sites] rules'):
        try:
            re.compile(r['match'])
        except re.error as e:
            raise ValueError(f'[browser.sites] rules: {r["match"]!r} is not a valid regex: {e}') from None
    return c


def domain(url: str) -> str:
    return (urlsplit(url).hostname or '').removeprefix('www.')


def day_report(db: sqlite3.Connection, start: float, c: dict) -> dict[str, dict]:
    """day → {'domains': {domain: minutes}, 'visits': {domain: pages}, 'pages': [{url, title, minutes}]}, public only."""
    days = defaultdict(lambda: {'domains': defaultdict(float), 'urls': defaultdict(set), 'pages': defaultdict(float), 'titles': {}})
    day = lambda ts: datetime.fromtimestamp(ts).date().isoformat()
    seen = set()
    for begin, end, url, title in db.execute('select start, end, url, title from pages where start >= ? order by start', (start,)):
        seen.add(day(begin))
        if not url or (lv := level(url, c)) == 'private':
            continue
        d = days[day(begin)]
        d['domains'][domain(url)] += (end - begin) / 60
        d['urls'][domain(url)].add(url)
        if lv == 'page':
            d['pages'][url] += (end - begin) / 60
            d['titles'][url] = title or d['titles'].get(url)
    for ts, url in db.execute('select ts, url from history where ts >= ?', (start,)):
        if day(ts) not in seen and level(url, c) != 'private':
            days[day(ts)]['urls'][domain(url)].add(url)
    out = {}
    for k, d in sorted(days.items()):
        v = {'domains': {h: round(m) for h, m in sorted(d['domains'].items(), key=lambda x: -x[1]) if round(m)},
             'visits': {h: len(u) for h, u in sorted(d['urls'].items(), key=lambda x: -len(x[1]))},
             'pages': [{k2: v2 for k2, v2 in {'url': u, 'title': d['titles'].get(u), 'minutes': round(m)}.items() if v2 is not None}
                       for u, m in sorted(d['pages'].items(), key=lambda x: -x[1])]}
        if v := {k2: v2 for k2, v2 in v.items() if v2}:
            out[k] = v
    return out


def available() -> bool:
    """Whether browserprofile, which reads the browsers' own history, is installed (it needs Python 3.13)."""
    try:
        import browserprofile  # noqa: F401
        return True
    except ImportError:
        return False


def import_history(db: sqlite3.Connection, c: dict) -> int:
    """Copy history rows newer than the last import, that the extension would have recorded. Returns rows added; 0
    when browserprofile isn't installed (it needs Python 3.13)."""
    try:
        from browserprofile.history import extract_history
        from browserprofile.profiles import list_profiles
    except ImportError:
        return 0
    row = db.execute("select value from meta where key = 'history_synced'").fetchone()
    since = latest = float(row[0]) if row else 0.0
    added = 0
    for profile in list_profiles():
        try:
            rows = extract_history(profile)
        except Exception:   # a profile with no history yet, or a browser mid-upgrade, must not stop the others
            continue
        for r in rows:
            ts = r.last_visit.timestamp() if r.last_visit else 0
            if ts > since and recordable(r.url, c):
                u = urlsplit(r.url)
                db.execute('insert into history values (?, ?, ?)', (ts, f'{u.scheme}://{u.netloc}{u.path}',
                                                                      r.title if c.get('titles', True) else None))
                added, latest = added + 1, max(latest, ts)
    db.execute("insert or replace into meta values ('history_synced', ?)", (json.dumps(latest),))
    db.commit()
    return added
