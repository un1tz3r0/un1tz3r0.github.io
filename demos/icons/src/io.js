// Browser-side input/output: building exports, rasterizing to PNG, reading and writing
// files, importing foreign SVG. DESIGN.md §13.

import { app } from './app.js';
import { exportSvg, collectSources } from './core/io/svg-export.js';
import { allNodes } from './core/model/tree.js';
import { createGroup } from './core/model/nodes.js';
import { outlineAllText, svgToNodes } from './convert.js';
import { sanitizeDocument } from './core/io/sanitize.js';

/**
 * Who to credit for the icons and typefaces in a document.
 * @returns {Promise<{kind: 'icons'|'font', title: string, names?: string[], author?: string, license?: string, url?: string, required: boolean}[]>}
 */
export async function buildCredits(doc) {
  const sources = collectSources(doc);
  const out = [];
  if (sources.icons.length) await app.services.icons.listSets().catch(() => []);
  for (const { prefix, names } of sources.icons) {
    const set = app.services.icons.cachedSet(prefix);
    out.push({
      kind: /** @type {const} */ ('icons'),
      title: set?.name ?? prefix,
      names,
      author: set?.author?.name,
      license: set?.license?.title,
      url: set?.license?.url ?? set?.author?.url,
      required: !!set?.attribution,
    });
  }
  for (const font of sources.fonts) {
    const info = app.services.fonts.cached(font) ?? (await app.services.fonts.describe(font).catch(() => null));
    out.push({
      kind: /** @type {const} */ ('font'),
      title: font.family,
      license: info?.license,
      url: /** @type {any} */ (info)?.source,
      required: false,
    });
  }
  return out;
}

/**
 * @typedef {object} ExportSettings
 * @property {boolean} outlineText
 * @property {boolean} currentColor
 * @property {boolean} minify
 * @property {boolean} credits
 * @property {boolean} dimensions
 * @property {boolean} background
 * @property {boolean} [embedDocument]
 */

export const DEFAULT_EXPORT = { outlineText: true, currentColor: false, minify: false, credits: true, dimensions: true, background: true };

/**
 * Produce SVG markup for a document.
 * @param {import('./core/model/nodes.js').Doc} doc
 * @param {Partial<ExportSettings>} [settings]
 * @returns {Promise<{svg: string, warnings: string[]}>}
 */
export async function buildSvg(doc, settings = {}) {
  const s = { ...DEFAULT_EXPORT, ...settings };
  const warnings = [];
  let out = doc;
  let fontCss = '';
  const hasText = allNodes(doc).some((n) => n.type === 'text' && n.visible);
  if (hasText && s.outlineText) {
    const result = await outlineAllText(doc);
    out = result.doc;
    if (result.failed.length) warnings.push(`Could not outline text set in ${result.failed.join(', ')}; it was left as live text.`);
    if (result.missing.length) warnings.push(`No outlines for: ${result.missing.slice(0, 16).join(' ')}`);
  }
  if (allNodes(out).some((n) => n.type === 'text' && n.visible)) {
    const fonts = collectSources(out).fonts;
    fontCss = await app.services.fonts.fontFaceCss(fonts).catch(() => '');
    if (fonts.some((f) => f.provider === 'local')) warnings.push('Text set in fonts from your own files will only display where those fonts are installed.');
  }
  const credits = s.credits ? (await buildCredits(doc)).map((c) => ({
    title: c.kind === 'icons' ? `Icons from ${c.title}` : `Typeface ${c.title}`,
    author: c.author,
    license: c.license,
    url: c.url,
  })) : [];
  const svg = exportSvg(out, {
    // The editable copy is always the original document, live text and all.
    embedDocument: s.embedDocument ? doc : false,
    credits,
    currentColor: s.currentColor,
    minify: s.minify,
    dimensions: s.dimensions,
    background: s.background,
    fontCss,
  });
  return { svg, warnings };
}

/** The project file for a document: an SVG that also carries the editable document. */
export async function buildProject(doc) {
  // The visible image has its text outlined so the file looks right everywhere; the
  // embedded copy keeps the text live so it stays editable.
  const { svg } = await buildSvg(doc, { embedDocument: true, outlineText: true, minify: false, credits: true });
  return svg;
}

/**
 * Rasterize SVG markup.
 * @param {string} svg
 * @param {{width: number, height: number, background?: string | null}} opts  output size in pixels
 * @returns {Promise<Blob>}
 */
