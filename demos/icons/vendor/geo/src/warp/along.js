// F19 — pattern along a path (R3) and endpoint handling (R4).
//
// The pipeline is deliberately made of pieces that already exist:
//
//   pattern → flatten (F3) → place copies in stroke space → map (R1/R2) → refit (F20)
//
// Flattening first is what makes corner insertion possible at all: a corner contributes
// *extra points* between two samples, so the thing being mapped has to be a point sequence,
// not a control polygon. Mapping control points directly would be cheaper and wrong — the
// map is nonlinear, so a cubic's image is not a cubic.
//
// Refitting last is `adjustResolution` at `resolution: 0`, which is exactly the operation
// F20 built: it collapses the flattening back into as few cubics as the tolerance allows
// **and** preserves corners, so the fans inserted at spine corners survive the round trip
// rather than being smoothed away. That is why this phase went after F20 rather than before.

import { path, subpath, pathBoundingBox } from '../core/path.js';
import { line } from '../core/segment.js';
import { linearizePath } from '../core/linearize.js';
import { adjustResolution, CORNER_ANGLE } from '../core/clean.js';
import { union, simplify } from '../core/boolean.js';
import { FLATNESS, EPS, EPS_COINCIDENT } from '../core/tolerance.js';
import { strokeSpace } from './strokespace.js';

const FIT_MODES = ['single', 'stretch', 'repeat', 'repeat-fit'];
const ENDPOINT_MODES = ['clip', 'extend', 'shrink-to-fit', 'overhang'];
const ALIGNMENTS = ['start', 'center', 'end'];

/**
 * Bend a pattern along a spine.
 *
 * The pattern lives in its own space: **x runs along** the spine and **y runs across** it,
 * with `y = 0` landing on the spine itself. Its bounding box sets the natural width, so a
 * pattern drawn anywhere in the plane places the same way.
 *
 * @param {object} pattern  Path to repeat
 * @param {object} spine    Path to bend it along
 * @param {object} [opts]
 * @param {'single'|'stretch'|'repeat'|'repeat-fit'} [opts.fit='repeat']
 * @param {'clip'|'extend'|'shrink-to-fit'|'overhang'} [opts.endpoints='shrink-to-fit']
 * @param {'start'|'center'|'end'} [opts.align='start']  where slack goes
 * @param {number} [opts.spacing=0]   gap between copies, in spine units
 * @param {number} [opts.offset=0]    shift across the spine
 * @param {number} [opts.scaleY=1]    scale across the spine only
 * @param {boolean} [opts.weld=false] union abutting copies into one region
 * @param {number} [opts.tolerance=FLATNESS]
 * @param {'miter'|'round'|'bevel'} [opts.join='round']
 * @returns {object} Path
 */
export function pathAlongPath(pattern, spine, opts = {}) {
  const fit = opts.fit ?? 'repeat';
  if (!FIT_MODES.includes(fit)) throw new TypeError(`pathAlongPath: unknown fit '${fit}'`);
  const align = opts.align ?? 'start';
  if (!ALIGNMENTS.includes(align)) throw new TypeError(`pathAlongPath: unknown align '${align}'`);
  const tolerance = opts.tolerance ?? FLATNESS;
  const spacing = opts.spacing ?? 0;
  const offset = opts.offset ?? 0;
  const scaleY = opts.scaleY ?? 1;

  const box = pathBoundingBox(pattern);
  const naturalW = box ? box.maxX - box.minX : 0;
  if (naturalW <= EPS) throw new RangeError('pathAlongPath: the pattern has no extent along x');

  // A closed spine has no endpoints, so the modes that describe what happens *at* an
  // endpoint have nothing to describe. Fitting an exact number of copies is the only
  // treatment that leaves no seam, and silently doing something else would show up as a
  // visible join in the output.
  const closedSpine = spine.subpaths.some((s) => s.closed && s.segments.length > 0);
  let endpoints = opts.endpoints ?? 'shrink-to-fit';
  if (!ENDPOINT_MODES.includes(endpoints)) {
    throw new TypeError(`pathAlongPath: unknown endpoints '${endpoints}'`);
  }
  if (closedSpine && (endpoints === 'clip' || endpoints === 'overhang')) endpoints = 'shrink-to-fit';

  const space = strokeSpace(spine, {
    join: opts.join ?? 'round',
    miterLimit: opts.miterLimit,
    tolerance,
    extend: endpoints === 'overhang' || endpoints === 'extend',
  });

  const plan = planCopies(naturalW, space.length, { fit, endpoints, align, spacing });
  if (plan.copies.length === 0) return path([]);

  // Flatten **once**: the pattern is the same for every copy, and re-flattening per copy
  // would redo the same subdivision `n` times for nothing.
  const flat = linearizePath(pattern, tolerance);
  const rings = flat.subpaths
    .filter((sp) => sp.segments.length > 0)
    .map((sp) => ({
      closed: sp.closed,
      pts: [
        { x: sp.segments[0].p0.x, y: sp.segments[0].p0.y },
        ...sp.segments.map((sg) => ({ x: sg.p1.x, y: sg.p1.y })),
      ],
    }));

  const out = [];
  for (const copy of plan.copies) {
    for (const ring of rings) {
      // Pattern space → stroke space. x measures from the pattern's own left edge so its
      // placement in the plane does not leak into where the copy lands on the spine.
      const uv = ring.pts.map((p) => ({
        u: copy.u0 + (p.x - box.minX) * copy.sx,
        v: (p.y - plan.vRef) * scaleY + offset,
      }));
      for (const piece of clipToSpine(uv, ring.closed, space.length, endpoints)) {
        const planePts = space.mapPolyline(piece.pts);
        const sp = polylineSubpath(planePts, piece.closed);
        if (sp) out.push(sp);
      }
    }
  }
  if (out.length === 0) return path([]);

  const mapped = adjustResolution(path(out, { fillRule: pattern.fillRule }), {
    resolution: 0,
    tolerance,
    collinearTolerance: tolerance,
    angleTolerance: CORNER_ANGLE,
  });
  return opts.weld ? weldCopies(mapped, tolerance) : mapped;
}

