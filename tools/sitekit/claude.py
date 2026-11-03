"""Claude's part in your work, from what it leaves behind: GitHub and this machine's Claude Code transcripts.

link() runs inside `sitekit history`. Commits carry a Claude-Session trailer, and PRs opened from a Claude project
thread carry an attribution marker and the project's link, so sessions, commits and PRs group by Claude project with
no Anthropic API. Output: data/claude.json. Keys this module doesn't compute (e.g. a project's name or artifact count
written by another tool) are kept across runs; [claude.projects.<id>] in site.toml supplies names and site projects.

scan() reads ~/.claude/projects/**/*.jsonl and keeps per-session token totals in a local cache, since Claude Code
deletes old transcripts. It publishes daily aggregates to data/claude-usage/<machine>.json: sessions and tokens per
day, per public repo, and cost only when [claude].publish lists "cost". Prompts, titles and paths never leave here.
"""
from __future__ import annotations

import asyncio
import json
import os
import re
import socket
import sys
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path

import aiohttp

from .common import API, api_headers, expand, now, read_json, run, write_json

SESSION = re.compile(r'claude\.ai/code/(session_\w+)')
PROJECT = re.compile(r'claude\.ai/code/project/(chan_\w+)')
MARKER = re.compile(r'<!--\s*claude-projects-attribution:\s*(\{.*?\})\s*-->')
BY_CLAUDE = re.compile(r'<!--\s*claude-projects-attribution|Generated with \[Claude Code\]|claude\.ai/code/session_')
GITHUB_REMOTE = re.compile(r'github\.com[:/]+([^/\s]+)/([^/\s]+?)(?:\.git)?/?$', re.I)
SINCE = '2025-02-01'
TRANSCRIPTS = expand('~/.claude/projects')
CACHE = expand('~/.local/share/sitekit/claude-sessions.json')
TOKENS = ('in', 'out', 'cache_read', 'cache_write')
WEIGHT = (1, 5, 0.1, 1.25)  # relative per-token price, the same ratios for every Claude model: splits a session's cost by day


# ── GitHub: sessions, commits and PRs per Claude project ─────────────────────────────────────────────────────────


async def get(http: aiohttp.ClientSession, url) -> tuple:
    async with http.get(url) as r:
        r.raise_for_status()
        return await r.json(), r.links.get('next', {}).get('url')


async def pulls(http: aiohttp.ClientSession, repo: str) -> list[dict]:
    """Every PR in repo that Claude opened, with its size from the detail endpoint."""
    url, found = API.joinpath('repos', *repo.split('/'), 'pulls').with_query(state='all', per_page=100), []
    while url:
        page, url = await get(http, url)
        found += [p for p in page if BY_CLAUDE.search(p['body'] or '')]
    details = await asyncio.gather(*(get(http, p['url']) for p in found))
    return [pr_row(repo, p, d) for p, (d, _) in zip(found, details)]


def pr_row(repo: str, p: dict, d: dict) -> dict:
    body = p['body'] or ''
    marker, project = MARKER.search(body), PROJECT.search(body)
    try:
        by = json.loads(marker[1]).get('github_login') if marker else None
    except ValueError:
        by = None
    return {'repo': repo, 'number': p['number'], 'title': p['title'], 'url': p['html_url'],
            'state': 'merged' if p['merged_at'] else p['state'], 'created': p['created_at'][:10],
            'merged': (p['merged_at'] or '')[:10] or None, 'commits': d.get('commits'), 'files': d.get('changed_files'),
            'additions': d.get('additions'), 'deletions': d.get('deletions'), 'by': by,
            'project': project and project[1], 'sessions': sorted(set(SESSION.findall(body)))}


async def fetch_prs(repos: list[str], previous: dict[str, list[dict]]) -> dict[str, list[dict]]:
    out = {}
    async with aiohttp.ClientSession(headers=api_headers(), timeout=aiohttp.ClientTimeout(total=60)) as http:
        async def one(repo):
            try:
                out[repo] = await pulls(http, repo)
            except (aiohttp.ClientError, TimeoutError) as e:
                print(f'  claude: keeping last PR list for {repo}: {e}', file=sys.stderr)
                out[repo] = previous.get(repo, [])
        await asyncio.gather(*map(one, repos))
    return out


