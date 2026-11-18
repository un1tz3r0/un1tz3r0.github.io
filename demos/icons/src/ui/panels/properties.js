// <mis-properties> and its sections. DESIGN.md §12.1.
//
// With a selection, the sidebar shows that selection's properties. With none, it shows the
// active tool's options, the default style for new objects, and the document settings.

import { MisElement, css, html } from '../base.js';
import { PropSection, row, common, show, paintTargets, h, editor } from './prop-base.js';
import { app } from '../../app.js';
import { findNode, updateNodes, patchNodes, topLevel, worldMatrix } from '../../core/model/tree.js';
import { selectionBounds } from '../../core/geometry/bounds.js';
import { setSelectionBounds, rotateNodes } from '../../core/model/edit.js';
import { decompose, fmt } from '../../core/affine.js';
import { offsetDoc, roundDoc } from '../../commands-path.js';
import { BLEND_MODES, ARTBOARD_PRESETS, NONE, gridSpacingFor } from '../../core/model/nodes.js';

const num = (label, opts = {}) => h('mis-number-field', { label, ...opts });
const cmdButton = (id, opts = {}) => {
  const b = h('mis-button', { variant: 'outline', dataset: { command: id }, ...opts });
  b.addEventListener('click', () => editor.commands.get(id) && editor.commands.run(id));
  return b;
};
/** Label and enabled state for the command buttons inside a section. */
function syncCommandButtons(root) {
  for (const b of root.querySelectorAll('[data-command]')) {
    const cmd = editor.commands.get(b.dataset.command);
    b.hidden = !cmd;
    if (!cmd) continue;
    if (!b.textContent && !b.icon) b.textContent = cmd.label;
    if (b.icon && !b.label) b.label = cmd.label;
    b.disabled = !editor.commands.isEnabled(cmd.id);
  }
}
const DRAWING_TOOLS = new Set(['rect', 'ellipse', 'polygon', 'line', 'pen', 'text']);

// --- Transform -----------------------------------------------------------------------------

export class PropTransform extends PropSection {
  static heading = 'Transform';
  static applies = (s) => s.ids.length > 0;

  build(host) {
    this.lock = false;
    this.x = num('X');
    this.y = num('Y');
    this.w = num('W', { min: 0.001 });
    this.h_ = num('H', { min: 0.001 });
    this.rot = num('∠', { suffix: '°', step: 1, precision: 1 });
    this.lockBtn = h('mis-button', { icon: 'unlink', label: 'Keep proportions', toggle: true });
    this.lockBtn.addEventListener('click', () => {
      this.lock = !this.lock;
      this.lockBtn.pressed = this.lock;
      this.lockBtn.icon = this.lock ? 'link' : 'unlink';
    });
    const ids = () => editor.selection;
    this.bind(this.x, 'Move', (doc, v) => setSelectionBounds(doc, ids(), { x: v }));
    this.bind(this.y, 'Move', (doc, v) => setSelectionBounds(doc, ids(), { y: v }));
    this.bind(this.w, 'Resize', (doc, v) => {
      const b = selectionBounds(doc, ids());
      const target = this.lock && b?.width > 0 ? { width: v, height: (b.height * v) / b.width } : { width: v };
      return setSelectionBounds(doc, ids(), target);
    });
    this.bind(this.h_, 'Resize', (doc, v) => {
      const b = selectionBounds(doc, ids());
      const target = this.lock && b?.height > 0 ? { height: v, width: (b.width * v) / b.height } : { height: v };
      return setSelectionBounds(doc, ids(), target);
    });
    this.bind(this.rot, 'Rotate', (doc, v) => {
      const current = this.#rotation(doc, ids());
      return rotateNodes(doc, ids(), ((v - current) * Math.PI) / 180);
    });
    host.append(
      h('div', { class: 'grid2' }, this.x, this.y, this.w, this.h_),
      h('div', { class: 'row' },
        h('div', { class: 'ctl' },
          this.rot,
          this.lockBtn,
          cmdButton('object.flipH', { variant: 'ghost', icon: 'flip-horizontal-2' }),
          cmdButton('object.flipV', { variant: 'ghost', icon: 'flip-vertical-2' }),
          cmdButton('object.rotateCW', { variant: 'ghost', icon: 'rotate-cw' }),
        ),
      ),
    );
  }

  /** Rotation in degrees of a single selected node; 0 for several, or baked geometry. */
  #rotation(doc, ids) {
    const top = topLevel(doc, ids);
    if (top.length !== 1) return 0;
    return (decompose(worldMatrix(doc, top[0])).rotation * 180) / Math.PI;
  }

  update(state) {
    const box = selectionBounds(state.doc, state.ids);
    for (const [field, key] of [[this.x, 'x'], [this.y, 'y'], [this.w, 'width'], [this.h_, 'height']]) {
      field.value = box ? box[key] : null;
      field.disabled = !box;
    }
    this.rot.value = this.#rotation(state.doc, state.ids);
    syncCommandButtons(this.shadowRoot);
  }
}

// --- Appearance ----------------------------------------------------------------------------

export class PropAppearance extends PropSection {
  static heading = 'Appearance';
  static applies = (s) => s.ids.length > 0;

