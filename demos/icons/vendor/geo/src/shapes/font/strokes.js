// F12 — the parametric stroke vocabulary every glyph is written in.
//
// The reason this module exists rather than sixty hand-drawn outlines: an axis change has
// to propagate **by construction**. If `roundingClosed` is wired into `bowl`, then moving
// it re-shapes `o O D b d p q` together and stays coherent; if each glyph drew its own
// curve, moving it would mean editing sixty of them and they would drift apart.
//
// ## Frame
//
// Glyphs are built in the **em frame**: x runs left to right from 0, y runs *up* from the
// baseline at y = 0. Everything is a ratio against a unit advance, so a glyph scales to a
// point size with one multiply. Slant is applied once, at the end, by `applySlant` —
// individual strokes never bake it in, which is what keeps them composable.
//
// ## Centerlines
//
// These return **centerline** geometry, not outlines: a glyph is a path to be stroked
// (and, since F11, un-strokable back to this centerline). That is what makes the whole
// alphabet one weight parameter away from any other.

import { vec2 } from '../../core/vec2.js';
import { line, cubic, arc } from '../../core/segment.js';
import { subpath, path } from '../../core/path.js';
import { slantShear } from './axes.js';

/** Assemble segments into an open subpath, dropping degenerate runs. */
export function open(segments) {
  return subpath(segments.filter(Boolean), { closed: false });
}

/** Assemble segments into a closed subpath (the loop must already close — F21). */
export function closed(segments) {
  return subpath(segments.filter(Boolean), { closed: true });
}

/** A Path from a list of subpaths. */
export function glyphPath(subpaths) {
  return path(subpaths.filter((sp) => sp && sp.segments.length));
}

/**
 * Shear a glyph for the slant axis. Applied once, at the end — a stroke that baked slant
 * in could not be reused by a glyph that needed it upright.
 */
export function applySlant(pth, axes) {
  const k = slantShear(axes);
  if (Math.abs(k) < 1e-12) return pth;
  const m = (p) => vec2(p.x + k * p.y, p.y);
  const mapSeg = (s) => {
    switch (s.type) {
      case 'line':
        return line(m(s.p0), m(s.p1));
      case 'quad':
        return { ...s, p0: m(s.p0), p1: m(s.p1), p2: m(s.p2) };
      case 'cubic':
        return cubic(m(s.p0), m(s.p1), m(s.p2), m(s.p3));
      default:
        // An arc under a shear is an ellipse whose parameters would have to be re-solved.
        // Glyph curves are cubics for exactly this reason; anything else is a bug here.
        throw new TypeError(`applySlant: cannot shear a ${s.type} — glyph curves must be cubics`);
    }
  };
  return path(
    pth.subpaths.map((sp) => subpath(sp.segments.map(mapSeg), { closed: sp.closed })),
    { fillRule: pth.fillRule },
  );
}

// The Bézier constant for a quarter turn: a cubic with handles of this fraction of the
// radius matches a circular quadrant to ~0.02%.
const KAPPA = 0.5522847498307936;

/**
 * A corner between two axis-aligned runs, as a cubic.
 *
 * `rounding` blends between a square corner (0) and a full quarter-ellipse (1);
 * `sharpness` pulls the handles back toward the corner point, tightening the curve into
 * the corner without squaring it off. The two are separate axes because type designers
 * change them independently — a `D` can be fully round on the right and crisp at the
 * left corners.
 */
export function cornerCurve(from, corner, to, rounding, sharpness) {
  const r = Math.max(0, Math.min(1, rounding));
  const sh = Math.max(0, Math.min(1, sharpness));
  // Handle length as a fraction of the run to the corner point: κ reproduces a circular
  // quadrant, and 1 puts the handles *on* the corner, which is the square corner in the
  // limit. Sharpness interpolates between the two — so it tightens the curve into the
  // corner rather than flattening it toward the chord.
  const k = r * (KAPPA + (1 - KAPPA) * sh);
  return cubic(
    from,
    vec2(from.x + (corner.x - from.x) * k, from.y + (corner.y - from.y) * k),
    vec2(to.x + (corner.x - to.x) * k, to.y + (corner.y - to.y) * k),
    to,
  );
}

