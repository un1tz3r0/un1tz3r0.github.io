// Public rasterization entry (F4): path → anti-aliased coverage buffer.
//
// The coverage buffer is plain data — { width, height, data } with data a row-major
// Array<number> (index = y·width + x, y-down), values in [0, 1]: the fraction of each
// pixel square covered by the filled region. Plain arrays keep the buffer
// JSON-serializable (the golden corpus embeds expected buffers verbatim) and map
// directly onto the target languages of the wider project.

import { NONZERO, EVENODD } from '../core/path.js';
import { FLATNESS_RASTER } from '../core/tolerance.js';
import { pathToEdges, IDENTITY } from './edges.js';
import { rasterizeSupersample } from './supersample.js';
import { rasterizeAnalytic } from './analytic.js';
import { rasterizeHybrid } from './hybrid.js';

const MODES = ['analytic', 'supersample', 'hybrid'];

function assertPositiveInt(v, name) {
  if (!Number.isInteger(v) || v <= 0) {
    throw new TypeError(`rasterize: ${name} must be a positive integer`);
  }
}

/**
 * Rasterize the filled region of a path to a coverage buffer.
 *
 * @param {object} pth  Path
 * @param {object} opts
 * @param {number} opts.width   buffer width in pixels (positive integer)
 * @param {number} opts.height  buffer height in pixels (positive integer)
 * @param {'analytic'|'supersample'|'hybrid'} [opts.mode='analytic']  'analytic' is the
 *   reference method (exact area coverage of the flattened polygon); 'supersample'
 *   (N×N point sampling) and 'hybrid' (exact in x, sampled in y) cross-check it.
 * @param {'nonzero'|'evenodd'} [opts.fillRule]  override; defaults to pth.fillRule
 * @param {{a,b,c,d,e,f}} [opts.transform]  path→device affine (see edges.js); identity
 * @param {number} [opts.samples=4]  supersample grid is samples×samples
 * @param {number} [opts.ySamples=4]  hybrid sub-scanlines per pixel row
 * @param {number} [opts.flatness=FLATNESS_RASTER]  curve flattening tolerance, device px
 * @returns {{width:number, height:number, data:number[]}}
 */
export function rasterize(pth, opts = {}) {
  const { width, height } = opts;
  assertPositiveInt(width, 'width');
  assertPositiveInt(height, 'height');
  const mode = opts.mode ?? 'analytic';
  if (!MODES.includes(mode)) {
    throw new TypeError(`rasterize: unknown mode '${mode}' (expected ${MODES.join(', ')})`);
  }
  const rule = opts.fillRule ?? pth.fillRule ?? NONZERO;
  if (rule !== NONZERO && rule !== EVENODD) {
    throw new TypeError(`rasterize: fillRule must be '${NONZERO}' or '${EVENODD}'`);
  }
  const samples = opts.samples ?? 4;
  assertPositiveInt(samples, 'samples');
  const ySamples = opts.ySamples ?? 4;
  assertPositiveInt(ySamples, 'ySamples');

  const edges = pathToEdges(pth, opts.transform ?? IDENTITY, opts.flatness ?? FLATNESS_RASTER);
  switch (mode) {
    case 'analytic':
      return rasterizeAnalytic(edges, width, height, rule);
    case 'supersample':
      return rasterizeSupersample(edges, width, height, rule, samples);
    case 'hybrid':
      return rasterizeHybrid(edges, width, height, rule, ySamples);
    default:
      // Unreachable — the MODES gate above rejects unknown modes.
      throw new TypeError(`rasterize: unknown mode '${mode}'`);
  }
}
