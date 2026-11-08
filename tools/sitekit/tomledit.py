"""Edit a hand-written TOML file in place, one key at a time, keeping its comments, order and layout.

Enough for pulse.toml: top-level keys and [table] sections holding scalars, arrays (one or several lines) and inline
tables. Every edit is checked by parsing the result, so a file is never written broken.
"""
from __future__ import annotations

import json
import re
import shutil
import tomllib
from pathlib import Path

HEADER = re.compile(r'^\s*\[\[?\s*([^\]]+?)\s*\]\]?\s*(#.*)?$')
BARE = re.compile(r'^[A-Za-z0-9_-]+$')


def dump(v) -> str:
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        return json.dumps(v, ensure_ascii=False)
    if isinstance(v, (list, tuple)):
        return '[' + ', '.join(map(dump, v)) + ']'
    if isinstance(v, dict):
        return '{ ' + ', '.join(f'{key(k)} = {dump(x)}' for k, x in v.items()) + ' }'
    raise TypeError(f'cannot write {type(v).__name__} to TOML')


def key(k: str) -> str:
    return k if BARE.match(k) else json.dumps(k, ensure_ascii=False)


def table_name(line: str) -> str | None:
    m = HEADER.match(line)
    return '.'.join(p.strip().strip('"\'') for p in m[1].split('.')) if m else None


def key_of(line: str) -> str | None:
    """The key a `key = value` line sets, unquoted, or None."""
    s = line.strip()
    if not s or s.startswith('#') or s.startswith('['):
        return None
    try:
        k = next(iter(tomllib.loads(s.split('=', 1)[0] + '= 0')))
        return k
    except (tomllib.TOMLDecodeError, StopIteration):
        return None


class Doc:
    def __init__(self, text: str):
        self.lines = text.splitlines()

    def __str__(self) -> str:
        return '\n'.join(self.lines) + '\n'

    def span(self, table: str) -> tuple[int, int] | None:
        """Line range [start, end) of a table's body; table '' is the top level."""
        start = 0 if table == '' else None
        for i, line in enumerate(self.lines):
            name = table_name(line)
            if name is None:
                continue
            if start is not None:
                return start, i
            if name == table:
                start = i + 1
        return (start, len(self.lines)) if start is not None else None

    def extent(self, i: int) -> int:
        """Index after the last line of the value that starts on line i (multi-line arrays)."""
        j, text = i, self.lines[i].split('=', 1)[1]
        while True:
            try:
                tomllib.loads('x =' + text)
                return j + 1
            except tomllib.TOMLDecodeError:
                j += 1
                if j >= len(self.lines):
                    return i + 1
                text += '\n' + self.lines[j]

    def find(self, table: str, k: str) -> int | None:
        if (sp := self.span(table)) is None:
            return None
        return next((i for i in range(*sp) if key_of(self.lines[i]) == k), None)

    def set(self, table: str, k: str, value) -> None:
        line = f'{key(k)} = {dump(value)}'
        if (i := self.find(table, k)) is not None:
            end = self.extent(i)
            comment = re.search(r'(\s+#[^"\']*)$', self.lines[end - 1])
            self.lines[i:end] = [line + (comment[1] if comment and end == i + 1 else '')]
            return
        if (sp := self.span(table)) is None:
            self.lines += ['', f'[{table}]', line]
            return
        start, end = sp
        last = max((j for j in range(start, end) if key_of(self.lines[j]) is not None), default=None)
        at = self.extent(last) if last is not None else start
        if table == '' and last is None:
            at = next((j for j in range(start, end) if self.lines[j].strip() and not self.lines[j].lstrip().startswith('#')), end)
        self.lines.insert(at, line)

    def remove(self, table: str, k: str) -> None:
        if (i := self.find(table, k)) is not None:
            del self.lines[i:self.extent(i)]


def edit(path: Path, changes: list[tuple[str, str, object]]) -> dict:
    """Apply (table, key, value) changes, value None removing the key. Writes path.bak first; returns the new config."""
    text = path.read_text() if path.exists() else ''
    doc = Doc(text)
    for table, k, v in changes:
        doc.remove(table, k) if v is None else doc.set(table, k, v)
    out = str(doc)
    parsed = tomllib.loads(out)
    if out != text:
        if path.exists():
            shutil.copy2(path, path.with_suffix(path.suffix + '.bak'))
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(path.suffix + '.tmp')
        tmp.write_text(out)
        tmp.replace(path)
    return parsed
