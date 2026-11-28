"""Paths, time helpers, git-friendly JSON and subprocess plumbing shared by every sitekit command."""
from __future__ import annotations

import asyncio
import hashlib
import json
import os
import re
import sys
import tomllib
from datetime import datetime, timezone
from pathlib import Path

from yarl import URL

API = URL('https://api.github.com')


def expand(p) -> Path:
    return Path(os.path.expandvars(os.path.expanduser(str(p))))


def journal(kind: str) -> str:
    """The syslog priority prefix journald reads from a unit's output, so `journalctl -p warning` finds these lines."""
    return {'warning': '<4>', 'error': '<3>'}.get(kind, '') if os.environ.get('JOURNAL_STREAM') else ''


def find_site(start: Path | None = None) -> Path:
    if env := os.environ.get('SITEKIT_SITE'):
        return expand(env)
    here = (start or Path.cwd()).resolve()
    for d in (here, *here.parents):
        if (d / 'site.toml').exists():
            return d
    sys.exit('sitekit: no site.toml here or above; run inside the site checkout or set SITEKIT_SITE')


def load_toml(path: Path) -> dict:
    return tomllib.loads(path.read_text()) if path.exists() else {}


def utc(dt: datetime) -> datetime:
    return (dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)).astimezone(timezone.utc)


def iso(dt: datetime) -> str:
    return utc(dt).strftime('%Y-%m-%dT%H:%M:%SZ')


def parse_time(s: str) -> datetime:
    return utc(datetime.fromisoformat(s.strip().replace('Z', '+00:00')))


def now() -> str:
    return iso(datetime.now(timezone.utc))


def digest(*parts) -> str:
    return hashlib.sha1('\x1f'.join(map(str, parts)).encode()).hexdigest()[:12]


def slug(s: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:60] or 'untitled'


def read_json(path: Path, default=None):
    return json.loads(path.read_text()) if path.exists() else default


def write_json(path: Path, obj) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=1) + '\n')


def write_rows(path: Path, head: dict, key: str, rows: list) -> None:
    """JSON object whose `key` list holds one compact row per line, so git diffs stay one line per change."""
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = ',\n'.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) for r in rows)
    path.write_text(json.dumps({**head, key: []}, ensure_ascii=False)[:-3] + f'[\n{lines}\n]}}\n')


async def run(*cmd: str, cwd=None, check=True, shell=False, env: dict | None = None) -> str:
    env = {**os.environ, 'GIT_TERMINAL_PROMPT': '0', 'GIT_LFS_SKIP_SMUDGE': '1', **(env or {})}
    spawn = asyncio.create_subprocess_shell if shell else asyncio.create_subprocess_exec
    proc = await spawn(*cmd, cwd=cwd, env=env, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    out, err = await proc.communicate()
    if check and proc.returncode:
        raise RuntimeError(f'{label(cmd)}: {tail(err.decode(errors="replace"))}')
    return out.decode('utf-8', 'replace')


def label(cmd) -> str:
    """`git push` for `git -C repo -c k=v push …`: the program and its first word that isn't an option."""
    args = iter(cmd[1:])
    word = next((a for a in args if not (a in ('-C', '-c') and next(args, None)) and not a.startswith('-')), '')
    return f'{cmd[0]} {word}'.strip()


def tail(err: str, limit: int = 600) -> str:
    """The last whole lines of stderr that fit in limit, without git's `hint:` advice."""
    lines = [l.rstrip() for l in err.strip().splitlines() if l.strip() and not l.startswith('hint:')]
    kept, size = [], 0
    for line in reversed(lines):
        if kept and size + len(line) > limit:
            break
        kept.append(line[-limit:])
        size += len(line) + 1
    return '\n'.join(reversed(kept))


def api_headers() -> dict:
    h = {'Accept': 'application/vnd.github+json', 'User-Agent': 'sitekit'}
    if token := os.environ.get('GITHUB_TOKEN'):
        h['Authorization'] = f'Bearer {token}'
    return h
