// Overlay elements: <mis-dialog>, <mis-menu>, <mis-context-menu>, <mis-toast>, <mis-tooltip>.

import { MisElement, css, html, h } from '../base.js';

/**
 * Modal dialog on top of the native <dialog>.
 *   <mis-dialog heading="Export">
 *     …content…
 *     <mis-button slot="footer" variant="primary">Export</mis-button>
 *   </mis-dialog>
 * Methods: `show()`, `close(returnValue)`. Emits `close` with `detail.value`.
 */
export class MisDialog extends MisElement {
  static props = { heading: { type: String }, width: { type: String } };
  static styles = [
    css`
      dialog {
        padding: 0;
        border: none;
        border-radius: 10px;
        background: var(--bg-raised);
        color: var(--text);
        box-shadow: var(--shadow-pop);
        width: var(--dialog-width, 440px);
        max-width: calc(100vw - 32px);
        max-height: calc(100vh - 48px);
        overflow: hidden;
      }
      dialog[open] {
        display: flex;
        flex-direction: column;
      }
      dialog::backdrop {
        background: rgb(0 0 0 / 0.4);
      }
      header {
        display: flex;
        align-items: center;
        padding: var(--s3) var(--s3) var(--s3) var(--s4);
        gap: var(--s2);
        border-bottom: 1px solid var(--border);
      }
      h2 {
        flex: 1;
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      .body {
        padding: var(--s4);
        overflow: auto;
        flex: 1;
        min-height: 0;
      }
      footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--s2);
        padding: var(--s3) var(--s4);
        border-top: 1px solid var(--border);
      }
      footer.empty {
        display: none;
      }
    `,
  ];
  static template = html`<dialog part="dialog"
    ><header><h2 id="title"></h2><mis-button class="x" icon="x" label="Close"></mis-button></header
    ><div class="body" part="body"><slot></slot></div
    ><footer><slot name="footer"></slot></footer
  ></dialog>`;

  connected() {
    const dialog = this.$('dialog');
    dialog.setAttribute('aria-labelledby', 'title');
    this.listen(this.$('.x'), 'click', () => this.close());
    this.listen(dialog, 'close', () => this.emit('close', { value: dialog.returnValue }));
    // Click on the backdrop (the dialog element itself, outside its content box) closes.
    this.listen(dialog, 'pointerdown', (e) => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) this.close();
    });
    // Keys typed in a dialog are not canvas shortcuts.
    this.listen(dialog, 'keydown', (e) => e.stopPropagation());
    const footerSlot = this.$('slot[name="footer"]');
    const syncFooter = () => this.$('footer').classList.toggle('empty', footerSlot.assignedNodes().length === 0);
    this.listen(footerSlot, 'slotchange', syncFooter);
    syncFooter();
  }

  get open() {
    return this.$('dialog').open;
  }

  show() {
    const dialog = this.$('dialog');
    if (!dialog.open) dialog.showModal();
  }

  close(value = '') {
    const dialog = this.$('dialog');
    if (dialog.open) dialog.close(value);
  }

  render() {
    this.$('h2').textContent = this.heading;
    if (this.width) this.style.setProperty('--dialog-width', this.width);
  }
}

/**
 * @typedef {object} MenuItem
 * @property {string} [id]
 * @property {string} [label]
 * @property {string} [icon]
 * @property {string} [shortcut]
 * @property {boolean} [disabled]
 * @property {boolean} [checked]
 * @property {boolean} [separator]
 * @property {boolean} [danger]
 */

/**
 * Popup menu built on the Popover API.
 *   menu.items = [{id: 'copy', label: 'Copy', shortcut: 'Ctrl+C'}, {separator: true}, …]
 *   menu.openAt(x, y)   or   menu.openFor(anchorElement)
 * Emits `select` with `detail.id`.
 */
