// Numerical integration — composite Gauss–Legendre.
//
// Used for arc length (∫|C'(t)| dt), which has no closed form for quadratic/cubic Béziers
// or elliptical arcs. A fixed 5-point rule composited over sub-intervals is deterministic
// and more than accurate enough for smooth curve segments; accuracy is validated in tests
// against a fine polyline.

// 5-point Gauss–Legendre nodes/weights on [-1, 1].
const GL_NODES = [
  -0.906179845938664,
  -0.5384693101056831,
  0.0,
  0.5384693101056831,
  0.906179845938664,
];
const GL_WEIGHTS = [
  0.2369268850561891,
  0.4786286704993665,
  0.5688888888888889,
  0.4786286704993665,
  0.2369268850561891,
];

/**
 * Integrate f over [a, b] using composite 5-point Gauss–Legendre with `subdivisions`
 * equal sub-intervals.
 * @param {(x:number)=>number} f
 * @param {number} a
 * @param {number} b
 * @param {number} [subdivisions=16]
 * @returns {number}
 */
export function integrate(f, a, b, subdivisions = 16) {
  if (a === b) return 0;
  const h = (b - a) / subdivisions;
  const half = h / 2;
  let sum = 0;
  for (let s = 0; s < subdivisions; s++) {
    const mid = a + h * s + half;
    for (let k = 0; k < GL_NODES.length; k++) {
      sum += GL_WEIGHTS[k] * f(mid + half * GL_NODES[k]);
    }
  }
  return sum * half;
}
