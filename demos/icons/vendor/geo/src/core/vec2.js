// Vec2 — the 2D point / vector value type.
//
// A Vec2 is a plain immutable-by-convention object `{ x, y }`. Operations are free
// functions that take values and return new values; they never mutate their arguments.
// (Immutability is a documented contract, not enforced with Object.freeze — freezing
// costs performance in hot paths and does not translate to the other target languages.)

import { eq as scalarEq, isZero } from './tolerance.js';

/**
 * Construct a Vec2.
 * @param {number} x
 * @param {number} y
 * @returns {{x:number,y:number}}
 */
export function vec2(x, y) {
  return { x, y };
}

/** a + b */
export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

/** a - b */
export function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

/** a * s (scalar) */
export function scale(a, s) {
  return { x: a.x * s, y: a.y * s };
}

/** -a */
export function neg(a) {
  return { x: -a.x, y: -a.y };
}

/** Dot product a·b */
export function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

/** 2D cross product (scalar z-component of a×b). */
export function cross(a, b) {
  return a.x * b.y - a.y * b.x;
}

/** Squared length (cheaper — avoids sqrt). */
export function len2(a) {
  return a.x * a.x + a.y * a.y;
}

/** Euclidean length. */
export function len(a) {
  return Math.hypot(a.x, a.y);
}

/**
 * Unit vector in the direction of a. Returns {0,0} for a (near-)zero vector rather than
 * NaN — callers doing tangents on degenerate segments get a defined, testable result.
 */
export function normalize(a) {
  const l = len(a);
  if (isZero(l)) return { x: 0, y: 0 };
  return { x: a.x / l, y: a.y / l };
}

/** Left perpendicular: rotate +90° (CCW). perp({1,0}) = {0,1}. */
export function perp(a) {
  return { x: -a.y, y: a.x };
}

/** Linear interpolation a→b at parameter t. */
export function lerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Rotate a by angle (radians) about the origin. */
export function rotate(a, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: a.x * c - a.y * s, y: a.x * s + a.y * c };
}

/** Angle of the vector from +x axis, in radians (−π, π]. */
export function angle(a) {
  return Math.atan2(a.y, a.x);
}

/** Squared distance between two points. */
export function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/** Distance between two points. */
export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Tolerant component-wise equality. */
export function eq(a, b, eps) {
  return scalarEq(a.x, b.x, eps) && scalarEq(a.y, b.y, eps);
}
