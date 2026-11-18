// Exact winding number of a filled path around a point.
//
// Method: cast a ray from q toward +x and sum the signed crossings of the path with the
// horizontal line y = q.y, counting only crossings to the right of q. Each segment is
// first split into y-monotone pieces at the parameters where dy/dt = 0 (line: none;
// quad: linear root; cubic: quadratic roots; arc: closed-form extremum angles), so a
// piece crosses the horizontal line at most once and the crossing parameter has a
// closed form. This avoids flattening entirely — the result is exact for the true
// curves (up to f64 rounding).
//
// Vertex rule: each monotone piece counts the crossing half-open on its y-range —
// ascending pieces count when yStart ≤ qy < yEnd, descending when yEnd ≤ qy < yStart.
// A vertex shared by two monotone-continuing pieces therefore counts exactly once, and
// a local extremum (where the ray grazes the curve) counts zero times, which is the
// standard robust tie-break for crossing tests.
//
// Fill semantics: every subpath is implicitly closed (SVG fill behaviour), so an open
// subpath contributes its closing chord. Results are specified only for query points
// farther than EPS_COINCIDENT from the path boundary; exactly-on-boundary queries are
// deterministic but unspecified.

import { EPS_COINCIDENT, EPS_PARAM } from './tolerance.js';
import { linearRoots, quadraticRoots, cubicRoots } from './roots.js';
import { arcCenter } from './arc.js';
import { LINE, QUAD, CUBIC, ARC } from './segment.js';
import { subpathStart, subpathEnd, NONZERO, EVENODD } from './path.js';

// Evaluate a power-basis polynomial (coefficients in descending degree) at t.
function polyEval(coeffs, t) {
  let v = 0;
  for (const c of coeffs) v = v * t + c;
  return v;
}

// Robust fallback: bisection for y(t) = qy on a y-monotone piece [ta, tb]. Converges
// unconditionally because monotonicity brackets the root; used only when the
// closed-form root is lost to rounding at a piece boundary.
function bisectMonotone(evalY, ta, tb, ya, yb, qy) {
  const asc = yb > ya;
  let lo = ta;
  let hi = tb;
  for (let i = 0; i < 64; i++) {
    const tm = 0.5 * (lo + hi);
    if ((evalY(tm) < qy) === asc) lo = tm;
    else hi = tm;
  }
  return 0.5 * (lo + hi);
}

// Half-open monotone counting rule (see header). ya/yb are the piece's endpoint ys.
// Endpoint ys within EPS_COINCIDENT of the ray are snapped onto it first: pieces
// produced by cutting/splitting (Phase 7 booleans) carry junction vertices that are
// equal only to rebuild accuracy, and the exactly-once vertex tie-break relies on the
// two adjacent pieces agreeing on the shared y.
function pieceCounts(ya, yb, qy) {
  if (Math.abs(ya - qy) <= EPS_COINCIDENT) ya = qy;
  if (Math.abs(yb - qy) <= EPS_COINCIDENT) yb = qy;
  if (ya === yb) return false;
  return yb > ya ? ya <= qy && qy < yb : yb <= qy && qy < ya;
}

// Straight edge crossing (also used for the implicit closing chord).
function lineCrossing(out, x0, y0, x1, y1, qy) {
  if (!pieceCounts(y0, y1, qy)) return;
  const t = (qy - y0) / (y1 - y0);
  out.push({ x: x0 + t * (x1 - x0), dir: y1 > y0 ? 1 : -1 });
}