/** A vertical stem from `yBottom` to `yTop` at `x`. */
export function stem(x, yBottom, yTop) {
  return line(vec2(x, yBottom), vec2(x, yTop));
}

/** A horizontal crossbar at `y` from `x0` to `x1`. */
export function crossbar(x0, x1, y) {
  return line(vec2(x0, y), vec2(x1, y));
}

/**
 * A horizontal arm with an optionally cut terminal — the free end rises or falls by the
 * `terminalCut` angle, which is what gives `E`, `F`, `T` and `L` their finish.
 */
export function arm(x0, x1, y, axes, { cutEnd = true } = {}) {
  const t = ((axes?.terminalCut ?? 0) * Math.PI) / 180;
  if (!cutEnd || Math.abs(t) < 1e-9) return crossbar(x0, x1, y);
  const dx = x1 - x0;
  return line(vec2(x0, y), vec2(x1, y + Math.tan(t) * Math.abs(dx) * 0.35));
}

/** A straight diagonal — `A`, `V`, `W`, `X`, `K`, `Z`. */
export function diagonal(from, to) {
  return line(from, to);
}

/**
 * A closed rounded form spanning `[x0,x1] × [y0,y1]`: the shape behind `O`, `o`, `D` and
 * the bowls of `b d p q`.
 *
 * `rounding` runs from a rectangle (0) to a full ellipse (1). `corners` selects which of
 * the four corners are rounded, which is how `D` gets square corners on its stem side
 * while staying round on the other — the same construction, one flag different.
 *
 * @param {{corners?:{tl?:boolean,tr?:boolean,br?:boolean,bl?:boolean}}} [opts]
 */
export function roundedForm(x0, y0, x1, y1, rounding, sharpness, opts = {}) {
  const r = Math.max(0, Math.min(1, rounding));
  const c = { tl: true, tr: true, br: true, bl: true, ...(opts.corners ?? {}) };
  const w = (x1 - x0) / 2;
  const h = (y1 - y0) / 2;
  const rx = w * r;
  const ry = h * r;

  // Where each straight run starts and stops, given which corners are rounded.
  const L = x0;
  const R = x1;
  const B = y0;
  const T = y1;
  const segs = [];
  const p = (x, y) => vec2(x, y);

  const xTL = c.tl ? L + rx : L;
  const xTR = c.tr ? R - rx : R;
  const xBL = c.bl ? L + rx : L;
  const xBR = c.br ? R - rx : R;
  const yTL = c.tl ? T - ry : T;
  const yTR = c.tr ? T - ry : T;
  const yBL = c.bl ? B + ry : B;
  const yBR = c.br ? B + ry : B;

  // Anti-clockwise from the left edge's bottom: up the left, across the top, and so on.
  segs.push(line(p(L, yBL), p(L, yTL)));
  if (c.tl) segs.push(cornerCurve(p(L, yTL), p(L, T), p(xTL, T), r, sharpness));
  segs.push(line(p(xTL, T), p(xTR, T)));
  if (c.tr) segs.push(cornerCurve(p(xTR, T), p(R, T), p(R, yTR), r, sharpness));
  segs.push(line(p(R, yTR), p(R, yBR)));
  if (c.br) segs.push(cornerCurve(p(R, yBR), p(R, B), p(xBR, B), r, sharpness));
  segs.push(line(p(xBR, B), p(xBL, B)));
  if (c.bl) segs.push(cornerCurve(p(xBL, B), p(L, B), p(L, yBL), r, sharpness));

  // Drop the zero-length straights a full rounding leaves behind.
  return closed(segs.filter((s) => s.type !== 'line' || dist2(s.p0, s.p1) > 1e-18));
}

