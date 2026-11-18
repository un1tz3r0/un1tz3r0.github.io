// F10 — filleting a single corner.
//
// A fillet of radius r at the junction of segments A and B is the circle of radius r
// tangent to both, sitting on the inside of the turn, with the corner trimmed back to
// the two tangency points.
//
// The centre is where the two *inward offsets* meet — that is the whole idea, and it
// gives the solve for free in the cases that matter most: `offsetSegment` is exact for
// lines and circular arcs, and `intersectSegments` is closed-form for the line/line,
// line/arc and arc/arc pairs, so a corner between straight or circular neighbours is
// solved exactly by the seed alone, with no iteration. There is deliberately no separate
// "closed form for line/line" branch: it would duplicate machinery that already answers
// the question exactly.
//
// For quad, cubic and elliptical neighbours the offset is a *fitted* chain (accurate to
// `FLATNESS`, not exact), so the seed is only approximate. Those get polished by Newton
// on the exact tangency system
//
//     F(ta, tb) = [A(ta) + d·N_A(ta)] − [B(tb) + d·N_B(tb)] = 0,      d = ±r
//
// whose Jacobian columns follow from the 2D Frenet relations (with the library's left
// normal and signed `curvatureAt`): d/dt [P + d·N] = (1 − d·κ)·P′. Polishing against the
// true curves rather than their approximations is what makes the result tangent to
// machine precision instead of merely fit-accurate.

import {
  pointAt,
  tangentAt,
  normalAt,
  curvatureAt,
  derivativeAt,
  nearestPoint,
  subsegment,
  arc,
  withMeta,
  startPoint,
  endPoint,
} from './segment.js';
import { offsetSegment } from './offset.js';
import { intersectSegments } from './intersections.js';
import { boundingBox } from './segment.js';
import { arcLength, arcLengthTo } from './segment.js';
import { cross, dot, dist } from './vec2.js';
import { EPS, EPS_PARAM, EPS_COINCIDENT, FLATNESS } from './tolerance.js';
import { withAttrs, invariant, length as lengthAttr } from './attributes.js';

const NEWTON_ITERS = 24;

/**
 * Default minimum corner angle, in radians (5°). Corners flatter than this are treated
 * as non-corners: a nearly-straight junction is usually discretization noise rather than
 * design intent, and rounding one moves a lot of geometry for no visible benefit. The
 * same threshold rejects near-cusps from the other end, where the fillet would have to
 * reach implausibly far back along both neighbours.
 */
export const DEFAULT_MIN_ANGLE = (5 * Math.PI) / 180;

// Diagonal of a segment's bounding box — the local length scale used to turn absolute
// tolerances into something proportionate.
function segScale(seg) {
  const b = boundingBox(seg);
  return Math.max(Math.hypot(b.maxX - b.minX, b.maxY - b.minY), 1);
}

function fail(reason, extra = {}) {
  return { ok: false, reason, ...extra };
}

// Where the two inward offsets meet, nearest the corner. Returns null when they do not
// meet at all — which is what "this radius does not fit here" looks like geometrically.
function seedCenter(a, b, d, corner, tolerance) {
  const chainA = offsetSegment(a, d, tolerance);
  const chainB = offsetSegment(b, d, tolerance);
  if (chainA.length === 0 || chainB.length === 0) return null;

  let best = null;
  for (const sa of chainA) {
    for (const sb of chainB) {
      const { points } = intersectSegments(sa, sb);
      for (const h of points) {
        const dd = dist(h.point, corner);
        if (best === null || dd < best.dist) best = { point: h.point, dist: dd };
      }
    }
  }
  return best === null ? null : best.point;
}

// Newton on the tangency system. Returns the polished parameters, or null if it walks
// out of the segments or fails to converge.
function polish(a, b, d, ta0, tb0, tol) {
  let ta = ta0;
  let tb = tb0;
  for (let i = 0; i < NEWTON_ITERS; i++) {
    const pa = pointAt(a, ta);
    const na = normalAt(a, ta);
    const pb = pointAt(b, tb);
    const nb = normalAt(b, tb);
    const fx = pa.x + d * na.x - (pb.x + d * nb.x);
    const fy = pa.y + d * na.y - (pb.y + d * nb.y);
    if (Math.hypot(fx, fy) <= tol) return { ta, tb };

    // Columns of the Jacobian: (1 − d·κ)·P′ for each side, the second negated.
    const da = derivativeAt(a, ta);
    const db = derivativeAt(b, tb);
    const ka = 1 - d * curvatureAt(a, ta);
    const kb = 1 - d * curvatureAt(b, tb);
    const j11 = ka * da.x;
    const j21 = ka * da.y;
    const j12 = -kb * db.x;
    const j22 = -kb * db.y;
    const det = j11 * j22 - j12 * j21;
    if (Math.abs(det) < EPS) return null; // parallel offsets: no isolated solution
    const dta = (-fx * j22 + fy * j12) / det;
    const dtb = (-j11 * fy + j21 * fx) / det;
    ta += dta;
    tb += dtb;
    // A solution outside the segments means the fillet does not fit between them.
    if (ta < -EPS || ta > 1 + EPS || tb < -EPS || tb > 1 + EPS) return null;
    ta = Math.min(1, Math.max(0, ta));
    tb = Math.min(1, Math.max(0, tb));
  }
  return null;
}