  build(host) {
    this.slider = h('mis-slider', { min: 0, max: 100, step: 1, label: 'Opacity' });
    this.opacity = h('mis-number-field', { min: 0, max: 100, step: 1, precision: 0, suffix: '%', style: 'flex:0 0 62px' });
    this.opacity.setAttribute('aria-label', 'Opacity');
    this.blend = h('mis-select', {
      attrs: { 'aria-label': 'Blend mode' },
      options: BLEND_MODES.map((m) => ({ value: m, label: m.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()) })),
    });
    const set = (node, v) => ({ ...node, opacity: Math.max(0, Math.min(1, v / 100)) });
    this.bindNodes(this.slider, 'Opacity', set);
    this.bindNodes(this.opacity, 'Opacity', set);
    this.bindNodes(this.blend, 'Blend mode', (node, v) => ({ ...node, blend: v }));
    host.append(row('Opacity', this.slider, this.opacity), row('Blend', this.blend));
  }

  update(state) {
    const o = common(state.nodes, (n) => Math.round(n.opacity * 100));
    show(this.opacity, o);
    if (!o.mixed) this.slider.value = o.value;
    show(this.blend, common(state.nodes, (n) => n.blend));
  }
}

// --- Fill ----------------------------------------------------------------------------------

/** Whether Fill/Stroke should edit the default style rather than a selection. */
const editsDefaults = (s) => s.ids.length === 0 && DRAWING_TOOLS.has(s.tool);
const fillOf = (n) => (n.type === 'icon' ? { type: 'solid', color: n.color } : n.fill);

export class PropFill extends PropSection {
  static heading = 'Fill';
  static applies = (s) => editsDefaults(s) || paintTargets(s.doc, s.ids, { icons: true }).length > 0;

  build(host) {
    this.paint = h('mis-paint-field', { label: 'Fill' });
    this.rule = h('mis-segmented', {
      label: 'Fill rule',
      options: [{ value: 'nonzero', label: 'Non-zero' }, { value: 'evenodd', label: 'Even-odd' }],
    });
    const setFill = (doc, paint) => {
      const ids = paintTargets(doc, editor.selection, { icons: true }).map((n) => n.id);
      if (!ids.length) return doc;
      return updateNodes(doc, ids, (node) => {
        if (node.type === 'icon') return paint.type === 'solid' ? { ...node, color: paint.color } : node;
        return { ...node, fill: paint };
      });
    };
    // With nothing selected the control edits the style new objects are drawn with.
    for (const type of ['scrub-start', 'input', 'change']) {
      this.paint.addEventListener(type, (e) => {
        if (editor.selection.length) return;
        e.stopImmediatePropagation();
        if (type !== 'scrub-start') editor.store.set({ style: { ...editor.store.get('style'), fill: e.detail.value } });
      });
    }
    this.bind(this.paint, 'Fill', setFill);
    this.paint.addEventListener('change', (e) => {
      if (editor.selection.length) editor.store.set({ style: { ...editor.store.get('style'), fill: e.detail.value } });
    });
    this.bindNodes(this.rule, 'Fill rule', (node, v) => (node.type === 'path' ? { ...node, fillRule: v } : node));
    this.ruleRow = row('Rule', this.rule);
    host.append(this.paint, this.ruleRow);
  }

  update(state) {
    if (editsDefaults(state)) {
      this.paint.mixed = false;
      this.paint.paint = editor.store.get('style').fill;
      this.ruleRow.hidden = true;
      return;
    }
    const targets = paintTargets(state.doc, state.ids, { icons: true });
    show(this.paint, common(targets, fillOf));
    const paths = state.nodes.filter((n) => n.type === 'path');
    this.ruleRow.hidden = paths.length === 0;
    if (paths.length) show(this.rule, common(paths, (n) => n.fillRule));
  }
}

// --- Stroke --------------------------------------------------------------------------------

export class PropStroke extends PropSection {
  static heading = 'Stroke';
  static applies = (s) => editsDefaults(s) || paintTargets(s.doc, s.ids).length > 0;

  build(host) {
    this.paint = h('mis-paint-field', { label: 'Stroke' });
    this.width = num('W', { min: 0, step: 0.5 });
    this.width.setAttribute('aria-label', 'Stroke width');
    this.cap = h('mis-segmented', {
      label: 'Line cap',
      options: [{ value: 'butt', label: 'Butt' }, { value: 'round', label: 'Round' }, { value: 'square', label: 'Square' }],
    });
    this.join = h('mis-segmented', {
      label: 'Line join',
      options: [{ value: 'miter', label: 'Miter' }, { value: 'round', label: 'Round' }, { value: 'bevel', label: 'Bevel' }],
    });
    this.dash = h('mis-text-field', { placeholder: 'e.g. 4 2', label: 'Dash pattern' });
    this.miter = num('Limit', { min: 1, step: 0.5 });

    const patch = (key) => (value) => {
      const style = editor.store.get('style');
      editor.store.set({ style: { ...style, stroke: { ...style.stroke, [key]: value } } });
    };
    const wire = (field, label, key, convert = (v) => v) => {
      // Default-style editing when nothing is selected.
      for (const type of ['scrub-start', 'input', 'change']) {
        field.addEventListener(type, (e) => {
          if (editor.selection.length) return;
          e.stopImmediatePropagation();
          if (type !== 'scrub-start') patch(key)(convert(e.detail.value));
        });
      }
      this.bind(field, label, (doc, value) => {
        const ids = paintTargets(doc, editor.selection).map((n) => n.id);
        return updateNodes(doc, ids, (node) => {
          const next = { ...node.stroke, [key]: convert(value) };
          // Giving a stroke a color implies wanting to see it.
          if (key === 'paint' && next.paint.type !== 'none' && !(next.width > 0)) next.width = 1;
          return { ...node, stroke: next };
        });
      });
      field.addEventListener('change', (e) => {
        if (editor.selection.length) patch(key)(convert(e.detail.value));
      });
    };
    wire(this.paint, 'Stroke', 'paint');
    wire(this.width, 'Stroke width', 'width');
    wire(this.cap, 'Line cap', 'cap');
    wire(this.join, 'Line join', 'join');
    wire(this.miter, 'Miter limit', 'miterLimit');
    // Only a finished entry is a dash pattern; half-typed text is not.
    this.dash.addEventListener('input', (e) => e.stopImmediatePropagation());
    wire(this.dash, 'Dash pattern', 'dash', (text) =>
      String(text).split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n) && n >= 0),
    );
    this.details = h('div', { style: 'display:grid;gap:6px' },
      row('Width', this.width, this.miter),
      row('Cap', this.cap),
      row('Join', this.join),
      row('Dashes', this.dash),
    );
    host.append(this.paint, this.details);
  }

  update(state) {
    const defaults = editsDefaults(state);
    const strokes = defaults ? [editor.store.get('style').stroke] : paintTargets(state.doc, state.ids).map((n) => n.stroke);
    show(this.paint, common(strokes, (s) => s.paint));
    show(this.width, common(strokes, (s) => s.width));
    show(this.cap, common(strokes, (s) => s.cap));
    const join = common(strokes, (s) => s.join);
    show(this.join, join);
    show(this.miter, common(strokes, (s) => s.miterLimit));
    this.miter.hidden = join.value !== 'miter';
    const dash = common(strokes, (s) => s.dash.join(' '));
    if (this.dash.shadowRoot.activeElement == null) this.dash.value = dash.mixed ? '' : dash.value;
    this.details.hidden = strokes.every((s) => s.paint.type === 'none');
  }
}