/**
 * How many copies, how wide, and where they start.
 *
 * Kept separate from the mapping because it is pure arithmetic on lengths — it is the part
 * worth reading to understand what a mode does, and the part worth testing without a spine.
 */
export function planCopies(naturalW, spineLen, { fit, endpoints, align, spacing }) {
  const vRef = 0; // pattern y = 0 rides the spine

  if (fit === 'single') {
    const slack = spineLen - naturalW;
    return { vRef, copies: [{ u0: slackOffset(slack, align), sx: 1 }] };
  }
  if (fit === 'stretch') {
    return { vRef, copies: [{ u0: 0, sx: spineLen / naturalW }] };
  }

  const pitch = naturalW + spacing;
  if (pitch <= EPS) throw new RangeError('pathAlongPath: the pattern pitch is zero');
  const exact = (spineLen + spacing) / pitch;

  // `repeat-fit` is the spelling of "repeat, and make it come out even" — the same
  // treatment `shrink-to-fit` applies, named at the level a caller reaches for it.
  const evenly = fit === 'repeat-fit' || endpoints === 'shrink-to-fit' || endpoints === 'extend';

  if (evenly) {
    const n = Math.max(1, Math.round(exact));
    if (endpoints === 'extend' && fit !== 'repeat-fit') {
      // Keep the pattern's own width; grow the gaps until n copies span the spine.
      const gap = n > 1 ? (spineLen - n * naturalW) / (n - 1) : 0;
      return {
        vRef,
        copies: Array.from({ length: n }, (_, i) => ({ u0: i * (naturalW + gap), sx: 1 })),
      };
    }
    // Shrink (or stretch) each copy so n of them plus the gaps land exactly on the end.
    const w = (spineLen - spacing * (n - 1)) / n;
    if (w <= EPS) throw new RangeError('pathAlongPath: spacing leaves no room for the pattern');
    return {
      vRef,
      copies: Array.from({ length: n }, (_, i) => ({ u0: i * (w + spacing), sx: w / naturalW })),
    };
  }

  // `clip` and `overhang` both keep the natural width and let the last copy run past the
  // end; they differ only in what happens to the part that does. The count is how many
  // copies *start* before the end — `exact` counts copies that finish inside it, which
  // places one more that begins exactly at the end and contributes nothing.
  const n = Math.max(1, Math.ceil(spineLen / pitch - EPS));
  const span = n * naturalW + (n - 1) * spacing;
  const start = slackOffset(spineLen - span, align);
  return { vRef, copies: Array.from({ length: n }, (_, i) => ({ u0: start + i * pitch, sx: 1 })) };
}

function slackOffset(slack, align) {
  if (align === 'center') return slack / 2;
  if (align === 'end') return slack;
  return 0;
}