function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/**
 * An **open** curve — the `C G S c e` family. Spans the box, but leaves a gap of
 * `openFraction` of the perimeter centred on `openAt` (an angle in radians, 0 = +x).
 *
 * Built by walking the same rounded form and dropping the run inside the gap, so an open
 * `C` and a closed `O` share their shape and respond to `roundingOpen`/`roundingClosed`
 * the same way.
 */
export function openForm(x0, y0, x1, y1, rounding, sharpness, openAt, openFraction) {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const rx = (x1 - x0) / 2;
  const ry = (y1 - y0) / 2;
  const half = Math.max(0, Math.min(0.49, openFraction)) * Math.PI;
  const start = openAt + half;
  const sweep = 2 * Math.PI - 2 * half;

  // Four-ish cubic arcs over the remaining sweep, each ≤ 90° so the κ approximation holds.
  const n = Math.max(2, Math.ceil(sweep / (Math.PI / 2)));
  const step = sweep / n;
  const r = Math.max(0, Math.min(1, rounding));
  const sh = Math.max(0, Math.min(1, sharpness));
  const k = ((KAPPA * step) / (Math.PI / 2)) * (1 + 0.5 * sh);
  const at = (a) => vec2(cx + rx * Math.cos(a) * lerp1(r, a, 'x'), cy + ry * Math.sin(a) * lerp1(r, a, 'y'));
  const dAt = (a) => vec2(-rx * Math.sin(a), ry * Math.cos(a));

  const segs = [];
  for (let i = 0; i < n; i++) {
    const a0 = start + step * i;
    const a1 = a0 + step;
    const p0 = at(a0);
    const p1 = at(a1);
    const d0 = dAt(a0);
    const d1 = dAt(a1);
    segs.push(
      cubic(
        p0,
        vec2(p0.x + d0.x * k, p0.y + d0.y * k),
        vec2(p1.x - d1.x * k, p1.y - d1.y * k),
        p1,
      ),
    );
  }
  return open(segs);
}

// Blend a point between the ellipse (rounding 1) and the enclosing rectangle (rounding 0),
// so `openForm` responds to rounding the way `roundedForm` does.
function lerp1(r, a, axis) {
  const c = axis === 'x' ? Math.cos(a) : Math.sin(a);
  if (Math.abs(c) < 1e-12) return 1;
  const square = 1 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
  return r + (1 - r) * square;
}

/**
 * A **bowl**: the open curve that leaves a stem, bulges out to `xExtent`, and returns to
 * the stem — `B P R D b d p q`, and the halves of `O`.
 *
 * `side` is `1` to bulge right (the usual) or `-1` to bulge left, so `d` and `b` are the
 * same construction mirrored rather than two drawings. Built with the same straight-run +
 * corner-curve skeleton as `roundedForm`, so `rounding` behaves identically in both:
 * a bowl and a closed `O` respond to the axis the same way, which is the coherence the
 * shared-axis model is for.
 *
 * @returns {object} an open Subpath from `(xStem, yTop)` to `(xStem, yBottom)`
 */
export function bowl(xStem, yTop, yBottom, xExtent, rounding, sharpness, side = 1) {
  const r = Math.max(0, Math.min(1, rounding));
  const reach = (xExtent - xStem) * side;
  const rx = Math.abs(reach) * r * side;
  const ry = ((yTop - yBottom) / 2) * r;
  const xOut = xStem + reach * side;
  const segs = [];
  const p = (x, y) => vec2(x, y);
  segs.push(line(p(xStem, yTop), p(xOut - rx, yTop)));
  if (r > 0) segs.push(cornerCurve(p(xOut - rx, yTop), p(xOut, yTop), p(xOut, yTop - ry), r, sharpness));
  segs.push(line(p(xOut, yTop - ry), p(xOut, yBottom + ry)));
  if (r > 0) segs.push(cornerCurve(p(xOut, yBottom + ry), p(xOut, yBottom), p(xOut - rx, yBottom), r, sharpness));
  segs.push(line(p(xOut - rx, yBottom), p(xStem, yBottom)));
  return open(segs.filter((sg) => sg.type !== 'line' || dist2(sg.p0, sg.p1) > 1e-18));
}

