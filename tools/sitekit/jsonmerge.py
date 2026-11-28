"""A git merge driver for the JSON data files sitekit writes: `python jsonmerge.py BASE OURS THEIRS`. Stdlib only.

Merges the three as objects instead of lines, so two writers that each add or change different days (two machines,
or the pulse daemon and the refresh timer on one machine) combine instead of conflicting. A value both sides changed
differently goes to THEIRS, which during a rebase is the local commit being replayed: this machine's newer numbers.
The result is written over OURS. Exits 1, leaving git's usual conflict, when a file isn't JSON.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

GONE = object()


def merge(base, ours, theirs):
    if ours == theirs or base == theirs:
        return ours
    if base == ours:
        return theirs
    if all(isinstance(v, dict) for v in (ours, theirs)):
        base = base if isinstance(base, dict) else {}
        out = {}
        keys = list({**ours, **theirs})
        if list(ours) == sorted(ours) and list(theirs) == sorted(theirs):
            keys.sort()                 # days stay in date order
        for k in keys:
            if (v := merge(base.get(k, GONE), ours.get(k, GONE), theirs.get(k, GONE))) is not GONE:
                out[k] = v
        return out
    return theirs


def main(base: str, ours: str, theirs: str) -> int:
    try:
        b, o, t = (json.loads(Path(p).read_text() or 'null') for p in (base, ours, theirs))
    except (OSError, ValueError):
        return 1
    Path(ours).write_text(json.dumps(merge(b, o, t), ensure_ascii=False, indent=1) + '\n')
    return 0


if __name__ == '__main__':
    sys.exit(main(*sys.argv[1:4]))
