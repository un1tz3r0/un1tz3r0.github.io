// Pen tool: click for corner points, drag for smooth points. With "Straight segments
// only" it is a polyline tool. DESIGN.md §6.
//
//   click the first point            close the path and finish
//   Enter, Esc or double-click       finish an open path
//   Backspace                        remove the last point
//   Shift                            constrain to 15° from the previous point
//   click an end of the selected     continue that path
//   open path

import { Tool } from './base.js';
import { createPath, solid, makeStroke } from '../core/model/nodes.js';
import { insertNodes, findNode, patchNodes, worldMatrix } from '../core/model/tree.js';
import { toEditable, fromEditable, reverseSubpath } from '../core/geometry/pathdata.js';
import { toScreen } from '../render/viewport.js';
import { handleV, circleV, lineV, v } from '../render/overlay.js';
import { isIdentity, fmt } from '../core/affine.js';
import { spiroD } from '../core/geometry/extras.js';

const CLOSE_RADIUS = 7;

export class PenTool extends Tool {
  static id = 'pen';
  static label = 'Pen';
  static icon = 'pen-tool';
  static shortcut = 'P';
  static options = [
    { key: 'straight', label: 'Straight segments only (polyline)', type: /** @type {const} */ ('boolean'), default: false },
    { key: 'spiro', label: 'Spiro curve: click points, get a smooth curve through them', type: /** @type {const} */ ('boolean'), default: false },
  ];

  constructor(app) {
    super(app);
    /**
     * @type {{id: string, isNew: boolean, nodes: import('../core/geometry/pathdata.js').Anchor[],
     *         others: import('../core/geometry/pathdata.js').EditSubpath[], node: any} | null}
     */
    this.path = null;
    /** Pointer state while the button is down on a point being added. */
    this.dragging = null;
    this.hover = null;
  }

  deactivate() {
    this.finish();
    this.canvas?.clearSnap();
  }

