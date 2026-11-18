// Text tool: click to add text, click existing text to edit it in place. DESIGN.md §9.3.
//
// Editing uses a <textarea> laid exactly over the SVG text. Its glyphs are transparent —
// what the user sees is the real SVG rendering, live — and it contributes the caret, the
// selection highlight, IME and clipboard handling.

import { Tool } from './base.js';
import { createText, DEFAULT_FONT, solid } from '../core/model/nodes.js';
import { findNode, insertNodes, patchNodes, removeNodes, worldMatrix } from '../core/model/tree.js';
import { worldBounds } from '../core/geometry/bounds.js';
import { translate, mul } from '../core/affine.js';
import { viewMatrix } from '../render/viewport.js';
import { rectV, boxToScreen } from '../render/overlay.js';
import { fontFamilyCss } from '../core/io/vnode.js';

/** Ascent and descent of a font at a size, in the same units as the size. */
function fontMetrics(font, size) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = `${font.style} ${font.weight} ${size}px ${fontFamilyCss(font)}`;
  const m = ctx.measureText('Hg');
  return {
    ascent: m.fontBoundingBoxAscent ?? size * 0.9,
    descent: m.fontBoundingBoxDescent ?? size * 0.25,
  };
}

export class TextTool extends Tool {
  static id = 'text';
  static label = 'Text';
  static icon = 'type';
  static shortcut = 'T';
  static assetTab = 'fonts';

  constructor(app) {
    super(app);
    /** @type {{id: string, isNew: boolean, textarea: HTMLTextAreaElement, off: () => void} | null} */
    this.editing = null;
  }

  /** Properties for new text: stored tool options over sensible defaults. */
  get defaults() {
    const stored = this.editor.toolOptions('text');
    const { height } = this.doc.artboard;
    return {
      font: DEFAULT_FONT,
      size: Math.max(1, Math.round(height / 8)),
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'start',
      ...stored,
    };
  }

  activate() {
    this.app.services.fonts?.ensure(this.defaults.font).catch(() => {});
  }

  deactivate() {
    this.finish();
  }

  onPointerDown(e) {
    if (e.button !== 0) return;
    const wasEditing = !!this.editing;
    this.finish();
    const id = e.hit({ deep: true });
    const node = id ? findNode(this.doc, id) : null;
    if (node?.type === 'text') {
      this.edit(id);
      return;
    }
    // A click that only ends an edit should not immediately start another object.
    if (wasEditing) return;
    const p = this.canvas.snap(e.raw, { disabled: e.mod });
    this.canvas.clearSnap();
    this.#create(p);
  }

