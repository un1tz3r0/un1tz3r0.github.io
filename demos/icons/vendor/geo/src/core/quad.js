// Quadratic-Bézier kernel operations.

import { vec2, lerp } from './vec2.js';
import { quad } from './segment.js';

/** Point at t via de Casteljau. */
export function pointAt(seg, t) {
  const a = lerp(seg.p0, seg.p1, t);
  const b = lerp(seg.p1, seg.p2, t);
  return lerp(a, b, t);
}

/** First derivative: B'(t) = 2[(1−t)(p1−p0) + t(p2−p1)]. */
export function derivativeAt(seg, t) {
  const x = 2 * ((1 - t) * (seg.p1.x - seg.p0.x) + t * (seg.p2.x - seg.p1.x));
  const y = 2 * ((1 - t) * (seg.p1.y - seg.p0.y) + t * (seg.p2.y - seg.p1.y));
  return vec2(x, y);
}

/** Second derivative (constant): B''(t) = 2(p2 − 2p1 + p0). */
export function derivative2At(seg) {
  return vec2(
    2 * (seg.p2.x - 2 * seg.p1.x + seg.p0.x),
    2 * (seg.p2.y - 2 * seg.p1.y + seg.p0.y),
  );
}

// Parameter of the derivative root on one axis, or null if none in (0,1).
// B'(t)=0 → (a−b) + t(a−2b+c) = 0 with a,b,c the control components on that axis.
function extremumT(a, b, c) {
  const denom = a - 2 * b + c;
  if (denom === 0) return null;
  const t = (a - b) / denom;
  return t > 0 && t < 1 ? t : null;
}

/** Exact axis-aligned bounding box (endpoints + derivative-root extrema). */
export function boundingBox(seg) {
  let minX = Math.min(seg.p0.x, seg.p2.x);
  let maxX = Math.max(seg.p0.x, seg.p2.x);
  let minY = Math.min(seg.p0.y, seg.p2.y);
  let maxY = Math.max(seg.p0.y, seg.p2.y);

  const tx = extremumT(seg.p0.x, seg.p1.x, seg.p2.x);
  if (tx !== null) {
    const x = pointAt(seg, tx).x;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
  }
  const ty = extremumT(seg.p0.y, seg.p1.y, seg.p2.y);
  if (ty !== null) {
    const y = pointAt(seg, ty).y;
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}

/** Split into two quadratics at t via de Casteljau. */
export function splitAt(seg, t) {
  const a = lerp(seg.p0, seg.p1, t);
  const b = lerp(seg.p1, seg.p2, t);
  const m = lerp(a, b, t);
  return [quad(seg.p0, a, m), quad(m, b, seg.p2)];
}