// --- Shape ---------------------------------------------------------------------------------

const SHAPE_FIELDS = {
  rect: [['rx', 'Radius', { min: 0, step: 1 }]],
  ellipse: [['rx', 'Radius X', { min: 0 }], ['ry', 'Radius Y', { min: 0 }]],
  polygon: [['sides', 'Sides', { min: 3, max: 64, step: 1, precision: 0 }], ['radius', 'Radius', { min: 0 }], ['rounding', 'Rounding', { min: 0 }], ['rotation', 'Turn', { suffix: '°', step: 5, precision: 1, angle: true }]],
  star: [['points', 'Points', { min: 3, max: 64, step: 1, precision: 0 }], ['outer', 'Outer', { min: 0 }], ['inner', 'Inner', { min: 0 }], ['rounding', 'Rounding', { min: 0 }], ['rotation', 'Turn', { suffix: '°', step: 5, precision: 1, angle: true }]],
  line: [['x1', 'X1', {}], ['y1', 'Y1', {}], ['x2', 'X2', {}], ['y2', 'Y2', {}]],
};

export class PropShape extends PropSection {
  static heading = 'Shape';
  static applies = (s) => s.nodes.length > 0 && s.nodes.every((n) => n.type === 'shape' && n.shape === s.nodes[0].shape);

  build(host) {
    this.host_ = host;
    this.kind = '';
    this.fields = [];
  }

  #rebuild(kind) {
    this.kind = kind;
    this.fields = SHAPE_FIELDS[kind].map(([key, label, opts]) => {
      const { angle, ...rest } = /** @type {any} */ (opts);
      const field = num('', rest);
      field.setAttribute('aria-label', label);
      field.dataset.key = key;
      field.dataset.angle = angle ? '1' : '';
      this.bindNodes(field, label, (node, v) => {
        if (node.type !== 'shape') return node;
        const params = { ...node.params, [key]: angle ? (v * Math.PI) / 180 : v };
        // A rectangle's corner radius is one number in the UI.
        if (node.shape === 'rect' && key === 'rx') params.ry = v;
        return { ...node, params };
      });
      return [label, field];
    });
    const names = { rect: 'Rectangle', ellipse: 'Ellipse', polygon: 'Polygon', star: 'Star', line: 'Line' };
    this.$('mis-section').heading = names[kind];
    this.host_.replaceChildren(
      ...this.fields.map(([label, field]) => row(label, field)),
      h('div', { class: 'buttons' }, cmdButton('object.convertToPath')),
    );
  }

  update(state) {
    const kind = state.nodes[0].shape;
    if (kind !== this.kind) this.#rebuild(kind);
    for (const [, field] of this.fields) {
      const key = field.dataset.key;
      show(field, common(state.nodes, (n) => (field.dataset.angle ? (n.params[key] * 180) / Math.PI : n.params[key])));
    }
    syncCommandButtons(this.shadowRoot);
  }
}

// --- Text ----------------------------------------------------------------------------------

export class PropText extends PropSection {
  static heading = 'Text';
  static applies = (s) => (s.nodes.length > 0 && s.nodes.every((n) => n.type === 'text')) || (s.ids.length === 0 && s.tool === 'text');

