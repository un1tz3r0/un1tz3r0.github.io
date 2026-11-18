// F10 — finding fillets and chamfers that are already there.
//
// The forward direction is a construction; this one is an *inference*, and the hazard is
// inferring too much. A curve that was linearized and then had small fillets applied is
// locally indistinguishable from a chain of designed fillets — same tangency, same
// evenness, same everything — so a detector that only looks locally will happily
// "restore corners" that were never drawn, destroying a smooth curve in the process.
//
// The answer is a ladder of increasingly specific tests, cheapest first:
//
//   1. **Shape** — is this segment a circular arc (or a curve that fits one within
//      tolerance), or a straight bridge?
//   2. **Tangentialness** — does it meet both neighbours smoothly? (A chamfer instead
//      requires a genuine corner at both ends.)
//   3. **Evenness** — is its centre the same distance from both neighbours, with the
//      tangency landing at the joints? This is what "placed evenly between its two
//      neighbours" means, and it is what separates a fillet from an arc that merely
//      happens to sit there.
//   4. **Range gates** — radius in range, and the corner it would restore actually turns
//      by a meaningful angle.
//   5. **Run rejection** (H7, `rejectDegenerateRuns`) — the only test that looks beyond a
//      single candidate, and the one that catches linearization artifacts.
//
// `meta.origin` is consulted as a *hint* only: it can raise confidence on geometry we
// produced ourselves, but every gate above is evaluated regardless, because imported
// artwork carries no tags at all.

import {
  pointAt,
  tangentAt,
  nearestPoint,
  arcLength,
  metaOf,
  LINE,
  ARC,
  QUAD,
  CUBIC,
} from './segment.js';
import { subsegment } from './segment.js';
import { subpath, path } from './path.js';
import { arcCenter } from './arc.js';
import { meetExtended } from './corners.js';
import { dist, dot, cross } from './vec2.js';
import { EPS, FLATNESS } from './tolerance.js';
import { originOf } from './attributes.js';

/** Samples used to fit and validate a circle through a curved segment. */
const FIT_SAMPLES = 11;

/** Default angular tolerance for "meets its neighbour smoothly", in radians (~0.06°). */
export const DEFAULT_TANGENT_TOLERANCE = 1e-3;

/** Default minimum turn of the corner a removal would restore, in radians (5°). */
export const DEFAULT_MIN_CORNER = (5 * Math.PI) / 180;

// Algebraic (Kåsa) circle fit: minimise Σ(x² + y² + Dx + Ey + F)². Exact for points that
// lie on a circle, which is the case that matters here — the deviation check afterwards
// is what decides whether the input was circular in the first place.
function fitCircle(points) {
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  let sz = 0;
  let szx = 0;
  let szy = 0;
  const n = points.length;
  for (const p of points) {
    const z = p.x * p.x + p.y * p.y;
    sx += p.x;
    sy += p.y;
    sxx += p.x * p.x;
    syy += p.y * p.y;
    sxy += p.x * p.y;
    sz += z;
    szx += z * p.x;
    szy += z * p.y;
  }
  // Normal equations for [D, E, F].
  const a11 = sxx;
  const a12 = sxy;
  const a13 = sx;
  const a22 = syy;
  const a23 = sy;
  const a33 = n;
  const b1 = -szx;
  const b2 = -szy;
  const b3 = -sz;
  const det =
    a11 * (a22 * a33 - a23 * a23) - a12 * (a12 * a33 - a23 * a13) + a13 * (a12 * a23 - a22 * a13);
  if (Math.abs(det) < 1e-18) return null; // collinear samples: no circle
  const d =
    (b1 * (a22 * a33 - a23 * a23) - a12 * (b2 * a33 - a23 * b3) + a13 * (b2 * a23 - a22 * b3)) / det;
  const e =
    (a11 * (b2 * a33 - a23 * b3) - b1 * (a12 * a33 - a23 * a13) + a13 * (a12 * b3 - b2 * a13)) / det;
  const f =
    (a11 * (a22 * b3 - b2 * a23) - a12 * (a12 * b3 - b2 * a13) + b1 * (a12 * a23 - a22 * a13)) / det;
  const cx = -d / 2;
  const cy = -e / 2;
  const r2 = cx * cx + cy * cy - f;
  if (!(r2 > 0)) return null;
  return { center: { x: cx, y: cy }, radius: Math.sqrt(r2) };
}

