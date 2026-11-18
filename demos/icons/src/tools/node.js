// Node tool: reshape paths by their anchor points and bezier handles. DESIGN.md §6.
//
//   drag an anchor / handle / segment     move it (Alt on a handle breaks the pair)
//   double-click a segment                insert a point (the curve does not move)
//   double-click an anchor                toggle corner ↔ smooth
//   Delete                                remove the selected points
//   arrows                                nudge the selected points
//
// Parametric shapes are not converted behind the user's back: they show handles for
// their own parameters (corner radius, radii, star points, line ends). Objects with a
// gradient fill show handles for the gradient's geometry.

import { Tool } from './base.js';
import { findNode, patchNodes, updateNodes, removeNodes, worldMatrix } from '../core/model/tree.js';
import * as PD from '../core/geometry/pathdata.js';
import { localBounds } from '../core/geometry/bounds.js';
import { polygonVertices, starVertices } from '../core/geometry/shapes.js';
import { apply, invert, mul, applyVector, boxFromPoints, boxContainsPoint, fmt } from '../core/affine.js';
import { viewMatrix } from '../render/viewport.js';
import { handleV, circleV, lineV, rectV, v } from '../render/overlay.js';

const key = (id, sub, node) => `${id}:${sub}:${node}`;

/** Editable subpaths per path-data string. Path data is immutable, so this never goes stale. */
const editCache = new Map();
function editable(d) {
  let subs = editCache.get(d);
  if (!subs) {
    try {
      subs = PD.toEditable(d);
    } catch {
      subs = [];
    }
    if (editCache.size > 200) editCache.clear();
    editCache.set(d, subs);
  }
  return subs;
}

/**
 * Parameter handles of a parametric shape, in the shape's own coordinates.
 * @returns {{id: string, p: {x:number,y:number}, set: (params: any, q: {x:number,y:number}) => any}[]}
 */
function shapeHandles(node) {
  const p = node.params;
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  switch (node.shape) {
    case 'rect':
      return [{
        id: 'radius',
        p: { x: p.x + p.width - Math.max(p.rx, 0), y: p.y },
        set: (params, q) => {
          const r = clamp(params.x + params.width - q.x, 0, Math.min(params.width, params.height) / 2);
          return { ...params, rx: r, ry: r };
        },
      }];
    case 'ellipse':
      return [
        { id: 'rx', p: { x: p.cx + p.rx, y: p.cy }, set: (params, q) => ({ ...params, rx: Math.abs(q.x - params.cx) }) },
        { id: 'ry', p: { x: p.cx, y: p.cy + p.ry }, set: (params, q) => ({ ...params, ry: Math.abs(q.y - params.cy) }) },
      ];
    case 'line':
      return [
        { id: 'p1', p: { x: p.x1, y: p.y1 }, set: (params, q) => ({ ...params, x1: q.x, y1: q.y }) },
        { id: 'p2', p: { x: p.x2, y: p.y2 }, set: (params, q) => ({ ...params, x2: q.x, y2: q.y }) },
      ];
    case 'polygon': {
      const [first] = polygonVertices({ ...p, rounding: 0 });
      return [{
        id: 'radius',
        p: first,
        set: (params, q) => ({
          ...params,
          radius: Math.hypot(q.x - params.cx, q.y - params.cy),
          rotation: Math.atan2(q.y - params.cy, q.x - params.cx) + Math.PI / 2,
        }),
      }];
    }
    case 'star': {
      const [outer, inner] = starVertices(p);
      return [
        {
          id: 'outer',
          p: outer,
          set: (params, q) => ({
            ...params,
            outer: Math.hypot(q.x - params.cx, q.y - params.cy),
            rotation: Math.atan2(q.y - params.cy, q.x - params.cx) + Math.PI / 2,
          }),
        },
        { id: 'inner', p: inner, set: (params, q) => ({ ...params, inner: clamp(Math.hypot(q.x - params.cx, q.y - params.cy), 0, params.outer) }) },
      ];
    }
    default:
      return [];
  }
}

