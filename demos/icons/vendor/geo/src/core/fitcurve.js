// Subdivide-and-fit: approximate an arbitrary curve by a chain of cubics.
//
// Hoisted out of offset.js (F5), where it was the offset approximator, so that F11
// centerline recovery can reuse it instead of growing a third fitter in the codebase.
// The algorithm is unchanged; only its input became abstract.
//
// A **fittable** is the least a curve has to tell this fitter:
//
//   point(t)     position at t ∈ [0,1]
//   tangent(t)   unit tangent at t
//   error(cand)  how far a candidate cubic strays from it — the caller's own metric,
//                because the meaningful one differs: offsetting measures |distance to
//                the base curve − |d||, centerline recovery measures |distance to the
//                ribbon's side − w/2|. Neither is "deviation at equal parameter", which
//                would report a reparameterization as an error.
//   split()      the same curve as two fittables covering [0,½] and [½,1]
//
// Splitting rather than reparameterizing is deliberate: it keeps each level's arithmetic
// identical to the un-hoisted version (a piece is split exactly once, never re-derived
// from the original by a different route), so this refactor cannot move a fitted result.

import { line, cubic, pointAt } from './segment.js';
import { add, sub, scale, len } from './vec2.js';
import { EPS, FLATNESS } from './tolerance.js';

/** Maximum recursion depth (2^16 pieces worst case; a handful of levels in practice). */
export const MAX_FIT_DEPTH = 16;

/** Where a candidate is checked. The midpoint is interpolated exactly, so it is absent. */
export const CHECK_TS = [1 / 8, 1 / 4, 3 / 8, 5 / 8, 3 / 4, 7 / 8];

/**
 * One candidate cubic spanning a whole fittable.
 *
 * Endpoints sit on the curve, handle directions follow its end tangents, and the handle
 * lengths α, β are solved so the candidate's midpoint B(½) = (P0 + 3P1 + 3P2 + P3)/8
 * interpolates the curve's midpoint:  α·T0 − β·T1 = (8/3)·(m − (p0+p3)/2).
 *
 * Near-parallel end tangents make that 2×2 system singular; the fallback is chord/3
 * handles, and the caller's error check forces subdivision if that is not good enough.
 *
 * @param {{point:(t:number)=>{x,y}, tangent:(t:number)=>{x,y}}} piece
 * @returns {object | null} a cubic, or null at a cusp (degenerate end tangent)
 */
export function fitCubicCandidate(piece) {
  const p0 = piece.point(0);
  const p3 = piece.point(1);
  const t0 = piece.tangent(0);
  const t1 = piece.tangent(1);
  if (len(t0) <= EPS || len(t1) <= EPS) return null; // cusp at an endpoint
  const m = piece.point(0.5);

  const rx = (8 / 3) * (m.x - (p0.x + p3.x) / 2);
  const ry = (8 / 3) * (m.y - (p0.y + p3.y) / 2);
  const det = t0.x * -t1.y - -t1.x * t0.y; // |T0 −T1|
  let alpha;
  let beta;
  if (Math.abs(det) > 1e-12) {
    alpha = (rx * -t1.y - -t1.x * ry) / det;
    beta = (t0.x * ry - rx * t0.y) / det;
  }
  if (!(alpha > 0) || !(beta > 0)) {
    const third = Math.hypot(p3.x - p0.x, p3.y - p0.y) / 3;
    alpha = third;
    beta = third;
  }
  return cubic(p0, add(p0, scale(t0, alpha)), sub(p3, scale(t1, beta)), p3);
}

function recurse(piece, tolerance, maxDepth, depth, out) {
  const candidate = fitCubicCandidate(piece);
  if (candidate !== null && piece.error(candidate) <= tolerance) {
    out.push(candidate);
    return;
  }
  if (depth >= maxDepth) {
    // Best effort at the cap (an offset cusp's neighbourhood, or a curve that simply
    // will not sit still): the candidate, or a straight connector when the end tangents
    // are degenerate.
    out.push(candidate ?? line(piece.point(0), piece.point(1)));
    return;
  }
  const [a, b] = piece.split();
  recurse(a, tolerance, maxDepth, depth + 1, out);
  recurse(b, tolerance, maxDepth, depth + 1, out);
}

/**
 * Fit a chain of cubics to a fittable, subdividing until its own error metric is within
 * `tolerance`. Always returns at least one segment.
 *
 * @param {{point:Function, tangent:Function, error:Function, split:Function}} piece
 * @param {{tolerance?:number, maxDepth?:number}} [opts]
 * @returns {object[]} cubics (rarely a line, at the depth cap on a cusp)
 */
export function fitCubicChain(piece, opts = {}) {
  const out = [];
  recurse(piece, opts.tolerance ?? FLATNESS, opts.maxDepth ?? MAX_FIT_DEPTH, 0, out);
  return out;
}

/**
 * The plain deviation metric: max distance between the candidate and the curve at equal
 * parameter, over `CHECK_TS`.
 *
 * Only honest when the two are parameterized comparably — a fitter whose source is
 * arc-length-parameterized and whose candidate is not will over-report. Offsetting and
 * centerline recovery both supply something better; this exists for callers with nothing
 * to compare against but the parameter itself.
 *
 * @param {object} candidate  a cubic
 * @param {{point:(t:number)=>{x,y}}} piece
 * @returns {number}
 */
export function parameterDeviation(candidate, piece) {
  let worst = 0;
  for (const t of CHECK_TS) {
    const q = pointAt(candidate, t);
    const p = piece.point(t);
    worst = Math.max(worst, Math.hypot(q.x - p.x, q.y - p.y));
  }
  return worst;
}
