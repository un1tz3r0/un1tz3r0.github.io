// Virtual SVG tree → live DOM.
//
// A small keyed diff. Because `core/io/vnode.js` memoizes per document node, an unchanged
// subtree arrives as the very same vnode object and is skipped with one identity check;
// a one-property edit therefore touches one attribute.

const SVG_NS = 'http://www.w3.org/2000/svg';
const XML_NS = 'http://www.w3.org/XML/1998/namespace';

/** @typedef {import('../core/io/vnode.js').VNode} VNode */

/** @type {WeakMap<Element, VNode>} */
const rendered = new WeakMap();

function setAttr(el, name, value) {
  if (name === 'xml:space') el.setAttributeNS(XML_NS, name, value);
  else el.setAttribute(name, value);
}

function create(v) {
  const el = document.createElementNS(SVG_NS, v.tag);
  for (const [name, value] of Object.entries(v.attrs)) {
    if (value !== undefined && value !== null) setAttr(el, name, value);
  }
  if (v.html !== undefined) el.innerHTML = v.html;
  else if (v.text !== undefined) el.textContent = v.text;
  else if (v.children) for (const child of v.children) el.append(create(child));
  rendered.set(el, v);
  return el;
}

function update(el, prev, next) {
  if (prev === next) return;
  for (const name of Object.keys(prev.attrs)) {
    if (!(name in next.attrs) || next.attrs[name] === undefined || next.attrs[name] === null) el.removeAttribute(name);
  }
  for (const [name, value] of Object.entries(next.attrs)) {
    if (value !== undefined && value !== null && prev.attrs[name] !== value) setAttr(el, name, value);
  }
  if (next.html !== undefined) {
    if (prev.html !== next.html) el.innerHTML = next.html;
  } else if (next.text !== undefined) {
    if (prev.text !== next.text) el.textContent = next.text;
  } else {
    patchChildren(el, next.children ?? []);
  }
  rendered.set(el, next);
}

/**
 * Make `parent`'s element children match `vnodes`, reusing elements by key.
 * @param {Element} parent
 * @param {VNode[]} vnodes
 */
export function patchChildren(parent, vnodes) {
  /** @type {Map<string, Element>} */
  const byKey = new Map();
  for (const el of [...parent.children]) {
    const v = rendered.get(el);
    if (v?.key !== undefined) byKey.set(`${v.tag}:${v.key}`, el);
    else el.remove();
  }
  let cursor = parent.firstElementChild;
  for (const v of vnodes) {
    const id = `${v.tag}:${v.key}`;
    let el = byKey.get(id);
    if (el) {
      byKey.delete(id);
      update(el, rendered.get(el), v);
    } else {
      el = create(v);
    }
    if (el === cursor) cursor = cursor.nextElementSibling;
    else parent.insertBefore(el, cursor);
  }
  for (const el of byKey.values()) el.remove();
}
