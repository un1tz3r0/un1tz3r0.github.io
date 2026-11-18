// The application's commands: editing, arranging, view and tool switching.
// File, path and text commands are registered by their own modules.

import { app, editor } from './app.js';
import { removeNodes, reorderNodes, topLevel, childrenOf, insertNodes, patchNodes, updateNodes, findNode, indexOf } from './core/model/tree.js';
import { cloneNode } from './core/model/nodes.js';
import {
  duplicateNodes, groupNodes, ungroupNodes, alignNodes, distributeNodes, flipNodes, rotateNodes,
} from './core/model/edit.js';
import { transformSelection } from './core/geometry/transform.js';
import { selectionBounds } from './core/geometry/bounds.js';
import { translate } from './core/affine.js';
import { nextZoomStep } from './render/viewport.js';
import { exportSvg } from './core/io/svg-export.js';

const hasSelection = (ed) => ed.selection.length > 0;
const hasMany = (n) => (ed) => topLevel(ed.doc, ed.selection).length >= n;

/** Everything under the selection that carries a fill and stroke. */
function paintable(doc, ids) {
  const out = [];
  const visit = (node) => {
    if (node.type === 'path' || node.type === 'shape' || node.type === 'text') out.push(node);
    else if (node.type === 'group') node.children.forEach(visit);
  };
  for (const id of ids) {
    const node = findNode(doc, id);
    if (node) visit(node);
  }
  return out;
}

/** Style picked up by "Copy style". */
let copiedStyle = null;

/** In-app clipboard. The system clipboard also receives SVG markup, best-effort. */
const clipboard = { nodes: /** @type {any[]} */ ([]), pastes: 0 };

/** One nudge step: the grid step when snapping to the grid, otherwise one unit. */
function nudgeStep(doc) {
  if (doc.snap.enabled && doc.snap.grid) {
    return { x: doc.grid.spacingX / Math.max(1, doc.grid.subdivisions), y: doc.grid.spacingY / Math.max(1, doc.grid.subdivisions) };
  }
  return { x: 1, y: 1 };
}

function copySelection(ed) {
  const index = indexOf(ed.doc);
  const ids = topLevel(ed.doc, ed.selection);
  clipboard.nodes = ids.map((id) => index.get(id).node);
  clipboard.pastes = 0;
  // Offer the selection to other apps as SVG. Failure (no permission) is not an error.
  try {
    const box = selectionBounds(ed.doc, ids);
    if (box && navigator.clipboard?.writeText) {
      const temp = {
        ...ed.doc,
        artboard: { ...ed.doc.artboard, width: box.width || 1, height: box.height || 1, background: { type: 'none' } },
        children: transformSelection({ ...ed.doc, children: clipboard.nodes }, clipboard.nodes.map((n) => n.id), translate(-box.x, -box.y)).children,
      };
      navigator.clipboard.writeText(exportSvg(temp)).catch(() => {});
    }
  } catch {
    /* clipboard access is optional */
  }
}

function setDocFlag(ed, label, patch) {
  ed.apply(label, (doc) => ({ ...doc, ...patch(doc) }));
}

