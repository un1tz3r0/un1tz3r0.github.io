// <mis-canvas> — the drawing surface — and <mis-ruler>. DESIGN.md §5.
//
// Structure of the stage:
//
//   <svg>
//     <g class="under">     screen space: artboard plate (checkerboard or background color)
//     <g class="viewport">  document space, one pan/zoom transform; reconciled from the model
//     <g class="overlay">   screen space: grid, guides, tool overlay, snap marks
//   </svg>
//
// The canvas owns pan/zoom gestures, guide dragging and hit-testing. Everything else is
// forwarded to the active tool.

import { MisElement, css, html } from './base.js';
import { app, editor, activeTool } from '../app.js';
import { patchChildren } from '../render/reconciler.js';
import { buildContent } from '../core/io/vnode.js';
import { toDoc, toScreen, zoomAt, fitBox, clampZoom } from '../render/viewport.js';
import { gridVNodes, guideVNodes, snapVNodes, boxToScreen } from '../render/overlay.js';
import { collectTargets, snapPoint, snapBox, nearestGridLine } from '../core/snap/index.js';
import { indexOf, isEffectivelyLocked } from '../core/model/tree.js';
import { newId } from '../core/model/nodes.js';
import { splitAlpha } from '../core/color.js';
import { onMetricsChange } from '../render/text-measure.js';
import { fmt } from '../core/affine.js';

const RULER = 20;

/**
 * A ruler along one edge of the canvas, drawn on a <canvas> element.
 * Properties: `orientation`, `view`, `marker` (document coordinate of the pointer).
 */
