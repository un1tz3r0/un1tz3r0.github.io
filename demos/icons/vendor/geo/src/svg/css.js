// The CSS cascade, as a declared subset.
//
// Scope (decided 2026-08-05, per user): `<style>` rules with type / class / id /
// universal / descendant / child / grouping / attribute selectors, correct specificity
// ordering, `!important`, presentation attributes at specificity zero, inline `style`
// above all rules, and per-property inheritance.
//
// **Not** implemented, and refused rather than silently ignored where it would change the
// answer: media queries, `@import`, pseudo-classes, pseudo-elements, sibling combinators,
// custom properties. Stating the subset is the point — a cascade that quietly drops a
// rule it does not understand produces geometry that is wrong in a way nobody can see.
//
// The cascade order, lowest to highest, follows CSS 2.1 §6.4.1 with SVG's presentation
// attributes slotted in as the spec requires:
//
//   1. presentation attributes        (specificity 0, before any author rule)
//   2. author rules                   (by specificity, then document order)
//   3. inline `style` attribute
//   4. `!important` declarations      (same order, inverted precedence)

import { localName, attributes } from './dom.js';

// SVG properties that inherit. Everything else resets to its initial value on each
// element — notably `opacity`, `transform`, `filter`, `clip-path`, `mask`, which are
// composited per element and would compound wrongly if inherited.
export const INHERITED = new Set([
  'clip-rule',
  'color',
  'color-interpolation',
  'cursor',
  'direction',
  'fill',
  'fill-opacity',
  'fill-rule',
  'font',
  'font-family',
  'font-size',
  'font-stretch',
  'font-style',
  'font-variant',
  'font-weight',
  'image-rendering',
  'letter-spacing',
  'marker',
  'marker-end',
  'marker-mid',
  'marker-start',
  'paint-order',
  'pointer-events',
  'shape-rendering',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'text-anchor',
  'text-rendering',
  'visibility',
  'word-spacing',
  'writing-mode',
]);

// Attributes that are *presentation attributes* (styling), not geometry. `x`, `width`,
// `d` and friends are element data and never take part in the cascade.
export const PRESENTATION_ATTRIBUTES = new Set([
  ...INHERITED,
  'clip-path',
  'display',
  'filter',
  'mask',
  'opacity',
  'overflow',
  'stop-color',
  'stop-opacity',
  'transform-origin',
  'vector-effect',
]);

const UNSUPPORTED_AT_RULE = /@(media|import|supports|font-face|keyframes)\b/;

// --- declarations -------------------------------------------------------------------------

/**
 * Parse a declaration block body (`fill: red; stroke-width: 2 !important`).
 * @param {string} text
 * @returns {{prop:string, value:string, important:boolean}[]}
 */
export function parseDeclarations(text) {
  const out = [];
  for (const chunk of String(text).split(';')) {
    const s = chunk.trim();
    if (s === '') continue;
    const colon = s.indexOf(':');
    if (colon === -1) continue; // a malformed declaration is dropped, per CSS error handling
    const prop = s.slice(0, colon).trim().toLowerCase();
    let value = s.slice(colon + 1).trim();
    let important = false;
    const bang = /!\s*important\s*$/i.exec(value);
    if (bang) {
      important = true;
      value = value.slice(0, bang.index).trim();
    }
    if (prop !== '' && value !== '') out.push({ prop, value, important });
  }
  return out;
}

// --- selectors ----------------------------------------------------------------------------

