// Builders for the canvas overlay: grid, guides, selection boxes, handles, snap marks.
//
// Everything here is in *screen* coordinates (CSS pixels relative to the canvas), so that
// handles and hairlines stay the same size at every zoom level. Builders return vnodes;
// the canvas feeds them to the same reconciler that draws the document.

import { toScreen } from './viewport.js';
import { fmt } from '../core/affine.js';

/** @typedef {import('../core/io/vnode.js').VNode} VNode */

const px = (v) => fmt(v, 2);
/** Snap to the pixel grid so 1px lines stay crisp. */
const crisp = (v) => Math.round(v) + 0.5;

/** @returns {VNode} */
export function v(tag, key, attrs, children) {
  return { tag, key, attrs, children };
}

export function rectV(key, box, attrs = {}) {
  return v('rect', key, {
    x: px(crisp(box.x)),
    y: px(crisp(box.y)),
    width: px(Math.max(0, Math.round(box.width))),
    height: px(Math.max(0, Math.round(box.height))),
    fill: 'none',
    ...attrs,
  });
}

export function lineV(key, a, b, attrs = {}) {
  return v('line', key, { x1: px(a.x), y1: px(a.y), x2: px(b.x), y2: px(b.y), ...attrs });
}

/** A square handle centered on a screen point. */
export function handleV(key, p, attrs = {}, size = 7) {
  return v('rect', key, {
    x: px(Math.round(p.x) - size / 2 + 0.5),
    y: px(Math.round(p.y) - size / 2 + 0.5),
    width: String(size - 1),
    height: String(size - 1),
    class: 'handle',
    ...attrs,
  });
}

export function circleV(key, p, r, attrs = {}) {
  return v('circle', key, { cx: px(p.x), cy: px(p.y), r: px(r), ...attrs });
}

/** A document-space box as a screen-space box. */
export function boxToScreen(view, box) {
  const p = toScreen(view, box);
  return { x: p.x, y: p.y, width: box.width * view.zoom, height: box.height * view.zoom };
}

/**
 * The grid, clipped to the artboard and thinned out so lines never crowd.
 * @param {import('../core/model/nodes.js').Doc} doc
 * @param {import('./viewport.js').View} view
 * @param {{width:number, height:number}} size  canvas size in pixels
 * @returns {VNode[]}
 */
