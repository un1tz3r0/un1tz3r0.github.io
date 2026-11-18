// F16 — the lighting model for a flat bevel.
//
// The identity that makes this path-native rather than pixel-native:
//
//   For a flat bevel rising at slope angle α from the base plane, the surface normal at a
//   boundary point is  N = (n·sin α, cos α)  where n is the *2D outward normal* there.
//
// Derivation, so the sign convention is checkable rather than asserted: take the outward
// normal n = (1,0,0) and the boundary tangent t = (0,1,0) (so n × t = +ẑ). Walking inward
// the face rises h over a run w, giving the in-face tangent u = (−w, 0, h)/L. The surface
// normal is t × u = (h, 0, w)/L = (sin α, 0, cos α) with tan α = h/w. So N = (n sin α,
// cos α), which behaves correctly at both ends: α = 0 is a flat top with N = ẑ, and
// α = 90° is a vertical wall with N = n.
//
// The consequence is the whole design. `N` depends on the boundary *only* through the
// direction of n, so **intensity is a function of the boundary normal angle alone**. Two
// points with parallel normals are lit identically no matter where they sit or how the
// path curves between them. Iso-intensity contours are therefore not curves that must be
// traced through a field — they are the finitely many parameter values where the normal
// angle hits a fixed value, which is why the bands can be cut rather than marched.

import { EPS } from '../core/tolerance.js';

/**
 * A light direction from azimuth and elevation, both in radians.
 * Azimuth is measured from +x in the plane; elevation from the plane toward +z.
 * @returns {{x:number, y:number, z:number}} unit vector
 */
export function lightVector(azimuth, elevation) {
  const c = Math.cos(elevation);
  return { x: Math.cos(azimuth) * c, y: Math.sin(azimuth) * c, z: Math.sin(elevation) };
}

/**
 * The half-vector for Blinn-Phong under an orthographic view (`V = +z`).
 * @returns {{x, y, z}} unit vector
 */
export function halfVector(light) {
  const h = { x: light.x, y: light.y, z: light.z + 1 };
  const l = Math.hypot(h.x, h.y, h.z);
  return l <= EPS ? { x: 0, y: 0, z: 1 } : { x: h.x / l, y: h.y / l, z: h.z / l };
}

/**
 * `N · D` at a boundary whose outward normal points at angle `psi`, for a bevel of slope
 * `alpha` and a direction `D` (the light, or the half-vector).
 *
 * This is the one place the geometry meets the lighting: everything else in F16 is either
 * finding `psi` or cutting where this crosses a threshold.
 */
export function dotAt(psi, alpha, d) {
  const sa = Math.sin(alpha);
  const ca = Math.cos(alpha);
  return sa * (Math.cos(psi) * d.x + Math.sin(psi) * d.y) + ca * d.z;
}

/**
 * Lambertian diffuse intensity at boundary normal angle `psi`, clamped at zero.
 * @param {number} psi  outward normal angle (radians)
 * @param {{alpha:number, light:{x,y,z}}} model
 * @returns {number} in [0, 1]
 */
export function diffuseAt(psi, model) {
  return Math.max(0, dotAt(psi, model.alpha, model.light));
}

/**
 * Blinn-Phong specular intensity at boundary normal angle `psi`.
 * @param {number} psi
 * @param {{alpha:number, half:{x,y,z}, exponent:number}} model
 * @returns {number} in [0, 1]
 */
export function specularAt(psi, model) {
  const d = Math.max(0, dotAt(psi, model.alpha, model.half));
  return Math.pow(d, model.exponent);
}

/**
 * The normal angles at which `N · D` equals `level` — the iso-intensity directions.
 *
 * `N·D = sinα·cosθ_D·cos(ψ − φ_D) + cosα·D_z`, so the equation collapses to a single
 * `cos`, giving **at most two** solutions per turn: `ψ = φ_D ± arccos(k)`. Returning them
 * in closed form is what makes banding exact rather than a marching approximation.
 *
 * @param {number} level  the target value of `N · D`
 * @param {number} alpha  bevel slope angle
 * @param {{x, y, z}} d   light or half-vector
 * @returns {number[]} 0, 1, or 2 angles in [0, 2π)
 */
export function isoNormalAngles(level, alpha, d) {
  const sa = Math.sin(alpha);
  const planar = Math.hypot(d.x, d.y);
  const amp = sa * planar;
  const base = Math.cos(alpha) * d.z;
  if (Math.abs(amp) <= EPS) return []; // no planar variation: the whole band is one value
  const k = (level - base) / amp;
  if (k > 1 + EPS || k < -1 - EPS) return []; // the level is never reached
  const clamped = Math.min(1, Math.max(-1, k));
  const phi = Math.atan2(d.y, d.x);
  const delta = Math.acos(clamped);
  const norm = (a) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (delta <= EPS || Math.PI - delta <= EPS) return [norm(phi + delta)];
  return [norm(phi + delta), norm(phi - delta)];
}

/**
 * The range `N · D` takes over all boundary orientations, for a given bevel slope.
 * Used to place band thresholds where they actually fall rather than over [0, 1].
 * @returns {[number, number]} [min, max]
 */
export function dotRange(alpha, d) {
  const amp = Math.sin(alpha) * Math.hypot(d.x, d.y);
  const base = Math.cos(alpha) * d.z;
  return [base - Math.abs(amp), base + Math.abs(amp)];
}

/**
 * Build the shading model from user-facing options.
 * @param {{azimuth?:number, elevation?:number, bevelAngle?:number, exponent?:number}} opts
 */
export function shadingModel(opts = {}) {
  const azimuth = opts.azimuth ?? -Math.PI / 4;
  const elevation = opts.elevation ?? Math.PI / 4;
  const alpha = opts.bevelAngle ?? Math.PI / 4;
  const light = lightVector(azimuth, elevation);
  return {
    azimuth,
    elevation,
    alpha,
    light,
    half: halfVector(light),
    exponent: opts.exponent ?? 24,
  };
}
