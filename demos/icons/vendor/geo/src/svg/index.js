// `@geo/paths/svg` — the SVG *document* layer.
//
// Deliberately a separate entry point from the package root. This is the one layer that
// needs a host DOM (jsdom under Node), so importing `@geo/paths` stays free of it: a
// caller who only wants path geometry never loads a parser they are not using, and the
// dependency is opt-in at the import site rather than at install time.
//
// It is also the layer that does not transpile to the C++/Rust targets, and keeping the
// boundary visible in the module graph is what keeps that honest.

export { parseSVG, localName, isSVGElement, attributes, childElements, textContent, hrefOf, resolveRef, SVG_NS, XLINK_NS, HOST } from './dom.js';
export { parseLength, resolveLength, length, parseNumberList } from './units.js';
export {
  parseViewBox,
  parsePreserveAspectRatio,
  viewportTransform,
  DEFAULT_PRESERVE_ASPECT_RATIO,
} from './viewport.js';
export { parseTransform } from './transform.js';
export {
  parseDeclarations,
  parseSelector,
  specificity,
  matches,
  parseStylesheet,
  declaredStyle,
  computedStyle,
  INHERITED,
  PRESENTATION_ATTRIBUTES,
} from './css.js';
export { resolveTree, collectStylesheets, NON_RENDERED, SHAPES, CONTAINERS } from './tree.js';
export { shapeToPath, shapeToPathWithProvenance } from './shapes.js';
export {
  parseDocument,
  documentPaths,
  toViewBox,
  fromViewBox,
  between,
  pointToViewBox,
  pointFromViewBox,
  pathToViewBox,
  pathFromViewBox,
  pointBetween,
  pathBetween,
  instanceSpace,
} from './document.js';
