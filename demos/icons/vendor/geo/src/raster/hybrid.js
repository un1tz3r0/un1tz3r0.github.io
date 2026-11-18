// Hybrid rasterizer (F4, mode 'hybrid'): exact in x, sampled in y.
//
// For each of M sub-scanlines per pixel row, the winding intervals along the line are
// derived exactly from the sorted crossings, and each interval contributes its exact
// overlap length with every pixel's [x, x+1) span, weighted 1/M. Coverage is thus
// exact horizontally (no x quantization at all) while the vertical resolution is the
// M-sample quantization — a strictly better estimate than N×N supersampling in x and
// the literal reading of the brief's "analytic in x, a few samples in y".
//
// Shares the crossing routine (and its half-open vertex rule) with the supersample
// mode: three raster modes, one geometry front-end.

import { scanlineCrossings, insideFromWinding } from './scanline.js';

// Add `weight × overlap([xa,xb), pixel span)` to every pixel of row py touched by
// the interval.
function addSpan(data, width, py, xa, xb, weight) {
  const a = Math.max(0, xa);
  const b = Math.min(width, xb);
  if (b <= a) return;
  const row = py * width;
  const ia = Math.floor(a);
  const ib = Math.min(Math.floor(b), width - 1);
  if (ia === ib) {
    data[row + ia] += (b - a) * weight;
    return;
  }
  data[row + ia] += (ia + 1 - a) * weight;
  for (let x = ia + 1; x < ib; x++) data[row + x] += weight;
  data[row + ib] += (b - ib) * weight;
}

/**
 * Hybrid coverage of the edge set.
 * @param {{x0,y0,x1,y1}[]} edges  device-space directed edges (see edges.js)
 * @param {number} width
 * @param {number} height
 * @param {'nonzero'|'evenodd'} rule
 * @param {number} ySamples  sub-scanlines per pixel row
 * @returns {{width:number, height:number, data:number[]}}
 */
export function rasterizeHybrid(edges, width, height, rule, ySamples) {
  const data = new Array(width * height).fill(0);
  const weight = 1 / ySamples;
  for (let py = 0; py < height; py++) {
    for (let j = 0; j < ySamples; j++) {
      const y = py + (j + 0.5) / ySamples;
      const crossings = scanlineCrossings(edges, y);
      if (crossings.length === 0) continue;
      // Walk the winding intervals left to right; w = 0 left of everything.
      let w = 0;
      let startX = 0;
      for (const c of crossings) {
        if (insideFromWinding(w, rule)) addSpan(data, width, py, startX, c.x, weight);
        w += c.dir;
        startX = c.x;
      }
      // Right of the last crossing (w returns to 0 for well-formed closed input).
      if (insideFromWinding(w, rule)) addSpan(data, width, py, startX, width, weight);
    }
  }
  return { width, height, data };
}
