// <mis-layers> and <mis-layer-row>: the object tree. Top of the list = top of the stack.

import { MisElement, css, html, h } from '../base.js';
import { editor } from '../../app.js';
import { findNode, parentOf, patchNodes, moveNodes, indexOf, isDescendantOf } from '../../core/model/tree.js';

const TYPE_ICONS = { path: 'spline', text: 'type', icon: 'shapes', group: 'folder' };
const SHAPE_ICONS = { rect: 'square', ellipse: 'circle', polygon: 'hexagon', star: 'star', line: 'minus' };

/**
 * One row of the layer tree. Purely presentational: it shows what it is given and emits
 * `row-toggle` ({what: 'visible'|'locked'|'expanded'}), `row-rename` ({name}).
 */
export class MisLayerRow extends MisElement {
  static props = {
    nodeId: { type: String, attribute: 'node-id', reflect: true },
    name: { type: String },
    icon: { type: String },
    depth: { type: Number, default: 0 },
    selected: { type: Boolean, reflect: true },
    visible: { type: Boolean, default: true },
    locked: { type: Boolean },
    dimmed: { type: Boolean, reflect: true },
    expandable: { type: Boolean },
    expanded: { type: Boolean },
    badge: { type: String },
  };
  static styles = [
    css`
      :host {
        display: flex;
        align-items: center;
        height: 26px;
        padding-right: 2px;
        gap: 2px;
        outline: none;
        --icon-size: 14px;
        --control-h: 22px;
      }
      :host(:hover) {
        background: var(--bg-hover);
      }
      :host([selected]) {
        background: var(--accent-soft);
      }
      :host(:focus-visible) {
        box-shadow: inset 0 0 0 2px var(--focus);
      }
      :host([dimmed]) .name,
      :host([dimmed]) .type {
        opacity: 0.45;
      }
      .twisty {
        all: unset;
        width: 16px;
        height: 22px;
        display: grid;
        place-items: center;
        flex: none;
        color: var(--text-faint);
        --icon-size: 12px;
      }
      .twisty mis-icon {
        transition: transform 0.1s var(--ease);
      }
      .twisty.open mis-icon {
        transform: rotate(90deg);
      }
      .type {
        color: var(--text-muted);
        margin-right: 4px;
      }
      .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .badge {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--accent);
        border: 1px solid currentColor;
        border-radius: 3px;
        padding: 0 3px;
        flex: none;
      }
      input {
        flex: 1;
        min-width: 0;
        height: 20px;
        font: inherit;
        color: var(--text);
        background: var(--bg-field);
        border: 1px solid var(--focus);
        border-radius: 3px;
        padding: 0 4px;
        outline: none;
      }
      mis-button {
        opacity: 0;
      }
      :host(:hover) mis-button,
      :host(:focus-within) mis-button,
      mis-button.on {
        opacity: 1;
      }
    `,
  ];
  static template = html`<span class="indent"></span
    ><button class="twisty" type="button" tabindex="-1" aria-hidden="true"><mis-icon name="chevron-right"></mis-icon></button
    ><mis-icon class="type"></mis-icon><span class="name"></span><span class="badge" hidden></span
    ><mis-button class="lock" tabindex="-1"></mis-button><mis-button class="eye" tabindex="-1"></mis-button>`;

  connected() {
    this.setAttribute('role', 'treeitem');
    const stop = (fn) => (e) => {
      e.stopPropagation();
      fn();
    };
    this.listen(this.$('.twisty'), 'click', stop(() => this.emit('row-toggle', { what: 'expanded' })));
    this.listen(this.$('.eye'), 'click', stop(() => this.emit('row-toggle', { what: 'visible' })));
    this.listen(this.$('.lock'), 'click', stop(() => this.emit('row-toggle', { what: 'locked' })));
    for (const el of [this.$('.twisty'), this.$('.eye'), this.$('.lock')]) {
      this.listen(el, 'pointerdown', (e) => e.stopPropagation());
      this.listen(el, 'dblclick', (e) => e.stopPropagation());
    }
  }

