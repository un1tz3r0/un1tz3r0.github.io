import io
import json
import struct
import time
from pathlib import Path
from types import SimpleNamespace

import pytest

from sitekit import pulse, web

RULES = {'rules': [{'action': 'drop', 'when': 'domain', 'value': 'bank.example'},
                   {'action': 'private', 'when': 'url', 'value': 'https://github.com/me/secret*'},
                   {'action': 'page', 'when': 'domain', 'value': 'public.example'},
                   {'action': 'domain', 'when': 'domain', 'value': 'github.com'}]}


@pytest.fixture
def db(tmp_path):
    return pulse.open_db(tmp_path / 'p.sqlite3')


def events(db, c, *evs, start=None):
    start = start or time.time() - 3600
    for i, ev in enumerate(evs):
        web.store(db, {'t': (start + ev[0]) * 1000, 'kind': ev[1], 'url': ev[2] if len(ev) > 2 else None, 'title': ev[3] if len(ev) > 3 else None}, c)
    return start


def test_db_is_private(tmp_path):
    pulse.open_db(tmp_path / 'p.sqlite3')
    assert (tmp_path / 'p.sqlite3').stat().st_mode & 0o777 == 0o600


def test_clean_strips_query_and_fragment():
    assert web.clean('https://a.b/c?token=1#x', False) == 'https://a.b/c'
    assert web.clean('https://a.b/c?q=1#x', True) == 'https://a.b/c?q=1'


def test_domain_rule_covers_subdomains_only():
    r = {'rules': [{'action': 'drop', 'when': 'domain', 'value': 'bank.example'}]}
    assert web.classify('https://www.bank.example/', None, r) == 'drop'
    assert web.classify('https://a.bank.example/', None, r) == 'drop'
    assert web.classify('https://notbank.example/', None, r) is None


def test_title_rule_ignores_case():
    r = {'rules': [{'action': 'drop', 'when': 'title', 'value': '*invoice*'}]}
    assert web.classify('https://a/', 'My INVOICE', r) == 'drop'


def test_dropped_pages_are_never_stored(db):
    events(db, RULES, (0, 'focus', 'https://bank.example/acct', 'balance'), (1, 'nav', 'https://bank.example/x'), (2, 'title', 'https://bank.example/x', 'y'))
    assert db.execute('select count(*) from web_events where url is not null').fetchone()[0] == 0
    assert db.execute("select kind from web_events").fetchall() == [('blur',)]   # ends the span before it, says nothing


def test_non_web_urls_are_not_stored(db):
    events(db, {}, (0, 'nav', 'chrome://settings/passwords'), (1, 'nav', 'file:///etc/passwd'))
    assert db.execute('select count(*) from web_events').fetchone()[0] == 0


def test_unknown_event_kinds_are_ignored(db):
    web.store(db, {'t': 0, 'kind': 'keystrokes', 'url': 'https://a/'}, {})
    assert db.execute('select count(*) from web_events').fetchone()[0] == 0


def test_stored_url_has_no_query(db):
    events(db, {}, (0, 'nav', 'https://a.b/cb?code=secret'))
    assert db.execute('select url from web_events').fetchone()[0] == 'https://a.b/cb'


def test_tab_snapshot_replaces_and_filters(db):
    web.store(db, {'t': 0, 'kind': 'tabs', 'tabs': [{'tab': 1, 'url': 'https://a/?x=1', 'title': 'A', 'active': True},
                                                    {'tab': 2, 'url': 'https://bank.example/', 'title': 'B'},
                                                    {'tab': 3, 'url': 'chrome://newtab', 'title': 'N'}]}, RULES)
    assert db.execute('select tab, url from web_tabs').fetchall() == [(1, 'https://a/')]
    web.store(db, {'t': 0, 'kind': 'tabs', 'tabs': []}, RULES)
    assert db.execute('select count(*) from web_tabs').fetchone()[0] == 0


def test_unmatched_is_private_by_default(db):
    s = events(db, {}, (0, 'focus', 'https://elsewhere.example/', 'E'), (600, 'blur'), (601, 'nav', 'https://elsewhere.example/'))
    r = web.day_report(db, s, {}, {})
    assert all(not v['sites'] and not v['visits'] and not v['pages'] for v in r.values())


