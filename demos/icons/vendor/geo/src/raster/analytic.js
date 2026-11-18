// Exact analytic coverage rasterizer (F4, mode 'analytic') — the reference method.
//
// Signed-area accumulation in the style of font-rs and FreeType's smooth rasterizer
// (references: R. Levien, "Inside the fastest font renderer in the world" (font-rs);
// FreeType `ftgrays.c`, `gray_render_line`). Each directed edge is clipped to the
// buffer, split at integer y (scanline bands) and integer x (cell) boundaries, and
// every elementary straight piece inside cell (ix, iy) deposits its signed height
// dy into an accumulation grid `a` (width+1 columns; the extra column absorbs
// right-spill):
//
//     xmid = (xa + xb)/2 − ix ∈ [0, 1]        (midpoint x-fraction inside the cell)
//     a[iy][ix]   += dy · (1 − xmid)
//     a[iy][ix+1] += dy · xmid
//
// Why this is exact for straight pieces: the area to the right of the piece inside
// its own cell is dy · (1 − xmid) (a trapezoid), and every cell further right sees
// the full winding height dy. The two-way split makes the *inclusive* left-to-right
// prefix sum of a row reconstruct exactly that: cell ix gets the partial trapezoid,
// cell ix+1 onward get dy in total. Coverage is then the prefix sum mapped through
// the fill rule (`coverageFromAcc`): nonzero saturates at 1, evenodd folds through
// the triangle wave — exact for polygons up to f64 rounding wherever at most two
// winding levels straddle a pixel (the standard production trade-off; see DESIGN.md).
//
// Curve error is bounded separately by the flattening tolerance used to build the
// edges (FLATNESS_RASTER device pixels, see edges.js).

import { coverageFromAcc } from './scanline.js';

// Deposit one elementary piece (within a single cell row band iy, x-monotone span
// xa→xb, signed height dy) into the accumulation row.
function deposit(a, stride, width, iy, xa, ya, xb, yb) {
  const dy = yb - ya;
  const xm = 0.5 * (xa + xb);
  if (xm >= width) return; // right of the buffer: affects only the spill column
  const row = iy * stride;
  if (xm < 0) {
    // Fully left of the buffer: every visible cell in the row sees the full height.
    a[row] += dy;
    return;
  }
  const ix = Math.floor(xm);
  const frac = xm - ix;
  a[row + ix] += dy * (1 - frac);
  a[row + ix + 1] += dy * frac;
}

// Split a band piece (contained in scanline band iy) at integer x boundaries and
// deposit each elementary piece.
function accumulateBandPiece(a, stride, width, iy, x0, y0, x1, y1) {
  if (x0 === x1) {
    deposit(a, stride, width, iy, x0, y0, x1, y1);
    return;
  }
  const right = x1 > x0;
  let cx = x0;
  let cy = y0;
  let guard = 2 * (width + 4);
  while (cx !== x1 && guard-- > 0) {
    const nx = right ? Math.min(Math.floor(cx) + 1, x1) : Math.max(Math.ceil(cx) - 1, x1);
    const t = (nx - x0) / (x1 - x0);
    const ny = y0 + t * (y1 - y0);
    deposit(a, stride, width, iy, cx, cy, nx, ny);
    cx = nx;
    cy = ny;
  }
}

// Clip one edge vertically to the buffer, split it at integer y boundaries, and
// accumulate each band piece.
function accumulateEdge(a, stride, width, height, e) {
  const dy = e.y1 - e.y0;
  const dx = e.x1 - e.x0;
  // Parameter range of the edge with y inside [0, height]. (Portions above/below the
  // buffer influence no visible scanline; x-clipping happens in deposit().)
  let t0 = 0;
  let t1 = 1;
  if (dy > 0) {
    if (e.y1 <= 0 || e.y0 >= height) return;
    if (e.y0 < 0) t0 = -e.y0 / dy;
    if (e.y1 > height) t1 = (height - e.y0) / dy;
  } else {
    if (e.y0 <= 0 || e.y1 >= height) return;
    if (e.y0 > height) t0 = (height - e.y0) / dy;
    if (e.y1 < 0) t1 = -e.y0 / dy;
  }
  const ax = e.x0 + t0 * dx;
  const ay = e.y0 + t0 * dy;
  const bx = e.x0 + t1 * dx;
  const by = e.y0 + t1 * dy;

  const down = by > ay;
  let cx = ax;
  let cy = ay;
  let guard = 2 * (height + 4);
  while (cy !== by && guard-- > 0) {
    const ny = down ? Math.min(Math.floor(cy) + 1, by) : Math.max(Math.ceil(cy) - 1, by);
    const t = (ny - ay) / (by - ay);
    const nx = ax + t * (bx - ax);
    const iy = Math.floor(Math.min(cy, ny));
    accumulateBandPiece(a, stride, width, iy, cx, cy, nx, ny);
    cx = nx;
    cy = ny;
  }
}

/**
 * Analytic coverage of the edge set.
 * @param {{x0,y0,x1,y1}[]} edges  device-space directed edges (see edges.js)
 * @param {number} width
 * @param {number} height
 * @param {'nonzero'|'evenodd'} rule
 * @returns {{width:number, height:number, data:number[]}}
 */
export function rasterizeAnalytic(edges, width, height, rule) {
  const stride = width + 1;
  const a = new Array(stride * height).fill(0);
  for (const e of edges) accumulateEdge(a, stride, width, height, e);
  const data = new Array(width * height).fill(0);
  for (let y = 0; y < height; y++) {
    let acc = 0;
    for (let x = 0; x < width; x++) {
      acc += a[y * stride + x];
      data[y * width + x] = coverageFromAcc(acc, rule);
    }
  }
  return { width, height, data };
}
