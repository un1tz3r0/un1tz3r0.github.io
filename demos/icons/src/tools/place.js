// Place tool: put the icon chosen in the asset panel onto the canvas. DESIGN.md §6.

import { Tool } from './base.js';
import { createIcon } from '../core/model/nodes.js';
import { insertNodes, updateNodes } from '../core/model/tree.js';
import { sanitizeBody, namespaceIds } from '../core/io/sanitize.js';
import { translate, fmt } from '../core/affine.js';
import { toScreen } from '../render/viewport.js';
import { rectV } from '../render/overlay.js';
import { storage } from '../services/storage/index.js';

export class PlaceTool extends Tool {
  static id = 'place';
  static label = 'Place icon';
  static icon = 'shapes';
  static shortcut = 'I';
  static assetTab = 'icons';
  static options = [
    {
      key: 'size', label: 'Click size', type: /** @type {const} */ ('select'), default: 'auto',
      options: [{ value: 'auto', label: 'Fit the artboard' }, { value: 'natural', label: "Icon's own size" }],
    },
    { key: 'keep', label: 'Keep placing after each click', type: /** @type {const} */ ('boolean'), default: false },
  ];

  constructor(app) {
    super(app);
    /** @type {import('../services/icons/iconify.js').IconData | null} sanitized, ready to place */
    this.icon = null;
    this.hover = null;
    this.drag = null;
    /** Ids of icon nodes to replace with the next icon picked. */
    this.replaceIds = null;
  }

  /**
   * Choose the icon to place. Fetches it if necessary and sanitizes its markup.
   * @param {{prefix: string, name: string}} ref
   */
  async setIcon(ref) {
    const [data] = await this.app.services.icons.getIcons(ref.prefix, [ref.name]);
    if (!data) throw new Error(`Icon ${ref.prefix}:${ref.name} not found`);
    // External markup is sanitized exactly once, here, before it can reach the document.
    const body = namespaceIds(sanitizeBody(data.body), `${ref.prefix}-${ref.name}`);
    this.icon = { ...data, body };
    if (this.replaceIds?.length) this.#replace();
    this.invalidate();
    return this.icon;
  }

  /** The next icon picked will replace these nodes instead of being placed. */
  beginReplace(ids) {
    this.replaceIds = [...ids];
  }

