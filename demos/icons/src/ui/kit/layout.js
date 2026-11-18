// Layout elements: <mis-panel>, <mis-tabs>/<mis-tab>, <mis-section>, <mis-splitter>.

import { MisElement, css, html, h } from '../base.js';

/**
 * A titled container.
 *   <mis-panel heading="Layers">
 *     <mis-button slot="actions" icon="plus"></mis-button>
 *     …content…
 *   </mis-panel>
 * Slots: `title` (overrides `heading`), `actions`, default.
 */
export class MisPanel extends MisElement {
  static props = { heading: { type: String } };
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        background: var(--bg-raised);
      }
      header {
        display: flex;
        align-items: center;
        gap: var(--s1);
        flex: none;
        min-height: 30px;
        padding: 0 var(--s1) 0 var(--s2);
        border-bottom: 1px solid var(--border);
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-size: var(--font-size-sm);
      }
      header.empty {
        display: none;
      }
      .title {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .body {
        flex: 1;
        min-height: 0;
        overflow: auto;
      }
    `,
  ];
  static template = html`<header part="header"
      ><span class="title"><slot name="title"></slot></span><slot name="actions"></slot
    ></header>
    <div class="body" part="body"><slot></slot></div>`;

  render() {
    const slot = this.$('slot[name="title"]');
    if (!slot.assignedNodes().length) slot.textContent = this.heading;
    this.$('header').classList.toggle('empty', !this.heading && !this.querySelector('[slot="title"], [slot="actions"]'));
  }
}

/**
 * One page of a <mis-tabs>. Attributes: `value`, `label`, `icon`.
 * Its content is its children.
 */
export class MisTab extends MisElement {
  static props = {
    value: { type: String, reflect: true },
    label: { type: String },
    icon: { type: String },
  };
  static styles = [
    css`
      :host {
        display: block;
        height: 100%;
        min-height: 0;
      }
    `,
  ];
  static template = html`<slot></slot>`;

  propChanged() {
    /** @type {any} */ (this.parentElement)?.requestUpdate?.();
  }
}

/**
 * Tabbed container.
 *   <mis-tabs value="icons">
 *     <mis-tab value="icons" label="Icons" icon="shapes">…</mis-tab>
 *     <mis-tab value="fonts" label="Fonts">…</mis-tab>
 *     <mis-button slot="actions" …></mis-button>
 *   </mis-tabs>
 * Emits `change` with `detail.value` when the user picks a tab.
 */
export class MisTabs extends MisElement {
  static props = { value: { type: String, reflect: true }, label: { type: String } };
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        background: var(--bg-raised);
      }
      .bar {
        display: flex;
        align-items: stretch;
        flex: none;
        height: 30px;
        padding: 0 var(--s1);
        gap: 2px;
        border-bottom: 1px solid var(--border);
      }
      [role='tablist'] {
        display: flex;
        gap: 2px;
        flex: 1;
        min-width: 0;
      }
      [role='tab'] {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0 10px;
        color: var(--text-muted);
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        font-weight: 600;
        white-space: nowrap;
      }
      [role='tab']:hover {
        color: var(--text);
      }
      [role='tab'][aria-selected='true'] {
        color: var(--text);
        border-bottom-color: var(--accent);
      }
      [role='tab']:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: -2px;
      }
      .actions {
        display: flex;
        align-items: center;
        gap: 2px;
      }
      .pages {
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      mis-icon {
        --icon-size: 14px;
      }
    `,
  ];
  static template = html`<div class="bar" part="bar"
      ><div role="tablist"></div
      ><div class="actions"><slot name="actions"></slot></div></div
    >
    <div class="pages"><slot></slot></div>`;

  /** @returns {any[]} */
  get tabs() {
    return [...this.children].filter((c) => c.localName === 'mis-tab');
  }

  connected() {
    const list = this.$('[role="tablist"]');
    this.listen(list, 'click', (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) this.#pick(tab.dataset.value);
    });
    this.listen(list, 'keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      const tabs = this.tabs;
      let next = null;
      if (dir) next = tabs[(tabs.findIndex((t) => t.value === this.value) + dir + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs.at(-1);
      if (!next) return;
      e.preventDefault();
      e.stopPropagation();
      this.#pick(next.value);
      queueMicrotask(() => this.$('[role="tab"][aria-selected="true"]')?.focus());
    });
    this.listen(this.$('.pages slot'), 'slotchange', () => this.requestUpdate());
  }

  #pick(value) {
    if (value === this.value) return;
    this.value = value;
    this.emit('change', { value });
  }

  render() {
    const tabs = this.tabs;
    if (!tabs.some((t) => t.value === this.value) && tabs.length) this.value = tabs[0].value;
    const list = this.$('[role="tablist"]');
    if (this.label) list.setAttribute('aria-label', this.label);
    list.replaceChildren(
      ...tabs.map((tab) => {
        const selected = tab.value === this.value;
        tab.hidden = !selected;
        tab.setAttribute('role', 'tabpanel');
        return h(
          'button',
          {
            type: 'button',
            dataset: { value: tab.value },
            tabIndex: selected ? 0 : -1,
            attrs: { role: 'tab', 'aria-selected': String(selected) },
          },
          tab.icon ? h('mis-icon', { name: tab.icon }) : null,
          tab.label,
        );
      }),
    );
  }
}