/**
 * Is this segment a circular arc, exactly or within tolerance?
 *
 * True arcs with equal radii answer exactly. Quads and cubics — how most exporters write
 * a fillet — are fitted and then *validated*: the fit is only accepted if no sample
 * deviates from it by more than `tolerance` (absolute) or a thousandth of the radius.
 *
 * @returns {{center:{x,y}, radius:number, deviation:number, exact:boolean} | null}
 */
export function circleOf(seg, tolerance = FLATNESS) {
  if (seg.type === ARC) {
    const c = arcCenter(seg);
    if (Math.abs(c.rx - c.ry) > 1e-9 * Math.max(1, c.rx)) return null; // elliptical
    return { center: { x: c.cx, y: c.cy }, radius: c.rx, deviation: 0, exact: true };
  }
  if (seg.type !== QUAD && seg.type !== CUBIC) return null;

  const pts = [];
  for (let i = 0; i < FIT_SAMPLES; i++) pts.push(pointAt(seg, i / (FIT_SAMPLES - 1)));
  const fit = fitCircle(pts);
  if (fit === null) return null;
  let deviation = 0;
  for (const p of pts) deviation = Math.max(deviation, Math.abs(dist(p, fit.center) - fit.radius));
  if (deviation > Math.max(tolerance, fit.radius * 1e-3)) return null;
  return { ...fit, deviation, exact: false };
}

// Angle between two unit-ish vectors, in [0, π].
function angleBetween(u, v) {
  return Math.abs(Math.atan2(cross(u, v), dot(u, v)));
}

// The neighbours of segment i within a subpath's boundary, or null at an open end.
function neighboursOf(segs, i, closed) {
  const n = segs.length;
  if (n < 3) return null;
  if (!closed && (i === 0 || i === n - 1)) return null;
  return { prev: (i + n - 1) % n, next: (i + 1) % n };
}

function reject(base, reason, extra = {}) {
  return { ...base, ok: false, reason, ...extra };
}

/**
 * Every fillet-like or chamfer-like segment of a path, with the evidence for and against.
 *
 * A candidate is `ok: true` only if it passes the whole ladder; otherwise it carries the
 * gate that stopped it. Nothing is removed here — that is `unfilletPath` (H8) — so this
 * is also the diagnostic view: "what does the library think this segment is?"
 *
 * @param {object} pth  Path
 * @param {{radiusRange?:[number,number], tangentTolerance?:number, minCornerAngle?:number,
 *          evennessTolerance?:number, fitTolerance?:number, kinds?:('fillet'|'chamfer')[],
 *          extendFactor?:number, runRejection?:boolean, sliverAngle?:number,
 *          runLength?:number, radiusRatio?:number, maxGapSegments?:number,
 *          runFitTolerance?:number, minRadius?:number}} [opts]
 *   Run rejection (H7) is applied by default; `runRejection: false` returns the raw
 *   local verdicts.
 * @returns {object[]}  one entry per interior boundary segment that could be a treatment
 */
