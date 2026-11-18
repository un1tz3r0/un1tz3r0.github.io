// F7 part 1 — nearest point pair between two segments.
//
// The minimum of f(tA, tB) = ‖A(tA) − B(tB)‖² over the unit square. Three strategies,
// in order of preference:
//
//   1. Closed form for line/line (including the parallel and degenerate cases) and for
//      concentric circular arcs, where the answer is exact and the naive iteration is
//      worst-behaved (every parameter pair on a parallel stretch is a stationary point).
//   2. Zero distance: if the segments cross, the F6 intersection contract already gives
//      the exact parameters. Checked before iterating, since a crossing pair has its
//      minimum on no interior stationary point of f.
//   3. Generic: seed from a coarse flatten×flatten scan, refine by alternating
//      projection (each side's kernel `nearestPoint` against the other's current point —
//      monotone in f, so it cannot diverge), then polish with a 2×2 Newton step on
//      ∇f = 0, guarded by "reject any step that does not decrease f".
//
// Everything returns the same record, so callers never branch on which path ran.

import {
  LINE,
  ARC,
  pointAt,
  derivativeAt,
  derivative2At,
  nearestPoint,
  flattenParam,
  boundingBox,
  arcLength,
  arcLengthTo,
  tAtLength,
  normalAt,
  line,
} from './segment.js';
import { arcCenter } from './arc.js';
import { intersectSegments } from './intersections.js';
import { pathBoundingBox } from './path.js';
import { containsPoint } from './winding.js';
import { sub, dot, len2, dist } from './vec2.js';
import { clamp01, EPS, EPS_COINCIDENT, EPS_TANGENT, FLATNESS } from './tolerance.js';

// Seeds per side for the generic scan. The flatten is adaptive, so this is a floor on
// resolution rather than the whole story.
const SEED_STEPS = 16;

// Alternating-projection iterations before the Newton polish. Convergence is linear and
// fast except on near-parallel pairs, which the tie machinery (N3) handles separately.
const PROJECT_ITERS = 24;
const NEWTON_ITERS = 12;

function record(a, b, tA, tB) {
  const pA = pointAt(a, tA);
  const pB = pointAt(b, tB);
  return { dist: dist(pA, pB), tA, tB, pA, pB };
}

// --- closed forms ----------------------------------------------------------------------

// Squared distance between two line segments. Handles the parallel case by clamping the
// projection of each endpoint onto the other segment — the classic robust formulation
// (Ericson, *Real-Time Collision Detection* §5.1.9), which degrades gracefully when
// either segment has zero length.
function lineLine(a, b) {
  const d1 = sub(a.p1, a.p0);
  const d2 = sub(b.p1, b.p0);
  const r = sub(a.p0, b.p0);
  const l1 = len2(d1);
  const l2 = len2(d2);
  const f = dot(d2, r);

  let tA;
  let tB;
  if (l1 <= EPS * EPS && l2 <= EPS * EPS) {
    tA = 0;
    tB = 0;
  } else if (l1 <= EPS * EPS) {
    tA = 0;
    tB = clamp01(f / l2);
  } else {
    const c = dot(d1, r);
    if (l2 <= EPS * EPS) {
      tB = 0;
      tA = clamp01(-c / l1);
    } else {
      const s = dot(d1, d2);
      const denom = l1 * l2 - s * s;
      // denom == 0 ⇔ parallel: any tA works for the unclamped line pair, so start at 0
      // and let the clamp-and-reproject below place both parameters.
      tA = denom > EPS * l1 * l2 ? clamp01((s * f - c * l2) / denom) : 0;
      tB = (s * tA + f) / l2;
      if (tB < 0) {
        tB = 0;
        tA = clamp01(-c / l1);
      } else if (tB > 1) {
        tB = 1;
        tA = clamp01((s - c) / l1);
      }
    }
  }
  return record(a, b, tA, tB);
}

// Is this arc a circle (equal radii)? Elliptical arcs have no concentric shortcut.
function isCircular(seg) {
  return seg.type === ARC && Math.abs(seg.rx - seg.ry) <= EPS * Math.max(1, seg.rx);
}

