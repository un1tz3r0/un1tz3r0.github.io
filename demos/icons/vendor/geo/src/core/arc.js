// Elliptical-arc kernel operations.
//
// Arcs are stored in SVG endpoint parameterization (see segment.js). The math here works
// in the derived *center* parameterization {cx, cy, rx, ry, phi, theta1, dtheta}; the
// conversion follows the SVG implementation notes (F.6.5), including out-of-range radius
// correction. We keep arcs exact rather than approximating them with Béziers.

import { vec2 } from './vec2.js';
import { arc } from './segment.js';

// Signed angle from vector u to vector v, in (−π, π].
function angleBetween(ux, uy, vx, vy) {
  const d = ux * vx + uy * vy;
  const l = Math.hypot(ux, uy) * Math.hypot(vx, vy);
  let c = l === 0 ? 1 : d / l;
  c = Math.min(1, Math.max(-1, c));
  let ang = Math.acos(c);
  if (ux * vy - uy * vx < 0) ang = -ang;
  return ang;
}

/**
 * Convert an arc segment to center parameterization.
 * @returns {{cx:number,cy:number,rx:number,ry:number,phi:number,theta1:number,dtheta:number}}
 */
export function arcCenter(seg) {
  const { p0, p1, xAxisRotation: phi, largeArc, sweep } = seg;
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);

  const dx = (p0.x - p1.x) / 2;
  const dy = (p0.y - p1.y) / 2;
  const x1p = cosP * dx + sinP * dy;
  const y1p = -sinP * dx + cosP * dy;

  let rx = Math.abs(seg.rx);
  let ry = Math.abs(seg.ry);
  // Scale up radii if they are too small to span the endpoints.
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const s = Math.sqrt(lambda);
    rx *= s;
    ry *= s;
  }

  const rx2 = rx * rx;
  const ry2 = ry * ry;
  const x1p2 = x1p * x1p;
  const y1p2 = y1p * y1p;
  const num = rx2 * ry2 - rx2 * y1p2 - ry2 * x1p2;
  const den = rx2 * y1p2 + ry2 * x1p2;
  let coef = Math.sqrt(Math.max(0, den === 0 ? 0 : num / den));
  if (largeArc === sweep) coef = -coef;

  const cxp = (coef * (rx * y1p)) / ry;
  const cyp = (coef * (-ry * x1p)) / rx;
  const cx = cosP * cxp - sinP * cyp + (p0.x + p1.x) / 2;
  const cy = sinP * cxp + cosP * cyp + (p0.y + p1.y) / 2;

  const ux = (x1p - cxp) / rx;
  const uy = (y1p - cyp) / ry;
  const vx = (-x1p - cxp) / rx;
  const vy = (-y1p - cyp) / ry;
  const theta1 = angleBetween(1, 0, ux, uy);
  let dtheta = angleBetween(ux, uy, vx, vy);
  if (!sweep && dtheta > 0) dtheta -= 2 * Math.PI;
  else if (sweep && dtheta < 0) dtheta += 2 * Math.PI;

  return { cx, cy, rx, ry, phi, theta1, dtheta };
}

// Ellipse point at absolute angle theta.
function pointAtAngle(c, theta) {
  const cosP = Math.cos(c.phi);
  const sinP = Math.sin(c.phi);
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  return vec2(
    c.cx + c.rx * ct * cosP - c.ry * st * sinP,
    c.cy + c.rx * ct * sinP + c.ry * st * cosP,
  );
}

// Is absolute angle theta within the arc's swept range?
function angleInArc(c, theta) {
  let delta = theta - c.theta1;
  const TAU = 2 * Math.PI;
  if (c.dtheta >= 0) {
    delta -= TAU * Math.floor(delta / TAU); // → [0, TAU)
    return delta <= c.dtheta + 1e-12;
  }
  delta -= TAU * Math.ceil(delta / TAU); // → (−TAU, 0]
  return delta >= c.dtheta - 1e-12;
}

/** Point at parameter t ∈ [0,1]. */
export function pointAt(seg, t) {
  const c = arcCenter(seg);
  return pointAtAngle(c, c.theta1 + t * c.dtheta);
}

