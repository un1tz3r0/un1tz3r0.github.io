// <mis-icon-browser>: browse and search icon sets, pick an icon to place. DESIGN.md §8.5.
//
// Thumbnails are <img> elements. For an opened set they are data: URLs built from the
// set's own markup; for icons whose set is not loaded (cross-set search, favorites,
// recents) they point at Iconify's SVG endpoint. Either way no third-party markup is
// parsed into this document just to preview it — an <img> cannot run script.

import { MisElement, css, html, h } from '../base.js';
import { app, editor } from '../../app.js';
import { iconDataUrl, resolveIcon } from '../../services/icons/iconify.js';
import { storage } from '../../services/storage/index.js';
import { toast } from '../kit/overlays.js';

const cellStyles = css`
  .cell img {
    width: 24px;
    height: 24px;
    pointer-events: none;
    object-fit: contain;
  }
  .cell.set {
    justify-content: flex-start;
    padding: 0 8px;
    gap: 6px;
    white-space: nowrap;
  }
  .cell.set .name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cell.set .count {
    color: var(--text-faint);
    font-size: var(--font-size-sm);
    font-variant-numeric: tabular-nums;
  }
  .cell.set .by {
    font-size: 9px;
    border: 1px solid currentColor;
    border-radius: 3px;
    padding: 0 3px;
    color: var(--warning);
  }
  .cell.header {
    justify-content: flex-start;
    padding: 0 8px;
    color: var(--text-faint);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    pointer-events: none;
    background: none !important;
  }
`;

export class MisIconBrowser extends MisElement {
  static styles = [
    css`
      :host {
        display: grid;
        grid-template-columns: 220px 1px minmax(0, 1fr);
        height: 100%;
        min-height: 0;
      }
      .sets,
      .main {
        display: flex;
        flex-direction: column;
        min-height: 0;
        min-width: 0;
      }
      .rule {
        background: var(--border);
      }
      .bar {
        display: flex;
        gap: 4px;
        padding: 6px;
        align-items: center;
        flex: none;
      }
      .bar mis-text-field {
        flex: 1;
        min-width: 80px;
      }
      .bar mis-select {
        flex: 0 1 130px;
        min-width: 70px;
      }
      mis-virtual-grid,
      mis-virtual-list {
        flex: 1;
      }
      .detail {
        flex: none;
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 28px;
        padding: 0 8px;
        border-top: 1px solid var(--border);
        color: var(--text-muted);
        font-size: var(--font-size-sm);
        white-space: nowrap;
        overflow: hidden;
      }
      .detail .what {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .detail strong {
        color: var(--text);
      }
      .detail a {
        color: var(--accent);
      }
      .state {
        flex: 1;
        display: grid;
        place-items: center;
        text-align: center;
        color: var(--text-muted);
        padding: var(--s4);
      }
      @container (max-width: 560px) {
        :host {
          grid-template-columns: 150px 1px minmax(0, 1fr);
        }
      }
    `,
  ];
  static template = html`
    <div class="sets">
      <div class="bar"><mis-text-field class="set-filter" icon="filter" placeholder="Filter sets" label="Filter icon sets" clearable></mis-text-field></div>
      <mis-virtual-list class="set-list" label="Icon sets" item-height="26" gap="0"></mis-virtual-list>
    </div>
    <div class="rule"></div>
    <div class="main">
      <div class="bar">
        <mis-text-field class="search" icon="search" placeholder="Search icons" label="Search icons" clearable></mis-text-field>
        <mis-segmented class="scope" label="Search scope"></mis-segmented>
        <mis-select class="style" aria-label="Style"></mis-select>
        <mis-select class="category" aria-label="Category"></mis-select>
      </div>
      <mis-virtual-grid class="grid" label="Icons" item-width="40" item-height="40" gap="2"></mis-virtual-grid>
      <div class="state" hidden></div>
      <div class="detail">
        <span class="what">Pick an icon, then click or drag on the canvas to place it.</span>
        <mis-button class="fav" icon="heart" label="Favorite" toggle hidden></mis-button>
        <mis-button class="place" variant="outline" hidden>Place at center</mis-button>
      </div>
    </div>
  `;

