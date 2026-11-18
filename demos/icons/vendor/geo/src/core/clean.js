// F20 — path cleanup: welding, dissolving degeneracies, and retargeting resolution.
//
// These are the operations that turn imported or generated artwork into something the rest
// of the library can work on: geometry that has been through a raster tracer, a flattener,
// or a chain of boolean ops accumulates near-duplicate nodes, hairline segments and
// subdivided runs that carry no information.
//
// ## `resolution` is one knob, lossless at both ends
//
// That is what makes it coherent as a single axis rather than two unrelated switches:
//
//   - **resolution 1** — preserve every distinguishable feature. Only provably redundant
//     subdivision goes: runs of collinear lines collapse to one line, runs of arcs sharing
//     a centre and radii collapse to one arc. This is the exact inverse of subdivision, so
//     the geometry is unchanged.
//   - **resolution 0** — no density requirement. Everything above, plus segments shorter
//     than the tolerance are dissolved and smooth runs are refitted to as few cubics as the
//     deviation budget allows.
//
// Between them, `resolution` scales the deviation budget actually spent:
// `effective = tolerance × (1 − resolution)`. At 1 that is zero, which is why the top of
// the range is lossless by construction rather than by luck.
//
// ## What welding deliberately does not do
//
// `mergeByDistance` welds nodes that are *adjacent* (joined by a segment), and, at wider
// scopes, subpath endpoints. It does **not** weld two non-adjacent interior nodes that
// happen to be close: that creates a self-touching subpath whose interior is ambiguous,
// and the operation that resolves such contact correctly is F6's `simplify`. Silently
// producing self-contact here would hand the caller geometry that later ops disagree about.

import { vec2 } from './vec2.js';
import {
  line,
  arc,
  cubic,
  arcLength,
  arcLengthTo,
  tAtLength,
  pointAt,
  tangentAt,
  nearestPoint,
  startPoint,
  endPoint,
  reverseSegment,
  LINE,
  ARC,
} from './segment.js';
import { arcCenter } from './arc.js';
import { subpath, path } from './path.js';
import { fitCubicChain } from './fitcurve.js';
import { tagOutputAll } from './attributes.js';
import { EPS, EPS_COINCIDENT, FLATNESS } from './tolerance.js';

/**
 * The turn above which a junction is a designed **corner** rather than a subdivision
 * artifact — refitting is never allowed to round one off.
 *
 * Deliberately not `EPS_ANGLE` (1e-9): flattening a cubic to a 0.02 tolerance produces
 * junctions turning by up to ~0.12 rad, so a numeric epsilon classifies every one of them
 * as a corner and the refit silently does nothing. 20° separates the two populations.
 */
export const CORNER_ANGLE = 0.35;

const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

// Unit bisector normal at a junction between two segments — the same pseudo-normal
// `nodeNormals` reports, recomputed here so cleanup never has to walk the whole path.
function junctionNormal(inSeg, outSeg) {
  const tIn = inSeg ? tangentAt(inSeg, 1) : tangentAt(outSeg, 0);
  const tOut = outSeg ? tangentAt(outSeg, 0) : tangentAt(inSeg, 1);
  const nx = -tIn.y + -tOut.y;
  const ny = tIn.x + tOut.x;
  const l = Math.hypot(nx, ny);
  if (l <= EPS_COINCIDENT) return vec2(-tIn.y, tIn.x); // 180° cusp: fall back to one side
  return vec2(nx / l, ny / l);
}

// Does a pair of node normals fall inside the caller's agreement window?
function normalsAgree(a, b, window) {
  if (!window) return true;
  const d = a.x * b.x + a.y * b.y;
  return d >= window[0] - EPS && d <= window[1] + EPS;
}

// Rebuild a chain of segments so consecutive endpoints match exactly after a weld, without
// changing any segment's type or interior shape.
function setEnds(seg, p0, p1) {
  switch (seg.type) {
    case LINE:
      return line(p0, p1);
    case ARC:
      return arc(p0, p1, seg.rx, seg.ry, seg.xAxisRotation, seg.largeArc, seg.sweep);
    case 'quad':
      return { ...seg, p0, p2: p1 };
    default:
      return { ...seg, p0, p3: p1 };
  }
}

