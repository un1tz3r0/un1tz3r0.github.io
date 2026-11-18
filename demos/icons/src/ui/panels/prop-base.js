// Shared machinery for the property sections in the right sidebar.

import { MisElement, css, html, h } from '../base.js';
import { editor } from '../../app.js';
import { updateNodes, findNode } from '../../core/model/tree.js';

export const sectionStyles = css`
  :host {
    display: block;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: var(--control-h);
    min-width: 0;
  }
  .row > .lbl {
    flex: none;
    width: 58px;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .row > .ctl {
    flex: 1;
    display: flex;
    gap: 4px;
    min-width: 0;
    align-items: center;
  }
  .ctl > * {
    flex: 1 1 0;
    min-width: 0;
  }
  .ctl > mis-button,
  .ctl > .fixed {
    flex: none;
  }
  .grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .grid2 > * {
    min-width: 0;
  }
  .note {
    color: var(--text-muted);
    font-size: var(--font-size-sm);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
  .note a {
    color: var(--accent);
  }
  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  textarea {
    width: 100%;
    min-height: 52px;
    resize: vertical;
    background: var(--bg-field);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 4px 6px;
    font: inherit;
    color: var(--text);
  }
  textarea:focus {
    outline: 1px solid var(--focus);
    border-color: var(--focus);
  }
  .item {
    display: grid;
    gap: 6px;
    padding: 6px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .item-head {
    display: flex;
    align-items: center;
    font-weight: 600;
  }
  .item-head span {
    flex: 1;
  }
`;

/** A labelled row of controls. */
export function row(label, ...controls) {
  return h('div', { class: 'row' }, h('span', { class: 'lbl', textContent: label, title: label }), h('div', { class: 'ctl' }, controls));
}

/**
 * The value shared by every item, or `{mixed: true}` when they differ.
 * @template T
 * @param {any[]} items
 * @param {(item: any) => T} get
 * @returns {{value: T | null, mixed: boolean}}
 */
export function common(items, get) {
  if (!items.length) return { value: null, mixed: false };
  const first = get(items[0]);
  const key = JSON.stringify(first);
  for (let i = 1; i < items.length; i++) {
    if (JSON.stringify(get(items[i])) !== key) return { value: null, mixed: true };
  }
  return { value: first, mixed: false };
}

/** Put a `common()` result into a number/select/paint field. */
export function show(field, result) {
  field.mixed = result.mixed;
  if ('paint' in field) field.paint = result.value;
  else if (!result.mixed) field.value = result.value;
  else if ('value' in field && field.localName === 'mis-number-field') field.value = null;
}

/**
 * Base class for a property section. Subclasses build their controls once in `build()`
 * and copy state into them in `update()`; they never re-create controls, so focus and
 * in-progress typing survive every store change.
 */
export class PropSection extends MisElement {
  static heading = '';
  static styles = [sectionStyles];
  static template = html`<mis-section><div class="rows" style="display:grid;gap:6px"></div></mis-section>`;

  /** Whether the section is relevant for the current state. @param {PropState} _state */
  static applies(_state) {
    return true;
  }

  connected() {
    const ctor = /** @type {typeof PropSection} */ (this.constructor);
    this.$('mis-section').heading = ctor.heading;
    if (!this._built) {
      this._built = true;
      this.build(this.$('.rows'));
    }
  }

  /** @param {HTMLElement} _host */
  build(_host) {}
  /** @param {PropState} _state */
  update(_state) {}

  /**
   * Connect a field to the document. `fn(doc, value)` returns the edited document.
   * Continuous changes (scrubbing, dragging a slider or color) become one undo step.
   * @param {HTMLElement} field
   * @param {string} label  undo label
   * @param {(doc: any, value: any) => any} fn
   */
  bind(field, label, fn) {
    field.addEventListener('scrub-start', (e) => {
      e.stopPropagation();
      editor.begin(label);
    });
    field.addEventListener('input', (e) => {
      e.stopPropagation();
      if (!editor.gesture) editor.begin(label);
      const value = /** @type {CustomEvent} */ (e).detail.value;
      editor.preview((doc) => fn(doc, value));
    });
    field.addEventListener('change', (e) => {
      e.stopPropagation();
      const value = /** @type {CustomEvent} */ (e).detail.value;
      if (editor.gesture) {
        editor.preview((doc) => fn(doc, value));
        editor.commit();
      } else {
        editor.apply(label, (doc) => fn(doc, value));
      }
    });
    return field;
  }

  /**
   * `bind` for the common case: patch each target node.
   * @param {HTMLElement} field
   * @param {string} label
   * @param {(node: any, value: any) => any} patch  returns the new node (or the same one)
   * @param {() => string[]} [targets]  ids to patch; defaults to the selection
   */
  bindNodes(field, label, patch, targets = () => editor.selection) {
    return this.bind(field, label, (doc, value) => updateNodes(doc, targets(), (node) => patch(node, value)));
  }
}

/**
 * @typedef {object} PropState
 * @property {import('../../core/model/nodes.js').Doc} doc
 * @property {string[]} ids         selected ids
 * @property {any[]} nodes          selected nodes
 * @property {string} tool          active tool id
 * @property {any} toolClass        active tool constructor
 */

/** Nodes whose fill/stroke the Fill and Stroke sections edit: selected paint-bearing
 *  nodes, plus everything paintable inside selected groups. */
export function paintTargets(doc, ids, { icons = false } = {}) {
  const out = [];
  const visit = (node) => {
    if (node.type === 'path' || node.type === 'shape' || node.type === 'text') out.push(node);
    else if (node.type === 'icon' && icons && !node.palette) out.push(node);
    else if (node.type === 'group') node.children.forEach(visit);
  };
  for (const id of ids) {
    const node = findNode(doc, id);
    if (node) visit(node);
  }
  return out;
}

export { h, editor };
