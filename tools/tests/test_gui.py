import tomllib

import pytest

pytest.importorskip('gi')
try:
    from sitekit import gui
except (ImportError, ValueError):
    pytest.skip('GTK 4 and libadwaita are not available', allow_module_level=True)

SITE = '''# top comment
[github]
user = "me"  # inline

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


def store(tmp_path, text=SITE):
    p = tmp_path / 'x.toml'
    p.write_text(text)
    return gui.Store(p)


def saved(s):
    s.save()
    return s.path.read_text()


def test_unchanged_file_round_trips(tmp_path):
    assert saved(store(tmp_path)) == SITE


def test_comments_survive_scalar_edits(tmp_path):
    s = store(tmp_path)
    s.set('github.user', 'you')
    out = saved(s)
    assert '# top comment' in out and '# inline' in out and tomllib.loads(out)['github']['user'] == 'you'


def test_editing_feeds_keeps_the_comment_after_them(tmp_path):
    s = store(tmp_path)
    s.set('feeds', [{'url': 'https://a/feed', 'source': 'a', 'kind': 'lj'}, {'url': 'https://b/feed', 'source': 'b'}, {'url': 'https://c/feed'}])
    out = saved(s)
    assert '# Big files live outside the repo.' in out
    assert [f['url'][8] for f in tomllib.loads(out)['feeds']] == ['a', 'b', 'c']


def test_removing_a_field_from_a_table_row(tmp_path):
    s = store(tmp_path)
    s.set('feeds', [{'url': 'https://a/feed', 'source': 'a'}])
    assert tomllib.loads(saved(s))['feeds'] == [{'url': 'https://a/feed', 'source': 'a'}]


def test_empty_value_removes_the_key(tmp_path):
    s = store(tmp_path)
    s.set('media.base', '')
    assert 'base' not in tomllib.loads(saved(s))['media']


def test_false_is_written(tmp_path):
    s = store(tmp_path)
    s.set('github.forks', False)
    assert tomllib.loads(saved(s))['github']['forks'] is False


def test_map_edits_in_place(tmp_path):
    s = store(tmp_path, '[apps]\n# keep me\ncode = "vim"\nold = "x"\n')
    s.set('apps', {'code': 'emacs', 'new': 'y'})
    out = saved(s)
    assert '# keep me' in out and tomllib.loads(out)['apps'] == {'code': 'emacs', 'new': 'y'}


def test_new_nested_key_creates_its_table(tmp_path):
    s = store(tmp_path, '')
    s.set('discover.rules', [{'action': 'deny', 'when': 'dir', 'value': 'x'}])
    assert tomllib.loads(saved(s))['discover']['rules'][0]['value'] == 'x'


def test_template_loads(tmp_path):
    assert gui.Store(tmp_path / 'new.toml', gui.TEMPLATE.read_text()).get('discover.enabled') is True


def test_check_catches_what_would_crash_the_daemon(tmp_path):
    s = store(tmp_path, '[apps]\nbad = "("\n')
    assert 'bad' in gui.check(s)
    s = store(tmp_path, '[discover]\nmax_idle = "soon"\n')
    assert 'soon' in gui.check(s)
    assert gui.check(store(tmp_path, '[discover]\nmax_idle = "6m"\n')) is None


def test_every_page_uses_known_conditions():
    for page in gui.PAGES:
        for group in page.groups:
            for item in group.items:
                if isinstance(item, gui.Field) and item.kind == 'choice':
                    assert item.default in item.choices
