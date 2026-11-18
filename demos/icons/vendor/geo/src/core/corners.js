// F10 part 1 — enumerating a path's corners.
//
// A corner is a junction between two consecutive boundary segments, described by how the
// travel direction turns there. This is the shared vocabulary of every corner treatment:
// fillet and chamfer consume corners, un-fillet and un-chamfer produce them, and both
// directions gate on the same measurements (how sharp, which way, how much room).
//
// The junction walk itself — including a closed subpath's wrap-around seam and its
// closing segment — already exists as `nodeNormals` (F3), so this builds on it
// rather than re-deriving it. What is added is the turn measurement and the addressing a
// treatment needs: *which two segments* meet here, in boundary-segment indices.
//
// Open subpaths' free ends are not corners: nothing turns there, and there is no second
// segment to trim.

import { nodeNormals } from './sample.js';
import { subpathArea } from './area.js';
import { subsegment, arcLength, startPoint, endPoint } from './segment.js';
import { intersectSegments } from './intersections.js';
import { cross, dot, dist } from './vec2.js';
import { EPS, EPS_PARAM, EPS_TANGENT } from './tolerance.js';

/**
 * Every corner of a path.
 *
 * Each corner reports the two boundary segments that meet there by index into
 * `subpath.segments` — i.e. the same addressing the rest of the library uses,
 * over the subpath's segments, the closing one included. `inIndex` is the segment
 * arriving at the corner and `outIndex` the one leaving it; for the seam of a closed
 * subpath those wrap.
 *
 * `turn` is the signed angle from the incoming to the outgoing tangent, in (−π, π]:
 * positive turns left, zero means tangent-continuous, and ±π is a cusp that doubles
 * back. `interiorAngle` = π − |turn| is the corner's included angle, which is the
 * quantity a minimum-corner-angle gate wants (a shallow corner has interiorAngle near π).
 *
 * @param {object} pth  Path
 * @param {{smoothTolerance?: number}} [opts]  angular tolerance for the `smooth`/`cusp`
 *   flags, in radians (default `EPS_TANGENT`)
 * @returns {{subpathIndex:number, inIndex:number, outIndex:number, point:{x,y},
 *            tangentIn:{x,y}, tangentOut:{x,y}, normal:{x,y}, turn:number,
 *            interiorAngle:number, convex:boolean|null, smooth:boolean, cusp:boolean}[]}
 */
export function pathCorners(pth, opts = {}) {
  const smoothTol = opts.smoothTolerance ?? EPS_TANGENT;
  // Orientation per subpath, so "convex" can mean "bulging away from the filled side"
  // rather than merely "turning left". Open subpaths have no inside, hence null.
  const orientation = pth.subpaths.map((sp) =>
    sp.closed && sp.segments.length ? Math.sign(subpathArea(sp)) : 0,
  );

  const out = [];
  for (const node of nodeNormals(pth, opts)) {
    const sp = pth.subpaths[node.subpathIndex];
    const n = sp.segments.length;
    // Free ends of an open subpath are not corners: `nodeNormals` reports them with the
    // incoming and outgoing tangent equal because there is only one segment there.
    if (!sp.closed && (node.nodeIndex === 0 || node.nodeIndex === n)) continue;

    const turn = Math.atan2(cross(node.tangentIn, node.tangentOut), dot(node.tangentIn, node.tangentOut));
    const orient = orientation[node.subpathIndex];
    out.push({
      subpathIndex: node.subpathIndex,
      inIndex: (node.nodeIndex + n - 1) % n,
      outIndex: node.nodeIndex % n,
      point: node.point,
      tangentIn: node.tangentIn,
      tangentOut: node.tangentOut,
      normal: node.normal,
      turn,
      interiorAngle: Math.PI - Math.abs(turn),
      convex: orient === 0 ? null : turn * orient > 0,
      smooth: Math.abs(turn) <= smoothTol,
      cusp: Math.PI - Math.abs(turn) <= smoothTol,
    });
  }
  return out;
}

/**
 * Extend two segments past their endpoints until they meet, and report where.
 *
 * This is the inverse of trimming a corner: given the two neighbours a fillet or chamfer
 * left behind, it recovers the corner they used to share. `a` is extended forward past
 * its end and `b` backward past its start (exactly, via `subsegment` outside [0,1]), and
 * the nearest crossing of the two extensions is returned in the *originals'* parameter
 * space — so `ta > 1` and `tb < 0` for a genuine recovery.
 *
 * Returns null when the extensions never meet within the budget, which is the honest
 * answer for neighbours that were never trimmed from a common corner.
 *
 * @param {object} a
 * @param {object} b
 * @param {{extendFactor?: number}} [opts]  how far to reach, as a multiple of the gap
 *   between a's end and b's start (default 4)
 * @returns {{point:{x,y}, ta:number, tb:number} | null}
 */
export function meetExtended(a, b, opts = {}) {
  const factor = opts.extendFactor ?? 4;
  const gap = dist(endPoint(a), startPoint(b));
  const lenA = arcLength(a);
  const lenB = arcLength(b);
  if (lenA <= EPS || lenB <= EPS) return null;

  // Reach `factor` gaps beyond each end, expressed in each segment's own parameter scale.
  // A hairline gap still gets a usable reach: a corner recovered from two nearly-touching
  // neighbours needs only a sliver of extension, but the arithmetic must not collapse.
  const reach = Math.max(gap * factor, Math.max(lenA, lenB) * 1e-3);
  const fa = Math.min(reach / lenA, 4);
  const fb = Math.min(reach / lenB, 4);

  let extA;
  let extB;
  try {
    extA = subsegment(a, 0, 1 + fa);
    extB = subsegment(b, -fb, 1);
  } catch {
    return null; // an arc asked to sweep a full turn cannot be extended that far
  }

  const { points } = intersectSegments(extA, extB);
  let best = null;
  for (const h of points) {
    const ta = h.tA * (1 + fa);
    const tb = -fb + h.tB * (1 + fb);
    // Only crossings *past* both endpoints reconstruct a corner; a crossing inside the
    // segments means they already overlap, which is a different situation entirely.
    if (ta < 1 - EPS_PARAM || tb > EPS_PARAM) continue;
    const over = ta - 1 + -tb;
    if (best === null || over < best.over) best = { point: h.point, ta, tb, over };
  }
  return best === null ? null : { point: best.point, ta: best.ta, tb: best.tb };
}
