// An editable view of path data, for the Node and Pen tools.
//
// SVG path data is a list of drawing commands; editing wants a list of anchor points,
// each with an optional incoming and outgoing bezier handle. This module converts
// between the two. Quadratic segments and elliptical arcs are converted to cubics on the
// way in (an arc cannot keep being an arc once one of its ends is dragged freely).

import { parsePath, arcCenter } from '@geo/paths';
import { fmt } from '../affine.js';

/** @typedef {{x:number, y:number}} Point */
/**
 * @typedef {{x:number, y:number, hin: Point|null, hout: Point|null,
 *            type: 'corner'|'smooth'|'symmetric'}} Anchor
 *   `hin` / `hout` are absolute positions of the handles, or null for a straight side.
 */
/** @typedef {{closed: boolean, nodes: Anchor[]}} EditSubpath */

const EPS = 1e-6;
const same = (p, q) => Math.abs(p.x - q.x) < EPS && Math.abs(p.y - q.y) < EPS;
const lerp = (p, q, t) => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });

/** Cubic control points for an elliptical arc segment (one cubic per ≤ 90° of sweep). */
function arcToCubics(seg) {
  const { cx, cy, rx, ry, phi, theta1, dtheta } = arcCenter(seg);
  const pieces = Math.max(1, Math.ceil(Math.abs(dtheta) / (Math.PI / 2) - 1e-9));
  const step = dtheta / pieces;
  const k = (4 / 3) * Math.tan(step / 4);
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);
  const at = (t) => {
    const x = rx * Math.cos(t);
    const y = ry * Math.sin(t);
    return { x: cx + cosP * x - sinP * y, y: cy + sinP * x + cosP * y };
  };
  const d = (t) => {
    const x = -rx * Math.sin(t);
    const y = ry * Math.cos(t);
    return { x: cosP * x - sinP * y, y: sinP * x + cosP * y };
  };
  const out = [];
  for (let i = 0; i < pieces; i++) {
    const t0 = theta1 + i * step;
    const t1 = t0 + step;
    const p0 = i === 0 ? seg.p0 : at(t0);
    const p3 = i === pieces - 1 ? seg.p1 : at(t1);
    const d0 = d(t0);
    const d1 = d(t1);
    out.push({
      p0,
      p1: { x: p0.x + k * d0.x, y: p0.y + k * d0.y },
      p2: { x: p3.x - k * d1.x, y: p3.y - k * d1.y },
      p3,
    });
  }
  return out;
}

/** A geo segment as one or more `{p0, p1|null, p2|null, p3}` cubic-ish pieces. */
function toCubicPieces(seg) {
  switch (seg.type) {
    case 'line':
      return [{ p0: seg.p0, p1: null, p2: null, p3: seg.p1 }];
    case 'quad':
      return [{
        p0: seg.p0,
        p1: lerp(seg.p0, seg.p1, 2 / 3),
        p2: lerp(seg.p2, seg.p1, 2 / 3),
        p3: seg.p2,
      }];
    case 'cubic':
      return [{ p0: seg.p0, p1: seg.p1, p2: seg.p2, p3: seg.p3 }];
    case 'arc':
      return arcToCubics(seg);
    default:
      throw new TypeError(`pathdata: unknown segment type "${seg.type}"`);
  }
}

/** Classify an anchor from the geometry of its handles. */
export function inferType(node) {
  if (!node.hin || !node.hout) return 'corner';
  const ax = node.x - node.hin.x, ay = node.y - node.hin.y;
  const bx = node.hout.x - node.x, by = node.hout.y - node.y;
  const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
  if (la < EPS || lb < EPS) return 'corner';
  const cross = Math.abs(ax * by - ay * bx) / (la * lb);
  const dot = (ax * bx + ay * by) / (la * lb);
  if (cross > 0.01 || dot < 0) return 'corner';
  return Math.abs(la - lb) < 0.01 * Math.max(la, lb) ? 'symmetric' : 'smooth';
}

/**
 * Parse path data into editable subpaths.
 * @param {string} d
 * @returns {EditSubpath[]}
 */