/**
 * Collapsible section built on <details>.
 *   <mis-section heading="Stroke" open>…</mis-section>
 * Slots: `actions` (in the header), default.
 */
export class MisSection extends MisElement {
  static props = {
    heading: { type: String },
    open: { type: Boolean, reflect: true, default: true },
  };
  static styles = [
    css`
      :host {
        display: block;
        border-bottom: 1px solid var(--border);
      }
      summary {
        display: flex;
        align-items: center;
        gap: var(--s1);
        height: 28px;
        padding: 0 var(--s1) 0 var(--s2);
        font-weight: 600;
        cursor: default;
        list-style: none;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      summary:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: -2px;
      }
      .title {
        flex: 1;
      }
      .chevron {
        --icon-size: 12px;
        color: var(--text-faint);
        transition: transform 0.12s var(--ease);
      }
      details[open] .chevron {
        transform: rotate(90deg);
      }
      .body {
        padding: 2px var(--s2) var(--s2);
        display: grid;
        gap: 6px;
      }
    `,
  ];
  static template = html`<details
    ><summary part="header"
      ><mis-icon class="chevron" name="chevron-right"></mis-icon><span class="title"></span><slot name="actions"></slot></summary
    ><div class="body" part="body"><slot></slot></div
  ></details>`;

  connected() {
    const details = this.$('details');
    this.listen(details, 'toggle', () => {
      this.open = details.open;
    });
    // Buttons in the header must not toggle the section.
    this.listen(this.$('slot[name="actions"]'), 'click', (e) => e.preventDefault());
  }

  render() {
    this.$('.title').textContent = this.heading;
    this.$('details').open = this.open;
  }
}

/**
 * A draggable divider. It does not resize anything itself: it emits `resize` with
 * `detail.delta` (pixels moved since the drag began, along the split axis) and
 * `resize-end`, and `collapse` on double-click. The parent decides what the numbers mean.
 *
 * `orientation="vertical"` is a vertical bar between side-by-side panes.
 */
export class MisSplitter extends MisElement {
  static props = {
    orientation: { type: String, reflect: true, default: 'vertical' },
    label: { type: String },
  };
  static styles = [
    css`
      :host {
        display: block;
        position: relative;
        flex: none;
        background: var(--border);
        z-index: 2;
        touch-action: none;
      }
      :host([orientation='vertical']) {
        width: 1px;
        cursor: col-resize;
      }
      :host([orientation='horizontal']) {
        height: 1px;
        cursor: row-resize;
      }
      /* The visible line is 1px; the grab area is wider. */
      .grab {
        position: absolute;
        inset: -3px;
      }
      :host(:hover),
      :host(:focus-visible),
      :host(.dragging) {
        background: var(--accent);
        outline: 1px solid var(--accent);
      }
    `,
  ];
  static template = html`<div class="grab"></div>`;

  connected() {
    this.tabIndex = 0;
    this.setAttribute('role', 'separator');
    let start = null;
    const axis = () => (this.orientation === 'vertical' ? 'clientX' : 'clientY');
    this.listen(this, 'pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      this.setPointerCapture(e.pointerId);
      start = e[axis()];
      this.classList.add('dragging');
      this.emit('resize-start');
    });
    this.listen(this, 'pointermove', (e) => {
      if (start === null) return;
      this.emit('resize', { delta: e[axis()] - start });
    });
    const end = () => {
      if (start === null) return;
      start = null;
      this.classList.remove('dragging');
      this.emit('resize-end');
    };
    this.listen(this, 'pointerup', end);
    this.listen(this, 'pointercancel', end);
    this.listen(this, 'dblclick', () => this.emit('collapse'));
    this.listen(this, 'keydown', (e) => {
      const vertical = this.orientation === 'vertical';
      const delta = { [vertical ? 'ArrowLeft' : 'ArrowUp']: -16, [vertical ? 'ArrowRight' : 'ArrowDown']: 16 }[e.key];
      if (delta) {
        e.preventDefault();
        e.stopPropagation();
        this.emit('resize-start');
        this.emit('resize', { delta });
        this.emit('resize-end');
      } else if (e.key === 'Enter') {
        this.emit('collapse');
      }
    });
  }

  render() {
    this.setAttribute('aria-orientation', this.orientation);
    if (this.label) this.setAttribute('aria-label', this.label);
  }
}
