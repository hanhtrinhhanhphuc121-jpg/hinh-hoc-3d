import * as THREE from 'three';

export interface OxyzPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  color?: string;
}

export interface OxyzVector {
  id: string;
  name: string;
  origin: [number, number, number];
  dir: [number, number, number]; // (x, y, z)
  color: string;
}

export interface PlaneCoeffs {
  a: number;
  b: number;
  c: number;
  d: number; // Ax + By + Cz + D = 0
  normal: [number, number, number];
}

/**
 * Computes vector AB = B - A and its length
 */
export function computeVectorBetweenPoints(a: OxyzPoint, b: OxyzPoint) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  const length = Math.hypot(dx, dy, dz);
  return {
    coords: [dx, dy, dz] as [number, number, number],
    length,
    latex: `\\vec{${a.name}${b.name}} = (${dx.toFixed(2)}, \\ ${dy.toFixed(2)}, \\ ${dz.toFixed(2)}), \\ |\\vec{${a.name}${b.name}}| = ${length.toFixed(2)}`,
  };
}

/**
 * Computes dot product and angle between two vectors
 */
export function computeDotProduct(u: [number, number, number], v: [number, number, number]) {
  const dot = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const lenU = Math.hypot(...u);
  const lenV = Math.hypot(...v);
  const cosTheta = lenU > 0 && lenV > 0 ? dot / (lenU * lenV) : 0;
  const clampedCos = Math.max(-1, Math.min(1, cosTheta));
  const angleRad = Math.acos(clampedCos);
  const angleDeg = (angleRad * 180) / Math.PI;

  return {
    dot,
    cosTheta,
    angleDeg,
    latex: `\\vec{u} \\cdot \\vec{v} = ${dot.toFixed(2)}, \\ \\cos(\\vec{u}, \\vec{v}) = ${cosTheta.toFixed(3)} \\implies \\theta \\approx ${angleDeg.toFixed(1)}^\\circ`,
  };
}

/**
 * Computes cross product [u, v]
 */
export function computeCrossProduct(u: [number, number, number], v: [number, number, number]): [number, number, number] {
  return [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
}

/**
 * Computes plane equation Ax + By + Cz + D = 0 passing through 3 non-collinear points A, B, C
 */
export function computePlaneFrom3Points(a: OxyzPoint, b: OxyzPoint, c: OxyzPoint): PlaneCoeffs | null {
  const ab: [number, number, number] = [b.x - a.x, b.y - a.y, b.z - a.z];
  const ac: [number, number, number] = [c.x - a.x, c.y - a.y, c.z - a.z];

  const normal = computeCrossProduct(ab, ac);
  const normLen = Math.hypot(...normal);
  if (normLen < 1e-5) return null; // 3 points are collinear

  const A = normal[0];
  const B = normal[1];
  const C = normal[2];
  const D = -(A * a.x + B * a.y + C * a.z);

  return {
    a: A,
    b: B,
    c: C,
    d: D,
    normal: [A, B, C],
  };
}

/**
 * Computes distance from point M to plane Ax + By + Cz + D = 0
 */
export function computeDistancePointToPlane(m: OxyzPoint, plane: PlaneCoeffs): number {
  const numerator = Math.abs(plane.a * m.x + plane.b * m.y + plane.c * m.z + plane.d);
  const denominator = Math.hypot(plane.a, plane.b, plane.c);
  return denominator > 0 ? numerator / denominator : 0;
}
