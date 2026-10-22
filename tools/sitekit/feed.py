"""The activity feed: data/feed/YYYY-MM.json shards (newest first) plus data/feed/index.json, which the site pages through.

An entry is a flat dict: id, time (UTC ISO), kind, and whichever of source, title, text (markdown), html, url,
media [{type, src, alt}], tags, project, repo, count, items, meta apply. Ids are stable, so re-importing updates in place.
"""
from __future__ import annotations

from collections import Counter, defaultdict
from collections.abc import Callable
from pathlib import Path

from .common import now, read_json, write_json, write_rows

KINDS = ('post', 'status', 'link', 'media', 'tweet', 'lj', 'commits')


def clean(entry: dict) -> dict:
    return {k: v for k, v in entry.items() if v not in (None, '', [], {})}


class Feed:
    def __init__(self, site: Path):
        self.dir = site / 'data' / 'feed'

    def months(self) -> list[str]:
        return sorted((p.stem for p in self.dir.glob('[0-9][0-9][0-9][0-9]-[0-9][0-9].json')), reverse=True)

    def load(self, month: str) -> dict[str, dict]:
        return {e['id']: e for e in read_json(self.dir / f'{month}.json', {'entries': []})['entries']}

    def save(self, month: str, entries: dict[str, dict]) -> None:
        path = self.dir / f'{month}.json'
        if entries:
            write_rows(path, {'month': month}, 'entries', sorted(entries.values(), key=lambda e: e['time'], reverse=True))
        else:
            path.unlink(missing_ok=True)

    def upsert(self, entries, drop: Callable[[dict], bool] | None = None) -> int:
        """Add or replace entries by id. Existing entries matching `drop` that are not among `entries` are removed."""
        incoming = defaultdict(dict)
        for e in map(clean, entries):
            incoming[e['time'][:7]][e['id']] = e
        keep = {i for month in incoming.values() for i in month}
        changed = 0
        for month in sorted(set(incoming) | (set(self.months()) if drop else set())):
            cur = self.load(month)
            new = {i: e for i, e in cur.items() if not (drop and drop(e) and i not in keep)}
            new.update(incoming.get(month, {}))
            if new != cur:
                changed += sum(cur.get(i) != e for i, e in new.items()) + len(cur.keys() - new.keys())
                self.save(month, new)
        self.reindex()
        return changed

    def urls(self) -> dict[str, str]:
        return {e['url']: e['id'] for m in self.months() for e in self.load(m).values() if e.get('url')}

    def remove(self, entry_id: str) -> bool:
        for month in self.months():
            cur = self.load(month)
            if cur.pop(entry_id, None):
                self.save(month, cur)
                self.reindex()
                return True
        return False

    def reindex(self) -> None:
        months = []
        for month in self.months():
            entries = self.load(month).values()
            months.append({'month': month, 'count': len(entries), 'kinds': dict(Counter(e['kind'] for e in entries))})
        write_json(self.dir / 'index.json', {'updated': now(), 'months': months})