export function findFillets(pth, opts = {}) {
  const [rMin, rMax] = opts.radiusRange ?? [0, Infinity];
  const tangentTol = opts.tangentTolerance ?? DEFAULT_TANGENT_TOLERANCE;
  const minCorner = opts.minCornerAngle ?? DEFAULT_MIN_CORNER;
  const fitTol = opts.fitTolerance ?? FLATNESS;
  const kinds = opts.kinds ?? ['fillet', 'chamfer'];
  const out = [];

  for (let si = 0; si < pth.subpaths.length; si++) {
    const sp = pth.subpaths[si];
    const segs = sp.segments;
    for (let i = 0; i < segs.length; i++) {
      const nb = neighboursOf(segs, i, sp.closed);
      if (nb === null) continue;
      const seg = segs[i];
      const prev = segs[nb.prev];
      const next = segs[nb.next];
      const base = {
        subpathIndex: si,
        segIndex: i,
        prevIndex: nb.prev,
        nextIndex: nb.next,
        hint: originOf(seg),
      };

      // The corner this removal would restore has to be a real corner, whichever kind of
      // treatment produced it.
      const tPrev = tangentAt(prev, 1);
      const tNext = tangentAt(next, 0);
      const cornerAngle = angleBetween(tPrev, tNext);

      const circle = circleOf(seg, fitTol);
      const isLine = seg.type === LINE;

      if (circle !== null && kinds.includes('fillet')) {
        // 2. Tangentialness at both joints.
        const inBreak = angleBetween(tPrev, tangentAt(seg, 0));
        const outBreak = angleBetween(tangentAt(seg, 1), tNext);
        const entry = { ...base, kind: 'fillet', radius: circle.radius, center: circle.center, cornerAngle, deviation: circle.deviation, tangentError: Math.max(inBreak, outBreak) };
        if (entry.tangentError > tangentTol) {
          out.push(reject(entry, 'tangent-break'));
          continue;
        }
        // 3. Evenness: the centre must sit exactly `radius` from both neighbours, and the
        // nearest point on each must be *at the joint* — an arc whose centre happens to
        // be the right distance from the middle of a neighbour is not a fillet of it.
        const evenTol = opts.evennessTolerance ?? Math.max(fitTol, circle.radius * 1e-3);
        const hitPrev = nearestPoint(prev, circle.center);
        const hitNext = nearestPoint(next, circle.center);
        const evennessError = Math.max(
          Math.abs(hitPrev.dist - circle.radius),
          Math.abs(hitNext.dist - circle.radius),
        );
        entry.evennessError = evennessError;
        if (evennessError > evenTol) {
          out.push(reject(entry, 'uneven'));
          continue;
        }
        if (
          dist(hitPrev.point, pointAt(seg, 0)) > evenTol * 10 + fitTol ||
          dist(hitNext.point, pointAt(seg, 1)) > evenTol * 10 + fitTol
        ) {
          out.push(reject(entry, 'tangency-off-joint'));
          continue;
        }
        // 4. Range gates.
        if (circle.radius < rMin || circle.radius > rMax) {
          out.push(reject(entry, 'radius-out-of-range'));
          continue;
        }
        if (cornerAngle < minCorner) {
          out.push(reject(entry, 'corner-too-shallow'));
          continue;
        }
        out.push({ ...entry, ok: true, sweepAngle: arcLength(seg) / circle.radius });
        continue;
      }

      if (isLine && kinds.includes('chamfer')) {
        // A chamfer bridges a corner, so it must break tangency at *both* ends — the
        // opposite requirement to a fillet — and sit evenly between its neighbours,
        // which for a straight bridge means near-equal setbacks from the lost corner.
        const inBreak = angleBetween(tPrev, tangentAt(seg, 0));
        const outBreak = angleBetween(tangentAt(seg, 1), tNext);
        const entry = { ...base, kind: 'chamfer', cornerAngle, tangentError: Math.min(inBreak, outBreak) };
        if (inBreak <= tangentTol || outBreak <= tangentTol) {
          out.push(reject(entry, 'not-a-bridge'));
          continue;
        }
        if (cornerAngle < minCorner) {
          out.push(reject(entry, 'corner-too-shallow'));
          continue;
        }
        const meet = meetExtended(prev, next, opts);
        if (meet === null) {
          out.push(reject(entry, 'no-corner'));
          continue;
        }
        const setbackA = dist(meet.point, pointAt(seg, 0));
        const setbackB = dist(meet.point, pointAt(seg, 1));
        entry.corner = meet.point;
        entry.setbacks = [setbackA, setbackB];
        entry.evennessError = Math.abs(setbackA - setbackB) / Math.max(setbackA, setbackB, EPS);
        const equivalentRadius = Math.min(setbackA, setbackB) * Math.tan(cornerAngle / 2);
        entry.radius = equivalentRadius;
        if (equivalentRadius < rMin || equivalentRadius > rMax) {
          out.push(reject(entry, 'radius-out-of-range'));
          continue;
        }
        out.push({ ...entry, ok: true });
        continue;
      }

      out.push(reject({ ...base, kind: null, cornerAngle }, 'not-a-treatment'));
    }
  }
  return opts.runRejection === false ? out : rejectDegenerateRuns(pth, out, opts);
}

