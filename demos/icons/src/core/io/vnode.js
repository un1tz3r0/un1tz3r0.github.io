// Document → virtual SVG tree.
//
// The canvas reconciler and the SVG exporter both consume the tree built here, which is
// what keeps the canvas WYSIWYG. A vnode is a plain object:
//
//   { tag, key?, attrs: {name: string}, children?: VNode[], html?: string, text?: string }
//
// `html` is raw inner markup (icon bodies, already sanitized); `text` is character data.
// Results are memoized per node identity, so an unchanged subtree yields the same vnode
// objects and the reconciler can skip it.

import { fmt, toSvg, mul, scale, translate } from '../affine.js';
import { splitAlpha } from '../color.js';
import { outlineD } from '../geometry/bounds.js';

/** @typedef {{tag:string, key?:string, attrs:Record<string,string>, children?:VNode[], html?:string, text?:string}} VNode */

const n = (v) => fmt(v, 3);

/** CSS font-family value for a font reference. */
export function fontFamilyCss(font) {
  const generic = 'sans-serif';
  return `'${String(font.family).replace(/['\\]/g, '')}', ${generic}`;
}

function gradientDef(id, paint) {
  const stops = [...paint.stops]
    .sort((a, b) => a.offset - b.offset)
    .map((s, i) => {
      const { hex, alpha } = splitAlpha(s.color);
      const attrs = { offset: n(s.offset), 'stop-color': hex };
      if (alpha < 1) attrs['stop-opacity'] = n(alpha);
      return { tag: 'stop', key: `${id}-${i}`, attrs };
    });
  if (paint.type === 'linear') {
    return {
      tag: 'linearGradient',
      key: id,
      attrs: { id, x1: n(paint.x1), y1: n(paint.y1), x2: n(paint.x2), y2: n(paint.y2) },
      children: stops,
    };
  }
  const attrs = { id, cx: n(paint.cx), cy: n(paint.cy), r: n(paint.r) };
  if (paint.fx !== undefined) attrs.fx = n(paint.fx);
  if (paint.fy !== undefined) attrs.fy = n(paint.fy);
  return { tag: 'radialGradient', key: id, attrs, children: stops };
}

/** Attributes for one paint, pushing a gradient definition into `defs` when needed. */
function paintAttrs(node, which, paint, defs, ctx) {
  const out = {};
  switch (paint?.type) {
    case 'solid': {
      const { hex, alpha } = splitAlpha(paint.color);
      out[which] = ctx.currentColor ? 'currentColor' : hex;
      if (alpha < 1) out[`${which}-opacity`] = n(alpha);
      break;
    }
    case 'current':
      out[which] = 'currentColor';
      break;
    case 'linear':
    case 'radial': {
      const id = `${node.id}-${which}`;
      defs.push(gradientDef(id, paint));
      out[which] = `url(#${id})`;
      break;
    }
    default:
      out[which] = 'none';
  }
  return out;
}

function styleAttrs(node, defs, ctx) {
  const out = paintAttrs(node, 'fill', node.fill, defs, ctx);
  if (node.type === 'path' && node.fillRule === 'evenodd' && out.fill !== 'none') out['fill-rule'] = 'evenodd';
  const s = node.stroke;
  if (s && s.paint.type !== 'none' && s.width > 0) {
    Object.assign(out, paintAttrs(node, 'stroke', s.paint, defs, ctx));
    out['stroke-width'] = n(s.width);
    if (s.cap !== 'butt') out['stroke-linecap'] = s.cap;
    if (s.join !== 'miter') out['stroke-linejoin'] = s.join;
    if (s.join === 'miter' && s.miterLimit !== 4) out['stroke-miterlimit'] = n(s.miterLimit);
    if (s.dash?.length) {
      out['stroke-dasharray'] = s.dash.map(n).join(' ');
      if (s.dashOffset) out['stroke-dashoffset'] = n(s.dashOffset);
    }
  }
  return out;
}

function filterDef(id, effects) {
  const children = effects.map((fx, i) => {
    if (fx.type === 'blur') {
      return { tag: 'feGaussianBlur', key: `${id}-${i}`, attrs: { stdDeviation: n(fx.radius) } };
    }
    const { hex, alpha } = splitAlpha(fx.color);
    return {
      tag: 'feDropShadow',
      key: `${id}-${i}`,
      attrs: { dx: n(fx.dx), dy: n(fx.dy), stdDeviation: n(fx.blur / 2), 'flood-color': hex, 'flood-opacity': n(alpha) },
    };
  });
  return {
    tag: 'filter',
    key: id,
    attrs: { id, x: '-50%', y: '-50%', width: '200%', height: '200%', 'color-interpolation-filters': 'sRGB' },
    children,
  };
}

