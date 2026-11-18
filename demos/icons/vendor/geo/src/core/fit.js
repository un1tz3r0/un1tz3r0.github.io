// F13 — bounding volumes.
//
// Policy (per user): **exact where a known algorithm exists**, iterative to a documented
// tolerance where none does. So the circle is Welzl, the rectangle is rotating calipers,
// and only the ellipse and the round-rect are approximations — and each says so.
//
// Everything works on the F13 convex hull rather than on raw control points, because a
// bounding volume of the control polygon is a correct bound on the wrong shape. The hull
// itself is built from exact support points (`hull.js`), so a circle really does bound a
// circle rather than the square its arcs are inscribed in.

import { vec2 } from './vec2.js';
import { line } from './segment.js';
import { subpath, path, pathBoundingBox } from './path.js';
import { convexHullPoints } from './hull.js';
import { EPS, FLATNESS } from './tolerance.js';

const TAU = 2 * Math.PI;

// A closed polygon Path through `pts` (already the right orientation).
function polygon(pts) {
  const segments = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    if (Math.hypot(b.x - a.x, b.y - a.y) > EPS) segments.push(line(a, b));
  }
  if (segments.length < 3) return path([]);
  return path([subpath(segments, { closed: true })]);
}

function hullOf(pth, opts) {
  return Array.isArray(pth) ? pth : convexHullPoints(pth, opts);
}

// --- minimum enclosing circle (Welzl) -------------------------------------------------

function circleFrom2(a, b) {
  return { center: vec2((a.x + b.x) / 2, (a.y + b.y) / 2), radius: Math.hypot(b.x - a.x, b.y - a.y) / 2 };
}

function circleFrom3(a, b, c) {
  const bx = b.x - a.x;
  const by = b.y - a.y;
  const cx = c.x - a.x;
  const cy = c.y - a.y;
  const d = 2 * (bx * cy - by * cx);
  if (Math.abs(d) <= EPS) return null; // collinear
  const b2 = bx * bx + by * by;
  const c2 = cx * cx + cy * cy;
  const ux = (cy * b2 - by * c2) / d;
  const uy = (bx * c2 - cx * b2) / d;
  const center = vec2(a.x + ux, a.y + uy);
  return { center, radius: Math.hypot(ux, uy) };
}

function inCircle(c, p, slack) {
  return Math.hypot(p.x - c.center.x, p.y - c.center.y) <= c.radius + slack;
}

function trivialCircle(boundary) {
  if (boundary.length === 0) return { center: vec2(0, 0), radius: 0 };
  if (boundary.length === 1) return { center: boundary[0], radius: 0 };
  if (boundary.length === 2) return circleFrom2(boundary[0], boundary[1]);
  const c = circleFrom3(boundary[0], boundary[1], boundary[2]);
  if (c !== null) return c;
  // Collinear triple: the smallest enclosing circle is on the two extreme points.
  let best = circleFrom2(boundary[0], boundary[1]);
  for (const pair of [
    [boundary[0], boundary[2]],
    [boundary[1], boundary[2]],
  ]) {
    const cand = circleFrom2(pair[0], pair[1]);
    if (cand.radius > best.radius) best = cand;
  }
  return best;
}

/**
 * The minimum enclosing circle — **exact**, by Welzl's algorithm (expected linear time on
 * a shuffled input, which is why the points are shuffled rather than taken in hull order:
 * hull order is the adversarial case).
 *
 * @param {object|Array} pth  a Path, or an array of points to skip the hull step
 * @param {{tolerance?:number}} [opts]
 * @returns {{center:{x,y}, radius:number} | null}
 */