  constructor() {
    super();
    this.service = null;
    /** @type {import('../../services/icons/iconify.js').IconSetInfo[]} */
    this.sets = [];
    /** Current source: a set prefix, or '@favorites' / '@recent'. */
    this.current = '';
    /** The opened set, when `current` is a prefix. */
    this.opened = null;
    /** @type {{prefix: string, name: string}[]} what the grid shows */
    this.items = [];
    this.query = '';
    this.scope = 'set';
    this.picked = null;
    /** @type {Map<string, any>} */
    this.favorites = new Map();
    this._token = 0;
    this._searchTimer = 0;
  }

  connected() {
    this.service = app.services.icons;
    const setList = this.$('.set-list');
    const grid = this.$('.grid');
    setList.cellStyles = cellStyles;
    grid.cellStyles = cellStyles;
    setList.renderItem = (cell, item) => this.#renderSet(cell, item);
    grid.renderItem = (cell, item) => this.#renderIcon(cell, item);

    this.listen(setList, 'item-activate', (e) => {
      if (e.detail.item?.id) this.#open(e.detail.item.id);
    });
    this.listen(this.$('.set-filter'), 'input', () => this.#renderSetList());

    const scope = this.$('.scope');
    scope.options = [{ value: 'set', label: 'This set' }, { value: 'all', label: 'All sets' }];
    scope.value = this.scope;
    this.listen(scope, 'change', (e) => {
      this.scope = e.detail.value;
      this.#refresh();
    });
    const search = this.$('.search');
    this.listen(search, 'input', (e) => {
      this.query = e.detail.value;
      clearTimeout(this._searchTimer);
      // Filtering an open set is instant; asking the server deserves a pause in typing.
      this._searchTimer = setTimeout(() => this.#refresh(), this.scope === 'all' ? 300 : 60);
    });
    this.listen(this.$('.style'), 'change', () => this.#refresh());
    this.listen(this.$('.category'), 'change', () => this.#refresh());

    this.listen(grid, 'item-activate', (e) => this.#pick(e.detail.item, e.detail.originalEvent));
    this.listen(grid, 'dblclick', (e) => {
      if (grid.indexFromEvent(e) >= 0) this.#placeAtCenter();
    });
    this.listen(grid, 'dragstart', (e) => {
      const item = this.items[grid.indexFromEvent(e)];
      if (!item) return;
      e.dataTransfer.setData('application/x-mis-icon', JSON.stringify(item));
      e.dataTransfer.effectAllowed = 'copy';
    });
    this.listen(this.$('.place'), 'click', () => this.#placeAtCenter());
    this.listen(this.$('.fav'), 'click', () => this.#toggleFavorite());

    // Thumbnails are drawn in the theme's text color, so they must follow theme changes.
    const mq = matchMedia('(prefers-color-scheme: dark)');
    this.listen(mq, 'change', () => grid.refresh());
    const themeObserver = new MutationObserver(() => grid.refresh());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    this.signal.addEventListener('abort', () => themeObserver.disconnect());

    this.#load();
  }

  async #load() {
    this.#state('Loading icon sets…');
    for (const fav of await storage.values('iconFavorites')) this.favorites.set(`${fav.prefix}:${fav.name}`, fav);
    try {
      this.sets = await this.service.listSets();
    } catch {
      this.#state('Icon sets could not be loaded. Check your connection and try again.', 'Retry', () => this.#load());
      return;
    }
    this.#renderSetList();
    const last = (await storage.get('settings', 'iconSet')) ?? this.sets[0]?.prefix;
    this.#open(this.service.cachedSet(last) ? last : this.sets[0]?.prefix);
  }

  // --- set list ------------------------------------------------------------------------------

  #renderSetList() {
    const filter = this.$('.set-filter').value.trim().toLowerCase();
    const match = (s) => !filter || s.name.toLowerCase().includes(filter) || s.prefix.includes(filter);
    const rows = [];
    if (!filter) {
      rows.push({ id: '@favorites', name: 'Favorites', icon: 'heart' }, { id: '@recent', name: 'Recently used', icon: 'clock' });
    }
    const featured = this.sets.filter((s) => s.featured >= 0 && match(s));
    const rest = this.sets.filter((s) => s.featured < 0 && match(s));
    if (featured.length) rows.push({ header: 'Featured' }, ...featured.map((s) => ({ id: s.prefix, set: s })));
    if (rest.length) rows.push({ header: `All sets (${rest.length})` }, ...rest.map((s) => ({ id: s.prefix, set: s })));
    const list = this.$('.set-list');
    list.items = rows;
    list.selectedIndex = rows.findIndex((r) => r.id === this.current);
  }

  #renderSet(cell, item) {
    if (item.header) {
      cell.className = 'cell header';
      cell.textContent = item.header;
      cell.setAttribute('aria-disabled', 'true');
      return;
    }
    cell.className = 'cell set';
    if (item.set) {
      const s = item.set;
      cell.append(h('span', { class: 'name', textContent: s.name }));
      if (s.attribution) cell.append(h('span', { class: 'by', textContent: 'BY', title: 'Attribution required' }));
      cell.append(h('span', { class: 'count', textContent: s.total.toLocaleString() }));
      cell.setAttribute('data-tip', `${s.name}\n${s.license.title}${s.author?.name ? ` · ${s.author.name}` : ''}`);
      cell.setAttribute('aria-label', `${s.name}, ${s.total} icons, ${s.license.title}`);
    } else {
      cell.append(h('mis-icon', { name: item.icon, style: '--icon-size:14px' }), h('span', { class: 'name', textContent: item.name }));
    }
  }

  // --- opening a source ----------------------------------------------------------------------

  async #open(id) {
    if (!id) return;
    this.current = id;
    this.opened = null;
    this.#renderSetList();
    const token = ++this._token;
    const special = id.startsWith('@');
    this.$('.style').hidden = true;
    this.$('.category').hidden = true;
    if (special) {
      this.#refresh();
      return;
    }
    storage.set('settings', 'iconSet', id);
    const info = this.service.cachedSet(id);
    this.#state(`Loading ${info?.name ?? id}…`);
    try {
      const opened = await this.service.openSet(id);
      if (token !== this._token) return;
      this.opened = opened;
    } catch {
      if (token !== this._token) return;
      this.#state(
        navigator.onLine ? `${info?.name ?? id} could not be loaded.` : `${info?.name ?? id} has not been used before, so it is not available offline.`,
        'Retry',
        () => this.#open(id),
      );
      return;
    }
    this.#fillFilters();
    this.#refresh();
  }

  #fillFilters() {
    const { suffixes, prefixes, categories } = this.opened;
    const style = this.$('.style');
    const styles = [
      ...Object.entries(suffixes).map(([k, label]) => ({ value: `s:${k}`, label: label || 'Default' })),
      ...Object.entries(prefixes).map(([k, label]) => ({ value: `p:${k}`, label: label || 'Default' })),
    ];
    style.hidden = styles.length < 2;
    style.options = [{ value: '', label: 'All styles' }, ...styles];
    style.value = '';
    const category = this.$('.category');
    const names = Object.keys(categories).sort();
    category.hidden = names.length < 2;
    category.options = [{ value: '', label: 'All categories' }, ...names.map((n) => ({ value: n, label: n }))];
    category.value = '';
  }

  /** Recompute what the grid shows from the current source, filters and query. */
  async #refresh() {
    const token = ++this._token;
    const query = this.query.trim().toLowerCase();
    const grid = this.$('.grid');
    let items = [];

    if (this.scope === 'all' && query) {
      this.#state('Searching…');
      items = await this.service.search(query, { limit: 400 });
      if (token !== this._token) return;
    } else if (this.current === '@favorites') {
      items = [...this.favorites.values()].sort((a, b) => b.time - a.time);
    } else if (this.current === '@recent') {
      items = (await storage.values('iconRecents')).sort((a, b) => b.time - a.time).slice(0, 200);
      if (token !== this._token) return;
    } else if (this.opened) {
      const { names, suffixes, prefixes, categories } = this.opened;
      let list = names;
      const category = this.$('.category').value;
      if (category && categories[category]) {
        const allowed = new Set(categories[category]);
        list = list.filter((n) => allowed.has(n));
      }
      const style = this.$('.style').value;
      if (style) {
        const [kind, key] = [style[0], style.slice(2)];
        const table = kind === 's' ? suffixes : prefixes;
        // The empty key means "none of the other variants".
        const others = Object.keys(table).filter((k) => k !== '');
        const has = (n, k) => (kind === 's' ? n.endsWith(`-${k}`) : n.startsWith(`${k}-`));
        list = list.filter((n) => (key === '' ? !others.some((k) => has(n, k)) : has(n, key)));
      }
      if (query) {
        const terms = query.split(/\s+/);
        list = list.filter((n) => terms.every((t) => n.includes(t)));
      }
      const prefix = this.current;
      items = list.map((name) => ({ prefix, name }));
    } else {
      return;
    }
    if (query && (this.current.startsWith('@')) && this.scope !== 'all') {
      items = items.filter((i) => i.name.includes(query));
    }
    this.items = items;
    grid.items = items;
    grid.selectedIndex = this.picked ? items.findIndex((i) => i.prefix === this.picked.prefix && i.name === this.picked.name) : -1;
    if (items.length === 0) {
      const messages = {
        '@favorites': 'No favorites yet. Pick an icon and press the heart.',
        '@recent': 'Icons you place will be listed here.',
      };
      this.#state(query ? `No icons match “${this.query}”.` : (messages[this.current] ?? 'This set is empty.'));
    } else {
      this.#state(null);
    }
  }

