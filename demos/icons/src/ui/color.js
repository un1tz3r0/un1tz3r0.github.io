// Color controls: <mis-color-picker>, <mis-gradient-editor>, <mis-paint-field>.
//
// All three follow the field event contract: `scrub-start` before a continuous change,
// `input` during it, `change` at the end, each with `detail.value`.

import { MisElement, css, html, h } from './base.js';
import {
  parseColor, formatColor, rgbToHsv, hsvToRgb, rgbToHsl, hslToRgb, rgbToOklch, oklchToRgb, splitAlpha,
} from '../core/color.js';
import { fmt } from '../core/affine.js';

const checker =
  'repeating-conic-gradient(var(--checker-b) 0% 25%, var(--checker-a) 0% 50%) 50% / 10px 10px';

/**
 * HSV color picker with alpha, numeric entry in HEX / RGB / HSL / OKLCH, and an eyedropper
 * where the browser provides one.
 *   picker.value = '#2563ebcc'
 */
export class MisColorPicker extends MisElement {
  static props = {
    value: { type: String, default: '#000000' },
    noAlpha: { type: Boolean, attribute: 'no-alpha' },
  };
  static styles = [
    css`
      :host {
        display: grid;
        /* minmax(0, …) stops wide controls from stretching the track past the host. */
        grid-template-columns: minmax(0, 1fr);
        gap: 8px;
        width: 216px;
      }
      .sv {
        position: relative;
        height: 132px;
        border-radius: var(--radius-sm);
        touch-action: none;
        cursor: crosshair;
        outline-offset: 2px;
      }
      .sv .thumb {
        position: absolute;
        width: 12px;
        height: 12px;
        margin: -6px 0 0 -6px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 0 0 1px rgb(0 0 0 / 0.5);
        pointer-events: none;
      }
      input[type='range'] {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 12px;
        margin: 0;
        border-radius: 6px;
        background: var(--track);
        outline-offset: 2px;
      }
      input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #fff;
        border: 1px solid rgb(0 0 0 / 0.45);
        box-shadow: 0 1px 2px rgb(0 0 0 / 0.3);
      }
      input[type='range']::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #fff;
        border: 1px solid rgb(0 0 0 / 0.45);
      }
      .hue {
        --track: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
      }
      .row {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      .row > * {
        min-width: 0;
      }
      .mode {
        width: 68px;
        flex: none;
      }
      .fields {
        display: flex;
        gap: 4px;
        flex: 1;
      }
      .fields > * {
        flex: 1;
        min-width: 0;
      }
      .sliders {
        display: grid;
        gap: 8px;
        flex: 1;
      }
      .preview {
        width: 30px;
        height: 30px;
        border-radius: var(--radius-sm);
        background: ${checker};
        overflow: hidden;
        flex: none;
        border: 1px solid var(--border);
      }
      .preview div {
        width: 100%;
        height: 100%;
      }
      :host([no-alpha]) .alpha {
        display: none;
      }
    `,
  ];
  static template = html`
    <div class="sv" tabindex="0" role="slider" aria-label="Saturation and brightness"><div class="thumb"></div></div>
    <div class="row">
      <div class="preview"><div></div></div>
      <div class="sliders">
        <input class="hue" type="range" min="0" max="360" step="1" aria-label="Hue" />
        <input class="alpha" type="range" min="0" max="1" step="0.01" aria-label="Opacity" />
      </div>
      <mis-button class="dropper" icon="pipette" label="Pick a color from the screen"></mis-button>
    </div>
    <div class="row">
      <mis-select class="mode" aria-label="Color model"></mis-select>
      <div class="fields"></div>
    </div>
  `;

  constructor() {
    super();
    // HSV is kept as state so hue and saturation survive a trip through black or gray.
    this.hsv = { h: 0, s: 0, v: 0 };
    this.alpha = 1;
    this.mode = 'hex';
    this._scrubbing = false;
  }