/** Handles for a gradient fill, in the node's own coordinates (gradients use bbox units). */
function gradientHandles(node) {
  const paint = node.fill;
  if (paint?.type !== 'linear' && paint?.type !== 'radial') return [];
  const b = localBounds(node);
  if (!b || !(b.width > 0) || !(b.height > 0)) return [];
  const out = (u, w) => ({ x: b.x + u * b.width, y: b.y + w * b.height });
  const back = (q) => ({ u: (q.x - b.x) / b.width, w: (q.y - b.y) / b.height });
  if (paint.type === 'linear') {
    return [
      { id: 'g1', p: out(paint.x1, paint.y1), set: (pt, q) => ({ ...pt, x1: back(q).u, y1: back(q).w }) },
      { id: 'g2', p: out(paint.x2, paint.y2), set: (pt, q) => ({ ...pt, x2: back(q).u, y2: back(q).w }) },
    ];
  }
  return [
    { id: 'gc', p: out(paint.cx, paint.cy), set: (pt, q) => ({ ...pt, cx: back(q).u, cy: back(q).w }) },
    { id: 'gr', p: out(paint.cx + paint.r, paint.cy), set: (pt, q) => ({ ...pt, r: Math.max(0.01, Math.abs(back(q).u - pt.cx)) }) },
  ];
}

export class NodeTool extends Tool {
  static id = 'node';
  static label = 'Edit nodes';
  static icon = 'spline-pointer';
  static shortcut = 'A';

  constructor(app) {
    super(app);
    /** Selected anchors, as "pathId:subpath:node" keys. @type {Set<string>} */
    this.sel = new Set();
    /** @type {any} */
    this.state = null;
    this.hover = null;
  }

  activate() {
    this.sel.clear();
    this.#publish();
  }

  deactivate() {
    if (this.state && this.editor.gesture) this.editor.cancel();
    this.state = null;
    this.sel.clear();
    this.canvas?.clearSnap();
    this.#publish();
  }

