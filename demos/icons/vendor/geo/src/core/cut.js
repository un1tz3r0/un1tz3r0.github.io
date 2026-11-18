// F6 — cutting a path at its intersections with another path.
//
// cutPath(a, b) returns a's geometry unchanged but with every segment split at every
// intersection with b's drawn boundary (a closed subpath carries its closing segment
// in its segment list since F21, so cuts on and through it are ordinary
// segments in the output). Overlap (coincident-stretch) endpoints cut too — a shared
// edge becomes its own piece. This is both a public feature and the first half of the
// boolean pipeline (boolean.js classifies and rechains the pieces).

import { splitAt, boundingBox, CUBIC } from './segment.js';
import { intersectSegments } from './intersections.js';
import { subpath, path } from './path.js';
import { tagOutputAll } from './attributes.js';
import { EPS, EPS_PARAM } from './tolerance.js';

// Ascending interior split parameters of seg against a set of other segments:
// intersection points plus overlap-interval endpoints (plus any pre-found `extra`
// params, e.g. a cubic's own double point), deduped, 0/1 excluded.
function cutParams(seg, others, extra = []) {
  const ts = [...extra];
  for (const o of others) {
    const res = intersectSegments(seg, o);
    for (const h of res.points) ts.push(h.tA);
    for (const ov of res.overlaps) ts.push(ov.tA0, ov.tA1);
  }
  ts.sort((x, y) => x - y);
  const out = [];
  for (const t of ts) {
    if (t <= EPS_PARAM || t >= 1 - EPS_PARAM) continue;
    if (out.length && t - out[out.length - 1] <= EPS_PARAM) continue;
    out.push(t);
  }
  return out;
}

// Split a segment at ascending interior parameters, remapping into each remainder.
export function splitSegmentAt(seg, params) {
  const out = [];
  let cur = seg;
  let prev = 0;
  for (const t of params) {
    const [l, r] = splitAt(cur, (t - prev) / (1 - prev));
    out.push(l);
    cur = r;
    prev = t;
  }
  out.push(cur);
  return out;
}

/**
 * Split every segment of `a` at its intersections with `b`'s drawn boundary.
 *
 * The result is geometrically identical to `a` (same subpaths, same fill rule, same
 * closed flags) with every segment subdivided at crossing points and coincidence
 * endpoints.
 * @param {object} a  Path to cut
 * @param {object} b  Cutting path
 * @returns {object} Path
 */
export function cutPath(a, b, opts = {}) {
  const cutters = [];
  for (const sp of b.subpaths) cutters.push(...sp.segments);
  const outSubpaths = [];
  for (const sp of a.subpaths) {
    const out = [];
    for (const seg of sp.segments) {
      out.push(...tagOutputAll(splitSegmentAt(seg, cutParams(seg, cutters)), opts.outAttrs));
    }
    outSubpaths.push(subpath(out, { closed: sp.closed }));
  }
  return path(outSubpaths, { fillRule: a.fillRule });
}

// --- self-intersection machinery (F6 simplify) ---

// A cubic whose hodograph control vectors share an open half-plane never reverses
// direction against that plane's normal, so it is monotone along it — self-simple.
function hodographInHalfPlane(c) {
  const d0 = { x: c.p1.x - c.p0.x, y: c.p1.y - c.p0.y };
  const d1 = { x: c.p2.x - c.p1.x, y: c.p2.y - c.p1.y };
  const d2 = { x: c.p3.x - c.p2.x, y: c.p3.y - c.p2.y };
  const u = { x: d0.x + d1.x + d2.x, y: d0.y + d1.y + d2.y };
  return (
    d0.x * u.x + d0.y * u.y > 0 &&
    d1.x * u.x + d1.y * u.y > 0 &&
    d2.x * u.x + d2.y * u.y > 0
  );
}

const SELF_LOOP_DEPTH = 5;

/**
 * Interior parameters where a segment crosses itself (both visits of each double
 * point), ascending. Only cubics can self-intersect (lines, quads, and partial
 * arc sweeps are self-simple); found by splitting and cross-intersecting halves,
 * recursing into halves whose hodograph may still turn through a half-plane.
 * Degenerate retracing cubics (collinear back-and-forth) are not reported.
 * @param {object} seg
 * @returns {number[]}
 */