/**
 * Fillet the corner where segment `a` ends and segment `b` begins.
 *
 * Returns the trimmed neighbours and the tangent arc between them, or a refusal with a
 * named `reason`. This is the single-corner primitive; the path-level operators (H5) add
 * corner selection, the shared trim budget, and the rest of the guard set.
 *
 * @param {object} a  the segment arriving at the corner
 * @param {object} b  the segment leaving it
 * @param {number} radius
 * @param {{tolerance?: number, minAngle?: number}} [opts]
 *   `tolerance` is the offset-fit tolerance used for the seed (default `FLATNESS`); the
 *   returned tangency is polished well past it. `minAngle` (radians, default
 *   `DEFAULT_MIN_ANGLE` = 5°) gates both ends of the corner-angle range.
 * @returns {{ok:true, a:object, b:object, arc:object, ta:number, tb:number,
 *            center:{x,y}, radius:number, turn:number}
 *        | {ok:false, reason:string}}
 *   The `ok` result also carries `interiorAngle` and the `setbackA`/`setbackB` arc
 *   lengths each neighbour gives up, which is what the path-level budget needs.
 *
 *   Refusals, each with a named `reason`:
 *   - `'bad-radius'`, `'not-adjacent'`, `'degenerate-neighbour'` — malformed input.
 *   - `'tangent-continuous'` — nothing turns here, so there is no corner to round.
 *   - `'angle-too-shallow'` / `'angle-too-sharp'` — outside `minAngle` at either end of
 *     the range (also reports `interiorAngle`).
 *   - `'radius-exceeds-feature'` — the tangency pinned at a neighbour's far end: the
 *     radius wants more room than the neighbour has.
 *   - `'radius-exceeds-curvature'` — the radius reaches past a neighbour's local centre
 *     of curvature, where the inward offset degenerates.
 *   - `'no-solution'` — the inward offsets never meet at all.
 */
export function filletCorner(a, b, radius, opts = {}) {
  if (typeof radius !== 'number' || !Number.isFinite(radius) || radius <= 0) {
    return fail('bad-radius');
  }
  const corner = endPoint(a);
  if (dist(corner, startPoint(b)) > EPS_COINCIDENT) return fail('not-adjacent');

  const tIn = tangentAt(a, 1);
  const tOut = tangentAt(b, 0);
  if (Math.hypot(tIn.x, tIn.y) <= EPS || Math.hypot(tOut.x, tOut.y) <= EPS) {
    return fail('degenerate-neighbour');
  }
  const turn = cross(tIn, tOut);
  if (Math.abs(turn) <= EPS) return fail('tangent-continuous');

  // Angle gates. `interiorAngle` is the corner's included angle: near π it barely bends,
  // near 0 it doubles back.
  const minAngle = opts.minAngle ?? DEFAULT_MIN_ANGLE;
  const interiorAngle = Math.PI - Math.abs(Math.atan2(turn, dot(tIn, tOut)));
  if (interiorAngle > Math.PI - minAngle) return fail('angle-too-shallow', { interiorAngle });
  if (interiorAngle < minAngle) return fail('angle-too-sharp', { interiorAngle });

  // The centre lies on the inside of the turn: a left turn puts it on the left normal.
  const d = turn > 0 ? radius : -radius;
  const tolerance = opts.tolerance ?? FLATNESS;
  const seed = seedCenter(a, b, d, corner, tolerance);
  if (seed === null) return fail('no-solution');

  const scale = Math.max(segScale(a), segScale(b));
  const solved = polish(
    a,
    b,
    d,
    nearestPoint(a, seed).t,
    nearestPoint(b, seed).t,
    EPS_COINCIDENT * scale,
  );
  if (solved === null) return fail('no-solution');

  const { ta, tb } = solved;

  // Feature-size gate: a tangency pinned at a neighbour's far end means the solve was
  // clamped there rather than converging inside it — the radius is too big for the room
  // available, which is a different failure from "the offsets never met".
  if (ta <= EPS_PARAM || tb >= 1 - EPS_PARAM) return fail('radius-exceeds-feature');

  // Curvature gate: the inward offset degenerates once the radius reaches the local
  // centre of curvature (1 − d·κ ≤ 0), and past that point a "tangent" circle sits on
  // the wrong side of the curve. This is the guard that stops a fillet from cutting
  // through a tightly curved neighbour.
  if (1 - d * curvatureAt(a, ta) <= 0 || 1 - d * curvatureAt(b, tb) <= 0) {
    return fail('radius-exceeds-curvature');
  }

  const pa = pointAt(a, ta);
  const pb = pointAt(b, tb);
  const na = normalAt(a, ta);
  const center = { x: pa.x + d * na.x, y: pa.y + d * na.y };
  if (dist(pa, pb) <= EPS_COINCIDENT) return fail('no-solution'); // zero-length arc

  // The fillet arc bends the way the corner turns. Its sweep is π − interiorAngle < π,
  // so it is never the large arc.
  const filletArc = withAttrs(arc(pa, pb, radius, radius, 0, false, turn > 0), {
    ...(opts.outAttrs ?? {}),
    origin: invariant('fillet'),
    radius: lengthAttr(radius),
  });

  return {
    ok: true,
    a: subsegment(a, 0, ta),
    b: subsegment(b, tb, 1),
    arc: filletArc,
    ta,
    tb,
    center,
    radius,
    turn,
    interiorAngle,
    // How much arc length each neighbour gives up. The path-level operator needs these
    // to share a segment's length between the corners at both of its ends.
    setbackA: arcLength(a) - arcLengthTo(a, ta),
    setbackB: arcLengthTo(b, tb),
  };
}
