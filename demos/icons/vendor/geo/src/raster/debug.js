// Coverage-buffer debug dumps.
//
// Pure string producers — the library performs no I/O; callers print or write the
// result. Intended for eyeballing rasterizer output during development.

/**
 * Render a coverage buffer as ASCII art, one character per pixel, rows separated by
 * newlines. The ramp maps coverage 0→first char, 1→last char.
 * @param {{width:number, height:number, data:number[]}} cov
 * @param {{ramp?: string}} [opts]
 * @returns {string}
 */
export function coverageToAscii(cov, opts = {}) {
  const ramp = opts.ramp ?? ' .:-=+*#%@';
  let out = '';
  for (let y = 0; y < cov.height; y++) {
    for (let x = 0; x < cov.width; x++) {
      const v = Math.min(1, Math.max(0, cov.data[y * cov.width + x]));
      out += ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))];
    }
    out += '\n';
  }
  return out;
}

/**
 * Render a coverage buffer as an ASCII ("plain") PGM image, coverage 0→0 (black),
 * 1→maxval (white).
 * @param {{width:number, height:number, data:number[]}} cov
 * @param {{maxval?: number}} [opts]
 * @returns {string}
 */
export function coverageToPgm(cov, opts = {}) {
  const maxval = opts.maxval ?? 255;
  const lines = ['P2', `${cov.width} ${cov.height}`, String(maxval)];
  for (let y = 0; y < cov.height; y++) {
    const row = new Array(cov.width);
    for (let x = 0; x < cov.width; x++) {
      const v = Math.min(1, Math.max(0, cov.data[y * cov.width + x]));
      row[x] = Math.round(v * maxval);
    }
    lines.push(row.join(' '));
  }
  return lines.join('\n') + '\n';
}
