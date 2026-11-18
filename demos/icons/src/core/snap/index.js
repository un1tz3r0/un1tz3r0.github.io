// Snap-target collection and resolution. See DESIGN.md §7.
//
// Targets are gathered once per gesture (they do not change while dragging, because the
// objects being dragged are excluded). Resolution is per axis: x and y snap
// independently to the nearest candidate line within the tolerance, and a candidate
// *point* (a path node) wins over lines when the pointer is within tolerance of it.

import { apply } from '../affine.js';
import { boundsUnder, outlineGeo } from '../geometry/bounds.js';
import { outlineUnder, nearestOnOutlines } from '../geometry/nearest.js';
import { mul, IDENTITY } from '../affine.js';

/** @typedef {{x:number, y:number}} Point */
/** @typedef {{value:number, kind:'guide'|'artboard'|'bounds'|'grid'}} Line */
/** @typedef {{xs: Line[], ys: Line[], points: Point[], outlines: any[]}} Targets */
/**
 * @typedef {{x: number, y: number,
 *            snappedX: Line | null, snappedY: Line | null, point: Point | null}} SnapResult
 */

/**
 * Collect snap candidates from a document.
 * @param {import('../model/nodes.js').Doc} doc
 * @param {{exclude?: Iterable<string>}} [opts]  ids of nodes being moved (with their subtrees)
 * @returns {Targets}
 */
export function collectTargets(doc, opts = {}) {
  const snap = doc.snap;
  const exclude = new Set(opts.exclude ?? []);
  /** @type {Targets} */
  const out = { xs: [], ys: [], points: [], outlines: [] };
  if (!snap.enabled) return out;

  if (snap.guides && doc.guidesVisible) {
    for (const g of doc.guides) {
      (g.axis === 'x' ? out.xs : out.ys).push({ value: g.position, kind: 'guide' });
    }
  }
  if (snap.artboard) {
    const { width, height } = doc.artboard;
    for (const v of [0, width / 2, width]) out.xs.push({ value: v, kind: 'artboard' });
    for (const v of [0, height / 2, height]) out.ys.push({ value: v, kind: 'artboard' });
  }
  if (snap.bounds || snap.nodes || snap.paths) {
    const visit = (children, matrix) => {
      for (const node of children) {
        if (!node.visible || exclude.has(node.id)) continue;
        const m = mul(matrix, node.transform);
        if (snap.bounds) {
          const box = boundsUnder(node, m);
          if (box) {
            for (const v of [box.x, box.x + box.width / 2, box.x + box.width]) out.xs.push({ value: v, kind: 'bounds' });
            for (const v of [box.y, box.y + box.height / 2, box.y + box.height]) out.ys.push({ value: v, kind: 'bounds' });
          }
        }
        if (snap.nodes && (node.type === 'path' || node.type === 'shape')) {
          const path = outlineGeo(node);
          for (const sp of path?.subpaths ?? []) {
            for (const seg of sp.segments) out.points.push(apply(m, seg.p0));
            const last = sp.segments.at(-1);
            if (last && !sp.closed) out.points.push(apply(m, last.type === 'cubic' ? last.p3 : last.type === 'quad' ? last.p2 : last.p1));
          }
        }
        if (snap.paths && (node.type === 'path' || node.type === 'shape')) {
          const outline = outlineUnder(node, m);
          if (outline) out.outlines.push(outline);
        }
        if (node.type === 'group') visit(node.children, m);
      }
    };
    visit(doc.children, IDENTITY);
  }
  return out;
}

/** The nearest grid line to `v` along one axis. */
export function nearestGridLine(v, spacing, subdivisions, origin) {
  const step = spacing / Math.max(1, subdivisions);
  if (!(step > 0)) return v;
  return origin + Math.round((v - origin) / step) * step;
}

/**
 * Best candidate for one coordinate.
 * @param {number} v
 * @param {Line[]} lines
 * @param {number | null} gridValue  nearest grid line, or null when grid snapping is off
 * @param {number} tolerance
 * @returns {Line | null}
 */
function nearestLine(v, lines, gridValue, tolerance) {
  /** @type {Line | null} */
  let best = null;
  let bestDist = tolerance;
  for (const line of lines) {
    const d = Math.abs(line.value - v);
    if (d <= bestDist) {
      // On a tie, a real object beats nothing; later equal candidates do not replace it.
      if (d < bestDist || !best) {
        best = line;
        bestDist = d;
      }
    }
  }
  if (gridValue !== null) {
    const d = Math.abs(gridValue - v);
    // Grid lines are everywhere, so they only win when strictly closer than an object.
    if (d <= tolerance && (!best || d < bestDist - 1e-9)) best = { value: gridValue, kind: 'grid' };
  }
  return best;
}

