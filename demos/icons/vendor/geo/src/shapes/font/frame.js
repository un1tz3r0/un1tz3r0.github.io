// F12 — the derived layout a glyph builds inside.
//
// Axes are the *inputs*; a frame is what they resolve to for one glyph: where its
// sidebearings sit, how tall its features are, how wide its advance is. Every glyph reads
// the frame rather than the axes directly for layout, so a metric change lands everywhere
// at once and no glyph can quietly disagree about where the baseline is.

import { resolveAxes } from './axes.js';

/**
 * Resolve the layout for one glyph.
 *
 * `widthScale` is the glyph's own proportion — `I` is narrow, `M` and `W` are wide. Under
 * `advance: 'monospace'` it is ignored for the *advance* (every glyph gets the same one)
 * but still shapes the drawing, so a monospaced `M` stays wide inside its cell rather than
 * being squashed.
 *
 * @param {object} axes  a resolved axis vector
 * @param {number} [widthScale=1]
 * @returns {{advance, left, right, width, cap, x, asc, desc, over, mid, axes}}
 */
export function glyphFrame(axes, widthScale = 1) {
  const drawWidth = axes.width * widthScale;
  const advance =
    axes.advance === 'monospace' ? axes.width * MONOSPACE_CELL : drawWidth;
  const sb = axes.sidebearing * axes.width;
  // In monospace the drawing is centred in the cell, so a wide M and a narrow I share a
  // grid position without either being clipped or adrift.
  const inset = axes.advance === 'monospace' ? (advance - drawWidth) / 2 : 0;
  const left = inset + sb;
  const right = inset + drawWidth - sb;
  return {
    advance,
    left,
    right,
    width: right - left,
    mid: (left + right) / 2,
    cap: axes.capHeight,
    x: axes.exHeight,
    asc: axes.ascender,
    desc: -axes.descender,
    over: axes.overshoot,
    axes,
  };
}

/** The monospace cell width, as a multiple of the `width` axis. */
export const MONOSPACE_CELL = 1;

/**
 * Convenience: resolve axes and a frame together, for callers that have neither.
 */
export function frameFor(partialAxes, widthScale = 1) {
  return glyphFrame(resolveAxes(partialAxes), widthScale);
}

/**
 * Where a waist sits between two heights, from the `topProportion` / `bottomProportion`
 * axes. Shared so `B`, `E`, `R`, `S`, `X`, `3` and `8` all put their waist in the same
 * place — which is the point of the axis being shared at all.
 */
export function waist(f, from = 0, to = f.cap, which = 'top') {
  const t = which === 'top' ? f.axes.topProportion : f.axes.bottomProportion;
  return from + (to - from) * t;
}
