// Text measurement in the browser.
//
// `core/geometry/bounds.js` cannot measure text on its own; this installs a measurer that
// lays the text out in a hidden SVG and reads its bounding box. Results are cached until
// a font finishes loading (which changes metrics), at which point `invalidate()` clears
// the cache and listeners are told to redraw.

import { setTextMeasurer } from '../core/geometry/bounds.js';
import { fontFamilyCss } from '../core/io/vnode.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
/** @type {Map<string, {x:number,y:number,width:number,height:number}>} */
const cache = new Map();
/** @type {Set<() => void>} */
const listeners = new Set();
let host = null;

function ensureHost() {
  if (host) return host;
  host = document.createElementNS(SVG_NS, 'svg');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:absolute;left:-10000px;top:-10000px;width:10px;height:10px;visibility:hidden;pointer-events:none';
  document.body.append(host);
  return host;
}

function measure(node) {
  const key = JSON.stringify([node.text, node.font, node.size, node.lineHeight, node.letterSpacing, node.align]);
  const hit = cache.get(key);
  if (hit) return hit;
  const svg = ensureHost();
  const text = document.createElementNS(SVG_NS, 'text');
  text.setAttribute('font-family', fontFamilyCss(node.font));
  text.setAttribute('font-size', String(node.size));
  text.setAttribute('font-weight', String(node.font.weight));
  text.setAttribute('font-style', node.font.style);
  if (node.align !== 'start') text.setAttribute('text-anchor', node.align);
  if (node.letterSpacing) text.setAttribute('letter-spacing', String(node.letterSpacing));
  text.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
  String(node.text).split('\n').forEach((line, i) => {
    const tspan = document.createElementNS(SVG_NS, 'tspan');
    tspan.setAttribute('x', '0');
    tspan.setAttribute('y', String(i * node.size * node.lineHeight));
    // An empty line still occupies a line box.
    tspan.textContent = line === '' ? '​' : line;
    text.append(tspan);
  });
  svg.append(text);
  const b = text.getBBox();
  text.remove();
  // Empty text has an empty box; give it a caret-sized one so it can be selected.
  const box = b.width === 0 && b.height === 0
    ? { x: 0, y: -node.size * 0.8, width: node.size * 0.3, height: node.size }
    : { x: b.x, y: b.y, width: b.width, height: b.height };
  if (cache.size > 500) cache.clear();
  cache.set(key, box);
  return box;
}

/** Install the measurer. Call once at start-up. */
export function installTextMeasurer() {
  setTextMeasurer(measure);
  document.fonts?.addEventListener?.('loadingdone', invalidate);
}

/** Forget cached metrics (a font arrived) and notify listeners. */
export function invalidate() {
  cache.clear();
  for (const fn of listeners) fn();
}

/** @param {() => void} fn  called whenever text metrics may have changed */
export function onMetricsChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