/**
 * Weld nodes that lie within `tolerance` of each other.
 *
 * `scope` is a ladder of increasing topological reach:
 * - `'connected'` (default) — only **adjacent** nodes, i.e. collapse short segments. No
 *   topology change.
 * - `'subpath'` — also close an open subpath whose two ends meet.
 * - `'path'` — also join two different subpaths whose ends meet.
 *
 * `normalDot: [lo, hi]` restricts welding to node pairs whose junction normals agree within
 * that window, so a hairpin fold-back (normals near-opposed, dot ≈ −1) is not welded shut
 * by a `[0, 1]` window.
 *
 * @param {object} pth
 * @param {number} tolerance
 * @param {{scope?:string, normalDot?:[number,number], outAttrs?:object}} [opts]
 * @returns {object} Path
 */
export function mergeByDistance(pth, tolerance, opts = {}) {
  if (!(tolerance >= 0)) throw new RangeError(`mergeByDistance: tolerance must be ≥ 0, got ${tolerance}`);
  const scope = opts.scope ?? 'connected';
  if (!['connected', 'subpath', 'path'].includes(scope)) {
    throw new TypeError(`mergeByDistance: scope must be 'connected', 'subpath' or 'path'`);
  }
  const window = opts.normalDot;

  let subpaths = pth.subpaths.map((sp) => collapseAdjacent(sp, tolerance, window));

  if (scope === 'subpath' || scope === 'path') {
    subpaths = subpaths.map((sp) => closeIfMeeting(sp, tolerance, window));
  }
  if (scope === 'path') {
    subpaths = joinAcrossSubpaths(subpaths, tolerance, window);
  }

  const kept = subpaths.filter((sp) => sp.segments.length > 0);
  const out = path(kept, { fillRule: pth.fillRule });
  return opts.outAttrs ? tagPath(out, opts.outAttrs) : out;
}

function tagPath(pth, outAttrs) {
  return path(
    pth.subpaths.map((sp) => subpath(tagOutputAll(sp.segments, outAttrs), { closed: sp.closed })),
    { fillRule: pth.fillRule },
  );
}

// Collapse segments whose two ends are within tolerance, welding to the midpoint.
function collapseAdjacent(sp, tolerance, window) {
  const segs = sp.segments.slice();
  if (segs.length === 0) return sp;
  let changed = true;
  let guard = 0;
  while (changed && guard++ < segs.length + 4) {
    changed = false;
    for (let i = 0; i < segs.length; i++) {
      if (segs.length <= (sp.closed ? 2 : 1)) break;
      const seg = segs[i];
      const a = startPoint(seg);
      const b = endPoint(seg);
      if (dist(a, b) > tolerance) continue;
      // The junctions at each end of the doomed segment.
      const prev = i > 0 ? segs[i - 1] : sp.closed ? segs[segs.length - 1] : null;
      const next = i < segs.length - 1 ? segs[i + 1] : sp.closed ? segs[0] : null;
      if (!normalsAgree(junctionNormal(prev, seg), junctionNormal(seg, next), window)) continue;
      const weld = vec2((a.x + b.x) / 2, (a.y + b.y) / 2);
      segs.splice(i, 1);
      const pi = (i - 1 + segs.length) % segs.length;
      if (prev !== null) segs[pi] = setEnds(segs[pi], startPoint(segs[pi]), weld);
      const ni = i % segs.length;
      if (next !== null && segs.length > 0) segs[ni] = setEnds(segs[ni], weld, endPoint(segs[ni]));
      changed = true;
      break;
    }
  }
  return subpath(segs, { closed: sp.closed });
}

// An open subpath whose ends meet becomes closed, with the loop materialized (F21).
function closeIfMeeting(sp, tolerance, window) {
  if (sp.closed || sp.segments.length < 2) return sp;
  const segs = sp.segments.slice();
  const a = startPoint(segs[0]);
  const b = endPoint(segs[segs.length - 1]);
  const d = dist(a, b);
  if (d > tolerance) return sp;
  const nA = junctionNormal(null, segs[0]);
  const nB = junctionNormal(segs[segs.length - 1], null);
  if (!normalsAgree(nA, nB, window)) return sp;
  const weld = vec2((a.x + b.x) / 2, (a.y + b.y) / 2);
  segs[0] = setEnds(segs[0], weld, endPoint(segs[0]));
  segs[segs.length - 1] = setEnds(segs[segs.length - 1], startPoint(segs[segs.length - 1]), weld);
  return subpath(segs, { closed: true });
}

