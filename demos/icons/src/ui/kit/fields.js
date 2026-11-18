// Form controls: number field, text field, select, segmented control, slider, checkbox.
//
// All are form-associated and follow the same event contract:
//   `input`   while the user is changing the value (typing, scrubbing, dragging)
//   `change`  when the change is finished
// `event.detail.value` carries the new value. Number fields additionally emit
// `scrub-start` before a drag-scrub begins, so a caller can open an undo transaction.

import { MisField, css, html, h } from '../base.js';
import { fmt } from '../../core/affine.js';

const fieldStyles = css`
  :host {
    display: inline-flex;
    min-width: 0;
  }
  .box {
    display: flex;
    align-items: center;
    width: 100%;
    height: var(--control-h);
    min-width: 0;
    background: var(--bg-field);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .box:hover {
    border-color: var(--border-strong);
  }
  .box:focus-within {
    border-color: var(--focus);
    outline: 1px solid var(--focus);
  }
  :host([disabled]) .box {
    opacity: 0.45;
    pointer-events: none;
  }
  input,
  select {
    all: unset;
    box-sizing: border-box;
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0 6px;
    font: inherit;
    color: var(--text);
  }
  input::placeholder {
    color: var(--text-faint);
  }
  .prefix,
  .suffix {
    flex: none;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
    padding: 0 0 0 6px;
    white-space: nowrap;
  }
  .suffix {
    padding: 0 6px 0 0;
  }
`;

/**
 * Evaluate a small arithmetic expression: numbers, + - * /, parentheses, unary minus.
 * Returns NaN for anything else. (No `eval`.)
 */
export function evaluate(expr) {
  const src = String(expr).replace(/,/g, '.').replace(/[^\d.+\-*/()e\s]/gi, (c) => (/\s/.test(c) ? c : '?'));
  if (src.includes('?')) return NaN;
  let i = 0;
  const ws = () => {
    while (/\s/.test(src[i] ?? '')) i++;
  };
  const number = () => {
    ws();
    const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(src.slice(i));
    if (!m) return NaN;
    i += m[0].length;
    return parseFloat(m[0]);
  };
  const factor = () => {
    ws();
    if (src[i] === '-') { i++; return -factor(); }
    if (src[i] === '+') { i++; return factor(); }
    if (src[i] === '(') {
      i++;
      const v = sum();
      ws();
      if (src[i] !== ')') return NaN;
      i++;
      return v;
    }
    return number();
  };
  const product = () => {
    let v = factor();
    for (;;) {
      ws();
      if (src[i] === '*') { i++; v *= factor(); }
      else if (src[i] === '/') { i++; v /= factor(); }
      else return v;
    }
  };
  function sum() {
    let v = product();
    for (;;) {
      ws();
      if (src[i] === '+') { i++; v += product(); }
      else if (src[i] === '-') { i++; v -= product(); }
      else return v;
    }
  }
  const result = sum();
  ws();
  return i === src.length ? result : NaN;
}

/**
 * Numeric input with a scrubbable label.
 *   <mis-number-field label="X" value="12" step="1" min="0" suffix="px"></mis-number-field>
 *
 * A `null` value shows as "mixed". Arrow keys step (Shift ×10, Alt ÷10); the text may be
 * an arithmetic expression; dragging the label scrubs.
 */
