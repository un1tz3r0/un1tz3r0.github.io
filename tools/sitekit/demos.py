"""Builds the demos that live in their own repos and copies the output into demos/<id>/.

A demo in data/demos.json opts in with a build table: {"repo": url, "ref": branch, "run": [shell commands],
"copy": {"path/in/repo": "path/under/demos/<id>"}}. The destination folder is owned by the build and replaced each time.
"""
from __future__ import annotations

import shutil
from pathlib import Path

from .common import expand, read_json, run

CACHE = expand('~/.cache/sitekit/demos')


async def checkout(repo: str, ref: str | None, path: Path) -> str:
    if (path / '.git').exists():
        await run('git', '-C', str(path), 'fetch', '--quiet', '--depth', '1', 'origin', ref or 'HEAD')
        await run('git', '-C', str(path), 'reset', '--quiet', '--hard', 'FETCH_HEAD')
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        await run('git', 'clone', '--quiet', '--depth', '1', *(['--branch', ref] if ref else []), repo, str(path))
    return (await run('git', '-C', str(path), 'rev-parse', '--short', 'HEAD')).strip()


async def build(site: Path, only: list[str]) -> None:
    for demo in read_json(site / 'data' / 'demos.json')['demos']:
        spec = demo.get('build')
        if not spec or (only and demo['id'] not in only):
            continue
        src, dest = CACHE / demo['id'], site / 'demos' / demo['id']
        commit = await checkout(spec['repo'], spec.get('ref'), src)
        for cmd in spec.get('run', []):
            await run(cmd, cwd=src, shell=True)
        shutil.rmtree(dest, ignore_errors=True)
        for frm, to in spec['copy'].items():
            target = dest / to
            target.parent.mkdir(parents=True, exist_ok=True)
            (shutil.copytree if (src / frm).is_dir() else shutil.copy2)(src / frm, target)
        print(f'{demo["id"]}: built {commit} → {dest.relative_to(site)}')