/** Attributes every node carries: identity, transform, opacity, blend mode, effects. */
function commonAttrs(node, defs, ctx, matrix = node.transform) {
  /** @type {Record<string, string>} */
  const out = {};
  if (ctx.canvas) out['data-id'] = node.id;
  const t = toSvg(matrix);
  if (t) out.transform = t;
  if (node.opacity < 1) out.opacity = n(node.opacity);
  if (node.blend && node.blend !== 'normal') out.style = `mix-blend-mode:${node.blend}`;
  if (node.effects?.length) {
    const id = `fx-${node.id}`;
    defs.push(filterDef(id, node.effects));
    out.filter = `url(#${id})`;
  }
  return out;
}

function textVNode(node, defs, ctx) {
  const lines = String(node.text).split('\n');
  const attrs = {
    ...commonAttrs(node, defs, ctx),
    'font-family': fontFamilyCss(node.font),
    'font-size': n(node.size),
    ...styleAttrs(node, defs, ctx),
  };
  if (node.font.weight !== 400) attrs['font-weight'] = String(node.font.weight);
  if (node.font.style !== 'normal') attrs['font-style'] = node.font.style;
  if (node.align !== 'start') attrs['text-anchor'] = node.align;
  if (node.letterSpacing) attrs['letter-spacing'] = n(node.letterSpacing);
  attrs['xml:space'] = 'preserve';
  return {
    tag: 'text',
    key: node.id,
    attrs,
    children: lines.map((line, i) => ({
      tag: 'tspan',
      key: `${node.id}-l${i}`,
      attrs: { x: '0', y: n(i * node.size * node.lineHeight) },
      text: line,
    })),
  };
}

/** The matrix that maps an icon's viewBox onto its width × height box at the origin. */
export function iconMatrix(node) {
  const [vx, vy, vw, vh] = node.viewBox;
  return mul(scale(node.width / (vw || 1), node.height / (vh || 1)), translate(-vx, -vy));
}

function iconVNode(node, defs, ctx) {
  const [vx, vy, vw, vh] = node.viewBox;
  const attrs = commonAttrs(node, defs, ctx, mul(node.transform, iconMatrix(node)));
  if (!node.palette) attrs.color = ctx.currentColor ? 'currentColor' : node.color;
  let html = node.body;
  // An invisible plate so that clicking anywhere inside the icon's box selects it.
  if (ctx.canvas) {
    html = `<rect x="${n(vx)}" y="${n(vy)}" width="${n(vw)}" height="${n(vh)}" fill="none" pointer-events="all"/>${html}`;
  }
  return { tag: 'g', key: node.id, attrs, html };
}

function groupVNode(node, defs, ctx) {
  const attrs = commonAttrs(node, defs, ctx);
  const visible = node.children.filter((c) => c.visible);
  let members = visible;
  if (node.clip !== 'none' && visible.length >= 2) {
    const clipper = visible[visible.length - 1];
    members = visible.slice(0, -1);
    // The clipping shape lives in <defs>; it must not carry a data-id of its own there.
    const inner = build(clipper, { ...ctx, canvas: false, noCache: true });
    defs.push(...inner.defs);
    if (node.clip === 'clip') {
      const id = `clip-${node.id}`;
      defs.push({ tag: 'clipPath', key: id, attrs: { id }, children: [inner.v] });
      attrs['clip-path'] = `url(#${id})`;
    } else {
      const id = `mask-${node.id}`;
      defs.push({ tag: 'mask', key: id, attrs: { id, style: 'mask-type:luminance' }, children: [inner.v] });
      attrs.mask = `url(#${id})`;
    }
  }
  const children = [];
  for (const child of members) {
    const built = build(child, ctx);
    defs.push(...built.defs);
    children.push(built.v);
  }
  return { tag: 'g', key: node.id, attrs, children };
}

/** @type {WeakMap<object, {v: VNode, defs: VNode[]}>[]} one cache per context flavour */
const caches = [new WeakMap(), new WeakMap(), new WeakMap(), new WeakMap()];

/**
 * @param {any} node
 * @param {{canvas?: boolean, currentColor?: boolean, noCache?: boolean}} ctx
 * @returns {{v: VNode, defs: VNode[]}}
 */