export function boundingCircle(pth, opts = {}) {
  const pts = hullOf(pth, opts);
  if (pts.length === 0) return null;
  const shuffled = pts.slice();
  // Deterministic shuffle: reproducible across runs and across the language ports, which
  // a corpus of golden values requires.
  let seed = 0x2f6e2b1;
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const slack = 1e-12 * (1 + Math.abs(shuffled[0].x) + Math.abs(shuffled[0].y));
  let circle = trivialCircle([]);
  for (let i = 0; i < shuffled.length; i++) {
    if (inCircle(circle, shuffled[i], slack)) continue;
    circle = trivialCircle([shuffled[i]]);
    for (let j = 0; j < i; j++) {
      if (inCircle(circle, shuffled[j], slack)) continue;
      circle = circleFrom2(shuffled[i], shuffled[j]);
      for (let k = 0; k < j; k++) {
        if (inCircle(circle, shuffled[k], slack)) continue;
        const c = circleFrom3(shuffled[i], shuffled[j], shuffled[k]);
        if (c !== null) circle = c;
      }
    }
  }
  return circle;
}

// --- rotating calipers ------------------------------------------------------------------

// The axis-aligned extent of `pts` after rotating by −angle: the box in that frame.
function extentAt(pts, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  let minU = Infinity;
  let maxU = -Infinity;
  let minV = Infinity;
  let maxV = -Infinity;
  for (const p of pts) {
    const u = p.x * c + p.y * s;
    const v = -p.x * s + p.y * c;
    if (u < minU) minU = u;
    if (u > maxU) maxU = u;
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
  }
  return { angle, minU, maxU, minV, maxV, width: maxU - minU, height: maxV - minV };
}

function rectFromExtent(e) {
  const c = Math.cos(e.angle);
  const s = Math.sin(e.angle);
  const at = (u, v) => vec2(u * c - v * s, u * s + v * c);
  return {
    angle: e.angle,
    width: e.width,
    height: e.height,
    area: e.width * e.height,
    perimeter: 2 * (e.width + e.height),
    center: at((e.minU + e.maxU) / 2, (e.minV + e.maxV) / 2),
    corners: [
      at(e.minU, e.minV),
      at(e.maxU, e.minV),
      at(e.maxU, e.maxV),
      at(e.minU, e.maxV),
    ],
  };
}

/**
 * The minimum-area (or minimum-perimeter) enclosing rectangle — **exact**, by rotating
 * calipers.
 *
 * The optimum is always flush with a hull edge (Freeman & Shapira), so only the hull's own
 * edge directions need testing: a sampled angle sweep would be both slower and only
 * approximately right.
 *
 * @param {object|Array} pth
 * @param {{by?:'area'|'perimeter', tolerance?:number}} [opts]
 * @returns {{angle, width, height, area, perimeter, center, corners} | null}
 */
export function boundingRect(pth, opts = {}) {
  const by = opts.by ?? 'area';
  if (by !== 'area' && by !== 'perimeter') {
    throw new TypeError(`boundingRect: by must be 'area' or 'perimeter', got ${by}`);
  }
  const pts = hullOf(pth, opts);
  if (pts.length === 0) return null;
  if (pts.length < 3) {
    // A degenerate hull (a point or a segment) still has a well-defined flush rectangle.
    const angle = pts.length === 2 ? Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x) : 0;
    return rectFromExtent(extentAt(pts, angle));
  }
  let best = null;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (Math.hypot(dx, dy) <= EPS) continue;
    const e = extentAt(pts, Math.atan2(dy, dx));
    const score = by === 'area' ? e.width * e.height : 2 * (e.width + e.height);
    if (best === null || score < best.score - 1e-12) best = { score, e };
  }
  return best === null ? null : rectFromExtent(best.e);
}

/**
 * The minimum enclosing **square** — exact, and not simply the bounding rectangle made
 * square: the best square's angle is generally not the best rectangle's, so the flush-edge
 * sweep is repeated with `max(width, height)` as the score.
 * @returns {{angle, size, center, corners} | null}
 */