export class MisRuler extends MisElement {
  static props = {
    orientation: { type: String, reflect: true, default: 'horizontal' },
    view: { type: Object },
    marker: { type: Number },
  };
  static styles = [
    css`
      :host {
        display: block;
        background: var(--bg-raised);
        overflow: hidden;
        cursor: default;
        touch-action: none;
      }
      canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ];
  static template = html`<canvas aria-hidden="true"></canvas>`;

  connected() {
    const ro = new ResizeObserver(() => this.render());
    ro.observe(this);
    this.signal.addEventListener('abort', () => ro.disconnect());
    // Repaint when the color scheme changes; canvas pixels do not follow CSS.
    const mq = matchMedia('(prefers-color-scheme: dark)');
    this.listen(mq, 'change', () => this.render());
  }

  render() {
    const canvas = this.$('canvas');
    const dpr = devicePixelRatio || 1;
    const w = this.clientWidth;
    const h = this.clientHeight;
    if (!w || !h || !this.view) return;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext('2d');
    const style = getComputedStyle(this);
    const horizontal = this.orientation === 'horizontal';
    const length = horizontal ? w : h;
    const thick = horizontal ? h : w;
    const { zoom } = this.view;
    const pan = horizontal ? this.view.panX : this.view.panY;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = style.getPropertyValue('--border-strong');
    ctx.fillStyle = style.getPropertyValue('--text-muted');
    ctx.font = `9px ${style.getPropertyValue('--font')}`;
    ctx.lineWidth = 1;

    // A "nice" step (1, 2, 5 × 10ⁿ) that keeps labelled ticks at least ~60px apart.
    const target = 60 / zoom;
    const pow = 10 ** Math.floor(Math.log10(target));
    const major = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= target);
    const minor = major / (String(major / pow).startsWith('2') ? 4 : 5);
    const first = Math.floor(-pan / zoom / minor) * minor;
    const last = (length - pan) / zoom;

    ctx.beginPath();
    for (let value = first; value <= last; value += minor) {
      const pos = Math.round(value * zoom + pan) + 0.5;
      const k = value / major;
      const isMajor = Math.abs(k - Math.round(k)) < 1e-6;
      const len = isMajor ? thick : thick * 0.3;
      if (horizontal) {
        ctx.moveTo(pos, thick);
        ctx.lineTo(pos, thick - len);
      } else {
        ctx.moveTo(thick, pos);
        ctx.lineTo(thick - len, pos);
      }
      if (isMajor) {
        const label = fmt(Math.round(k) * major, 3);
        if (horizontal) ctx.fillText(label, pos + 3, 9);
        else {
          ctx.save();
          ctx.translate(9, pos - 3);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(label, 0, 0);
          ctx.restore();
        }
      }
    }
    ctx.stroke();

    if (this.marker !== null && Number.isFinite(this.marker)) {
      const pos = Math.round(this.marker * zoom + pan) + 0.5;
      ctx.strokeStyle = style.getPropertyValue('--accent');
      ctx.beginPath();
      if (horizontal) {
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, thick);
      } else {
        ctx.moveTo(0, pos);
        ctx.lineTo(thick, pos);
      }
      ctx.stroke();
    }
  }
}

export class MisCanvas extends MisElement {
  static styles = [
    css`
      :host {
        display: grid;
        grid-template: ${RULER}px 1fr / ${RULER}px 1fr;
        min-width: 0;
        min-height: 0;
        background: var(--bg-sunken);
        position: relative;
      }
      :host([no-rulers]) {
        grid-template: 0 1fr / 0 1fr;
      }
      .corner {
        background: var(--bg-raised);
        border-right: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
      }
      mis-ruler[orientation='horizontal'] {
        border-bottom: 1px solid var(--border);
      }
      mis-ruler[orientation='vertical'] {
        border-right: 1px solid var(--border);
      }
      .stage {
        position: relative;
        overflow: hidden;
        outline: none;
        touch-action: none;
      }
      /* Shown only when focus arrived by keyboard; see the 'kbd' class toggling below. */
      .stage.kbd:focus {
        box-shadow: inset 0 0 0 2px var(--focus);
      }
      svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
      }
      .overlay {
        pointer-events: none;
      }
      .artboard {
        filter: drop-shadow(0 1px 6px rgb(0 0 0 / 0.18));
      }
      .artboard-edge {
        fill: none;
        stroke: var(--border-strong);
        stroke-width: 1;
      }
      /* Overlay vocabulary used by the tools. */
      .sel {
        fill: none;
        stroke: var(--selection);
        stroke-width: 1;
      }
      .sel.dim {
        stroke-opacity: 0.55;
      }
      .sel.hover {
        stroke-width: 1.5;
      }
      .handle {
        fill: #fff;
        stroke: var(--selection);
        stroke-width: 1;
      }
      .handle.on {
        fill: var(--selection);
      }
      .anchor-line {
        stroke: var(--selection);
        stroke-width: 1;
      }
      .marquee {
        fill: var(--selection);
        fill-opacity: 0.08;
        stroke: var(--selection);
        stroke-width: 1;
        stroke-dasharray: 3 2;
      }
      .guide {
        stroke: var(--guide);
        stroke-width: 1;
        stroke-opacity: 0.8;
      }
      .guide.active {
        stroke-opacity: 1;
        stroke-width: 1.5;
      }
      .snap {
        fill: none;
        stroke: var(--snap);
        stroke-width: 1;
        stroke-dasharray: 4 3;
      }
      .preview {
        fill: none;
        stroke: var(--selection);
        stroke-width: 1.25;
      }
      .ghost {
        opacity: 0.55;
      }
      .label {
        font: 10px var(--font);
        fill: #fff;
        paint-order: stroke;
        stroke: var(--selection);
        stroke-width: 6px;
        stroke-linejoin: round;
      }
      .html-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }
      .html-layer > * {
        pointer-events: auto;
      }
    `,
  ];
  static template = html`<div class="corner"></div
    ><mis-ruler class="top" orientation="horizontal"></mis-ruler
    ><mis-ruler class="left" orientation="vertical"></mis-ruler
    ><div class="stage" tabindex="0" role="application" aria-label="Canvas">
      <svg xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="checker" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="var(--checker-a)" />
            <path d="M0 0h8v8H0zM8 8h8v8H8z" fill="var(--checker-b)" />
          </pattern>
        </defs>
        <g class="under"><rect class="artboard" /></g>
        <g class="viewport"><defs class="doc-defs"></defs><g class="content"></g></g>
        <g class="overlay"><rect class="artboard-edge" /><g class="overlay-items"></g></g>
      </svg>
      <div class="html-layer"></div>
    </div>`;

  constructor() {
    super();
    this.size = { width: 0, height: 0 };
    this._overlayQueued = false;
    this._fitted = false;
    /** @type {{key: string, doc: any, targets: any} | null} */
    this._snapCache = null;
    /** What the last snap landed on, for the overlay. */
    this.snapFeedback = null;
    /** Canvas-owned gesture (pan, pinch, guide drag), or null when the tool has the pointer. */
    this._own = null;
    this._spaceDown = false;
    /** @type {Map<number, {x:number,y:number}>} active touch points */
    this._touches = new Map();
    this._toolHasPointer = false;
    this._lastPointer = null;
    this._activeGuide = null;
  }

  get stage() {
    return this.$('.stage');
  }

  /** A layer for HTML positioned over the canvas (the in-place text editor). */
  get htmlLayer() {
    return this.$('.html-layer');
  }

  connected() {
    app.canvas = this;
    const store = editor.store;
    this.watch(store, 'doc', () => this.#renderDoc(), { immediate: true });
    this.watch(store, 'view', () => this.#applyView(), { immediate: true });
    this.watch(store, 'selection', () => this.invalidateOverlay());
    this.watch(store, 'scope', () => this.invalidateOverlay());
    this.watch(store, 'tool', (id, prev) => {
      app.tools.get(prev)?.deactivate();
      this.snapFeedback = null;
      app.tools.get(id)?.activate();
      this.#syncCursor();
      this.invalidateOverlay();
    });
    this.watch(store, 'toolOptions', () => this.invalidateOverlay());
    const off = onMetricsChange(() => this.invalidateOverlay());
    this.signal.addEventListener('abort', off);

    const stage = this.stage;
    const ro = new ResizeObserver(() => {
      this.size = { width: stage.clientWidth, height: stage.clientHeight };
      if (!this._fitted && this.size.width > 0) {
        this._fitted = true;
        if (!this._viewRestored) this.zoomToFit();
      }
      this.#applyView();
    });
    ro.observe(stage);
    this.signal.addEventListener('abort', () => ro.disconnect());

    this.listen(stage, 'focus', () => stage.classList.toggle('kbd', !!this._tabbing));
    this.listen(window, 'keydown', (e) => {
      if (e.key === 'Tab') this._tabbing = true;
    }, { capture: true });
    this.listen(window, 'pointerdown', () => {
      this._tabbing = false;
      stage.classList.remove('kbd');
    }, { capture: true });
    // Focus is managed explicitly (see #onPointerDown). Without this, the browser's own
    // mousedown handling would move focus to the stage *after* a tool has focused
    // something of its own, such as the in-place text editor.
    this.listen(stage, 'mousedown', (e) => e.preventDefault());
    this.listen(stage, 'pointerdown', (e) => this.#onPointerDown(e));
    this.listen(stage, 'pointermove', (e) => this.#onPointerMove(e));
    this.listen(stage, 'pointerup', (e) => this.#onPointerUp(e));
    this.listen(stage, 'pointercancel', (e) => this.#onPointerCancel(e));
    this.listen(stage, 'pointerleave', () => {
      this.#setMarkers(null);
    });
    this.listen(stage, 'dblclick', (e) => {
      if (this._own) return;
      activeTool()?.onDoubleClick(this.#toolEvent(e));
      this.#syncCursor();
    });
    this.listen(stage, 'wheel', (e) => this.#onWheel(e), { passive: false });
    this.listen(stage, 'contextmenu', (e) => {
      e.preventDefault();
      this.emit('canvas-context', { x: e.clientX, y: e.clientY, event: this.#toolEvent(e) });
    });
    // Things dragged in from the asset panel (icons, colors) and from the desktop (files).
    const droppable = (e) => {
      const types = [...(e.dataTransfer?.types ?? [])];
      return types.includes('application/x-mis-icon') || types.includes('application/x-mis-color') || types.includes('Files');
    };
    this.listen(stage, 'dragover', (e) => {
      if (!droppable(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    this.listen(stage, 'drop', (e) => {
      if (!droppable(e)) return;
      e.preventDefault();
      this.emit('canvas-drop', {
        point: this.clientToDoc(e.clientX, e.clientY),
        hit: this.hitTest(e.clientX, e.clientY),
        icon: e.dataTransfer.getData('application/x-mis-icon'),
        color: e.dataTransfer.getData('application/x-mis-color'),
        files: [...(e.dataTransfer.files ?? [])],
      });
    });
    // Dragging out of a ruler creates a guide.
    for (const ruler of this.$$('mis-ruler')) {
      this.listen(ruler, 'pointerdown', (e) => this.#startGuideFromRuler(e, ruler));
    }
    this.listen(window, 'keydown', (e) => {
      if (e.key === ' ' && !e.repeat && !this.#typing(e)) {
        this._spaceDown = true;
        this.#syncCursor();
      }
    });
    this.listen(window, 'keyup', (e) => {
      if (e.key === ' ') {
        this._spaceDown = false;
        this.#syncCursor();
      }
    });
    this.listen(window, 'blur', () => {
      this._spaceDown = false;
    });
    activeTool()?.activate();
  }

  #typing(e) {
    const t = e.composedPath()[0];
    return t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  }

  // --- rendering -------------------------------------------------------------------------

  #renderDoc() {
    const doc = editor.doc;
    const { defs, content } = buildContent(doc, { canvas: true });
    const seen = new Set();
    patchChildren(this.$('.doc-defs'), defs.filter((d) => (seen.has(d.key) ? false : (seen.add(d.key), true))));
    patchChildren(this.$('.content'), content);
    const plate = this.$('.artboard');
    const bg = doc.artboard.background;
    if (bg?.type === 'solid') {
      const { hex, alpha } = splitAlpha(bg.color);
      plate.setAttribute('fill', hex);
      plate.setAttribute('fill-opacity', String(alpha));
    } else {
      plate.setAttribute('fill', 'url(#checker)');
      plate.removeAttribute('fill-opacity');
    }
    this.#placeArtboard();
    this.invalidateOverlay();
  }

  #placeArtboard() {
    const view = editor.store.get('view');
    const { width, height } = editor.doc.artboard;
    const box = boxToScreen(view, { x: 0, y: 0, width, height });
    for (const el of [this.$('.artboard'), this.$('.artboard-edge')]) {
      el.setAttribute('x', fmt(Math.round(box.x) + (el.classList.contains('artboard-edge') ? 0.5 : 0), 1));
      el.setAttribute('y', fmt(Math.round(box.y) + (el.classList.contains('artboard-edge') ? 0.5 : 0), 1));
      el.setAttribute('width', fmt(Math.max(0, Math.round(box.width)), 1));
      el.setAttribute('height', fmt(Math.max(0, Math.round(box.height)), 1));
    }
  }

  #applyView() {
    const view = editor.store.get('view');
    this.$('.viewport').setAttribute('transform', `matrix(${view.zoom} 0 0 ${view.zoom} ${fmt(view.panX, 3)} ${fmt(view.panY, 3)})`);
    this.#placeArtboard();
    for (const ruler of this.$$('mis-ruler')) {
      ruler.view = view;
      ruler.render();
    }
    this.invalidateOverlay();
  }

  /** Redraw the overlay on the next animation frame. */
  invalidateOverlay() {
    if (this._overlayQueued) return;
    this._overlayQueued = true;
    requestAnimationFrame(() => {
      this._overlayQueued = false;
      if (!this.isConnected) return;
      const doc = editor.doc;
      const view = editor.store.get('view');
      const tool = activeTool();
      let toolNodes = [];
      try {
        toolNodes = tool?.overlay() ?? [];
      } catch (err) {
        console.error('overlay failed', err);
      }
      patchChildren(this.$('.overlay-items'), [
        ...gridVNodes(doc, view, this.size),
        ...guideVNodes(doc, view, this.size, this._activeGuide),
        ...toolNodes,
        ...snapVNodes(this.snapFeedback, view, this.size),
      ]);
    });
  }

  #syncCursor() {
    let cursor = 'default';
    if (this._own?.type === 'pan') cursor = 'grabbing';
    else if (this._spaceDown) cursor = 'grab';
    else if (this._own?.type === 'guide') cursor = this._own.axis === 'x' ? 'col-resize' : 'row-resize';
    else cursor = activeTool()?.cursor() ?? 'default';
    if (this.stage.style.cursor !== cursor) this.stage.style.cursor = cursor;
  }

  #setMarkers(raw) {
    const [top, left] = [this.$('mis-ruler.top'), this.$('mis-ruler.left')];
    top.marker = raw ? raw.x : null;
    left.marker = raw ? raw.y : null;
    this.emit('pointer-position', raw);
  }

  // --- view ------------------------------------------------------------------------------

  setView(view) {
    editor.store.set({ view: { ...view, zoom: clampZoom(view.zoom) } });
  }

  zoomToFit(box) {
    if (!this.size.width) return;
    const target = box ?? { x: 0, y: 0, width: editor.doc.artboard.width, height: editor.doc.artboard.height };
    this.setView(fitBox(target, this.size, box ? 64 : 56));
  }

  /** Zoom about the center of the canvas. */
  zoomTo(zoom, anchor) {
    const at = anchor ?? { x: this.size.width / 2, y: this.size.height / 2 };
    this.setView(zoomAt(editor.store.get('view'), zoom, at));
  }

  /** Mark the view as restored from storage so the first layout does not refit it. */
  keepRestoredView() {
    this._viewRestored = true;
  }

  // --- coordinates, hit-testing, snapping ---------------------------------------------------

  /** Client (viewport) point → canvas pixels. */
  clientToScreen(clientX, clientY) {
    const r = this.stage.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }

  clientToDoc(clientX, clientY) {
    return toDoc(editor.store.get('view'), this.clientToScreen(clientX, clientY));
  }

  docToClient(p) {
    const r = this.stage.getBoundingClientRect();
    const s = toScreen(editor.store.get('view'), p);
    return { x: s.x + r.left, y: s.y + r.top };
  }

  /**
   * The id of the node under a viewport point, or null.
   * Without `deep`, the result is resolved to the current scope: a top-level node, or a
   * direct child of the group that has been entered.
   * @param {{deep?: boolean}} [opts]
   */
  hitTest(clientX, clientY, opts = {}) {
    const content = this.$('.content');
    const doc = editor.doc;
    const index = indexOf(doc);
    const scope = editor.store.get('scope');
    // A few pixels of slop makes hairlines clickable.
    const probes = [[0, 0], [3, 0], [-3, 0], [0, 3], [0, -3]];
    for (const [dx, dy] of probes) {
      for (const el of this.shadowRoot.elementsFromPoint(clientX + dx, clientY + dy)) {
        if (!content.contains(el)) continue;
        const chain = [];
        for (let n = /** @type {Element | null} */ (el); n && n !== content; n = n.parentElement) {
          const id = n.getAttribute?.('data-id');
          if (id && index.has(id)) chain.push(id);
        }
        if (!chain.length) continue;
        if (isEffectivelyLocked(doc, chain[0])) continue;
        if (opts.deep) return chain[0];
        const outerFirst = chain.reverse();
        if (scope) {
          const at = outerFirst.indexOf(scope);
          if (at >= 0) {
            if (outerFirst[at + 1]) return outerFirst[at + 1];
            continue;
          }
        }
        return outerFirst[0];
      }
    }
    return null;
  }

  /**
   * Every node under a viewport point, topmost first, resolved to the current scope.
   * Used to reach objects that are covered by others.
   * @returns {string[]}
   */
  hitTestAll(clientX, clientY) {
    const content = this.$('.content');
    const doc = editor.doc;
    const index = indexOf(doc);
    const scope = editor.store.get('scope');
    const out = [];
    for (const el of this.shadowRoot.elementsFromPoint(clientX, clientY)) {
      if (!content.contains(el)) continue;
      const chain = [];
      for (let n = /** @type {Element | null} */ (el); n && n !== content; n = n.parentElement) {
        const id = n.getAttribute?.('data-id');
        if (id && index.has(id)) chain.push(id);
      }
      if (!chain.length || isEffectivelyLocked(doc, chain[0])) continue;
      const outerFirst = chain.reverse();
      const at = scope ? outerFirst.indexOf(scope) : -1;
      const id = at >= 0 ? outerFirst[at + 1] : outerFirst[0];
      if (id && !out.includes(id)) out.push(id);
    }
    return out;
  }

  /** How close (in pixels) a pointer must be to a handle: fingers need more room. */
  get hitRadius() {
    return this._pointerType === 'touch' ? 16 : this._pointerType === 'pen' ? 9 : 6;
  }

  #targets(exclude) {
    const doc = editor.doc;
    const key = [...(exclude ?? [])].join(',');
    // During a gesture the document changes every frame (the preview) but the candidates
    // must stay those of the document as it was when the gesture began.
    const basis = editor.gesture?.doc ?? doc;
    if (!this._snapCache || this._snapCache.doc !== basis || this._snapCache.key !== key) {
      this._snapCache = { doc: basis, key, targets: collectTargets(basis, { exclude }) };
    }
    return this._snapCache.targets;
  }

  get snapTolerance() {
    return editor.doc.snap.threshold / editor.store.get('view').zoom;
  }

  /**
   * Snap a document point. Records what it snapped to, for the overlay.
   * @param {{x:number,y:number}} p
   * @param {{exclude?: Iterable<string>, disabled?: boolean, silent?: boolean}} [opts]
   */
  snap(p, opts = {}) {
    if (opts.disabled || !editor.doc.snap.enabled) {
      if (!opts.silent) this.#setSnapFeedback(null);
      return { x: p.x, y: p.y };
    }
    const result = snapPoint(p, this.#targets(opts.exclude), editor.doc, this.snapTolerance);
    if (!opts.silent) this.#setSnapFeedback(result.snappedX || result.snappedY || result.point ? result : null);
    return { x: result.x, y: result.y };
  }

  /** Snap a moving box; returns the adjustment to add to its position. */
  snapBox(box, opts = {}) {
    if (opts.disabled || !editor.doc.snap.enabled) {
      this.#setSnapFeedback(null);
      return { dx: 0, dy: 0 };
    }
    const result = snapBox(box, this.#targets(opts.exclude), editor.doc, this.snapTolerance);
    this.#setSnapFeedback(result.snappedX || result.snappedY ? { ...result, point: null } : null);
    return { dx: result.dx, dy: result.dy };
  }

  clearSnap() {
    this.#setSnapFeedback(null);
  }

  #setSnapFeedback(value) {
    if (this.snapFeedback === value) return;
    this.snapFeedback = value;
    this.invalidateOverlay();
  }

  // --- pointer routing ---------------------------------------------------------------------

  /** @returns {import('../tools/base.js').ToolPointerEvent} */
  #toolEvent(e) {
    if (e.pointerType) this._pointerType = e.pointerType;
    const screen = this.clientToScreen(e.clientX, e.clientY);
    return {
      screen,
      raw: toDoc(editor.store.get('view'), screen),
      client: { x: e.clientX, y: e.clientY },
      shift: e.shiftKey,
      alt: e.altKey,
      mod: e.ctrlKey || e.metaKey,
      button: e.button,
      pointerType: e.pointerType ?? 'mouse',
      hit: (opts) => this.hitTest(e.clientX, e.clientY, opts),
      original: e,
    };
  }

  #onPointerDown(e) {
    this.stage.focus({ preventScroll: true });
    if (e.pointerType === 'touch') {
      this._touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this._touches.size === 2) {
        this.#disarmLongPress();
        // A second finger turns whatever was happening into a pinch.
        if (this._toolHasPointer) {
          activeTool()?.onPointerCancel();
          this._toolHasPointer = false;
        }
        const [a, b] = [...this._touches.values()];
        this._own = { type: 'pinch', dist: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, view: editor.store.get('view') };
        return;
      }
    }
    if (this._own) return;
    try {
      this.stage.setPointerCapture(e.pointerId);
    } catch {
      // The pointer is already gone (or synthetic); events still arrive without capture.
    }
    if (e.pointerType === 'touch') this.#armLongPress(e);
    const tool = activeTool();
    const wantsPan = e.button === 1 || (e.button === 0 && this._spaceDown);
    if (wantsPan) {
      e.preventDefault();
      this._own = { type: 'pan', x: e.clientX, y: e.clientY, view: editor.store.get('view') };
      this.#syncCursor();
      return;
    }
    if (e.button === 2) return;
    if (e.button === 0 && editor.store.get('tool') === 'select' && !editor.doc.guidesLocked) {
      const guide = this.#guideAt(this.clientToScreen(e.clientX, e.clientY));
      if (guide && !this.hitTest(e.clientX, e.clientY)) {
        this.#beginGuideDrag(guide.axis, guide.id);
        return;
      }
    }
    this._toolHasPointer = true;
    tool?.onPointerDown(this.#toolEvent(e));
    this.#syncCursor();
  }

  #onPointerMove(e) {
    if (e.pointerType === 'touch' && this._touches.has(e.pointerId)) {
      this._touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (this._longPress && Math.hypot(e.clientX - this._longPress.x, e.clientY - this._longPress.y) > 8) this.#disarmLongPress();
    const own = this._own;
    if (own?.type === 'pinch') {
      if (this._touches.size < 2) return;
      const [a, b] = [...this._touches.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const start = this.clientToScreen(own.mid.x, own.mid.y);
      const zoomed = zoomAt(own.view, own.view.zoom * (dist / (own.dist || 1)), start);
      this.setView({ ...zoomed, panX: zoomed.panX + (mid.x - own.mid.x), panY: zoomed.panY + (mid.y - own.mid.y) });
      return;
    }
    if (own?.type === 'pan') {
      this.setView({ ...own.view, panX: own.view.panX + e.clientX - own.x, panY: own.view.panY + e.clientY - own.y });
      return;
    }
    const te = this.#toolEvent(e);
    this._lastPointer = te;
    this.#setMarkers(te.raw);
    if (own?.type === 'guide') {
      this.#dragGuide(e);
      return;
    }
    activeTool()?.onPointerMove(te);
    this.#syncCursor();
  }

  /** Touch has no right button: holding a finger still opens the context menu. */
  #armLongPress(e) {
    this.#disarmLongPress();
    const at = { x: e.clientX, y: e.clientY };
    this._longPress = {
      ...at,
      timer: setTimeout(() => {
        this._longPress = null;
        if (this._touches.size !== 1) return;
        if (this._toolHasPointer) {
          this._toolHasPointer = false;
          activeTool()?.onPointerCancel();
        }
        this.emit('canvas-context', { x: at.x, y: at.y, event: this.#toolEvent(e) });
      }, 550),
    };
  }

  #disarmLongPress() {
    if (!this._longPress) return;
    clearTimeout(this._longPress.timer);
    this._longPress = null;
  }

  #onPointerUp(e) {
    this.#disarmLongPress();
    this._touches.delete(e.pointerId);
    const own = this._own;
    if (own?.type === 'pinch') {
      if (this._touches.size < 2) this._own = null;
      return;
    }
    if (own?.type === 'pan') {
      this._own = null;
      this.#syncCursor();
      return;
    }
    if (own?.type === 'guide') {
      this.#endGuideDrag(e);
      return;
    }
    if (!this._toolHasPointer) return;
    this._toolHasPointer = false;
    // The release point is not guaranteed to have been reported as a move (pens, touch
    // and synthetic input often skip it), so tools always see it as one first.
    const te = this.#toolEvent(e);
    activeTool()?.onPointerMove(te);
    activeTool()?.onPointerUp(te);
    this.#syncCursor();
  }

  #onPointerCancel(e) {
    this.#disarmLongPress();
    this._touches.delete(e.pointerId);
    if (this._own?.type === 'guide') editor.cancel();
    this._own = null;
    if (this._toolHasPointer) {
      this._toolHasPointer = false;
      activeTool()?.onPointerCancel();
    }
    this.clearSnap();
    this.#syncCursor();
  }

  #onWheel(e) {
    e.preventDefault();
    const view = editor.store.get('view');
    if (e.ctrlKey || e.metaKey) {
      // Trackpad pinches arrive as ctrl+wheel with small deltas; mouse wheels with large ones.
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      const factor = Math.exp(-Math.max(-60, Math.min(60, delta)) * 0.01);
      this.setView(zoomAt(view, view.zoom * factor, this.clientToScreen(e.clientX, e.clientY)));
    } else {
      const k = e.deltaMode === 1 ? 16 : 1;
      const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
      const dy = e.shiftKey && !e.deltaX ? 0 : e.deltaY;
      this.setView({ ...view, panX: view.panX - dx * k, panY: view.panY - dy * k });
    }
  }

  // --- guides ------------------------------------------------------------------------------

  #guideAt(screen) {
    const doc = editor.doc;
    if (!doc.guidesVisible) return null;
    const view = editor.store.get('view');
    for (const guide of doc.guides) {
      const pos = guide.axis === 'x' ? guide.position * view.zoom + view.panX : guide.position * view.zoom + view.panY;
      if (Math.abs((guide.axis === 'x' ? screen.x : screen.y) - pos) <= 4) return guide;
    }
    return null;
  }

  #startGuideFromRuler(e, ruler) {
    if (e.button !== 0) return;
    e.preventDefault();
    // A horizontal ruler makes horizontal guides (a y position), and vice versa.
    const axis = ruler.orientation === 'horizontal' ? 'y' : 'x';
    this.stage.setPointerCapture(e.pointerId);
    if (!editor.doc.guidesVisible) editor.store.set({ doc: { ...editor.doc, guidesVisible: true } });
    this.#beginGuideDrag(axis, null);
  }

  #beginGuideDrag(axis, id) {
    editor.begin(id ? 'Move guide' : 'Add guide');
    this._own = { type: 'guide', axis, id: id ?? newId('g'), isNew: !id };
    this._activeGuide = this._own.id;
    this.#syncCursor();
  }

  #guidePosition(e) {
    const own = this._own;
    const raw = this.clientToDoc(e.clientX, e.clientY);
    const g = editor.doc.grid;
    let value = own.axis === 'x' ? raw.x : raw.y;
    if (editor.doc.snap.enabled && editor.doc.snap.grid && !(e.ctrlKey || e.metaKey)) {
      const snapped = own.axis === 'x'
        ? nearestGridLine(value, g.spacingX, g.subdivisions, g.originX)
        : nearestGridLine(value, g.spacingY, g.subdivisions, g.originY);
      if (Math.abs(snapped - value) <= this.snapTolerance) value = snapped;
    }
    return Math.round(value * 1000) / 1000;
  }

  #overRuler(e) {
    const s = this.clientToScreen(e.clientX, e.clientY);
    return this._own.axis === 'x' ? s.x < 0 : s.y < 0;
  }

  #dragGuide(e) {
    const own = this._own;
    const position = this.#guidePosition(e);
    const remove = this.#overRuler(e);
    editor.preview((doc) => {
      const others = doc.guides.filter((g) => g.id !== own.id);
      return { ...doc, guides: remove ? others : [...others, { id: own.id, axis: own.axis, position }] };
    });
  }

  #endGuideDrag(e) {
    this.#dragGuide(e);
    editor.commit();
    this._own = null;
    this._activeGuide = null;
    this.#syncCursor();
    this.invalidateOverlay();
  }
}
