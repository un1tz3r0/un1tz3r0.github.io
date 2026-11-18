// F11 — centerline recovery: the inverse of `stroke`.
//
// Given a filled outline, recover the centerline path and the stroke width that produced
// it. The hard part is not the arithmetic; it is knowing when the answer is "this was
// never a stroke". A single estimator can always return *a* number, so this module runs
// two independent ones and cross-checks them:
//
//   1. **Pair histogram** — walk the boundary, match each sample to the point facing it
//      across the interior (`matchedRuns`, F7), and take the width that the most boundary
//      length agrees on. A real stroke has a sharp mode; a blob has none.
//   2. **Erosion** — for a constant-width stroke, eroding the region by r leaves a stroke
//      of width w − 2r, which vanishes exactly at r = w/2. Bisecting on "does anything
//      survive erosion by r" finds w/2 directly, and needs no assumption about the
//      stroke's length or shape.
//
// Agreement between the two is the confidence signal. Disagreement means the region is
// not a constant-width stroke, and saying so is the whole point of `strokeWidthOf` as a
// standalone probe.
//
// `unstroke` does not require that probe to pass. It splits arbitrary artwork into filled
// regions (J3) and walks each region's boundary, matching every sample to the point facing
// it across the interior; the walk's own separations are the measurement, and their mode is
// the width. The walk is cut into **ribbons** wherever the correspondence fails, and a
// ribbon's two sides give its centerline exactly where the geometry allows (parallel lines
// → the midline; concentric arcs → the mean-radius arc) and by fitting otherwise (J4).
// What is left between ribbons is a cap or a join, and which one it is follows from where
// it leads: a gap running from a ribbon's own side A to its own side B closes the stroke (a
// cap), a gap leading to a *different* ribbon connects them (a join) (J5). Chaining those
// links gives open and closed centerlines (J6). Then every answer is re-stroked and
// compared against the region it came from — which is a stronger test than any width
// cross-check, and is what decides whether a recovery is reported or handed back.
//
// Two things are deliberately *not* guessed. Strokes whose outline merged with itself
// leave links that cannot be paired up: reported as `unrecoverable-overlap`, never
// invented. And a square cap is not distinguishable from a butt cap on a centerline w/2
// longer — they are the same filled region — so the simpler reading is reported and
// `caps: 'square'` asks for the other one (see `capFromGap`).

import { pathArea, subpathArea } from './area.js';
import { offsetPath } from './offset.js';
import { matchedRuns, oppositePoint } from './distance.js';
import { nearestPointToPath } from './nearest.js';
import { simplify } from './boolean.js';
import { containsPoint } from './winding.js';
import { meetExtended } from './corners.js';
import { arcCenter } from './arc.js';
import { fitCubicChain, CHECK_TS } from './fitcurve.js';
import { stroke } from './stroke.js';
import {
  line,
  arc,
  pointAt,
  derivativeAt,
  tangentAt,
  startPoint,
  endPoint,
  reverseSegment,
  subsegment,
  arcLength,
  tAtLength,
} from './segment.js';
import { subpath, path, pathBoundingBox, NONZERO } from './path.js';
import { add, sub, scale, dot, cross, dist, len } from './vec2.js';
import { EPS, EPS_COINCIDENT, FLATNESS } from './tolerance.js';

/** Bisection steps for the erosion estimator. 24 gives ~1e-7 of the initial bracket. */
const EROSION_STEPS = 24;

// Signed area of the region eroded by `r`, measured in the region's own orientation.
//
// The obvious survival test — "does anything have positive area after eroding" — does not
// work, and the way it fails is instructive: past half-width the inward offset turns
// inside out, and `simplify` faithfully reports the flipped loop as a positive area. So
// erosion appears to vanish and then *come back*, and a bisection on it lands anywhere.
//
// The signed area of the *raw* offset has no such problem. It decreases monotonically
// through zero exactly as the region collapses, because the inverted loop carries the
// opposite sign. It is also far cheaper: no boolean pass at all.
function erodedSigned(pth, r, orient, tolerance) {
  try {
    return orient * pathArea(offsetPath(pth, orient * r, { join: 'round', tolerance }));
  } catch {
    return -Infinity; // an offset that cannot be built has certainly collapsed
  }
}

/**
 * Half-width by erosion: the radius at which the region collapses.
 *
 * For a constant-width stroke the eroded signed area falls to zero at r = w/2, so this
 * bisects on the sign rather than fitting a line — no assumption about the stroke's
 * length, and caps and joins barely move it.
 *
 * This is a **corroborating** estimate, not a precise one: the round connectors the
 * offset inserts at concave corners bias the crossing by up to ~10%. Its job is to
 * disagree loudly when the region is not a constant-width stroke, not to measure one.
 *
 * It also assumes a **ribbon-like** region, one that collapses in a single direction. A
 * region that collapses in two directions at once (a square, a wide blob) inverts twice
 * and regains a positive signed area, so the bracket check fails and this returns null.
 * That is the right answer for those shapes — they are not strokes — but it is a
 * limitation of the method rather than a judgement about the shape.
 *
 * @returns {number | null}  half-width, or null when the region never collapses within
 *   the bracket (which is itself evidence that it is not a stroke)
 */
export function erosionHalfWidth(pth, opts = {}) {
  const area0 = pathArea(pth);
  if (Math.abs(area0) <= EPS) return null;
  const orient = Math.sign(area0) || 1;
  const box = pathBoundingBox(pth);
  const scale = box === null ? 1 : Math.hypot(box.maxX - box.minX, box.maxY - box.minY);
  const tolerance = opts.tolerance;

  let lo = 0; // survives
  let hi = opts.maxHalfWidth ?? scale / 2; // expected to have collapsed
  if (erodedSigned(pth, hi, orient, tolerance) > 0) return null;

  for (let i = 0; i < EROSION_STEPS; i++) {
    const mid = 0.5 * (lo + hi);
    if (erodedSigned(pth, mid, orient, tolerance) > 0) lo = mid;
    else hi = mid;
  }
  return 0.5 * (lo + hi);
}

/**
 * Width by boundary pairing: the separation that the most boundary length agrees on.
 *
 * Runs come from `matchedRuns` (F7) — maximal stretches of boundary that face each other
 * at a constant distance with anti-parallel tangents, which is precisely what the two
 * sides of a stroke do. Weighting by run length is what makes this a *mode* rather than
 * an average: a long stretch of genuine ribbon outvotes any number of short accidents.
 *
 * @returns {{width:number, support:number, spread:number, runs:object[]} | null}
 *   `support` is the boundary length backing the winning width.
 */
export function pairWidth(pth, opts = {}) {
  const runs = matchedRuns(pth, pth, opts);
  if (runs.length === 0) return null;

  // Cluster runs by distance and pick the cluster with the most length behind it.
  const tol = opts.widthTolerance ?? (opts.distanceTolerance ?? 1e-3) * 10;
  const clusters = [];
  for (const run of runs) {
    const hit = clusters.find((c) => Math.abs(c.width - run.distance) <= tol);
    if (hit === undefined) {
      clusters.push({ width: run.distance, support: run.length, runs: [run] });
    } else {
      // Length-weighted mean keeps the cluster centred as it absorbs runs.
      const total = hit.support + run.length;
      hit.width = (hit.width * hit.support + run.distance * run.length) / total;
      hit.support = total;
      hit.runs.push(run);
    }
  }
  clusters.sort((a, b) => b.support - a.support);
  const best = clusters[0];
  const spread = Math.max(...best.runs.map((r) => r.spread));
  return { width: best.width, support: best.support, spread, runs: best.runs, clusters };
}

