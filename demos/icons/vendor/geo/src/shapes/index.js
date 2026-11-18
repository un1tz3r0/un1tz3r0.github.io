// `src/shapes/` — F12 shape and glyph generators.
//
// Constructions only: pure functions returning Paths, `core/`-only imports, so this layer
// stays in the portable set alongside the kernel.

export {
  regularPolygon,
  star,
  roundedPolygon,
  spiral,
  cross,
  plus,
  arrow,
  chevron,
  tick,
  brace,
  dimensionLine,
} from './primitives.js';

export {
  AXES,
  AXIS_NAMES,
  ADVANCE_MODES,
  resolveAxes,
  defaultAxes,
  slantShear,
  verticalExtent,
} from './font/axes.js';
export { glyphFrame, frameFor, waist, MONOSPACE_CELL } from './font/frame.js';
export {
  open,
  closed,
  glyphPath,
  applySlant,
  cornerCurve,
  stem,
  crossbar,
  arm,
  diagonal,
  roundedForm,
  openForm,
  bowl,
  shoulder,
  sSpine,
  tail,
  dot,
  serifBar,
} from './font/strokes.js';
export { UPPERCASE, UPPERCASE_WIDTHS, UPPERCASE_AXIS_SENSITIVITY } from './font/uppercase.js';
export { LOWERCASE, LOWERCASE_WIDTHS, LOWERCASE_AXIS_SENSITIVITY } from './font/lowercase.js';
export { SYMBOLS, SYMBOL_WIDTHS } from './font/symbols.js';
export { glyph, glyphs, textMetrics, glyphCoverage, hasGlyph, GLYPHS, GLYPH_WIDTHS } from './font/text.js';
