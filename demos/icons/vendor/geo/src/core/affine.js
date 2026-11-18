// Affine transforms — the 2×3 matrix value type and its action on geometry.
//
// Convention is SVG's `matrix(a b c d e f)`, the same one `raster/edges.js` already
// speaks:
//
//     x' = a·x + c·y + e
//     y' = b·x + d·y + f
//
// so the linear part is the column-major 2×2 `L = [[a, c], [b, d]]` (first column
// `(a, b)` is the image of +x, second column `(c, d)` the image of +y) and `(e, f)` is
// the translation. Storing it flat as six numbers rather than nested arrays keeps the
// port to the other target languages a plain struct.
//
// Every SVG `transform` production — matrix/translate/scale/rotate/skewX/skewY — is
// affine, and so is every composition of them; nothing in an SVG coordinate chain can be
// projective. The useful question is therefore never "is this affine?" but *which kind*
// of affine it is, which `classify` answers from the singular values of L.
//
// True segment types are preserved: the image of an ellipse under an affine map is an
// ellipse, so arcs transform to arcs (see `transformArc`) rather than degrading to
// cubics. That matters because F5 offset fidelity and F7's concentric-arc nearest case
// depend on real arc geometry.

import { vec2 } from './vec2.js';
import { line, quad, cubic, arc, withMeta, LINE, QUAD, CUBIC, ARC } from './segment.js';
import { arcCenter } from './arc.js';
import { subpath, path } from './path.js';
import { eq, EPS } from './tolerance.js';
import * as Attrs from './attributes.js';

/**
 * Construct an affine transform.
 * @returns {{a:number,b:number,c:number,d:number,e:number,f:number}}
 */
export function affine(a, b, c, d, e, f) {
  return { a, b, c, d, e, f };
}

export const IDENTITY = affine(1, 0, 0, 1, 0, 0);

/** Translation by (tx, ty). */
export function translation(tx, ty) {
  return affine(1, 0, 0, 1, tx, ty);
}

/** Scale by (sx, sy); `sy` defaults to `sx` (uniform). */
export function scaling(sx, sy = sx) {
  return affine(sx, 0, 0, sy, 0, 0);
}

/** Rotation by `angle` radians about `center` (default: the origin). */
export function rotation(angle, center) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  if (center === undefined) return affine(cos, sin, -sin, cos, 0, 0);
  return affine(
    cos,
    sin,
    -sin,
    cos,
    center.x - cos * center.x + sin * center.y,
    center.y - sin * center.x - cos * center.y,
  );
}

/** Skew along x by `angle` radians (SVG `skewX`). */
export function skewX(angle) {
  return affine(1, 0, Math.tan(angle), 1, 0, 0);
}

/** Skew along y by `angle` radians (SVG `skewY`). */
export function skewY(angle) {
  return affine(1, Math.tan(angle), 0, 1, 0, 0);
}

/**
 * Matrix product `outer · inner` — the transform that applies `inner` first:
 * `applyPoint(compose(m, n), p)` equals `applyPoint(m, applyPoint(n, p))`.
 *
 * This is the order SVG nesting reads in: a child's effective transform is
 * `compose(parentTransform, childTransform)`.
 */
export function compose(outer, inner) {
  return affine(
    outer.a * inner.a + outer.c * inner.b,
    outer.b * inner.a + outer.d * inner.b,
    outer.a * inner.c + outer.c * inner.d,
    outer.b * inner.c + outer.d * inner.d,
    outer.a * inner.e + outer.c * inner.f + outer.e,
    outer.b * inner.e + outer.d * inner.f + outer.f,
  );
}

/**
 * Compose a list outermost-first: `composeAll([m1, m2, m3])` applies m3, then m2, then
 * m1 — i.e. the order the transforms appear walking *down* an SVG tree from the root.
 * An empty list is the identity.
 */
export function composeAll(ms) {
  let out = IDENTITY;
  for (const m of ms) out = compose(out, m);
  return out;
}