/**
 * The stroke width of a region, cross-checked by two independent estimators.
 *
 * Returns null when the two disagree beyond `agreement` — which is the useful answer for
 * a shape that was never a stroke, since neither estimator can tell that alone.
 *
 * @param {object} pth  a single filled region (see `segmentRegions` for arbitrary artwork)
 * @param {{widthRange?:[number,number], agreement?:number, tolerance?:number}} [opts]
 * @returns {{width:number, confidence:number, pairs:number|null, erosion:number|null,
 *            support:number, spread:number} | null}
 */
export function strokeWidthOf(pth, opts = {}) {
  const box = pathBoundingBox(pth);
  if (box === null) return null;
  const scale = Math.hypot(box.maxX - box.minX, box.maxY - box.minY);
  const [wMin, wMax] = opts.widthRange ?? [scale * 1e-3, scale];

  const pairs = pairWidth(pth, { ...opts, distanceRange: [wMin, wMax] });
  const half = erosionHalfWidth(pth, { ...opts, maxHalfWidth: wMax / 2 });
  const erosion = half === null ? null : half * 2;

  if (pairs === null && erosion === null) return null;
  if (pairs === null || erosion === null) {
    // One estimator only. Confidence is deliberately asymmetric: pairing is the
    // discriminating measurement (a real ribbon has a sharp, well-supported mode), while
    // erosion alone proves very little — every convex-ish blob has a collapse radius.
    const width = pairs === null ? erosion : pairs.width;
    if (width < wMin || width > wMax) return null;
    return {
      width,
      confidence: pairs === null ? 0.25 : 0.6,
      pairs: pairs === null ? null : pairs.width,
      erosion,
      support: pairs === null ? 0 : pairs.support,
      spread: pairs === null ? 0 : pairs.spread,
    };
  }

  // Erosion is deliberately loose (see `erosionHalfWidth`): the offset's round connectors
  // move the crossing by a few percent, so this threshold asks "same ballpark", not
  // "same number". The pairing estimate is what gets reported.
  const agreement = opts.agreement ?? 0.12;
  const disagreement = Math.abs(pairs.width - erosion) / Math.max(pairs.width, erosion, EPS);
  if (disagreement > agreement) return null;
  const width = pairs.width; // the pairing estimate is the sharper of the two
  if (width < wMin || width > wMax) return null;
  return {
    width,
    confidence: Math.max(0, 1 - disagreement / agreement),
    pairs: pairs.width,
    erosion,
    support: pairs.support,
    spread: pairs.spread,
  };
}

// ========================================================================================
// Boundary indexing — the same loop addressed two ways
// ========================================================================================
//
// The rest of the library addresses a boundary by (segIndex, t). A ribbon walk needs arc
// length: "what is 3 units further along this loop" has no answer in parameter space. Both
// live here, and everything below converts between them through these two helpers.

// Cyclic forward distance from a to b.
const cyc = (a, b, total) => ((b - a) % total + total) % total;

/** One closed boundary loop of a region, indexed by arc length. */
function loopOf(pth, index) {
  const segs = pth.subpaths[index].segments;
  const lens = segs.map(arcLength);
  const starts = [];
  let acc = 0;
  for (const L of lens) {
    starts.push(acc);
    acc += L;
  }
  return { index, segs, lens, starts, total: acc };
}

/**
 * The parameter at a given fraction of a segment's arc length.
 *
 * Lines and circular arcs travel at constant speed, so there the fraction *is* the
 * parameter — exactly, and without inverting anything. That shortcut is worth stating
 * plainly: a ribbon walk asks this question once per sample, and the general inversion
 * (Newton over a quadrature) costs about as much as the ray cast it is feeding.
 */
function paramAtFraction(seg, frac) {
  if (seg.type === 'line') return frac;
  if (seg.type === 'arc' && Math.abs(seg.rx - seg.ry) <= EPS * Math.max(seg.rx, seg.ry, 1)) {
    return frac;
  }
  return tAtLength(seg, frac * arcLength(seg));
}

/** Boundary location → arc-length position. */
function positionOnLoop(loop, segIndex, t) {
  return loop.starts[segIndex] + t * loop.lens[segIndex];
}

/**
 * The chain of boundary geometry from one location forward to another, wrapping the seam
 * if it has to. This is how a gap between two ribbons becomes something classifiable.
 */
function sliceLoop(loop, from, to) {
  const out = [];
  const n = loop.segs.length;
  let i = from.segIndex;
  let t0 = from.t;
  for (let guard = 0; guard <= n; guard++) {
    const arrived = i === to.segIndex && (guard > 0 || to.t >= t0);
    const t1 = arrived ? to.t : 1;
    if (t1 - t0 > 1e-12) out.push(subsegment(loop.segs[i], t0, t1));
    if (arrived) return out;
    i = (i + 1) % n;
    t0 = 0;
  }
  return out;
}

// A chain of segments parameterized by its own arc length, so a fittable can walk it.
function chainIndex(chain) {
  const lens = chain.map(arcLength);
  const starts = [];
  let acc = 0;
  for (const L of lens) {
    starts.push(acc);
    acc += L;
  }
  return { chain, lens, starts, total: acc };
}

function chainAt(idx, u) {
  const at = Math.min(Math.max(u, 0), 1) * idx.total;
  let i = idx.chain.length - 1;
  while (i > 0 && idx.starts[i] > at) i--;
  const t = idx.lens[i] <= EPS ? 0 : paramAtFraction(idx.chain[i], (at - idx.starts[i]) / idx.lens[i]);
  return { point: pointAt(idx.chain[i], t), tangent: tangentAt(idx.chain[i], t) };
}

const openPath = (segs) => path([subpath(segs, { closed: false })], { fillRule: NONZERO });

const chainLength = (segs) => segs.reduce((a, s) => a + arcLength(s), 0);

// Merge consecutive pieces that were only ever split by sampling: collinear lines and
// co-circular arcs. Reconstruction works block by block, so a straight side crossed by a
// segment junction arrives as several collinear pieces; nobody wants that in the answer.
function mergeChain(segs, tol) {
  const out = [];
  for (const seg of segs) {
    const prev = out[out.length - 1];
    if (prev !== undefined && dist(endPoint(prev), startPoint(seg)) <= tol) {
      if (prev.type === 'line' && seg.type === 'line') {
        const d1 = sub(endPoint(prev), startPoint(prev));
        const d2 = sub(endPoint(seg), startPoint(seg));
        const l1 = len(d1);
        const l2 = len(d2);
        if (l1 > EPS && l2 > EPS && dot(d1, d2) > 0 && Math.abs(cross(d1, d2)) <= tol * Math.max(l1, l2)) {
          out[out.length - 1] = line(startPoint(prev), endPoint(seg));
          continue;
        }
      }
      if (prev.type === 'arc' && seg.type === 'arc' && prev.sweep === seg.sweep) {
        const a = arcCenter(prev);
        const b = arcCenter(seg);
        const sweep = Math.abs(a.dtheta) + Math.abs(b.dtheta);
        // A full turn is not a single SVG arc, so a closed circular centerline keeps the
        // two halves it arrived as. Merging them would be representable only as a lie.
        if (
          Math.hypot(a.cx - b.cx, a.cy - b.cy) <= tol &&
          Math.abs(a.rx - b.rx) <= tol &&
          sweep < 2 * Math.PI - 1e-6
        ) {
          out[out.length - 1] = arc(
            startPoint(prev),
            endPoint(seg),
            a.rx,
            a.rx,
            0,
            sweep > Math.PI,
            prev.sweep,
          );
          continue;
        }
      }
    }
    out.push(seg);
  }
  return out;
}

// ========================================================================================
// J3 — region segmentation
// ========================================================================================

