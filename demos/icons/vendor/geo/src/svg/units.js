// Length parsing and resolution to user units (px).
//
// The absolute units are fixed against the CSS reference pixel: 1in = 96px. That constant
// is a declared assumption, not a measurement — an SVG has no physical size until
// something renders it, and every consumer that needs real millimetres must scale the
// result itself.
//
// Percentages depend on which axis the length lies along, because the spec resolves them
// against different references: horizontal lengths against the viewport width, vertical
// against its height, and everything else (radii, stroke widths, arbitrary lengths)
// against the normalized diagonal √((w² + h²)/2).
//
// Font-relative units (em, ex, ch, rem) need metrics this library does not have. They
// throw unless the caller supplies them, rather than quietly assuming a 16px default and
// producing geometry that is wrong by an unknown factor.

const PX_PER_IN = 96;

const ABSOLUTE = {
  '': 1, // unitless — user units
  px: 1,
  in: PX_PER_IN,
  pt: PX_PER_IN / 72,
  pc: PX_PER_IN / 6,
  mm: PX_PER_IN / 25.4,
  cm: PX_PER_IN / 2.54,
  Q: PX_PER_IN / 25.4 / 4,
};

const FONT_RELATIVE = new Set(['em', 'ex', 'ch', 'rem']);

// number: sign? ( digits ('.' digits?)? | '.' digits ) exponent?   then an optional unit
const LENGTH = /^\s*([+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?)\s*([a-zA-Z%]*)\s*$/;

/**
 * Parse a length into its number and unit. Does not resolve it — a percentage or a
 * font-relative unit has no value without a context.
 * @param {string} str
 * @returns {{value:number, unit:string}}
 * @throws {SyntaxError} on anything that is not a length
 */
export function parseLength(str) {
  const m = LENGTH.exec(String(str));
  if (m === null) throw new SyntaxError(`svg: not a length: ${JSON.stringify(str)}`);
  const unit = m[2] === 'q' ? 'Q' : m[2];
  if (unit !== '%' && !(unit in ABSOLUTE) && !FONT_RELATIVE.has(unit)) {
    throw new SyntaxError(`svg: unknown unit ${JSON.stringify(m[2])} in ${JSON.stringify(str)}`);
  }
  return { value: parseFloat(m[1]), unit };
}

/**
 * Resolve a parsed length to user units.
 *
 * @param {{value:number, unit:string}} len
 * @param {object} [ctx]
 * @param {{width:number, height:number}} [ctx.viewport]  reference for percentages
 * @param {'x'|'y'|'other'} [ctx.axis]  which reference a percentage uses (default 'other')
 * @param {{size?:number, xHeight?:number, chWidth?:number, rootSize?:number}} [ctx.font]
 *        metrics for em/ex/ch/rem; omitted means those units are refused
 * @returns {number}
 */
export function resolveLength(len, ctx = {}) {
  const { value, unit } = len;
  if (unit in ABSOLUTE) return value * ABSOLUTE[unit];

  if (unit === '%') {
    const vp = ctx.viewport;
    if (!vp) {
      throw new RangeError('svg: a percentage length needs ctx.viewport to resolve against');
    }
    const axis = ctx.axis ?? 'other';
    let ref;
    if (axis === 'x') ref = vp.width;
    else if (axis === 'y') ref = vp.height;
    else ref = Math.sqrt((vp.width * vp.width + vp.height * vp.height) / 2);
    return (value / 100) * ref;
  }

  // Font-relative.
  const font = ctx.font ?? {};
  const metric = { em: font.size, ex: font.xHeight, ch: font.chWidth, rem: font.rootSize }[unit];
  if (typeof metric !== 'number') {
    throw new RangeError(
      `svg: the ${unit} unit needs font metrics this library does not have — ` +
        `supply ctx.font.${{ em: 'size', ex: 'xHeight', ch: 'chWidth', rem: 'rootSize' }[unit]}`,
    );
  }
  return value * metric;
}

/**
 * Parse and resolve in one step.
 * @param {string} str
 * @param {object} [ctx]  see `resolveLength`
 * @returns {number}
 */
export function length(str, ctx = {}) {
  return resolveLength(parseLength(str), ctx);
}

/**
 * Parse an SVG number list — the comma-and/or-whitespace separated form used by
 * `viewBox`, `points`, and the transform functions. Leading/trailing separators are
 * tolerated, as SVG requires.
 * @param {string} str
 * @returns {number[]}
 * @throws {SyntaxError} on a non-numeric token
 */
export function parseNumberList(str) {
  const trimmed = String(str).trim();
  if (trimmed === '') return [];
  return trimmed.split(/[\s,]+/).map((tok) => {
    const n = Number(tok);
    if (!Number.isFinite(n)) {
      throw new SyntaxError(`svg: not a number: ${JSON.stringify(tok)} in ${JSON.stringify(str)}`);
    }
    return n;
  });
}
