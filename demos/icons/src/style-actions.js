// Applying colors from outside the properties panel (swatches, drag-and-drop), and the
// list of recently used colors.

import { editor } from './app.js';
import { updateNodes, findNode } from './core/model/tree.js';
import { getSetting, setSetting } from './services/storage/index.js';

/** @type {string[]} most recent first */
let recent = [];
const listeners = new Set();
const MAX_RECENT = 18;

getSetting('recentColors', []).then((saved) => {
  if (Array.isArray(saved) && !recent.length) {
    recent = saved;
    for (const fn of listeners) fn(recent);
  }
});

export const recentColors = () => recent;

/** @param {(colors: string[]) => void} fn */
export function onRecentColors(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function noteColor(color) {
  if (typeof color !== 'string') return;
  const c = color.toLowerCase();
  recent = [c, ...recent.filter((r) => r !== c)].slice(0, MAX_RECENT);
  setSetting('recentColors', recent);
  for (const fn of listeners) fn(recent);
}

/** Everything under the given ids that can take a fill or stroke. */
function targets(doc, ids, which) {
  const out = [];
  const visit = (node) => {
    if (node.type === 'path' || node.type === 'shape' || node.type === 'text') out.push(node.id);
    else if (node.type === 'icon' && which === 'fill' && !node.palette) out.push(node.id);
    else if (node.type === 'group') node.children.forEach(visit);
  };
  for (const id of ids) {
    const node = findNode(doc, id);
    if (node) visit(node);
  }
  return out;
}

/**
 * Set the fill or stroke paint of the given nodes (default: the selection) and make it
 * the default for new objects.
 * @param {'fill'|'stroke'} which
 * @param {import('./core/model/nodes.js').Paint} paint
 * @param {string[]} [ids]
 */
export function applyPaint(which, paint, ids = editor.selection) {
  const style = editor.store.get('style');
  if (which === 'fill') editor.store.set({ style: { ...style, fill: paint } });
  else editor.store.set({ style: { ...style, stroke: { ...style.stroke, paint, width: style.stroke.width > 0 ? style.stroke.width : 1 } } });
  if (paint.type === 'solid') noteColor(paint.color);
  if (!ids.length) return false;
  return editor.apply(which === 'fill' ? 'Fill' : 'Stroke', (doc) =>
    updateNodes(doc, targets(doc, ids, which), (node) => {
      if (node.type === 'icon') return paint.type === 'solid' ? { ...node, color: paint.color } : node;
      if (which === 'fill') return { ...node, fill: paint };
      return { ...node, stroke: { ...node.stroke, paint, width: node.stroke.width > 0 ? node.stroke.width : 1 } };
    }),
  );
}