  connected() {
    const sv = this.$('.sv');
    const set = (e) => {
      const r = sv.getBoundingClientRect();
      this.hsv = {
        ...this.hsv,
        s: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
        v: 1 - Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
      };
      this.#push('input');
    };
    this.listen(sv, 'pointerdown', (e) => {
      sv.setPointerCapture(e.pointerId);
      this.#start();
      set(e);
    });
    this.listen(sv, 'pointermove', (e) => {
      if (sv.hasPointerCapture(e.pointerId)) set(e);
    });
    this.listen(sv, 'pointerup', () => this.#end());
    this.listen(sv, 'keydown', (e) => {
      const step = e.shiftKey ? 0.1 : 0.01;
      const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
      if (!d) return;
      e.preventDefault();
      e.stopPropagation();
      this.hsv = { ...this.hsv, s: Math.max(0, Math.min(1, this.hsv.s + d[0])), v: Math.max(0, Math.min(1, this.hsv.v + d[1])) };
      this.#push('change');
    });

    const hue = this.$('.hue');
    const alpha = this.$('.alpha');
    for (const [input, apply] of /** @type {[HTMLInputElement, (v: number) => void][]} */ ([
      [hue, (v) => (this.hsv = { ...this.hsv, h: v })],
      [alpha, (v) => (this.alpha = v)],
    ])) {
      this.listen(input, 'input', (e) => {
        e.stopPropagation();
        this.#start();
        apply(Number(input.value));
        this.#push('input');
      });
      this.listen(input, 'change', (e) => {
        e.stopPropagation();
        this.#end();
      });
      this.listen(input, 'keydown', (e) => e.stopPropagation());
    }

    const mode = this.$('.mode');
    mode.options = [
      { value: 'hex', label: 'HEX' },
      { value: 'rgb', label: 'RGB' },
      { value: 'hsl', label: 'HSL' },
      { value: 'oklch', label: 'OKLCH' },
    ];
    mode.value = this.mode;
    this.listen(mode, 'change', (e) => {
      e.stopPropagation();
      this.mode = e.detail.value;
      this.#buildFields();
      this.render();
    });
    this.#buildFields();

    const dropper = this.$('.dropper');
    dropper.hidden = !('EyeDropper' in window);
    this.listen(dropper, 'click', async () => {
      try {
        const result = await new /** @type {any} */ (window).EyeDropper().open();
        const c = parseColor(result.sRGBHex);
        if (!c) return;
        this.hsv = rgbToHsv(c);
        this.#push('change');
      } catch {
        /* cancelled */
      }
    });
  }

  #start() {
    if (this._scrubbing) return;
    this._scrubbing = true;
    this.emit('scrub-start');
  }

