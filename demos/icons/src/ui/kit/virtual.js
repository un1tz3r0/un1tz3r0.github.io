// Windowed rendering for large collections: <mis-virtual-grid> and <mis-virtual-list>.
//
// Only the cells in (and just around) the viewport exist in the DOM, so a 20,000-icon set
// costs the same as a 200-icon one. The owner supplies:
//
//   grid.items      = [...]                              the data
//   grid.renderItem = (cell, item, index) => { … }       fill a cell element
//   grid.cellStyles = css`…`                             styles for what renderItem builds
//
// Cells are role="option" inside a role="listbox"; arrow keys move the active cell and
// Enter / Space / click emit `item-activate` ({index, item, originalEvent}).

import { MisElement, css, html, h } from '../base.js';

export class MisVirtualGrid extends MisElement {
  static props = {
    items: { type: Object },
    itemWidth: { type: Number, default: 44 },
    itemHeight: { type: Number, default: 44 },
    gap: { type: Number, default: 2 },
    /** Fixed column count; 0 fits as many as the width allows. */
    columns: { type: Number, default: 0 },
    label: { type: String },
    /** Stretch cells to fill the row (always on for a single column). */
    stretch: { type: Boolean },
    selectedIndex: { type: Number, default: -1 },
  };
  static styles = [
    css`
      :host {
        display: block;
        overflow: hidden auto;
        position: relative;
        min-height: 0;
        contain: strict;
        outline: none;
      }
      .sizer {
        position: relative;
        width: 100%;
      }
      .cell {
        position: absolute;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        overflow: hidden;
        outline: none;
      }
      .cell:hover {
        background: var(--bg-hover);
      }
      .cell[aria-selected='true'] {
        background: var(--accent-soft);
        box-shadow: inset 0 0 0 1px var(--accent);
      }
      .cell:focus-visible {
        box-shadow: inset 0 0 0 2px var(--focus);
      }
      .empty {
        padding: var(--s4);
        color: var(--text-muted);
        text-align: center;
      }
    `,
  ];
  static template = html`<div class="sizer" role="listbox"></div><div class="empty" hidden><slot name="empty">Nothing to show</slot></div>`;

  constructor() {
    super();
    /** @type {((cell: HTMLElement, item: any, index: number) => void) | null} */
    this.renderItem = null;
    /** @type {Map<number, HTMLElement>} */
    this._cells = new Map();
    this._active = 0;
    this._layout = { cols: 1, cellW: 0, rowH: 0, rows: 0 };
    this._version = 0;
  }

  /** @param {CSSStyleSheet} sheet */
  set cellStyles(sheet) {
    const ctor = /** @type {typeof MisElement} */ (this.constructor);
    this.shadowRoot.adoptedStyleSheets = [...this.shadowRoot.adoptedStyleSheets.slice(0, 1 + ctor.styles.length), sheet];
  }

  connected() {
    this.listen(this, 'scroll', () => this.#window(), { passive: true });
    const ro = new ResizeObserver(() => {
      this.#measure();
      this.#window();
    });
    ro.observe(this);
    this.signal.addEventListener('abort', () => ro.disconnect());

    const sizer = this.$('.sizer');
    this.listen(sizer, 'click', (e) => this.#activateFrom(e));
    this.listen(sizer, 'focusin', (e) => {
      const index = this.indexFromEvent(e);
      if (index >= 0) this.#setActive(index, false);
    });
    this.listen(sizer, 'keydown', (e) => {
      const { cols } = this._layout;
      const count = this.items?.length ?? 0;
      const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
      const pageRows = Math.max(1, Math.floor(this.clientHeight / this._layout.rowH) - 1);
      let next = null;
      if (move !== undefined) next = this._active + move;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = count - 1;
      else if (e.key === 'PageDown') next = this._active + pageRows * cols;
      else if (e.key === 'PageUp') next = this._active - pageRows * cols;
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        this.emit('item-activate', { index: this._active, item: this.items?.[this._active], originalEvent: e });
        return;
      }
      if (next === null) return;
      e.preventDefault();
      e.stopPropagation();
      this.#setActive(Math.max(0, Math.min(count - 1, next)), true);
    });
  }

  /** The item index a (possibly retargeted) event happened on, or -1. */
  indexFromEvent(e) {
    const cell = e.composedPath().find((n) => n instanceof HTMLElement && n.classList.contains('cell'));
    return cell ? Number(cell.dataset.index) : -1;
  }

  #activateFrom(e) {
    const index = this.indexFromEvent(e);
    if (index < 0) return;
    this.#setActive(index, false);
    this.emit('item-activate', { index, item: this.items?.[index], originalEvent: e });
  }

