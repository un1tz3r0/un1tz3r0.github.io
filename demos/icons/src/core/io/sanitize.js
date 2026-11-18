// Allow-list sanitizer for external SVG markup (icon bodies, imported files).
//
// Nothing fetched from the network or opened from disk reaches the live DOM without
// passing through here. The markup is parsed into an inert document (DOMParser never runs
// script), walked against an allow-list, and serialized again.
//
// This is the one module in `core` that needs a DOM parser. It uses the platform's
// DOMParser / XMLSerializer; under Node, tests install jsdom's.

const SVG_NS = 'http://www.w3.org/2000/svg';

const ALLOWED_ELEMENTS = new Set([
  'svg', 'g', 'defs', 'symbol', 'use', 'title', 'desc',
  'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
  'text', 'tspan', 'textPath',
  'linearGradient', 'radialGradient', 'stop', 'pattern',
  'clipPath', 'mask', 'marker',
  'filter', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feDropShadow',
  'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feMerge',
  'feMergeNode', 'feMorphology', 'feOffset', 'feTurbulence', 'feDisplacementMap',
  'image',
]);

// Removed together with everything inside them. Anything else unknown is also removed;
// this list exists to make the important cases explicit.
const FORBIDDEN_ELEMENTS = new Set([
  'script', 'style', 'foreignObject', 'iframe', 'object', 'embed', 'a', 'audio', 'video',
  'animate', 'animateMotion', 'animateTransform', 'set', 'handler', 'listener',
]);

const URL_ATTRS = new Set(['href', 'xlink:href', 'src']);
const SAFE_IMAGE = /^data:image\/(png|jpeg|gif|webp);base64,[a-z0-9+/=\s]+$/i;
const DANGEROUS_VALUE = /javascript:|vbscript:|data:text\/html|expression\s*\(|@import/i;
// Every url(...) must point inside the document.
const EXTERNAL_URL = /url\(\s*(?!['"]?#)/i;

function cleanAttributes(el) {
  for (const attr of [...el.attributes]) {
    const name = attr.name;
    const lower = name.toLowerCase();
    const value = attr.value;
    let remove = false;
    if (lower.startsWith('on')) remove = true;
    else if (lower === 'xmlns' || lower.startsWith('xmlns:')) remove = false;
    else if (URL_ATTRS.has(lower)) {
      const v = value.trim();
      const local = v.startsWith('#');
      const image = el.localName === 'image' && SAFE_IMAGE.test(v);
      remove = !(local || image);
    } else if (DANGEROUS_VALUE.test(value) || EXTERNAL_URL.test(value)) remove = true;
    if (remove) el.removeAttributeNode(attr);
  }
}

function walk(el) {
  for (const child of [...el.childNodes]) {
    if (child.nodeType === 1) {
      const name = child.localName;
      const inSvg = child.namespaceURI === SVG_NS;
      if (!inSvg || FORBIDDEN_ELEMENTS.has(name) || !ALLOWED_ELEMENTS.has(name)) {
        el.removeChild(child);
        continue;
      }
      // An <image> with nothing safe to show is just a tracking beacon waiting to happen.
      cleanAttributes(child);
      if (name === 'image' && !child.hasAttribute('href') && !child.hasAttribute('xlink:href')) {
        el.removeChild(child);
        continue;
      }
      walk(child);
    } else if (child.nodeType !== 3 && child.nodeType !== 4) {
      // Comments, processing instructions, doctype.
      el.removeChild(child);
    }
  }
}

function parse(source) {
  const Parser = globalThis.DOMParser;
  if (!Parser) throw new Error('sanitize: no DOMParser available');
  const doc = new Parser().parseFromString(source, 'image/svg+xml');
  const root = doc.documentElement;
  if (!root || root.localName !== 'svg' || doc.getElementsByTagName('parsererror').length) {
    throw new SyntaxError('sanitize: markup is not well-formed SVG');
  }
  return root;
}

function serializeChildren(root) {
  const Serializer = globalThis.XMLSerializer;
  const s = new Serializer();
  let out = '';
  for (const child of root.childNodes) out += s.serializeToString(child);
  // Children are re-parsed inside an SVG element, so the repeated default namespace
  // declaration the serializer adds to each of them is noise.
  return out.replace(/ xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '');
}

/**
 * Sanitize the *inner* markup of an SVG (an Iconify icon body).
 * @param {string} body
 * @returns {string} safe inner markup
 * @throws {SyntaxError} if the markup cannot be parsed
 */
export function sanitizeBody(body) {
  const root = parse(`<svg xmlns="${SVG_NS}" xmlns:xlink="http://www.w3.org/1999/xlink">${body}</svg>`);
  walk(root);
  return serializeChildren(root);
}

/**
 * Sanitize a whole SVG document.
 * @param {string} source
 * @returns {{markup: string, body: string, viewBox: number[] | null, width: string | null, height: string | null}}
 */
export function sanitizeDocument(source) {
  const root = parse(source);
  cleanAttributes(root);
  walk(root);
  const vb = (root.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number);
  const body = serializeChildren(root);
  return {
    markup: new globalThis.XMLSerializer().serializeToString(root),
    body,
    viewBox: vb.length === 4 && vb.every(Number.isFinite) ? vb : null,
    width: root.getAttribute('width'),
    height: root.getAttribute('height'),
  };
}

/**
 * Prefix every id defined in a body, and every reference to it, with `ns`. Two different
 * icons routinely both define id="a"; without this they would steal each other's
 * gradients once they share a document.
 * @param {string} body  sanitized markup
 * @param {string} ns    a prefix that is unique to this body's origin
 */
export function namespaceIds(body, ns) {
  const ids = new Set();
  for (const m of body.matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);
  if (ids.size === 0) return body;
  const safeNs = ns.replace(/[^a-zA-Z0-9_-]/g, '-');
  const rename = (id) => (ids.has(id) ? `${safeNs}-${id}` : id);
  return body
    .replace(/\sid="([^"]+)"/g, (_, id) => ` id="${rename(id)}"`)
    .replace(/url\(\s*(['"]?)#([^)'"]+)\1\s*\)/g, (_, q, id) => `url(#${rename(id)})`)
    .replace(/((?:xlink:)?href)="#([^"]+)"/g, (_, attr, id) => `${attr}="#${rename(id)}"`);
}