  #end() {
    this._scrubbing = false;
    this.#push('change');
  }

  #rgb() {
    return hsvToRgb(this.hsv);
  }

  #push(type) {
    const value = formatColor({ ...this.#rgb(), a: this.noAlpha ? 1 : this.alpha });
    this._own = value;
    this.value = value;
    this.render();
    this.emit(type, { value });
  }

  #buildFields() {
    const host = this.$('.fields');
    const num = (key, label, min, max, step, precision = 0) =>
      h('mis-number-field', { label, min, max, step, precision, dataset: { key } });
    let fields;
    if (this.mode === 'hex') fields = [h('mis-text-field', { dataset: { key: 'hex' }, label: 'Hex color' })];
    else if (this.mode === 'rgb') fields = [num('r', 'R', 0, 255, 1), num('g', 'G', 0, 255, 1), num('b', 'B', 0, 255, 1)];
    else if (this.mode === 'hsl') fields = [num('h', 'H', 0, 360, 1), num('s', 'S', 0, 100, 1), num('l', 'L', 0, 100, 1)];
    else fields = [num('l', 'L', 0, 1, 0.01, 3), num('c', 'C', 0, 0.4, 0.005, 3), num('h', 'H', 0, 360, 1, 1)];
    if (!this.noAlpha) fields.push(h('mis-number-field', { label: 'A', min: 0, max: 100, step: 1, precision: 0, dataset: { key: 'a' }, suffix: '%' }));
    host.replaceChildren(...fields);
    for (const field of fields) {
      field.addEventListener('scrub-start', (e) => {
        e.stopPropagation();
        this.#start();
      });
      const onValue = (e, final) => {
        e.stopPropagation();
        this.#fromFields(field.dataset.key, e.detail.value);
        if (final) this.#end();
        else this.#push('input');
      };
      field.addEventListener('input', (e) => {
        // Typing in the hex box should not rewrite it under the cursor.
        if (field.dataset.key === 'hex') {
          e.stopPropagation();
          return;
        }
        onValue(e, false);
      });
      field.addEventListener('change', (e) => onValue(e, true));
    }
  }

  #fromFields(key, value) {
    if (key === 'a') {
      this.alpha = Math.max(0, Math.min(1, value / 100));
      return;
    }
    if (key === 'hex') {
      const c = parseColor(String(value).startsWith('#') ? value : `#${value}`);
      if (!c) return;
      this.hsv = rgbToHsv(c);
      if (String(value).replace('#', '').length > 6) this.alpha = c.a;
      return;
    }
    const rgb = this.#rgb();
    let next;
    if (this.mode === 'rgb') next = { ...rgb, [key]: value };
    else if (this.mode === 'hsl') next = hslToRgb({ ...rgbToHsl(rgb), [key]: value });
    else next = oklchToRgb({ ...rgbToOklch(rgb), [key]: value });
    const hsv = rgbToHsv(next);
    // Keep the hue the user chose when the color has none of its own.
    this.hsv = hsv.s === 0 ? { ...hsv, h: this.mode === 'hsl' && key === 'h' ? value : this.hsv.h } : hsv;
  }

  propChanged(name, value) {
    if (name !== 'value' || value === this._own) return;
    const c = parseColor(value);
    if (!c) return;
    const hsv = rgbToHsv(c);
    this.hsv = hsv.s === 0 || hsv.v === 0 ? { h: this.hsv.h, s: hsv.v === 0 ? this.hsv.s : 0, v: hsv.v } : hsv;
    this.alpha = c.a;
  }

  render() {
    const rgb = this.#rgb();
    const opaque = formatColor({ ...rgb, a: 1 });
    const sv = this.$('.sv');
    sv.style.background = `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${this.hsv.h} 100% 50%))`;
    const thumb = this.$('.thumb');
    thumb.style.left = `${this.hsv.s * 100}%`;
    thumb.style.top = `${(1 - this.hsv.v) * 100}%`;
    thumb.style.background = opaque;
    sv.setAttribute('aria-valuetext', `Saturation ${Math.round(this.hsv.s * 100)}%, brightness ${Math.round(this.hsv.v * 100)}%`);
    this.$('.hue').value = String(this.hsv.h);
    const alpha = this.$('.alpha');
    alpha.value = String(this.alpha);
    alpha.style.setProperty('--track', `linear-gradient(to right, transparent, ${opaque}), ${checker}`);
    this.$('.preview div').style.background = formatColor({ ...rgb, a: this.alpha });

    const values = { hex: opaque, a: Math.round(this.alpha * 100) };
    if (this.mode === 'rgb') Object.assign(values, { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) });
    else if (this.mode === 'hsl') {
      const hsl = rgbToHsl(rgb);
      Object.assign(values, { h: Math.round(hsl.s === 0 ? this.hsv.h : hsl.h), s: Math.round(hsl.s), l: Math.round(hsl.l) });
    } else if (this.mode === 'oklch') Object.assign(values, rgbToOklch(rgb));
    for (const field of this.$$('.fields > *')) {
      const key = field.dataset.key;
      if (key in values) field.value = values[key];
    }
  }
}

/** Default gradients offered when a paint is switched to a gradient type. */
export function defaultGradient(type, from = '#2563eb') {
  const stops = [{ offset: 0, color: from }, { offset: 1, color: '#ffffff' }];
  return type === 'linear'
    ? { type: 'linear', stops, x1: 0, y1: 0, x2: 1, y2: 0 }
    : { type: 'radial', stops, cx: 0.5, cy: 0.5, r: 0.5 };
}

/** CSS gradient that previews a gradient paint (a swatch-sized approximation). */
export function paintCss(paint) {
  if (!paint || paint.type === 'none') return 'none';
  if (paint.type === 'solid') return paint.color;
  if (paint.type === 'current') return 'currentColor';
  const stops = [...paint.stops].sort((a, b) => a.offset - b.offset).map((s) => `${s.color} ${fmt(s.offset * 100, 1)}%`).join(', ');
  if (paint.type === 'radial') return `radial-gradient(circle at ${fmt(paint.cx * 100, 1)}% ${fmt(paint.cy * 100, 1)}%, ${stops})`;
  const angle = (Math.atan2(paint.y2 - paint.y1, paint.x2 - paint.x1) * 180) / Math.PI + 90;
  return `linear-gradient(${fmt(angle, 1)}deg, ${stops})`;
}

/**
 * Gradient editor: a stop bar, a picker for the selected stop, and geometry fields.
 *   editor.paint = {type: 'linear', stops, x1, y1, x2, y2}
 */
