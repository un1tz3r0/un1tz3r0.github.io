// Select tool: pick, move, scale, rotate, marquee. Also Pan and Zoom, which are small.

import { Tool } from './base.js';
import { rectV, handleV, v, boxToScreen } from '../render/overlay.js';
import { selectionBounds, worldBounds } from '../core/geometry/bounds.js';
import { transformSelection } from '../core/geometry/transform.js';
import { duplicateNodes } from '../core/model/edit.js';
import { childrenOf, findNode, parentOf, topLevel, isEffectivelyLocked } from '../core/model/tree.js';
import { translate, scale, rotate, boxFromPoints, boxContainsBox, boxesIntersect, fmt } from '../core/affine.js';
import { toScreen, zoomAt, nextZoomStep } from '../render/viewport.js';

const HANDLES = [
  { id: 'nw', hx: -1, hy: -1, cursor: 'nwse-resize' },
  { id: 'n', hx: 0, hy: -1, cursor: 'ns-resize' },
  { id: 'ne', hx: 1, hy: -1, cursor: 'nesw-resize' },
  { id: 'e', hx: 1, hy: 0, cursor: 'ew-resize' },
  { id: 'se', hx: 1, hy: 1, cursor: 'nwse-resize' },
  { id: 's', hx: 0, hy: 1, cursor: 'ns-resize' },
  { id: 'sw', hx: -1, hy: 1, cursor: 'nesw-resize' },
  { id: 'w', hx: -1, hy: 0, cursor: 'ew-resize' },
];

const ROTATE_CURSOR =
  `url("data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#fff" stroke-width="4"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.9 1 6.7 2.7L21 8"/><path d="M21 3v5h-5"/></g><g stroke="#000" stroke-width="1.8"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.9 1 6.7 2.7L21 8"/><path d="M21 3v5h-5"/></g></svg>',
  )}") 12 12, crosshair`;

const DRAG_THRESHOLD = 3;

export class SelectTool extends Tool {
  static id = 'select';
  static label = 'Select';
  static icon = 'mouse-pointer-2';
  static shortcut = 'V';

  constructor(app) {
    super(app);
    /** @type {any} */
    this.state = null;
    this.hoverId = null;
    this.hoverHandle = null;
  }

  deactivate() {
    if (this.state && this.editor.gesture) this.editor.cancel();
    this.state = null;
    this.hoverId = null;
    this.hoverHandle = null;
  }

