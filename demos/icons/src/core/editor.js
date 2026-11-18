// The editor: application state, undo history and the command registry, with no DOM.
//
// History works on whole document roots. Because the tree is immutable, an entry is just
// a reference to an earlier root plus the selection that went with it.

import { createStore } from './store.js';
import { createCommands } from './commands.js';
import { createDoc, solid, makeStroke } from './model/nodes.js';
import { existing } from './model/tree.js';

const HISTORY_LIMIT = 200;

/** @typedef {import('./model/nodes.js').Doc} Doc */

export class Editor {
  /** @param {Doc} [doc] */
  constructor(doc = createDoc()) {
    this.store = createStore({
      doc,
      /** @type {string[]} */
      selection: [],
      /** Group currently "entered" by double-click; `null` at the root. */
      scope: /** @type {string | null} */ (null),
      view: { zoom: 1, panX: 0, panY: 0 },
      tool: 'select',
      /** Per-tool option values, keyed by tool id. */
      toolOptions: {},
      /** Style applied to newly drawn objects. */
      style: { fill: solid('#1f2937'), stroke: makeStroke() },
      history: { canUndo: false, canRedo: false, undoLabel: '', redoLabel: '' },
      /** Whether the document differs from what was last saved to a file. */
      dirty: false,
      /** What the Node tool has selected (a counter the properties panel watches). */
      nodeSelection: { count: 0, version: 0 },
      ui: {},
    });
    /** @type {{label:string, doc:Doc, selection:string[]}[]} */
    this.undoStack = [];
    /** @type {{label:string, doc:Doc, selection:string[]}[]} */
    this.redoStack = [];
    /** @type {{label:string, doc:Doc, selection:string[]} | null} */
    this.gesture = null;
    this.commands = createCommands(this);
  }

  /** @returns {Doc} */
  get doc() {
    return this.store.get('doc');
  }

  /** @returns {string[]} */
  get selection() {
    return this.store.get('selection');
  }

  // --- selection -------------------------------------------------------------------------

  /** @param {string[]} ids */
  select(ids) {
    const next = existing(this.doc, [...new Set(ids)]);
    const current = this.selection;
    if (next.length === current.length && next.every((id, i) => id === current[i])) return;
    this.store.set({ selection: next });
  }

  // --- edits -----------------------------------------------------------------------------

  /**
   * Apply an edit as one undoable step.
   * @param {string} label  shown in "Undo …"
   * @param {(doc: Doc) => Doc} fn
   * @param {{selection?: string[]}} [opts]  selection to set along with the edit
   * @returns {boolean} whether the document changed
   */
  apply(label, fn, opts = {}) {
    if (this.gesture) this.commit();
    const before = this.doc;
    const after = fn(before);
    if (!after || after === before) {
      if (opts.selection) this.select(opts.selection);
      return false;
    }
    this.#push({ label, doc: before, selection: this.selection });
    this.store.set({
      doc: after,
      selection: existing(after, opts.selection ?? this.selection),
      dirty: true,
      history: this.#historyState(),
    });
    return true;
  }

  /** Start a continuous gesture; `preview` calls until `commit` make one history entry. */
  begin(label) {
    if (this.gesture) this.commit();
    this.gesture = { label, doc: this.doc, selection: this.selection };
  }

  /** Show the result of `fn` applied to the document as it was when the gesture began. */
  preview(fn) {
    if (!this.gesture) throw new Error('Editor.preview called outside a gesture');
    const next = fn(this.gesture.doc);
    if (next) this.store.set({ doc: next });
  }

  /** Finish the gesture, recording it if anything changed. */
  commit(opts = {}) {
    const gesture = this.gesture;
    if (!gesture) return false;
    this.gesture = null;
    const changed = this.doc !== gesture.doc;
    if (changed) {
      this.#push(gesture);
      this.store.set({
        selection: existing(this.doc, opts.selection ?? this.selection),
        dirty: true,
        history: this.#historyState(),
      });
    } else if (opts.selection) {
      this.select(opts.selection);
    }
    return changed;
  }

  /** Abandon the gesture and put the document back. */
  cancel() {
    const gesture = this.gesture;
    if (!gesture) return;
    this.gesture = null;
    this.store.set({ doc: gesture.doc, selection: gesture.selection });
  }

  #push(entry) {
    this.undoStack.push(entry);
    if (this.undoStack.length > HISTORY_LIMIT) this.undoStack.shift();
    this.redoStack.length = 0;
  }

  #historyState() {
    return {
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
      undoLabel: this.undoStack.at(-1)?.label ?? '',
      redoLabel: this.redoStack.at(-1)?.label ?? '',
    };
  }

  undo() {
    if (this.gesture) this.cancel();
    const entry = this.undoStack.pop();
    if (!entry) return false;
    this.redoStack.push({ label: entry.label, doc: this.doc, selection: this.selection });
    this.store.set({
      doc: entry.doc,
      selection: existing(entry.doc, entry.selection),
      scope: null,
      dirty: true,
      history: this.#historyState(),
    });
    return true;
  }

  redo() {
    if (this.gesture) this.cancel();
    const entry = this.redoStack.pop();
    if (!entry) return false;
    this.undoStack.push({ label: entry.label, doc: this.doc, selection: this.selection });
    this.store.set({
      doc: entry.doc,
      selection: existing(entry.doc, entry.selection),
      scope: null,
      dirty: true,
      history: this.#historyState(),
    });
    return true;
  }

  /** Replace the document wholesale (open / new), clearing history. */
  load(doc) {
    this.gesture = null;
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.store.set({ doc, selection: [], scope: null, dirty: false, history: this.#historyState() });
  }

  // --- tools -----------------------------------------------------------------------------

  setTool(id) {
    this.store.set({ tool: id });
  }

  /** Options for a tool, merged over that tool's defaults by the caller. */
  toolOptions(id) {
    return this.store.get('toolOptions')[id] ?? {};
  }

  setToolOptions(id, patch) {
    const all = this.store.get('toolOptions');
    this.store.set({ toolOptions: { ...all, [id]: { ...all[id], ...patch } } });
  }
}