  build(host) {
    const texts = () => editor.selection.filter((id) => findNode(editor.doc, id)?.type === 'text');
    /** Apply to the selected text, or to the text tool's defaults when none is selected. */
    const wire = (field, label, patch) => {
      for (const type of ['scrub-start', 'input', 'change']) {
        field.addEventListener(type, (e) => {
          if (editor.selection.length) return;
          e.stopImmediatePropagation();
          if (type !== 'scrub-start') {
            const current = /** @type {any} */ (app.tools.get('text'))?.defaults ?? {};
            editor.setToolOptions('text', patch({ font: current.font, ...current }, e.detail.value, true));
          }
        });
      }
      this.bindNodes(field, label, (node, v) => (node.type === 'text' ? { ...node, ...patch(node, v, false) } : node), texts);
    };

    this.content = h('textarea', { rows: 2, spellcheck: false });
    this.content.setAttribute('aria-label', 'Text content');
    this.content.addEventListener('keydown', (e) => e.stopPropagation());
    this.content.addEventListener('input', () => {
      if (!editor.gesture) editor.begin('Edit text');
      editor.preview((doc) => patchNodes(doc, texts(), { text: this.content.value }));
    });
    this.content.addEventListener('change', () => editor.commit());

    this.family = h('mis-button', { variant: 'outline', style: 'flex:1;min-width:0' });
    this.family.addEventListener('click', () => {
      // Choosing a typeface happens in the asset panel's font browser.
      this.emit('show-assets', { tab: 'fonts' });
    });
    this.weight = h('mis-select', { attrs: { 'aria-label': 'Font weight' } });
    this.italic = h('mis-button', { icon: 'italic', label: 'Italic', toggle: true });
    this.italic.addEventListener('click', () => {
      const next = this.italic.pressed ? 'normal' : 'italic';
      this.italic.dispatchEvent(new CustomEvent('change', { detail: { value: next } }));
    });
    this.size = num('Size', { min: 0.1, step: 1 });
    this.leading = num('Line', { min: 0.1, step: 0.05, precision: 2 });
    this.tracking = num('Space', { step: 0.1, precision: 2 });
    this.align = h('mis-segmented', {
      label: 'Alignment',
      options: [
        { value: 'start', icon: 'align-left', label: 'Align left' },
        { value: 'middle', icon: 'align-center', label: 'Align center' },
        { value: 'end', icon: 'align-right', label: 'Align right' },
      ],
    });
    wire(this.weight, 'Font weight', (n, v) => ({ font: { ...n.font, weight: Number(v) } }));
    wire(this.italic, 'Font style', (n, v) => ({ font: { ...n.font, style: v } }));
    wire(this.size, 'Font size', (_n, v) => ({ size: v }));
    wire(this.leading, 'Line height', (_n, v) => ({ lineHeight: v }));
    wire(this.tracking, 'Letter spacing', (_n, v) => ({ letterSpacing: v }));
    wire(this.align, 'Text alignment', (_n, v) => ({ align: v }));
    this.contentRow = this.content;
    this.license = h('div', { class: 'note' });
    host.append(
      this.contentRow,
      row('Font', this.family),
      row('Style', this.weight, this.italic),
      h('div', { class: 'grid2' }, this.size, this.leading),
      row('Spacing', this.tracking),
      row('Align', this.align),
      this.license,
      h('div', { class: 'buttons' }, cmdButton('text.outline')),
    );
  }

  update(state) {
    const tool = /** @type {any} */ (app.tools.get('text'));
    const items = state.nodes.length ? state.nodes : [tool?.defaults].filter(Boolean);
    if (!items.length) return;
    this.contentRow.hidden = state.nodes.length === 0;
    const text = common(state.nodes, (n) => n.text);
    if (this.shadowRoot.activeElement !== this.content) this.content.value = text.mixed ? '' : (text.value ?? '');
    this.content.placeholder = text.mixed ? 'Mixed' : '';
    const font = common(items, (n) => n.font);
    this.family.textContent = font.mixed ? 'Mixed' : font.value.family;
    if (!font.mixed) this.family.style.fontFamily = `'${font.value.family}', var(--font)`;

    const fonts = app.services.fonts;
    const info = !font.mixed && fonts ? fonts.cached(font.value) : null;
    const weights = info?.weights?.length ? info.weights : [100, 200, 300, 400, 500, 600, 700, 800, 900];
    const names = { 100: 'Thin', 200: 'Extra light', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold', 800: 'Extra bold', 900: 'Black' };
    const wkey = weights.join(',');
    if (this._wkey !== wkey) {
      this._wkey = wkey;
      this.weight.options = weights.map((w) => ({ value: String(w), label: `${names[w] ?? ''} ${w}`.trim() }));
    }
    show(this.weight, common(items, (n) => String(n.font.weight)));
    const style = common(items, (n) => n.font.style);
    this.italic.pressed = style.value === 'italic';
    this.italic.disabled = !!info && !info.styles?.includes('italic');
    show(this.size, common(items, (n) => n.size));
    show(this.leading, common(items, (n) => n.lineHeight));
    show(this.tracking, common(items, (n) => n.letterSpacing));
    show(this.align, common(items, (n) => n.align));
    this.license.textContent = info ? `${info.family} · ${info.license ?? 'license unknown'}${info.providerLabel ? ` · ${info.providerLabel}` : ''}` : '';
    // Fetch family details (weights, license) the first time a font is shown.
    if (!font.mixed && fonts && !info) fonts.describe(font.value).then(() => this.update(state), () => {});
    syncCommandButtons(this.shadowRoot);
  }
}

// --- Icon ----------------------------------------------------------------------------------

export class PropIcon extends PropSection {
  static heading = 'Icon';
  static applies = (s) => s.nodes.length > 0 && s.nodes.every((n) => n.type === 'icon');

