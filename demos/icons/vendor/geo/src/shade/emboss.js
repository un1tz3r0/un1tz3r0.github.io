// F16 — the bevel band and its quantized shading, as real Paths.
//
// Construction:
//
//   1. The **band** is the shape intersected with a stroke of its own boundary:
//      `P ∩ stroke(∂P, 2w)`. The obvious construction — erode and subtract — does not
//      work, because an inward offset is *local* by design (F5 leaves self-intersections
//      to F6), and simplifying it keeps four spurious corner slivers per convex corner
//      rather than the eroded core. Stroking the boundary sidesteps erosion entirely: it
//      is exact (a 40×40 square with w=5 gives 700, a circle to 3e-13), it degrades
//      gracefully on shapes thinner than 2w — where the band correctly becomes the whole
//      shape — and it needs no medial-axis reasoning at all.
//
//   2. Intensity along the boundary depends only on the outward normal *angle* (see
//      `lighting.js`), so band boundaries are the finitely many arc lengths where that
//      angle crosses a threshold. They are found by bisection on the sampled intensity —
//      root-finding on `N·L`, not marching a field.
//
//   3. Each band is a **sector**: the boundary run, swept inward past the band's depth and
//      outward by a small overshoot, then intersected with the band. The overshoot is what
//      lets a *polyline* sector recover the exact curved edge — the intersection clips it
//      back to the band's true boundary, so no curve fidelity is lost to sampling.
//
// The output is regions with intensity values, not pixels: they compose with the rest of
// the library and serialize as SVG. A continuously shaded, rounded "pillow" emboss is a
// different deliverable — it needs the distance field's gradient, which is raster work.

import { intersection, union, difference } from '../core/boolean.js';
import { containsPoint } from '../core/winding.js';
import { stroke } from '../core/stroke.js';
import { subpathArea, interiorSideOf } from '../core/area.js';
import { path, subpath } from '../core/path.js';
import { line, arcLength, tAtLength, pointAt, normalAt } from '../core/segment.js';
import { vec2 } from '../core/vec2.js';
import { invariant, withAttrs, length as lengthAttr, direction as directionAttr } from '../core/attributes.js';
import { FLATNESS, EPS } from '../core/tolerance.js';
import {
  shadingModel,
  diffuseAt,
  specularAt,
  dotRange,
  isoNormalAngles,
} from './lighting.js';

/**
 * Which way is out of a subpath's *own* enclosed region, from its orientation alone.
 *
 * A closed subpath answers from F22's `interiorSideOf`; an open one falls back to signed
 * area, since fill semantics close every subpath anyway.
 *
 * **This is not the same question as "which way is the material"** — see
 * `awayFromFillSign`. For a hole, the two are opposite, because a hole's own enclosed
 * region is the empty part.
 * @returns {1|-1} the multiplier taking the kernel's left normal to the outward normal
 */
export function outwardNormalSign(sp) {
  const side = interiorSideOf(sp);
  if (side !== null) return side === 'left' ? -1 : 1;
  const a = subpathArea(sp);
  return a > 0 ? -1 : 1;
}

/**
 * Which way points *away from the filled material* along a subpath — the direction the
 * bevel faces, and the normal the lighting uses.
 *
 * Decided by probing the fill rather than by the subpath's orientation, because those
 * disagree exactly where it matters. An outer loop encloses the material, so away-from-
 * material is out of the loop; a **hole** encloses empty space, so away-from-material is
 * *into* the hole — the opposite of what its own winding says. Probing `containsPoint`
 * answers the question that is actually being asked, for outer loops and holes alike, and
 * needs no case analysis.
 *
 * Several probes with a majority vote, because a single one can land on a coincident edge
 * or in a corner notch.
 *
 * @param {object} pth  the whole Path (the fill is a property of the path, not the subpath)
 * @param {object} walker  a walker over the subpath, built with sign +1
 * @param {number} eps  probe distance
 * @returns {1|-1} the multiplier taking the kernel's left normal to the away-from-fill normal
 */