/** Determinant of the linear part. Signed: negative means the map includes a mirror. */
export function determinant(m) {
  return m.a * m.d - m.b * m.c;
}

/** Is the map invertible (non-singular and finite)? */
export function isInvertible(m) {
  const det = determinant(m);
  return Number.isFinite(det) && Math.abs(det) > EPS * Math.max(1, maxAbs(m));
}

function maxAbs(m) {
  return Math.max(Math.abs(m.a), Math.abs(m.b), Math.abs(m.c), Math.abs(m.d));
}

/**
 * The inverse transform. Throws on a singular (rank-deficient) map rather than returning
 * a matrix full of infinities — a collapsed coordinate system has no inverse and callers
 * that silently propagated one would produce nonsense far from the failure.
 * @throws {RangeError} if the map is not invertible
 */
export function invert(m) {
  const det = determinant(m);
  if (!isInvertible(m)) {
    throw new RangeError(`affine.invert: matrix is singular (determinant ${det})`);
  }
  return affine(
    m.d / det,
    -m.b / det,
    -m.c / det,
    m.a / det,
    (m.c * m.f - m.d * m.e) / det,
    (m.b * m.e - m.a * m.f) / det,
  );
}

/** Transform a point (translation included). */
export function applyPoint(m, p) {
  return vec2(m.a * p.x + m.c * p.y + m.e, m.b * p.x + m.d * p.y + m.f);
}

/**
 * Transform a *vector* — the linear part only, no translation. This is how tangents and
 * displacements map.
 */
export function applyVector(m, v) {
  return vec2(m.a * v.x + m.c * v.y, m.b * v.x + m.d * v.y);
}

/**
 * Transform a *normal*. Normals are covectors: they map by the inverse transpose of the
 * linear part, not by the linear part itself. Under a non-uniform scale the two differ —
 * pushing a normal through `applyVector` would tilt it off the transformed surface.
 * The result is normalized (a normal has no meaningful length).
 * @throws {RangeError} if the map is not invertible
 */
export function applyNormal(m, n) {
  const inv = invert(m);
  // inverse-transpose of the linear part
  const x = inv.a * n.x + inv.b * n.y;
  const y = inv.c * n.x + inv.d * n.y;
  const l = Math.hypot(x, y);
  return l === 0 ? vec2(0, 0) : vec2(x / l, y / l);
}

/**
 * Singular values [σ₁, σ₂] of the linear part, σ₁ ≥ σ₂ ≥ 0 — the maximum and minimum
 * stretch factors over all input directions. Everything `classify` decides comes from
 * these two numbers.
 */
export function singularValues(m) {
  // Eigenvalues of LᵀL = [[s1, s3], [s3, s2]].
  const s1 = m.a * m.a + m.b * m.b;
  const s2 = m.c * m.c + m.d * m.d;
  const s3 = m.a * m.c + m.b * m.d;
  const tr = s1 + s2;
  const det2 = s1 * s2 - s3 * s3;
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det2));
  return [Math.sqrt(Math.max(0, tr / 2 + disc)), Math.sqrt(Math.max(0, tr / 2 - disc))];
}

/**
 * Classify the map. `kind` is the narrowest class that fits:
 *
 * - `'identity'`    — no change at all
 * - `'translation'` — linear part is the identity
 * - `'rigid'`       — an isometry: rotation (and/or mirror) plus translation, σ₁ = σ₂ = 1
 * - `'similarity'`  — **shape-preserving**: σ₁ = σ₂, i.e. uniform scale, angles preserved
 * - `'affine'`      — general: anisotropic scale and/or skew, angles not preserved
 * - `'degenerate'`  — singular: collapses the plane onto a line or a point
 *
 * `mirror` is orientation reversal (negative determinant) and is reported independently,
 * because a mirrored map can still be rigid or a similarity.
 *
 * @returns {{kind:string, mirror:boolean, degenerate:boolean, determinant:number,
 *            singularValues:[number,number], anisotropy:number, scale:(number|null)}}
 *          `scale` is the uniform factor for a similarity, `null` otherwise.
 */