// Join open subpaths whose endpoints coincide, chaining greedily.
function joinAcrossSubpaths(subpaths, tolerance, window) {
  const open = [];
  const out = [];
  for (const sp of subpaths) {
    if (sp.closed || sp.segments.length === 0) out.push(sp);
    else open.push(sp.segments.slice());
  }
  let merged = true;
  let guard = 0;
  while (merged && guard++ < open.length + 4) {
    merged = false;
    outer: for (let i = 0; i < open.length; i++) {
      for (let j = 0; j < open.length; j++) {
        if (i === j) continue;
        const A = open[i];
        const B = open[j];
        // Four ways two chains can meet; try each, reversing where needed.
        for (const [flipA, flipB] of [[false, false], [false, true], [true, false], [true, true]]) {
          const a = flipA ? reverseChain(A) : A;
          const b = flipB ? reverseChain(B) : B;
          const tail = endPoint(a[a.length - 1]);
          const head = startPoint(b[0]);
          if (dist(tail, head) > tolerance) continue;
          if (!normalsAgree(junctionNormal(a[a.length - 1], null), junctionNormal(null, b[0]), window)) {
            continue;
          }
          const weld = vec2((tail.x + head.x) / 2, (tail.y + head.y) / 2);
          const chain = [...a, ...b];
          chain[a.length - 1] = setEnds(chain[a.length - 1], startPoint(chain[a.length - 1]), weld);
          chain[a.length] = setEnds(chain[a.length], weld, endPoint(chain[a.length]));
          open.splice(Math.max(i, j), 1);
          open.splice(Math.min(i, j), 1);
          open.push(chain);
          merged = true;
          break outer;
        }
      }
    }
  }
  for (const chain of open) out.push(subpath(chain, { closed: false }));
  return out;
}

function reverseChain(segs) {
  return segs.map((s) => reverseSegment(s)).reverse();
}

/**
 * Drop geometry that carries no information: segments shorter than `tolerance`, empty
 * subpaths, and duplicate consecutive points.
 *
 * `join: true` additionally rejoins subpaths whose endpoints coincide within tolerance,
 * under the same `normalDot` gate as `mergeByDistance`.
 *
 * @param {object} pth
 * @param {{tolerance?:number, join?:boolean, normalDot?:[number,number], outAttrs?:object}} [opts]
 * @returns {object} Path
 */
export function dissolveDegenerate(pth, opts = {}) {
  const tolerance = opts.tolerance ?? EPS_COINCIDENT;
  const window = opts.normalDot;
  let subpaths = pth.subpaths
    .map((sp) => collapseAdjacent(sp, tolerance, window))
    .filter((sp) => sp.segments.length > 0)
    // A subpath that collapsed to nothing measurable is not geometry.
    .filter((sp) => sp.segments.some((s) => arcLength(s) > tolerance));

  if (opts.join) subpaths = joinAcrossSubpaths(subpaths, tolerance, window);

  const out = path(subpaths, { fillRule: pth.fillRule });
  return opts.outAttrs ? tagPath(out, opts.outAttrs) : out;
}

// --- lossless run merging ------------------------------------------------------------------

// Collinear enough to merge, measured as the **deviation merging would introduce**: how
// far the shared point sits off the chord that would replace the pair. An angle test looks
// equivalent and is not — the same angle is a different geometric error at every length,
// and a caller's tolerance is a distance.
function collinear(a, b, tol) {
  const ax = a.p1.x - a.p0.x;
  const ay = a.p1.y - a.p0.y;
  const bx = b.p1.x - b.p0.x;
  const by = b.p1.y - b.p0.y;
  const la = Math.hypot(ax, ay);
  const lb = Math.hypot(bx, by);
  if (la <= EPS || lb <= EPS) return true;
  if ((ax * bx + ay * by) / (la * lb) <= 0) return false; // doubles back: never one line
  const cx = b.p1.x - a.p0.x;
  const cy = b.p1.y - a.p0.y;
  const lc = Math.hypot(cx, cy);
  if (lc <= EPS) return false;
  return Math.abs(ax * cy - ay * cx) / lc <= tol;
}

