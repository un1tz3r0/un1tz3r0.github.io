// Icon service backed by Iconify. DESIGN.md §8.
//
// Everything is asynchronous so that parsing and indexing can later move into a worker
// without changing callers. Network access goes through an injectable `fetch`, which is
// how the tests run against recorded fixtures.

import { classifyLicense } from './licenses.js';

export const API = 'https://api.iconify.design';
export const CDN = 'https://cdn.jsdelivr.net/npm/@iconify-json';

/**
 * @typedef {object} IconSetInfo
 * @property {string} prefix
 * @property {string} name
 * @property {number} total
 * @property {{name: string, url?: string}} [author]
 * @property {{title: string, spdx: string, url?: string}} license
 * @property {'permissive'|'attribution'} licenseClass
 * @property {boolean} attribution   whether using the icons requires credit
 * @property {string} [category]
 * @property {boolean} palette       multicolor set
 * @property {number} [height]
 * @property {string[]} samples
 * @property {number} featured       position in the featured list, or -1
 */
/**
 * @typedef {object} IconData
 * @property {string} prefix
 * @property {string} name
 * @property {string} body
 * @property {[number, number, number, number]} viewBox
 * @property {boolean} palette
 */
/** @typedef {{prefix: string, name: string}} IconRef */

const MAX_OPEN_SETS = 4;

/**
 * Resolve an icon (following aliases) to a body and viewBox, applying Iconify's alias
 * transformations (rotate / hFlip / vFlip) the way Iconify's own renderer does.
 * @param {any} set   parsed IconifyJSON
 * @param {string} name
 * @returns {{body: string, viewBox: [number, number, number, number]} | null}
 */
export function resolveIcon(set, name) {
  const props = { rotate: 0, hFlip: false, vFlip: false };
  const dims = {};
  let current = name;
  let icon = null;
  for (let depth = 0; depth < 6; depth++) {
    if (set.icons[current]) {
      icon = set.icons[current];
      break;
    }
    const alias = set.aliases?.[current];
    if (!alias) return null;
    // Nearest definition wins for dimensions; transformations accumulate along the chain.
    for (const key of ['left', 'top', 'width', 'height']) {
      if (alias[key] !== undefined && dims[key] === undefined) dims[key] = alias[key];
    }
    props.rotate += alias.rotate ?? 0;
    if (alias.hFlip) props.hFlip = !props.hFlip;
    if (alias.vFlip) props.vFlip = !props.vFlip;
    current = alias.parent;
  }
  if (!icon) return null;
  props.rotate += icon.rotate ?? 0;
  if (icon.hFlip) props.hFlip = !props.hFlip;
  if (icon.vFlip) props.vFlip = !props.vFlip;

  const box = {
    left: dims.left ?? icon.left ?? set.left ?? 0,
    top: dims.top ?? icon.top ?? set.top ?? 0,
    width: dims.width ?? icon.width ?? set.width ?? 16,
    height: dims.height ?? icon.height ?? set.height ?? 16,
  };
  let body = icon.body;
  let { hFlip, vFlip } = props;
  let rotation = ((props.rotate % 4) + 4) % 4;
  const transforms = [];
  if (hFlip) {
    if (vFlip) {
      rotation += 2;
    } else {
      transforms.push(`translate(${box.width + box.left} ${-box.top})`, 'scale(-1 1)');
      box.top = box.left = 0;
    }
  } else if (vFlip) {
    transforms.push(`translate(${-box.left} ${box.height + box.top})`, 'scale(1 -1)');
    box.top = box.left = 0;
  }
  rotation %= 4;
  if (rotation === 1) {
    const c = box.height / 2 + box.top;
    transforms.unshift(`rotate(90 ${c} ${c})`);
  } else if (rotation === 2) {
    transforms.unshift(`rotate(180 ${box.width / 2 + box.left} ${box.height / 2 + box.top})`);
  } else if (rotation === 3) {
    const c = box.width / 2 + box.left;
    transforms.unshift(`rotate(-90 ${c} ${c})`);
  }
  if (rotation % 2 === 1) {
    if (box.left !== box.top) [box.left, box.top] = [box.top, box.left];
    if (box.width !== box.height) [box.width, box.height] = [box.height, box.width];
  }
  if (transforms.length) body = `<g transform="${transforms.join(' ')}">${body}</g>`;
  return { body, viewBox: [box.left, box.top, box.width, box.height] };
}

