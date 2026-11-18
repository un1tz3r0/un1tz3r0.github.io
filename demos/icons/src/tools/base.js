// Tool interface. DESIGN.md §6.
//
// A tool receives pointer events that already carry document coordinates, and returns
// overlay vnodes (screen space) describing whatever it wants drawn on top of the artwork.

/**
 * @typedef {object} ToolPointerEvent
 * @property {{x:number, y:number}} screen   position in canvas pixels
 * @property {{x:number, y:number}} raw      position in document units, unsnapped
 * @property {{x:number, y:number}} client   viewport position
 * @property {boolean} shift
 * @property {boolean} alt
 * @property {boolean} mod                   Ctrl, or Cmd on macOS
 * @property {number} button
 * @property {string} pointerType
 * @property {(opts?: {deep?: boolean}) => string | null} hit   id of the node under the pointer
 * @property {PointerEvent | MouseEvent} original
 */

/**
 * @typedef {object} ToolOption
 * @property {string} key
 * @property {string} label
 * @property {'number'|'boolean'|'select'} type
 * @property {any} default
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [step]
 * @property {{value: string, label: string}[]} [options]
 */

import { findNode, worldMatrix } from '../core/model/tree.js';
import { isIdentity } from '../core/affine.js';

export class Tool {
  static id = '';
  static label = '';
  static icon = '';
  static shortcut = '';
  /** Flyout group this tool belongs to in the palette, if any. */
  static group = '';
  /** Bottom-panel tab to show while this tool is active. */
  static assetTab = 'swatches';
  /** @type {ToolOption[]} */
  static options = [];

  /** @param {{editor: import('../core/editor.js').Editor, canvas: any, tools: Map<string, Tool>, services: any}} app */
  constructor(app) {
    this.app = app;
  }

  get editor() {
    return this.app.editor;
  }

  get canvas() {
    return this.app.canvas;
  }

  /** @returns {import('../core/model/nodes.js').Doc} */
  get doc() {
    return this.app.editor.doc;
  }

  /** @returns {import('../render/viewport.js').View} */
  get view() {
    return this.app.editor.store.get('view');
  }

  /** Current option values: stored values over the declared defaults. */
  get options() {
    const ctor = /** @type {typeof Tool} */ (this.constructor);
    const defaults = Object.fromEntries(ctor.options.map((o) => [o.key, o.default]));
    return { ...defaults, ...this.editor.toolOptions(ctor.id) };
  }

  /**
   * Where new objects go: the group the user has entered, or the document root. A group
   * with a transform of its own is skipped, because tools work in document coordinates
   * and an object drawn there would land somewhere else.
   * @returns {string | null}
   */
  parentId() {
    const scope = this.editor.store.get('scope');
    if (!scope || !findNode(this.doc, scope)) return null;
    return isIdentity(worldMatrix(this.doc, scope)) ? scope : null;
  }

  /** Ask the canvas to redraw the overlay. */
  invalidate() {
    this.canvas?.invalidateOverlay();
  }

  // --- lifecycle and events (override as needed) -------------------------------------------
  activate() {}
  deactivate() {}
  /** @param {ToolPointerEvent} _e */
  onPointerDown(_e) {}
  /** @param {ToolPointerEvent} _e */
  onPointerMove(_e) {}
  /** @param {ToolPointerEvent} _e */
  onPointerUp(_e) {}
  /** The gesture was interrupted (pointercancel, a second finger). */
  onPointerCancel() {}
  /** @param {ToolPointerEvent} _e */
  onDoubleClick(_e) {}
  /** @param {KeyboardEvent} _e @returns {boolean} true if the key was handled */
  onKeyDown(_e) {
    return false;
  }
  /** @param {KeyboardEvent} _e */
  onKeyUp(_e) {}
  /** CSS cursor for the current state. */
  cursor() {
    return 'default';
  }
  /** @returns {import('../core/io/vnode.js').VNode[]} overlay content, in screen space */
  overlay() {
    return [];
  }
}
