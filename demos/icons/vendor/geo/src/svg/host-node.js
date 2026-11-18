// XML parsing host — Node. Selected by the `#svg-host` subpath import in package.json
// (condition `default`); the browser build gets `host-browser.js` instead.
//
// jsdom is imported statically so parsing stays synchronous, which the rest of the
// library requires: a dynamic import would make every caller async, and nothing else here
// returns a promise.

import { JSDOM } from 'jsdom';

export const HOST = 'jsdom';

/**
 * Parse XML source into a Document.
 * @param {string} source
 * @returns {Document}
 * @throws {SyntaxError} on malformed XML
 */
export function parseXMLDocument(source) {
  let dom;
  try {
    dom = new JSDOM(source, { contentType: 'image/svg+xml' });
  } catch (err) {
    throw new SyntaxError(`svg: XML parse error — ${err.message}`);
  }
  return dom.window.document;
}
