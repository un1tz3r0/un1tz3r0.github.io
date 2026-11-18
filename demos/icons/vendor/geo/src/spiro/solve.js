// F9 — the spiro spline solver: third-order polynomial spirals through knots.
//
// Algorithm after libspiro/ppedit (Raph Levien; the reference implementation used
// by FontForge). libspiro is GPLv3 and is used here as an *algorithm reference*
// only — this is an independent implementation of the math published in Levien's
// "From Spiral to Spline" thesis, restructured for this library (Gauss–Legendre
// integration instead of the machine-generated series; a dense cyclic Newton
// solve instead of banded LU + cyclic triplication). The behavioral contract is
// FontForge-compatible knot semantics, verified by tolerance-based tests.
//
// A contour's knots are joined by segments of a polynomial spiral with curvature
//   k(s) = ks0 + ks1·s + ks2·s²/2 + ks3·s³/6,  s ∈ [-½, ½] (normalized arclength).
// Solving finds every segment's ks so the per-knot continuity constraints hold,
// via Newton iteration on one global linear system per round:
//   'o' (G4)   θ, k, k′, k″ all continuous — 4 crossing rows
//   'c' (G2)   θ, k continuous (k′ may jump) — 2 crossing rows
//   '[' / ']'  θ, k cross between curve and a straight stretch; the segment
//              between '[' and ']' has no free parameters (stays a line)
//   'v'        corner — nothing crosses; adjacent 4-parameter segments get the
//              loose end pinned with k′ = k″ = 0
//   '{' / '}'  open-contour ends (like a corner with no bend)
//   'a' / 'h'  anchor+handle: the a→h chord is a phantom zero-parameter segment
//              whose direction fixes the tangent at the anchor; 'a' constrains
//              like '[', 'h' like ']'
// Row/column bookkeeping (the jj/j walk, start offsets, one-sided pinning) is
// ported faithfully from the reference so knot semantics match FontForge.

// 8-point Gauss–Legendre nodes and weights on [-1, 1].
const GL_X = [
  -0.9602898564975363, -0.7966664774136267, -0.525532409916329, -0.1834346424956498,
  0.1834346424956498, 0.525532409916329, 0.7966664774136267, 0.9602898564975363,
];
const GL_W = [
  0.1012285362903763, 0.2223810344533745, 0.3137066458778873, 0.362683783378362,
  0.362683783378362, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763,
];

/** Total absolute bend proxy of a spiral piece (radians). */
export function segmentBend(ks) {
  return (
    Math.abs(ks[0]) + Math.abs(0.5 * ks[1]) + Math.abs(0.125 * ks[2]) + Math.abs((1 / 48) * ks[3])
  );
}

/**
 * ∫ exp(i·θ(s)) ds over s ∈ [-½, ½] for θ(s) = ks0·s + ks1·s²/2 + ks2·s³/6 +
 * ks3·s⁴/24 — the chord vector of the unit-arclength spiral piece.
 * Composite Gauss–Legendre, subdivided in proportion to the total bend.
 * @param {number[]} ks
 * @returns {{x:number, y:number}}
 */
export function integrateSpiro(ks) {
  const n = Math.max(4, Math.ceil(segmentBend(ks)));
  const h = 1 / n;
  let x = 0;
  let y = 0;
  for (let i = 0; i < n; i++) {
    const c = -0.5 + (i + 0.5) * h;
    for (let g = 0; g < 8; g++) {
      const s = c + 0.5 * h * GL_X[g];
      const th = s * (ks[0] + s * (ks[1] / 2 + s * (ks[2] / 6 + (s * ks[3]) / 24)));
      x += GL_W[g] * Math.cos(th);
      y += GL_W[g] * Math.sin(th);
    }
  }
  return { x: (x * h) / 2, y: (y * h) / 2 };
}

/** th wrapped to (-π, π]. */
export function mod2pi(th) {
  const u = th / (2 * Math.PI);
  return 2 * Math.PI * (u - Math.floor(u + 0.5));
}

/**
 * Endpoint properties of a spiral piece rescaled onto a chord of length segCh:
 * ends[e] = [θ relative to the chord, k, k′, k″] at e=0 (start) and e=1 (end).
 * The θ/k/k′/k″ values are the closed-form evaluations of the curvature
 * polynomial at s = ±½ split into even/odd parts, with curvature derivatives
 * scaled by the arclength ratio l = |∫| / segCh per differentiation order.
 * @returns {{ends: number[][], l: number}}
 */
