// F12 — parametric shape constructions.
//
// Pure functions returning Paths. No new kernel concepts: every construction is built from
// the existing constructors, and anything that needs a curve fitted to a tolerance goes
// through F5's `fitCubicChain` rather than a fixed step count — a spiral emitted as "64
// segments" is wrong at some scale, a spiral emitted to a deviation bound is not.
//
// Closed constructions carry their whole loop (F21), so `validatePath` is clean on every
// result and the closing side can be a curve where the shape calls for one.

import { vec2 } from '../core/vec2.js';
import { line, cubic, arc } from '../core/segment.js';
import { subpath, path } from '../core/path.js';
import { fitCubicChain, parameterDeviation } from '../core/fitcurve.js';
import { filletPath } from '../core/corner-ops.js';
import { FLATNESS, EPS } from '../core/tolerance.js';

const TAU = 2 * Math.PI;

// A closed polygon through `pts`, with the closing side materialized.
function polygonPath(pts, fillRule) {
  if (pts.length < 3) return path([]);
  const segs = [];
  for (let i = 0; i < pts.length; i++) segs.push(line(pts[i], pts[(i + 1) % pts.length]));
  return path([subpath(segs, { closed: true })], fillRule ? { fillRule } : {});
}

// An open polyline through `pts`.
function polylinePath(pts) {
  if (pts.length < 2) return path([]);
  const segs = [];
  for (let i = 0; i + 1 < pts.length; i++) segs.push(line(pts[i], pts[i + 1]));
  return path([subpath(segs, { closed: false })]);
}

function requirePositive(v, name) {
  if (!(typeof v === 'number' && Number.isFinite(v) && v > 0)) {
    throw new RangeError(`${name} must be a positive finite number, got ${v}`);
  }
  return v;
}

/**
 * A regular n-gon.
 *
 * `radius` is to the **vertices** (the circumscribed circle) unless `inscribed` is set, in
 * which case it is the apothem — the distance to the edge midpoints. Giving `sideLength`
 * instead solves for the radius. Vertex 0 sits at angle `rotation` (default 0, i.e. +x).
 *
 * @param {number} n  number of sides, ≥ 3
 * @param {{radius?:number, sideLength?:number, rotation?:number, center?:{x,y},
 *          inscribed?:boolean}} [opts]
 * @returns {object} Path
 */
export function regularPolygon(n, opts = {}) {
  if (!Number.isInteger(n) || n < 3) {
    throw new RangeError(`regularPolygon: n must be an integer ≥ 3, got ${n}`);
  }
  const center = opts.center ?? vec2(0, 0);
  const rotation = opts.rotation ?? 0;
  let radius;
  if (opts.sideLength !== undefined) {
    radius = requirePositive(opts.sideLength, 'sideLength') / (2 * Math.sin(Math.PI / n));
  } else {
    radius = requirePositive(opts.radius ?? 1, 'radius');
    if (opts.inscribed) radius /= Math.cos(Math.PI / n); // apothem → circumradius
  }
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = rotation + (TAU * i) / n;
    pts.push(vec2(center.x + radius * Math.cos(a), center.y + radius * Math.sin(a)));
  }
  return polygonPath(pts);
}

/**
 * A star polygon: `points` outer vertices alternating with `points` inner ones.
 * @param {number} points  ≥ 2
 * @param {{outer?:number, inner?:number, rotation?:number, center?:{x,y}}} [opts]
 * @returns {object} Path
 */
export function star(points, opts = {}) {
  if (!Number.isInteger(points) || points < 2) {
    throw new RangeError(`star: points must be an integer ≥ 2, got ${points}`);
  }
  const outer = requirePositive(opts.outer ?? 1, 'outer');
  const inner = requirePositive(opts.inner ?? outer * 0.5, 'inner');
  const center = opts.center ?? vec2(0, 0);
  const rotation = opts.rotation ?? 0;
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rotation + (TAU * i) / (points * 2);
    pts.push(vec2(center.x + r * Math.cos(a), center.y + r * Math.sin(a)));
  }
  return polygonPath(pts);
}

/**
 * A regular polygon with filleted corners — F10's `filletPath` applied to
 * `regularPolygon`, rather than a second derivation of the same tangency solve.
 * @param {number} n
 * @param {{radius?:number, sideLength?:number, rotation?:number, center?:{x,y},
 *          inscribed?:boolean, rounding:number}} opts  `rounding` is the fillet radius
 * @returns {object} Path
 */
