// Higher-level document edits built from the tree primitives: duplicate, group, ungroup,
// align, distribute, flip. Each returns `{doc, selection}` or a new doc.

import { IDENTITY, mul, invert, translate, scale, rotate } from '../affine.js';
import { cloneNode, createGroup } from './nodes.js';
import {
  indexOf, topLevel, insertNodes, removeNodes, updateNodes, parentMatrix, worldMatrix, findNode,
} from './tree.js';
import { transformNode, transformSelection } from '../geometry/transform.js';
import { worldBounds, selectionBounds } from '../geometry/bounds.js';

/** @typedef {import('./nodes.js').Doc} Doc */

/**
 * Copies of the selected nodes, each placed directly above its original.
 * @param {Doc} doc
 * @param {string[]} ids
 * @param {{offset?: {x:number, y:number}}} [opts]
 * @returns {{doc: Doc, selection: string[], pairs: {source: string, copy: any}[]}}
 */
export function duplicateNodes(doc, ids, opts = {}) {
  const index = indexOf(doc);
  const pairs = topLevel(doc, ids).map((id) => ({ source: id, copy: cloneNode(index.get(id).node) }));
  let next = doc;
  for (const { source, copy } of pairs) {
    const entry = indexOf(next).get(source);
    next = insertNodes(next, entry.parent?.id ?? null, [copy], entry.index + 1);
  }
  const selection = pairs.map((p) => p.copy.id);
  if (opts.offset && (opts.offset.x || opts.offset.y)) {
    next = transformSelection(next, selection, translate(opts.offset.x, opts.offset.y));
  }
  return { doc: next, selection, pairs };
}

/**
 * Wrap the selected nodes in a new group, placed where the topmost of them was. Nodes
 * keep their appearance even when they came from different parents.
 * @returns {{doc: Doc, selection: string[]}}
 */
export function groupNodes(doc, ids, overrides = {}) {
  const targets = topLevel(doc, ids);
  if (targets.length === 0) return { doc, selection: ids };
  const index = indexOf(doc);
  const top = index.get(targets[targets.length - 1]);
  const parentId = top.parent?.id ?? null;
  const groupParentWorld = parentMatrix(doc, top.node.id);
  const inv = invert(groupParentWorld) ?? IDENTITY;
  const children = targets.map((id) => {
    const node = index.get(id).node;
    // Re-express each node's document-space transform relative to the group's parent.
    const local = mul(inv, worldMatrix(doc, id));
    return { ...node, transform: local };
  });
  const group = createGroup(children, overrides);
  // Insert where the topmost member was, counting only siblings that stay behind.
  const siblings = top.parent ? /** @type {any} */ (top.parent).children : doc.children;
  const targetSet = new Set(targets);
  const at = siblings.slice(0, top.index).filter((n) => !targetSet.has(n.id)).length;
  const next = insertNodes(removeNodes(doc, targets), parentId, [group], at);
  return { doc: next, selection: [group.id] };
}

/**
 * Dissolve groups, leaving their children in place with the group's transform applied.
 * @returns {{doc: Doc, selection: string[]}}
 */
export function ungroupNodes(doc, ids) {
  const selection = [];
  const groups = topLevel(doc, ids).filter((id) => findNode(doc, id)?.type === 'group');
  const keep = ids.filter((id) => !groups.includes(id));
  const next = updateNodes(doc, groups, (/** @type {any} */ group) => {
    const children = group.children.map((child) => {
      const moved = transformNode(child, group.transform);
      // A group's opacity belongs to its members once the group is gone.
      const out = group.opacity < 1 ? { ...moved, opacity: moved.opacity * group.opacity } : moved;
      selection.push(out.id);
      return out;
    });
    return children;
  });
  return { doc: next, selection: [...keep, ...selection] };
}

/**
 * @param {Doc} doc
 * @param {string[]} ids
 * @param {'left'|'center'|'right'|'top'|'middle'|'bottom'} how
 * @returns {Doc}
 */
