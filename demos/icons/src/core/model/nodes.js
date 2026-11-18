// Document schema and node factories. See DESIGN.md §4.
//
// The document is a plain JSON tree and is treated as immutable: every edit returns a new
// root that shares all unchanged subtrees with the old one.

import { IDENTITY } from '../affine.js';

/** @typedef {import('../affine.js').Affine} Affine */

/** @typedef {{offset:number, color:string}} Stop */
/**
 * @typedef {{type:'none'}
 *   | {type:'solid', color:string}
 *   | {type:'current'}
 *   | {type:'linear', stops:Stop[], x1:number, y1:number, x2:number, y2:number}
 *   | {type:'radial', stops:Stop[], cx:number, cy:number, r:number, fx?:number, fy?:number}} Paint
 */
/**
 * @typedef {{paint:Paint, width:number, cap:'butt'|'round'|'square', join:'miter'|'round'|'bevel',
 *            miterLimit:number, dash:number[], dashOffset:number}} Stroke
 */
/**
 * @typedef {{type:'dropShadow', dx:number, dy:number, blur:number, color:string}
 *   | {type:'blur', radius:number}} Effect
 */
/**
 * @typedef {{id:string, name:string, transform:Affine, visible:boolean, locked:boolean,
 *            opacity:number, blend:string, effects:Effect[], origin?:any}} NodeBase
 *   `origin` records where converted geometry came from (an icon, or text and its
 *   font), so credits survive "Convert to path".
 */
/** @typedef {NodeBase & {type:'path', d:string, fillRule:'nonzero'|'evenodd', fill:Paint, stroke:Stroke}} PathNode */
/** @typedef {NodeBase & {type:'shape', shape:'rect'|'ellipse'|'polygon'|'star'|'line', params:any, fill:Paint, stroke:Stroke}} ShapeNode */
/** @typedef {{provider:'fontsource'|'github'|'local'|'system', id:string, family:string, weight:number, style:'normal'|'italic'}} FontRef */
/**
 * @typedef {NodeBase & {type:'text', text:string, font:FontRef, size:number, lineHeight:number,
 *            letterSpacing:number, align:'start'|'middle'|'end', fill:Paint, stroke:Stroke}} TextNode
 */
/**
 * @typedef {NodeBase & {type:'icon', source:{provider:string, prefix:string, name:string}, body:string,
 *            viewBox:[number,number,number,number], width:number, height:number, color:string,
 *            palette:boolean}} IconNode
 */
/** @typedef {NodeBase & {type:'group', clip:'none'|'clip'|'mask', children:Node[]}} GroupNode */
/** @typedef {PathNode | ShapeNode | TextNode | IconNode | GroupNode} Node */
/**
 * @typedef {{visible:boolean, spacingX:number, spacingY:number, subdivisions:number, originX:number,
 *            originY:number, color:string, opacity:number, style:'lines'|'dots'|'isometric'}} GridSettings
 */
/**
 * @typedef {{enabled:boolean, grid:boolean, guides:boolean, artboard:boolean, bounds:boolean,
 *            nodes:boolean, paths:boolean, threshold:number}} SnapSettings
 */
/**
 * @typedef {{schema:number, id:string, name:string,
 *            artboard:{width:number, height:number, background:Paint},
 *            grid:GridSettings, snap:SnapSettings, guidesVisible:boolean, guidesLocked:boolean,
 *            guides:{id:string, axis:'x'|'y', position:number}[],
 *            swatches:{name:string, color:string}[],
 *            children:Node[]}} Doc
 */

export const SCHEMA_VERSION = 1;

export const BLEND_MODES = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn',
  'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
];

export const ARTBOARD_PRESETS = [
  { label: '16', width: 16, height: 16 },
  { label: '24', width: 24, height: 24 },
  { label: '32', width: 32, height: 32 },
  { label: '48', width: 48, height: 48 },
  { label: '64', width: 64, height: 64 },
  { label: '128', width: 128, height: 128 },
  { label: '256', width: 256, height: 256 },
  { label: '512', width: 512, height: 512 },
  { label: '1024', width: 1024, height: 1024 },
  { label: 'Social 1200×630', width: 1200, height: 630 },
];

/** @type {Paint} */
export const NONE = Object.freeze({ type: 'none' });

/** @returns {Paint} */
export const solid = (color) => ({ type: 'solid', color });

/** @returns {Stroke} */
export function makeStroke(overrides = {}) {
  return { paint: NONE, width: 1, cap: 'butt', join: 'miter', miterLimit: 4, dash: [], dashOffset: 0, ...overrides };
}

let idCounter = 0;

/** A short id that is unique within a document and valid as an XML id. */
export function newId(prefix = 'n') {
  idCounter = (idCounter + 1) % 1679616;
  const rand = Math.floor(Math.random() * 1679616).toString(36).padStart(4, '0');
  return `${prefix}${Date.now().toString(36).slice(-4)}${idCounter.toString(36)}${rand}`;
}

function base(type, name, overrides) {
  return {
    id: newId(),
    type,
    name,
    transform: IDENTITY,
    visible: true,
    locked: false,
    opacity: 1,
    blend: 'normal',
    effects: [],
    ...overrides,
  };
}

