// SVG path data (`d` attribute) parsing and serialization.
//
// I/O layer: strings ↔ Path values. Imports the kernel's constructors but the kernel
// never imports back. Arcs are preserved as true `arc` segments (not flattened).
//
// Round-trip contract: byte-identity is impossible (formatting and command shorthand
// legitimately vary), so round-trip is defined as *geometric stability* — parsing a
// serialized path reproduces a segment-equal Path (within the serializer's precision).
// The canonical serialized string is idempotent: serialize(parse(serialize(parse(d)))) ===
// serialize(parse(d)).

import { vec2 } from '../core/vec2.js';
import { line, quad, cubic, arc, startPoint, LINE, QUAD, CUBIC, ARC } from '../core/segment.js';
import { path } from '../core/path.js';
import { EPS_COINCIDENT } from '../core/tolerance.js';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

const COMMANDS = 'MmLlHhVvCcSsQqTtAaZz';

// Sticky regexes matched at the cursor position (lastIndex).
const SEP = /[\s,]*/y; // whitespace and/or commas act as separators
// number: sign? ( digits ('.' digits?)? | '.' digits ) exponent?
const NUMBER = /[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/y;

function isCommand(ch) {
  return ch !== undefined && COMMANDS.indexOf(ch) !== -1;
}

function skipSep(cur) {
  SEP.lastIndex = cur.i;
  SEP.exec(cur.s); // always matches (possibly empty) with sticky flag
  cur.i = SEP.lastIndex;
}

function readNumber(cur, ctx) {
  skipSep(cur);
  NUMBER.lastIndex = cur.i;
  const m = NUMBER.exec(cur.s);
  if (m === null) {
    throw new SyntaxError(`svg: expected number at index ${cur.i} (${ctx})`);
  }
  cur.i = NUMBER.lastIndex;
  return parseFloat(m[0]);
}

// Arc flags are a single '0' or '1', and may abut the following number with no separator.
function readFlag(cur, ctx) {
  skipSep(cur);
  const c = cur.s[cur.i];
  if (c !== '0' && c !== '1') {
    throw new SyntaxError(`svg: expected arc flag 0/1 at index ${cur.i} (${ctx})`);
  }
  cur.i += 1;
  return c === '1';
}

function readPoint(cur, rel, cx, cy) {
  const x = readNumber(cur, 'x');
  const y = readNumber(cur, 'y');
  return rel ? vec2(cx + x, cy + y) : vec2(x, y);
}

// After a moveto, extra coordinate sets are implicit linetos; other commands repeat as
// themselves. Z cannot be implicitly repeated.
function implicitRepeat(lastCmdChar) {
  if (lastCmdChar === 'M') return 'L';
  if (lastCmdChar === 'm') return 'l';
  if (lastCmdChar === 'Z' || lastCmdChar === 'z') {
    throw new SyntaxError('svg: unexpected number following Z');
  }
  return lastCmdChar;
}

/**
 * Parse an SVG path `d` string into a Path.
 * @param {string} d
 * @returns {{subpaths: object[], fillRule: string}}
 */
export function parsePath(d) {
  const cur = { s: String(d), i: 0 };
  const subpaths = [];
  let segs = [];
  let inSub = false; // is there an open subpath accumulating segments?
  let cx = 0;
  let cy = 0; // current point
  let sx = 0;
  let sy = 0; // current subpath start
  let prevCtrl = null; // last control point, for S/T reflection
  let lastUpper = ''; // normalized previous command letter
  let lastCmdChar = ''; // previous command as written (case preserved)

  const endSub = (closed) => {
    if (segs.length > 0) subpaths.push({ segments: segs, closed });
    segs = [];
    inSub = false;
  };

  // Reopen a subpath after Z (starts again at the current point = subpath start).
  const ensureSub = () => {
    if (!inSub) {
      if (lastCmdChar === '') {
        throw new SyntaxError('svg: path must begin with a moveto (M/m)');
      }
      inSub = true;
    }
  };

  skipSep(cur);
  while (cur.i < cur.s.length) {
    const ch = cur.s[cur.i];
    let cmd;
    if (isCommand(ch)) {
      cmd = ch;
      cur.i += 1;
    } else {
      if (lastCmdChar === '') {
        throw new SyntaxError(`svg: expected command at index ${cur.i}`);
      }
      cmd = implicitRepeat(lastCmdChar);
    }
    const up = cmd.toUpperCase();
    const rel = cmd !== up;

    switch (up) {
      case 'M': {
        endSub(false);
        const p = readPoint(cur, rel, cx, cy);
        cx = p.x; cy = p.y; sx = p.x; sy = p.y;
        inSub = true;
        prevCtrl = null;
        break;
      }
      case 'L': {
        ensureSub();
        const p = readPoint(cur, rel, cx, cy);
        segs.push(line(vec2(cx, cy), p));
        cx = p.x; cy = p.y; prevCtrl = null;
        break;
      }
      case 'H': {
        ensureSub();
        let x = readNumber(cur, 'H.x');
        if (rel) x += cx;
        const p = vec2(x, cy);
        segs.push(line(vec2(cx, cy), p));
        cx = p.x; prevCtrl = null;
        break;
      }
      case 'V': {
        ensureSub();
        let y = readNumber(cur, 'V.y');
        if (rel) y += cy;
        const p = vec2(cx, y);
        segs.push(line(vec2(cx, cy), p));
        cy = p.y; prevCtrl = null;
        break;
      }
      case 'C': {
        ensureSub();
        const c1 = readPoint(cur, rel, cx, cy);
        const c2 = readPoint(cur, rel, cx, cy);
        const p = readPoint(cur, rel, cx, cy);
        segs.push(cubic(vec2(cx, cy), c1, c2, p));
        cx = p.x; cy = p.y; prevCtrl = c2;
        break;
      }
      case 'S': {
        ensureSub();
        const c1 =
          (lastUpper === 'C' || lastUpper === 'S') && prevCtrl
            ? vec2(2 * cx - prevCtrl.x, 2 * cy - prevCtrl.y)
            : vec2(cx, cy);
        const c2 = readPoint(cur, rel, cx, cy);
        const p = readPoint(cur, rel, cx, cy);
        segs.push(cubic(vec2(cx, cy), c1, c2, p));
        cx = p.x; cy = p.y; prevCtrl = c2;
        break;
      }
      case 'Q': {
        ensureSub();
        const c1 = readPoint(cur, rel, cx, cy);
        const p = readPoint(cur, rel, cx, cy);
        segs.push(quad(vec2(cx, cy), c1, p));
        cx = p.x; cy = p.y; prevCtrl = c1;
        break;
      }
      case 'T': {
        ensureSub();
        const c1 =
          (lastUpper === 'Q' || lastUpper === 'T') && prevCtrl
            ? vec2(2 * cx - prevCtrl.x, 2 * cy - prevCtrl.y)
            : vec2(cx, cy);
        const p = readPoint(cur, rel, cx, cy);
        segs.push(quad(vec2(cx, cy), c1, p));
        cx = p.x; cy = p.y; prevCtrl = c1;
        break;
      }
      case 'A': {
        ensureSub();
        const rx = readNumber(cur, 'A.rx');
        const ry = readNumber(cur, 'A.ry');
        const rotDeg = readNumber(cur, 'A.rot');
        const large = readFlag(cur, 'A.largeArc');
        const sweep = readFlag(cur, 'A.sweep');
        const p = readPoint(cur, rel, cx, cy);
        const start = vec2(cx, cy);
        // SVG degenerate rules: a zero-length arc is omitted; a zero radius → lineto.
        if (start.x !== p.x || start.y !== p.y) {
          if (rx === 0 || ry === 0) {
            segs.push(line(start, p));
          } else {
            segs.push(arc(start, p, rx, ry, rotDeg * DEG2RAD, large, sweep));
          }
        }
        cx = p.x; cy = p.y; prevCtrl = null;
        break;
      }
      case 'Z': {
        // The closing chord is *materialized* (Phase 13.5, F21): a closed subpath's
        // segment list forms the whole loop, so `Z`'s straight line becomes a real
        // segment rather than geometry implied by the `closed` flag. A chord shorter
        // than EPS_COINCIDENT is still omitted — the loop already closes.
        if (segs.length > 0 && Math.hypot(cx - sx, cy - sy) > EPS_COINCIDENT) {
          segs.push(line(vec2(cx, cy), vec2(sx, sy)));
        }
        endSub(true);
        cx = sx; cy = sy; prevCtrl = null;
        break;
      }
      default:
        throw new SyntaxError(`svg: unknown command '${cmd}'`);
    }

    lastUpper = up;
    lastCmdChar = cmd;
    skipSep(cur);
  }

  endSub(false); // flush any trailing open subpath
  return path(subpaths);
}

function formatNumber(n, precision) {
  if (!Number.isFinite(n)) {
    throw new RangeError('svg: cannot serialize a non-finite coordinate');
  }
  let s = n.toFixed(precision);
  if (s.indexOf('.') !== -1) {
    s = s.replace(/0+$/, '').replace(/\.$/, '');
  }
  if (s === '-0') s = '0';
  return s;
}

/**
 * Serialize a Path to a canonical SVG `d` string (absolute commands, space-separated).
 * @param {{subpaths: object[]}} pth
 * @param {{precision?: number}} [opts]
 * @returns {string}
 */
export function serializePath(pth, opts = {}) {
  const precision = opts.precision ?? 6;
  const fmt = (n) => formatNumber(n, precision);
  const out = [];

  for (const sp of pth.subpaths) {
    if (!sp.segments.length) continue;
    const start = startPoint(sp.segments[0]);
    out.push(`M ${fmt(start.x)} ${fmt(start.y)}`);

    // `Z` *is* a straight line back to the start, so a closed subpath whose final
    // segment is exactly that chord emits it as `Z` rather than `L … Z`. A closed
    // subpath ending in a curve emits the curve and then `Z` (which closes a
    // zero-length gap). Both forms reparse to the same segments — round-trip stays
    // idempotent, and the canonical string stays the short one.
    const last = sp.segments[sp.segments.length - 1];
    const impliesZ = sp.closed && sp.segments.length > 1 && last.type === LINE;
    const emitted = impliesZ ? sp.segments.slice(0, -1) : sp.segments;

    for (const seg of emitted) {
      switch (seg.type) {
        case LINE:
          out.push(`L ${fmt(seg.p1.x)} ${fmt(seg.p1.y)}`);
          break;
        case QUAD:
          out.push(`Q ${fmt(seg.p1.x)} ${fmt(seg.p1.y)} ${fmt(seg.p2.x)} ${fmt(seg.p2.y)}`);
          break;
        case CUBIC:
          out.push(
            `C ${fmt(seg.p1.x)} ${fmt(seg.p1.y)} ${fmt(seg.p2.x)} ${fmt(seg.p2.y)} ${fmt(seg.p3.x)} ${fmt(seg.p3.y)}`,
          );
          break;
        case ARC:
          out.push(
            `A ${fmt(seg.rx)} ${fmt(seg.ry)} ${fmt(seg.xAxisRotation * RAD2DEG)} ${seg.largeArc ? 1 : 0} ${seg.sweep ? 1 : 0} ${fmt(seg.p1.x)} ${fmt(seg.p1.y)}`,
          );
          break;
        default:
          throw new TypeError(`svg: cannot serialize segment type ${seg && seg.type}`);
      }
    }
    if (sp.closed) out.push('Z');
  }

  return out.join(' ');
}