export class MisNumberField extends MisField {
  static props = {
    value: { type: Number, attribute: 'value' },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number, default: 1 },
    precision: { type: Number, default: 2 },
    label: { type: String },
    suffix: { type: String },
    disabled: { type: Boolean, reflect: true },
    mixed: { type: Boolean },
    name: { type: String },
  };
  static styles = [
    fieldStyles,
    css`
      .prefix {
        cursor: ew-resize;
        min-width: 18px;
        touch-action: none;
      }
      input {
        text-align: left;
        font-variant-numeric: tabular-nums;
      }
    `,
  ];
  static template = html`<label class="box" part="box"
    ><span class="prefix" part="label"></span><input type="text" inputmode="decimal" spellcheck="false" autocomplete="off" /><span
      class="suffix"
    ></span
  ></label>`;

  connected() {
    const input = this.$('input');
    this.listen(input, 'change', (e) => {
      e.stopPropagation();
      this.#commitText();
    });
    this.listen(input, 'input', (e) => e.stopPropagation());
    this.listen(input, 'focus', () => input.select());
    this.listen(input, 'keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const dir = e.key === 'ArrowUp' ? 1 : -1;
        const scale = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
        this.#set((this.value ?? 0) + dir * (this.step ?? 1) * scale, 'change');
      } else if (e.key === 'Enter') {
        this.#commitText();
        input.select();
      } else if (e.key === 'Escape') {
        this.render();
        input.blur();
      }
      // Single-key tool shortcuts must not fire while typing here.
      e.stopPropagation();
    });
    this.#initScrub();
  }

  #initScrub() {
    const label = this.$('.prefix');
    let start = null;
    this.listen(label, 'pointerdown', (e) => {
      if (this.disabled || e.button !== 0) return;
      e.preventDefault();
      label.setPointerCapture(e.pointerId);
      start = { x: e.clientX, value: this.value ?? 0, moved: false };
    });
    this.listen(label, 'pointermove', (e) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      if (!start.moved) {
        if (Math.abs(dx) < 3) return;
        start.moved = true;
        this.emit('scrub-start');
      }
      const scale = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
      this.#set(start.value + Math.round(dx / 2) * (this.step ?? 1) * scale, 'input');
    });
    const end = () => {
      if (!start) return;
      const moved = start.moved;
      start = null;
      if (moved) this.emit('change', { value: this.value });
      else this.$('input').focus();
    };
    this.listen(label, 'pointerup', end);
    this.listen(label, 'pointercancel', end);
  }

  #clamp(v) {
    if (this.min !== null && v < this.min) v = this.min;
    if (this.max !== null && v > this.max) v = this.max;
    const p = this.precision ?? 2;
    return Math.round(v * 10 ** p) / 10 ** p;
  }

  #set(v, eventType) {
    if (!Number.isFinite(v)) return;
    const next = this.#clamp(v);
    const changed = next !== this.value || this.mixed;
    this.mixed = false;
    this.value = next;
    if (changed || eventType === 'change') this.emit(eventType, { value: next });
  }

  #commitText() {
    const text = this.$('input').value.trim();
    if (text === '') {
      this.render();
      return;
    }
    const v = evaluate(text);
    if (Number.isFinite(v)) this.#set(v, 'change');
    this.render();
  }

  render() {
    const input = this.$('input');
    const label = this.$('.prefix');
    const suffix = this.$('.suffix');
    label.textContent = this.label;
    label.hidden = !this.label;
    suffix.textContent = this.suffix;
    suffix.hidden = !this.suffix;
    input.disabled = this.disabled;
    // The accessible name comes from the host's aria-label when the visible label is
    // absent or just a letter ("X", "W").
    const name = this.getAttribute('aria-label') || this.label;
    if (name) input.setAttribute('aria-label', name);
    const showMixed = this.mixed || this.value === null;
    const text = showMixed ? '' : fmt(this.value, this.precision ?? 2);
    input.placeholder = showMixed ? 'mixed' : '';
    if (this.shadowRoot.activeElement !== input || input.value === '') input.value = text;
    else if (evaluate(input.value) !== this.value) input.value = text;
    this.setFormValue(showMixed ? null : this.value);
  }
}

/**
 * Text input.
 *   <mis-text-field placeholder="Search" icon="search" clearable></mis-text-field>
 */
export class MisTextField extends MisField {
  static props = {
    value: { type: String },
    placeholder: { type: String },
    icon: { type: String },
    label: { type: String },
    disabled: { type: Boolean, reflect: true },
    clearable: { type: Boolean },
    type: { type: String, default: 'text' },
    name: { type: String },
  };
  static styles = [
    fieldStyles,
    css`
      mis-icon {
        margin-left: 6px;
        color: var(--text-muted);
      }
      .clear {
        all: unset;
        display: grid;
        place-items: center;
        width: 20px;
        height: 20px;
        margin-right: 2px;
        border-radius: 3px;
        color: var(--text-muted);
      }
      .clear:hover {
        background: var(--bg-hover);
      }
    `,
  ];
  static template = html`<label class="box" part="box"
    ><mis-icon hidden></mis-icon><input spellcheck="false" autocomplete="off" /><button class="clear" type="button" aria-label="Clear" hidden>
      <mis-icon name="x" style="--icon-size:12px"></mis-icon></button
  ></label>`;