  #create(p) {
    const d = this.defaults;
    const fill = this.editor.store.get('style').fill;
    const node = createText('', {
      font: d.font,
      size: d.size,
      lineHeight: d.lineHeight,
      letterSpacing: d.letterSpacing,
      align: d.align,
      fill: fill?.type && fill.type !== 'none' ? fill : solid('#000000'),
      transform: translate(p.x, p.y),
    });
    const parentId = this.parentId();
    this.editor.begin('Add text');
    this.editor.preview((doc) => insertNodes(doc, parentId, [node]));
    this.editor.select([node.id]);
    this.#open(node.id, true);
  }

  /** Start editing an existing text node. */
  edit(id) {
    const node = findNode(this.doc, id);
    if (node?.type !== 'text') return;
    this.finish();
    this.editor.select([id]);
    this.editor.begin('Edit text');
    this.#open(id, false);
  }

  #open(id, isNew) {
    const node = findNode(this.doc, id);
    const textarea = document.createElement('textarea');
    textarea.value = node.text;
    textarea.spellcheck = false;
    textarea.setAttribute('aria-label', 'Text content');
    textarea.wrap = 'off';
    Object.assign(textarea.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      margin: '0',
      padding: '0',
      border: 'none',
      outline: 'none',
      resize: 'none',
      overflow: 'hidden',
      background: 'transparent',
      color: 'transparent',
      caretColor: 'var(--selection)',
      whiteSpace: 'pre',
      transformOrigin: '0 0',
    });
    this.canvas.htmlLayer.append(textarea);
    const abort = new AbortController();
    const { signal } = abort;
    textarea.addEventListener('input', () => {
      this.#write(textarea.value);
      this.#place();
    }, { signal });
    textarea.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        this.finish();
        this.editor.setTool('select');
      }
    }, { signal });
    for (const type of ['pointerdown', 'pointermove', 'pointerup', 'mousedown', 'click', 'dblclick', 'wheel', 'contextmenu']) {
      textarea.addEventListener(type, (e) => e.stopPropagation(), { signal });
    }
    // Follow pan/zoom and property changes (font, size) made while editing.
    const offView = this.editor.store.subscribe('view', () => this.#place());
    const offDoc = this.editor.store.subscribe('doc', () => this.#place());
    this.editing = {
      id,
      isNew,
      textarea,
      // The document every text change is applied to: as it is now (for new text, that
      // already includes the empty node).
      base: this.doc,
      // Whether the edit gesture this session started with is still the open one.
      own: true,
      off: () => {
        abort.abort();
        offView();
        offDoc();
      },
    };
    this.#place();
    textarea.focus({ preventScroll: true });
    textarea.select();
    this.invalidate();
  }

  /**
   * Put `patch` into the text node as part of the current edit. If something else (a
   * change in the properties panel) closed our undo step in the meantime, open a new one
   * based on the document as it is now.
   */
  #write(text, extra = {}) {
    const ed = this.editing;
    const editor = this.editor;
    if (!editor.gesture) {
      editor.begin('Edit text');
      ed.base = editor.doc;
      ed.own = false;
    }
    editor.preview(() => patchNodes(ed.base, [ed.id], { text, ...extra }));
  }

  /** Position and style the textarea to coincide with the SVG text. */
  #place() {
    const ed = this.editing;
    if (!ed) return;
    const node = findNode(this.doc, ed.id);
    if (!node) return;
    const { textarea } = ed;
    const m = mul(viewMatrix(this.view), worldMatrix(this.doc, ed.id));
    const { ascent, descent } = fontMetrics(node.font, node.size);
    const lineBox = node.size * node.lineHeight;
    // CSS centres the glyph box in the line box; SVG puts the first baseline at y = 0.
    const top = -((lineBox - (ascent + descent)) / 2 + ascent);
    const lines = textarea.value.split('\n');
    const WIDE = 100000;
    const left = node.align === 'middle' ? -WIDE / 2 : node.align === 'end' ? -WIDE : 0;
    Object.assign(textarea.style, {
      width: `${WIDE}px`,
      height: `${Math.max(1, lines.length) * lineBox + descent}px`,
      font: `${node.font.style} ${node.font.weight} ${node.size}px/${node.lineHeight} ${fontFamilyCss(node.font)}`,
      letterSpacing: `${node.letterSpacing}px`,
      textAlign: node.align === 'middle' ? 'center' : node.align === 'end' ? 'right' : 'left',
      transform: `matrix(${m.a},${m.b},${m.c},${m.d},${m.e},${m.f}) translate(${left}px, ${top}px)`,
    });
  }

  /** End editing, keeping the changes (an untouched or empty new text is discarded). */
  finish() {
    const ed = this.editing;
    if (!ed) return;
    ed.off();
    const text = ed.textarea.value;
    ed.textarea.remove();
    const editor = this.editor;
    const node = findNode(editor.doc, ed.id);
    if (text.trim() === '') {
      this.editing = null;
      // New text that was never typed into simply never happened.
      if (ed.isNew && ed.own && editor.gesture) editor.cancel();
      else if (node) {
        // Emptying a text object deletes it.
        if (editor.gesture) editor.cancel();
        editor.apply('Delete text', (doc) => removeNodes(doc, [ed.id]), { selection: [] });
      }
    } else {
      // Name the layer after its first line, unless the user has named it themselves.
      const rename = node && (ed.isNew || node.name === 'Text' || node.name === node.text.split('\n')[0].slice(0, 28));
      if (editor.gesture || node?.text !== text || rename) {
        this.#write(text, rename ? { name: text.split('\n')[0].slice(0, 28) } : {});
      }
      this.editing = null;
      editor.commit({ selection: [ed.id] });
    }
    this.invalidate();
  }

  onKeyDown(e) {
    if (e.key === 'Escape') {
      this.editor.setTool('select');
      return true;
    }
    return false;
  }

  cursor() {
    return 'text';
  }

  overlay() {
    const ed = this.editing;
    if (!ed) return [];
    const box = worldBounds(this.doc, ed.id);
    if (!box) return [];
    const s = boxToScreen(this.view, box);
    return [rectV('text-edit', { x: s.x - 3, y: s.y - 3, width: s.width + 6, height: s.height + 6 }, { class: 'sel dim', 'stroke-dasharray': '3 2' })];
  }
}