// --- H7: degenerate-run rejection ---------------------------------------------------------
//
// Everything above looks at one segment and its two neighbours. That is enough to be
// fooled, because the local signature of a designed fillet and of a linearization
// artifact is *identical*: both are small circular arcs meeting their neighbours
// tangentially, evenly placed. What separates them is what the neighbours are doing.
//
// A curve that was flattened to a polyline and then had its vertices rounded produces a
// long run of small arcs whose radii barely vary, separated by short straight spans, and
// whose joints all lie on one much larger line or circle. Nobody designs that. A designed
// rounded shape has few corners, generous radii relative to the spans between them, and
// joints that fit no single simple curve.
//
// So the rejection asks for all of it at once: enough candidates in a row, slowly-varying
// radii, small sweeps, and — the clincher — a joint polyline that a single line or circle
// explains within tolerance. Small sweeps are what keeps a rounded hexagon on the design
// side of the line: its vertices lie on a circle too, but nobody mistakes a 60° arc for
// discretization noise.

/** Default sweep below which an arc is "a sliver rather than a corner treatment" (15°). */
export const DEFAULT_SLIVER_ANGLE = (15 * Math.PI) / 180;

/** Default number of adjacent candidates that constitutes a run. */
const DEFAULT_RUN_LENGTH = 3;

// Total-least-squares line fit: max deviation of the points from their best-fit line.
function lineDeviation(points) {
  const n = points.length;
  let mx = 0;
  let my = 0;
  for (const p of points) {
    mx += p.x;
    my += p.y;
  }
  mx /= n;
  my /= n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const p of points) {
    const dx = p.x - mx;
    const dy = p.y - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  // Principal direction of the scatter matrix.
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const nx = -Math.sin(theta);
  const ny = Math.cos(theta);
  let worst = 0;
  for (const p of points) {
    worst = Math.max(worst, Math.abs((p.x - mx) * nx + (p.y - my) * ny));
  }
  return worst;
}

// Max deviation of the points from their best-fit circle (Infinity if they are collinear,
// which the line fit above is the right tool for anyway).
function circleDeviation(points) {
  const fit = fitCircle(points);
  if (fit === null) return Infinity;
  let worst = 0;
  for (const p of points) worst = Math.max(worst, Math.abs(dist(p, fit.center) - fit.radius));
  return worst;
}

