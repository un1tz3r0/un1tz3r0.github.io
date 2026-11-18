// Font service: one catalog over all providers, FontFace management for on-canvas
// rendering, and parsed fonts for outline conversion. DESIGN.md §9.

import { fontsourceProvider, githubProvider, localProvider, nearestWeight } from './providers.js';

/** @typedef {import('./providers.js').FontFamilyInfo} FontFamilyInfo */
/** @typedef {import('./providers.js').FontFamilyDetail} FontFamilyDetail */
/** @typedef {import('../../core/model/nodes.js').FontRef} FontRef */

const MAX_PREVIEWS = 90;
const keyOf = (ref) => `${ref.provider}:${ref.id}`;

/** Parse a CSS unicode-range value into [lo, hi] pairs. */
export function parseUnicodeRange(range) {
  if (!range) return null;
  const out = [];
  for (const part of String(range).split(',')) {
    const m = /U\+([0-9a-f?]+)(?:-([0-9a-f]+))?/i.exec(part.trim());
    if (!m) continue;
    if (m[1].includes('?')) out.push([parseInt(m[1].replace(/\?/g, '0'), 16), parseInt(m[1].replace(/\?/g, 'f'), 16)]);
    else out.push([parseInt(m[1], 16), parseInt(m[2] ?? m[1], 16)]);
  }
  return out;
}

const covers = (ranges, codePoint) => !ranges || ranges.some(([lo, hi]) => codePoint >= lo && codePoint <= hi);

/**
 * @param {{fetch?: typeof fetch, storage: any, manifestUrl: string | URL}} deps
 */