  build(host) {
    this.info = h('div', { class: 'note' });
    this.replace = h('mis-button', { variant: 'outline', textContent: 'Replace…' });
    this.replace.addEventListener('click', () => {
      /** @type {any} */ (app.tools.get('place'))?.beginReplace?.(editor.selection);
      editor.setTool('place');
      this.emit('show-assets', { tab: 'icons' });
    });
    host.append(this.info, h('div', { class: 'buttons' }, this.replace, cmdButton('object.convertToPath')));
  }

  update(state) {
    const src = common(state.nodes, (n) => n.source);
    const icons = app.services.icons;
    if (src.mixed) this.info.textContent = `${state.nodes.length} icons from different sets`;
    else {
      const set = icons?.cachedSet(src.value.prefix);
      const license = set?.license ? ` · ${set.license.title}${set.attribution ? ' (attribution required)' : ''}` : '';
      this.info.replaceChildren(
        h('strong', { textContent: src.value.name }),
        ` — ${set?.name ?? src.value.prefix}${set?.author?.name ? ` by ${set.author.name}` : ''}${license}`,
      );
      if (icons && !set) icons.listSets().then(() => this.update(state), () => {});
    }
    syncCommandButtons(this.shadowRoot);
  }
}

// --- Group ---------------------------------------------------------------------------------

export class PropGroup extends PropSection {
  static heading = 'Group';
  static applies = (s) => s.nodes.length === 1 && s.nodes[0].type === 'group';

  build(host) {
    this.note = h('div', { class: 'note' });
    host.append(
      this.note,
      h('div', { class: 'buttons' }, cmdButton('object.ungroup'), cmdButton('object.releaseClip'), cmdButton('object.convertToPath')),
    );
  }

  update(state) {
    const g = state.nodes[0];
    const count = `${g.children.length} object${g.children.length === 1 ? '' : 's'}`;
    this.note.textContent = g.clip === 'clip' ? `${count}. The top object clips the rest.`
      : g.clip === 'mask' ? `${count}. The top object masks the rest (white shows, black hides).`
      : `${count}. Double-click on the canvas to edit inside.`;
    syncCommandButtons(this.shadowRoot);
  }
}

// --- Path operations -----------------------------------------------------------------------

export class PropPath extends PropSection {
  static heading = 'Path';
  static applies = (s) => s.ids.length > 0 && s.nodes.every((n) => n.type === 'path' || n.type === 'shape');

  build(host) {
    // Both fields work live: scrub or type and the shape follows; the change is one undo
    // step, after which the field returns to zero ready for the next adjustment.
    this.offset = num('', { step: 0.5, value: 0, precision: 2, style: 'flex:0 0 62px' });
    this.offset.setAttribute('aria-label', 'Offset distance (negative shrinks)');
    this.join = h('mis-segmented', {
      label: 'Offset corners',
      value: 'round',
      options: [{ value: 'round', label: 'Round' }, { value: 'miter', label: 'Sharp' }],
    });
    this.join.addEventListener('change', (e) => e.stopPropagation());
    this.radius = num('', { step: 0.5, min: 0, value: 0, precision: 2, style: 'flex:0 0 62px' });
    this.radius.setAttribute('aria-label', 'Corner radius');
    this.corner = h('mis-segmented', {
      label: 'Corner style',
      value: 'round',
      options: [{ value: 'round', label: 'Round' }, { value: 'chamfer', label: 'Chamfer' }],
    });
    this.corner.addEventListener('change', (e) => e.stopPropagation());
    const ids = () => editor.selection;
    this.bind(this.offset, 'Offset path', (doc, v) => offsetDoc(doc, ids(), v, this.join.value));
    this.bind(this.radius, 'Round corners', (doc, v) => roundDoc(doc, ids(), v, this.corner.value === 'chamfer'));
    for (const field of [this.offset, this.radius]) {
      field.addEventListener('change', () => queueMicrotask(() => (field.value = 0)));
    }
    host.append(
      row('Offset', this.offset, this.join),
      row('Corners', this.radius, this.corner),
      h('div', { class: 'note', textContent: 'Drag a label or type a distance; the shape follows. Negative offsets shrink.' }),
      h('div', { class: 'buttons' }, cmdButton('path.strokeToPath'), cmdButton('path.simplify'), cmdButton('path.reverse')),
    );
  }

  update() {
    syncCommandButtons(this.shadowRoot);
  }
}

// --- Points (Node tool) ----------------------------------------------------------------------

export class PropNodes extends PropSection {
  static heading = 'Points';
  static applies = (s) => s.tool === 'node' && (/** @type {any} */ (app.tools.get('node'))?.sel.size ?? 0) > 0;

  build(host) {
    const tool = () => /** @type {any} */ (app.tools.get('node'));
    this.x = num('X');
    this.y = num('Y');
    this.bind(this.x, 'Move point', (doc, v) => tool().moveSingleTo({ x: v })(doc));
    this.bind(this.y, 'Move point', (doc, v) => tool().moveSingleTo({ y: v })(doc));
    this.kind = h('mis-segmented', {
      label: 'Point type',
      options: [{ value: 'corner', label: 'Corner' }, { value: 'smooth', label: 'Smooth' }, { value: 'symmetric', label: 'Symmetric' }],
    });
    this.kind.addEventListener('change', (e) => {
      e.stopPropagation();
      tool().setType(e.detail.value);
    });
    const btn = (label, fn) => h('mis-button', { variant: 'outline', textContent: label, onclick: () => fn(tool()) });
    this.join = btn('Join', (t) => t.joinSelected());
    this.note = h('div', { class: 'note' });
    host.append(
      h('div', { class: 'grid2' }, this.x, this.y),
      row('Type', this.kind),
      h('div', { class: 'buttons' }, btn('Break', (t) => t.breakSelected()), this.join, btn('Delete', (t) => t.deleteSelected())),
      this.note,
    );
  }