  #replace() {
    const icon = this.icon;
    const ids = this.replaceIds;
    this.replaceIds = null;
    this.editor.apply('Replace icon', (doc) =>
      updateNodes(doc, ids, (node) => {
        if (node.type !== 'icon') return node;
        const [, , vw, vh] = icon.viewBox;
        return {
          ...node,
          name: icon.name,
          source: { provider: 'iconify', prefix: icon.prefix, name: icon.name },
          body: icon.body,
          viewBox: icon.viewBox,
          palette: icon.palette,
          // Keep the width; let the height follow the new icon's proportions.
          height: (node.width * vh) / (vw || 1),
        };
      }),
    );
    this.#remember(icon);
    this.editor.setTool('select');
  }

  deactivate() {
    this.hover = null;
    this.drag = null;
    this.replaceIds = null;
    this.canvas?.clearSnap();
  }

  /** Size a click places the icon at. */
  #clickSize() {
    const [, , vw, vh] = this.icon.viewBox;
    if (this.options.size === 'natural') return { width: vw, height: vh };
    // About a third of the artboard, as a whole multiple of the icon's own size when it
    // has to grow (so a 24-unit icon stays on its pixel grid).
    const { width, height } = this.doc.artboard;
    let k = Math.min(width, height) / 3 / Math.max(vw, vh);
    k = k >= 1 ? Math.round(k) : k;
    return { width: vw * k, height: vh * k };
  }

  #color() {
    const fill = this.editor.store.get('style').fill;
    return fill?.type === 'solid' ? fill.color.slice(0, 7) : '#000000';
  }

  #remember(icon) {
    const key = `${icon.prefix}:${icon.name}`;
    storage.set('iconRecents', key, { prefix: icon.prefix, name: icon.name, time: Date.now() });
  }

  /** Insert the current icon with its top-left corner at `box`. */
  #insert(box) {
    const icon = this.icon;
    const node = createIcon(icon, {
      width: box.width,
      height: box.height,
      transform: translate(box.x, box.y),
      color: this.#color(),
    });
    const parentId = this.parentId();
    this.editor.apply('Place icon', (doc) => insertNodes(doc, parentId, [node]), { selection: [node.id] });
    this.#remember(icon);
    return node;
  }

  /**
   * Place the current icon centered on a document point, at click size.
   * @param {{x: number, y: number}} center
   */
  placeAt(center) {
    if (!this.icon) return null;
    const size = this.#clickSize();
    const node = this.#insert({ x: center.x - size.width / 2, y: center.y - size.height / 2, ...size });
    if (!this.options.keep) this.editor.setTool('select');
    return node;
  }

  /** Box for a click at `raw`: centered on the pointer, corner snapped. */
  #clickBox(raw, disabled) {
    const size = this.#clickSize();
    const corner = this.canvas.snap({ x: raw.x - size.width / 2, y: raw.y - size.height / 2 }, { disabled });
    return { x: corner.x, y: corner.y, ...size };
  }

  /** Box for a drag from `a` to `b`, keeping the icon's proportions unless `free`. */
  #dragBox(a, b, free) {
    const [, , vw, vh] = this.icon.viewBox;
    let w = Math.abs(b.x - a.x);
    let hh = Math.abs(b.y - a.y);
    if (!free) {
      const k = Math.max(w / vw, hh / vh);
      w = vw * k;
      hh = vh * k;
    }
    return { x: b.x < a.x ? a.x - w : a.x, y: b.y < a.y ? a.y - hh : a.y, width: w, height: hh };
  }

  onPointerDown(e) {
    if (e.button !== 0 || !this.icon) return;
    this.drag = { start: this.canvas.snap(e.raw, { disabled: e.mod }), current: null, startScreen: e.screen, moved: false };
  }

  onPointerMove(e) {
    this.hover = e;
    const drag = this.drag;
    if (drag) {
      if (!drag.moved && Math.hypot(e.screen.x - drag.startScreen.x, e.screen.y - drag.startScreen.y) > 4) drag.moved = true;
      if (drag.moved) drag.current = this.canvas.snap(e.raw, { disabled: e.mod });
    } else if (this.icon) {
      // Show where the corner will snap to while hovering.
      this.#clickBox(e.raw, e.mod);
    }
    this.invalidate();
  }

  onPointerUp(e) {
    const drag = this.drag;
    this.drag = null;
    this.canvas.clearSnap();
    if (!drag || !this.icon) return;
    let box;
    if (drag.moved && drag.current) {
      box = this.#dragBox(drag.start, drag.current, e.shift);
      if (box.width < 1e-6 || box.height < 1e-6) return;
    } else {
      box = this.#clickBox(e.raw, e.mod);
    }
    this.#insert(box);
    this.canvas.clearSnap();
    // Shift-click (not shift-drag, where Shift frees the proportions) keeps the tool.
    const keep = this.options.keep || (e.shift && !drag.moved);
    if (!keep) this.editor.setTool('select');
    this.invalidate();
  }

  onPointerCancel() {
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
    return this.icon ? 'copy' : 'default';
  }

  overlay() {
    if (!this.icon || !this.hover) return [];
    const drag = this.drag;
    let box;
    if (drag?.moved && drag.current) box = this.#dragBox(drag.start, drag.current, this.hover.shift);
    else {
      const size = this.#clickSize();
      const corner = this.canvas.snap({ x: this.hover.raw.x - size.width / 2, y: this.hover.raw.y - size.height / 2 }, { disabled: this.hover.mod, silent: true });
      box = { x: corner.x, y: corner.y, ...size };
    }
    if (box.width <= 0 || box.height <= 0) return [];
    const view = this.view;
    const [vx, vy, vw, vh] = this.icon.viewBox;
    const p = toScreen(view, box);
    const sx = (box.width * view.zoom) / vw;
    const sy = (box.height * view.zoom) / vh;
    const out = [
      {
        tag: 'g',
        key: `ghost-${this.icon.prefix}-${this.icon.name}`,
        attrs: {
          class: 'ghost',
          color: this.#color(),
          transform: `translate(${fmt(p.x, 2)} ${fmt(p.y, 2)}) scale(${fmt(sx, 5)} ${fmt(sy, 5)}) translate(${-vx} ${-vy})`,
        },
        html: this.icon.body,
      },
      rectV('ghost-box', { x: p.x, y: p.y, width: box.width * view.zoom, height: box.height * view.zoom }, { class: 'sel dim' }),
    ];
    if (drag?.moved) {
      out.push({
        tag: 'text',
        key: 'ghost-size',
        attrs: { x: fmt(p.x + (box.width * view.zoom) / 2, 1), y: fmt(p.y + box.height * view.zoom + 18, 1), 'text-anchor': 'middle', class: 'label' },
        text: `${fmt(box.width, 2)} × ${fmt(box.height, 2)}`,
      });
    }
    return out;
  }
}
