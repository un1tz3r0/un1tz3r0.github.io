// F6 — full segment/segment intersection contract.
//
// intersectSegments reports every intersection between two segments as either a
// transversal-or-tangential *point* {tA, tB, point, tangential} or, where the curves
// run coincident over a positive-length stretch, an *overlap interval*
// {tA0, tA1, tB0, tB1} (tA0 < tA1; the tB values correspond to the same physical
// endpoints and may run backwards). This is the foundation of the boolean engine —
// degeneracy handling here (parallels, tangencies, shared endpoints, coincidence) is
// deliberate, not incidental.
//
// Closed forms are used wherever the algebra permits:
// - line/line          — 2×2 solve; collinear pairs → interval overlap.
// - line/quad,cubic    — the curve's coordinate along the line normal is a polynomial
//                        in u; roots via roots.js, line parameter recovered by
//                        projection onto the line direction.
// - line/arc           — map through the ellipse's inverse transform (rotate −φ,
//                        scale 1/rx, 1/ry) onto the unit circle; quadratic in the
//                        line parameter; angles → t via the center parameterization.
// - circular arc pair  — classic circle–circle construction; coincident circles →
//                        angular-interval intersection.
// Remaining pairs (Bézier/Bézier, anything with an elliptical arc that is not a
// line) fall back to the kernel's subdivision+Newton transversal search (upgraded in
// stage A2 of the F6 plan).
//
// Parameters are snapped to 0/1 within EPS_PARAM (shared endpoints, T-junctions);
// tangentiality is classified uniformly by the sine of the angle between the two
// curve tangents at the reported parameters (≤ EPS_TANGENT).

import { pointAt, derivativeAt, boundingBox, splitAt, nearestPoint } from './segment.js';
import { arcCenter } from './arc.js';
import { vec2, sub, dot, cross, len } from './vec2.js';
import { eq, isZero, EPS, EPS_COINCIDENT, EPS_PARAM, EPS_ANGLE, EPS_TANGENT } from './tolerance.js';
import { quadraticRoots, cubicRoots } from './roots.js';

const TAU = 2 * Math.PI;

// Snap a parameter to the [0,1] domain: exact 0/1 within EPS_PARAM, null outside.
function snapParam(t, eps = EPS_PARAM) {
  if (Math.abs(t) <= eps) return 0;
  if (Math.abs(t - 1) <= eps) return 1;
  return t > 0 && t < 1 ? t : null;
}

// Sine-of-angle test between the two curve tangents at a candidate intersection.
function isTangentialAt(a, tA, b, tB) {
  const da = derivativeAt(a, tA);
  const db = derivativeAt(b, tB);
  const la = len(da);
  const lb = len(db);
  if (la === 0 || lb === 0) return true; // degenerate: no transversal direction
  return Math.abs(cross(da, db)) <= EPS_TANGENT * la * lb;
}

function pushPoint(points, a, b, tA, tB) {
  const point = pointAt(a, tA);
  for (const h of points) {
    if (
      Math.hypot(h.point.x - point.x, h.point.y - point.y) <= EPS_COINCIDENT &&
      Math.abs(h.tA - tA) <= EPS_PARAM &&
      Math.abs(h.tB - tB) <= EPS_PARAM
    ) {
      return;
    }
  }
  points.push({ tA, tB, point, tangential: isTangentialAt(a, tA, b, tB) });
}

function finalize(points, overlaps) {
  points.sort((p, q) => p.tA - q.tA || p.tB - q.tB);
  overlaps.sort((p, q) => p.tA0 - q.tA0);
  return { points, overlaps };
}

// Reverse the roles of a and b in a result.
function swapped(res) {
  return {
    points: res.points.map((h) => ({ tA: h.tB, tB: h.tA, point: h.point, tangential: h.tangential })),
    overlaps: res.overlaps.map((o) =>
      o.tB0 <= o.tB1
        ? { tA0: o.tB0, tA1: o.tB1, tB0: o.tA0, tB1: o.tA1 }
        : { tA0: o.tB1, tA1: o.tB0, tB0: o.tA1, tB1: o.tA0 },
    ),
  };
}

// --- line/line -------------------------------------------------------------------------

