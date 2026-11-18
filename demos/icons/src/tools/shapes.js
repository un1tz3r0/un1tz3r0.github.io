// Shape tools: rectangle, ellipse, polygon/star, line. DESIGN.md §6.
//
// Drag to draw; a plain click drops a default-sized shape. Shift constrains (square,
// circle, 15° steps), Alt draws from the center, Ctrl/Cmd suspends snapping.

import { Tool } from './base.js';
import { createShape, solid, makeStroke } from '../core/model/nodes.js';
import { insertNodes } from '../core/model/tree.js';
import { toScreen } from '../render/viewport.js';
import { fmt } from '../core/affine.js';

const DRAG_THRESHOLD = 3;

class ShapeTool extends Tool {
  static group = 'shape';
  /** @type {'rect'|'ellipse'|'polygon'|'star'|'line'} */
  static shape = 'rect';

  constructor(app) {
    super(app);
    /** @type {any} */
    this.drag = null;
    this.hover = null;
  }

  deactivate() {
    if (this.drag?.started) this.editor.cancel();
    this.drag = null;
    this.canvas?.clearSnap();
  }

  /** Fill and stroke for a new shape, from the current default style. */
  style() {
    const style = this.editor.store.get('style');
    return { fill: style.fill, stroke: style.stroke };
  }

  /**
   * Shape parameters for a drag from `a` to `b` (document points).
   * @returns {{shape: string, params: any, label: string} | null}
   */
  // eslint-disable-next-line no-unused-vars
  geometry(a, b, e) {
    return null;
  }

  onPointerDown(e) {
    if (e.button !== 0) return;
    const start = this.canvas.snap(e.raw, { disabled: e.mod });
    this.drag = { start, startScreen: e.screen, started: false, id: null, label: '' };
  }

  onPointerMove(e) {
    this.hover = e;
    const drag = this.drag;
    if (!drag) {
      // Show what the first corner would snap to.
      this.canvas.snap(e.raw, { disabled: e.mod });
      return;
    }
    if (!drag.started) {
      if (Math.hypot(e.screen.x - drag.startScreen.x, e.screen.y - drag.startScreen.y) < DRAG_THRESHOLD) return;
      drag.started = true;
      this.editor.begin(`Draw ${/** @type {any} */ (this.constructor).label.toLowerCase()}`);
    }
    this.#update(drag, this.canvas.snap(e.raw, { disabled: e.mod }), e);
  }

  #update(drag, point, e) {
    const geo = this.geometry(drag.start, point, e);
    if (!geo) return;
    drag.label = geo.label;
    if (!drag.node) drag.node = createShape(geo.shape, geo.params, this.style());
    const node = { ...drag.node, shape: geo.shape, params: { ...drag.node.params, ...geo.params } };
    drag.node = node;
    const parentId = this.parentId();
    this.editor.preview((doc) => insertNodes(doc, parentId, [node]));
    this.invalidate();
  }

  onPointerUp(e) {
    const drag = this.drag;
    this.drag = null;
    this.canvas.clearSnap();
    if (!drag) return;
    if (!drag.started) {
      // A click: place a default-sized shape centered on the pointer.
      const size = Math.max(this.doc.artboard.width, this.doc.artboard.height) / 4;
      const c = drag.start;
      this.editor.begin(`Draw ${/** @type {any} */ (this.constructor).label.toLowerCase()}`);
      const geo = this.geometry({ x: c.x - size / 2, y: c.y - size / 2 }, { x: c.x + size / 2, y: c.y + size / 2 }, { ...e, alt: false, shift: true, click: true });
      if (!geo) {
        this.editor.cancel();
        return;
      }
      drag.node = createShape(geo.shape, geo.params, this.style());
      const parentId = this.parentId();
      this.editor.preview((doc) => insertNodes(doc, parentId, [drag.node]));
    }
    this.editor.commit({ selection: drag.node ? [drag.node.id] : undefined });
    this.invalidate();
  }

  onPointerCancel() {
    if (this.drag?.started) this.editor.cancel();
    this.drag = null;
    this.canvas.clearSnap();
    this.invalidate();
  }

  onKeyDown(e) {
    if (e.key !== 'Escape') return false;
    if (this.drag) this.onPointerCancel();
    else this.editor.setTool('select');
    return true;
  }

  cursor() {
    return 'crosshair';
  }

  overlay() {
    const drag = this.drag;
    if (!drag?.started || !drag.label || !this.hover) return [];
    const p = toScreen(this.view, this.hover.raw);
    return [{ tag: 'text', key: 'shape-label', attrs: { x: fmt(p.x + 14, 1), y: fmt(p.y + 22, 1), class: 'label' }, text: drag.label }];
  }
}

/** A box from two points with the Shift (equal sides) and Alt (from center) modifiers. */
function modifiedBox(a, b, e) {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  if (e.shift) {
    const s = Math.max(Math.abs(dx), Math.abs(dy));
    dx = (dx < 0 ? -1 : 1) * s;
    dy = (dy < 0 ? -1 : 1) * s;
  }
  if (e.alt) return { x: a.x - Math.abs(dx), y: a.y - Math.abs(dy), width: Math.abs(dx) * 2, height: Math.abs(dy) * 2 };
  return { x: Math.min(a.x, a.x + dx), y: Math.min(a.y, a.y + dy), width: Math.abs(dx), height: Math.abs(dy) };
}

