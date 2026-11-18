// F6 — boolean operations on filled regions: classify + rechain.
//
// The engine (chosen over a full half-edge arrangement — see DESIGN.md):
//   1. Implicitly close every subpath (SVG fill semantics), normalize loop
//      orientation to an additive-winding 'nonzero' equivalent (see `normalize`),
//      and cut each path at all intersections with the other (cut.js) — after
//      cutting, no piece crosses the other boundary, so a piece's midpoint
//      classifies the whole piece.
//   2. Classify each piece by exact winding queries (winding.js) at its midpoint,
//      under each input's own fill rule; keep/drop/reverse per the op table below.
//      Pieces *coincident* with the other boundary (shared edges — midpoint on the
//      other boundary within EPS_ON) get their own rule keyed on whether the two
//      boundaries run the same way (fill on the same side) or opposite.
//   3. Chain kept pieces into closed subpaths by endpoint matching. At multi-valent
//      crossing nodes the sharpest-left-turn continuation wins (minimal fill-left
//      loops); any pairing would enclose the same region under the nonzero rule the
//      output declares — leftmost-turn keeps the loops minimal and deterministic.
//
// Keep/drop/reverse table (difference = A − B; − marks drop):
//              union     intersect  difference  xor
//   A outside  keep      −          keep        keep
//   A inside   −         keep       −           reverse
//   A ovl same keep      keep       −           −
//   A ovl opp  −         −          keep        −
//   B outside  keep      −          −           keep
//   B inside   −         keep       reverse     reverse
//   B overlap  −         −          −           −     (A's copy represents the edge)
//
// Output always carries fillRule 'nonzero' with boundaries oriented so region
// windings add correctly (reversal rules above).

import {
  pointAt,
  tangentAt,
  startPoint,
  endPoint,
  reverseSegment,
  boundingBox,
  nearestPoint,
  withMeta,
} from './segment.js';
import { subpath, path, pathBoundingBox, reverseSubpath, NONZERO } from './path.js';
import { containsPoint, windingAt } from './winding.js';
import { nearestPointToPath } from './nearest.js';
import { cutPath, cutSelfPath, pathSelfIntersects } from './cut.js';
import { vec2, dot, dist } from './vec2.js';
import { tagOutputPath } from './attributes.js';

// A piece midpoint within this distance of the other boundary is a shared
// (coincident) edge — cut pieces either lie fully on the other boundary or, being
// crossing-free, stay well clear of it; numerically derived coincidences (arcs,
// Newton-refined cuts) land far inside this margin while transversal pieces stay
// far outside it.
const EPS_ON = 1e-7;

// Endpoint-matching tolerance when chaining pieces (cut endpoints agree to Newton
// accuracy, ~1e-9; transversal gaps are geometric and far larger).
const EPS_LINK = 1e-6;

const OPS = ['union', 'intersect', 'difference', 'xor'];

// Fill-semantics normalization: every subpath participates as a closed loop.
function closeAll(pth) {
  const subs = [];
  for (const sp of pth.subpaths) {
    if (!sp.segments.length) continue;
    subs.push(subpath(sp.segments, { closed: true }));
  }
  return path(subs, { fillRule: pth.fillRule });
}

// Rewrite the path as an orientation-normalized 'nonzero' equivalent: every loop
// separating filled from unfilled winds +1 with its fill inside (holes wind −1), and
// loops with the same filledness on both sides (e.g. an inner loop of a doubly-wound
// nonzero region) bound nothing and are dropped. This is what lets evenodd inputs —
// where a hole may run the same way as its container — feed an engine whose output
// and reversal rules assume additive windings. Side samples are taken a loop-scaled
// step off one segment midpoint, which classifies the whole loop because a path's
// own subpaths are assumed disjoint (self-crossing inputs are `simplify`'s job).
function normalize(pth) {
  const subs = [];
  for (const sp of pth.subpaths) {
    const bb = pathBoundingBox(path([sp], { fillRule: NONZERO }));
    const eps = Math.max(Math.hypot(bb.maxX - bb.minX, bb.maxY - bb.minY) * 1e-5, 1e-12);
    const seg = sp.segments[0];
    const m = pointAt(seg, 0.5);
    const tn = tangentAt(seg, 0.5);
    const pL = { x: m.x - tn.y * eps, y: m.y + tn.x * eps };
    const pR = { x: m.x + tn.y * eps, y: m.y - tn.x * eps };
    if (containsPoint(pth, pL) === containsPoint(pth, pR)) continue;
    const own = path([sp], { fillRule: NONZERO });
    let pIn = pL;
    let w = windingAt(own, pIn);
    if (w === 0) {
      pIn = pR;
      w = windingAt(own, pIn);
    }
    if (w === 0) continue; // hairline loop thinner than eps
    const desired = containsPoint(pth, pIn) ? 1 : -1;
    subs.push(Math.sign(w) === desired ? sp : reverseSubpath(sp));
  }
  return path(subs, { fillRule: NONZERO });
}