// Concentric circular arcs: every point of one is exactly |r1 − r2| from the other's
// circle, so the minimum over the *arcs* is attained wherever their angular ranges
// overlap — and there the whole overlap ties. Returns null when the arcs are not
// concentric or their angular ranges are disjoint (then the generic path handles it,
// with the minimum at an endpoint).
function concentricArcs(a, b) {
  if (!isCircular(a) || !isCircular(b)) return null;
  const ca = arcCenter(a);
  const cb = arcCenter(b);
  if (Math.hypot(ca.cx - cb.cx, ca.cy - cb.cy) > EPS_COINCIDENT) return null;

  // Angular ranges as [lo, hi] in absolute angle, direction-normalized.
  const range = (c) => {
    const t0 = c.theta1;
    const t1 = c.theta1 + c.dtheta;
    return c.dtheta >= 0 ? [t0, t1] : [t1, t0];
  };
  const [aLo, aHi] = range(ca);
  const [bLo, bHi] = range(cb);
  const TAU = 2 * Math.PI;
  // Slide b's range by multiples of 2π to maximize overlap with a's.
  const k = Math.round((aLo - bLo) / TAU);
  const lo = Math.max(aLo, bLo + k * TAU);
  const hi = Math.min(aHi, bHi + k * TAU);
  if (hi < lo) return null; // disjoint sweeps — endpoint minimum, leave it to the caller

  const mid = 0.5 * (lo + hi);
  const tA = ca.dtheta === 0 ? 0 : clamp01((mid - ca.theta1) / ca.dtheta);
  const tB = cb.dtheta === 0 ? 0 : clamp01((mid - k * TAU - cb.theta1) / cb.dtheta);
  return record(a, b, tA, tB);
}

// --- generic ---------------------------------------------------------------------------

// Coarse seed: the best pair over flatten samples of both segments, unioned with a fixed
// parameter grid so a nearly-straight curve (few flatten samples) is still probed.
function seedParams(a, b) {
  const params = (seg) => {
    const ts = flattenParam(seg, FLATNESS).map((s) => s.t);
    for (let i = 0; i <= SEED_STEPS; i++) ts.push(i / SEED_STEPS);
    return ts;
  };
  const tas = params(a);
  const tbs = params(b);
  const pas = tas.map((t) => pointAt(a, t));
  const pbs = tbs.map((t) => pointAt(b, t));

  let best = { tA: 0, tB: 0, d2: Infinity };
  for (let i = 0; i < tas.length; i++) {
    for (let j = 0; j < tbs.length; j++) {
      const dx = pas[i].x - pbs[j].x;
      const dy = pas[i].y - pbs[j].y;
      const d2 = dx * dx + dy * dy;
      if (d2 < best.d2) best = { tA: tas[i], tB: tbs[j], d2 };
    }
  }
  return best;
}

// f(tA,tB) = ‖A(tA) − B(tB)‖² and its gradient/Hessian. r = A − B, so
//   ∂f/∂tA =  2·r·A′      ∂f/∂tB = −2·r·B′
//   ∂²f/∂tA² = 2(A′·A′ + r·A″)   ∂²f/∂tB² = 2(B′·B′ − r·B″)   ∂²f/∂tA∂tB = −2(A′·B′)
function derivatives(a, b, tA, tB) {
  const r = sub(pointAt(a, tA), pointAt(b, tB));
  const da = derivativeAt(a, tA);
  const db = derivativeAt(b, tB);
  const dda = derivative2At(a, tA);
  const ddb = derivative2At(b, tB);
  return {
    f: len2(r),
    gA: 2 * dot(r, da),
    gB: -2 * dot(r, db),
    hAA: 2 * (len2(da) + dot(r, dda)),
    hBB: 2 * (len2(db) - dot(r, ddb)),
    hAB: -2 * dot(da, db),
  };
}

