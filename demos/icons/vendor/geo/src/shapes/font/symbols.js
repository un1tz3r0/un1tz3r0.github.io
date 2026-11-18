// F12 — digits, punctuation and symbols.
//
// The digits share the letters' axes deliberately: `topProportion` puts the waist of `3`,
// `5` and `8` where it puts `B`'s and `S`'s, and `roundingClosed` shapes `0`'s bowl the
// same way it shapes `O`'s. That is what keeps figures and letters looking like one
// alphabet rather than two.

import { vec2 } from '../../core/vec2.js';
import { line } from '../../core/segment.js';
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
  dot,
  cornerCurve,
  sSpine,
} from './strokes.js';
import { waist } from './frame.js';

const p = vec2;

export const SYMBOLS = {
  0: (f) => [
    roundedForm(f.left, -f.over, f.right, f.cap + f.over, f.axes.roundingClosed, f.axes.cornerSharpness),
  ],

  1: (f) => [
    open([stem(f.mid, 0, f.cap)]),
    open([diagonal(p(f.mid, f.cap), p(f.left, f.cap * 0.78))]),
  ],

  2: (f) => {
    const w = waist(f, 0, f.cap, 'bottom');
    return [
      open([
        cornerCurve(p(f.left, f.cap * 0.76), p(f.left, f.cap), p(f.mid, f.cap), f.axes.roundingOpen, f.axes.cornerSharpness),
        cornerCurve(p(f.mid, f.cap), p(f.right, f.cap), p(f.right, w), f.axes.roundingOpen, f.axes.cornerSharpness),
      ]),
      open([diagonal(p(f.right, w), p(f.left, 0))]),
      open([crossbar(f.left, f.right, 0)]),
    ];
  },

  3: (f) => [open(sSpine(f.cap, 0, f.right, f.left, waist(f), f.axes.roundingOpen, f.axes.cornerSharpness))],

  4: (f) => {
    const bar = waist(f, 0, f.cap, 'bottom') * 0.8;
    return [
      open([diagonal(p(f.right, f.cap), p(f.left, bar))]),
      open([crossbar(f.left, f.right, bar)]),
      open([stem(f.right * 0.82 + f.left * 0.18, 0, f.cap)]),
    ];
  },

  5: (f) => {
    const w = waist(f);
    return [
      open([crossbar(f.left, f.right, f.cap)]),
      open([stem(f.left, w, f.cap)]),
      open([
        cornerCurve(p(f.left, w), p(f.right, w), p(f.right, w * 0.5), f.axes.roundingOpen, f.axes.cornerSharpness),
        cornerCurve(p(f.right, w * 0.5), p(f.right, 0), p(f.left, 0), f.axes.roundingOpen, f.axes.cornerSharpness),
      ]),
    ];
  },

  6: (f) => {
    const w = waist(f, 0, f.cap, 'bottom');
    return [
      roundedForm(f.left, -f.over, f.right, w + f.over, f.axes.roundingClosed, f.axes.cornerSharpness),
      open([diagonal(p(f.left, w * 0.6), p(f.right * 0.7 + f.left * 0.3, f.cap))]),
    ];
  },

  7: (f) => [
    open([crossbar(f.left, f.right, f.cap)]),
    open([diagonal(p(f.right, f.cap), p(f.left + f.width * 0.22, 0))]),
  ],

  8: (f) => {
    const w = waist(f);
    return [
      roundedForm(f.left + f.width * 0.08, w, f.right - f.width * 0.08, f.cap + f.over, f.axes.roundingClosed, f.axes.cornerSharpness),
      roundedForm(f.left, -f.over, f.right, w, f.axes.roundingClosed, f.axes.cornerSharpness),
    ];
  },

  9: (f) => {
    const w = waist(f);
    return [
      roundedForm(f.left, w, f.right, f.cap + f.over, f.axes.roundingClosed, f.axes.cornerSharpness),
      open([diagonal(p(f.right, w * 1.4), p(f.left + f.width * 0.3, 0))]),
    ];
  },

  // --- punctuation -------------------------------------------------------------------

  '.': (f) => [dot(f.mid, f.width * 0.12, f.width * 0.12)],
  ',': (f) => [
    dot(f.mid, f.width * 0.12, f.width * 0.12),
    open([tail(p(f.mid, f.width * 0.05), -f.width * 0.16, -f.width * 0.3, 0.6)]),
  ],
  ':': (f) => [dot(f.mid, f.width * 0.12, f.width * 0.12), dot(f.mid, f.x * 0.72, f.width * 0.12)],
  ';': (f) => [
    dot(f.mid, f.x * 0.72, f.width * 0.12),
    dot(f.mid, f.width * 0.12, f.width * 0.12),
    open([tail(p(f.mid, f.width * 0.05), -f.width * 0.16, -f.width * 0.3, 0.6)]),
  ],
  '-': (f) => [open([crossbar(f.left, f.right, f.x * 0.52)])],
  '–': (f) => [open([crossbar(f.left, f.right, f.x * 0.52)])],
  _: (f) => [open([crossbar(f.left, f.right, -f.cap * 0.12)])],
  '/': (f) => [open([diagonal(p(f.left, -f.cap * 0.08), p(f.right, f.cap))])],
  '\\': (f) => [open([diagonal(p(f.left, f.cap), p(f.right, -f.cap * 0.08))])],
  '!': (f) => [open([stem(f.mid, f.x * 0.32, f.cap)]), dot(f.mid, f.width * 0.12, f.width * 0.12)],
  '?': (f) => [
    open([
      cornerCurve(p(f.left, f.cap * 0.78), p(f.left, f.cap), p(f.mid, f.cap), f.axes.roundingOpen, f.axes.cornerSharpness),
      cornerCurve(p(f.mid, f.cap), p(f.right, f.cap), p(f.right, f.cap * 0.66), f.axes.roundingOpen, f.axes.cornerSharpness),
      cornerCurve(p(f.right, f.cap * 0.66), p(f.right, f.cap * 0.42), p(f.mid, f.x * 0.42), f.axes.roundingOpen, f.axes.cornerSharpness),
    ]),
    open([stem(f.mid, f.x * 0.42, f.x * 0.42)]),
    dot(f.mid, f.width * 0.12, f.width * 0.12),
  ],
  "'": (f) => [open([stem(f.mid, f.cap * 0.72, f.cap)])],
  '"': (f) => [
    open([stem(f.mid - f.width * 0.16, f.cap * 0.72, f.cap)]),
    open([stem(f.mid + f.width * 0.16, f.cap * 0.72, f.cap)]),
  ],

  // --- brackets and braces --------------------------------------------------------------

  '(': (f) => [bracketCurve(f, 1)],
  ')': (f) => [bracketCurve(f, -1)],
  '[': (f) => [squareBracket(f, 1)],
  ']': (f) => [squareBracket(f, -1)],
  '{': (f) => [curlyBrace(f, 1)],
  '}': (f) => [curlyBrace(f, -1)],

  // --- math and marks ---------------------------------------------------------------------

  '+': (f) => {
    const y = f.x * 0.52;
    return [open([crossbar(f.left, f.right, y)]), open([stem(f.mid, y - f.width * 0.42, y + f.width * 0.42)])];
  },
  '=': (f) => [
    open([crossbar(f.left, f.right, f.x * 0.72)]),
    open([crossbar(f.left, f.right, f.x * 0.32)]),
  ],
  '<': (f) => [
    open([diagonal(p(f.right, f.x * 0.92), p(f.left, f.x * 0.52))]),
    open([diagonal(p(f.left, f.x * 0.52), p(f.right, f.x * 0.12))]),
  ],
  '>': (f) => [
    open([diagonal(p(f.left, f.x * 0.92), p(f.right, f.x * 0.52))]),
    open([diagonal(p(f.right, f.x * 0.52), p(f.left, f.x * 0.12))]),
  ],
  '*': (f) => {
    const c = f.cap * 0.74;
    const r = f.width * 0.34;
    const out = [];
    for (let i = 0; i < 3; i++) {
      const a = (Math.PI * i) / 3 + Math.PI / 2;
      out.push(open([diagonal(p(f.mid - r * Math.cos(a), c - r * Math.sin(a)), p(f.mid + r * Math.cos(a), c + r * Math.sin(a)))]));
    }
    return out;
  },
  '#': (f) => [
    open([diagonal(p(f.left + f.width * 0.28, 0), p(f.left + f.width * 0.42, f.cap))]),
    open([diagonal(p(f.left + f.width * 0.62, 0), p(f.left + f.width * 0.76, f.cap))]),
    open([crossbar(f.left, f.right, f.cap * 0.66)]),
    open([crossbar(f.left, f.right, f.cap * 0.3)]),
  ],

  // --- arrows (measurement / dimension marks) ---------------------------------------------

  '→': (f) => arrowGlyph(f, 1),
  '←': (f) => arrowGlyph(f, -1),
};

