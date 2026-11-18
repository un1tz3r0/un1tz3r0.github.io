import asyncio
import json
import os
import stat
import subprocess
import sys
import time
from datetime import date, datetime
from pathlib import Path

import pytest

from sitekit import pulse


def mode(path):
    return stat.S_IMODE(path.stat().st_mode)


def test_db_is_private(tmp_path):
    path = tmp_path / 'p.sqlite3'
    db = pulse.open_db(path)
    db.execute("insert into meta values ('k', 'v')")
    db.commit()
    assert mode(path) == 0o600
    assert mode(path.with_name('p.sqlite3-wal')) == 0o600


def test_existing_db_is_made_private(tmp_path):
    path = tmp_path / 'p.sqlite3'
    pulse.open_db(path).close()
    path.chmod(0o644)
    pulse.open_db(path)
    assert mode(path) == 0o600


def test_db_uses_wal(tmp_path):
    assert pulse.open_db(tmp_path / 'p.sqlite3').execute('pragma journal_mode').fetchone()[0] == 'wal'


# ── [discover] ───────────────────────────────────────────────────────────────────────────────────────────────────


def repo(path, remote='git@github.com:me/thing.git', age=0):
    path.mkdir(parents=True)
    env = {**os.environ, 'GIT_AUTHOR_DATE': f'@{int(time.time() - age)}', 'GIT_COMMITTER_DATE': f'@{int(time.time() - age)}'}
    git = lambda *a: subprocess.run(['git', '-C', str(path), *a], check=True, capture_output=True, env=env)
    git('init', '-q')
    git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'x')
    if remote:
        git('remote', 'add', 'origin', remote)
    return path


def settings(tmp_path, discover=''):
    (tmp_path / 'site').mkdir(exist_ok=True)
    config = tmp_path / 'pulse.toml'
    config.write_text(f'site = "{tmp_path / "site"}"\ndb = "{tmp_path / "p.sqlite3"}"\n'
                      f'[discover]\nroot = "{tmp_path / "src"}"\nowner = "me"\n{discover}\n')
    return pulse.Settings.load(config)


def scan(s):
    return {p.name: n for p, n in asyncio.run(pulse.discover(s)).items()}


def test_duration():
    assert (pulse.duration('90d'), pulse.duration('1y'), pulse.duration(''), pulse.duration('60')) == (7776000, 31536000, 0, 60)
    with pytest.raises(ValueError):
        pulse.duration('soon')


def test_only_your_repos_are_found(tmp_path):
    repo(tmp_path / 'src' / 'mine')
    repo(tmp_path / 'src' / 'theirs', 'https://github.com/other/theirs')
    repo(tmp_path / 'src' / 'none', None)
    assert scan(settings(tmp_path)) == {'mine': 'thing'}


def test_first_rule_wins(tmp_path):
    repo(tmp_path / 'src' / 'scratch-a')
    repo(tmp_path / 'src' / 'keep')
    s = settings(tmp_path, 'rules = [{ action = "deny", when = "name", value = "scratch*" }, '
                           '{ action = "allow", when = "name", value = "*" }]')
    assert scan(s) == {'keep': 'thing'}
    assert list(s.skipped.values()) == ['denied: name scratch*']


@pytest.mark.parametrize('when, value, hit', [('dir', 'src', True), ('no-dir', 'src', False), ('file', '.gitignore', False),
                                              ('no-file', '.gitignore', True), ('remote', '*:me/*', True),
                                              ('no-remote', '*github.com*', False), ('path', '*/src/r', True)])
def test_conditions(tmp_path, when, value, hit):
    r = repo(tmp_path / 'src' / 'r')
    (r / 'src').mkdir()
    s = settings(tmp_path, f'rules = [{{ action = "deny", when = "{when}", value = "{value}" }}]')
    assert (scan(s) == {}) == hit


def test_limits_and_allow_exempts_from_them(tmp_path):
    repo(tmp_path / 'src' / 'old', age=400 * 86400)
    repo(tmp_path / 'src' / 'pinned', age=400 * 86400)
    repo(tmp_path / 'src' / 'new')
    s = settings(tmp_path, 'max_idle = "90d"\nrules = [{ action = "allow", when = "name", value = "pinned" }]')
    assert scan(s) == {'pinned': 'thing', 'new': 'thing'}
    assert s.skipped[(tmp_path / 'src' / 'old').resolve()] == 'untouched for 400 days'


def test_an_uncommitted_edit_counts_as_touched(tmp_path):
    r = repo(tmp_path / 'src' / 'old', age=400 * 86400)
    (r / 'notes.txt').write_text('new work')
    assert scan(settings(tmp_path, 'max_idle = "90d"')) == {'old': 'thing'}


def test_max_age_uses_the_first_commit(tmp_path):
    repo(tmp_path / 'src' / 'old', age=400 * 86400)
    s = settings(tmp_path, 'max_age = "1y"')
    assert scan(s) == {} and s.skipped[(tmp_path / 'src' / 'old').resolve()] == 'created 400 days ago'


@pytest.mark.parametrize('discover', ['rules = [{ action = "skip", when = "name", value = "x" }]',
                                      'rules = [{ action = "deny", when = "colour", value = "x" }]', 'max_idle = "soon"'])
def test_bad_config_does_not_load(tmp_path, discover):
    with pytest.raises(ValueError):
        settings(tmp_path, discover)