function generic(a, b) {
  const seed = seedParams(a, b);
  let tA = seed.tA;
  let tB = seed.tB;

  // Alternating projection. Each half-step is the exact minimizer in one variable with
  // the other held fixed, so f decreases monotonically and the pair cannot wander.
  for (let i = 0; i < PROJECT_ITERS; i++) {
    const nb = nearestPoint(b, pointAt(a, tA));
    const na = nearestPoint(a, nb.point);
    if (Math.abs(na.t - tA) < EPS && Math.abs(nb.t - tB) < EPS) {
      tA = na.t;
      tB = nb.t;
      break;
    }
    tA = na.t;
    tB = nb.t;
  }

  // Newton polish on ∇f = 0. Rejected whenever it fails to decrease f (which covers the
  // saddle/indefinite-Hessian cases and every boundary minimum), so this can only
  // improve on the projection result.
  let best = derivatives(a, b, tA, tB).f;
  for (let i = 0; i < NEWTON_ITERS; i++) {
    const d = derivatives(a, b, tA, tB);
    const det = d.hAA * d.hBB - d.hAB * d.hAB;
    if (Math.abs(det) < EPS) break;
    const stepA = (d.gA * d.hBB - d.gB * d.hAB) / det;
    const stepB = (d.gB * d.hAA - d.gA * d.hAB) / det;
    const nA = clamp01(tA - stepA);
    const nB = clamp01(tB - stepB);
    const f = derivatives(a, b, nA, nB).f;
    if (!(f < best - EPS * EPS)) break;
    best = f;
    if (Math.abs(nA - tA) < EPS && Math.abs(nB - tB) < EPS) {
      tA = nA;
      tB = nB;
      break;
    }
    tA = nA;
    tB = nB;
  }

  return record(a, b, tA, tB);
}

/**
 * Nearest point pair between two segments — the minimum of ‖A(tA) − B(tB)‖².
 *
 * Exact for line/line, for crossing pairs (distance 0, parameters from the F6
 * intersection contract), and for concentric circular arcs. Otherwise the minimum is
 * found by seeded alternating projection plus a guarded Newton polish.
 *
 * When several parameter pairs tie — parallel lines, concentric arcs, a coincident
 * overlap — this returns *one* representative pair; recovering the whole tied set is
 * the job of the interval-witness machinery (N3), which grows a run outward from here.
 *
 * @param {object} a  Segment
 * @param {object} b  Segment
 * @returns {{dist:number, tA:number, tB:number, pA:{x,y}, pB:{x,y}}}
 */
export function segmentDistance(a, b) {
  if (a.type === LINE && b.type === LINE) return lineLine(a, b);

  const conc = concentricArcs(a, b);
  if (conc !== null) return conc;

  // Zero-distance short-circuit: a crossing pair's minimum is not a stationary point of
  // f, so the iteration would only approach it from one side.
  const hits = intersectSegments(a, b);
  if (hits.overlaps.length > 0) {
    const o = hits.overlaps[0];
    const tA = 0.5 * (o.tA0 + o.tA1);
    const tB = 0.5 * (o.tB0 + o.tB1);
    return record(a, b, tA, tB);
  }
  if (hits.points.length > 0) {
    const h = hits.points[0];
    return record(a, b, h.tA, h.tB);
  }

  return generic(a, b);
}

// --- path → path (F7) ------------------------------------------------------------------

// Distance between two axis-aligned boxes (0 when they touch or overlap). This is the
// branch-and-bound lower bound: no point pair drawn from the two segments can be closer.
function boxDistance(p, q) {
  const dx = p.minX > q.maxX ? p.minX - q.maxX : q.minX > p.maxX ? q.minX - p.maxX : 0;
  const dy = p.minY > q.maxY ? p.minY - q.maxY : q.minY > p.maxY ? q.minY - p.maxY : 0;
  return Math.hypot(dx, dy);
}

// Every drawn boundary segment of a path, tagged with its address. Closed subpaths
// carry their closing segment in the segment list (F21) —
// the same addressing convention as nearestPointToPath.
function addressedSegments(pth) {
  const out = [];
  for (let si = 0; si < pth.subpaths.length; si++) {
    const segs = pth.subpaths[si].segments;
    for (let gi = 0; gi < segs.length; gi++) {
      out.push({ subpathIndex: si, segIndex: gi, seg: segs[gi], box: boundingBox(segs[gi]) });
    }
  }
  return out;
}

/**
 * Minimum distance between two paths, with a witness on each.
 *
 * The distance is **boundary-to-boundary**: two nested but disjoint outlines report the
 * gap between them, not zero, and containment is not consulted at all. Crossing
 * boundaries report 0.
 *
 * Pruning mirrors `nearestPointToPath`: every segment pair gets a bbox↔bbox lower bound,
 * pairs are visited in ascending-bound order, and the walk stops as soon as the next
 * bound cannot beat the best pair found so far.
 *
 * When a positive-measure set of point pairs ties for the minimum — parallel stretches,
 * concentric arcs, a coincident overlap — both witnesses come back as parameter
 * *intervals* (`{t0, t1, point0, point1}`) instead of points, per the brief's contract.
 * `isIntervalWitness` distinguishes them. Pass `{intervals: false}` to always get points.
 *
 * @param {object} a  Path
 * @param {object} b  Path
 * @param {{intervals?: boolean, tolerance?: number, minRunLength?: number}} [opts]
 *   `tolerance` is the distance window a tie must hold within (default EPS_COINCIDENT);
 *   `minRunLength` is the arc length a tie must span to be reported as an interval
 *   (default 1e-3 × the bounding-box diagonal of `a`).
 * @returns {{distance:number, a:Witness, b:Witness} | null}
 *   Witness = `{subpathIndex, segIndex, t, point}` or
 *   `{subpathIndex, segIndex, t0, t1, point0, point1}`. null when either path has no
 *   drawn segments.
 */