  /** Swap the name for a text input. */
  startRename() {
    if (this.$('input')) return;
    const label = this.$('.name');
    const input = h('input', { value: this.name, spellcheck: false });
    input.setAttribute('aria-label', 'Layer name');
    label.hidden = true;
    label.after(input);
    input.select();
    let done = false;
    const finish = (commit) => {
      if (done) return;
      done = true;
      const name = input.value.trim();
      input.remove();
      label.hidden = false;
      this.focus();
      if (commit && name && name !== this.name) this.emit('row-rename', { name });
      else this.emit('row-rename-end');
    };
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') finish(true);
      else if (e.key === 'Escape') finish(false);
    });
    input.addEventListener('blur', () => finish(true));
    for (const type of ['pointerdown', 'dblclick', 'click']) input.addEventListener(type, (e) => e.stopPropagation());
  }

  get renaming() {
    return !!this.$('input');
  }

  render() {
    this.$('.indent').style.width = `${4 + (this.depth ?? 0) * 14}px`;
    const twisty = this.$('.twisty');
    twisty.style.visibility = this.expandable ? 'visible' : 'hidden';
    twisty.classList.toggle('open', this.expanded);
    this.$('.type').name = this.icon;
    this.$('.name').textContent = this.name;
    const badge = this.$('.badge');
    badge.hidden = !this.badge;
    badge.textContent = this.badge;
    const eye = this.$('.eye');
    eye.icon = this.visible ? 'eye' : 'eye-off';
    eye.label = this.visible ? 'Hide' : 'Show';
    eye.classList.toggle('on', !this.visible);
    const lock = this.$('.lock');
    lock.icon = this.locked ? 'lock' : 'lock-open';
    lock.label = this.locked ? 'Unlock' : 'Lock';
    lock.classList.toggle('on', this.locked);
    this.setAttribute('aria-level', String((this.depth ?? 0) + 1));
    this.setAttribute('aria-selected', String(this.selected));
    if (this.expandable) this.setAttribute('aria-expanded', String(this.expanded));
    else this.removeAttribute('aria-expanded');
    this.setAttribute('aria-label', `${this.name}${this.visible ? '' : ', hidden'}${this.locked ? ', locked' : ''}`);
  }
}

