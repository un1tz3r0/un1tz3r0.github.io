// F18 — addressing points on a path, inserting junctions, and cropping.
//
// ## Nodes, not vertices (decision D-A, 2026-08-06)
//
// A Path is subpaths of *segments*; junctions are implicit. Rather than introduce a vertex
// type — which would touch every value type and every target language — junctions are
// addressed by **node index**, reusing the order `nodeNormals` already defines:
//
//   - a **closed** subpath of n segments has n nodes; node k is the start of segment k,
//     and node 0 is the seam;
//   - an **open** subpath of n segments has n+1; node n is the end of the last segment.
//
// The consequence for metadata is that a junction has nowhere of its own to live, so
// attributes for a junction ride on the segment that *starts* at it (and, for the final
// node of an open subpath, on the segment that ends there).
//
// ## Locators
//
// Every addressing mode the caller might want resolves through one function to a concrete
// `{subpathIndex, segIndex, t, s}`. They differ only in *how they choose the point* — all
// of them land **on the path**. (An earlier draft split the direction-based forms into a
// separate shape-*changing* function; that was wrong, and the user corrected it.)
//
// ## Measure once
//
// Arc-length work goes through a per-subpath measurement built once per call. `pathLength`
// and `pointAtLength` re-measure the whole path on every call, which is fine for a single
// query and quadratic inside a loop — a mistake this codebase has paid for three times.

import { vec2 } from './vec2.js';
import {
  arcLength,
  tAtLength,
  arcLengthTo,
  pointAt,
  splitAt,
  subsegment,
  startPoint,
  endPoint,
} from './segment.js';
import { subpath, path } from './path.js';
import { interiorSideOf, withInteriorSide } from './area.js';
import { tagOutputAll } from './attributes.js';
import { EPS, EPS_PARAM } from './tolerance.js';

/**
 * Per-subpath arc-length measurement: segment lengths, their prefix sums, and the total.
 * Built once and threaded through, never recomputed per query.
 * @param {object} sp  Subpath
 */
export function measureSubpath(sp) {
  const segs = sp.segments;
  const lengths = segs.map((seg) => arcLength(seg));
  const prefix = [];
  let acc = 0;
  for (const l of lengths) {
    prefix.push(acc);
    acc += l;
  }
  return { segs, lengths, prefix, total: acc, closed: sp.closed };
}

/** How many nodes a subpath has: n when closed, n+1 when open. */
export function nodeCount(sp) {
  const n = sp.segments.length;
  if (n === 0) return 0;
  return sp.closed ? n : n + 1;
}

/**
 * The arc length, within its subpath, at which a node sits. Node `k` is the start of
 * segment `k`; the final node of an open subpath is the subpath's full length.
 */
export function nodeLength(m, nodeIndex) {
  const n = m.segs.length;
  if (n === 0) return 0;
  if (nodeIndex >= n) return m.total; // the closing node of an open subpath
  return m.prefix[nodeIndex];
}

/**
 * Every node of a path, with its position and arc length — the enumeration the locator
 * modes address into.
 * @returns {{subpathIndex, nodeIndex, s, point}[]}
 */
export function pathNodes(pth) {
  const out = [];
  for (let si = 0; si < pth.subpaths.length; si++) {
    const sp = pth.subpaths[si];
    if (sp.segments.length === 0) continue;
    const m = measureSubpath(sp);
    const count = nodeCount(sp);
    for (let k = 0; k < count; k++) {
      const point = k >= m.segs.length ? endPoint(m.segs[m.segs.length - 1]) : startPoint(m.segs[k]);
      out.push({ subpathIndex: si, nodeIndex: k, s: nodeLength(m, k), point });
    }
  }
  return out;
}

// Clamp or wrap an arc length into a subpath's range.
function normalizeS(m, s, wrap) {
  if (!(m.total > 0)) return 0;
  if (wrap && m.closed) {
    return ((s % m.total) + m.total) % m.total;
  }
  return Math.min(Math.max(s, 0), m.total);
}

