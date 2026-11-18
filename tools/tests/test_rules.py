import json
import shutil
import subprocess
from fnmatch import fnmatch
from pathlib import Path

import pytest

from sitekit import rules

JS = Path(rules.__file__).parent / 'extension' / 'rules.js'

FILTER = [{'match': '*.example.com'},
          {'match': 'secret.example.com', 'action': 'deny', 'priority': '!'},
          {'match': '*', 'action': 'deny', 'priority': '?'}]
MAP = [{'match': 'code*', 'to': 'code'},
       {'match': 'code-insiders', 'to': 'code', 'action': 'deny', 'priority': '!'},
       {'match': '*insiders', 'to': 'beta'},
       {'match': 'steam', 'action': 'deny'},
       {'match': '*', 'to': 'other', 'priority': '?'}]

# (rules, value, what decide() gives as the action or None, what lookup() gives as the key or 'STOP')
CASES = [(FILTER, 'www.example.com', 'allow', None), (FILTER, 'secret.example.com', 'deny', 'STOP'),
         (FILTER, 'elsewhere.org', 'deny', 'STOP'), ([], 'x', None, None),
         (MAP, 'code', 'allow', 'code'), (MAP, 'code-insiders', 'deny', 'beta'), (MAP, 'steam', 'deny', 'STOP'),
         (MAP, 'blender', 'allow', 'other')]


def py(rule_list, value):
    hit = rules.decide(rule_list, lambda r: fnmatch(value, r['match']))
    key = rules.lookup(rule_list, lambda r: fnmatch(value, r['match']))
    return (hit.get('action', 'allow') if hit else None), ('STOP' if key is rules.STOP else key)


@pytest.mark.parametrize('rule_list, value, action, key', CASES)
def test_python(rule_list, value, action, key):
    assert py(rule_list, value) == (action, key)


@pytest.mark.skipif(not shutil.which('node'), reason='needs node')
def test_javascript_agrees():
    # fnmatch's * as a regex, enough for these cases
    script = f'''
const {{ decide, lookup, STOP }} = await import({json.dumps(JS.as_uri())});
const glob = g => new RegExp('^' + g.split('*').map(s => s.replace(/[.+?^${{}}()|[\\]\\\\]/g, '\\\\$&')).join('.*') + '$');
const out = [];
for (const [rules, value] of {json.dumps([[r, v] for r, v, *_ in CASES])}) {{
  const m = r => glob(r.match).test(value);
  const hit = decide(rules, m), key = lookup(rules, m);
  out.push([hit ? (hit.action ?? 'allow') : null, key === STOP ? 'STOP' : key]);
}}
console.log(JSON.stringify(out));'''
    out = subprocess.run(['node', '--input-type=module', '-e', script], capture_output=True, text=True, check=True).stdout
    assert json.loads(out) == [[a, k] for _, _, a, k in CASES]


def test_order_is_kept_within_a_priority():
    first, second = {'match': '*', 'to': 'a'}, {'match': '*', 'to': 'b'}
    assert rules.ordered([second, first, {'match': '*', 'priority': '?'}])[:2] == [second, first]
    assert rules.keys(MAP) == ['code', 'beta', 'other']


@pytest.mark.parametrize('bad', [[{'match': 'x', 'action': 'maybe'}], [{'match': 'x', 'priority': '!!'}], [{'to': 'x'}], ['x']])
def test_check(bad):
    with pytest.raises(ValueError):
        rules.check(bad, '[test]')
    assert rules.check(MAP, '[test]') is MAP