export function toEditable(d) {
  const path = parsePath(d);
  const out = [];
  for (const sp of path.subpaths) {
    if (!sp.segments.length) continue;
    const pieces = sp.segments.flatMap(toCubicPieces);
    /** @type {Anchor[]} */
    const nodes = [{ x: pieces[0].p0.x, y: pieces[0].p0.y, hin: null, hout: null, type: 'corner' }];
    for (const piece of pieces) {
      const prev = nodes[nodes.length - 1];
      if (piece.p1 && !same(piece.p1, prev)) prev.hout = { ...piece.p1 };
      nodes.push({
        x: piece.p3.x,
        y: piece.p3.y,
        hin: piece.p2 && !same(piece.p2, piece.p3) ? { ...piece.p2 } : null,
        hout: null,
        type: 'corner',
      });
    }
    if (sp.closed && nodes.length > 1 && same(nodes[0], nodes[nodes.length - 1])) {
      const last = nodes.pop();
      nodes[0].hin = last.hin;
    }
    for (const node of nodes) node.type = inferType(node);
    out.push({ closed: sp.closed, nodes });
  }
  return out;
}

/**
 * Serialize editable subpaths back to path data.
 * @param {EditSubpath[]} subpaths
 * @param {number} [precision]
 */
export function fromEditable(subpaths, precision = 4) {
  const n = (v) => fmt(v, precision);
  const parts = [];
  for (const sp of subpaths) {
    if (!sp.nodes.length) continue;
    const first = sp.nodes[0];
    parts.push(`M ${n(first.x)} ${n(first.y)}`);
    const seg = (a, b, closing) => {
      if (!a.hout && !b.hin) {
        if (!closing) parts.push(`L ${n(b.x)} ${n(b.y)}`);
        return;
      }
      const c1 = a.hout ?? a;
      const c2 = b.hin ?? b;
      parts.push(`C ${n(c1.x)} ${n(c1.y)} ${n(c2.x)} ${n(c2.y)} ${n(b.x)} ${n(b.y)}`);
    };
    for (let i = 1; i < sp.nodes.length; i++) seg(sp.nodes[i - 1], sp.nodes[i], false);
    if (sp.closed && sp.nodes.length > 1) {
      seg(sp.nodes[sp.nodes.length - 1], first, true);
      parts.push('Z');
    }
  }
  return parts.join(' ');
}

// --- segment helpers ---------------------------------------------------------------------

/** Number of segments in a subpath (a closed one has a segment back to the start). */
export function segmentCount(sp) {
  if (sp.nodes.length < 2) return 0;
  return sp.closed ? sp.nodes.length : sp.nodes.length - 1;
}

/** The four control points of segment `i` (which runs from node i to node i+1). */
export function segmentPoints(sp, i) {
  const a = sp.nodes[i];
  const b = sp.nodes[(i + 1) % sp.nodes.length];
  return [a, a.hout ?? a, b.hin ?? b, b];
}

/** @param {Point[]} points  the four control points @param {number} t */
export function cubicAt(points, t) {
  const [p0, p1, p2, p3] = points;
  const u = 1 - t;
  const w0 = u * u * u, w1 = 3 * u * u * t, w2 = 3 * u * t * t, w3 = t * t * t;
  return { x: w0 * p0.x + w1 * p1.x + w2 * p2.x + w3 * p3.x, y: w0 * p0.y + w1 * p1.y + w2 * p2.y + w3 * p3.y };
}

/**
 * The closest point on any segment to `p`.
 * @param {EditSubpath[]} subpaths
 * @param {Point} p
 * @returns {{sub:number, seg:number, t:number, point:Point, dist:number} | null}
 */