function sameCircle(a, b, tol) {
  const ca = arcCenter(a);
  const cb = arcCenter(b);
  const scale = Math.max(1, ca.rx, ca.ry);
  return (
    Math.abs(ca.cx - cb.cx) <= tol * scale &&
    Math.abs(ca.cy - cb.cy) <= tol * scale &&
    Math.abs(ca.rx - cb.rx) <= tol * scale &&
    Math.abs(ca.ry - cb.ry) <= tol * scale &&
    Math.sign(ca.dtheta) === Math.sign(cb.dtheta) &&
    a.sweep === b.sweep
  );
}

// Merge runs of collinear lines and runs of co-circular arcs. Exactly lossless: the result
// traces the same geometry, it just stops pretending subdivision points are features.
function mergeRuns(sp, tol) {
  const src = sp.segments;
  if (src.length < 2) return sp;
  const out = [];
  let i = 0;
  while (i < src.length) {
    const head = src[i];
    let j = i;
    if (head.type === LINE) {
      while (j + 1 < src.length && src[j + 1].type === LINE && collinear(src[j], src[j + 1], tol)) j++;
      out.push(j > i ? line(startPoint(head), endPoint(src[j])) : head);
    } else if (head.type === ARC) {
      let sweptTotal = Math.abs(arcCenter(head).dtheta);
      while (j + 1 < src.length && src[j + 1].type === ARC && sameCircle(src[j], src[j + 1], tol)) {
        const next = Math.abs(arcCenter(src[j + 1]).dtheta);
        // A merged arc of 2π or more is inexpressible in SVG's endpoint form, so stop short.
        if (sweptTotal + next >= 2 * Math.PI - 1e-9) break;
        sweptTotal += next;
        j++;
      }
      if (j > i) {
        const c = arcCenter(head);
        out.push(
          arc(startPoint(head), endPoint(src[j]), c.rx, c.ry, c.phi, sweptTotal > Math.PI, head.sweep),
        );
      } else out.push(head);
    } else {
      out.push(head);
    }
    i = j + 1;
  }
  return subpath(out, { closed: sp.closed });
}

// --- lossy refit --------------------------------------------------------------------------

// A fittable over a run of consecutive segments, parameterized by arc length so the fitter
// sees one smooth curve rather than a chain. Lengths are measured once per run.
function runFittable(segs, u0 = 0, u1 = 1, measured = null) {
  const m =
    measured ??
    (() => {
      const lengths = segs.map((s) => arcLength(s));
      const prefix = [];
      let acc = 0;
      for (const l of lengths) {
        prefix.push(acc);
        acc += l;
      }
      return { lengths, prefix, total: acc };
    })();

  const at = (u) => {
    const s = (u0 + (u1 - u0) * u) * m.total;
    let i = 0;
    while (i < segs.length - 1 && m.prefix[i] + m.lengths[i] < s) i++;
    const local = m.lengths[i] <= EPS ? 0 : tAtLength(segs[i], s - m.prefix[i]);
    return { seg: segs[i], t: local };
  };

  const self = {
    point: (u) => {
      const h = at(u);
      return pointAt(h.seg, h.t);
    },
    tangent: (u) => {
      const h = at(u);
      return tangentAt(h.seg, h.t);
    },
    error: (candidate) => {
      // Geometric deviation: how far the candidate strays from the run it replaces.
      let worst = 0;
      for (let k = 1; k < 8; k++) {
        const h = at(k / 8);
        worst = Math.max(worst, nearestPoint(candidate, pointAt(h.seg, h.t)).dist);
      }
      return worst;
    },
    split: () => {
      const um = (u0 + u1) / 2;
      return [runFittable(segs, u0, um, m), runFittable(segs, um, u1, m)];
    },
  };
  return self;
}

// Split a subpath into maximal *smooth* runs: refitting across a corner would round it off,
// which is a change of shape rather than of resolution.
function smoothRuns(sp, angleTolerance) {
  const segs = sp.segments;
  const runs = [];
  let current = [];
  for (let i = 0; i < segs.length; i++) {
    if (current.length > 0) {
      const tIn = tangentAt(segs[i - 1], 1);
      const tOut = tangentAt(segs[i], 0);
      const turn = Math.abs(Math.atan2(tIn.x * tOut.y - tIn.y * tOut.x, tIn.x * tOut.x + tIn.y * tOut.y));
      if (turn > angleTolerance) {
        runs.push(current);
        current = [];
      }
    }
    current.push(segs[i]);
  }
  if (current.length) runs.push(current);
  return runs;
}

