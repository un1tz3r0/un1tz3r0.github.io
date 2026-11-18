// F5 — offsetting segments, subpaths, and paths by a signed distance.
//
// Sign convention: positive d displaces along the LEFT normal (perp = rotate +90° CCW),
// matching the library's documented normal orientation.
//
// Exact cases: a line offsets to a translated line; a circular arc offsets to a
// concentric arc (radius r ∓ d by sweep direction — sweep-CCW travel has its left
// normal pointing at the center). Everything else (quads, cubics, elliptical arcs)
// has no closed-form offset in the segment vocabulary: the offset of a Bézier is not
// a Bézier, the offset of an ellipse is not an ellipse. Those are approximated by
// recursive subdivide-and-fit — the standard approach (see e.g. Pomax's Bézier primer,
// "offsetting"): fit one cubic per piece whose endpoints/end tangents match the true
// offset and whose midpoint interpolates it, subdividing until sampled offset-distance
// error is within tolerance. The recursion itself lives in `fitcurve.js`, hoisted out of
// here unchanged so F11 centerline recovery fits its midlines with the same code; what
// stays here is what makes it an *offset*: where the offset curve is, and what "close
// enough" means for one. Offset cusps (curvature radius = |d| on the concave side)
// are localized by the recursion rather than solved for; the depth cap bounds work
// there and the result is best-effort in a vanishing neighborhood of the cusp.

import {
  line,
  arc,
  pointAt,
  derivativeAt,
  tangentAt,
  normalAt,
  splitAt,
  nearestPoint,
  startPoint,
  endPoint,
} from './segment.js';
import { withMeta } from './segment.js';
import { arcCenter } from './arc.js';
import { subpath, path } from './path.js';
import { outwardSign, inheritInteriorSide } from './area.js';
import { withAttrs, invariant, length as lengthAttr, tagOutputAll } from './attributes.js';
import { fitCubicChain, CHECK_TS } from './fitcurve.js';
import { vec2, add, scale, sub, cross, dist } from './vec2.js';
import { eq, EPS, EPS_COINCIDENT, FLATNESS } from './tolerance.js';

// True offset point at parameter t of the base segment.
function offsetPointAt(seg, t, d) {
  const p = pointAt(seg, t);
  const n = normalAt(seg, t);
  return vec2(p.x + d * n.x, p.y + d * n.y);
}

// Exact offset of a straight line: translate both endpoints along the left normal.
function offsetLine(seg, d) {
  const n = normalAt(seg, 0);
  const off = scale(n, d);
  return [line(add(seg.p0, off), add(seg.p1, off))];
}

// Exact offset of a circular arc: the concentric arc. Sweep-CCW travel (dtheta > 0)
// has its left normal pointing toward the center, so +d shrinks the radius; sweep-CW
// grows it. A radius shrinking to ≤ EPS collapses the arc — nothing is emitted and
// the caller's joins bridge the gap.
function offsetCircularArc(seg, d) {
  const c = arcCenter(seg);
  const r = c.rx; // == c.ry (checked by the caller)
  const rNew = c.dtheta > 0 ? r - d : r + d;
  if (rNew <= EPS) return [];
  const center = vec2(c.cx, c.cy);
  const radial0 = scale(sub(seg.p0, center), rNew / r);
  const radial1 = scale(sub(seg.p1, center), rNew / r);
  return [
    arc(add(center, radial0), add(center, radial1), rNew, rNew, seg.xAxisRotation, seg.largeArc, seg.sweep),
  ];
}

// Max |distance(candidate(t), base piece) − |d|| over the check parameters. This, not
// same-parameter deviation, is what "the offset is good enough" means: the offset curve's
// parameterization is nobody's business but its own.
function fitError(candidate, piece, d) {
  let worst = 0;
  for (const t of CHECK_TS) {
    const q = pointAt(candidate, t);
    worst = Math.max(worst, Math.abs(nearestPoint(piece, q).dist - Math.abs(d)));
  }
  return worst;
}