// The owning segment and local parameter for an arc length within one subpath.
function locateAt(m, s) {
  let i = 0;
  while (i < m.segs.length - 1 && m.prefix[i] + m.lengths[i] < s - EPS * Math.max(1, m.total)) i++;
  return { segIndex: i, t: tAtLength(m.segs[i], s - m.prefix[i]) };
}

// Fractional node index → arc length. The fraction is a proportion of the *arc length*
// from that node to the next, not of the segment's parameter: "half way between these two
// points" means half the distance, which is what a caller measuring a path expects.
function lengthAtNode(m, sp, nodeIndex) {
  const count = nodeCount(sp);
  if (count === 0) return 0;
  const whole = Math.floor(nodeIndex);
  const frac = nodeIndex - whole;
  const a = nodeLength(m, wrapNode(whole, count, sp.closed));
  if (frac <= EPS_PARAM) return a;
  const nextIdx = wrapNode(whole + 1, count, sp.closed);
  let b = nodeLength(m, nextIdx);
  // Crossing the seam of a closed subpath wraps to 0; measure forward to the full length.
  if (sp.closed && nextIdx <= wrapNode(whole, count, true)) b = m.total;
  return a + (b - a) * frac;
}

function wrapNode(k, count, closed) {
  if (count === 0) return 0;
  if (closed) return ((k % count) + count) % count;
  return Math.min(Math.max(k, 0), count - 1);
}

// Distance between two points named by locators or given directly.
function pointOf(pth, ref) {
  if (ref && typeof ref.x === 'number' && typeof ref.y === 'number') return ref;
  const loc = resolveLocator(pth, ref);
  return loc === null ? null : loc.point;
}

// Resolve a distance spec: a plain number, or a fraction of the span between two points.
function resolveDistance(pth, spec) {
  if (typeof spec === 'number') return spec;
  if (spec && Array.isArray(spec.proportionalTo)) {
    const a = pointOf(pth, spec.proportionalTo[0]);
    const b = pointOf(pth, spec.proportionalTo[1]);
    if (a === null || b === null) return null;
    const span = Math.hypot(b.x - a.x, b.y - a.y);
    return span * (spec.factor ?? 1);
  }
  throw new TypeError('locator: distance must be a number or {proportionalTo:[a,b], factor}');
}

/**
 * Resolve any addressing mode to a concrete point on the path.
 *
 * Modes (a locator is a plain object using one of these):
 *
 * - `{subpath?, length}` — arc length. With `normalized: true`, a fraction of the total.
 * - `{subpath?, node}` — node index. A **fractional** index interpolates by arc length
 *   between that node and the next.
 * - `{from, distance}` — `distance` along the path from a reference locator or node.
 *   Positive is forward in path order, negative backward. `distance` may be
 *   `{proportionalTo:[a, b], factor}`, a fraction of the straight-line span between two
 *   points.
 * - `{from, distance, toward}` — the same, but the *sign* is chosen so the point moves
 *   toward the given point/locator rather than away.
 * - `{from, distance, side}` — the sign is chosen so the point moves to the `'left'` or
 *   `'right'` of the subpath's interior (F22 `interiorSideOf`).
 *
 * `wrap: true` lets an out-of-range length wrap around a closed subpath instead of
 * clamping.
 *
 * @param {object} pth  Path
 * @param {object|number} locator
 * @returns {{subpathIndex, segIndex, t, s, point} | null} `null` when nothing is addressable
 */
