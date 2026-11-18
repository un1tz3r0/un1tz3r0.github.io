// Resolving a document into a flattened **instance tree**.
//
// The structural point of this module: `<use>` and `<symbol>` make the element→transform
// relation one-to-*many*. The same `<rect>` can appear at six places under six different
// effective transforms and six different computed styles. So the output is one node per
// *instance*, keyed by its reference chain — not a map from elements to matrices, which
// could only ever record one of the six.
//
// Everything else here is bookkeeping the SVG spec requires:
//
// - `<defs>`, `<symbol>`, `<marker>`, `<clipPath>`, `<mask>`, `<pattern>`, gradients and
//   metadata are never rendered where they sit; they exist to be referenced.
// - `<use>` contributes an implicit `translate(x, y)`, and when it targets a `<symbol>` or
//   an `<svg>`, its `width`/`height` establish that instance's viewport.
// - Nested `<svg>` and instanced `<symbol>` each establish a new viewport, which resets
//   what a percentage length resolves against.
// - Reference cycles are refused. A `<use>` chain that returns to an ancestor would
//   otherwise recurse until the stack gives out.

import { localName, childElements, isSVGElement, hrefOf, resolveRef, textContent } from './dom.js';
import { parseTransform } from './transform.js';
import { parseViewBox, parsePreserveAspectRatio, viewportTransform } from './viewport.js';
import { parseStylesheet, computedStyle } from './css.js';
import { length, parseLength } from './units.js';
import { compose, IDENTITY } from '../core/affine.js';

/** Elements that are never drawn where they appear — they exist to be referenced. */
export const NON_RENDERED = new Set([
  'defs',
  'symbol',
  'marker',
  'clipPath',
  'mask',
  'pattern',
  'linearGradient',
  'radialGradient',
  'filter',
  'style',
  'title',
  'desc',
  'metadata',
  'script',
]);

/** Elements that hold drawable geometry (F15 N6 converts these to Paths). */
export const SHAPES = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon']);

/** Containers whose children are drawn in their coordinate system. */
export const CONTAINERS = new Set(['g', 'a', 'svg', 'switch']);

// A length attribute resolved against the current viewport, with a default.
function lengthAttr(el, name, ctx, axis, fallback) {
  const raw = el.getAttribute(name);
  if (raw === null || raw.trim() === '') return fallback;
  return length(raw, { viewport: ctx, axis, font: undefined });
}

// Is this element hidden outright? `display:none` removes it and its subtree;
// `visibility:hidden` does not (a child can turn it back on), so it is not handled here.
function isDisplayNone(style) {
  return style.display === 'none';
}

/**
 * Collect every `<style>` element's rules, in document order.
 * @param {Element} root
 * @returns {object[]}
 */
export function collectStylesheets(root) {
  const rules = [];
  const walk = (el) => {
    if (localName(el) === 'style' && isSVGElement(el)) {
      rules.push(...parseStylesheet(textContent(el)));
    }
    for (const kid of childElements(el)) walk(kid);
  };
  walk(root);
  // Re-number so ordering is global across all <style> blocks, not per block.
  return rules.map((r, i) => ({ ...r, order: i }));
}

/**
 * Resolve a document into its instance tree.
 *
 * @param {Element} root  the root `<svg>` element
 * @param {object} [opts]
 * @param {number} [opts.width]   the viewport width to fit the root into (default: its
 *                                own `width`, else the viewBox width, else 300)
 * @param {number} [opts.height]
 * @param {object[]} [opts.rules] stylesheet rules (default: collected from the document)
 * @returns {{root: Element, viewBox: object|null, width: number, height: number,
 *            instances: object[]}}
 *   Each instance is `{key, element, tag, transform, style, viewport, ancestors,
 *   useChain}` — `transform` maps the element's own user units to root viewBox
 *   coordinates.
 */
export function resolveTree(root, opts = {}) {
  const rules = opts.rules ?? collectStylesheets(root);

  const rootViewBoxRaw = root.getAttribute('viewBox');
  const viewBox = rootViewBoxRaw ? parseViewBox(rootViewBoxRaw) : null;

  // The root viewport. Without explicit dimensions, the viewBox's own extent is the
  // natural choice — it makes the root transform the identity, which is what a caller
  // asking for "viewBox coordinates" means.
  const fallbackW = viewBox ? viewBox.width : 300;
  const fallbackH = viewBox ? viewBox.height : 150;
  const width = opts.width ?? numericAttr(root, 'width', fallbackW);
  const height = opts.height ?? numericAttr(root, 'height', fallbackH);

  const rootViewport = { width: viewBox ? viewBox.width : width, height: viewBox ? viewBox.height : height };
  const rootTransform = viewportTransform({
    viewBox,
    preserveAspectRatio: parsePreserveAspectRatio(root.getAttribute('preserveAspectRatio')),
    width,
    height,
  });

  const instances = [];
  visit(root, {
    rules,
    instances,
    transform: rootTransform,
    style: {},
    viewport: rootViewport,
    ancestors: [],
    useChain: [],
    key: '',
    isRootCall: true,
  });
  return { root, viewBox, width, height, instances };
}

function numericAttr(el, name, fallback) {
  const raw = el.getAttribute(name);
  if (raw === null || raw.trim() === '') return fallback;
  try {
    const { value, unit } = parseLength(raw);
    return unit === '%' ? fallback : length(raw);
  } catch {
    return fallback;
  }
}

