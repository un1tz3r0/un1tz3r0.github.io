// MisElement — the base class every custom element in the app extends. DESIGN.md §12.2.
//
// What it provides:
//   • an open shadow root, filled from a <template> and styled with constructable sheets
//   • declared properties that reflect to/from attributes and schedule a re-render
//   • one batched `render()` per microtask, however many properties changed
//   • `this.signal`: an AbortSignal that fires on disconnect, so listeners and store
//     subscriptions registered through `listen()` / `watch()` clean themselves up
//
// Elements do not register themselves; `src/main.js` calls `define()` for each.

/** Build a CSSStyleSheet from a template literal. */
export function css(strings, ...values) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(String.raw(strings, ...values));
  return sheet;
}

/** Build an HTMLTemplateElement from a template literal. */
export function html(strings, ...values) {
  const template = document.createElement('template');
  template.innerHTML = String.raw(strings, ...values);
  return template;
}

/**
 * Create an element. `props` keys: `class`, `style` (string), `dataset`, `on<Event>`
 * listeners, `attrs` (object of attributes); everything else is set as a property.
 * @param {string} tag
 * @param {Record<string, any> | null} [props]
 * @param {...(Node | string | null | undefined | false | (Node | string)[])} children
 * @returns {any}
 */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === undefined || value === null) continue;
    if (key === 'class') el.className = value;
    else if (key === 'style') el.style.cssText = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key === 'attrs') {
      for (const [a, v] of Object.entries(value)) {
        if (v === false || v === null || v === undefined) continue;
        el.setAttribute(a, v === true ? '' : String(v));
      }
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else el[key] = value;
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child);
  }
  return el;
}