export function nearestPathToPath(a, b, opts = {}) {
  const as = addressedSegments(a);
  const bs = addressedSegments(b);
  if (as.length === 0 || bs.length === 0) return null;

  const pairs = [];
  for (const ea of as) {
    for (const eb of bs) {
      pairs.push({ ea, eb, lb: boxDistance(ea.box, eb.box) });
    }
  }
  pairs.sort((x, y) => x.lb - y.lb);

  let best = null;
  for (const pair of pairs) {
    if (best !== null && pair.lb >= best.distance) break;
    const hit = segmentDistance(pair.ea.seg, pair.eb.seg);
    if (best === null || hit.dist < best.distance) {
      best = {
        distance: hit.dist,
        a: {
          subpathIndex: pair.ea.subpathIndex,
          segIndex: pair.ea.segIndex,
          t: hit.tA,
          point: hit.pA,
        },
        b: {
          subpathIndex: pair.eb.subpathIndex,
          segIndex: pair.eb.segIndex,
          t: hit.tB,
          point: hit.pB,
        },
      };
      if (best.distance <= EPS_COINCIDENT) break; // touching: nothing can beat it
    }
  }
  if (best === null || opts.intervals === false) return best;

  // A tie is not confined to the winning pair: a parallel stretch usually shows up on a
  // *different* segment pair than the one branch-and-bound happens to settle on (the
  // first pair to reach the minimum wins, and strictly-better never displaces it). So
  // re-walk every pair that could match the minimum and prefer the longest tied run.
  const runs = collectRuns(pairs, best.distance, {
    tolerance: opts.tolerance ?? EPS_COINCIDENT,
    minRunLength: opts.minRunLength ?? MIN_RUN_FRACTION * pathScale(a),
  });
  return runs.length > 0 ? runs[0] : best;
}

// All witness pairs achieving `distance` (within tolerance), longest run first. Point
// witnesses subsumed by a longer run on the same segment of `a` are dropped, so a
// parallel stretch reports one interval rather than an interval plus its endpoints.
function collectRuns(pairs, distance, opts) {
  const out = [];
  for (const pair of pairs) {
    if (pair.lb > distance + opts.tolerance) break; // pairs are lower-bound sorted
    const hit = segmentDistance(pair.ea.seg, pair.eb.seg);
    if (Math.abs(hit.dist - distance) > opts.tolerance) continue;
    const point = {
      distance: hit.dist,
      a: { subpathIndex: pair.ea.subpathIndex, segIndex: pair.ea.segIndex, t: hit.tA, point: hit.pA },
      b: { subpathIndex: pair.eb.subpathIndex, segIndex: pair.eb.segIndex, t: hit.tB, point: hit.pB },
    };
    const run = growEquidistantRun(pair.ea.seg, pair.eb.seg, hit.tA, hit.dist, opts.tolerance);
    if (run.length >= opts.minRunLength) {
      out.push({
        entry: widenWitnesses(point, pair.ea.seg, pair.eb.seg, opts),
        length: run.length,
        t0: Math.min(run.tA0, run.tA1),
        t1: Math.max(run.tA0, run.tA1),
      });
    } else {
      out.push({ entry: point, length: 0, t0: hit.tA, t1: hit.tA });
    }
  }

  // Drop entries whose stretch on `a` is contained in a longer entry's.
  const kept = out.filter(
    (e) =>
      !out.some(
        (o) =>
          o !== e &&
          o.length > e.length &&
          o.entry.a.subpathIndex === e.entry.a.subpathIndex &&
          o.entry.a.segIndex === e.entry.a.segIndex &&
          e.t0 >= o.t0 - EPS_PARAM_LOCAL &&
          e.t1 <= o.t1 + EPS_PARAM_LOCAL,
      ),
  );
  kept.sort((x, y) => y.length - x.length); // longest tie first; stable for equal lengths
  return kept.map((e) => e.entry);
}

