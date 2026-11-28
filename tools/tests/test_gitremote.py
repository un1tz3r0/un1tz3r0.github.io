import asyncio
import json
import subprocess

import pytest

from sitekit import common, gitremote

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


def stale_edit(two):
    """b has an uncommitted edit to feed, and the remote has since changed feed too: the rebase onto it works, but
    the edit can't re-apply on top."""
    remote, a, b = two
    commit(a, 'feed', 'base')
    run(gitremote.push(a))
    git('pull', '-q', cwd=b)
    commit(a, 'feed', 'theirs')
    run(gitremote.push(a))
    commit(b, 'mine')
    (b / 'feed').write_text('my uncommitted post')
    return b


def test_uncommitted_changes_that_conflict_with_the_pull_are_kept_as_they_were(two):
    """Left to git, this leaves conflict markers and a stash behind, and every later autostash fails. pull must put
    the checkout back instead, and say which files are in the way."""
    b = stale_edit(two)
    head = git('rev-parse', 'HEAD', cwd=b)
    with pytest.raises(RuntimeError, match='uncommitted changes to feed'):
        run(gitremote.pull(b))
    assert git('rev-parse', 'HEAD', cwd=b) == head
    assert (b / 'feed').read_text() == 'my uncommitted post'
    assert git('ls-files', '-u', cwd=b) == '' and git('stash', 'list', cwd=b) == ''
    assert git('status', '--porcelain', cwd=b) == 'M feed'


def test_a_checkout_left_with_conflicts_is_refused_with_the_file_names(two):
    b = stale_edit(two)
    git('fetch', '-q', cwd=b)
    git('rebase', '-q', '--autostash', 'origin/master', cwd=b)     # what an older pull left behind
    assert git('ls-files', '-u', cwd=b)
    with pytest.raises(RuntimeError, match='unresolved conflicts in feed'):
        run(gitremote.pull(b))


def test_clone_tries_routes_too(tmp_path, two):
    remote, *_ = two
    run(gitremote.clone(str(remote), tmp_path / 'c', '--sparse'))
    assert (tmp_path / 'c' / '.git').exists()


def test_generated_json_from_two_writers_merges_instead_of_conflicting(two):
    remote, a, b = two
    day = lambda **days: json.dumps({'machine': 'fay', 'days': days}, indent=1) + '\n'
    commit(a, 'usage.json', day(d1={'n': 1}))
    (a / 'data' / 'claude-usage').mkdir(parents=True)
    git('mv', 'usage.json', 'data/claude-usage/fay.json', cwd=a)
    git('commit', '-qm', 'move', cwd=a)
    run(gitremote.push(a))
    run(gitremote.pull(b))
    usage = 'data/claude-usage/fay.json'
    commit(a, usage, day(d1={'n': 1}, d2={'n': 2}))
    run(gitremote.push(a))
    commit(b, usage, day(d1={'n': 5}, d3={'n': 3}))
    run(gitremote.push(b))      # rejected, then rebased with the JSON driver, then pushed
    assert json.loads((b / usage).read_text())['days'] == {'d1': {'n': 5}, 'd2': {'n': 2}, 'd3': {'n': 3}}
    assert git('rev-parse', 'master', cwd=remote) == git('rev-parse', 'HEAD', cwd=b)


def test_a_rejected_push_is_not_tried_by_other_routes():
    tried = []

    async def op(url, opts, env):
        tried.append(url)
        raise RuntimeError(' ! [rejected]        HEAD -> master (non-fast-forward)')
    with pytest.raises(gitremote.Rejected):
        run(gitremote.attempt('git@github.com:me/site.git', op))
    assert len(tried) == 1


def test_an_unknown_github_host_key_is_trusted_and_the_route_retried(monkeypatch):
    calls, trusted = [], []

    async def trust(log=None):
        trusted.append(1)
        return True

    async def op(url, opts, env):
        calls.append(url)
        if len(calls) == 1:
            raise RuntimeError('Host key verification failed.\nfatal: Could not read from remote repository.')
        return 'ok'
    monkeypatch.setattr(gitremote, 'trust_github', trust)
    assert run(gitremote.attempt('git@github.com:me/site.git', op)) == 'ok'
    assert calls == ['git@github.com:me/site.git'] * 2 and trusted == [1]


def test_known_hosts_gets_exactly_githubs_keys(tmp_path, monkeypatch):
    keys = ['ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl']

    async def published():
        return keys
    monkeypatch.setattr(gitremote, 'github_host_keys', published)
    hosts = tmp_path / 'ssh' / 'known_hosts'
    hosts.parent.mkdir()
    hosts.write_text('example.org ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBzWhC3Xu5u9qJ2W3dn0wzvDjD3VZ2XbhZq2dtL2GS2h\n'
                     'github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==\n')
    assert run(gitremote.trust_github(path=hosts))
    lines = hosts.read_text().splitlines()
    assert lines[0].startswith('example.org') and lines[1:] == [f'github.com {keys[0]}']
    assert not run(gitremote.trust_github(path=hosts))


def test_git_errors_keep_whole_lines_and_drop_hints():
    err = ' ! [rejected]        HEAD -> master (non-fast-forward)\nerror: failed to push\nhint: Updates were rejected\n'
    with pytest.raises(RuntimeError) as e:
        run(common.run('sh', '-c', f'printf %s "{err}" >&2; exit 1'))
    assert str(e.value) == 'sh: ! [rejected]        HEAD -> master (non-fast-forward)\nerror: failed to push'
    assert common.label(['git', '-C', '/x', '-c', 'a=b', 'push', '--quiet']) == 'git push'