function lineLine(a, b) {
  const points = [];
  const overlaps = [];
  const r = sub(a.p1, a.p0);
  const s = sub(b.p1, b.p0);
  const lr = len(r);
  const ls = len(s);
  const denom = cross(r, s);

  if (Math.abs(denom) <= EPS * lr * ls) {
    // Parallel. Collinear iff b.p0 sits on a's infinite line (geometric distance).
    const perpDist = lr === 0 ? len(sub(b.p0, a.p0)) : Math.abs(cross(sub(b.p0, a.p0), r)) / lr;
    if (perpDist <= EPS_COINCIDENT || lr === 0 || ls === 0) {
      const l2 = lr * lr;
      if (l2 === 0) return finalize(points, overlaps); // degenerate a: nothing useful
      const u0 = dot(sub(b.p0, a.p0), r) / l2;
      const u1 = dot(sub(b.p1, a.p0), r) / l2;
      const lo = Math.max(0, Math.min(u0, u1));
      const hi = Math.min(1, Math.max(u0, u1));
      if (hi - lo > EPS_PARAM) {
        // b-parameter of the physical point at a-parameter u.
        const bParamAt = (u) => {
          const p = vec2(a.p0.x + u * r.x, a.p0.y + u * r.y);
          return dot(sub(p, b.p0), s) / (ls * ls);
        };
        overlaps.push({
          tA0: snapParam(lo) ?? lo,
          tA1: snapParam(hi) ?? hi,
          tB0: snapParam(bParamAt(lo)) ?? bParamAt(lo),
          tB1: snapParam(bParamAt(hi)) ?? bParamAt(hi),
        });
      } else if (hi - lo >= -EPS_PARAM) {
        // Endpoint-to-endpoint touch of collinear segments.
        const u = 0.5 * (lo + hi);
        const tA = snapParam(u);
        const tB = snapParam(dot(sub(pointAt(a, u), b.p0), s) / (ls * ls));
        if (tA !== null && tB !== null) pushPoint(points, a, b, tA, tB);
      }
    }
    return finalize(points, overlaps);
  }

  const qp = sub(b.p0, a.p0);
  const tA = snapParam(cross(qp, s) / denom);
  const tB = snapParam(cross(qp, r) / denom);
  if (tA !== null && tB !== null) pushPoint(points, a, b, tA, tB);
  return finalize(points, overlaps);
}

// --- line/Bézier -----------------------------------------------------------------------

// Roots of the Bézier's coordinate along the line normal; the line parameter is the
// projection of the root point onto the line direction.
function lineBezier(l, bez) {
  const points = [];
  const r = sub(l.p1, l.p0);
  const n = vec2(-r.y, r.x);
  const c = (p) => dot(sub(p, l.p0), n);

  let roots;
  if (bez.type === 'quad') {
    const c0 = c(bez.p0);
    const c1 = c(bez.p1);
    const c2 = c(bez.p2);
    roots = quadraticRoots(c0 - 2 * c1 + c2, 2 * (c1 - c0), c0);
  } else {
    const c0 = c(bez.p0);
    const c1 = c(bez.p1);
    const c2 = c(bez.p2);
    const c3 = c(bez.p3);
    roots = cubicRoots(
      -c0 + 3 * c1 - 3 * c2 + c3,
      3 * c0 - 6 * c1 + 3 * c2,
      3 * (c1 - c0),
      c0,
    );
  }

  const l2 = dot(r, r);
  for (const u of roots) {
    const tB = snapParam(u);
    if (tB === null) continue;
    const p = pointAt(bez, tB);
    const tA = snapParam(dot(sub(p, l.p0), r) / l2);
    if (tA === null) continue;
    pushPoint(points, l, bez, tA, tB);
  }
  return finalize(points, []);
}

// --- line/arc --------------------------------------------------------------------------

// Map absolute ellipse angle θ to the arc's parameter, or null when θ is outside the
// swept range (candidates cover the 2π wrap in both directions).
function thetaToParam(c, theta) {
  if (isZero(c.dtheta)) return null;
  const d = (theta - c.theta1) % TAU;
  for (const delta of [d, d - TAU, d + TAU]) {
    const t = snapParam(delta / c.dtheta, EPS_ANGLE / Math.abs(c.dtheta) + EPS_PARAM);
    if (t !== null) return t;
  }
  return null;
}

