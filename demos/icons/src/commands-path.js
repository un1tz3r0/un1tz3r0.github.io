// Commands that change geometry: convert to path, booleans, stroke to path, offset,
// corners, clip and mask. DESIGN.md §11.

import { editor } from './app.js';
import { createPath, createGroup, makeStroke, solid } from './core/model/nodes.js';
import {
  findNode, topLevel, indexOf, parentMatrix, worldMatrix, updateNodes, removeNodes, insertNodes, patchNodes,
} from './core/model/tree.js';
import { groupNodes } from './core/model/edit.js';
import { outlineGeo, localBounds as pathBoundingBoxOf } from './core/geometry/bounds.js';
import {
  regionOf, combine, divide, strokeRegion, offsetRegion, roundCorners, simplifyPath, reversePath, toD, isEmpty, transformPath,
} from './core/geometry/ops.js';
import { IDENTITY, invert, det, mul } from './core/affine.js';
import { toPaths, needsConversion, textToPath } from './convert.js';
import { strokeLettering, alongPathD, embossBands } from './core/geometry/extras.js';
import { outlineD, transformedD } from './core/geometry/bounds.js';
import { toast } from './ui/kit/overlays.js';

const selected = (ed) => topLevel(ed.doc, ed.selection);
const nodesOf = (ed) => selected(ed).map((id) => findNode(ed.doc, id));
const isPathLike = (n) => n?.type === 'path' || n?.type === 'shape';

/** Run an operation that may fail on awkward geometry, telling the user if it does. */
async function guarded(label, fn) {
  try {
    await fn();
  } catch (err) {
    console.error(`${label} failed`, err);
    toast(`${label} failed: ${err?.message ?? 'unexpected geometry'}`, { type: 'error' });
  }
}

/** The paint a result should carry when it stands in for `node`. */
function representativeFill(node) {
  if (!node) return solid('#000000');
  if (node.type === 'icon') return solid(node.color);
  if (node.type === 'group') {
    for (let i = node.children.length - 1; i >= 0; i--) {
      const f = representativeFill(node.children[i]);
      if (f.type !== 'none') return f;
    }
    return solid('#000000');
  }
  if (node.fill && node.fill.type !== 'none') return node.fill;
  // A stroke-only object (most line icons) becomes a filled outline of that stroke.
  if (node.stroke?.paint.type !== 'none') return node.stroke.paint;
  return solid('#000000');
}

/** Convert the selected top-level nodes to paths in place; returns the new selection. */
async function convertSelection(ed, ids = selected(ed)) {
  const report = { missing: new Set() };
  const replacements = new Map();
  for (const id of ids) {
    const node = findNode(ed.doc, id);
    if (node && needsConversion(node)) replacements.set(id, await toPaths(node, report));
  }
  if (report.missing.size) {
    toast(`No outline for: ${[...report.missing].slice(0, 12).join(' ')} — those characters were skipped.`, { timeout: 7000 });
  }
  return replacements;
}

async function runBoolean(ed, op, label) {
  const ids = selected(ed);
  if (ids.length < 2) return;
  const replacements = await convertSelection(ed, ids);
  const doc = ed.doc;
  const operands = ids.map((id) => {
    const node = replacements.get(id) ?? findNode(doc, id);
    // Convert in the node's parent space, then into document space.
    return { id, node, region: regionOf(node, mulParent(doc, id, node)) };
  });
  const bottom = operands[0];
  const entry = indexOf(doc).get(bottom.id);
  const parentInv = invert(parentMatrix(doc, bottom.id)) ?? IDENTITY;
  const originals = ids.map((id) => findNode(doc, id));

  if (op === 'divide') {
    const faces = divide(operands.map((o) => ({ region: o.region, tag: o.node })));
    if (!faces.length) {
      toast('Nothing to divide: the objects have no area.');
      return;
    }
    const children = faces.map((face, i) => createPath(toD(transformPath(face.region, parentInv)), {
      name: `Piece ${i + 1}`,
      fill: representativeFill(face.tag),
      stroke: makeStroke(),
    }));
    const group = createGroup(children, { name: 'Divided' });
    ed.apply(label, (d) => insertNodes(removeNodes(d, ids), entry.parent?.id ?? null, [group], insertionIndex(d, entry, ids)), { selection: [group.id] });
    return;
  }

  const result = combine(operands.map((o) => o.region), op);
  if (isEmpty(result)) {
    toast(op === 'intersect' ? 'These objects do not overlap, so there is nothing left.' : 'The result is empty.');
    return;
  }
  const source = originals[0];
  const path = createPath(toD(transformPath(result, parentInv)), {
    name: source.name && source.type !== 'group' ? source.name : 'Shape',
    fill: representativeFill(bottom.node),
    stroke: makeStroke(),
    opacity: source.opacity,
    blend: source.blend,
    effects: source.effects,
    origin: originOf(operands.map((o) => o.node)),
  });
  ed.apply(label, (d) => insertNodes(removeNodes(d, ids), entry.parent?.id ?? null, [path], insertionIndex(d, entry, ids)), { selection: [path.id] });
}

