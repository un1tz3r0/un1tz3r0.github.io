import asyncio
import os
import shutil
import stat
import subprocess
import sys
from pathlib import Path

import pytest

from sitekit import manage, native, pulse, pulse_ctl, update

TOOLS = Path(update.__file__).resolve().parent.parent
ID = ['-c', 'user.name=t', '-c', 'user.email=t@t']


def git(repo, *args, check=True):
    return subprocess.run(['git', '-C', str(repo), *ID, *args], check=check, capture_output=True, text=True)


@pytest.fixture
def world(tmp_path, monkeypatch):
    """A stand-in for GitHub holding this tools/ folder, a trusted and an untrusted key, and a layout to install into."""
    keys = {}
    for name in ('good', 'evil'):
        subprocess.run(['ssh-keygen', '-q', '-t', 'ed25519', '-N', '', '-C', name, '-f', str(tmp_path / name)], check=True)
        keys[name] = tmp_path / name
    remote = tmp_path / 'remote'
    shutil.copytree(TOOLS, remote / 'tools', ignore=shutil.ignore_patterns('tests', '__pycache__', '*.egg-info'))
    (remote / 'data').mkdir()
    (remote / 'data' / 'big.json').write_text('{}')
    git(tmp_path, 'init', '-q', '-b', 'master', str(remote))
    git(remote, 'add', '-A')
    git(remote, 'commit', '-qm', 'tools')
    l = update.Layout(tmp_path / 'home', tmp_path / 'allowed_signers')
    update.trust(l, keys['good'].with_suffix('.pub').read_text(), 'release')
    (l.venv / 'bin').mkdir(parents=True)
    (l.venv / 'bin' / 'python').symlink_to(sys.executable)    # no venv or pip in tests
    pips = []

    async def pip(layout, reqs):
        pips.append(reqs)
    monkeypatch.setattr(update, 'pip_install', pip)
    config = tmp_path / 'pulse.toml'
    config.write_text(f'site = "{tmp_path / "site"}"\ndb = "{tmp_path / "p.sqlite3"}"\npush = false\n[discover]\nenabled = false\n')
    return type('World', (), dict(tmp=tmp_path, remote=remote, keys=keys, l=l, pips=pips, config=config, url=str(remote)))


def tag(w, name, key='good', ref='HEAD'):
    signing = ['-c', 'gpg.format=ssh', '-c', f'user.signingkey={w.keys[key]}', 'tag', '-s'] if key else ['tag', '-a']
    git(w.remote, *signing, name, '-m', name, ref)


def commit(w, path='tools/sitekit/common.py', text='\n# a change\n'):
    with (w.remote / path).open('a') as f:
        f.write(text)
    git(w.remote, 'commit', '-qam', 'change')


def log(text, kind=None):
    log.lines.append(text)


@pytest.fixture(autouse=True)
def clear_log():
    log.lines = []


def run(coro):
    return asyncio.run(coro)


def test_versions_sort_numerically():
    tags = ['pulse-v1.9.0', 'pulse-v1.10.0', 'pulse-v1.2.3', 'pulse-vx', 'other']
    assert sorted(filter(update.version, tags), key=update.version) == ['pulse-v1.2.3', 'pulse-v1.9.0', 'pulse-v1.10.0']


def test_install_takes_the_newest_trusted_release(world):
    w = world
    tag(w, 'pulse-v1.0.0')
    commit(w)
    tag(w, 'pulse-v1.1.0', key='evil')
    tag(w, 'pulse-v1.0.1', key=None)
    assert run(update.bootstrap(w.l, w.url, w.config, log)) == 'pulse-v1.0.0'
    assert w.l.current_tag() == 'pulse-v1.0.0' and not w.l.pending.exists()
    assert sorted(os.listdir(w.l.current)) == ['.git', 'tools']     # sparse: only tools/
    assert w.l.bad() == {'pulse-v1.1.0', 'pulse-v1.0.1'}
    assert 'signature not trusted' in w.l.bad_file.read_text()
    assert w.pips == [update.requirements(TOOLS)]
    assert os.access(w.l.launch, os.X_OK)


@pytest.fixture
def installed(world):
    tag(world, 'pulse-v1.0.0')
    run(update.bootstrap(world.l, world.url, world.config, log))
    return world


def test_a_new_release_is_checked_then_switched_to(installed):
    w = installed
    commit(w)
    tag(w, 'pulse-v1.2.0')
    assert run(update.update(w.l, w.config, log, current='pulse-v1.0.0')) == 'pulse-v1.2.0'
    assert w.l.current_tag() == 'pulse-v1.2.0'
    assert (w.l.pending.read_text(), w.l.previous.read_text()) == ('pulse-v1.2.0', 'pulse-v1.0.0')
    assert len(w.pips) == 1                  # dependencies unchanged, so no pip
    assert run(update.update(w.l, w.config, log, current='pulse-v1.2.0')) is None


