// Segment constructors and shared segment utilities.
//
// A segment is a tagged plain-data value discriminated by its `type` field. We preserve
// true segment types — in particular elliptical arcs are NOT flattened to cubics —
// because downstream features (exact true-curve boolean ops, offset fidelity, the
// concentric-arc case of nearest-path-to-path) depend on the real geometry.
//
// Generic kernel dispatchers (pointAt, boundingBox, splitAt, …) that `switch` on
// `type` are added in Phase 2 (F1) and live alongside these constructors.

// Per-type kernel modules. The import cycle (these modules import the constructors below)
// is safe: all cross-references happen at call time, never at module evaluation time.
import * as Line from './line.js';
import * as Quad from './quad.js';
import * as Cubic from './cubic.js';
import * as Arc from './arc.js';
import { intersectSegments } from './intersections.js';
import { normalize, perp, dist2 } from './vec2.js';
import { FLATNESS, EPS, EPS_PARAM } from './tolerance.js';
import { integrate } from './quadrature.js';
import { reverseAttributes } from './attributes.js';

/** @typedef {'line'|'quad'|'cubic'|'arc'} SegmentType */

export const LINE = 'line';
export const QUAD = 'quad';
export const CUBIC = 'cubic';
export const ARC = 'arc';

function assertPoint(p, where) {
  if (
    p == null ||
    typeof p.x !== 'number' ||
    typeof p.y !== 'number' ||
    !Number.isFinite(p.x) ||
    !Number.isFinite(p.y)
  ) {
    throw new TypeError(`${where}: expected a finite Vec2 {x,y}`);
  }
}

function assertFiniteNumber(n, where) {
  if (typeof n !== 'number' || !Number.isFinite(n)) {
    throw new TypeError(`${where}: expected a finite number`);
  }
}

/** Straight line from p0 to p1. */
export function line(p0, p1) {
  assertPoint(p0, 'line.p0');
  assertPoint(p1, 'line.p1');
  return { type: LINE, p0, p1 };
}

/** Quadratic Bézier: endpoints p0, p2 with control p1. */
export function quad(p0, p1, p2) {
  assertPoint(p0, 'quad.p0');
  assertPoint(p1, 'quad.p1');
  assertPoint(p2, 'quad.p2');
  return { type: QUAD, p0, p1, p2 };
}

/** Cubic Bézier: endpoints p0, p3 with controls p1, p2. */
export function cubic(p0, p1, p2, p3) {
  assertPoint(p0, 'cubic.p0');
  assertPoint(p1, 'cubic.p1');
  assertPoint(p2, 'cubic.p2');
  assertPoint(p3, 'cubic.p3');
  return { type: CUBIC, p0, p1, p2, p3 };
}

/**
 * Elliptical arc in SVG endpoint parameterization: from p0 to p1 on an ellipse with
 * radii rx, ry rotated by xAxisRotation (radians), selected by the largeArc and sweep
 * boolean flags. Radii are stored as given; the center parameterization is derived on
 * demand by the kernel (arcCenter, Phase 2).
 */
export function arc(p0, p1, rx, ry, xAxisRotation, largeArc, sweep) {
  assertPoint(p0, 'arc.p0');
  assertPoint(p1, 'arc.p1');
  assertFiniteNumber(rx, 'arc.rx');
  assertFiniteNumber(ry, 'arc.ry');
  assertFiniteNumber(xAxisRotation, 'arc.xAxisRotation');
  return {
    type: ARC,
    p0,
    p1,
    rx: Math.abs(rx),
    ry: Math.abs(ry),
    xAxisRotation,
    largeArc: !!largeArc,
    sweep: !!sweep,
  };
}

/** Start point of any segment. */
export function startPoint(seg) {
  return seg.p0;
}

/** End point of any segment (p1/p2/p3 depending on type). */
export function endPoint(seg) {
  switch (seg.type) {
    case LINE:
    case ARC:
      return seg.p1;
    case QUAD:
      return seg.p2;
    case CUBIC:
      return seg.p3;
    default:
      throw new TypeError(`endPoint: unknown segment type ${seg && seg.type}`);
  }
}

// --- generic kernel dispatchers (F1) ---------------------------------------------------
// Each switches on seg.type and delegates to the per-type module. A switch on a
// discriminant translates directly to match/switch in the other target languages.

function moduleFor(type) {
  switch (type) {
    case LINE:
      return Line;
    case QUAD:
      return Quad;
    case CUBIC:
      return Cubic;
    case ARC:
      return Arc;
    default:
      throw new TypeError(`segment: unknown type ${type}`);
  }
}