export function classify(m) {
  const det = determinant(m);
  const [s1, s2] = singularValues(m);
  const degenerate = !(Math.abs(det) > EPS * Math.max(1, maxAbs(m)));
  const similar = !degenerate && eq(s1, s2);
  const mirror = det < 0;

  let kind;
  if (degenerate) kind = 'degenerate';
  else if (!similar) kind = 'affine';
  else if (!eq(s1, 1)) kind = 'similarity';
  else if (!mirror && eq(m.a, 1) && eq(m.b, 0) && eq(m.c, 0) && eq(m.d, 1)) {
    kind = eq(m.e, 0) && eq(m.f, 0) ? 'identity' : 'translation';
  } else kind = 'rigid';

  return {
    kind,
    mirror,
    degenerate,
    determinant: det,
    singularValues: [s1, s2],
    anisotropy: s2 === 0 ? Infinity : s1 / s2,
    scale: similar ? s1 : null,
  };
}

/**
 * Does the map preserve shape (angles and length *ratios*)? True for similarities —
 * translation, rotation, uniform scale, mirror, and compositions of them.
 */
export function isShapePreserving(m) {
  return classify(m).scale !== null;
}

/**
 * Structural validity: all six entries finite. Named for symmetry with the question
 * callers actually ask, but note that a 2×3 matrix is affine *by construction* — this
 * cannot return false because of the map's shape, only because of NaN/∞ entries.
 * Use `classify` to distinguish similarity from general affine.
 */
export function isAffine(m) {
  return (
    Number.isFinite(m.a) &&
    Number.isFinite(m.b) &&
    Number.isFinite(m.c) &&
    Number.isFinite(m.d) &&
    Number.isFinite(m.e) &&
    Number.isFinite(m.f)
  );
}

// --- untyped `meta` under transform -----------------------------------------------------
//
// Carried verbatim, never rescaled. An untyped number cannot be transformed correctly —
// that is the whole thesis of F22, and the reason the old hardcoded `LENGTH_META_KEYS`
// list was removed rather than extended: it could only ever guess right for the six key
// names it knew, and guessed silently wrong for every other producer. Callers who want a
// value to track the geometry declare its covariance with a typed attribute.

// --- typed attributes under transform (F22) ----------------------------------------------
//
// The covariance class *is* the rule. One switch, one place — which is the whole argument
// for the design: a bespoke `meta` special case scattered through thirty producers does
// not transpile to the other target languages, and this does.
//
// Two results here are easy to get wrong by hand and fall out for free from typing:
// an **area** is well defined under *any* invertible affine (it scales by |det|, no
// similarity requirement, unlike a length), and a **side** flips under a mirror — without
// which a reflected path would offset inward where it used to offset outward.

/**
 * Transform one typed attribute. Returns `undefined` when the map destroys the value's
 * meaning — a length under anisotropy has no correct scalar image, and inventing one
 * would be trusted downstream.
 * @param {{type:string, value:*}} a
 * @param {object} m  affine
 * @param {object} [cls]  precomputed `classify(m)`, to avoid redoing it per attribute
 * @returns {object|undefined}
 */
export function transformAttribute(a, m, cls = classify(m)) {
  switch (a.type) {
    case Attrs.INVARIANT:
      return a;
    case Attrs.LENGTH:
      // Only a similarity has a single stretch factor. Under anisotropy the offset disc
      // that a length describes maps to an ellipse; no scalar is right.
      return cls.scale === null ? undefined : { ...a, value: a.value * cls.scale };
    case Attrs.AREA:
      // Areas need no similarity: every affine multiplies area by |det| exactly.
      return { ...a, value: a.value * Math.abs(cls.determinant) };
    case Attrs.ANGLE:
      // A subtended angle survives a similarity (mirrored, its sign flips) but not a
      // skew or anisotropic scale, which change angles non-uniformly.
      if (cls.scale === null) return undefined;
      return cls.mirror ? { ...a, value: -a.value } : a;
    case Attrs.DIRECTION: {
      // An absolute direction is a vector's angle, and a vector maps under any
      // invertible affine — so this one never needs dropping.
      const v = applyVector(m, vec2(Math.cos(a.value), Math.sin(a.value)));
      return { ...a, value: Math.atan2(v.y, v.x) };
    }
    case Attrs.POINT:
      return { ...a, value: applyPoint(m, a.value) };
    case Attrs.VECTOR:
      return { ...a, value: applyVector(m, a.value) };
    case Attrs.NORMAL:
      return { ...a, value: applyNormal(m, a.value) };
    case Attrs.SIDE:
      return cls.mirror ? { ...a, value: Attrs.flipSide(a.value) } : a;
    default:
      throw new TypeError(`transformAttribute: unknown type ${a && a.type}`);
  }
}