  #state(message, action, onAction) {
    const state = this.$('.state');
    const grid = this.$('.grid');
    state.hidden = !message;
    grid.hidden = !!message;
    if (!message) return;
    state.replaceChildren(h('div', null, h('p', { textContent: message }), action ? h('mis-button', { variant: 'outline', textContent: action, onclick: onAction }) : null));
  }

  // --- grid cells ----------------------------------------------------------------------------

  #renderIcon(cell, item) {
    const color = getComputedStyle(this).getPropertyValue('--text').trim() || '#888';
    const img = h('img', { alt: '', loading: 'lazy', draggable: false });
    const opened = this.opened?.info.prefix === item.prefix ? this.opened : null;
    let src = null;
    if (opened) {
      const data = resolveIcon(opened.data, item.name);
      if (data) src = iconDataUrl(data.body, data.viewBox, color);
    }
    img.src = src ?? this.service.thumbnailUrl(item.prefix, item.name, color);
    cell.draggable = true;
    cell.append(img);
    cell.setAttribute('aria-label', item.name.replace(/-/g, ' '));
    cell.setAttribute('data-tip', opened ? item.name : `${item.name}\n${this.service.cachedSet(item.prefix)?.name ?? item.prefix}`);
  }

  // --- picking and placing -------------------------------------------------------------------

  async #pick(item, originalEvent) {
    if (!item) return;
    this.picked = item;
    const grid = this.$('.grid');
    grid.selectedIndex = this.items.indexOf(item);
    grid.refresh();
    const set = this.service.cachedSet(item.prefix);
    const what = this.$('.what');
    what.replaceChildren(
      h('strong', { textContent: item.name }),
      ` · ${set?.name ?? item.prefix}`,
      set?.author?.name ? ` · ${set.author.name}` : '',
      ' · ',
      set?.license?.url ? h('a', { href: set.license.url, target: '_blank', rel: 'noopener noreferrer', textContent: set.license.title }) : (set?.license?.title ?? ''),
      set?.attribution ? ' (attribution required)' : '',
    );
    const fav = this.$('.fav');
    fav.hidden = false;
    fav.pressed = this.favorites.has(`${item.prefix}:${item.name}`);
    this.$('.place').hidden = false;
    const tool = /** @type {any} */ (app.tools.get('place'));
    try {
      await tool.setIcon(item);
      if (editor.store.get('tool') !== 'place') editor.setTool('place');
      if (originalEvent?.type === 'keydown') this.#placeAtCenter();
    } catch {
      toast('That icon could not be loaded.', { type: 'error' });
    }
  }

  #placeAtCenter() {
    const tool = /** @type {any} */ (app.tools.get('place'));
    const { width, height } = editor.doc.artboard;
    tool.placeAt({ x: width / 2, y: height / 2 });
  }

  #toggleFavorite() {
    const item = this.picked;
    if (!item) return;
    const key = `${item.prefix}:${item.name}`;
    if (this.favorites.has(key)) {
      this.favorites.delete(key);
      storage.delete('iconFavorites', key);
    } else {
      const fav = { ...item, time: Date.now() };
      this.favorites.set(key, fav);
      storage.set('iconFavorites', key, fav);
    }
    this.$('.fav').pressed = this.favorites.has(key);
    if (this.current === '@favorites') this.#refresh();
  }

  /** Called after an icon has been placed, so "Recently used" stays current. */
  noteUsed() {
    if (this.current === '@recent') this.#refresh();
  }
}