  /** Tell the properties panel what is selected. */
  #publish() {
    this.editor.store.set({ nodeSelection: { count: this.sel.size, version: Date.now() + Math.random() } });
  }

  // --- what is being edited ------------------------------------------------------------------

  /** Selected path nodes, each with its editable subpaths and screen transform. */
  #paths() {
    const view = viewMatrix(this.view);
    return this.editor.selection
      .map((id) => findNode(this.doc, id))
      .filter((n) => n?.type === 'path')
      .map((node) => {
        const world = worldMatrix(this.doc, node.id);
        return { node, id: node.id, subs: editable(node.d), world, screen: mul(view, world) };
      });
  }

  #shapes() {
    const view = viewMatrix(this.view);
    return this.editor.selection
      .map((id) => findNode(this.doc, id))
      .filter((n) => n && (n.type === 'shape' || n.type === 'path' || n.type === 'text'))
      .map((node) => {
        const world = worldMatrix(this.doc, node.id);
        return {
          node,
          world,
          screen: mul(view, world),
          handles: [
            ...(node.type === 'shape' ? shapeHandles(node).map((hd) => ({ ...hd, kind: 'param' })) : []),
            ...gradientHandles(node).map((hd) => ({ ...hd, kind: 'gradient' })),
          ],
        };
      })
      .filter((s) => s.handles.length);
  }

  /** Selected anchor references `{id, sub, node}` that still exist. */
  selectedRefs() {
    const out = [];
    for (const path of this.#paths()) {
      path.subs.forEach((sp, si) => sp.nodes.forEach((_, ni) => {
        if (this.sel.has(key(path.id, si, ni))) out.push({ id: path.id, sub: si, node: ni });
      }));
    }
    return out;
  }

  /** The single selected anchor with its path, or null. */
  singleAnchor() {
    const refs = this.selectedRefs();
    if (refs.length !== 1) return null;
    const path = this.#paths().find((p) => p.id === refs[0].id);
    const anchor = path.subs[refs[0].sub].nodes[refs[0].node];
    return { ...refs[0], anchor, world: apply(path.world, anchor) };
  }

  // --- hit testing ---------------------------------------------------------------------------

  #hit(screen) {
    const HIT = this.canvas.hitRadius;
    const near = (p) => Math.hypot(p.x - screen.x, p.y - screen.y) <= HIT;
    // Parameter and gradient handles sit on top.
    for (const shape of this.#shapes()) {
      for (const hd of shape.handles) {
        if (near(apply(shape.screen, hd.p))) return { type: hd.kind, shape, handle: hd };
      }
    }
    const paths = this.#paths();
    // Bezier handles of selected anchors.
    for (const path of paths) {
      for (let si = 0; si < path.subs.length; si++) {
        const nodes = path.subs[si].nodes;
        for (let ni = 0; ni < nodes.length; ni++) {
          if (!this.sel.has(key(path.id, si, ni))) continue;
          for (const which of ['hin', 'hout']) {
            const hd = nodes[ni][which];
            if (hd && near(apply(path.screen, hd))) return { type: 'handle', path, sub: si, node: ni, which };
          }
        }
      }
    }
    for (const path of paths) {
      for (let si = 0; si < path.subs.length; si++) {
        const nodes = path.subs[si].nodes;
        for (let ni = 0; ni < nodes.length; ni++) {
          if (near(apply(path.screen, nodes[ni]))) return { type: 'anchor', path, sub: si, node: ni };
        }
      }
    }
    for (const path of paths) {
      const inv = invert(path.screen);
      if (!inv) continue;
      const local = apply(inv, screen);
      const hit = PD.nearestOnPath(path.subs, local);
      if (!hit) continue;
      const s = apply(path.screen, hit.point);
      if (Math.hypot(s.x - screen.x, s.y - screen.y) <= HIT) return { type: 'segment', path, sub: hit.sub, seg: hit.seg, t: hit.t };
    }
    return null;
  }

  // --- pointer -------------------------------------------------------------------------------

  onPointerDown(e) {
    if (e.button !== 0) return;
    const hit = this.#hit(e.screen);
    const editor = this.editor;
    if (!hit) {
      const id = e.hit({ deep: true });
      const node = id ? findNode(this.doc, id) : null;
      if (node && !editor.selection.includes(id)) {
        // Clicking another object makes it the one being edited.
        editor.select(e.shift ? [...editor.selection, id] : [id]);
        if (!e.shift) this.sel.clear();
        this.#publish();
        this.invalidate();
        return;
      }
      this.state = { type: 'marquee', start: e.screen, current: e.screen, shift: e.shift, base: new Set(this.sel) };
      return;
    }
    if (hit.type === 'param' || hit.type === 'gradient') {
      editor.begin(hit.type === 'gradient' ? 'Edit gradient' : 'Edit shape');
      this.state = { type: hit.type, id: hit.shape.node.id, handleId: hit.handle.id, world: hit.shape.world };
      return;
    }
    const k = hit.type === 'segment' ? null : key(hit.path.id, hit.sub, hit.node);
    if (hit.type === 'anchor') {
      if (e.shift) {
        if (this.sel.has(k)) this.sel.delete(k);
        else this.sel.add(k);
      } else if (!this.sel.has(k)) {
        this.sel = new Set([k]);
      }
      this.#publish();
      if (!this.sel.has(k)) {
        this.invalidate();
        return;
      }
    } else if (hit.type === 'segment') {
      // Dragging a segment moves the anchors at both of its ends.
      const sp = hit.path.subs[hit.sub];
      const a = key(hit.path.id, hit.sub, hit.seg);
      const b = key(hit.path.id, hit.sub, (hit.seg + 1) % sp.nodes.length);
      if (!e.shift) this.sel = new Set([a, b]);
      else {
        this.sel.add(a);
        this.sel.add(b);
      }
      this.#publish();
    }
    editor.begin(hit.type === 'handle' ? 'Move handle' : 'Move points');
    this.state = {
      type: hit.type === 'handle' ? 'handle' : 'anchors',
      hit,
      start: e.raw,
      // The anchor (or segment point) under the pointer is what snaps.
      grab: hit.type === 'anchor' ? apply(hit.path.world, hit.path.subs[hit.sub].nodes[hit.node]) : e.raw,
      origin: new Map(this.#paths().map((p) => [p.id, p.subs])),
      moved: false,
    };
    this.invalidate();
  }

  onPointerMove(e) {
    this.hover = e;
    const st = this.state;
    if (!st) {
      const hit = this.#hit(e.screen);
      const sig = hit ? `${hit.type}:${hit.path?.id ?? hit.shape?.node.id}:${hit.sub}:${hit.node ?? hit.seg}:${hit.which ?? hit.handle?.id ?? ''}` : '';
      if (sig !== this._hoverSig) {
        this._hoverSig = sig;
        this._hoverHit = hit;
        this.invalidate();
      }
      return;
    }
    if (st.type === 'marquee') {
      st.current = e.screen;
      this.invalidate();
      return;
    }
    if (st.type === 'param' || st.type === 'gradient') {
      const p = this.canvas.snap(e.raw, { disabled: e.mod, exclude: [st.id] });
      const inv = invert(st.world);
      if (!inv) return;
      const local = apply(inv, p);
      this.editor.preview((doc) => updateNodes(doc, [st.id], (node) => {
        if (st.type === 'param') {
          const hd = shapeHandles(node).find((x) => x.id === st.handleId);
          return hd ? { ...node, params: hd.set(node.params, local) } : node;
        }
        const hd = gradientHandles(node).find((x) => x.id === st.handleId);
        return hd ? { ...node, fill: hd.set(node.fill, local) } : node;
      }));
      return;
    }
    st.moved = true;
    if (st.type === 'handle') this.#dragHandle(st, e);
    else this.#dragAnchors(st, e);
  }

  #dragAnchors(st, e) {
    // Snap the grabbed point; everything selected moves by the same document-space delta.
    const exclude = [...st.origin.keys()];
    const target = this.canvas.snap({ x: st.grab.x + e.raw.x - st.start.x, y: st.grab.y + e.raw.y - st.start.y }, { disabled: e.mod, exclude });
    let dx = target.x - st.grab.x;
    let dy = target.y - st.grab.y;
    if (e.shift) {
      if (Math.abs(dx) > Math.abs(dy)) dy = 0;
      else dx = 0;
    }
    const paths = this.#paths();
    this.editor.preview((doc) => {
      let next = doc;
      for (const [id, subs] of st.origin) {
        const world = paths.find((p) => p.id === id)?.world;
        const inv = world && invert(world);
        if (!inv) continue;
        const d = applyVector(inv, { x: dx, y: dy });
        let touched = false;
        const moved = subs.map((sp, si) => ({
          ...sp,
          nodes: sp.nodes.map((n, ni) => {
            if (!this.sel.has(key(id, si, ni))) return n;
            touched = true;
            return PD.translateNode(n, d.x, d.y);
          }),
        }));
        if (touched) next = patchNodes(next, [id], { d: PD.fromEditable(moved) });
      }
      return next;
    });
  }

  #dragHandle(st, e) {
    const { path, sub, node, which } = st.hit;
    const inv = invert(path.world);
    if (!inv) return;
    const p = this.canvas.snap(e.raw, { disabled: e.mod, exclude: [path.id] });
    const local = apply(inv, p);
    const subs = st.origin.get(path.id);
    const next = subs.map((sp, si) => (si !== sub ? sp : {
      ...sp,
      nodes: sp.nodes.map((n, ni) => (ni === node ? PD.moveHandle(n, which, local, e.alt) : n)),
    }));
    this.editor.preview((doc) => patchNodes(doc, [path.id], { d: PD.fromEditable(next) }));
  }

  onPointerUp(e) {
    const st = this.state;
    this.state = null;
    this.canvas.clearSnap();
    if (!st) return;
    if (st.type === 'marquee') {
      const area = boxFromPoints(st.start, e.screen);
      if (area.width < 3 && area.height < 3) {
        if (!st.shift) {
          // A click on nothing: first drop the points, then the object.
          if (this.sel.size) this.sel.clear();
          else this.editor.select([]);
        }
      } else {
        const next = st.shift ? new Set(st.base) : new Set();
        for (const path of this.#paths()) {
          path.subs.forEach((sp, si) => sp.nodes.forEach((n, ni) => {
            if (boxContainsPoint(area, apply(path.screen, n))) next.add(key(path.id, si, ni));
          }));
        }
        this.sel = next;
      }
      this.#publish();
    } else {
      this.editor.commit();
      // A click (no drag) on one of several selected anchors narrows to that anchor.
      if (st.type === 'anchors' && !st.moved && st.hit.type === 'anchor' && !e.shift) {
        this.sel = new Set([key(st.hit.path.id, st.hit.sub, st.hit.node)]);
      }
      this.#publish();
    }
    this.invalidate();
  }

  onPointerCancel() {
    if (this.editor.gesture) this.editor.cancel();
    this.state = null;
    this.canvas.clearSnap();
    this.invalidate();
  }

  onDoubleClick(e) {
    const hit = this.#hit(e.screen);
    if (!hit) {
      // Double-clicking a shape offers what the user evidently wants: its points.
      const id = e.hit({ deep: true });
      const node = id ? findNode(this.doc, id) : null;
      if (node?.type === 'shape' && this.editor.commands.get('object.convertToPath')) {
        this.editor.select([id]);
        this.editor.commands.run('object.convertToPath');
      }
      return;
    }
    if (hit.type === 'segment') {
      const { subpaths, index } = PD.insertNode(hit.path.subs, hit.sub, hit.seg, hit.t);
      this.editor.apply('Insert point', (doc) => patchNodes(doc, [hit.path.id], { d: PD.fromEditable(subpaths) }));
      this.sel = new Set([key(hit.path.id, hit.sub, index)]);
      this.#publish();
    } else if (hit.type === 'anchor') {
      const anchor = hit.path.subs[hit.sub].nodes[hit.node];
      this.sel = new Set([key(hit.path.id, hit.sub, hit.node)]);
      this.setType(anchor.type === 'corner' ? 'smooth' : 'corner');
    }
    this.invalidate();
  }

  // --- operations on the selected anchors ----------------------------------------------------

  /** Apply `fn(subpaths, refs) → subpaths` to every path that has selected anchors. */
  #edit(label, fn) {
    const refs = this.selectedRefs();
    if (!refs.length) return false;
    const byPath = new Map();
    for (const r of refs) {
      if (!byPath.has(r.id)) byPath.set(r.id, []);
      byPath.get(r.id).push(r);
    }
    const paths = this.#paths();
    const changed = this.editor.apply(label, (doc) => {
      let next = doc;
      for (const [id, list] of byPath) {
        const path = paths.find((p) => p.id === id);
        const subs = fn(path.subs, list);
        if (!subs) continue;
        next = subs.length ? patchNodes(next, [id], { d: PD.fromEditable(subs) }) : removeNodes(next, [id]);
      }
      return next;
    });
    return changed;
  }

  /** @param {'corner'|'smooth'|'symmetric'} type */
  setType(type) {
    this.#edit('Change point type', (subs, refs) => {
      const wanted = new Set(refs.map((r) => `${r.sub}:${r.node}`));
      return subs.map((sp, si) => ({
        ...sp,
        nodes: sp.nodes.map((n, ni) => {
          if (!wanted.has(`${si}:${ni}`)) return n;
          if (type === 'corner') return { ...n, hin: null, hout: null, type: 'corner' };
          return PD.setNodeType(sp, ni, type);
        }),
      }));
    });
    this.#publish();
    this.invalidate();
  }

  deleteSelected() {
    const done = this.#edit('Delete points', (subs, refs) => PD.deleteNodes(subs, refs));
    this.sel.clear();
    this.#publish();
    this.invalidate();
    return done;
  }

  /** Open the path at each selected anchor. */
  breakSelected() {
    this.#edit('Break path', (subs, refs) => {
      let next = subs;
      // Later anchors first, so earlier indexes stay valid.
      for (const r of [...refs].sort((a, b) => b.sub - a.sub || b.node - a.node)) next = PD.breakAt(next, r.sub, r.node);
      return next;
    });
    this.sel.clear();
    this.#publish();
    this.invalidate();
  }

  /** Join two selected end points (closing a subpath, or merging two). */
  joinSelected() {
    const refs = this.selectedRefs();
    if (refs.length !== 2 || refs[0].id !== refs[1].id) return false;
    const done = this.#edit('Join points', (subs, list) => {
      const joined = PD.joinEnds(subs, list[0], list[1]);
      return joined === subs ? null : joined;
    });
    this.sel.clear();
    this.#publish();
    this.invalidate();
    return done;
  }

  /** Move the single selected anchor to a document position (from the properties panel). */
  moveSingleTo(point) {
    const one = this.singleAnchor();
    if (!one) return (doc) => doc;
    return (doc) => {
      const node = findNode(doc, one.id);
      const inv = invert(worldMatrix(doc, one.id));
      if (node?.type !== 'path' || !inv) return doc;
      const subs = editable(node.d);
      const anchor = subs[one.sub]?.nodes[one.node];
      if (!anchor) return doc;
      const local = apply(inv, { x: point.x ?? one.world.x, y: point.y ?? one.world.y });
      const moved = subs.map((sp, si) => (si !== one.sub ? sp : {
        ...sp,
        nodes: sp.nodes.map((n, ni) => (ni === one.node ? PD.translateNode(n, local.x - anchor.x, local.y - anchor.y) : n)),
      }));
      return patchNodes(doc, [one.id], { d: PD.fromEditable(moved) });
    };
  }

  onKeyDown(e) {
    if (e.key === 'Escape') {
      if (this.state) this.onPointerCancel();
      else if (this.sel.size) {
        this.sel.clear();
        this.#publish();
        this.invalidate();
      } else this.editor.setTool('select');
      return true;
    }
    if (!this.sel.size) return false;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      this.deleteSelected();
      return true;
    }
    const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (arrows[e.key] && !e.ctrlKey && !e.metaKey) {
      const doc = this.doc;
      const snapGrid = doc.snap.enabled && doc.snap.grid;
      const step = snapGrid ? doc.grid.spacingX / Math.max(1, doc.grid.subdivisions) : 1;
      const stepY = snapGrid ? doc.grid.spacingY / Math.max(1, doc.grid.subdivisions) : 1;
      const mult = e.shiftKey ? 10 : 1;
      const delta = { x: arrows[e.key][0] * step * mult, y: arrows[e.key][1] * stepY * mult };
      const paths = this.#paths();
      this.#edit('Nudge points', (subs, refs) => {
        const world = paths.find((p) => p.id === refs[0].id).world;
        const inv = invert(world);
        if (!inv) return null;
        const d = applyVector(inv, delta);
        const wanted = new Set(refs.map((r) => `${r.sub}:${r.node}`));
        return subs.map((sp, si) => ({ ...sp, nodes: sp.nodes.map((n, ni) => (wanted.has(`${si}:${ni}`) ? PD.translateNode(n, d.x, d.y) : n)) }));
      });
      this.#publish();
      return true;
    }
    return false;
  }

  cursor() {
    if (this.state?.type === 'anchors' || this.state?.type === 'handle') return 'move';
    const hit = this._hoverHit;
    if (!hit) return 'default';
    return hit.type === 'segment' ? 'copy' : 'pointer';
  }

  overlay() {
    const out = [];
    for (const path of this.#paths()) {
      const S = (p) => apply(path.screen, p);
      const f = (p) => `${fmt(p.x, 2)} ${fmt(p.y, 2)}`;
      // The path's own outline, so its shape is visible whatever its paint.
      let d = '';
      for (const sp of path.subs) {
        sp.nodes.forEach((n, i) => {
          if (i === 0) d += `M${f(S(n))}`;
        });
        for (let i = 0; i < PD.segmentCount(sp); i++) {
          const [, c1, c2, b] = PD.segmentPoints(sp, i);
          d += `C${f(S(c1))} ${f(S(c2))} ${f(S(b))}`;
        }
        if (sp.closed) d += 'Z';
      }
      out.push(v('path', `np-${path.id}`, { d, class: 'preview' }));
      path.subs.forEach((sp, si) => sp.nodes.forEach((n, ni) => {
        const k = key(path.id, si, ni);
        const selected = this.sel.has(k);
        const a = S(n);
        if (selected) {
          for (const which of ['hin', 'hout']) {
            if (!n[which]) continue;
            const hp = S(n[which]);
            out.push(lineV(`nl-${k}-${which}`, a, hp, { class: 'anchor-line' }), circleV(`nh-${k}-${which}`, hp, 3.5, { class: 'handle' }));
          }
        }
        // Smooth points are round, corners square.
        if (n.type === 'corner') out.push(handleV(`na-${k}`, a, { class: selected ? 'handle on' : 'handle' }));
        else out.push(circleV(`na-${k}`, a, 4, { class: selected ? 'handle on' : 'handle' }));
      }));
    }
    for (const shape of this.#shapes()) {
      for (const hd of shape.handles) {
        const p = apply(shape.screen, hd.p);
        const k2 = `sh-${shape.node.id}-${hd.id}`;
        if (hd.kind === 'gradient') out.push(circleV(k2, p, 5, { class: 'handle', 'stroke-width': '2' }));
        else out.push(v('path', k2, { d: `M${fmt(p.x, 1)} ${fmt(p.y - 5, 1)}l5 5l-5 5l-5 -5z`, class: 'handle on' }));
      }
      const g = shape.handles.filter((hd) => hd.kind === 'gradient');
      if (g.length === 2) out.push(lineV(`gl-${shape.node.id}`, apply(shape.screen, g[0].p), apply(shape.screen, g[1].p), { class: 'anchor-line', 'stroke-dasharray': '3 2' }));
    }
    const st = this.state;
    if (st?.type === 'marquee') out.push(rectV('node-marquee', boxFromPoints(st.start, st.current), { class: 'marquee' }));
    return out;
  }
}
