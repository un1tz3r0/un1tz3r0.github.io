// Supersampling rasterizer (F4, mode 'supersample').
//
// Coverage of pixel (px, py) — the device square [px, px+1) × [py, py+1) — is
// estimated by point-sampling an N×N regular grid inside the square: sample centers
// (px + (i+0.5)/N, py + (j+0.5)/N), each contributing 1/N² when inside the filled
// region. Per sub-scanline the crossings are computed once and consumed in a single
// left-to-right march that maintains the running winding number, so the cost per row
// is O(edges + crossings·log(crossings) + width·N).
//
// The regular grid is deliberate: deterministic and trivially portable. Its aliasing
// bias relative to true area coverage is exactly what the Phase 5 analytic mode
// cross-checks against.

import { scanlineCrossings, insideFromWinding } from './scanline.js';

/**
 * @param {{x0,y0,x1,y1}[]} edges  device-space directed edges (see edges.js)
 * @param {number} width
 * @param {number} height
 * @param {'nonzero'|'evenodd'} rule
 * @param {number} samples  N of the N×N grid
 * @returns {{width:number, height:number, data:number[]}}
 */
export function rasterizeSupersample(edges, width, height, rule, samples) {
  const n = samples;
  const data = new Array(width * height).fill(0);
  const inc = 1 / (n * n);
  for (let py = 0; py < height; py++) {
    for (let j = 0; j < n; j++) {
      const y = py + (j + 0.5) / n;
      const crossings = scanlineCrossings(edges, y);
      if (crossings.length === 0) continue;
      let ci = 0;
      let w = 0;
      for (let px = 0; px < width; px++) {
        let hits = 0;
        for (let i = 0; i < n; i++) {
          const x = px + (i + 0.5) / n;
          while (ci < crossings.length && crossings[ci].x <= x) {
            w += crossings[ci].dir;
            ci++;
          }
          if (insideFromWinding(w, rule)) hits++;
        }
        if (hits) data[py * width + px] += hits * inc;
      }
    }
  }
  return { width, height, data };
}
