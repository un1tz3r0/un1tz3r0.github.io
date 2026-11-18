// Text → outlines. DESIGN.md §9.3.
//
// Lays the text out with opentype.js and returns path data positioned exactly where the
// live <text> element draws: the first baseline at y = 0, lines `size × lineHeight`
// apart, aligned on x = 0.
//
// Glyphs are positioned here rather than by opentype.js's own `getPath`, for two reasons:
// letter spacing has to match SVG's (added after every glyph), and opentype.js throws on
// OpenType lookups it does not implement — which includes the `ccmp` tables of common
// families such as Inter. When that happens the run falls back to plain character →
// glyph mapping: kerning is kept, ligatures are not formed.
//
// Limitation, stated in the spec: no complex-script shaping. Characters the fonts have no
// glyph for are reported in `missing` rather than silently drawn as boxes.

/**
 * Split a line into runs, each drawn with the first font that has all its glyphs.
 * @param {string} line
 * @param {any[]} fonts  opentype.js fonts, in fallback order
 * @param {Set<string>} missing
 * @returns {{font: any, text: string}[]}
 */
function runsOf(line, fonts, missing) {
  const runs = [];
  for (const ch of line) {
    let font = fonts.find((f) => f.charToGlyphIndex(ch) > 0);
    if (!font) {
      if (ch.trim()) missing.add(ch);
      font = fonts[0];
    }
    const last = runs[runs.length - 1];
    if (last && last.font === font) last.text += ch;
    else runs.push({ font, text: ch });
  }
  return runs;
}

/** Glyphs for a run: with ligature substitution if the font's tables allow, else 1:1. */
function glyphsOf(font, text) {
  try {
    return font.stringToGlyphs(text, { features: { liga: true, rlig: true } });
  } catch {
    return [...text].map((ch) => font.charToGlyph(ch));
  }
}

function kerning(font, a, b) {
  try {
    return font.getKerningValue(a, b) || 0;
  } catch {
    return 0;
  }
}

/**
 * Position the glyphs of a run. Returns each glyph with its x offset, and the run's width.
 * @returns {{items: {glyph: any, x: number}[], width: number}}
 */
function layoutRun(font, text, size, letterSpacing) {
  const scale = size / font.unitsPerEm;
  const glyphs = glyphsOf(font, text);
  const items = [];
  let x = 0;
  glyphs.forEach((glyph, i) => {
    items.push({ glyph, x });
    x += (glyph.advanceWidth ?? 0) * scale + letterSpacing;
    if (i < glyphs.length - 1) x += kerning(font, glyph, glyphs[i + 1]) * scale;
  });
  return { items, width: x };
}

/**
 * @param {import('../../core/model/nodes.js').TextNode} node
 * @param {any[]} fonts  from `fontService.outlineFonts`
 * @returns {{d: string, missing: string[]}}
 */
export function outlineText(node, fonts) {
  const size = node.size;
  const missing = new Set();
  const parts = [];
  String(node.text).split('\n').forEach((line, i) => {
    const runs = runsOf(line, fonts, missing).map((run) => ({ ...run, ...layoutRun(run.font, run.text, size, node.letterSpacing) }));
    const total = runs.reduce((sum, r) => sum + r.width, 0);
    let x = node.align === 'middle' ? -total / 2 : node.align === 'end' ? -total : 0;
    const y = i * size * node.lineHeight;
    for (const run of runs) {
      for (const item of run.items) {
        const d = item.glyph.getPath(x + item.x, y, size).toPathData(3);
        if (d) parts.push(d);
      }
      x += run.width;
    }
  });
  return { d: parts.join(''), missing: [...missing] };
}