// One compound selector: the parts that must all match a single element.
// `{ tag, id, classes[], attrs[{name, op, value}] }` — `tag` null means universal.
function parseCompound(src) {
  const c = { tag: null, id: null, classes: [], attrs: [] };
  const re = /(^\*)|(^[A-Za-z][\w-]*)|\.([\w-]+)|#([\w-]+)|\[([^\]]*)\]|(::?[\w-]+(\([^)]*\))?)/g;
  let consumed = 0;
  for (let m = re.exec(src); m !== null; m = re.exec(src)) {
    if (m.index !== consumed) break; // a gap means we hit something we do not understand
    consumed = m.index + m[0].length;
    if (m[1]) c.tag = null; // universal
    else if (m[2]) c.tag = m[2];
    else if (m[3]) c.classes.push(m[3]);
    else if (m[4]) c.id = m[4];
    else if (m[5] !== undefined) {
      const am = /^\s*([\w-]+)\s*(?:([~|^$*]?=)\s*(.*?)\s*)?$/.exec(m[5]);
      if (am === null) throw new SyntaxError(`css: unsupported attribute selector [${m[5]}]`);
      const value = am[3] === undefined ? null : am[3].replace(/^["']|["']$/g, '');
      c.attrs.push({ name: am[1], op: am[2] ?? null, value });
    } else if (m[6]) {
      throw new SyntaxError(`css: pseudo-selectors are not supported (${m[6]})`);
    }
  }
  if (consumed !== src.length) {
    throw new SyntaxError(`css: unsupported selector syntax ${JSON.stringify(src)}`);
  }
  return c;
}

/**
 * Parse one complex selector into compounds plus the combinator preceding each.
 * @param {string} src
 * @returns {{compound:object, combinator:(' '|'>'|null)}[]}
 */
export function parseSelector(src) {
  const text = String(src).trim();
  if (text === '') throw new SyntaxError('css: empty selector');
  if (/[~+]/.test(text)) {
    throw new SyntaxError(`css: sibling combinators are not supported (${text})`);
  }
  const parts = [];
  // Split on combinators, keeping them: `a > b c` → a, '>', b, ' ', c
  const tokens = text.split(/\s*(>)\s*|\s+/).filter((t) => t !== undefined && t !== '');
  let combinator = null;
  for (const tok of tokens) {
    if (tok === '>') {
      combinator = '>';
      continue;
    }
    parts.push({ compound: parseCompound(tok), combinator });
    combinator = ' ';
  }
  if (parts.length === 0) throw new SyntaxError(`css: empty selector ${JSON.stringify(src)}`);
  parts[0].combinator = null;
  return parts;
}

/**
 * Selector specificity as `[ids, classes+attrs, types]` — CSS 2.1 §6.4.3, minus the
 * inline-style slot, which the cascade handles separately.
 */
export function specificity(parsed) {
  let a = 0;
  let b = 0;
  let c = 0;
  for (const { compound } of parsed) {
    if (compound.id) a += 1;
    b += compound.classes.length + compound.attrs.length;
    if (compound.tag) c += 1;
  }
  return [a, b, c];
}

function compareSpecificity(x, y) {
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

// --- matching -----------------------------------------------------------------------------

function classesOf(el) {
  const cls = el.getAttribute('class');
  return cls === null ? [] : cls.trim().split(/\s+/).filter(Boolean);
}

function attrMatches(el, spec) {
  const actual = el.getAttribute(spec.name);
  if (actual === null) return false;
  if (spec.op === null) return true;
  switch (spec.op) {
    case '=':
      return actual === spec.value;
    case '~=':
      return actual.trim().split(/\s+/).includes(spec.value);
    case '|=':
      return actual === spec.value || actual.startsWith(`${spec.value}-`);
    case '^=':
      return actual.startsWith(spec.value);
    case '$=':
      return actual.endsWith(spec.value);
    case '*=':
      return actual.includes(spec.value);
    default:
      return false;
  }
}

function compoundMatches(el, c) {
  if (c.tag !== null && localName(el) !== c.tag) return false;
  if (c.id !== null && el.getAttribute('id') !== c.id) return false;
  if (c.classes.length) {
    const have = classesOf(el);
    for (const k of c.classes) if (!have.includes(k)) return false;
  }
  for (const a of c.attrs) if (!attrMatches(el, a)) return false;
  return true;
}

/**
 * Does `el` match the parsed selector, given its ancestor chain (root first)?
 *
 * Matched right to left, which is both the standard implementation strategy and the one
 * that terminates quickly on a non-match.
 *
 * @param {Element} el
 * @param {object[]} parsed  from `parseSelector`
 * @param {Element[]} ancestors  root-first, excluding `el`
 */
export function matches(el, parsed, ancestors) {
  let i = parsed.length - 1;
  if (!compoundMatches(el, parsed[i].compound)) return false;

  let pool = ancestors.slice();
  for (i -= 1; i >= 0; i--) {
    const { compound } = parsed[i];
    const combinator = parsed[i + 1].combinator;
    if (combinator === '>') {
      const parent = pool[pool.length - 1];
      if (parent === undefined || !compoundMatches(parent, compound)) return false;
      pool = pool.slice(0, -1);
    } else {
      // Descendant: walk up until something matches.
      let k = pool.length - 1;
      while (k >= 0 && !compoundMatches(pool[k], compound)) k--;
      if (k < 0) return false;
      pool = pool.slice(0, k);
    }
  }
  return true;
}

// --- stylesheets ---------------------------------------------------------------------------

/**
 * Parse a stylesheet into flat rules, each carrying its parsed selector, specificity and
 * document order.
 *
 * At-rules are **refused**, not skipped: a `@media` block whose declarations we silently
 * dropped would produce plausible, wrong geometry.
 *
 * @param {string} cssText
 * @returns {{selector, specificity, order, declarations}[]}
 */
export function parseStylesheet(cssText) {
  const text = String(cssText).replace(/\/\*[\s\S]*?\*\//g, '');
  if (UNSUPPORTED_AT_RULE.test(text)) {
    const which = UNSUPPORTED_AT_RULE.exec(text)[0];
    throw new SyntaxError(
      `css: ${which} is outside the supported subset — declare the styles inline or ` +
        'flatten the stylesheet before parsing',
    );
  }
  const rules = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let order = 0;
  for (let m = re.exec(text); m !== null; m = re.exec(text)) {
    const declarations = parseDeclarations(m[2]);
    if (declarations.length === 0) continue;
    for (const sel of m[1].split(',')) {
      if (sel.trim() === '') continue;
      const parsed = parseSelector(sel);
      rules.push({ selector: parsed, specificity: specificity(parsed), order, declarations });
      order += 1;
    }
  }
  return rules;
}

// --- the cascade ----------------------------------------------------------------------------

/**
 * Compute an element's own declared style — the cascade *before* inheritance.
 *
 * @param {Element} el
 * @param {Element[]} ancestors  root-first, excluding `el`
 * @param {object[]} rules  from `parseStylesheet`
 * @returns {object} property → value
 */
export function declaredStyle(el, ancestors, rules) {
  // Each entry records what beat what, so the winner is a single sort rather than a
  // sequence of overwrites whose order would be easy to get subtly wrong.
  const candidates = [];
  const push = (prop, value, important, tier, spec, order) =>
    candidates.push({ prop, value, important, tier, spec, order });

  // Tier 0: presentation attributes, specificity zero, before any author rule.
  for (const [name, value] of Object.entries(attributes(el))) {
    const prop = name.toLowerCase();
    if (PRESENTATION_ATTRIBUTES.has(prop)) push(prop, value, false, 0, [0, 0, 0], -1);
  }

  // Tier 1: author rules.
  for (const rule of rules) {
    if (!matches(el, rule.selector, ancestors)) continue;
    for (const d of rule.declarations) {
      push(d.prop, d.value, d.important, 1, rule.specificity, rule.order);
    }
  }

  // Tier 2: the inline style attribute.
  const inline = el.getAttribute('style');
  if (inline !== null) {
    for (const d of parseDeclarations(inline)) {
      push(d.prop, d.value, d.important, 2, [0, 0, 0], Number.MAX_SAFE_INTEGER);
    }
  }

  const out = {};
  const best = new Map();
  for (const c of candidates) {
    const prev = best.get(c.prop);
    if (prev === undefined || beats(c, prev)) best.set(c.prop, c);
  }
  for (const [prop, c] of best) out[prop] = c.value;
  return out;
}

// Cascade comparison: `!important` first, then tier, then specificity, then document order.
function beats(a, b) {
  if (a.important !== b.important) return a.important;
  if (a.tier !== b.tier) return a.tier > b.tier;
  const s = compareSpecificity(a.spec, b.spec);
  if (s !== 0) return s > 0;
  return a.order >= b.order;
}

/**
 * An element's computed style: its own declarations over the inherited ones.
 *
 * `inherit` is honoured explicitly; every other value is taken literally (this layer does
 * not resolve `currentColor`, `var()` or relative units — those need context the caller
 * owns).
 *
 * @param {Element} el
 * @param {Element[]} ancestors  root-first, excluding `el`
 * @param {object[]} rules
 * @param {object} inherited  the parent's computed style
 * @returns {object}
 */
export function computedStyle(el, ancestors, rules, inherited = {}) {
  const own = declaredStyle(el, ancestors, rules);
  const out = {};
  for (const [prop, value] of Object.entries(inherited)) {
    if (INHERITED.has(prop)) out[prop] = value;
  }
  for (const [prop, value] of Object.entries(own)) {
    if (value === 'inherit') {
      if (prop in inherited) out[prop] = inherited[prop];
      else delete out[prop];
    } else {
      out[prop] = value;
    }
  }
  return out;
}
