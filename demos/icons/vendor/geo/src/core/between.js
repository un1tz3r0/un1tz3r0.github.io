// F8 — the region(s) enclosed between two paths, and the area swept between them.
//
// "Between" means two different things depending on what it is handed, and both are
// wanted:
//
//   * **Open inputs** — the ribbon bounded by the two curves plus a link at each end.
//     This is the swept-region reading: two curves and the strip they enclose.
//   * **Closed inputs** — the region covered by *exactly one* of the two, i.e. `xor`.
//     For one shape nested inside the other that is the annulus between them, which is
//     what "between" means for closed outlines.
//
// Mixing the two is rejected rather than guessed at: a closed shape and an open curve
// have no agreed-upon region between them, and silently closing the open one would
// invent geometry the caller never drew.
//
// Crossing inputs make the ribbon loop cross itself, so the result is run through
// `simplify` (F6): a ribbon between two curves that cross comes back as its separate
// lobes, each correctly oriented, instead of a self-cancelling loop.

import { subpath, path, subpathStart, subpathEnd, reverseSubpath, NONZERO } from './path.js';
import { line } from './segment.js';
import { booleanPath, simplify } from './boolean.js';
import { pathArea } from './area.js';
import { dist } from './vec2.js';
import { EPS_COINCIDENT } from './tolerance.js';

const PAIRINGS = ['auto', 'direct', 'crossed'];

// A subpath contributes geometry (an empty one has no ends to link).
function isDrawn(sp) {
  return sp.segments.length > 0;
}

function classifyPath(pth, which) {
  const drawn = pth.subpaths.filter(isDrawn);
  if (drawn.length === 0) return 'empty';
  const closed = drawn.filter((sp) => sp.closed).length;
  if (closed === 0) return 'open';
  if (closed === drawn.length) return 'closed';
  throw new TypeError(
    `fillBetween: path ${which} mixes open and closed subpaths; split them and combine the results`,
  );
}

/**
 * Link the two open subpaths into one closed loop.
 *
 * The names describe the linking topology, not the outcome. `direct` pairs end with end
 * (walk a forward, hop to b's end, walk b backward, hop back to a's start) — untwisted
 * when the two curves are drawn the same way, a bow-tie when they oppose. `crossed`
 * pairs a's end with b's *start*, which is the untwisted one for opposed curves.
 * `auto` (the default) picks whichever has the shorter total link, which is the
 * untwisted loop in every non-pathological case.
 */
function ribbon(spA, spB, pairing) {
  const aStart = subpathStart(spA);
  const aEnd = subpathEnd(spA);
  const bStart = subpathStart(spB);
  const bEnd = subpathEnd(spB);

  let crossed;
  if (pairing === 'direct') crossed = false;
  else if (pairing === 'crossed') crossed = true;
  else crossed = dist(aEnd, bStart) + dist(bEnd, aStart) < dist(aEnd, bEnd) + dist(bStart, aStart);

  const other = crossed ? spB : reverseSubpath(spB);
  const otherStart = crossed ? bStart : bEnd;
  const otherEnd = crossed ? bEnd : bStart;

  const segments = [...spA.segments];
  if (dist(aEnd, otherStart) > EPS_COINCIDENT) segments.push(line(aEnd, otherStart));
  segments.push(...other.segments);
  if (dist(otherEnd, aStart) > EPS_COINCIDENT) segments.push(line(otherEnd, aStart));
  return subpath(segments, { closed: true });
}

/**
 * The region(s) enclosed between two paths.
 *
 * Open inputs give the ribbon bounded by the two curves and a straight link at each end;
 * subpaths are paired in order, so the two paths must have the same number of drawn
 * subpaths. Closed inputs give the region covered by exactly one of the two (`xor`),
 * which is the annulus when one is nested inside the other. Mixing open and closed
 * inputs throws.
 *
 * @param {object} a  Path
 * @param {object} b  Path
 * @param {{pairing?: 'auto'|'direct'|'crossed', simplify?: boolean}} [opts]
 *   `pairing` selects how the open curves' ends are joined — `'direct'` end-to-end,
 *   `'crossed'` end-to-start, `'auto'` (default) the shorter total link.
 *   `simplify: false` returns the raw loop, self-crossings and all.
 * @returns {object} Path
 */
export function fillBetween(a, b, opts = {}) {
  const pairing = opts.pairing ?? 'auto';
  if (!PAIRINGS.includes(pairing)) {
    throw new TypeError(`fillBetween: pairing must be one of ${PAIRINGS.join(', ')}`);
  }
  const kindA = classifyPath(a, 'a');
  const kindB = classifyPath(b, 'b');
  if (kindA === 'empty' || kindB === 'empty') return path([]);
  if (kindA !== kindB) {
    throw new TypeError(
      `fillBetween: cannot take the region between an ${kindA} path and a ${kindB} one`,
    );
  }

  if (kindA === 'closed') return booleanPath(a, b, 'xor');

  const drawnA = a.subpaths.filter(isDrawn);
  const drawnB = b.subpaths.filter(isDrawn);
  if (drawnA.length !== drawnB.length) {
    throw new TypeError(
      `fillBetween: open inputs are paired subpath by subpath, but a has ${drawnA.length} and b has ${drawnB.length}`,
    );
  }
  const loops = drawnA.map((sp, i) => ribbon(sp, drawnB[i], pairing));
  const raw = path(loops, { fillRule: NONZERO });
  return opts.simplify === false ? raw : simplify(raw);
}

/**
 * The area of the region between two paths — the magnitude of the filled area of
 * `fillBetween`. Curves that cross contribute each lobe positively, because the
 * simplified result carries each lobe with a consistent orientation.
 *
 * @param {object} a  Path
 * @param {object} b  Path
 * @param {{pairing?: 'auto'|'direct'|'crossed'}} [opts]
 * @returns {number}  0 when either path is empty
 */
export function areaBetween(a, b, opts = {}) {
  return Math.abs(pathArea(fillBetween(a, b, opts)));
}
