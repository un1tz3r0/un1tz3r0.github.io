// Scanline crossings and fill-rule mappers.
//
// A "crossing" is where a directed edge intersects the horizontal line at height y,
// with dir = +1 for edges going down the buffer (increasing y) and −1 going up. The
// same half-open vertex rule as core/winding.js — an edge covers y ∈ [min, max) of its
// endpoints in the travel direction — guarantees a shared vertex is counted exactly
// once and a horizontal graze not at all.

import { EVENODD } from '../core/path.js';

/**
 * Crossings of the edge list with the horizontal line at y, sorted by x ascending.
 * @param {{x0,y0,x1,y1}[]} edges
 * @param {number} y
 * @returns {{x:number, dir:1|-1}[]}
 */
export function scanlineCrossings(edges, y) {
  const out = [];
  for (const e of edges) {
    const asc = e.y1 > e.y0;
    const counted = asc ? e.y0 <= y && y < e.y1 : e.y1 <= y && y < e.y0;
    if (!counted) continue;
    const t = (y - e.y0) / (e.y1 - e.y0);
    out.push({ x: e.x0 + t * (e.x1 - e.x0), dir: asc ? 1 : -1 });
  }
  out.sort((a, b) => a.x - b.x);
  return out;
}

/**
 * Binary inside test from an integer winding number under a fill rule.
 * @param {number} w
 * @param {'nonzero'|'evenodd'} rule
 * @returns {boolean}
 */
export function insideFromWinding(w, rule) {
  return rule === EVENODD ? Math.abs(w) % 2 === 1 : w !== 0;
}

/**
 * Fractional coverage from an *accumulated* (possibly fractional) winding value, as
 * produced by the analytic rasterizer. Nonzero saturates: min(1, |acc|). Evenodd is
 * the triangle wave of acc mod 2 — winding 0→0, 1→1, 2→0, … — which reproduces the
 * even-odd parity for integer windings and interpolates linearly between them.
 * @param {number} acc
 * @param {'nonzero'|'evenodd'} rule
 * @returns {number} coverage in [0, 1]
 */
export function coverageFromAcc(acc, rule) {
  if (rule === EVENODD) {
    const f = Math.abs(acc) % 2;
    return f <= 1 ? f : 2 - f;
  }
  return Math.min(1, Math.abs(acc));
}
