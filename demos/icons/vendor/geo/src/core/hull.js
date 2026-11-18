// F13 — exact support points and the convex hull of curved geometry.
//
// The primitive that makes this honest is `supportPoint(seg, direction)`: the *exact*
// extreme point of a segment along a direction, in closed form per type. Hulling control
// points would bound the wrong shape — a cubic lies strictly inside its control polygon,
// so the result would be correct but loose, and an arc has no control polygon at all.
// Hulling exact extremes over a refined direction sweep bounds the real curve.
//
// The sweep is adaptive rather than fixed: start from a coarse ring of directions, then
// repeatedly ask each hull edge whether the true geometry pokes outside it, and insert the
// support point where it does. That terminates on a deviation bound instead of a step
// count, so the answer is right at any scale — the same policy the spiral and the offset
// fitter follow.

import { vec2 } from './vec2.js';
import { pointAt, startPoint, endPoint, LINE, QUAD, CUBIC, ARC } from './segment.js';
import { arcCenter } from './arc.js';
import { quadraticRoots } from './roots.js';
import { EPS, FLATNESS } from './tolerance.js';

const TAU = 2 * Math.PI;

function dot(p, u) {
  return p.x * u.x + p.y * u.y;
}

// Candidate parameters where a segment's extreme along `u` can sit: the endpoints, plus
// the interior stationary points of t ↦ C(t)·u.
function extremeParams(seg, u) {
  switch (seg.type) {
    case LINE:
      return [];
    case QUAD: {
      // C'(t)·u is linear in t: 2[(1−t)(p1−p0) + t(p2−p1)]·u = 0.
      const a = dot(vec2(seg.p1.x - seg.p0.x, seg.p1.y - seg.p0.y), u);
      const b = dot(vec2(seg.p2.x - seg.p1.x, seg.p2.y - seg.p1.y), u);
      const den = a - b;
      if (Math.abs(den) <= EPS) return [];
      const t = a / den;
      return t > 0 && t < 1 ? [t] : [];
    }
    case CUBIC: {
      // C'(t)·u is quadratic: 3[(1−t)²d0 + 2(1−t)t·d1 + t²d2]·u with dk the hodograph legs.
      const d0 = dot(vec2(seg.p1.x - seg.p0.x, seg.p1.y - seg.p0.y), u);
      const d1 = dot(vec2(seg.p2.x - seg.p1.x, seg.p2.y - seg.p1.y), u);
      const d2 = dot(vec2(seg.p3.x - seg.p2.x, seg.p3.y - seg.p2.y), u);
      const A = d0 - 2 * d1 + d2;
      const B = 2 * (d1 - d0);
      const C = d0;
      return quadraticRoots(A, B, C).filter((t) => t > 0 && t < 1);
    }
    case ARC: {
      // P(θ) = C + R(φ)·diag(rx,ry)·(cosθ, sinθ). dP/dθ·u = 0 gives a single tangent
      // direction, so the two extremes are θ and θ+π; both are kept and clamped to the
      // sweep by the caller.
      const c = arcCenter(seg);
      const cosP = Math.cos(c.phi);
      const sinP = Math.sin(c.phi);
      const ax = -c.rx * (cosP * u.x + sinP * u.y);
      const ay = c.ry * (-sinP * u.x + cosP * u.y);
      if (Math.abs(ax) <= EPS && Math.abs(ay) <= EPS) return [];
      const theta = Math.atan2(ay, -ax); // solves ax·sinθ + ay·cosθ = 0
      const out = [];
      for (const th of [theta, theta + Math.PI]) {
        // Back to the segment parameter: θ = θ₁ + t·Δθ.
        if (Math.abs(c.dtheta) <= EPS) continue;
        let d = th - c.theta1;
        // Bring the difference into the swept range's period before dividing.
        if (c.dtheta > 0) d -= TAU * Math.floor(d / TAU);
        else d -= TAU * Math.ceil(d / TAU);
        const t = d / c.dtheta;
        if (t > 0 && t < 1) out.push(t);
      }
      return out;
    }
    default:
      throw new TypeError(`supportPoint: unknown segment type ${seg && seg.type}`);
  }
}

/**
 * The exact extreme point of a segment along `direction` — the point maximizing
 * `p · direction`.
 *
 * Closed form per type: a Bézier's stationary points are the roots of `d/dt (C·u)`
 * (linear for a quad, quadratic for a cubic), and an arc's are the two angles where the
 * ellipse's tangent is perpendicular to `u`, clamped to the swept range.
 *
 * @param {object} seg
 * @param {{x:number,y:number}} direction  need not be unit
 * @returns {{point:{x,y}, t:number, value:number}}
 */
