// The SVG document entry point and its coordinate-space API.
//
// Everything here composes the pieces below it: `dom` → `css` → `tree` → `shapes`, with
// F14 doing the coordinate algebra. The one idea worth stating is that mapping between
// two elements under different parents needs no new machinery at all — it is
// `inverse(toViewBox(B)) ∘ toViewBox(A)`, which falls straight out of having real affines.
//
// Length metadata rides the F22 covariance rules automatically: a stroke width carried as
// a typed `length` rescales under a similarity and is dropped under a non-uniform
// `preserveAspectRatio="none"` viewport, because no scalar is correct there.

import { parseSVG } from './dom.js';
import { resolveTree, collectStylesheets, SHAPES } from './tree.js';
import { shapeToPathWithProvenance } from './shapes.js';
import { compose, invert, applyPoint, transformPath, classify } from '../core/affine.js';

/**
 * Parse SVG source into a resolved document.
 *
 * @param {string} source
 * @param {{width?: number, height?: number}} [opts]  the viewport to fit the root into;
 *   omitted means the viewBox's own extent, which makes the root transform the identity —
 *   i.e. "give me viewBox coordinates", the useful default for a geometry library.
 * @returns {{root, viewBox, width, height, instances, rules}}
 */
export function parseDocument(source, opts = {}) {
  const root = parseSVG(source);
  const rules = collectStylesheets(root);
  const tree = resolveTree(root, { ...opts, rules });
  return { ...tree, rules };
}

/**
 * Every drawable in the document, as a Path in **root viewBox coordinates**.
 *
 * One entry per *instance*, so an element used six times yields six paths — each already
 * transformed, each carrying its own computed style. Shapes the spec disables (zero
 * radius, zero extent, dangling reference) contribute nothing.
 *
 * @param {object} doc  from `parseDocument`
 * @param {{transform?: boolean}} [opts]  `transform: false` leaves paths in their own
 *   user units, with the instance transform available on each result
 * @returns {{key, element, tag, path, style, transform, viewport}[]}
 */
export function documentPaths(doc, opts = {}) {
  const out = [];
  for (const inst of doc.instances) {
    if (!SHAPES.has(inst.tag)) continue;
    const local = shapeToPathWithProvenance(inst.element, {
      viewport: inst.viewport,
      style: inst.style,
      key: inst.key,
    });
    if (local.subpaths.length === 0) continue;
    const pth = opts.transform === false ? local : transformPath(local, inst.transform);
    out.push({
      key: inst.key,
      element: inst.element,
      tag: inst.tag,
      path: pth,
      style: inst.style,
      transform: inst.transform,
      viewport: inst.viewport,
    });
  }
  return out;
}

// --- coordinate spaces -----------------------------------------------------------------------

/**
 * The transform from an instance's own user units **to** root viewBox coordinates.
 * @param {object} instance
 * @returns {object} affine
 */
export function toViewBox(instance) {
  return instance.transform;
}

/**
 * The inverse: root viewBox coordinates **to** an instance's own user units.
 * @throws {RangeError} if the instance's transform is singular (a collapsed viewport)
 */
export function fromViewBox(instance) {
  return invert(instance.transform);
}

/**
 * The transform from instance `a`'s coordinate system into instance `b`'s — the
 * "different parents" case. Composition of A's map to viewBox with B's map back.
 * @throws {RangeError} if `b`'s transform is singular
 */
export function between(a, b) {
  return compose(invert(b.transform), a.transform);
}

/** A point in `instance` units → root viewBox coordinates. */
export function pointToViewBox(instance, p) {
  return applyPoint(toViewBox(instance), p);
}

/** A point in root viewBox coordinates → `instance` units. */
export function pointFromViewBox(instance, p) {
  return applyPoint(fromViewBox(instance), p);
}

/**
 * A path in `instance` units → root viewBox coordinates. Typed length attributes rescale
 * or drop per F22; pass `{meta:'keep'}` to bypass that.
 */
export function pathToViewBox(instance, pth, opts = {}) {
  return transformPath(pth, toViewBox(instance), opts);
}

/** A path in root viewBox coordinates → `instance` units. */
export function pathFromViewBox(instance, pth, opts = {}) {
  return transformPath(pth, fromViewBox(instance), opts);
}

/** A point expressed in `a`'s units, re-expressed in `b`'s. */
export function pointBetween(a, b, p) {
  return applyPoint(between(a, b), p);
}

/** A path expressed in `a`'s units, re-expressed in `b`'s. */
export function pathBetween(a, b, pth, opts = {}) {
  return transformPath(pth, between(a, b), opts);
}

/**
 * How an instance's coordinate system relates to the root viewBox — the F14
 * classification of its effective transform, which answers "is this instance
 * shape-preserving?" and "is it mirrored?".
 * @param {object} instance
 * @returns {object} see `classify`
 */
export function instanceSpace(instance) {
  return classify(instance.transform);
}