  update() {
    const tool = /** @type {any} */ (app.tools.get('node'));
    const one = tool.singleAnchor();
    const count = tool.sel.size;
    this.x.disabled = this.y.disabled = !one;
    this.x.value = one ? one.world.x : null;
    this.y.value = one ? one.world.y : null;
    this.kind.value = one ? one.anchor.type : '';
    this.join.disabled = count !== 2;
    this.note.textContent = one
      ? 'Double-click a segment to add a point. Alt-drag a handle to move it on its own.'
      : `${count} points selected. Arrow keys nudge them.`;
  }
}

// --- Effects -------------------------------------------------------------------------------

export class PropEffects extends PropSection {
  static heading = 'Effects';
  static applies = (s) => s.ids.length > 0;

  build(host) {
    this.list = h('div', { style: 'display:grid;gap:6px' });
    const add = (effect, label) => h('mis-button', {
      variant: 'outline', icon: 'plus', textContent: label,
      onclick: () => editor.apply(`Add ${label.toLowerCase()}`, (doc) => patchNodes(doc, editor.selection, (n) => ({ effects: [...n.effects, effect] }))),
    });
    host.append(
      this.list,
      h('div', { class: 'buttons' },
        add({ type: 'dropShadow', dx: 0, dy: 2, blur: 4, color: '#00000066' }, 'Drop shadow'),
        add({ type: 'blur', radius: 2 }, 'Blur')),
    );
    this.key = '';
  }

  update(state) {
    const fx = common(state.nodes, (n) => n.effects);
    if (fx.mixed) {
      this.key = 'mixed';
      this.list.replaceChildren(h('div', { class: 'note', textContent: 'The selected objects have different effects.' }));
      return;
    }
    const effects = fx.value ?? [];
    // Rebuild rows only when the list's shape changes, so fields keep focus while editing.
    const key = effects.map((e) => e.type).join(',');
    if (key !== this.key) {
      this.key = key;
      this.list.replaceChildren(...effects.map((effect, i) => this.#item(effect, i)));
    }
    effects.forEach((effect, i) => {
      for (const field of this.list.children[i].querySelectorAll('[data-key]')) {
        if (field.dataset.key === 'color') field.paint = { type: 'solid', color: effect.color };
        else field.value = effect[field.dataset.key];
      }
    });
  }

  #item(effect, index) {
    const setKey = (key) => (node, v) => ({
      ...node,
      effects: node.effects.map((e, i) => (i === index ? { ...e, [key]: key === 'color' ? v.color ?? e.color : v } : e)),
    });
    const field = (key, label, opts = {}) => {
      const f = num(label, { step: 0.5, ...opts, dataset: { key } });
      this.bindNodes(f, 'Edit effect', setKey(key));
      return f;
    };
    const remove = h('mis-button', {
      icon: 'x', label: 'Remove effect',
      onclick: () => editor.apply('Remove effect', (doc) => patchNodes(doc, editor.selection, (n) => ({ effects: n.effects.filter((_, i) => i !== index) }))),
    });
    if (effect.type === 'blur') {
      return h('div', { class: 'item' },
        h('div', { class: 'item-head' }, h('span', { textContent: 'Blur' }), remove),
        field('radius', 'Radius', { min: 0 }));
    }
    const color = h('mis-paint-field', { types: 'solid', label: 'Shadow color', dataset: { key: 'color' } });
    this.bindNodes(color, 'Edit effect', setKey('color'));
    return h('div', { class: 'item' },
      h('div', { class: 'item-head' }, h('span', { textContent: 'Drop shadow' }), remove),
      h('div', { class: 'grid2' }, field('dx', 'X'), field('dy', 'Y')),
      field('blur', 'Blur', { min: 0 }),
      color);
  }
}

// --- Tool options --------------------------------------------------------------------------

export class PropTool extends PropSection {
  static heading = 'Tool';
  static applies = (s) => s.ids.length === 0 && s.toolClass?.options?.length > 0;

  build(host) {
    this.host_ = host;
    this.toolId = '';
    this.fields = new Map();
  }

  update(state) {
    const T = state.toolClass;
    if (T.id !== this.toolId) {
      this.toolId = T.id;
      this.fields.clear();
      this.$('mis-section').heading = `${T.label} tool`;
      this.host_.replaceChildren(...T.options.map((opt) => {
        let field;
        if (opt.type === 'boolean') {
          field = h('mis-checkbox', { textContent: opt.label });
          field.addEventListener('change', (e) => editor.setToolOptions(T.id, { [opt.key]: e.detail.value }));
          this.fields.set(opt.key, field);
          return field;
        }
        if (opt.type === 'select') field = h('mis-select', { options: opt.options });
        else field = num('', { min: opt.min ?? null, max: opt.max ?? null, step: opt.step ?? 1, precision: opt.precision ?? 2 });
        field.setAttribute('aria-label', opt.label);
        for (const type of ['input', 'change']) {
          field.addEventListener(type, (e) => {
            e.stopPropagation();
            editor.setToolOptions(T.id, { [opt.key]: e.detail.value });
          });
        }
        this.fields.set(opt.key, field);
        return row(opt.label, field);
      }));
    }
    const values = app.tools.get(T.id).options;
    for (const [key, field] of this.fields) {
      if (field.localName === 'mis-checkbox') field.checked = !!values[key];
      else field.value = values[key];
    }
  }
}

// --- Document ------------------------------------------------------------------------------

export class PropDocument extends PropSection {
  static heading = 'Artboard';
  static applies = (s) => s.ids.length === 0;