// Group accepted candidates into maximal runs: candidates separated by at most
// `maxGapSegments` untreated segments.
//
// Note what is deliberately *not* a grouping condition — the length of those spans. The
// first version of this required the spans to be short relative to the fillet radius,
// reasoning that a discretized curve is densely packed. That is exactly backwards: in a
// linearize-then-fillet artifact the spans are the polygon's chords, which are far
// *longer* than the sliver radii (a 32-gon of radius 100 rounded at 1.5 has 19-long
// spans). Requiring short spans made the rejection never fire on the case it exists for.
function groupRuns(segs, closed, accepted, maxGapSegments) {
  if (accepted.length === 0) return [];
  const n = segs.length;
  const byIndex = new Map(accepted.map((c) => [c.segIndex, c]));
  const indices = accepted.map((c) => c.segIndex).sort((a, b) => a - b);
  const used = new Set();
  const runs = [];

  for (const start of indices) {
    if (used.has(start)) continue;
    const run = [];
    let i = start;
    for (let step = 0; step < n; step++) {
      const cand = byIndex.get(i);
      if (cand === undefined || used.has(i)) break;
      used.add(i);
      run.push(cand);

      // Look ahead across at most `maxGapSegments` untreated segments for the next one.
      let next = -1;
      for (let g = 1; g <= maxGapSegments + 1; g++) {
        const j = (i + g) % n;
        if (!closed && i + g >= n) break;
        if (byIndex.has(j) && !used.has(j)) {
          next = j;
          break;
        }
      }
      if (next < 0) break;
      i = next;
    }
    if (run.length > 0) runs.push(run);
  }
  return runs;
}

/**
 * Reject candidates that are discretization artifacts rather than design intent.
 *
 * Mutates nothing: returns a new candidate list where the rejected entries carry
 * `ok: false` with `reason: 'linearization-run'` or `'sliver'`, plus the evidence
 * (`runLength`, `runFit`) that decided it.
 *
 * @param {object} pth  the path the candidates came from
 * @param {object[]} candidates  output of `findFillets`
 * @param {{sliverAngle?:number, runLength?:number, radiusRatio?:number,
 *          maxGapSegments?:number, runFitTolerance?:number, minRadius?:number}} [opts]
 * @returns {object[]}
 */
export function rejectDegenerateRuns(pth, candidates, opts = {}) {
  const sliverAngle = opts.sliverAngle ?? DEFAULT_SLIVER_ANGLE;
  const minRun = opts.runLength ?? DEFAULT_RUN_LENGTH;
  const radiusRatio = opts.radiusRatio ?? 3;
  const maxGapSegments = opts.maxGapSegments ?? 1;
  const rejected = new Map();

  for (let si = 0; si < pth.subpaths.length; si++) {
    const sp = pth.subpaths[si];
    const segs = sp.segments;
    const accepted = candidates.filter((c) => c.ok && c.subpathIndex === si && c.kind === 'fillet');
    for (const run of groupRuns(segs, sp.closed, accepted, maxGapSegments)) {
      if (run.length < minRun) continue;

      // Slowly-varying radii and small sweeps: the signature of a uniform discretization.
      const radii = run.map((c) => c.radius);
      const ratio = Math.max(...radii) / Math.max(Math.min(...radii), EPS);
      if (ratio > radiusRatio) continue;
      if (run.some((c) => (c.sweepAngle ?? Infinity) > sliverAngle)) continue;

      // The clincher: do the run's joints lie on one much larger line or circle?
      const joints = [];
      for (const c of run) {
        joints.push(pointAt(segs[c.segIndex], 0), pointAt(segs[c.segIndex], 1));
      }
      let extent = 0;
      for (const p of joints) {
        for (const q of joints) extent = Math.max(extent, dist(p, q));
      }
      const tol = opts.runFitTolerance ?? extent * 0.02;
      const fit = Math.min(lineDeviation(joints), circleDeviation(joints));
      if (fit > tol) continue;

      for (const c of run) {
        rejected.set(c, { reason: 'linearization-run', runLength: run.length, runFit: fit });
      }
    }
  }

  // Single-candidate sliver rejection: geometry too small to be anybody's design.
  const minRadius = opts.minRadius ?? 0;
  return candidates.map((c) => {
    const hit = rejected.get(c);
    if (hit !== undefined) return { ...c, ok: false, ...hit };
    if (c.ok && c.kind === 'fillet' && c.radius < minRadius) {
      return { ...c, ok: false, reason: 'sliver' };
    }
    return c;
  });
}