export class RectTool extends ShapeTool {
  static id = 'rect';
  static label = 'Rectangle';
  static icon = 'square';
  static shortcut = 'R';
  static shape = /** @type {const} */ ('rect');
  static options = [{ key: 'radius', label: 'Corner radius', type: /** @type {const} */ ('number'), default: 0, min: 0, step: 1 }];

  geometry(a, b, e) {
    const box = modifiedBox(a, b, e);
    const r = Math.min(this.options.radius, box.width / 2, box.height / 2);
    return { shape: 'rect', params: { ...box, rx: r, ry: r }, label: `${fmt(box.width, 2)} × ${fmt(box.height, 2)}` };
  }
}

export class EllipseTool extends ShapeTool {
  static id = 'ellipse';
  static label = 'Ellipse';
  static icon = 'circle';
  static shortcut = 'E';
  static shape = /** @type {const} */ ('ellipse');

  geometry(a, b, e) {
    const box = modifiedBox(a, b, e);
    return {
      shape: 'ellipse',
      params: { cx: box.x + box.width / 2, cy: box.y + box.height / 2, rx: box.width / 2, ry: box.height / 2 },
      label: `${fmt(box.width, 2)} × ${fmt(box.height, 2)}`,
    };
  }
}

export class PolygonTool extends ShapeTool {
  static id = 'polygon';
  static label = 'Polygon / star';
  static icon = 'hexagon';
  static shortcut = 'Y';
  static shape = /** @type {const} */ ('polygon');
  static options = [
    { key: 'kind', label: 'Shape', type: /** @type {const} */ ('select'), default: 'polygon', options: [{ value: 'polygon', label: 'Polygon' }, { value: 'star', label: 'Star' }] },
    { key: 'sides', label: 'Sides / points', type: /** @type {const} */ ('number'), default: 6, min: 3, max: 64, step: 1, precision: 0 },
    { key: 'ratio', label: 'Star inner ratio', type: /** @type {const} */ ('number'), default: 0.5, min: 0.05, max: 1, step: 0.05 },
    { key: 'rounding', label: 'Corner rounding', type: /** @type {const} */ ('number'), default: 0, min: 0, step: 0.5 },
  ];

  // Polygons always grow from their center: that is the only anchor that makes sense for
  // a shape defined by a radius.
  geometry(a, b, e) {
    const o = this.options;
    let center = a;
    let edge = b;
    if (e.click) {
      center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      edge = { x: center.x, y: a.y };
    }
    const radius = Math.hypot(edge.x - center.x, edge.y - center.y);
    // The first vertex points at the pointer; Shift keeps the shape upright in 15° steps.
    let rotation = Math.atan2(edge.y - center.y, edge.x - center.x) + Math.PI / 2;
    if (e.shift) rotation = Math.round(rotation / (Math.PI / 12)) * (Math.PI / 12);
    const sides = Math.max(3, Math.round(o.sides));
    const label = `r ${fmt(radius, 2)}`;
    if (o.kind === 'star') {
      return { shape: 'star', params: { cx: center.x, cy: center.y, outer: radius, inner: radius * o.ratio, points: sides, rounding: o.rounding, rotation }, label };
    }
    return { shape: 'polygon', params: { cx: center.x, cy: center.y, radius, sides, rounding: o.rounding, rotation }, label };
  }
}

export class LineTool extends ShapeTool {
  static id = 'line';
  static label = 'Line';
  static icon = 'slash';
  static shortcut = 'L';
  static shape = /** @type {const} */ ('line');

  style() {
    // A line with no stroke would be invisible; borrow the fill color if need be.
    const style = this.editor.store.get('style');
    const stroke = style.stroke.paint.type !== 'none' && style.stroke.width > 0
      ? style.stroke
      : makeStroke({
          ...style.stroke,
          paint: style.fill.type !== 'none' ? style.fill : solid('#000000'),
          width: Math.max(1, Math.round(Math.max(this.doc.artboard.width, this.doc.artboard.height) / 64)),
        });
    return { fill: /** @type {any} */ ({ type: 'none' }), stroke };
  }

  geometry(a, b, e) {
    let end = b;
    if (e.click) {
      end = { x: b.x, y: (a.y + b.y) / 2 };
      a = { x: a.x, y: end.y };
    } else if (e.shift) {
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const angle = Math.round(Math.atan2(b.y - a.y, b.x - a.x) / (Math.PI / 12)) * (Math.PI / 12);
      end = { x: a.x + len * Math.cos(angle), y: a.y + len * Math.sin(angle) };
    }
    const len = Math.hypot(end.x - a.x, end.y - a.y);
    const deg = (Math.atan2(end.y - a.y, end.x - a.x) * 180) / Math.PI;
    return { shape: 'line', params: { x1: a.x, y1: a.y, x2: end.x, y2: end.y }, label: `${fmt(len, 2)} · ${fmt(deg, 1)}°` };
  }
}
