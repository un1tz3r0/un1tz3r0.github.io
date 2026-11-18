// Font providers. DESIGN.md §9.1.
//
// A provider lists families and, on request, describes one in enough detail to load it:
// one "face" per (weight, style, subset), each with a URL for rendering and a URL for
// outline extraction (a format opentype.js can read).

/**
 * @typedef {object} FontFamilyInfo
 * @property {string} provider
 * @property {string} providerLabel
 * @property {string} id
 * @property {string} family
 * @property {string} category        sans-serif | serif | display | handwriting | monospace | other
 * @property {number[]} weights
 * @property {string[]} styles        'normal' and/or 'italic'
 * @property {string[]} subsets
 * @property {string} defSubset
 * @property {boolean} variable
 * @property {string} license
 * @property {string} [previewUrl]    one small file that shows the family
 */
/**
 * @typedef {object} FontFace_
 * @property {number} weight
 * @property {'normal'|'italic'} style
 * @property {string} subset
 * @property {string} [unicodeRange]
 * @property {string} url             for the FontFace API
 * @property {string} outlineUrl      ttf / otf / woff, for opentype.js
 */
/** @typedef {FontFamilyInfo & {faces: FontFace_[], source?: string}} FontFamilyDetail */

export const FONTSOURCE_API = 'https://api.fontsource.org/v1/fonts';
const FONTSOURCE_CDN = 'https://cdn.jsdelivr.net/fontsource/fonts';

/** Licenses under which a typeface may be used and embedded freely. */
const OPEN_LICENSES = new Set(['ofl-1.1', 'apache-2.0', 'ufl-1.0', 'cc0-1.0', 'mit', 'unlicense', 'mit and bitstream-vera']);
export const isOpenLicense = (id) => OPEN_LICENSES.has(String(id ?? '').toLowerCase());

/** The weight a family offers that is nearest to the one asked for. */
export function nearestWeight(weights, wanted) {
  if (!weights?.length) return wanted;
  return weights.reduce((best, w) => (Math.abs(w - wanted) < Math.abs(best - wanted) ? w : best), weights[0]);
}