export class MisMenu extends MisElement {
  static props = { items: { type: Object } };
  static styles = [
    css`
      :host {
        position: fixed;
        inset: auto;
        margin: 0;
        padding: 4px;
        border: none;
        border-radius: var(--radius);
        background: var(--bg-raised);
        color: var(--text);
        box-shadow: var(--shadow-pop);
        min-width: 170px;
        max-height: calc(100vh - 16px);
        overflow: auto;
      }
      [role='menuitem'],
      [role='menuitemcheckbox'] {
        all: unset;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        height: 26px;
        padding: 0 8px;
        border-radius: var(--radius-sm);
        white-space: nowrap;
      }
      [role^='menuitem']:hover,
      [role^='menuitem']:focus-visible {
        background: var(--accent-soft);
        outline: none;
      }
      [role^='menuitem'][aria-disabled='true'] {
        opacity: 0.4;
        pointer-events: none;
      }
      .danger {
        color: var(--danger);
      }
      .label {
        flex: 1;
      }
      .shortcut {
        color: var(--text-faint);
        font-size: var(--font-size-sm);
        margin-left: 16px;
      }
      hr {
        border: none;
        border-top: 1px solid var(--border);
        margin: 4px 0;
      }
      mis-icon {
        --icon-size: 14px;
        color: var(--text-muted);
      }
      .slot {
        width: 14px;
        flex: none;
        display: inline-flex;
      }
    `,
  ];
  static template = html`<div role="menu"></div>`;

  connected() {
    this.setAttribute('popover', 'auto');
    const menu = this.$('[role="menu"]');
    this.listen(menu, 'click', (e) => {
      const item = e.target.closest('[data-id]');
      if (!item || item.getAttribute('aria-disabled') === 'true') return;
      this.hidePopover();
      this.emit('select', { id: item.dataset.id });
    });
    this.listen(menu, 'keydown', (e) => {
      const items = this.$$('[data-id]:not([aria-disabled="true"])');
      const i = items.indexOf(this.shadowRoot.activeElement);
      let next = null;
      if (e.key === 'ArrowDown') next = items[(i + 1) % items.length];
      else if (e.key === 'ArrowUp') next = items[(i - 1 + items.length) % items.length];
      else if (e.key === 'Home') next = items[0];
      else if (e.key === 'End') next = items.at(-1);
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        /** @type {HTMLElement} */ (this.shadowRoot.activeElement)?.click();
      }
      if (next) {
        e.preventDefault();
        next.focus();
      }
      e.stopPropagation();
    });
    this.listen(this, 'toggle', (e) => {
      if (/** @type {any} */ (e).newState === 'closed') {
        this.emit('menu-close');
        this._returnFocus?.focus?.();
        this._returnFocus = null;
      }
    });
    this.listen(this, 'contextmenu', (e) => e.preventDefault());
  }

  render() {
    this.$('[role="menu"]').replaceChildren(
      ...(this.items ?? []).map((item) => {
        if (item.separator) return h('hr');
        const checkable = item.checked !== undefined;
        return h(
          'button',
          {
            type: 'button',
            class: item.danger ? 'danger' : '',
            tabIndex: -1,
            dataset: { id: item.id },
            attrs: {
              role: checkable ? 'menuitemcheckbox' : 'menuitem',
              'aria-disabled': item.disabled ? 'true' : null,
              'aria-checked': checkable ? String(!!item.checked) : null,
            },
          },
          h('span', { class: 'slot' }, item.checked ? h('mis-icon', { name: 'check' }) : item.icon ? h('mis-icon', { name: item.icon }) : null),
          h('span', { class: 'label' }, item.label),
          item.shortcut ? h('span', { class: 'shortcut' }, item.shortcut) : null,
        );
      }),
    );
  }

  /** Open with the top-left corner at viewport coordinates, kept on screen. */
  openAt(x, y) {
    this._returnFocus = /** @type {any} */ (document.activeElement);
    this.render();
    this.style.left = '0px';
    this.style.top = '0px';
    this.showPopover();
    const r = this.getBoundingClientRect();
    this.style.left = `${Math.max(8, Math.min(x, innerWidth - r.width - 8))}px`;
    this.style.top = `${Math.max(8, Math.min(y, innerHeight - r.height - 8))}px`;
    this.$('[data-id]:not([aria-disabled="true"])')?.focus();
  }

  /** Open next to an element. @param {'bottom'|'right'} [side] */
  openFor(anchor, side = 'bottom') {
    const r = anchor.getBoundingClientRect();
    if (side === 'right') this.openAt(r.right + 4, r.top);
    else this.openAt(r.left, r.bottom + 4);
  }
}

/** A menu for right-click use; same element, separate tag for clarity in markup. */
export class MisContextMenu extends MisMenu {}

/**
 * Transient messages. One instance lives in the app shell; call `toast()` from anywhere.
 */
