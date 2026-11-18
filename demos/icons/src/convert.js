// Converting objects to plain paths: shapes, icons, text and (recursively) groups.
//
// Icons go through geo's SVG document layer, which resolves the icon's markup — nested
// groups, transforms, <use>, presentation attributes — into one path per drawable with a
// computed style. Text goes through opentype.js. Both are loaded on first use.

import { app } from './app.js';
import { createPath, createGroup, makeStroke, NONE, solid } from './core/model/nodes.js';
import { outlineD } from './core/geometry/bounds.js';
import { transformNode } from './core/geometry/transform.js';
import { toD } from './core/geometry/ops.js';
import { parseColor, formatColor } from './core/color.js';
import { IDENTITY } from './core/affine.js';
import { outlineText } from './services/fonts/outline.js';

/** Everything a converted node keeps from the node it replaces. */
const carry = (node) => ({
  name: node.name,
  transform: node.transform,
  visible: node.visible,
  locked: node.locked,
  opacity: node.opacity,
  blend: node.blend,
  effects: node.effects,
});

/** A CSS paint value from an icon's computed style → a model Paint. */
function cssPaint(value, opacity, currentColor, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const v = String(value).trim();
  if (v === 'none' || v === 'transparent') return NONE;
  const color = v.toLowerCase() === 'currentcolor' ? parseColor(currentColor) : parseColor(v);
  // Gradients and patterns (url(#…)) are not carried over; the icon's color stands in.
  const rgba = color ?? parseColor(currentColor) ?? { r: 0, g: 0, b: 0, a: 1 };
  return solid(formatColor({ ...rgba, a: rgba.a * opacity }));
}

const num = (value, fallback) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Resolve SVG markup into path nodes: one per drawable, with its computed style and with
 * every transform applied. geo parses the markup into an inert document and hands back
 * geometry and style *values*; nothing from the source is inserted into the page.
 * @param {string} source  a complete SVG document
 * @param {{width?: number, height?: number, strokeScale?: number, currentColor?: string, origin?: any}} [opts]
 * @returns {Promise<{nodes: any[], viewBox: number[] | null, unsupportedPaints: number}>}
 */
export async function svgToNodes(source, opts = {}) {
  const { parseDocument, documentPaths } = await import('@geo/paths/svg');
  const size = opts.width !== undefined ? { width: opts.width, height: opts.height } : {};
  const doc = parseDocument(source, size);
  const scale = opts.strokeScale ?? 1;
  const currentColor = opts.currentColor ?? '#000000';
  const nodes = [];
  let unsupportedPaints = 0;
  for (const entry of documentPaths(doc)) {
    const st = entry.style ?? {};
    if (st.visibility === 'hidden' || st.visibility === 'collapse') continue;
    for (const key of ['fill', 'stroke']) {
      if (/^\s*url\(/i.test(String(st[key] ?? ''))) unsupportedPaints++;
    }
    const opacity = num(st.opacity, 1);
    const fill = cssPaint(st.fill, num(st['fill-opacity'], 1) * opacity, currentColor, solid('#000000'));
    const strokePaint = cssPaint(st.stroke, num(st['stroke-opacity'], 1) * opacity, currentColor, NONE);
    const dash = String(st['stroke-dasharray'] ?? '').split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n) && n >= 0);
    const d = toD(entry.path);
    if (!d) continue;
    // A stroke width is in the element's own units; the geometry has been transformed.
    const t = entry.transform ?? IDENTITY;
    const k = scale * (opts.width !== undefined ? 1 : Math.sqrt(Math.abs(t.a * t.d - t.b * t.c)) || 1);
    const id = entry.element?.getAttribute?.('id');
    nodes.push(createPath(d, {
      name: id || (entry.tag === 'path' ? 'Path' : entry.tag.replace(/^./, (c) => c.toUpperCase())),
      fillRule: st['fill-rule'] === 'evenodd' ? 'evenodd' : 'nonzero',
      fill,
      stroke: makeStroke({
        paint: strokePaint,
        width: num(st['stroke-width'], 1) * k,
        cap: ['round', 'square'].includes(st['stroke-linecap']) ? st['stroke-linecap'] : 'butt',
        join: ['round', 'bevel'].includes(st['stroke-linejoin']) ? st['stroke-linejoin'] : 'miter',
        miterLimit: num(st['stroke-miterlimit'], 4),
        dash: dash.some((n) => n > 0) ? dash.map((n) => n * k) : [],
        dashOffset: num(st['stroke-dashoffset'], 0) * k,
      }),
      ...(opts.origin ? { origin: opts.origin } : {}),
    }));
  }
  return { nodes, viewBox: doc.viewBox ? [doc.viewBox.x ?? doc.viewBox.minX ?? 0, doc.viewBox.y ?? doc.viewBox.minY ?? 0, doc.viewBox.width, doc.viewBox.height] : null, unsupportedPaints };
}