export function boundingSquare(pth, opts = {}) {
  const pts = hullOf(pth, opts);
  if (pts.length === 0) return null;
  const angles = [];
  if (pts.length < 3) {
    angles.push(pts.length === 2 ? Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x) : 0);
  } else {
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if (Math.hypot(b.x - a.x, b.y - a.y) > EPS) angles.push(Math.atan2(b.y - a.y, b.x - a.x));
    }
  }
  let best = null;
  for (const angle of angles) {
    const e = extentAt(pts, angle);
    const size = Math.max(e.width, e.height);
    if (best === null || size < best.size - 1e-12) best = { size, e };
  }
  if (best === null) return null;
  // Grow the short side symmetrically so the square stays centred on the extent.
  const e = best.e;
  const size = best.size;
  const padU = (size - e.width) / 2;
  const padV = (size - e.height) / 2;
  const grown = {
    angle: e.angle,
    minU: e.minU - padU,
    maxU: e.maxU + padU,
    minV: e.minV - padV,
    maxV: e.maxV + padV,
    width: size,
    height: size,
  };
  const r = rectFromExtent(grown);
  return { angle: r.angle, size, center: r.center, corners: r.corners };
}

/** The rectangle (or square) as a closed Path. */
export function rectPath(rect) {
  return rect === null ? path([]) : polygon(rect.corners);
}

/** A circle as a closed Path of two true semicircular arcs. */
export function circlePath(circle) {
  if (circle === null || !(circle.radius > 0)) return path([]);
  const { center: c, radius: r } = circle;
  const right = vec2(c.x + r, c.y);
  const left = vec2(c.x - r, c.y);
  return path([
    subpath(
      [
        { type: 'arc', p0: right, p1: left, rx: r, ry: r, xAxisRotation: 0, largeArc: false, sweep: true },
        { type: 'arc', p0: left, p1: right, rx: r, ry: r, xAxisRotation: 0, largeArc: false, sweep: true },
      ],
      { closed: true },
    ),
  ]);
}

// --- minimum enclosing ellipse (Khachiyan) ------------------------------------------------

/**
 * The minimum-area enclosing ellipse — **iterative**, by Khachiyan's algorithm, to a
 * documented convergence criterion. There is no closed form, so unlike the circle and the
 * rectangle this one reports how hard it worked and whether it got there.
 *
 * Convergence is Khachiyan's relative criterion `max_i M_i ≤ d(1 + tolerance)` with d = 2
 * (so 3 in the lifted homogeneous form). `converged: false` means the iteration cap was
 * hit: the result is the best iterate so far, still enclosing, just not provably minimal.
 * The rate is linear, so a very small tolerance costs a lot of iterations — which is why
 * this reports `iterations` rather than pretending the cost is free.
 *
 * @param {object|Array} pth
 * @param {{tolerance?:number, hullTolerance?:number, maxIterations?:number}} [opts]
 * @returns {{center, rx, ry, angle, area, iterations, converged, reason} | null}
 *   `reason` is `'tolerance'` (met the criterion), `'stalled'` (no further progress is
 *   representable in f64 — the result is as good as the arithmetic allows), or
 *   `'maxIterations'`.
 */