export class MisToast extends MisElement {
  static styles = [
    css`
      :host {
        position: fixed;
        left: 50%;
        bottom: 44px;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        gap: 6px;
        align-items: center;
        z-index: 100;
        pointer-events: none;
      }
      .toast {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 12px;
        border-radius: var(--radius);
        background: var(--text);
        color: var(--bg);
        box-shadow: var(--shadow-pop);
        pointer-events: auto;
        max-width: min(520px, 90vw);
        animation: in 0.16s var(--ease);
      }
      .toast.error {
        background: var(--danger);
        color: #fff;
      }
      button {
        all: unset;
        font-weight: 700;
        text-decoration: underline;
        cursor: pointer;
      }
      button:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
      @keyframes in {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
      }
    `,
  ];
  static template = html`<div class="stack" role="status" aria-live="polite"></div>`;

  /**
   * @param {string} message
   * @param {{type?: 'info'|'error', action?: string, onAction?: () => void, timeout?: number}} [opts]
   */
  show(message, opts = {}) {
    const el = h('div', { class: `toast ${opts.type === 'error' ? 'error' : ''}` }, h('span', null, message));
    const remove = () => el.remove();
    if (opts.action) {
      el.append(
        h('button', {
          type: 'button',
          textContent: opts.action,
          onclick: () => {
            remove();
            opts.onAction?.();
          },
        }),
      );
    }
    this.$('.stack').append(el);
    const timeout = opts.timeout ?? (opts.action ? 10000 : 3500);
    if (timeout > 0) setTimeout(remove, timeout);
    return remove;
  }
}

/** Show a toast through the app's <mis-toast>. Safe to call before the app has mounted. */
export function toast(message, opts) {
  const host = /** @type {any} */ (document.querySelector('mis-app'))?.shadowRoot?.querySelector('mis-toast');
  if (host) return host.show(message, opts);
  console.info(message);
  return () => {};
}

/**
 * Tooltips. One instance in the app shell serves every element that has a `data-tip`
 * attribute, anywhere in any shadow tree. Shown on hover (after a delay) and on keyboard
 * focus. The text also backs up `aria-label`, which the controls set themselves.
 */
export class MisTooltip extends MisElement {
  static styles = [
    css`
      :host {
        position: fixed;
        inset: auto;
        margin: 0;
        border: none;
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        background: var(--text);
        color: var(--bg);
        font-size: var(--font-size-sm);
        white-space: pre;
        pointer-events: none;
        box-shadow: var(--shadow-pop);
      }
    `,
  ];
  static template = html`<span></span>`;

  connected() {
    this.setAttribute('popover', 'manual');
    this.setAttribute('role', 'tooltip');
    let timer = 0;
    let current = null;
    const find = (e) => e.composedPath().find((n) => n instanceof Element && n.hasAttribute('data-tip'));
    const hide = () => {
      clearTimeout(timer);
      current = null;
      if (this.matches(':popover-open')) this.hidePopover();
    };
    const showFor = (target) => {
      const text = target.getAttribute('data-tip');
      if (!text || !target.isConnected) return;
      this.$('span').textContent = text;
      this.style.left = '0px';
      this.style.top = '0px';
      if (!this.matches(':popover-open')) this.showPopover();
      const r = target.getBoundingClientRect();
      const t = this.getBoundingClientRect();
      // Prefer below; flip above near the bottom edge; side-on for tall narrow toolbars.
      let x = r.left + r.width / 2 - t.width / 2;
      let y = r.bottom + 6;
      if (r.left < 60 && r.height <= 40) {
        x = r.right + 8;
        y = r.top + r.height / 2 - t.height / 2;
      } else if (y + t.height > innerHeight - 4) y = r.top - t.height - 6;
      this.style.left = `${Math.max(4, Math.min(x, innerWidth - t.width - 4))}px`;
      this.style.top = `${Math.max(4, y)}px`;
    };
    const root = document;
    this.listen(root, 'pointerover', (e) => {
      const target = find(e);
      if (target === current) return;
      hide();
      if (!target || /** @type {PointerEvent} */ (e).pointerType === 'touch') return;
      current = target;
      timer = setTimeout(() => showFor(target), 450);
    });
    this.listen(root, 'pointerdown', hide, { capture: true });
    this.listen(root, 'keydown', hide, { capture: true });
    this.listen(root, 'scroll', hide, { capture: true });
    this.listen(root, 'focusin', (e) => {
      const target = find(e);
      if (!target || !target.matches(':focus-visible, :has(:focus-visible)')) return;
      hide();
      current = target;
      timer = setTimeout(() => showFor(target), 300);
    });
    this.listen(root, 'focusout', hide);
  }
}