/**
 * An icon as editable paths.
 * @param {import('./core/model/nodes.js').IconNode} node
 * @returns {Promise<any>} a path node, or a group of them
 */
export async function iconToPaths(node) {
  const [vx, vy, vw, vh] = node.viewBox;
  const source =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vx} ${vy} ${vw} ${vh}" ` +
    `width="${node.width}" height="${node.height}" preserveAspectRatio="none" color="${node.color}">${node.body}</svg>`;
  const origin = { prefix: node.source.prefix, name: node.source.name };
  const { nodes: children } = await svgToNodes(source, {
    width: node.width,
    height: node.height,
    // Stroke widths are in viewBox units; the paths come back in the icon's box units.
    strokeScale: Math.sqrt(Math.abs((node.width / (vw || 1)) * (node.height / (vh || 1)))),
    currentColor: node.color,
    origin,
  });
  if (children.length === 0) throw new Error('This icon has no shapes that can be converted');
  if (children.length === 1) {
    // One path: no need for a group around it. Its transform is baked in where possible.
    return transformNode({ ...children[0], ...carry(node), transform: IDENTITY, origin }, node.transform);
  }
  return { ...createGroup(children, carry(node)), origin };
}

/** A parametric shape as a path with the same appearance. */
export function shapeToPath(node) {
  const path = createPath(outlineD(node), { ...carry(node), transform: IDENTITY, fill: node.fill, stroke: node.stroke });
  return transformNode(path, node.transform);
}

/**
 * Text as outlines.
 * @param {import('./core/model/nodes.js').TextNode} node
 * @returns {Promise<{node: any, missing: string[]}>}
 */
export async function textToPath(node) {
  if (!String(node.text).trim()) throw new Error('There is no text to convert');
  const fonts = await app.services.fonts.outlineFonts(node.font, node.text);
  const { d, missing } = outlineText(node, fonts);
  if (!d) throw new Error('The text produced no outlines');
  const path = createPath(d, {
    ...carry(node),
    transform: IDENTITY,
    fill: node.fill,
    stroke: node.stroke,
    origin: { font: node.font, text: node.text },
  });
  return { node: transformNode(path, node.transform), missing };
}

/**
 * Convert any node to paths. Paths come back unchanged; groups are converted member by
 * member and stay groups.
 * @param {any} node
 * @param {{missing?: Set<string>}} [report]  collects characters the outline fonts lack
 * @returns {Promise<any>}
 */
export async function toPaths(node, report = {}) {
  switch (node.type) {
    case 'path':
      return node;
    case 'shape':
      return shapeToPath(node);
    case 'icon':
      return iconToPaths(node);
    case 'text': {
      const result = await textToPath(node);
      for (const ch of result.missing) report.missing?.add(ch);
      return result.node;
    }
    case 'group': {
      const children = [];
      for (const child of node.children) children.push(await toPaths(child, report));
      return children.every((c, i) => c === node.children[i]) ? node : { ...node, children };
    }
    default:
      return node;
  }
}

/** Whether a node (or anything inside it) is something other than a plain path. */
export function needsConversion(node) {
  if (node.type === 'group') return node.children.some(needsConversion);
  return node.type !== 'path';
}

/**
 * A copy of the document with every text object replaced by outlines, for exports that
 * must not depend on fonts.
 * @param {import('./core/model/nodes.js').Doc} doc
 * @returns {Promise<{doc: any, missing: string[], failed: string[]}>}
 */
export async function outlineAllText(doc) {
  const missing = new Set();
  const failed = [];
  const visit = async (node) => {
    if (node.type === 'text') {
      try {
        const result = await textToPath(node);
        for (const ch of result.missing) missing.add(ch);
        return result.node;
      } catch {
        // Keep the live text rather than lose it; the caller reports the font.
        failed.push(node.font.family);
        return node;
      }
    }
    if (node.type === 'group') {
      const children = [];
      for (const child of node.children) children.push(await visit(child));
      return { ...node, children };
    }
    return node;
  };
  const children = [];
  for (const child of doc.children) children.push(await visit(child));
  return { doc: { ...doc, children }, missing: [...missing], failed: [...new Set(failed)] };
}
