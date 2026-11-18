// <mis-font-browser>: choose a typeface for the selected text (or for new text).
// DESIGN.md §9. Each row is drawn in its own typeface; previews load as rows scroll into
// view, a few at a time.

import { MisElement, css, html, h } from '../base.js';
import { app, editor } from '../../app.js';
import { findNode, updateNodes } from '../../core/model/tree.js';
import { nearestWeight } from '../../services/fonts/providers.js';
import { getSetting, setSetting } from '../../services/storage/index.js';
import { toast } from '../kit/overlays.js';
import { openDialog } from '../dialogs.js';

const cellStyles = css`
  .cell.font {
    justify-content: flex-start;
    padding: 0 10px;
    gap: 10px;
  }
  .cell.font .sample {
    flex: 1;
    min-width: 0;
    font-size: 20px;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text);
    opacity: 0.35;
    transition: opacity 0.15s;
  }
  .cell.font .sample.ready {
    opacity: 1;
  }
  .cell.font .meta {
    flex: none;
    text-align: right;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
    line-height: 1.3;
    max-width: 45%;
    overflow: hidden;
  }
  .cell.font .meta b {
    display: block;
    color: var(--text);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cell.font .fav {
    all: unset;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    color: var(--text-faint);
    flex: none;
  }
  .cell.font .fav:hover {
    background: var(--bg-hover);
  }
  .cell.font .fav.on {
    color: var(--danger);
  }
`;

const CATEGORY_LABELS = {
  'sans-serif': 'Sans serif', serif: 'Serif', display: 'Display', handwriting: 'Handwriting', monospace: 'Monospace', other: 'Other',
};
const keyOf = (f) => `${f.provider}:${f.id}`;
const MAX_CONCURRENT_PREVIEWS = 6;

