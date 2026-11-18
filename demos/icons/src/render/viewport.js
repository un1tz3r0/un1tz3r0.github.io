// Pan / zoom math. The view is `{zoom, panX, panY}`: a document point p appears on screen
// at `p × zoom + pan` (in CSS pixels relative to the canvas element's top-left corner).

export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 256;

/** @typedef {{zoom:number, panX:number, panY:number}} View */

export const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

/** @param {View} view */
export function toScreen(view, p) {
  return { x: p.x * view.zoom + view.panX, y: p.y * view.zoom + view.panY };
}

/** @param {View} view */
export function toDoc(view, p) {
  return { x: (p.x - view.panX) / view.zoom, y: (p.y - view.panY) / view.zoom };
}

/** The view as an affine matrix (document → screen). */
export function viewMatrix(view) {
  return { a: view.zoom, b: 0, c: 0, d: view.zoom, e: view.panX, f: view.panY };
}

/**
 * Zoom so that the document point under screen point `anchor` stays put.
 * @param {View} view
 * @param {number} zoom
 * @param {{x:number, y:number}} anchor  in canvas pixels
 * @returns {View}
 */
export function zoomAt(view, zoom, anchor) {
  const z = clampZoom(zoom);
  const k = z / view.zoom;
  return { zoom: z, panX: anchor.x - (anchor.x - view.panX) * k, panY: anchor.y - (anchor.y - view.panY) * k };
}

/**
 * The view that fits a document-space box inside a canvas of the given size.
 * @param {{x:number,y:number,width:number,height:number}} box
 * @param {{width:number,height:number}} canvas
 * @param {number} [margin]  pixels to leave around the box
 * @returns {View}
 */
export function fitBox(box, canvas, margin = 48) {
  const w = Math.max(1, canvas.width - margin * 2);
  const h = Math.max(1, canvas.height - margin * 2);
  const zoom = clampZoom(Math.min(w / Math.max(box.width, 1e-6), h / Math.max(box.height, 1e-6)));
  return {
    zoom,
    panX: (canvas.width - box.width * zoom) / 2 - box.x * zoom,
    panY: (canvas.height - box.height * zoom) / 2 - box.y * zoom,
  };
}

/** Zoom levels the +/- commands step through. */
const STEPS = [0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256];

export function nextZoomStep(zoom, direction) {
  if (direction > 0) return STEPS.find((s) => s > zoom * 1.001) ?? MAX_ZOOM;
  return [...STEPS].reverse().find((s) => s < zoom * 0.999) ?? MIN_ZOOM;
}
