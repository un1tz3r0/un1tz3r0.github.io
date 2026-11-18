// F19 — stroke space: the coordinate map that bends geometry along a spine.
//
// A point `(u, v)` in stroke space is `u` of arc length along the spine and `v` of signed
// offset across it, along the spine's **left** normal (the library's convention
// throughout). Mapping to the plane is `P(u) + v·N(u)`.
//
// ## Corners are the whole difficulty
//
// The frame is discontinuous at a corner: `N` jumps by the corner's turn. What happens
// there depends on which side you are on, and the two sides need opposite treatment —
// which is why this is a join problem, not a sampling problem:
//
//   - On the **outer** side of the turn the offsets diverge and leave a wedge of empty
//     space. It has to be filled, by the same three joins stroking uses: `miter` (to the
//     intersection of the two offset lines, subject to a limit), `round` (a fan at radius
//     |v|), or `bevel` (a chord).
//   - On the **inner** side they converge and run past each other. Nothing can be inserted;
//     the mapped geometry genuinely folds over itself, and the honest fix is to let it and
//     resolve the fold with F6's boolean union afterwards.
//
// The sign test is one comparison: with `θ` the signed turn and `v` the signed offset, the
// outer side is `v·θ < 0`. That is exactly the test `offsetPath`'s `joinAtCorner` makes,
// for exactly the same reason.
//
// **The documented fallback:** when |v| exceeds the spine's local radius of curvature the
// map stops being injective — the inner offset has passed through the centre of curvature
// and turned inside out. No join style rescues that, because the geometry really has
// folded. `strokeSpace` reports it (`overRadius`) rather than pretending, and callers that
// care can shrink the pattern or subdivide the spine.

import { vec2 } from '../core/vec2.js';
import {
  arcLength,
  tAtLength,
  pointAt,
  tangentAt,
  curvatureAt,
  endPoint,
} from '../core/segment.js';
import { EPS, EPS_COINCIDENT, FLATNESS } from '../core/tolerance.js';

/** Turn below which a junction is smooth and needs no join treatment. */
export const SMOOTH_TURN = 1e-6;

// Signed angle from a to b, in (−π, π].
function signedTurn(a, b) {
  return Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);
}

/**
 * Build the coordinate map for a spine.
 *
 * The spine's arc length is measured **once**, here, and every query reuses it. Calling
 * `pointAtLength` per sample instead would re-measure the whole path each time, which is
 * the mistake this codebase has paid for repeatedly.
 *
 * @param {object} spine  Path — its first non-empty subpath is used
 * @param {{join?:'miter'|'round'|'bevel', miterLimit?:number, smoothTurn?:number,
 *          extend?:boolean}} [opts]
 * @returns {object} the map
 */
