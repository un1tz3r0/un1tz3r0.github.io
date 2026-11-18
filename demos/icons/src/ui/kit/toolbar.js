// Tool palette elements: <mis-toolbar>, <mis-tool-button>, <mis-flyout>.

import { MisElement, css, html } from '../base.js';

/**
 * A toolbar with roving tabindex: Tab enters and leaves it, arrow keys move within it.
 *   <mis-toolbar orientation="vertical" label="Tools"> …buttons… </mis-toolbar>
 */
export class MisToolbar extends MisElement {
  static props = {
    orientation: { type: String, reflect: true, default: 'horizontal' },
    label: { type: String },
  };
  static styles = [
    css`
      :host {
        display: flex;
        gap: 2px;
        align-items: center;
      }
      :host([orientation='vertical']) {
        flex-direction: column;
      }
    `,
  ];
  static template = html`<slot></slot>`;

  /** @returns {HTMLElement[]} */
  get items() {
    return /** @type {HTMLElement[]} */ (
      this.$('slot').assignedElements({ flatten: true }).filter((el) => !el.hasAttribute('disabled') && el.localName !== 'hr' && !el.hidden)
    );
  }

  connected() {
    this.setAttribute('role', 'toolbar');
    this.listen(this.$('slot'), 'slotchange', () => this.#syncTabStops());
    this.listen(this, 'focusin', (e) => {
      const item = this.items.find((el) => el === e.target || el.contains(/** @type {Node} */ (e.target)));
      if (item) this.#syncTabStops(item);
    });
    this.listen(this, 'keydown', (e) => {
      const vertical = this.orientation === 'vertical';
      const dir = { [vertical ? 'ArrowDown' : 'ArrowRight']: 1, [vertical ? 'ArrowUp' : 'ArrowLeft']: -1 }[e.key];
      const items = this.items;
      const i = items.findIndex((el) => el.tabIndex === 0);
      let next = null;
      if (dir) next = items[(i + dir + items.length) % items.length];
      else if (e.key === 'Home') next = items[0];
      else if (e.key === 'End') next = items.at(-1);
      if (!next) return;
      e.preventDefault();
      e.stopPropagation();
      this.#syncTabStops(next);
      next.focus();
    });
  }

  #syncTabStops(active) {
    const items = this.items;
    const current = active ?? items.find((el) => el.tabIndex === 0) ?? items[0];
    for (const el of items) el.tabIndex = el === current ? 0 : -1;
  }

  render() {
    this.setAttribute('aria-orientation', this.orientation);
    if (this.label) this.setAttribute('aria-label', this.label);
    this.#syncTabStops();
  }
}

/**
 * A button for the tool palette.
 *   <mis-tool-button tool="select" icon="mouse-pointer-2" label="Select" shortcut="V" active>
 * `click` is the API. `active` marks the current tool.
 */
export class MisToolButton extends MisElement {
  static delegatesFocus = true;
  static props = {
    tool: { type: String, reflect: true },
    icon: { type: String },
    label: { type: String },
    shortcut: { type: String },
    active: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    more: { type: Boolean, reflect: true },
  };
  static styles = [
    css`
      :host {
        display: inline-flex;
        position: relative;
      }
      button {
        all: unset;
        box-sizing: border-box;
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        border-radius: var(--radius);
        color: var(--text-muted);
      }
      button:hover {
        background: var(--bg-hover);
        color: var(--text);
      }
      :host([active]) button {
        background: var(--accent);
        color: var(--accent-text);
      }
      button:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 1px;
      }
      button:disabled {
        opacity: 0.4;
      }
      mis-icon {
        --icon-size: 18px;
      }
      /* Corner mark for a button that has more tools behind it. */
      :host([more])::after {
        content: '';
        position: absolute;
        right: 3px;
        bottom: 3px;
        border: 3px solid transparent;
        border-right-color: currentColor;
        border-bottom-color: currentColor;
        opacity: 0.55;
        pointer-events: none;
        color: var(--text-muted);
      }
      :host([more][active])::after {
        color: var(--accent-text);
      }
    `,
  ];
  static template = html`<button type="button" part="button"><mis-icon></mis-icon></button>`;

  render() {
    const button = this.$('button');
    this.$('mis-icon').name = this.icon;
    button.disabled = this.disabled;
    button.setAttribute('aria-label', this.label);
    button.setAttribute('aria-pressed', String(this.active));
    this.setAttribute('data-tip', this.shortcut ? `${this.label} ${this.shortcut}` : this.label);
  }
}

/**
 * A tool button that stands for a group of tools. Click activates the group's current
 * tool; right-click, long-press or ArrowRight opens a menu of the others.
 *   flyout.tools = [{id, label, icon, shortcut}, …];  flyout.current = 'rect'
 * Emits `pick` with `detail.id`.
 */
export class MisFlyout extends MisElement {
  static delegatesFocus = true;
  static props = {
    tools: { type: Object },
    current: { type: String },
    active: { type: Boolean, reflect: true },
  };
  static styles = [
    css`
      :host {
        display: inline-flex;
      }
    `,
  ];
  static template = html`<mis-tool-button more></mis-tool-button><mis-menu></mis-menu>`;

  connected() {
    const button = this.$('mis-tool-button');
    const menu = this.$('mis-menu');
    let timer = 0;
    let opened = false;
    const open = () => {
      opened = true;
      menu.items = (this.tools ?? []).map((t) => ({ id: t.id, label: t.label, icon: t.icon, shortcut: t.shortcut, checked: t.id === this.current }));
      menu.openFor(button, 'right');
    };
    this.listen(button, 'pointerdown', () => {
      opened = false;
      timer = setTimeout(open, 400);
    });
    this.listen(button, 'pointerup', () => clearTimeout(timer));
    this.listen(button, 'pointerleave', () => clearTimeout(timer));
    this.listen(button, 'click', (e) => {
      e.stopPropagation();
      if (!opened) this.emit('pick', { id: this.#currentTool()?.id });
    });
    this.listen(button, 'contextmenu', (e) => {
      e.preventDefault();
      clearTimeout(timer);
      open();
    });
    this.listen(this, 'keydown', (e) => {
      if (e.key === 'ArrowRight' && !e.defaultPrevented) {
        e.preventDefault();
        e.stopPropagation();
        open();
      }
    });
    this.listen(menu, 'select', (e) => {
      e.stopPropagation();
      this.current = e.detail.id;
      this.emit('pick', { id: e.detail.id });
    });
  }

  #currentTool() {
    const tools = this.tools ?? [];
    return tools.find((t) => t.id === this.current) ?? tools[0];
  }

  render() {
    const tool = this.#currentTool();
    const button = this.$('mis-tool-button');
    if (!tool) return;
    button.icon = tool.icon;
    button.label = tool.label;
    button.shortcut = tool.shortcut;
    button.active = this.active;
  }
}