// Crossings of a polynomial (quad/cubic) segment given power-basis coefficient arrays
// for x(t) and y(t), descending degree.
function polyCrossings(out, xCoeffs, yCoeffs, qy) {
  const n = yCoeffs.length - 1; // degree (2 or 3)

  // Split [0,1] at the interior roots of dy/dt so each piece is y-monotone.
  const dy = [];
  for (let i = 0; i < n; i++) dy.push(yCoeffs[i] * (n - i));
  const crit = (n === 2 ? linearRoots(dy[0], dy[1]) : quadraticRoots(dy[0], dy[1], dy[2]))
    .filter((t) => t > EPS_PARAM && t < 1 - EPS_PARAM)
    .sort((a, b) => a - b);
  const cuts = [0];
  for (const t of crit) if (t > cuts[cuts.length - 1] + EPS_PARAM) cuts.push(t);
  cuts.push(1);

  for (let i = 0; i + 1 < cuts.length; i++) {
    const ta = cuts[i];
    const tb = cuts[i + 1];
    const ya = polyEval(yCoeffs, ta);
    const yb = polyEval(yCoeffs, tb);
    if (!pieceCounts(ya, yb, qy)) continue;

    // Closed-form parameter: real roots of y(t) − qy filtered into the piece.
    const shifted = yCoeffs.slice();
    shifted[shifted.length - 1] -= qy;
    const roots =
      n === 2
        ? quadraticRoots(shifted[0], shifted[1], shifted[2])
        : cubicRoots(shifted[0], shifted[1], shifted[2], shifted[3]);
    let t = NaN;
    for (const r of roots) {
      if (r >= ta - EPS_PARAM && r <= tb + EPS_PARAM) {
        t = Math.min(tb, Math.max(ta, r));
        break;
      }
    }
    if (Number.isNaN(t)) {
      t = bisectMonotone((u) => polyEval(yCoeffs, u), ta, tb, ya, yb, qy);
    }
    out.push({ x: polyEval(xCoeffs, t), dir: yb > ya ? 1 : -1 });
  }
}

// Arc crossings, computed in the center parameterization. With A = rx·sinφ and
// B = ry·cosφ: y(θ) = cy + A·cosθ + B·sinθ = cy + R·cos(θ − δ), R = hypot(A,B),
// δ = atan2(B,A). y-extrema sit at θ = δ + kπ; crossings solve cos(θ − δ) = (qy−cy)/R.
function arcCrossings(out, seg, qy) {
  const c = arcCenter(seg);
  const cosP = Math.cos(c.phi);
  const sinP = Math.sin(c.phi);
  const A = c.rx * sinP;
  const B = c.ry * cosP;
  const R = Math.hypot(A, B);
  if (R === 0 || c.dtheta === 0) return; // y constant along the arc — no crossings
  const delta = Math.atan2(B, A);
  const th1 = c.theta1;
  const dth = c.dtheta;

  const yAt = (t) => {
    const th = th1 + t * dth;
    return c.cy + A * Math.cos(th) + B * Math.sin(th);
  };
  const xAt = (t) => {
    const th = th1 + t * dth;
    return c.cx + c.rx * Math.cos(th) * cosP - c.ry * Math.sin(th) * sinP;
  };

  // Split at the y-extremum angles δ + kπ that fall inside the sweep.
  const lo = Math.min(th1, th1 + dth);
  const hi = Math.max(th1, th1 + dth);
  const crit = [];
  for (let k = Math.ceil((lo - delta) / Math.PI) - 1; (delta + k * Math.PI) <= hi + Math.PI; k++) {
    const t = (delta + k * Math.PI - th1) / dth;
    if (t > EPS_PARAM && t < 1 - EPS_PARAM) crit.push(t);
  }
  crit.sort((a, b) => a - b);
  const cuts = [0];
  for (const t of crit) if (t > cuts[cuts.length - 1] + EPS_PARAM) cuts.push(t);
  cuts.push(1);

  for (let i = 0; i + 1 < cuts.length; i++) {
    const ta = cuts[i];
    const tb = cuts[i + 1];
    const ya = yAt(ta);
    const yb = yAt(tb);
    if (!pieceCounts(ya, yb, qy)) continue;

    // Closed form: θ = δ ± acos(u) + 2kπ, brought into the piece's t-range.
    const u = Math.min(1, Math.max(-1, (qy - c.cy) / R));
    const base = Math.acos(u);
    let t = NaN;
    outer: for (const s of [base, -base]) {
      for (let k = -2; k <= 2; k++) {
        const tt = (delta + s + 2 * Math.PI * k - th1) / dth;
        if (tt >= ta - EPS_PARAM && tt <= tb + EPS_PARAM) {
          t = Math.min(tb, Math.max(ta, tt));
          break outer;
        }
      }
    }
    if (Number.isNaN(t)) t = bisectMonotone(yAt, ta, tb, ya, yb, qy);
    out.push({ x: xAt(t), dir: yb > ya ? 1 : -1 });
  }
}