async def link(site: Path, cfg: dict, timeline: dict, sessions: dict[str, list], failed: set, api: bool = True) -> None:
    """Write data/claude.json. sessions: {repo: [Commit with a session]} from history."""
    path = site / 'data' / 'claude.json'
    old = read_json(path, {})
    names = cfg.get('claude', {}).get('projects', {})
    public = {r for r, rec in timeline.items() if not rec.get('private') and '/' in r}
    previous = defaultdict(list)
    for proj in [*old.get('projects', {}).values(), old.get('unlinked', {})]:
        for pr in proj.get('prs', []):
            if pr.get('repo'):
                previous[pr['repo']].append(pr)
    # Private repos' PRs are kept unnamed, so their rows can't be reused when an API call fails; list them only with a token.
    candidates = [r for r, rec in timeline.items() if '/' in r and rec.get('last', '') >= SINCE
                  and 'github.com' in rec.get('url', '') and (r in public or os.environ.get('GITHUB_TOKEN'))]
    prs = await fetch_prs(candidates, previous) if api else dict(previous)

    owner_of = {}
    for repo, rows in prs.items():
        for pr in rows:
            for s in pr.get('sessions', []):
                owner_of.setdefault(s, pr.get('project'))
    groups = defaultdict(lambda: {'prs': [], 'repos': set(), 'sessions': set(), 'days': Counter()})
    for repo, rows in prs.items():
        for pr in rows:
            g = groups[pr.get('project')]
            g['prs'].append(pr)
            g['repos'].add(repo)
            g['sessions'].update(pr.get('sessions', []))
            g['days'][pr['created']] += 0
    for repo, rows in sessions.items():
        for c in rows:
            g = groups[owner_of.get(c.session)]
            g['repos'].add(repo)
            g['sessions'].add(c.session)
            g['days'][c.when.date().isoformat()] += 1

    projects_json = read_json(site / 'data' / 'projects.json', {}).get('projects', [])
    site_of = defaultdict(list)
    for p in projects_json:
        for r in p.get('repos', []):
            site_of[r].append(p['id'])

    def render(key, g) -> dict:
        conf = names.get(key, {}) if key else {}
        repos = sorted(g['repos'])
        rows = sorted(g['prs'], key=lambda p: (p['created'], p['repo'], p['number']), reverse=True)
        return {k: v for k, v in {
            'name': conf.get('name'),
            'site': conf.get('project') and [conf['project']] or sorted({s for r in repos for s in site_of[r]}) or None,
            'repos': [r for r in repos if r in public] or None, 'private_repos': sum(r not in public for r in repos) or None,
            'sessions': len(g['sessions']) or None, 'commits': sum(g['days'].values()) or None,
            'first': min(g['days'], default=None), 'last': max(g['days'], default=None),
            'prs': [{k: v for k, v in (pr if pr['repo'] in public else
                                       {k: pr[k] for k in ('state', 'created', 'merged', 'additions', 'deletions', 'commits', 'files')}).items()
                     if k not in ('project', 'sessions') and v is not None} for pr in rows] or None,
        }.items() if v is not None}

    projects = {}
    for key, g in sorted(groups.items(), key=lambda kv: max(kv[1]['days'], default=''), reverse=True):
        if key:
            projects[key] = {**old.get('projects', {}).get(key, {}), **render(key, g)}
    doc = {'generated': now(), 'projects': projects}
    if None in groups:
        doc['unlinked'] = render(None, groups[None])
    write_json(path, doc)
    n = sum(len(v) for v in prs.values())
    print(f'claude: {len(projects)} projects, {n} PRs, {sum(len(g["sessions"]) for g in groups.values())} sessions → {path.relative_to(site)}')


# ── This machine: token use per session from Claude Code's transcripts ───────────────────────────────────────────


def local_day(ts: str) -> str:
    return datetime.fromisoformat(ts.replace('Z', '+00:00')).astimezone().date().isoformat()


