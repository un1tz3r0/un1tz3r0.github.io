// F22 — typed geometry attributes.
//
// Arbitrarily *named* and explicitly *typed* data attached to geometry, in the spirit of
// Blender's attribute domains and USD primvars. The point of the type is not storage
// width — it is **covariance**: how the value must behave when the geometry it rides on
// is transformed. Declare that a number is a length and every operation knows what to do
// with it, including for attributes this library has never heard of.
//
// ## Values are self-describing
//
// An attribute is `{type, value}` stored inline on the object it belongs to, rather than
// a bare value plus a registry that says what it means. Two reasons, both about the port:
//
// - A tagged union is exactly what maps to a Rust/C++ enum. A global mutable registry is
//   not, and would have to become ambient state in every target language.
// - `transformSegment(seg, m)` needs no external context. A segment carries everything
//   required to transform it correctly, which keeps the value model closed under copying
//   — the project's "always a copy" contract.
//
// ## Domains
//
// An attribute lives on a `path`, a `subpath`, or a `segment` — whichever object holds
// its `attrs` map. The `vertex` domain is deliberately absent: junctions have no object
// of their own yet, and inventing a home for them here would prejudge the vertex-model
// work (change B). Adding it later is additive.

import { EPS } from './tolerance.js';

// --- covariance classes ------------------------------------------------------------------

/** Unchanged by any map: ids, tags, colors, provenance. */
export const INVARIANT = 'invariant';
/** A length in path units. Scales by σ under a similarity; **undefined** under anisotropy. */
export const LENGTH = 'length';
/** An area in path units². Scales by |det| under *any* invertible affine. */
export const AREA = 'area';
/** A *subtended* angle (a difference of directions). Preserved by similarities only. */
export const ANGLE = 'angle';
/** An *absolute* direction in radians. Well defined under any invertible affine. */
export const DIRECTION = 'direction';
/** A position: maps by the full affine, translation included. */
export const POINT = 'point';
/** A displacement: maps by the linear part only. */
export const VECTOR = 'vector';
/** A surface normal: maps by the inverse transpose, not the linear part. */
export const NORMAL = 'normal';
/** A handedness, `'left'` or `'right'`. Flips under a mirror. */
export const SIDE = 'side';

export const TYPES = [
  INVARIANT,
  LENGTH,
  AREA,
  ANGLE,
  DIRECTION,
  POINT,
  VECTOR,
  NORMAL,
  SIDE,
];

// --- propagation through structural change -----------------------------------------------
//
// Separate from covariance: transforming geometry is not the same as *cutting* it. Only
// the two rules with real behaviour today are defined. Interpolating an attribute along a
// segment needs per-endpoint values, which needs the vertex domain — it arrives with
// change B rather than being guessed at now.

/** Both pieces of a split keep the value (the default). */
export const CONSTANT = 'constant';
/** The value is meaningless once the geometry is cut or rechained; drop it. */
export const DROP = 'drop';

export const PROPAGATIONS = [CONSTANT, DROP];

const SIDES = ['left', 'right'];

/**
 * Construct a typed attribute.
 * @param {string} type  one of `TYPES`
 * @param {*} value
 * @param {{propagate?: string}} [opts]  how it survives a cut/rechain (default `CONSTANT`)
 * @returns {{type:string, value:*, propagate:string}}
 */
export function attr(type, value, opts = {}) {
  if (!TYPES.includes(type)) {
    throw new TypeError(`attr: unknown type ${JSON.stringify(type)}`);
  }
  const propagate = opts.propagate ?? CONSTANT;
  if (!PROPAGATIONS.includes(propagate)) {
    throw new TypeError(`attr: unknown propagation ${JSON.stringify(propagate)}`);
  }
  if (type === SIDE && !SIDES.includes(value)) {
    throw new TypeError(`attr: a ${SIDE} attribute must be 'left' or 'right', got ${value}`);
  }
  if (type === POINT || type === VECTOR || type === NORMAL) {
    if (!value || typeof value.x !== 'number' || typeof value.y !== 'number') {
      throw new TypeError(`attr: a ${type} attribute must be a {x, y}`);
    }
  }
  if (type === LENGTH || type === AREA || type === ANGLE || type === DIRECTION) {
    if (typeof value !== 'number') {
      throw new TypeError(`attr: a ${type} attribute must be a number, got ${typeof value}`);
    }
  }
  return { type, value, propagate };
}

// Per-type shorthands. Namespaced on import (`Attr.length(4)`) so `length` does not
// collide with the SVG layer's length parser on the public surface.
export const invariant = (v, o) => attr(INVARIANT, v, o);
export const length = (v, o) => attr(LENGTH, v, o);
export const area = (v, o) => attr(AREA, v, o);
export const angle = (v, o) => attr(ANGLE, v, o);
export const direction = (v, o) => attr(DIRECTION, v, o);
export const point = (v, o) => attr(POINT, v, o);
export const vector = (v, o) => attr(VECTOR, v, o);
export const normal = (v, o) => attr(NORMAL, v, o);
export const side = (v, o) => attr(SIDE, v, o);

/** Is `x` a typed attribute? */
export function isAttr(x) {
  return !!x && typeof x === 'object' && TYPES.includes(x.type) && 'value' in x;
}

/**
 * The bare values of an `attrs` map, keyed by name — for callers that want to read data
 * without unwrapping every entry.
 * @param {object} attrs
 * @returns {object}
 */
