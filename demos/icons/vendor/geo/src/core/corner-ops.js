// F10 — path-level corner treatments: fillet and chamfer.
//
// `filletCorner` (fillet.js) answers "what happens at *this* corner". Applying that to a
// whole path adds three things it cannot know about on its own:
//
//   1. **Selection** — which corners, and at what radius. A radius may be a function of
//      the corner, so "round every convex corner by a tenth of its shortest neighbour"
//      is a caller-side expression rather than a library feature.
//   2. **The shared budget** — the corners at both ends of one segment eat into the same
//      length. Solved independently they can each look fine and together consume more
//      than exists, which is how corner treatments produce inside-out geometry.
//   3. **Verification** — local guards cannot see a fillet that swallowed a whole feature
//      elsewhere on the path, so the result is probed for self-intersection it did not
//      start with.
//
// Every refusal keeps its name and comes back from `planFillets` / `planChamfers`, so a
// caller (or a demo overlay) can say *why* a corner was left alone.

import { subsegment, arcLength, arcLengthTo, tAtLength, pointAt, line, startPoint, endPoint, withMeta } from './segment.js';
import { subpath, path } from './path.js';
import { pathSelfIntersects } from './cut.js';
import { withAttrs, invariant, length as lengthAttr, tagOutputPath } from './attributes.js';
import { pathCorners } from './corners.js';
import { filletCorner, DEFAULT_MIN_ANGLE } from './fillet.js';
import { EPS_COINCIDENT } from './tolerance.js';

const OVERLAP_POLICIES = ['clamp', 'skip', 'error'];
const VERIFY_MODES = ['auto', 'always', 'never'];

// Budget re-solve rounds. Setback is linear in radius for straight neighbours (one round
// is exact) and only mildly non-linear for curved ones.
const BUDGET_ROUNDS = 4;

// --- chamfer ----------------------------------------------------------------------------

/**
 * Chamfer the corner where `a` ends and `b` begins — the same trim, bridged by a straight
 * line instead of an arc.
 *
 * Three ways to say how much to cut, because all three are how people actually specify
 * chamfers: `{distance}` sets an equal setback (arc length) on both sides, `{distances:
 * [dA, dB]}` sets them independently, and `{radius}` cuts exactly where the equivalent
 * fillet would have — the chord of that arc — which is what makes "chamfer instead of
 * fillet" a drop-in swap.
 *
 * @param {object} a
 * @param {object} b
 * @param {{distance?:number, distances?:[number,number], radius?:number}} spec
 * @param {{minAngle?:number, tolerance?:number}} [opts]
 * @returns {{ok:true, a:object, b:object, line:object, ta:number, tb:number,
 *            setbackA:number, setbackB:number, interiorAngle:number}
 *        | {ok:false, reason:string}}
 *   Refusals share fillet's vocabulary, plus `'bad-spec'` and `'setback-exceeds-feature'`.
 */
export function chamferCorner(a, b, spec, opts = {}) {
  if (spec !== null && typeof spec === 'object' && typeof spec.radius === 'number') {
    // Equivalent-fillet chamfer: solve the fillet and replace its arc with the chord.
    const res = filletCorner(a, b, spec.radius, opts);
    if (!res.ok) return res;
    return {
      ok: true,
      a: res.a,
      b: res.b,
      line: withAttrs(line(endPoint(res.a), startPoint(res.b)), {
        ...(opts.outAttrs ?? {}),
        origin: invariant('chamfer'),
        radius: lengthAttr(spec.radius),
      }),
      ta: res.ta,
      tb: res.tb,
      setbackA: res.setbackA,
      setbackB: res.setbackB,
      interiorAngle: res.interiorAngle,
    };
  }

  let dA;
  let dB;
  if (spec !== null && typeof spec === 'object' && Array.isArray(spec.distances)) {
    [dA, dB] = spec.distances;
  } else if (spec !== null && typeof spec === 'object' && typeof spec.distance === 'number') {
    dA = spec.distance;
    dB = spec.distance;
  }
  if (!(dA > 0) || !(dB > 0) || !Number.isFinite(dA) || !Number.isFinite(dB)) {
    return { ok: false, reason: 'bad-spec' };
  }

  // Reuse the fillet primitive's own gates for adjacency, degeneracy and corner angle by
  // asking it for an arbitrarily small fillet: the geometry checks are the same, and this
  // keeps one implementation of the corner vocabulary.
  const probe = filletCorner(a, b, Math.min(dA, dB) * 1e-6, opts);
  if (!probe.ok && probe.reason !== 'no-solution' && probe.reason !== 'radius-exceeds-feature') {
    return probe;
  }

  const lenA = arcLength(a);
  const lenB = arcLength(b);
  if (dA >= lenA || dB >= lenB) return { ok: false, reason: 'setback-exceeds-feature' };

  const ta = tAtLength(a, lenA - dA);
  const tb = tAtLength(b, dB);
  const pa = pointAt(a, ta);
  const pb = pointAt(b, tb);
  if (Math.hypot(pb.x - pa.x, pb.y - pa.y) <= EPS_COINCIDENT) {
    return { ok: false, reason: 'no-solution' };
  }
  return {
    ok: true,
    a: subsegment(a, 0, ta),
    b: subsegment(b, tb, 1),
    line: withAttrs(line(pa, pb), {
      ...(opts.outAttrs ?? {}),
      origin: invariant('chamfer'),
      distanceA: lengthAttr(dA),
      distanceB: lengthAttr(dB),
    }),
    ta,
    tb,
    setbackA: dA,
    setbackB: dB,
    interiorAngle: probe.ok ? probe.interiorAngle : undefined,
  };
}