/**
 * Every witness pair that attains the minimum distance between two paths — the full tied
 * set rather than one representative, longest run first.
 *
 * Runs are reported per segment pair, because a Witness addresses a single segment: a tie
 * that continues across a junction comes back as consecutive entries, not one merged
 * witness. (`matchedRuns` stitches across junctions, which is what stroke recovery needs.)
 *
 * @param {object} a  Path
 * @param {object} b  Path
 * @param {{tolerance?: number, minRunLength?: number}} [opts]
 * @returns {{distance:number, a:Witness, b:Witness}[]}  empty when either path is empty
 */
export function nearestRuns(a, b, opts = {}) {
  const first = nearestPathToPath(a, b, { intervals: false });
  if (first === null) return [];
  const as = addressedSegments(a);
  const bs = addressedSegments(b);
  const pairs = [];
  for (const ea of as) {
    for (const eb of bs) pairs.push({ ea, eb, lb: boxDistance(ea.box, eb.box) });
  }
  pairs.sort((x, y) => x.lb - y.lb);
  return collectRuns(pairs, first.distance, {
    tolerance: opts.tolerance ?? EPS_COINCIDENT,
    minRunLength: opts.minRunLength ?? MIN_RUN_FRACTION * pathScale(a),
  });
}

// --- interval witnesses (N3) ------------------------------------------------------------
//
// A minimum can be attained on a whole stretch rather than at a point: parallel lines,
// concentric arcs, a coincident overlap. The brief's contract calls for a parameter
// *interval* witness in exactly those cases, so the representative pair from
// `segmentDistance` is grown outward as far as the distance stays flat.
//
// The discriminator against a plain point minimum is length, not flatness alone: near a
// transversal minimum d(t) ≈ dmin + c·(t−t*)², so *any* finite tolerance admits a short
// run around it. A genuine tie is macroscopic, so a grown run only becomes an interval
// witness once it exceeds `minRunLength` in arc length (relative to the geometry's own
// scale by default).

/** Default fraction of the bounding-box diagonal a tie must span to count as an interval. */
const MIN_RUN_FRACTION = 1e-3;

// Parameter resolution for run growing. The run's endpoint is a tolerance-defined
// boundary rather than an exact root, so bisecting past this only burns projections.
const EPS_PARAM_LOCAL = 1e-12;

// Distance from A(t) to the whole of segment b, plus the parameter attaining it.
function projectOnto(b, a, t) {
  const hit = nearestPoint(b, pointAt(a, t));
  return { dist: hit.dist, tB: hit.t };
}

// Largest u in [t, limit] such that the target distance holds all the way from t to u.
// Marches at a coarse step (so a short excursion is not stepped over) and bisects the
// first failure to EPS_PARAM.
function marchWhile(a, b, t, limit, target, eps) {
  const dir = Math.sign(limit - t);
  if (dir === 0) return t;
  const span = Math.abs(limit - t);
  const step = span / 32;
  let good = t;
  for (let u = t + dir * step; dir > 0 ? u <= limit : u >= limit; u += dir * step) {
    const c = clamp01(u);
    if (Math.abs(projectOnto(b, a, c).dist - target) > eps) {
      // Bisect between the last good parameter and this failure.
      let lo = good;
      let hi = c;
      for (let i = 0; i < 40 && Math.abs(hi - lo) > EPS_PARAM_LOCAL; i++) {
        const mid = 0.5 * (lo + hi);
        if (Math.abs(projectOnto(b, a, mid).dist - target) <= eps) lo = mid;
        else hi = mid;
      }
      return lo;
    }
    good = c;
  }
  return clamp01(limit);
}

/**
 * Grow a tied pair into the maximal parameter run over which the two segments stay
 * `target` apart (within `eps`).
 *
 * Returns the run on a and the corresponding run on b (whose endpoints are the
 * projections of a's, so they may run backwards for anti-parallel geometry — the same
 * convention `intersectSegments` uses for overlaps).
 *
 * @param {object} a  Segment
 * @param {object} b  Segment
 * @param {number} tA  seed parameter on a
 * @param {number} target  the distance to hold
 * @param {number} [eps=EPS_COINCIDENT]
 * @returns {{tA0:number, tA1:number, tB0:number, tB1:number, length:number}}
 *   `length` is the run's arc length along a.
 */