/** Document-space matrix for a (possibly replaced) node that sits where `id` sits. */
function mulParent(doc, id, node) {
  return mul(parentMatrix(doc, id), node.transform);
}

/** Where the bottom operand sat, counted among the siblings that remain. */
function insertionIndex(doc, entry, removed) {
  const siblings = entry.parent ? findNode(doc, entry.parent.id).children : doc.children;
  const gone = new Set(removed);
  return siblings.slice(0, entry.index).filter((n) => !gone.has(n.id)).length;
}

/** Bounds of a node's outline in its own coordinates. */
function worldBoundsLocal(node) {
  const b = pathBoundingBoxOf(node);
  return b && b.width > 0 && b.height > 0 ? b : null;
}

/** Keep icon attribution on shapes derived from icons. */
function originOf(nodes) {
  for (const node of nodes) {
    if (node?.type === 'icon') return { prefix: node.source.prefix, name: node.source.name };
    if (node?.origin?.prefix) return node.origin;
    if (node?.type === 'group') {
      const inner = originOf(node.children);
      if (inner) return inner;
    }
  }
  return undefined;
}

/** Apply `fn(geoPath, node) → geoPath` to every selected path/shape, replacing its geometry. */
function editGeometry(ed, label, fn) {
  const ids = ed.selection.filter((id) => isPathLike(findNode(ed.doc, id)));
  let empty = 0;
  const changed = ed.apply(label, (doc) => {
    const result = mapGeometry(doc, ids, fn);
    empty = result.empty;
    return result.doc;
  });
  if (empty) toast(empty === ids.length ? 'That would leave nothing; no change made.' : `${empty} object(s) were left unchanged.`);
  return changed;
}

/**
 * Replace the geometry of each listed path or shape by `fn(geoPath, node)`. Nodes whose
 * result would be empty are left as they are and counted.
 * @returns {{doc: any, empty: number}}
 */
export function mapGeometry(doc, ids, fn) {
  let empty = 0;
  const next = updateNodes(doc, ids.filter((id) => isPathLike(findNode(doc, id))), (node) => {
    const geo = outlineGeo(node);
    if (!geo) return node;
    let result = null;
    try {
      result = fn(geo, node);
    } catch {
      result = null;
    }
    if (!result || isEmpty(result)) {
      empty++;
      return node;
    }
    // A shape becomes a path: its parameters no longer describe it.
    const { shape: _shape, params: _params, ...rest } = /** @type {any} */ (node);
    return { ...rest, type: 'path', d: toD(result), fillRule: result.fillRule ?? node.fillRule ?? 'nonzero' };
  });
  return { doc: next, empty };
}

/** Distances typed by the user are in document units; a scaled object needs them rescaled. */
const localScale = (doc, id) => Math.sqrt(Math.abs(det(worldMatrix(doc, id)))) || 1;

/** The document with the listed paths grown (positive) or shrunk (negative). Pure. */
export function offsetDoc(doc, ids, distance, join = 'round') {
  if (!Number.isFinite(distance) || distance === 0) return doc;
  return mapGeometry(doc, ids, (geo, node) => offsetRegion(geo, distance / localScale(doc, node.id), join)).doc;
}

