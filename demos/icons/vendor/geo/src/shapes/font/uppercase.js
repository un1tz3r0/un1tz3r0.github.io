// F12 — uppercase A–Z as parametric constructions.
//
// Every glyph is written in the K3 stroke vocabulary and reads the frame for layout, so
// moving a shared axis re-shapes the whole alphabet coherently. The per-glyph
// axis-sensitivity table at the bottom records *which* axes each glyph responds to — it
// is the map for anyone changing an axis and wondering what will move.
//
// Centerlines, em frame, y up from the baseline. Widths are the glyph's own proportion
// (`I` narrow, `M`/`W` wide); the frame turns those into advances.

import { vec2 } from '../../core/vec2.js';
import { line, cubic } from '../../core/segment.js';
import {
  open,
  stem,
  crossbar,
  arm,
  diagonal,
  roundedForm,
  openForm,
  bowl,
  tail,
  serifBar,
  cornerCurve,
  sSpine,
} from './strokes.js';
import { waist } from './frame.js';

const p = vec2;

// Where a diagonal from (ax,ay)→(bx,by) crosses height y — used to land A's crossbar on
// its legs rather than at a guessed x.
function xAtHeight(ax, ay, bx, by, y) {
  if (Math.abs(by - ay) < 1e-12) return ax;
  return ax + ((bx - ax) * (y - ay)) / (by - ay);
}

/**
 * The uppercase builders. Each is `(f) => {parts, width}` where `parts` is a list of
 * Subpaths in the em frame and `width` is the glyph's proportion.
 */
export const UPPERCASE = {
  A: (f) => {
    const apex = f.mid;
    const y = waist(f, 0, f.cap, 'bottom') * 0.72;
    const lx = xAtHeight(f.left, 0, apex, f.cap, y);
    const rx = xAtHeight(f.right, 0, apex, f.cap, y);
    return [
      open([diagonal(p(f.left, 0), p(apex, f.cap))]),
      open([diagonal(p(apex, f.cap), p(f.right, 0))]),
      open([crossbar(lx, rx, y)]),
    ];
  },

  B: (f) => {
    const w = waist(f);
    const inner = f.left + f.width * f.axes.innerProportion;
    return [
      open([stem(f.left, 0, f.cap)]),
      bowl(f.left, f.cap, w, inner, f.axes.roundingClosed, f.axes.cornerSharpness),
      bowl(f.left, w, 0, f.right, f.axes.roundingClosed, f.axes.cornerSharpness),
    ];
  },

  C: (f) => [openForm(f.left, 0, f.right, f.cap, f.axes.roundingOpen, f.axes.cornerSharpness, 0, 0.22)],

  D: (f) => [
    open([stem(f.left, 0, f.cap)]),
    bowl(f.left, f.cap, 0, f.right, f.axes.roundingClosed, f.axes.cornerSharpness),
  ],

  E: (f) => [
    open([stem(f.left, 0, f.cap)]),
    open([arm(f.left, f.right, f.cap, f.axes)]),
    open([crossbar(f.left, f.left + f.width * f.axes.innerProportion, waist(f))]),
    open([arm(f.left, f.right, 0, f.axes)]),
  ],

  F: (f) => [
    open([stem(f.left, 0, f.cap)]),
    open([arm(f.left, f.right, f.cap, f.axes)]),
    open([crossbar(f.left, f.left + f.width * f.axes.innerProportion, waist(f))]),
  ],

  G: (f) => {
    const bar = waist(f, 0, f.cap, 'bottom');
    return [
      openForm(f.left, 0, f.right, f.cap, f.axes.roundingOpen, f.axes.cornerSharpness, 0, 0.22),
      open([crossbar(f.mid, f.right, bar)]),
      open([stem(f.right, bar, f.cap * 0.28)]),
    ];
  },

  H: (f) => [
    open([stem(f.left, 0, f.cap)]),
    open([stem(f.right, 0, f.cap)]),
    open([crossbar(f.left, f.right, waist(f))]),
  ],

  I: (f) => [
    open([stem(f.mid, 0, f.cap)]),
    serifBar(f.mid, f.cap, f.axes, f.width),
    serifBar(f.mid, 0, f.axes, f.width),
  ],

  J: (f) => {
    const hook = f.cap * 0.26;
    return [
      open([stem(f.right, hook, f.cap)]),
      open([tail(p(f.right, hook), -(f.width * 0.85), -hook, 0.85)]),
    ];
  },

  K: (f) => {
    const j = waist(f);
    return [
      open([stem(f.left, 0, f.cap)]),
      open([diagonal(p(f.right, f.cap), p(f.left, j))]),
      open([diagonal(p(f.left, j), p(f.right, 0))]),
    ];
  },

  L: (f) => [open([stem(f.left, 0, f.cap)]), open([arm(f.left, f.right, 0, f.axes)])],

  M: (f) => {
    const dip = f.cap * (1 - f.axes.topProportion) * 0.4;
    return [
      open([stem(f.left, 0, f.cap)]),
      open([diagonal(p(f.left, f.cap), p(f.mid, dip))]),
      open([diagonal(p(f.mid, dip), p(f.right, f.cap))]),
      open([stem(f.right, 0, f.cap)]),
    ];
  },

  N: (f) => [
    open([stem(f.left, 0, f.cap)]),
    open([diagonal(p(f.left, f.cap), p(f.right, 0))]),
    open([stem(f.right, 0, f.cap)]),
  ],

  O: (f) => [
    roundedForm(f.left, -f.over, f.right, f.cap + f.over, f.axes.roundingClosed, f.axes.cornerSharpness),
  ],

  P: (f) => [
    open([stem(f.left, 0, f.cap)]),
    bowl(f.left, f.cap, waist(f), f.right, f.axes.roundingClosed, f.axes.cornerSharpness),
  ],

  Q: (f) => [
    roundedForm(f.left, -f.over, f.right, f.cap + f.over, f.axes.roundingClosed, f.axes.cornerSharpness),
    open([diagonal(p(f.mid, f.cap * 0.32), p(f.right + f.width * 0.08, -f.cap * 0.1))]),
  ],

  R: (f) => {
    const w = waist(f);
    return [
      open([stem(f.left, 0, f.cap)]),
      bowl(f.left, f.cap, w, f.right, f.axes.roundingClosed, f.axes.cornerSharpness),
      open([diagonal(p(f.left + f.width * 0.35, w), p(f.right, 0))]),
    ];
  },

  S: (f) => [open(sSpine(f.cap, 0, f.left, f.right, waist(f), f.axes.roundingOpen, f.axes.cornerSharpness))],

  T: (f) => [open([arm(f.left, f.right, f.cap, f.axes, { cutEnd: false })]), open([stem(f.mid, 0, f.cap)])],

  U: (f) => {
    const j = f.cap * 0.3;
    return [
      open([stem(f.left, j, f.cap)]),
      open([
        cornerCurve(p(f.left, j), p(f.left, 0), p(f.mid, 0), f.axes.roundingOpen, f.axes.cornerSharpness),
        cornerCurve(p(f.mid, 0), p(f.right, 0), p(f.right, j), f.axes.roundingOpen, f.axes.cornerSharpness),
      ]),
      open([stem(f.right, j, f.cap)]),
    ];
  },

  V: (f) => [
    open([diagonal(p(f.left, f.cap), p(f.mid, 0))]),
    open([diagonal(p(f.mid, 0), p(f.right, f.cap))]),
  ],

  W: (f) => {
    const a = f.left + f.width * 0.28;
    const b = f.left + f.width * 0.72;
    const peak = f.cap * f.axes.topProportion * 1.15;
    return [
      open([diagonal(p(f.left, f.cap), p(a, 0))]),
      open([diagonal(p(a, 0), p(f.mid, peak))]),
      open([diagonal(p(f.mid, peak), p(b, 0))]),
      open([diagonal(p(b, 0), p(f.right, f.cap))]),
    ];
  },

  X: (f) => [
    open([diagonal(p(f.left, f.cap), p(f.right, 0))]),
    open([diagonal(p(f.left, 0), p(f.right, f.cap))]),
  ],

  Y: (f) => {
    const j = waist(f);
    return [
      open([diagonal(p(f.left, f.cap), p(f.mid, j))]),
      open([diagonal(p(f.right, f.cap), p(f.mid, j))]),
      open([stem(f.mid, 0, j)]),
    ];
  },

  Z: (f) => [
    open([arm(f.left, f.right, f.cap, f.axes, { cutEnd: false })]),
    open([diagonal(p(f.right, f.cap), p(f.left, 0))]),
    open([arm(f.left, f.right, 0, f.axes, { cutEnd: false })]),
  ],
};