function lineArc(l, a) {
  const points = [];
  const c = arcCenter(a);
  const cosP = Math.cos(c.phi);
  const sinP = Math.sin(c.phi);
  // Into the unit-circle frame: rotate by −φ about the center, scale by 1/rx, 1/ry.
  const toUnit = (p) => {
    const dx = p.x - c.cx;
    const dy = p.y - c.cy;
    return vec2((cosP * dx + sinP * dy) / c.rx, (-sinP * dx + cosP * dy) / c.ry);
  };
  const q0 = toUnit(l.p0);
  const q1 = toUnit(l.p1);
  const qd = sub(q1, q0);

  // |q0 + t·qd|² = 1.
  const roots = quadraticRoots(dot(qd, qd), 2 * dot(q0, qd), dot(q0, q0) - 1);
  for (const t of roots) {
    const tA = snapParam(t);
    if (tA === null) continue;
    const q = vec2(q0.x + t * qd.x, q0.y + t * qd.y);
    const tB = thetaToParam(c, Math.atan2(q.y, q.x));
    if (tB === null) continue;
    pushPoint(points, l, a, tA, tB);
  }
  return finalize(points, []);
}

// --- circular arc / circular arc -------------------------------------------------------

// The arc's swept angle set as a linear interval {lo, len} with lo normalized to
// [0, 2π) — orientation is dropped (thetaToParam restores per-arc parameters).
function angleSpan(c) {
  const lo = c.dtheta >= 0 ? c.theta1 : c.theta1 + c.dtheta;
  return { lo: ((lo % TAU) + TAU) % TAU, len: Math.abs(c.dtheta) };
}

function circleCircle(a, b) {
  const points = [];
  const overlaps = [];
  const ca = arcCenter(a);
  const cb = arcCenter(b);
  const r1 = ca.rx;
  const r2 = cb.rx;
  const dx = cb.cx - ca.cx;
  const dy = cb.cy - ca.cy;
  const d = Math.hypot(dx, dy);

  if (d <= EPS_COINCIDENT) {
    if (!eq(r1, r2)) return finalize(points, overlaps); // concentric, different radii
    // Coincident circles: intersect the two angular spans on the shared circle.
    const sa = angleSpan(ca);
    const sbb = angleSpan(cb);
    for (const shift of [-TAU, 0, TAU]) {
      const lo = Math.max(sa.lo, sbb.lo + shift);
      const hi = Math.min(sa.lo + sa.len, sbb.lo + shift + sbb.len);
      if (hi - lo <= EPS_ANGLE) {
        if (hi - lo >= -EPS_ANGLE) {
          // Endpoint touch on the shared circle.
          const th = 0.5 * (lo + hi);
          const tA = thetaToParam(ca, th);
          const tB = thetaToParam(cb, th);
          if (tA !== null && tB !== null) pushPoint(points, a, b, tA, tB);
        }
        continue;
      }
      const pa0 = thetaToParam(ca, lo);
      const pa1 = thetaToParam(ca, hi);
      const pb0 = thetaToParam(cb, lo);
      const pb1 = thetaToParam(cb, hi);
      if (pa0 === null || pa1 === null || pb0 === null || pb1 === null) continue;
      overlaps.push(
        pa0 <= pa1
          ? { tA0: pa0, tA1: pa1, tB0: pb0, tB1: pb1 }
          : { tA0: pa1, tA1: pa0, tB0: pb1, tB1: pb0 },
      );
    }
    return finalize(points, overlaps);
  }

  // Distinct centers: circles are tangent (one point), secant (two), or apart (none).
  const tangent = eq(d, r1 + r2, EPS_COINCIDENT) || eq(d, Math.abs(r1 - r2), EPS_COINCIDENT);
  if (!tangent && (d > r1 + r2 || d < Math.abs(r1 - r2))) return finalize(points, overlaps);

  // Foot of the radical axis along the center line, half-chord h off it.
  const along = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = tangent ? 0 : Math.sqrt(Math.max(0, r1 * r1 - along * along));
  const ux = dx / d;
  const uy = dy / d;
  const mx = ca.cx + along * ux;
  const my = ca.cy + along * uy;
  for (const sgn of h === 0 ? [0] : [1, -1]) {
    const px = mx - sgn * h * uy;
    const py = my + sgn * h * ux;
    const tA = thetaToParam(ca, Math.atan2(py - ca.cy, px - ca.cx));
    const tB = thetaToParam(cb, Math.atan2(py - cb.cy, px - cb.cx));
    if (tA !== null && tB !== null) pushPoint(points, a, b, tA, tB);
  }
  return finalize(points, overlaps);
}

// --- dispatch --------------------------------------------------------------------------

const isCircular = (seg) => seg.type === 'arc' && eq(seg.rx, seg.ry);
const isBezier = (seg) => seg.type === 'quad' || seg.type === 'cubic';

