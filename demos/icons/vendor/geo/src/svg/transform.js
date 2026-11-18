// The `transform` attribute: a transform list → one F14 affine.
//
// SVG angles are in *degrees*; the kernel works in radians, so conversion happens here and
// nowhere else. A transform list applies left to right as written — `translate(…) rotate(…)`
// means translate the coordinate system, then rotate it — which is exactly `composeAll`'s
// outermost-first order.

import {
  affine,
  translation,
  scaling,
  rotation,
  skewX,
  skewY,
  composeAll,
  IDENTITY,
} from '../core/affine.js';
import { vec2 } from '../core/vec2.js';
import { parseNumberList } from './units.js';

const DEG2RAD = Math.PI / 180;

const FUNCTION = /([a-zA-Z]+)\s*\(([^)]*)\)/g;

// Argument counts each function accepts; the SVG grammar is strict about these.
const ARITY = {
  matrix: [6],
  translate: [1, 2],
  scale: [1, 2],
  rotate: [1, 3],
  skewX: [1],
  skewY: [1],
};

function build(name, args) {
  switch (name) {
    case 'matrix':
      return affine(args[0], args[1], args[2], args[3], args[4], args[5]);
    case 'translate':
      return translation(args[0], args[1] ?? 0);
    case 'scale':
      return scaling(args[0], args[1] ?? args[0]);
    case 'rotate':
      return args.length === 1
        ? rotation(args[0] * DEG2RAD)
        : rotation(args[0] * DEG2RAD, vec2(args[1], args[2]));
    case 'skewX':
      return skewX(args[0] * DEG2RAD);
    default:
      return skewY(args[0] * DEG2RAD);
  }
}

/**
 * Parse a `transform` attribute into a single affine. An empty or absent value is the
 * identity.
 * @param {string|null|undefined} str
 * @returns {object} affine
 * @throws {SyntaxError} on an unknown function or a wrong argument count
 */
export function parseTransform(str) {
  if (str === null || str === undefined || String(str).trim() === '') return IDENTITY;
  const src = String(str);
  const parts = [];
  let consumed = 0;
  FUNCTION.lastIndex = 0;
  for (let m = FUNCTION.exec(src); m !== null; m = FUNCTION.exec(src)) {
    // Anything between functions must be separators only — catches `translate(1)garbage(2)`
    // by way of the unknown-function check, and stray text by way of this one.
    const gap = src.slice(consumed, m.index);
    if (gap.trim() !== '' && !/^[\s,]*$/.test(gap)) {
      throw new SyntaxError(`svg: unexpected ${JSON.stringify(gap.trim())} in transform`);
    }
    consumed = m.index + m[0].length;

    const name = m[1];
    if (!(name in ARITY)) {
      throw new SyntaxError(`svg: unknown transform function ${JSON.stringify(name)}`);
    }
    const args = parseNumberList(m[2]);
    if (!ARITY[name].includes(args.length)) {
      throw new SyntaxError(
        `svg: ${name}() takes ${ARITY[name].join(' or ')} arguments, got ${args.length}`,
      );
    }
    parts.push(build(name, args));
  }
  const tail = src.slice(consumed);
  if (tail.trim() !== '') {
    throw new SyntaxError(`svg: unexpected ${JSON.stringify(tail.trim())} in transform`);
  }
  if (parts.length === 0) {
    throw new SyntaxError(`svg: not a transform list: ${JSON.stringify(src)}`);
  }
  return composeAll(parts);
}
