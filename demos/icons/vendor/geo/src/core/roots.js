// Real-root solvers for low-degree polynomials.
//
// Needed by the kernel: quadratics for Bézier derivative extrema (bbox) and beyond,
// cubics for cubic-Bézier bbox and nearest-point. Returns only real roots, unordered
// unless noted. Coefficients are in descending degree order.

import { isZero } from './tolerance.js';

/**
 * Real roots of a·x + b = 0.
 * @returns {number[]} 0 or 1 roots (empty if a≈0 and b≠0; empty for the degenerate 0=0).
 */
export function linearRoots(a, b) {
  if (isZero(a)) return [];
  return [-b / a];
}

/**
 * Real roots of a·x² + b·x + c = 0.
 * Falls back to the linear solver when a≈0.
 * @returns {number[]} 0, 1, or 2 real roots.
 */
export function quadraticRoots(a, b, c) {
  if (isZero(a)) return linearRoots(b, c);
  const disc = b * b - 4 * a * c;
  if (isZero(disc)) return [-b / (2 * a)];
  if (disc < 0) return [];
  // Numerically stable form: avoid cancellation by using the sign of b.
  const sq = Math.sqrt(disc);
  const q = -0.5 * (b + Math.sign(b || 1) * sq);
  const r0 = q / a;
  const r1 = c / q;
  return [r0, r1];
}

/**
 * Real roots of a·x³ + b·x² + c·x + d = 0.
 * Falls back to the quadratic solver when a≈0. Uses the depressed-cubic /
 * trigonometric (Cardano) method.
 * @returns {number[]} 1, 2, or 3 real roots (may contain near-duplicates at multiplicities).
 */
export function cubicRoots(a, b, c, d) {
  if (isZero(a)) return quadraticRoots(b, c, d);

  // Normalize to x³ + Bx² + Cx + D = 0.
  const B = b / a;
  const C = c / a;
  const D = d / a;

  // Depress: x = t − B/3  →  t³ + p·t + q = 0.
  const B3 = B / 3;
  const p = C - (B * B) / 3;
  const q = (2 * B * B * B) / 27 - (B * C) / 3 + D;

  const roots = [];
  const disc = (q * q) / 4 + (p * p * p) / 27;

  if (isZero(disc)) {
    // All roots real, at least two equal.
    if (isZero(q)) {
      roots.push(0);
    } else {
      const u = Math.cbrt(-q / 2);
      roots.push(2 * u, -u);
    }
  } else if (disc > 0) {
    // One real root.
    const sq = Math.sqrt(disc);
    const u = Math.cbrt(-q / 2 + sq);
    const v = Math.cbrt(-q / 2 - sq);
    roots.push(u + v);
  } else {
    // Three distinct real roots — trigonometric form.
    const r = Math.sqrt(-(p * p * p) / 27);
    const phi = Math.acos(Math.min(1, Math.max(-1, -q / (2 * r))));
    const m = 2 * Math.cbrt(r);
    roots.push(
      m * Math.cos(phi / 3),
      m * Math.cos((phi + 2 * Math.PI) / 3),
      m * Math.cos((phi + 4 * Math.PI) / 3),
    );
  }

  return roots.map((t) => t - B3);
}