export function roundedPolygon(n, opts = {}) {
  const base = regularPolygon(n, opts);
  const r = opts.rounding ?? 0;
  return r > 0 ? filletPath(base, { radius: r, ...(opts.filletOpts ?? {}) }) : base;
}

// --- spiral ---------------------------------------------------------------------------

// Radius at spiral parameter u ∈ [0, 1].
function spiralRadius(u, r0, r1, kind) {
  if (kind === 'logarithmic') return r0 * Math.pow(r1 / r0, u);
  return r0 + (r1 - r0) * u;
}

// A fittable over the spiral's parameter range [u0, u1], for `fitCubicChain`.
function spiralFittable(u0, u1, spec) {
  const { r0, r1, kind, turns, direction, center } = spec;
  const at = (u) => {
    const r = spiralRadius(u, r0, r1, kind);
    const a = direction * TAU * turns * u + spec.rotation;
    return { r, a, p: vec2(center.x + r * Math.cos(a), center.y + r * Math.sin(a)) };
  };
  const point = (t) => at(u0 + (u1 - u0) * t).p;
  const tangent = (t) => {
    const u = u0 + (u1 - u0) * t;
    const { r, a } = at(u);
    // dr/du for each family, then the polar velocity (r' cos a − r a' sin a, …).
    const dr = kind === 'logarithmic' ? r * Math.log(r1 / r0) : r1 - r0;
    const da = direction * TAU * turns;
    const vx = dr * Math.cos(a) - r * da * Math.sin(a);
    const vy = dr * Math.sin(a) + r * da * Math.cos(a);
    const l = Math.hypot(vx, vy);
    return l <= EPS ? vec2(1, 0) : vec2(vx / l, vy / l);
  };
  const self = {
    point,
    tangent,
    error: (candidate) => parameterDeviation(candidate, { point }),
    split: () => {
      const um = (u0 + u1) / 2;
      return [spiralFittable(u0, um, spec), spiralFittable(um, u1, spec)];
    },
  };
  return self;
}

/**
 * A spiral, emitted as a cubic chain fitted to a deviation tolerance.
 *
 * `kind` is `'archimedean'` (radius linear in angle) or `'logarithmic'` (radius
 * geometric in angle — the equiangular spiral, which needs both radii strictly positive).
 * `direction` is `1` for counter-clockwise, `-1` for clockwise.
 *
 * Deliberately not a fixed step count: the subdivision runs until the sampled deviation
 * from the true spiral is within `tolerance`, so the result is right at any scale.
 *
 * @param {{turns?:number, r0?:number, r1?:number, kind?:string, direction?:1|-1,
 *          center?:{x,y}, rotation?:number, tolerance?:number}} [opts]
 * @returns {object} Path — open
 */
export function spiral(opts = {}) {
  const turns = requirePositive(opts.turns ?? 2, 'turns');
  const kind = opts.kind ?? 'archimedean';
  if (kind !== 'archimedean' && kind !== 'logarithmic') {
    throw new TypeError(`spiral: kind must be 'archimedean' or 'logarithmic', got ${kind}`);
  }
  const r0 = opts.r0 ?? 0;
  const r1 = requirePositive(opts.r1 ?? 1, 'r1');
  if (kind === 'logarithmic' && !(r0 > 0)) {
    throw new RangeError('spiral: a logarithmic spiral needs r0 > 0 (it never reaches the centre)');
  }
  if (r0 < 0) throw new RangeError(`spiral: r0 must be ≥ 0, got ${r0}`);
  const spec = {
    r0,
    r1,
    kind,
    turns,
    direction: opts.direction === -1 ? -1 : 1,
    center: opts.center ?? vec2(0, 0),
    rotation: opts.rotation ?? 0,
  };
  const segs = fitCubicChain(spiralFittable(0, 1, spec), {
    tolerance: opts.tolerance ?? FLATNESS,
  });
  return path([subpath(segs, { closed: false })]);
}

// --- marks and symbols --------------------------------------------------------------------

