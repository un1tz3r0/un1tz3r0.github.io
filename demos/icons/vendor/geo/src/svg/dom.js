// The host boundary for the SVG document layer.
//
// jsdom's nodes *are* DOM nodes — same interface — so the hosts differ only in how a
// document is obtained, and this adapter is deliberately thin rather than a wrapper layer
// re-implementing the DOM. Everything downstream of here reads elements through the
// handful of accessors below, so `src/svg/` never touches a host global directly and the
// two hosts stay interchangeable.
//
// Layering: `src/svg/` may import `core/` and `io/`; nothing may import `src/svg/` except
// `src/index.js`. This is the one part of the library that does not port to the C++/Rust
// targets, and quarantining it is what keeps the kernel portable.

import { parseXMLDocument, HOST } from '#svg-host';

export { HOST };

export const SVG_NS = 'http://www.w3.org/2000/svg';
export const XLINK_NS = 'http://www.w3.org/1999/xlink';

/**
 * Parse SVG source and return its root `<svg>` element.
 * @param {string} source
 * @returns {Element}
 * @throws {SyntaxError} on malformed XML or a root that is not `<svg>`
 */
export function parseSVG(source) {
  const doc = parseXMLDocument(source);
  const root = doc.documentElement;
  if (root === null || localName(root) !== 'svg') {
    throw new SyntaxError(
      `svg: expected a root <svg> element, got <${root === null ? 'nothing' : localName(root)}>`,
    );
  }
  return root;
}

/**
 * The element's local name — the tag without any namespace prefix. SVG is case-sensitive
 * and parsed as XML, so this is *not* lowercased: `linearGradient` stays camel-cased.
 */
export function localName(el) {
  return el.localName;
}

/** Is this element in the SVG namespace? Foreign content (MathML, HTML) is not drawable. */
export function isSVGElement(el) {
  return el.namespaceURI === SVG_NS;
}

/**
 * The element's attributes as a plain object, keyed by qualified name as written
 * (`xlink:href` stays `xlink:href`) — the same form CSS attribute selectors match.
 */
export function attributes(el) {
  const out = {};
  for (const attr of el.attributes) out[attr.name] = attr.value;
  return out;
}

/** Element children only, in document order (text and comment nodes skipped). */
export function childElements(el) {
  return Array.from(el.children);
}

/** Concatenated text content, or '' — used for `<style>` and `<title>`. */
export function textContent(el) {
  return el.textContent ?? '';
}

/**
 * The reference an element points at, as a raw string: SVG 2's `href` if present, else
 * SVG 1.1's `xlink:href`. Returns null when neither is set.
 */
export function hrefOf(el) {
  const href = el.getAttribute('href');
  if (href !== null) return href;
  return el.getAttributeNS(XLINK_NS, 'href') ?? el.getAttribute('xlink:href');
}

/**
 * Resolve a same-document reference (`#id`, or `url(#id)`) to its element, or null.
 * External references are not followed — this library never fetches.
 */
export function resolveRef(el, ref) {
  if (typeof ref !== 'string') return null;
  const m = /^\s*(?:url\(\s*)?#([^)\s]+)\s*\)?\s*$/.exec(ref);
  if (m === null) return null;
  const doc = el.ownerDocument;
  return doc === null ? null : doc.getElementById(m[1]);
}