/**
 * Transform an `attrs` map, dropping the entries the map destroys and recording which.
 * @param {object|undefined} attrs
 * @param {object} m  affine
 * @param {object} [cls]  precomputed `classify(m)`
 * @returns {{attrs: object|undefined, dropped: string[]}}
 */
export function transformAttributes(attrs, m, cls = classify(m)) {
  if (!attrs) return { attrs: undefined, dropped: [] };
  const out = {};
  const dropped = [];
  for (const [k, a] of Object.entries(attrs)) {
    const mapped = transformAttribute(a, m, cls);
    if (mapped === undefined) dropped.push(k);
    else out[k] = mapped;
  }
  return { attrs: Object.keys(out).length ? out : undefined, dropped };
}

// --- geometry ---------------------------------------------------------------------------

// 2×2 symmetric eigendecomposition, closed form. Returns the larger eigenvalue first
// together with the angle of its eigenvector.
function symmetricEigen(A, B, C) {
  const tr = A + C;
  const disc = Math.sqrt(Math.max(0, ((A - C) / 2) * ((A - C) / 2) + B * B));
  const l1 = tr / 2 + disc;
  const l2 = tr / 2 - disc;
  // Eigenvector for l1. Both rows of (S − l1·I) are proportional to it (rotated 90°);
  // pick the better-conditioned one.
  let vx;
  let vy;
  if (Math.abs(B) > EPS * Math.max(1, Math.abs(A), Math.abs(C))) {
    vx = l1 - C;
    vy = B;
  } else {
    // Already diagonal: the axes are the eigenvectors.
    vx = A >= C ? 1 : 0;
    vy = A >= C ? 0 : 1;
  }
  return { l1, l2: Math.max(0, l2), angle: Math.atan2(vy, vx) };
}

/**
 * Transform an elliptical arc, exactly, as an arc.
 *
 * An ellipse is `C + M·(cos θ, sin θ)` with `M = R(φ)·diag(rx, ry)`; under a linear map L
 * it becomes `L·C + (L·M)·(cos θ, sin θ)`, still an ellipse. The image depends on `L·M`
 * only through `(L·M)(L·M)ᵀ`, so eigendecomposing that symmetric matrix recovers the
 * canonical `rx' ≥ ry'` and `φ'` directly, with no SVD sign bookkeeping.
 *
 * The right-hand factor absorbed by that step is a pure reparameterization of θ, which
 * shifts (or reflects) the parameter without changing how far it travels — so `largeArc`
 * is preserved exactly, and `sweep` flips precisely when the map reverses orientation.
 */
export function transformArc(seg, m) {
  const c = arcCenter(seg);
  const cosP = Math.cos(c.phi);
  const sinP = Math.sin(c.phi);
  // M = R(phi)·diag(rx, ry), column-major like the transform itself.
  const m11 = c.rx * cosP;
  const m21 = c.rx * sinP;
  const m12 = -c.ry * sinP;
  const m22 = c.ry * cosP;
  // L·M
  const n11 = m.a * m11 + m.c * m21;
  const n21 = m.b * m11 + m.d * m21;
  const n12 = m.a * m12 + m.c * m22;
  const n22 = m.b * m12 + m.d * m22;
  // S = (L·M)(L·M)ᵀ — symmetric, eigenvalues are the squared radii.
  const S11 = n11 * n11 + n12 * n12;
  const S12 = n11 * n21 + n12 * n22;
  const S22 = n21 * n21 + n22 * n22;
  const { l1, l2, angle } = symmetricEigen(S11, S12, S22);

  return arc(
    applyPoint(m, seg.p0),
    applyPoint(m, seg.p1),
    Math.sqrt(l1),
    Math.sqrt(l2),
    angle,
    seg.largeArc,
    determinant(m) < 0 ? !seg.sweep : seg.sweep,
  );
}