// --- H8: removal ---------------------------------------------------------------------------

/**
 * Remove detected corner treatments, restoring the corners they replaced.
 *
 * Each accepted candidate's two neighbours are extended past their endpoints until they
 * meet (`meetExtended`, exact for every segment type), and the treatment is dropped. A
 * recovered corner must lie *outside* the arc it replaces — beyond its centre's reach —
 * which is the geometric statement of "this arc was cut from that corner"; anything else
 * is refused rather than reconstructed.
 *
 * @param {object} pth  Path
 * @param {object} [opts]  everything `findFillets` takes, plus `kinds` to choose which
 *   treatments to remove
 * @returns {{path:object, removed:object[], candidates:object[]}}
 *   `removed` are the candidates actually applied; `candidates` is the full analysis,
 *   including refusals with their reasons.
 */
export function removeTreatments(pth, opts = {}) {
  const candidates = findFillets(pth, opts);
  const applied = [];
  const subpaths = [];

  for (let si = 0; si < pth.subpaths.length; si++) {
    const sp = pth.subpaths[si];
    if (sp.segments.length === 0) {
      subpaths.push(sp);
      continue;
    }
    const segs = sp.segments;
    const mine = candidates.filter((c) => c.ok && c.subpathIndex === si);
    const removed = new Set();
    const range = segs.map(() => ({ t0: 0, t1: 1 }));

    for (const c of mine) {
      // Two treatments cannot share a neighbour: removing both would leave nothing to
      // extend. The first one wins; the second keeps a named refusal.
      if (removed.has(c.prevIndex) || removed.has(c.nextIndex) || removed.has(c.segIndex)) {
        c.ok = false;
        c.reason = 'adjacent-removal';
        continue;
      }
      const meet = meetExtended(segs[c.prevIndex], segs[c.nextIndex], opts);
      if (meet === null) {
        c.ok = false;
        c.reason = 'no-corner';
        continue;
      }
      // The corner has to sit outside the arc it replaced. A "corner" inside the fillet's
      // own circle is not the corner that fillet came from.
      if (c.center !== undefined && dist(meet.point, c.center) <= c.radius) {
        c.ok = false;
        c.reason = 'corner-inside-arc';
        continue;
      }
      removed.add(c.segIndex);
      range[c.prevIndex].t1 = meet.ta;
      range[c.nextIndex].t0 = meet.tb;
      applied.push({ ...c, corner: meet.point });
    }

    const out = [];
    for (let i = 0; i < segs.length; i++) {
      if (removed.has(i)) continue;
      const { t0, t1 } = range[i];
      if (t1 - t0 <= 1e-12) continue;
      out.push(t0 === 0 && t1 === 1 ? segs[i] : subsegment(segs[i], t0, t1));
    }
    subpaths.push(subpath(out, { closed: sp.closed }));
  }

  return { path: path(subpaths, { fillRule: pth.fillRule }), removed: applied, candidates };
}

/**
 * Remove fillets — round every detected fillet back into the corner it replaced.
 * @param {object} pth
 * @param {object} [opts]  see `findFillets`
 * @returns {object} Path
 */
export function unfilletPath(pth, opts = {}) {
  return removeTreatments(pth, { ...opts, kinds: ['fillet'] }).path;
}

/**
 * Remove chamfers. Note that a chamfer has no purely local signature (every edge of a
 * chamfered square is an even bridge between two corners), so a `radiusRange` is usually
 * required to say which bridges are the chamfers.
 * @param {object} pth
 * @param {object} [opts]  see `findFillets`
 * @returns {object} Path
 */
export function unchamferPath(pth, opts = {}) {
  return removeTreatments(pth, { ...opts, kinds: ['chamfer'] }).path;
}

/** Remove both kinds in one pass. */
export function uncornerPath(pth, opts = {}) {
  return removeTreatments(pth, { ...opts, kinds: opts.kinds ?? ['fillet', 'chamfer'] }).path;
}