// A point strictly inside a closed loop, found by the same probe the ribbon walk uses:
// cast the inward normal from the boundary and stop halfway to whatever it hits. Stepping
// a fixed epsilon off the boundary would fail on exactly the thin shapes this module is
// about.
function interiorProbe(loopPath) {
  const segs = loopPath.subpaths[0].segments;
  let best = 0;
  for (let i = 1; i < segs.length; i++) {
    if (arcLength(segs[i]) > arcLength(segs[best])) best = i;
  }
  const loc = { subpathIndex: 0, segIndex: best, t: 0.5 };
  const p = pointAt(segs[best], 0.5);
  const hit = oppositePoint(loopPath, loc, {});
  if (hit === null) return p;
  return { x: (p.x + hit.point.x) / 2, y: (p.y + hit.point.y) / 2 };
}

/**
 * Split arbitrary artwork into connected filled regions — one Path per island, its holes
 * included.
 *
 * The input is simplified first (self-intersections resolved, orientations normalized), so
 * every loop that comes back is either an island boundary or a hole, and nesting decides
 * which island a hole belongs to. An island *inside* a hole is a region of its own, which
 * is what makes this containment-based rather than a flat outer/holes split.
 *
 * @param {object} pth  Path
 * @returns {object[]} Paths, fillRule 'nonzero', outer boundary first
 */
export function fillRegions(pth) {
  let src = pth;
  try {
    src = simplify(pth);
  } catch {
    // A boolean pass that cannot resolve the input is not fatal here: the loops are still
    // loops, and a region that turns out to be nonsense is refused downstream on evidence.
  }
  const loops = [];
  for (const sp of src.subpaths) {
    if (sp.segments.length === 0) continue;
    const area = subpathArea(sp);
    if (Math.abs(area) <= EPS) continue;
    const one = path([sp], { fillRule: NONZERO });
    loops.push({ sp, area, one, probe: interiorProbe(one), parent: -1 });
  }

  // Parent = the smallest loop that contains this one. Containment is tested with an
  // interior point, so loops that merely touch do not count as nested.
  for (let i = 0; i < loops.length; i++) {
    for (let j = 0; j < loops.length; j++) {
      if (i === j || Math.abs(loops[j].area) <= Math.abs(loops[i].area)) continue;
      if (!containsPoint(loops[j].one, loops[i].probe)) continue;
      if (loops[i].parent === -1 || Math.abs(loops[loops[i].parent].area) > Math.abs(loops[j].area)) {
        loops[i].parent = j;
      }
    }
  }

  const out = [];
  for (let i = 0; i < loops.length; i++) {
    // An island is a loop whose parent (if any) is a hole — i.e. one at even nesting depth.
    let depth = 0;
    for (let p = loops[i].parent; p !== -1; p = loops[p].parent) depth++;
    if (depth % 2 !== 0) continue;
    const holes = loops.filter((l, j) => l.parent === i && j !== i).map((l) => l.sp);
    out.push(path([loops[i].sp, ...holes], { fillRule: NONZERO }));
  }
  return out;
}

// ========================================================================================
// The ribbon walk — where the two sides of a stroke face each other, and where they stop
// ========================================================================================

/** Default boundary sampling step, as a fraction of the width. */
const SPACING_FRACTION = 1 / 8;

/** Hard cap on samples per region, so a huge outline cannot melt the machine. */
const MAX_SAMPLES = 4000;

/** How far either side of the aiming estimate the real walk still looks. */
const AIM_BAND = 0.15;

// One boundary sample and the point facing it across the interior. `hit === null` means
// nothing faces it within the width band — a cap, a join, or simply not a stroke.
function sampleLoop(region, loop, spacing, minD, maxD) {
  const out = [];
  for (let gi = 0; gi < loop.segs.length; gi++) {
    const L = loop.lens[gi];
    if (L <= EPS) continue;
    const n = Math.max(1, Math.ceil(L / spacing));
    for (let i = 0; i < n; i++) {
      // Sample at cell centres, never at t = 0 or 1: a corner has no single normal, and
      // the probe would be answering a question about the wrong side of it.
      const t = paramAtFraction(loop.segs[gi], (i + 0.5) / n);
      const p = pointAt(loop.segs[gi], t);
      const hit = oppositePoint(region, { subpathIndex: loop.index, segIndex: gi, t }, {
        maxDistance: maxD,
      });
      const ok = hit !== null && hit.antiparallel && hit.distance >= minD && hit.distance <= maxD;
      out.push({
        loopIndex: loop.index,
        segIndex: gi,
        t,
        s: positionOnLoop(loop, gi, t),
        p,
        tangent: tangentAt(loop.segs[gi], t),
        hit: ok ? hit : null,
        mid: ok ? { x: (p.x + hit.point.x) / 2, y: (p.y + hit.point.y) / 2 } : null,
      });
    }
  }
  return out;
}

