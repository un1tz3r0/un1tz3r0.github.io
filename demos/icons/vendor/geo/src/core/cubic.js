// Cubic-Bézier kernel operations.

import { vec2, lerp } from './vec2.js';
import { cubic } from './segment.js';
import { quadraticRoots } from './roots.js';

/** Point at t via de Casteljau. */
export function pointAt(seg, t) {
  const a = lerp(seg.p0, seg.p1, t);
  const b = lerp(seg.p1, seg.p2, t);
  const c = lerp(seg.p2, seg.p3, t);
  const d = lerp(a, b, t);
  const e = lerp(b, c, t);
  return lerp(d, e, t);
}

/**
 * First derivative. In power form per axis with d1=p1−p0, d2=p2−p1, d3=p3−p2:
 * B'(t) = 3[ d1 + t·2(d2−d1) + t²(d1−2d2+d3) ].
 */
export function derivativeAt(seg, t) {
  const comp = (a, b, c, d) => {
    const d1 = b - a;
    const d2 = c - b;
    const d3 = d - c;
    return 3 * (d1 + 2 * (d2 - d1) * t + (d1 - 2 * d2 + d3) * t * t);
  };
  return vec2(
    comp(seg.p0.x, seg.p1.x, seg.p2.x, seg.p3.x),
    comp(seg.p0.y, seg.p1.y, seg.p2.y, seg.p3.y),
  );
}

/** Second derivative: B''(t) = 6[(1−t)(p2−2p1+p0) + t(p3−2p2+p1)]. */
export function derivative2At(seg, t) {
  const comp = (a, b, c, d) => 6 * ((1 - t) * (c - 2 * b + a) + t * (d - 2 * c + b));
  return vec2(
    comp(seg.p0.x, seg.p1.x, seg.p2.x, seg.p3.x),
    comp(seg.p0.y, seg.p1.y, seg.p2.y, seg.p3.y),
  );
}

// Parameters in (0,1) where the derivative vanishes on one axis.
// B'(t)/3 = a·t² + b·t + c with a=(d1−2d2+d3), b=2(d2−d1), c=d1.
function extremaT(p0, p1, p2, p3) {
  const d1 = p1 - p0;
  const d2 = p2 - p1;
  const d3 = p3 - p2;
  const a = d1 - 2 * d2 + d3;
  const b = 2 * (d2 - d1);
  const c = d1;
  return quadraticRoots(a, b, c).filter((t) => t > 0 && t < 1);
}

/** Exact axis-aligned bounding box (endpoints + derivative-root extrema). */
export function boundingBox(seg) {
  let minX = Math.min(seg.p0.x, seg.p3.x);
  let maxX = Math.max(seg.p0.x, seg.p3.x);
  let minY = Math.min(seg.p0.y, seg.p3.y);
  let maxY = Math.max(seg.p0.y, seg.p3.y);

  for (const t of extremaT(seg.p0.x, seg.p1.x, seg.p2.x, seg.p3.x)) {
    const x = pointAt(seg, t).x;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
  }
  for (const t of extremaT(seg.p0.y, seg.p1.y, seg.p2.y, seg.p3.y)) {
    const y = pointAt(seg, t).y;
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}

/** Split into two cubics at t via de Casteljau. */
export function splitAt(seg, t) {
  const a = lerp(seg.p0, seg.p1, t);
  const b = lerp(seg.p1, seg.p2, t);
  const c = lerp(seg.p2, seg.p3, t);
  const d = lerp(a, b, t);
  const e = lerp(b, c, t);
  const m = lerp(d, e, t);
  return [cubic(seg.p0, a, d, m), cubic(m, e, c, seg.p3)];
}