  connected() {
    const input = this.$('input');
    this.listen(input, 'input', (e) => {
      e.stopPropagation();
      this.value = input.value;
      this.emit('input', { value: this.value });
    });
    this.listen(input, 'change', (e) => {
      e.stopPropagation();
      this.emit('change', { value: this.value });
    });
    this.listen(input, 'keydown', (e) => {
      if (e.key === 'Escape' && this.clearable && this.value) {
        this.#clear();
      } else if (e.key === 'Escape') {
        input.blur();
      }
      if (!['ArrowUp', 'ArrowDown', 'Enter', 'Tab'].includes(e.key) || e.key === 'Tab') e.stopPropagation();
    });
    this.listen(this.$('.clear'), 'click', () => this.#clear());
  }

  #clear() {
    this.value = '';
    this.emit('input', { value: '' });
    this.emit('change', { value: '' });
    this.$('input').focus();
  }

  focus() {
    this.$('input').focus();
  }

  render() {
    const input = this.$('input');
    if (input.value !== this.value) input.value = this.value;
    input.type = this.type || 'text';
    input.placeholder = this.placeholder;
    input.disabled = this.disabled;
    if (this.label) input.setAttribute('aria-label', this.label);
    const icon = this.$('mis-icon');
    icon.hidden = !this.icon;
    icon.name = this.icon;
    this.$('.clear').hidden = !(this.clearable && this.value);
    this.setFormValue(this.value);
  }
}

/**
 * Drop-down built on a native <select>.
 *   el.options = [{value: 'a', label: 'A'}, {group: 'More', options: [...]}]
 */
export class MisSelect extends MisField {
  static props = {
    value: { type: String },
    options: { type: Object },
    label: { type: String },
    disabled: { type: Boolean, reflect: true },
    mixed: { type: Boolean },
    name: { type: String },
  };
  static styles = [
    fieldStyles,
    css`
      .box {
        position: relative;
      }
      select {
        padding-right: 20px;
        line-height: calc(var(--control-h) - 2px);
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      select option {
        background: var(--bg-raised);
        color: var(--text);
      }
      mis-icon {
        position: absolute;
        right: 4px;
        pointer-events: none;
        color: var(--text-muted);
        --icon-size: 12px;
      }
    `,
  ];
  static template = html`<label class="box" part="box"><span class="prefix" hidden></span><select></select><mis-icon name="chevron-down"></mis-icon></label>`;

  connected() {
    const select = this.$('select');
    this.listen(select, 'change', (e) => {
      e.stopPropagation();
      this.mixed = false;
      this.value = select.value;
      this.emit('change', { value: this.value });
    });
    this.listen(select, 'keydown', (e) => e.stopPropagation());
  }

  propChanged(name) {
    if (name === 'options') this._optionsDirty = true;
  }

  render() {
    const select = this.$('select');
    if (this._optionsDirty || !select.options.length) {
      this._optionsDirty = false;
      const make = (o) => h('option', { value: String(o.value), textContent: o.label ?? String(o.value), disabled: !!o.disabled });
      select.replaceChildren(
        h('option', { value: '\u0000mixed', textContent: 'Mixed', hidden: true }),
        ...(this.options ?? []).map((o) => (o.group ? h('optgroup', { label: o.group }, o.options.map(make)) : make(o))),
      );
    }
    select.value = this.mixed ? '\u0000mixed' : this.value;
    select.disabled = this.disabled;
    const prefix = this.$('.prefix');
    prefix.hidden = !this.label;
    prefix.textContent = this.label;
    const name = this.getAttribute('aria-label') || this.label;
    if (name) select.setAttribute('aria-label', name);
    this.setFormValue(this.value);
  }
}

/**
 * A row of mutually exclusive buttons (a radio group).
 *   el.options = [{value: 'start', icon: 'align-left', label: 'Left'}, …]
 */
export class MisSegmented extends MisField {
  static props = {
    value: { type: String },
    options: { type: Object },
    label: { type: String },
    disabled: { type: Boolean, reflect: true },
    name: { type: String },
  };
  static styles = [
    css`
      :host {
        display: inline-flex;
      }
      .group {
        display: flex;
        width: 100%;
        height: var(--control-h);
        padding: 2px;
        gap: 2px;
        background: var(--bg-field);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
      }
      button {
        all: unset;
        box-sizing: border-box;
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        min-width: 22px;
        padding: 0 6px;
        border-radius: 3px;
        color: var(--text-muted);
        white-space: nowrap;
      }
      button:hover {
        color: var(--text);
        background: var(--bg-hover);
      }
      button[aria-checked='true'] {
        background: var(--accent-soft);
        color: var(--accent);
      }
      button:focus-visible {
        outline: 2px solid var(--focus);
      }
      :host([disabled]) {
        opacity: 0.45;
        pointer-events: none;
      }
      mis-icon {
        --icon-size: 14px;
      }
    `,
  ];
  static template = html`<div class="group" role="radiogroup"></div>`;