/**
 * @param {{fetch?: typeof fetch, featured?: string[]}} [opts]
 */
export function createIconService(opts = {}) {
  const doFetch = opts.fetch ?? ((...args) => globalThis.fetch(...args));
  const featured = opts.featured ?? [];
  /** @type {Promise<IconSetInfo[]> | null} */
  let setsPromise = null;
  /** @type {Map<string, IconSetInfo>} */
  const setIndex = new Map();
  /** Opened sets, most recently used last. @type {Map<string, Promise<any>>} */
  const open = new Map();
  /** Icons fetched individually (search results, favorites). @type {Map<string, IconData>} */
  const single = new Map();

  async function json(url) {
    const res = await doFetch(url);
    if (!res.ok) throw new Error(`Icon service: ${res.status} for ${url}`);
    return res.json();
  }

  async function listSets() {
    if (!setsPromise) {
      setsPromise = json(`${API}/collections`).then((raw) => {
        const out = [];
        for (const [prefix, info] of Object.entries(raw)) {
          const cls = classifyLicense(info.license?.spdx);
          if (cls === 'excluded' || info.hidden) continue;
          /** @type {IconSetInfo} */
          const set = {
            prefix,
            name: info.name ?? prefix,
            total: info.total ?? 0,
            author: info.author,
            license: info.license,
            licenseClass: cls,
            attribution: cls === 'attribution',
            category: info.category,
            palette: !!info.palette,
            height: Array.isArray(info.height) ? info.height[0] : info.height,
            samples: info.samples ?? [],
            featured: featured.indexOf(prefix),
          };
          setIndex.set(prefix, set);
          out.push(set);
        }
        out.sort((a, b) => {
          if ((a.featured >= 0) !== (b.featured >= 0)) return a.featured >= 0 ? -1 : 1;
          if (a.featured >= 0) return a.featured - b.featured;
          return a.name.localeCompare(b.name);
        });
        return out;
      });
      setsPromise.catch(() => {
        setsPromise = null;
      });
    }
    return setsPromise;
  }

  /** Load a whole set. Resolves to `{info, data, names, categories, suffixes, prefixes}`. */
  async function openSet(prefix) {
    await listSets();
    const info = setIndex.get(prefix);
    if (!info) throw new Error(`Icon set "${prefix}" is not available`);
    let promise = open.get(prefix);
    if (promise) {
      // Refresh its position in the LRU order.
      open.delete(prefix);
      open.set(prefix, promise);
      return promise;
    }
    promise = (async () => {
      const [data, meta] = await Promise.all([
        json(`${CDN}/${prefix}/icons.json`),
        // Categories and style suffixes are a nicety; the set works without them.
        json(`${API}/collection?prefix=${encodeURIComponent(prefix)}`).catch(() => null),
      ]);
      const hidden = new Set(meta?.hidden ?? []);
      const names = Object.keys(data.icons).filter((n) => !data.icons[n].hidden && !hidden.has(n));
      for (const [alias, def] of Object.entries(data.aliases ?? {})) {
        // Aliases that merely rename an icon would show every glyph twice; keep the ones
        // that change it.
        if (!def.hidden && (def.rotate || def.hFlip || def.vFlip)) names.push(alias);
      }
      names.sort();
      return {
        info,
        data,
        names,
        categories: meta?.categories ?? data.categories ?? {},
        suffixes: meta?.suffixes ?? {},
        prefixes: meta?.prefixes ?? {},
      };
    })();
    open.set(prefix, promise);
    promise.catch(() => open.delete(prefix));
    while (open.size > MAX_OPEN_SETS) open.delete(open.keys().next().value);
    return promise;
  }

  function toIconData(prefix, name, resolved) {
    return /** @type {IconData} */ ({
      prefix,
      name,
      body: resolved.body,
      viewBox: resolved.viewBox,
      palette: !!setIndex.get(prefix)?.palette,
    });
  }

  /**
   * Icon data for some icons of one set. Uses the opened set when there is one, otherwise
   * asks the API for just these icons.
   * @returns {Promise<IconData[]>}
   */
  async function getIcons(prefix, names) {
    await listSets();
    if (!setIndex.has(prefix)) throw new Error(`Icon set "${prefix}" is not available`);
    const out = [];
    const missing = [];
    const opened = open.has(prefix) ? await open.get(prefix).catch(() => null) : null;
    for (const name of names) {
      const cached = single.get(`${prefix}:${name}`);
      if (cached) {
        out.push(cached);
        continue;
      }
      const resolved = opened ? resolveIcon(opened.data, name) : null;
      if (resolved) out.push(toIconData(prefix, name, resolved));
      else missing.push(name);
    }
    if (missing.length) {
      const data = await json(`${API}/${prefix}.json?icons=${missing.map(encodeURIComponent).join(',')}`);
      for (const name of missing) {
        const resolved = resolveIcon(data, name);
        if (!resolved) continue;
        const icon = toIconData(prefix, name, resolved);
        single.set(`${prefix}:${name}`, icon);
        out.push(icon);
      }
    }
    return out;
  }

  /**
   * Search icon names. Online, across every allowed set via the API; if that fails
   * (offline), across the sets that are open.
   * @param {string} query
   * @param {{prefix?: string, limit?: number}} [o]
   * @returns {Promise<IconRef[]>}
   */
  async function search(query, o = {}) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const limit = o.limit ?? 200;
    await listSets().catch(() => []);
    if (o.prefix && open.has(o.prefix)) return searchOpen(q, [o.prefix], limit);
    try {
      const params = new URLSearchParams({ query: q, limit: String(Math.min(999, Math.max(32, limit))) });
      if (o.prefix) params.set('prefix', o.prefix);
      const res = await json(`${API}/search?${params}`);
      return (res.icons ?? [])
        .map((id) => {
          const i = id.indexOf(':');
          return { prefix: id.slice(0, i), name: id.slice(i + 1) };
        })
        .filter((ref) => setIndex.has(ref.prefix))
        .slice(0, limit);
    } catch {
      return searchOpen(q, o.prefix ? [o.prefix] : [...open.keys()], limit);
    }
  }

  async function searchOpen(q, prefixes, limit) {
    const terms = q.split(/\s+/);
    const out = [];
    for (const prefix of prefixes) {
      const set = await open.get(prefix)?.catch(() => null);
      if (!set) continue;
      for (const name of set.names) {
        if (terms.every((t) => name.includes(t))) {
          out.push({ prefix, name });
          if (out.length >= limit) return out;
        }
      }
    }
    return out;
  }

  return {
    listSets,
    openSet,
    getIcons,
    search,
    /** Set info if the catalog has been loaded. @returns {IconSetInfo | undefined} */
    cachedSet: (prefix) => setIndex.get(prefix),
    /** Whether a set is currently held in memory. */
    isOpen: (prefix) => open.has(prefix),
    /** URL of an icon as a standalone SVG, for thumbnails of icons whose set is not open. */
    thumbnailUrl: (prefix, name, color) =>
      `${API}/${prefix}/${name}.svg${color ? `?color=${encodeURIComponent(color)}` : ''}`,
  };
}

/** A data: URL that renders icon markup, for use as an <img> source. */
export function iconDataUrl(body, viewBox, color = '#000') {
  const [x, y, w, h] = viewBox;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" style="color:${color}">${body}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