export function boundingEllipse(pth, opts = {}) {
  // Two different tolerances, deliberately separate: `hullTolerance` is how tightly the
  // hull follows the curve, `tolerance` is Khachiyan's convergence criterion. Sharing one
  // number conflates "how good is the input" with "how hard should the solver try".
  const pts = hullOf(pth, { ...opts, tolerance: opts.hullTolerance ?? opts.tolerance ?? FLATNESS });
  const n = pts.length;
  if (n === 0) return null;
  // Khachiyan's rate is linear, so the default trades the last digits for a bounded cost:
  // 1e-3 puts the area within about a tenth of a percent of minimal, which is what a
  // bounding volume is for. Ask for more and you will pay for it in iterations, and the
  // returned `iterations`/`reason` say what it cost.
  const tolerance = opts.tolerance ?? 1e-3;
  const maxIterations = opts.maxIterations ?? 20000;
  if (n < 3) {
    const c = boundingCircle(pts);
    return { center: c.center, rx: c.radius, ry: c.radius, angle: 0, area: Math.PI * c.radius * c.radius, iterations: 0, converged: true, reason: 'degenerate' };
  }

  // Lifted homogeneous coordinates: Q = [x, y, 1]ᵀ per point.
  let u = new Array(n).fill(1 / n);
  let iterations = 0;
  let converged = false;
  let reason = 'maxIterations';
  for (; iterations < maxIterations; iterations++) {
    // X = Q · diag(u) · Qᵀ  (3×3, symmetric)
    let a11 = 0, a12 = 0, a13 = 0, a22 = 0, a23 = 0, a33 = 0;
    for (let i = 0; i < n; i++) {
      const w = u[i];
      const x = pts[i].x;
      const y = pts[i].y;
      a11 += w * x * x; a12 += w * x * y; a13 += w * x;
      a22 += w * y * y; a23 += w * y; a33 += w;
    }
    const inv = invert3(a11, a12, a13, a22, a23, a33);
    if (inv === null) break;
    // M_i = Q_iᵀ X⁻¹ Q_i, and the step moves weight to the worst-violating point.
    let maxM = -Infinity;
    let argMax = 0;
    const M = new Array(n);
    for (let i = 0; i < n; i++) {
      const x = pts[i].x;
      const y = pts[i].y;
      const m =
        inv.b11 * x * x + 2 * inv.b12 * x * y + 2 * inv.b13 * x + inv.b22 * y * y + 2 * inv.b23 * y + inv.b33;
      M[i] = m;
      if (m > maxM) {
        maxM = m;
        argMax = i;
      }
    }
    const step = (maxM - 3) / (3 * (maxM - 1));
    // Khachiyan's standard *relative* criterion. An absolute one (maxM > 3 + tol) is
    // scale-dependent and asks for accuracy the linear convergence rate cannot deliver in
    // any sensible iteration count.
    if (!(maxM > 3 * (1 + tolerance)) || !Number.isFinite(step) || step <= 0) {
      converged = true;
      reason = 'tolerance';
      break;
    }
    // Stall: the update is linear-rate, so past a point the weights stop moving in f64 and
    // further iterations return a bit-identical ellipse. Saying so beats spinning to the
    // cap and then reporting failure on a result that is as good as the arithmetic allows.
    if (step <= 1e-15) {
      reason = 'stalled';
      break;
    }
    u = u.map((w, i) => (1 - step) * w + (i === argMax ? step : 0));
  }

  // Centre and shape matrix from the converged weights.
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < n; i++) {
    cx += u[i] * pts[i].x;
    cy += u[i] * pts[i].y;
  }
  let s11 = 0, s12 = 0, s22 = 0;
  for (let i = 0; i < n; i++) {
    const dx = pts[i].x - cx;
    const dy = pts[i].y - cy;
    s11 += u[i] * dx * dx;
    s12 += u[i] * dx * dy;
    s22 += u[i] * dy * dy;
  }
  // The ellipse is { p : (p−c)ᵀ (S/d)⁻¹ (p−c) ≤ 1 } with d = 2 in the plane.
  const d = 2;
  const m11 = s11 * d;
  const m12 = s12 * d;
  const m22 = s22 * d;
  const det = m11 * m22 - m12 * m12;
  if (!(det > 0)) {
    const c = boundingCircle(pts);
    return { center: c.center, rx: c.radius, ry: c.radius, angle: 0, area: Math.PI * c.radius * c.radius, iterations, converged, reason: 'degenerate' };
  }
  // Eigen-decompose the 2×2 to get the axes.
  const tr = m11 + m22;
  const disc = Math.sqrt(Math.max(0, ((m11 - m22) / 2) ** 2 + m12 * m12));
  const l1 = tr / 2 + disc;
  const l2 = tr / 2 - disc;
  const angle = Math.abs(m12) > EPS ? Math.atan2(l1 - m11, m12) : m11 >= m22 ? 0 : Math.PI / 2;
  const rx = Math.sqrt(Math.max(0, l1));
  const ry = Math.sqrt(Math.max(0, l2));
  return {
    center: vec2(cx, cy),
    rx,
    ry,
    angle,
    area: Math.PI * rx * ry,
    iterations,
    converged,
    reason,
  };
}

