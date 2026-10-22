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


def expand(p) -> Path:
    return Path(os.path.expandvars(os.path.expanduser(str(p))))


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


async def run(*cmd: str, cwd=None, check=True, shell=False) -> str:
    env = {**os.environ, 'GIT_TERMINAL_PROMPT': '0', 'GIT_LFS_SKIP_SMUDGE': '1'}
    spawn = asyncio.create_subprocess_shell if shell else asyncio.create_subprocess_exec
    proc = await spawn(*cmd, cwd=cwd, env=env, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    out, err = await proc.communicate()
    if check and proc.returncode:
        raise RuntimeError(f'{cmd[0]} {" ".join(cmd[1:3])}: {err.decode(errors="replace").strip()[-400:]}')
    return out.decode('utf-8', 'replace')
