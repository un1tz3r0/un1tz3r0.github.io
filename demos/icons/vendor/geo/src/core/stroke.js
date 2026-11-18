// F5 — stroke-to-path: the fillable outline of a stroked path.
//
// A stroked subpath is the set of points within width/2 of its geometry. The outline is
// built from two offset walks at ±width/2: the forward walk offset left by w/2, and the
// *reversed* walk offset left by w/2 (which is the right side of the forward walk,
// traversed backwards — reusing the left-side join logic unchanged).
//
// - Open subpaths: forward side + end cap + reverse side + start cap → one closed
//   outline subpath. Caps: 'butt' (chord), 'round' (semicircular arc bulging along the
//   tangent), 'square' (extended by w/2).
// - Closed subpaths: the two sides are separate closed subpaths with opposite
//   traversal directions → an annulus under the nonzero fill rule.
//
// The result always carries fillRule 'nonzero': the raw outline may self-intersect at
// concave corners (see offset.js) and only the nonzero rule fills it correctly there.
// Trimming to a simple outline is deferred to F6 boolean ops.

import { line, arc, tangentAt, startPoint, endPoint } from './segment.js';
import { subpath, path, reverseSubpath, NONZERO } from './path.js';
import { offsetSubpath } from './offset.js';
import { add, scale, dist } from './vec2.js';
import { FLATNESS, EPS_COINCIDENT } from './tolerance.js';
import { tagOutputPath } from './attributes.js';

const CAPS = ['butt', 'round', 'square'];
const JOINS = ['miter', 'round', 'bevel'];

// Cap from outline point a to outline point b around the endpoint whose outward
// tangent direction is tipDir (unit). a and b sit diametrically opposite, w/2 to
// either side. The round cap is the CW semicircle from a to b — a is on the left of
// the arriving direction and b on its right, so clockwise passes through the tip.
function capSegments(a, b, tipDir, cap, halfWidth) {
  if (dist(a, b) <= EPS_COINCIDENT) return [];
  if (cap === 'butt') return [line(a, b)];
  if (cap === 'round') return [arc(a, b, halfWidth, halfWidth, 0, false, false)];
  const ext = scale(tipDir, halfWidth);
  const a2 = add(a, ext);
  const b2 = add(b, ext);
  return [line(a, a2), line(a2, b2), line(b2, b)];
}

/**
 * Convert a stroke to a fillable outline path.
 *
 * @param {object} pth  Path whose geometry is stroked (its fillRule is irrelevant)
 * @param {{width: number, cap?: 'butt'|'round'|'square',
 *          join?: 'miter'|'round'|'bevel', miterLimit?: number,
 *          tolerance?: number}} opts  width required (> 0); SVG defaults otherwise
 * @returns {object} Path with fillRule 'nonzero' covering all points within width/2
 *   of the input geometry (up to `tolerance` on approximated curve offsets)
 */
export function stroke(pth, opts = {}) {
  const { width, cap = 'butt', join = 'miter', miterLimit = 4, tolerance = FLATNESS } = opts;
  if (typeof width !== 'number' || !Number.isFinite(width) || width <= 0) {
    throw new TypeError('stroke: width must be a finite number > 0');
  }
  if (!CAPS.includes(cap)) {
    throw new TypeError(`stroke: cap must be one of ${CAPS.join(', ')}`);
  }
  if (!JOINS.includes(join)) {
    throw new TypeError(`stroke: join must be one of ${JOINS.join(', ')}`);
  }
  const w2 = width / 2;
  const offOpts = { join, miterLimit, tolerance };

  const out = [];
  for (const sp of pth.subpaths) {
    if (!sp.segments.length) continue;
    const side1 = offsetSubpath(sp, w2, offOpts);
    const side2 = offsetSubpath(reverseSubpath(sp), w2, offOpts);

    if (sp.closed) {
      // Two independent closed boundaries with opposite winding → annulus. A side
      // that collapsed entirely (small loop, wide stroke) simply drops out.
      if (side1 !== null) out.push(side1);
      if (side2 !== null) out.push(side2);
      continue;
    }

    if (side1 === null || side2 === null) continue; // fully degenerate subpath
    const segs = [...side1.segments];
    const endTip = tangentAt(sp.segments[sp.segments.length - 1], 1);
    segs.push(
      ...capSegments(
        endPoint(segs[segs.length - 1]),
        startPoint(side2.segments[0]),
        endTip,
        cap,
        w2,
      ),
    );
    segs.push(...side2.segments);
    const startTip = scale(tangentAt(sp.segments[0], 0), -1);
    segs.push(
      ...capSegments(
        endPoint(segs[segs.length - 1]),
        startPoint(side1.segments[0]),
        startTip,
        cap,
        w2,
      ),
    );
    out.push(subpath(segs, { closed: true }));
  }
  return tagOutputPath(path(out, { fillRule: NONZERO }), opts.outAttrs);
}