export function createFontService(deps) {
  const doFetch = deps.fetch ?? ((...a) => globalThis.fetch(...a));
  const local = localProvider({ storage: deps.storage });
  const providers = [
    fontsourceProvider({ fetch: doFetch }),
    githubProvider({ fetch: doFetch, manifestUrl: deps.manifestUrl }),
    local,
  ];
  /** @type {Map<string, FontFamilyInfo>} */
  const index = new Map();
  /** @type {Map<string, Promise<FontFamilyDetail>>} */
  const details = new Map();
  /** @type {Map<string, FontFamilyDetail>} */
  const resolved = new Map();
  /** Face keys already registered with document.fonts. */
  const registered = new Set();
  /** Preview faces, oldest first. @type {Map<string, FontFace>} */
  const previews = new Map();
  /** Families in use by the document; their previews are never evicted. */
  const inUse = new Set();
  /** Parsed opentype fonts by outline URL. @type {Map<string, Promise<any>>} */
  const parsed = new Map();
  /** @type {Promise<FontFamilyInfo[]> | null} */
  let listPromise = null;
  /** Which providers failed to list, for the UI to mention. */
  let failures = [];

  async function list({ refresh = false } = {}) {
    if (refresh) listPromise = null;
    if (!listPromise) {
      listPromise = Promise.allSettled(providers.map((p) => p.list())).then((results) => {
        failures = [];
        const all = [];
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') all.push(...r.value);
          else failures.push(providers[i].label);
        });
        index.clear();
        for (const info of all) index.set(keyOf(info), info);
        all.sort((a, b) => a.family.localeCompare(b.family));
        // If the main catalog failed, let the next call try again rather than caching that.
        if (failures.length) listPromise = null;
        return all;
      });
    }
    return listPromise;
  }

  /** @param {{provider: string, id: string}} ref @returns {Promise<FontFamilyDetail>} */
  function describe(ref) {
    const key = keyOf(ref);
    let p = details.get(key);
    if (!p) {
      const provider = providers.find((x) => x.id === ref.provider);
      p = provider ? provider.describe(ref.id) : Promise.reject(new Error(`Unknown font provider "${ref.provider}"`));
      details.set(key, p);
      p.then((d) => resolved.set(key, d), () => details.delete(key));
    }
    return p;
  }

  /** Family details if already known (from the catalog or a previous describe). */
  function cached(ref) {
    return resolved.get(keyOf(ref)) ?? index.get(keyOf(ref)) ?? null;
  }

  /** The faces of a family matching a weight and style, falling back to what exists. */
  function facesFor(detail, weight, style) {
    const w = nearestWeight(detail.weights, weight);
    let faces = detail.faces.filter((f) => f.weight === w && f.style === style);
    if (!faces.length) faces = detail.faces.filter((f) => f.weight === w && f.style === 'normal');
    if (!faces.length) faces = detail.faces.filter((f) => f.weight === w);
    return faces;
  }

  /**
   * Make a font available for on-canvas text. Registers a FontFace per subset with its
   * unicode-range, so the browser fetches only the subsets the text actually needs.
   * Resolves when the family's default subset has loaded.
   * @param {FontRef} ref
   */
  async function ensure(ref) {
    if (ref.provider === 'system') return;
    inUse.add(keyOf(ref));
    const detail = await describe(ref);
    const faces = facesFor(detail, ref.weight, ref.style);
    const loads = [];
    for (const face of faces) {
      const faceKey = `${keyOf(ref)}:${face.weight}:${face.style}:${face.subset}`;
      if (registered.has(faceKey)) continue;
      registered.add(faceKey);
      /** @type {FontFaceDescriptors} */
      const descriptors = { weight: String(face.weight), style: face.style, display: 'swap' };
      if (face.unicodeRange) descriptors.unicodeRange = face.unicodeRange;
      const ff = new FontFace(detail.family, `url("${face.url}")`, descriptors);
      document.fonts.add(ff);
      if (face.subset === detail.defSubset || faces.length === 1) loads.push(ff.load().catch(() => {}));
    }
    await Promise.all(loads);
  }

  /**
   * Load one small face so a family can be shown in its own typeface in the font list.
   * @param {FontFamilyInfo} info
   */
  async function preview(info) {
    const key = keyOf(info);
    if (previews.has(key) || !info.previewUrl) return;
    const ff = new FontFace(info.family, `url("${info.previewUrl}")`, { display: 'swap' });
    previews.set(key, ff);
    try {
      await ff.load();
      document.fonts.add(ff);
    } catch {
      previews.delete(key);
      throw new Error(`Preview of ${info.family} failed to load`);
    }
    // Keep memory bounded: drop the oldest previews that the document is not using.
    for (const [k, face] of previews) {
      if (previews.size <= MAX_PREVIEWS) break;
      if (inUse.has(k) || k === key) continue;
      document.fonts.delete(face);
      previews.delete(k);
    }
  }

  async function opentypeFont(url) {
    let p = parsed.get(url);
    if (!p) {
      p = (async () => {
        const [{ parse }, res] = await Promise.all([import('opentype.js'), doFetch(url)]);
        if (!res.ok) throw new Error(`Font file: ${res.status} for ${url}`);
        return parse(await res.arrayBuffer());
      })();
      parsed.set(url, p);
      p.catch(() => parsed.delete(url));
    }
    return p;
  }

  /**
   * Parsed fonts needed to outline `text` in the given font: the default subset first,
   * then any other subset whose unicode-range covers characters of the text.
   * @param {FontRef} ref
   * @param {string} text
   * @returns {Promise<any[]>} opentype.js Font objects, in fallback order
   */
  async function outlineFonts(ref, text) {
    const detail = await describe(ref);
    const faces = facesFor(detail, ref.weight, ref.style);
    if (!faces.length) throw new Error(`${detail.family} has no usable font files`);
    const points = [...new Set([...text].map((ch) => ch.codePointAt(0)))].filter((cp) => cp > 32);
    const def = faces.find((f) => f.subset === detail.defSubset) ?? faces[0];
    const needed = [def];
    for (const face of faces) {
      if (face === def) continue;
      const ranges = parseUnicodeRange(face.unicodeRange);
      if (ranges && points.some((cp) => covers(ranges, cp))) needed.push(face);
    }
    return Promise.all(needed.map((f) => opentypeFont(f.outlineUrl)));
  }

  /**
   * `@font-face` rules for the given fonts, for SVG exports that keep live text.
   * @param {FontRef[]} refs
   */
  async function fontFaceCss(refs) {
    const rules = [];
    const seen = new Set();
    for (const ref of refs) {
      if (ref.provider === 'local' || ref.provider === 'system') continue;
      const detail = await describe(ref);
      for (const face of facesFor(detail, ref.weight, ref.style)) {
        const k = face.url;
        if (seen.has(k)) continue;
        seen.add(k);
        rules.push(
          `@font-face{font-family:'${detail.family}';font-style:${face.style};font-weight:${face.weight};src:url(${face.url})` +
            `${face.unicodeRange ? `;unicode-range:${face.unicodeRange}` : ''}}`,
        );
      }
    }
    return rules.join('\n');
  }

  /**
   * Add font files from the user's disk. Reads the family name and weight from the file.
   * @param {File[]} files
   * @returns {Promise<{added: string[], failed: string[]}>}
   */
  async function addLocalFiles(files) {
    const { parse } = await import('opentype.js');
    const added = [];
    const failed = [];
    for (const file of files) {
      try {
        const data = await file.arrayBuffer();
        const font = parse(data);
        // opentype.js 2 groups the name table by platform; older builds did not.
        const tables = [font.names?.windows, font.names?.unicode, font.names?.macintosh, font.names].filter(Boolean);
        const pick = (key) => {
          for (const names of tables) {
            const entry = names[key];
            const value = entry && typeof entry === 'object' ? (entry.en ?? Object.values(entry)[0]) : null;
            if (typeof value === 'string' && value.trim()) return value.trim();
          }
          return null;
        };
        const family = pick('preferredFamily') || pick('fontFamily') || file.name.replace(/\.[^.]+$/, '');
        const os2 = font.tables?.os2 ?? {};
        const italic = !!(os2.fsSelection & 1) || (font.tables?.post?.italicAngle ?? 0) !== 0;
        const id = await local.add({ family, weight: os2.usWeightClass || 400, style: italic ? 'italic' : 'normal', name: file.name, data });
        added.push(family);
        details.delete(`local:${id}`);
        resolved.delete(`local:${id}`);
      } catch {
        failed.push(file.name);
      }
    }
    listPromise = null;
    return { added: [...new Set(added)], failed };
  }

  async function removeLocal(id) {
    await local.remove(id);
    details.delete(`local:${id}`);
    resolved.delete(`local:${id}`);
    listPromise = null;
  }

  return {
    list,
    describe,
    cached,
    ensure,
    preview,
    outlineFonts,
    fontFaceCss,
    addLocalFiles,
    removeLocal,
    /** Providers whose catalog could not be loaded on the last `list()`. */
    failures: () => failures,
    providers: providers.map((p) => ({ id: p.id, label: p.label })),
  };
}
