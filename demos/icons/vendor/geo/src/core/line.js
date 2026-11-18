// Line-segment kernel operations.

import { vec2, sub, lerp, dot, len2 } from './vec2.js';
import { line } from './segment.js';
import { clamp01 } from './tolerance.js';

/** Point at parameter t ∈ [0,1]. */
export function pointAt(seg, t) {
  return lerp(seg.p0, seg.p1, t);
}

/** First derivative (constant for a line): p1 − p0. */
export function derivativeAt(seg) {
  return sub(seg.p1, seg.p0);
}

/** Second derivative: zero for a line. */
export function derivative2At() {
  return vec2(0, 0);
}

/** Axis-aligned bounding box. */
export function boundingBox(seg) {
  return {
    minX: Math.min(seg.p0.x, seg.p1.x),
    minY: Math.min(seg.p0.y, seg.p1.y),
    maxX: Math.max(seg.p0.x, seg.p1.x),
    maxY: Math.max(seg.p0.y, seg.p1.y),
  };
}

/** Split into two lines at parameter t. */
export function splitAt(seg, t) {
  const mid = pointAt(seg, t);
  return [line(seg.p0, mid), line(mid, seg.p1)];
}

/**
 * Closed-form nearest point on the segment to q.
 * @returns {{t:number, point:{x:number,y:number}, dist:number}}
 */
export function nearestPoint(seg, q) {
  const d = sub(seg.p1, seg.p0);
  const l2 = len2(d);
  let t;
  if (l2 === 0) {
    t = 0; // degenerate: both endpoints coincide
  } else {
    t = clamp01(dot(sub(q, seg.p0), d) / l2);
  }
  const point = pointAt(seg, t);
  const dist = Math.hypot(q.x - point.x, q.y - point.y);
  return { t, point, dist };
}
