// F19 R5 — markers: patterns placed *at nodes* rather than bent along the path.
//
// The contrast with `pathAlongPath` is the whole point. A marker is rigidly placed — it is
// translated, scaled and rotated, and never distorted — so an arrowhead stays an arrowhead
// on a tight curve where a bent copy would be visibly sheared. That is why this shares
// nothing with stroke space beyond the file it lives next to.
//
// Orientation follows SVG's `orient`, including the part that is easy to get wrong: at an
// interior node the direction is the **bisector** of the incoming and outgoing tangents,
// not either one. Using `tangentOut` alone puts an arrowhead visibly askew at every corner.
// `nodeNormals` already computes that bisector, with the cusp fallback already chosen, so
// this reuses it rather than re-deriving a second opinion about the same geometry.

import { path } from '../core/path.js';
import { nodeNormals } from '../core/sample.js';
import { transformPath, composeAll, translation, rotation, scaling } from '../core/affine.js';
import { EPS_COINCIDENT } from '../core/tolerance.js';

/**
 * Place markers at a path's nodes.
 *
 * Returns **only the markers**, not the path they decorate. Markers are ornament drawn on
 * top of a stroke, and a caller that wants them merged can union them; a caller that wants
 * them filled differently — the usual case — needs them separate, and merging here would
 * throw that away irreversibly.
 *
 * @param {object} pth  Path to decorate
 * @param {{start?:object, mid?:object, end?:object}} markers  marker geometry
 * @param {object} [opts]
 * @param {'auto'|'auto-start-reverse'|number} [opts.orient='auto']  number = fixed radians
 * @param {number} [opts.strokeWidth=1]
 * @param {'strokeWidth'|'userSpaceOnUse'} [opts.markerUnits='strokeWidth']
 * @param {{x:number,y:number}} [opts.ref={x:0,y:0}]  marker point that lands on the node
 * @returns {object} Path
 */
export function applyMarkers(pth, markers = {}, opts = {}) {
  const orient = opts.orient ?? 'auto';
  if (typeof orient !== 'number' && orient !== 'auto' && orient !== 'auto-start-reverse') {
    throw new TypeError(`applyMarkers: orient must be 'auto', 'auto-start-reverse' or radians`);
  }
  const markerUnits = opts.markerUnits ?? 'strokeWidth';
  if (markerUnits !== 'strokeWidth' && markerUnits !== 'userSpaceOnUse') {
    throw new TypeError(`applyMarkers: markerUnits must be 'strokeWidth' or 'userSpaceOnUse'`);
  }
  const scale = markerUnits === 'strokeWidth' ? (opts.strokeWidth ?? 1) : 1;
  const ref = opts.ref ?? { x: 0, y: 0 };

  const nodes = nodeNormals(pth);
  const out = [];
  for (const site of markerSites(pth, nodes)) {
    const marker = markers[site.role];
    if (!marker) continue;
    const angle =
      typeof orient === 'number'
        ? orient
        : nodeAngle(site.node) +
          // `auto-start-reverse` exists so one arrowhead definition serves both ends: the
          // start marker points back down the path instead of along it.
          (orient === 'auto-start-reverse' && site.role === 'start' ? Math.PI : 0);
    const m = composeAll([
      translation(site.node.point.x, site.node.point.y),
      rotation(angle),
      scaling(scale),
      translation(-ref.x, -ref.y),
    ]);
    out.push(...transformPath(marker, m).subpaths);
  }
  return path(out, { fillRule: markers.start?.fillRule ?? markers.mid?.fillRule ?? markers.end?.fillRule });
}

/**
 * Which node gets which marker.
 *
 * A closed subpath has no first or last node — the loop has a seam, not ends. SVG still
 * draws a start and an end marker there, so both land on the seam node and every other node
 * takes `mid`. Reporting that plainly beats silently dropping two markers on closed input.
 */
export function markerSites(pth, nodes = nodeNormals(pth)) {
  const sites = [];
  const bySubpath = new Map();
  for (const n of nodes) {
    if (!bySubpath.has(n.subpathIndex)) bySubpath.set(n.subpathIndex, []);
    bySubpath.get(n.subpathIndex).push(n);
  }
  for (const [si, list] of bySubpath) {
    const closed = pth.subpaths[si].closed;
    for (let k = 0; k < list.length; k++) {
      if (closed) {
        if (k === 0) sites.push({ role: 'start', node: list[k] }, { role: 'end', node: list[k] });
        else sites.push({ role: 'mid', node: list[k] });
      } else if (k === 0) sites.push({ role: 'start', node: list[k] });
      else if (k === list.length - 1) sites.push({ role: 'end', node: list[k] });
      else sites.push({ role: 'mid', node: list[k] });
    }
  }
  return sites;
}

/**
 * The direction a marker faces at a node: the bisector of the two tangents.
 *
 * At a cusp the tangents cancel and the bisector is undefined; falling back to the incoming
 * tangent matches what `nodeNormals` does for the normal at the same node, so a marker and
 * the normal at a cusp never disagree about which way the path was going.
 */
export function nodeAngle(node) {
  const bx = node.tangentIn.x + node.tangentOut.x;
  const by = node.tangentIn.y + node.tangentOut.y;
  if (Math.hypot(bx, by) <= EPS_COINCIDENT) {
    return Math.atan2(node.tangentIn.y, node.tangentIn.x);
  }
  return Math.atan2(by, bx);
}
