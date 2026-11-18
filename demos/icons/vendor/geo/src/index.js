// @geo/paths — public API surface.
//
// Curated re-exports grouped by concern. The kernel (src/core) never imports from io/ or
// raster/; this index is the one place that composes the layers for consumers.

// --- core value types & algebra ---
// `vec2` is the constructor (most-used entry); `Vec2` is the algebra namespace
// (Vec2.add, Vec2.dot, …). Both point at the same module.
export { vec2 } from './core/vec2.js';
export * as Vec2 from './core/vec2.js';
export {
  EPS,
  EPS_COINCIDENT,
  EPS_PARAM,
  EPS_ANGLE,
  FLATNESS,
  FLATNESS_RASTER,
  eq,
  isZero,
  clamp01,
  signum,
} from './core/tolerance.js';
export { quadraticRoots, cubicRoots, linearRoots } from './core/roots.js';

// --- geometry primitives ---
export {
  LINE,
  QUAD,
  CUBIC,
  ARC,
  line,
  quad,
  cubic,
  arc,
  startPoint,
  endPoint,
  // kernel (F1)
  pointAt,
  derivativeAt,
  tangentAt,
  normalAt,
  boundingBox,
  splitAt,
  flatten,
  flattenParam,
  arcLength,
  arcLengthTo,
  nearestPoint,
  intersect,
  tAtLength,
  // Phase 6 (F5) kernel additions
  derivative2At,
  curvatureAt,
  reverseSegment,
  // Phase 11 (F10) kernel additions
  subsegment,
  withMeta,
  metaOf,
} from './core/segment.js';
export { arcCenter } from './core/arc.js';
export {
  NONZERO,
  EVENODD,
  subpath,
  path,
  subpathStart,
  subpathEnd,
  pathBoundingBox,
  validatePath,
  reverseSubpath,
} from './core/path.js';
export { windingAt, containsPoint } from './core/winding.js';
export { linearizePath } from './core/linearize.js';
export { pathCorners } from './core/corners.js';

// --- corner treatments (F10) ---
export { filletCorner, DEFAULT_MIN_ANGLE } from './core/fillet.js';
export {
  filletPath,
  chamferPath,
  chamferCorner,
  planFillets,
  planChamfers,
} from './core/corner-ops.js';
export { meetExtended } from './core/corners.js';
export {
  circleOf,
  findFillets,
  rejectDegenerateRuns,
  removeTreatments,
  unfilletPath,
  unchamferPath,
  uncornerPath,
  DEFAULT_TANGENT_TOLERANCE,
  DEFAULT_MIN_CORNER,
  DEFAULT_SLIVER_ANGLE,
} from './core/unfillet.js';
export { nearestPointToPath } from './core/nearest.js';

// --- nearest path → path (F7) ---
export {
  segmentDistance,
  nearestPathToPath,
  nearestRuns,
  isIntervalWitness,
  growEquidistantRun,
  antiParallelAt,
  oppositePoint,
  matchedRuns,
} from './core/distance.js';
export { samplePath, nodeNormals, pathLength, pointAtLength } from './core/sample.js';

// --- typed geometry attributes (F22) ---
// Namespace-only for the per-type constructors: `Attr.length(4)`, `Attr.side('left')`.
// They are deliberately not hoisted to the top level — `length`, `point`, `normal` and
// `area` would all collide with existing exports or with the SVG layer's length parser.
export * as Attr from './core/attributes.js';
export { attr, withAttrs, attrsOf, valuesOf, isAttr, originOf } from './core/attributes.js';

// --- affine transforms (F14) ---
// `Affine` namespace (Affine.compose, Affine.invert, …) plus top-level essentials.
export * as Affine from './core/affine.js';
export {
  affine,
  IDENTITY,
  translation,
  rotation,
  scaling,
  skewX,
  skewY,
  compose,
  composeAll,
  invert,
  isInvertible,
  determinant,
  applyPoint,
  applyVector,
  applyNormal,
  singularValues,
  classify,
  isAffine,
  isShapePreserving,
  transformSegment,
  transformSubpath,
  transformPath,
  transformAttribute,
  transformAttributes,
} from './core/affine.js';

// --- offset / stroke (F5) ---
export { offsetSegment, offsetSubpath, offsetPath } from './core/offset.js';
export { stroke } from './core/stroke.js';
export { fitCubicChain, fitCubicCandidate, parameterDeviation } from './core/fitcurve.js';

// --- centerline recovery, the inverse of stroke (F11) ---
export {
  unstroke,
  centerlinePath,
  segmentRegions,
  fillRegions,
  strokeWidthOf,
  pairWidth,
  erosionHalfWidth,
} from './core/unstroke.js';

// --- boolean ops / cut (F6) ---
export { intersectSegments } from './core/intersections.js';
export { cutPath } from './core/cut.js';
export { booleanPath, union, intersection, difference, xor, simplify } from './core/boolean.js';

// --- area / fill-between (F8) ---
export {
  pathArea,
  subpathArea,
  segmentArea,
  // interior side (F22, resolves D-B)
  INTERIOR_SIDE,
  interiorSideOf,
  withInteriorSide,
  inheritInteriorSide,
  outwardSign,
} from './core/area.js';
export { fillBetween, areaBetween } from './core/between.js';

// --- spiro splines (F9) ---
export { spiroToPath, SPIRO_TYPES } from './spiro/spiro.js';
export { pathToSpiro } from './spiro/fit.js';

// --- path cleanup (F20) ---
export {
  mergeByDistance,
  dissolveDegenerate,
  adjustResolution,
  cleanPath,
  CORNER_ANGLE,
} from './core/clean.js';

// --- path editing: locators, insertion, crop (F18) ---
export {
  resolveLocator,
  insertPointAt,
  crop,
  pathNodes,
  nodeCount,
  nodeLength,
  measureSubpath,
} from './core/edit.js';

// --- bounding volumes & shape search (F13) ---
export { supportPoint, supportPointOfPath, convexHull, convexHullPoints } from './core/hull.js';
export {
  boundingCircle,
  boundingRect,
  boundingSquare,
  boundingEllipse,
  boundingRoundRect,
  boundingTrapezoid,
  rectPath,
  circlePath,
  ellipsePath,
  roundRectPath,
  trapezoidPath,
} from './core/fit.js';
export { searchShape, fitWithin, shapeFeatures } from './core/search.js';

// --- shape & glyph generators (F12) ---
// `Shapes` namespace (Shapes.regularPolygon, Shapes.glyph, …) plus the text entry points.
export * as Shapes from './shapes/index.js';
export { glyph, glyphs, textMetrics } from './shapes/font/text.js';

// --- vector emboss & specular shading (F16) ---
// `Shade` namespace plus the two entry points.
export * as Shade from './shade/index.js';
export { embossPath, bevelBand } from './shade/emboss.js';

// --- raster (F4) ---
export { rasterize } from './raster/rasterize.js';
export { fitTransform } from './raster/edges.js';
export { coverageToAscii, coverageToPgm } from './raster/debug.js';

// --- I/O ---
// `svg` namespace (svg.parsePath, svg.serializePath) plus top-level convenience.
export * as svg from './io/svg.js';
export { parsePath, serializePath } from './io/svg.js';

// ── F19 — path along a path, and markers (Phase 20) ──────────────────────────
export { strokeSpace, fromPlane, cornerFan, SMOOTH_TURN } from './warp/strokespace.js';
export { pathAlongPath, planCopies, clipToSpine, weldCopies } from './warp/along.js';
export { applyMarkers, markerSites, nodeAngle } from './warp/markers.js';