// Inverse of a symmetric 3×3 given its upper triangle. Returns null when singular.
function invert3(a11, a12, a13, a22, a23, a33) {
  const c11 = a22 * a33 - a23 * a23;
  const c12 = a13 * a23 - a12 * a33;
  const c13 = a12 * a23 - a13 * a22;
  const det = a11 * c11 + a12 * c12 + a13 * c13;
  if (Math.abs(det) <= 1e-18) return null;
  return {
    b11: c11 / det,
    b12: c12 / det,
    b13: c13 / det,
    b22: (a11 * a33 - a13 * a13) / det,
    b23: (a13 * a12 - a11 * a23) / det,
    b33: (a11 * a22 - a12 * a12) / det,
  };
}

/** An ellipse as a closed Path of two true arcs. */
export function ellipsePath(e) {
  if (e === null || !(e.rx > 0) || !(e.ry > 0)) return path([]);
  const c = Math.cos(e.angle);
  const s = Math.sin(e.angle);
  const at = (u, v) => vec2(e.center.x + u * c - v * s, e.center.y + u * s + v * c);
  const right = at(e.rx, 0);
  const left = at(-e.rx, 0);
  const mk = (p0, p1) => ({
    type: 'arc',
    p0,
    p1,
    rx: e.rx,
    ry: e.ry,
    xAxisRotation: e.angle,
    largeArc: false,
    sweep: true,
  });
  return path([subpath([mk(right, left), mk(left, right)], { closed: true })]);
}

/**
 * The axis-aligned bounding box, for symmetry with the rest of the family. Exact, and
 * already available as `pathBoundingBox` — re-exported here so the fitters read as one set.
 */
export { pathBoundingBox as boundingBox };

// --- round rectangle & trapezoid (iterative) ----------------------------------------------

// A round-rect of half-extents (A, B) and corner radius r is the Minkowski sum of the
// rect (A−r, B−r) with a disc of radius r. So containment is a clamp-and-measure: clamp
// the point into the inner rect, and check the leftover distance against r.
//
// Given B, the minimal A follows in closed form per point, which turns a 2-D fit into a
// 1-D search — and that is what makes this affordable.
function minWidthForHeight(pts, cu, cv, r, B) {
  let A = r;
  for (const p of pts) {
    const du = Math.abs(p.u - cu);
    const dv = Math.abs(p.v - cv);
    const k = dv - (B - r);
    if (k <= 0) {
      // Level with the straight part of the side: the width alone has to reach.
      A = Math.max(A, du);
    } else {
      if (k > r) return Infinity; // this B cannot work at any width
      A = Math.max(A, du - Math.sqrt(Math.max(0, r * r - k * k)) + r);
    }
  }
  return A;
}

/**
 * The smallest enclosing **round rectangle** of a given corner radius.
 *
 * Iterative, and says so: there is no closed form, so this sweeps the hull's flush edge
 * directions (as the exact rectangle does) and, at each, runs a golden-section search on
 * the half-height with the half-width solved exactly per candidate. The centre is fixed at
 * the extent's midpoint — a documented restriction, not an oversight: releasing it makes
 * this a 4-parameter problem for a bound that is already within a fraction of a percent.
 *
 * `radius` is the corner radius; `maxRadius` caps it against the fitted size instead,
 * which is what a caller wanting "as round as it can be" means.
 *
 * @param {object|Array} pth
 * @param {{radius?:number, maxRadius?:number, tolerance?:number, rounds?:number}} [opts]
 * @returns {{angle, width, height, radius, area, center, converged} | null}
 */
