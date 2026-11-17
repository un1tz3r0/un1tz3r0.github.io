import subprocess
import time
from pathlib import Path

import pytest

from sitekit import discover as d


def repo(path: Path, remote: str | None = None) -> Path:
    path.mkdir(parents=True)
    git = lambda *a: subprocess.run(['git', '-C', str(path), *a], check=True, capture_output=True)
    git('init', '-q')
    git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'x')
    if remote:
        git('remote', 'add', 'origin', remote)
    return path


def verdict(path, c=None, public=None, ids=None, t=None):
    f = d.Found(path, [], 'me/thing', touched=time.time(), created=time.time())
    d.decide(f, {'rules': [], **(c or {})}, {'me'}, public if public is not None else {'me/thing': ''}, ids or {}, t or time.time())
    return f


def test_duration():
    assert (d.duration('90d'), d.duration('1y'), d.duration(''), d.duration('60')) == (7776000, 31536000, 0, 60)
    with pytest.raises(ValueError):
        d.duration('soon')


def test_scan_stops_at_repos_and_depth_and_skips_submodules(tmp_path):
    a = repo(tmp_path / 'a')
    repo(a / 'nested')
    deep = repo(tmp_path / 'x' / 'y' / 'z')
    (tmp_path / 'sub').mkdir()
    (tmp_path / 'sub' / '.git').write_text('gitdir: elsewhere')
    assert d.scan([tmp_path], 2) == [a]
    assert sorted(d.scan([tmp_path], 3)) == [a, deep]


@pytest.mark.parametrize('url', ['git@github.com:me/thing.git', 'https://github.com/me/thing.git', 'https://github.com/me/thing',
                                 'ssh://git@github.com/me/thing.git'])
def test_github_urls(url):
    m = d.GITHUB.search(url)
    assert (m[1], m[2]) == ('me', 'thing')


def test_inspect_prefers_your_remote(tmp_path):
    import asyncio
    p = repo(tmp_path / 'a', 'https://github.com/other/thing.git')
    subprocess.run(['git', '-C', str(p), 'remote', 'add', 'fork', 'git@github.com:me/thing.git'], check=True)
    f = asyncio.run(d.inspect(p, {'me'}))
    assert f.repo == 'me/thing' and f.touched > 0 and f.created > 0


def test_inspect_uses_the_push_url(tmp_path):
    import asyncio
    p = repo(tmp_path / 'a', 'https://github.com/upstream/thing.git')
    subprocess.run(['git', '-C', str(p), 'remote', 'set-url', '--push', 'origin', 'git@github.com:me/thing.git'], check=True)
    assert asyncio.run(d.inspect(p, {'me'})).repo == 'me/thing'


def test_not_yours_private_and_no_remote(tmp_path):
    f = d.Found(tmp_path, [], 'other/thing')
    d.decide(f, {}, {'me'}, {}, {}, 0)
    assert f.id is None and 'not yours' in f.why
    assert verdict(tmp_path, public={}).id is None      # private: not in the public listing
    f = d.Found(tmp_path, [])
    d.decide(f, {}, {'me'}, {}, {}, 0)
    assert f.why == 'no GitHub remote'


def test_public_only_off_skips_the_listing(tmp_path):
    f = d.Found(tmp_path, [], 'me/thing', touched=time.time())
    d.decide(f, {}, {'me'}, None, {}, time.time())
    assert f.id == 'thing'


def test_limits_and_allow_exempts_from_them(tmp_path):
    year = 365 * 86400
    t = time.time() + 2 * year
    assert 'untouched' in verdict(tmp_path, {'max_idle': '90d'}, t=t).why
    assert 'created' in verdict(tmp_path, {'max_age': '1y'}, t=t).why
    allow = {'max_idle': '90d', 'max_age': '1y', 'rules': [{'action': 'allow', 'when': 'name', 'value': '*'}]}
    assert verdict(tmp_path, allow, t=t).id


def test_allow_never_overrides_public_only(tmp_path):
    allow = {'rules': [{'action': 'allow', 'when': 'name', 'value': '*'}]}
    assert verdict(tmp_path, allow, public={}).id is None


def test_github_creation_date_wins(tmp_path):
    f = verdict(tmp_path, {'max_age': '30d'}, public={'me/thing': '2001-01-01'})
    assert 'created' in f.why


def test_id_comes_from_projects_json(tmp_path):
    assert verdict(tmp_path, ids={'me/thing': 'site'}).id == 'site'


@pytest.mark.parametrize('when,value,hit', [
    ('dir', 'src', True), ('dir', 'nope', False), ('no-dir', 'nope', True), ('no-dir', 'src', False),
    ('file', '.keep', True), ('file', '*.toml', False), ('no-file', '.keep', False), ('no-file', '.nope', True),
    ('remote', '*github.com/me/*', True), ('remote', '*gitlab*', False), ('no-remote', '*gitlab*', True),
    ('name', 'pro*', True), ('name', 'x*', False), ('path', '*/proj', True),
])
def test_conditions(tmp_path, when, value, hit):
    p = tmp_path / 'proj'
    (p / 'src').mkdir(parents=True)
    (p / '.keep').write_text('')
    assert d.CONDITIONS[when][1](p, ['https://github.com/me/x.git'], value) is hit


def test_first_rule_wins(tmp_path):
    rules = [{'action': 'allow', 'when': 'name', 'value': '*'}, {'action': 'deny', 'when': 'name', 'value': '*'}]
    assert verdict(tmp_path, {'rules': rules}).id
    assert 'denied' in verdict(tmp_path, {'rules': rules[::-1]}).why