export function awayFromFillSign(pth, walker, eps) {
  let votes = 0;
  const probes = 7;
  for (let k = 0; k < probes; k++) {
    const g = walker.at((walker.total * (k + 0.5)) / probes);
    const inside = containsPoint(
      pth,
      vec2(g.point.x - g.normal.x * eps, g.point.y - g.normal.y * eps),
      pth.fillRule,
    );
    votes += inside ? 1 : -1;
  }
  // `votes > 0` means the material lies on the −left side, so away-from-fill is +left.
  return votes > 0 ? 1 : -1;
}

/**
 * The bevel band: the ribbon of width `width` inside the shape's boundary.
 *
 * @param {object} pth  Path (filled interpretation)
 * @param {number} width
 * @param {{tolerance?: number, join?: string}} [opts]
 * @returns {object} Path — empty when the shape is thinner than twice the width
 */
export function bevelBand(pth, width, opts = {}) {
  if (!(width > 0)) throw new RangeError(`bevelBand: width must be > 0, got ${width}`);
  const ribbon = stroke(pth, {
    width: 2 * width,
    join: opts.join ?? 'round',
    cap: 'butt',
    tolerance: opts.tolerance ?? FLATNESS,
  });
  return intersection(pth, ribbon);
}

/**
 * The band split per boundary, as a **partition**.
 *
 * A shape with a hole has two boundaries, and a sector cast from one of them reaches into
 * the other's band whenever the wall is thinner than the sector's depth — so clipping
 * every sector against the *whole* band double-counts the overlap. Each boundary therefore
 * gets its own band, and later ones have the already-claimed area subtracted, which makes
 * the pieces disjoint by construction. Where two boundaries genuinely run closer than the
 * band width the assignment is arbitrary, but it is at least a partition rather than an
 * overlap, so the bands still tile the ribbon exactly.
 *
 * @returns {object[]} one Path per subpath of `pth`, aligned by index
 */
export function bevelBandsBySubpath(pth, width, opts = {}) {
  const strokeOpts = {
    width: 2 * width,
    join: opts.join ?? 'round',
    cap: 'butt',
    tolerance: opts.tolerance ?? FLATNESS,
  };
  const out = [];
  let claimed = null;
  for (const sp of pth.subpaths) {
    if (sp.segments.length === 0) {
      out.push(path([]));
      continue;
    }
    const one = { subpaths: [sp], fillRule: pth.fillRule };
    let b = intersection(pth, stroke(one, strokeOpts));
    if (claimed !== null && b.subpaths.length) b = difference(b, claimed);
    out.push(b);
    if (b.subpaths.length) claimed = claimed === null ? b : union(claimed, b);
  }
  return out;
}

/**
 * A boundary walker over one subpath, measuring its segment lengths **once**.
 *
 * The shading scan evaluates the boundary hundreds of times, and `pointAtLength` re-measures
 * the whole subpath on every call — which for arc segments means re-running quadrature. That
 * turned a square emboss into four seconds of arc-length integration. Hoisting the
 * measurement is the whole fix.
 */
function makeWalker(sp, sign) {
  const segs = sp.segments;
  const lengths = segs.map((seg) => arcLength(seg));
  const prefix = [];
  let acc = 0;
  for (const l of lengths) {
    prefix.push(acc);
    acc += l;
  }
  const total = acc;
  return {
    total,
    closed: sp.closed,
    segments: segs.length,
    // Segment junctions with their exact one-sided normals. These are the only places
    // the normal can jump, so they are the only places a sector's inner edge needs a
    // miter rather than a chord. Taken from the segments directly rather than by probing
    // either side: a probe over a smooth arc joint reports a turn of ~1e-6 and would
    // trip the corner path on every circle.
    junctions: segs.slice(1).map((seg, i) => {
      const b = normalAt(segs[i], 1);
      const a = normalAt(seg, 0);
      const before = vec2(b.x * sign, b.y * sign);
      const after = vec2(a.x * sign, a.y * sign);
      return {
        s: prefix[i + 1],
        before,
        after,
        turn: Math.abs(
          Math.atan2(before.x * after.y - before.y * after.x, before.x * after.x + before.y * after.y),
        ),
      };
    }),
    at(s) {
      const clamped = Math.min(Math.max(s, 0), total);
      let i = 0;
      while (i < segs.length - 1 && prefix[i] + lengths[i] < clamped) i++;
      const t = tAtLength(segs[i], clamped - prefix[i]);
      const point = pointAt(segs[i], t);
      const n = normalAt(segs[i], t);
      return {
        point,
        normal: vec2(n.x * sign, n.y * sign),
        psi: Math.atan2(n.y * sign, n.x * sign),
      };
    },
  };
}