  /** Style for a new path: the defaults, with a stroke guaranteed so it can be seen. */
  #style() {
    const style = this.editor.store.get('style');
    const visibleStroke = style.stroke.paint.type !== 'none' && style.stroke.width > 0;
    if (visibleStroke || style.fill.type !== 'none') return { fill: style.fill, stroke: style.stroke };
    return { fill: style.fill, stroke: makeStroke({ ...style.stroke, paint: solid('#000000'), width: 1 }) };
  }

  /** Constrain `p` to 15° steps around the last point. */
  #constrain(p, e) {
    const last = this.path?.nodes.at(-1);
    if (!e.shift || !last) return p;
    const len = Math.hypot(p.x - last.x, p.y - last.y);
    const angle = Math.round(Math.atan2(p.y - last.y, p.x - last.x) / (Math.PI / 12)) * (Math.PI / 12);
    return { x: last.x + len * Math.cos(angle), y: last.y + len * Math.sin(angle) };
  }

  #point(e) {
    const exclude = this.path ? [this.path.id] : [];
    return this.#constrain(this.canvas.snap(e.raw, { disabled: e.mod, exclude }), e);
  }

  #nearFirst(e) {
    const first = this.path?.nodes[0];
    if (!first || this.path.nodes.length < 2) return false;
    const s = toScreen(this.view, first);
    return Math.hypot(e.screen.x - s.x, e.screen.y - s.y) <= CLOSE_RADIUS;
  }

  /** If the click is on an end of the selected open path, adopt that path. */
  #tryContinue(e) {
    const sel = this.editor.selection;
    if (sel.length !== 1) return false;
    const node = findNode(this.doc, sel[0]);
    if (node?.type !== 'path' || !isIdentity(worldMatrix(this.doc, node.id))) return false;
    const subpaths = toEditable(node.d);
    for (let i = 0; i < subpaths.length; i++) {
      const sp = subpaths[i];
      if (sp.closed || sp.nodes.length < 1) continue;
      for (const end of ['last', 'first']) {
        const anchor = end === 'last' ? sp.nodes.at(-1) : sp.nodes[0];
        const s = toScreen(this.view, anchor);
        if (Math.hypot(e.screen.x - s.x, e.screen.y - s.y) > CLOSE_RADIUS) continue;
        const ordered = end === 'last' ? sp : reverseSubpath(sp);
        this.editor.begin('Continue path');
        this.path = { id: node.id, isNew: false, nodes: ordered.nodes.map((n) => ({ ...n })), others: subpaths.filter((_, k) => k !== i), node };
        return true;
      }
    }
    return false;
  }

  /** Write the working path into the document as a preview. */
  #sync(closed = false) {
    const path = this.path;
    let d = fromEditable([...path.others, { closed, nodes: path.nodes }]);
    if (this.options.spiro && path.nodes.length > 2) {
      // The clicked points become spiro knots; the curve is solved through all of them.
      const curve = spiroD(path.nodes, closed);
      if (curve) d = [fromEditable(path.others), curve].filter(Boolean).join(' ');
    }
    if (path.isNew) {
      const node = { ...path.node, d };
      const parentId = this.parentId();
      this.editor.preview((doc) => insertNodes(doc, parentId, [node]));
    } else {
      this.editor.preview((doc) => patchNodes(doc, [path.id], { d }));
    }
  }

  onPointerDown(e) {
    if (e.button !== 0) return;
    // An undo (or anything else that ended our gesture) invalidates the working path.
    if (this.path && !this.editor.gesture) this.path = null;

    if (!this.path) {
      if (this.#tryContinue(e)) {
        this.invalidate();
        return;
      }
      const p = this.canvas.snap(e.raw, { disabled: e.mod });
      const node = createPath('', this.#style());
      this.editor.begin('Draw path');
      this.path = { id: node.id, isNew: true, nodes: [{ x: p.x, y: p.y, hin: null, hout: null, type: 'corner' }], others: [], node };
      this.dragging = { index: 0, origin: p };
      this.invalidate();
      return;
    }
    if (this.#nearFirst(e)) {
      this.#sync(true);
      this.#commit();
      return;
    }
    const p = this.#point(e);
    this.path.nodes.push({ x: p.x, y: p.y, hin: null, hout: null, type: 'corner' });
    this.dragging = { index: this.path.nodes.length - 1, origin: p };
    this.#sync();
    this.invalidate();
  }

  onPointerMove(e) {
    this.hover = e;
    const drag = this.dragging;
    if (drag && this.path && !this.options.straight && !this.options.spiro) {
      // Dragging pulls out a pair of mirrored handles.
      const p = this.canvas.snap(e.raw, { disabled: e.mod, exclude: [this.path.id], silent: true });
      const node = this.path.nodes[drag.index];
      const dx = p.x - node.x;
      const dy = p.y - node.y;
      if (Math.hypot(dx, dy) * this.view.zoom > 3) {
        this.path.nodes[drag.index] = {
          ...node,
          hout: { x: node.x + dx, y: node.y + dy },
          hin: drag.index > 0 ? { x: node.x - dx, y: node.y - dy } : null,
          type: 'symmetric',
        };
        if (this.path.nodes.length > 1) this.#sync();
      }
    } else if (this.path) {
      this.#point(e);
    } else {
      this.canvas.snap(e.raw, { disabled: e.mod });
    }
    this.invalidate();
  }

  onPointerUp() {
    this.dragging = null;
  }

  onPointerCancel() {
    this.dragging = null;
  }

  onDoubleClick() {
    // The second click of the double-click added a point on top of the previous one.
    if (this.path && this.path.nodes.length > 2) {
      const [a, b] = this.path.nodes.slice(-2);
      if (Math.hypot(a.x - b.x, a.y - b.y) * this.view.zoom < 3) this.path.nodes.pop();
    }
    this.finish();
  }

  #commit() {
    const id = this.path.id;
    this.path = null;
    this.dragging = null;
    this.canvas.clearSnap();
    this.editor.commit({ selection: [id] });
    this.invalidate();
  }

  /** Finish the path as it stands. A path with fewer than two points is discarded. */
  finish() {
    if (!this.path) return;
    if (!this.editor.gesture) {
      this.path = null;
      return;
    }
    if (this.path.nodes.length < 2) {
      this.editor.cancel();
      this.path = null;
      this.invalidate();
      return;
    }
    this.#sync();
    this.#commit();
  }

  onKeyDown(e) {
    if (e.key === 'Enter') {
      if (!this.path) return false;
      this.finish();
      return true;
    }
    if (e.key === 'Escape') {
      if (this.path) this.finish();
      else this.editor.setTool('select');
      return true;
    }
    if ((e.key === 'Backspace' || e.key === 'Delete') && this.path) {
      this.path.nodes.pop();
      if (this.path.nodes.length === 0) {
        this.editor.cancel();
        this.path = null;
      } else if (this.path.nodes.length > 1 || !this.path.isNew) {
        this.#sync();
      } else {
        // One point left of a new path: nothing to draw yet.
        this.editor.preview((doc) => doc);
      }
      this.invalidate();
      return true;
    }
    return false;
  }

  cursor() {
    return 'crosshair';
  }

  overlay() {
    const path = this.path;
    const view = this.view;
    const out = [];
    if (!path) return out;
    const pts = path.nodes.map((n) => toScreen(view, n));
    // Outline of what has been drawn so far.
    const s = (p) => `${fmt(p.x, 2)} ${fmt(p.y, 2)}`;
    let d = '';
    path.nodes.forEach((n, i) => {
      if (i === 0) {
        d += `M${s(pts[0])}`;
        return;
      }
      const prev = path.nodes[i - 1];
      if (!prev.hout && !n.hin) d += `L${s(pts[i])}`;
      else d += `C${s(toScreen(view, prev.hout ?? prev))} ${s(toScreen(view, n.hin ?? n))} ${s(pts[i])}`;
    });
    // Rubber band from the last point to the pointer.
    const last = path.nodes.at(-1);
    if (this.hover && !this.dragging && last) {
      const closing = this.#nearFirst(this.hover);
      const target = closing ? path.nodes[0] : this.#constrain(this.canvas.snap(this.hover.raw, { disabled: this.hover.mod, exclude: [path.id], silent: true }), this.hover);
      const ts = toScreen(view, target);
      if (last.hout || (closing && path.nodes[0].hin)) {
        d += `C${s(toScreen(view, last.hout ?? last))} ${s(toScreen(view, (closing && path.nodes[0].hin) || target))} ${s(ts)}`;
      } else d += `L${s(ts)}`;
    }
    out.push(v('path', 'pen-outline', { d, class: 'preview' }));
    // Handles of the point being shaped (or the last one placed).
    const active = path.nodes.at(-1);
    if (active?.hout) {
      const a = toScreen(view, active);
      for (const [key, hnd] of [['hin', active.hin], ['hout', active.hout]]) {
        if (!hnd) continue;
        const hs = toScreen(view, hnd);
        out.push(lineV(`pen-hl-${key}`, a, hs, { class: 'anchor-line' }), circleV(`pen-h-${key}`, hs, 3, { class: 'handle' }));
      }
    }
    pts.forEach((p, i) => {
      const closing = i === 0 && this.hover && this.#nearFirst(this.hover);
      out.push(handleV(`pen-n-${i}`, p, { class: i === pts.length - 1 || closing ? 'handle on' : 'handle' }, closing ? 9 : 7));
    });
    return out;
  }
}