export function computeEnds(ks, segCh) {
  const xy = integrateSpiro(ks);
  const ch = Math.hypot(xy.x, xy.y);
  const th = Math.atan2(xy.y, xy.x);
  const l = ch / segCh;
  const l2 = l * l;
  const l3 = l2 * l;

  const thEven = 0.5 * ks[0] + (1 / 48) * ks[2];
  const thOdd = 0.125 * ks[1] + (1 / 384) * ks[3] - th;
  const k0Even = l * (ks[0] + 0.125 * ks[2]);
  const k0Odd = l * (0.5 * ks[1] + (1 / 48) * ks[3]);
  const k1Even = l2 * (ks[1] + 0.125 * ks[3]);
  const k1Odd = l2 * 0.5 * ks[2];
  const k2Even = l3 * ks[2];
  const k2Odd = l3 * 0.5 * ks[3];
  return {
    ends: [
      [thEven - thOdd, k0Even - k0Odd, k1Even - k1Odd, k2Even - k2Odd],
      [thEven + thOdd, k0Even + k0Odd, k1Even + k1Odd, k2Even + k2Odd],
    ],
    l,
  };
}

// Numeric partials of both ends' properties w.r.t. the segment's first jinc ks.
function computePDerivs(seg, jinc) {
  const recip = 2e6;
  const delta = 1 / recip;
  const { ends } = computeEnds(seg.ks, seg.segCh);
  const derivs = [[], [], [], []]; // derivs[prop][end][kIndex]
  for (let p = 0; p < 4; p++) {
    derivs[p][0] = [0, 0, 0, 0];
    derivs[p][1] = [0, 0, 0, 0];
  }
  for (let i = 0; i < jinc; i++) {
    const tryKs = seg.ks.slice();
    tryKs[i] += delta;
    const { ends: tryEnds } = computeEnds(tryKs, seg.segCh);
    for (let e = 0; e < 2; e++) {
      for (let p = 0; p < 4; p++) {
        derivs[p][e][i] = recip * (tryEnds[e][p] - ends[e][p]);
      }
    }
  }
  return { ends, derivs };
}

// Free-parameter count of the segment between knot types ty0 → ty1.
export function computeJinc(ty0, ty1) {
  if (ty0 === 'o' || ty1 === 'o' || ty0 === ']' || ty1 === '[' || ty0 === 'h' || ty1 === 'a') {
    return 4;
  }
  if (ty0 === 'c' && ty1 === 'c') return 2;
  if (
    (ty1 === 'c' && (ty0 === '{' || ty0 === 'v' || ty0 === '[' || ty0 === 'a')) ||
    (ty0 === 'c' && (ty1 === '}' || ty1 === 'v' || ty1 === ']' || ty1 === 'h'))
  ) {
    return 1;
  }
  return 0;
}

/**
 * Prepare a solvable segment array from typed knots.
 *
 * Knots use the FF letter codes ('v','o','c','[',']','a','h'; '{'/'}' as the
 * first/last knot of an open contour). Coordinates are normalized to a ~±250
 * working range (Newton conditioning; matches reference behavior) — `dm` maps
 * back: real = norm · scale + offset. The a→h chord direction is captured in the
 * phantom segment's angle, then the 'h' knot collapses onto its anchor.
 * @param {{x:number,y:number,ty:string}[]} knots
 * @returns {{segs: object[], nseg: number, dm: {scale:number, ox:number, oy:number}}}
 */