// General engine for pairs without a closed form (Bézier/Bézier, elliptical-arc
// mixes): recursive exact-bbox subdivision isolates candidate parameter boxes and
// coincident stretches; adjacent boxes are clustered so each true intersection fires
// one Newton polish (this keeps a tangency — a contiguous run of touching leaf boxes —
// as a single reported point).

const WINDOW_MIN = 1 / 4096; // leaf window size in parameter space (2^-12)

function bboxesOverlap(ba, bb, margin) {
  return !(
    ba.maxX < bb.minX - margin ||
    bb.maxX < ba.minX - margin ||
    ba.maxY < bb.minY - margin ||
    bb.maxY < ba.minY - margin
  );
}

// A piece is the exact sub-curve of an original segment on the global window [t0,t1].
function splitPiece(p) {
  const [l, r] = splitAt(p.seg, 0.5);
  const tm = 0.5 * (p.t0 + p.t1);
  return [
    { seg: l, t0: p.t0, t1: tm },
    { seg: r, t0: tm, t1: p.t1 },
  ];
}

// Coincidence probe: all samples of pb lie on pa (within EPS_COINCIDENT).
function piecesCoincide(pa, pb) {
  for (const u of [0, 0.25, 0.5, 0.75, 1]) {
    if (nearestPoint(pa.seg, pointAt(pb.seg, u)).dist > EPS_COINCIDENT) return false;
  }
  return true;
}

function collectWindows(pa, pb, cands, coins) {
  if (!bboxesOverlap(boundingBox(pa.seg), boundingBox(pb.seg), EPS_COINCIDENT)) return;
  if (piecesCoincide(pa, pb)) {
    coins.push({ b0: pb.t0, b1: pb.t1 });
    return; // the whole b-window lies on a — no point hunting inside it
  }
  const la = pa.t1 - pa.t0;
  const lb = pb.t1 - pb.t0;
  if (la <= WINDOW_MIN && lb <= WINDOW_MIN) {
    cands.push({ ta0: pa.t0, ta1: pa.t1, tb0: pb.t0, tb1: pb.t1 });
    return;
  }
  const as = la > WINDOW_MIN ? splitPiece(pa) : [pa];
  const bs = lb > WINDOW_MIN ? splitPiece(pb) : [pb];
  for (const na of as) for (const nb of bs) collectWindows(na, nb, cands, coins);
}

// Merge candidate boxes that touch in BOTH parameters — a tangency's contiguous run
// of leaves collapses into one cluster (one Newton start, one reported point).
function clusterBoxes(boxes) {
  const clusters = boxes.map((b) => ({ ...b }));
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < clusters.length && !merged; i++) {
      for (let j = i + 1; j < clusters.length && !merged; j++) {
        const a = clusters[i];
        const b = clusters[j];
        if (
          b.ta0 <= a.ta1 + WINDOW_MIN &&
          a.ta0 <= b.ta1 + WINDOW_MIN &&
          b.tb0 <= a.tb1 + WINDOW_MIN &&
          a.tb0 <= b.tb1 + WINDOW_MIN
        ) {
          a.ta0 = Math.min(a.ta0, b.ta0);
          a.ta1 = Math.max(a.ta1, b.ta1);
          a.tb0 = Math.min(a.tb0, b.tb0);
          a.tb1 = Math.max(a.tb1, b.tb1);
          clusters.splice(j, 1);
          merged = true;
        }
      }
    }
  }
  return clusters;
}

// Polish a candidate to a true intersection. Transversal candidates use the 2D Newton
// step on A(tA) − B(tB) = 0; when the Jacobian is (near-)singular — a tangency — fall
// back to alternating projection (nearestPoint coordinate descent), which converges
// linearly to the touch point.
function polish(a, b, tA, tB) {
  for (let i = 0; i < 60; i++) {
    const pa = pointAt(a, tA);
    const pb = pointAt(b, tB);
    const fx = pa.x - pb.x;
    const fy = pa.y - pb.y;
    if (Math.hypot(fx, fy) <= 1e-13) break;
    const da = derivativeAt(a, tA);
    const db = derivativeAt(b, tB);
    const det = db.x * da.y - da.x * db.y;
    if (Math.abs(det) <= 1e-12 * len(da) * len(db)) {
      const nb = nearestPoint(b, pa);
      const na = nearestPoint(a, pointAt(b, nb.t));
      if (Math.abs(na.t - tA) <= 1e-15 && Math.abs(nb.t - tB) <= 1e-15) break;
      tA = na.t;
      tB = nb.t;
    } else {
      tA -= (-db.y * fx + db.x * fy) / det;
      tB -= (-da.y * fx + da.x * fy) / det;
      tA = Math.min(1.05, Math.max(-0.05, tA));
      tB = Math.min(1.05, Math.max(-0.05, tB));
    }
  }
  const pa = pointAt(a, Math.min(1, Math.max(0, tA)));
  const pb = pointAt(b, Math.min(1, Math.max(0, tB)));
  return { tA, tB, dist: Math.hypot(pa.x - pb.x, pa.y - pb.y) };
}