/** The document with the corners of the listed paths rounded or chamfered. Pure. */
export function roundDoc(doc, ids, radius, chamfer = false) {
  if (!(radius > 0)) return doc;
  return mapGeometry(doc, ids, (geo, node) => roundCorners(geo, radius / localScale(doc, node.id), chamfer)).doc;
}

export function registerPathCommands() {
  const c = editor.commands;
  const many = (ed) => selected(ed).length >= 2;
  const anyPathLike = (ed) => ed.selection.some((id) => isPathLike(findNode(ed.doc, id)));

  c.register([
    {
      id: 'object.convertToPath', label: 'Convert to path', icon: 'spline', shortcut: 'Mod+Shift+O', group: 'Path',
      enabled: (ed) => nodesOf(ed).some((n) => n && needsConversion(n)),
      run: (ed) => guarded('Convert to path', async () => {
        const replacements = await convertSelection(ed);
        if (!replacements.size) return;
        const ids = selected(ed);
        ed.apply('Convert to path', (doc) => updateNodes(doc, [...replacements.keys()], (node) => ({ ...replacements.get(node.id), id: node.id })), { selection: ids });
      }),
    },
    {
      id: 'text.outline', label: 'Convert text to outlines', icon: 'type', group: 'Path',
      enabled: (ed) => nodesOf(ed).some((n) => n?.type === 'text'),
      run: (ed) => guarded('Convert text to outlines', async () => {
        const ids = selected(ed).filter((id) => findNode(ed.doc, id)?.type === 'text');
        const replacements = await convertSelection(ed, ids);
        ed.apply('Convert text to outlines', (doc) => updateNodes(doc, [...replacements.keys()], (node) => ({ ...replacements.get(node.id), id: node.id })));
      }),
    },
    { id: 'path.union', label: 'Union', icon: 'squares-unite', shortcut: 'Mod+Alt+U', group: 'Path', enabled: many, run: (ed) => guarded('Union', () => runBoolean(ed, 'union', 'Union')) },
    { id: 'path.subtract', label: 'Subtract (bottom minus top)', icon: 'squares-subtract', shortcut: 'Mod+Alt+S', group: 'Path', enabled: many, run: (ed) => guarded('Subtract', () => runBoolean(ed, 'subtract', 'Subtract')) },
    { id: 'path.intersect', label: 'Intersect', icon: 'squares-intersect', shortcut: 'Mod+Alt+I', group: 'Path', enabled: many, run: (ed) => guarded('Intersect', () => runBoolean(ed, 'intersect', 'Intersect')) },
    { id: 'path.exclude', label: 'Exclude overlap', icon: 'squares-exclude', shortcut: 'Mod+Alt+X', group: 'Path', enabled: many, run: (ed) => guarded('Exclude', () => runBoolean(ed, 'exclude', 'Exclude')) },
    { id: 'path.divide', label: 'Divide into pieces', icon: 'split', group: 'Path', enabled: many, run: (ed) => guarded('Divide', () => runBoolean(ed, 'divide', 'Divide')) },

    {
      id: 'path.strokeToPath', label: 'Stroke to path', icon: 'pen-tool', group: 'Path',
      enabled: (ed) => ed.selection.some((id) => {
        const n = findNode(ed.doc, id);
        return isPathLike(n) && n.stroke.paint.type !== 'none' && n.stroke.width > 0;
      }),
      run: (ed) => guarded('Stroke to path', async () => {
        const ids = ed.selection.filter((id) => isPathLike(findNode(ed.doc, id)));
        const selection = [];
        ed.apply('Stroke to path', (doc) => updateNodes(doc, ids, (node) => {
          const ring = strokeRegion(node);
          if (isEmpty(ring)) {
            selection.push(node.id);
            return node;
          }
          const outline = createPath(toD(ring), {
            name: `${node.name} stroke`,
            transform: node.transform,
            fill: node.stroke.paint,
            stroke: makeStroke(),
            opacity: node.opacity,
            blend: node.blend,
            effects: node.effects,
            origin: node.origin,
            id: node.id,
          });
          selection.push(outline.id);
          if (node.fill.type === 'none') return outline;
          // A filled object keeps its fill as a separate shape underneath the outline.
          const fillPart = createPath(toD(outlineGeo(node)), {
            name: `${node.name} fill`, transform: node.transform, fill: node.fill, stroke: makeStroke(),
            fillRule: node.fillRule ?? 'nonzero', opacity: node.opacity, origin: node.origin,
          });
          return [fillPart, { ...outline, opacity: node.opacity }];
        }), { selection });
      }),
    },
    {
      id: 'path.offset', label: 'Offset path', group: 'Path', enabled: anyPathLike,
      run: (ed, args) => guarded('Offset', async () => {
        const distance = Number(args?.distance);
        if (!Number.isFinite(distance) || distance === 0) return;
        editGeometry(ed, 'Offset path', (geo, node) => offsetRegion(geo, distance / localScale(ed.doc, node.id), args?.join ?? 'round'));
      }),
    },
    {
      id: 'path.round', label: 'Round corners', group: 'Path', enabled: anyPathLike,
      run: (ed, args) => guarded(args?.chamfer ? 'Chamfer' : 'Round corners', async () => {
        const radius = Number(args?.radius);
        if (!(radius > 0)) return;
        editGeometry(ed, args?.chamfer ? 'Chamfer corners' : 'Round corners', (geo, node) => roundCorners(geo, radius / localScale(ed.doc, node.id), !!args?.chamfer));
      }),
    },
    { id: 'path.simplify', label: 'Simplify', group: 'Path', enabled: anyPathLike, run: (ed) => guarded('Simplify', async () => { editGeometry(ed, 'Simplify path', (geo) => simplifyPath(geo)); }) },
    { id: 'path.reverse', label: 'Reverse direction', group: 'Path', enabled: anyPathLike, run: (ed) => guarded('Reverse', async () => { editGeometry(ed, 'Reverse path', (geo) => reversePath(geo)); }) },

    ...[['clip', 'Clip with top object', 'crop'], ['mask', 'Mask with top object', 'blend']].map(([kind, label, icon]) => ({
      id: `object.${kind}`, label, icon, group: 'Path', enabled: many,
      run: (ed) => guarded(label, async () => {
        const ids = selected(ed);
        const topId = ids[ids.length - 1];
        const top = findNode(ed.doc, topId);
        let doc = ed.doc;
        // A <clipPath> may only contain shapes and text, so anything else is flattened
        // into one path first. A mask can hold any artwork as it is.
        if (kind === 'clip' && top.type !== 'path' && top.type !== 'shape' && top.type !== 'text') {
          const converted = await toPaths(top);
          const region = regionOf(converted, converted.transform);
          if (isEmpty(region)) throw new Error('The top object has no area to clip with');
          const flat = createPath(toD(region), { name: top.name, fill: solid('#000000'), stroke: makeStroke(), id: top.id });
          doc = updateNodes(doc, [topId], () => flat);
        }
        const result = groupNodes(doc, ids, { clip: kind, name: kind === 'clip' ? 'Clip group' : 'Mask group' });
        ed.apply(label, () => result.doc, { selection: result.selection });
        ed.store.set({ scope: null });
      }),
    })),
    {
      // Bend text along a path. The text is outlined, so this is a one-way step.
      id: 'text.onPath', label: 'Put text on path', icon: 'spline', group: 'Path',
      enabled: (ed) => {
        const nodes = nodesOf(ed);
        return nodes.length === 2 && nodes.some((n) => n?.type === 'text') && nodes.some(isPathLike);
      },
      run: (ed) => guarded('Put text on path', async () => {
        const nodes = nodesOf(ed);
        const text = nodes.find((n) => n.type === 'text');
        const spine = nodes.find(isPathLike);
        // Lay the text out flat at the origin; the spine supplies position and direction.
        const flat = await textToPath({ ...text, transform: IDENTITY, align: 'start' });
        const spineD = transformedD(outlineD(spine), worldMatrix(ed.doc, spine.id));
        const d = alongPathD(flat.node.d, spineD, { align: text.align });
        if (!d) throw new Error('the path has no length to follow');
        const parentInv = invert(parentMatrix(ed.doc, text.id)) ?? IDENTITY;
        const bent = createPath(transformedD(d, parentInv), {
          name: text.name, fill: text.fill, stroke: text.stroke, opacity: text.opacity, blend: text.blend,
          effects: text.effects, origin: { font: text.font, text: text.text }, id: text.id,
        });
        ed.apply('Put text on path', (doc) => updateNodes(doc, [text.id], () => bent), { selection: [text.id] });
        if (flat.missing.length) toast(`No outline for: ${flat.missing.slice(0, 12).join(' ')}`);
      }),
    },
    {
      // geo's parametric stroke alphabet: centerlines, drawn with a stroke.
      id: 'text.strokeLettering', label: 'Convert to single-line lettering', icon: 'pen-tool', group: 'Path',
      enabled: (ed) => nodesOf(ed).some((n) => n?.type === 'text'),
      run: (ed) => guarded('Single-line lettering', async () => {
        const ids = selected(ed).filter((id) => findNode(ed.doc, id)?.type === 'text');
        const missing = new Set();
        ed.apply('Single-line lettering', (doc) => updateNodes(doc, ids, (node) => {
          const { d, missing: lacking } = strokeLettering(node);
          for (const ch of lacking) missing.add(ch);
          if (!d) return node;
          const paint = node.fill.type !== 'none' ? node.fill : solid('#000000');
          return createPath(d, {
            name: node.name, transform: node.transform, fill: { type: 'none' }, opacity: node.opacity, blend: node.blend,
            effects: node.effects, id: node.id,
            stroke: makeStroke({ paint, width: Math.max(0.25, node.size / 12), cap: 'round', join: 'round' }),
          });
        }));
        if (missing.size) toast(`The stroke alphabet has no glyph for: ${[...missing].slice(0, 12).join(' ')}`);
      }),
    },
    {
      id: 'path.emboss', label: 'Emboss (bevel shading)', icon: 'sparkles', group: 'Path', enabled: anyPathLike,
      run: (ed, args) => guarded('Emboss', async () => {
        const ids = selected(ed).filter((id) => isPathLike(findNode(ed.doc, id)));
        const selection = [];
        ed.apply('Emboss', (doc) => updateNodes(doc, ids, (node) => {
          const geo = outlineGeo(node);
          const box = geo && outlineD(node) ? worldBoundsLocal(node) : null;
          if (!box) return node;
          const width = args?.width ?? Math.max(0.5, Math.min(box.width, box.height) / 8);
          const bands = embossBands(outlineD(node), { width, azimuth: args?.azimuth ?? -45 });
          if (!bands.length) return node;
          // Shade with translucent white and black over the shape's own paint.
          const shades = bands.map((band, i) => {
            const light = band.kind === 'specular' || band.intensity >= 0.5;
            const strength = band.kind === 'specular' ? 0.75 : Math.abs(band.intensity - 0.5) * 1.1;
            return createPath(band.d, {
              name: `${light ? 'Light' : 'Shade'} ${i + 1}`,
              fill: solid(light ? '#ffffff' : '#000000'),
              opacity: Math.max(0.05, Math.min(0.9, strength)),
              stroke: makeStroke(),
            });
          });
          const group = createGroup([{ ...node, transform: IDENTITY }, ...shades], { name: `${node.name} (embossed)`, transform: node.transform, id: node.id });
          selection.push(group.id);
          return { ...group, children: [{ ...group.children[0], id: createPath('').id }, ...shades] };
        }), { selection });
      }),
    },
    {
      id: 'object.releaseClip', label: 'Release clip / mask', icon: 'unlink', group: 'Path',
      enabled: (ed) => nodesOf(ed).some((n) => n?.type === 'group' && n.clip !== 'none'),
      run: (ed) => ed.apply('Release clip', (doc) => patchNodes(doc, ed.selection, (n) => (n.type === 'group' && n.clip !== 'none' ? { clip: 'none', name: 'Group' } : null))),
    },
  ]);
}