export function growEquidistantRun(a, b, tA, target, eps = EPS_COINCIDENT) {
  const tA0 = marchWhile(a, b, tA, 0, target, eps);
  const tA1 = marchWhile(a, b, tA, 1, target, eps);
  return {
    tA0,
    tA1,
    tB0: projectOnto(b, a, tA0).tB,
    tB1: projectOnto(b, a, tA1).tB,
    length: Math.abs(arcLengthTo(a, tA1) - arcLengthTo(a, tA0)),
  };
}

// Scale for relative thresholds: the diagonal of a path's bounding box, or 1 when the
// path is degenerate (so absolute tolerances still behave).
function pathScale(pth) {
  const box = pathBoundingBox(pth);
  if (box === null) return 1;
  const d = Math.hypot(box.maxX - box.minX, box.maxY - box.minY);
  return d > 0 ? d : 1;
}

// Turn a point witness into an interval witness when its tied run is macroscopic.
function widenWitnesses(result, segA, segB, opts) {
  const eps = opts.tolerance ?? EPS_COINCIDENT;
  const run = growEquidistantRun(segA, segB, result.a.t, result.distance, eps);
  if (run.length < opts.minRunLength) return result;
  return {
    distance: result.distance,
    a: {
      subpathIndex: result.a.subpathIndex,
      segIndex: result.a.segIndex,
      t0: run.tA0,
      t1: run.tA1,
      point0: pointAt(segA, run.tA0),
      point1: pointAt(segA, run.tA1),
    },
    b: {
      subpathIndex: result.b.subpathIndex,
      segIndex: result.b.segIndex,
      t0: run.tB0,
      t1: run.tB1,
      point0: pointAt(segB, run.tB0),
      point1: pointAt(segB, run.tB1),
    },
  };
}

/**
 * Is this witness an interval (a positive-measure tie) rather than a single point?
 * @returns {boolean}
 */
export function isIntervalWitness(w) {
  return w !== null && w !== undefined && w.t0 !== undefined;
}

/**
 * Do the two segments run anti-parallel at the given parameters — i.e. do their unit
 * tangents point in opposite directions within `eps`? This is the test that
 * distinguishes the two sides of a stroke ribbon (which face each other) from two
 * unrelated curves that happen to be equidistant.
 * @param {number} [eps=EPS_TANGENT]  tolerance on |cos θ| = 1
 * @returns {boolean}
 */
export function antiParallelAt(a, b, tA, tB, eps = EPS_TANGENT) {
  const da = derivativeAt(a, tA);
  const db = derivativeAt(b, tB);
  const la = Math.hypot(da.x, da.y);
  const lb = Math.hypot(db.x, db.y);
  if (la <= EPS || lb <= EPS) return false;
  const cosine = (da.x * db.x + da.y * db.y) / (la * lb);
  return cosine < 0 && Math.abs(cosine) >= 1 - eps;
}

// --- ribbon primitives (N4) --------------------------------------------------------------
//
// Hoisted here for Phase 12 (F11, centerline recovery), but useful in their own right:
// "which point faces this one across the interior" and "which stretches of these two
// boundaries run equidistant and anti-parallel". Both are the same question the interval
// witness answers, asked at a caller-chosen distance instead of at the minimum.

/** Fraction of the path scale used as the default sampling spacing for `matchedRuns`. */
const SAMPLE_FRACTION = 1 / 200;

// The inward direction at a boundary location: the left normal, flipped if stepping
// along it leaves the filled region. For an open subpath there is no inside, so both
// directions are candidates and the caller's ray is cast twice.
function inwardNormals(pth, seg, t, point, closed) {
  const n = normalAt(seg, t);
  if (!closed) return [n, { x: -n.x, y: -n.y }];
  const step = EPS_COINCIDENT * 1e3;
  const probe = { x: point.x + n.x * step, y: point.y + n.y * step };
  return containsPoint(pth, probe) ? [n] : [{ x: -n.x, y: -n.y }];
}

