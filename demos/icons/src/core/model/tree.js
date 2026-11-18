// Tree queries and immutable edits over a document.
//
// "Container" below means anything with a `children` array: the document itself or a
// group. A parent id of `null` means the document root.

import { IDENTITY, mul } from '../affine.js';

/** @typedef {import('./nodes.js').Doc} Doc */
/** @typedef {import('./nodes.js').Node} Node */
/** @typedef {{node: Node, parent: Node | null, index: number, depth: number}} IndexEntry */

/** @type {WeakMap<object, Map<string, IndexEntry>>} */
const indexCache = new WeakMap();

/**
 * id → {node, parent, index, depth} for every node. Documents are immutable, so the
 * index is built once per root and cached against it.
 * @param {Doc} doc
 */
export function indexOf(doc) {
  let index = indexCache.get(doc);
  if (index) return index;
  index = new Map();
  const visit = (children, parent, depth) => {
    children.forEach((node, i) => {
      index.set(node.id, { node, parent, index: i, depth });
      if (node.type === 'group') visit(node.children, node, depth + 1);
    });
  };
  visit(doc.children, null, 0);
  indexCache.set(doc, index);
  return index;
}

/** @returns {Node | undefined} */
export function findNode(doc, id) {
  return indexOf(doc).get(id)?.node;
}

/** The node's parent group, or `null` for a top-level node. */
export function parentOf(doc, id) {
  return indexOf(doc).get(id)?.parent ?? null;
}

/** Ancestor groups from the outermost down to the direct parent. */
export function ancestorsOf(doc, id) {
  const index = indexOf(doc);
  const out = [];
  let entry = index.get(id);
  while (entry?.parent) {
    out.unshift(entry.parent);
    entry = index.get(entry.parent.id);
  }
  return out;
}

export function isDescendantOf(doc, id, ancestorId) {
  return ancestorsOf(doc, id).some((a) => a.id === ancestorId);
}

/** Every node in paint order (bottom first), groups before their children. */
export function allNodes(doc) {
  return [...indexOf(doc).values()].map((e) => e.node);
}

/** Children of a container given by id (`null` = document root). */
export function childrenOf(doc, parentId) {
  if (parentId == null) return doc.children;
  const node = findNode(doc, parentId);
  return node?.type === 'group' ? node.children : [];
}

/** The transform from the node's parent space to document space. */
export function parentMatrix(doc, id) {
  return ancestorsOf(doc, id).reduce((m, a) => mul(m, a.transform), IDENTITY);
}

/** The transform from the node's own space to document space. */
export function worldMatrix(doc, id) {
  const node = findNode(doc, id);
  return node ? mul(parentMatrix(doc, id), node.transform) : IDENTITY;
}

/** True if the node or any ancestor is hidden / locked. */
export function isEffectivelyHidden(doc, id) {
  const node = findNode(doc, id);
  return !node || !node.visible || ancestorsOf(doc, id).some((a) => !a.visible);
}
export function isEffectivelyLocked(doc, id) {
  const node = findNode(doc, id);
  return !node || node.locked || ancestorsOf(doc, id).some((a) => a.locked);
}

/**
 * Reduce a set of ids to the ones whose ancestors are not also in the set, in paint
 * order (bottom first). This is "what the user thinks is selected".
 * @returns {string[]}
 */
export function topLevel(doc, ids) {
  const set = new Set(ids);
  const index = indexOf(doc);
  const out = [];
  for (const [id] of index) {
    if (!set.has(id)) continue;
    if (ancestorsOf(doc, id).some((a) => set.has(a.id))) continue;
    out.push(id);
  }
  return out;
}

// --- edits -------------------------------------------------------------------------------

function rebuild(container, fn) {
  const children = fn(container.children, container);
  return children === container.children ? container : { ...container, children };
}

/**
 * Apply `fn` to each listed node, returning a new document. `fn` returns the replacement
 * node, an array of replacement nodes, or `null` to remove it.
 * @param {Doc} doc
 * @param {Iterable<string>} ids
 * @param {(node: Node) => Node | Node[] | null} fn
 * @returns {Doc}
 */