/**
 * Retarget a path's segment density.
 *
 * @param {object} pth
 * @param {object} [opts]
 * @param {number} [opts.resolution=1]  1 = preserve every feature (lossless merges only);
 *   0 = as few segments as the deviation budget allows.
 * @param {number} [opts.tolerance=FLATNESS]  the geometric deviation budget.
 * @param {number} [opts.collinearTolerance=EPS]  how far merging a run may move the
 *   curve. The default keeps the lossless pass genuinely lossless; a caller that has
 *   already perturbed points (as `cleanPath` has, by welding) should pass what it moved
 *   them by, or its own cleanup blocks the merge it just made possible.
 * @param {number} [opts.angleTolerance=CORNER_ANGLE]  above this turn, a junction is a
 *   **corner** and is never refitted across. This is a design threshold, not a numeric
 *   epsilon: a flattened curve's junctions turn by several degrees, so using `EPS_ANGLE`
 *   here makes every junction a corner and no run is ever long enough to refit.
 * @returns {object} Path
 */
export function adjustResolution(pth, opts = {}) {
  const resolution = Math.min(1, Math.max(0, opts.resolution ?? 1));
  const tolerance = opts.tolerance ?? FLATNESS;
  const angleTolerance = opts.angleTolerance ?? CORNER_ANGLE;
  const collinearTolerance = opts.collinearTolerance ?? EPS;
  // At resolution 1 the budget is zero, which is what makes the top of the range lossless
  // by construction rather than by a lucky threshold.
  const budget = tolerance * (1 - resolution);

  const subpaths = [];
  for (const sp of pth.subpaths) {
    if (sp.segments.length === 0) continue;
    // Always lossless: drop subdivision that carries no information.
    let work = mergeRuns(sp, collinearTolerance);
    if (budget <= 0) {
      subpaths.push(work);
      continue;
    }
    // Dissolve what the budget says is indistinguishable, then refit smooth runs.
    work = collapseAdjacent(work, budget, undefined);
    const refit = [];
    for (const run of smoothRuns(work, angleTolerance)) {
      if (run.length < 2) {
        refit.push(...run);
        continue;
      }
      const chain = fitCubicChain(runFittable(run), { tolerance: budget });
      refit.push(...(chain.length && chain.length < run.length ? chain : run));
    }
    subpaths.push(mergeRuns(subpath(refit, { closed: work.closed }), collinearTolerance));
  }
  const out = path(subpaths, { fillRule: pth.fillRule });
  return opts.outAttrs ? tagPath(out, opts.outAttrs) : out;
}

/**
 * The three cleanups in the order that makes them compose.
 *
 * Order matters and is not the caller's to get wrong: **dissolve → merge → resolution**.
 * Dissolving first removes the hairlines that would otherwise weld their neighbours to the
 * wrong place; merging next fixes the near-duplicate nodes that would block a run from
 * being recognised as collinear; retargeting last works on geometry that is already clean.
 *
 * @param {object} pth
 * @param {object} [opts]  `{tolerance, mergeTolerance, scope, normalDot, join, resolution,
 *   angleTolerance, outAttrs}` — passed through to the three stages.
 * @returns {object} Path
 */
export function cleanPath(pth, opts = {}) {
  const tolerance = opts.tolerance ?? EPS_COINCIDENT;
  let out = dissolveDegenerate(pth, {
    tolerance,
    join: opts.join,
    normalDot: opts.normalDot,
  });
  out = mergeByDistance(out, opts.mergeTolerance ?? tolerance, {
    scope: opts.scope ?? 'connected',
    normalDot: opts.normalDot,
  });
  out = adjustResolution(out, {
    resolution: opts.resolution ?? 1,
    tolerance: opts.resolutionTolerance ?? opts.tolerance ?? FLATNESS,
    angleTolerance: opts.angleTolerance,
    // Welding has already moved points by up to `tolerance`; without saying so, a run that
    // was exactly collinear before the weld is no longer collinear after it, and cleanup
    // ends up blocked by its own rounding.
    collinearTolerance: opts.collinearTolerance ?? tolerance,
  });
  return opts.outAttrs ? tagPath(out, opts.outAttrs) : out;
}