// First boundary hit of the ray p + s·dir for s ∈ (near, far], as {point, dist, …}.
function castRay(pth, p, dir, near, far) {
  const from = { x: p.x + dir.x * near, y: p.y + dir.y * near };
  const to = { x: p.x + dir.x * far, y: p.y + dir.y * far };
  const ray = line(from, to);
  const rayBox = boundingBox(ray);
  let best = null;
  for (const e of addressedSegments(pth)) {
    if (boxDistance(rayBox, e.box) > EPS_COINCIDENT) continue;
    const { points } = intersectSegments(ray, e.seg);
    for (const h of points) {
      const d = near + h.tA * (far - near);
      if (d <= near + EPS_COINCIDENT) continue;
      if (best === null || d < best.dist) {
        best = {
          point: h.point,
          dist: d,
          subpathIndex: e.subpathIndex,
          segIndex: e.segIndex,
          t: h.tB,
          seg: e.seg,
        };
      }
    }
  }
  return best;
}

/**
 * The point facing a boundary location across the interior: cast the inward normal from
 * `loc` and report the first place the boundary is met again.
 *
 * This is the stroke-ribbon probe — on a stroked outline, the opposite of a point on one
 * side is the corresponding point on the other side, exactly one stroke width away, with
 * an anti-parallel tangent. Caps and joins are where it fails or returns something
 * inconsistent, which is precisely how they get detected.
 *
 * @param {object} pth  Path whose boundary is probed (and whose fill decides "inward")
 * @param {{subpathIndex:number, segIndex:number, t:number}} loc  a boundary location
 * @param {{maxDistance?:number, minDistance?:number, angleTolerance?:number,
 *          target?:object}} [opts]
 *   `target` probes a *different* path (default: `pth` itself, the self-facing case).
 * @returns {{point:{x,y}, distance:number, subpathIndex:number, segIndex:number,
 *            t:number, antiparallel:boolean} | null}  null when the ray escapes
 */
export function oppositePoint(pth, loc, opts = {}) {
  const sp = pth.subpaths[loc.subpathIndex];
  if (sp === undefined) return null;
  const segs = sp.segments;
  const seg = segs[loc.segIndex];
  if (seg === undefined) return null;

  const target = opts.target ?? pth;
  const scale = pathScale(pth);
  const near = opts.minDistance ?? EPS_COINCIDENT * 1e3;
  const far = opts.maxDistance ?? scale * 2;
  const point = pointAt(seg, loc.t);

  let best = null;
  for (const dir of inwardNormals(pth, seg, loc.t, point, sp.closed)) {
    const hit = castRay(target, point, dir, near, far);
    if (hit !== null && (best === null || hit.dist < best.dist)) best = hit;
  }
  if (best === null) return null;
  return {
    point: best.point,
    distance: best.dist,
    subpathIndex: best.subpathIndex,
    segIndex: best.segIndex,
    t: best.t,
    antiparallel: antiParallelAt(seg, best.seg, loc.t, best.t, opts.angleTolerance ?? EPS_TANGENT),
  };
}

// Arc-length-spaced boundary sample locations of a path.
function boundarySamples(pth, spacing) {
  const out = [];
  for (const e of addressedSegments(pth)) {
    const total = arcLength(e.seg);
    const n = Math.max(1, Math.ceil(total / spacing));
    for (let i = 0; i <= n; i++) {
      const t = tAtLength(e.seg, (i / n) * total);
      out.push({ subpathIndex: e.subpathIndex, segIndex: e.segIndex, t, seg: e.seg });
    }
  }
  return out;
}

// Compress a run's consecutive samples into one span per (subpath, segment).
function compressSpans(samples, key) {
  const spans = [];
  for (const s of samples) {
    const w = s[key];
    const last = spans[spans.length - 1];
    if (last && last.subpathIndex === w.subpathIndex && last.segIndex === w.segIndex) {
      last.t0 = Math.min(last.t0, w.t);
      last.t1 = Math.max(last.t1, w.t);
    } else {
      spans.push({ subpathIndex: w.subpathIndex, segIndex: w.segIndex, t0: w.t, t1: w.t });
    }
  }
  return spans;
}