# ── publish ──────────────────────────────────────────────────────────────────────────────────────────────────────


def midnight():
    return datetime.combine(date.today(), datetime.min.time()).timestamp()


def test_publish_adds_browsing_the_rules_allow(published):
    def setup(db):
        db.execute("insert into pages (start, end, url, title) values (?, ?, 'https://github.com/me/x', 'x')", (midnight() + 60, midnight() + 660))
        db.execute("insert into pages (start, end, url, title) values (?, ?, 'https://mail.example/', 'inbox')", (midnight() + 700, midnight() + 900))
    day = published('[browser]\npublish = [{ match = "github.com", level = "page" }]', setup)
    assert day['domains'] == {'github.com': 10} and day['pages'] == [{'url': 'https://github.com/me/x', 'title': 'x', 'minutes': 10}]
    assert 'mail.example' not in json.dumps(day) and day['active'] == 0


def test_publish_without_rules_adds_nothing(published):
    def setup(db):
        db.execute("insert into pages (start, end, url) values (?, ?, 'https://github.com/me/x')", (midnight() + 60, midnight() + 660))
    assert published(setup=setup) is None


# ── rule lists in pulse.toml ────────────────────────────────────────────────────────────────────────────────────

def load(tmp_path, text):
    path = tmp_path / 'pulse.toml'
    path.write_text(f'site = "{tmp_path / "site"}"\n[discover]\nenabled = false\n' + text)
    return pulse.Settings.load(path)


def test_app_rules_and_the_older_map(tmp_path):
    s = load(tmp_path, '[apps]\ncode = "code|zed"\nrules = [{ match = "insiders", to = "code", action = "deny", priority = "!" },\n'
                       '  { match = "insiders", to = "beta" }, { match = "steam", action = "deny" }]\n[app_ids]\nzed = "ignore"\n')
    assert [s.category(a) for a in ('code', 'code-insiders', 'steam', 'zed', 'blender')] == ['code', 'beta', 'other', 'ignore', 'other']
    assert s.categories() == ['beta', 'code']


def test_a_bad_app_regex_refuses_the_config(tmp_path):
    with pytest.raises(ValueError, match='not a valid regex'):
        load(tmp_path, '[apps]\nrules = [{ match = "(", to = "x" }]\n')


def test_old_exclude_becomes_rules_and_still_excludes(tmp_path):
    path = tmp_path / 'pulse.toml'
    path.write_text(f'site = "{tmp_path}"\n[discover]\nenabled = false\nrules = [{{ action = "allow", when = "name", value = "x" }}]\n'
                    'exclude = ["~/scratch"]\n')
    s = pulse.Settings.load(path)
    assert s.rules[-1] == {'action': 'deny', 'priority': '!', 'when': 'path', 'value': '~/scratch'}
    assert s.exclude == {(Path.home() / 'scratch').resolve()}


def test_browser_config_sends_rules_and_the_older_forms(tmp_path):
    s = load(tmp_path, '[browser]\ndeny = ["*.bank.*"]\n[browser.sites]\ndocs = "docs\\\\."\n')
    c = s.browser_config()
    assert c['filter'] == [{'match': '*.bank.*', 'action': 'deny', 'priority': '!'}] and c['deny'] == ['*.bank.*']
    assert c['site_rules'] == [{'match': 'docs\\.', 'to': 'docs'}] and c['sites'] == {'docs': 'docs\\.'}


def test_ignoring_a_folder_from_the_panel_writes_a_rule(tmp_path):
    import site
    import socket
    run_dir, folder = tmp_path / 'run', tmp_path / 'scratch'
    run_dir.mkdir()
    folder.mkdir()
    config = tmp_path / 'pulse.toml'
    config.write_text(f'site = "{tmp_path / "site"}"\ndb = "{tmp_path / "p.sqlite3"}"\npush = false\n[projects]\n"{folder}" = "scratch"\n'
                      f'[discover]\nenabled = false\nexclude = ["{tmp_path / "old"}"]\n')
    env = {**os.environ, 'XDG_RUNTIME_DIR': str(run_dir), 'PYTHONUSERBASE': site.getuserbase(),
           'PYTHONPATH': str(Path(pulse.__file__).parent.parent)}
    daemon = subprocess.Popen([sys.executable, '-m', 'sitekit', 'pulse', 'run', '--config', str(config)], env=env,
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        sock = run_dir / 'sitekit-pulse.sock'
        for _ in range(100):
            if sock.exists():
                break
            time.sleep(0.1)
        with socket.socket(socket.AF_UNIX) as s:
            s.connect(str(sock))
            s.sendall((json.dumps({'cmd': 'assign', 'what': 'folder', 'path': str(folder), 'project': 'ignore'}) + '\n').encode())
            assert json.loads(s.makefile().readline())['ok']
    finally:
        daemon.terminate()      # it may be restarting for the config change, which a SIGTERM can miss; then kill, as systemd does
        try:
            daemon.wait(5)
        except subprocess.TimeoutExpired:
            daemon.kill()
            daemon.wait()
    c = __import__('tomllib').loads(config.read_text())
    assert 'projects' not in c or str(folder) not in c['projects']
    assert 'exclude' not in c['discover']
    assert c['discover']['rules'] == [{'action': 'deny', 'priority': '!', 'when': 'path', 'value': str(tmp_path / 'old')},
                                      {'action': 'deny', 'priority': '!', 'when': 'path', 'value': str(folder)}]