export function setupPath(knots) {
  const n = knots.length;
  if (n < 2) throw new TypeError('spiro: a contour needs at least 2 points');
  if (knots[0].ty === ']' || knots[n - 1].ty === '[') {
    throw new TypeError("spiro: cannot use ']' as start or '[' as end");
  }
  if (knots[0].ty === 'h' || knots[n - 1].ty === 'a') {
    throw new TypeError("spiro: cannot use 'h' as start or 'a' as end");
  }
  const nseg = knots[0].ty === '{' ? n - 1 : n;

  let xmin = Infinity;
  let xmax = -Infinity;
  let ymin = Infinity;
  let ymax = -Infinity;
  for (let i = 0; i < nseg; i++) {
    if (knots[i].ty === 'h') continue;
    xmin = Math.min(xmin, knots[i].x);
    xmax = Math.max(xmax, knots[i].x);
    ymin = Math.min(ymin, knots[i].y);
    ymax = Math.max(ymax, knots[i].y);
  }
  const ox = (xmin + xmax) / 2;
  const oy = (ymin + ymax) / 2;
  let scale = Math.max(Math.abs(xmax - xmin), Math.abs(ymax - ymin)) / 500;
  if (!(scale > 0)) scale = 1; // all knots coincident — degenerate but solvable
  const dm = { scale, ox, oy };

  const segs = [];
  for (let i = 0; i < nseg; i++) {
    const ty = knots[i].ty;
    if (ty === 'a') {
      const next = knots[i + 1];
      if (!next || next.ty !== 'h') {
        throw new TypeError("spiro: anchor 'a' must be immediately followed by handle 'h'");
      }
      if (next.x === knots[i].x && next.y === knots[i].y) {
        throw new TypeError('spiro: anchor and handle must not coincide');
      }
    } else if (ty === 'h' && (i === 0 || knots[i - 1].ty !== 'a')) {
      throw new TypeError("spiro: handle 'h' must be immediately preceded by anchor 'a'");
    }
    segs.push({
      ty,
      x: (knots[i].x - ox) / scale,
      y: (knots[i].y - oy) / scale,
      ks: [0, 0, 0, 0],
      segCh: 0,
      segTh: 0,
      bendTh: 0,
    });
  }
  const wrap = knots[nseg % n];
  segs.push({ ty: wrap.ty, x: (wrap.x - ox) / scale, y: (wrap.y - oy) / scale, ks: [0, 0, 0, 0] });

  for (let i = 0; i < nseg; i++) {
    // A handle knot collapses onto its anchor once the a→h chord (previous
    // iteration, original coords) has captured the fixed tangent direction.
    if (segs[i].ty === 'h') {
      segs[i].x = segs[i - 1].x;
      segs[i].y = segs[i - 1].y;
    }
    const dx = segs[i + 1].x - segs[i].x;
    const dy = segs[i + 1].y - segs[i].y;
    segs[i].segCh = Math.hypot(dx, dy);
    segs[i].segTh = Math.atan2(dy, dx);
  }

  let ilast = nseg - 1;
  for (let i = 0; i < nseg; i++) {
    const ty = segs[i].ty;
    segs[i].bendTh =
      ty === '{' || ty === '}' || ty === 'v' ? 0 : mod2pi(segs[i].segTh - segs[ilast].segTh);
    ilast = i;
  }
  return { segs, nseg, dm };
}

// Dense Gaussian elimination with partial pivoting; returns false when singular.
function denseSolve(A, v, n) {
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(A[r * n + col]) > Math.abs(A[pivot * n + col])) pivot = r;
    }
    const p = A[pivot * n + col];
    if (Math.abs(p) < 1e-12) return false;
    if (pivot !== col) {
      for (let c = col; c < n; c++) {
        const t = A[col * n + c];
        A[col * n + c] = A[pivot * n + c];
        A[pivot * n + c] = t;
      }
      const t = v[col];
      v[col] = v[pivot];
      v[pivot] = t;
    }
    for (let r = col + 1; r < n; r++) {
      const f = A[r * n + col] / p;
      if (f === 0) continue;
      for (let c = col; c < n; c++) A[r * n + c] -= f * A[col * n + c];
      v[r] -= f * v[col];
    }
  }
  for (let r = n - 1; r >= 0; r--) {
    let s = v[r];
    for (let c = r + 1; c < n; c++) s -= A[r * n + c] * v[c];
    v[r] = s / A[r * n + r];
  }
  return true;
}