def test_public_levels(db):
    s = events(db, RULES, (0, 'focus', 'https://public.example/post', 'Post'), (300, 'focus', 'https://github.com/x/y', 'Repo'),
               (600, 'blur'), (601, 'nav', 'https://public.example/post'))
    v = next(iter(web.day_report(db, s, RULES, {}).values()))
    assert v['sites'] == {'public.example': 5, 'github.com': 5}
    assert v['pages'] == [{'url': 'https://public.example/post', 'title': 'Post', 'minutes': 5}]
    assert v['visits'] == {'public.example': 1}


def test_github_pages_count_toward_projects_but_a_private_rule_wins(db):
    repos = {'me/thing': 'thing', 'me/secret': 'secret'}
    s = events(db, RULES, (0, 'focus', 'https://github.com/me/thing/issues', 'T'), (300, 'focus', 'https://github.com/me/secret', 'S'), (600, 'blur'))
    assert next(iter(web.day_report(db, s, RULES, repos).values()))['projects'] == {'thing': 5}


def test_project_url_patterns(db):
    c = {'projects': {'https://docs.example/*': 'docs'}}
    s = events(db, c, (0, 'focus', 'https://docs.example/a'), (120, 'blur'))
    r = next(iter(web.day_report(db, s, c, {}).values()))
    assert r['projects'] == {'docs': 2} and not r['sites']


def test_tightening_a_rule_applies_to_stored_events(db):
    s = events(db, RULES, (0, 'focus', 'https://public.example/post', 'P'), (300, 'blur'))
    tight = {'rules': [{'action': 'private', 'when': 'domain', 'value': 'public.example'}]}
    assert not next(iter(web.day_report(db, s, tight, {}).values()))['sites']


def test_a_span_is_capped(db):
    s = events(db, {}, (0, 'focus', 'https://a.example/'), (86400 * 2, 'blur'))
    assert web.spans(db, s)[0][1] == web.MAX_SPAN


def test_history_only_fills_days_without_the_extension(db):
    c = {'rules': [{'action': 'domain', 'when': 'domain', 'value': 'a.example'}]}
    s = events(db, c, (1, 'nav', 'https://a.example/'))
    db.execute("insert into web_events (ts, kind, url) values (?, 'history', 'https://a.example/')", (s + 2,))
    assert next(iter(web.day_report(db, s, c, {}).values()))['visits'] == {'a.example': 1}


def frames(*msgs):
    return io.BytesIO(b''.join(struct.pack('<I', len(b)) + b for b in (json.dumps(m).encode() for m in msgs)))


def host_settings(tmp_path, web_conf):
    config = tmp_path / 'pulse.toml'
    config.write_text('')
    return SimpleNamespace(config=config, paused=tmp_path / 'paused', web=web_conf)


def test_native_host_reads_frames(tmp_path, db):
    s = host_settings(tmp_path, {})
    web.native_host(lambda: (s, db), frames({'t': 1000, 'kind': 'nav', 'url': 'https://a/', 'tab': 1}, {'t': 2000, 'kind': 'blur'}))
    assert db.execute('select kind, url from web_events order by ts').fetchall() == [('nav', 'https://a/'), ('blur', None)]


def test_native_host_records_nothing_while_paused_or_disabled(tmp_path, db):
    s = host_settings(tmp_path, {})
    s.paused.touch()
    web.native_host(lambda: (s, db), frames({'t': 1, 'kind': 'nav', 'url': 'https://a/'}))
    s.paused.unlink()
    s.web = {'enabled': False}
    web.native_host(lambda: (s, db), frames({'t': 1, 'kind': 'nav', 'url': 'https://a/'}))
    assert db.execute('select count(*) from web_events').fetchone()[0] == 0


def test_extension_id_matches_manifest_key():
    import base64
    import hashlib
    der = base64.b64decode(json.loads((web.EXTENSION / 'manifest.json').read_text())['key'])
    assert ''.join('abcdefghijklmnop'[int(c, 16)] for c in hashlib.sha256(der).hexdigest()[:32]) == web.EXTENSION_ID


def test_host_name_matches_extension():
    assert f"'{web.HOST}'" in (web.EXTENSION / 'background.js').read_text()


def test_extension_never_runs_in_incognito():
    assert json.loads((web.EXTENSION / 'manifest.json').read_text())['incognito'] == 'not_allowed'