/** Per-glyph width proportions — the glyph's own drawing width, before the frame. */
export const UPPERCASE_WIDTHS = {
  I: 0.42,
  J: 0.72,
  L: 0.82,
  M: 1.3,
  W: 1.38,
  E: 0.86,
  F: 0.84,
  T: 0.9,
  S: 0.88,
  B: 0.92,
  P: 0.88,
  Q: 1.06,
  O: 1.04,
  C: 0.98,
  G: 1.04,
  D: 1,
};

/**
 * Which axes each glyph responds to. Not decoration: it is the answer to "I moved
 * `roundingOpen`, what should have changed?", and the test battery uses it to check that a
 * glyph claiming sensitivity actually moves.
 */
export const UPPERCASE_AXIS_SENSITIVITY = {
  A: ['capHeight', 'bottomProportion', 'width'],
  B: ['capHeight', 'topProportion', 'innerProportion', 'roundingClosed', 'cornerSharpness'],
  C: ['capHeight', 'roundingOpen', 'cornerSharpness'],
  D: ['capHeight', 'roundingClosed', 'cornerSharpness'],
  E: ['capHeight', 'topProportion', 'innerProportion', 'terminalCut'],
  F: ['capHeight', 'topProportion', 'innerProportion', 'terminalCut'],
  G: ['capHeight', 'roundingOpen', 'bottomProportion', 'cornerSharpness'],
  H: ['capHeight', 'topProportion'],
  I: ['capHeight', 'serif', 'serifSize'],
  J: ['capHeight', 'width'],
  K: ['capHeight', 'topProportion'],
  L: ['capHeight', 'terminalCut'],
  M: ['capHeight', 'topProportion', 'width'],
  N: ['capHeight', 'width'],
  O: ['capHeight', 'roundingClosed', 'cornerSharpness', 'overshoot'],
  P: ['capHeight', 'topProportion', 'roundingClosed', 'cornerSharpness'],
  Q: ['capHeight', 'roundingClosed', 'overshoot'],
  R: ['capHeight', 'topProportion', 'roundingClosed', 'cornerSharpness'],
  S: ['capHeight', 'topProportion', 'roundingOpen', 'cornerSharpness'],
  T: ['capHeight', 'width'],
  U: ['capHeight', 'roundingOpen', 'cornerSharpness'],
  V: ['capHeight', 'width'],
  W: ['capHeight', 'topProportion', 'width'],
  X: ['capHeight', 'width'],
  Y: ['capHeight', 'topProportion'],
  Z: ['capHeight', 'width'],
};