/**
 * Transform a segment, preserving its true type. Béziers are affine-invariant, so lines,
 * quads and cubics map by their control points; arcs go through `transformArc`.
 *
 * @param {object} seg
 * @param {object} m
 * @param {{meta?: 'auto'|'keep'|'drop'}} [opts] how to carry advisory `meta`.
 *   `'auto'` (default) scales length-valued fields under a similarity and drops them
 *   otherwise; `'keep'` passes meta through untouched; `'drop'` strips it.
 * @throws {RangeError} if the map is singular (a collapsed path has no segment types left)
 */
export function transformSegment(seg, m, opts = {}) {
  if (!isInvertible(m)) {
    throw new RangeError(
      `affine.transformSegment: matrix is singular (determinant ${determinant(m)}) — ` +
        'the path would collapse to a line and its segment types are no longer meaningful',
    );
  }
  const P = (p) => applyPoint(m, p);
  let out;
  switch (seg.type) {
    case LINE:
      out = line(P(seg.p0), P(seg.p1));
      break;
    case QUAD:
      out = quad(P(seg.p0), P(seg.p1), P(seg.p2));
      break;
    case CUBIC:
      out = cubic(P(seg.p0), P(seg.p1), P(seg.p2), P(seg.p3));
      break;
    case ARC:
      out = transformArc(seg, m);
      break;
    default:
      throw new TypeError(`transformSegment: unknown segment type ${seg && seg.type}`);
  }
  const mode = opts.meta ?? 'auto';

  // Typed attributes (F22): each carries its own covariance class, so this needs no
  // per-key knowledge and works for attributes this library has never seen.
  if (seg.attrs !== undefined && mode !== 'drop') {
    const next =
      mode === 'keep' ? seg.attrs : transformAttributes(seg.attrs, m, classify(m)).attrs;
    if (next !== undefined) out.attrs = next;
  }

  // Untyped `meta` rides along verbatim (never rescaled — see above) or is dropped.
  if (seg.meta === undefined || mode === 'drop') return out;
  return withMeta(out, seg.meta);
}

/** Transform every segment of a subpath, preserving `closed` and its own attributes. */
export function transformSubpath(sp, m, opts = {}) {
  const out = subpath(
    sp.segments.map((seg) => transformSegment(seg, m, opts)),
    { closed: sp.closed },
  );
  const mode = opts.meta ?? 'auto';
  if (sp.attrs !== undefined && mode !== 'drop') {
    const next = mode === 'keep' ? sp.attrs : transformAttributes(sp.attrs, m, classify(m)).attrs;
    if (next !== undefined) out.attrs = next;
  }
  return out;
}

/**
 * Transform a path. The fill rule is preserved — a mirror reverses every subpath's
 * orientation together, so nonzero winding is unaffected.
 *
 * @param {object} pth
 * @param {object} m
 * @param {{meta?: 'auto'|'keep'|'drop'}} [opts]
 */
export function transformPath(pth, m, opts = {}) {
  const out = path(
    pth.subpaths.map((sp) => transformSubpath(sp, m, opts)),
    { fillRule: pth.fillRule },
  );
  const mode = opts.meta ?? 'auto';
  if (pth.attrs !== undefined && mode !== 'drop') {
    const next = mode === 'keep' ? pth.attrs : transformAttributes(pth.attrs, m, classify(m)).attrs;
    if (next !== undefined) out.attrs = next;
  }
  return Attrs.tagOutputPath(out, opts.outAttrs);
}
