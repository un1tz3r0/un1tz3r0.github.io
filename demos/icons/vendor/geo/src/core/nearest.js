// F2 — nearest point on a whole path.
//
// Strategy: compute a cheap lower bound per segment (distance from the query to the
// segment's exact bounding box), visit segments in ascending lower-bound order, and
// stop as soon as the next lower bound cannot beat the best hit — classic
// branch-and-bound pruning over the kernel's per-segment nearestPoint.
//
// The `side` of the result is the sign of (q − point)·normal, where normal is the
// kernel's left normal at the hit: +1 means q lies on the left-normal side of the
// curve's direction of travel, −1 the right, 0 on the curve within EPS_COINCIDENT.
// When the hit lands on a segment junction (t at 0 or 1) the one-sided normal can
// misclassify queries inside the corner wedge, so the side is evaluated against the
// corner's angle-bisector pseudo-normal normalize(perp(tIn) + perp(tOut)) — the same
// miter direction stroke joins use.

import { boundingBox, nearestPoint, tangentAt } from './segment.js';
import { EPS_COINCIDENT, EPS_PARAM, signum } from './tolerance.js';
import { add, perp, normalize, len } from './vec2.js';

// Distance from q to an axis-aligned box (0 when inside).
function bboxDistance(q, b) {
  const dx = q.x < b.minX ? b.minX - q.x : q.x > b.maxX ? q.x - b.maxX : 0;
  const dy = q.y < b.minY ? b.minY - q.y : q.y > b.maxY ? q.y - b.maxY : 0;
  return Math.hypot(dx, dy);
}

// Unit pseudo-normal at the hit, corner-aware. tIn/tOut are the incoming/outgoing unit
// tangents at the hit location (equal when the hit is in a segment interior).
function pseudoNormal(tIn, tOut) {
  const n = add(perp(tIn), perp(tOut));
  const l = len(n);
  // 180° cusp (tangents cancel): fall back to the incoming side. Documented behaviour.
  if (l <= EPS_COINCIDENT) return perp(tIn);
  return normalize(n);
}

/**
 * Nearest point on the path to q. A closed subpath's closing segment is an ordinary
 * member of its segment list (F21), so it participates like any other.
 * @param {{x:number,y:number}} q
 * @param {object} pth  Path
 * @returns {{point:{x,y}, dist:number, subpathIndex:number, segIndex:number, t:number,
 *            side:-1|0|1} | null}  null for a path with no segments
 */
export function nearestPointToPath(q, pth) {
  // Gather candidates with bbox lower bounds.
  const cands = [];
  for (let si = 0; si < pth.subpaths.length; si++) {
    const segs = pth.subpaths[si].segments;
    for (let gi = 0; gi < segs.length; gi++) {
      cands.push({ si, gi, seg: segs[gi], lb: bboxDistance(q, boundingBox(segs[gi])) });
    }
  }
  if (cands.length === 0) return null;
  cands.sort((a, b) => a.lb - b.lb);

  // Branch-and-bound walk. Strictly-better wins, so ties resolve to the first candidate
  // in (lower-bound, path) order — deterministic.
  let best = null;
  for (const c of cands) {
    if (best !== null && c.lb >= best.dist) break;
    const hit = nearestPoint(c.seg, q);
    if (best === null || hit.dist < best.dist) {
      best = {
        point: hit.point,
        dist: hit.dist,
        subpathIndex: c.si,
        segIndex: c.gi,
        t: hit.t,
        side: 0,
      };
    }
  }

  // Signed side via the (corner-aware) normal at the hit.
  const sp = pth.subpaths[best.subpathIndex];
  const segs = sp.segments;
  const seg = segs[best.segIndex];
  let tIn = tangentAt(seg, best.t);
  let tOut = tIn;
  if (best.t <= EPS_PARAM) {
    // Hit at the segment start: incoming tangent from the previous segment (wrapping
    // for closed subpaths); an open start keeps the single available tangent.
    tOut = tangentAt(seg, 0);
    const prev = best.segIndex > 0 ? segs[best.segIndex - 1] : sp.closed ? segs[segs.length - 1] : null;
    tIn = prev !== null ? tangentAt(prev, 1) : tOut;
  } else if (best.t >= 1 - EPS_PARAM) {
    tIn = tangentAt(seg, 1);
    const next =
      best.segIndex < segs.length - 1 ? segs[best.segIndex + 1] : sp.closed ? segs[0] : null;
    tOut = next !== null ? tangentAt(next, 0) : tIn;
  }
  const n = pseudoNormal(tIn, tOut);
  const vx = q.x - best.point.x;
  const vy = q.y - best.point.y;
  best.side = best.dist <= EPS_COINCIDENT ? 0 : signum(vx * n.x + vy * n.y, EPS_COINCIDENT);
  return best;
}
