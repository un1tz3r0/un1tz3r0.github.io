// Subpath and Path constructors.
//
// A Subpath is an ordered list of segments plus a `closed` flag. A Path is a list of
// subpaths plus a fill rule. Fill rule is carried on the Path (SVG semantics); operations
// read it by default and accept a per-call override.
//
// Construction is functional only — these factories return immutable-by-convention plain
// data. There is deliberately no mutable builder: fewer concepts, and a clean port to the
// other target languages.

import { startPoint, endPoint, boundingBox, reverseSegment } from './segment.js';
import { EPS_COINCIDENT } from './tolerance.js';

/** @typedef {'nonzero'|'evenodd'} FillRule */

export const NONZERO = 'nonzero';
export const EVENODD = 'evenodd';

/**
 * Build a subpath from an array of segments.
 * @param {object[]} segments
 * @param {{closed?: boolean}} [opts]
 */
export function subpath(segments, opts = {}) {
  if (!Array.isArray(segments)) {
    throw new TypeError('subpath: segments must be an array');
  }
  const closed = !!opts.closed;
  return { segments: segments.slice(), closed };
}

/**
 * Build a path from an array of subpaths.
 * @param {object[]} subpaths
 * @param {{fillRule?: FillRule}} [opts]
 */
export function path(subpaths, opts = {}) {
  if (!Array.isArray(subpaths)) {
    throw new TypeError('path: subpaths must be an array');
  }
  const fillRule = opts.fillRule ?? NONZERO;
  if (fillRule !== NONZERO && fillRule !== EVENODD) {
    throw new TypeError(`path: fillRule must be '${NONZERO}' or '${EVENODD}'`);
  }
  return { subpaths: subpaths.slice(), fillRule };
}

/** First point of a subpath (start of its first segment), or null if empty. */
export function subpathStart(sp) {
  return sp.segments.length ? startPoint(sp.segments[0]) : null;
}

/** Last point of a subpath (end of its last segment), or null if empty. */
export function subpathEnd(sp) {
  return sp.segments.length ? endPoint(sp.segments[sp.segments.length - 1]) : null;
}

/**
 * Structural problems with a path, as human-readable strings (empty = well formed).
 *
 * Two invariants, both of which used to be unenforced conventions:
 *
 * 1. **Continuity** — consecutive segments meet: `endPoint(seg[i]) == startPoint(seg[i+1])`.
 * 2. **Closure (F21)** — a closed subpath's segments form the *whole* loop, so its last
 *    segment ends where its first begins. There is no implicit closing chord any more:
 *    `Z`'s straight line is materialized at parse time, which is what lets a closing
 *    segment be a curve, carry attributes, or state its own continuity.
 *
 * Deliberately a reporting function rather than a constructor check: `subpath` runs in
 * hot loops (the boolean engine rechains constantly) and the project's stated model is
 * that immutability and well-formedness are documented contracts, not runtime-enforced
 * ones. Tests and debugging call this; production paths do not pay for it.
 *
 * @param {object} pth  Path
 * @returns {string[]}
 */
export function validatePath(pth) {
  const issues = [];
  pth.subpaths.forEach((sp, si) => {
    if (sp.segments.length === 0) return;
    for (let i = 0; i + 1 < sp.segments.length; i++) {
      const a = endPoint(sp.segments[i]);
      const b = startPoint(sp.segments[i + 1]);
      if (Math.hypot(a.x - b.x, a.y - b.y) > EPS_COINCIDENT) {
        issues.push(
          `subpath ${si}: segment ${i} ends at (${a.x}, ${a.y}) but segment ${i + 1} starts at (${b.x}, ${b.y})`,
        );
      }
    }
    if (sp.closed) {
      const s = subpathStart(sp);
      const e = subpathEnd(sp);
      const gap = Math.hypot(e.x - s.x, e.y - s.y);
      if (gap > EPS_COINCIDENT) {
        issues.push(
          `subpath ${si}: closed but its loop is open by ${gap} — a closed subpath's segments must form the whole loop`,
        );
      }
    }
  });
  return issues;
}

/**
 * The same boundary traversed in the opposite direction: segment order and each
 * segment reversed. The closed flag is preserved — since F21 the closing segment is
 * part of the list, so reversal needs no special case for it.
 */
export function reverseSubpath(sp) {
  const segments = sp.segments.map((seg) => reverseSegment(seg)).reverse();
  return subpath(segments, { closed: sp.closed });
}

/**
 * Exact axis-aligned bounding box of a whole path — the union of its segments'
 * exact bounding boxes. Returns null for a path with no segments.
 * @returns {{minX:number,minY:number,maxX:number,maxY:number} | null}
 */
export function pathBoundingBox(pth) {
  let box = null;
  for (const sp of pth.subpaths) {
    for (const seg of sp.segments) {
      const b = boundingBox(seg);
      if (box === null) {
        box = { minX: b.minX, minY: b.minY, maxX: b.maxX, maxY: b.maxY };
      } else {
        box.minX = Math.min(box.minX, b.minX);
        box.minY = Math.min(box.minY, b.minY);
        box.maxX = Math.max(box.maxX, b.maxX);
        box.maxY = Math.max(box.maxY, b.maxY);
      }
    }
  }
  return box;
}