/**
 * A cross / plus sign as a filled outline: `arms` arms of `length` and `thickness`,
 * radiating from `center`. Four arms is a plus; `rounding` fillets every corner.
 * @param {{arms?:number, length?:number, thickness?:number, rounding?:number,
 *          center?:{x,y}, rotation?:number}} [opts]
 * @returns {object} Path
 */
export function cross(opts = {}) {
  const arms = opts.arms ?? 4;
  if (!Number.isInteger(arms) || arms < 2) {
    throw new RangeError(`cross: arms must be an integer ≥ 2, got ${arms}`);
  }
  const length = requirePositive(opts.length ?? 1, 'length');
  const half = requirePositive(opts.thickness ?? 0.3, 'thickness') / 2;
  const center = opts.center ?? vec2(0, 0);
  const rotation = opts.rotation ?? 0;
  const step = TAU / arms;
  if (half >= length) throw new RangeError('cross: thickness/2 must be less than length');

  // Walk each arm: up one side, across the tip, down the other, then into the next arm.
  const pts = [];
  for (let i = 0; i < arms; i++) {
    const a = rotation + step * i;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const px = -uy;
    const py = ux;
    const at = (along, across) =>
      vec2(center.x + ux * along + px * across, center.y + uy * along + py * across);
    // The inner corner where this arm meets the next, on the shared bisector.
    const inner = half / Math.tan(step / 2);
    pts.push(at(inner, -half));
    pts.push(at(length, -half));
    pts.push(at(length, half));
    pts.push(at(inner, half));
  }
  const base = polygonPath(pts);
  return opts.rounding > 0 ? filletPath(base, { radius: opts.rounding }) : base;
}

/** `plus` is `cross` with four arms — the name most callers reach for. */
export function plus(opts = {}) {
  return cross({ ...opts, arms: 4 });
}

/**
 * An arrow outline from `from` to `to` (or along +x of `length`), with a triangular head.
 * `tail` is the shaft thickness; `headWidth`/`headLength` size the head.
 * @param {{from?:{x,y}, to?:{x,y}, length?:number, headLength?:number, headWidth?:number,
 *          tail?:number}} [opts]
 * @returns {object} Path
 */
export function arrow(opts = {}) {
  const from = opts.from ?? vec2(0, 0);
  const to = opts.to ?? vec2(from.x + (opts.length ?? 1), from.y);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (!(len > EPS)) throw new RangeError('arrow: from and to must differ');
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const headLength = Math.min(requirePositive(opts.headLength ?? len * 0.3, 'headLength'), len);
  const headWidth = requirePositive(opts.headWidth ?? headLength * 0.8, 'headWidth') / 2;
  const tail = requirePositive(opts.tail ?? headWidth * 0.4, 'tail') / 2;
  const at = (along, across) =>
    vec2(from.x + ux * along + px * across, from.y + uy * along + py * across);
  const neck = len - headLength;
  return polygonPath([
    at(0, -tail),
    at(neck, -tail),
    at(neck, -headWidth),
    at(len, 0),
    at(neck, headWidth),
    at(neck, tail),
    at(0, tail),
  ]);
}

/**
 * A chevron: an open two-legged mark pointing along `rotation`.
 * @param {{size?:number, angle?:number, rotation?:number, center?:{x,y}}} [opts]
 *   `angle` is the included angle at the point (default 90°).
 * @returns {object} Path — open
 */
export function chevron(opts = {}) {
  const size = requirePositive(opts.size ?? 1, 'size');
  const angle = opts.angle ?? Math.PI / 2;
  const rotation = opts.rotation ?? 0;
  const c = opts.center ?? vec2(0, 0);
  const half = angle / 2;
  const leg = (sign) => {
    const a = rotation + Math.PI + sign * half;
    return vec2(c.x + size * Math.cos(a), c.y + size * Math.sin(a));
  };
  return polylinePath([leg(-1), c, leg(1)]);
}

/**
 * A tick mark: a short straight stroke, by default perpendicular to +x.
 * @param {{at?:{x,y}, length?:number, rotation?:number, center?:boolean}} [opts]
 *   `center: true` centres the tick on `at`; otherwise it starts there.
 * @returns {object} Path — open
 */
export function tick(opts = {}) {
  const p = opts.at ?? vec2(0, 0);
  const length = requirePositive(opts.length ?? 1, 'length');
  const a = opts.rotation ?? Math.PI / 2;
  const ux = Math.cos(a) * length;
  const uy = Math.sin(a) * length;
  const start = opts.center ? vec2(p.x - ux / 2, p.y - uy / 2) : p;
  return polylinePath([start, vec2(start.x + ux, start.y + uy)]);
}

