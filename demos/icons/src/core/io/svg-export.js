// SVG export and the project-file format.
//
// A project file is an ordinary SVG whose <metadata> carries the document JSON, so any
// viewer can display it and this app can reopen it losslessly (DESIGN.md §13.2).

import { fmt } from '../affine.js';
import { buildContent, backgroundVNode, vnodeToString, escapeText, escapeAttr } from './vnode.js';
import { migrateDoc } from '../model/nodes.js';
import { allNodes } from '../model/tree.js';

export const APP_NS = 'https://materialiconstudio.app/ns/1';
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * @typedef {object} ExportOptions
 * @property {boolean | object} [embedDocument]  include the editable document in <metadata>:
 *   `true` embeds the document being exported; a document object embeds that one instead
 *   (used when the visible image has had its text outlined but the editable copy must not)
 * @property {boolean} [background]     include the artboard background (default true)
 * @property {{title:string, author?:string, license?:string, url?:string}[]} [credits]
 * @property {boolean} [currentColor]   write every solid color as `currentColor`
 * @property {boolean} [minify]         single line, no indentation
 * @property {boolean} [dimensions]     write width/height as well as viewBox (default true)
 * @property {number}  [width]          output width (default: artboard width)
 * @property {number}  [height]
 * @property {string}  [fontCss]        @font-face rules for live text
 */

/**
 * Serialize a document to SVG markup.
 * @param {import('../model/nodes.js').Doc} doc
 * @param {ExportOptions} [options]
 * @returns {string}
 */
export function exportSvg(doc, options = {}) {
  const { width, height } = doc.artboard;
  const { defs, content } = buildContent(doc, { canvas: false, currentColor: !!options.currentColor });
  const indent = options.minify ? '' : '  ';
  const nl = options.minify ? '' : '\n';

  const rootAttrs = { xmlns: SVG_NS };
  if (options.dimensions !== false) {
    rootAttrs.width = fmt(options.width ?? width, 3);
    rootAttrs.height = fmt(options.height ?? height, 3);
  }
  rootAttrs.viewBox = `0 0 ${fmt(width, 3)} ${fmt(height, 3)}`;
  if (options.embedDocument) rootAttrs['xmlns:mis'] = APP_NS;

  const parts = [];
  const meta = [];
  if (options.credits?.length) {
    const lines = options.credits.map((c) =>
      [c.title, c.author && `by ${c.author}`, c.license && `(${c.license})`, c.url].filter(Boolean).join(' '),
    );
    parts.push(`${indent}<!-- Credits:${nl || ' '}${lines.map((l) => `${indent}${indent}${l.replace(/--/g, '—')}`).join(nl || '; ')}${nl}${indent}-->`);
  }
  if (options.embedDocument) {
    const embedded = options.embedDocument === true ? doc : options.embedDocument;
    meta.push(`<mis:document>${escapeText(JSON.stringify(embedded))}</mis:document>`);
  }
  if (meta.length) parts.push(`${indent}<metadata>${meta.join('')}</metadata>`);
  if (options.fontCss) parts.push(`${indent}<style>${escapeText(options.fontCss)}</style>`);
  if (defs.length) {
    parts.push(vnodeToString({ tag: 'defs', attrs: {}, children: dedupe(defs) }, { indent, level: 1 }));
  }
  const bg = options.background === false ? null : backgroundVNode(doc);
  if (bg) parts.push(vnodeToString(bg, { indent, level: 1 }));
  for (const v of content) parts.push(vnodeToString(v, { indent, level: 1 }));

  const attrs = Object.entries(rootAttrs).map(([k, v]) => ` ${k}="${escapeAttr(v)}"`).join('');
  return `<svg${attrs}>${nl}${parts.join(nl)}${nl}</svg>${nl}`;
}

function dedupe(defs) {
  const seen = new Set();
  return defs.filter((d) => (seen.has(d.key) ? false : (seen.add(d.key), true)));
}

/** A project file: rendered SVG plus the embedded, editable document. */
export function serializeProject(doc, options = {}) {
  return exportSvg(doc, { ...options, embedDocument: true });
}

const unescapeXml = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

/**
 * Extract the embedded document from a project file.
 * @param {string} source  SVG markup
 * @returns {import('../model/nodes.js').Doc | null}  `null` if this is not a project file
 */
export function parseProject(source) {
  const m = /<mis:document[^>]*>([\s\S]*?)<\/mis:document>/.exec(source);
  if (!m) return null;
  let text = m[1].trim();
  const cdata = /^<!\[CDATA\[([\s\S]*)\]\]>$/.exec(text);
  text = cdata ? cdata[1] : unescapeXml(text);
  return migrateDoc(JSON.parse(text));
}

/**
 * Sources that need crediting, derived from the nodes present in the document.
 * @returns {{icons: {prefix:string, names:string[]}[], fonts: import('../model/nodes.js').FontRef[]}}
 */
export function collectSources(doc) {
  const icons = new Map();
  const fonts = new Map();
  for (const node of allNodes(doc)) {
    if (node.type === 'icon') {
      if (!icons.has(node.source.prefix)) icons.set(node.source.prefix, new Set());
      icons.get(node.source.prefix).add(node.source.name);
    } else if (node.type === 'text') {
      fonts.set(`${node.font.provider}:${node.font.id}`, node.font);
    }
    // Paths converted from icons remember where they came from.
    if (node.origin?.prefix) {
      if (!icons.has(node.origin.prefix)) icons.set(node.origin.prefix, new Set());
      icons.get(node.origin.prefix).add(node.origin.name);
    }
  }
  return {
    icons: [...icons].map(([prefix, names]) => ({ prefix, names: [...names].sort() })),
    fonts: [...fonts.values()],
  };
}