def test_changed_dependencies_are_installed(installed):
    w = installed
    path = w.remote / 'tools' / 'pyproject.toml'
    path.write_text(path.read_text().replace('"yarl>=1.9"', '"yarl>=1.9", "rich>=13"'))
    git(w.remote, 'commit', '-qam', 'deps')
    tag(w, 'pulse-v1.1.0')
    run(update.update(w.l, w.config, log, current='pulse-v1.0.0'))
    assert 'rich>=13' in w.pips[-1] and len(w.pips) == 2


def test_a_release_that_fails_its_check_is_never_switched_to(installed):
    w = installed
    commit(w, 'tools/sitekit/pulse.py', '\nthis is not python(\n')
    tag(w, 'pulse-v1.1.0')
    assert run(update.update(w.l, w.config, log, current='pulse-v1.0.0')) is None
    assert w.l.current_tag() == 'pulse-v1.0.0' and 'pulse-v1.1.0' in w.l.bad()
    assert 'check failed' in w.l.bad_file.read_text() and any('failed' in x for x in log.lines)


def test_a_failed_pip_install_is_retried_not_marked_bad(installed, monkeypatch):
    w = installed
    path = w.remote / 'tools' / 'pyproject.toml'
    path.write_text(path.read_text().replace('"yarl>=1.9"', '"yarl>=1.9", "rich>=13"'))
    git(w.remote, 'commit', '-qam', 'deps')
    tag(w, 'pulse-v1.1.0')

    async def offline(layout, reqs):
        raise RuntimeError('pip install: network unreachable')
    monkeypatch.setattr(update, 'pip_install', offline)
    assert run(update.update(w.l, w.config, log, current='pulse-v1.0.0')) is None
    assert 'pulse-v1.1.0' not in w.l.bad() and any('will retry' in x for x in log.lines)
    monkeypatch.setattr(update, 'pip_install', lambda layout, reqs: asyncio.sleep(0))
    assert run(update.update(w.l, w.config, log, current='pulse-v1.0.0')) == 'pulse-v1.1.0'


def test_install_on_a_fresh_machine(world, monkeypatch):
    """No config or its folder, no site checkout: install writes the config, clones data/, and writes the units."""
    home, w = world.tmp / 'user', world
    monkeypatch.setenv('HOME', str(home))
    monkeypatch.setattr(native, 'HOST', home / '.local/share/sitekit/pulse-native-host')
    example = w.tmp / 'example.toml'
    example.write_text(f'site = "{w.tmp / "site"}"\nremote = "{w.url}"\ndb = "{w.tmp / "p.sqlite3"}"\npush = false\n'
                       '[discover]\nenabled = false\n')
    monkeypatch.setattr(pulse, 'EXAMPLE', example)
    monkeypatch.setattr(manage, 'FIRST', 'pulse-v1.1.0')
    monkeypatch.setattr(update, 'RUNNING', 'pulse-v1.1.0')     # as if the release's own installer runs, so no exec
    tag(w, 'pulse-v1.0.0')
    commit(w)
    tag(w, 'pulse-v1.1.0')
    config = home / '.config/sitekit/pulse.toml'
    run(manage.install(config, w.l, url=w.url))
    assert w.l.current_tag() == 'pulse-v1.1.0' and config.read_text() == example.read_text()
    assert (w.tmp / 'site' / 'data' / 'big.json').exists() and not (w.tmp / 'site' / 'tools').exists()
    service = (home / '.config/systemd/user/sitekit-pulse.service').read_text()
    assert f'ExecStart={w.l.launch}' in service
    assert 'OnUnitActiveSec=3600' in (home / '.config/systemd/user/sitekit-update.timer').read_text()
    assert os.access(native.HOST, os.X_OK) and str(w.l.package) in native.HOST.read_text()


def test_a_tag_off_master_is_refused(installed):
    w = installed
    git(w.remote, 'switch', '-qc', 'side')
    commit(w)
    tag(w, 'pulse-v1.1.0')
    assert run(update.update(w.l, w.config, log, current='pulse-v1.0.0')) is None
    assert 'not a commit on master' in w.l.bad_file.read_text()


def test_nothing_installs_without_trusted_keys(world):
    tag(world, 'pulse-v1.0.0')
    world.l.signers.unlink()
    with pytest.raises(RuntimeError, match='trust a release key first'):
        run(update.bootstrap(world.l, world.url, world.config, log))


