// Bounding boxes and outlines of document nodes.

import { parsePath, serializePath, transformPath, pathBoundingBox } from '@geo/paths';
import { IDENTITY, mul, det, transformBox, unionBoxes } from '../affine.js';
import { shapeToD } from './shapes.js';
import { findNode, parentMatrix, topLevel } from '../model/tree.js';

/** @typedef {import('../affine.js').Box} Box */
/** @typedef {import('../affine.js').Affine} Affine */

/** @type {WeakMap<object, string>} */
const dCache = new WeakMap();
/** @type {WeakMap<object, any>} */
const geoCache = new WeakMap();
/** @type {WeakMap<object, {key: string, box: Box | null}>} */
const boxCache = new WeakMap();

/** Path data for a path or shape node in its own coordinates; `null` for other types. */
export function outlineD(node) {
  if (node.type === 'path') return node.d;
  if (node.type !== 'shape') return null;
  let d = dCache.get(node);
  if (d === undefined) {
    d = shapeToD(node.shape, node.params);
    dCache.set(node, d);
  }
  return d;
}

/** The node's outline as a geo Path in its own coordinates (cached per node). */
export function outlineGeo(node) {
  let path = geoCache.get(node);
  if (path !== undefined) return path;
  const d = outlineD(node);
  try {
    path = d ? parsePath(d) : null;
    if (path && node.type === 'path') path.fillRule = node.fillRule;
  } catch {
    path = null;
  }
  geoCache.set(node, path);
  return path;
}

// Text needs the browser to measure; the renderer installs a real measurer at start-up.
let textMeasurer = (node) => {
  const lines = String(node.text).split('\n');
  const width = Math.max(1, ...lines.map((l) => l.length)) * node.size * 0.55 + node.letterSpacing * Math.max(0, lines[0].length - 1);
  const height = (lines.length - 1) * node.size * node.lineHeight + node.size * 1.15;
  const x = node.align === 'middle' ? -width / 2 : node.align === 'end' ? -width : 0;
  return { x, y: -node.size * 0.9, width, height };
};

/** @param {(node: import('../model/nodes.js').TextNode) => Box} fn */
export function setTextMeasurer(fn) {
  textMeasurer = fn;
}

const fromGeoBox = (b) => (b ? { x: b.minX, y: b.minY, width: b.maxX - b.minX, height: b.maxY - b.minY } : null);
const matrixKey = (m) => `${m.a},${m.b},${m.c},${m.d},${m.e},${m.f}`;

/**
 * Bounds of a node's geometry (stroke width not included) under a matrix that maps the
 * node's own coordinates to the space wanted. Exact for paths and shapes.
 * @param {any} node
 * @param {Affine} m
 * @returns {Box | null}
 */
export function boundsUnder(node, m) {
  // Text metrics change when a font finishes loading, so they are never cached here.
  if (node.type === 'text') return transformBox(m, textMeasurer(node));
  const key = matrixKey(m);
  const hit = boxCache.get(node);
  if (hit && hit.key === key) return hit.box;
  let box = null;
  if (node.type === 'group') {
    box = unionBoxes(node.children.filter((c) => c.visible).map((c) => boundsUnder(c, mul(m, c.transform))));
  } else if (node.type === 'icon') {
    box = transformBox(m, { x: 0, y: 0, width: node.width, height: node.height });
  } else {
    const path = outlineGeo(node);
    if (path && path.subpaths.length) {
      try {
        box = fromGeoBox(pathBoundingBox(Math.abs(det(m)) < 1e-12 ? path : transformPath(path, m)));
        if (Math.abs(det(m)) < 1e-12 && box) box = transformBox(m, box);
      } catch {
        box = null;
      }
    }
  }
  boxCache.set(node, { key, box });
  return box;
}

/** Bounds in the node's own coordinate system. */
export function localBounds(node) {
  return boundsUnder(node, IDENTITY);
}

/** Bounds in document coordinates. */
export function worldBounds(doc, id) {
  const node = findNode(doc, id);
  if (!node) return null;
  return boundsUnder(node, mul(parentMatrix(doc, id), node.transform));
}

/** Bounds in document coordinates of everything in `ids`. */
export function selectionBounds(doc, ids) {
  return unionBoxes(topLevel(doc, ids).map((id) => worldBounds(doc, id)));
}

/** Path data for a path/shape outline transformed by `m`. */
export function transformedD(d, m, precision = 4) {
  return serializePath(transformPath(parsePath(d), m), { precision });
}