// --- planning ----------------------------------------------------------------------------

// Resolve the caller's radius/spec for one corner: a number, a function of the corner, or
// null/undefined to leave it alone.
function specFor(corner, spec) {
  const value = typeof spec === 'function' ? spec(corner) : spec;
  if (value === null || value === undefined) return null;
  return value;
}

// Solve one corner, whichever treatment is in play.
function solve(kind, a, b, value, opts) {
  if (kind === 'fillet') {
    return typeof value === 'number' ? filletCorner(a, b, value, opts) : { ok: false, reason: 'bad-radius' };
  }
  const spec = typeof value === 'number' ? { distance: value } : value;
  return chamferCorner(a, b, spec, opts);
}

// Scale a spec down by `factor` — used by the clamp policy to shrink two competing
// corners until they fit the segment between them.
function scaleSpec(value, factor) {
  if (typeof value === 'number') return value * factor;
  if (Array.isArray(value.distances)) {
    return { distances: [value.distances[0] * factor, value.distances[1] * factor] };
  }
  if (typeof value.distance === 'number') return { distance: value.distance * factor };
  return { radius: value.radius * factor };
}

// One planning pass over a subpath: solve every selected corner independently.
function planSubpath(kind, sp, si, corners, opts) {
  const segs = sp.segments;
  const n = segs.length;
  const plans = [];
  for (const corner of corners) {
    const entry = {
      subpathIndex: si,
      inIndex: corner.inIndex,
      outIndex: corner.outIndex,
      point: corner.point,
      interiorAngle: corner.interiorAngle,
      convex: corner.convex,
    };
    if (opts.select && !opts.select(corner)) {
      plans.push({ ...entry, ok: false, reason: 'not-selected' });
      continue;
    }
    const value = specFor(corner, opts.spec);
    if (value === null) {
      plans.push({ ...entry, ok: false, reason: 'not-selected' });
      continue;
    }
    const res = solve(kind, segs[corner.inIndex], segs[corner.outIndex], value, opts.solveOpts);
    plans.push({ ...entry, spec: value, ...res, segCount: n });
  }
  return plans;
}

// Refusals that mean "this treatment is too big for the room available" — the ones the
// clamp policy can fix by asking for less, as opposed to refusals about the corner itself
// (too shallow, too sharp, not adjacent) which no amount of shrinking will change.
const TOO_BIG = new Set(['no-solution', 'radius-exceeds-feature', 'setback-exceeds-feature']);

// Smallest fraction of the requested size worth trying before giving up on a corner.
const MIN_SHRINK = 1e-3;