export class MisGradientEditor extends MisElement {
  static props = { paint: { type: Object } };
  static styles = [
    css`
      :host {
        display: grid;
        /* minmax(0, …) stops wide controls from stretching the track past the host. */
        grid-template-columns: minmax(0, 1fr);
        gap: 8px;
        width: 216px;
      }
      .bar {
        position: relative;
        height: 22px;
        border-radius: var(--radius-sm);
        background: ${checker};
        margin: 0 7px 12px;
        cursor: copy;
        touch-action: none;
      }
      .bar .fill {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        border: 1px solid var(--border);
      }
      .stop {
        all: unset;
        position: absolute;
        top: 16px;
        width: 12px;
        height: 12px;
        margin-left: -7px;
        border-radius: 3px;
        border: 2px solid #fff;
        box-shadow: 0 0 0 1px rgb(0 0 0 / 0.5);
        cursor: ew-resize;
        touch-action: none;
      }
      .stop[aria-pressed='true'] {
        box-shadow: 0 0 0 2px var(--accent);
      }
      .stop:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 2px;
      }
      .geom {
        display: flex;
        gap: 4px;
      }
      .geom > * {
        flex: 1;
        min-width: 0;
      }
      .hint {
        color: var(--text-faint);
        font-size: var(--font-size-sm);
      }
    `,
  ];
  static template = html`
    <div class="bar" title="Click to add a stop"><div class="fill"></div></div>
    <div class="geom"></div>
    <mis-color-picker></mis-color-picker>
    <div class="hint">Click the bar to add a stop. Delete removes the selected stop.</div>
  `;

  constructor() {
    super();
    this.selected = 0;
    this._drag = null;
  }

  connected() {
    const bar = this.$('.bar');
    const offsetOf = (e) => {
      const r = bar.getBoundingClientRect();
      return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    };
    this.listen(bar, 'pointerdown', (e) => {
      const stopEl = e.target.closest?.('.stop');
      if (stopEl) {
        this.selected = Number(stopEl.dataset.index);
        stopEl.setPointerCapture(e.pointerId);
        this._drag = { index: this.selected, started: false };
        this.render();
        return;
      }
      // Add a stop, taking the color of the nearest existing one.
      const offset = offsetOf(e);
      const stops = this.paint.stops;
      const nearest = stops.reduce((a, b) => (Math.abs(b.offset - offset) < Math.abs(a.offset - offset) ? b : a));
      this.selected = stops.length;
      this.#emit('change', { ...this.paint, stops: [...stops, { offset, color: nearest.color }] });
    });
    this.listen(bar, 'pointermove', (e) => {
      if (!this._drag) return;
      if (!this._drag.started) {
        this._drag.started = true;
        this.emit('scrub-start');
      }
      this.#emit('input', this.#withStop(this._drag.index, { offset: offsetOf(e) }));
    });
    this.listen(bar, 'pointerup', () => {
      const drag = this._drag;
      this._drag = null;
      if (drag?.started) this.#emit('change', this.paint);
    });
    this.listen(bar, 'keydown', (e) => {
      const stopEl = e.target.closest?.('.stop');
      if (!stopEl) return;
      const index = Number(stopEl.dataset.index);
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.paint.stops.length > 2) {
        e.preventDefault();
        this.selected = 0;
        this.#emit('change', { ...this.paint, stops: this.paint.stops.filter((_, i) => i !== index) });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const delta = (e.key === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 0.1 : 0.01);
        this.#emit('change', this.#withStop(index, { offset: Math.max(0, Math.min(1, this.paint.stops[index].offset + delta)) }));
      }
      e.stopPropagation();
    });