def read_transcripts(root: Path) -> dict[str, dict]:
    """{session id: {cwd, days: {day: {model: [in, out, cache_read, cache_write]}}, cost: {model: usd}, lines}}.

    A response is written once per content block, all carrying the same usage, so messages are counted once by id.
    Subagent transcripts share their parent's session id and fold into it.
    """
    sessions, seen = {}, set()
    for f in sorted(root.rglob('*.jsonl')):
        try:
            lines = f.read_text(errors='replace').splitlines()
        except OSError:
            continue
        for line in lines:
            try:
                d = json.loads(line)
            except ValueError:
                continue
            if not isinstance(d, dict) or not (sid := d.get('sessionId')):
                continue
            s = sessions.setdefault(sid, {'cwd': None, 'days': {}, 'cost': {}, 'lines': None})
            if d.get('cwd') and not s['cwd'] and not d.get('isSidechain'):
                s['cwd'] = d['cwd']
            if d.get('type') == 'cost-state' and isinstance(d.get('modelUsage'), dict):
                cost = {m: u.get('costUSD') or 0 for m, u in d['modelUsage'].items()}
                if sum(cost.values()) >= sum(s['cost'].values()):
                    s['cost'] = cost
                    s['lines'] = [d.get('totalLinesAdded') or 0, d.get('totalLinesRemoved') or 0]
            msg = d.get('message')
            if d.get('type') != 'assistant' or not isinstance(msg, dict) or not isinstance(u := msg.get('usage'), dict):
                continue
            model, key = msg.get('model') or '?', msg.get('id') or d.get('requestId') or d.get('uuid')
            if model.startswith('<') or not d.get('timestamp') or (sid, key) in seen:
                continue
            seen.add((sid, key))
            t = s['days'].setdefault(local_day(d['timestamp']), {}).setdefault(model, [0, 0, 0, 0])
            for i, k in enumerate(('input_tokens', 'output_tokens', 'cache_read_input_tokens', 'cache_creation_input_tokens')):
                t[i] += u.get(k) or 0
    return sessions


async def repo_of(cwd: str | None) -> str | None:
    if not cwd or not Path(cwd).is_dir():
        return None
    out = await run('git', '-C', cwd, 'config', '--get-regexp', r'^remote\..*\.url$', check=False)
    for line in out.splitlines():
        if m := GITHUB_REMOTE.search(line.split(None, 1)[-1].strip()):
            return f'{m[1]}/{m[2]}'
    return None


def machine() -> str:
    return os.environ.get('SITEKIT_MACHINE') or socket.gethostname().split('.')[0] or 'local'


async def scan(site: Path, cfg: dict, root: Path = TRANSCRIPTS) -> Path:
    """Fold this machine's transcripts into the local cache, then publish daily aggregates for the site."""
    cache = read_json(CACHE, {'sessions': {}})
    found = read_transcripts(root) if root.exists() else {}
    for sid, s in found.items():
        prev = cache['sessions'].get(sid, {})
        s['repo'] = await repo_of(s['cwd']) or prev.get('repo')
        s.pop('cwd')
        cache['sessions'][sid] = s
    write_json(CACHE, cache)

    publish = set(cfg.get('publish', ['sessions', 'tokens']))
    gh = read_json(site / 'data' / 'github.json', {}).get('repos', {})
    public = {r for r, rec in gh.items() if not rec.get('private')}
    days = defaultdict(lambda: {'sessions': 0, 'tokens': [0, 0, 0, 0], 'cost': 0.0, 'models': Counter(), 'repos': {}})
    for s in cache['sessions'].values():
        for day, cost in split_cost(s).items():
            v = days[day]
            v['sessions'] += 1
            v['cost'] += cost
            r = v['repos'].setdefault(s.get('repo') if s.get('repo') in public else '', {'sessions': 0, 'tokens': [0, 0, 0, 0]})
            r['sessions'] += 1
            for model, t in s['days'][day].items():
                v['models'][model] += sum(t[:2])
                for i, n in enumerate(t):
                    v['tokens'][i] += n
                    r['tokens'][i] += n

    def tokens(t):
        return dict(zip(TOKENS, t))

    out = {}
    for day, v in sorted(days.items()):
        row = {'sessions': v['sessions']} if 'sessions' in publish else {}
        if 'tokens' in publish:
            row |= {'tokens': tokens(v['tokens']), 'models': dict(v['models'].most_common())}
        if 'cost' in publish and v['cost']:
            row['cost'] = round(v['cost'], 2)
        repos = {r: {**({'sessions': x['sessions']} if 'sessions' in publish else {}),
                     **({'tokens': tokens(x['tokens'])} if 'tokens' in publish else {})} for r, x in v['repos'].items() if r}
        if repos and publish & {'sessions', 'tokens'}:
            row['repos'] = repos
        out[day] = row
    path = site / 'data' / 'claude-usage' / f'{machine()}.json'
    write_json(path, {'generated': now(), 'machine': machine(), 'publish': sorted(publish), 'days': out})
    write_json(path.parent / 'index.json', {'machines': sorted(f.stem for f in path.parent.glob('*.json') if f.stem != 'index')})
    print(f'claude: {len(found)} sessions on disk, {len(cache["sessions"])} cached, {len(out)} days → {path.relative_to(site)}')
    return path