// Enforce the shared trim budget.
//
// Two things can go wrong, and `clamp` has to handle both: a corner may be too big to fit
// between its own neighbours at all, and two corners that each fit may still want more of
// the segment between them than it has. Both are answered by asking for less and
// re-solving — halving in the first case, scaling to the available length in the second —
// because setback is linear in radius for straight neighbours and only mildly non-linear
// for curved ones.
function applyBudget(kind, sp, plans, opts) {
  const segs = sp.segments;
  const n = segs.length;
  const lengths = segs.map((s) => arcLength(s));

  const resolve = (k, factor) => {
    const p = plans[k];
    const scaled = scaleSpec(p.spec, factor);
    const res = solve(kind, segs[p.inIndex], segs[p.outIndex], scaled, opts.solveOpts);
    if (res.ok) {
      // Drop any stale refusal from the previous, larger attempt.
      const { reason, ...rest } = p;
      plans[k] = { ...rest, ...res, spec: scaled, shrunk: factor, clamped: true };
    } else {
      plans[k] = { ...p, ...res, spec: scaled, shrunk: factor };
    }
  };

  for (let round = 0; round < BUDGET_ROUNDS; round++) {
    let changed = false;

    // 1. Corners that do not fit at all: back off geometrically until they do.
    if (opts.overlap === 'clamp') {
      for (let k = 0; k < plans.length; k++) {
        const p = plans[k];
        if (p.ok || !TOO_BIG.has(p.reason)) continue;
        if ((p.shrunk ?? 1) <= MIN_SHRINK) continue;
        resolve(k, 0.5);
        changed = true;
      }
    }

    // 2. Segments asked to give up more than they have.
    const wanted = segs.map(() => 0);
    for (const p of plans) {
      if (!p.ok) continue;
      wanted[p.inIndex] += p.setbackA;
      wanted[p.outIndex] += p.setbackB;
    }
    const over = [];
    for (let i = 0; i < n; i++) {
      if (wanted[i] > lengths[i] * (1 - 1e-9)) over.push(i);
    }

    if (over.length > 0) {
      if (opts.overlap === 'error') {
        throw new RangeError(
          `${kind}Path: corners at both ends of segment ${over[0]} want ${wanted[over[0]]} of its ${lengths[over[0]]}`,
        );
      }
      if (opts.overlap === 'skip') {
        for (let k = 0; k < plans.length; k++) {
          const p = plans[k];
          if (p.ok && (over.includes(p.inIndex) || over.includes(p.outIndex))) {
            plans[k] = { ...p, ok: false, reason: 'budget-shared' };
          }
        }
        return;
      }
      for (const i of over) {
        // Leave a sliver so the shared segment survives as real geometry.
        const factor = (lengths[i] / wanted[i]) * 0.98;
        for (let k = 0; k < plans.length; k++) {
          const p = plans[k];
          if (!p.ok || (p.inIndex !== i && p.outIndex !== i)) continue;
          resolve(k, factor);
          changed = true;
        }
      }
    }

    if (!changed) break;
  }

  // Anything still over budget after the re-solve rounds is refused outright: better a
  // named refusal than a segment trimmed past its own length.
  const wanted = segs.map(() => 0);
  for (const p of plans) {
    if (!p.ok) continue;
    wanted[p.inIndex] += p.setbackA;
    wanted[p.outIndex] += p.setbackB;
  }
  for (let k = 0; k < plans.length; k++) {
    const p = plans[k];
    if (!p.ok) continue;
    if (wanted[p.inIndex] > lengths[p.inIndex] || wanted[p.outIndex] > lengths[p.outIndex]) {
      plans[k] = { ...p, ok: false, reason: 'budget-shared' };
    }
  }
}

// Rebuild one subpath from its trim parameters and connectors.
function rebuild(sp, plans) {
  const segs = sp.segments;
  const n = segs.length;
  const applied = new Map();
  for (const p of plans) if (p.ok) applied.set(p.inIndex, p);

  const out = [];
  for (let i = 0; i < n; i++) {
    // A corner ending on segment i−1 trims the *start* of segment i.
    const prev = applied.get((i + n - 1) % n);
    const here = applied.get(i);
    const startsHere = prev !== undefined && prev.outIndex === i;
    const t0 = startsHere ? prev.tb : 0;
    const t1 = here !== undefined ? here.ta : 1;
    if (t1 - t0 > 1e-12) out.push(subsegment(segs[i], t0, t1));
    if (here !== undefined) out.push(here.arc ?? here.line);
  }
  return subpath(out, { closed: sp.closed });
}

function runTreatment(kind, pth, opts) {
  const solveOpts = { minAngle: opts.minAngle ?? DEFAULT_MIN_ANGLE, tolerance: opts.tolerance };
  const overlap = opts.overlap ?? 'clamp';
  if (!OVERLAP_POLICIES.includes(overlap)) {
    throw new TypeError(`${kind}Path: overlap must be one of ${OVERLAP_POLICIES.join(', ')}`);
  }
  const corners = pathCorners(pth);
  const bySubpath = pth.subpaths.map(() => []);
  for (const c of corners) bySubpath[c.subpathIndex].push(c);

  const plans = [];
  const perSubpath = pth.subpaths.map((sp, si) => {
    if (sp.segments.length === 0) return [];
    const sub = planSubpath(kind, sp, si, bySubpath[si], {
      ...opts,
      overlap,
      solveOpts,
    });
    applyBudget(kind, sp, sub, { ...opts, overlap, solveOpts });
    plans.push(...sub);
    return sub;
  });
  return { plans, perSubpath };
}