// Band index of an intensity value against ascending thresholds.
function bandIndexOf(value, thresholds) {
  let i = 0;
  while (i < thresholds.length && value >= thresholds[i]) i++;
  return i;
}

/**
 * Threshold levels splitting `[lo, hi]` into `n` bands, and the representative intensity
 * of each. Placed over the range the geometry actually spans rather than over [0, 1], so
 * every band is populated instead of most of them being empty.
 */
export function bandLevels(lo, hi, n) {
  const thresholds = [];
  const values = [];
  for (let i = 1; i < n; i++) thresholds.push(lo + ((hi - lo) * i) / n);
  for (let i = 0; i < n; i++) values.push(lo + ((hi - lo) * (i + 0.5)) / n);
  return { thresholds, values };
}

// Exact arc length where the band index changes between sa and sb, by bisection on the
// intensity — this is the root-find the whole banding rests on.
function crossing(walker, sa, sb, intensityOf, thresholds, iterations = 40) {
  let lo = sa;
  let hi = sb;
  const at = (s) => bandIndexOf(intensityOf(walker.at(s).psi), thresholds);
  const target = at(lo);
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    if (at(mid) === target) lo = mid;
    else hi = mid;
    if (hi - lo <= EPS) break;
  }
  return hi;
}

// Total unsigned turning of the outward normal over a boundary run — what decides how
// finely the sector has to follow the curve.
function turningOver(walker, sa, sb, probes = 8) {
  let turn = 0;
  let prev = walker.at(sa).psi;
  for (let k = 1; k <= probes; k++) {
    const psi = walker.at(sa + ((sb - sa) * k) / probes).psi;
    let d = psi - prev;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    turn += Math.abs(d);
    prev = psi;
  }
  return turn;
}

// The direction a sector's end rung runs along.
//
// At a corner the normal jumps, so a rung perpendicular to *one* side hands the corner
// square to both neighbours and the bands overlap. The **angle bisector** of the two
// normals is the direction both neighbours agree on, so adjacent sectors share the rung
// exactly and the bands tile instead of double-counting. Away from a corner the bisector
// is just the normal, so this needs no special case for smooth points.
function rungDirection(walker, s) {
  const d = Math.max(walker.total * 1e-7, 1e-12);
  const wrap = (x) => (walker.closed ? ((x % walker.total) + walker.total) % walker.total : Math.min(Math.max(x, 0), walker.total));
  const a = walker.at(wrap(s - d)).normal;
  const b = walker.at(wrap(s + d)).normal;
  const sx = a.x + b.x;
  const sy = a.y + b.y;
  const l = Math.hypot(sx, sy);
  if (l <= EPS) return walker.at(s).normal; // a cusp: the bisector is undefined, use the normal
  return vec2(sx / l, sy / l);
}