export function gridVNodes(doc, view, size) {
  const g = doc.grid;
  if (!g.visible) return [];
  const MIN_GAP = g.style === 'dots' ? 10 : 6;
  const out = [];
  const art = boxToScreen(view, { x: 0, y: 0, width: doc.artboard.width, height: doc.artboard.height });
  const left = Math.max(0, art.x);
  const right = Math.min(size.width, art.x + art.width);
  const top = Math.max(0, art.y);
  const bottom = Math.min(size.height, art.y + art.height);
  if (right <= left || bottom <= top) return [];

  // Choose the finest step (minor, then major, then multiples of major) that is not crowded.
  const pick = (spacing) => {
    const sub = Math.max(1, g.subdivisions);
    let minor = spacing / sub;
    let major = spacing;
    if (!(minor > 0)) return null;
    if (minor * view.zoom < MIN_GAP) minor = major;
    while (minor * view.zoom < MIN_GAP) minor *= 2;
    while (major < minor) major *= 2;
    return { minor, major };
  };
  const sx = pick(g.spacingX);
  const sy = pick(g.spacingY);
  if (!sx || !sy) return [];

  const lines = (step, origin, lo, hi, pan) => {
    const first = Math.ceil(((lo - pan) / view.zoom - origin) / step - 1e-9);
    const last = Math.floor(((hi - pan) / view.zoom - origin) / step + 1e-9);
    const values = [];
    for (let i = first; i <= last; i++) values.push(origin + i * step);
    return values;
  };
  const xs = lines(sx.minor, g.originX, left, right, view.panX);
  const ys = lines(sy.minor, g.originY, top, bottom, view.panY);
  const isMajor = (value, origin, major) => {
    const k = (value - origin) / major;
    return Math.abs(k - Math.round(k)) < 1e-6;
  };

  if (g.style === 'isometric') {
    // Three families of lines 60° apart: verticals every w = s·cos30°, and two diagonals
    // through the lattice points, which sit s apart on each vertical.
    const s = g.spacingY;
    let k = 1;
    while (s * k * view.zoom < MIN_GAP * 2) k *= 2;
    const step = s * k;
    const w = step * Math.cos(Math.PI / 6);
    const X = (x) => x * view.zoom + view.panX;
    const Y = (y) => y * view.zoom + view.panY;
    const x0 = (left - view.panX) / view.zoom;
    const x1 = (right - view.panX) / view.zoom;
    const y0 = (top - view.panY) / view.zoom;
    const y1 = (bottom - view.panY) / view.zoom;
    let d = '';
    for (let i = Math.ceil((x0 - g.originX) / w); g.originX + i * w <= x1; i++) {
      d += `M${px(crisp(X(g.originX + i * w)))} ${px(top)}V${px(bottom)}`;
    }
    const slope = Math.tan(Math.PI / 6);
    for (const dir of [1, -1]) {
      // y = c + dir·slope·(x − originX); c steps by `step`.
      const cs = [y0 - dir * slope * (x0 - g.originX), y0 - dir * slope * (x1 - g.originX), y1 - dir * slope * (x0 - g.originX), y1 - dir * slope * (x1 - g.originX)];
      const first = Math.ceil((Math.min(...cs) - g.originY) / step);
      const last = Math.floor((Math.max(...cs) - g.originY) / step);
      for (let j = first; j <= last; j++) {
        const c = g.originY + j * step;
        d += `M${px(X(x0))} ${px(Y(c + dir * slope * (x0 - g.originX)))}L${px(X(x1))} ${px(Y(c + dir * slope * (x1 - g.originX)))}`;
      }
    }
    // Diagonals are drawn across the visible width and clipped to the artboard.
    out.push(v('clipPath', 'grid-iso-clip', { id: 'grid-iso-clip' }, [v('rect', 'grid-iso-clip-r', { x: px(left), y: px(top), width: px(right - left), height: px(bottom - top) })]));
    out.push(v('path', 'grid-iso', { d, stroke: g.color, 'stroke-opacity': fmt(g.opacity * 0.7, 2), 'stroke-width': '1', fill: 'none', 'clip-path': 'url(#grid-iso-clip)' }));
    return out;
  }

  if (g.style === 'dots') {
    // One dashed line per row, each dash a zero-length round cap: a row of dots.
    const gap = sx.minor * view.zoom;
    const x0 = xs.length ? xs[0] * view.zoom + view.panX : left;
    const d = ys.map((y) => `M${px(x0)} ${px(y * view.zoom + view.panY)}H${px(right + 0.5)}`).join('');
    out.push(v('path', 'grid-dots', {
      d,
      stroke: g.color,
      'stroke-opacity': fmt(Math.min(1, g.opacity * 2), 2),
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-dasharray': `0 ${px(gap)}`,
      fill: 'none',
    }));
    return out;
  }

  let minor = '';
  let major = '';
  for (const x of xs) {
    const s = `M${px(crisp(x * view.zoom + view.panX))} ${px(top)}V${px(bottom)}`;
    if (isMajor(x, g.originX, sx.major)) major += s;
    else minor += s;
  }
  for (const y of ys) {
    const s = `M${px(left)} ${px(crisp(y * view.zoom + view.panY))}H${px(right)}`;
    if (isMajor(y, g.originY, sy.major)) major += s;
    else minor += s;
  }
  const hasMinor = minor.length > 0;
  if (hasMinor) out.push(v('path', 'grid-minor', { d: minor, stroke: g.color, 'stroke-opacity': fmt(g.opacity * 0.45, 2), 'stroke-width': '1', fill: 'none' }));
  out.push(v('path', 'grid-major', { d: major, stroke: g.color, 'stroke-opacity': fmt(hasMinor ? g.opacity : g.opacity * 0.7, 2), 'stroke-width': '1', fill: 'none' }));
  return out;
}

/** Guide lines spanning the canvas. */
export function guideVNodes(doc, view, size, activeId) {
  if (!doc.guidesVisible) return [];
  return doc.guides.map((guide) => {
    const attrs = { class: guide.id === activeId ? 'guide active' : 'guide' };
    if (guide.axis === 'x') {
      const x = crisp(guide.position * view.zoom + view.panX);
      return lineV(`guide-${guide.id}`, { x, y: 0 }, { x, y: size.height }, attrs);
    }
    const y = crisp(guide.position * view.zoom + view.panY);
    return lineV(`guide-${guide.id}`, { x: 0, y }, { x: size.width, y }, attrs);
  });
}

/**
 * Lines / cross showing what the pointer snapped to.
 * @param {{snappedX: any, snappedY: any, point: any} | null} feedback
 */
export function snapVNodes(feedback, view, size) {
  if (!feedback) return [];
  const out = [];
  // Snapping to the grid needs no indicator: the grid itself is the indicator.
  if (feedback.snappedX && feedback.snappedX.kind !== 'grid') {
    const x = crisp(feedback.snappedX.value * view.zoom + view.panX);
    out.push(lineV('snap-x', { x, y: 0 }, { x, y: size.height }, { class: 'snap' }));
  }
  if (feedback.snappedY && feedback.snappedY.kind !== 'grid') {
    const y = crisp(feedback.snappedY.value * view.zoom + view.panY);
    out.push(lineV('snap-y', { x: 0, y }, { x: size.width, y }, { class: 'snap' }));
  }
  if (feedback.point) {
    const p = toScreen(view, feedback.point);
    out.push(v('path', 'snap-p', { d: `M${px(p.x - 5)} ${px(p.y - 5)}l10 10m0 -10l-10 10`, class: 'snap' }));
  }
  return out;
}