/** @returns {PathNode} */
export function createPath(d, overrides = {}) {
  return /** @type {PathNode} */ (
    base('path', 'Path', { d, fillRule: 'nonzero', fill: solid('#000000'), stroke: makeStroke(), ...overrides })
  );
}

export const SHAPE_DEFAULTS = {
  rect: { x: 0, y: 0, width: 100, height: 100, rx: 0, ry: 0 },
  ellipse: { cx: 50, cy: 50, rx: 50, ry: 50 },
  polygon: { cx: 50, cy: 50, radius: 50, sides: 6, rounding: 0, rotation: 0 },
  star: { cx: 50, cy: 50, outer: 50, inner: 25, points: 5, rounding: 0, rotation: 0 },
  line: { x1: 0, y1: 0, x2: 100, y2: 0 },
};

const SHAPE_NAMES = { rect: 'Rectangle', ellipse: 'Ellipse', polygon: 'Polygon', star: 'Star', line: 'Line' };

/** @returns {ShapeNode} */
export function createShape(shape, params = {}, overrides = {}) {
  if (!SHAPE_DEFAULTS[shape]) throw new TypeError(`createShape: unknown shape "${shape}"`);
  return /** @type {ShapeNode} */ (
    base('shape', SHAPE_NAMES[shape], {
      shape,
      params: { ...SHAPE_DEFAULTS[shape], ...params },
      fill: shape === 'line' ? NONE : solid('#000000'),
      stroke: shape === 'line' ? makeStroke({ paint: solid('#000000'), width: 2 }) : makeStroke(),
      ...overrides,
    })
  );
}

/** @type {FontRef} */
export const DEFAULT_FONT = Object.freeze({ provider: 'fontsource', id: 'inter', family: 'Inter', weight: 400, style: 'normal' });

/** @returns {TextNode} */
export function createText(text, overrides = {}) {
  return /** @type {TextNode} */ (
    base('text', 'Text', {
      text,
      font: DEFAULT_FONT,
      size: 24,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'start',
      fill: solid('#000000'),
      stroke: makeStroke(),
      ...overrides,
    })
  );
}

/**
 * @param {{prefix:string, name:string, body:string, viewBox:[number,number,number,number], palette?:boolean}} icon
 * @returns {IconNode}
 */
export function createIcon(icon, overrides = {}) {
  return /** @type {IconNode} */ (
    base('icon', icon.name, {
      source: { provider: 'iconify', prefix: icon.prefix, name: icon.name },
      body: icon.body,
      viewBox: icon.viewBox,
      width: icon.viewBox[2],
      height: icon.viewBox[3],
      color: '#000000',
      palette: !!icon.palette,
      ...overrides,
    })
  );
}

/** @returns {GroupNode} */
export function createGroup(children = [], overrides = {}) {
  return /** @type {GroupNode} */ (base('group', 'Group', { clip: 'none', children, ...overrides }));
}

/** @returns {GridSettings} */
export function defaultGrid(spacing = 1) {
  return {
    visible: true,
    spacingX: spacing,
    spacingY: spacing,
    subdivisions: 1,
    originX: 0,
    originY: 0,
    color: '#3b82f6',
    opacity: 0.35,
    style: 'lines',
  };
}

/** @returns {SnapSettings} */
export function defaultSnap() {
  return { enabled: true, grid: true, guides: true, artboard: true, bounds: true, nodes: false, paths: false, threshold: 8 };
}

/** A grid step that gives a sensible number of cells for an artboard of this size. */
export function gridSpacingFor(width, height) {
  const size = Math.max(width, height);
  if (size <= 64) return 1;
  if (size <= 256) return 8;
  if (size <= 640) return 16;
  return 32;
}

/** @returns {Doc} */
export function createDoc({ name = 'Untitled', width = 24, height = 24 } = {}) {
  return {
    schema: SCHEMA_VERSION,
    id: newId('d'),
    name,
    artboard: { width, height, background: NONE },
    grid: defaultGrid(gridSpacingFor(width, height)),
    snap: defaultSnap(),
    guidesVisible: true,
    guidesLocked: false,
    guides: [],
    swatches: [],
    children: [],
  };
}

/**
 * Bring a stored document up to the current schema, filling in anything missing.
 * Throws if the document is from a newer version of the app.
 * @returns {Doc}
 */
export function migrateDoc(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.children)) {
    throw new TypeError('Not a Material Icon Studio document');
  }
  if (raw.schema > SCHEMA_VERSION) {
    throw new RangeError(`Document schema ${raw.schema} is newer than this app understands (${SCHEMA_VERSION})`);
  }
  const fresh = createDoc({ width: raw.artboard?.width, height: raw.artboard?.height });
  return {
    ...fresh,
    ...raw,
    schema: SCHEMA_VERSION,
    artboard: { ...fresh.artboard, ...raw.artboard },
    grid: { ...fresh.grid, ...raw.grid },
    snap: { ...fresh.snap, ...raw.snap },
    guides: raw.guides ?? [],
    swatches: raw.swatches ?? [],
  };
}

/** Deep copy of a node with fresh ids throughout. */
export function cloneNode(node) {
  const copy = { ...node, id: newId() };
  if (node.type === 'group') copy.children = node.children.map(cloneNode);
  return copy;
}

export const hasPaint = (node) => node.type === 'path' || node.type === 'shape' || node.type === 'text';
