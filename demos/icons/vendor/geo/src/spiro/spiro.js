// F9 — spiro → path: solve a spiro contour and emit Bézier geometry.
//
// Emission follows the reference (libspiro, as algorithm reference — see
// solve.js header): a solved spiral segment becomes one cubic when its total
// bend is below `bendTolerance` (default 1 radian), splitting at the curvature
// midpoint otherwise (recursion capped at depth 5 ⇒ ≤ 64 cubics per segment);
// nearly-straight pieces (bend ≤ 1e-8) become lines. Cubic handles take the ⅓
// rule with the even/odd angle split of the curvature polynomial. Conversion is
// approximate by design — round-trips hold within tolerances, never exactly.

import { line, cubic } from '../core/segment.js';
import { vec2 } from '../core/vec2.js';
import { subpath, path, NONZERO } from '../core/path.js';
import { setupPath, solveSpiro, integrateSpiro, segmentBend } from './solve.js';
import { tagOutputPath } from '../core/attributes.js';

// Long names (public) and FF letter codes (also accepted) → internal code.
const TYPE_CODES = {
  corner: 'v',
  g4: 'o',
  g2: 'c',
  left: '[',
  right: ']',
  anchor: 'a',
  handle: 'h',
  v: 'v',
  o: 'o',
  c: 'c',
  '[': '[',
  ']': ']',
  a: 'a',
  h: 'h',
};

/** Public name of an internal knot-type code. */
export const SPIRO_TYPES = Object.freeze({
  v: 'corner',
  o: 'g4',
  c: 'g2',
  '[': 'left',
  ']': 'right',
  a: 'anchor',
  h: 'handle',
});

// Emit one solved spiral piece (normalized coords) into state.out, chaining
// from state.cur. `endReal` carries the exact user-space endpoint when the
// piece ends on a knot, so knots land exactly despite normalization round-off.
function emitPiece(state, ks, x0, y0, x1, y1, endReal, depth) {
  const bend = segmentBend(ks);
  const target = endReal ?? state.denorm(x1, y1);
  if (bend <= 1e-8) {
    state.out.push(line(state.cur, target));
    state.cur = target;
    return;
  }
  const segCh = Math.hypot(x1 - x0, y1 - y0);
  const segTh = Math.atan2(y1 - y0, x1 - x0);
  const xy = integrateSpiro(ks);
  const ch = Math.hypot(xy.x, xy.y);
  const th = Math.atan2(xy.y, xy.x);
  const scale = segCh / ch;
  const rot = segTh - th;
  if (depth > 5 || bend < state.bendTol) {
    const thEven = (1 / 384) * ks[3] + (1 / 8) * ks[1] + rot;
    const thOdd = (1 / 48) * ks[2] + 0.5 * ks[0];
    const u0 = (scale / 3) * Math.cos(thEven - thOdd);
    const v0 = (scale / 3) * Math.sin(thEven - thOdd);
    const u1 = (scale / 3) * Math.cos(thEven + thOdd);
    const v1 = (scale / 3) * Math.sin(thEven + thOdd);
    state.out.push(
      cubic(state.cur, state.denorm(x0 + u0, y0 + v0), state.denorm(x1 - u1, y1 - v1), target),
    );
    state.cur = target;
    return;
  }
  // Split at the arclength midpoint: ksub is the curvature polynomial of the
  // first half reparameterized onto [-½, ½]; the increments after the first
  // recursion shift it to the second half.
  const ksub = [
    0.5 * ks[0] - 0.125 * ks[1] + (1 / 64) * ks[2] - (1 / 768) * ks[3],
    0.25 * ks[1] - (1 / 16) * ks[2] + (1 / 128) * ks[3],
    0.125 * ks[2] - (1 / 32) * ks[3],
    (1 / 16) * ks[3],
  ];
  const thsub =
    rot - 0.25 * ks[0] + (1 / 32) * ks[1] - (1 / 384) * ks[2] + (1 / 6144) * ks[3];
  const cth = 0.5 * scale * Math.cos(thsub);
  const sth = 0.5 * scale * Math.sin(thsub);
  const xysub = integrateSpiro(ksub);
  const xmid = x0 + cth * xysub.x - sth * xysub.y;
  const ymid = y0 + cth * xysub.y + sth * xysub.x;
  emitPiece(state, ksub, x0, y0, xmid, ymid, null, depth + 1);
  ksub[0] += 0.25 * ks[1] + (1 / 384) * ks[3];
  ksub[1] += 0.125 * ks[2];
  ksub[2] += (1 / 16) * ks[3];
  emitPiece(state, ksub, xmid, ymid, x1, y1, endReal, depth + 1);
}

