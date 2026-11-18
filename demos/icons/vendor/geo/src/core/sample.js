// F3 — sampling a path by arc length, and per-node normals.
//
// samplePath places sample points at equal arc-length steps along each subpath (either
// a fixed count or a fixed spacing) and reports position, unit tangent, and unit left
// normal at each. Arc-length targets are mapped to segment parameters via the kernel's
// inverse-arc-length tAtLength on the owning segment (found by prefix sums).
//
// nodeNormals reports, at every segment junction, the incoming and outgoing unit
// tangents and the angle-bisector pseudo-normal normalize(perp(tIn) + perp(tOut)) —
// the miter direction that stroke joins (F5) will use. Closed subpaths wrap (node 0
// joins last→first); open endpoints use their single available tangent for both sides.
// A 180° cusp (tangents cancel within EPS_COINCIDENT) falls back to perp(tIn).

import {
  pointAt,
  tangentAt,
  normalAt,
  arcLength,
  tAtLength,
  startPoint,
} from './segment.js';
import { EPS, EPS_COINCIDENT } from './tolerance.js';
import { add, perp, normalize, len } from './vec2.js';

// Owning segment for a cumulative arc length within one subpath: the first whose prefix
// plus length reaches s (the last segment absorbs s = total).
function locate(segs, lengths, total, s) {
  let gi = 0;
  let prefix = 0;
  while (gi < segs.length - 1 && prefix + lengths[gi] < s - EPS * Math.max(1, total)) {
    prefix += lengths[gi];
    gi++;
  }
  return { segIndex: gi, prefix };
}

// The sample record at cumulative arc length s within one subpath's boundary segments.
function sampleAt(segs, si, lengths, total, s) {
  const { segIndex, prefix } = locate(segs, lengths, total, s);
  const seg = segs[segIndex];
  const t = tAtLength(seg, s - prefix);
  return {
    subpathIndex: si,
    segIndex,
    t,
    s,
    point: pointAt(seg, t),
    tangent: tangentAt(seg, t),
    normal: normalAt(seg, t),
  };
}

// Sample one subpath at the given cumulative arc-length targets.
function emitSamples(out, segs, si, lengths, total, targets) {
  for (const s of targets) out.push(sampleAt(segs, si, lengths, total, s));
}

/**
 * Sample a path at equal arc-length steps, per subpath.
 *
 * Exactly one of the options must be given:
 * - `count` (integer ≥ 2): per subpath, `count` samples. Open subpaths include both
 *   endpoints (s = k·L/(count−1)); closed subpaths avoid the duplicate seam sample
 *   (s = k·L/count).
 * - `spacing` (> 0): s = 0, spacing, 2·spacing, … ≤ L, plus the end point for open
 *   subpaths unless it already falls within EPS of the last multiple.
 *
 * @param {object} pth  Path
 * @param {{count?: number, spacing?: number}} opts
 * @returns {{subpathIndex, segIndex, t, s, point, tangent, normal}[]}
 */
export function samplePath(pth, opts = {}) {
  const hasCount = opts.count !== undefined;
  const hasSpacing = opts.spacing !== undefined;
  if (hasCount === hasSpacing) {
    throw new TypeError('samplePath: give exactly one of {count} or {spacing}');
  }
  if (hasCount && (!Number.isInteger(opts.count) || opts.count < 2)) {
    throw new TypeError('samplePath: count must be an integer ≥ 2');
  }
  if (hasSpacing && !(opts.spacing > 0)) {
    throw new TypeError('samplePath: spacing must be > 0');
  }

  const out = [];
  for (let si = 0; si < pth.subpaths.length; si++) {
    const sp = pth.subpaths[si];
    if (!sp.segments.length) continue;
    const { segs, lengths, total } = measure(sp);

    const targets = [];
    if (hasCount) {
      const n = opts.count;
      // Open: endpoints included (step L/(n−1)); closed: step L/n so the seam point
      // is not sampled twice.
      const step = sp.closed ? total / n : total / (n - 1);
      for (let k = 0; k < n; k++) targets.push(k * step);
    } else {
      const d = opts.spacing;
      for (let s = 0; s <= total + EPS * Math.max(1, total); s += d) {
        targets.push(Math.min(s, total));
      }
      const last = targets[targets.length - 1];
      if (!sp.closed && total - last > EPS * Math.max(1, total)) targets.push(total);
    }
    emitSamples(out, segs, si, lengths, total, targets);
  }
  return out;
}