export function resolveLocator(pth, locator) {
  if (typeof locator === 'number') return resolveLocator(pth, { length: locator });
  if (!locator || typeof locator !== 'object') {
    throw new TypeError('resolveLocator: a locator must be a number or an object');
  }

  const si = locator.subpath ?? 0;
  const sp = pth.subpaths[si];
  if (!sp || sp.segments.length === 0) return null;
  const m = measureSubpath(sp);
  if (!(m.total > 0)) return null;

  let s;
  if (locator.from !== undefined) {
    const base = resolveLocator(pth, normalizeRef(locator.from, si));
    if (base === null) return null;
    let d = resolveDistance(pth, locator.distance ?? 0);
    if (d === null) return null;

    if (locator.toward !== undefined) {
      // Choose the direction that actually gets closer to the target, by comparing the
      // two candidate points rather than by guessing from geometry.
      const target = pointOf(pth, normalizeRef(locator.toward, si));
      if (target === null) return null;
      const mag = Math.abs(d);
      const fwd = pointAtS(m, normalizeS(m, base.s + mag, locator.wrap));
      const back = pointAtS(m, normalizeS(m, base.s - mag, locator.wrap));
      const dF = Math.hypot(fwd.x - target.x, fwd.y - target.y);
      const dB = Math.hypot(back.x - target.x, back.y - target.y);
      d = dF <= dB ? mag : -mag;
    } else if (locator.side !== undefined) {
      // Which way along the path leaves the requested side of the interior. The interior
      // side is the F22 attribute (derived from orientation on a closed subpath), and the
      // left normal is `perp(tangent)`, so a forward step keeps the interior where it is.
      const inside = interiorSideOf(sp);
      const wantLeft = locator.side === 'left';
      const mag = Math.abs(d);
      // Forward travel keeps the interior on `inside`; reversing swaps it.
      d = inside === null || (inside === 'left') === wantLeft ? mag : -mag;
    }
    s = normalizeS(m, base.s + d, locator.wrap);
  } else if (locator.node !== undefined) {
    s = lengthAtNode(m, sp, locator.node);
  } else if (locator.length !== undefined) {
    const raw = locator.normalized ? locator.length * m.total : locator.length;
    s = normalizeS(m, raw, locator.wrap);
  } else {
    throw new TypeError('resolveLocator: locator needs one of {length}, {node} or {from}');
  }

  const at = locateAt(m, s);
  return {
    subpathIndex: si,
    segIndex: at.segIndex,
    t: at.t,
    s,
    point: pointAt(m.segs[at.segIndex], at.t),
  };
}

// A bare number or node index used as a reference inherits the subpath being addressed.
function normalizeRef(ref, si) {
  if (typeof ref === 'number') return { node: ref, subpath: si };
  if (ref && typeof ref === 'object' && ref.subpath === undefined && ref.x === undefined) {
    return { ...ref, subpath: si };
  }
  return ref;
}

function pointAtS(m, s) {
  const at = locateAt(m, s);
  return pointAt(m.segs[at.segIndex], at.t);
}

/**
 * Insert a junction at a located point, **without moving the curve**.
 *
 * Splits the owning segment (kernel `splitAt`), so the geometry is unchanged and the node
 * count rises by one. Landing on an existing node is a no-op rather than a zero-length
 * segment.
 *
 * `outAttrs` tags the geometry created by the insertion. Per D-A, attributes for the new
 * *junction* ride on the segment that starts at it — here, the second half of the split.
 *
 * @param {object} pth  Path
 * @param {object|number} locator
 * @param {{outAttrs?: object}} [opts]
 * @returns {object} Path
 */
export function insertPointAt(pth, locator, opts = {}) {
  const loc = resolveLocator(pth, locator);
  if (loc === null) return pth;
  const sp = pth.subpaths[loc.subpathIndex];
  // Already a node: nothing to insert, and splitting here would emit a degenerate segment.
  if (loc.t <= EPS_PARAM || loc.t >= 1 - EPS_PARAM) return pth;

  const segs = sp.segments.slice();
  const [left, right] = splitAt(segs[loc.segIndex], loc.t);
  const tagged = opts.outAttrs ? tagOutputAll([right], opts.outAttrs)[0] : right;
  segs.splice(loc.segIndex, 1, left, tagged);
  const subpaths = pth.subpaths.slice();
  subpaths[loc.subpathIndex] = subpath(segs, { closed: sp.closed });
  return path(subpaths, { fillRule: pth.fillRule });
}

