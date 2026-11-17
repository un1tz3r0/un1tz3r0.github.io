import asyncio
import json
import subprocess
from datetime import date

import pytest

from sitekit import claude, pulse


@pytest.fixture
def published(tmp_path, monkeypatch):
    """publish() into a local git checkout with pushing off; returns today's published record, or None."""
    async def scanned(site, cfg):
        (site / 'data' / 'claude-usage').mkdir(parents=True, exist_ok=True)
        (site / 'data' / 'claude-usage' / 'test.json').write_text('{}')

    def run(extra='', setup=lambda db: None, transcripts=None, roots=None):
        monkeypatch.setattr(claude, 'TRANSCRIPTS', transcripts or tmp_path / 'no-transcripts')
        monkeypatch.setattr(claude, 'CACHE', tmp_path / 'claude-sessions.json')
        monkeypatch.setattr(claude, 'scan', scanned)   # its default root is the real ~/.claude, bound at import
        site = tmp_path / 'site'
        site.mkdir(exist_ok=True)
        for args in (['init', '-q'], ['config', 'user.email', 't@t'], ['config', 'user.name', 't']):
            subprocess.run(['git', '-C', str(site), *args], check=True)
        config = tmp_path / 'pulse.toml'
        config.write_text(f'site = "{site}"\ndb = "{tmp_path / "p.sqlite3"}"\npush = false\n[discover]\nenabled = false\n{extra}\n')
        s = pulse.Settings.load(config)
        s.found = roots or {}
        db = pulse.open_db(s.db)
        setup(db)
        db.commit()
        asyncio.run(pulse.publish(s, db))
        path = site / 'data' / 'pulse' / f'{date.today():%Y-%m}.json'
        return json.loads(path.read_text())['days'].get(date.today().isoformat()) if path.exists() else None
    return run