export function nearestOnPath(subpaths, p) {
  let best = null;
  subpaths.forEach((sp, si) => {
    for (let i = 0; i < segmentCount(sp); i++) {
      const pts = segmentPoints(sp, i);
      const dist2 = (t) => {
        const q = cubicAt(pts, t);
        return (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
      };
      // Coarse scan, then a few rounds of interval refinement around the best sample.
      const STEPS = 24;
      let bt = 0, bd = Infinity;
      for (let k = 0; k <= STEPS; k++) {
        const d = dist2(k / STEPS);
        if (d < bd) { bd = d; bt = k / STEPS; }
      }
      let span = 1 / STEPS;
      for (let r = 0; r < 12; r++) {
        span /= 2;
        for (const t of [Math.max(0, bt - span), Math.min(1, bt + span)]) {
          const d = dist2(t);
          if (d < bd) { bd = d; bt = t; }
        }
      }
      if (!best || bd < best.dist * best.dist) {
        best = { sub: si, seg: i, t: bt, point: cubicAt(pts, bt), dist: Math.sqrt(bd) };
      }
    }
  });
  return best;
}

/**
 * Insert an anchor on segment `seg` at parameter `t` without changing the curve.
 * @returns {{subpaths: EditSubpath[], index: number}} the new subpaths and the new node's index
 */
export function insertNode(subpaths, sub, seg, t) {
  const sp = subpaths[sub];
  const ia = seg;
  const ib = (seg + 1) % sp.nodes.length;
  const a = sp.nodes[ia];
  const b = sp.nodes[ib];
  const straight = !a.hout && !b.hin;
  const [p0, p1, p2, p3] = segmentPoints(sp, seg);
  const q0 = lerp(p0, p1, t), q1 = lerp(p1, p2, t), q2 = lerp(p2, p3, t);
  const r0 = lerp(q0, q1, t), r1 = lerp(q1, q2, t);
  const s = lerp(r0, r1, t);
  /** @type {Anchor} */
  const mid = straight
    ? { x: s.x, y: s.y, hin: null, hout: null, type: 'corner' }
    : { x: s.x, y: s.y, hin: r0, hout: r1, type: 'smooth' };
  const nodes = sp.nodes.map((node, i) => {
    if (straight) return node;
    if (i === ia && i === ib) return { ...node, hout: q0, hin: q2 };
    if (i === ia) return { ...node, hout: q0 };
    if (i === ib) return { ...node, hin: q2 };
    return node;
  });
  nodes.splice(seg + 1, 0, mid);
  const next = subpaths.map((s2, i) => (i === sub ? { ...sp, nodes } : s2));
  return { subpaths: next, index: seg + 1 };
}

/**
 * Remove anchors. Subpaths left with fewer than two anchors disappear.
 * @param {EditSubpath[]} subpaths
 * @param {{sub:number, node:number}[]} refs
 */
export function deleteNodes(subpaths, refs) {
  const doomed = new Set(refs.map((r) => `${r.sub}:${r.node}`));
  return subpaths
    .map((sp, si) => ({ ...sp, nodes: sp.nodes.filter((_, ni) => !doomed.has(`${si}:${ni}`)) }))
    .filter((sp) => sp.nodes.length >= 2);
}

/** Change an anchor's type, adjusting or creating handles to match. */
export function setNodeType(sp, index, type) {
  const node = sp.nodes[index];
  const count = sp.nodes.length;
  if (type === 'corner') return { ...node, type };
  let { hin, hout } = node;
  if (!hin || !hout) {
    // Invent handles along the direction between the neighbours.
    const prev = sp.nodes[(index - 1 + count) % count];
    const next = sp.nodes[(index + 1) % count];
    const hasPrev = sp.closed || index > 0;
    const hasNext = sp.closed || index < count - 1;
    const from = hasPrev ? prev : node;
    const to = hasNext ? next : node;
    let dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const lin = hasPrev ? Math.hypot(node.x - prev.x, node.y - prev.y) / 3 : 0;
    const lout = hasNext ? Math.hypot(next.x - node.x, next.y - node.y) / 3 : 0;
    if (!hin && hasPrev) hin = { x: node.x - dx * lin, y: node.y - dy * lin };
    if (!hout && hasNext) hout = { x: node.x + dx * lout, y: node.y + dy * lout };
  }
  if (hin && hout) {
    const lin = Math.hypot(node.x - hin.x, node.y - hin.y);
    const lout = Math.hypot(hout.x - node.x, hout.y - node.y);
    let dx = hout.x - hin.x, dy = hout.y - hin.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const a = type === 'symmetric' ? (lin + lout) / 2 : lin;
    const b = type === 'symmetric' ? (lin + lout) / 2 : lout;
    hin = { x: node.x - dx * a, y: node.y - dy * a };
    hout = { x: node.x + dx * b, y: node.y + dy * b };
  }
  return { ...node, hin, hout, type };
}

/**
 * Move one handle of an anchor, keeping the opposite handle consistent with its type.
 * @param {Anchor} node
 * @param {'hin'|'hout'} which
 * @param {Point} to
 * @param {boolean} [independent]  break the relationship (Alt-drag)
 */
export function moveHandle(node, which, to, independent = false) {
  const other = which === 'hin' ? 'hout' : 'hin';
  const next = { ...node, [which]: { x: to.x, y: to.y } };
  if (independent) return { ...next, type: 'corner' };
  const opposite = node[other];
  if (!opposite || node.type === 'corner') return next;
  const dx = node.x - to.x, dy = node.y - to.y;
  const len = Math.hypot(dx, dy);
  if (len < EPS) return next;
  const keep = node.type === 'symmetric' ? len : Math.hypot(opposite.x - node.x, opposite.y - node.y);
  next[other] = { x: node.x + (dx / len) * keep, y: node.y + (dy / len) * keep };
  return next;
}

/** Translate an anchor together with its handles. */
export function translateNode(node, dx, dy) {
  return {
    ...node,
    x: node.x + dx,
    y: node.y + dy,
    hin: node.hin && { x: node.hin.x + dx, y: node.hin.y + dy },
    hout: node.hout && { x: node.hout.x + dx, y: node.hout.y + dy },
  };
}

/** Split a subpath open at an anchor (closed → open starting there; open → two pieces). */
export function breakAt(subpaths, sub, index) {
  const sp = subpaths[sub];
  const out = [];
  subpaths.forEach((s, i) => {
    if (i !== sub) {
      out.push(s);
      return;
    }
    if (sp.closed) {
      const rotated = [...sp.nodes.slice(index), ...sp.nodes.slice(0, index)];
      const first = { ...rotated[0], hin: null, type: 'corner' };
      const last = { ...rotated[0], hout: null, type: 'corner' };
      out.push({ closed: false, nodes: [first, ...rotated.slice(1), last] });
    } else if (index > 0 && index < sp.nodes.length - 1) {
      const node = sp.nodes[index];
      out.push({ closed: false, nodes: [...sp.nodes.slice(0, index), { ...node, hout: null, type: 'corner' }] });
      out.push({ closed: false, nodes: [{ ...node, hin: null, type: 'corner' }, ...sp.nodes.slice(index + 1)] });
    } else {
      out.push(s);
    }
  });
  return out;
}

/** Reverse the direction of a subpath. */
export function reverseSubpath(sp) {
  return {
    closed: sp.closed,
    nodes: [...sp.nodes].reverse().map((n) => ({ ...n, hin: n.hout, hout: n.hin })),
  };
}

/**
 * Join two open-subpath end nodes: closes a subpath when both ends belong to it, or
 * merges two subpaths into one. Returns the input unchanged if the refs are not ends.
 */
export function joinEnds(subpaths, a, b) {
  const isEnd = (r) => {
    const sp = subpaths[r.sub];
    return sp && !sp.closed && (r.node === 0 || r.node === sp.nodes.length - 1);
  };
  if (!isEnd(a) || !isEnd(b)) return subpaths;
  if (a.sub === b.sub) {
    if (a.node === b.node) return subpaths;
    return subpaths.map((sp, i) => (i === a.sub ? { ...sp, closed: true } : sp));
  }
  let first = subpaths[a.sub];
  let second = subpaths[b.sub];
  if (a.node === 0) first = reverseSubpath(first);
  if (b.node !== 0) second = reverseSubpath(second);
  const merged = { closed: false, nodes: [...first.nodes, ...second.nodes] };
  return subpaths.filter((_, i) => i !== a.sub && i !== b.sub).concat([merged]);
}