/**
 * The piece of a subpath between two located points.
 *
 * Closed subpaths crop to an **open** subpath and carry their interior side forward (F22),
 * because once a path is open which side was inside is no longer derivable. `wrap: true`
 * allows a crop that runs past the seam of a closed subpath; without it, `to` before
 * `from` yields an empty path rather than a silently reversed one.
 *
 * @param {object} pth  Path
 * @param {object|number} from
 * @param {object|number} to
 * @param {{wrap?: boolean, outAttrs?: object}} [opts]
 * @returns {object} Path — a single open subpath, or empty
 */
export function crop(pth, from, to, opts = {}) {
  const a = resolveLocator(pth, from);
  const b = resolveLocator(pth, to);
  if (a === null || b === null) return path([]);
  if (a.subpathIndex !== b.subpathIndex) {
    throw new RangeError('crop: from and to must address the same subpath');
  }
  const sp = pth.subpaths[a.subpathIndex];
  const m = measureSubpath(sp);
  const wrap = opts.wrap === true && sp.closed;

  let sa = a.s;
  let sb = b.s;
  let span = sb - sa;
  if (span < 0) {
    if (!wrap) return path([]);
    span += m.total;
  }
  if (span <= EPS * Math.max(1, m.total)) return path([]);
  // The whole loop: a wrap-crop of the full length is the subpath opened at the seam.
  if (span >= m.total - EPS * Math.max(1, m.total)) span = m.total;

  // Walk forward by segment index rather than re-locating by arc length each step: at a
  // segment boundary a length-based lookup lands on the *previous* segment at t = 1 and
  // makes no progress. `t` is also not linear in arc length, so how much of the current
  // segment is left has to come from `arcLengthTo`, not from scaling `t`.
  const segments = [];
  const n = m.segs.length;
  let idx = a.segIndex;
  let tFrom = a.t;
  let remaining = span;
  let guard = 0;
  while (remaining > EPS * Math.max(1, m.total) && guard++ < 2 * n + 4) {
    const seg = m.segs[idx];
    const consumed = arcLengthTo(seg, tFrom);
    const leftInSeg = m.lengths[idx] - consumed;
    if (leftInSeg <= EPS * Math.max(1, m.total)) {
      // Exhausted (or degenerate): step to the next segment.
      idx += 1;
      if (idx >= n) {
        if (!sp.closed) break;
        idx = 0;
      }
      tFrom = 0;
      continue;
    }
    if (remaining <= leftInSeg) {
      // The end locator already resolved an exact parameter on this segment; re-deriving
      // it through arcLengthTo → tAtLength costs a Newton round-trip and ~2e-9 of drift.
      // Use the resolved value when the walk finishes where the locator said it would.
      const tTo = idx === b.segIndex && b.t >= tFrom ? b.t : tAtLength(seg, consumed + remaining);
      if (tTo - tFrom > EPS_PARAM) segments.push(subsegment(seg, tFrom, tTo));
      remaining = 0;
      break;
    }
    if (1 - tFrom > EPS_PARAM) segments.push(subsegment(seg, tFrom, 1));
    remaining -= leftInSeg;
    idx += 1;
    if (idx >= n) {
      if (!sp.closed) break;
      idx = 0;
    }
    tFrom = 0;
  }
  if (segments.length === 0) return path([]);

  let out = subpath(opts.outAttrs ? tagOutputAll(segments, opts.outAttrs) : segments, {
    closed: false,
  });
  // Opening a closed subpath loses which side was interior unless it is carried (D-B).
  const side = interiorSideOf(sp);
  if (sp.closed && side !== null) out = withInteriorSide(out, side);
  return path([out], { fillRule: pth.fillRule });
}
