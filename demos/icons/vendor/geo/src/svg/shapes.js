// SVG shape elements → Paths.
//
// Arcs stay arcs: a `<circle>` becomes two true semicircular arcs, not a cubic
// approximation, because the kernel preserves true segment types and F5/F7 depend on real
// arc geometry. (That does mean `<circle>` output sits on the worst-conditioned case of
// SVG's endpoint parameterization — the chord equals the diameter — which is a property
// of the representation, documented in DESIGN, not of this conversion.)
//
// Each converted path carries its source element and computed style as `invariant`
// attributes on the **path** domain: the whole path came from one element, so per-segment
// copies would be noise. `invariant` is the honest class — a DOM node and a style map do
// not scale, rotate or flip.

import { localName } from './dom.js';
import { length, parseNumberList } from './units.js';
import { parsePath } from '../io/svg.js';
import { vec2 } from '../core/vec2.js';
import { line, arc } from '../core/segment.js';
import { subpath, path } from '../core/path.js';
import { invariant } from '../core/attributes.js';

// Resolve a length attribute against the instance's viewport.
function len(el, name, ctx, axis, fallback = 0) {
  const raw = el.getAttribute(name);
  if (raw === null || raw.trim() === '') return fallback;
  return length(raw, { viewport: ctx.viewport, axis });
}

// `rect` corner radii, with the spec's auto-correction: one specified implies both, and
// each is clamped to half its side. `auto` and absent both mean "take the other one".
function cornerRadii(el, ctx, w, h) {
  const rawX = el.getAttribute('rx');
  const rawY = el.getAttribute('ry');
  const hasX = rawX !== null && rawX.trim() !== '' && rawX !== 'auto';
  const hasY = rawY !== null && rawY.trim() !== '' && rawY !== 'auto';
  if (!hasX && !hasY) return [0, 0];
  let rx = hasX ? len(el, 'rx', ctx, 'x') : NaN;
  let ry = hasY ? len(el, 'ry', ctx, 'y') : NaN;
  if (!hasX) rx = ry;
  if (!hasY) ry = rx;
  return [Math.min(Math.max(rx, 0), w / 2), Math.min(Math.max(ry, 0), h / 2)];
}

function polylinePoints(el) {
  const nums = parseNumberList(el.getAttribute('points') ?? '');
  const pts = [];
  // An odd trailing coordinate is dropped, per the spec's error handling.
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push(vec2(nums[i], nums[i + 1]));
  return pts;
}

function polylinePath(pts, closed) {
  if (pts.length < 2) return path([]);
  const segs = [];
  for (let i = 0; i + 1 < pts.length; i++) segs.push(line(pts[i], pts[i + 1]));
  if (closed) {
    const first = pts[0];
    const last = pts[pts.length - 1];
    // The loop is materialized (F21); a polygon that already returns to its start needs
    // no extra segment.
    if (first.x !== last.x || first.y !== last.y) segs.push(line(last, first));
  }
  return path([subpath(segs, { closed })]);
}

// An axis-aligned ellipse as two true semicircular/semi-elliptical arcs, drawn in the
// direction SVG conventionally uses (sweep = 1).
function ellipsePath(cx, cy, rx, ry) {
  if (!(rx > 0) || !(ry > 0)) return path([]); // a zero radius disables rendering, per spec
  const right = vec2(cx + rx, cy);
  const left = vec2(cx - rx, cy);
  return path([
    subpath([arc(right, left, rx, ry, 0, false, true), arc(left, right, rx, ry, 0, false, true)], {
      closed: true,
    }),
  ]);
}

