// <mis-swatches>: document swatches, recent colors and built-in palettes. DESIGN.md §10.
//
// Click a swatch to set the fill; Shift-click (or right-click → "Set stroke") for the
// stroke. Swatches can be dragged onto an object on the canvas.

import { MisElement, css, html, h } from '../base.js';
import { editor } from '../../app.js';
import { applyPaint, recentColors, onRecentColors } from '../../style-actions.js';
import { getSetting, setSetting } from '../../services/storage/index.js';
import { NONE } from '../../core/model/nodes.js';
import { toast } from '../kit/overlays.js';

export class MisSwatches extends MisElement {
  static styles = [
    css`
      :host {
        display: grid;
        grid-template-columns: 230px 1px minmax(0, 1fr);
        height: 100%;
        min-height: 0;
      }
      .side,
      .main {
        min-height: 0;
        overflow: hidden auto;
        padding: 8px;
      }
      .rule {
        background: var(--border);
      }
      h3 {
        margin: 0 0 4px;
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        display: flex;
        align-items: center;
        gap: 4px;
        min-height: 22px;
      }
      h3 span {
        flex: 1;
      }
      .group {
        margin-bottom: 10px;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 3px;
      }
      .row {
        display: flex;
        gap: 2px;
        margin-bottom: 2px;
      }
      .sw {
        all: unset;
        box-sizing: border-box;
        width: 20px;
        height: 20px;
        border-radius: 3px;
        box-shadow: inset 0 0 0 1px rgb(128 128 128 / 0.35);
        flex: none;
        cursor: pointer;
      }
      .row .sw {
        flex: 1 1 0;
        min-width: 12px;
        max-width: 34px;
      }
      .sw:hover {
        transform: scale(1.18);
        z-index: 1;
        position: relative;
        box-shadow: 0 0 0 1px var(--bg-raised), 0 0 0 2px var(--text);
      }
      .sw:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 1px;
      }
      .sw.none {
        background: linear-gradient(to top right, transparent 44%, var(--danger) 44% 56%, transparent 56%), var(--bg-field);
      }
      .empty {
        color: var(--text-faint);
        font-size: var(--font-size-sm);
      }
      .head {
        display: flex;
        gap: 6px;
        align-items: center;
        margin-bottom: 8px;
      }
      .head mis-segmented {
        flex: none;
      }
      .hint {
        color: var(--text-faint);
        font-size: var(--font-size-sm);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .label {
        width: 74px;
        flex: none;
        color: var(--text-muted);
        font-size: var(--font-size-sm);
        align-self: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ];
  static template = html`
    <div class="side">
      <div class="group">
        <h3><span>Document</span><mis-button class="add" icon="plus" label="Add the current fill color"></mis-button></h3>
        <div class="chips doc"></div>
      </div>
      <div class="group">
        <h3><span>Recent</span></h3>
        <div class="chips recent"></div>
      </div>
    </div>
    <div class="rule"></div>
    <div class="main">
      <div class="head">
        <mis-segmented class="palette" label="Palette"></mis-segmented>
        <span class="hint">Click: fill · Shift-click: stroke · drag onto an object</span>
      </div>
      <div class="rows" role="group" aria-label="Palette colors"></div>
    </div>
    <mis-menu></mis-menu>
  `;

  constructor() {
    super();
    this.palettes = [];
    this.paletteId = 'tailwind';
    this._menuTarget = null;
  }

  async connected() {
    const root = this.shadowRoot;
    this.listen(root, 'click', (e) => {
      const sw = e.target.closest?.('.sw');
      if (!sw) return;
      this.#apply(sw, e.shiftKey ? 'stroke' : 'fill');
    });
    this.listen(root, 'dragstart', (e) => {
      const sw = e.target.closest?.('.sw');
      if (!sw) return;
      e.dataTransfer.setData('application/x-mis-color', sw.dataset.color || 'none');
      e.dataTransfer.effectAllowed = 'copy';
    });
    const menu = this.$('mis-menu');
    this.listen(root, 'contextmenu', (e) => {
      const sw = e.target.closest?.('.sw');
      if (!sw) return;
      e.preventDefault();
      this._menuTarget = sw;
      menu.items = [
        { id: 'fill', label: 'Set fill' },
        { id: 'stroke', label: 'Set stroke' },
        ...(sw.dataset.color ? [{ id: 'copy', label: `Copy ${sw.dataset.color.toUpperCase()}` }] : []),
        ...(sw.closest('.doc') ? [{ separator: true }, { id: 'remove', label: 'Remove from document', danger: true }] : [{ id: 'save', label: 'Add to document swatches' }]),
      ];
      menu.openAt(e.clientX, e.clientY);
    });
    this.listen(menu, 'select', (e) => {
      const sw = this._menuTarget;
      const color = sw?.dataset.color;
      const id = e.detail.id;
      if (id === 'fill' || id === 'stroke') this.#apply(sw, id);
      else if (id === 'copy') navigator.clipboard?.writeText(color).then(() => toast(`${color.toUpperCase()} copied`), () => {});
      else if (id === 'remove') editor.apply('Remove swatch', (doc) => ({ ...doc, swatches: doc.swatches.filter((s) => s.color !== color) }));
      else if (id === 'save') this.#addSwatch(color, sw.title);
    });
    this.listen(this.$('.add'), 'click', () => {
      const fill = editor.store.get('style').fill;
      if (fill?.type === 'solid') this.#addSwatch(fill.color);
      else toast('The current fill is not a plain color.');
    });

    this.watch(editor.store, (s) => s.doc.swatches, () => this.#renderDoc(), { immediate: true });
    const off = onRecentColors(() => this.#renderRecent());
    this.signal.addEventListener('abort', off);
    this.#renderRecent();

    const picker = this.$('.palette');
    this.listen(picker, 'change', (e) => {
      this.paletteId = e.detail.value;
      setSetting('palette', this.paletteId);
      this.#renderPalette();
    });
    try {
      const res = await fetch(new URL('../../data/palettes.json', import.meta.url));
      this.palettes = await res.json();
    } catch {
      this.palettes = [];
    }
    this.paletteId = await getSetting('palette', this.paletteId);
    picker.options = this.palettes.map((p) => ({ value: p.id, label: p.name }));
    picker.value = this.paletteId;
    this.#renderPalette();
  }

  #apply(sw, which) {
    const color = sw.dataset.color;
    applyPaint(which, color ? { type: 'solid', color } : NONE);
  }

  #addSwatch(color, name) {
    if (!color) return;
    if (editor.doc.swatches.some((s) => s.color === color)) {
      toast('That color is already a document swatch.');
      return;
    }
    editor.apply('Add swatch', (doc) => ({ ...doc, swatches: [...doc.swatches, { name: name || color.toUpperCase(), color }] }));
  }

  #chip(color, name) {
    return h('button', {
      type: 'button',
      class: color ? 'sw' : 'sw none',
      title: name ?? (color ? color.toUpperCase() : 'None'),
      draggable: true,
      style: color ? `background:${color}` : '',
      dataset: { color: color ?? '' },
      attrs: { 'aria-label': name ?? (color ? color.toUpperCase() : 'No paint') },
    });
  }

  #renderDoc() {
    const host = this.$('.doc');
    const swatches = editor.doc.swatches;
    host.replaceChildren(this.#chip(null), this.#chip('#000000', 'Black'), this.#chip('#ffffff', 'White'), ...swatches.map((s) => this.#chip(s.color, s.name)));
  }

  #renderRecent() {
    const host = this.$('.recent');
    const colors = recentColors();
    if (!colors.length) host.replaceChildren(h('span', { class: 'empty', textContent: 'Colors you use appear here.' }));
    else host.replaceChildren(...colors.map((c) => this.#chip(c)));
  }

  #renderPalette() {
    const palette = this.palettes.find((p) => p.id === this.paletteId) ?? this.palettes[0];
    const host = this.$('.rows');
    if (!palette) {
      host.replaceChildren(h('span', { class: 'empty', textContent: 'Palettes could not be loaded.' }));
      return;
    }
    host.replaceChildren(
      ...palette.rows.map((row) =>
        h('div', { class: 'row' }, h('span', { class: 'label', textContent: row.name }), row.colors.map((c) => this.#chip(c.color, c.name))),
      ),
    );
  }
}