// The base segment's offset, described to the shared fitter (fitcurve.js): where the
// offset curve is, which way it points, how wrong a candidate is, and how to halve it.
// Offset tangents are parallel to base tangents, so `tangent` needs no correction.
function offsetFittable(piece, d) {
  return {
    point: (t) => offsetPointAt(piece, t, d),
    tangent: (t) => tangentAt(piece, t),
    error: (candidate) => fitError(candidate, piece, d),
    split: () => splitAt(piece, 0.5).map((half) => offsetFittable(half, d)),
  };
}

/**
 * Offset a single segment by signed distance d (positive = left normal side).
 *
 * Returns a chain of segments running from the displaced start point to the displaced
 * end point. Lines and circular arcs are exact (one segment); quads, cubics, and
 * elliptical arcs are approximated by cubics to `tolerance` (sampled offset-distance
 * error). A circular arc whose offset radius collapses to ≤ EPS returns [].
 *
 * The raw offset is local: it does not trim self-intersections (deferred to F6).
 * @param {object} seg
 * @param {number} d
 * @param {number} [tolerance=FLATNESS]
 * @returns {object[]} segment chain
 */
export function offsetSegment(seg, d, tolerance = FLATNESS, outAttrs = undefined) {
  if (typeof d !== 'number' || !Number.isFinite(d)) {
    throw new TypeError('offsetSegment: d must be a finite number');
  }
  if (seg.type === 'line') return tagOutputAll(offsetLine(seg, d), outAttrs);
  if (seg.type === 'arc' && eq(seg.rx, seg.ry)) {
    return tagOutputAll(offsetCircularArc(seg, d), outAttrs);
  }
  const out = fitCubicChain(offsetFittable(seg, d), { tolerance });
  // Mark the approximation. Lines and circular arcs above return *exact* offsets and are
  // deliberately left unmarked: `origin` says "this geometry is a fit", which is what the
  // F10 detectors use to tell an approximation apart from designed geometry. `d` and
  // `tolerance` are typed lengths, so a similarity rescales them and an anisotropic map
  // drops them rather than lying.
  const attrs = {
    ...(outAttrs ?? {}),
    origin: invariant('offset-fit'),
    of: invariant(seg.type),
    d: lengthAttr(d),
    tolerance: lengthAttr(tolerance),
  };
  return out.map((piece) => withAttrs(piece, attrs));
}

// --- joins & assembly ------------------------------------------------------------------

const JOINS = ['miter', 'round', 'bevel'];

// Join the gap between consecutive offset chains at a base-path corner. `a` is where
// the previous chain ends, `b` where the next begins — both at distance |d| from the
// corner. The turn direction tells the side: the offset has a gap when the turn bends
// away from the offset side (turn·d < 0); on the other side the chains overlap past
// each other and a straight connector suffices — the overlap resolves under nonzero
// winding (trimming is deferred to F6).
function joinAtCorner(a, b, corner, tIn, tOut, d, join, miterLimit) {
  if (dist(a, b) <= EPS_COINCIDENT) return []; // tangent-continuous: nothing to bridge
  const turn = cross(tIn, tOut);
  if (turn * d >= 0) return [line(a, b)];

  if (join === 'round') {
    // Circular join centered on the corner, radius |d|; the sweep follows the turn.
    return [arc(a, b, Math.abs(d), Math.abs(d), 0, false, turn > 0)];
  }
  if (join === 'miter') {
    // Miter tip: intersect the offset tangent lines a + s·tIn and b − u·tOut
    // (s·tIn + u·tOut = b − a, solved by Cramer). SVG's miter test compares
    // miterLength/strokeWidth = 1/sin(θ/2) to the limit; that equals tip distance
    // over |d|, so the ratio is measured directly from the tip.
    const w = sub(b, a);
    const s = cross(w, tOut) / turn;
    const u = cross(tIn, w) / turn;
    if (s > 0 && u > 0) {
      const tip = add(a, scale(tIn, s));
      if (dist(tip, corner) / Math.abs(d) <= miterLimit) {
        return [line(a, tip), line(tip, b)];
      }
    }
  }
  return [line(a, b)]; // bevel, and the miter fallback
}

