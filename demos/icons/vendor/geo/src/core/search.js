// F13 — shape search and shape fitting.
//
// `searchShape` finds instances of a template inside a target under **similarity plus
// optional mirror** — translation, rotation, uniform scale. That restriction is not
// timidity: it is what keeps the tolerances meaningful. Under a general affine, angles are
// not preserved, so an "angle tolerance" would mean nothing, and a "length tolerance" would
// mean different things in different directions.
//
// The pipeline is the standard one for this problem, and each stage exists because the
// stage before it cannot be trusted alone:
//
//   1. **Features.** Corners (F10 `pathCorners`) with their turn angles. A corner is the
//      only landmark a similarity preserves exactly.
//   2. **Candidates from pairs.** Two matched correspondences fix translation, rotation and
//      scale *exactly* — no search over transform space, just a closed-form solve per pair.
//   3. **Verification.** A candidate that fits two features can still be nonsense, so the
//      whole template is sampled and compared two ways.
//   4. **Non-maximum suppression.** Near-duplicate transforms collapse to their best.
//
// Pure and synchronous throughout: no promises, no generators, nothing that fails to port.
// Long searches are bounded by `{maxResults, maxWork, onProgress}` and say which limit
// stopped them — concurrency is the caller's business, and `onProgress` is the hook for it.

import { vec2 } from './vec2.js';
import { affine, transformPath, classify } from './affine.js';
import { pathCorners } from './corners.js';
import { pathLength } from './sample.js';
import { pointAt, arcLength } from './segment.js';
import { pathBoundingBox } from './path.js';
import { intersection } from './boolean.js';
import { pathArea } from './area.js';
import { containsPoint } from './winding.js';
import { EPS } from './tolerance.js';

const TAU = 2 * Math.PI;

// A similarity from two point correspondences: a₀→b₀, a₁→b₁. Exact, no iteration.
function similarityFromPairs(a0, a1, b0, b1, mirror) {
  const ax = a1.x - a0.x;
  const ay = a1.y - a0.y;
  const bx = b1.x - b0.x;
  const by = b1.y - b0.y;
  const la = Math.hypot(ax, ay);
  const lb = Math.hypot(bx, by);
  if (la <= EPS || lb <= EPS) return null;
  const scale = lb / la;
  // Mirror about the template's own x axis before rotating, so the pair still matches.
  const sa = mirror ? -ay : ay;
  const angle = Math.atan2(by, bx) - Math.atan2(sa, ax);
  const c = Math.cos(angle) * scale;
  const s = Math.sin(angle) * scale;
  // Linear part: rotate∘scale, with a reflection in y first when mirrored.
  const m11 = c;
  const m12 = mirror ? s : -s;
  const m21 = s;
  const m22 = mirror ? -c : c;
  return affine(m11, m21, m12, m22, b0.x - (m11 * a0.x + m12 * a0.y), b0.y - (m21 * a0.x + m22 * a0.y));
}

/**
 * Feature points for matching: path corners with their turn angle, plus the shape's own
 * scale for normalizing distances.
 * @param {object} pth
 * @param {{minAngle?:number}} [opts]
 * @returns {{point, turn, interiorAngle}[]}
 */
export function shapeFeatures(pth, opts = {}) {
  const minAngle = opts.minAngle ?? 0.12; // radians of turn; below this it is not a landmark
  return pathCorners(pth)
    .filter((c) => Math.abs(c.turn) >= minAngle)
    .map((c) => ({ point: c.point, turn: c.turn, interiorAngle: c.interiorAngle }));
}

// Sample a path's boundary once, evenly by arc length. Everything downstream works on
// these points: `pointAtLength` re-measures the whole path on every call, so calling it
// inside a verification loop turns a 0.1 s search into a 78 s one. Measure once, reuse.
function samplePoints(pth, n) {
  const total = pathLength(pth);
  if (!(total > 0)) return [];
  const out = [];
  const segs = [];
  for (const sp of pth.subpaths) for (const seg of sp.segments) segs.push(seg);
  const lengths = segs.map((seg) => segLength(seg));
  const prefix = [];
  let acc = 0;
  for (const l of lengths) {
    prefix.push(acc);
    acc += l;
  }
  for (let i = 0; i < n; i++) {
    const s = (acc * i) / n;
    let k = 0;
    while (k < segs.length - 1 && prefix[k] + lengths[k] < s) k++;
    out.push(pointAt(segs[k], lengths[k] <= EPS ? 0 : (s - prefix[k]) / lengths[k]));
  }
  return out;
}

function segLength(seg) {
  return arcLength(seg);
}

