// `viewBox` + `preserveAspectRatio` → the viewport transform.
//
// A viewport is established by the root `<svg>`, by any nested `<svg>`, and by a
// `<symbol>` when it is instanced. Its transform maps the viewBox rectangle onto the
// viewport rectangle under the requested alignment and fit; with no viewBox the mapping
// is a plain translation to the viewport origin.
//
// This follows the spec algorithm directly (SVG 1.1 §7.8) rather than a simplification,
// because `slice` and the non-Mid alignments are exactly the cases a simplification gets
// wrong.

import { affine, IDENTITY, translation } from '../core/affine.js';
import { parseNumberList } from './units.js';

const ALIGNMENTS = new Set([
  'none',
  'xMinYMin',
  'xMidYMin',
  'xMaxYMin',
  'xMinYMid',
  'xMidYMid',
  'xMaxYMid',
  'xMinYMax',
  'xMidYMax',
  'xMaxYMax',
]);

export const DEFAULT_PRESERVE_ASPECT_RATIO = { align: 'xMidYMid', meetOrSlice: 'meet' };

/**
 * Parse a `viewBox` attribute.
 * @param {string} str
 * @returns {{minX:number, minY:number, width:number, height:number}}
 * @throws {SyntaxError} on the wrong number of values or a negative extent
 */
export function parseViewBox(str) {
  const n = parseNumberList(str);
  if (n.length !== 4) {
    throw new SyntaxError(`svg: viewBox needs 4 numbers, got ${n.length}: ${JSON.stringify(str)}`);
  }
  const [minX, minY, width, height] = n;
  if (width < 0 || height < 0) {
    throw new SyntaxError(`svg: viewBox width/height must not be negative (${width}, ${height})`);
  }
  return { minX, minY, width, height };
}

/**
 * Parse a `preserveAspectRatio` attribute. Absent or empty gives the spec default,
 * `xMidYMid meet`.
 * @param {string|null|undefined} str
 * @returns {{align:string, meetOrSlice:'meet'|'slice'}}
 */
export function parsePreserveAspectRatio(str) {
  if (str === null || str === undefined || String(str).trim() === '') {
    return { ...DEFAULT_PRESERVE_ASPECT_RATIO };
  }
  const toks = String(str).trim().split(/\s+/);
  // SVG 1.1 allowed a leading `defer` on <image>; it is ignored, not an error.
  if (toks[0] === 'defer') toks.shift();
  const [align, meetOrSlice = 'meet'] = toks;
  if (!ALIGNMENTS.has(align)) {
    throw new SyntaxError(`svg: unknown preserveAspectRatio alignment ${JSON.stringify(align)}`);
  }
  if (meetOrSlice !== 'meet' && meetOrSlice !== 'slice') {
    throw new SyntaxError(`svg: preserveAspectRatio expects meet or slice, got ${meetOrSlice}`);
  }
  if (toks.length > 2) {
    throw new SyntaxError(`svg: too many tokens in preserveAspectRatio: ${JSON.stringify(str)}`);
  }
  return { align, meetOrSlice };
}

/**
 * The transform mapping viewBox coordinates onto the viewport rectangle.
 *
 * With no `viewBox`, the result is a translation to the viewport origin — a nested
 * viewport still shifts its content even when it does not rescale it.
 *
 * A zero-extent viewBox disables rendering of that element per spec; that is the caller's
 * decision to make, so this returns the identity and reports nothing.
 *
 * @param {object} opts
 * @param {{minX,minY,width,height}} [opts.viewBox]
 * @param {{align,meetOrSlice}} [opts.preserveAspectRatio]
 * @param {number} [opts.x]  viewport origin (nested `<svg>`; default 0)
 * @param {number} [opts.y]
 * @param {number} opts.width   viewport extent in the parent's user units
 * @param {number} opts.height
 * @returns {object} affine
 */
export function viewportTransform(opts) {
  const { viewBox, width, height } = opts;
  const x = opts.x ?? 0;
  const y = opts.y ?? 0;
  if (!viewBox) return x === 0 && y === 0 ? IDENTITY : translation(x, y);
  if (viewBox.width === 0 || viewBox.height === 0) return IDENTITY;

  const { align, meetOrSlice } = opts.preserveAspectRatio ?? DEFAULT_PRESERVE_ASPECT_RATIO;
  let sx = width / viewBox.width;
  let sy = height / viewBox.height;
  if (align !== 'none') {
    // `meet` fits the whole viewBox inside the viewport (letterbox); `slice` fills the
    // viewport and overflows the viewBox (crop).
    const s = meetOrSlice === 'slice' ? Math.max(sx, sy) : Math.min(sx, sy);
    sx = s;
    sy = s;
  }

  let tx = x - viewBox.minX * sx;
  let ty = y - viewBox.minY * sy;
  if (align.includes('xMid')) tx += (width - viewBox.width * sx) / 2;
  else if (align.includes('xMax')) tx += width - viewBox.width * sx;
  if (align.includes('YMid')) ty += (height - viewBox.height * sy) / 2;
  else if (align.includes('YMax')) ty += height - viewBox.height * sy;

  return affine(sx, 0, 0, sy, tx, ty);
}
