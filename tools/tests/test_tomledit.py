import tomllib
from pathlib import Path

import pytest

from sitekit import tomledit

SITE = '''# top comment
[github]
user = "me"  # inline
ignore = []

# Feeds, one table each.
[[feeds]]
url = "https://a/feed"
source = "a"
kind = "lj"

[[feeds]]
url = "https://b/feed"
source = "b"

# Big files live outside the repo.
[media]
base = ""
'''


def edit(tmp_path, changes, text=SITE):
    path = tmp_path / 'site.toml'
    path.write_text(text)
    tomledit.edit(path, changes)
    return path.read_text()


def test_unchanged_file_round_trips(tmp_path):
    assert edit(tmp_path, []) == SITE


def test_comments_survive_scalar_edits(tmp_path):
    out = edit(tmp_path, [('github', 'user', 'you')])
    assert 'user = "you"  # inline' in out and '# top comment' in out and '# Big files' in out


def test_rewriting_feeds_keeps_the_comments_around_them(tmp_path):
    rows = [{'url': 'https://c/feed', 'source': 'c'}, {'url': 'https://a/feed', 'source': 'a', 'kind': 'lj'}]
    out = edit(tmp_path, [('', 'feeds', rows)])
    assert tomllib.loads(out)['feeds'] == rows
    assert out.index('# Feeds, one table each.') < out.index('[[feeds]]') < out.index('# Big files') < out.index('[media]')
    assert '\n\n\n' not in out


def test_removing_a_field_from_a_feed(tmp_path):
    out = edit(tmp_path, [('', 'feeds', [{'url': 'https://a/feed', 'source': 'a'}])])
    assert tomllib.loads(out)['feeds'] == [{'url': 'https://a/feed', 'source': 'a'}]


def test_removing_every_feed(tmp_path):
    for value in ([], None):
        out = edit(tmp_path, [('', 'feeds', value)])
        assert 'feeds' not in tomllib.loads(out) and '[media]' in out


def test_array_of_tables_inside_a_table(tmp_path):
    text = '[discover]\nenabled = true\n\n[[discover.rules]]\naction = "deny"\nwhen = "name"\nvalue = "x"\n\n[apps]\n'
    out = edit(tmp_path, [('discover', 'rules', [{'action': 'allow', 'when': 'name', 'value': 'y'}])], text)
    assert tomllib.loads(out)['discover'] == {'enabled': True, 'rules': [{'action': 'allow', 'when': 'name', 'value': 'y'}]}


def test_rows_without_existing_tables_are_written_inline(tmp_path):
    out = edit(tmp_path, [('browser', 'publish', [{'match': 'github.com', 'level': 'page'}])], '[browser]\ntitles = true\n')
    assert tomllib.loads(out)['browser']['publish'] == [{'match': 'github.com', 'level': 'page'}]


def test_false_is_written_and_none_removes(tmp_path):
    out = edit(tmp_path, [('github', 'forks', False), ('media', 'base', None)])
    doc = tomllib.loads(out)
    assert doc['github']['forks'] is False and 'base' not in doc['media']


def test_new_table(tmp_path):
    assert tomllib.loads(edit(tmp_path, [('claude', 'code', 'counts')]))['claude'] == {'code': 'counts'}


def test_example_config_loads():
    tomllib.loads((Path(tomledit.__file__).parent.parent / 'pulse.example.toml').read_text())


def test_site_toml_round_trips_through_a_feeds_rewrite(tmp_path):
    text = (Path(tomledit.__file__).parent.parent.parent / 'site.toml').read_text()
    feeds = tomllib.loads(text)['feeds']
    assert edit(tmp_path, [('', 'feeds', feeds)], text) == text


def test_broken_edits_are_refused(tmp_path):
    path = tmp_path / 'x.toml'
    path.write_text('a = 1\n')
    with pytest.raises(TypeError):
        tomledit.edit(path, [('', 'a', object())])
    assert path.read_text() == 'a = 1\n'


def test_comments_with_quotes_survive(tmp_path):
    text = 'root = "~"          # e.g. "~/Projects"\ndepth = 0  # \'levels\'\nurl = "a#b"  # c\nplain = 1\n'
    out = edit(tmp_path, [('', 'root', '~/prj'), ('', 'depth', 1), ('', 'url', 'x#y'), ('', 'plain', 2)], text)
    assert out == 'root = "~/prj"          # e.g. "~/Projects"\ndepth = 1  # \'levels\'\nurl = "x#y"  # c\nplain = 2\n'