export class MisLayers extends MisElement {
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 0;
        background: var(--bg-raised);
      }
      header {
        flex: none;
        display: flex;
        align-items: center;
        height: 30px;
        padding: 0 var(--s1) 0 var(--s2);
        border-bottom: 1px solid var(--border);
        font-weight: 600;
        gap: 2px;
      }
      header span {
        flex: 1;
      }
      .tree {
        flex: 1;
        min-height: 0;
        overflow: hidden auto;
        position: relative;
        padding: 2px 0;
      }
      .empty {
        padding: var(--s3);
        color: var(--text-muted);
      }
      .drop {
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--accent);
        pointer-events: none;
        display: none;
      }
      .drop.inside {
        height: 26px;
        background: var(--accent-soft);
        outline: 2px solid var(--accent);
        outline-offset: -2px;
      }
    `,
  ];
  static template = html`<header
      ><span>Layers</span
      ><mis-button data-command="object.group"></mis-button><mis-button data-command="edit.duplicate"></mis-button
      ><mis-button data-command="edit.delete"></mis-button></header
    ><div class="tree" role="tree" aria-label="Layers" aria-multiselectable="true"><div class="drop"></div></div>`;

  constructor() {
    super();
    /** Groups the user has collapsed. Groups start expanded. */
    this.collapsed = new Set();
    this.anchor = null;
    /** @type {{id: string, depth: number}[]} */
    this.flat = [];
    this._drag = null;
  }

  connected() {
    const store = editor.store;
    let queued = false;
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        if (this.isConnected) this.#sync();
      });
    };
    this.watch(store, 'doc', schedule);
    this.watch(store, 'selection', schedule);
    schedule();

    for (const button of this.$$('header [data-command]')) {
      const cmd = editor.commands.get(button.dataset.command);
      if (!cmd) continue;
      button.icon = cmd.icon;
      button.label = cmd.label;
      this.listen(button, 'click', () => editor.commands.run(cmd.id));
    }
    const tree = this.$('.tree');
    this.listen(tree, 'click', (e) => this.#onClick(e));
    this.listen(tree, 'dblclick', (e) => this.#rowOf(e)?.startRename());
    this.listen(tree, 'keydown', (e) => this.#onKey(e));
    this.listen(tree, 'row-toggle', (e) => this.#onToggle(e));
    this.listen(tree, 'row-rename', (e) => {
      const row = this.#rowOf(e);
      editor.apply('Rename', (doc) => patchNodes(doc, [row.nodeId], { name: e.detail.name }));
      schedule();
    });
    this.listen(tree, 'row-rename-end', schedule);
    this.listen(tree, 'contextmenu', (e) => {
      e.preventDefault();
      const row = this.#rowOf(e);
      if (row && !editor.selection.includes(row.nodeId)) this.#select([row.nodeId]);
      /** @type {any} */ (this.getRootNode()).host?.openContextMenu?.(e.clientX, e.clientY);
    });
    this.listen(tree, 'pointerdown', (e) => this.#dragStart(e));
    this.listen(tree, 'pointermove', (e) => this.#dragMove(e));
    this.listen(tree, 'pointerup', (e) => this.#dragEnd(e));
    this.listen(tree, 'pointercancel', () => this.#dragReset());
  }

  /** @returns {any} */
  #rowOf(e) {
    return e.composedPath().find((n) => n instanceof HTMLElement && n.localName === 'mis-layer-row');
  }

  #rows() {
    return /** @type {any[]} */ (this.$$('mis-layer-row'));
  }

  #select(ids) {
    editor.select(ids);
    // Canvas interaction continues in the context of what was picked here.
    const parent = ids.length ? parentOf(editor.doc, ids[0]) : null;
    editor.store.set({ scope: parent?.id ?? null });
  }

  #onClick(e) {
    const row = this.#rowOf(e);
    if (!row || row.renaming) {
      if (!row) this.#select([]);
      return;
    }
    const id = row.nodeId;
    const sel = editor.selection;
    if (e.shiftKey && this.anchor) {
      const order = this.flat.map((f) => f.id);
      const a = order.indexOf(this.anchor);
      const b = order.indexOf(id);
      if (a >= 0 && b >= 0) {
        this.#select(order.slice(Math.min(a, b), Math.max(a, b) + 1));
        return;
      }
    }
    if (e.ctrlKey || e.metaKey) {
      this.#select(sel.includes(id) ? sel.filter((s) => s !== id) : [...sel, id]);
    } else {
      this.#select([id]);
    }
    this.anchor = id;
  }

  #onToggle(e) {
    const row = this.#rowOf(e);
    const id = row.nodeId;
    const what = e.detail.what;
    if (what === 'expanded') {
      if (this.collapsed.has(id)) this.collapsed.delete(id);
      else this.collapsed.add(id);
      this.#sync();
      return;
    }
    const node = findNode(editor.doc, id);
    // Toggling a selected row applies to the whole selection.
    const ids = editor.selection.includes(id) ? editor.selection : [id];
    const key = what;
    editor.apply(what === 'visible' ? (node.visible ? 'Hide' : 'Show') : node.locked ? 'Unlock' : 'Lock', (doc) =>
      patchNodes(doc, ids, { [key]: !node[key] }),
    );
  }

  #onKey(e) {
    const row = this.#rowOf(e);
    if (!row || row.renaming) return;
    const rows = this.#rows();
    const i = rows.indexOf(row);
    const go = (next) => {
      if (!next) return;
      next.focus();
      if (e.shiftKey) {
        const order = this.flat.map((f) => f.id);
        const a = order.indexOf(this.anchor ?? row.nodeId);
        const b = order.indexOf(next.nodeId);
        this.#select(order.slice(Math.min(a, b), Math.max(a, b) + 1));
      } else {
        this.#select([next.nodeId]);
        this.anchor = next.nodeId;
      }
      this._focusId = next.nodeId;
    };
    let handled = true;
    if (e.key === 'ArrowDown') go(rows[i + 1]);
    else if (e.key === 'ArrowUp') go(rows[i - 1]);
    else if (e.key === 'Home') go(rows[0]);
    else if (e.key === 'End') go(rows.at(-1));
    else if (e.key === 'ArrowRight' && row.expandable && !row.expanded) row.dispatchEvent(new CustomEvent('row-toggle', { detail: { what: 'expanded' }, bubbles: true, composed: true }));
    else if (e.key === 'ArrowLeft' && row.expandable && row.expanded) row.dispatchEvent(new CustomEvent('row-toggle', { detail: { what: 'expanded' }, bubbles: true, composed: true }));
    else if (e.key === 'Enter' || e.key === 'F2') row.startRename();
    else if (e.key === ' ') this.#select([row.nodeId]);
    else handled = false;
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  // --- drag to reorder -----------------------------------------------------------------------

  #dragStart(e) {
    const row = this.#rowOf(e);
    if (!row || row.renaming || e.button !== 0) return;
    this._drag = { id: row.nodeId, y: e.clientY, active: false, target: null, pointerId: e.pointerId };
  }

  #dragMove(e) {
    const drag = this._drag;
    if (!drag) return;
    const tree = this.$('.tree');
    if (!drag.active) {
      if (Math.abs(e.clientY - drag.y) < 5) return;
      drag.active = true;
      tree.setPointerCapture(drag.pointerId);
      if (!editor.selection.includes(drag.id)) this.#select([drag.id]);
    }
    const rows = this.#rows();
    const moving = new Set(editor.selection);
    const doc = editor.doc;
    const drop = this.$('.drop');
    drag.target = null;
    for (const row of rows) {
      const r = row.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) continue;
      const id = row.nodeId;
      // Nothing can be dropped onto itself or into its own subtree.
      if (moving.has(id) || [...moving].some((m) => isDescendantOf(doc, id, m))) break;
      const frac = (e.clientY - r.top) / r.height;
      const isGroup = findNode(doc, id)?.type === 'group';
      const where = isGroup && frac > 0.3 && frac < 0.7 ? 'inside' : frac < 0.5 ? 'above' : 'below';
      drag.target = { id, where };
      const base = tree.getBoundingClientRect();
      const top = (where === 'below' ? r.bottom : r.top) - base.top + tree.scrollTop;
      drop.style.display = 'block';
      drop.classList.toggle('inside', where === 'inside');
      drop.style.top = `${where === 'inside' ? r.top - base.top + tree.scrollTop : top - 1}px`;
      drop.style.left = `${4 + (row.depth ?? 0) * 14 + (where === 'inside' ? 0 : 16)}px`;
      break;
    }
    if (!drag.target) drop.style.display = 'none';
  }

  #dragEnd() {
    const drag = this._drag;
    this.#dragReset();
    if (!drag?.active || !drag.target) return;
    // Swallow the click that follows the drag.
    this.$('.tree').addEventListener('click', (e) => e.stopPropagation(), { capture: true, once: true });
    const doc = editor.doc;
    const { id, where } = drag.target;
    const ids = editor.selection;
    if (where === 'inside') {
      this.collapsed.delete(id);
      editor.apply('Move into group', (d) => moveNodes(d, ids, id));
      return;
    }
    const entry = indexOf(doc).get(id);
    // The list is top-first, so "above" a row means later in paint order.
    const at = where === 'above' ? entry.index + 1 : entry.index;
    editor.apply('Reorder', (d) => moveNodes(d, ids, entry.parent?.id ?? null, at));
  }

  #dragReset() {
    this._drag = null;
    this.$('.drop').style.display = 'none';
  }

  // --- rendering -----------------------------------------------------------------------------

  #sync() {
    const tree = this.$('.tree');
    const existing = this.#rows();
    if (existing.some((r) => r.renaming) || this._drag?.active) return;
    const doc = editor.doc;
    const selected = new Set(editor.selection);
    this.flat = [];
    const items = [];
    const visit = (children, depth, hidden, parentClip) => {
      for (let i = children.length - 1; i >= 0; i--) {
        const node = children[i];
        const expandable = node.type === 'group';
        const expanded = expandable && !this.collapsed.has(node.id);
        this.flat.push({ id: node.id, depth });
        items.push({
          nodeId: node.id,
          name: node.name || node.type,
          icon: node.type === 'shape' ? SHAPE_ICONS[node.shape] : TYPE_ICONS[node.type],
          depth,
          selected: selected.has(node.id),
          visible: node.visible,
          locked: node.locked,
          dimmed: hidden || !node.visible,
          expandable,
          expanded,
          // The topmost child of a clip group is the clipping shape.
          badge: parentClip && i === children.length - 1 ? parentClip : expandable && node.clip !== 'none' ? `${node.clip} group` : '',
        });
        if (expanded) visit(node.children, depth + 1, hidden || !node.visible, node.clip !== 'none' ? node.clip : '');
      }
    };
    visit(doc.children, 0, false, '');

    const drop = this.$('.drop');
    const focusId = this._focusId ?? /** @type {any} */ (this.shadowRoot.activeElement)?.nodeId;
    items.forEach((item, i) => {
      const row = existing[i] ?? tree.insertBefore(document.createElement('mis-layer-row'), drop);
      Object.assign(row, item);
      row.tabIndex = -1;
    });
    for (const extra of existing.slice(items.length)) extra.remove();
    let empty = this.$('.empty');
    if (!items.length && !empty) {
      empty = h('div', { class: 'empty', textContent: 'Nothing here yet. Place an icon or draw a shape.' });
      tree.prepend(empty);
    } else if (items.length && empty) empty.remove();

    // Exactly one row is in the tab order: the focused one, else the first selected, else the first.
    const rows = this.#rows();
    const tabStop = rows.find((r) => r.nodeId === focusId) ?? rows.find((r) => r.selected) ?? rows[0];
    if (tabStop) tabStop.tabIndex = 0;
    if (this._focusId && tabStop?.nodeId === this._focusId) tabStop.focus();
    this._focusId = null;
  }
}