export function segmentSelfIntersections(seg) {
  if (seg.type !== CUBIC) return [];
  const out = [];
  const visit = (piece, t0, t1, depth) => {
    if (hodographInHalfPlane(piece)) return;
    const tm = (t0 + t1) / 2;
    const [l, r] = splitAt(piece, 0.5);
    for (const h of intersectSegments(l, r).points) {
      const a = t0 + h.tA * (tm - t0);
      const b = tm + h.tB * (t1 - tm);
      if (b - a <= EPS_PARAM) continue; // the shared join point
      if (a <= EPS_PARAM && b >= 1 - EPS_PARAM) continue; // coincident cubic endpoints
      out.push(a, b);
    }
    if (depth < SELF_LOOP_DEPTH) {
      visit(l, t0, tm, depth + 1);
      visit(r, tm, t1, depth + 1);
    }
  };
  visit(seg, 0, 1, 0);
  out.sort((x, y) => x - y);
  const dedup = [];
  for (const t of out) {
    if (t <= EPS_PARAM || t >= 1 - EPS_PARAM) continue;
    if (dedup.length && t - dedup[dedup.length - 1] <= EPS_PARAM) continue;
    dedup.push(t);
  }
  return dedup;
}

// Per-subpath boundary lists sharing one set of segment objects, so identity
// comparisons and adjacency work across the whole path.
function boundaries(pth) {
  return pth.subpaths.map((sp) => sp.segments);
}

function bboxesApart(ba, bb) {
  return (
    ba.maxX < bb.minX - EPS ||
    bb.maxX < ba.minX - EPS ||
    ba.maxY < bb.minY - EPS ||
    bb.maxY < ba.minY - EPS
  );
}

/**
 * Split every boundary segment of `pth` at its intersections with every *other*
 * boundary segment of the same path, and at its own double points (loop cubics).
 * Geometrically identical to `pth` — the self-cut analogue of `cutPath`, feeding
 * `simplify`.
 * @param {object} pth  Path
 * @returns {object} Path
 */
export function cutSelfPath(pth) {
  const bounds = boundaries(pth);
  const all = bounds.flat();
  const outSubpaths = [];
  for (let si = 0; si < pth.subpaths.length; si++) {
    const out = [];
    for (const seg of bounds[si]) {
      const others = all.filter((o) => o !== seg);
      out.push(...splitSegmentAt(seg, cutParams(seg, others, segmentSelfIntersections(seg))));
    }
    outSubpaths.push(subpath(out, { closed: pth.subpaths[si].closed }));
  }
  return path(outSubpaths, { fillRule: pth.fillRule });
}

/**
 * Does the path's drawn boundary intersect itself?
 * Counts interior crossings, coincident stretches, cubic double points, and —
 * conservatively — endpoint contact between non-adjacent segments (a vertex shared
 * by two loops may be a genuine crossing; callers use this as a "needs simplify"
 * probe, so false positives only cost time, never correctness). Adjacent segments'
 * shared vertices (consecutive in a subpath, wrapping when the boundary closes) do
 * not count.
 * @param {object} pth  Path
 * @returns {boolean}
 */
export function pathSelfIntersects(pth) {
  const bounds = boundaries(pth);
  for (const [si, bs] of bounds.entries()) {
    for (const seg of bs) {
      if (segmentSelfIntersections(seg).length) return true;
    }
    // A closed boundary walk is cyclic — its first/last segments are adjacent too.
    const cyclic = pth.subpaths[si].closed;
    for (let i = 0; i < bs.length; i++) {
      const bi = boundingBox(bs[i]);
      // Later segments of this subpath.
      for (let j = i + 1; j < bs.length; j++) {
        const adjacent = j === i + 1 || (cyclic && i === 0 && j === bs.length - 1);
        if (selfHit(bs[i], bi, bs[j], adjacent)) return true;
      }
      // All segments of later subpaths (never adjacent).
      for (let sj = si + 1; sj < bounds.length; sj++) {
        for (const o of bounds[sj]) {
          if (selfHit(bs[i], bi, o, false)) return true;
        }
      }
    }
  }
  return false;
}

// One pair probe for pathSelfIntersects.
function selfHit(a, ba, b, adjacent) {
  if (bboxesApart(ba, boundingBox(b))) return false;
  const res = intersectSegments(a, b);
  for (const ov of res.overlaps) {
    if (Math.abs(ov.tA1 - ov.tA0) > EPS_PARAM) return true;
  }
  for (const h of res.points) {
    const interiorA = h.tA > EPS_PARAM && h.tA < 1 - EPS_PARAM;
    const interiorB = h.tB > EPS_PARAM && h.tB < 1 - EPS_PARAM;
    if (interiorA || interiorB) return true;
    if (!adjacent) return true; // endpoint contact between non-adjacent segments
  }
  return false;
}