export function strokeSpace(spine, opts = {}) {
  const sp = spine.subpaths.find((s) => s.segments.length > 0);
  if (!sp) throw new RangeError('strokeSpace: the spine has no segments');
  const join = opts.join ?? 'round';
  if (!['miter', 'round', 'bevel'].includes(join)) {
    throw new TypeError(`strokeSpace: join must be 'miter', 'round' or 'bevel'`);
  }
  const miterLimit = opts.miterLimit ?? 4;
  const extend = opts.extend ?? false;
  const tolerance = opts.tolerance ?? FLATNESS;
  const smoothTurn = opts.smoothTurn ?? SMOOTH_TURN;

  const segs = sp.segments;
  const lengths = segs.map((s) => arcLength(s));
  const prefix = [];
  let acc = 0;
  for (const l of lengths) {
    prefix.push(acc);
    acc += l;
  }
  const total = acc;

  // Corners: interior junctions (plus the seam, when closed) whose turn exceeds `smoothTurn`.
  const corners = [];
  const junctionCount = sp.closed ? segs.length : segs.length - 1;
  for (let k = 0; k < junctionCount; k++) {
    const inSeg = segs[k];
    const outSeg = segs[(k + 1) % segs.length];
    const turn = signedTurn(tangentAt(inSeg, 1), tangentAt(outSeg, 0));
    if (Math.abs(turn) <= smoothTurn) continue;
    corners.push({
      u: prefix[k] + lengths[k],
      turn,
      tangentIn: tangentAt(inSeg, 1),
      tangentOut: tangentAt(outSeg, 0),
      point: endPoint(inSeg),
    });
  }

  // Locate an arc length. Exactly at a junction two frames are equally valid — the one
  // arriving along the previous segment and the one leaving along the next — and `side`
  // picks between them: −1 arriving, +1 leaving. Both directions have to be handled
  // explicitly. The plain walk always lands on the *arriving* segment at t = 1, so a
  // request for the leaving frame silently returned the arriving one, and a pattern copy
  // that started exactly on a corner was built half from each: a self-crossing ring.
  const tol = EPS * Math.max(1, total);
  const locate = (u, side) => {
    const s = Math.min(Math.max(u, 0), total);
    let i = 0;
    while (i < segs.length - 1 && prefix[i] + lengths[i] < s - tol) i++;
    if (side > 0 && i < segs.length - 1 && Math.abs(s - (prefix[i] + lengths[i])) <= tol) i += 1;
    else if (side < 0 && i > 0 && Math.abs(s - prefix[i]) <= tol) i -= 1;
    const local = lengths[i] <= EPS ? 0 : tAtLength(segs[i], s - prefix[i]);
    return { segIndex: i, t: local };
  };

  const at = (u, side = 1) => {
    const h = locate(u, side);
    const seg = segs[h.segIndex];
    const point = pointAt(seg, h.t);
    const tangent = tangentAt(seg, h.t);
    return { point, tangent, normal: vec2(-tangent.y, tangent.x), segIndex: h.segIndex, t: h.t };
  };

  // Outside [0, length] the frame is undefined. `extend` continues it along the end
  // tangent, which is what an overhanging copy needs; without it `u` clamps and the
  // overhang piles up on top of the endpoint instead of running past it.
  const toPlane = (u, v, side = 1) => {
    const beyond = extend ? (u < 0 ? u : u > total ? u - total : 0) : 0;
    const f = at(u, side);
    return vec2(
      f.point.x + f.normal.x * v + f.tangent.x * beyond,
      f.point.y + f.normal.y * v + f.tangent.y * beyond,
    );
  };

  return {
    spine: sp,
    length: total,
    closed: sp.closed,
    corners,
    join,
    miterLimit,
    at,
    toPlane,

    /**
     * The signed curvature at `u` — what decides whether an offset of `v` is still a
     * well-defined map. `|v| > 1/|κ|` on the concave side has passed the centre of
     * curvature.
     */
    curvatureAt(u) {
      const h = locate(u, 1);
      return curvatureAt(segs[h.segIndex], h.t);
    },

    /**
     * Does an offset of `v` exceed the local radius of curvature anywhere along the spine?
     * Reported rather than silently produced, because past that point the map is no longer
     * injective and no join style fixes it.
     * @param {number} v
     * @param {number} [samples=64]
     * @returns {{overRadius:boolean, worst:number, atU:number}}
     */
    injectivity(v, samples = 64) {
      let worst = 0;
      let atU = 0;
      for (let k = 0; k <= samples; k++) {
        const u = (total * k) / samples;
        const h = locate(u, 1);
        const kappa = curvatureAt(segs[h.segIndex], h.t);
        // Concave side only: a positive curvature bends toward the left normal, so a
        // positive v on that side is the one that can pass through the centre.
        const ratio = Math.abs(v * kappa);
        if (kappa * v > 0 && ratio > worst) {
          worst = ratio;
          atU = u;
        }
      }
      return { overRadius: worst >= 1, worst, atU };
    },

    /**
     * Map a polyline given in stroke space to the plane, inserting the corner treatment
     * wherever a span crosses a corner.
     *
     * @param {{u:number, v:number}[]} pts  ascending or descending in u
     * @returns {{x:number,y:number}[]}
     */
    mapPolyline(pts) {
      const out = [];
      // Which frame to take at a junction follows the direction of travel, not the index:
      // a point *arrived at* going forward wants the arriving frame, and the same point
      // arrived at going backward — a closed pattern's return edge — wants the leaving one.
      let dir = 1;
      for (let i = 0; i < pts.length; i++) {
        const cur = pts[i];
        const step = i === 0 ? (pts[1]?.u ?? cur.u) - cur.u : cur.u - pts[i - 1].u;
        if (Math.abs(step) > EPS) dir = Math.sign(step);
        const side = i === 0 ? dir : -dir;
        if (i > 0) {
          const prev = pts[i - 1];
          for (const c of crossedCorners(prev.u, cur.u, corners)) {
            // Interpolate v across the corner so a slanted span still meets it correctly.
            const span = cur.u - prev.u;
            const f = Math.abs(span) <= EPS ? 0 : (c.u - prev.u) / span;
            const vAt = prev.v + (cur.v - prev.v) * f;
            // The fan is built frame-before → frame-after. A span crossing the corner in
            // decreasing u meets those two ends in the opposite order, so emitting the fan
            // as built teleports to its far end and sweeps back — which is exactly how a
            // closed pattern's return edge came out crossed.
            const fan = cornerFan(c, vAt, join, miterLimit, tolerance);
            out.push(...(cur.u < prev.u ? fan.reverse() : fan));
          }
        }
        out.push(toPlane(cur.u, cur.v, side));
      }
      return out;
    },
  };
}

// Corners strictly between two arc lengths, in travel order.
function crossedCorners(u0, u1, corners) {
  const lo = Math.min(u0, u1);
  const hi = Math.max(u0, u1);
  const hit = corners.filter((c) => c.u > lo + EPS && c.u < hi - EPS);
  return u1 >= u0 ? hit : hit.reverse();
}