  #selectionBox() {
    const sel = this.editor.selection;
    return sel.length ? selectionBounds(this.doc, sel) : null;
  }

  /** Screen positions of the eight handles of a document-space box. */
  #handlePoints(box) {
    const s = boxToScreen(this.view, box);
    return HANDLES.map((hd) => ({
      ...hd,
      p: { x: s.x + ((hd.hx + 1) / 2) * s.width, y: s.y + ((hd.hy + 1) / 2) * s.height },
    }));
  }

  #handleAt(screen) {
    const box = this.#selectionBox();
    if (!box) return null;
    const points = this.#handlePoints(box);
    const s = boxToScreen(this.view, box);
    const reach = this.canvas.hitRadius;
    // On a very small selection the edge handles would cover the corners; drop them.
    const small = s.width < 24 || s.height < 24;
    for (const hd of points) {
      if (small && (hd.hx === 0 || hd.hy === 0)) continue;
      if (Math.abs(screen.x - hd.p.x) <= reach && Math.abs(screen.y - hd.p.y) <= reach) return { ...hd, type: 'scale' };
    }
    // A ring just outside each corner rotates.
    for (const hd of points) {
      if (hd.hx === 0 || hd.hy === 0) continue;
      const dx = screen.x - hd.p.x;
      const dy = screen.y - hd.p.y;
      const outside = dx * hd.hx >= -2 && dy * hd.hy >= -2 && (dx * hd.hx > reach || dy * hd.hy > reach);
      if (outside && Math.hypot(dx, dy) <= reach + 16) return { ...hd, type: 'rotate' };
    }
    return null;
  }

  onPointerDown(e) {
    if (e.button !== 0) return;
    const editor = this.editor;
    const handle = this.#handleAt(e.screen);
    if (handle) {
      const box = this.#selectionBox();
      const ids = topLevel(this.doc, editor.selection).filter((id) => !isEffectivelyLocked(this.doc, id));
      if (!ids.length) return;
      editor.begin(handle.type === 'rotate' ? 'Rotate' : 'Resize');
      this.state = { type: handle.type, handle, box, ids, start: e.raw, angle: 0 };
      return;
    }
    const id = e.hit({ deep: e.mod });
    const before = editor.selection;
    if (id) {
      const parent = parentOf(this.doc, id);
      editor.store.set({ scope: parent?.id ?? null });
      const wasSelected = editor.selection.includes(id);
      if (e.shift) {
        editor.select(wasSelected ? editor.selection.filter((s) => s !== id) : [...editor.selection, id]);
      } else if (!wasSelected) {
        editor.select([id]);
      }
      if (editor.selection.includes(id)) {
        this.state = { type: 'pending', id, wasSelected, start: e.raw, startScreen: e.screen, alt: e.alt, shift: e.shift, client: e.client, before };
      }
    } else {
      this.state = { type: 'marquee', start: e.raw, current: e.raw, startScreen: e.screen, shift: e.shift, base: editor.selection };
    }
    this.hoverId = null;
    this.invalidate();
  }

  onPointerMove(e) {
    const st = this.state;
    if (!st) {
      const handle = this.#handleAt(e.screen);
      const hover = handle ? null : e.hit();
      if (handle?.id !== this.hoverHandle?.id || handle?.type !== this.hoverHandle?.type || hover !== this.hoverId) {
        this.hoverHandle = handle;
        this.hoverId = hover;
        this.invalidate();
      }
      return;
    }
    if (st.type === 'pending') {
      if (Math.hypot(e.screen.x - st.startScreen.x, e.screen.y - st.startScreen.y) < DRAG_THRESHOLD) return;
      this.#beginMove(st);
    }
    const cur = this.state;
    if (cur.type === 'move') this.#move(cur, e);
    else if (cur.type === 'scale') this.#scale(cur, e);
    else if (cur.type === 'rotate') this.#rotate(cur, e);
    else if (cur.type === 'marquee') {
      cur.current = e.raw;
      this.invalidate();
    }
  }

  #beginMove(st) {
    const editor = this.editor;
    let ids = topLevel(this.doc, editor.selection).filter((id) => !isEffectivelyLocked(this.doc, id));
    let prepare = (doc) => doc;
    if (st.alt) {
      // Alt-drag leaves the originals where they are and moves copies.
      const dup = duplicateNodes(this.doc, ids);
      const base = this.doc;
      prepare = (doc) => (doc === base ? dup.doc : duplicateNodes(doc, ids).doc);
      ids = dup.selection;
      editor.begin('Duplicate');
    } else {
      editor.begin('Move');
    }
    const basis = prepare(this.doc);
    this.state = { type: 'move', ids, start: st.start, box: selectionBounds(basis, ids), prepare, basis, exclude: ids, delta: { x: 0, y: 0 } };
  }

  #move(st, e) {
    let dx = e.raw.x - st.start.x;
    let dy = e.raw.y - st.start.y;
    if (e.shift) {
      if (Math.abs(dx) > Math.abs(dy)) dy = 0;
      else dx = 0;
    }
    if (st.box) {
      const adj = this.canvas.snapBox({ ...st.box, x: st.box.x + dx, y: st.box.y + dy }, { exclude: st.exclude, disabled: e.mod });
      // With Shift one axis is locked at zero; snapping must not move it.
      if (!(e.shift && dx === 0)) dx += adj.dx;
      if (!(e.shift && dy === 0)) dy += adj.dy;
    }
    st.delta = { x: dx, y: dy };
    this.editor.preview(() => transformSelection(st.basis, st.ids, translate(dx, dy)));
    if (this.editor.selection !== st.ids) this.editor.store.set({ selection: st.ids });
  }

  #scale(st, e) {
    const { box, handle } = st;
    const p = this.canvas.snap(e.raw, { exclude: st.ids, disabled: e.mod });
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    // The point that stays fixed: the opposite side, or the center with Alt.
    const anchor = {
      x: e.alt ? cx : handle.hx < 0 ? box.x + box.width : handle.hx > 0 ? box.x : cx,
      y: e.alt ? cy : handle.hy < 0 ? box.y + box.height : handle.hy > 0 ? box.y : cy,
    };
    const h0 = { x: box.x + ((handle.hx + 1) / 2) * box.width, y: box.y + ((handle.hy + 1) / 2) * box.height };
    const ratio = (cur, from, pivot) => (Math.abs(from - pivot) < 1e-9 ? 1 : (cur - pivot) / (from - pivot));
    let sx = handle.hx ? ratio(p.x, h0.x, anchor.x) : 1;
    let sy = handle.hy ? ratio(p.y, h0.y, anchor.y) : 1;
    if (e.shift) {
      if (handle.hx && handle.hy) {
        const s = Math.max(Math.abs(sx), Math.abs(sy));
        sx = Math.sign(sx || 1) * s;
        sy = Math.sign(sy || 1) * s;
      } else if (handle.hx) sy = Math.abs(sx);
      else sx = Math.abs(sy);
    }
    const guard = (s) => (Math.abs(s) < 1e-4 ? (s < 0 ? -1e-4 : 1e-4) : s);
    sx = guard(sx);
    sy = guard(sy);
    st.size = { width: Math.abs(box.width * sx), height: Math.abs(box.height * sy) };
    this.editor.preview((doc) => transformSelection(doc, st.ids, scale(sx, sy, anchor.x, anchor.y)));
  }

  #rotate(st, e) {
    const c = { x: st.box.x + st.box.width / 2, y: st.box.y + st.box.height / 2 };
    const a0 = Math.atan2(st.start.y - c.y, st.start.x - c.x);
    let angle = Math.atan2(e.raw.y - c.y, e.raw.x - c.x) - a0;
    if (e.shift) angle = Math.round(angle / (Math.PI / 12)) * (Math.PI / 12);
    st.angle = angle;
    this.editor.preview((doc) => transformSelection(doc, st.ids, rotate(angle, c.x, c.y)));
  }

  onPointerUp(e) {
    const st = this.state;
    this.state = null;
    const editor = this.editor;
    this.canvas.clearSnap();
    if (!st) return;
    if (st.type === 'pending') {
      if (st.alt && !st.shift) {
        // Alt-click (without dragging) reaches the next object underneath, cycling
        // through everything stacked at that point.
        const stack = this.canvas.hitTestAll(st.client.x, st.client.y);
        // Measured from what was selected before this click, which itself picked the top one.
        const current = stack.findIndex((id) => st.before.includes(id));
        const next = stack[(current + 1) % stack.length];
        if (next) editor.select([next]);
      } else if (!st.shift && st.wasSelected && editor.selection.length > 1) {
        // A plain click on one member of a multi-selection narrows it to that member.
        editor.select([st.id]);
      }
    } else if (st.type === 'move' || st.type === 'scale' || st.type === 'rotate') {
      editor.commit({ selection: st.ids });
    } else if (st.type === 'marquee') {
      const moved = Math.hypot(e.screen.x - st.startScreen.x, e.screen.y - st.startScreen.y) >= DRAG_THRESHOLD;
      if (!moved) {
        if (!st.shift) {
          editor.select([]);
          editor.store.set({ scope: null });
        }
      } else {
        const area = boxFromPoints(st.start, e.raw);
        // Dragging rightwards selects what is enclosed; leftwards, anything touched.
        const enclose = e.raw.x >= st.start.x;
        const scope = editor.store.get('scope');
        const hits = childrenOf(this.doc, scope)
          .filter((n) => n.visible && !n.locked)
          .filter((n) => {
            const b = worldBounds(this.doc, n.id);
            return b && (enclose ? boxContainsBox(area, b) : boxesIntersect(area, b));
          })
          .map((n) => n.id);
        editor.select(st.shift ? [...new Set([...st.base, ...hits])] : hits);
      }
    }
    this.invalidate();
  }

  onPointerCancel() {
    if (this.editor.gesture) this.editor.cancel();
    this.state = null;
    this.canvas.clearSnap();
    this.invalidate();
  }

  onDoubleClick(e) {
    const editor = this.editor;
    const id = e.hit();
    if (!id) {
      editor.store.set({ scope: null });
      return;
    }
    const node = findNode(this.doc, id);
    if (node.type === 'group') {
      editor.store.set({ scope: id });
      const inner = e.hit();
      editor.select(inner && inner !== id ? [inner] : []);
    } else if (node.type === 'path' || node.type === 'shape') {
      editor.select([id]);
      editor.setTool('node');
    } else if (node.type === 'text') {
      editor.select([id]);
      editor.setTool('text');
      /** @type {any} */ (this.app.tools.get('text'))?.edit?.(id);
    }
  }

  onKeyDown(e) {
    if (e.key !== 'Escape') return false;
    const editor = this.editor;
    if (this.state) {
      this.onPointerCancel();
      return true;
    }
    const scope = editor.store.get('scope');
    if (scope) {
      const parent = parentOf(this.doc, scope);
      editor.store.set({ scope: parent?.id ?? null });
      editor.select([scope]);
      return true;
    }
    if (editor.selection.length) {
      editor.select([]);
      return true;
    }
    return false;
  }

  cursor() {
    const st = this.state;
    if (st?.type === 'move') return 'move';
    const handle = st?.handle ?? this.hoverHandle;
    if (handle) return handle.type === 'rotate' ? ROTATE_CURSOR : handle.cursor;
    return 'default';
  }

  overlay() {
    const out = [];
    const doc = this.doc;
    const view = this.view;
    const sel = topLevel(doc, this.editor.selection);
    const st = this.state;
    const scope = this.editor.store.get('scope');

    if (scope) {
      const b = worldBounds(doc, scope);
      if (b) out.push(rectV('scope', boxToScreen(view, b), { class: 'sel dim', 'stroke-dasharray': '2 3' }));
    }
    if (!st && this.hoverId && !sel.includes(this.hoverId)) {
      const b = worldBounds(doc, this.hoverId);
      if (b) out.push(rectV('hover', boxToScreen(view, b), { class: 'sel hover' }));
    }
    if (sel.length > 1) {
      for (const id of sel) {
        const b = worldBounds(doc, id);
        if (b) out.push(rectV(`item-${id}`, boxToScreen(view, b), { class: 'sel dim' }));
      }
    }
    const box = sel.length ? selectionBounds(doc, sel) : null;
    if (box) {
      const s = boxToScreen(view, box);
      out.push(rectV('selbox', s, { class: 'sel' }));
      if (!st || st.type === 'scale' || st.type === 'pending') {
        const small = s.width < 24 || s.height < 24;
        for (const hd of this.#handlePoints(box)) {
          if (small && (hd.hx === 0 || hd.hy === 0)) continue;
          out.push(handleV(`h-${hd.id}`, hd.p));
        }
      }
      let label = null;
      if (st?.type === 'scale' && st.size) label = `${fmt(st.size.width, 2)} × ${fmt(st.size.height, 2)}`;
      else if (st?.type === 'rotate') label = `${fmt((st.angle * 180) / Math.PI, 1)}°`;
      else if (st?.type === 'move') label = `${fmt(st.delta.x, 2)}, ${fmt(st.delta.y, 2)}`;
      if (label) {
        out.push({
          tag: 'text',
          key: 'sel-label',
          attrs: { x: fmt(s.x + s.width / 2, 1), y: fmt(s.y + s.height + 18, 1), 'text-anchor': 'middle', class: 'label' },
          text: label,
        });
      }
    }
    if (st?.type === 'marquee') {
      const a = toScreen(view, st.start);
      const b = toScreen(view, st.current);
      out.push(rectV('marquee', boxFromPoints(a, b), { class: 'marquee' }));
    }
    return out;
  }
}

