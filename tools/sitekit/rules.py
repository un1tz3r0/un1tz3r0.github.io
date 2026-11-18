"""Ordered rule lists: the filters and pattern maps in pulse.toml, and the same logic in the browser extension
(extension/rules.js).

A rule is a table such as { match = "github.com", action = "deny", priority = "!", to = "code" }. `action` is "allow"
(the default) or "deny"; `priority` is "!" (tried first), "?" (tried last) or absent; a map's rules also name the key
they give (`to`, or another field such as publish rules' `level`); a list may add fields of its own (discover's `when`).

Rules are tried by priority, then in list order:
- a filter's first matching rule decides: allow or deny;
- in a map, the first matching allow rule gives its key, except a key that an earlier matching deny rule ruled out, so a
  later rule can still give another one; a matching deny rule without a key stops: nothing is given.
"""
from __future__ import annotations

from typing import Callable

ACTIONS = ('allow', 'deny')
PRIORITIES = ('!', '', '?')
STOP = object()     # lookup()'s answer when a deny rule without a key matched


def ordered(rules: list[dict]) -> list[dict]:
    """By priority, keeping list order within one."""
    return sorted(rules, key=lambda r: PRIORITIES.index(r.get('priority', '')))


def check(rules: list[dict], where: str, required: tuple[str, ...] = ('match',)) -> list[dict]:
    """The rules, or ValueError naming the first that can't be used."""
    for r in rules:
        if not isinstance(r, dict) or r.get('action', 'allow') not in ACTIONS or r.get('priority', '') not in PRIORITIES \
                or any(not r.get(k) for k in required):
            raise ValueError(f'{where}: each rule needs {", ".join(required)}; action is "allow" or "deny", '
                             f'priority "!" or "?" (or none): {r}')
    return rules


def allowed(r: dict) -> bool:
    return r.get('action', 'allow') == 'allow'


def decide(rules: list[dict], matches: Callable[[dict], bool]) -> dict | None:
    """A filter's deciding rule, or None when none matches."""
    return next((r for r in ordered(rules) if matches(r)), None)


def lookup(rules: list[dict], matches: Callable[[dict], bool], key: str = 'to'):
    """A map's key for what `matches` tests: the key, None when no rule gives one, or STOP when a deny rule without a
    key matched."""
    ruled_out = set()
    for r in ordered(rules):
        if not matches(r):
            continue
        if allowed(r):
            if r.get(key) not in ruled_out:
                return r.get(key)
        elif r.get(key) is None:
            return STOP
        else:
            ruled_out.add(r[key])
    return None


def keys(rules: list[dict], key: str = 'to') -> list[str]:
    """The keys allow rules give, in order, once each."""
    return list(dict.fromkeys(r[key] for r in rules if allowed(r) and r.get(key)))
