// <mis-app> — the root element. Lays out the workspace, builds the tool palette, routes
// keyboard shortcuts to tools and commands, and persists layout and documents.
//
// Its shadow tree comes from <template id="mis-app-template"> in index.html.

import { MisElement, css, h } from './base.js';
import { dialogStyles } from './dialogs.js';
import { app, editor, activeTool, isMac } from '../app.js';
import { formatShortcut } from '../core/commands.js';
import { getSetting, setSetting, saveDocument } from '../services/storage/index.js';
import { findNode } from '../core/model/tree.js';
import { toast } from './kit/overlays.js';
import { applyPaint } from '../style-actions.js';

const LAYOUT_DEFAULTS = { side: 272, assets: 232, layers: 220, sideOpen: true, assetsOpen: true };
const LIMITS = { side: [200, 520], assets: [120, 520], layers: [80, 600] };

export class MisApp extends MisElement {
  static styles = [
    css`
      :host {
        display: grid;
        height: 100%;
        grid-template-columns: 44px minmax(0, 1fr) auto var(--side-w, 272px);
        grid-template-rows: 40px minmax(0, 1fr) auto var(--assets-h, 232px) 24px;
        grid-template-areas:
          'top top top top'
          'tools canvas vsplit side'
          'hsplit hsplit hsplit hsplit'
          'assets assets assets assets'
          'status status status status';
        background: var(--bg);
        overflow: hidden;
      }
      .top {
        grid-area: top;
      }
      .tools {
        grid-area: tools;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 6px 0;
        gap: 2px;
        background: var(--bg-raised);
        border-right: 1px solid var(--border);
        overflow: hidden auto;
      }
      .tools hr {
        width: 22px;
        border: none;
        border-top: 1px solid var(--border);
        margin: 4px 0;
      }
      .canvas {
        grid-area: canvas;
      }
      .vsplit {
        grid-area: vsplit;
      }
      .side {
        grid-area: side;
        display: flex;
        flex-direction: column;
        min-height: 0;
        min-width: 0;
        background: var(--bg-raised);
      }
      .side mis-properties {
        flex: 1;
        min-height: 60px;
      }
      .side mis-layers {
        flex: none;
        height: var(--layers-h, 220px);
        min-height: 0;
      }
      .hsplit {
        grid-area: hsplit;
      }
      .assets {
        grid-area: assets;
        min-height: 0;
      }
      .status {
        grid-area: status;
      }
      :host([side-closed]) {
        grid-template-columns: 44px minmax(0, 1fr) auto 0;
      }
      :host([side-closed]) .side {
        display: none;
      }
      :host([assets-closed]) {
        grid-template-rows: 40px minmax(0, 1fr) auto 0 24px;
      }
      :host([assets-closed]) .assets {
        display: none;
      }
      /* The default slot holds the loading / no-script fallback; hide it once running. */
      slot:not([name])::slotted(*) {
        display: none;
      }
      @media (max-width: 760px) {
        :host {
          grid-template-columns: 44px minmax(0, 1fr) auto min(var(--side-w, 272px), 46vw);
        }
      }
    `,
    dialogStyles,
  ];

  static get template() {
    return /** @type {HTMLTemplateElement} */ (document.getElementById('mis-app-template'));
  }

  constructor() {
    super();
    this.layout = { ...LAYOUT_DEFAULTS };
  }

  connected() {
    this.#buildPalette();
    this.#initLayout();
    this.#initKeyboard();
    this.#initContextMenu();
    this.#initPersistence();
    this.#initAnnouncer();
    this.watch(editor.store, (s) => s.doc.name, (name) => {
      document.title = `${name} — Material Icon Studio`;
    }, { immediate: true });
  }

  // --- tool palette ------------------------------------------------------------------------