/** First derivative with respect to t. */
export function derivativeAt(seg, t) {
  const c = arcCenter(seg);
  const theta = c.theta1 + t * c.dtheta;
  const cosP = Math.cos(c.phi);
  const sinP = Math.sin(c.phi);
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const dxdθ = -c.rx * st * cosP - c.ry * ct * sinP;
  const dydθ = -c.rx * st * sinP + c.ry * ct * cosP;
  return vec2(dxdθ * c.dtheta, dydθ * c.dtheta);
}

/** Second derivative with respect to t: d²P/dθ² · dθ² (dθ constant in t). */
export function derivative2At(seg, t) {
  const c = arcCenter(seg);
  const theta = c.theta1 + t * c.dtheta;
  const cosP = Math.cos(c.phi);
  const sinP = Math.sin(c.phi);
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  // d²/dθ² of (rx cosθ, ry sinθ) rotated by phi: (−rx cosθ, −ry sinθ) rotated by phi.
  const d2xdθ2 = -c.rx * ct * cosP + c.ry * st * sinP;
  const d2ydθ2 = -c.rx * ct * sinP - c.ry * st * cosP;
  return vec2(d2xdθ2 * c.dtheta * c.dtheta, d2ydθ2 * c.dtheta * c.dtheta);
}

/** Exact axis-aligned bounding box (endpoints + angular extrema within the sweep). */
export function boundingBox(seg) {
  const c = arcCenter(seg);
  let minX = Math.min(seg.p0.x, seg.p1.x);
  let maxX = Math.max(seg.p0.x, seg.p1.x);
  let minY = Math.min(seg.p0.y, seg.p1.y);
  let maxY = Math.max(seg.p0.y, seg.p1.y);
  const cosP = Math.cos(c.phi);
  const sinP = Math.sin(c.phi);

  // dX/dθ = 0  →  tanθ = −(ry·sinφ)/(rx·cosφ)
  const thetaX = Math.atan2(-c.ry * sinP, c.rx * cosP);
  // dY/dθ = 0  →  tanθ =  (ry·cosφ)/(rx·sinφ)
  const thetaY = Math.atan2(c.ry * cosP, c.rx * sinP);

  for (const th of [thetaX, thetaX + Math.PI]) {
    if (angleInArc(c, th)) {
      const p = pointAtAngle(c, th);
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
    }
  }
  for (const th of [thetaY, thetaY + Math.PI]) {
    if (angleInArc(c, th)) {
      const p = pointAtAngle(c, th);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
  }
  return { minX, minY, maxX, maxY };
}

/**
 * Split into two arcs at parameter t. Sub-arcs share the (possibly corrected) radii and
 * rotation; the largeArc flag is recomputed from each swept angle, sweep is preserved.
 */
export function splitAt(seg, t) {
  const c = arcCenter(seg);
  const mid = pointAtAngle(c, c.theta1 + t * c.dtheta);
  const leftLarge = Math.abs(c.dtheta * t) > Math.PI;
  const rightLarge = Math.abs(c.dtheta * (1 - t)) > Math.PI;
  return [
    arc(seg.p0, mid, c.rx, c.ry, seg.xAxisRotation, leftLarge, seg.sweep),
    arc(mid, seg.p1, c.rx, c.ry, seg.xAxisRotation, rightLarge, seg.sweep),
  ];
}

/**
 * The arc over an arbitrary parameter range, including parameters outside [0, 1] —
 * the same sweep extended (or reversed). The center form makes this a pure angle
 * remap: θ(t) = θ₁ + t·Δθ.
 *
 * A sweep of 2π or more cannot be expressed in SVG's endpoint parameterization (the
 * endpoints would coincide, leaving the arc ambiguous), so that throws rather than
 * silently returning a wrong arc.
 */
export function subsegment(seg, t0, t1) {
  const c = arcCenter(seg);
  const theta0 = c.theta1 + t0 * c.dtheta;
  const dtheta = (t1 - t0) * c.dtheta;
  const TAU = 2 * Math.PI;
  if (Math.abs(dtheta) >= TAU - 1e-12) {
    throw new RangeError(
      `arc.subsegment: sweep ${dtheta} rad cannot be represented as a single SVG arc (|sweep| must be < 2π)`,
    );
  }
  const p0 = pointAtAngle(c, theta0);
  const p1 = pointAtAngle(c, theta0 + dtheta);
  return arc(
    p0,
    p1,
    c.rx,
    c.ry,
    c.phi,
    Math.abs(dtheta) > Math.PI,
    dtheta > 0,
  );
}