// Do two line segments properly cross? Orientation tests only — the ribbon walk asks this
// once per sample and does not need the intersection, just the fact of it.
function crosses(p1, p2, q1, q2) {
  const side = (a, b, c) => cross(sub(b, a), sub(c, a));
  const d1 = side(p1, p2, q1);
  const d2 = side(p1, p2, q2);
  const d3 = side(q1, q2, p1);
  const d4 = side(q1, q2, p2);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

// Does the ribbon end between these two samples?
//
// Four ways it can, and each corresponds to something real:
//
//   * the separation changed — a taper, or a different stroke;
//   * the pairing *folded over* — consecutive cross-sections of a ribbon cannot cross each
//     other, so when they do, the facing point has moved to some other feature rather than
//     along the same one;
//   * the facing point jumped a whole width in one sampling step — the folding test misses
//     a feature change that happens to keep the cross-sections parallel (stepping off the
//     end of one side onto a facing one), and this catches it. The bound is a width rather
//     than a few sampling steps on purpose: walking the *inside* of a bend, the facing
//     point legitimately runs ahead by (r + w/2)/(r − w/2), which grows without limit as
//     the bend tightens, and a step-size threshold would break the very ribbons that need
//     the most care;
//   * the midpoint stopped advancing — the region is collapsing around a point rather than
//     running alongside itself. A disc's "centerline" is a dot, and this is what says so.
function ribbonBreaks(a, b, spacing, wTol) {
  if (a.hit === null || b.hit === null) return true;
  if (Math.abs(a.hit.distance - b.hit.distance) > wTol) return true;
  if (crosses(a.p, a.hit.point, b.p, b.hit.point)) return true;
  if (dist(a.hit.point, b.hit.point) > Math.max(3 * spacing, a.hit.distance)) return true;
  if (dist(a.mid, b.mid) < 0.2 * spacing) return true;
  return false;
}

// Cut a loop's samples into maximal ribbons. The walk is *cyclic*: a ribbon that happens
// to straddle the loop's seam is one ribbon, not two. (Where the seam falls is an artifact
// of whatever produced the path — `simplify` puts it wherever the rechaining started — and
// no answer should depend on it.)
function groupRuns(samples, spacing, wTol) {
  const n = samples.length;
  if (n === 0) return [];
  const cut = samples.map((s, i) => ribbonBreaks(samples[(i - 1 + n) % n], s, spacing, wTol));
  const first = cut.indexOf(true);
  if (first === -1) {
    // Nothing interrupts the correspondence anywhere: a closed ribbon (an annulus side).
    return samples[0].hit === null ? [] : [{ samples: samples.slice(), closed: true }];
  }
  const runs = [];
  let cur = null;
  for (let k = 0; k < n; k++) {
    const i = (first + k) % n;
    if (cut[i] && cur !== null) {
      runs.push(cur);
      cur = null;
    }
    if (samples[i].hit === null) {
      if (cur !== null) runs.push(cur);
      cur = null;
      continue;
    }
    if (cur === null) cur = { samples: [], closed: false };
    cur.samples.push(samples[i]);
  }
  if (cur !== null) runs.push(cur);
  return runs.filter((r) => r.samples.length >= 2);
}

// ========================================================================================
// J4 — centerline reconstruction
// ========================================================================================

const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

// Exact midline of two anti-parallel straight sides. Every sampled midpoint lies on it, so
// the first and last determine it outright — no fitting, no tolerance.
function exactMidline(block) {
  const a = block[0].mid;
  const b = block[block.length - 1].mid;
  return dist(a, b) <= EPS ? null : line(a, b);
}

// Exact centerline of two concentric circular sides at r ± w/2: the arc of radius r about
// the same centre. The sweep is accumulated from the samples rather than copied off either
// side, because the inner side runs backwards and a half-turn is ambiguous from endpoints.
function exactMidarc(block, aSeg, bSeg, w, tol) {
  if (aSeg.type !== 'arc' || bSeg.type !== 'arc') return null;
  const ca = arcCenter(aSeg);
  const cb = arcCenter(bSeg);
  if (Math.abs(ca.rx - ca.ry) > tol || Math.abs(cb.rx - cb.ry) > tol) return null;
  if (Math.hypot(ca.cx - cb.cx, ca.cy - cb.cy) > tol) return null;
  if (Math.abs(Math.abs(ca.rx - cb.rx) - w) > tol) return null;

  const c = { x: (ca.cx + cb.cx) / 2, y: (ca.cy + cb.cy) / 2 };
  const r = (ca.rx + cb.rx) / 2;
  let sweep = 0;
  for (let i = 1; i < block.length; i++) {
    const u = sub(block[i - 1].mid, c);
    const v = sub(block[i].mid, c);
    sweep += Math.atan2(cross(u, v), dot(u, v));
  }
  if (Math.abs(sweep) <= EPS) return null;
  const onCircle = (m) => {
    const d = sub(m, c);
    const k = r / Math.max(len(d), EPS);
    return { x: c.x + d.x * k, y: c.y + d.y * k };
  };
  return arc(
    onCircle(block[0].mid),
    onCircle(block[block.length - 1].mid),
    r,
    r,
    0,
    Math.abs(sweep) > Math.PI,
    sweep > 0,
  );
}

// The midcurve of a ribbon stretch with no closed form, described to the shared fitter.
//
// `point` walks side A by arc length and steps half way to the side facing it; `tangent`
// is side A's, because parallel curves share tangent directions at corresponding points.
// The error metric is the one that matters for a centerline — *is it still w/2 from the
// side it came from* — not deviation at equal parameter, which would punish the fit for
// the two curves being parameterized differently.
function midlineFittable(aIdx, aPath, bPath, w, u0, u1) {
  const at = (u) => chainAt(aIdx, u0 + (u1 - u0) * u);
  return {
    point: (u) => {
      const { point } = at(u);
      const q = nearestPointToPath(point, bPath);
      return q === null ? point : midpoint(point, q.point);
    },
    tangent: (u) => at(u).tangent,
    error: (cand) => {
      let worst = 0;
      for (const t of CHECK_TS) {
        const q = nearestPointToPath(pointAt(cand, t), aPath);
        if (q !== null) worst = Math.max(worst, Math.abs(q.dist - w / 2));
      }
      return worst;
    },
    split: () => {
      const m = (u0 + u1) / 2;
      return [midlineFittable(aIdx, aPath, bPath, w, u0, m), midlineFittable(aIdx, aPath, bPath, w, m, u1)];
    },
  };
}

/**
 * The centerline of one ribbon, exactly where the geometry allows it.
 *
 * The samples are cut into blocks that share a segment pair — the ribbon's two sides do not
 * change segment in step, so a straight side crossing a junction is several blocks — and
 * each block is reconstructed on its own: parallel lines give their midline, concentric
 * arcs give the mean-radius arc, and anything else is fitted. Consecutive fitted blocks are
 * merged first so a stroked cubic comes back as one fitted stretch instead of a dozen.
 */
function centerlineOfRun(loops, run, w, spacing, opts) {
  const samples = run.closed ? [...run.samples, run.samples[0]] : run.samples;

  // Fit no finer than the ribbon is consistent. The two sides of a stroked curve are
  // *fitted* offsets, so they are only as parallel as whoever built them asked for — and a
  // fitter told to hit 1e-3 against sides that disagree by 1e-2 cannot converge. It
  // subdivides to its depth cap, takes seconds, and returns a chain of slivers that is
  // worse than the honest answer. The run's own spread is the floor, so use it.
  const spread = (() => {
    const ds = run.samples.map((s) => s.hit.distance);
    return Math.max(...ds) - Math.min(...ds);
  })();
  const tol = Math.max(opts.tolerance ?? FLATNESS, spread);
  const key = (s) => `${s.segIndex}|${s.hit.subpathIndex}|${s.hit.segIndex}`;

  const blocks = [];
  for (const s of samples) {
    const last = blocks[blocks.length - 1];
    if (last !== undefined && last.key === key(s)) last.items.push(s);
    else blocks.push({ key: key(s), items: [s], sample: s });
  }

  // Reconstruct what can be reconstructed; mark the rest for fitting.
  const pieces = [];
  for (const b of blocks) {
    if (b.items.length < 2) {
      pieces.push({ kind: 'fit', items: b.items });
      continue;
    }
    const aSeg = loops[b.sample.loopIndex].segs[b.sample.segIndex];
    const bSeg = loops[b.sample.hit.subpathIndex].segs[b.sample.hit.segIndex];
    if (aSeg.type === 'line' && bSeg.type === 'line') {
      const mid = exactMidline(b.items);
      if (mid !== null) {
        pieces.push({ kind: 'exact', seg: mid, items: b.items });
        continue;
      }
    }
    const marc = exactMidarc(b.items, aSeg, bSeg, w, Math.max(tol, w * 1e-3));
    if (marc !== null) {
      pieces.push({ kind: 'exact', seg: marc, items: b.items });
      continue;
    }
    pieces.push({ kind: 'fit', items: b.items });
  }

  // Merge neighbouring fitted stretches: one fit over a long ribbon beats a chain of
  // short ones that happen to align at segment junctions.
  const merged = [];
  for (const p of pieces) {
    const last = merged[merged.length - 1];
    if (p.kind === 'fit' && last !== undefined && last.kind === 'fit') last.items.push(...p.items);
    else merged.push({ ...p, items: [...p.items] });
  }

  const out = [];
  for (const p of merged) {
    if (p.kind === 'exact') {
      out.push(p.seg);
      continue;
    }
    if (p.items.length < 2) continue;
    const first = p.items[0];
    const last = p.items[p.items.length - 1];
    const aChain = sliceLoop(loops[first.loopIndex], first, last);
    const bChain = sliceLoop(loops[last.hit.subpathIndex], last.hit, first.hit);
    if (aChain.length === 0 || bChain.length === 0) continue;
    const aIdx = chainIndex(aChain);
    if (aIdx.total <= EPS) continue;
    out.push(
      ...fitCubicChain(midlineFittable(aIdx, openPath(aChain), openPath(bChain), w, 0, 1), {
        tolerance: tol,
        // A centerline that will not sit still is evidence, not something to spend 2^16
        // pieces on. The cap is generous for any ribbon worth recovering, and the
        // re-stroke check downstream is what decides whether the result is usable.
        maxDepth: opts.maxFitDepth ?? 8,
      }),
    );
  }

  // Each block was reconstructed from its own samples, so consecutive pieces stop one
  // sample step short of each other. Meet them in the middle by extending both along their
  // own geometry — for the collinear and concentric cases that is still exact, and it is
  // what lets `mergeChain` recognize them as one piece afterwards.
  for (let i = 1; i < out.length; i++) {
    const gap = dist(endPoint(out[i - 1]), startPoint(out[i]));
    if (gap <= EPS_COINCIDENT || gap > 4 * spacing) continue;
    const m = midpoint(endPoint(out[i - 1]), startPoint(out[i]));
    out[i - 1] = reachTo([out[i - 1]], 1, m)[0];
    out[i] = reachTo([out[i]], 0, m)[0];
  }
  return mergeChain(out, Math.max(tol, w * 1e-4));
}

// ========================================================================================
// J5 — caps and joins: what the boundary does between two ribbons
// ========================================================================================

/**
 * Read a cap off the gap that closes one end of a stroke.
 *
 * A round cap is a semicircle of radius w/2 whose *centre* is the centerline endpoint — so
 * finding the arc gives the endpoint exactly. A butt cap is the chord across the ribbon,
 * length w, square to the direction of travel; its midpoint is the endpoint.
 *
 * There is no third case, and that is a statement about geometry rather than an omission.
 * A square cap extends the ribbon by w/2 of straight, parallel sides and closes it with the
 * same chord — which is exactly what a butt cap on a centerline w/2 longer looks like. The
 * two produce *the same filled region*, so recovery reports the simpler reading; passing
 * `caps: 'square'` asks for the other one, and pulls the endpoint back by w/2.
 */
function capFromGap(gap, w, exitDir, want) {
  const tol = w * 0.15;
  for (const seg of gap) {
    if (seg.type !== 'arc') continue;
    const c = arcCenter(seg);
    if (Math.abs(c.rx - w / 2) <= tol && Math.abs(c.ry - w / 2) <= tol) {
      return { style: 'round', point: { x: c.cx, y: c.cy } };
    }
  }

  let best = null;
  for (const seg of gap) {
    if (seg.type !== 'line') continue;
    const L = arcLength(seg);
    if (Math.abs(L - w) > tol || L <= EPS) continue;
    const along = Math.abs(dot(sub(endPoint(seg), startPoint(seg)), exitDir)) / L;
    if (along > 0.35) continue; // a cap chord crosses the ribbon, it does not follow it
    const err = Math.abs(L - w);
    if (best === null || err < best.err) best = { err, seg };
  }
  if (best === null) {
    const ends = gap.length === 0 ? null : midpoint(startPoint(gap[0]), endPoint(gap[gap.length - 1]));
    return { style: 'unknown', point: ends };
  }
  const chord = midpoint(startPoint(best.seg), endPoint(best.seg));
  // The square reading: same chord, centerline w/2 shorter. Measured as arc length back
  // along the recovered centerline rather than as a step along the exit direction, because
  // a square cap's arms are tangent-continuous with the ribbon — where they *begin* is not
  // visible in the geometry at all, only in the distance.
  return want === 'square'
    ? { style: 'square', point: chord, trim: w / 2 }
    : { style: 'butt', point: chord };
}

/**
 * Read a join off the gap between two ribbons, given the corner they share.
 *
 * Round joins are an arc of radius w/2 about the corner — a stroke's round joins *are*
 * fillets, so this is the same recognition `findFillets` does, keyed on a known radius.
 * A miter leaves the two offset sides running to a tip: once the sampling slivers are
 * merged back into the lines they belong to, exactly two pieces remain, and the tip's
 * distance from the corner over w/2 is the miter ratio SVG's `miterLimit` bounds. Anything
 * else is a bevel — including a miter that *exceeded* the limit, which `stroke` itself
 * turns into a bevel, and which nothing in the outline can tell apart from one.
 */
function joinFromGap(gap, w, corner) {
  const tol = w * 0.15;
  if (gap.length === 0) return { style: 'none' };
  for (const seg of gap) {
    if (seg.type !== 'arc') continue;
    const c = arcCenter(seg);
    if (Math.abs(c.rx - w / 2) > tol) continue;
    if (corner !== null && Math.hypot(c.cx - corner.x, c.cy - corner.y) > tol) continue;
    return { style: 'round' };
  }
  const merged = mergeChain(gap, w * 1e-3);
  if (merged.length === 2 && merged[0].type === 'line' && merged[1].type === 'line') {
    const tip = endPoint(merged[0]);
    return {
      style: 'miter',
      miterRatio: corner === null ? null : dist(tip, corner) / (w / 2),
    };
  }
  return { style: 'bevel' };
}

// ========================================================================================
// J6 — topology: chaining ribbons into centerlines
// ========================================================================================

// The parameter at which a segment passes closest to a point, *not* clamped to [0,1]:
// extending a centerline into its cap is the whole point. Exact for lines and circular
// arcs; Newton on |P(t) − q|² otherwise, which converges immediately at the distances
// involved here (a fraction of one sample step).
function paramAtPoint(seg, q, seed) {
  if (seg.type === 'line') {
    const d = sub(seg.p1, seg.p0);
    const L2 = dot(d, d);
    return L2 <= EPS ? seed : dot(sub(q, seg.p0), d) / L2;
  }
  if (seg.type === 'arc') {
    const c = arcCenter(seg);
    if (Math.abs(c.dtheta) <= EPS) return seed;
    // atan2 fixes the angle only up to a turn, and the answer wanted is the one just past
    // the end being extended — hence the branch closest to the seed, not the principal one.
    const theta = Math.atan2(q.y - c.cy, q.x - c.cx);
    let best = null;
    for (let k = -1; k <= 1; k++) {
      const t = (theta + 2 * Math.PI * k - c.theta1) / c.dtheta;
      if (best === null || Math.abs(t - seed) < Math.abs(best - seed)) best = t;
    }
    return best;
  }
  let t = seed;
  for (let i = 0; i < 12; i++) {
    const d1 = derivativeAt(seg, t);
    const h = dot(d1, d1);
    if (h <= EPS) break;
    const step = dot(sub(pointAt(seg, t), q), d1) / h; // Gauss-Newton on |P(t) − q|²
    t -= step;
    if (Math.abs(step) < 1e-12) break;
  }
  return t;
}

// Move a chain's terminal endpoint onto `target`, extending or trimming the terminal
// segment along its own geometry (never by tacking on a connector, which would put a kink
// where the stroke had none).
function reachTo(chainSegs, end, target) {
  if (chainSegs.length === 0 || target === null) return chainSegs;
  let out = [...chainSegs];
  try {
    for (let guard = 0; guard < chainSegs.length; guard++) {
      const i = end === 1 ? out.length - 1 : 0;
      const seg = out[i];
      if (dist(end === 1 ? endPoint(seg) : startPoint(seg), target) <= EPS_COINCIDENT) return out;
      const t = paramAtPoint(seg, target, end);
      if (!Number.isFinite(t)) return out;
      // A target that lies *behind* this whole piece trims it away entirely — asking for
      // a square cap can retract a centerline past the arm it was drawn along.
      if (end === 1 ? t <= 1e-6 : t >= 1 - 1e-6) {
        if (out.length === 1) return out;
        out = end === 1 ? out.slice(0, -1) : out.slice(1);
        continue;
      }
      // Refuse absurd reaches the other way: a target a whole segment beyond the end is
      // evidence of a bad match, and silently stretching to it would hide that.
      if (end === 1 ? t > 3 : t < -2) return out;
      out[i] = end === 1 ? subsegment(seg, 0, t) : subsegment(seg, t, 1);
      return out;
    }
  } catch {
    // An arc asked to sweep past a full turn throws rather than lying; leave it alone.
    return chainSegs;
  }
  return out;
}

// Absorb pieces too short to be anybody's design into their neighbours. A block junction
// that lands a fraction of a sample step from a real one leaves a sliver behind; keeping it
// costs nothing geometrically and everything numerically, since stroking a sliver produces
// exactly the degenerate overlaps boolean operations are worst at.
function absorbStubs(segs, minLen) {
  const out = [...segs];
  for (let i = out.length - 1; i >= 0 && out.length > 1; i--) {
    if (arcLength(out[i]) >= minLen) continue;
    const from = startPoint(out[i]);
    const to = endPoint(out[i]);
    out.splice(i, 1);
    if (i > 0) out[i - 1] = reachTo([out[i - 1]], 1, to).pop();
    else out[0] = reachTo([out[0]], 0, from)[0];
  }
  return out;
}

// Shorten a chain by `amount` of arc length from one end, dropping pieces it swallows.
function trimByLength(chainSegs, end, amount) {
  let out = [...chainSegs];
  let left = amount;
  while (out.length > 1) {
    const L = arcLength(out[end === 1 ? out.length - 1 : 0]);
    if (L > left + EPS) break;
    left -= L;
    out = end === 1 ? out.slice(0, -1) : out.slice(1);
  }
  const i = end === 1 ? out.length - 1 : 0;
  const L = arcLength(out[i]);
  if (left <= EPS || L <= left + EPS) return out;
  const t = paramAtFraction(out[i], (end === 1 ? L - left : left) / L);
  out[i] = end === 1 ? subsegment(out[i], 0, t) : subsegment(out[i], t, 1);
  return out;
}

const reverseChain = (segs) => segs.slice().reverse().map(reverseSegment);

// Interval bookkeeping: where a ribbon side sits on its loop, and what comes next.
const runStart = (run) => run.samples[0];
const runEnd = (run) => run.samples[run.samples.length - 1];

function nextRunForward(runs, loop, s) {
  let best = null;
  for (const r of runs) {
    if (runStart(r).loopIndex !== loop.index) continue;
    const d = cyc(s, runStart(r).s, loop.total);
    if (d <= 1e-9) continue;
    if (best === null || d < best.d) best = { run: r, d };
  }
  return best === null ? null : best.run;
}

function prevRunBackward(runs, loop, s) {
  let best = null;
  for (const r of runs) {
    if (runEnd(r).loopIndex !== loop.index) continue;
    const d = cyc(runEnd(r).s, s, loop.total);
    if (d <= 1e-9) continue;
    if (best === null || d < best.d) best = { run: r, d };
  }
  return best === null ? null : best.run;
}

// Which run holds a given boundary position (used to find a ribbon's other side).
function runAtPosition(runs, loops, loopIndex, s) {
  for (const r of runs) {
    if (runStart(r).loopIndex !== loopIndex) continue;
    if (r.closed) return r;
    const span = cyc(runStart(r).s, runEnd(r).s, loops[loopIndex].total);
    if (cyc(runStart(r).s, s, loops[loopIndex].total) <= span + 1e-9) return r;
  }
  return null;
}

// ========================================================================================
// J6/J7 — recovery per region, and the public API
// ========================================================================================

const CAPS = ['butt', 'round', 'square'];
const JOINS = ['miter', 'round', 'bevel'];

// The style the votes agree on, plus whether they agreed at all.
function vote(styles, fallback) {
  const tally = new Map();
  for (const s of styles) tally.set(s, (tally.get(s) ?? 0) + 1);
  let winner = fallback;
  let bestN = 0;
  for (const [s, n] of tally) {
    if (n > bestN) {
      winner = s;
      bestN = n;
    }
  }
  return { style: winner, agreed: tally.size <= 1, votes: [...tally.entries()] };
}

// Boundary points of a path, for the re-stroke comparison.
function boundaryPoints(pth, per) {
  const out = [];
  for (let si = 0; si < pth.subpaths.length; si++) {
    for (const seg of pth.subpaths[si].segments) {
      for (let i = 0; i < per; i++) out.push(pointAt(seg, (i + 0.5) / per));
    }
  }
  return out;
}

/**
 * How well re-stroking the answer reproduces the region it came from, as a distance.
 *
 * This is the honest end-to-end check — it exercises width, centerline, caps and joins at
 * once — and it is symmetric, because a recovered stroke can just as easily be too small as
 * too large. Reported as a length so the caller can compare it to their own tolerance;
 * `confidence` below is this number scaled against the half-width.
 */
function restrokeDeviation(region, spec) {
  let outline;
  try {
    outline = stroke(spec.centerline, {
      width: spec.width,
      cap: CAPS.includes(spec.caps) ? spec.caps : 'butt',
      join: JOINS.includes(spec.joins) ? spec.joins : 'miter',
      miterLimit: Math.max(spec.miterLimit ?? 4, 4),
    });
  } catch {
    return Infinity;
  }

  // `stroke` emits a *raw* outline: it self-intersects at every concave corner, exactly
  // where the region it is being compared against has a clean vertex. Trimming it with
  // `simplify` would make the comparison symmetric and cost more than everything else in
  // this module put together, so the two directions are asked differently instead.
  //
  //   too small — every point of the region's boundary must lie *on* the re-stroked
  //     outline. Trimming only ever removes pieces, so the trimmed boundary is a subset of
  //     the raw one and this direction needs no trimming at all.
  //   too big — every point of the re-stroked outline must lie *within* the region. The
  //     pieces trimming would have removed are precisely the ones inside it, so they are
  //     skipped by the containment test rather than by a boolean pass.
  let worst = 0;
  for (const q of boundaryPoints(region, 4)) {
    const near = nearestPointToPath(q, outline);
    if (near === null) return Infinity;
    worst = Math.max(worst, near.dist);
  }
  for (const p of boundaryPoints(outline, 4)) {
    if (containsPoint(region, p)) continue;
    const near = nearestPointToPath(p, region);
    if (near === null) return Infinity;
    worst = Math.max(worst, near.dist);
  }
  return worst;
}

// The separation the most samples agree on, within a relative tolerance. Sorting first
// makes the greedy pass deterministic and keeps each cluster contiguous.
function widthMode(distances, relTol) {
  const sorted = [...distances].sort((a, b) => a - b);
  const clusters = [];
  for (const d of sorted) {
    const last = clusters[clusters.length - 1];
    if (last !== undefined && d - last.sum / last.n <= relTol * d) {
      last.sum += d;
      last.n++;
    } else {
      clusters.push({ sum: d, n: 1 });
    }
  }
  let best = clusters[0];
  for (const c of clusters) if (c.n > best.n) best = c;
  return best.sum / best.n;
}

// Recover every stroke in one connected filled region, or say why not.
function recoverRegion(region, opts) {
  const reasons = [];
  const fail = (reason, extra) => {
    reasons.push({ reason, ...extra });
    return { strokes: [], reasons, ok: false };
  };

  const loops = region.subpaths.map((sp, i) => loopOf(region, i));
  const total = loops.reduce((a, l) => a + l.total, 0);
  const box = pathBoundingBox(region);
  const span = box === null ? 0 : Math.hypot(box.maxX - box.minX, box.maxY - box.minY);
  const [wMin, wMax] = opts.widthRange ?? [span * 1e-3, span];

  // Sampling has to resolve a cap or a join — a handful of steps across a gap of one width
  // — but there is no point resolving finer than the boundary itself is long, and
  // `MAX_SAMPLES` keeps a large outline from running away.
  const spacing =
    opts.spacing ?? Math.max(Math.min(wMax * SPACING_FRACTION, total / 200), total / MAX_SAMPLES);

  // Aim, then walk. Every probe casts a ray and intersects it with whatever boundary its
  // bounding box touches, so how far the ray reaches decides what the walk costs — and a
  // caller who says `widthRange: [2, 20]` about a width-7 stroke would otherwise pay for 20
  // on every one of hundreds of samples. A few dozen probes over the caller's whole band
  // find the mode; the real walk then reaches only as far as that mode needs.
  const coarse = [];
  for (const loop of loops) {
    coarse.push(...sampleLoop(region, loop, Math.max(total / 48, spacing), wMin, wMax));
  }
  const aim = coarse.filter((s) => s.hit !== null).map((s) => s.hit.distance);
  if (aim.length === 0) return fail('boundary-unmatched', { matchFraction: 0 });
  const aimed = widthMode(aim, opts.widthBand ?? 0.05);
  const band = [
    Math.max(wMin, aimed * (1 - AIM_BAND)),
    Math.min(wMax, aimed * (1 + AIM_BAND)),
  ];

  const walked = [];
  let sampled = 0;
  for (const loop of loops) {
    const samples = sampleLoop(region, loop, spacing, band[0], band[1]);
    sampled += samples.length;
    walked.push({ loop, samples });
  }

  // The width is the *mode* of what the walk saw, not the mean: a region carrying a stroke
  // plus something else has two populations, and the biggest one is the stroke. This is
  // `pairWidth`'s reasoning applied to the walk's own samples, which are arc-length uniform
  // — so counting them is weighting by boundary length, as it should be.
  const seen = walked.flatMap((x) => x.samples).filter((s) => s.hit !== null).map((s) => s.hit.distance);
  if (seen.length === 0) return fail('boundary-unmatched', { matchFraction: 0 });
  const w = widthMode(seen, opts.widthBand ?? 0.05);
  if (w < wMin || w > wMax) return fail('no-consistent-width', { width: w });
  const wTol = opts.widthTolerance ?? Math.max(w * 0.02, (opts.tolerance ?? FLATNESS) * 4);

  const runs = [];
  let matched = 0;
  for (const { samples } of walked) {
    for (const s of samples) {
      if (s.hit !== null && Math.abs(s.hit.distance - w) > wTol) {
        s.hit = null;
        s.mid = null;
      }
      if (s.hit !== null) matched++;
    }
    runs.push(...groupRuns(samples, spacing, wTol));
  }
  const matchFraction = sampled === 0 ? 0 : matched / sampled;
  const minMatch = opts.minMatchFraction ?? 0.5;
  if (matchFraction < minMatch) return fail('boundary-unmatched', { matchFraction });
  if (runs.length === 0) return fail('no-ribbons', { matchFraction });

  // Pair each ribbon side with the side facing it. Longest first, so the strongest
  // evidence claims its partner before anything shorter can.
  const order = [...runs].sort((a, b) => b.samples.length - a.samples.length);
  const owner = new Map();
  const ribbons = [];
  for (const run of order) {
    if (owner.has(run)) continue;
    const probe = run.samples[Math.floor(run.samples.length / 2)].hit;
    const facingLoop = loops[probe.subpathIndex];
    const other = runAtPosition(runs, loops, probe.subpathIndex, positionOnLoop(facingLoop, probe.segIndex, probe.t));
    if (other === null || owner.has(other) || other === run) {
      return fail('unpaired-side', { matchFraction });
    }
    const index = ribbons.length;
    owner.set(run, { index, side: 'A' });
    owner.set(other, { index, side: 'B' });
    const center = centerlineOfRun(loops, run, w, spacing, opts);
    const dists = run.samples.map((s) => s.hit.distance);
    ribbons.push({
      index,
      runA: run,
      runB: other,
      closed: run.closed && other.closed,
      center,
      width: dists.reduce((a, b) => a + b, 0) / dists.length,
      spread: Math.max(...dists) - Math.min(...dists),
    });
  }

  for (const r of ribbons) {
    const L = chainIndex(r.center).total;
    if (r.center.length === 0 || L < Math.max(spacing, w / 8)) {
      return fail('degenerate-centerline', { width: w });
    }
  }

  // Link the ends. Every ribbon end is either closed by a cap or joined to another
  // ribbon, and which it is follows from where the boundary goes next: back to this
  // ribbon's own other side (a cap) or into somebody else's (a join).
  const linkOf = (ribbon, end) => {
    const [own, otherSide] = end === 1 ? [ribbon.runA, ribbon.runB] : [ribbon.runB, ribbon.runA];
    const loopOwn = loops[runEnd(own).loopIndex];
    const nxt = nextRunForward(runs, loopOwn, runEnd(own).s);
    if (nxt === null) return null;
    const gap = sliceLoop(loopOwn, runEnd(own), runStart(nxt));
    const tag = owner.get(nxt);
    if (tag === undefined) return null;
    if (nxt === otherSide) return { kind: 'cap', gap };
    return { kind: 'join', gap, to: { index: tag.index, end: tag.side === 'A' ? 0 : 1 } };
  };

  for (const r of ribbons) {
    if (r.closed) {
      r.links = [null, null];
      continue;
    }
    const a = linkOf(r, 0);
    const b = linkOf(r, 1);
    if (a === null || b === null) return fail('unrecoverable-overlap', { ribbon: r.index });
    r.links = [a, b];
  }

  // Both ends of a join must agree that they are joined to each other. Where they do not,
  // the outline is not a single stroke's — most often two strokes whose outlines merged —
  // and there is nothing to be gained by picking one of the readings.
  for (const r of ribbons) {
    for (const end of [0, 1]) {
      const link = r.links[end];
      if (link === null || link.kind !== 'join') continue;
      const back = ribbons[link.to.index].links[link.to.end];
      if (back === null || back.kind !== 'join' || back.to.index !== r.index || back.to.end !== end) {
        return fail('unrecoverable-overlap', { ribbon: r.index });
      }
    }
  }

  // Chain: start at every cap (open strokes), then sweep up whatever is left in cycles
  // (closed strokes).
  const chains = [];
  const used = new Set();
  const walk = (startIndex, startEnd) => {
    const steps = [];
    let index = startIndex;
    let end = startEnd; // the end we are entering by
    for (;;) {
      if (used.has(index)) break;
      used.add(index);
      steps.push({ index, forward: end === 0 });
      const exit = ribbons[index].links[end === 0 ? 1 : 0];
      if (exit === null || exit.kind !== 'join') break;
      index = exit.to.index;
      end = exit.to.end;
    }
    return steps;
  };
  for (const r of ribbons) {
    if (r.closed || used.has(r.index)) continue;
    for (const end of [0, 1]) {
      if (used.has(r.index)) break;
      if (r.links[end] !== null && r.links[end].kind === 'cap') chains.push({ steps: walk(r.index, end), closed: false });
    }
  }
  for (const r of ribbons) {
    if (used.has(r.index)) continue;
    chains.push({ steps: walk(r.index, 0), closed: true });
  }

  // Assemble each chain into one centerline, recovering the exact corner at every join and
  // the exact endpoint at every cap.
  const strokes = [];
  for (const chain of chains) {
    const parts = chain.steps.map((s) => ({
      ribbon: ribbons[s.index],
      segs: s.forward ? [...ribbons[s.index].center] : reverseChain(ribbons[s.index].center),
      forward: s.forward,
    }));
    const capStyles = [];
    const joinStyles = [];
    let miterLimit = null;

    // Joins first: each one moves the two ends it sits between onto the recovered corner.
    for (let i = 0; i < parts.length - (chain.closed ? 0 : 1); i++) {
      const a = parts[i];
      const b = parts[(i + 1) % parts.length];
      // A join is visible from both sides, and only one of them has anything to say: the
      // outside of the turn carries the miter, arc or bevel, while on the inside the two
      // ribbons simply run into each other. Take the longer gap — the inner one is nothing
      // but the half sample step each ribbon stops short by, and it looks like a miter
      // (because the inside of a miter joint is exactly that shape).
      const gapA = a.ribbon.links[a.forward ? 1 : 0]?.gap ?? [];
      const gapB = b.ribbon.links[b.forward ? 0 : 1]?.gap ?? [];
      const gap = chainLength(gapA) >= chainLength(gapB) ? gapA : gapB;
      const meet = meetExtended(a.segs[a.segs.length - 1], b.segs[0], opts);
      const corner = meet === null ? null : meet.point;
      const info = joinFromGap(gap, w, corner);
      if (info.style !== 'none') joinStyles.push(info.style);
      if (info.miterRatio !== null && info.miterRatio !== undefined) {
        miterLimit = Math.max(miterLimit ?? 0, info.miterRatio);
      }
      if (corner !== null) {
        a.segs = reachTo(a.segs, 1, corner);
        b.segs = reachTo(b.segs, 0, corner);
      } else {
        // Tangent-continuous: the two pieces already meet, and there is no corner to find.
        const gapDist = dist(endPoint(a.segs[a.segs.length - 1]), startPoint(b.segs[0]));
        if (gapDist > Math.max(spacing, w / 4)) return fail('unrecoverable-overlap');
      }
    }

    if (!chain.closed) {
      for (const [i, end] of [[0, 0], [parts.length - 1, 1]]) {
        const part = parts[i];
        const link = part.ribbon.links[part.forward ? end : 1 - end];
        const seg = end === 1 ? part.segs[part.segs.length - 1] : part.segs[0];
        const dir = end === 1 ? tangentAt(seg, 1) : scale(tangentAt(seg, 0), -1);
        const cap = capFromGap(link === null ? [] : link.gap, w, dir, opts.caps);
        capStyles.push(cap.style);
        part.segs = reachTo(part.segs, end, cap.point);
        if (cap.trim !== undefined) part.segs = trimByLength(part.segs, end, cap.trim);
      }
    }

    const closed = chain.closed;
    const raw = parts.flatMap((p) => p.segs);
    if (raw.length === 0) continue;
    // Close first, merge second: a closed centerline's seam is a junction like any other,
    // and merging across it is exactly the case the arc guard in `mergeChain` exists for.
    const tol = Math.max(opts.tolerance ?? FLATNESS, w * 1e-4);
    const segs = absorbStubs(mergeChain(closed ? closeChain(raw) : raw, tol), spacing / 8);
    if (segs.length === 0) continue;
    const centerline = path([subpath(segs, { closed })], { fillRule: NONZERO });
    const caps = closed ? null : vote(capStyles, 'unknown');
    const joins = vote(joinStyles, 'miter');
    const spec = {
      centerline,
      width: w,
      caps: caps === null ? null : caps.style,
      joins: joins.style,
      miterLimit,
      closed,
    };
    const deviation = opts.verify === false ? 0 : restrokeDeviation(region, spec);
    const agreed = (caps === null || caps.agreed) && joins.agreed;
    strokes.push({
      ...spec,
      deviation,
      confidence: Math.max(0, 1 - deviation / (w / 2)) * (agreed ? 1 : 0.75),
    });
  }
  if (strokes.length === 0) return fail('no-ribbons');
  return { strokes, reasons, ok: true };
}

// A closed centerline's last piece must land exactly on the first one's start.
function closeChain(segs) {
  const out = [...segs];
  const first = startPoint(out[0]);
  if (dist(endPoint(out[out.length - 1]), first) <= EPS_COINCIDENT) return out;
  let done = reachTo(out, 1, first);
  if (dist(endPoint(done[done.length - 1]), first) > EPS_COINCIDENT * 1e3) {
    // The terminal piece would not stretch that far. The case that matters is a circle
    // recovered as one arc: closing it asks for a full turn, which no single SVG arc can
    // represent. Halve the piece and close the second half — a circle is two arcs.
    const last = out[out.length - 1];
    out.splice(out.length - 1, 1, subsegment(last, 0, 0.5), subsegment(last, 0.5, 1));
    done = reachTo(out, 1, first);
  }
  return done;
}

/**
 * Recover the strokes that produced a filled outline — the inverse of `stroke`.
 *
 * Arbitrary artwork is accepted: it is split into connected filled regions, each region is
 * tested for being a constant-width ribbon, and everything that is not one (or that is one
 * but cannot be explained end to end) is returned untouched in `residual`. Nothing is
 * guessed: every region that does not come back as a stroke comes back with a named reason.
 *
 * @param {object} pth  Path — a filled outline
 * @param {{widthRange?:[number,number], tolerance?:number, caps?:'butt'|'round'|'square',
 *          joins?:'miter'|'round'|'bevel', minMatchFraction?:number, spacing?:number,
 *          verify?:boolean}} [opts]
 *   `caps`/`joins` force a style rather than voting on it — `caps: 'square'` is the way to
 *   ask for the square reading of a cap that is, as a region, also a butt cap (see
 *   `capFromGap`). `verify: false` skips the re-stroke comparison and leaves `confidence`
 *   at 1 for anything recovered.
 * @returns {{strokes: {centerline:object, width:number, caps:string|null, joins:string,
 *            miterLimit:number|null, closed:boolean, deviation:number,
 *            confidence:number}[], residual:object, reasons:object[]}}
 */
export function unstroke(pth, opts = {}) {
  if (pth === null || typeof pth !== 'object' || !Array.isArray(pth.subpaths)) {
    throw new TypeError('unstroke: pth must be a Path');
  }
  if (opts.caps !== undefined && !CAPS.includes(opts.caps)) {
    throw new TypeError(`unstroke: caps must be one of ${CAPS.join(', ')}`);
  }
  if (opts.joins !== undefined && !JOINS.includes(opts.joins)) {
    throw new TypeError(`unstroke: joins must be one of ${JOINS.join(', ')}`);
  }

  const strokes = [];
  const residual = [];
  const reasons = [];
  const regions = fillRegions(pth);
  for (let i = 0; i < regions.length; i++) {
    let got;
    try {
      got = recoverRegion(regions[i], opts);
    } catch (err) {
      got = { strokes: [], reasons: [{ reason: 'analysis-failed', message: err.message }], ok: false };
    }
    for (const r of got.reasons) reasons.push({ ...r, region: i });
    if (got.ok) {
      for (const s of got.strokes) strokes.push({ ...s, region: i });
      // A stroke recovered but visibly wrong is still a refusal: the region is reported
      // as residual as well, so a caller who only looks at `strokes` is never misled. The
      // budget scales with the stroke — 2% of a width — and never falls below tolerance.
      const worst = Math.max(...got.strokes.map((s) => s.deviation));
      const budget = Math.max(
        (opts.tolerance ?? FLATNESS) * 10,
        Math.max(...got.strokes.map((s) => s.width)) * 0.02,
      );
      if (worst > budget) {
        residual.push(...regions[i].subpaths);
        reasons.push({ reason: 'restroke-mismatch', region: i, deviation: worst });
      }
    } else {
      residual.push(...regions[i].subpaths);
    }
  }
  return { strokes, residual: path(residual, { fillRule: NONZERO }), reasons };
}

/**
 * The recovered centerlines as one Path — the convenience form of `unstroke` for callers
 * who want the geometry and not the report. Subpaths come back in recovery order; a region
 * that was not a stroke contributes nothing.
 * @param {object} pth
 * @param {object} [opts]  see `unstroke`
 * @returns {object} Path
 */
export function centerlinePath(pth, opts = {}) {
  const out = [];
  for (const s of unstroke(pth, opts).strokes) out.push(...s.centerline.subpaths);
  return path(out, { fillRule: NONZERO });
}

/**
 * J3 as a public probe: the filled regions of `pth`, each with the width it looks like it
 * was stroked at and how much of its boundary agrees.
 * @param {object} pth
 * @param {object} [opts]  see `unstroke`
 * @returns {{path:object, width:number|null, confidence:number, strokeLike:boolean,
 *            reason:string|null}[]}
 */
export function segmentRegions(pth, opts = {}) {
  return fillRegions(pth).map((region) => {
    const got = recoverRegion(region, opts);
    return {
      path: region,
      width: got.ok ? got.strokes[0].width : (strokeWidthOf(region, opts)?.width ?? null),
      confidence: got.ok ? Math.max(...got.strokes.map((s) => s.confidence)) : 0,
      strokeLike: got.ok,
      reason: got.ok ? null : got.reasons[got.reasons.length - 1].reason,
    };
  });
}

