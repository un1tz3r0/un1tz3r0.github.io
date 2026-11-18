import sys
import time
from datetime import datetime
from types import ModuleType, SimpleNamespace

import pytest

from sitekit import browsing, pulse

C = {'deny': ['*.bank.*', 'github.com/me/secret*'],
     'publish': [{'match': 'github.com', 'level': 'page'}, {'match': '*.example.org', 'level': 'domain'}]}


@pytest.fixture
def db(tmp_path):
    return pulse.open_db(tmp_path / 'p.sqlite3')


def page(db, start, minutes, url, title=None):
    db.execute('insert into pages (start, end, url, title) values (?, ?, ?, ?)', (start, start + minutes * 60, url, title))


def today():
    return datetime.now().date().isoformat()


def midnight():
    return datetime.combine(datetime.now().date(), datetime.min.time()).timestamp()


@pytest.mark.parametrize('url, lv', [('https://github.com/me/site', 'page'), ('https://docs.example.org/x', 'domain'),
                                     ('https://example.org/', 'private'), ('https://news.example.com/', 'private'),
                                     ('https://www.bank.example/', 'private'), ('https://github.com/me/secret-repo', 'private'),
                                     ('file:///etc/passwd', 'private')])
def test_levels(url, lv):
    assert browsing.level(url, C) == lv


def test_default_level_and_allow_list():
    assert browsing.level('https://any.where/', {'default': 'domain'}) == 'domain'
    assert browsing.level('https://any.where/', {'default': 'domain', 'allow': ['github.com']}) == 'private'


def test_glob_is_literal_apart_from_stars():
    assert browsing.listed(['a.b'], 'https://a.b/') and not browsing.listed(['a.b'], 'https://axb/')


@pytest.mark.parametrize('c', [{'publish': [{'match': 'x', 'level': 'all'}]}, {'publish': [{'level': 'page'}]}, {'default': 'public'}])
def test_bad_rules_do_not_load(c):
    with pytest.raises(ValueError):
        browsing.check(c)


def test_report_publishes_only_what_rules_allow(db):
    t = midnight() + 3600
    page(db, t, 10, 'https://github.com/me/site', 'me/site')
    page(db, t + 600, 5, 'https://github.com/me/site/pulls', 'Pulls')
    page(db, t + 900, 7, 'https://docs.example.org/a', 'Secret title')
    page(db, t + 1400, 30, 'https://mail.private.net/inbox', 'Inbox')
    page(db, t + 3400, 20, 'https://github.com/me/secret-repo', 'secret')
    day = browsing.day_report(db, midnight(), C)[today()]
    assert day['domains'] == {'github.com': 15, 'docs.example.org': 7}
    assert day['visits'] == {'github.com': 2, 'docs.example.org': 1}
    assert day['pages'] == [{'url': 'https://github.com/me/site', 'title': 'me/site', 'minutes': 10},
                            {'url': 'https://github.com/me/site/pulls', 'title': 'Pulls', 'minutes': 5}]
    assert 'Secret title' not in str(day) and 'private.net' not in str(day) and 'secret' not in str(day)


def test_tightening_a_rule_applies_to_what_is_stored(db):
    page(db, midnight() + 60, 10, 'https://github.com/me/site')
    assert browsing.day_report(db, midnight(), C)
    assert browsing.day_report(db, midnight(), {**C, 'deny': ['github.com']}) == {}


def test_nothing_is_published_by_default(db):
    page(db, midnight() + 60, 10, 'https://github.com/me/site')
    assert browsing.day_report(db, midnight(), {}) == {}


def test_history_only_fills_days_without_the_extension(db):
    t = midnight() + 60
    db.execute('insert into history values (?, ?, ?)', (t - 86400, 'https://github.com/a', None))
    db.execute('insert into history values (?, ?, ?)', (t, 'https://github.com/b', None))
    page(db, t, 10, 'https://github.com/c')
    days = browsing.day_report(db, midnight() - 86400, C)
    assert days[today()]['visits'] == {'github.com': 1}
    assert list(days.values())[0] == {'visits': {'github.com': 1}}