// A sector polygon over the boundary run [sa, sb]: the run pushed outward by `over` and
// inward by `deep`, closed. Deliberately a polyline — the boolean intersection with the
// band clips it back to the true curved boundary, so the sampling never costs fidelity.
function sectorPath(walker, sa, sb, deep, over, steps) {
  const outer = [];
  const inner = [];
  const dirA = rungDirection(walker, sa);
  const dirB = rungDirection(walker, sb);

  // Sample positions: an even sweep, plus every segment junction strictly inside the run.
  // A junction is where the normal can jump, and a chord across one cuts the corner off
  // the sector — which is how a run spanning a corner lost the corner's share of the band.
  const CORNER = 1e-4; // radians; below this a junction is smooth and needs no miter
  const params = [];
  for (let k = 0; k <= steps; k++) params.push({ s: sa + ((sb - sa) * k) / steps, corner: null });
  for (const j of walker.junctions) {
    if (j.s > sa + EPS && j.s < sb - EPS && j.turn > CORNER) params.push({ s: j.s, corner: j });
  }
  params.sort((x, y) => x.s - y.s);

  const push = (p, dir, spanFactor = 1) => {
    outer.push(vec2(p.x + dir.x * over * spanFactor, p.y + dir.y * over * spanFactor));
    inner.push(vec2(p.x - dir.x * deep * spanFactor, p.y - dir.y * deep * spanFactor));
  };

  for (let k = 0; k < params.length; k++) {
    const { s, corner } = params[k];
    const g = walker.at(s);
    if (k === 0) {
      push(g.point, dirA);
      continue;
    }
    if (k === params.length - 1) {
      push(g.point, dirB);
      continue;
    }
    if (corner === null) {
      push(g.point, g.normal);
      continue;
    }
    // A real corner: run the incoming offset in, out to the miter along the bisector,
    // then back onto the outgoing offset. The miter extension 1/cos(turn/2) is clamped —
    // a near-cusp would otherwise send it to infinity.
    const bx = corner.before.x + corner.after.x;
    const by = corner.before.y + corner.after.y;
    const bl = Math.hypot(bx, by);
    const bis = bl <= EPS ? g.normal : vec2(bx / bl, by / bl);
    push(g.point, corner.before);
    push(g.point, bis, Math.min(4, 1 / Math.max(0.25, Math.cos(corner.turn / 2))));
    push(g.point, corner.after);
  }
  if (outer.length < 2) return null;
  const pts = [...outer, ...inner.reverse()];
  const segs = [];
  for (let i = 0; i + 1 < pts.length; i++) segs.push(line(pts[i], pts[i + 1]));
  segs.push(line(pts[pts.length - 1], pts[0]));
  return path([subpath(segs, { closed: true })]);
}

/**
 * Emboss a path: the bevel band split into quantized shading regions.
 *
 * @param {object} pth  Path (filled interpretation)
 * @param {object} [opts]
 * @param {number} [opts.width=4]        bevel width
 * @param {number} [opts.azimuth]        light azimuth, radians (default −45°)
 * @param {number} [opts.elevation]      light elevation, radians (default 45°)
 * @param {number} [opts.bevelAngle]     bevel slope from the base plane (default 45°)
 * @param {number} [opts.bands=4]        diffuse bands
 * @param {number|null} [opts.specularBands=2]  specular bands (0 or null to skip)
 * @param {number} [opts.exponent=24]    Blinn-Phong exponent
 * @param {number} [opts.tolerance]      sampling/offset tolerance
 * @returns {{band: object, regions: {path, intensity, kind, subpathIndex}[], model: object}}
 *   `regions` are ascending in intensity within each kind. `kind` is `'diffuse'` or
 *   `'specular'`.
 */
