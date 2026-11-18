// Numeric tolerance policy for the geometry kernel.
//
// One documented place for "how close is equal". Every collinearity / coincidence /
// degeneracy decision in the library routes through the helpers here rather than
// sprinkling magic constants around — this keeps the numeric behaviour auditable and,
// crucially, translatable to the other target languages of the wider project.
//
// All arithmetic is IEEE-754 f64 (JS `number`). We treat that as the library's single
// numeric type and never rely on integer semantics.

/** Primary tolerance. Basis for the derived constants below. */
export const EPS = 1e-9;

/** Distance below which two points are considered the same location. */
export const EPS_COINCIDENT = 1e-9;

/** Tolerance on a curve parameter t (defined on [0, 1]). */
export const EPS_PARAM = 1e-9;

/** Angular tolerance in radians. */
export const EPS_ANGLE = 1e-9;

/**
 * Sine of the angle between two curve tangents below which an intersection is
 * classified as tangential (grazing) rather than transversal. Looser than EPS_ANGLE:
 * tangency is detected on iteratively/numerically derived parameters, whose angular
 * noise near a true tangency is far above 1e-9.
 */
export const EPS_TANGENT = 1e-6;

/** Default flatness tolerance for adaptive subdivision (max chord deviation). */
export const FLATNESS = 1e-3;

/**
 * Flatness tolerance for rasterization, in *device pixels* (max chord deviation after
 * the path→device transform). Callers convert to path space by dividing by the
 * transform's maximum stretch factor. A quarter pixel keeps curve-flattening error
 * well below the coverage quantization of any of the raster modes.
 */
export const FLATNESS_RASTER = 0.25;

/**
 * Combined absolute + relative comparison for two scalars.
 *
 * The absolute term handles values near zero (where relative comparison breaks down);
 * the relative term handles large magnitudes (where fixed absolute epsilon is too tight).
 *
 * @param {number} a
 * @param {number} b
 * @param {number} [eps=EPS]
 * @returns {boolean}
 */
export function eq(a, b, eps = EPS) {
  if (a === b) return true; // exact / handles same-sign Infinity
  // Non-finite values (±Infinity, NaN) only compare equal exactly, handled above.
  // Bail here so the relative branch can't evaluate Infinity <= Infinity as "equal".
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  const diff = Math.abs(a - b);
  if (diff <= eps) return true;
  return diff <= eps * Math.max(Math.abs(a), Math.abs(b));
}

/**
 * Is a scalar within tolerance of zero? (absolute only — there is no scale to relate to)
 * @param {number} x
 * @param {number} [eps=EPS]
 * @returns {boolean}
 */
export function isZero(x, eps = EPS) {
  return Math.abs(x) <= eps;
}

/**
 * Clamp a curve parameter into [0, 1].
 * @param {number} t
 * @returns {number}
 */
export function clamp01(t) {
  if (t < 0) return 0;
  if (t > 1) return 1;
  return t;
}

/**
 * Sign of a scalar with a dead-zone: returns 0 when within tolerance of zero,
 * otherwise -1 or +1. Useful for robust orientation / side tests.
 * @param {number} x
 * @param {number} [eps=EPS]
 * @returns {-1 | 0 | 1}
 */
export function signum(x, eps = EPS) {
  if (isZero(x, eps)) return 0;
  return x < 0 ? -1 : 1;
}
