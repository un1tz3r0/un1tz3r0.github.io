// Path → flattened directed edges in device space.
//
// The one geometry front-end shared by every raster mode: segments are adaptively
// flattened in *path* space to a tolerance chosen so the chord deviation after the
// path→device transform stays below `flatness` device pixels, then the polyline points
// are transformed. Applying the affine to flattened points (rather than to segments)
// sidesteps transforming elliptical arcs under affine maps — rasterization flattens
// anyway, per the brief.
//
// Transform convention (SVG matrix order): x' = a·x + c·y + e, y' = b·x + d·y + f.
// Every subpath is implicitly closed for filling (SVG fill semantics). Exactly
// horizontal edges are dropped — they can never cross a scanline and contribute no
// signed area.

import { FLATNESS_RASTER } from '../core/tolerance.js';
import { flatten } from '../core/segment.js';

/** The identity path→device transform. */
export const IDENTITY = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

// Maximum stretch factor of the affine's linear part, estimated as the larger column
// norm — an upper bound tight enough for choosing a flattening tolerance.
function transformScale(m) {
  return Math.max(Math.hypot(m.a, m.b), Math.hypot(m.c, m.d));
}

function apply(m, p) {
  return { x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f };
}

/**
 * Flatten a path into directed device-space edges.
 * @param {object} pth  Path
 * @param {{a,b,c,d,e,f}} [transform]
 * @param {number} [flatness]  max chord deviation in device pixels
 * @returns {{x0:number,y0:number,x1:number,y1:number}[]}
 */
export function pathToEdges(pth, transform = IDENTITY, flatness = FLATNESS_RASTER) {
  const scale = transformScale(transform);
  const tol = scale > 0 ? flatness / scale : flatness;
  const edges = [];
  for (const sp of pth.subpaths) {
    if (!sp.segments.length) continue;
    const pts = [];
    for (const seg of sp.segments) {
      const fl = flatten(seg, tol);
      let start = 0;
      if (pts.length) {
        const last = pts[pts.length - 1];
        const first = apply(transform, fl[0]);
        // Skip the duplicate junction point; keep it if the segments are disjoint so
        // the connecting chord is drawn (fill semantics).
        if (last.x === first.x && last.y === first.y) start = 1;
      }
      for (let i = start; i < fl.length; i++) pts.push(apply(transform, fl[i]));
    }
    pts.push(pts[0]); // implicit closing chord
    for (let i = 0; i + 1 < pts.length; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      if (p.y === q.y) continue;
      edges.push({ x0: p.x, y0: p.y, x1: q.x, y1: q.y });
    }
  }
  return edges;
}

/**
 * Uniform-scale transform that centers a path bounding box inside a width×height
 * device rectangle with an optional margin (in device pixels).
 * @param {{minX,minY,maxX,maxY}} bbox
 * @param {number} width
 * @param {number} height
 * @param {{margin?: number}} [opts]
 * @returns {{a,b,c,d,e,f}}
 */
export function fitTransform(bbox, width, height, opts = {}) {
  const margin = opts.margin ?? 0;
  const bw = bbox.maxX - bbox.minX;
  const bh = bbox.maxY - bbox.minY;
  const aw = width - 2 * margin;
  const ah = height - 2 * margin;
  let s;
  if (bw > 0 && bh > 0) s = Math.min(aw / bw, ah / bh);
  else if (bw > 0) s = aw / bw;
  else if (bh > 0) s = ah / bh;
  else s = 1; // degenerate (point) bbox — scale is arbitrary
  if (!Number.isFinite(s) || s <= 0) s = 1;
  const e = (width - s * bw) / 2 - s * bbox.minX;
  const f = (height - s * bh) / 2 - s * bbox.minY;
  return { a: s, b: 0, c: 0, d: s, e, f };
}
