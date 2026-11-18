// Linearization — replace curves with polylines, and *say so*.
//
// The output is marked `meta.origin = 'flatten'` on every emitted line. That mark is the
// point of this module existing rather than callers doing their own `flatten` loop: a
// curve that was linearized and then had small fillets applied is locally
// indistinguishable from a chain of designed fillets, so the un-fillet detector (F10)
// needs a way to know which is which wherever we produced the geometry ourselves. The
// mark is advisory — detection must still reach the same answer on unmarked input (see
// DESIGN, "Value types").

import { line, flatten } from './segment.js';
import { withAttrs, invariant, length as lengthAttr, tagOutputAll } from './attributes.js';
import { subpath, path } from './path.js';
import { FLATNESS } from './tolerance.js';

/**
 * Replace every segment of a path with a polyline approximating it to `tolerance`
 * (adaptive subdivision, max chord deviation). Lines pass through unchanged but are
 * still marked, so a run of collinear output reads as one linearized feature.
 *
 * Closed flags and the fill rule are preserved. Segments that flatten to nothing
 * (degenerate) are dropped.
 *
 * @param {object} pth  Path
 * @param {number} [tolerance=FLATNESS]
 * @returns {object} Path whose every segment is a line carrying
 *   `attrs = {origin:'flatten', of: <original type>, tolerance}` (typed, F22)
 */
export function linearizePath(pth, tolerance = FLATNESS, opts = {}) {
  const subpaths = pth.subpaths.map((sp) => {
    const segments = [];
    for (const seg of sp.segments) {
      const pts = flatten(seg, tolerance);
      const attrs = {
        ...(opts.outAttrs ?? {}),
        origin: invariant('flatten'),
        of: invariant(seg.type),
        tolerance: lengthAttr(tolerance),
      };
      for (let i = 0; i + 1 < pts.length; i++) {
        segments.push(withAttrs(line(pts[i], pts[i + 1]), attrs));
      }
    }
    return subpath(segments, { closed: sp.closed });
  });
  return path(subpaths, { fillRule: pth.fillRule });
}