/** @param {{fetch: typeof fetch}} deps */
export function fontsourceProvider({ fetch }) {
  const label = 'Fontsource';
  const json = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fontsource: ${res.status} for ${url}`);
    return res.json();
  };
  const toInfo = (f) => {
    const weights = [...f.weights].sort((a, b) => a - b);
    const weight = nearestWeight(weights, 400);
    const style = f.styles.includes('normal') ? 'normal' : f.styles[0];
    return /** @type {FontFamilyInfo} */ ({
      provider: 'fontsource',
      providerLabel: f.type === 'google' ? 'Google Fonts' : label,
      id: f.id,
      family: f.family,
      category: f.category,
      weights,
      styles: f.styles,
      subsets: f.subsets,
      defSubset: f.defSubset,
      variable: !!f.variable,
      license: f.license,
      previewUrl: `${FONTSOURCE_CDN}/${f.id}@latest/${f.defSubset}-${weight}-${style}.woff2`,
    });
  };
  return {
    id: 'fontsource',
    label,
    /** @returns {Promise<FontFamilyInfo[]>} */
    async list() {
      const all = await json(FONTSOURCE_API);
      // Icon fonts are not typefaces; icons come from the icon browser.
      return all.filter((f) => f.category !== 'icons' && isOpenLicense(f.license)).map(toInfo);
    },
    /** @returns {Promise<FontFamilyDetail>} */
    async describe(id) {
      const f = await json(`${FONTSOURCE_API}/${encodeURIComponent(id)}`);
      const faces = [];
      for (const [weight, styles] of Object.entries(f.variants ?? {})) {
        for (const [style, subsets] of Object.entries(styles)) {
          for (const [subset, files] of Object.entries(subsets)) {
            const url = files.url ?? {};
            if (!url.woff2 && !url.woff && !url.ttf) continue;
            faces.push({
              weight: Number(weight),
              style: /** @type {'normal'|'italic'} */ (style),
              subset,
              unicodeRange: f.unicodeRange?.[subset],
              url: url.woff2 ?? url.woff ?? url.ttf,
              outlineUrl: url.ttf ?? url.woff ?? url.woff2,
            });
          }
        }
      }
      return { ...toInfo(f), faces, source: f.source };
    },
  };
}

/** jsDelivr URL of a file in a GitHub-hosted font entry. */
export function githubFileUrl(entry, path) {
  return `https://cdn.jsdelivr.net/gh/${entry.repo}@${entry.ref}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

/** @param {{fetch: typeof fetch, manifestUrl: string | URL}} deps */
export function githubProvider({ fetch, manifestUrl }) {
  let manifest = null;
  const load = async () => {
    if (!manifest) {
      const res = await fetch(manifestUrl);
      if (!res.ok) throw new Error(`GitHub fonts manifest: ${res.status}`);
      manifest = (await res.json()).filter((e) => isOpenLicense(e.license));
    }
    return manifest;
  };
  const facesOf = (entry) => {
    const faces = [];
    for (const [weight, styles] of Object.entries(entry.files)) {
      for (const [style, path] of Object.entries(styles)) {
        const url = githubFileUrl(entry, path);
        faces.push({ weight: Number(weight), style: /** @type {'normal'|'italic'} */ (style), subset: 'all', url, outlineUrl: url });
      }
    }
    return faces;
  };
  const toInfo = (entry) => {
    const faces = facesOf(entry);
    const weights = [...new Set(faces.map((f) => f.weight))].sort((a, b) => a - b);
    const w = nearestWeight(weights, 400);
    return /** @type {FontFamilyInfo} */ ({
      provider: 'github',
      providerLabel: 'GitHub',
      id: entry.id,
      family: entry.family,
      category: entry.category,
      weights,
      styles: [...new Set(faces.map((f) => f.style))],
      subsets: ['all'],
      defSubset: 'all',
      variable: false,
      license: entry.license,
      previewUrl: (faces.find((f) => f.weight === w && f.style === 'normal') ?? faces[0]).url,
    });
  };
  return {
    id: 'github',
    label: 'GitHub',
    async list() {
      return (await load()).map(toInfo);
    },
    async describe(id) {
      const entry = (await load()).find((e) => e.id === id);
      if (!entry) throw new Error(`Unknown GitHub font "${id}"`);
      return { ...toInfo(entry), faces: facesOf(entry), source: `https://github.com/${entry.repo}` };
    },
  };
}

/**
 * Fonts the user added from their own disk. Stored in IndexedDB; never uploaded.
 * Record: {key, id, family, weight, style, name, data: ArrayBuffer}
 * @param {{storage: any}} deps
 */
export function localProvider({ storage }) {
  /** @type {Map<string, string>} blob URLs by record key */
  const urls = new Map();
  const records = () => storage.values('fonts');
  const urlFor = (rec) => {
    if (!urls.has(rec.key)) urls.set(rec.key, URL.createObjectURL(new Blob([rec.data])));
    return urls.get(rec.key);
  };
  const group = (recs) => {
    const families = new Map();
    for (const rec of recs) {
      if (!families.has(rec.id)) families.set(rec.id, []);
      families.get(rec.id).push(rec);
    }
    return families;
  };
  const toInfo = (id, recs) => {
    const weights = [...new Set(recs.map((r) => r.weight))].sort((a, b) => a - b);
    const w = nearestWeight(weights, 400);
    return /** @type {FontFamilyInfo} */ ({
      provider: 'local',
      providerLabel: 'Your files',
      id,
      family: recs[0].family,
      category: 'other',
      weights,
      styles: [...new Set(recs.map((r) => r.style))],
      subsets: ['all'],
      defSubset: 'all',
      variable: false,
      license: 'Your own file',
      previewUrl: urlFor(recs.find((r) => r.weight === w && r.style === 'normal') ?? recs[0]),
    });
  };
  return {
    id: 'local',
    label: 'Your files',
    async list() {
      return [...group(await records())].map(([id, recs]) => toInfo(id, recs));
    },
    async describe(id) {
      const recs = (await records()).filter((r) => r.id === id);
      if (!recs.length) throw new Error(`Unknown local font "${id}"`);
      return {
        ...toInfo(id, recs),
        faces: recs.map((r) => ({ weight: r.weight, style: r.style, subset: 'all', url: urlFor(r), outlineUrl: urlFor(r) })),
      };
    },
    /** @param {{family: string, weight: number, style: string, name: string, data: ArrayBuffer}} font */
    async add(font) {
      const id = font.family.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'font';
      const key = `${id}:${font.weight}:${font.style}`;
      await storage.set('fonts', key, { ...font, id, key });
      urls.delete(key);
      return id;
    },
    async remove(id) {
      for (const rec of await records()) {
        if (rec.id === id) await storage.delete('fonts', rec.key);
      }
    },
  };
}