    const picker = this.$('mis-color-picker');
    for (const type of ['scrub-start', 'input', 'change']) {
      this.listen(picker, type, (e) => {
        e.stopPropagation();
        if (type === 'scrub-start') this.emit('scrub-start');
        else this.#emit(type, this.#withStop(this.selected, { color: e.detail.value }));
      });
    }
  }

  #withStop(index, patch) {
    return { ...this.paint, stops: this.paint.stops.map((s, i) => (i === index ? { ...s, ...patch } : s)) };
  }

  #emit(type, paint) {
    this.paint = paint;
    this.emit(type, { value: paint });
  }

  #buildGeometry() {
    const host = this.$('.geom');
    const p = this.paint;
    const kind = p.type;
    if (host.dataset.kind === kind) return;
    host.dataset.kind = kind;
    const num = (key, label, opts) => h('mis-number-field', { label, dataset: { key }, ...opts });
    const fields = kind === 'linear'
      ? [num('angle', '∠', { step: 5, precision: 1, suffix: '°' })]
      : [
          num('cx', 'X', { step: 1, precision: 0, suffix: '%', min: -100, max: 200 }),
          num('cy', 'Y', { step: 1, precision: 0, suffix: '%', min: -100, max: 200 }),
          num('r', 'R', { step: 1, precision: 0, suffix: '%', min: 1, max: 300 }),
        ];
    host.replaceChildren(...fields);
    for (const field of fields) {
      field.addEventListener('scrub-start', (e) => {
        e.stopPropagation();
        this.emit('scrub-start');
      });
      for (const type of ['input', 'change']) {
        field.addEventListener(type, (e) => {
          e.stopPropagation();
          const key = field.dataset.key;
          const v = e.detail.value;
          let next;
          if (key === 'angle') {
            // The vector runs through the center of the box, corner to corner at 45°.
            const a = (v * Math.PI) / 180;
            const dx = Math.cos(a) / 2;
            const dy = Math.sin(a) / 2;
            next = { ...this.paint, x1: 0.5 - dx, y1: 0.5 - dy, x2: 0.5 + dx, y2: 0.5 + dy };
          } else next = { ...this.paint, [key]: v / 100 };
          this.#emit(type, next);
        });
      }
    }
  }

  render() {
    const p = this.paint;
    if (!p?.stops) return;
    if (this.selected >= p.stops.length) this.selected = 0;
    const sorted = [...p.stops].sort((a, b) => a.offset - b.offset);
    this.$('.fill').style.background = `linear-gradient(to right, ${sorted.map((s) => `${s.color} ${fmt(s.offset * 100, 1)}%`).join(', ')})`;
    const bar = this.$('.bar');
    const existing = this.$$('.stop');
    p.stops.forEach((stop, i) => {
      const el = existing[i] ?? bar.appendChild(h('button', { type: 'button', class: 'stop' }));
      el.dataset.index = String(i);
      el.style.left = `${stop.offset * 100}%`;
      el.style.background = splitAlpha(stop.color).hex;
      el.setAttribute('aria-pressed', String(i === this.selected));
      el.setAttribute('aria-label', `Stop ${i + 1} at ${Math.round(stop.offset * 100)}%`);
    });
    for (const extra of existing.slice(p.stops.length)) extra.remove();
    this.$('mis-color-picker').value = p.stops[this.selected].color;
    this.#buildGeometry();
    const values = p.type === 'linear'
      ? { angle: (Math.atan2(p.y2 - p.y1, p.x2 - p.x1) * 180) / Math.PI }
      : { cx: p.cx * 100, cy: p.cy * 100, r: p.r * 100 };
    for (const field of this.$$('.geom > *')) field.value = values[field.dataset.key];
  }
}

/**
 * A paint control: swatch + type + hex, with a popover editor.
 *   field.paint = {type: 'solid', color: '#ff0000'}     (null → "mixed")
 * Attributes: `types` (space-separated subset of "none solid linear radial current").
 */
export class MisPaintField extends MisElement {
  static props = {
    paint: { type: Object },
    types: { type: String, default: 'none solid linear radial current' },
    label: { type: String },
    mixed: { type: Boolean },
  };
  static styles = [
    css`
      :host {
        display: flex;
        gap: 4px;
        align-items: center;
        min-width: 0;
      }
      .swatch {
        all: unset;
        box-sizing: border-box;
        width: var(--control-h);
        height: var(--control-h);
        flex: none;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-strong);
        background: ${checker};
        overflow: hidden;
        position: relative;
      }
      .swatch:focus-visible {
        outline: 2px solid var(--focus);
        outline-offset: 1px;
      }
      .swatch div {
        position: absolute;
        inset: 0;
      }
      .swatch.none div {
        background: linear-gradient(to top right, transparent 46%, var(--danger) 46% 54%, transparent 54%), var(--bg-field) !important;
      }
      mis-select {
        flex: 1 1 78px;
        min-width: 0;
      }
      mis-text-field {
        flex: 1 1 74px;
        min-width: 0;
      }
      .pop {
        position: fixed;
        inset: auto;
        margin: 0;
        padding: 10px;
        border: none;
        border-radius: var(--radius);
        background: var(--bg-raised);
        color: var(--text);
        box-shadow: var(--shadow-pop);
        overflow: visible;
      }
    `,
  ];
  static template = html`
    <button class="swatch" type="button"><div></div></button>
    <mis-select class="type"></mis-select>
    <mis-text-field class="hex" label="Hex color"></mis-text-field>
    <div class="pop" popover="auto"></div>
  `;