// A uniform grid over a point cloud, for nearest-distance queries. The verification pass
// makes tens of thousands of them, and a linear scan per query is what made this quadratic.
function makeCloud(points) {
  if (points.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const w = Math.max(maxX - minX, EPS);
  const h = Math.max(maxY - minY, EPS);
  const cols = Math.max(1, Math.min(64, Math.round(Math.sqrt(points.length))));
  const rows = cols;
  const cw = w / cols;
  const ch = h / rows;
  const cells = new Array(cols * rows);
  const idx = (cx, cy) => cy * cols + cx;
  for (const p of points) {
    const cx = Math.min(cols - 1, Math.max(0, Math.floor((p.x - minX) / cw)));
    const cy = Math.min(rows - 1, Math.max(0, Math.floor((p.y - minY) / ch)));
    const k = idx(cx, cy);
    (cells[k] ?? (cells[k] = [])).push(p);
  }
  return {
    nearest(q, cutoff) {
      const cx = Math.min(cols - 1, Math.max(0, Math.floor((q.x - minX) / cw)));
      const cy = Math.min(rows - 1, Math.max(0, Math.floor((q.y - minY) / ch)));
      let best = Infinity;
      // Grow the ring until the closest possible point in the next ring cannot beat the
      // best found, or the cutoff is already exceeded.
      for (let r = 0; r < Math.max(cols, rows); r++) {
        const ringFloor = r === 0 ? 0 : (r - 1) * Math.min(cw, ch);
        if (best <= ringFloor || ringFloor > cutoff) break;
        for (let y = cy - r; y <= cy + r; y++) {
          if (y < 0 || y >= rows) continue;
          for (let x = cx - r; x <= cx + r; x++) {
            if (x < 0 || x >= cols) continue;
            if (r > 0 && Math.abs(y - cy) !== r && Math.abs(x - cx) !== r) continue;
            const bucket = cells[idx(x, y)];
            if (!bucket) continue;
            for (const p of bucket) {
              const d = Math.hypot(p.x - q.x, p.y - q.y);
              if (d < best) best = d;
            }
          }
        }
      }
      return best;
    },
  };
}

/**
 * Find instances of `template` inside `target` under similarity + optional mirror.
 *
 * @param {object} target
 * @param {object} template
 * @param {object} [opts]
 * @param {[number,number]} [opts.scaleRange=[0.2, 5]]
 * @param {boolean} [opts.mirror=false]  also try reflected placements
 * @param {number} [opts.angleTolerance=0.25]  radians, on matched corner turn angles
 * @param {number} [opts.maxDeviation=0.08]  sampled two-way deviation, relative to size
 * @param {number} [opts.minOverlap=0]  boolean overlap fraction, 0 to skip the check
 * @param {number} [opts.maxResults=32]
 * @param {number} [opts.maxWork=200000]  candidate-verification budget
 * @param {(p:number)=>boolean} [opts.onProgress]  return false to cancel
 * @returns {{matches, truncated, work}}
 *   `matches` are `{transform, similarity:{tx,ty,angle,scale,mirror}, deviation, overlap,
 *   score}`, best first. `truncated` is `'maxResults' | 'maxWork' | 'cancelled' | null`.
 */
export function searchShape(target, template, opts = {}) {
  const scaleRange = opts.scaleRange ?? [0.2, 5];
  const mirrorAllowed = opts.mirror === true;
  const angleTolerance = opts.angleTolerance ?? 0.25;
  const maxDeviation = opts.maxDeviation ?? 0.08;
  const minOverlap = opts.minOverlap ?? 0;
  const maxResults = opts.maxResults ?? 32;
  const maxWork = opts.maxWork ?? 200000;
  const samples = opts.samples ?? 48;

  const tFeat = shapeFeatures(template, opts);
  const gFeat = shapeFeatures(target, opts);
  const out = { matches: [], truncated: null, work: 0 };
  if (tFeat.length < 2 || gFeat.length < 2) return out;

  // Sampled once, outside every loop. The candidate check then maps the template's local
  // samples (cheap) and queries a grid over the target's (cheap), instead of transforming
  // a whole Path and re-measuring it per candidate.
  const localPts = samplePoints(template, samples);
  const targetCloud = makeCloud(samplePoints(target, Math.max(256, samples * 8)));
  if (localPts.length === 0 || targetCloud === null) return out;
  const tbox = pathBoundingBox(template);
  const tSize = Math.max(tbox.maxX - tbox.minX, tbox.maxY - tbox.minY, EPS);

  const raw = [];
  const mirrors = mirrorAllowed ? [false, true] : [false];
  let cancelled = false;

  outer: for (let i = 0; i < tFeat.length; i++) {
    for (let j = 0; j < tFeat.length; j++) {
      if (i === j) continue;
      const a0 = tFeat[i];
      const a1 = tFeat[j];
      const aLen = Math.hypot(a1.point.x - a0.point.x, a1.point.y - a0.point.y);
      if (aLen <= EPS) continue;

      for (let k = 0; k < gFeat.length; k++) {
        for (let l = 0; l < gFeat.length; l++) {
          if (k === l) continue;
          const b0 = gFeat[k];
          const b1 = gFeat[l];
          const bLen = Math.hypot(b1.point.x - b0.point.x, b1.point.y - b0.point.y);
          if (bLen <= EPS) continue;

          const scale = bLen / aLen;
          if (scale < scaleRange[0] || scale > scaleRange[1]) continue;

          for (const mirror of mirrors) {
            // Corner turn angles are similarity invariants (mirrored ones flip sign), so
            // they gate candidates before any geometry is built — which is what keeps the
            // O(n²m²) pair loop affordable.
            const s = mirror ? -1 : 1;
            if (Math.abs(a0.turn * s - b0.turn) > angleTolerance) continue;
            if (Math.abs(a1.turn * s - b1.turn) > angleTolerance) continue;

            out.work += 1;
            if (out.work > maxWork) {
              out.truncated = 'maxWork';
              break outer;
            }
            if (opts.onProgress && out.work % 256 === 0) {
              if (opts.onProgress(Math.min(1, out.work / maxWork)) === false) {
                cancelled = true;
                out.truncated = 'cancelled';
                break outer;
              }
            }

            const m = similarityFromPairs(a0.point, a1.point, b0.point, b1.point, mirror);
            if (m === null) continue;
            const cls = classify(m);
            if (cls.degenerate) continue;

            const mappedSize = tSize * scale;
            const cutoff = maxDeviation * mappedSize;
            let worst = 0;
            let rejected = false;
            for (const lp of localPts) {
              const q = { x: m.a * lp.x + m.c * lp.y + m.e, y: m.b * lp.x + m.d * lp.y + m.f };
              const d = targetCloud.nearest(q, cutoff * 1.5);
              if (d > worst) worst = d;
              if (worst > cutoff) {
                rejected = true;
                break;
              }
            }
            if (rejected) continue;
            const dev = worst / mappedSize;
            const mappedPts = localPts.map((lp) => ({
              x: m.a * lp.x + m.c * lp.y + m.e,
              y: m.b * lp.x + m.d * lp.y + m.f,
            }));

            let overlap = 1;
            if (minOverlap > 0) {
              overlap = overlapFraction(transformPath(template, m, { meta: 'drop' }), target);
              if (overlap < minOverlap) continue;
            }
            raw.push({
              mappedPts,
              mappedSize,
              transform: m,
              similarity: {
                tx: m.e,
                ty: m.f,
                angle: Math.atan2(m.b, m.a),
                scale: cls.scale ?? Math.hypot(m.a, m.b),
                mirror: cls.mirror,
              },
              deviation: dev,
              overlap,
              score: (1 - dev / maxDeviation) * (minOverlap > 0 ? overlap : 1),
            });
          }
        }
      }
    }
  }

  raw.sort((x, y) => y.score - x.score);
  out.matches = suppress(raw, maxResults).map(({ mappedPts, mappedSize, ...rest }) => rest);
  if (!cancelled && out.truncated === null && raw.length > out.matches.length && out.matches.length >= maxResults) {
    out.truncated = 'maxResults';
  }
  return out;
}

// Boolean overlap fraction: how much of the mapped template's area the target covers.
function overlapFraction(mapped, target) {
  const a = Math.abs(pathArea(mapped));
  if (!(a > 0)) return 0;
  try {
    return Math.min(1, Math.abs(pathArea(intersection(mapped, target))) / a);
  } catch {
    return 0;
  }
}

// Non-maximum suppression on the **image**, not the transform.
//
// A symmetric template makes this necessary: a square maps onto itself under four
// rotations, so four genuinely different `{angle, tx, ty}` triples place identical
// geometry and a transform-space comparison reports one find as four. Comparing where the
// template actually *lands* — a symmetric Hausdorff distance between the mapped sample
// clouds — collapses those and still keeps two distinct placements that happen to overlap.
function suppress(sorted, maxResults) {
  const kept = [];
  for (const cand of sorted) {
    if (kept.length >= maxResults) break;
    const dup = kept.some(
      (k) =>
        k.similarity.mirror === cand.similarity.mirror &&
        hausdorff(k.mappedPts, cand.mappedPts) <= 0.12 * Math.max(k.mappedSize, cand.mappedSize),
    );
    if (!dup) kept.push(cand);
  }
  return kept;
}

// Symmetric Hausdorff distance between two small point clouds.
function hausdorff(a, b) {
  return Math.max(directed(a, b), directed(b, a));
}

function directed(a, b) {
  let worst = 0;
  for (const p of a) {
    let best = Infinity;
    for (const q of b) {
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < best) best = d;
    }
    if (best > worst) worst = best;
  }
  return worst;
}

