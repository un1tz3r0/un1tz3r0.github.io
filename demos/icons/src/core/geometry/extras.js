// The less common geometry features, all from geo: single-line lettering from its
// parametric stroke alphabet, spiro curves, bending artwork along a path, emboss shading.

import {
  parsePath, serializePath, transformPath, glyphs, textMetrics, spiroToPath, pathAlongPath, embossPath, pathLength,
} from '@geo/paths';

const toD = (p) => serializePath(p, { precision: 3 });

/** Cap height of the stroke alphabet at size 1, measured once. */
let capHeight = 0;

/**
 * Single-line ("stroke") lettering: centerlines to be drawn with a stroke, not filled.
 * Positioned like SVG text: first baseline at y = 0, lines `size × lineHeight` apart.
 * @param {{text: string, size: number, lineHeight: number, align: string, letterSpacing: number}} node
 * @returns {{d: string, missing: string[]}}
 */
export function strokeLettering(node) {
  if (!capHeight) capHeight = textMetrics('H', { size: 1 }).bbox?.maxY || 1;
  // Match the cap height of an ordinary typeface at this size (about 0.7 em).
  const size = (node.size * 0.7) / capHeight;
  const missing = new Set();
  const parts = [];
  String(node.text).split('\n').forEach((line, i) => {
    if (!line) return;
    const opts = { size, tracking: node.letterSpacing };
    const metrics = textMetrics(line, opts);
    for (const ch of metrics.missing ?? []) missing.add(ch);
    const path = glyphs(line, opts);
    if (!path.subpaths.length) return;
    const x = node.align === 'middle' ? -metrics.advance / 2 : node.align === 'end' ? -metrics.advance : 0;
    // geo draws glyphs y-up from the baseline; SVG is y-down.
    parts.push(toD(transformPath(path, { a: 1, b: 0, c: 0, d: -1, e: x, f: i * node.size * node.lineHeight })));
  });
  return { d: parts.join(' '), missing: [...missing] };
}

/**
 * A smooth curve through points, by spiro spline. The ends of an open curve and any
 * point marked `corner` are sharp; the rest are curvature-continuous.
 * @param {{x: number, y: number, corner?: boolean}[]} points
 * @param {boolean} closed
 * @returns {string} path data ('' for fewer than two points)
 */
export function spiroD(points, closed) {
  if (points.length < 2) return '';
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  const knots = points.map((p, i) => ({
    x: p.x,
    y: p.y,
    type: p.corner || (!closed && (i === 0 || i === points.length - 1)) ? 'corner' : 'g4',
  }));
  try {
    return toD(spiroToPath([{ points: knots, closed }]));
  } catch {
    // The spiro solver does not converge on every arrangement (tight zigzags defeat it).
    // A Catmull-Rom curve through the same points keeps the tool's promise: smooth, and
    // through every click.
    return catmullRomD(points, closed);
  }
}

/** A smooth cubic curve through points (uniform Catmull-Rom, converted to Béziers). */
export function catmullRomD(points, closed) {
  const n = points.length;
  const at = (i) => (closed ? points[((i % n) + n) % n] : points[Math.max(0, Math.min(n - 1, i))]);
  const f = (v) => Math.round(v * 1000) / 1000;
  let d = `M ${f(points[0].x)} ${f(points[0].y)}`;
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d += ` C ${f(p1.x + (p2.x - p0.x) / 6)} ${f(p1.y + (p2.y - p0.y) / 6)} ${f(p2.x - (p3.x - p1.x) / 6)} ${f(p2.y - (p3.y - p1.y) / 6)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return closed ? `${d} Z` : d;
}

/**
 * Bend artwork (drawn along the x axis, with y = 0 as its baseline) along a spine.
 * @param {string} artD    path data of the artwork
 * @param {string} spineD  path data of the spine, in the same coordinate space
 * @param {{align?: 'start'|'middle'|'end', offset?: number}} [opts]
 * @returns {string}
 */
export function alongPathD(artD, spineD, opts = {}) {
  const art = parsePath(artD);
  const spine = parsePath(spineD);
  if (!art.subpaths.length || !spine.subpaths.length) return '';
  // Use the first subpath of the spine; text has one baseline.
  spine.subpaths.length = 1;
  const align = opts.align === 'middle' ? 'center' : opts.align === 'end' ? 'end' : 'start';
  return toD(pathAlongPath(art, spine, { fit: 'single', endpoints: 'overhang', align, offset: opts.offset ?? 0 }));
}

export const lengthOfD = (d) => pathLength(parsePath(d));

/**
 * Bevel shading for a filled shape: bands just inside its edge, lit from one side.
 * @param {string} d
 * @param {{width: number, azimuth?: number, bands?: number}} opts  azimuth in degrees
 * @returns {{d: string, intensity: number, kind: 'diffuse'|'specular'}[]}
 */
export function embossBands(d, opts) {
  const result = embossPath(parsePath(d), {
    width: opts.width,
    azimuth: ((opts.azimuth ?? -45) * Math.PI) / 180,
    bands: opts.bands ?? 4,
    specularBands: 1,
  });
  return result.regions
    .map((r) => ({ d: toD(r.path), intensity: r.intensity, kind: r.kind }))
    .filter((r) => r.d);
}