def test_offline_raises_for_the_daemon_to_log(installed):
    shutil.rmtree(installed.remote)
    with pytest.raises(RuntimeError):
        run(update.update(installed.l, installed.config, log, current='pulse-v1.0.0'))


def fake_release(l, *tags):
    for t in tags:
        (l.versions / t / 'tools').mkdir(parents=True)


def test_launcher_rolls_back_a_release_that_keeps_crashing(world):
    l = world.l
    fake_release(l, 'pulse-v1.0.0', 'pulse-v1.1.0')
    update.switch(l, 'pulse-v1.0.0', pending=False)
    update.switch(l, 'pulse-v1.1.0')
    l.launch.write_text(update.LAUNCH.format(tries=update.TRIES))
    l.launch.chmod(0o755)
    (l.venv / 'bin' / 'python').unlink()
    (l.venv / 'bin' / 'python').write_text(f'#!/bin/sh\necho "$PYTHONPATH $*" >> {world.tmp / "starts"}\nexit 1\n')
    (l.venv / 'bin' / 'python').chmod(0o755)
    for _ in range(update.TRIES):
        subprocess.run([str(l.launch)])
        assert l.current_tag() == 'pulse-v1.1.0'
    subprocess.run([str(l.launch)])
    assert l.current_tag() == 'pulse-v1.0.0' and not l.pending.exists()
    assert l.bad() == {'pulse-v1.1.0'}
    assert (world.tmp / 'starts').read_text().splitlines()[0] == f'{l.home}/current/tools -m sitekit pulse run'


def test_launcher_without_an_update_just_starts(world):
    l = world.l
    l.home.mkdir(exist_ok=True)
    l.launch.write_text(update.LAUNCH.format(tries=update.TRIES))
    l.launch.chmod(0o755)
    (l.venv / 'bin' / 'python').unlink()
    (l.venv / 'bin' / 'python').write_text('#!/bin/sh\nexit 0\n')
    (l.venv / 'bin' / 'python').chmod(0o755)
    assert subprocess.run([str(l.launch)]).returncode == 0 and not (l.home / 'pending.tries').exists()


def test_a_started_release_confirms_its_update(world, monkeypatch):
    l = world.l
    fake_release(l, 'pulse-v1.0.0', 'pulse-v1.1.0')
    update.switch(l, 'pulse-v1.0.0', pending=False)
    update.switch(l, 'pulse-v1.1.0')
    monkeypatch.setattr(update, 'RUNNING', 'pulse-v1.0.0')
    assert update.confirm(l) is None and l.pending.exists()       # the old one restarting confirms nothing
    monkeypatch.setattr(update, 'RUNNING', 'pulse-v1.1.0')
    assert update.confirm(l) == 'pulse-v1.1.0' and not l.pending.exists()


def test_rollback_by_hand(world):
    l = world.l
    fake_release(l, 'pulse-v1.0.0', 'pulse-v1.1.0')
    with pytest.raises(RuntimeError):
        update.rollback(l)
    update.switch(l, 'pulse-v1.0.0', pending=False)
    update.switch(l, 'pulse-v1.1.0')
    assert update.rollback(l) == 'pulse-v1.0.0'
    assert l.current_tag() == 'pulse-v1.0.0' and l.bad() == {'pulse-v1.1.0'} and not l.pending.exists()


def test_running_release_comes_from_the_resolved_path(world):
    code = 'from sitekit import update; print(update.RUNNING)'
    fake_release(world.l, 'pulse-v2.0.0')
    shutil.copytree(TOOLS / 'sitekit', world.l.versions / 'pulse-v2.0.0' / 'tools' / 'sitekit',
                    ignore=shutil.ignore_patterns('__pycache__'))
    update.switch(world.l, 'pulse-v2.0.0', pending=False)
    out = subprocess.run([sys.executable, '-c', code], env={**os.environ, 'PYTHONPATH': str(world.l.package)},
                         capture_output=True, text=True, cwd=world.tmp)
    assert out.stdout.strip() == 'pulse-v2.0.0'
    assert update.running() is None          # a checkout is not a release


def test_trust(world):
    l, pub = world.l, world.keys['evil'].with_suffix('.pub').read_text()
    line = update.trust(l, pub, 'other')
    update.trust(l, pub, 'other')
    assert l.signers.read_text().count(line) == 1 and line.startswith('other namespaces="git" ssh-ed25519 ')
    with pytest.raises(ValueError):
        update.trust(l, world.config.read_text(), 'x')


@pytest.fixture
def dev(world):
    """A working clone of the remote, set up to sign with the trusted key."""
    d = world.tmp / 'dev'
    subprocess.run(['git', 'clone', '-q', world.url, str(d)], check=True)
    for k, v in (('user.name', 't'), ('user.email', 't@t'), ('gpg.format', 'ssh'), ('user.signingkey', str(world.keys['good']))):
        git(d, 'config', k, v)
    return d


