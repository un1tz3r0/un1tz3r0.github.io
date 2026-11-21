import asyncio
import subprocess

import pytest

from sitekit import gitremote

run = asyncio.run


@pytest.fixture(autouse=True)
def fresh(monkeypatch):
    monkeypatch.setattr(gitremote, 'WORKED', {})
    monkeypatch.setattr(gitremote.shutil, 'which', lambda name: '/usr/bin/gh')


def names(url):
    return [r[0] for r in gitremote.routes(url)]


def test_ssh_first_then_https_then_the_gh_login():
    routes = gitremote.routes('git@github.com:me/site.git')
    assert [(n, u) for n, u, _ in routes] == [('ssh', 'git@github.com:me/site.git'), ('https', 'https://github.com/me/site.git'),
                                              ('https with gh login', 'https://github.com/me/site.git')]
    assert routes[2][2] == gitremote.GH_LOGIN and routes[0][2] == routes[1][2] == []


def test_an_https_remote_keeps_its_own_order():
    assert names('https://github.com/me/site') == ['https', 'ssh', 'https with gh login']
    assert names('ssh://git@github.com/me/site.git/') == ['ssh', 'https', 'https with gh login']


def test_no_gh_no_gh_route(monkeypatch):
    monkeypatch.setattr(gitremote.shutil, 'which', lambda name: None)
    assert names('git@github.com:me/site.git') == ['ssh', 'https']


def test_other_hosts_are_used_as_they_are():
    assert gitremote.routes('/srv/git/site.git') == [('as configured', '/srv/git/site.git', [])]
    assert names('git@gitlab.com:me/site.git') == ['as configured']


def test_falls_through_to_the_first_route_that_works_and_starts_there_next_time():
    tried, logged = [], []

    async def op(url, opts, env):
        tried.append((url, bool(opts)))
        assert env.get('GIT_SSH_COMMAND', gitremote.SSH) == gitremote.SSH
        if not opts:
            raise RuntimeError('denied')
        return 'ok'

    url = 'git@github.com:me/site.git'
    assert run(gitremote.attempt(url, op, lambda text, kind=None: logged.append(kind))) == 'ok'
    assert tried == [(url, False), ('https://github.com/me/site.git', False), ('https://github.com/me/site.git', True)]
    assert logged == ['warning'] and names(url)[0] == 'https with gh login'


def test_every_error_is_reported_when_nothing_works():
    async def op(url, opts, env):
        raise RuntimeError(f'no {url}')
    with pytest.raises(RuntimeError, match=r'(?s)ssh: no git@.*https: no https.*gh login: no https'):
        run(gitremote.attempt('git@github.com:me/site.git', op))


# ── against a real (local) remote ────────────────────────────────────────────────────────────────────────────

def git(*args, cwd=None):
    return subprocess.run(['git', *args], cwd=cwd, check=True, capture_output=True, text=True).stdout.strip()


def checkout(tmp_path, remote, name):
    path = tmp_path / name
    git('clone', '-q', str(remote), str(path))
    git('config', 'user.email', 't@t', cwd=path)
    git('config', 'user.name', 't', cwd=path)
    return path


def commit(path, name, text='x'):
    (path / name).write_text(text)
    git('add', name, cwd=path)
    git('commit', '-qm', name, cwd=path)


@pytest.fixture
def two(tmp_path):
    remote = tmp_path / 'remote.git'
    git('init', '-q', '--bare', '-b', 'master', str(remote))
    a = checkout(tmp_path, remote, 'a')
    git('switch', '-qc', 'master', cwd=a)
    commit(a, 'first')
    git('push', '-q', 'origin', 'master', cwd=a)
    return remote, a, checkout(tmp_path, remote, 'b')


def test_push_and_pull_keep_the_tracking_branch(two):
    remote, a, b = two
    commit(a, 'second')
    run(gitremote.push(a))
    assert git('rev-parse', 'master', cwd=remote) == git('rev-parse', 'HEAD', cwd=a) == git('rev-parse', 'origin/master', cwd=a)
    (b / 'scratch').write_text('uncommitted')
    commit(b, 'third')
    run(gitremote.pull(b))
    assert git('log', '--format=%s', cwd=b).split() == ['third', 'second', 'first']
    assert (b / 'scratch').read_text() == 'uncommitted'


def test_a_conflicting_pull_leaves_the_checkout_as_it_was(two):
    remote, a, b = two
    commit(a, 'same', 'theirs')
    run(gitremote.push(a))
    commit(b, 'same', 'ours')
    head = git('rev-parse', 'HEAD', cwd=b)
    with pytest.raises(RuntimeError):
        run(gitremote.pull(b))
    assert git('rev-parse', 'HEAD', cwd=b) == head and not (b / '.git' / 'rebase-merge').exists()
    assert git('status', '--porcelain', cwd=b) == ''


def test_clone_tries_routes_too(tmp_path, two):
    remote, *_ = two
    run(gitremote.clone(str(remote), tmp_path / 'c', '--sparse'))
    assert (tmp_path / 'c' / '.git').exists()