// Unit tangent of pth's boundary at a nearestPointToPath hit.
function boundaryTangentAt(pth, hit) {
  const segs = pth.subpaths[hit.subpathIndex].segments;
  return tangentAt(segs[hit.segIndex], hit.t);
}

// 'outside' | 'inside' | 'overlapSame' | 'overlapOpp' of one piece vs the other path.
function classify(seg, other) {
  const mid = pointAt(seg, 0.5);
  const hit = nearestPointToPath(mid, other);
  if (hit && hit.dist <= EPS_ON) {
    const dir = dot(tangentAt(seg, 0.5), boundaryTangentAt(other, hit));
    return dir >= 0 ? 'overlapSame' : 'overlapOpp';
  }
  return containsPoint(other, mid) ? 'inside' : 'outside';
}

// 'keep' | 'drop' | 'reverse' per the table in the header comment.
function action(side, kind, op) {
  if (kind === 'overlapSame') {
    if (side === 'B') return 'drop';
    return op === 'union' || op === 'intersect' ? 'keep' : 'drop';
  }
  if (kind === 'overlapOpp') {
    return side === 'A' && op === 'difference' ? 'keep' : 'drop';
  }
  if (kind === 'outside') {
    if (op === 'intersect') return 'drop';
    if (op === 'difference') return side === 'A' ? 'keep' : 'drop';
    return 'keep'; // union, xor
  }
  // inside
  if (op === 'union') return 'drop';
  if (op === 'intersect') return 'keep';
  if (op === 'difference') return side === 'A' ? 'drop' : 'reverse';
  return 'reverse'; // xor
}

// Drop provenance from every segment of a list of subpaths. A rechained boolean piece
// has no single origin — it may be part of one input, part of the other, or a stretch
// they share — so both the advisory `meta` channel and the typed `attrs` go. This is
// stronger than the `DROP` propagation rule, which only governs *cutting*: here the
// output segments are re-assembled into shapes that did not exist in either input.
function stripMeta(subpaths) {
  return subpaths.map((sp) =>
    sp.segments.some((seg) => seg.meta !== undefined || seg.attrs !== undefined)
      ? subpath(
          sp.segments.map((seg) => {
            const bare = withMeta(seg, undefined);
            delete bare.attrs;
            return bare;
          }),
          { closed: sp.closed },
        )
      : sp,
  );
}

function isDegenerate(seg) {
  const bb = boundingBox(seg);
  return Math.hypot(bb.maxX - bb.minX, bb.maxY - bb.minY) <= EPS_LINK;
}

// Endpoint chaining into closed subpaths; open remnants (degenerate leftovers) are
// dropped. Among continuations sharing the tail point (multi-valent crossing nodes)
// the sharpest *left* turn wins: pieces are oriented fill-on-the-left, so turning
// as far CCW as possible traces the minimal loop around each face and keeps output
// loops from threading through a crossing into another face. (Under the declared
// nonzero rule any pairing would enclose the same region — leftmost-turn just makes
// the loops minimal and deterministic.)
// The boolean engine strips advisory `meta`: a rechained boundary interleaves pieces from
// both operands, reversed as the op requires, so no piece has a single meaningful origin.
// (Splitting alone — `cutPath` — does propagate it: a piece of a fillet arc is still on
// the same circle.)
function rechain(pieces) {
  const out = [];
  const used = new Array(pieces.length).fill(false);
  for (let i = 0; i < pieces.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    const chain = [pieces[i]];
    for (let guard = 0; guard <= pieces.length; guard++) {
      const last = chain[chain.length - 1];
      const tail = endPoint(last);
      if (dist(tail, startPoint(chain[0])) <= EPS_LINK) break; // loop closed
      const tIn = tangentAt(last, 1);
      let found = -1;
      let bestTurn = -Infinity;
      for (let j = 0; j < pieces.length; j++) {
        if (used[j]) continue;
        if (dist(startPoint(pieces[j]), tail) > EPS_LINK) continue;
        const tOut = tangentAt(pieces[j], 0);
        const turn = Math.atan2(tIn.x * tOut.y - tIn.y * tOut.x, tIn.x * tOut.x + tIn.y * tOut.y);
        if (turn > bestTurn) {
          bestTurn = turn;
          found = j;
        }
      }
      if (found < 0) break;
      used[found] = true;
      chain.push(pieces[found]);
    }
    if (dist(endPoint(chain[chain.length - 1]), startPoint(chain[0])) <= EPS_LINK) {
      out.push(subpath(chain, { closed: true }));
    }
  }
  return out;
}