/**
 * A shoulder: the arch that leaves a stem and lands on another — `n m h r u`.
 * `rise` is how far above `yJoin` the arch crests, as a fraction of its width.
 */
export function shoulder(xFrom, xTo, yJoin, yTop, rounding) {
  const r = Math.max(0, Math.min(1, rounding));
  const k = KAPPA * r;
  const dx = xTo - xFrom;
  return [
    cubic(
      vec2(xFrom, yJoin),
      vec2(xFrom, yJoin + (yTop - yJoin) * (0.55 + 0.45 * r)),
      vec2(xFrom + dx * (0.5 - 0.5 * k), yTop),
      vec2(xFrom + dx * 0.5, yTop),
    ),
    cubic(
      vec2(xFrom + dx * 0.5, yTop),
      vec2(xFrom + dx * (0.5 + 0.5 * k), yTop),
      vec2(xTo, yJoin + (yTop - yJoin) * (0.55 + 0.45 * r)),
      vec2(xTo, yJoin),
    ),
  ];
}

/**
 * A tail: a curve leaving `from` and sweeping by `(dx, dy)` — `Q j y g J`.
 * `curl` bends it; 0 is a straight run.
 */
export function tail(from, dx, dy, curl = 0.6) {
  const c = Math.max(0, Math.min(1, curl));
  return cubic(
    from,
    vec2(from.x, from.y + dy * (0.5 + 0.5 * c)),
    vec2(from.x + dx * (1 - c), from.y + dy),
    vec2(from.x + dx, from.y + dy),
  );
}

/** A dot — `i j` and the punctuation family. A small closed round form. */
export function dot(cx, cy, r) {
  return roundedForm(cx - r, cy - r, cx + r, cy + r, 1, 0);
}

/**
 * The `S` spine: a double curve through a waist, open at both terminals.
 *
 * Shared by `S`, `s`, `5`, `2` and `3` rather than redrawn per glyph, so the waist axis
 * moves them together — which is the whole reason `topProportion` is a *shared* axis.
 *
 * @param {number} midY  the waist height (from `waist()`, so the axis lands here)
 */
export function sSpine(yTop, yBot, xL, xR, midY, rounding, sharpness) {
  const r = Math.max(0.15, Math.min(1, rounding));
  const sh = Math.max(0, Math.min(1, sharpness));
  // Sharpness holds the curve straight for longer before it turns, so the transition into
  // the waist tightens instead of easing — the same meaning the axis has in `cornerCurve`.
  const k = 0.55 * r * (1 + 0.45 * sh);
  const turn = 0.62 - 0.2 * sh;
  const ease = 0.1 + 0.25 * sh;
  const w = xR - xL;
  const upper = yTop - midY;
  const lower = midY - yBot;
  return [
    cubic(vec2(xR, yTop - upper * 0.15), vec2(xR, yTop), vec2(xL, yTop), vec2(xL, yTop - upper * turn)),
    cubic(vec2(xL, yTop - upper * turn), vec2(xL, midY + upper * ease), vec2(xL + w * (1 - k), midY), vec2(xL + w * 0.5, midY)),
    cubic(vec2(xL + w * 0.5, midY), vec2(xR - w * (1 - k), midY), vec2(xR, midY - lower * ease), vec2(xR, yBot + lower * turn)),
    cubic(vec2(xR, yBot + lower * turn), vec2(xR, yBot), vec2(xL, yBot), vec2(xL, yBot + lower * 0.15)),
  ];
}

/**
 * A serif bracket at the end of a stem: a short crossbar centred on `x`, present only
 * when the `serif` axis is above zero. Returned as its own subpath so a glyph can add
 * serifs without disturbing its skeleton.
 */
export function serifBar(x, y, axes, widthScale = 1) {
  const s = axes?.serif ?? 0;
  if (s <= 1e-9) return null;
  const half = (axes.serifSize ?? 0.12) * widthScale * s * 0.5;
  if (half <= 1e-9) return null;
  return open([crossbar(x - half, x + half, y)]);
}