/**
 * A brace spanning `from`→`to`, bulging by `depth` toward its normal side.
 *
 * `'curly'` is the four-arc form with a centre point; `'square'` is the bracket form.
 * @param {{from?:{x,y}, to?:{x,y}, span?:number, depth?:number, kind?:string}} [opts]
 * @returns {object} Path — open
 */
export function brace(opts = {}) {
  const from = opts.from ?? vec2(0, 0);
  const to = opts.to ?? vec2(from.x, from.y + (opts.span ?? 1));
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (!(len > EPS)) throw new RangeError('brace: from and to must differ');
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const depth = requirePositive(opts.depth ?? len * 0.15, 'depth');
  const at = (along, across) =>
    vec2(from.x + ux * along + px * across, from.y + uy * along + py * across);
  const kind = opts.kind ?? 'curly';

  if (kind === 'square') {
    return polylinePath([at(0, 0), at(0, depth), at(len, depth), at(len, 0)]);
  }
  if (kind !== 'curly') throw new TypeError(`brace: kind must be 'curly' or 'square'`);

  // Two S-curves meeting at the centre spike. Control points at a third of each half keep
  // the classic brace weight without needing a fitted curve.
  const h = len / 2;
  const k = h / 3;
  return path([
    subpath(
      [
        cubic(at(0, 0), at(k, 0), at(h - k, depth), at(h, depth)),
        cubic(at(h, depth), at(h + k, depth), at(len - k, 0), at(len, 0)),
      ],
      { closed: false },
    ),
  ]);
}

/**
 * A dimension line between two points: the measured span with arrowheads, plus extension
 * lines standing off from the measured points.
 *
 * Returns a Path with several subpaths — the arrowheads are filled outlines, the lines are
 * open. Callers style them together, which is what a dimension mark is.
 *
 * @param {{from:{x,y}, to:{x,y}, offset?:number, extension?:number, gap?:number,
 *          arrows?:boolean, headLength?:number, headWidth?:number}} opts
 * @returns {object} Path
 */
export function dimensionLine(opts = {}) {
  const from = opts.from ?? vec2(0, 0);
  const to = opts.to ?? vec2(1, 0);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (!(len > EPS)) throw new RangeError('dimensionLine: from and to must differ');
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const offset = opts.offset ?? 0;
  const gap = opts.gap ?? 0;
  const extension = opts.extension ?? 0;
  const arrows = opts.arrows !== false;
  const at = (base, along, across) =>
    vec2(base.x + ux * along + px * across, base.y + uy * along + py * across);

  const a = at(from, 0, offset);
  const b = at(to, 0, offset);
  const subpaths = [];

  // Extension lines: from just off the measured point out past the dimension line.
  if (extension > 0 || gap > 0) {
    for (const [p, q] of [
      [from, a],
      [to, b],
    ]) {
      const sign = Math.sign(offset) || 1;
      const start = vec2(p.x + px * gap * sign, p.y + py * gap * sign);
      const end = vec2(q.x + px * extension * sign, q.y + py * extension * sign);
      subpaths.push(subpath([line(start, end)], { closed: false }));
    }
  }

  if (!arrows) {
    subpaths.push(subpath([line(a, b)], { closed: false }));
    return path(subpaths);
  }

  const headLength = Math.min(opts.headLength ?? len * 0.08, len / 2);
  const headWidth = opts.headWidth ?? headLength * 0.7;
  // The shaft stops at the arrow necks; the heads are filled triangles pointing outward.
  subpaths.push(
    subpath([line(at(a, headLength, 0), at(b, -headLength, 0))], { closed: false }),
  );
  for (const [tip, dir] of [
    [a, 1],
    [b, -1],
  ]) {
    const neck = at(tip, dir * headLength, 0);
    const w = headWidth / 2;
    subpaths.push(
      subpath(
        [
          line(tip, at(neck, 0, w)),
          line(at(neck, 0, w), at(neck, 0, -w)),
          line(at(neck, 0, -w), tip),
        ],
        { closed: true },
      ),
    );
  }
  return path(subpaths);
}
