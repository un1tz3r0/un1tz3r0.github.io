import asyncio
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

import pytest

from sitekit import conversations as cv, pulse


def stamp(t):
    return datetime.fromtimestamp(t, timezone.utc).isoformat().replace('+00:00', 'Z')


def transcript(root: Path, name: str, *records):
    path = root / '-x' / f'{name}.jsonl'
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
    root = tmp_path / 'projects'
    transcript(root, 's1', user(0, 'fix the build'), reply(10, 'm1', 5), reply(11, 'm1', 5),
               user(12, [{'type': 'tool_result', 'content': 'x'}], toolUseResult={'x': 1}),
               user(13, '<command-name>/clear</command-name>'), user(14, 'hidden', isMeta=True),
               user(15, [{'type': 'text', 'text': 'now the tests'}]), {'type': 'ai-title', 'aiTitle': 'Fix build', 'sessionId': 's1'})
    return root


def test_code_sessions(root):
    s, = cv.code_sessions(root, T - 1)
    assert s.prompts == ['fix the build', 'now the tests']
    assert s.title == 'Fix build' and s.cwd == '/w/thing/sub'
    assert s.tokens == 8     # one reply counted once; cache reads left out


def test_resumed_session_is_not_counted_twice(root):
    transcript(root, 's1-resumed', user(0, 'fix the build'), reply(10, 'm1', 5))
    assert sum(len(s.prompts) for s in cv.code_sessions(root, T - 1)) == 2


def test_corrupt_lines_are_skipped(root):
    with (root / '-x' / 's1.jsonl').open('a') as f:
        f.write('{"partial')
    assert cv.code_sessions(root, T - 1)


def test_old_sessions_are_skipped(root):
    assert cv.code_sessions(root, time.time() + 60) == []


def test_minutes_ignore_long_gaps():
    assert cv.Session('code', 'x', 'd', stamps=[0, 60, 120, 5000]).minutes == 7   # 2 minutes, then a break capped at 5
    assert cv.Session('web', 'x', 'd', seconds=600).minutes == 10


def test_assign_uses_the_deepest_folder_and_only_publishable_projects():
    s = [cv.Session('code', 'a', 'd', cwd='/w/thing/sub'), cv.Session('code', 'b', 'd', cwd='/elsewhere'),
         cv.Session('code', 'c', 'd', cwd='/w/secret'), cv.Session('web', 'd', 'd', project='claude:private')]
    cv.assign(s, {Path('/w'): 'all', Path('/w/thing'): 'thing', Path('/w/secret'): 'secret'}, {'all', 'thing'})
    assert [x.project for x in s] == ['thing', None, None, None]


@pytest.fixture
def db(tmp_path):
    return pulse.open_db(tmp_path / 'p.sqlite3')


@pytest.mark.parametrize('url,hit', [('https://claude.ai/chat/3f0a1b2c-1111-2222-3333-444455556666', True),
                                     ('https://claude.ai/code/session_01ABCDEFGHIJKLMNOP', True),
                                     ('https://claude.ai/cowork/cse_01Qn7cCTwuQTCPAg1B', True),
                                     ('https://claude.ai/code/project/chan_01C1hEyZ2L6abcdefgh', False),
                                     ('https://claude.ai/login', False), ('https://claude.ai/new', False)])
def test_web_urls(url, hit):
    assert bool(cv.WEB.match(url)) is hit


def page(db, start, seconds, url, title=None, project=None, meta=None):
    db.execute('insert into pages (start, end, url, title, project, meta) values (?, ?, ?, ?, ?, ?)',
               (start, start + seconds, url, title, project, json.dumps(meta or {})))


def test_web_sessions(db):
    url = 'https://claude.ai/chat/3f0a1b2c-1111-2222-3333-444455556666'
    page(db, T, 60, url, 'Claude')
    page(db, T + 60, 120, url, 'Riso inks - Claude', 'claude:p1', {'conversation': 'x', 'excerpt': 'the page text'})
    page(db, T + 200, 60, 'https://claude.ai/new', 'Claude')
    s, = cv.web_sessions(db, T - 1)
    assert (s.title, s.prompts, s.project, s.minutes) == ('Riso inks', ['the page text'], 'claude:p1', 3)


def session(source='code', project=None, title='A title', **k):
    return cv.Session(source, k.pop('id', 'x'), '2026-10-31', project=project, title=title, prompts=['p'], stamps=[0, 60], tokens=10, **k)


def report(db, sessions, code='counts', web='counts'):
    return cv.report(db, sessions, {'code': code, 'web': web})['2026-10-31']


def test_counts_level_publishes_no_titles(db):
    r = report(db, [session(project='thing'), session('web')])
    assert r['items'] == [] and r['code']['tokens'] == 10 and r['projects']['thing']['prompts'] == 1


def test_titles_level(db):
    assert report(db, [session(project='thing')], code='titles')['items'] == [{'source': 'code', 'title': 'A title', 'project': 'thing'}]


def test_code_outside_publishable_projects_is_never_named(db):
    r = report(db, [session()], code='summaries')
    assert r['items'] == [] and r['code']['conversations'] == 1


def test_web_title_needs_no_project(db):
    assert report(db, [session('web')], web='titles')['items'][0]['title'] == 'A title'