// Boundary segments of a subpath with their per-segment and total arc lengths.
function measure(sp) {
  const segs = sp.segments;
  const lengths = segs.map((seg) => arcLength(seg));
  return { segs, lengths, total: lengths.reduce((a, b) => a + b, 0) };
}

/**
 * Total arc length of a path's boundary — the sum over subpaths, each including its
 * closing segment when closed (the boundary contract in DESIGN).
 *
 * @param {object} pth  Path
 * @param {{subpath?: number}} [opts]  restrict to one subpath by index
 * @returns {number}
 */
export function pathLength(pth, opts = {}) {
  const sps =
    opts.subpath === undefined ? pth.subpaths : [pth.subpaths[opts.subpath]].filter(Boolean);
  let total = 0;
  for (const sp of sps) {
    if (sp.segments.length) total += measure(sp).total;
  }
  return total;
}

/**
 * The point at a given arc length along a path, with its tangent and normal.
 *
 * By default `s` runs over the *whole* path: subpaths are traversed in order and their
 * lengths accumulate, so a two-subpath path is one continuous parameterization. Pass
 * `subpath` to measure within a single subpath instead, or `normalized: true` to give
 * `s` as a fraction u ∈ [0, 1] of whichever total applies.
 *
 * Out-of-range `s` clamps to the ends rather than throwing, matching the kernel's
 * `tAtLength`. Returns the same record shape `samplePath` emits, so the two are
 * interchangeable downstream. Returns null for a path with no segments at all.
 *
 * @param {object} pth  Path
 * @param {number} s  arc length (or fraction, with `normalized`)
 * @param {{subpath?: number, normalized?: boolean}} [opts]
 * @returns {{subpathIndex, segIndex, t, s, point, tangent, normal} | null}
 */
export function pointAtLength(pth, s, opts = {}) {
  const single = opts.subpath !== undefined;
  const indices = single
    ? [opts.subpath]
    : pth.subpaths.map((_, i) => i).filter((i) => pth.subpaths[i].segments.length);
  if (single && !(pth.subpaths[opts.subpath] && pth.subpaths[opts.subpath].segments.length)) {
    return null;
  }
  if (indices.length === 0) return null;

  const measured = indices.map((i) => ({ si: i, ...measure(pth.subpaths[i]) }));
  const grand = measured.reduce((acc, m) => acc + m.total, 0);
  let target = opts.normalized ? s * grand : s;
  target = Math.min(Math.max(target, 0), grand);

  // Walk to the owning subpath; the last one absorbs target = grand.
  let k = 0;
  while (k < measured.length - 1 && target > measured[k].total) {
    target -= measured[k].total;
    k++;
  }
  const m = measured[k];
  return sampleAt(m.segs, m.si, m.lengths, m.total, Math.min(target, m.total));
}

/**
 * Per-junction tangents and bisector normals, walking the boundary segments (the
 * closing segment included for closed subpaths). Open subpaths yield
 * segments+1 nodes (both endpoints included); closed subpaths yield one node per
 * boundary segment, node 0 being the wrap-around junction into the first segment.
 * @param {object} pth  Path
 * @returns {{subpathIndex, nodeIndex, point, normal, tangentIn, tangentOut}[]}
 */
export function nodeNormals(pth) {
  const out = [];
  for (let si = 0; si < pth.subpaths.length; si++) {
    const sp = pth.subpaths[si];
    if (sp.segments.length === 0) continue;
    const segs = sp.segments; // includes the closing segment when closed
    const n = segs.length;
    const nodeCount = sp.closed ? n : n + 1;
    for (let k = 0; k < nodeCount; k++) {
      // Node k sits at the start of segment k (or the end of the last, for the final
      // open node). tangentIn arrives from the previous segment, tangentOut leaves
      // along the current one.
      let tIn;
      let tOut;
      let point;
      if (k === 0) {
        point = startPoint(segs[0]);
        tOut = tangentAt(segs[0], 0);
        tIn = sp.closed ? tangentAt(segs[n - 1], 1) : tOut;
      } else if (k === n) {
        // Final node of an open subpath.
        tIn = tangentAt(segs[n - 1], 1);
        tOut = tIn;
        point = pointAt(segs[n - 1], 1);
      } else {
        point = startPoint(segs[k]);
        tIn = tangentAt(segs[k - 1], 1);
        tOut = tangentAt(segs[k], 0);
      }
      const bis = add(perp(tIn), perp(tOut));
      const normal = len(bis) <= EPS_COINCIDENT ? perp(tIn) : normalize(bis);
      out.push({ subpathIndex: si, nodeIndex: k, point, normal, tangentIn: tIn, tangentOut: tOut });
    }
  }
  return out;
}