@pytest.fixture
def fake_history(monkeypatch):
    now = time.time()
    rows = [SimpleNamespace(url='https://github.com/me/x?token=1#frag', title='x', last_visit=datetime.fromtimestamp(now - 60)),
            SimpleNamespace(url='https://www.bank.example/acct', title='bank', last_visit=datetime.fromtimestamp(now - 30)),
            SimpleNamespace(url='chrome://settings', title='s', last_visit=datetime.fromtimestamp(now - 10))]
    history, profiles = ModuleType('browserprofile.history'), ModuleType('browserprofile.profiles')
    history.extract_history = lambda profile: rows
    profiles.list_profiles = lambda: ['default']
    monkeypatch.setitem(sys.modules, 'browserprofile', ModuleType('browserprofile'))
    monkeypatch.setitem(sys.modules, 'browserprofile.history', history)
    monkeypatch.setitem(sys.modules, 'browserprofile.profiles', profiles)


def test_history_import_filters_strips_queries_and_resumes(db, fake_history):
    assert browsing.import_history(db, C) == 1
    assert db.execute('select url, title from history').fetchall() == [('https://github.com/me/x', 'x')]
    assert browsing.import_history(db, C) == 0


def test_history_import_keeps_no_titles_when_titles_are_off(db, fake_history):
    browsing.import_history(db, {**C, 'titles': False})
    assert db.execute('select title from history').fetchone() == (None,)


def test_history_import_without_browserprofile(db, monkeypatch):
    monkeypatch.setitem(sys.modules, 'browserprofile', None)
    assert browsing.import_history(db, C) == 0


# ── the [browser] filter, publish and site rules as rule lists ─────────────────────────────────────────────────────

def test_old_allow_and_deny_become_a_filter_where_deny_still_wins():
    old = {'allow': ['github.com'], 'deny': ['github.com']}
    assert browsing.filter_rules(old) == [{'match': 'github.com', 'action': 'deny', 'priority': '!'}, {'match': 'github.com'}]
    assert not browsing.recordable('https://github.com/x', old)
    assert not browsing.recordable('https://elsewhere.org/', old)       # an allow rule makes it an allow list


@pytest.mark.parametrize('url, kept', [('https://docs.example.com/a', True), ('https://example.com/', False),
                                       ('https://bank.example.com/', False), ('https://anything.org/', True)])
def test_filter_order_and_priority(url, kept):
    c = {'filter': [{'match': '*.example.com'}, {'match': 'example.com', 'action': 'deny'},
                    {'match': 'bank.*', 'action': 'deny', 'priority': '!'}, {'match': '*', 'priority': '?'}]}
    assert browsing.recordable(url, c) is kept


def test_publish_rules_with_negation_and_priority():
    c = {'publish': [{'match': '*.github.com', 'level': 'page'}, {'match': 'gist.github.com', 'level': 'page', 'action': 'deny', 'priority': '!'},
                     {'match': '*.github.com', 'level': 'domain', 'priority': '?'}, {'match': 'secret.github.com', 'action': 'deny', 'priority': '!'}],
         'default': 'domain'}
    assert [browsing.level(u, c) for u in ('https://api.github.com/', 'https://gist.github.com/', 'https://secret.github.com/',
                                           'https://other.org/')] == ['page', 'domain', 'private', 'domain']


def test_site_rules_and_their_older_form():
    assert browsing.site_rules({'sites': {'video': 'youtube', 'rules': [{'match': 'docs\\.', 'to': 'docs'}]}}) == \
        [{'match': 'docs\\.', 'to': 'docs'}, {'match': 'youtube', 'to': 'video'}]


@pytest.mark.parametrize('c', [{'filter': [{'match': 'x', 'action': 'block'}]}, {'publish': [{'match': 'x'}]},
                               {'publish': [{'match': 'x', 'level': 'page', 'priority': '!!'}]},
                               {'sites': {'rules': [{'match': '(', 'to': 'x'}]}}])
def test_bad_rules_are_refused(c):
    with pytest.raises(ValueError):
        browsing.check(c)
