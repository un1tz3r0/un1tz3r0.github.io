import asyncio
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

import pytest

from sitekit import claude, pulse, web


def stamp(t):
    return datetime.fromtimestamp(t, timezone.utc).isoformat().replace('+00:00', 'Z')


def transcript(root: Path, name: str, *records):
    path = root / 'projects' / '-x' / f'{name}.jsonl'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text('\n'.join(json.dumps(r) for r in records) + '\n')


T = time.time() - 600
BASE = {'sessionId': 's1', 'cwd': '/w/thing/sub'}


def user(n, text, **k):
    return {**BASE, 'type': 'user', 'uuid': f'u{n}', 'timestamp': stamp(T + n), 'message': {'content': text}, **k}


def reply(n, mid, tokens):
    usage = {'input_tokens': tokens, 'output_tokens': 1, 'cache_creation_input_tokens': 2, 'cache_read_input_tokens': 9999}
    return {**BASE, 'type': 'assistant', 'uuid': f'a{n}', 'timestamp': stamp(T + n), 'message': {'id': mid, 'usage': usage}}


@pytest.fixture
def root(tmp_path):
    transcript(tmp_path, 's1', user(0, 'fix the build'), reply(10, 'm1', 5), reply(11, 'm1', 5),
               user(12, [{'type': 'tool_result', 'content': 'x'}], toolUseResult={'x': 1}),
               user(13, '<command-name>/clear</command-name>'), user(14, 'hidden', isMeta=True),
               user(15, [{'type': 'text', 'text': 'now the tests'}]), {'type': 'ai-title', 'aiTitle': 'Fix build', 'sessionId': 's1'})
    return tmp_path


def test_code_sessions(root):
    s, = claude.code_sessions(root, T - 1)
    assert s.prompts == ['fix the build', 'now the tests']
    assert s.title == 'Fix build' and s.cwd == '/w/thing/sub'
    assert s.tokens == 8     # one reply counted once; cache reads left out


def test_resumed_session_is_not_counted_twice(root):
    transcript(root, 's1-resumed', user(0, 'fix the build'), reply(10, 'm1', 5))
    assert sum(len(s.prompts) for s in claude.code_sessions(root, T - 1)) == 2


def test_corrupt_lines_are_skipped(root):
    with (root / 'projects' / '-x' / 's1.jsonl').open('a') as f:
        f.write('{"partial')
    assert claude.code_sessions(root, T - 1)


def test_old_sessions_are_skipped(root):
    assert claude.code_sessions(root, time.time() + 60) == []


def test_minutes_ignore_long_gaps():
    s = claude.Session('code', 'x', 'd', stamps=[0, 60, 120, 5000])
    assert s.minutes == 7   # 2 minutes, then a break capped at 5


def test_assign_uses_deepest_folder():
    s = [claude.Session('code', 'a', 'd', cwd='/w/thing/sub'), claude.Session('code', 'b', 'd', cwd='/elsewhere')]
    claude.assign(s, {Path('/w'): 'all', Path('/w/thing'): 'thing'})
    assert (s[0].project, s[1].project) == ('thing', None)


def test_assign_web_title():
    s = [claude.Session('web', 'a', 'd', title='Windchime physics'), claude.Session('web', 'b', 'd', title='Soup')]
    claude.assign(s, {Path('/w'): 'windchime'})
    assert (s[0].project, s[1].project) == ('windchime', None)


@pytest.fixture
def db(tmp_path):
    return pulse.open_db(tmp_path / 'p.sqlite3')


@pytest.mark.parametrize('url,hit', [('https://claude.ai/chat/3f0a1b2c-1111-2222-3333-444455556666', True),
                                     ('https://claude.ai/code/session_01ABCDEFGHIJKLMNOP', True),
                                     ('https://claude.ai/cowork/cse_01Qn7cCTwuQTCPAg1B', True),
                                     ('https://claude.ai/code/project/chan_01C1hEyZ2L6abcdefgh', False),
                                     ('https://claude.ai/login', False), ('https://claude.ai/new', False)])
def test_web_urls(url, hit):
    assert bool(claude.WEB.match(url)) is hit


def test_web_sessions(db):
    url = 'https://claude.ai/chat/3f0a1b2c-1111-2222-3333-444455556666'
    db.execute("insert into web_events (ts, kind, url, title, summary) values (?, 'nav', ?, 'Claude', null)", (T, url))
    db.execute("insert into web_events (ts, kind, url, title, summary) values (?, 'title', ?, 'Riso inks - Claude', null)", (T + 1, url))
    db.execute("insert into web_events (ts, kind, url, title, summary) values (?, 'page', ?, 'Riso inks - Claude', 'the page text')", (T + 2, url))
    s, = claude.web_sessions(db, T - 1)
    assert s.title == 'Riso inks' and s.prompts == ['the page text']


def session(source='code', project=None, title='A title', **k):
    return claude.Session(source, k.pop('id', 'x'), '2026-10-31', project=project, title=title, prompts=['p'], stamps=[0, 60], tokens=10, **k)