/**
 * Restrict a stroke-space ring to the spine's extent.
 *
 * `u ≤ length` and `u ≥ 0` are **half-planes in stroke space**, which is the whole reason
 * clipping happens here rather than in the plane: a closed pattern can be clipped exactly
 * by Sutherland–Hodgman and stays closed, where clipping the bent image would need a
 * boolean against a curved band.
 */
export function clipToSpine(uv, closed, spineLen, endpoints) {
  if (endpoints !== 'clip') return [{ pts: uv, closed }];
  let pieces = [{ pts: uv, closed }];
  for (const [keepAbove, bound] of [
    [true, 0],
    [false, spineLen],
  ]) {
    const next = [];
    for (const piece of pieces) {
      if (piece.closed) {
        const ring = clipRing(piece.pts, keepAbove, bound);
        if (ring.length >= 3) next.push({ pts: ring, closed: true });
      } else {
        next.push(...clipOpen(piece.pts, keepAbove, bound).map((pts) => ({ pts, closed: false })));
      }
    }
    pieces = next;
  }
  return pieces;
}

const inside = (p, keepAbove, bound) => (keepAbove ? p.u >= bound - EPS : p.u <= bound + EPS);

function crossing(a, b, bound) {
  const f = Math.abs(b.u - a.u) <= EPS ? 0 : (bound - a.u) / (b.u - a.u);
  return { u: bound, v: a.v + (b.v - a.v) * f };
}

// Sutherland–Hodgman against one half-plane; the ring stays closed.
function clipRing(pts, keepAbove, bound) {
  const ring = pts.length > 1 && sameUV(pts[0], pts[pts.length - 1]) ? pts.slice(0, -1) : pts;
  const out = [];
  for (let i = 0; i < ring.length; i++) {
    const cur = ring[i];
    const prev = ring[(i + ring.length - 1) % ring.length];
    const curIn = inside(cur, keepAbove, bound);
    const prevIn = inside(prev, keepAbove, bound);
    if (curIn !== prevIn) out.push(crossing(prev, cur, bound));
    if (curIn) out.push(cur);
  }
  return out;
}

// An open polyline can leave and re-enter, so it clips to *several* pieces.
function clipOpen(pts, keepAbove, bound) {
  const pieces = [];
  let run = [];
  for (let i = 0; i < pts.length; i++) {
    const cur = pts[i];
    const curIn = inside(cur, keepAbove, bound);
    if (i > 0) {
      const prev = pts[i - 1];
      if (inside(prev, keepAbove, bound) !== curIn) {
        const x = crossing(prev, cur, bound);
        if (curIn) run = [x];
        else {
          run.push(x);
          if (run.length >= 2) pieces.push(run);
          run = [];
        }
      }
    }
    if (curIn) run.push(cur);
  }
  if (run.length >= 2) pieces.push(run);
  return pieces;
}

const sameUV = (a, b) => Math.abs(a.u - b.u) <= EPS && Math.abs(a.v - b.v) <= EPS;

function polylineSubpath(pts, closed) {
  const segs = [];
  for (let i = 1; i < pts.length; i++) {
    if (Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) > EPS_COINCIDENT) {
      segs.push(line(pts[i - 1], pts[i]));
    }
  }
  if (closed && segs.length > 0) {
    const first = segs[0].p0;
    const last = segs[segs.length - 1].p1;
    if (Math.hypot(first.x - last.x, first.y - last.y) > EPS_COINCIDENT) segs.push(line(last, first));
  }
  return segs.length > 0 ? subpath(segs, { closed }) : null;
}

/**
 * Union abutting copies into one region.
 *
 * Only meaningful for a closed pattern: union is an operation on areas, and an open
 * subpath does not bound one. Open subpaths are passed through untouched rather than
 * quietly closed, because closing them would invent geometry the caller did not draw.
 */
export function weldCopies(pth, tolerance) {
  const closed = pth.subpaths.filter((sp) => sp.closed && sp.segments.length > 0);
  const open = pth.subpaths.filter((sp) => !sp.closed && sp.segments.length > 0);
  if (closed.length === 0) return pth;
  let acc = path([closed[0]], { fillRule: pth.fillRule });
  for (let i = 1; i < closed.length; i++) {
    acc = union(acc, path([closed[i]], { fillRule: pth.fillRule }), { tolerance });
  }
  acc = simplify(acc);
  return path([...acc.subpaths, ...open], { fillRule: pth.fillRule });
}