// A round bracket: an open curve bulging away from `side`.
function bracketCurve(f, side) {
  const top = f.cap * 1.05;
  const bot = -f.cap * 0.18;
  const x0 = side > 0 ? f.right : f.left;
  const x1 = side > 0 ? f.left : f.right;
  return open([
    cornerCurve(p(x0, top), p(x1, top), p(x1, (top + bot) / 2), f.axes.roundingOpen, f.axes.cornerSharpness),
    cornerCurve(p(x1, (top + bot) / 2), p(x1, bot), p(x0, bot), f.axes.roundingOpen, f.axes.cornerSharpness),
  ]);
}

function squareBracket(f, side) {
  const top = f.cap * 1.05;
  const bot = -f.cap * 0.18;
  const x0 = side > 0 ? f.right : f.left;
  const x1 = side > 0 ? f.left : f.right;
  // Explicit lines rather than `stem`, which always runs bottom-to-top and so would not
  // continue from the top crossbar — the subpath has to stay continuous.
  return open([
    line(p(x0, top), p(x1, top)),
    line(p(x1, top), p(x1, bot)),
    line(p(x1, bot), p(x0, bot)),
  ]);
}

function curlyBrace(f, side) {
  const top = f.cap * 1.05;
  const bot = -f.cap * 0.18;
  const mid = (top + bot) / 2;
  const x0 = side > 0 ? f.right : f.left;
  const x1 = side > 0 ? f.left : f.right;
  const xm = x1 + (x0 - x1) * -0.35;
  return open([
    cornerCurve(p(x0, top), p(x1, top), p(x1, mid + (top - mid) * 0.45), f.axes.roundingOpen, f.axes.cornerSharpness),
    cornerCurve(p(x1, mid + (top - mid) * 0.45), p(x1, mid), p(xm, mid), f.axes.roundingOpen, f.axes.cornerSharpness),
    cornerCurve(p(xm, mid), p(x1, mid), p(x1, mid - (mid - bot) * 0.45), f.axes.roundingOpen, f.axes.cornerSharpness),
    cornerCurve(p(x1, mid - (mid - bot) * 0.45), p(x1, bot), p(x0, bot), f.axes.roundingOpen, f.axes.cornerSharpness),
  ]);
}

function arrowGlyph(f, dir) {
  const y = f.x * 0.52;
  const tipX = dir > 0 ? f.right : f.left;
  const tailX = dir > 0 ? f.left : f.right;
  const back = tipX - dir * f.width * 0.3;
  const h = f.width * 0.22;
  return [
    open([crossbar(tailX, tipX, y)]),
    open([diagonal(p(back, y + h), p(tipX, y))]),
    open([diagonal(p(back, y - h), p(tipX, y))]),
  ];
}

export const SYMBOL_WIDTHS = {
  1: 0.6,
  '.': 0.34,
  ',': 0.34,
  ':': 0.34,
  ';': 0.34,
  '!': 0.34,
  "'": 0.3,
  '"': 0.48,
  '-': 0.52,
  '–': 0.72,
  '(': 0.48,
  ')': 0.48,
  '[': 0.46,
  ']': 0.46,
  '{': 0.52,
  '}': 0.52,
  '/': 0.6,
  '\\': 0.6,
  '=': 0.76,
  '+': 0.8,
  '<': 0.76,
  '>': 0.76,
  '*': 0.66,
  '#': 0.9,
  _: 0.72,
  '?': 0.76,
  '→': 1.1,
  '←': 1.1,
};