def test_summary_comes_from_the_cache(db):
    s = session(project='thing')
    assert 'summary' not in report(db, [s], code='summaries')['items'][0]
    db.execute('insert into summaries values (?, ?, ?)', (f'{s.id}:{s.day}', cv.key(s), 'Fixed it'))
    assert report(db, [s], code='summaries')['items'][0]['summary'] == 'Fixed it'
    assert 'summary' not in report(db, [s], code='titles')['items'][0]


def test_changed_prompts_invalidate_the_summary(db):
    s = session()
    db.execute('insert into summaries values (?, ?, ?)', (f'{s.id}:{s.day}', cv.key(s), 'old'))
    s.prompts.append('more')
    assert cv.cached(db, s) is None


@pytest.mark.parametrize('text', ['key sk-ant-api03-abcdefghijklmnopqrstuv', 'ghp_abcdefghijklmnopqrstuvwxyz012345', 'mail me@example.com',
                                  'see /home/owner/secret/file.txt', 'AKIAABCDEFGHIJKLMNOP', 'a' * 40])
def test_redact(text):
    assert cv.redact(text).endswith('[redacted]')


def test_titles_are_redacted(db):
    r = report(db, [session(project='t', title='Rotate ghp_abcdefghijklmnopqrstuvwxyz012345')], code='titles')
    assert 'ghp_' not in r['items'][0]['title']


@pytest.mark.parametrize('c', [{'code': 'all'}, {'web': 'yes'}])
def test_bad_levels_do_not_load(c):
    with pytest.raises(ValueError):
        cv.check(c)


class Fake:
    def __init__(self, reply):
        self.reply, self.calls = reply, []
        self.beta = SimpleNamespace(messages=SimpleNamespace(create=self.create))

    async def create(self, **k):
        self.calls.append(k)
        if isinstance(self.reply, Exception):
            raise self.reply
        return self.reply


def message(text, stop='end_turn'):
    return SimpleNamespace(stop_reason=stop, content=[SimpleNamespace(type='thinking'), SimpleNamespace(type='text', text=text)])


def test_summary_request():
    client = Fake(message(' Fixed the build. '))
    assert asyncio.run(cv.summarise_one(client, session(title='Build'), cv.MODEL)) == 'Fixed the build.'
    k = client.calls[0]
    assert k['model'] == 'claude-opus-5-5' and k['fallbacks'] == 'default' and k['betas'] == ['server-side-fallback-2026-07-01']
    assert k['output_config'] == {'effort': 'low'} and '<conversation>' in k['messages'][0]['content']


def test_haiku_gets_no_fallback():
    client = Fake(message('x'))
    asyncio.run(cv.summarise_one(client, session(), 'claude-haiku-5-5'))
    assert 'fallbacks' not in client.calls[0]


def test_refusal_gives_no_summary():
    assert asyncio.run(cv.summarise_one(Fake(message('', 'refusal')), session(), cv.MODEL)) is None


def test_prompts_are_bounded():
    client = Fake(message('x'))
    asyncio.run(cv.summarise_one(client, cv.Session('code', 'x', 'd', prompts=['a' * 9000] * 5), cv.MODEL))
    assert len(client.calls[0]['messages'][0]['content']) < cv.PROMPT_LIMIT + 200


def test_summaries_are_cached_redacted_and_failures_logged(db):
    logged = []
    log = lambda text, kind: logged.append(text)
    s = session(project='t')
    asyncio.run(cv.summaries(db, [s], cv.MODEL, log, Fake(message('Wrote to me@example.com'))))
    assert cv.cached(db, s) == 'Wrote to [redacted]'
    asyncio.run(cv.summaries(db, [session(id='y')], cv.MODEL, log, Fake(RuntimeError('no credentials'))))
    assert logged == ['1 of 1 summaries failed: no credentials']


def test_the_extension_reads_conversations_only_for_web_summaries(tmp_path):
    def plugins(claude):
        config = tmp_path / 'pulse.toml'
        config.write_text(f'site = "{tmp_path}"\n[discover]\nenabled = false\n[browser.plugins.claude]\nenabled = true\n{claude}')
        return pulse.Settings.load(config).browser_config()['plugins']['claude']
    assert plugins('') == {'enabled': True}
    assert plugins('[claude]\nweb = "titles"\ncode = "summaries"') == {'enabled': True}
    assert plugins('[claude]\nweb = "summaries"') == {'enabled': True, 'excerpts': True}


def test_publish_is_off_by_default(root, published):
    assert published(transcripts=root) is None


def test_publish_end_to_end(root, published):
    def setup(db):
        page(db, T, 120, 'https://claude.ai/chat/3f0a1b2c-1111-2222-3333-444455556666', 'Riso inks - Claude')
    day = published('[claude]\ncode = "titles"\nweb = "counts"', setup, root, {Path('/w/thing'): 'thing'})
    assert 'items' not in day['claude'] and day['claude']['code']['conversations'] == 1    # 'thing' is not publishable
    assert day['claude']['web'] == {'conversations': 1, 'minutes': 2} and 'thing' not in day['projects']
    day = published(f'[projects]\n"/w/thing" = "thing"\n[claude]\ncode = "titles"', transcripts=root)
    assert day['claude']['items'] == [{'source': 'code', 'title': 'Fix build', 'project': 'thing'}]
    assert day['projects']['thing']['claude']['prompts'] == 2