/**
 * Maximal stretches of two boundaries that run equidistant and anti-parallel — the
 * ribbon detector. Pass the same path as both arguments for the stroke-outline case,
 * where a stroke's two sides face each other across its own interior.
 *
 * Unlike `nearestRuns` this is sampling-driven and **stitches across segment junctions**:
 * a ribbon that spans many segments comes back as one run holding a list of per-segment
 * spans on each side. Exact reconstruction from those spans is F11's job; this answers
 * "where is there a ribbon, and how wide".
 *
 * A run ends where the facing point disappears (a cap), where the distance leaves
 * `distanceTolerance` of the run's own distance (a taper or a different stroke), where
 * the tangents stop being anti-parallel (a join), or where the opposite location jumps
 * (a different feature came into view).
 *
 * @param {object} a  Path whose boundary is walked
 * @param {object} b  Path probed for the facing side (usually the same path)
 * @param {{spacing?:number, distanceRange?:[number,number], distanceTolerance?:number,
 *          angleTolerance?:number, minRunLength?:number}} [opts]
 * @returns {{distance:number, spread:number, length:number,
 *            a:{subpathIndex:number,segIndex:number,t0:number,t1:number}[],
 *            b:{subpathIndex:number,segIndex:number,t0:number,t1:number}[]}[]}
 *   `distance` is the run's mean separation and `spread` its max−min — how constant the
 *   ribbon is, which is what tells a real stroke from a wedge.
 */
export function matchedRuns(a, b, opts = {}) {
  const scale = pathScale(a);
  const spacing = opts.spacing ?? scale * SAMPLE_FRACTION;
  const [minD, maxD] = opts.distanceRange ?? [EPS_COINCIDENT * 1e3, scale * 2];
  const distTol = opts.distanceTolerance ?? FLATNESS;
  const minRun = opts.minRunLength ?? scale * MIN_RUN_FRACTION;

  const samples = boundarySamples(a, spacing);
  const matched = samples.map((s) => {
    const hit = oppositePoint(a, s, {
      target: b,
      minDistance: minD,
      maxDistance: maxD,
      angleTolerance: opts.angleTolerance,
    });
    if (hit === null || !hit.antiparallel || hit.distance < minD || hit.distance > maxD) {
      return null;
    }
    return { a: s, b: hit, distance: hit.distance };
  });

  // Group consecutive accepted samples that stay on the same feature at the same width.
  const runs = [];
  let cur = [];
  const flush = () => {
    if (cur.length >= 2) runs.push(cur);
    cur = [];
  };
  for (let i = 0; i < matched.length; i++) {
    const m = matched[i];
    if (m === null) {
      flush();
      continue;
    }
    const prev = cur[cur.length - 1];
    if (prev !== undefined) {
      const sameSide =
        prev.b.subpathIndex === m.b.subpathIndex &&
        (prev.b.segIndex === m.b.segIndex || Math.abs(prev.b.segIndex - m.b.segIndex) === 1);
      const sameA =
        prev.a.subpathIndex === m.a.subpathIndex &&
        (prev.a.segIndex === m.a.segIndex || Math.abs(prev.a.segIndex - m.a.segIndex) === 1);
      if (!sameSide || !sameA || Math.abs(m.distance - prev.distance) > distTol) flush();
    }
    cur.push(m);
  }
  flush();

  const out = [];
  for (const run of runs) {
    const ds = run.map((m) => m.distance);
    const lo = Math.min(...ds);
    const hi = Math.max(...ds);
    if (hi - lo > distTol) continue; // not a constant-width ribbon after all
    let length = 0;
    for (let i = 1; i < run.length; i++) {
      const p = pointAt(run[i - 1].a.seg, run[i - 1].a.t);
      const q = pointAt(run[i].a.seg, run[i].a.t);
      length += Math.hypot(q.x - p.x, q.y - p.y);
    }
    if (length < minRun) continue;
    out.push({
      distance: ds.reduce((x, y) => x + y, 0) / ds.length,
      spread: hi - lo,
      length,
      a: compressSpans(run, 'a'),
      b: compressSpans(run, 'b'),
    });
  }
  out.sort((x, y) => y.length - x.length);
  return dropMirrors(out);
}

// Two spans describe the same stretch of boundary.
function sameSpans(p, q) {
  if (p.length !== q.length) return false;
  return p.every(
    (s, i) =>
      s.subpathIndex === q[i].subpathIndex &&
      s.segIndex === q[i].segIndex &&
      Math.abs(s.t0 - q[i].t0) < 1e-3 &&
      Math.abs(s.t1 - q[i].t1) < 1e-3,
  );
}

// Walking a boundary against itself finds every ribbon twice — once from each side. The
// second sighting is the same ribbon with `a` and `b` swapped, so keep only the first.
function dropMirrors(runs) {
  const kept = [];
  for (const r of runs) {
    if (kept.some((k) => sameSpans(k.a, r.b) && sameSpans(k.b, r.a))) continue;
    kept.push(r);
  }
  return kept;
}
