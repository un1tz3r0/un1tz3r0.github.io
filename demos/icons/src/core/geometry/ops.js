// Path operations built on geo: regions, booleans, stroke-to-path, offset, corners.
// DESIGN.md §11. Everything here works on geo Path values and returns path data.

import {
  parsePath, serializePath, transformPath, union, difference, intersection, xor, simplify,
  stroke as strokeOutline, filletPath, chamferPath, cleanPath, fillRegions, reverseSubpath,
  path as makePath, pathBoundingBox,
} from '@geo/paths';
import { det, mul } from '../affine.js';
import { outlineGeo } from './bounds.js';

const EMPTY = makePath([]);
export const isEmpty = (p) => !p || p.subpaths.length === 0;
export const toD = (p, precision = 4) => serializePath(p, { precision });

const visibleStroke = (node) => node.stroke && node.stroke.paint.type !== 'none' && node.stroke.width > 0;

/**
 * The area a node paints, as a geo Path in the space `matrix` maps the node's coordinates
 * to. A filled shape contributes its interior; a visible stroke contributes its outline;
 * a group contributes the union of its members. Text and icons must be converted to
 * paths first (that needs fonts and a DOM), so they contribute nothing here.
 * @param {any} node
 * @param {import('../affine.js').Affine} matrix
 * @returns {any} geo Path (possibly empty)
 */
export function regionOf(node, matrix) {
  if (node.type === 'group') {
    return node.children
      .filter((c) => c.visible)
      .map((c) => regionOf(c, mul(matrix, c.transform)))
      .reduce((acc, r) => (isEmpty(r) ? acc : isEmpty(acc) ? r : union(acc, r)), EMPTY);
  }
  if (node.type !== 'path' && node.type !== 'shape') return EMPTY;
  const local = outlineGeo(node);
  if (!local || isEmpty(local) || Math.abs(det(matrix)) < 1e-12) return EMPTY;
  const outline = transformPath(local, matrix);
  const filled = node.fill.type !== 'none';
  const stroked = visibleStroke(node);
  let region = EMPTY;
  // An unpainted path still has a shape; treat it as filled so it can be an operand.
  if (filled || !stroked) region = simplify(outline);
  if (stroked) {
    // A stroke's width follows the scale of the space it is drawn in.
    const width = node.stroke.width * Math.sqrt(Math.abs(det(matrix)));
    const ring = simplify(strokeOutline(outline, {
      width,
      cap: node.stroke.cap,
      join: node.stroke.join,
      miterLimit: node.stroke.miterLimit,
    }));
    region = isEmpty(region) ? ring : union(region, ring);
  }
  return region;
}

/**
 * Combine regions, bottom-most first.
 * @param {any[]} regions
 * @param {'union'|'subtract'|'intersect'|'exclude'} op
 * @returns {any} geo Path
 */
export function combine(regions, op) {
  const live = regions.filter((r) => r);
  if (!live.length) return EMPTY;
  const safe = (fn, a, b) => {
    if (isEmpty(a) && isEmpty(b)) return EMPTY;
    return fn(isEmpty(a) ? EMPTY : a, isEmpty(b) ? EMPTY : b);
  };
  if (op === 'union') return live.reduce((a, b) => (isEmpty(a) ? b : isEmpty(b) ? a : union(a, b)));
  if (op === 'exclude') return live.reduce((a, b) => (isEmpty(a) ? b : isEmpty(b) ? a : xor(a, b)));
  if (op === 'intersect') return live.reduce((a, b) => (isEmpty(a) || isEmpty(b) ? EMPTY : intersection(a, b)));
  if (op === 'subtract') {
    // The bottom object minus everything above it.
    const [bottom, ...rest] = live;
    return rest.reduce((a, b) => (isEmpty(a) || isEmpty(b) ? a : safe(difference, a, b)), bottom);
  }
  throw new TypeError(`combine: unknown operation "${op}"`);
}

/**
 * Cut overlapping regions into non-overlapping faces. Each face keeps the tag of the
 * topmost operand that covers it.
 * @param {{region: any, tag: any}[]} operands  bottom-most first
 * @returns {{region: any, tag: any}[]}
 */
export function divide(operands) {
  let faces = [];
  for (const { region, tag } of operands) {
    if (isEmpty(region)) continue;
    const next = [];
    let covered = EMPTY;
    for (const face of faces) {
      const outside = difference(face.region, region);
      if (!isEmpty(outside)) next.push({ region: outside, tag: face.tag });
      const inside = intersection(face.region, region);
      if (!isEmpty(inside)) next.push({ region: inside, tag });
      covered = isEmpty(covered) ? face.region : union(covered, face.region);
    }
    const alone = isEmpty(covered) ? region : difference(region, covered);
    if (!isEmpty(alone)) next.push({ region: alone, tag });
    faces = next;
  }
  // One entry per connected piece, so each can be moved on its own afterwards.
  return faces.flatMap((face) => fillRegions(face.region).map((region) => ({ region, tag: face.tag })));
}

/** The outline of a node's stroke as a filled region, in the node's own coordinates. */
export function strokeRegion(node) {
  const local = outlineGeo(node);
  if (!local || isEmpty(local) || !visibleStroke(node)) return EMPTY;
  return simplify(strokeOutline(local, {
    width: node.stroke.width,
    cap: node.stroke.cap,
    join: node.stroke.join,
    miterLimit: node.stroke.miterLimit,
  }));
}

/**
 * Grow (positive) or shrink (negative) a filled region by a distance.
 * Built from the region and a stroke of its boundary, which is robust where a raw
 * parallel-curve offset leaves loops at corners.
 * @param {any} path  geo Path
 * @param {number} distance
 * @param {'round'|'miter'|'bevel'} [join]
 */
export function offsetRegion(path, distance, join = 'round') {
  const region = simplify(path);
  if (!distance || isEmpty(region)) return region;
  const band = simplify(strokeOutline(region, { width: Math.abs(distance) * 2, join, cap: 'butt', miterLimit: 4 }));
  if (isEmpty(band)) return region;
  return distance > 0 ? union(region, band) : difference(region, band);
}

/** Round or chamfer every corner. */
export function roundCorners(path, radius, chamfer = false) {
  if (!(radius > 0)) return path;
  return chamfer ? chamferPath(path, { distance: radius }) : filletPath(path, { radius });
}

/** Remove redundant points and merge near-duplicates, within a tolerance. */
export function simplifyPath(path, tolerance) {
  const box = pathBoundingBox(path);
  const size = box ? Math.hypot(box.maxX - box.minX, box.maxY - box.minY) : 1;
  return cleanPath(path, { tolerance: tolerance ?? size * 0.002, resolution: 0 });
}

export function reversePath(path) {
  return makePath(path.subpaths.map(reverseSubpath), { fillRule: path.fillRule });
}

export { parsePath, transformPath };
