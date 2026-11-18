// F12 — the variable-font axis model.
//
// One `Axes` value, resolved once and handed to every glyph builder. The point of the
// design (per user, 2026-07-21) is that the glyphs are **parametric constructions over a
// shared axis vector**, not fixed outlines: moving an axis has to propagate by
// construction rather than by hand-editing sixty glyphs. That only works if the axes are
// *shared* — `roundingClosed` means the same thing to `o`, `O`, `D`, `b`, `d`, `p` and `q`
// — so the axis table below is the contract that makes the alphabet coherent.
//
// Everything is a ratio against a unit advance, so "height relative to width" is the
// native form and scaling to a point size is one multiply at the end.
//
// Pure data: `resolveAxes` returns a plain object with every axis present and clamped, and
// nothing downstream reads an unresolved value. Ports as a struct.

/**
 * The axis table: `[min, default, max]` per axis, plus a one-line meaning.
 *
 * Ranges are *clamps*, not validation errors — a caller sweeping an axis past its end
 * should get the extreme glyph, not an exception, because that is what an interactive
 * specimen does.
 */
export const AXES = {
  // --- metrics (ratios against a unit advance) ---
  emHeight: { range: [0.5, 1.6, 4], doc: 'em square height' },
  capHeight: { range: [0.3, 1.1, 3], doc: 'height of uppercase letters' },
  exHeight: { range: [0.2, 0.78, 2.5], doc: 'height of lowercase x' },
  ascender: { range: [0.3, 1.2, 3.5], doc: 'height of b/d/h/k/l' },
  descender: { range: [0, 0.3, 1.5], doc: 'depth below the baseline of g/j/p/q/y' },
  width: { range: [0.3, 1, 3], doc: 'advance width multiplier' },
  slant: { range: [45, 90, 135], doc: 'degrees from the baseline; 90 is upright' },
  tracking: { range: [-0.3, 0.06, 1], doc: 'extra advance between glyphs' },
  sidebearing: { range: [0, 0.1, 0.6], doc: 'space inside the advance, each side' },

  // --- shared feature axes ---
  // Each applies to *every* glyph that has the feature. That is the whole point: the
  // alphabet stays coherent because a change lands everywhere the feature occurs.
  topProportion: { range: [0.25, 0.52, 0.75], doc: 'where the waist sits — B E R S X 3 8' },
  bottomProportion: { range: [0.25, 0.48, 0.75], doc: 'lower counterpart of topProportion' },
  innerProportion: { range: [0.1, 0.62, 0.95], doc: 'counter size relative to the outer form' },
  roundingClosed: { range: [0, 1, 1], doc: 'closed bowls: o O D b d p q' },
  roundingOpen: { range: [0, 0.85, 1], doc: 'open curves: C c e G J U S' },
  cornerSharpness: { range: [0, 0.35, 1], doc: '0 = fully round corner, 1 = square' },
  terminalCut: { range: [-60, 0, 60], doc: 'degrees; angle of an open terminal' },
  serif: { range: [0, 0, 1], doc: '0 = sans, 1 = full slab' },
  serifSize: { range: [0, 0.12, 0.4], doc: 'serif length when serif > 0' },
  strokeContrast: { range: [0, 0, 0.9], doc: 'thick/thin ratio, for later stroking' },
  overshoot: { range: [0, 0.012, 0.08], doc: 'how far round glyphs exceed flat ones' },

  // --- misc: the escape hatch ---
  // Character-specific variation no shared axis covers, wired and documented per glyph
  // (single- vs double-storey a/g, for instance).
  misc1: { range: [0, 0, 1], doc: 'per-glyph; documented by each glyph that reads it' },
  misc2: { range: [0, 0, 1], doc: 'per-glyph' },
  misc3: { range: [0, 0, 1], doc: 'per-glyph' },
};

/** Advance modes. `'monospace'` gives every glyph the same advance. */
export const ADVANCE_MODES = ['proportional', 'monospace'];

export const AXIS_NAMES = Object.keys(AXES);

function clamp(v, [lo, , hi]) {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Resolve a partial axis vector into a complete, clamped one.
 *
 * Unknown keys throw rather than being ignored: a typo in an axis name is a bug that
 * would otherwise show up as "the slider does nothing", which is much harder to find than
 * an exception at the call site.
 *
 * @param {object} [partial]  any subset of `AXES`, plus `advance`
 * @returns {object} every axis, clamped, plus `advance`
 */
export function resolveAxes(partial = {}) {
  const out = {};
  for (const [name, spec] of Object.entries(AXES)) out[name] = spec.range[1];

  for (const [k, v] of Object.entries(partial)) {
    if (k === 'advance') continue;
    if (!(k in AXES)) {
      throw new TypeError(
        `resolveAxes: unknown axis ${JSON.stringify(k)} — known axes are ${AXIS_NAMES.join(', ')}`,
      );
    }
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new TypeError(`resolveAxes: axis ${k} must be a finite number, got ${v}`);
    }
    out[k] = clamp(v, AXES[k].range);
  }

  const advance = partial.advance ?? 'proportional';
  if (!ADVANCE_MODES.includes(advance)) {
    throw new TypeError(`resolveAxes: advance must be one of ${ADVANCE_MODES.join(', ')}`);
  }
  out.advance = advance;
  return out;
}

/** The default axis vector — `resolveAxes()` with nothing set. */
export function defaultAxes() {
  return resolveAxes({});
}

/**
 * The shear matrix entry for the slant axis: x' = x + `slantShear(axes)` · y.
 *
 * Slant is stored in degrees from the baseline because that is how type designers state
 * it (90 = upright), but every consumer wants the shear, so the conversion lives here
 * rather than being re-derived in each glyph.
 */
export function slantShear(axes) {
  return 1 / Math.tan((axes.slant * Math.PI) / 180);
}

/**
 * The vertical extent a glyph may occupy, as `{top, bottom}` — used by the test battery to
 * check that no glyph escapes its em box, and by `textMetrics` for line boxes.
 */
export function verticalExtent(axes) {
  return {
    top: Math.max(axes.capHeight, axes.ascender) + axes.overshoot,
    bottom: -(axes.descender + axes.overshoot),
  };
}