// Collect the crossings of one segment with the horizontal line y = qy.
function segmentCrossings(out, seg, qy) {
  switch (seg.type) {
    case LINE:
      lineCrossing(out, seg.p0.x, seg.p0.y, seg.p1.x, seg.p1.y, qy);
      return;
    case QUAD: {
      const { p0, p1, p2 } = seg;
      // Power basis of the quadratic Bézier: a·t² + b·t + c.
      polyCrossings(
        out,
        [p0.x - 2 * p1.x + p2.x, 2 * (p1.x - p0.x), p0.x],
        [p0.y - 2 * p1.y + p2.y, 2 * (p1.y - p0.y), p0.y],
        qy,
      );
      return;
    }
    case CUBIC: {
      const { p0, p1, p2, p3 } = seg;
      // Power basis of the cubic Bézier: A·t³ + B·t² + C·t + D.
      polyCrossings(
        out,
        [-p0.x + 3 * p1.x - 3 * p2.x + p3.x, 3 * p0.x - 6 * p1.x + 3 * p2.x, -3 * p0.x + 3 * p1.x, p0.x],
        [-p0.y + 3 * p1.y - 3 * p2.y + p3.y, 3 * p0.y - 6 * p1.y + 3 * p2.y, -3 * p0.y + 3 * p1.y, p0.y],
        qy,
      );
      return;
    }
    case ARC:
      arcCrossings(out, seg, qy);
      return;
    default:
      throw new TypeError(`windingAt: unknown segment type ${seg && seg.type}`);
  }
}

/**
 * Signed integer winding number of the path around q. Positive for regions wound
 * counter-clockwise in a y-up frame (equivalently clockwise in the SVG y-down frame).
 * Subpaths are implicitly closed. Specified for q off the boundary (farther than
 * EPS_COINCIDENT); on-boundary queries are deterministic but unspecified.
 * @param {object} pth  Path
 * @param {{x:number,y:number}} q
 * @returns {number}
 */
export function windingAt(pth, q) {
  const crossings = [];
  for (const sp of pth.subpaths) {
    if (!sp.segments.length) continue;
    for (const seg of sp.segments) segmentCrossings(crossings, seg, q.y);
    // Implicit closing chord (fill semantics; a no-op when the ends coincide).
    const s = subpathStart(sp);
    const e = subpathEnd(sp);
    if (Math.hypot(e.x - s.x, e.y - s.y) > EPS_COINCIDENT) {
      lineCrossing(crossings, e.x, e.y, s.x, s.y, q.y);
    }
  }
  let w = 0;
  for (const cr of crossings) if (cr.x > q.x) w += cr.dir;
  return w;
}

/**
 * Is q inside the filled region of the path under the given fill rule?
 * Defaults to the fill rule carried on the path.
 * @param {object} pth  Path
 * @param {{x:number,y:number}} q
 * @param {'nonzero'|'evenodd'} [fillRule]
 * @returns {boolean}
 */
export function containsPoint(pth, q, fillRule) {
  const rule = fillRule ?? pth.fillRule ?? NONZERO;
  if (rule !== NONZERO && rule !== EVENODD) {
    throw new TypeError(`containsPoint: fillRule must be '${NONZERO}' or '${EVENODD}'`);
  }
  const w = windingAt(pth, q);
  return rule === EVENODD ? Math.abs(w) % 2 === 1 : w !== 0;
}
