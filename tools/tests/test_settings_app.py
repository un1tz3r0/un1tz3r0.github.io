import shutil
import stat
import tomllib
from pathlib import Path

import pytest

pytest.importorskip('gi')
try:
    from sitekit import conversations, pulse, settings_app
    from gi.repository import Adw, Gtk
    if not Gtk.init_check():
        raise RuntimeError('no display')
    Adw.init()
except (ImportError, ValueError, RuntimeError) as e:
    pytest.skip(f'GTK 4 and libadwaita with a display are needed: {e}', allow_module_level=True)

SITE_TOML = Path(__file__).resolve().parent.parent.parent / 'site.toml'


class NoDaemon:
    def __init__(self, on_event, on_update=None):
        pass

    def send(self, cmd, **args):
        return False


@pytest.fixture
def env(tmp_path, monkeypatch):
    site = tmp_path / 'site'
    site.mkdir()
    shutil.copy(SITE_TOML, site / 'site.toml')
    monkeypatch.setattr(settings_app, 'CONFIG', tmp_path / 'pulse.toml')
    monkeypatch.setattr(settings_app, 'Link', NoDaemon)
    monkeypatch.setattr(conversations, 'KEY_FILE', tmp_path / 'anthropic.key')
    return tmp_path


def window(env, config=None):
    if config is not None:
        (env / 'pulse.toml').write_text(config)
    w = settings_app.Window(None)
    w.toasts_seen = []
    w.toast = w.toasts_seen.append
    return w


def config(env, extra=''):
    return f'site = "{env / "site"}"\ndb = "{env / "p.sqlite3"}"\n# keep me\n[discover]\nenabled = false\n{extra}'


def test_first_run_starts_the_walkthrough_and_finish_saves(env):
    w = window(env)
    assert (env / 'pulse.toml').exists() and w.bar.get_revealed()
    assert w.stack.get_visible_child_name() == 'site' and w.progress.get_label() == 'Step 1 of 5: Site'
    for _ in settings_app.TOUR[1:]:
        w.step(1)
    assert w.stack.get_visible_child_name() == 'pulse' and w.next.get_label() == 'Save and Finish'
    w.step(1)
    assert not w.bar.get_revealed() and w.toasts_seen


def test_an_existing_config_opens_without_the_walkthrough(env):
    assert not window(env, config(env)).bar.get_revealed()


def test_saving_unchanged_settings_writes_nothing(env):
    w = window(env, config(env))
    before = (env / 'pulse.toml').read_text(), (env / 'site' / 'site.toml').read_text()
    w.save()
    assert w.toasts_seen == ['Nothing to save']
    assert ((env / 'pulse.toml').read_text(), (env / 'site' / 'site.toml').read_text()) == before


def test_site_edits_keep_comments_and_feeds(env):
    w = window(env, config(env))
    w.github['user'].set_text('someone')
    w.feeds.put({'url': 'https://c/feed', 'source': 'c', 'kind': 'status'})
    w.feeds.put({'url': '', 'source': 'half typed'})
    w.save()
    text = (env / 'site' / 'site.toml').read_text()
    doc = tomllib.loads(text)
    assert doc['github']['user'] == 'someone' and doc['feeds'][-1] == {'url': 'https://c/feed', 'source': 'c', 'kind': 'status'}
    assert len(doc['feeds']) == len(tomllib.loads(SITE_TOML.read_text())['feeds']) + 1
    assert '# Big files' in text and doc['claude'] == tomllib.loads(SITE_TOML.read_text())['claude']


def test_new_pulse_options_round_trip_through_the_daemon_config(env):
    w = window(env, config(env))
    w.limits['max_idle'].set_text('90d')
    w.rules.put({'action': 'deny', 'when': 'name', 'value': 'scratch*'})
    w.publish_rules.put({'match': 'github.com', 'level': 'page'})
    w.history.set_active(True)
    w.claude['code'].set_selected(conversations.LEVELS.index('titles'))
    w.save()
    text = (env / 'pulse.toml').read_text()
    assert '# keep me' in text
    s = pulse.Settings.load(env / 'pulse.toml')
    assert s.max_idle == 90 * 86400 and s.rules == [{'action': 'deny', 'when': 'name', 'value': 'scratch*'}]
    assert s.browser['publish'] == [{'match': 'github.com', 'level': 'page'}] and s.browser['history'] is True
    assert s.claude == {'code': 'titles'}


def test_a_bad_duration_is_not_saved(env):
    w = window(env, config(env))
    before = (env / 'pulse.toml').read_text()
    w.limits['max_age'].set_text('soon')
    w.save()
    assert w.toasts_seen[0].startswith('Not saved') and (env / 'pulse.toml').read_text() == before


def test_api_key_is_saved_privately_and_cleared_from_the_form(env):
    w = window(env, config(env))
    w.key.set_text('sk-ant-test')
    w.save()
    path = conversations.KEY_FILE
    assert path.read_text() == 'sk-ant-test\n' and stat.S_IMODE(path.stat().st_mode) == 0o600 and w.key.get_text() == ''


def test_without_a_site_checkout_the_site_tab_says_so(env):
    w = window(env, config(env).replace(str(env / 'site'), str(env / 'missing')))
    assert w.site_cfg is None and w.site_values() == []


def test_an_update_reopens_the_window_only_without_unsaved_edits(env, monkeypatch):
    restarted = []
    monkeypatch.setattr(settings_app, 'restart', restarted.append)
    w = window(env, config(env))
    w.updated('pulse-v1.1.0')
    assert restarted == ['pulse-v1.1.0']
    w.github['user'].set_text('changed')
    w.updated('pulse-v1.2.0')
    assert restarted == ['pulse-v1.1.0'] and 'Save, then reopen' in w.toasts_seen[-1]