  #setActive(index, focus) {
    const prev = this._cells.get(this._active);
    if (prev) prev.tabIndex = -1;
    this._active = index;
    if (focus) this.scrollToIndex(index);
    const cell = this._cells.get(index);
    if (cell) {
      cell.tabIndex = 0;
      if (focus) cell.focus({ preventScroll: true });
    }
  }

  /** Bring an item into view. */
  scrollToIndex(index) {
    const { cols, rowH } = this._layout;
    const top = Math.floor(index / cols) * rowH;
    if (top < this.scrollTop) this.scrollTop = top;
    else if (top + rowH > this.scrollTop + this.clientHeight) this.scrollTop = top + rowH - this.clientHeight;
    this.#window();
  }

  /** Re-render every visible cell (after the data behind unchanged indexes changed). */
  refresh() {
    this._version++;
    this.#window();
  }

  propChanged(name) {
    if (name === 'items') {
      this._version++;
      this._active = 0;
      this.scrollTop = 0;
    }
  }

  #measure() {
    const count = this.items?.length ?? 0;
    const gap = this.gap ?? 0;
    const width = this.clientWidth;
    const cols = this.columns > 0 ? this.columns : Math.max(1, Math.floor((width + gap) / (this.itemWidth + gap)));
    const stretch = this.stretch || cols === 1 || this.columns > 0;
    const cellW = stretch ? (width - gap * (cols - 1)) / cols : this.itemWidth;
    const rowH = this.itemHeight + gap;
    const rows = Math.ceil(count / cols);
    this._layout = { cols, cellW, rowH, rows };
    this.$('.sizer').style.height = `${Math.max(0, rows * rowH - gap)}px`;
    this.$('.empty').hidden = count > 0;
  }

  #window() {
    const items = this.items ?? [];
    const { cols, cellW, rowH } = this._layout;
    if (!rowH || !this.renderItem) return;
    const gap = this.gap ?? 0;
    const OVERSCAN = 3;
    const firstRow = Math.max(0, Math.floor(this.scrollTop / rowH) - OVERSCAN);
    const lastRow = Math.ceil((this.scrollTop + this.clientHeight) / rowH) + OVERSCAN;
    const first = firstRow * cols;
    const last = Math.min(items.length, lastRow * cols);
    const sizer = this.$('.sizer');

    for (const [index, cell] of this._cells) {
      if (index < first || index >= last || cell.dataset.version !== String(this._version)) {
        cell.remove();
        this._cells.delete(index);
      }
    }
    for (let index = first; index < last; index++) {
      let cell = this._cells.get(index);
      if (!cell) {
        cell = h('div', {
          class: 'cell',
          tabIndex: index === this._active ? 0 : -1,
          dataset: { index: String(index), version: String(this._version) },
          attrs: { role: 'option', 'aria-setsize': items.length, 'aria-posinset': index + 1 },
        });
        this.renderItem(cell, items[index], index);
        this._cells.set(index, cell);
        sizer.append(cell);
      }
      const col = index % cols;
      const row = Math.floor(index / cols);
      cell.style.left = `${col * (cellW + gap)}px`;
      cell.style.top = `${row * rowH}px`;
      cell.style.width = `${cellW}px`;
      cell.style.height = `${this.itemHeight}px`;
      cell.setAttribute('aria-selected', String(index === this.selectedIndex));
    }
  }

  render() {
    if (this.label) this.$('.sizer').setAttribute('aria-label', this.label);
    this.#measure();
    this.#window();
  }
}

/** A single-column virtual grid. */
export class MisVirtualList extends MisVirtualGrid {
  constructor() {
    super();
    this.columns = 1;
  }
}
