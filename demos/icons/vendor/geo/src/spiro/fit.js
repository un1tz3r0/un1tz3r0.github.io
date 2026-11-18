// F9 — path → spiro: fit a spiro control-point set to existing Bézier/arc
// geometry. Inherently approximate (the reverse of an approximate conversion):
// the contract is "spiroToPath(pathToSpiro(p)) stays within tolerance of p",
// not structural round-tripping.
//
// Strategy: seed knots at the path's own nodes — corners ('v') where the
// tangent breaks, 'o' (G4) at smooth curve junctions, '['/']' bracketing
// straight stretches — then refine: solve, measure deviation of the original
// boundary against the candidate, and insert an extra G4 knot at the worst
// point of every span still out of tolerance (greedy worst-point insertion,
// à la Schneider curve fitting). Line segments are reproduced exactly by the
// bracket/corner types and are never subdivided.

import { pointAt, tangentAt, LINE } from '../core/segment.js';
import { pathBoundingBox } from '../core/path.js';
import { nearestPointToPath } from '../core/nearest.js';
import { spiroToPath } from './spiro.js';

const SAMPLES_PER_SEG = 8;
const MAX_KNOTS = 200;

function tangentGap(a, b) {
  return Math.abs(Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y));
}

// Ordered (segIndex, t) sample stations on the original boundary between two
// anchors (b may wrap past the end on a closed boundary).
function spanStations(segs, a, b, cyclic) {
  const portions = [];
  if (a.segIndex === b.segIndex && a.t < b.t) {
    portions.push([a.segIndex, a.t, b.t]);
  } else {
    portions.push([a.segIndex, a.t, 1]);
    let s = (a.segIndex + 1) % segs.length;
    for (let guard = 0; s !== b.segIndex && guard <= segs.length; guard++) {
      portions.push([s, 0, 1]);
      if (!cyclic && s + 1 >= segs.length) break;
      s = (s + 1) % segs.length;
    }
    portions.push([b.segIndex, 0, b.t]);
  }
  const out = [];
  for (const [s, t0, t1] of portions) {
    if (t1 - t0 < 1e-9) continue;
    for (let k = 1; k <= SAMPLES_PER_SEG; k++) {
      out.push({ segIndex: s, t: t0 + ((t1 - t0) * k) / (SAMPLES_PER_SEG + 1) });
    }
  }
  return out;
}

// Fit one subpath; returns a contour or null for empty/degenerate input.
function fitSubpath(sp, opts) {
  const segs = sp.segments;
  if (!segs.length) return null;
  const closed = !!sp.closed;
  const cornerAngle = opts.cornerAngle ?? 0.01;

  // Seed knots at the drawn nodes.
  const knots = [];
  const nodeType = (prev, next) => {
    const smooth = tangentGap(tangentAt(prev, 1), tangentAt(next, 0)) <= cornerAngle;
    if (!smooth) return 'v';
    const pl = prev.type === LINE;
    const nl = next.type === LINE;
    if (pl && nl) return 'v'; // collinear polyline node: keep exact
    if (pl) return ']'; // line ends, curve begins
    if (nl) return '['; // curve ends, line begins
    return 'o';
  };
  for (let i = 0; i < segs.length; i++) {
    if (i === 0 && !closed) {
      knots.push({ segIndex: 0, t: 0, ty: 'v' }); // open end (type is overridden)
    } else {
      const prev = segs[(i + segs.length - 1) % segs.length];
      knots.push({ segIndex: i, t: 0, ty: nodeType(prev, segs[i]) });
    }
  }
  if (!closed) knots.push({ segIndex: segs.length - 1, t: 1, ty: 'v' });

  const bb = pathBoundingBox({ subpaths: [sp] });
  const tol =
    opts.tolerance ?? Math.hypot(bb.maxX - bb.minX, bb.maxY - bb.minY) * 1e-3;
  const maxRounds = opts.maxRounds ?? 10;

  const toContour = () => ({
    points: knots.map((k) => {
      const p = pointAt(segs[k.segIndex], k.t);
      return { x: p.x, y: p.y, type: k.ty };
    }),
    closed,
  });

  for (let round = 0; round < maxRounds; round++) {
    const candidate = spiroToPath(toContour());
    // Deviation per span between consecutive knots; collect insertions.
    const inserts = [];
    const nspans = closed ? knots.length : knots.length - 1;
    for (let i = 0; i < nspans; i++) {
      const a = knots[i];
      const b = knots[(i + 1) % knots.length];
      let worst = null;
      for (const st of spanStations(segs, a, b, closed)) {
        if (segs[st.segIndex].type === LINE) continue; // lines are exact
        const p = pointAt(segs[st.segIndex], st.t);
        const d = nearestPointToPath(p, candidate).dist;
        if (d > tol && (!worst || d > worst.d)) worst = { ...st, d };
      }
      if (worst) inserts.push({ segIndex: worst.segIndex, t: worst.t, ty: 'o' });
    }
    if (!inserts.length) break;
    if (knots.length + inserts.length > MAX_KNOTS) break; // best effort
    knots.push(...inserts);
    knots.sort((p, q) => p.segIndex - q.segIndex || p.t - q.t);
  }
  return toContour();
}

/**
 * Fit spiro contours to a path (the lossy inverse of `spiroToPath`).
 *
 * Knots are seeded at the path's own nodes (corners → 'corner', smooth curve
 * joins → 'g4', straight stretches bracketed 'left'/'right') and refined by
 * worst-point insertion until `spiroToPath` of the result stays within
 * `tolerance` of the input, rounds and knot count permitting (best effort —
 * measure the deviation if you need a guarantee). Closed subpaths include the
 * implicit closing chord; the fill rule is not carried over.
 * @param {object} pth  Path
 * @param {{tolerance?: number, cornerAngle?: number, maxRounds?: number}} [opts]
 *        tolerance: max shape deviation (default: bbox diagonal × 1e-3);
 *        cornerAngle: tangent break (radians) treated as a corner (default 0.01)
 * @returns {{points: {x:number,y:number,type:string}[], closed: boolean}[]}
 */
export function pathToSpiro(pth, opts = {}) {
  const LONG = { v: 'corner', o: 'g4', c: 'g2', '[': 'left', ']': 'right' };
  const out = [];
  for (const sp of pth.subpaths) {
    const contour = fitSubpath(sp, opts);
    if (!contour) continue;
    contour.points = contour.points.map((p) => ({ ...p, type: LONG[p.type] ?? p.type }));
    out.push(contour);
  }
  return out;
}