/**
 * The largest placement of `shape` inside `container` under a similarity.
 *
 * Coarse sweep then bisection on scale, over the axes the caller leaves free. Honours
 * locks: `rotate: false` keeps the shape upright; a fixed `scale` turns the search into a
 * pure placement question.
 *
 * `null` means **infeasible**, which is only reachable with a fixed `scale` — with the
 * scale free, some small enough placement always fits, so the answer is a small number
 * rather than a refusal. Saying that plainly beats implying a feasibility check the free
 * case cannot perform.
 *
 * @param {object} shape
 * @param {object} container
 * @param {{rotate?:boolean, scale?:number, tolerance?:number, angleSteps?:number,
 *          gridSteps?:number, refineRounds?:number}} [opts]
 * @returns {{transform, scale, angle, center, fits} | null}
 */
export function fitWithin(shape, container, opts = {}) {
  const allowRotate = opts.rotate !== false;
  const fixedScale = opts.scale;
  const angleSteps = allowRotate ? (opts.angleSteps ?? 24) : 1;
  const gridSteps = opts.gridSteps ?? 9;
  const refineRounds = opts.refineRounds ?? 6;

  const cbox = pathBoundingBox(container);
  const sbox = pathBoundingBox(shape);
  if (cbox === null || sbox === null) return null;
  const sCenter = vec2((sbox.minX + sbox.maxX) / 2, (sbox.minY + sbox.maxY) / 2);
  const sSize = Math.max(sbox.maxX - sbox.minX, sbox.maxY - sbox.minY, EPS);
  const cSize = Math.max(cbox.maxX - cbox.minX, cbox.maxY - cbox.minY);

  const place = (angle, scale, cx, cy) => {
    const c = Math.cos(angle) * scale;
    const s = Math.sin(angle) * scale;
    return affine(c, s, -s, c, cx - (c * sCenter.x - s * sCenter.y), cy - (s * sCenter.x + c * sCenter.y));
  };

  // The shape's boundary, sampled once. Mapping these points per placement is both far
  // cheaper than transforming and re-measuring the Path, and free of the degenerate-matrix
  // problem a vanishing probe scale would otherwise hit.
  const localPts = samplePoints(shape, opts.samples ?? 64);
  if (localPts.length === 0) return null;

  const fitsAt = (m) => {
    for (const lp of localPts) {
      const x = m.a * lp.x + m.c * lp.y + m.e;
      const y = m.b * lp.x + m.d * lp.y + m.f;
      if (!containsPoint(container, { x, y }, container.fillRule)) return false;
    }
    return true;
  };

  let best = null;
  const upper = fixedScale ?? (cSize / sSize) * 1.5;
  for (let ai = 0; ai < angleSteps; ai++) {
    const angle = allowRotate ? (Math.PI * ai) / angleSteps : 0;
    for (let gx = 0; gx < gridSteps; gx++) {
      for (let gy = 0; gy < gridSteps; gy++) {
        const cx = cbox.minX + ((cbox.maxX - cbox.minX) * (gx + 0.5)) / gridSteps;
        const cy = cbox.minY + ((cbox.maxY - cbox.minY) * (gy + 0.5)) / gridSteps;
        if (fixedScale !== undefined) {
          const m = place(angle, fixedScale, cx, cy);
          if (fitsAt(m) && (best === null || fixedScale > best.scale)) {
            best = { transform: m, scale: fixedScale, angle, center: vec2(cx, cy) };
          }
          continue;
        }
        // Bisect on scale: the largest that still fits at this angle and centre. The probe
        // scale is relative to the container, not an absolute epsilon — an absolute one is
        // a degenerate matrix at any realistic size.
        let lo = 0;
        let hi = upper;
        const probe = (cSize / sSize) * 1e-4;
        if (!fitsAt(place(angle, probe, cx, cy))) continue;
        lo = probe;
        for (let r = 0; r < refineRounds; r++) {
          const mid = (lo + hi) / 2;
          if (fitsAt(place(angle, mid, cx, cy))) lo = mid;
          else hi = mid;
        }
        if (best === null || lo > best.scale) {
          best = { transform: place(angle, lo, cx, cy), scale: lo, angle, center: vec2(cx, cy) };
        }
      }
    }
  }
  if (best === null || !(best.scale > 0)) return null;
  return { ...best, fits: true };
}

