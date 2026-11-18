// XML parsing host — browser. Selected by the `#svg-host` subpath import in package.json
// (condition `browser`), so a browser bundle never pulls jsdom in.
//
// The native DOMParser does not throw on malformed input; it returns a document whose
// root is a `<parsererror>` element (in the XHTML namespace). We detect that and throw,
// so both hosts fail the same way.

export const HOST = 'DOMParser';

const XHTML = 'http://www.w3.org/1999/xhtml';

/**
 * Parse XML source into a Document.
 * @param {string} source
 * @returns {Document}
 * @throws {SyntaxError} on malformed XML
 */
export function parseXMLDocument(source) {
  const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
  const err = doc.getElementsByTagNameNS(XHTML, 'parsererror')[0];
  if (err) {
    throw new SyntaxError(`svg: XML parse error — ${err.textContent.trim()}`);
  }
  return doc;
}