export function valuesOf(attrs) {
  const out = {};
  if (!attrs) return out;
  for (const [k, a] of Object.entries(attrs)) out[k] = isAttr(a) ? a.value : a;
  return out;
}

/**
 * Attach attributes to a value object, merging with any it already carries. Returns a
 * copy — inputs are never mutated. `undefined` as a value removes that attribute.
 * @param {object} obj  any object with an `attrs` map (segment, subpath, path)
 * @param {object} attrs  name → attribute
 * @returns {object} a new object
 */
export function withAttrs(obj, attrs) {
  const merged = { ...(obj.attrs ?? {}) };
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === undefined) delete merged[k];
    else if (!isAttr(v)) throw new TypeError(`withAttrs: ${k} is not a typed attribute`);
    else merged[k] = v;
  }
  const out = { ...obj };
  if (Object.keys(merged).length === 0) delete out.attrs;
  else out.attrs = merged;
  return out;
}

/** An object's attributes, or an empty map. */
export function attrsOf(obj) {
  return obj.attrs ?? {};
}

/**
 * The conventional `origin` provenance value — what operation produced this geometry —
 * or `undefined`. The one attribute the library reads about itself, and the reason the
 * F10 detectors can tell a generated fillet from a linearization artifact.
 * @param {object} obj  segment, subpath or path
 * @returns {string|undefined}
 */
export function originOf(obj) {
  const a = attrsOf(obj).origin;
  return a === undefined ? undefined : a.value;
}

/**
 * Merge caller-supplied `outAttrs` **underneath** an object's own attributes, so an
 * operation's provenance always wins on a key collision — it describes what actually
 * happened, and a caller tag must not overwrite it.
 *
 * This is the mechanism behind every producer's `{outAttrs}` option: "set these on the
 * geometry you create or alter".
 *
 * @param {object} obj  segment, subpath or path
 * @param {object|undefined} outAttrs
 * @returns {object} `obj` unchanged when there is nothing to add, else a copy
 */
export function tagOutput(obj, outAttrs) {
  if (!outAttrs || Object.keys(outAttrs).length === 0) return obj;
  for (const [k, v] of Object.entries(outAttrs)) {
    if (!isAttr(v)) throw new TypeError(`outAttrs: ${k} is not a typed attribute`);
  }
  return { ...obj, attrs: { ...outAttrs, ...(obj.attrs ?? {}) } };
}

/** `tagOutput` across a list of segments. */
export function tagOutputAll(segs, outAttrs) {
  if (!outAttrs || Object.keys(outAttrs).length === 0) return segs;
  return segs.map((seg) => tagOutput(seg, outAttrs));
}

/** `tagOutput` across every segment of a path. Returns the input when there is nothing to do. */
export function tagOutputPath(pth, outAttrs) {
  if (!outAttrs || Object.keys(outAttrs).length === 0) return pth;
  return {
    ...pth,
    subpaths: pth.subpaths.map((sp) => ({ ...sp, segments: tagOutputAll(sp.segments, outAttrs) })),
  };
}

/**
 * Apply the `DROP` propagation rule — used by operations that cut or rechain geometry,
 * where a value describing the original shape no longer describes the piece.
 * @param {object|undefined} attrs
 * @returns {object|undefined}
 */
export function propagateThroughCut(attrs) {
  if (!attrs) return undefined;
  const out = {};
  for (const [k, a] of Object.entries(attrs)) {
    if (a.propagate !== DROP) out[k] = a;
  }
  return Object.keys(out).length === 0 ? undefined : out;
}

/**
 * Flip a `side` value. Exposed because mirroring is not the only thing that swaps
 * handedness — reversing a subpath's direction does too.
 */
export function flipSide(v) {
  return v === 'left' ? 'right' : 'left';
}

// Canonical angle in (−π, π]. Adding π and calling atan2 would work mathematically but
// returns −π for a reversed 0 direction, because IEEE atan2(−0, −1) picks the negative
// branch; wrapping arithmetically keeps the value canonical and the corpus exact.
function wrapToPi(a) {
  const TAU = 2 * Math.PI;
  let x = (((a + Math.PI) % TAU) + TAU) % TAU - Math.PI;
  if (x === -Math.PI) x = Math.PI;
  return x;
}

/**
 * Re-express attributes for geometry whose direction of travel has been reversed.
 *
 * Only two classes are defined *relative to travel* and therefore must change: `side`
 * (left and right swap) and `direction` (rotates by π). Everything else is left alone,
 * deliberately — a stored `normal` or `vector` may or may not be travel-relative, and
 * this cannot know which. Callers that mean "the curve's normal here" should recompute
 * it rather than storing it.
 *
 * @param {object|undefined} attrs
 * @returns {object|undefined}
 */
export function reverseAttributes(attrs) {
  if (!attrs) return undefined;
  const out = {};
  for (const [k, a] of Object.entries(attrs)) {
    if (a.type === SIDE) out[k] = { ...a, value: flipSide(a.value) };
    else if (a.type === DIRECTION) out[k] = { ...a, value: wrapToPi(a.value + Math.PI) };
    else out[k] = a;
  }
  return out;
}

// Guard against a degenerate similarity factor sneaking into a scale.
export function assertFiniteScale(s, what) {
  if (!Number.isFinite(s) || Math.abs(s) < EPS) {
    throw new RangeError(`attributes: cannot scale ${what} by ${s}`);
  }
  return s;
}
