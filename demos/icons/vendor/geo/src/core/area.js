// F8 part 1 — exact signed area of a path.
//
// Green's theorem turns the area integral into a boundary walk: for a closed curve,
//
//     A = ½ ∮ (x dy − y dx)
//
// Each segment contributes ½∫₀¹ (x·y′ − y·x′) dt, which is a polynomial integral in
// closed form for lines and Béziers, and an elementary one for elliptical arcs. Nothing
// is flattened, so the result is exact rather than tolerance-limited.
//
// Sign follows orientation: counter-clockwise is positive in a y-up frame (and, since
// SVG's y axis points down, clockwise is positive on screen — orientation is relative,
// which is all the callers here care about). A hole wound opposite its outer loop
// subtracts, so the signed sum over a well-oriented path is its filled area.
//
// Subpaths are implicitly closed, matching SVG fill semantics and `windingAt`: an open
// subpath contributes as if its closing chord were drawn.

import { LINE, QUAD, CUBIC, ARC, startPoint, endPoint } from './segment.js';
import { arcCenter } from './arc.js';

// Twice the signed area swept by the chord from the origin — the ½(x₀y₁ − x₁y₀) term
// that every segment's contribution is measured against.
function cross2(p, q) {
  return p.x * q.y - p.y * q.x;
}

// Line: the triangle formed with the origin.
function lineArea(seg) {
  return 0.5 * cross2(seg.p0, seg.p1);
}

// Quadratic Bézier. Expanding ½∫(x y′ − y x′) dt for the Bernstein form and collecting
// terms gives a symmetric combination of the three control points' pairwise crosses.
function quadArea(seg) {
  const { p0, p1, p2 } = seg;
  return (cross2(p0, p1) + cross2(p1, p2) + 0.5 * cross2(p0, p2)) / 3;
}

// Cubic Bézier, same derivation one degree up (the classic closed form; see e.g.
// Sederberg, *Computer Aided Geometric Design*, on Bézier area integrals).
function cubicArea(seg) {
  const { p0, p1, p2, p3 } = seg;
  return (
    (6 * cross2(p0, p1) +
      3 * cross2(p1, p2) +
      6 * cross2(p2, p3) +
      3 * cross2(p0, p2) +
      3 * cross2(p1, p3) +
      cross2(p0, p3)) /
    20
  );
}

// Elliptical arc. Split the point into center + offset, P(t) = C + Q(t). Since C is
// constant, P′ = Q′ and the integrand separates:
//
//   ½∫(x y′ − y x′) dt = ½∫(qx qy′ − qy qx′) dt + ½[Cx·Δqy − Cy·Δqx]
//                      = ½·rx·ry·Δθ            + ½·cross(C, P₁ − P₀)
//
// The first term is the sector swept about the center (the rotation φ drops out — it is
// a rigid motion); the second is the triangle the center makes with the chord.
function arcArea(seg) {
  const c = arcCenter(seg);
  const chord = { x: seg.p1.x - seg.p0.x, y: seg.p1.y - seg.p0.y };
  return 0.5 * c.rx * c.ry * c.dtheta + 0.5 * cross2({ x: c.cx, y: c.cy }, chord);
}

/**
 * Exact signed area contributed by one segment to Green's boundary integral — the area
 * swept by the ray from the origin as the segment is traversed.
 * @param {object} seg
 * @returns {number}
 */
export function segmentArea(seg) {
  switch (seg.type) {
    case LINE:
      return lineArea(seg);
    case QUAD:
      return quadArea(seg);
    case CUBIC:
      return cubicArea(seg);
    case ARC:
      return arcArea(seg);
    default:
      throw new TypeError(`segmentArea: unknown segment type ${seg && seg.type}`);
  }
}

/**
 * Exact signed area of a subpath. The subpath is implicitly closed (SVG fill semantics):
 * an open subpath contributes as though its closing chord were drawn.
 * @param {object} sp  Subpath
 * @returns {number}
 */
