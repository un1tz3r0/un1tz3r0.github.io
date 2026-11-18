// 2×3 affine matrices in SVG `matrix(a b c d e f)` order — the same value shape geo uses,
// so matrices pass between the model and geo without conversion.
//
//   x' = a·x + c·y + e
//   y' = b·x + d·y + f

/** @typedef {{a:number,b:number,c:number,d:number,e:number,f:number}} Affine */
/** @typedef {{x:number,y:number}} Point */
/** @typedef {{x:number,y:number,width:number,height:number}} Box */

/** @type {Affine} */
export const IDENTITY = Object.freeze({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });

/** `m ∘ n`: the matrix that applies `n` first, then `m`. */
export function mul(m, n) {
  return {
    a: m.a * n.a + m.c * n.b,
    b: m.b * n.a + m.d * n.b,
    c: m.a * n.c + m.c * n.d,
    d: m.b * n.c + m.d * n.d,
    e: m.a * n.e + m.c * n.f + m.e,
    f: m.b * n.e + m.d * n.f + m.f,
  };
}

/** Compose a list, outermost first. */
export function mulAll(...ms) {
  return ms.reduce(mul, IDENTITY);
}

export function det(m) {
  return m.a * m.d - m.b * m.c;
}

/** Inverse, or `null` when the matrix is singular. */
export function invert(m) {
  const D = det(m);
  if (!Number.isFinite(D) || Math.abs(D) < 1e-12) return null;
  return {
    a: m.d / D,
    b: -m.b / D,
    c: -m.c / D,
    d: m.a / D,
    e: (m.c * m.f - m.d * m.e) / D,
    f: (m.b * m.e - m.a * m.f) / D,
  };
}

/** @returns {Point} */
export function apply(m, p) {
  return { x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f };
}

/** Apply only the linear part (for directions and deltas). */
export function applyVector(m, v) {
  return { x: m.a * v.x + m.c * v.y, y: m.b * v.x + m.d * v.y };
}

export const translate = (tx, ty) => ({ a: 1, b: 0, c: 0, d: 1, e: tx, f: ty });

export function scale(sx, sy = sx, cx = 0, cy = 0) {
  return { a: sx, b: 0, c: 0, d: sy, e: cx - sx * cx, f: cy - sy * cy };
}

export function rotate(radians, cx = 0, cy = 0) {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return { a: cos, b: sin, c: -sin, d: cos, e: cx - cos * cx + sin * cy, f: cy - sin * cx - cos * cy };
}

export function isIdentity(m, eps = 1e-9) {
  return (
    Math.abs(m.a - 1) < eps && Math.abs(m.b) < eps && Math.abs(m.c) < eps &&
    Math.abs(m.d - 1) < eps && Math.abs(m.e) < eps && Math.abs(m.f) < eps
  );
}

/** True when the matrix only translates and scales along the axes. */
export function isAxisAligned(m, eps = 1e-9) {
  return Math.abs(m.b) < eps && Math.abs(m.c) < eps;
}

/** Rotation (radians), scale factors and translation of a matrix. Skew is folded into sy. */
export function decompose(m) {
  const sx = Math.hypot(m.a, m.b);
  const rotation = Math.atan2(m.b, m.a);
  const sy = sx === 0 ? Math.hypot(m.c, m.d) : det(m) / sx;
  return { tx: m.e, ty: m.f, rotation, sx, sy };
}

/** Round to a fixed number of decimals without trailing zeros. */
export function fmt(n, precision = 3) {
  if (!Number.isFinite(n)) return '0';
  const s = n.toFixed(precision);
  const t = s.includes('.') ? s.replace(/\.?0+$/, '') : s;
  return t === '-0' ? '0' : t;
}

/** SVG transform attribute value, or `null` for the identity. */
export function toSvg(m, precision = 4) {
  if (isIdentity(m)) return null;
  if (isIdentity({ ...m, e: 0, f: 0 })) return `translate(${fmt(m.e, precision)} ${fmt(m.f, precision)})`;
  return `matrix(${[m.a, m.b, m.c, m.d, m.e, m.f].map((n) => fmt(n, precision + 2)).join(' ')})`;
}

// --- boxes -------------------------------------------------------------------------------

/** @returns {Box | null} */
export function boxOfPoints(points) {
  if (!points.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function boxCorners(box) {
  return [
    { x: box.x, y: box.y },
    { x: box.x + box.width, y: box.y },
    { x: box.x + box.width, y: box.y + box.height },
    { x: box.x, y: box.y + box.height },
  ];
}

/** Axis-aligned box around a transformed box. */
export function transformBox(m, box) {
  return boxOfPoints(boxCorners(box).map((p) => apply(m, p)));
}

/** Smallest box containing every non-null box given, or `null`. */
export function unionBoxes(boxes) {
  let out = null;
  for (const b of boxes) {
    if (!b) continue;
    if (!out) {
      out = { ...b };
      continue;
    }
    const x = Math.min(out.x, b.x);
    const y = Math.min(out.y, b.y);
    out = {
      x,
      y,
      width: Math.max(out.x + out.width, b.x + b.width) - x,
      height: Math.max(out.y + out.height, b.y + b.height) - y,
    };
  }
  return out;
}

export function boxContainsPoint(box, p, pad = 0) {
  return p.x >= box.x - pad && p.x <= box.x + box.width + pad && p.y >= box.y - pad && p.y <= box.y + box.height + pad;
}

export function boxContainsBox(outer, inner) {
  return (
    inner.x >= outer.x && inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height
  );
}

export function boxesIntersect(a, b) {
  return a.x <= b.x + b.width && b.x <= a.x + a.width && a.y <= b.y + b.height && b.y <= a.y + a.height;
}

/** Box from two corner points in any order. */
export function boxFromPoints(p, q) {
  return { x: Math.min(p.x, q.x), y: Math.min(p.y, q.y), width: Math.abs(p.x - q.x), height: Math.abs(p.y - q.y) };
}