// One Newton round: assemble the constraint system and apply the ks update.
// Returns the squared update norm, or NaN when the system is singular.
function spiroIter(segs, jinca, nmat, n) {
  const A = new Float64Array(nmat * nmat);
  const v = new Float64Array(nmat);
  const row = (r) => ((r % nmat) + nmat) % nmat;
  const addLine = (r, x, y, derivs, j, jinc) => {
    if (r < 0) return;
    const rr = row(r);
    v[rr] += x;
    for (let k = 0; k < jinc; k++) A[rr * nmat + row(j + k)] += y * derivs[k];
  };

  // Start offsets align the first knot's crossing rows with where the cyclic
  // walk lands when it wraps around (ported from the reference).
  let i = 0;
  let j = 0;
  let jj = 0;
  if (segs[0].ty === 'o') jj = nmat - 2;
  else if (segs[0].ty === 'c') jj = nmat - 1;
  else if (segs[0].ty === '[' || segs[0].ty === 'a') {
    // Cyclic contour starting on a one-sided type: start the walk at the first
    // v/c/o knot instead so the shared-row arithmetic stays consistent.
    let found = false;
    for (i = 0; i < n && !found; i++) {
      switch (segs[i].ty) {
        case 'o':
          --jj;
        // fallthrough
        case 'c':
          --jj;
        // fallthrough
        case 'v':
          jj = row(jj);
          j = row(j);
          found = true;
          break;
        default:
          jj += jinca[i];
          j += jinca[i];
      }
      if (found) break;
    }
    if (!found) {
      i = j = jj = 0;
    }
  }

  for (let k = 0; k < n; i++, k++) {
    i %= n;
    const ty0 = segs[i].ty;
    const ty1 = segs[i + 1].ty; // segs has the wrap knot at index nseg
    const jinc = jinca[i];
    const th = segs[i].bendTh;
    let jthl = -1;
    let jk0l = -1;
    let jk1l = -1;
    let jk2l = -1;
    let jthr = -1;
    let jk0r = -1;
    let jk1r = -1;
    let jk2r = -1;

    const { ends, derivs } = computePDerivs(segs[i], jinc);

    // Constraints crossing this segment's left knot.
    if ('oc[]ah'.includes(ty0)) {
      jthl = row(jj++);
      jj = row(jj);
      jk0l = jj++;
      if (ty0 === 'o') {
        jj = row(jj);
        jk1l = jj++;
        jk2l = jj++;
      }
    }
    // One-sided pinning of a 4-parameter segment's loose ends.
    if (jinc === 4) {
      if (ty0 === 'c' || ty0 === 'v' || ty0 === '[' || ty0 === 'a' || ty0 === '{') {
        if (ty0 !== 'c') jk1l = jj++;
        jk2l = jj++;
      }
      if (ty1 === 'c' || ty1 === 'v' || ty1 === ']' || ty1 === 'h' || ty1 === '}') {
        if (ty1 !== 'c') jk1r = jj++;
        jk2r = jj++;
      }
    }
    // Constraints crossing this segment's right knot.
    if ('oc[]ah'.includes(ty1)) {
      jj = row(jj);
      jthr = jj;
      jk0r = row(jj + 1);
      if (ty1 === 'o') {
        jk1r = row(jj + 2);
        jk2r = row(jj + 3);
      }
    }

    addLine(jthl, th - ends[0][0], 1, derivs[0][0], j, jinc);
    addLine(jk0l, ends[0][1], -1, derivs[1][0], j, jinc);
    addLine(jk1l, ends[0][2], -1, derivs[2][0], j, jinc);
    addLine(jk2l, ends[0][3], -1, derivs[3][0], j, jinc);
    addLine(jthr, -ends[1][0], 1, derivs[0][1], j, jinc);
    addLine(jk0r, -ends[1][1], 1, derivs[1][1], j, jinc);
    addLine(jk1r, -ends[1][2], 1, derivs[2][1], j, jinc);
    addLine(jk2r, -ends[1][3], 1, derivs[3][1], j, jinc);
    if (jthl >= 0) v[row(jthl)] = mod2pi(v[row(jthl)]);
    if (jthr >= 0) v[row(jthr)] = mod2pi(v[row(jthr)]);
    j = row(j + jinc);
  }

  if (!denseSolve(A, v, nmat)) return NaN;

  let norm = 0;
  let vj = 0;
  for (let s = 0; s < n; s++) {
    for (let k = 0; k < jinca[s]; k++) {
      const dk = v[vj++];
      segs[s].ks[k] += dk;
      norm += dk * dk;
      if (!Number.isFinite(segs[s].ks[k])) return NaN;
    }
    segs[s].ks[0] = 2 * mod2pi(segs[s].ks[0] / 2);
  }
  return norm;
}

/**
 * Solve the contour in place: iterate Newton rounds until the ks update norm
 * drops below 1e-12 (≤ 60 rounds). Throws when the system is singular or fails
 * to converge.
 * @param {object[]} segs  from setupPath (nseg+1 entries)
 * @param {number} nseg
 */
export function solveSpiro(segs, nseg) {
  if (nseg <= 1) return;
  const jinca = [];
  let nmat = 0;
  for (let i = 0; i < nseg; i++) {
    const jinc = computeJinc(segs[i].ty, segs[i + 1].ty);
    jinca.push(jinc);
    nmat += jinc;
  }
  if (nmat === 0) return; // all-corner polygon: every segment is a line

  for (let round = 0; round < 60; round++) {
    const norm = spiroIter(segs, jinca, nmat, nseg);
    if (!Number.isFinite(norm)) {
      throw new Error('spiro: solver failed (singular or diverging system)');
    }
    if (norm < 1e-12) return;
  }
  throw new Error('spiro: solver failed to converge within 60 iterations');
}