export function subpathArea(sp) {
  if (sp.segments.length === 0) return 0;
  let sum = 0;
  for (const seg of sp.segments) sum += segmentArea(seg);
  // The implicit chord back to the start, whether or not `closed` is set.
  const first = startPoint(sp.segments[0]);
  const last = endPoint(sp.segments[sp.segments.length - 1]);
  sum += 0.5 * cross2(last, first);
  return sum;
}

/**
 * Exact signed area of a path — the sum over its subpaths.
 *
 * Positive for counter-clockwise traversal in a y-up frame. A hole wound opposite its
 * outer loop subtracts, so for a consistently oriented path (what the boolean engine
 * emits) this *is* the filled area. It is not a fill-rule-aware measure: a path whose
 * loops overlap in the same direction counts the overlap twice, exactly as the nonzero
 * winding number does. Take `Math.abs` when only magnitude matters.
 *
 * @param {object} pth  Path
 * @returns {number}
 */
export function pathArea(pth) {
  let sum = 0;
  for (const sp of pth.subpaths) sum += subpathArea(sp);
  return sum;
}

// --- interior side (F22, resolves open decision D-B) -------------------------------------
//
// Which side of a subpath was the *inside*. For a closed subpath this is derivable —
// signed area gives the orientation, and the left normal points inward exactly when the
// boundary runs counter-clockwise. For an **open** subpath it is not derivable at all:
// winding says nothing about an open curve, so once an operation opens a closed path the
// fact is lost unless it is carried.
//
// It is carried as a typed attribute rather than in `meta`, deliberately. `meta` is
// documented as advisory and is stripped wholesale by the boolean engine and `cutPath`,
// which is exactly where this must survive; and as a `side`-typed attribute it flips
// under a mirror by construction, which is the rule a hand-written field forgets.

import { SIDE, side as sideAttr, withAttrs, attrsOf } from './attributes.js';

/** Conventional attribute name for the interior side of a subpath. */
export const INTERIOR_SIDE = 'interiorSide';

/**
 * Which side of the subpath its interior lies on: `'left'`, `'right'`, or `null` when
 * unknown (an open subpath carrying no attribute).
 *
 * A closed subpath answers from its own orientation and ignores any stored attribute —
 * the geometry is the ground truth, and a stale tag must not override it.
 *
 * @param {object} sp  Subpath
 * @returns {'left'|'right'|null}
 */
export function interiorSideOf(sp) {
  if (sp.segments.length === 0) return null;
  if (sp.closed) {
    const a = subpathArea(sp);
    if (a === 0) return null;
    // Left normal is perp = +90° CCW, so a CCW boundary (positive area) has its interior
    // on the left.
    return a > 0 ? 'left' : 'right';
  }
  const stored = attrsOf(sp)[INTERIOR_SIDE];
  return stored && stored.type === SIDE ? stored.value : null;
}

/**
 * Tag a subpath's interior side. Used by operations that open a closed path, so the
 * information survives the loss of closure.
 * @param {object} sp  Subpath
 * @param {'left'|'right'|null} value  `null` removes the tag
 * @returns {object} a new Subpath
 */
export function withInteriorSide(sp, value) {
  return withAttrs(sp, { [INTERIOR_SIDE]: value === null ? undefined : sideAttr(value) });
}

/**
 * Carry the interior side of `from` onto `to` — for an operation that produces open
 * geometry from a (possibly closed) input. A no-op when the source side is unknown.
 * @returns {object} a new Subpath
 */
export function inheritInteriorSide(to, from) {
  const s = interiorSideOf(from);
  return s === null ? to : withInteriorSide(to, s);
}

/**
 * The sign of the offset distance that moves *outward* (away from the interior), or
 * `null` when the interior side is unknown.
 *
 * Positive offset displaces along the left normal, so outward is +1 when the interior is
 * on the right and −1 when it is on the left.
 * @param {object} sp  Subpath
 * @returns {1|-1|null}
 */
export function outwardSign(sp) {
  const s = interiorSideOf(sp);
  if (s === null) return null;
  return s === 'left' ? -1 : 1;
}