/** Point on the segment at parameter t ∈ [0,1]. */
export function pointAt(seg, t) {
  return moduleFor(seg.type).pointAt(seg, t);
}

/** First derivative (velocity) at parameter t. */
export function derivativeAt(seg, t) {
  return moduleFor(seg.type).derivativeAt(seg, t);
}

/** Second derivative (acceleration) at parameter t. */
export function derivative2At(seg, t) {
  return moduleFor(seg.type).derivative2At(seg, t);
}

/**
 * Signed curvature at t: κ = cross(C', C'') / ‖C'‖³. Positive where the curve bends
 * toward the left normal (counter-clockwise turning). Zero for lines; ±1/r on a
 * circular arc. Returns 0 at a degenerate point (‖C'‖ ≈ 0) rather than dividing by ~0.
 */
export function curvatureAt(seg, t) {
  const d1 = derivativeAt(seg, t);
  const d2 = derivative2At(seg, t);
  const speed = Math.hypot(d1.x, d1.y);
  if (speed <= EPS) return 0;
  return (d1.x * d2.y - d1.y * d2.x) / (speed * speed * speed);
}

/**
 * The same geometry traversed in the opposite direction (t ↦ 1−t). Control points
 * reverse; an arc swaps endpoints and flips its sweep flag (largeArc is unchanged —
 * it selects the same physical arc from the swapped endpoints).
 */
export function reverseSegment(seg) {
  switch (seg.type) {
    case LINE:
      return inheritReversed(line(seg.p1, seg.p0), seg);
    case QUAD:
      return inheritReversed(quad(seg.p2, seg.p1, seg.p0), seg);
    case CUBIC:
      return inheritReversed(cubic(seg.p3, seg.p2, seg.p1, seg.p0), seg);
    case ARC:
      return inheritReversed(
        arc(seg.p1, seg.p0, seg.rx, seg.ry, seg.xAxisRotation, seg.largeArc, !seg.sweep),
        seg,
      );
    default:
      throw new TypeError(`reverseSegment: unknown segment type ${seg && seg.type}`);
  }
}

// --- optional `meta` provenance (advisory; see DESIGN "Value types") ------------------
//
// A segment may carry an optional `meta` object recording where it came from. It is
// structurally a no-op: no geometric operation reads it to decide geometry, and every
// operation behaves identically when it is absent (which it always is on anything parsed
// from SVG). Operations that *re-express the same geometry* — splitAt, subsegment,
// reverseSegment — carry it through; operations that synthesize new geometry set their
// own, and the boolean engine strips it (a rechained piece has no single origin).
//
// **`meta` is untyped and is therefore carried verbatim, never rescaled** — an untyped
// number cannot be transformed correctly, which is the whole thesis of F22. A segment's
// typed `attrs` (see `attributes.js`) travel the same routes but *do* know how to
// transform; the library's own producers write those. `meta` remains for callers who
// want a free-form scratch channel.

/**
 * A copy of `seg` carrying `meta`. Pass `undefined` to strip it.
 * @param {object} seg
 * @param {object | undefined} meta
 * @returns {object} a new segment
 */
export function withMeta(seg, meta) {
  const out = { ...seg };
  if (meta === undefined) delete out.meta;
  else out.meta = meta;
  return out;
}

/** The segment's advisory provenance, or undefined. */
export function metaOf(seg) {
  return seg.meta;
}

// Carry a source segment's advisory `meta` and typed `attrs` onto derived geometry that
// re-expresses the *same* curve (split, subsegment): the pieces of a fillet arc are still
// fillet arcs, and an attribute describing the original describes each piece.
function inherit(derived, src) {
  let out = src.meta === undefined ? derived : withMeta(derived, src.meta);
  if (src.attrs !== undefined) out = { ...out, attrs: src.attrs };
  return out;
}

// The same, for derived geometry whose *direction of travel* is reversed — `side` and
// `direction` attributes are defined relative to travel and must be re-expressed.
function inheritReversed(derived, src) {
  let out = src.meta === undefined ? derived : withMeta(derived, src.meta);
  if (src.attrs !== undefined) out = { ...out, attrs: reverseAttributes(src.attrs) };
  return out;
}

// --- arbitrary-range extraction --------------------------------------------------------

// The blossom (polar form) of a Bézier: de Casteljau run with a different parameter at
// each level. Symmetric in its arguments, and defined for parameters outside [0,1],
// which is exactly what makes it an *extrapolation* tool as well as a subdivision one.
function blossom(points, params) {
  let pts = points;
  for (const t of params) {
    const next = [];
    for (let i = 0; i + 1 < pts.length; i++) next.push(lerpPoint(pts[i], pts[i + 1], t));
    pts = next;
  }
  return pts[0];
}