/** Styles shared by every element's shadow root. */
export const sharedStyles = css`
  :host {
    box-sizing: border-box;
    font: var(--font-size) / 1.4 var(--font);
    color: var(--text);
  }
  :host([hidden]),
  [hidden] {
    display: none !important;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  :focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 1px;
  }
  button,
  input,
  select,
  textarea {
    font: inherit;
    color: inherit;
  }
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  ::-webkit-scrollbar-thumb {
    background: var(--border-strong);
    border-radius: 5px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  ::-webkit-scrollbar-corner {
    background: transparent;
  }
  /* Page-level rules do not reach into shadow trees, so this is repeated here. */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;

const VALUES = Symbol('values');
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/**
 * @typedef {object} PropDef
 * @property {typeof String | typeof Number | typeof Boolean | typeof Object} [type]
 * @property {string | false} [attribute]  attribute name; `false` for property-only
 * @property {boolean} [reflect]           write changes back to the attribute
 * @property {any} [default]
 */

export class MisElement extends HTMLElement {
  /** @type {HTMLTemplateElement | null} */
  static template = null;
  /** @type {CSSStyleSheet[]} */
  static styles = [];
  /** @type {Record<string, PropDef>} */
  static props = {};
  static delegatesFocus = false;

  static get observedAttributes() {
    return Object.entries(this.props)
      .filter(([, def]) => def.attribute !== false && def.type !== Object)
      .map(([name, def]) => def.attribute || kebab(name));
  }

  /** Register this class as a custom element (idempotent). */
  static define(tag) {
    if (customElements.get(tag)) return;
    this.finalize();
    customElements.define(tag, this);
  }

  static finalize() {
    if (Object.hasOwn(this, '_finalized')) return;
    this._finalized = true;
    this._attrToProp = new Map();
    for (const [name, def] of Object.entries(this.props)) {
      if (def.attribute !== false && def.type !== Object) this._attrToProp.set(def.attribute || kebab(name), name);
      if (Object.getOwnPropertyDescriptor(this.prototype, name)) continue;
      Object.defineProperty(this.prototype, name, {
        configurable: true,
        enumerable: true,
        get() {
          return this[VALUES][name];
        },
        set(value) {
          this._setProp(name, value, true);
        },
      });
    }
  }

  constructor() {
    super();
    const ctor = /** @type {typeof MisElement} */ (this.constructor);
    ctor.finalize();
    this[VALUES] = {};
    for (const [name, def] of Object.entries(ctor.props)) {
      this[VALUES][name] = def.default ?? (def.type === Boolean ? false : def.type === Number ? null : def.type === Object ? null : '');
    }
    const root = this.attachShadow({ mode: 'open', delegatesFocus: ctor.delegatesFocus });
    root.adoptedStyleSheets = [sharedStyles, ...ctor.styles];
    if (ctor.template) root.append(ctor.template.content.cloneNode(true));
    this._abort = null;
    this._renderQueued = false;
    this._reflecting = false;
  }

  connectedCallback() {
    // Properties assigned before the element was upgraded sit on the instance and shadow
    // the accessors; move them through the setters.
    const ctor = /** @type {typeof MisElement} */ (this.constructor);
    for (const name of Object.keys(ctor.props)) {
      if (Object.hasOwn(this, name)) {
        const value = this[name];
        delete this[name];
        this[name] = value;
      }
    }
    this._abort = new AbortController();
    this.connected();
    this.requestUpdate();
  }

  disconnectedCallback() {
    this._abort?.abort();
    this._abort = null;
    this.disconnected();
  }

  attributeChangedCallback(attr, _old, value) {
    if (this._reflecting) return;
    const ctor = /** @type {typeof MisElement} */ (this.constructor);
    const name = ctor._attrToProp?.get(attr);
    if (!name) return;
    const def = ctor.props[name];
    let parsed = value;
    if (def.type === Boolean) parsed = value !== null;
    else if (def.type === Number) parsed = value === null || value === '' ? null : Number(value);
    else if (value === null) parsed = def.default ?? '';
    this._setProp(name, parsed, false);
  }

  _setProp(name, value, reflect) {
    const ctor = /** @type {typeof MisElement} */ (this.constructor);
    const def = ctor.props[name];
    if (def.type === Boolean) value = !!value;
    else if (def.type === Number) value = value === null || value === undefined || value === '' ? null : Number(value);
    else if (def.type === String) value = value === null || value === undefined ? '' : String(value);
    const old = this[VALUES][name];
    if (Object.is(old, value)) return;
    this[VALUES][name] = value;
    if (reflect && def.reflect && def.attribute !== false && def.type !== Object) {
      const attr = def.attribute || kebab(name);
      this._reflecting = true;
      if (def.type === Boolean) this.toggleAttribute(attr, value);
      else if (value === null || value === '') this.removeAttribute(attr);
      else this.setAttribute(attr, String(value));
      this._reflecting = false;
    }
    this.propChanged(name, value, old);
    this.requestUpdate();
  }

  /** Schedule one `render()` at the end of the current microtask. */
  requestUpdate() {
    if (this._renderQueued || !this.isConnected) return;
    this._renderQueued = true;
    queueMicrotask(() => {
      this._renderQueued = false;
      if (this.isConnected) this.render();
    });
  }

  /** Fires when the element is disconnected. */
  get signal() {
    return this._abort?.signal;
  }

  /** Query the shadow root. @returns {any} */
  $(selector) {
    return this.shadowRoot.querySelector(selector);
  }

  /** @returns {any[]} */
  $$(selector) {
    return [...this.shadowRoot.querySelectorAll(selector)];
  }

  /** Dispatch a bubbling, composed CustomEvent. Returns false if it was cancelled. */
  emit(type, detail, opts = {}) {
    return this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true, cancelable: !!opts.cancelable }));
  }

  /** addEventListener that is removed automatically on disconnect. */
  listen(target, type, handler, options = {}) {
    target.addEventListener(type, handler, { ...options, signal: this.signal });
  }

  /** Store subscription that ends automatically on disconnect. */
  watch(store, selector, cb, opts = {}) {
    return store.subscribe(selector, cb, { ...opts, signal: this.signal });
  }

  // --- hooks for subclasses ---------------------------------------------------------------
  connected() {}
  disconnected() {}
  /** @param {string} _name @param {any} _value @param {any} _old */
  propChanged(_name, _value, _old) {}
  render() {}
}

/**
 * Base for form-associated controls: gives the element a form value, a disabled state
 * that follows <fieldset disabled>, and label association.
 */
export class MisField extends MisElement {
  static formAssociated = true;
  static delegatesFocus = true;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /** Call whenever the control's value changes, to keep the owning form in sync. */
  setFormValue(value) {
    this.internals.setFormValue(value === null || value === undefined ? null : String(value));
  }

  formDisabledCallback(disabled) {
    if ('disabled' in this) /** @type {any} */ (this).disabled = disabled;
  }
}
