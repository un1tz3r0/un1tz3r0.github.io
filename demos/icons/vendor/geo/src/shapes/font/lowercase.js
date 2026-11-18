// F12 — lowercase a–z as parametric constructions.
//
// Same vocabulary and frame as the uppercase, with the extra structure lowercase brings:
// ascenders, descenders, the closed-top/open-bottom `e`, and the single- vs double-storey
// `a`/`g` — which is exactly the character-specific variation the `misc` axes exist for.
// `misc1` selects storey on both, and is documented on each.

import { vec2 } from '../../core/vec2.js';
import {
  open,
  stem,
  crossbar,
  arm,
  diagonal,
  roundedForm,
  openForm,
  bowl,
  shoulder,
  tail,
  dot,
  cornerCurve,
  sSpine,
} from './strokes.js';
import { waist } from './frame.js';

const p = vec2;

// The x-height o-form every round lowercase shares.
function xBowlForm(f) {
  return roundedForm(
    f.left,
    -f.over,
    f.right,
    f.x + f.over,
    f.axes.roundingClosed,
    f.axes.cornerSharpness,
  );
}

export const LOWERCASE = {
  // `misc1` selects storey: 0 = double-storey (a bowl with a hooked top), 1 = single.
  a: (f) => {
    const single = f.axes.misc1 > 0.5;
    if (single) {
      return [open([stem(f.right, 0, f.x)]), bowl(f.right, f.x * 0.98, 0, f.left, f.axes.roundingClosed, f.axes.cornerSharpness, -1)];
    }
    // Where the bowl meets the stem, from the shared waist axis — the same axis that
    // places B's and S's waists, so the whole alphabet's waists move together.
    const join = f.x * (0.55 + 0.35 * f.axes.bottomProportion);
    return [
      open([stem(f.right, 0, join)]),
      openForm(f.left, -f.over, f.right, join + f.over, f.axes.roundingClosed, f.axes.cornerSharpness, Math.PI / 2, 0.06),
      open([
        cornerCurve(p(f.left, join * 0.86), p(f.left, f.x), p(f.mid, f.x), f.axes.roundingOpen, f.axes.cornerSharpness),
        cornerCurve(p(f.mid, f.x), p(f.right, f.x), p(f.right, join), f.axes.roundingOpen, f.axes.cornerSharpness),
      ]),
    ];
  },

  b: (f) => [
    open([stem(f.left, 0, f.asc)]),
    bowl(f.left, f.x, 0, f.right, f.axes.roundingClosed, f.axes.cornerSharpness),
  ],

  c: (f) => [openForm(f.left, 0, f.right, f.x, f.axes.roundingOpen, f.axes.cornerSharpness, 0, 0.22)],

  d: (f) => [
    open([stem(f.right, 0, f.asc)]),
    bowl(f.right, f.x, 0, f.left, f.axes.roundingClosed, f.axes.cornerSharpness, -1),
  ],

  // Closed at the top, open at the bottom, with the bar at the waist — the one glyph whose
  // counter is bounded by its own crossbar.
  e: (f) => [
    openForm(f.left, 0, f.right, f.x, f.axes.roundingOpen, f.axes.cornerSharpness, -Math.PI * 0.18, 0.16),
    open([crossbar(f.left, f.right, waist(f, 0, f.x, 'top'))]),
  ],

  f: (f) => {
    const hook = f.asc * 0.82;
    return [
      open([stem(f.mid, 0, hook)]),
      open([
        cornerCurve(p(f.mid, hook), p(f.mid, f.asc), p(f.right, f.asc), f.axes.roundingOpen, f.axes.cornerSharpness),
      ]),
      open([crossbar(f.left, f.right, f.x)]),
    ];
  },

  // `misc1`: 0 = single-storey with a descender tail, 1 = double-storey loop.
  g: (f) => {
    const parts = [
      xBowlForm(f),
      open([stem(f.right, f.desc * 0.45, f.x)]),
    ];
    if (f.axes.misc1 > 0.5) {
      parts.push(open([tail(p(f.right, f.desc * 0.45), -(f.width * 0.55), f.desc * 0.5, 0.9)]));
      parts.push(open([crossbar(f.left, f.right, f.desc * 0.95)]));
    } else {
      parts.push(open([tail(p(f.right, f.desc * 0.45), -(f.width * 0.8), f.desc * 0.5, 0.85)]));
    }
    return parts;
  },

  h: (f) => [
    open([stem(f.left, 0, f.asc)]),
    open(shoulder(f.left, f.right, f.x * 0.62, f.x, f.axes.roundingOpen)),
    open([stem(f.right, 0, f.x * 0.62)]),
  ],

  i: (f) => [
    open([stem(f.mid, 0, f.x)]),
    dot(f.mid, f.x + (f.asc - f.x) * 0.55, f.width * 0.11),
  ],

  j: (f) => [
    open([stem(f.mid, f.desc * 0.5, f.x)]),
    open([tail(p(f.mid, f.desc * 0.5), -(f.width * 0.6), f.desc * 0.5, 0.85)]),
    dot(f.mid, f.x + (f.asc - f.x) * 0.55, f.width * 0.11),
  ],

  k: (f) => {
    const j = f.x * 0.5;
    return [
      open([stem(f.left, 0, f.asc)]),
      open([diagonal(p(f.right, f.x), p(f.left, j))]),
      open([diagonal(p(f.left, j), p(f.right, 0))]),
    ];
  },

  l: (f) => [open([stem(f.mid, 0, f.asc)])],

  m: (f) => {
    const a = f.left + f.width * 0.5;
    return [
      open([stem(f.left, 0, f.x)]),
      open(shoulder(f.left, a, f.x * 0.62, f.x, f.axes.roundingOpen)),
      open([stem(a, 0, f.x * 0.62)]),
      open(shoulder(a, f.right, f.x * 0.62, f.x, f.axes.roundingOpen)),
      open([stem(f.right, 0, f.x * 0.62)]),
    ];
  },

  n: (f) => [
    open([stem(f.left, 0, f.x)]),
    open(shoulder(f.left, f.right, f.x * 0.62, f.x, f.axes.roundingOpen)),
    open([stem(f.right, 0, f.x * 0.62)]),
  ],

  o: (f) => [xBowlForm(f)],

  p: (f) => [
    open([stem(f.left, f.desc, f.x)]),
    bowl(f.left, f.x, 0, f.right, f.axes.roundingClosed, f.axes.cornerSharpness),
  ],

  q: (f) => [
    open([stem(f.right, f.desc, f.x)]),
    bowl(f.right, f.x, 0, f.left, f.axes.roundingClosed, f.axes.cornerSharpness, -1),
  ],

  r: (f) => [
    open([stem(f.left, 0, f.x)]),
    open([
      cornerCurve(p(f.left, f.x * 0.66), p(f.left, f.x), p(f.right, f.x), f.axes.roundingOpen, f.axes.cornerSharpness),
    ]),
  ],

  s: (f) => [open(sSpine(f.x, 0, f.left, f.right, waist(f, 0, f.x, 'top'), f.axes.roundingOpen, f.axes.cornerSharpness))],

  t: (f) => {
    const top = f.x + (f.asc - f.x) * 0.55;
    return [
      open([stem(f.mid, f.x * 0.22, top)]),
      open([
        cornerCurve(p(f.mid, f.x * 0.22), p(f.mid, 0), p(f.right, 0), f.axes.roundingOpen, f.axes.cornerSharpness),
      ]),
      open([crossbar(f.left, f.right, f.x)]),
    ];
  },

  u: (f) => {
    const j = f.x * 0.38;
    return [
      open([stem(f.left, j, f.x)]),
      open([
        cornerCurve(p(f.left, j), p(f.left, 0), p(f.mid, 0), f.axes.roundingOpen, f.axes.cornerSharpness),
        cornerCurve(p(f.mid, 0), p(f.right, 0), p(f.right, j), f.axes.roundingOpen, f.axes.cornerSharpness),
      ]),
      open([stem(f.right, 0, f.x)]),
    ];
  },

  v: (f) => [
    open([diagonal(p(f.left, f.x), p(f.mid, 0))]),
    open([diagonal(p(f.mid, 0), p(f.right, f.x))]),
  ],

  w: (f) => {
    const a = f.left + f.width * 0.28;
    const b = f.left + f.width * 0.72;
    const peak = f.x * f.axes.topProportion * 1.15;
    return [
      open([diagonal(p(f.left, f.x), p(a, 0))]),
      open([diagonal(p(a, 0), p(f.mid, peak))]),
      open([diagonal(p(f.mid, peak), p(b, 0))]),
      open([diagonal(p(b, 0), p(f.right, f.x))]),
    ];
  },

  x: (f) => [
    open([diagonal(p(f.left, f.x), p(f.right, 0))]),
    open([diagonal(p(f.left, 0), p(f.right, f.x))]),
  ],

  // The right diagonal carries on past the baseline into the descender, so the tail is
  // the same stroke rather than a second one grafted on.
  y: (f) => {
    const slopeX = (f.mid - f.right) / f.x; // dx per unit rise on the right diagonal
    return [
      open([diagonal(p(f.left, f.x), p(f.mid, 0))]),
      open([diagonal(p(f.right, f.x), p(f.mid + f.desc * slopeX, f.desc))]),
    ];
  },

  z: (f) => [
    open([arm(f.left, f.right, f.x, f.axes, { cutEnd: false })]),
    open([diagonal(p(f.right, f.x), p(f.left, 0))]),
    open([arm(f.left, f.right, 0, f.axes, { cutEnd: false })]),
  ],
};

