// Ordered rule lists, the same logic as sitekit/rules.py (see there): rules are tried by priority ("!" first, "?"
// last), then in list order. A filter's first matching rule decides; in a map, the first matching allow rule gives its
// key unless an earlier matching deny rule ruled that key out, and a matching deny rule without a key stops.
const PRIORITIES = ['!', '', '?'];
export const STOP = Symbol('stop');

export const ordered = rules => rules.map((r, i) => [r, i])
  .sort(([a, i], [b, j]) => PRIORITIES.indexOf(a.priority ?? '') - PRIORITIES.indexOf(b.priority ?? '') || i - j)
  .map(([r]) => r);

export const allowed = r => (r.action ?? 'allow') === 'allow';

export const decide = (rules, matches) => ordered(rules).find(matches) ?? null;

export function lookup(rules, matches, key = 'to') {
  const ruledOut = new Set();
  for (const r of ordered(rules)) {
    if (!matches(r)) continue;
    if (allowed(r)) {
      if (!ruledOut.has(r[key])) return r[key] ?? null;
    } else if (r[key] == null) return STOP;
    else ruledOut.add(r[key]);
  }
  return null;
}