/**
 * Convert spiro contour(s) to a Path.
 *
 * A contour is `{ points, closed }` with points `{x, y, type}`; types by long
 * name ('corner' | 'g4' | 'g2' | 'left' | 'right' | 'anchor' | 'handle') or FF
 * letter code ('v','o','c','[',']','a','h'). Open contours get free ends (the
 * given end types are overridden, except a trailing anchor+handle pair, which
 * fixes the end tangent). Behaves like FontForge's spiro layer: G4/G2 knots are
 * curvature-continuous, left/right bracket exactly straight stretches, an
 * anchor+handle pair fixes the tangent direction at the anchor.
 * @param {object|object[]} contours  one contour or an array
 * @param {{bendTolerance?: number, fillRule?: string}} [opts]
 *        bendTolerance: max radians of bend per emitted cubic (default 1)
 * @returns {object} Path
 */
export function spiroToPath(contours, opts = {}) {
  const list = Array.isArray(contours) ? contours : [contours];
  const bendTol = opts.bendTolerance ?? 1;
  const subs = [];
  for (const contour of list) {
    if (!contour || !Array.isArray(contour.points)) {
      throw new TypeError('spiroToPath: a contour must be { points: [...], closed?: boolean }');
    }
    const closed = !!contour.closed;
    let pts = contour.points;
    if (pts.length < 2) continue; // nothing to draw
    const knots = pts.map((p, idx) => {
      const ty = TYPE_CODES[p.type];
      if (!ty) throw new TypeError(`spiroToPath: unknown point type '${p.type}' at index ${idx}`);
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) {
        throw new TypeError(`spiroToPath: non-finite coordinates at index ${idx}`);
      }
      return { x: p.x, y: p.y, ty };
    });
    if (!closed) {
      knots[0].ty = '{';
      // Keep a trailing anchor+handle pair (fixed end tangent); otherwise free.
      if (knots[knots.length - 1].ty !== 'h') knots[knots.length - 1].ty = '}';
    } else {
      // Rotation of a closed contour is free — pick a start the solver accepts
      // (']'/'h' cannot be first, '['/'a' cannot be last).
      const bad = (k) =>
        k[0].ty === ']' || k[0].ty === 'h' || k[k.length - 1].ty === '[' || k[k.length - 1].ty === 'a';
      let rot = 0;
      while (rot < knots.length && bad(knots)) {
        knots.push(knots.shift());
        rot++;
      }
      if (bad(knots)) {
        throw new TypeError('spiroToPath: closed contour has no valid starting point');
      }
      if (rot > 0) pts = [...pts.slice(rot), ...pts.slice(0, rot)];
    }

    const { segs, nseg, dm } = setupPath(knots);
    solveSpiro(segs, nseg);

    const n = knots.length;
    // Exact user-space coordinates per knot index (handles collapse onto their
    // anchors, matching the solver's phantom-segment treatment).
    const realKnot = (i) => {
      const k = i % n;
      const src = knots[k].ty === 'h' ? pts[k - 1] : pts[k];
      return vec2(src.x, src.y);
    };
    const state = { out: [], cur: realKnot(0), denorm: (x, y) => vec2(x * dm.scale + dm.ox, y * dm.scale + dm.oy), bendTol };
    for (let i = 0; i < nseg; i++) {
      if (segs[i].segCh === 0) continue; // collapsed phantom (anchor→handle)
      emitPiece(state, segs[i].ks, segs[i].x, segs[i].y, segs[i + 1].x, segs[i + 1].y, realKnot(i + 1), 0);
    }
    if (state.out.length) subs.push(subpath(state.out, { closed }));
  }
  return tagOutputPath(path(subs, { fillRule: opts.fillRule ?? NONZERO }), opts.outAttrs);
}