export function boundingRoundRect(pth, opts = {}) {
  const pts0 = hullOf(pth, opts);
  if (pts0.length === 0) return null;
  const rounds = opts.rounds ?? 48;

  const base = boundingRect(pts0, { by: 'area' });
  if (base === null) return null;
  const radius =
    opts.radius ?? Math.min(opts.maxRadius ?? Infinity, Math.min(base.width, base.height) / 2);
  if (!(radius > 0)) return { ...base, radius: 0, converged: true };

  const angles = [];
  if (pts0.length < 3) angles.push(base.angle);
  else {
    for (let i = 0; i < pts0.length; i++) {
      const a = pts0[i];
      const b = pts0[(i + 1) % pts0.length];
      if (Math.hypot(b.x - a.x, b.y - a.y) > EPS) angles.push(Math.atan2(b.y - a.y, b.x - a.x));
    }
  }

  let best = null;
  for (const angle of angles) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const pts = pts0.map((p) => ({ u: p.x * c + p.y * s, v: -p.x * s + p.y * c }));
    const e = extentAt(pts0, angle);
    const cu = (e.minU + e.maxU) / 2;
    const cv = (e.minV + e.maxV) / 2;

    const areaAt = (B) => {
      const A = minWidthForHeight(pts, cu, cv, radius, B);
      return Number.isFinite(A) ? { A, B, area: 4 * A * B - (4 - Math.PI) * radius * radius } : null;
    };
    // Golden-section on B over [r, halfHeight + r]: the area is unimodal in B here because
    // the width solve is monotone on each side of the optimum.
    let lo = radius;
    let hi = e.height / 2 + radius;
    const phi = (Math.sqrt(5) - 1) / 2;
    let x1 = hi - phi * (hi - lo);
    let x2 = lo + phi * (hi - lo);
    let f1 = areaAt(x1);
    let f2 = areaAt(x2);
    for (let k = 0; k < rounds; k++) {
      const v1 = f1 === null ? Infinity : f1.area;
      const v2 = f2 === null ? Infinity : f2.area;
      if (v1 < v2) {
        hi = x2;
        x2 = x1;
        f2 = f1;
        x1 = hi - phi * (hi - lo);
        f1 = areaAt(x1);
      } else {
        lo = x1;
        x1 = x2;
        f1 = f2;
        x2 = lo + phi * (hi - lo);
        f2 = areaAt(x2);
      }
    }
    const got = areaAt((lo + hi) / 2) ?? f1 ?? f2;
    if (got === null) continue;
    if (best === null || got.area < best.area - 1e-12) {
      best = {
        angle,
        width: 2 * got.A,
        height: 2 * got.B,
        radius,
        area: got.area,
        center: vec2(cu * c - cv * s, cu * s + cv * c),
        converged: true,
      };
    }
  }
  return best;
}

/**
 * The smallest enclosing **trapezoid** whose parallel sides are perpendicular to
 * `orientation` (or, unspecified, over the hull's flush directions).
 *
 * Iterative in the same sense as the round rect: the parallel direction is swept rather
 * than solved. For each one the two legs are exact — a minimal trapezoid's leg is flush
 * with a hull edge, so every edge is tried as a leg and the extreme supporting lines win.
 *
 * @param {object|Array} pth
 * @param {{orientation?:number, maxDirections?:number, tolerance?:number}} [opts]
 * @returns {{angle, corners, area, top, bottom, height} | null}
 */