/**
 * Boolean operation on two filled regions.
 *
 * Inputs are read under their own carried fill rules (open subpaths implicitly
 * closed, per SVG fill semantics); operands whose own boundary self-intersects are
 * rewritten by `simplify` first. The result is a Path with `fillRule: 'nonzero'`;
 * degenerate zero-area remnants are dropped. Shared (coincident) boundary stretches
 * are handled per the table in this module's header.
 * @param {object} a  Path
 * @param {object} b  Path
 * @param {'union'|'intersect'|'difference'|'xor'} op  difference = a − b
 * @returns {object} Path
 */
export function booleanPath(a, b, op, opts = {}) {
  if (!OPS.includes(op)) {
    throw new TypeError(`booleanPath: op must be one of ${OPS.join(', ')}`);
  }
  // Self-intersecting operands (crossing/coincident subpaths, figure-eights, raw
  // stroke outlines) are rewritten by self-union first — the classify/normalize
  // machinery below assumes each operand's own boundary is crossing-free. The probe
  // keeps the common clean-input case on the cheap path.
  const prep = (p) => {
    const closed = closeAll(p);
    return pathSelfIntersects(closed) ? simplifyClosed(closed) : normalize(closed);
  };
  const A = prep(a);
  const B = prep(b);
  const pieces = [];
  const collect = (cut, other, side) => {
    for (const sp of cut.subpaths) {
      for (const seg of sp.segments) {
        if (isDegenerate(seg)) continue;
        const act = action(side, classify(seg, other), op);
        if (act === 'keep') pieces.push(seg);
        else if (act === 'reverse') pieces.push(reverseSegment(seg));
      }
    }
  };
  collect(cutPath(A, B), B, 'A');
  collect(cutPath(B, A), A, 'B');
  return tagOutputPath(path(stripMeta(rechain(pieces)), { fillRule: NONZERO }), opts.outAttrs);
}

// Side-sample offset for a piece: far enough to step over a coincident partner
// (within EPS_ON of the piece) yet small against the piece's own scale.
function sideEps(seg) {
  const bb = boundingBox(seg);
  return Math.max(Math.hypot(bb.maxX - bb.minX, bb.maxY - bb.minY) * 1e-3, 10 * EPS_ON);
}

/**
 * Self-union: rewrite a possibly self-intersecting path as a non-self-intersecting
 * `nonzero` path bounding the same filled region (read under the input's own fill
 * rule; open subpaths implicitly closed).
 *
 * Engine: cut the boundary at every self-intersection (`cutSelfPath` — crossings,
 * coincident stretches, cubic double points), then keep exactly the pieces where
 * filledness flips across the boundary, sampled at midpoint ± ε·normal against the
 * *input* region, oriented fill-on-the-left (= winding +1, matching `windingAt`'s
 * sign convention). Pieces with equal filledness on both sides — interior seams,
 * evenodd double covers, offset/stroke overlap connectors — drop. Coincident piece
 * groups (doubled edges) contribute one representative. Kept pieces rechain into
 * closed loops.
 * @param {object} pth  Path
 * @returns {object} Path
 */
export function simplify(pth) {
  return simplifyClosed(closeAll(pth));
}

// simplify on an already-closed path (booleanPath feeds closeAll output directly).
function simplifyClosed(closed) {
  const pieces = [];
  for (const sp of cutSelfPath(closed).subpaths) {
    for (const seg of sp.segments) {
      if (!isDegenerate(seg)) pieces.push(seg);
    }
  }
  const absorbed = new Array(pieces.length).fill(false);
  const kept = [];
  for (let i = 0; i < pieces.length; i++) {
    if (absorbed[i]) continue;
    const mid = pointAt(pieces[i], 0.5);
    // Coincident partners lie on the same stretch (cutting aligned them 1:1);
    // absorb them so the group is decided once, through this representative.
    for (let j = i + 1; j < pieces.length; j++) {
      if (!absorbed[j] && nearestPoint(pieces[j], mid).dist <= EPS_ON) absorbed[j] = true;
    }
    const tn = tangentAt(pieces[i], 0.5);
    const eps = sideEps(pieces[i]);
    const left = containsPoint(closed, vec2(mid.x - tn.y * eps, mid.y + tn.x * eps));
    const right = containsPoint(closed, vec2(mid.x + tn.y * eps, mid.y - tn.x * eps));
    if (left === right) continue; // seam / double cover / exterior remnant
    kept.push(left ? pieces[i] : reverseSegment(pieces[i]));
  }
  return path(stripMeta(rechain(kept)), { fillRule: NONZERO });
}

/** A ∪ B. */
export const union = (a, b, opts) => booleanPath(a, b, 'union', opts);
/** A ∩ B. */
export const intersection = (a, b, opts) => booleanPath(a, b, 'intersect', opts);
/** A − B. */
export const difference = (a, b, opts) => booleanPath(a, b, 'difference', opts);
/** (A − B) ∪ (B − A). */
export const xor = (a, b, opts) => booleanPath(a, b, 'xor', opts);