export const LOWERCASE_WIDTHS = {
  i: 0.36,
  j: 0.4,
  l: 0.36,
  f: 0.5,
  t: 0.52,
  r: 0.58,
  m: 1.32,
  w: 1.2,
  s: 0.76,
  c: 0.8,
  e: 0.82,
  z: 0.78,
  v: 0.84,
  x: 0.84,
  y: 0.84,
  k: 0.84,
};

/** Which axes each lowercase glyph responds to — see the uppercase table for why. */
export const LOWERCASE_AXIS_SENSITIVITY = {
  a: ['exHeight', 'roundingClosed', 'roundingOpen', 'bottomProportion', 'misc1'],
  b: ['exHeight', 'ascender', 'roundingClosed', 'cornerSharpness'],
  c: ['exHeight', 'roundingOpen', 'cornerSharpness'],
  d: ['exHeight', 'ascender', 'roundingClosed', 'cornerSharpness'],
  e: ['exHeight', 'roundingOpen', 'topProportion', 'cornerSharpness'],
  f: ['exHeight', 'ascender', 'roundingOpen'],
  g: ['exHeight', 'descender', 'roundingClosed', 'misc1'],
  h: ['exHeight', 'ascender', 'roundingOpen'],
  i: ['exHeight', 'ascender', 'width'],
  j: ['exHeight', 'ascender', 'descender', 'width'],
  k: ['exHeight', 'ascender'],
  l: ['ascender'],
  m: ['exHeight', 'roundingOpen', 'width'],
  n: ['exHeight', 'roundingOpen'],
  o: ['exHeight', 'roundingClosed', 'cornerSharpness', 'overshoot'],
  p: ['exHeight', 'descender', 'roundingClosed', 'cornerSharpness'],
  q: ['exHeight', 'descender', 'roundingClosed', 'cornerSharpness'],
  r: ['exHeight', 'roundingOpen', 'cornerSharpness'],
  s: ['exHeight', 'topProportion', 'roundingOpen', 'cornerSharpness'],
  t: ['exHeight', 'ascender', 'roundingOpen'],
  u: ['exHeight', 'roundingOpen', 'cornerSharpness'],
  v: ['exHeight', 'width'],
  w: ['exHeight', 'topProportion', 'width'],
  x: ['exHeight', 'width'],
  y: ['exHeight', 'descender', 'width'],
  z: ['exHeight', 'width'],
};