  connected() {
    const type = this.$('.type');
    this.listen(type, 'change', (e) => {
      e.stopPropagation();
      this.#set('change', this.#convert(e.detail.value));
    });
    const hex = this.$('.hex');
    this.listen(hex, 'input', (e) => e.stopPropagation());
    this.listen(hex, 'change', (e) => {
      e.stopPropagation();
      const text = e.detail.value.trim();
      const c = parseColor(text.startsWith('#') ? text : `#${text}`);
      if (c) this.#set('change', { type: 'solid', color: formatColor(c) });
      else this.render();
    });
    const swatch = this.$('.swatch');
    const pop = this.$('.pop');
    this.listen(swatch, 'click', () => {
      if (!this.paint || this.paint.type === 'none' || this.paint.type === 'current') {
        this.#set('change', this.#convert('solid'));
      }
      this.#buildEditor();
      pop.showPopover();
      // Keep the popover on screen, preferring the left of the swatch (the sidebar is at
      // the right edge of the window).
      const r = swatch.getBoundingClientRect();
      const p = pop.getBoundingClientRect();
      let x = r.left - p.width - 10;
      if (x < 8) x = Math.min(innerWidth - p.width - 8, r.right + 10);
      pop.style.left = `${x}px`;
      pop.style.top = `${Math.max(8, Math.min(innerHeight - p.height - 8, r.top - 40))}px`;
    });
    this.listen(pop, 'keydown', (e) => {
      if (e.key !== 'Escape') e.stopPropagation();
    });
  }

  /** The last solid color seen, used when switching types back and forth. */
  #baseColor() {
    const p = this.paint;
    if (p?.type === 'solid') return p.color;
    if (p?.stops?.length) return p.stops[0].color;
    return this._lastColor ?? '#2563eb';
  }

  #convert(type) {
    const color = this.#baseColor();
    if (type === 'none') return { type: 'none' };
    if (type === 'current') return { type: 'current' };
    if (type === 'solid') return { type: 'solid', color };
    const p = this.paint;
    if (p?.stops) {
      // Switching between gradient kinds keeps the stops.
      return type === 'linear'
        ? { type: 'linear', stops: p.stops, x1: 0, y1: 0, x2: 1, y2: 0 }
        : { type: 'radial', stops: p.stops, cx: 0.5, cy: 0.5, r: 0.5 };
    }
    return defaultGradient(type, color);
  }

  #set(eventType, paint) {
    if (paint.type === 'solid') this._lastColor = paint.color;
    this.mixed = false;
    this.paint = paint;
    this.emit(eventType, { value: paint });
  }

  #buildEditor() {
    const pop = this.$('.pop');
    const p = this.paint;
    const wanted = p?.stops ? 'mis-gradient-editor' : 'mis-color-picker';
    let editor = pop.firstElementChild;
    if (editor?.localName !== wanted) {
      editor = h(wanted);
      pop.replaceChildren(editor);
      editor.addEventListener('scrub-start', (e) => {
        e.stopPropagation();
        this.emit('scrub-start');
      });
      for (const type of ['input', 'change']) {
        editor.addEventListener(type, (e) => {
          e.stopPropagation();
          const value = e.detail.value;
          this.#set(type, typeof value === 'string' ? { type: 'solid', color: value } : value);
        });
      }
    }
    if (p?.stops) editor.paint = p;
    else if (p?.type === 'solid') editor.value = p.color;
  }

  render() {
    const p = this.mixed ? null : this.paint;
    const names = { none: 'None', solid: 'Solid', linear: 'Linear', radial: 'Radial', current: 'Current' };
    const type = this.$('.type');
    const allowed = (this.types || '').split(/\s+/).filter(Boolean);
    type.options = allowed.map((t) => ({ value: t, label: names[t] }));
    type.mixed = !p;
    type.value = p?.type ?? '';
    type.setAttribute('aria-label', `${this.label || 'Paint'} type`);
    type.hidden = allowed.length < 2;
    const swatch = this.$('.swatch');
    swatch.classList.toggle('none', !p || p.type === 'none');
    swatch.firstElementChild.style.background = p ? paintCss(p) : 'transparent';
    swatch.setAttribute('aria-label', `${this.label || 'Paint'}: edit`);
    const hex = this.$('.hex');
    hex.hidden = p?.type !== 'solid';
    if (p?.type === 'solid') hex.value = p.color.toUpperCase();
    if (this.$('.pop').matches(':popover-open')) this.#buildEditor();
  }
}