export function supportPoint(seg, direction) {
  const u = direction;
  let best = { point: startPoint(seg), t: 0, value: dot(startPoint(seg), u) };
  const consider = (t, p) => {
    const v = dot(p, u);
    if (v > best.value) best = { point: p, t, value: v };
  };
  consider(1, endPoint(seg));
  for (const t of extremeParams(seg, u)) consider(t, pointAt(seg, t));
  return best;
}

/**
 * The exact extreme point of a whole path along `direction`.
 * @returns {{point, subpathIndex, segIndex, t, value} | null}
 */
export function supportPointOfPath(pth, direction) {
  let best = null;
  for (let si = 0; si < pth.subpaths.length; si++) {
    const segs = pth.subpaths[si].segments;
    for (let gi = 0; gi < segs.length; gi++) {
      const hit = supportPoint(segs[gi], direction);
      if (best === null || hit.value > best.value) {
        best = { point: hit.point, subpathIndex: si, segIndex: gi, t: hit.t, value: hit.value };
      }
    }
  }
  return best;
}

// Andrew's monotone chain. Returns counter-clockwise, without collinear interior points.
function monotoneChain(points, eps) {
  const pts = points.slice().sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  const dedup = [];
  for (const p of pts) {
    const q = dedup[dedup.length - 1];
    if (q && Math.abs(q.x - p.x) <= eps && Math.abs(q.y - p.y) <= eps) continue;
    dedup.push(p);
  }
  if (dedup.length < 3) return dedup;
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const build = (src) => {
    const out = [];
    for (const p of src) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= eps) out.pop();
      out.push(p);
    }
    out.pop();
    return out;
  };
  return [...build(dedup), ...build(dedup.slice().reverse())];
}

/**
 * The convex hull of a path's true geometry, as a list of points in counter-clockwise
 * order.
 *
 * Adaptive: an initial ring of `seedDirections` support points is hulled, then each edge
 * is asked whether the geometry pokes outside it by more than `tolerance`; where it does,
 * the support point in that edge's outward normal is inserted and the hull rebuilt. So the
 * result is a bound on the *curve*, to a stated deviation, rather than on its control
 * points.
 *
 * @param {object} pth  Path
 * @param {{tolerance?:number, seedDirections?:number, maxPoints?:number}} [opts]
 * @returns {{x:number,y:number}[]}
 */
export function convexHullPoints(pth, opts = {}) {
  const tolerance = opts.tolerance ?? FLATNESS;
  const seeds = Math.max(4, opts.seedDirections ?? 16);
  const maxPoints = opts.maxPoints ?? 4096;

  const points = [];
  const seen = new Set();
  const addSupport = (u) => {
    const hit = supportPointOfPath(pth, u);
    if (hit === null) return false;
    const key = `${hit.point.x.toFixed(12)},${hit.point.y.toFixed(12)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    points.push(hit.point);
    return true;
  };

  for (let i = 0; i < seeds; i++) {
    const a = (TAU * i) / seeds;
    addSupport(vec2(Math.cos(a), Math.sin(a)));
  }
  if (points.length === 0) return [];

  let hull = monotoneChain(points, EPS);
  // Refine until no edge is violated by more than the tolerance.
  for (let pass = 0; pass < 64 && hull.length >= 2 && points.length < maxPoints; pass++) {
    let added = false;
    for (let i = 0; i < hull.length; i++) {
      const a = hull[i];
      const b = hull[(i + 1) % hull.length];
      const ex = b.x - a.x;
      const ey = b.y - a.y;
      const len = Math.hypot(ex, ey);
      if (len <= EPS) continue;
      // Outward normal of a counter-clockwise hull edge.
      const n = vec2(ey / len, -ex / len);
      const hit = supportPointOfPath(pth, n);
      if (hit === null) continue;
      const overshoot = dot(hit.point, n) - dot(a, n);
      if (overshoot > tolerance && addSupport(n)) added = true;
    }
    if (!added) break;
    hull = monotoneChain(points, EPS);
  }
  return hull;
}

/**
 * The convex hull as a closed Path, ready for area, containment and the fitters.
 * @param {object} pth
 * @param {object} [opts]  see `convexHullPoints`
 * @returns {object} Path — empty for a path with no segments
 */
export function convexHull(pth, opts = {}) {
  const pts = convexHullPoints(pth, opts);
  if (pts.length < 2) return { subpaths: [], fillRule: 'nonzero' };
  const segments = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    if (Math.hypot(b.x - a.x, b.y - a.y) > EPS) segments.push({ type: LINE, p0: a, p1: b });
  }
  if (segments.length < 2) return { subpaths: [], fillRule: 'nonzero' };
  // Close the loop explicitly (F21): the last segment must land on the first point.
  const last = segments[segments.length - 1];
  const first = segments[0];
  if (Math.hypot(last.p1.x - first.p0.x, last.p1.y - first.p0.y) > EPS) {
    segments.push({ type: LINE, p0: last.p1, p1: first.p0 });
  }
  return { subpaths: [{ segments, closed: true }], fillRule: 'nonzero' };
}