export function updateNodes(doc, ids, fn) {
  const targets = new Set(ids);
  if (targets.size === 0) return doc;
  const index = indexOf(doc);
  // Only descend into groups that have a target somewhere beneath them.
  const onPath = new Set();
  for (const id of targets) {
    let entry = index.get(id);
    while (entry?.parent && !onPath.has(entry.parent.id)) {
      onPath.add(entry.parent.id);
      entry = index.get(entry.parent.id);
    }
  }
  const visit = (children) => {
    let changed = false;
    const out = [];
    for (const child of children) {
      let next = child;
      if (targets.has(child.id)) {
        next = fn(child);
      } else if (child.type === 'group' && onPath.has(child.id)) {
        next = rebuild(child, visit);
      }
      if (next !== child) changed = true;
      if (Array.isArray(next)) out.push(...next);
      else if (next) out.push(next);
    }
    return changed ? out : children;
  };
  return /** @type {Doc} */ (rebuild(doc, visit));
}

/** Shallow-merge `patch` (or the result of `patch(node)`) into each listed node. */
export function patchNodes(doc, ids, patch) {
  return updateNodes(doc, ids, (node) => {
    const delta = typeof patch === 'function' ? patch(node) : patch;
    if (!delta) return node;
    for (const key of Object.keys(delta)) {
      if (delta[key] !== node[key]) return { ...node, ...delta };
    }
    return node;
  });
}

export function removeNodes(doc, ids) {
  return updateNodes(doc, ids, () => null);
}

/**
 * Insert nodes into a container at an index (default: on top).
 * @param {Doc} doc
 * @param {string | null} parentId
 * @param {Node[]} nodes
 * @param {number} [at]
 * @returns {Doc}
 */
export function insertNodes(doc, parentId, nodes, at) {
  if (nodes.length === 0) return doc;
  const splice = (children) => {
    const i = at === undefined ? children.length : Math.max(0, Math.min(children.length, at));
    return [...children.slice(0, i), ...nodes, ...children.slice(i)];
  };
  if (parentId == null) return { ...doc, children: splice(doc.children) };
  return updateNodes(doc, [parentId], (group) =>
    group.type === 'group' ? { ...group, children: splice(group.children) } : group,
  );
}

/**
 * Move nodes to a new container and index, keeping their relative paint order. The index
 * is interpreted against the destination *before* the moved nodes are taken out of it.
 * Moving a group into itself or its own descendant is ignored.
 * @returns {Doc}
 */
export function moveNodes(doc, ids, parentId, at) {
  const moving = topLevel(doc, ids).filter(
    (id) => parentId == null || (id !== parentId && !isDescendantOf(doc, parentId, id)),
  );
  if (moving.length === 0) return doc;
  const index = indexOf(doc);
  const nodes = moving.map((id) => index.get(id).node);
  const dest = childrenOf(doc, parentId);
  let target = at === undefined ? dest.length : Math.max(0, Math.min(dest.length, at));
  // Removing nodes that sit below the insertion point shifts it down.
  const movingSet = new Set(moving);
  target -= dest.slice(0, target).filter((n) => movingSet.has(n.id)).length;
  return insertNodes(removeNodes(doc, moving), parentId, nodes, target);
}

/**
 * Change paint order within each node's own container.
 * @param {'front'|'back'|'forward'|'backward'} how
 * @returns {Doc}
 */
export function reorderNodes(doc, ids, how) {
  const selected = new Set(topLevel(doc, ids));
  if (selected.size === 0) return doc;
  const reorder = (children) => {
    if (!children.some((c) => selected.has(c.id))) return children;
    const picked = children.filter((c) => selected.has(c.id));
    const rest = children.filter((c) => !selected.has(c.id));
    let out;
    if (how === 'front') out = [...rest, ...picked];
    else if (how === 'back') out = [...picked, ...rest];
    else {
      out = [...children];
      const step = how === 'forward' ? 1 : -1;
      const order = how === 'forward' ? [...out.keys()].reverse() : [...out.keys()];
      for (const i of order) {
        const j = i + step;
        if (!selected.has(out[i].id) || j < 0 || j >= out.length || selected.has(out[j].id)) continue;
        [out[i], out[j]] = [out[j], out[i]];
      }
    }
    return out.every((c, i) => c === children[i]) ? children : out;
  };
  const visit = (container) => {
    let children = reorder(container.children);
    let changed = children !== container.children;
    const mapped = children.map((c) => {
      if (c.type !== 'group') return c;
      const next = visit(c);
      if (next !== c) changed = true;
      return next;
    });
    return changed ? { ...container, children: mapped } : container;
  };
  return /** @type {Doc} */ (visit(doc));
}

/** Replace one node by others (in place, same position). */
export function replaceNode(doc, id, replacement) {
  return updateNodes(doc, [id], () => replacement);
}

/** Ids from `ids` that still exist in `doc`. */
export function existing(doc, ids) {
  const index = indexOf(doc);
  const out = ids.filter((id) => index.has(id));
  return out.length === ids.length ? ids : out;
}
