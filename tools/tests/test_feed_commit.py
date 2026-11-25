"""The feed commands commit what they change in the site checkout, and nothing else, so no pull ever has to stash them."""
import asyncio
import json
import subprocess

import pytest

from sitekit import __main__ as cli, gitremote

WHEN = '2026-11-20T12:00:00Z'


def git(*args, cwd=None):
    return subprocess.run(['git', *args], cwd=cwd, check=True, capture_output=True, text=True).stdout.strip()


def sitekit(site, *args):
    cli.main(['--site', str(site), *args])


def log(site):
    return git('log', '--format=%s', cwd=site).splitlines()


def changed(site):
    return git('show', '--name-status', '--format=', 'HEAD', cwd=site).splitlines()


@pytest.fixture
def site(tmp_path):
    """A site checkout with one commit and a remote, like the one pulse clones."""
    remote = tmp_path / 'remote.git'
    git('init', '-q', '--bare', '-b', 'master', str(remote))
    path = tmp_path / 'site'
    git('clone', '-q', str(remote), str(path))
    git('switch', '-qc', 'master', cwd=path)
    for k, v in (('user.email', 't@t'), ('user.name', 't')):
        git('config', k, v, cwd=path)
    (path / 'site.toml').write_text('')
    (path / 'data').mkdir()
    (path / 'data' / 'projects.json').write_text('{}\n')
    git('add', '.', cwd=path)
    git('commit', '-qm', 'first', cwd=path)
    git('push', '-q', 'origin', 'master', cwd=path)
    return path


def test_status_commits_the_feed_files_and_only_those(site):
    (site / 'data' / 'projects.json').write_text('{"staged": true}\n')
    git('add', 'data/projects.json', cwd=site)
    (site / 'notes.txt').write_text('untracked')
    sitekit(site, 'status', 'hello', '--time', WHEN)
    assert log(site)[0].startswith('status: ') and len(log(site)) == 2
    assert sorted(changed(site)) == ['A\tdata/feed/2026-11.json', 'A\tdata/feed/index.json']
    # what was already staged stays staged and uncommitted; untracked files stay untracked
    assert git('status', '--porcelain', cwd=site).splitlines() == ['M  data/projects.json', '?? notes.txt']


def test_running_it_again_commits_nothing(site):
    sitekit(site, 'status', 'hello', '--time', WHEN)
    sitekit(site, 'status', 'hello', '--time', WHEN)
    assert len(log(site)) == 2 and git('status', '--porcelain', cwd=site) == ''


def test_post_and_rm(site, tmp_path):
    body = tmp_path / 'post.md'
    body.write_text('words')
    sitekit(site, 'post', 'A title', str(body), '--time', WHEN)
    assert log(site)[0] == 'post: A title'
    entry = json.loads((site / 'data' / 'feed' / '2026-11.json').read_text())['entries'][0]['id']
    sitekit(site, 'rm', entry)
    assert log(site)[0] == f'feed: rm {entry}'
    assert sorted(changed(site)) == ['D\tdata/feed/2026-11.json', 'M\tdata/feed/index.json']
    assert git('status', '--porcelain', cwd=site) == ''
    sitekit(site, 'rm', entry)          # nothing to remove: no commit
    assert log(site)[0] == f'feed: rm {entry}' and len(log(site)) == 3


def test_media_is_committed_with_its_entry_even_in_a_sparse_checkout(site, tmp_path):
    git('sparse-checkout', 'set', 'data', cwd=site)      # what pulse clones: data/ only
    picture = tmp_path / 'Print.JPG'
    picture.write_bytes(b'jpeg')
    sitekit(site, 'media', str(picture), 'first pass', '--time', WHEN)
    assert log(site)[0] == 'media: Print.JPG'
    assert sorted(changed(site)) == ['A\tdata/feed/2026-11.json', 'A\tdata/feed/index.json', 'A\tmedia/2026/11/print.jpg']


def test_no_commit_leaves_the_changes_in_the_checkout(site):
    sitekit(site, '--no-commit', 'status', 'hello', '--time', WHEN)
    assert log(site) == ['first'] and git('status', '--porcelain', cwd=site) == '?? data/feed/'


def test_a_site_that_is_not_a_git_checkout_just_gets_the_files(tmp_path):
    (tmp_path / 'site.toml').write_text('')
    sitekit(tmp_path, 'status', 'hello', '--time', WHEN)
    assert (tmp_path / 'data' / 'feed' / 'index.json').exists()


def test_a_commit_that_fails_says_the_feed_was_saved(site, capsys):
    git('config', 'core.hooksPath', str(site / 'hooks'), cwd=site)
    (site / 'hooks').mkdir()
    (site / 'hooks' / 'pre-commit').write_text('#!/bin/sh\nexit 1\n')
    (site / 'hooks' / 'pre-commit').chmod(0o755)
    sitekit(site, 'status', 'hello', '--time', WHEN)
    assert 'saved but not committed' in capsys.readouterr().err
    assert log(site) == ['first'] and (site / 'data' / 'feed' / '2026-11.json').exists()


def test_ahead_counts_what_pulse_still_has_to_push(site):
    assert asyncio.run(gitremote.ahead(site)) == 0
    sitekit(site, 'status', 'hello', '--time', WHEN)
    assert asyncio.run(gitremote.ahead(site)) == 1
    asyncio.run(gitremote.push(site))
    assert asyncio.run(gitremote.ahead(site)) == 0


def test_a_committed_status_survives_a_pull_that_changes_other_files(site, tmp_path):
    other = tmp_path / 'other'
    git('clone', '-q', str(tmp_path / 'remote.git'), str(other))
    for k, v in (('user.email', 't@t'), ('user.name', 't')):
        git('config', k, v, cwd=other)
    (other / 'data' / 'github.json').write_text('{}\n')
    git('add', '.', cwd=other)
    git('commit', '-qm', 'refresh', cwd=other)
    git('push', '-q', cwd=other)
    sitekit(site, 'status', 'hello', '--time', WHEN)
    asyncio.run(gitremote.pull(site))
    assert log(site) == [log(site)[0], 'refresh', 'first'] and git('status', '--porcelain', cwd=site) == ''
