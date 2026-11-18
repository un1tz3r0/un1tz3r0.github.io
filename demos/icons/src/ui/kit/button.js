// <mis-icon> and <mis-button>.

import { MisElement, css, html } from '../base.js';
import { GLYPHS } from './glyphs.js';

/**
 * A UI glyph. `name` selects from the built-in set (see glyphs.js).
 *   <mis-icon name="undo-2"></mis-icon>
 */
export class MisIcon extends MisElement {
  static props = { name: { type: String, reflect: true } };
  static styles = [
    css`
      :host {
        display: inline-flex;
        width: var(--icon-size);
        height: var(--icon-size);
        flex: none;
        vertical-align: middle;
      }
      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ];
  static template = html`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"></svg>`;

  render() {
    this.$('svg').innerHTML = GLYPHS[this.name] ?? '';
  }
}

/**
 * A button.
 *   <mis-button icon="save" variant="primary">Save</mis-button>
 *
 * Attributes: `icon`, `variant` (ghost | outline | primary | danger), `pressed`
 * (toggle state, sets aria-pressed), `disabled`, `label` (accessible name for icon-only
 * buttons, also used as the tooltip), `shortcut` (shown in the tooltip).
 * The native `click` event is the API.
 */
export class MisButton extends MisElement {
  static delegatesFocus = true;
  static props = {
    icon: { type: String, reflect: true },
    variant: { type: String, reflect: true, default: 'ghost' },
    pressed: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    label: { type: String },
    shortcut: { type: String },
    toggle: { type: Boolean },
  };
  static styles = [
    css`
      :host {
        display: inline-flex;
        flex: none;
      }
      button {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-width: var(--control-h);
        height: var(--control-h);
        padding: 0 5px;
        width: 100%;
        border-radius: var(--radius-sm);
        cursor: default;
        white-space: nowrap;
        color: var(--text);
        font: inherit;
      }
      :host(:not([icon])) button,
      button.has-text {
        padding: 0 10px;
      }
      button:hover {
        background: var(--bg-hover);
      }
      button:active,
      :host([pressed]) button {
        background: var(--bg-active);
      }
      :host([pressed]) button {
        color: var(--accent);
        background: var(--accent-soft);
      }
      :host([variant='outline']) button {
        border: 1px solid var(--border);
        background: var(--bg-raised);
      }
      :host([variant='outline']) button:hover {
        border-color: var(--border-strong);
      }
      :host([variant='primary']) button {
        background: var(--accent);
        color: var(--accent-text);
        font-weight: 600;
      }
      :host([variant='primary']) button:hover {
        background: var(--accent-hover);
      }
      :host([variant='danger']) button {
        color: var(--danger);
      }
      button:disabled {
        opacity: 0.4;
        pointer-events: none;
      }
      button:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 1px;
      }
      slot:not(.has) {
        display: none;
      }
    `,
  ];
  static template = html`<button part="button" type="button"><mis-icon hidden></mis-icon><slot></slot></button>`;

  connected() {
    const slot = this.$('slot');
    const sync = () => {
      const has = slot.assignedNodes().some((n) => n.nodeType === 1 || n.textContent.trim());
      slot.classList.toggle('has', has);
      this.$('button').classList.toggle('has-text', has);
    };
    this.listen(slot, 'slotchange', sync);
    sync();
    // A disabled host must swallow clicks that land on its padding.
    this.listen(this, 'click', (e) => {
      if (this.disabled) e.stopImmediatePropagation();
    }, { capture: true });
  }

  render() {
    const button = this.$('button');
    const icon = this.$('mis-icon');
    icon.hidden = !this.icon;
    icon.name = this.icon;
    button.disabled = this.disabled;
    if (this.label) {
      button.setAttribute('aria-label', this.label);
      this.setAttribute('data-tip', this.shortcut ? `${this.label} ${this.shortcut}` : this.label);
    } else {
      button.removeAttribute('aria-label');
    }
    if (this.toggle || this.hasAttribute('pressed')) button.setAttribute('aria-pressed', String(this.pressed));
    else button.removeAttribute('aria-pressed');
  }
}
