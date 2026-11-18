// Applying a transform to a node.
//
// Where the result can be expressed in the node's own geometry it is "baked in": a moved
// rectangle gets new x/y, a scaled path gets new path data. That keeps stroke widths from
// being distorted by a scale and keeps parametric shapes parametric. Everything else
// (icons, text, groups, rotated shapes) accumulates the transform as a matrix.

import { IDENTITY, mul, det, apply, isAxisAligned, invert } from '../affine.js';
import { transformedD } from './bounds.js';
import { findNode, parentMatrix, updateNodes, topLevel } from '../model/tree.js';

const isGradient = (paint) => paint?.type === 'linear' || paint?.type === 'radial';

function bakeShape(node, m) {
  const p = node.params;
  switch (node.shape) {
    case 'line': {
      const a = apply(m, { x: p.x1, y: p.y1 });
      const b = apply(m, { x: p.x2, y: p.y2 });
      return { ...p, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
    }
    case 'rect': {
      if (!isAxisAligned(m)) return null;
      const a = apply(m, { x: p.x, y: p.y });
      const b = apply(m, { x: p.x + p.width, y: p.y + p.height });
      return {
        ...p,
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs(b.x - a.x),
        height: Math.abs(b.y - a.y),
        rx: p.rx * Math.abs(m.a),
        ry: p.ry * Math.abs(m.d),
      };
    }
    case 'ellipse': {
      if (!isAxisAligned(m)) return null;
      const c = apply(m, { x: p.cx, y: p.cy });
      return { ...p, cx: c.x, cy: c.y, rx: p.rx * Math.abs(m.a), ry: p.ry * Math.abs(m.d) };
    }
    case 'polygon':
    case 'star': {
      // Only a uniform, unmirrored, unrotated scale keeps these regular.
      if (!isAxisAligned(m) || m.a <= 0 || Math.abs(m.a - m.d) > 1e-9) return null;
      const c = apply(m, { x: p.cx, y: p.cy });
      const k = m.a;
      const scaled = node.shape === 'polygon' ? { radius: p.radius * k } : { outer: p.outer * k, inner: p.inner * k };
      return { ...p, cx: c.x, cy: c.y, rounding: p.rounding * k, ...scaled };
    }
    default:
      return null;
  }
}

/**
 * Apply `delta` (expressed in the node's parent space) to a node.
 * @param {any} node
 * @param {import('../affine.js').Affine} delta
 */
export function transformNode(node, delta) {
  const m = mul(delta, node.transform);
  if (Math.abs(det(m)) < 1e-12) return { ...node, transform: m };
  const gradientAtRisk = (isGradient(node.fill) || isGradient(node.stroke?.paint)) && !isAxisAligned(m);
  if (node.type === 'path' && !gradientAtRisk) {
    try {
      return { ...node, d: transformedD(node.d, m), transform: IDENTITY };
    } catch {
      return { ...node, transform: m };
    }
  }
  if (node.type === 'shape' && !gradientAtRisk) {
    const params = bakeShape(node, m);
    if (params) return { ...node, params, transform: IDENTITY };
  }
  return { ...node, transform: m };
}

/**
 * Apply a document-space transform to each selected top-level node.
 * @param {import('../model/nodes.js').Doc} doc
 * @param {string[]} ids
 * @param {import('../affine.js').Affine} worldDelta
 */
export function transformSelection(doc, ids, worldDelta) {
  const targets = topLevel(doc, ids);
  const deltas = new Map();
  for (const id of targets) {
    const pm = parentMatrix(doc, id);
    const inv = invert(pm);
    // Conjugate the document-space delta into the node's parent space.
    deltas.set(id, inv ? mul(mul(inv, worldDelta), pm) : worldDelta);
  }
  return updateNodes(doc, targets, (node) => transformNode(node, deltas.get(node.id)));
}

/** Replace a node's own matrix by the equivalent baked geometry where possible. */
export function flattenTransform(doc, ids) {
  return updateNodes(doc, ids, (node) => {
    if (node.type !== 'path' && node.type !== 'shape') return node;
    const baked = transformNode({ ...node, transform: IDENTITY }, node.transform);
    return baked;
  });
}

export { findNode };
