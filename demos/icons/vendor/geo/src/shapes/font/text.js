// F12 — glyph lookup, placement and metrics.
//
// Placement, not typography. Shaping, kerning pairs, ligatures, bidi and line breaking are
// non-goals (brief §1); what this does is put glyphs next to each other at their advances
// and report where they landed. That is the part a geometry library can be right about.

import { resolveAxes } from './axes.js';
import { glyphFrame } from './frame.js';
import { applySlant, glyphPath } from './strokes.js';
import { path, subpath, pathBoundingBox } from '../../core/path.js';
import { UPPERCASE, UPPERCASE_WIDTHS } from './uppercase.js';
import { LOWERCASE, LOWERCASE_WIDTHS } from './lowercase.js';
import { SYMBOLS, SYMBOL_WIDTHS } from './symbols.js';

/** Every builder, keyed by character. */
export const GLYPHS = { ...UPPERCASE, ...LOWERCASE, ...SYMBOLS };

/** Per-glyph drawing-width proportions. */
export const GLYPH_WIDTHS = { ...UPPERCASE_WIDTHS, ...LOWERCASE_WIDTHS, ...SYMBOL_WIDTHS };

/** Is there a builder for this character? */
export function hasGlyph(ch) {
  return Object.prototype.hasOwnProperty.call(GLYPHS, ch);
}

/** The characters this font can draw, sorted. */
export function glyphCoverage() {
  return Object.keys(GLYPHS).sort();
}

// Translate a path in x (and y, for baseline placement).
function translatePath(pth, dx, dy) {
  const m = (q) => ({ x: q.x + dx, y: q.y + dy });
  const mapSeg = (s) => {
    switch (s.type) {
      case 'line':
        return { ...s, p0: m(s.p0), p1: m(s.p1) };
      case 'quad':
        return { ...s, p0: m(s.p0), p1: m(s.p1), p2: m(s.p2) };
      case 'cubic':
        return { ...s, p0: m(s.p0), p1: m(s.p1), p2: m(s.p2), p3: m(s.p3) };
      case 'arc':
        return { ...s, p0: m(s.p0), p1: m(s.p1) };
      default:
        throw new TypeError(`translatePath: unknown segment type ${s && s.type}`);
    }
  };
  return path(
    pth.subpaths.map((sp) => subpath(sp.segments.map(mapSeg), { closed: sp.closed })),
    { fillRule: pth.fillRule },
  );
}

/**
 * One glyph, as a centerline Path in the em frame with its advance.
 *
 * A space is a real glyph with an advance and no geometry. An unknown character returns
 * `null` rather than a box or a silent empty: the caller decides whether to skip it or
 * substitute, and `glyphs` skips.
 *
 * @param {string} ch  a single character
 * @param {object} [axes]  partial or resolved axes
 * @returns {{path, advance, frame} | null}
 */
export function glyph(ch, axes = {}) {
  const a = axes.advance !== undefined && 'capHeight' in axes ? axes : resolveAxes(axes);
  if (ch === ' ') {
    const f = glyphFrame(a, 0.55);
    return { path: path([]), advance: f.advance, frame: f };
  }
  if (!hasGlyph(ch)) return null;
  const f = glyphFrame(a, GLYPH_WIDTHS[ch] ?? 1);
  const parts = GLYPHS[ch](f).filter(Boolean);
  return { path: applySlant(glyphPath(parts), a), advance: f.advance, frame: f };
}

/**
 * A run of text as one Path, glyphs placed at their advances along the baseline.
 *
 * `size` scales the em frame; `tracking` adds to every advance (on top of the axis, so a
 * caller can adjust a single run without disturbing the font). Unknown characters are
 * skipped and reported by `textMetrics`.
 *
 * @param {string} text
 * @param {{axes?:object, size?:number, tracking?:number, origin?:{x,y}}} [opts]
 * @returns {object} Path
 */
export function glyphs(text, opts = {}) {
  const a = resolveAxes(opts.axes ?? {});
  const size = opts.size ?? 1;
  const extra = (opts.tracking ?? 0) + a.tracking;
  const origin = opts.origin ?? { x: 0, y: 0 };
  const subpaths = [];
  let pen = 0;
  for (const ch of String(text)) {
    const g = glyph(ch, a);
    if (g === null) continue;
    if (g.path.subpaths.length) {
      const placed = translatePath(g.path, pen, 0);
      for (const sp of placed.subpaths) subpaths.push(sp);
    }
    pen += g.advance + extra;
  }
  const laid = path(subpaths);
  if (size === 1 && origin.x === 0 && origin.y === 0) return laid;
  const scaled = path(
    laid.subpaths.map((sp) =>
      subpath(
        sp.segments.map((s) => scaleSeg(s, size, origin)),
        { closed: sp.closed },
      ),
    ),
  );
  return scaled;
}

function scaleSeg(s, k, o) {
  const m = (q) => ({ x: o.x + q.x * k, y: o.y + q.y * k });
  switch (s.type) {
    case 'line':
      return { ...s, p0: m(s.p0), p1: m(s.p1) };
    case 'quad':
      return { ...s, p0: m(s.p0), p1: m(s.p1), p2: m(s.p2) };
    case 'cubic':
      return { ...s, p0: m(s.p0), p1: m(s.p1), p2: m(s.p2), p3: m(s.p3) };
    case 'arc':
      return { ...s, p0: m(s.p0), p1: m(s.p1), rx: s.rx * k, ry: s.ry * k };
    default:
      throw new TypeError(`scaleSeg: unknown segment type ${s && s.type}`);
  }
}

/**
 * Metrics for a run, without building its geometry twice.
 *
 * @returns {{advance, bbox, baseline, glyphs, missing}}
 *   `glyphs` lists `{char, x, advance}` per placed glyph; `missing` lists characters with
 *   no builder, so a caller can tell "nothing was drawn" from "that character is not in
 *   the font".
 */
export function textMetrics(text, opts = {}) {
  const a = resolveAxes(opts.axes ?? {});
  const size = opts.size ?? 1;
  const extra = (opts.tracking ?? 0) + a.tracking;
  const placed = [];
  const missing = [];
  let pen = 0;
  for (const ch of String(text)) {
    const g = glyph(ch, a);
    if (g === null) {
      missing.push(ch);
      continue;
    }
    placed.push({ char: ch, x: pen * size, advance: g.advance * size });
    pen += g.advance + extra;
  }
  // The trailing tracking is not part of the run's advance — it is space *between*
  // glyphs, and adding it would make "AB" wider than the ink plus one gap.
  const advance = Math.max(0, (pen - (placed.length ? extra : 0)) * size);
  return {
    advance,
    bbox: pathBoundingBox(glyphs(text, { ...opts, axes: a })),
    baseline: opts.origin?.y ?? 0,
    glyphs: placed,
    missing,
  };
}