export class MisFontBrowser extends MisElement {
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
      }
      .bar {
        display: flex;
        gap: 4px;
        padding: 6px;
        align-items: center;
        flex: none;
      }
      .bar .search {
        flex: 1 1 140px;
        min-width: 90px;
      }
      .bar .sample-text {
        flex: 1 1 140px;
        min-width: 80px;
      }
      .bar mis-select {
        flex: 0 1 130px;
        min-width: 80px;
      }
      mis-virtual-list {
        flex: 1;
      }
      .state {
        flex: 1;
        display: grid;
        place-items: center;
        text-align: center;
        color: var(--text-muted);
        padding: var(--s4);
      }
      .foot {
        flex: none;
        min-height: 26px;
        display: flex;
        align-items: center;
        padding: 0 8px;
        border-top: 1px solid var(--border);
        color: var(--text-muted);
        font-size: var(--font-size-sm);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      input[type='file'] {
        display: none;
      }
    `,
  ];
  static template = html`
    <div class="bar">
      <mis-text-field class="search" icon="search" placeholder="Search typefaces" label="Search typefaces" clearable></mis-text-field>
      <mis-select class="show" aria-label="Source"></mis-select>
      <mis-select class="category" aria-label="Category"></mis-select>
      <mis-text-field class="sample-text" icon="type" placeholder="Preview text" label="Preview text" clearable></mis-text-field>
      <mis-button class="add" variant="outline" icon="upload" label="Add font files from your computer"></mis-button>
      <mis-button class="installed" variant="outline" icon="hard-drive" label="Use a typeface installed on this computer" hidden></mis-button>
      <input type="file" accept=".ttf,.otf,.woff,.woff2" multiple />
    </div>
    <mis-virtual-list class="list" label="Typefaces" item-height="44" gap="0"></mis-virtual-list>
    <div class="state" hidden></div>
    <div class="foot"></div>
  `;

  constructor() {
    super();
    this.service = null;
    /** @type {import('../../services/fonts/providers.js').FontFamilyInfo[]} */
    this.all = [];
    this.items = [];
    this.favorites = new Set();
    this.recents = [];
    this.sample = '';
    /** @type {{info: any, el: HTMLElement}[]} */
    this._queue = [];
    this._active = 0;
  }

  connected() {
    this.service = app.services.fonts;
    const list = this.$('.list');
    list.cellStyles = cellStyles;
    list.renderItem = (cell, item) => this.#renderRow(cell, item);
    this.listen(list, 'item-activate', (e) => {
      const origin = e.detail.originalEvent?.composedPath?.()[0];
      if (origin?.closest?.('.fav')) this.#toggleFavorite(e.detail.item);
      else this.#apply(e.detail.item);
    });

    const show = this.$('.show');
    const category = this.$('.category');
    category.options = [{ value: '', label: 'All categories' }, ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))];
    category.value = '';
    for (const el of [show, category]) this.listen(el, 'change', () => this.#filter());
    let timer = 0;
    this.listen(this.$('.search'), 'input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => this.#filter(), 80);
    });
    this.listen(this.$('.sample-text'), 'input', (e) => {
      this.sample = e.detail.value;
      list.refresh();
    });

    const file = this.$('input[type="file"]');
    this.listen(this.$('.add'), 'click', () => file.click());
    this.listen(file, 'change', async () => {
      const files = [...file.files];
      file.value = '';
      if (!files.length) return;
      const { added, failed } = await this.service.addLocalFiles(files);
      if (added.length) toast(`Added ${added.join(', ')}`);
      if (failed.length) toast(`Could not read ${failed.join(', ')}`, { type: 'error' });
      await this.#load();
      show.value = 'local';
      this.#filter();
    });

    // Where the browser can list installed fonts (Local Font Access), offer them too.
    const installed = this.$('.installed');
    installed.hidden = !('queryLocalFonts' in window);
    this.listen(installed, 'click', () => this.#pickInstalled());

    // Keep the highlighted row in step with the selected text object.
    this.watch(editor.store, 'selection', () => this.#syncCurrent());
    this.watch(editor.store, 'doc', () => this.#syncCurrent());
    this.watch(editor.store, 'toolOptions', () => this.#syncCurrent());
    this.#load();
  }

  async #load() {
    this.#state('Loading typefaces…');
    this.favorites = new Set(await getSetting('fontFavorites', []));
    this.recents = await getSetting('fontRecents', []);
    try {
      this.all = await this.service.list();
    } catch {
      this.all = [];
    }
    const show = this.$('.show');
    const previous = show.value;
    show.options = [
      { value: '', label: 'All sources' },
      { value: '@favorites', label: 'Favorites' },
      { value: '@recent', label: 'Recently used' },
      { value: 'google', label: 'Google Fonts' },
      { value: 'fontsource', label: 'Fontsource (other)' },
      { value: 'github', label: 'GitHub' },
      { value: 'local', label: 'Your files' },
      { value: '@variable', label: 'Variable fonts' },
    ];
    show.value = previous || '';
    if (!this.all.length) {
      this.#state(
        navigator.onLine ? 'The font catalog could not be loaded.' : 'The font catalog is not available offline yet. It is saved the first time it loads.',
        'Retry',
        () => this.#load(),
      );
      return;
    }
    this.#filter();
  }

  #filter() {
    const q = this.$('.search').value.trim().toLowerCase();
    const show = this.$('.show').value;
    const category = this.$('.category').value;
    let items = this.all;
    if (show === '@favorites') items = items.filter((f) => this.favorites.has(keyOf(f)));
    else if (show === '@recent') {
      const order = new Map(this.recents.map((k, i) => [k, i]));
      items = items.filter((f) => order.has(keyOf(f))).sort((a, b) => order.get(keyOf(a)) - order.get(keyOf(b)));
    } else if (show === '@variable') items = items.filter((f) => f.variable);
    else if (show === 'google') items = items.filter((f) => f.providerLabel === 'Google Fonts');
    else if (show === 'fontsource') items = items.filter((f) => f.provider === 'fontsource' && f.providerLabel !== 'Google Fonts');
    else if (show) items = items.filter((f) => f.provider === show);
    if (category) items = items.filter((f) => f.category === category);
    if (q) {
      const terms = q.split(/\s+/);
      items = items.filter((f) => terms.every((t) => f.family.toLowerCase().includes(t)));
    }
    this.items = items;
    const list = this.$('.list');
    list.items = items;
    const failed = this.service.failures();
    this.$('.foot').textContent =
      `${items.length.toLocaleString()} of ${this.all.length.toLocaleString()} typefaces` +
      (failed.length ? ` · ${failed.join(', ')} unavailable` : '') +
      ' · click to use';
    if (!items.length) {
      const empty = { '@favorites': 'No favorite typefaces yet. Use the heart on any row.', '@recent': 'Typefaces you use will be listed here.', local: 'Add .ttf, .otf or .woff files with the upload button. They stay on this device.' };
      this.#state(q ? `No typefaces match “${this.$('.search').value}”.` : (empty[show] ?? 'Nothing to show.'));
    } else this.#state(null);
    this.#syncCurrent();
  }

  #state(message, action, onAction) {
    const state = this.$('.state');
    state.hidden = !message;
    this.$('.list').hidden = !!message;
    if (message) {
      state.replaceChildren(h('div', null, h('p', { textContent: message }), action ? h('mis-button', { variant: 'outline', textContent: action, onclick: onAction }) : null));
    }
  }

  /** The font of the selected text, or the text tool's default. */
  #currentFont() {
    const texts = editor.selection.map((id) => findNode(editor.doc, id)).filter((n) => n?.type === 'text');
    if (texts.length) return texts[0].font;
    return /** @type {any} */ (app.tools.get('text'))?.defaults?.font ?? null;
  }

  #syncCurrent() {
    const font = this.#currentFont();
    const list = this.$('.list');
    const index = font ? this.items.findIndex((f) => f.provider === font.provider && f.id === font.id) : -1;
    if (list.selectedIndex !== index) list.selectedIndex = index;
  }

  /** Let the user copy an installed typeface into "Your files" so it can be used here. */
  async #pickInstalled() {
    let fonts;
    try {
      fonts = await /** @type {any} */ (window).queryLocalFonts();
    } catch {
      toast('Permission to list installed fonts was not given.');
      return;
    }
    /** @type {Map<string, any[]>} */
    const families = new Map();
    for (const font of fonts) {
      if (!families.has(font.family)) families.set(font.family, []);
      families.get(font.family).push(font);
    }
    const filter = h('mis-text-field', { icon: 'search', placeholder: 'Filter installed typefaces', clearable: true });
    const list = h('div', { class: 'list', style: 'max-height:50vh' });
    let dialog;
    const render = () => {
      const q = filter.value.trim().toLowerCase();
      const names = [...families.keys()].filter((n) => !q || n.toLowerCase().includes(q)).sort((a, b) => a.localeCompare(b));
      list.replaceChildren(...names.slice(0, 300).map((name) => {
        const faces = families.get(name);
        const row = h('button', { type: 'button', class: 'doc-row' },
          h('div', { class: 'meta' },
            h('b', { textContent: name, style: `font-family:'${name.replace(/'/g, '')}', var(--font)` }),
            h('span', { class: 'muted small', textContent: `${faces.length} style${faces.length === 1 ? '' : 's'}` })));
        row.addEventListener('click', async () => {
          dialog.close();
          try {
            const files = await Promise.all(faces.map(async (f) => new File([await f.blob()], `${f.postscriptName}.ttf`)));
            const { added, failed } = await this.service.addLocalFiles(files);
            if (added.length) toast(`Added ${added.join(', ')} to your typefaces`);
            if (failed.length && !added.length) toast(`${name} could not be read.`, { type: 'error' });
            await this.#load();
            this.$('.show').value = 'local';
            this.#filter();
          } catch {
            toast(`${name} could not be read.`, { type: 'error' });
          }
        });
        return row;
      }));
      if (!names.length) list.replaceChildren(h('p', { class: 'muted', textContent: 'No installed typeface matches.' }));
    };
    filter.addEventListener('input', render);
    render();
    const close = h('mis-button', { variant: 'outline', textContent: 'Cancel' });
    dialog = openDialog({
      heading: 'Installed typefaces',
      content: h('div', { class: 'form' },
        h('p', { class: 'muted small', style: 'margin:0', textContent: 'The typeface is copied into this browser so documents keep working. It is not uploaded anywhere. Check that its license allows the use you have in mind.' }),
        filter,
        list),
      footer: [close],
    });
    close.addEventListener('click', () => dialog.close());
  }

  // --- rows ----------------------------------------------------------------------------------

  #renderRow(cell, info) {
    cell.className = 'cell font';
    const sample = h('span', { class: 'sample', textContent: this.sample || info.family });
    const styles = info.weights.length * info.styles.length;
    const fav = h('button', {
      type: 'button',
      class: this.favorites.has(keyOf(info)) ? 'fav on' : 'fav',
      tabIndex: -1,
      attrs: { 'aria-label': 'Favorite', 'aria-pressed': String(this.favorites.has(keyOf(info))) },
    }, h('mis-icon', { name: 'heart', style: '--icon-size:13px' }));
    cell.append(
      sample,
      h('span', { class: 'meta' },
        h('b', { textContent: info.family }),
        `${CATEGORY_LABELS[info.category] ?? info.category} · ${styles} style${styles === 1 ? '' : 's'}${info.variable ? ' · variable' : ''}`),
      fav,
    );
    cell.setAttribute('aria-label', `${info.family}, ${CATEGORY_LABELS[info.category] ?? info.category}, ${info.license}`);
    cell.setAttribute('data-tip', `${info.family}\n${info.license} · ${info.providerLabel}`);
    this._queue.push({ info, el: sample });
    // The list attaches the row after this returns; start loading once it is in the page.
    queueMicrotask(() => this.#pump());
  }

  /** Load previews a few at a time; rows that scrolled away before their turn are skipped. */
  #pump() {
    while (this._active < MAX_CONCURRENT_PREVIEWS && this._queue.length) {
      // Newest first: what the user is looking at now matters most.
      const { info, el } = this._queue.pop();
      if (!el.isConnected) continue;
      this._active++;
      this.service
        .preview(info)
        .then(() => {
          el.style.fontFamily = `'${info.family.replace(/'/g, '')}', var(--font)`;
          el.classList.add('ready');
        }, () => {
          el.classList.add('ready');
        })
        .finally(() => {
          this._active--;
          this.#pump();
        });
    }
  }

  // --- actions -------------------------------------------------------------------------------

  #apply(info) {
    if (!info) return;
    const current = this.#currentFont();
    const weight = nearestWeight(info.weights, current?.weight ?? 400);
    const style = info.styles.includes(current?.style ?? 'normal') ? (current?.style ?? 'normal') : info.styles[0];
    /** @type {import('../../core/model/nodes.js').FontRef} */
    const font = { provider: /** @type {any} */ (info.provider), id: info.id, family: info.family, weight, style: /** @type {any} */ (style) };
    this.service.ensure(font).catch(() => toast(`${info.family} could not be loaded.`, { type: 'error' }));
    const texts = editor.selection.filter((id) => findNode(editor.doc, id)?.type === 'text');
    if (texts.length) {
      editor.apply('Change typeface', (doc) => updateNodes(doc, texts, (node) => ({ ...node, font })));
    }
    // Either way it becomes the typeface for new text.
    editor.setToolOptions('text', { font });
    const key = keyOf(info);
    this.recents = [key, ...this.recents.filter((k) => k !== key)].slice(0, 40);
    setSetting('fontRecents', this.recents);
    if (!texts.length) toast(`${info.family} will be used for new text.`);
  }

  #toggleFavorite(info) {
    const key = keyOf(info);
    if (this.favorites.has(key)) this.favorites.delete(key);
    else this.favorites.add(key);
    setSetting('fontFavorites', [...this.favorites]);
    if (this.$('.show').value === '@favorites') this.#filter();
    else this.$('.list').refresh();
  }
}