/**
 * The points a corner contributes at offset `v`.
 *
 * Outer side (`v·turn < 0`): the offsets diverge and the gap is filled by the join.
 * Inner side: they converge and overlap; nothing is inserted, and the resulting fold is
 * the caller's to resolve with a boolean union.
 */
export function cornerFan(corner, v, join, miterLimit, tolerance = FLATNESS) {
  const { turn, tangentIn, tangentOut, point } = corner;
  const nIn = vec2(-tangentIn.y, tangentIn.x);
  const nOut = vec2(-tangentOut.y, tangentOut.x);
  const a = vec2(point.x + nIn.x * v, point.y + nIn.y * v);
  const b = vec2(point.x + nOut.x * v, point.y + nOut.y * v);
  if (Math.abs(v) <= EPS_COINCIDENT) return [a]; // on the spine itself the frame pivots in place

  const outer = v * turn < 0;
  if (!outer) return [a, b]; // the inner fold: let it fold, union cleans it

  if (join === 'round') return roundFan(point, a, b, turn, Math.abs(v), tolerance);

  if (join === 'miter') {
    // Intersect the two offset lines: a + s·tIn = b − w·tOut, solved by Cramer.
    const cross = tangentIn.x * tangentOut.y - tangentIn.y * tangentOut.x;
    if (Math.abs(cross) > EPS) {
      const wx = b.x - a.x;
      const wy = b.y - a.y;
      const s = (wx * tangentOut.y - wy * tangentOut.x) / cross;
      const tip = vec2(a.x + tangentIn.x * s, a.y + tangentIn.y * s);
      const reach = Math.hypot(tip.x - point.x, tip.y - point.y) / Math.abs(v);
      if (reach <= miterLimit) return [a, tip, b];
    }
  }
  return [a, b]; // bevel, and the miter fallback past its limit
}

// A circular fan from a to b about `centre`, sweeping `turn`.
//
// The step comes from the tolerance, not from a fixed count: a chord subtending `θ` at
// radius `r` sits `r(1 − cos(θ/2))` inside the arc, so the angle a given sagitta allows
// shrinks as the radius grows. A fixed step would be needlessly fine on a shallow fan and
// visibly faceted on a deep one — the same fan at v = 6 and v = 600 is not the same job.
function roundFan(centre, a, b, turn, radius, tolerance) {
  const a0 = Math.atan2(a.y - centre.y, a.x - centre.x);
  const maxAngle = tolerance >= radius ? Math.PI : 2 * Math.acos(1 - tolerance / radius);
  const steps = Math.max(2, Math.ceil(Math.abs(turn) / maxAngle));
  const out = [];
  for (let k = 0; k <= steps; k++) {
    const ang = a0 + (turn * k) / steps;
    out.push(vec2(centre.x + radius * Math.cos(ang), centre.y + radius * Math.sin(ang)));
  }
  out[out.length - 1] = b;
  return out;
}

/**
 * Where a plane point sits in stroke space — the inverse map.
 *
 * Solved by a coarse sweep over the spine followed by a golden-section refine on the
 * nearest arc length, which is enough for the round-trip guarantee and avoids a
 * closed-form inverse that does not exist for a general spine.
 *
 * @param {object} space  from `strokeSpace`
 * @param {{x,y}} p
 * @param {number} [samples=128]
 * @returns {{u:number, v:number}}
 */
export function fromPlane(space, p, samples = 128) {
  let bestU = 0;
  let bestD = Infinity;
  for (let k = 0; k <= samples; k++) {
    const u = (space.length * k) / samples;
    const f = space.at(u);
    const d = Math.hypot(f.point.x - p.x, f.point.y - p.y);
    if (d < bestD) {
      bestD = d;
      bestU = u;
    }
  }
  const step = space.length / samples;
  let lo = Math.max(0, bestU - step);
  let hi = Math.min(space.length, bestU + step);
  const phi = (Math.sqrt(5) - 1) / 2;
  const distAt = (u) => {
    const f = space.at(u);
    return Math.hypot(f.point.x - p.x, f.point.y - p.y);
  };
  let x1 = hi - phi * (hi - lo);
  let x2 = lo + phi * (hi - lo);
  let f1 = distAt(x1);
  let f2 = distAt(x2);
  for (let i = 0; i < 60; i++) {
    if (f1 < f2) {
      hi = x2;
      x2 = x1;
      f2 = f1;
      x1 = hi - phi * (hi - lo);
      f1 = distAt(x1);
    } else {
      lo = x1;
      x1 = x2;
      f1 = f2;
      x2 = lo + phi * (hi - lo);
      f2 = distAt(x2);
    }
  }
  const u = (lo + hi) / 2;
  const f = space.at(u);
  const v = (p.x - f.point.x) * f.normal.x + (p.y - f.point.y) * f.normal.y;
  return { u, v };
}