function rectPath(x, y, w, h, rx, ry) {
  if (!(w > 0) || !(h > 0)) return path([]); // zero extent disables rendering, per spec
  if (rx === 0 || ry === 0) {
    const a = vec2(x, y);
    const b = vec2(x + w, y);
    const c = vec2(x + w, y + h);
    const d = vec2(x, y + h);
    return path([subpath([line(a, b), line(b, c), line(c, d), line(d, a)], { closed: true })]);
  }
  const segs = [
    line(vec2(x + rx, y), vec2(x + w - rx, y)),
    arc(vec2(x + w - rx, y), vec2(x + w, y + ry), rx, ry, 0, false, true),
    line(vec2(x + w, y + ry), vec2(x + w, y + h - ry)),
    arc(vec2(x + w, y + h - ry), vec2(x + w - rx, y + h), rx, ry, 0, false, true),
    line(vec2(x + w - rx, y + h), vec2(x + rx, y + h)),
    arc(vec2(x + rx, y + h), vec2(x, y + h - ry), rx, ry, 0, false, true),
    line(vec2(x, y + h - ry), vec2(x, y + ry)),
    arc(vec2(x, y + ry), vec2(x + rx, y), rx, ry, 0, false, true),
  ].filter((s) => s.type !== 'line' || s.p0.x !== s.p1.x || s.p0.y !== s.p1.y);
  return path([subpath(segs, { closed: true })]);
}

/**
 * Convert one shape element to a Path in its **own** user units (the instance transform
 * maps it onward; see `toViewBox`).
 *
 * @param {Element} el
 * @param {{viewport?: {width, height}, style?: object}} [ctx]
 * @returns {object} Path — empty (no subpaths) for a shape the spec disables
 * @throws {TypeError} for an element that is not a shape
 */
export function shapeToPath(el, ctx = {}) {
  const c = { viewport: ctx.viewport ?? { width: 0, height: 0 }, ...ctx };
  const tag = localName(el);
  switch (tag) {
    case 'path': {
      const d = el.getAttribute('d');
      return d === null || d.trim() === '' ? path([]) : parsePath(d);
    }
    case 'rect': {
      const w = len(el, 'width', c, 'x');
      const h = len(el, 'height', c, 'y');
      const [rx, ry] = cornerRadii(el, c, w, h);
      return rectPath(len(el, 'x', c, 'x'), len(el, 'y', c, 'y'), w, h, rx, ry);
    }
    case 'circle': {
      const r = len(el, 'r', c, 'other');
      return ellipsePath(len(el, 'cx', c, 'x'), len(el, 'cy', c, 'y'), r, r);
    }
    case 'ellipse': {
      // SVG 2 allows `auto` for one radius, meaning "match the other".
      const rawX = el.getAttribute('rx');
      const rawY = el.getAttribute('ry');
      const autoX = rawX === null || rawX === 'auto';
      const autoY = rawY === null || rawY === 'auto';
      let rx = autoX ? NaN : len(el, 'rx', c, 'x');
      let ry = autoY ? NaN : len(el, 'ry', c, 'y');
      if (autoX) rx = ry;
      if (autoY) ry = rx;
      return ellipsePath(len(el, 'cx', c, 'x'), len(el, 'cy', c, 'y'), rx, ry);
    }
    case 'line': {
      const a = vec2(len(el, 'x1', c, 'x'), len(el, 'y1', c, 'y'));
      const b = vec2(len(el, 'x2', c, 'x'), len(el, 'y2', c, 'y'));
      if (a.x === b.x && a.y === b.y) return path([]);
      return path([subpath([line(a, b)], { closed: false })]);
    }
    case 'polyline':
      return polylinePath(polylinePoints(el), false);
    case 'polygon':
      return polylinePath(polylinePoints(el), true);
    default:
      throw new TypeError(`shapeToPath: <${tag}> is not a shape element`);
  }
}

/**
 * The same, with provenance: the source element and its computed style attached to the
 * path as `invariant` attributes, plus the fill rule taken from the cascade.
 *
 * @param {Element} el
 * @param {object} [ctx]  `{viewport, style}` — typically an instance from `resolveTree`
 * @returns {object} Path
 */
export function shapeToPathWithProvenance(el, ctx = {}) {
  const pth = shapeToPath(el, ctx);
  const style = ctx.style ?? {};
  const rule = style['fill-rule'] === 'evenodd' ? 'evenodd' : 'nonzero';
  const attrs = {
    origin: invariant('svg-shape'),
    element: invariant(el),
    tag: invariant(localName(el)),
    style: invariant(style),
  };
  if (ctx.key !== undefined) attrs.instanceKey = invariant(ctx.key);
  return { ...pth, fillRule: rule, attrs };
}