export async function svgToPng(svg, opts) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(opts.width));
    canvas.height = Math.max(1, Math.round(opts.height));
    const ctx = canvas.getContext('2d');
    if (opts.background) {
      ctx.fillStyle = opts.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encoding failed'))), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}

// --- files ---------------------------------------------------------------------------------

const safeName = (name) => (String(name).trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ') || 'untitled');

/** Trigger a download of a blob. */
export function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Save data to a file the user chooses, through the File System Access API when the
 * browser has it (so later saves can write straight back), otherwise as a download.
 * @param {Blob} blob
 * @param {{name: string, extension: string, mime: string, description: string, handle?: any}} opts
 * @returns {Promise<{handle: any | null, saved: boolean}>}
 */
export async function saveFile(blob, opts) {
  const picker = /** @type {any} */ (window).showSaveFilePicker;
  let handle = opts.handle ?? null;
  if (!handle && picker) {
    try {
      handle = await picker({
        suggestedName: `${safeName(opts.name)}.${opts.extension}`,
        types: [{ description: opts.description, accept: { [opts.mime]: [`.${opts.extension}`] } }],
      });
    } catch (err) {
      if (err?.name === 'AbortError') return { handle: null, saved: false };
      handle = null;
    }
  }
  if (handle) {
    try {
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { handle, saved: true };
    } catch (err) {
      if (err?.name === 'AbortError') return { handle: null, saved: false };
      // Permission lost or the file moved: fall through to a plain download.
    }
  }
  download(blob, `${safeName(opts.name)}.${opts.extension}`);
  return { handle: null, saved: true };
}

/**
 * Let the user pick files.
 * @param {{accept: Record<string, string[]>, description: string, multiple?: boolean}} opts
 * @returns {Promise<{file: File, handle: any | null}[]>}
 */
export async function pickFiles(opts) {
  const picker = /** @type {any} */ (window).showOpenFilePicker;
  if (picker) {
    try {
      const handles = await picker({ multiple: !!opts.multiple, types: [{ description: opts.description, accept: opts.accept }] });
      return Promise.all(handles.map(async (handle) => ({ file: await handle.getFile(), handle })));
    } catch (err) {
      if (err?.name === 'AbortError') return [];
    }
  }
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = !!opts.multiple;
    input.accept = Object.values(opts.accept).flat().join(',');
    input.addEventListener('change', () => resolve([...input.files].map((file) => ({ file, handle: null }))));
    input.addEventListener('cancel', () => resolve([]));
    input.click();
  });
}

// --- importing foreign SVG -----------------------------------------------------------------

/**
 * Convert an arbitrary SVG document into nodes. Best effort: geometry and flat colors
 * come across; what cannot be represented is counted in `report`.
 * @param {string} source
 * @param {string} [name]
 * @returns {Promise<{group: any, width: number, height: number, report: string[]}>}
 */
export async function importSvg(source, name = 'Imported') {
  const report = [];
  // Parsing for the report also proves the file is well-formed before geo sees it.
  const clean = sanitizeDocument(source);
  const count = (re) => (source.match(re) ?? []).length;
  const texts = count(/<text[\s>]/g);
  const images = count(/<image[\s>]/g);
  if (texts) report.push(`${texts} text element${texts === 1 ? '' : 's'} skipped (convert text to outlines before exporting from the other app).`);
  if (images) report.push(`${images} embedded image${images === 1 ? '' : 's'} skipped.`);
  if (count(/<(filter|mask|clipPath)[\s>]/g)) report.push('Filters, masks and clipping paths were not applied.');

  let result;
  try {
    result = await svgToNodes(source);
  } catch (err) {
    // Usually a stylesheet feature geo declines to guess at. Without the stylesheet the
    // shapes still come through, with default paint.
    report.push(`The file's stylesheet could not be applied (${err?.message ?? 'unsupported CSS'}); shapes may have lost their colors.`);
    result = await svgToNodes(clean.markup);
  }
  if (result.unsupportedPaints) report.push(`${result.unsupportedPaints} gradient or pattern paint${result.unsupportedPaints === 1 ? '' : 's'} replaced by a flat color.`);
  if (!result.nodes.length) throw new Error('No shapes were found in that file');
  // geo returns geometry in viewport coordinates: the viewBox origin is already at 0,0.
  const [, , vw, vh] = result.viewBox ?? [0, 0, parseFloat(clean.width) || 300, parseFloat(clean.height) || 150];
  return { group: createGroup(result.nodes, { name }), width: vw, height: vh, report };
}