export function embossPath(pth, opts = {}) {
  const width = opts.width ?? 4;
  const tolerance = opts.tolerance ?? FLATNESS;
  const model = shadingModel(opts);
  const band = bevelBand(pth, width, { tolerance, join: opts.join });
  const out = { band, regions: [], model };
  if (band.subpaths.length === 0) return out;
  const bands = bevelBandsBySubpath(pth, width, { tolerance, join: opts.join });

  // Each shading pass partitions the band independently, so the claim set resets per kind.
  let claimed = null;
  const kinds = [{ kind: 'diffuse', n: opts.bands ?? 4, d: model.light, f: (psi) => diffuseAt(psi, model) }];
  const specN = opts.specularBands === undefined ? 2 : opts.specularBands;
  if (specN) {
    kinds.push({
      kind: 'specular',
      n: specN,
      d: model.half,
      f: (psi) => specularAt(psi, model),
    });
  }

  // Comfortably past the band's inner edge (which sits `width` in), so a sector always
  // spans it — including where a round join bulges the band inward at a corner.
  const deep = width * 1.6;
  const over = Math.max(width * 0.25, tolerance * 8);

  for (const spec of kinds) {
    const [lo, hi] = dotRange(model.alpha, spec.d);
    // Map the dot range through the same response the intensity uses, so specular bands
    // land where the highlight actually is rather than where the raw dot product is.
    const loV = spec.kind === 'specular' ? Math.pow(Math.max(0, lo), model.exponent) : Math.max(0, lo);
    const hiV = spec.kind === 'specular' ? Math.pow(Math.max(0, hi), model.exponent) : Math.max(0, hi);
    if (hiV - loV <= EPS) continue; // uniform illumination: nothing to band
    const { thresholds, values } = bandLevels(loV, hiV, spec.n);
    claimed = null;

    for (let si = 0; si < pth.subpaths.length; si++) {
      const sp = pth.subpaths[si];
      if (sp.segments.length === 0 || bands[si].subpaths.length === 0) continue;
      const probe = makeWalker(sp, 1);
      if (!(probe.total > 0)) continue;
      const walker = makeWalker(sp, awayFromFillSign(pth, probe, Math.min(width, probe.total) * 0.05));
      const total = walker.total;

      // The scan resolves *orientation*, not position: what it must not miss is a band
      // boundary, and those are normal-angle crossings. Sampling is therefore scaled by
      // segment count rather than by a length tolerance — deriving it from FLATNESS
      // (1e-3) asked for forty thousand samples of a square and spent them all on
      // arc-length quadrature. Exact boundaries come from the bisection below anyway, so
      // the scan only has to bracket them.
      const steps = Math.min(4096, Math.max(256, 64 * walker.segments));
      const idx = new Array(steps + 1);
      const psis = new Array(steps + 1);
      for (let k = 0; k <= steps; k++) {
        psis[k] = walker.at((total * k) / steps).psi;
        idx[k] = bandIndexOf(spec.f(psis[k]), thresholds);
      }

      // Boundaries: exact arc lengths where the band index changes.
      const cuts = [0];
      for (let k = 1; k <= steps; k++) {
        if (idx[k] !== idx[k - 1]) {
          cuts.push(crossing(walker, (total * (k - 1)) / steps, (total * k) / steps, spec.f, thresholds));
        }
      }
      cuts.push(total);

      for (let r = 0; r + 1 < cuts.length; r++) {
        const sa = cuts[r];
        const sb = cuts[r + 1];
        if (sb - sa <= EPS * Math.max(1, total)) continue;
        const bi = bandIndexOf(spec.f(walker.at((sa + sb) / 2).psi), thresholds);
        const intensity = values[Math.min(bi, values.length - 1)];
        if (spec.kind === 'specular' && bi === 0) continue; // the unlit specular band is nothing

        // Sector resolution follows the run's *turning*, not its length: a straight run
        // needs two points however long it is, and a curved one needs enough that its
        // chord sag stays inside the outward overshoot (sag ≈ L·T/8N²).
        const turn = turningOver(walker, sa, sb);
        const runSteps = Math.min(
          48,
          Math.max(2, Math.ceil(Math.sqrt(((sb - sa) * turn) / (8 * over)))),
        );
        const sector = sectorPath(walker, sa, sb, deep, over, runSteps);
        if (sector === null) continue;
        // Clipped against *this boundary's* share of the band, not the whole ribbon, then
        // against everything already claimed. The second step is what makes the output a
        // partition on shapes with narrow features: on a star's points a sector deep
        // enough to span the band also reaches through to the far side of the *same*
        // boundary, and would otherwise claim that area twice. Where two runs genuinely
        // compete the winner is the earlier one — arbitrary, but a partition, so the
        // bands still tile the ribbon exactly.
        let piece = intersection(bands[si], sector);
        if (piece.subpaths.length && claimed !== null) piece = difference(piece, claimed);
        if (piece.subpaths.length === 0) continue;
        claimed = claimed === null ? piece : union(claimed, piece);

        out.regions.push({
          path: withAttrs(piece, {
            origin: invariant('emboss'),
            kind: invariant(spec.kind),
            intensity: invariant(intensity),
            bevelWidth: lengthAttr(width),
            lightAzimuth: directionAttr(model.azimuth),
          }),
          intensity,
          kind: spec.kind,
          subpathIndex: si,
        });
      }
    }
  }

  out.regions.sort((a, b) => (a.kind === b.kind ? a.intensity - b.intensity : a.kind < b.kind ? -1 : 1));
  return out;
}

/**
 * The two boundary normal angles where the diffuse terminator falls — where the bevel
 * turns from lit to unlit. Exposed because it is the sharpest observable of the model:
 * on a circle these land exactly perpendicular to the light azimuth when the light is
 * horizontal.
 * @param {object} model  from `shadingModel`
 * @returns {number[]}
 */
export function terminatorAngles(model) {
  return isoNormalAngles(0, model.alpha, model.light);
}