  #buildPalette() {
    const palette = this.$('#palette');
    const items = [];
    const groups = new Map();
    for (const tool of app.tools.values()) {
      const T = /** @type {typeof import('../tools/base.js').Tool} */ (tool.constructor);
      const info = { id: T.id, label: T.label, icon: T.icon, shortcut: T.shortcut };
      if (T.group) {
        if (!groups.has(T.group)) {
          const flyout = h('mis-flyout', { tools: [], dataset: { group: T.group } });
          groups.set(T.group, flyout);
          items.push(flyout);
        }
        const flyout = groups.get(T.group);
        flyout.tools = [...flyout.tools, info];
      } else {
        if (T.id === 'pan') items.push(h('hr'));
        items.push(h('mis-tool-button', { tool: T.id, icon: T.icon, label: T.label, shortcut: T.shortcut }));
      }
    }
    palette.replaceChildren(...items);
    this.listen(palette, 'click', (e) => {
      const button = e.target.closest?.('mis-tool-button');
      if (button?.tool) editor.setTool(button.tool);
    });
    this.listen(palette, 'pick', (e) => editor.setTool(e.detail.id));
    this.watch(editor.store, 'tool', (id) => {
      for (const el of palette.children) {
        if (el.localName === 'mis-tool-button') el.active = el.tool === id;
        else if (el.localName === 'mis-flyout') {
          const member = el.tools.some((t) => t.id === id);
          el.active = member;
          if (member) el.current = id;
        }
      }
    }, { immediate: true });
  }

  // --- layout ------------------------------------------------------------------------------

  #applyLayout() {
    const l = this.layout;
    this.style.setProperty('--side-w', `${l.side}px`);
    this.style.setProperty('--assets-h', `${l.assets}px`);
    this.style.setProperty('--layers-h', `${l.layers}px`);
    this.toggleAttribute('side-closed', !l.sideOpen);
    this.toggleAttribute('assets-closed', !l.assetsOpen);
  }

  async #initLayout() {
    this.#applyLayout();
    const wire = (selector, key, sign) => {
      const splitter = this.$(selector);
      let start = 0;
      this.listen(splitter, 'resize-start', () => {
        start = this.layout[key];
      });
      this.listen(splitter, 'resize', (e) => {
        const [min, max] = LIMITS[key];
        this.layout = { ...this.layout, [key]: Math.max(min, Math.min(max, start + sign * e.detail.delta)), [`${key}Open`]: true };
        this.#applyLayout();
      });
      this.listen(splitter, 'resize-end', () => setSetting('layout', this.layout));
      this.listen(splitter, 'collapse', () => {
        if (key === 'layers') return;
        this.togglePanel(key);
      });
    };
    wire('.vsplit', 'side', -1);
    wire('.hsplit', 'assets', -1);
    wire('.lsplit', 'layers', -1);
    const saved = await getSetting('layout', null);
    if (saved) {
      this.layout = { ...LAYOUT_DEFAULTS, ...saved };
      this.#applyLayout();
    }
    const theme = await getSetting('theme', 'auto');
    this.setTheme(theme, false);
  }

  /** @param {'side'|'assets'} key */
  togglePanel(key) {
    const flag = `${key}Open`;
    this.layout = { ...this.layout, [flag]: !this.layout[flag] };
    this.#applyLayout();
    setSetting('layout', this.layout);
  }

  /** @param {'auto'|'light'|'dark'} theme */
  setTheme(theme, persist = true) {
    if (theme === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
    this.theme = theme;
    if (persist) setSetting('theme', theme);
    // Rulers are painted on <canvas> and need telling.
    for (const ruler of app.canvas?.shadowRoot.querySelectorAll('mis-ruler') ?? []) ruler.render();
  }

  // --- keyboard ----------------------------------------------------------------------------

  #initKeyboard() {
    const typing = (e) => {
      const t = e.composedPath()[0];
      return t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    };
    this.listen(window, 'keydown', (e) => {
      if (e.defaultPrevented || typing(e)) return;
      // An open modal dialog or menu owns the keyboard.
      if (document.querySelector(':modal') || this.shadowRoot.querySelector(':popover-open:not(mis-tooltip)')) return;
      if (activeTool()?.onKeyDown(e)) {
        e.preventDefault();
        return;
      }
      const id = editor.commands.forEvent(e);
      if (!id) return;
      // Leave native behavior alone for keys we would not act on anyway (e.g. Backspace
      // with nothing selected), except browser shortcuts we deliberately take over.
      const enabled = editor.commands.isEnabled(id);
      // Clipboard keys are left to the browser when we have nothing to do with them, so
      // that pasting SVG copied in another application still raises a paste event.
      const takeOver = (e.ctrlKey || e.metaKey) && !['edit.paste', 'edit.copy', 'edit.cut'].includes(id);
      if (enabled || takeOver) e.preventDefault();
      if (enabled) editor.commands.run(id);
    });
    this.listen(window, 'keyup', (e) => activeTool()?.onKeyUp(e));
  }

  // --- context menu ------------------------------------------------------------------------

  #initContextMenu() {
    const menu = this.$('#context');
    this.listen(this.shadowRoot, 'canvas-context', (e) => {
      const { x, y, event } = /** @type {CustomEvent} */ (e).detail;
      const hit = event.hit();
      if (hit && !editor.selection.includes(hit)) editor.select([hit]);
      this.openContextMenu(x, y);
    });
    this.listen(menu, 'select', (e) => editor.commands.run(e.detail.id));
    this.listen(this.shadowRoot, 'canvas-drop', (e) => this.#onDrop(/** @type {CustomEvent} */ (e).detail));
  }

  async #onDrop({ point, hit, icon, color, files }) {
    if (icon) {
      try {
        const place = /** @type {any} */ (app.tools.get('place'));
        await place.setIcon(JSON.parse(icon));
        place.placeAt(point);
      } catch {
        toast('That icon could not be placed.', { type: 'error' });
      }
    } else if (color) {
      if (!hit) {
        toast('Drop the color onto an object.');
        return;
      }
      applyPaint('fill', color === 'none' ? { type: 'none' } : { type: 'solid', color }, [hit]);
    } else if (files?.length) {
      this.emit('files-dropped', { files, point });
    }
  }

  /** Open the object context menu at viewport coordinates. */
  openContextMenu(x, y) {
    const menu = this.$('#context');
    const section = (ids) =>
      ids
        .map((id) => editor.commands.get(id))
        .filter((cmd) => cmd && editor.commands.isEnabled(cmd.id))
        .map((cmd) => ({ id: cmd.id, label: cmd.label, icon: cmd.icon, shortcut: formatShortcut(cmd.shortcut ?? '', isMac) }));
    const sections = [
      section(['edit.cut', 'edit.copy', 'edit.paste', 'edit.duplicate', 'edit.delete']),
      section(['object.group', 'object.ungroup', 'object.convertToPath', 'text.outline', 'text.onPath', 'text.strokeLettering', 'path.strokeToPath', 'path.emboss']),
      section(['path.union', 'path.subtract', 'path.intersect', 'path.exclude', 'path.divide']),
      section(['object.clip', 'object.mask', 'object.releaseClip']),
      section(['order.front', 'order.forward', 'order.backward', 'order.back']),
      section(['style.copy', 'style.paste', 'style.swap']),
      section(['object.flipH', 'object.flipV', 'object.toggleLock', 'object.toggleVisible']),
      section(['edit.selectAll', 'view.zoomSelection', 'view.zoomFit']),
    ].filter((s) => s.length);
    menu.items = sections.flatMap((s, i) => (i ? [{ separator: true }, ...s] : s));
    if (menu.items.length) menu.openAt(x, y);
  }

  // --- persistence -------------------------------------------------------------------------

  #initPersistence() {
    let timer = 0;
    const save = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // A gesture in progress is a preview, not a state worth saving.
        if (editor.gesture) return save();
        saveDocument(editor.doc, { view: editor.store.get('view') });
        setSetting('lastDocument', editor.doc.id);
      }, 600);
    };
    this.watch(editor.store, 'doc', save);
    this.watch(editor.store, 'view', save);
    this.listen(document, 'visibilitychange', () => {
      if (document.visibilityState === 'hidden' && !editor.gesture) {
        saveDocument(editor.doc, { view: editor.store.get('view') });
      }
    });
  }

  // --- accessibility -----------------------------------------------------------------------

  #initAnnouncer() {
    const live = this.$('#announcer');
    this.watch(editor.store, 'selection', (sel) => {
      if (sel.length === 0) live.textContent = 'Nothing selected';
      else if (sel.length === 1) live.textContent = `${findNode(editor.doc, sel[0])?.name ?? 'Object'} selected`;
      else live.textContent = `${sel.length} objects selected`;
    });
    this.watch(editor.store, 'tool', (id) => {
      const T = /** @type {any} */ (app.tools.get(id)?.constructor);
      if (T) live.textContent = `${T.label} tool`;
    });
  }

  /** Say something to assistive technology. */
  announce(message) {
    this.$('#announcer').textContent = message;
  }
}