def report(db, sessions, code='counts', web='counts'):
    return claude.report(db, sessions, {'code': code, 'web': web})['2026-10-31']


def test_counts_level_publishes_no_titles(db):
    r = report(db, [session(project='thing'), session('web')])
    assert r['items'] == [] and r['code']['tokens'] == 10 and r['projects']['thing']['prompts'] == 1


def test_titles_level(db):
    r = report(db, [session(project='thing')], code='titles')
    assert r['items'] == [{'source': 'code', 'title': 'A title', 'project': 'thing'}]


def test_code_outside_listed_projects_is_never_named(db):
    r = report(db, [session()], code='summaries')
    assert r['items'] == [] and r['code']['conversations'] == 1


def test_web_title_needs_no_project(db):
    assert report(db, [session('web')], web='titles')['items'][0]['title'] == 'A title'


def test_summary_comes_from_the_cache(db):
    s = session(project='thing')
    assert 'summary' not in report(db, [s], code='summaries')['items'][0]
    db.execute('insert into summaries values (?, ?, ?)', (f'{s.id}:{s.day}', claude.key(s), 'Fixed it'))
    assert report(db, [s], code='summaries')['items'][0]['summary'] == 'Fixed it'
    assert 'summary' not in report(db, [s], code='titles')['items'][0]


def test_changed_prompts_invalidate_the_summary(db):
    s = session()
    db.execute('insert into summaries values (?, ?, ?)', (f'{s.id}:{s.day}', claude.key(s), 'old'))
    s.prompts.append('more')
    assert claude.cached(db, s) is None


@pytest.mark.parametrize('text', ['key sk-ant-api03-abcdefghijklmnopqrstuv', 'ghp_abcdefghijklmnopqrstuvwxyz012345', 'mail me@example.com',
                                  'see /home/owner/secret/file.txt', 'AKIAABCDEFGHIJKLMNOP', 'a' * 40])
def test_redact(text):
    assert claude.redact(text).endswith('[redacted]')


def test_titles_are_redacted(db):
    r = report(db, [session(project='t', title='Rotate ghp_abcdefghijklmnopqrstuvwxyz012345')], code='titles')
    assert 'ghp_' not in r['items'][0]['title']


class Fake:
    def __init__(self, reply):
        self.reply, self.calls = reply, []
        self.beta = SimpleNamespace(messages=SimpleNamespace(create=self.create))

    async def create(self, **k):
        self.calls.append(k)
        return self.reply


def message(text, stop='end_turn'):
    return SimpleNamespace(stop_reason=stop, content=[SimpleNamespace(type='thinking'), SimpleNamespace(type='text', text=text)])


def test_summary_request():
    client = Fake(message(' Fixed the build. '))
    s = session(title='Build')
    assert asyncio.run(claude.summarise_one(client, s, claude.MODEL)) == 'Fixed the build.'
    k = client.calls[0]
    assert k['model'] == 'claude-opus-5-5' and k['fallbacks'] == 'default' and k['betas'] == ['server-side-fallback-2026-07-01']
    assert '<conversation>' in k['messages'][0]['content']


def test_haiku_gets_no_fallback():
    client = Fake(message('x'))
    asyncio.run(claude.summarise_one(client, session(), 'claude-haiku-5-5'))
    assert 'fallbacks' not in client.calls[0]


def test_refusal_gives_no_summary():
    assert asyncio.run(claude.summarise_one(Fake(message('', 'refusal')), session(), claude.MODEL)) is None


def test_prompts_are_bounded():
    client = Fake(message('x'))
    asyncio.run(claude.summarise_one(client, claude.Session('code', 'x', 'd', prompts=['a' * 9000] * 5), claude.MODEL))
    assert len(client.calls[0]['messages'][0]['content']) < claude.PROMPT_LIMIT + 200


def test_enrich_end_to_end(tmp_path, root, db):
    s = pulse.Settings(site=tmp_path, remote=None, interval=60, idle=180, window=600, publish=3600, push=False, db=tmp_path / 'p.sqlite3',
                       projects={Path('/w/thing'): 'thing'}, apps=[], ignore=[], claude={'dir': str(root), 'code': 'titles', 'web': 'off'},
                       web={'rules': [{'action': 'domain', 'when': 'domain', 'value': 'a.example'}]})
    start = time.time() - 3000
    web.store(db, {'t': start * 1000, 'kind': 'focus', 'url': 'https://a.example/'}, s.web)
    web.store(db, {'t': (start + 300) * 1000, 'kind': 'blur'}, s.web)
    days = {}
    first = datetime.fromtimestamp(start).date()
    asyncio.run(pulse.enrich(s, db, days, first, live=False))
    today = days[max(days)]
    assert today['claude']['items'][0]['title'] == 'Fix build'
    assert today['projects']['thing']['claude']['prompts'] == 2
    assert today['web']['sites'] == {'a.example': 5}