  build(host) {
    const setSize = (key) => (doc, v) => ({ ...doc, artboard: { ...doc.artboard, [key]: Math.max(1, v) } });
    this.w = num('W', { min: 1, max: 16384, step: 1 });
    this.h_ = num('H', { min: 1, max: 16384, step: 1 });
    this.bind(this.w, 'Artboard size', setSize('width'));
    this.bind(this.h_, 'Artboard size', setSize('height'));
    this.preset = h('mis-select', {
      attrs: { 'aria-label': 'Artboard size preset' },
      options: [{ value: '', label: 'Custom size' }, ...ARTBOARD_PRESETS.map((p) => ({ value: `${p.width}x${p.height}`, label: p.label.includes('×') ? p.label : `${p.label} × ${p.label}` }))],
    });
    this.preset.addEventListener('change', (e) => {
      e.stopPropagation();
      const [w, hh] = e.detail.value.split('x').map(Number);
      if (!w) return;
      editor.apply('Artboard size', (doc) => ({ ...doc, artboard: { ...doc.artboard, width: w, height: hh } }));
      app.canvas?.zoomToFit();
    });
    this.bg = h('mis-paint-field', { types: 'none solid', label: 'Background' });
    this.bind(this.bg, 'Background', (doc, paint) => ({ ...doc, artboard: { ...doc.artboard, background: paint.type === 'solid' ? paint : NONE } }));
    this.fitGrid = h('mis-button', {
      variant: 'outline', textContent: 'Reset grid for this size',
      onclick: () => editor.apply('Grid', (doc) => {
        const s = gridSpacingFor(doc.artboard.width, doc.artboard.height);
        return { ...doc, grid: { ...doc.grid, spacingX: s, spacingY: s, originX: 0, originY: 0 } };
      }),
    });
    host.append(row('Preset', this.preset), h('div', { class: 'grid2' }, this.w, this.h_), row('Backdrop', this.bg), h('div', { class: 'buttons' }, this.fitGrid));
  }

  update(state) {
    const a = state.doc.artboard;
    this.w.value = a.width;
    this.h_.value = a.height;
    const key = `${a.width}x${a.height}`;
    this.preset.value = ARTBOARD_PRESETS.some((p) => `${p.width}x${p.height}` === key) ? key : '';
    this.bg.paint = a.background;
  }
}

// --- Grid ----------------------------------------------------------------------------------

export class PropGrid extends PropSection {
  static heading = 'Grid & snapping';
  static applies = (s) => s.ids.length === 0;

  build(host) {
    this.linked = true;
    const grid = (patch) => (doc, v) => ({ ...doc, grid: { ...doc.grid, ...patch(v, doc.grid) } });
    this.visible = h('mis-checkbox', { textContent: 'Show grid' });
    this.bind(this.visible, 'Grid', grid((v) => ({ visible: v })));
    this.sx = num('X', { min: 0.01, step: 1, precision: 3 });
    this.sy = num('Y', { min: 0.01, step: 1, precision: 3 });
    this.link = h('mis-button', { icon: 'link', label: 'Same spacing in both directions', toggle: true, pressed: true });
    this.link.addEventListener('click', () => {
      this.linked = !this.linked;
      this.link.pressed = this.linked;
      this.link.icon = this.linked ? 'link' : 'unlink';
    });
    this.bind(this.sx, 'Grid spacing', grid((v) => (this.linked ? { spacingX: v, spacingY: v } : { spacingX: v })));
    this.bind(this.sy, 'Grid spacing', grid((v) => (this.linked ? { spacingX: v, spacingY: v } : { spacingY: v })));
    this.sub = num('', { min: 1, max: 16, step: 1, precision: 0 });
    this.sub.setAttribute('aria-label', 'Subdivisions');
    this.bind(this.sub, 'Grid subdivisions', grid((v) => ({ subdivisions: Math.max(1, Math.round(v)) })));
    this.ox = num('X', { step: 1, precision: 3 });
    this.oy = num('Y', { step: 1, precision: 3 });
    this.bind(this.ox, 'Grid origin', grid((v) => ({ originX: v })));
    this.bind(this.oy, 'Grid origin', grid((v) => ({ originY: v })));
    this.style_ = h('mis-segmented', { label: 'Grid style', options: [{ value: 'lines', label: 'Lines' }, { value: 'dots', label: 'Dots' }, { value: 'isometric', label: 'Iso' }] });
    this.bind(this.style_, 'Grid style', grid((v) => ({ style: v })));
    this.color = h('mis-paint-field', { types: 'solid', label: 'Grid color' });
    this.bind(this.color, 'Grid color', grid((p) => ({ color: p.color.slice(0, 7) })));
    this.opacity = h('mis-slider', { min: 5, max: 100, step: 5, label: 'Grid opacity' });
    this.bind(this.opacity, 'Grid opacity', grid((v) => ({ opacity: v / 100 })));
    this.threshold = num('', { min: 1, max: 40, step: 1, precision: 0, suffix: 'px' });
    this.threshold.setAttribute('aria-label', 'Snap distance');
    this.bind(this.threshold, 'Snap distance', (doc, v) => ({ ...doc, snap: { ...doc.snap, threshold: v } }));
    this.guides = h('div', { class: 'note' });
    this.guideList = h('div', { style: 'display:grid;gap:4px' });
    this.guideKey = '';
    host.append(
      this.visible,
      row('Spacing', this.sx, this.sy, this.link),
      row('Divisions', this.sub),
      row('Origin', this.ox, this.oy),
      row('Style', this.style_),
      row('Color', this.color),
      row('Strength', this.opacity),
      row('Snap within', this.threshold),
      this.guideList,
      this.guides,
    );
  }