export function registerCommands() {
  const c = editor.commands;

  c.register([
    { id: 'edit.undo', label: 'Undo', icon: 'undo-2', shortcut: 'Mod+Z', group: 'Edit', enabled: (ed) => ed.store.get('history').canUndo, run: (ed) => ed.undo() },
    { id: 'edit.redo', label: 'Redo', icon: 'redo-2', shortcut: 'Mod+Shift+Z', aliases: ['Mod+Y'], group: 'Edit', enabled: (ed) => ed.store.get('history').canRedo, run: (ed) => ed.redo() },
    {
      id: 'edit.delete', label: 'Delete', icon: 'trash-2', shortcut: 'Delete', aliases: ['Backspace'], group: 'Edit', enabled: hasSelection,
      run: (ed) => ed.apply('Delete', (doc) => removeNodes(doc, ed.selection), { selection: [] }),
    },
    {
      id: 'edit.duplicate', label: 'Duplicate', icon: 'copy', shortcut: 'Mod+D', group: 'Edit', enabled: hasSelection,
      run: (ed) => {
        const step = nudgeStep(ed.doc);
        const result = duplicateNodes(ed.doc, ed.selection, { offset: { x: step.x * 2, y: step.y * 2 } });
        ed.apply('Duplicate', () => result.doc, { selection: result.selection });
      },
    },
    { id: 'edit.copy', label: 'Copy', icon: 'copy', shortcut: 'Mod+C', group: 'Edit', enabled: hasSelection, run: copySelection },
    {
      id: 'edit.cut', label: 'Cut', icon: 'scissors', shortcut: 'Mod+X', group: 'Edit', enabled: hasSelection,
      run: (ed) => {
        copySelection(ed);
        ed.apply('Cut', (doc) => removeNodes(doc, ed.selection), { selection: [] });
      },
    },
    {
      id: 'edit.paste', label: 'Paste', icon: 'clipboard', shortcut: 'Mod+V', group: 'Edit', enabled: () => clipboard.nodes.length > 0,
      run: (ed) => {
        clipboard.pastes++;
        const step = nudgeStep(ed.doc);
        const copies = clipboard.nodes.map(cloneNode);
        const scope = ed.store.get('scope');
        const parentId = scope && findNode(ed.doc, scope) ? scope : null;
        const ids = copies.map((n) => n.id);
        ed.apply('Paste', (doc) => {
          const inserted = insertNodes(doc, parentId, copies);
          return transformSelection(inserted, ids, translate(step.x * 2 * clipboard.pastes, step.y * 2 * clipboard.pastes));
        }, { selection: ids });
      },
    },
    {
      id: 'edit.selectAll', label: 'Select all', shortcut: 'Mod+A', group: 'Edit',
      run: (ed) => ed.select(childrenOf(ed.doc, ed.store.get('scope')).filter((n) => n.visible && !n.locked).map((n) => n.id)),
    },
    { id: 'edit.deselect', label: 'Deselect', group: 'Edit', enabled: hasSelection, run: (ed) => ed.select([]) },

    // --- arrange ---
    {
      id: 'object.group', label: 'Group', icon: 'group', shortcut: 'Mod+G', group: 'Arrange', enabled: hasSelection,
      run: (ed) => {
        const result = groupNodes(ed.doc, ed.selection);
        ed.apply('Group', () => result.doc, { selection: result.selection });
        ed.store.set({ scope: null });
      },
    },
    {
      id: 'object.ungroup', label: 'Ungroup', icon: 'ungroup', shortcut: 'Mod+Shift+G', group: 'Arrange',
      enabled: (ed) => ed.selection.some((id) => findNode(ed.doc, id)?.type === 'group'),
      run: (ed) => {
        const result = ungroupNodes(ed.doc, ed.selection);
        ed.apply('Ungroup', () => result.doc, { selection: result.selection });
      },
    },
    .../** @type {any[][]} */ ([
      ['order.front', 'Bring to front', 'bring-to-front', 'Mod+Shift+]', ['Mod+Shift+}'], 'front'],
      ['order.forward', 'Bring forward', 'arrow-up', 'Mod+]', [], 'forward'],
      ['order.backward', 'Send backward', 'arrow-down', 'Mod+[', [], 'backward'],
      ['order.back', 'Send to back', 'send-to-back', 'Mod+Shift+[', ['Mod+Shift+{'], 'back'],
    ]).map(([id, label, icon, shortcut, aliases, how]) => ({
      id, label, icon, shortcut, aliases, group: 'Arrange', enabled: hasSelection,
      run: (ed) => ed.apply(label, (doc) => reorderNodes(doc, ed.selection, how)),
    })),
    .../** @type {any[][]} */ ([
      ['align.left', 'Align left', 'align-start-vertical', 'left'],
      ['align.center', 'Align horizontal centers', 'align-center-vertical', 'center'],
      ['align.right', 'Align right', 'align-end-vertical', 'right'],
      ['align.top', 'Align top', 'align-start-horizontal', 'top'],
      ['align.middle', 'Align vertical centers', 'align-center-horizontal', 'middle'],
      ['align.bottom', 'Align bottom', 'align-end-horizontal', 'bottom'],
    ]).map(([id, label, icon, how]) => ({
      id, label, icon, group: 'Arrange', enabled: hasSelection,
      run: (ed) => ed.apply(label, (doc) => alignNodes(doc, ed.selection, how)),
    })),
    {
      id: 'distribute.horizontal', label: 'Distribute horizontally', icon: 'align-horizontal-distribute-center', group: 'Arrange', enabled: hasMany(3),
      run: (ed) => ed.apply('Distribute', (doc) => distributeNodes(doc, ed.selection, 'horizontal')),
    },
    {
      id: 'distribute.vertical', label: 'Distribute vertically', icon: 'align-vertical-distribute-center', group: 'Arrange', enabled: hasMany(3),
      run: (ed) => ed.apply('Distribute', (doc) => distributeNodes(doc, ed.selection, 'vertical')),
    },
    { id: 'object.flipH', label: 'Flip horizontal', icon: 'flip-horizontal-2', shortcut: 'Shift+H', group: 'Arrange', enabled: hasSelection, run: (ed) => ed.apply('Flip', (doc) => flipNodes(doc, ed.selection, 'horizontal')) },
    { id: 'object.flipV', label: 'Flip vertical', icon: 'flip-vertical-2', shortcut: 'Shift+V', group: 'Arrange', enabled: hasSelection, run: (ed) => ed.apply('Flip', (doc) => flipNodes(doc, ed.selection, 'vertical')) },
    { id: 'object.rotateCW', label: 'Rotate 90° clockwise', icon: 'rotate-cw', group: 'Arrange', enabled: hasSelection, run: (ed) => ed.apply('Rotate', (doc) => rotateNodes(doc, ed.selection, Math.PI / 2)) },
    { id: 'object.rotateCCW', label: 'Rotate 90° counter-clockwise', icon: 'rotate-ccw', group: 'Arrange', enabled: hasSelection, run: (ed) => ed.apply('Rotate', (doc) => rotateNodes(doc, ed.selection, -Math.PI / 2)) },
    {
      id: 'object.toggleLock', label: 'Lock / unlock', icon: 'lock', shortcut: 'Mod+Shift+L', group: 'Arrange', enabled: hasSelection,
      run: (ed) => {
        const lock = !ed.selection.every((id) => findNode(ed.doc, id)?.locked);
        ed.apply(lock ? 'Lock' : 'Unlock', (doc) => patchNodes(doc, ed.selection, { locked: lock }));
      },
    },
    {
      id: 'object.toggleVisible', label: 'Show / hide', icon: 'eye', shortcut: 'Mod+Shift+H', group: 'Arrange', enabled: hasSelection,
      run: (ed) => {
        const show = !ed.selection.every((id) => findNode(ed.doc, id)?.visible);
        ed.apply(show ? 'Show' : 'Hide', (doc) => patchNodes(doc, ed.selection, { visible: show }));
      },
    },

    // --- style ---
    {
      id: 'style.swap', label: 'Swap fill and stroke', shortcut: 'Shift+X', group: 'Style',
      enabled: (ed) => paintable(ed.doc, ed.selection).length > 0,
      run: (ed) => ed.apply('Swap fill and stroke', (doc) => updateNodes(doc, paintable(doc, ed.selection).map((n) => n.id), (node) => ({
        ...node,
        fill: node.stroke.paint,
        stroke: { ...node.stroke, paint: node.fill, width: node.fill.type !== 'none' && !(node.stroke.width > 0) ? 1 : node.stroke.width },
      }))),
    },
    {
      id: 'style.copy', label: 'Copy style', shortcut: 'Mod+Alt+C', group: 'Style',
      enabled: (ed) => paintable(ed.doc, ed.selection).length > 0,
      run: (ed) => {
        const [node] = paintable(ed.doc, ed.selection);
        copiedStyle = { fill: node.fill, stroke: node.stroke, opacity: node.opacity, blend: node.blend, effects: node.effects };
      },
    },
    {
      id: 'style.paste', label: 'Paste style', shortcut: 'Mod+Alt+V', group: 'Style',
      enabled: (ed) => !!copiedStyle && paintable(ed.doc, ed.selection).length > 0,
      run: (ed) => ed.apply('Paste style', (doc) => updateNodes(doc, paintable(doc, ed.selection).map((n) => n.id), (node) => ({ ...node, ...copiedStyle }))),
    },

    // --- nudge ---
    .../** @type {any[][]} */ ([
      ['ArrowLeft', -1, 0], ['ArrowRight', 1, 0], ['ArrowUp', 0, -1], ['ArrowDown', 0, 1],
    ]).flatMap(([key, dx, dy]) => [1, 10].map((mult) => ({
      id: `nudge.${key}${mult > 1 ? '.big' : ''}`,
      label: `Nudge ${String(key).replace('Arrow', '').toLowerCase()}${mult > 1 ? ' ×10' : ''}`,
      shortcut: mult > 1 ? `Shift+${key}` : String(key),
      group: 'Arrange',
      enabled: hasSelection,
      run: (ed) => {
        const step = nudgeStep(ed.doc);
        ed.apply('Nudge', (doc) => transformSelection(doc, ed.selection, translate(Number(dx) * step.x * mult, Number(dy) * step.y * mult)));
      },
    }))),

    // --- view ---
    { id: 'view.zoomFit', label: 'Zoom to fit', icon: 'maximize', shortcut: 'Mod+0', group: 'View', run: () => app.canvas?.zoomToFit() },
    { id: 'view.zoom100', label: 'Zoom to 100%', shortcut: 'Mod+1', group: 'View', run: () => app.canvas?.zoomTo(1) },
    {
      id: 'view.zoomSelection', label: 'Zoom to selection', shortcut: 'Mod+2', group: 'View', enabled: hasSelection,
      run: (ed) => app.canvas?.zoomToFit(selectionBounds(ed.doc, ed.selection)),
    },
    { id: 'view.zoomIn', label: 'Zoom in', icon: 'plus', shortcut: 'Mod+=', aliases: ['Mod+Shift++', 'Mod++'], group: 'View', run: (ed) => app.canvas?.zoomTo(nextZoomStep(ed.store.get('view').zoom, 1)) },
    { id: 'view.zoomOut', label: 'Zoom out', icon: 'minus', shortcut: 'Mod+-', aliases: ['Mod+Shift+_'], group: 'View', run: (ed) => app.canvas?.zoomTo(nextZoomStep(ed.store.get('view').zoom, -1)) },
    {
      id: 'view.toggleGrid', label: 'Show grid', icon: 'grid-3x3', shortcut: "Mod+'", group: 'View',
      run: (ed) => setDocFlag(ed, 'Toggle grid', (doc) => ({ grid: { ...doc.grid, visible: !doc.grid.visible } })),
    },
    {
      id: 'view.toggleSnap', label: 'Snapping', icon: 'magnet', shortcut: 'Mod+Shift+"', aliases: ["Mod+Shift+'"], group: 'View',
      run: (ed) => setDocFlag(ed, 'Toggle snapping', (doc) => ({ snap: { ...doc.snap, enabled: !doc.snap.enabled } })),
    },
    {
      id: 'view.toggleGuides', label: 'Show guides', icon: 'ruler', shortcut: 'Mod+;', group: 'View',
      run: (ed) => setDocFlag(ed, 'Toggle guides', (doc) => ({ guidesVisible: !doc.guidesVisible })),
    },
    {
      id: 'view.clearGuides', label: 'Remove all guides', group: 'View', enabled: (ed) => ed.doc.guides.length > 0,
      run: (ed) => setDocFlag(ed, 'Remove guides', () => ({ guides: [] })),
    },
    {
      id: 'view.toggleGuideLock', label: 'Lock guides', group: 'View',
      run: (ed) => setDocFlag(ed, 'Lock guides', (doc) => ({ guidesLocked: !doc.guidesLocked })),
    },
  ]);

  // --- tools ---
  for (const tool of app.tools.values()) {
    const ctor = /** @type {typeof import('./tools/base.js').Tool} */ (tool.constructor);
    c.register({
      id: `tool.${ctor.id}`,
      label: `${ctor.label} tool`,
      icon: ctor.icon,
      shortcut: ctor.shortcut || undefined,
      group: 'Tools',
      run: (ed) => ed.setTool(ctor.id),
    });
  }
}