def split_cost(s: dict) -> dict[str, float]:
    """The session's cost (from its cost-state record) spread over its days by price-weighted tokens, per model."""
    def weights(models) -> dict[str, float]:
        return {day: sum(n * w for name in models for n, w in zip(m.get(name, ()), WEIGHT)) for day, m in s['days'].items()}

    share, every = {day: 0.0 for day in s['days']}, weights({m for d in s['days'].values() for m in d})
    for model, usd in s.get('cost', {}).items():
        weight = weights({model})
        if not sum(weight.values()):
            weight = every  # a model whose calls aren't in the transcript (e.g. a background helper) follows the session
        total = sum(weight.values())
        for day, w in weight.items():
            share[day] += usd * w / total if total else 0
    return share


def report(site: Path, days: int) -> None:
    """The full local accounting, cost included, for the last `days` days; then Claude projects from data/claude.json."""
    first = (date.today() - timedelta(days=days - 1)).isoformat()
    rows = defaultdict(lambda: {'sessions': 0, 'tokens': [0, 0, 0, 0], 'cost': 0.0, 'lines': [0, 0]})
    for s in read_json(CACHE, {'sessions': {}})['sessions'].values():
        costs = {d: c for d, c in split_cost(s).items() if d >= first}
        if not costs:
            continue
        r = rows[s.get('repo') or '(no repo)']
        r['sessions'] += 1
        r['cost'] += sum(costs.values())
        r['lines'] = [a + b for a, b in zip(r['lines'], s.get('lines') or [0, 0])]
        for day in costs:
            for t in s['days'][day].values():
                r['tokens'] = [a + b for a, b in zip(r['tokens'], t)]
    print(f'Claude Code on {machine()} since {first} (cost is the API list-price equivalent)\n')
    head = f'{"repo":40} {"sess":>5} {"input":>9} {"output":>9} {"cache rd":>10} {"cache wr":>10} {"+lines":>7} {"-lines":>7} {"cost":>9}'
    print(head + '\n' + '─' * len(head))
    total = {'sessions': 0, 'tokens': [0, 0, 0, 0], 'cost': 0.0, 'lines': [0, 0]}
    for name, r in sorted(rows.items(), key=lambda kv: -kv[1]['cost']) + [('total', total)]:
        if name == 'total':
            print('─' * len(head))
        print(f'{name[:40]:40} {r["sessions"]:5} ' + ' '.join(f'{human(n):>{w}}' for n, w in zip(r['tokens'], (9, 9, 10, 10)))
              + f' {r["lines"][0]:7} {r["lines"][1]:7} {r["cost"]:9.2f}')
        if name != 'total':
            total['sessions'] += r['sessions']
            total['cost'] += r['cost']
            total['tokens'] = [a + b for a, b in zip(total['tokens'], r['tokens'])]
            total['lines'] = [a + b for a, b in zip(total['lines'], r['lines'])]
    projects = read_json(site / 'data' / 'claude.json', {}).get('projects', {})
    if projects:
        print(f'\n{"Claude project":40} {"repos":28} {"sess":>5} {"commits":>7} {"PRs":>4} {"merged":>6}')
        for key, p in projects.items():
            prs = p.get('prs', [])
            print(f'{(p.get("name") or key)[:40]:40} {", ".join(p.get("repos", []))[:28]:28} {p.get("sessions", 0):5} '
                  f'{p.get("commits", 0):7} {len(prs):4} {sum(pr["state"] == "merged" for pr in prs):6}')


def human(n: int) -> str:
    return f'{n / 1e6:.1f}M' if n >= 1e6 else f'{n / 1e3:.0f}k' if n >= 1e3 else str(n)