  connected() {
    const group = this.$('.group');
    this.listen(group, 'click', (e) => {
      const button = e.target.closest('button');
      if (button) this.#pick(button.dataset.value);
    });
    this.listen(group, 'keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      e.stopPropagation();
      const opts = this.options ?? [];
      const i = opts.findIndex((o) => String(o.value) === this.value);
      const next = opts[(i + keys[e.key] + opts.length) % opts.length];
      if (next) {
        this.#pick(String(next.value));
        queueMicrotask(() => this.$('button[aria-checked="true"]')?.focus());
      }
    });
  }

  #pick(value) {
    if (value === this.value) return;
    this.value = value;
    this.emit('change', { value });
  }

  render() {
    const group = this.$('.group');
    if (this.label) group.setAttribute('aria-label', this.label);
    group.replaceChildren(
      ...(this.options ?? []).map((o) => {
        const checked = String(o.value) === this.value;
        return h(
          'button',
          {
            type: 'button',
            dataset: { value: String(o.value) },
            tabIndex: checked || (!this.value && o === this.options[0]) ? 0 : -1,
            attrs: { role: 'radio', 'aria-checked': String(checked), 'aria-label': o.label, 'data-tip': o.icon ? o.label : null },
          },
          o.icon ? h('mis-icon', { name: o.icon }) : o.label,
        );
      }),
    );
    this.setFormValue(this.value);
  }
}

/** Range slider. `<mis-slider min="0" max="1" step="0.01" value="0.5">` */
export class MisSlider extends MisField {
  static props = {
    value: { type: Number },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    label: { type: String },
    disabled: { type: Boolean, reflect: true },
    name: { type: String },
  };
  static styles = [
    css`
      :host {
        display: inline-flex;
        align-items: center;
        min-width: 60px;
        height: var(--control-h);
      }
      input {
        width: 100%;
        margin: 0;
        accent-color: var(--accent);
      }
      :host([disabled]) {
        opacity: 0.45;
        pointer-events: none;
      }
    `,
  ];
  static template = html`<input type="range" />`;

  connected() {
    const input = this.$('input');
    let dragging = false;
    this.listen(input, 'input', (e) => {
      e.stopPropagation();
      if (!dragging) {
        dragging = true;
        this.emit('scrub-start');
      }
      this.value = Number(input.value);
      this.emit('input', { value: this.value });
    });
    this.listen(input, 'change', (e) => {
      e.stopPropagation();
      dragging = false;
      this.value = Number(input.value);
      this.emit('change', { value: this.value });
    });
    this.listen(input, 'keydown', (e) => e.stopPropagation());
  }

  render() {
    const input = this.$('input');
    input.min = String(this.min ?? 0);
    input.max = String(this.max ?? 100);
    input.step = String(this.step ?? 1);
    input.value = String(this.value ?? 0);
    input.disabled = this.disabled;
    const name = this.getAttribute('aria-label') || this.label;
    if (name) input.setAttribute('aria-label', name);
    this.setFormValue(this.value);
  }
}

/** Checkbox with a slotted label. `<mis-checkbox checked>Visible</mis-checkbox>` */
export class MisCheckbox extends MisField {
  static props = {
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    name: { type: String },
  };
  static styles = [
    css`
      :host {
        display: inline-flex;
      }
      label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: var(--control-h);
        cursor: default;
      }
      input {
        margin: 0;
        width: 14px;
        height: 14px;
        accent-color: var(--accent);
      }
      :host([disabled]) {
        opacity: 0.45;
        pointer-events: none;
      }
    `,
  ];
  static template = html`<label><input type="checkbox" /><slot></slot></label>`;

  connected() {
    const input = this.$('input');
    this.listen(input, 'change', (e) => {
      e.stopPropagation();
      this.checked = input.checked;
      this.emit('change', { value: this.checked });
    });
  }

  render() {
    const input = this.$('input');
    input.checked = this.checked;
    input.disabled = this.disabled;
    this.setFormValue(this.checked ? 'on' : null);
  }
}