function generic(a, b) {
  const points = [];
  const overlaps = [];
  const cands = [];
  const coins = [];
  collectWindows({ seg: a, t0: 0, t1: 1 }, { seg: b, t0: 0, t1: 1 }, cands, coins);

  // Coincident stretches: merge b-parameter windows, refine the boundaries by
  // bisection on "point of B lies on A", then map the endpoints onto A's parameter.
  let merged = [];
  if (coins.length) {
    coins.sort((p, q) => p.b0 - q.b0);
    merged = [{ ...coins[0] }];
    for (const w of coins.slice(1)) {
      const last = merged[merged.length - 1];
      if (w.b0 <= last.b1 + EPS_PARAM) last.b1 = Math.max(last.b1, w.b1);
      else merged.push({ ...w });
    }
    const onA = (t) => nearestPoint(a, pointAt(b, t)).dist <= EPS_COINCIDENT;
    const refine = (inside, outside) => {
      for (let i = 0; i < 48; i++) {
        const mid = 0.5 * (inside + outside);
        if (onA(mid)) inside = mid;
        else outside = mid;
      }
      return inside;
    };
    for (const w of merged) {
      let b0 = w.b0 > EPS_PARAM ? refine(w.b0, Math.max(0, w.b0 - 2 * WINDOW_MIN)) : 0;
      let b1 = w.b1 < 1 - EPS_PARAM ? refine(w.b1, Math.min(1, w.b1 + 2 * WINDOW_MIN)) : 1;
      if (b1 - b0 <= 10 * EPS_PARAM) continue;
      b0 = snapParam(b0, 1e-7) ?? b0;
      b1 = snapParam(b1, 1e-7) ?? b1;
      const projA = (t) => {
        const hit = nearestPoint(a, pointAt(b, t));
        return snapParam(hit.t, 1e-7) ?? hit.t;
      };
      const a0 = projA(b0);
      const a1 = projA(b1);
      overlaps.push(
        a0 <= a1 ? { tA0: a0, tA1: a1, tB0: b0, tB1: b1 } : { tA0: a1, tA1: a0, tB0: b1, tB1: b0 },
      );
    }
  }

  for (const box of clusterBoxes(cands)) {
    const hit = polish(a, b, 0.5 * (box.ta0 + box.ta1), 0.5 * (box.tb0 + box.tb1));
    if (hit.dist > 10 * EPS_COINCIDENT) continue;
    const tA = snapParam(hit.tA, 1e-7);
    const tB = snapParam(hit.tB, 1e-7);
    if (tA === null || tB === null) continue;
    // Drop stray hits that sit inside a reported overlap (its endpoints carry them).
    const inOverlap = overlaps.some(
      (o) =>
        tA >= o.tA0 - 1e-6 &&
        tA <= o.tA1 + 1e-6 &&
        tB >= Math.min(o.tB0, o.tB1) - 1e-6 &&
        tB <= Math.max(o.tB0, o.tB1) + 1e-6,
    );
    if (!inOverlap) pushPoint(points, a, b, tA, tB);
  }
  return finalize(points, overlaps);
}

/**
 * All intersections between two segments.
 *
 * @returns {{points: {tA:number, tB:number, point:{x,y}, tangential:boolean}[],
 *            overlaps: {tA0:number, tA1:number, tB0:number, tB1:number}[]}}
 *   Points sorted by tA; parameters snapped to exact 0/1 within EPS_PARAM.
 *   Overlap intervals have tA0 < tA1; tB0/tB1 name the same physical endpoints and
 *   may run backwards for anti-parallel coincidence.
 */
export function intersectSegments(a, b) {
  if (a.type === 'line') {
    if (b.type === 'line') return lineLine(a, b);
    if (isBezier(b)) return lineBezier(a, b);
    return lineArc(a, b);
  }
  if (b.type === 'line') {
    return swapped(intersectSegments(b, a));
  }
  if (isCircular(a) && isCircular(b)) return circleCircle(a, b);
  return generic(a, b);
}