export class PanTool extends Tool {
  static id = 'pan';
  static label = 'Pan';
  static icon = 'hand';
  static shortcut = 'H';

  constructor(app) {
    super(app);
    this.drag = null;
  }

  onPointerDown(e) {
    this.drag = { x: e.client.x, y: e.client.y, view: this.view };
  }

  onPointerMove(e) {
    if (!this.drag) return;
    const { view } = this.drag;
    this.canvas.setView({ ...view, panX: view.panX + e.client.x - this.drag.x, panY: view.panY + e.client.y - this.drag.y });
  }

  onPointerUp() {
    this.drag = null;
  }

  onPointerCancel() {
    this.drag = null;
  }

  cursor() {
    return this.drag ? 'grabbing' : 'grab';
  }
}

export class ZoomTool extends Tool {
  static id = 'zoom';
  static label = 'Zoom';
  static icon = 'zoom-in';
  static shortcut = 'Z';

  constructor(app) {
    super(app);
    this.drag = null;
    this.alt = false;
  }

  onPointerDown(e) {
    this.drag = { start: e.raw, current: e.raw, startScreen: e.screen };
  }

  onPointerMove(e) {
    this.alt = e.alt;
    if (!this.drag) return;
    this.drag.current = e.raw;
    this.invalidate();
  }

  onPointerUp(e) {
    const drag = this.drag;
    this.drag = null;
    if (!drag) return;
    const dragged = Math.hypot(e.screen.x - drag.startScreen.x, e.screen.y - drag.startScreen.y) > 4;
    if (dragged) this.canvas.zoomToFit(boxFromPoints(drag.start, e.raw));
    else this.canvas.setView(zoomAt(this.view, nextZoomStep(this.view.zoom, e.alt ? -1 : 1), e.screen));
    this.invalidate();
  }

  onPointerCancel() {
    this.drag = null;
    this.invalidate();
  }

  cursor() {
    return this.alt ? 'zoom-out' : 'zoom-in';
  }

  overlay() {
    if (!this.drag) return [];
    const a = toScreen(this.view, this.drag.start);
    const b = toScreen(this.view, this.drag.current);
    return [rectV('zoom-box', boxFromPoints(a, b), { class: 'marquee' })];
  }
}

export { v };
