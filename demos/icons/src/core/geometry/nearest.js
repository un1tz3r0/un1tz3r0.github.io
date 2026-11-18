// Nearest-point queries against node outlines, for snap-to-path.

import { transformPath, nearestPointToPath } from '@geo/paths';
import { det } from '../affine.js';
import { outlineGeo } from './bounds.js';

/**
 * A path or shape node's outline as a geo Path in the space `matrix` maps it to, or null.
 * @param {any} node
 * @param {import('../affine.js').Affine} matrix
 */
export function outlineUnder(node, matrix) {
  const local = outlineGeo(node);
  if (!local || !local.subpaths.length || Math.abs(det(matrix)) < 1e-12) return null;
  try {
    return transformPath(local, matrix);
  } catch {
    return null;
  }
}

/**
 * The point on any of the outlines closest to `p`.
 * @param {any[]} outlines  geo Paths
 * @param {{x: number, y: number}} p
 * @returns {{point: {x: number, y: number}, dist: number} | null}
 */
export function nearestOnOutlines(outlines, p) {
  let best = null;
  for (const outline of outlines) {
    const hit = nearestPointToPath(p, outline);
    if (hit && (!best || hit.dist < best.dist)) best = { point: { x: hit.point.x, y: hit.point.y }, dist: hit.dist };
  }
  return best;
}