function build(node, ctx) {
  const cache = caches[(ctx.canvas ? 1 : 0) + (ctx.currentColor ? 2 : 0)];
  if (!ctx.noCache) {
    const hit = cache.get(node);
    if (hit) return hit;
  }
  const defs = [];
  /** @type {VNode} */
  let v;
  switch (node.type) {
    case 'path':
      v = { tag: 'path', key: node.id, attrs: { ...commonAttrs(node, defs, ctx), d: node.d, ...styleAttrs(node, defs, ctx) } };
      break;
    case 'shape':
      v = shapeVNode(node, defs, ctx);
      break;
    case 'text':
      v = textVNode(node, defs, ctx);
      break;
    case 'icon':
      v = iconVNode(node, defs, ctx);
      break;
    case 'group':
      v = groupVNode(node, defs, ctx);
      break;
    default:
      throw new TypeError(`vnode: unknown node type "${node.type}"`);
  }
  const result = { v, defs };
  if (!ctx.noCache) cache.set(node, result);
  return result;
}

function shapeVNode(node, defs, ctx) {
  const common = commonAttrs(node, defs, ctx);
  const style = styleAttrs(node, defs, ctx);
  const p = node.params;
  switch (node.shape) {
    case 'rect': {
      /** @type {Record<string, string>} */
      const attrs = { ...common, x: n(p.x), y: n(p.y), width: n(Math.max(0, p.width)), height: n(Math.max(0, p.height)) };
      if (p.rx > 0) attrs.rx = n(p.rx);
      if (p.ry > 0 && p.ry !== p.rx) attrs.ry = n(p.ry);
      return { tag: 'rect', key: node.id, attrs: { ...attrs, ...style } };
    }
    case 'ellipse':
      if (Math.abs(p.rx - p.ry) < 1e-9) {
        return { tag: 'circle', key: node.id, attrs: { ...common, cx: n(p.cx), cy: n(p.cy), r: n(Math.abs(p.rx)), ...style } };
      }
      return {
        tag: 'ellipse',
        key: node.id,
        attrs: { ...common, cx: n(p.cx), cy: n(p.cy), rx: n(Math.abs(p.rx)), ry: n(Math.abs(p.ry)), ...style },
      };
    case 'line':
      return { tag: 'line', key: node.id, attrs: { ...common, x1: n(p.x1), y1: n(p.y1), x2: n(p.x2), y2: n(p.y2), ...style } };
    default:
      return { tag: 'path', key: node.id, attrs: { ...common, d: outlineD(node), ...style } };
  }
}

/**
 * Build the drawable content of a document.
 * @param {import('../model/nodes.js').Doc} doc
 * @param {{canvas?: boolean, currentColor?: boolean}} [ctx]
 * @returns {{defs: VNode[], content: VNode[]}}
 */
export function buildContent(doc, ctx = {}) {
  const defs = [];
  const content = [];
  for (const node of doc.children) {
    if (!node.visible) continue;
    const built = build(node, ctx);
    defs.push(...built.defs);
    content.push(built.v);
  }
  return { defs, content };
}

/** Attributes for the artboard background rectangle, or `null` when it is transparent. */
export function backgroundVNode(doc) {
  const bg = doc.artboard.background;
  if (!bg || bg.type !== 'solid') return null;
  const { hex, alpha } = splitAlpha(bg.color);
  const attrs = { width: n(doc.artboard.width), height: n(doc.artboard.height), fill: hex };
  if (alpha < 1) attrs['fill-opacity'] = n(alpha);
  return { tag: 'rect', key: 'artboard-bg', attrs };
}

// --- string serialization ----------------------------------------------------------------

export const escapeAttr = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const escapeText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * @param {VNode} v
 * @param {{indent?: string, level?: number}} [opts]  `indent: ''` produces a single line
 */
export function vnodeToString(v, opts = {}) {
  const indent = opts.indent ?? '  ';
  const level = opts.level ?? 0;
  const pad = indent ? indent.repeat(level) : '';
  const nl = indent ? '\n' : '';
  const attrs = Object.entries(v.attrs ?? {})
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([k, value]) => ` ${k}="${escapeAttr(value)}"`)
    .join('');
  if (v.text !== undefined) return `${pad}<${v.tag}${attrs}>${escapeText(v.text)}</${v.tag}>`;
  if (v.html !== undefined) return `${pad}<${v.tag}${attrs}>${v.html}</${v.tag}>`;
  if (!v.children?.length) return `${pad}<${v.tag}${attrs}/>`;
  // Text content is whitespace-sensitive, so <text> is always written on one line.
  if (v.tag === 'text') {
    const inner = v.children.map((c) => vnodeToString(c, { indent: '', level: 0 })).join('');
    return `${pad}<${v.tag}${attrs}>${inner}</${v.tag}>`;
  }
  const inner = v.children.map((c) => vnodeToString(c, { indent, level: level + 1 })).join(nl);
  return `${pad}<${v.tag}${attrs}>${nl}${inner}${nl}${pad}</${v.tag}>`;
}