/**
 * Offset a whole subpath by signed distance d (positive = left normal side).
 *
 * Walks the subpath's segments (which since F21 include the closing segment of a
 * closed subpath), offsets each, and bridges consecutive chains at corners per `join`
 * ('round' default, 'miter' with `miterLimit`, 'bevel'). Closed subpaths join the
 * seam and stay closed; open subpaths get no end caps (see stroke for caps).
 * Returns null when every segment's offset collapses (or the subpath is empty).
 *
 * The raw result may self-intersect at concave corners or where |d| exceeds the
 * local feature size; it fills correctly under the nonzero rule. Trimming → F6.
 * @param {object} sp  Subpath
 * @param {number} d
 * @param {{join?: 'miter'|'round'|'bevel', miterLimit?: number, tolerance?: number}} [opts]
 * @returns {object | null} Subpath or null
 */
export function offsetSubpath(sp, d, opts = {}) {
  const join = opts.join ?? 'round';
  const miterLimit = opts.miterLimit ?? 4;
  const tolerance = opts.tolerance ?? FLATNESS;
  if (!JOINS.includes(join)) {
    throw new TypeError(`offsetSubpath: join must be one of ${JOINS.join(', ')}`);
  }

  const base = sp.segments;
  const entries = [];
  for (const seg of base) {
    const chain = offsetSegment(seg, d, tolerance, opts.outAttrs);
    if (chain.length) entries.push({ seg, chain });
  }
  if (!entries.length) return null;

  const out = [];
  for (let i = 0; i < entries.length; i++) {
    out.push(...entries[i].chain);
    if (i === entries.length - 1 && !sp.closed) break;
    const next = entries[(i + 1) % entries.length];
    const a = endPoint(entries[i].chain[entries[i].chain.length - 1]);
    const b = startPoint(next.chain[0]);
    const corner = endPoint(entries[i].seg);
    if (dist(corner, startPoint(next.seg)) <= EPS_COINCIDENT) {
      out.push(...joinAtCorner(a, b, corner, tangentAt(entries[i].seg, 1), tangentAt(next.seg, 0), d, join, miterLimit));
    } else if (dist(a, b) > EPS_COINCIDENT) {
      // Non-adjacent chains (a collapsed segment between them): straight bridge.
      out.push(line(a, b));
    }
  }
  // Tag at the subpath level so the *join* segments (miter tips, round join arcs,
  // bevels) are stamped too — they are created here, not by offsetSegment.
  return subpath(tagOutputAll(out, opts.outAttrs), { closed: sp.closed });
}

/**
 * Offset every subpath of a path by signed distance d. Subpaths whose offset
 * collapses entirely are dropped; the fill rule is preserved.
 * @param {object} pth  Path
 * @param {number} d
 * @param {{join?: 'miter'|'round'|'bevel', miterLimit?: number, tolerance?: number}} [opts]
 * @returns {object} Path
 */
export function offsetPath(pth, d, opts = {}) {
  const out = [];
  for (const sp of pth.subpaths) {
    // `outward` (F22) reads the subpath's interior side and picks the sign that moves
    // away from it, so a positive distance grows the shape whichever way its boundary
    // happens to run. For a closed subpath the side comes from its orientation; for an
    // open one it comes from the `interiorSide` attribute an earlier operation left
    // behind. Unknown side falls back to the raw left-normal convention.
    let signed = d;
    if (opts.outward) {
      const s = outwardSign(sp);
      if (s !== null) signed = d * s; // positive d grows the shape, negative shrinks it
    }
    const o = offsetSubpath(sp, signed, opts);
    if (o !== null) out.push(inheritInteriorSide(o, sp));
  }
  return path(out, { fillRule: pth.fillRule });
}
