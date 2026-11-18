// Parametric shapes → SVG path data.

import { parsePath, serializePath, filletPath } from '@geo/paths';
import { fmt } from '../affine.js';

const n = (v) => fmt(v, 4);

function rectD({ x, y, width, height, rx = 0, ry = 0 }) {
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  let r1 = Math.max(0, rx);
  let r2 = Math.max(0, ry);
  if (r1 && !r2) r2 = r1;
  if (r2 && !r1) r1 = r2;
  r1 = Math.min(r1, w / 2);
  r2 = Math.min(r2, h / 2);
  if (r1 === 0 || r2 === 0) {
    return `M ${n(x)} ${n(y)} L ${n(x + w)} ${n(y)} L ${n(x + w)} ${n(y + h)} L ${n(x)} ${n(y + h)} Z`;
  }
  const a = `A ${n(r1)} ${n(r2)} 0 0 1`;
  return [
    `M ${n(x + r1)} ${n(y)}`,
    `L ${n(x + w - r1)} ${n(y)}`,
    `${a} ${n(x + w)} ${n(y + r2)}`,
    `L ${n(x + w)} ${n(y + h - r2)}`,
    `${a} ${n(x + w - r1)} ${n(y + h)}`,
    `L ${n(x + r1)} ${n(y + h)}`,
    `${a} ${n(x)} ${n(y + h - r2)}`,
    `L ${n(x)} ${n(y + r2)}`,
    `${a} ${n(x + r1)} ${n(y)}`,
    'Z',
  ].join(' ');
}

function ellipseD({ cx, cy, rx, ry }) {
  const a = Math.abs(rx);
  const b = Math.abs(ry);
  return `M ${n(cx - a)} ${n(cy)} A ${n(a)} ${n(b)} 0 1 1 ${n(cx + a)} ${n(cy)} A ${n(a)} ${n(b)} 0 1 1 ${n(cx - a)} ${n(cy)} Z`;
}

/** Vertices of a regular polygon; the first one points straight up before `rotation`. */
export function polygonVertices({ cx, cy, radius, sides, rotation = 0 }) {
  const count = Math.max(3, Math.round(sides));
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = rotation - Math.PI / 2 + (i * 2 * Math.PI) / count;
    out.push({ x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) });
  }
  return out;
}

export function starVertices({ cx, cy, outer, inner, points, rotation = 0 }) {
  const count = Math.max(3, Math.round(points));
  const out = [];
  for (let i = 0; i < count * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rotation - Math.PI / 2 + (i * Math.PI) / count;
    out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return out;
}

function polylineD(points, closed = true) {
  return points.map((p, i) => `${i ? 'L' : 'M'} ${n(p.x)} ${n(p.y)}`).join(' ') + (closed ? ' Z' : '');
}

function rounded(d, radius) {
  if (!(radius > 0)) return d;
  try {
    return serializePath(filletPath(parsePath(d), { radius }), { precision: 4 });
  } catch {
    return d;
  }
}

/**
 * Path data for a parametric shape, in the shape's own coordinates.
 * @param {string} shape
 * @param {any} params
 * @returns {string}
 */
export function shapeToD(shape, params) {
  switch (shape) {
    case 'rect':
      return rectD(params);
    case 'ellipse':
      return ellipseD(params);
    case 'polygon':
      return rounded(polylineD(polygonVertices(params)), params.rounding);
    case 'star':
      return rounded(polylineD(starVertices(params)), params.rounding);
    case 'line':
      return `M ${n(params.x1)} ${n(params.y1)} L ${n(params.x2)} ${n(params.y2)}`;
    default:
      throw new TypeError(`shapeToD: unknown shape "${shape}"`);
  }
}

/** Bounding box of a shape's parameters, without building its path. */
export function shapeBox(shape, params) {
  switch (shape) {
    case 'rect':
      return { x: params.x, y: params.y, width: params.width, height: params.height };
    case 'ellipse':
      return { x: params.cx - params.rx, y: params.cy - params.ry, width: params.rx * 2, height: params.ry * 2 };
    case 'line':
      return {
        x: Math.min(params.x1, params.x2),
        y: Math.min(params.y1, params.y2),
        width: Math.abs(params.x2 - params.x1),
        height: Math.abs(params.y2 - params.y1),
      };
    default:
      return null;
  }
}
