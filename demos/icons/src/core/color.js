// Color conversion. Colors are stored in the model as "#rrggbb" or "#rrggbbaa".

/** @typedef {{r:number,g:number,b:number,a:number}} RGBA  r,g,b in 0..255, a in 0..1 */

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const hex2 = (n) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0');

/**
 * Parse "#rgb", "#rgba", "#rrggbb", "#rrggbbaa" or "rgb()/rgba()". Returns null if not understood.
 * @returns {RGBA | null}
 */
export function parseColor(input) {
  if (typeof input !== 'string') return null;
  const s = input.trim().toLowerCase();
  let m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }
  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/.exec(s);
  if (m) {
    let a = 1;
    if (m[4] !== undefined) a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { r: +m[1], g: +m[2], b: +m[3], a: clamp(a, 0, 1) };
  }
  const named = NAMED[s];
  return named ? parseColor(named) : null;
}

/** "#rrggbb", or "#rrggbbaa" when not opaque. */
export function formatColor({ r, g, b, a = 1 }) {
  const base = `#${hex2(r)}${hex2(g)}${hex2(b)}`;
  return a >= 0.999 ? base : base + hex2(a * 255);
}

/** Split a stored color into an opaque hex and an alpha, as SVG attributes want them. */
export function splitAlpha(color) {
  const c = parseColor(color);
  if (!c) return { hex: color, alpha: 1 };
  return { hex: `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}`, alpha: Math.round(c.a * 1000) / 1000 };
}

export function withAlpha(color, alpha) {
  const c = parseColor(color) ?? { r: 0, g: 0, b: 0, a: 1 };
  return formatColor({ ...c, a: clamp(alpha, 0, 1) });
}

/** @returns {{h:number,s:number,v:number}} h in 0..360, s and v in 0..1 */
export function rgbToHsv({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function hsvToRgb({ h, s, v }) {
  const c = v * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = v - c;
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

/** @returns {{h:number,s:number,l:number}} h in 0..360, s and l in 0..100 */
export function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const { h } = rgbToHsv({ r: r * 255, g: g * 255, b: b * 255 });
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }) {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const v = l + c / 2;
  return hsvToRgb({ h, s: v === 0 ? 0 : c / v, v });
}

// sRGB ↔ OKLCH (Björn Ottosson's OKLab).
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** @returns {{l:number,c:number,h:number}} l in 0..1, c ≈ 0..0.4, h in 0..360 */
export function rgbToOklch({ r, g, b }) {
  const lr = toLinear(r / 255), lg = toLinear(g / 255), lb = toLinear(b / 255);
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c: Math.hypot(A, B), h };
}

export function oklchToRgb({ l, c, h }) {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const r = fromLinear(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_);
  const g = fromLinear(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_);
  const b = fromLinear(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_);
  return { r: clamp(r, 0, 1) * 255, g: clamp(g, 0, 1) * 255, b: clamp(b, 0, 1) * 255 };
}

/** Relative luminance (WCAG), 0..1. */
export function luminance(color) {
  const c = parseColor(color);
  if (!c) return 0;
  return 0.2126 * toLinear(c.r / 255) + 0.7152 * toLinear(c.g / 255) + 0.0722 * toLinear(c.b / 255);
}

// The handful of CSS color names that turn up in icon markup.
const NAMED = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000', blue: '#0000ff',
  yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff', gray: '#808080', grey: '#808080',
  orange: '#ffa500', purple: '#800080', silver: '#c0c0c0', maroon: '#800000', navy: '#000080',
  teal: '#008080', olive: '#808000', lime: '#00ff00', aqua: '#00ffff', fuchsia: '#ff00ff',
  transparent: '#00000000',
};