// A stable, human-readable key for an instance: the reference chain that reached it.
function keyFor(parentKey, el, index) {
  const id = el.getAttribute('id');
  const name = id ? `${localName(el)}#${id}` : `${localName(el)}[${index}]`;
  return parentKey === '' ? name : `${parentKey}/${name}`;
}

function visit(el, ctx) {
  if (!isSVGElement(el)) return; // foreign content (HTML in <foreignObject>) is not geometry

  const tag = localName(el);
  const style = computedStyle(el, ctx.ancestors, ctx.rules, ctx.style);
  if (isDisplayNone(style)) return;

  // An element's own `transform` applies inside its parent's coordinate system.
  const own = parseTransform(el.getAttribute('transform'));
  let transform = ctx.isRootCall ? ctx.transform : compose(ctx.transform, own);
  let viewport = ctx.viewport;

  // A nested <svg> establishes a new viewport (the root's was handled by the caller).
  if (tag === 'svg' && !ctx.isRootCall) {
    const vbRaw = el.getAttribute('viewBox');
    const vb = vbRaw ? parseViewBox(vbRaw) : null;
    const w = lengthAttr(el, 'width', ctx.viewport, 'x', ctx.viewport.width);
    const h = lengthAttr(el, 'height', ctx.viewport, 'y', ctx.viewport.height);
    transform = compose(
      transform,
      viewportTransform({
        viewBox: vb,
        preserveAspectRatio: parsePreserveAspectRatio(el.getAttribute('preserveAspectRatio')),
        x: lengthAttr(el, 'x', ctx.viewport, 'x', 0),
        y: lengthAttr(el, 'y', ctx.viewport, 'y', 0),
        width: w,
        height: h,
      }),
    );
    viewport = vb ? { width: vb.width, height: vb.height } : { width: w, height: h };
  }

  if (tag === 'use') {
    visitUse(el, { ...ctx, transform, style, viewport });
    return;
  }

  // Non-rendered elements are skipped *with their subtrees* — a <rect> inside <defs>
  // is not drawn where it sits, only where something references it.
  if (NON_RENDERED.has(tag) && !ctx.instancingSymbol) return;

  if (SHAPES.has(tag)) {
    ctx.instances.push({
      key: keyFor(ctx.key, el, ctx.instances.length),
      element: el,
      tag,
      transform,
      style,
      viewport,
      ancestors: ctx.ancestors,
      useChain: ctx.useChain,
    });
    return;
  }

  if (CONTAINERS.has(tag) || ctx.instancingSymbol) {
    const ancestors = [...ctx.ancestors, el];
    const key = ctx.isRootCall ? '' : keyFor(ctx.key, el, ctx.instances.length);
    let index = 0;
    for (const kid of childElements(el)) {
      visit(kid, {
        ...ctx,
        transform,
        style,
        viewport,
        ancestors,
        key,
        isRootCall: false,
        instancingSymbol: false,
        childIndex: index++,
      });
    }
  }
}

function visitUse(el, ctx) {
  const href = hrefOf(el);
  const target = resolveRef(el, href);
  if (target === null) return; // a dangling reference draws nothing, per spec

  // Cycle detection. Following a chain back to an element already on it would recurse
  // until the stack gives out, so it is refused with the chain that caused it.
  if (ctx.useChain.includes(target)) {
    const names = [...ctx.useChain, target].map((e) => `<${localName(e)} id=${e.getAttribute('id')}>`);
    throw new RangeError(`svg: <use> reference cycle — ${names.join(' → ')}`);
  }

  // `<use>` contributes an implicit translate(x, y) *after* its own transform.
  const x = lengthAttr(el, 'x', ctx.viewport, 'x', 0);
  const y = lengthAttr(el, 'y', ctx.viewport, 'y', 0);
  let transform = compose(ctx.transform, { a: 1, b: 0, c: 0, d: 1, e: x, f: y });
  let viewport = ctx.viewport;

  const targetTag = localName(target);
  const instancingSymbol = targetTag === 'symbol' || targetTag === 'svg';

  if (instancingSymbol) {
    // The referenced symbol/svg gets a viewport from the <use>'s width/height, which
    // default to 100% of the current viewport.
    const w = lengthAttr(el, 'width', ctx.viewport, 'x', ctx.viewport.width);
    const h = lengthAttr(el, 'height', ctx.viewport, 'y', ctx.viewport.height);
    const vbRaw = target.getAttribute('viewBox');
    const vb = vbRaw ? parseViewBox(vbRaw) : null;
    transform = compose(
      transform,
      viewportTransform({
        viewBox: vb,
        preserveAspectRatio: parsePreserveAspectRatio(target.getAttribute('preserveAspectRatio')),
        width: w,
        height: h,
      }),
    );
    viewport = vb ? { width: vb.width, height: vb.height } : { width: w, height: h };
  }

  const key = keyFor(ctx.key, el, ctx.instances.length);
  const useChain = [...ctx.useChain, target];

  // The instanced subtree is styled as if it were a child of the <use> (SVG 1.1's
  // "deep clone" model), so the <use>'s computed style is what it inherits.
  const shared = {
    ...ctx,
    transform,
    viewport,
    style: ctx.style,
    ancestors: [...ctx.ancestors, el],
    key,
    useChain,
    isRootCall: false,
  };

  if (instancingSymbol) {
    // A <symbol> is not rendered itself; its children are, in the new viewport.
    let index = 0;
    for (const kid of childElements(target)) {
      visit(kid, { ...shared, childIndex: index++ });
    }
  } else {
    visit(target, { ...shared, instancingSymbol: false });
  }
}