function build(pth, perSubpath) {
  const subpaths = pth.subpaths.map((sp, si) =>
    sp.segments.length === 0 ? sp : rebuild(sp, perSubpath[si]),
  );
  return path(subpaths, { fillRule: pth.fillRule });
}

// --- public API ---------------------------------------------------------------------------

/**
 * What `filletPath` would do, corner by corner, without doing it — including the corners
 * it would refuse and why.
 * @param {object} pth
 * @param {object} opts  same options as `filletPath`
 * @returns {object[]}  one entry per corner: address, `interiorAngle`, `convex`, and
 *   either `ok: true` with the solved trim, or `ok: false` with a named `reason`
 *   (`'not-selected'`, `'budget-shared'`, or any of `filletCorner`'s).
 */
export function planFillets(pth, opts = {}) {
  return runTreatment('fillet', pth, { ...opts, spec: opts.radius }).plans;
}

/** As `planFillets`, for `chamferPath`. */
export function planChamfers(pth, opts = {}) {
  return runTreatment('chamfer', pth, { ...opts, spec: opts.chamfer ?? opts.distance }).plans;
}

// Verify the result did not introduce self-intersection, dropping the greediest corners
// until it holds. Only meaningful when the input was clean to begin with.
function verified(kind, pth, opts, spec) {
  const run = runTreatment(kind, pth, { ...opts, spec });
  let result = build(pth, run.perSubpath);
  const mode = opts.verify ?? 'auto';
  if (!VERIFY_MODES.includes(mode)) {
    throw new TypeError(`${kind}Path: verify must be one of ${VERIFY_MODES.join(', ')}`);
  }
  if (mode === 'never') return { result, plans: run.plans };
  if (mode === 'auto' && pathSelfIntersects(pth)) return { result, plans: run.plans };

  const perSubpath = run.perSubpath.map((sub) => sub.slice());
  const plans = run.plans;
  for (let guard = 0; guard < plans.length + 1; guard++) {
    if (!pathSelfIntersects(result)) return { result, plans };
    // Drop the applied corner that gave up the most length — the likeliest offender.
    let worst = null;
    for (const sub of perSubpath) {
      for (let k = 0; k < sub.length; k++) {
        const p = sub[k];
        if (!p.ok) continue;
        const total = p.setbackA + p.setbackB;
        if (worst === null || total > worst.total) worst = { sub, k, total };
      }
    }
    if (worst === null) return { result, plans };
    const dropped = { ...worst.sub[worst.k], ok: false, reason: 'verify-self-intersection' };
    worst.sub[worst.k] = dropped;
    const idx = plans.indexOf(worst.sub[worst.k]);
    if (idx >= 0) plans[idx] = dropped;
    result = build(pth, perSubpath);
  }
  return { result, plans };
}

/**
 * Round every selected corner of a path with a tangent arc.
 *
 * @param {object} pth  Path
 * @param {{radius?: number | ((corner:object)=>number|null),
 *          select?: (corner:object)=>boolean,
 *          minAngle?: number, tolerance?: number,
 *          overlap?: 'clamp'|'skip'|'error',
 *          verify?: 'auto'|'always'|'never'}} [opts]
 *   `radius` may be a function of the corner (return `null` to skip it); `select` filters
 *   corners before that. `overlap` decides what happens when the corners at both ends of
 *   a segment want more length than it has — `'clamp'` (default) shrinks both
 *   proportionally and re-solves, `'skip'` leaves them alone, `'error'` throws.
 *   `verify` (default `'auto'`) re-probes the result for self-intersection the input did
 *   not have, dropping the greediest corners until it is clean; `'auto'` skips the probe
 *   when the input already self-intersects, since then it proves nothing.
 * @returns {object} Path
 */
export function filletPath(pth, opts = {}) {
  // Tagged at the path level: a corner treatment does not only create the arc, it also
  // *alters* the two neighbours it trims back, and `outAttrs` covers both per its
  // contract ("geometry you create or alter").
  return tagOutputPath(verified('fillet', pth, opts, opts.radius).result, opts.outAttrs);
}

/**
 * Cut every selected corner of a path with a straight bridge. Same options as
 * `filletPath`, except the amount is given by `chamfer` (or `distance`): a number (equal
 * setback on both sides), `{distance}`, `{distances:[dA,dB]}`, `{radius}` (cut where the
 * equivalent fillet would have), or a function of the corner returning one of those.
 * @param {object} pth  Path
 * @param {object} [opts]
 * @returns {object} Path
 */
export function chamferPath(pth, opts = {}) {
  return tagOutputPath(
    verified('chamfer', pth, opts, opts.chamfer ?? opts.distance).result,
    opts.outAttrs,
  );
}