export function alignNodes(doc, ids, how) {
  const targets = topLevel(doc, ids);
  if (targets.length === 0) return doc;
  // One object aligns to the artboard; several align to their common bounds.
  const frame = targets.length === 1
    ? { x: 0, y: 0, width: doc.artboard.width, height: doc.artboard.height }
    : selectionBounds(doc, targets);
  if (!frame) return doc;
  let next = doc;
  for (const id of targets) {
    const b = worldBounds(doc, id);
    if (!b) continue;
    let dx = 0;
    let dy = 0;
    if (how === 'left') dx = frame.x - b.x;
    else if (how === 'center') dx = frame.x + frame.width / 2 - (b.x + b.width / 2);
    else if (how === 'right') dx = frame.x + frame.width - (b.x + b.width);
    else if (how === 'top') dy = frame.y - b.y;
    else if (how === 'middle') dy = frame.y + frame.height / 2 - (b.y + b.height / 2);
    else if (how === 'bottom') dy = frame.y + frame.height - (b.y + b.height);
    if (Math.abs(dx) > 1e-9 || Math.abs(dy) > 1e-9) next = transformSelection(next, [id], translate(dx, dy));
  }
  return next;
}

/**
 * Space three or more objects so the gaps between them are equal.
 * @param {'horizontal'|'vertical'} axis
 * @returns {Doc}
 */
export function distributeNodes(doc, ids, axis) {
  const targets = topLevel(doc, ids);
  const pos = axis === 'horizontal' ? 'x' : 'y';
  const size = axis === 'horizontal' ? 'width' : 'height';
  const items = targets.map((id) => ({ id, box: worldBounds(doc, id) })).filter((i) => i.box);
  if (items.length < 3) return doc;
  items.sort((a, b) => a.box[pos] + a.box[size] / 2 - (b.box[pos] + b.box[size] / 2));
  const first = items[0].box;
  const last = items[items.length - 1].box;
  const total = items.reduce((sum, i) => sum + i.box[size], 0);
  const gap = (last[pos] + last[size] - first[pos] - total) / (items.length - 1);
  let cursor = first[pos];
  let next = doc;
  for (const item of items) {
    const delta = cursor - item.box[pos];
    if (Math.abs(delta) > 1e-9) {
      next = transformSelection(next, [item.id], axis === 'horizontal' ? translate(delta, 0) : translate(0, delta));
    }
    cursor += item.box[size] + gap;
  }
  return next;
}

/** Mirror the selection about its own center. @param {'horizontal'|'vertical'} axis */
export function flipNodes(doc, ids, axis) {
  const box = selectionBounds(doc, ids);
  if (!box) return doc;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  return transformSelection(doc, ids, axis === 'horizontal' ? scale(-1, 1, cx, cy) : scale(1, -1, cx, cy));
}

/** Rotate the selection about its own center. */
export function rotateNodes(doc, ids, radians) {
  const box = selectionBounds(doc, ids);
  if (!box) return doc;
  return transformSelection(doc, ids, rotate(radians, box.x + box.width / 2, box.y + box.height / 2));
}

/**
 * Move / resize the selection so its bounds become `target` (any of x, y, width, height).
 * @param {{x?:number, y?:number, width?:number, height?:number}} target
 */
export function setSelectionBounds(doc, ids, target) {
  const box = selectionBounds(doc, ids);
  if (!box) return doc;
  let next = doc;
  const sx = target.width !== undefined && box.width > 1e-9 ? Math.max(target.width, 1e-4) / box.width : 1;
  const sy = target.height !== undefined && box.height > 1e-9 ? Math.max(target.height, 1e-4) / box.height : 1;
  if (sx !== 1 || sy !== 1) next = transformSelection(next, ids, scale(sx, sy, box.x, box.y));
  const dx = target.x !== undefined ? target.x - box.x : 0;
  const dy = target.y !== undefined ? target.y - box.y : 0;
  if (dx || dy) next = transformSelection(next, ids, translate(dx, dy));
  return next;
}