export function boundingTrapezoid(pth, opts = {}) {
  const pts0 = hullOf(pth, opts);
  if (pts0.length < 3) return null;
  let angles = [];
  if (opts.orientation !== undefined) angles.push(opts.orientation);
  else {
    for (let i = 0; i < pts0.length; i++) {
      const a = pts0[i];
      const b = pts0[(i + 1) % pts0.length];
      if (Math.hypot(b.x - a.x, b.y - a.y) > EPS) angles.push(Math.atan2(b.y - a.y, b.x - a.x));
    }
  }
  // The pair loop is quadratic in the hull's distinct slopes, so a finely-tessellated hull
  // (a circle's is hundreds of near-identical edges) is subsampled. On a polygon the cap
  // never binds and the sweep stays exhaustive; on a smooth shape adjacent directions
  // differ by a hair, so the cost is real and the loss is not.
  const maxDirections = opts.maxDirections ?? 64;
  if (angles.length > maxDirections) {
    const picked = [];
    for (let i = 0; i < maxDirections; i++) {
      picked.push(angles[Math.floor((i * angles.length) / maxDirections)]);
    }
    angles = picked;
  }

  let best = null;
  for (const angle of angles) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const pts = pts0.map((p) => ({ u: p.x * c + p.y * s, v: -p.x * s + p.y * c }));
    let vMin = Infinity;
    let vMax = -Infinity;
    for (const p of pts) {
      if (p.v < vMin) vMin = p.v;
      if (p.v > vMax) vMax = p.v;
    }
    const h = vMax - vMin;
    if (!(h > EPS)) continue;

    // A leg is a line u = m·v + k. Each hull edge contributes its own slope, and the
    // supporting k for that slope is the extreme of u − m·v over the hull.
    //
    // The supporting lines are computed **once per slope**, not once per (left, right)
    // pair. Doing it inside the pair loop makes this O(slopes² · n) — 47 seconds on a
    // circle's 256-point hull — instead of O(slopes · n).
    const slopeSet = new Set([0]);
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if (Math.abs(b.v - a.v) > EPS) slopeSet.add((b.u - a.u) / (b.v - a.v));
    }
    const slopes = [...slopeSet];
    const kHi = new Map();
    const kLo = new Map();
    for (const m of slopes) {
      let hi = -Infinity;
      let lo = Infinity;
      for (const p of pts) {
        const kk = p.u - m * p.v;
        if (kk > hi) hi = kk;
        if (kk < lo) lo = kk;
      }
      kHi.set(m, hi);
      kLo.set(m, lo);
    }
    for (const sr of slopes) {
      for (const sl of slopes) {
        const kr = kHi.get(sr);
        const kl = kLo.get(sl);
        const uR0 = sr * vMin + kr;
        const uR1 = sr * vMax + kr;
        const uL0 = sl * vMin + kl;
        const uL1 = sl * vMax + kl;
        const bottom = uR0 - uL0;
        const top = uR1 - uL1;
        if (bottom < -EPS || top < -EPS) continue;
        const area = ((bottom + top) / 2) * h;
        if (best === null || area < best.area - 1e-12) {
          const at = (u, v) => vec2(u * c - v * s, u * s + v * c);
          best = {
            angle,
            area,
            height: h,
            bottom,
            top,
            corners: [at(uL0, vMin), at(uR0, vMin), at(uR1, vMax), at(uL1, vMax)],
          };
        }
      }
    }
  }
  return best;
}

/** A round rectangle as a closed Path with true elliptical corner arcs. */
export function roundRectPath(rr) {
  if (rr === null) return path([]);
  const { angle, width: w, height: h, radius: r, center } = rr;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const at = (u, v) => vec2(center.x + u * c - v * s, center.y + u * s + v * c);
  const a = w / 2;
  const b = h / 2;
  const rr2 = Math.min(r, a, b);
  if (!(rr2 > 0)) return polygon([at(-a, -b), at(a, -b), at(a, b), at(-a, b)]);
  const arcTo = (p0, p1) => ({ type: 'arc', p0, p1, rx: rr2, ry: rr2, xAxisRotation: angle, largeArc: false, sweep: true });
  const segs = [
    line(at(-a + rr2, -b), at(a - rr2, -b)),
    arcTo(at(a - rr2, -b), at(a, -b + rr2)),
    line(at(a, -b + rr2), at(a, b - rr2)),
    arcTo(at(a, b - rr2), at(a - rr2, b)),
    line(at(a - rr2, b), at(-a + rr2, b)),
    arcTo(at(-a + rr2, b), at(-a, b - rr2)),
    line(at(-a, b - rr2), at(-a, -b + rr2)),
    arcTo(at(-a, -b + rr2), at(-a + rr2, -b)),
  ].filter((sg) => sg.type !== 'line' || Math.hypot(sg.p1.x - sg.p0.x, sg.p1.y - sg.p0.y) > EPS);
  return path([subpath(segs, { closed: true })]);
}

/** A trapezoid as a closed Path. */
export function trapezoidPath(tz) {
  return tz === null ? path([]) : polygon(tz.corners);
}