def test_release_tags_signs_verifies_and_pushes(world, dev):
    assert run(update.release(dev, '1.0.0', 'first', world.l.signers)) == 'pulse-v1.0.0'
    assert 'pulse-v1.0.0' in git(world.remote, 'tag').stdout
    with pytest.raises(RuntimeError, match='not newer'):
        run(update.release(dev, '1.0.0', '', world.l.signers))
    with pytest.raises(ValueError):
        run(update.release(dev, 'one', '', world.l.signers))


def test_release_refuses_unpushed_work(world, dev):
    (dev / 'x').write_text('x')
    git(dev, 'add', 'x')
    git(dev, 'commit', '-qm', 'local only')
    with pytest.raises(RuntimeError, match='push it to master first'):
        run(update.release(dev, '1.0.0', '', world.l.signers))


def test_release_refuses_a_key_daemons_would_not_trust(world, dev):
    git(dev, 'config', 'user.signingkey', str(world.keys['evil']))
    with pytest.raises(RuntimeError, match='does not verify'):
        run(update.release(dev, '1.0.0', '', world.l.signers))
    assert git(dev, 'tag').stdout == '' and git(world.remote, 'tag').stdout == ''


def test_release_needs_ssh_signing(world, dev):
    git(dev, 'config', 'gpg.format', 'openpgp')
    with pytest.raises(RuntimeError, match='gpg.format ssh'):
        run(update.release(dev, '1.0.0', '', world.l.signers))


# ── end to end: a daemon run by pulse-launch updates itself and restarts into the new release ──────────────────────

import json
import site
import socket
import time


def ask(sock_path, cmd, **args):
    with socket.socket(socket.AF_UNIX) as s:
        s.settimeout(5)
        s.connect(str(sock_path))
        s.sendall((json.dumps({'cmd': cmd, **args}) + '\n').encode())
        with s.makefile() as f:
            return json.loads(f.readline())


def wait_for(what, timeout=60):
    end = time.time() + timeout
    while time.time() < end:
        try:
            if result := what():
                return result
        except (OSError, ValueError):
            pass
        time.sleep(0.3)
    raise AssertionError('timed out')


def test_an_update_restarts_the_daemon_into_the_new_release_and_keeps_its_pause(world, monkeypatch):
    w, home = world, world.tmp / 'user'
    l = update.Layout(home / '.local/share/sitekit', home / '.config/sitekit/allowed_signers')
    update.trust(l, w.keys['good'].with_suffix('.pub').read_text(), 'release')
    (l.venv / 'bin').mkdir(parents=True)
    (l.venv / 'bin' / 'python').symlink_to(sys.executable)
    config = home / '.config/sitekit/pulse.toml'
    config.write_text(w.config.read_text().replace('push = false', f'push = false\nremote = "{w.url}"'))
    tag(w, 'pulse-v1.0.0')
    run(update.bootstrap(l, w.url, config, log))
    run_dir = w.tmp / 'run'
    run_dir.mkdir()
    sock = run_dir / 'sitekit-pulse.sock'
    # PYTHONUSERBASE: with HOME moved, keep finding packages installed with pip --user (a real install has its venv)
    for k, v in {'HOME': str(home), 'XDG_RUNTIME_DIR': str(run_dir), 'PYTHONUSERBASE': site.getuserbase()}.items():
        monkeypatch.setenv(k, v)
    monkeypatch.setattr(pulse_ctl, 'SOCKET', sock)
    out = (w.tmp / 'daemon.log').open('w')
    daemon = subprocess.Popen([str(l.launch)], stdout=out, stderr=subprocess.STDOUT)
    try:
        first = wait_for(lambda: ask(sock, 'status'))
        assert first['version'] == 'pulse-v1.0.0'
        ask(sock, 'pause')
        commit(w)
        tag(w, 'pulse-v1.1.0')
        run(manage.upgrade(config, l))
        after = wait_for(lambda: (r := ask(sock, 'status'))['version'] == 'pulse-v1.1.0' and r)
        assert after['pid'] == first['pid']          # restarted in place by exec
        assert after['paused'] is True               # the pause survived the restart
        assert l.current_tag() == 'pulse-v1.1.0'
        wait_for(lambda: not l.pending.exists())     # the new release confirmed it started
        assert (home / '.config/systemd/user/sitekit-update.timer').exists()    # the new release's installer ran
    finally:
        daemon.terminate()
        daemon.wait(10)
        out.close()
    text = (w.tmp / 'daemon.log').read_text()
    assert 'release pulse-v1.1.0 started' in text and 'still paused' in text