function lerpPoint(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/**
 * The piece of a segment between two parameters — **including parameters outside
 * [0, 1]**, where the result is the segment's own extrapolation rather than a portion
 * of it.
 *
 * This is the extend operation corner treatments need: un-filleting a corner means
 * running both neighbours past their endpoints until they meet again. Extrapolation is
 * exact, not approximate — a Bézier's blossom is defined for any parameters, and an arc
 * simply sweeps a longer angle.
 *
 * `subsegment(seg, 0, 1)` returns the segment unchanged; `t0 > t1` returns the piece
 * reversed. An arc cannot be extended to a sweep of 2π or more (SVG's endpoint
 * parameterization cannot express it — the endpoints would coincide), which throws.
 *
 * @param {object} seg
 * @param {number} t0
 * @param {number} t1
 * @returns {object} a segment of the same type
 */
export function subsegment(seg, t0, t1) {
  assertFiniteNumber(t0, 'subsegment.t0');
  assertFiniteNumber(t1, 'subsegment.t1');
  switch (seg.type) {
    case LINE:
      return inherit(line(lerpPoint(seg.p0, seg.p1, t0), lerpPoint(seg.p0, seg.p1, t1)), seg);
    case QUAD: {
      const P = [seg.p0, seg.p1, seg.p2];
      return inherit(
        quad(blossom(P, [t0, t0]), blossom(P, [t0, t1]), blossom(P, [t1, t1])),
        seg,
      );
    }
    case CUBIC: {
      const P = [seg.p0, seg.p1, seg.p2, seg.p3];
      return inherit(
        cubic(
          blossom(P, [t0, t0, t0]),
          blossom(P, [t0, t0, t1]),
          blossom(P, [t0, t1, t1]),
          blossom(P, [t1, t1, t1]),
        ),
        seg,
      );
    }
    case ARC:
      return inherit(Arc.subsegment(seg, t0, t1), seg);
    default:
      throw new TypeError(`subsegment: unknown segment type ${seg && seg.type}`);
  }
}

/** Unit tangent at t. Zero vector at a cusp / degenerate point. */
export function tangentAt(seg, t) {
  return normalize(derivativeAt(seg, t));
}

/** Unit normal at t — the left perpendicular of the tangent (rotate +90°). */
export function normalAt(seg, t) {
  return perp(tangentAt(seg, t));
}

/** Exact axis-aligned bounding box {minX,minY,maxX,maxY}. */
export function boundingBox(seg) {
  return moduleFor(seg.type).boundingBox(seg);
}

/**
 * Split the segment at t into two segments of the same type. Advisory `meta` is carried
 * onto both halves — the pieces of a fillet arc are still fillet arcs.
 */
export function splitAt(seg, t) {
  const [l, r] = moduleFor(seg.type).splitAt(seg, t);
  return [inherit(l, seg), inherit(r, seg)];
}

// Perpendicular distance from p to the infinite line through a,b (for flatness testing).
function distToLine(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  return Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / Math.sqrt(l2);
}

// Max deviation of interior samples from the chord — the flatness measure.
function chordDeviation(seg) {
  const a = startPoint(seg);
  const b = endPoint(seg);
  let d = 0;
  for (const tt of [0.25, 0.5, 0.75]) {
    d = Math.max(d, distToLine(pointAt(seg, tt), a, b));
  }
  return d;
}

function flattenInto(seg, t0, t1, tol, out, depth) {
  if (depth <= 0 || chordDeviation(seg) <= tol) {
    out.push({ t: t1, point: endPoint(seg) });
    return;
  }
  const tm = 0.5 * (t0 + t1);
  const [l, r] = splitAt(seg, 0.5);
  flattenInto(l, t0, tm, tol, out, depth - 1);
  flattenInto(r, tm, t1, tol, out, depth - 1);
}

/**
 * Adaptive flatten to a polyline with parameter tags.
 * @returns {{t:number, point:{x:number,y:number}}[]} start..end inclusive
 */
export function flattenParam(seg, tol = FLATNESS) {
  const out = [{ t: 0, point: startPoint(seg) }];
  flattenInto(seg, 0, 1, tol, out, 24);
  return out;
}

/** Adaptive flatten to a list of points (start..end inclusive). */
export function flatten(seg, tol = FLATNESS) {
  return flattenParam(seg, tol).map((s) => s.point);
}

/** Arc length of the whole segment. */
export function arcLength(seg) {
  return arcLengthTo(seg, 1);
}

/** Arc length from the start to parameter t. */
export function arcLengthTo(seg, t) {
  if (t <= 0) return 0;
  const speed = (u) => {
    const d = derivativeAt(seg, u);
    return Math.hypot(d.x, d.y);
  };
  return integrate(speed, 0, t, 24);
}

/**
 * Inverse arc length: the parameter t at which the arc length from the start reaches s
 * (clamped to [0, total length]).
 *
 * Newton iteration on the monotone g(t) = arcLengthTo(t) − s with g'(t) = |C'(t)|,
 * guarded by a shrinking bisection bracket: whenever the Newton step leaves the current
 * bracket (flat speed near a cusp, or overshoot), it falls back to the bracket midpoint,
 * so convergence is unconditional.
 * @param {object} seg
 * @param {number} s  target arc length from the segment start
 * @returns {number} t ∈ [0, 1]
 */
export function tAtLength(seg, s) {
  const total = arcLength(seg);
  if (s <= 0 || total <= 0) return 0;
  if (s >= total) return 1;
  let lo = 0;
  let hi = 1;
  let t = s / total; // linear seed: exact for constant speed
  for (let i = 0; i < 48; i++) {
    const g = arcLengthTo(seg, t) - s;
    if (Math.abs(g) <= EPS * Math.max(1, total)) break;
    if (g > 0) hi = t;
    else lo = t;
    const d = derivativeAt(seg, t);
    const speed = Math.hypot(d.x, d.y);
    let tn = speed > EPS ? t - g / speed : NaN;
    if (!(tn > lo && tn < hi)) tn = 0.5 * (lo + hi); // NaN-safe bracket fallback
    if (Math.abs(tn - t) < EPS_PARAM) {
      t = tn;
      break;
    }
    t = tn;
  }
  return t;
}

// Generic nearest point: seed from flattening samples, then Newton-polish the parameter
// minimizing |C(t) − q|². Used for quad/cubic/arc (line has a closed form).
function nearestGeneric(seg, q) {
  const samples = flattenParam(seg, FLATNESS);
  let bestT = samples[0].t;
  let bestD2 = dist2(samples[0].point, q);
  for (const s of samples) {
    const d2 = dist2(s.point, q);
    if (d2 < bestD2) {
      bestD2 = d2;
      bestT = s.t;
    }
  }

  let t = bestT;
  const h = 1e-5;
  for (let i = 0; i < 16; i++) {
    const p = pointAt(seg, t);
    const d = derivativeAt(seg, t);
    const rx = p.x - q.x;
    const ry = p.y - q.y;
    const g1 = 2 * (rx * d.x + ry * d.y); // d/dt |C−q|²
    const dp = derivativeAt(seg, Math.min(1, t + h));
    const dm = derivativeAt(seg, Math.max(0, t - h));
    const ddx = (dp.x - dm.x) / (2 * h);
    const ddy = (dp.y - dm.y) / (2 * h);
    const g2 = 2 * (d.x * d.x + d.y * d.y + rx * ddx + ry * ddy);
    if (Math.abs(g2) < 1e-14) break;
    let tn = t - g1 / g2;
    if (tn < 0) tn = 0;
    else if (tn > 1) tn = 1;
    if (Math.abs(tn - t) < 1e-13) {
      t = tn;
      break;
    }
    t = tn;
  }

  const refined = pointAt(seg, t);
  const rd2 = dist2(refined, q);
  if (rd2 <= bestD2) return { t, point: refined, dist: Math.sqrt(rd2) };
  const bp = pointAt(seg, bestT);
  return { t: bestT, point: bp, dist: Math.sqrt(bestD2) };
}

/**
 * Nearest point on the segment to q.
 * @returns {{t:number, point:{x:number,y:number}, dist:number}}
 */
export function nearestPoint(seg, q) {
  if (seg.type === LINE) return Line.nearestPoint(seg, q);
  return nearestGeneric(seg, q);
}

/**
 * Transversal intersections between two segments — a convenience view over the full
 * F6 intersection contract (`intersectSegments` in intersections.js): tangential
 * contacts and coincident-overlap stretches are omitted here; callers that need them
 * use `intersectSegments` directly.
 * @returns {{tA:number, tB:number, point:{x:number,y:number}}[]}
 */
export function intersect(a, b) {
  const { points } = intersectSegments(a, b);
  return points.filter((h) => !h.tangential).map(({ tA, tB, point }) => ({ tA, tB, point }));
}