  update(state) {
    const g = state.doc.grid;
    this.visible.checked = g.visible;
    this.sx.value = g.spacingX;
    this.sy.value = g.spacingY;
    this.sub.value = g.subdivisions;
    this.ox.value = g.originX;
    this.oy.value = g.originY;
    this.style_.value = g.style;
    this.color.paint = { type: 'solid', color: g.color };
    this.opacity.value = Math.round(g.opacity * 100);
    this.threshold.value = state.doc.snap.threshold;
    // One row per guide: its position can be typed, and it can be removed.
    const guides = state.doc.guides;
    const key = guides.map((gd) => gd.id).join(',');
    if (key !== this.guideKey) {
      this.guideKey = key;
      this.guideList.replaceChildren(...guides.map((gd) => {
        const field = num(gd.axis === 'x' ? 'X' : 'Y', { precision: 3, dataset: { id: gd.id } });
        field.setAttribute('aria-label', `${gd.axis === 'x' ? 'Vertical' : 'Horizontal'} guide position`);
        this.bind(field, 'Move guide', (doc, v) => ({ ...doc, guides: doc.guides.map((x) => (x.id === gd.id ? { ...x, position: v } : x)) }));
        const remove = h('mis-button', {
          icon: 'x', label: 'Remove guide',
          onclick: () => editor.apply('Remove guide', (doc) => ({ ...doc, guides: doc.guides.filter((x) => x.id !== gd.id) })),
        });
        return row(gd.axis === 'x' ? 'Guide │' : 'Guide ─', field, remove);
      }));
    }
    for (const field of this.guideList.querySelectorAll('mis-number-field')) {
      const gd = guides.find((x) => x.id === field.dataset.id);
      if (gd) field.value = gd.position;
    }
    this.guides.textContent = guides.length
      ? 'Drag a guide on the canvas to move it, or back onto its ruler to remove it.'
      : 'Drag from a ruler to add a guide.';
  }
}

// --- container -----------------------------------------------------------------------------

const SECTIONS = [
  ['mis-prop-tool', PropTool],
  ['mis-prop-nodes', PropNodes],
  ['mis-prop-transform', PropTransform],
  ['mis-prop-appearance', PropAppearance],
  ['mis-prop-shape', PropShape],
  ['mis-prop-text', PropText],
  ['mis-prop-icon', PropIcon],
  ['mis-prop-group', PropGroup],
  ['mis-prop-fill', PropFill],
  ['mis-prop-stroke', PropStroke],
  ['mis-prop-path', PropPath],
  ['mis-prop-effects', PropEffects],
  ['mis-prop-document', PropDocument],
  ['mis-prop-grid', PropGrid],
];

export class MisProperties extends MisElement {
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 0;
        background: var(--bg-raised);
      }
      header {
        flex: none;
        display: flex;
        align-items: center;
        height: 30px;
        padding: 0 var(--s2);
        border-bottom: 1px solid var(--border);
        font-weight: 600;
        gap: 6px;
      }
      header .kind {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .scroll {
        flex: 1;
        min-height: 0;
        overflow: hidden auto;
        scrollbar-gutter: stable;
      }
    `,
  ];
  static template = html`<header><span class="kind"></span></header><div class="scroll" role="region" aria-label="Properties"></div>`;

  /** Define the section elements. Called from main.js. */
  static defineSections() {
    for (const [tag, cls] of SECTIONS) cls.define(tag);
  }

  connected() {
    const scroll = this.$('.scroll');
    if (!scroll.children.length) scroll.append(...SECTIONS.map(([tag]) => document.createElement(tag)));
    let queued = false;
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        if (this.isConnected) this.#sync();
      });
    };
    const store = editor.store;
    for (const key of ['doc', 'selection', 'tool', 'toolOptions', 'style', 'nodeSelection']) this.watch(store, key, schedule);
    schedule();
  }

  #sync() {
    const doc = editor.doc;
    const ids = editor.selection;
    const tool = editor.store.get('tool');
    /** @type {import('./prop-base.js').PropState} */
    const state = {
      doc,
      ids,
      nodes: ids.map((id) => findNode(doc, id)).filter(Boolean),
      tool,
      toolClass: app.tools.get(tool)?.constructor,
    };
    const names = { path: 'Path', shape: 'Shape', text: 'Text', icon: 'Icon', group: 'Group' };
    let kind = 'Document';
    if (state.nodes.length === 1) kind = state.nodes[0].name || names[state.nodes[0].type];
    else if (state.nodes.length > 1) {
      const types = new Set(state.nodes.map((n) => n.type));
      kind = `${state.nodes.length} ${types.size === 1 ? `${names[[...types][0]].toLowerCase()}s` : 'objects'}`;
    }
    this.$('.kind').textContent = kind;
    for (const section of /** @type {any[]} */ ([...this.$('.scroll').children])) {
      const applies = section.constructor.applies(state);
      section.hidden = !applies;
      if (applies) {
        try {
          section.update(state);
        } catch (err) {
          console.error(`${section.localName} failed to update`, err);
        }
      }
    }
  }
}