function gridFor(doc, axis, v) {
  const snap = doc.snap;
  const g = doc.grid;
  if (!snap.enabled || !snap.grid || g.style === 'isometric') return null;
  return axis === 'x'
    ? nearestGridLine(v, g.spacingX, g.subdivisions, g.originX)
    : nearestGridLine(v, g.spacingY, g.subdivisions, g.originY);
}

/**
 * Snap a point.
 * @param {Point} p
 * @param {Targets} targets
 * @param {import('../model/nodes.js').Doc} doc  supplies grid and snap settings
 * @param {number} tolerance  in document units (screen threshold ÷ zoom)
 * @returns {SnapResult}
 */
/** The nearest point of the isometric lattice (see the grid drawing in render/overlay.js). */
export function nearestIsoPoint(p, grid) {
  const s = grid.spacingY;
  const w = s * Math.cos(Math.PI / 6);
  if (!(s > 0)) return { x: p.x, y: p.y };
  const i = Math.round((p.x - grid.originX) / w);
  // Every other column is shifted by half a step.
  const shift = (((i % 2) + 2) % 2) * (s / 2);
  const j = Math.round((p.y - grid.originY - shift) / s);
  return { x: grid.originX + i * w, y: grid.originY + shift + j * s };
}

export function snapPoint(p, targets, doc, tolerance) {
  if (!doc.snap.enabled) return { x: p.x, y: p.y, snappedX: null, snappedY: null, point: null };
  let nearest = null;
  let nearestDist = tolerance;
  for (const q of targets.points) {
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    if (d <= nearestDist) {
      nearest = q;
      nearestDist = d;
    }
  }
  if (nearest) return { x: nearest.x, y: nearest.y, snappedX: null, snappedY: null, point: nearest };
  // Anywhere along an outline, when no node is in reach.
  if (targets.outlines?.length) {
    const on = nearestOnOutlines(targets.outlines, p);
    if (on && on.dist <= tolerance) return { x: on.point.x, y: on.point.y, snappedX: null, snappedY: null, point: on.point };
  }
  const sx = nearestLine(p.x, targets.xs, gridFor(doc, 'x', p.x), tolerance);
  const sy = nearestLine(p.y, targets.ys, gridFor(doc, 'y', p.y), tolerance);
  // On an isometric grid the snap positions are lattice points, not independent lines.
  if (doc.snap.grid && doc.grid.style === 'isometric' && !sx && !sy) {
    const q = nearestIsoPoint(p, doc.grid);
    if (Math.hypot(q.x - p.x, q.y - p.y) <= tolerance) {
      return { x: q.x, y: q.y, snappedX: { value: q.x, kind: 'grid' }, snappedY: { value: q.y, kind: 'grid' }, point: null };
    }
  }
  return { x: sx ? sx.value : p.x, y: sy ? sy.value : p.y, snappedX: sx, snappedY: sy, point: null };
}

/**
 * Snap a moving box: whichever of its left / center / right (and top / middle / bottom)
 * edges is closest to a candidate decides the adjustment for that axis.
 * @param {import('../affine.js').Box} box  the box at its unsnapped position
 * @param {Targets} targets
 * @param {import('../model/nodes.js').Doc} doc
 * @param {number} tolerance
 * @returns {{dx:number, dy:number, snappedX: Line|null, snappedY: Line|null}}
 */
export function snapBox(box, targets, doc, tolerance) {
  const out = { dx: 0, dy: 0, snappedX: null, snappedY: null };
  if (!doc.snap.enabled) return out;
  const axis = (key, values, lines) => {
    let best = null;
    let bestDist = Infinity;
    for (const v of values) {
      const line = nearestLine(v, lines, gridFor(doc, key, v), tolerance);
      if (!line) continue;
      const d = Math.abs(line.value - v);
      // Prefer a real object over the grid when they are equally near.
      const better = d < bestDist - 1e-9 || (Math.abs(d - bestDist) <= 1e-9 && best?.line.kind === 'grid' && line.kind !== 'grid');
      if (better) {
        best = { line, delta: line.value - v };
        bestDist = d;
      }
    }
    return best;
  };
  const bx = axis('x', [box.x, box.x + box.width / 2, box.x + box.width], targets.xs);
  const by = axis('y', [box.y, box.y + box.height / 2, box.y + box.height], targets.ys);
  if (bx) {
    out.dx = bx.delta;
    out.snappedX = bx.line;
  }
  if (by) {
    out.dy = by.delta;
    out.snappedY = by.line;
  }
  return out;
}
