import * as THREE from 'three';
import { GeometryModel } from '../types/geometry';

export interface PlaneEquation {
  a: number;
  b: number;
  c: number;
  d: number; // ax + by + cz + d = 0
}

export interface CrossSectionResult {
  points: THREE.Vector3[]; // Ordered vertices of the cross-section polygon
  area: number;
  shapeName: string;
  hasIntersection: boolean;
}

/**
 * Calculates distance from point (x, y, z) to plane ax + by + cz + d = 0
 */
export function pointPlaneDistance(p: THREE.Vector3, plane: PlaneEquation): number {
  return plane.a * p.x + plane.b * p.y + plane.c * p.z + plane.d;
}

/**
 * Intersects an edge segment [p1, p2] with plane ax + by + cz + d = 0
 */
export function intersectSegmentWithPlane(
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  plane: PlaneEquation
): THREE.Vector3 | null {
  const d1 = pointPlaneDistance(p1, plane);
  const d2 = pointPlaneDistance(p2, plane);

  // If both points lie on the same side of the plane with no crossing
  if ((d1 > 1e-6 && d2 > 1e-6) || (d1 < -1e-6 && d2 < -1e-6)) {
    return null;
  }

  // Exact endpoint hits
  if (Math.abs(d1) <= 1e-6) return p1.clone();
  if (Math.abs(d2) <= 1e-6) return p2.clone();

  // Linear interpolation parameter t in [0, 1]
  const t = d1 / (d1 - d2);
  if (t < -1e-6 || t > 1 + 1e-6) return null;

  const clampedT = Math.max(0, Math.min(1, t));
  return new THREE.Vector3(
    p1.x + clampedT * (p2.x - p1.x),
    p1.y + clampedT * (p2.y - p1.y),
    p1.z + clampedT * (p2.z - p1.z)
  );
}

/**
 * Orders a set of coplanar 3D points into a counter-clockwise polygon using plane normal
 */
export function orderPolygonPoints(points: THREE.Vector3[], normal: THREE.Vector3): THREE.Vector3[] {
  if (points.length <= 2) return points;

  // 1. Remove duplicate points within tolerance
  const uniquePoints: THREE.Vector3[] = [];
  for (const pt of points) {
    const isDup = uniquePoints.some((u) => u.distanceTo(pt) < 1e-3);
    if (!isDup) uniquePoints.push(pt);
  }

  if (uniquePoints.length <= 2) return uniquePoints;

  // 2. Compute center of mass of the points
  const center = new THREE.Vector3();
  uniquePoints.forEach((p) => center.add(p));
  center.divideScalar(uniquePoints.length);

  // 3. Create an orthonormal basis on the plane: u and v
  const n = normal.clone().normalize();
  let refVec = Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(n, refVec).normalize();
  const v = new THREE.Vector3().crossVectors(n, u).normalize();

  // 4. Sort points by polar angle in the plane (atan2)
  const sorted = [...uniquePoints].sort((a, b) => {
    const da = new THREE.Vector3().subVectors(a, center);
    const db = new THREE.Vector3().subVectors(b, center);
    const angleA = Math.atan2(da.dot(v), da.dot(u));
    const angleB = Math.atan2(db.dot(v), db.dot(u));
    return angleA - angleB;
  });

  return sorted;
}

/**
 * Computes polygon area using 3D cross product sum
 */
export function computePolygonArea(orderedPoints: THREE.Vector3[]): number {
  if (orderedPoints.length < 3) return 0;
  const areaVec = new THREE.Vector3();
  const n = orderedPoints.length;

  for (let i = 0; i < n; i++) {
    const current = orderedPoints[i];
    const next = orderedPoints[(i + 1) % n];
    const cross = new THREE.Vector3().crossVectors(current, next);
    areaVec.add(cross);
  }

  return 0.5 * areaVec.length();
}

/**
 * Determines Vietnamese name for cross section polygon by number of vertices
 */
export function getSectionShapeName(vertexCount: number): string {
  switch (vertexCount) {
    case 0:
    case 1:
    case 2:
      return 'Không cắt qua khối (hoặc chỉ tiếp xúc tại điểm/cạnh)';
    case 3:
      return 'Tam giác';
    case 4:
      return 'Tứ giác (hình bình hành, hình thang, chữ nhật hoặc tứ giác lồi)';
    case 5:
      return 'Ngũ giác lồi';
    case 6:
      return 'Lục giác lồi';
    case 7:
      return 'Thất giác';
    case 8:
      return 'Bát giác';
    default:
      return `Đa giác ${vertexCount} cạnh`;
  }
}

/**
 * Calculates cross section of a polyhedron with a plane
 */
export function computePolyhedronCrossSection(
  vertices: { id: string; pos: [number, number, number] }[],
  edges: { v1: string; v2: string }[],
  plane: PlaneEquation
): CrossSectionResult {
  const vertMap = new Map<string, THREE.Vector3>();
  vertices.forEach((v) => vertMap.set(v.id, new THREE.Vector3(...v.pos)));

  const normal = new THREE.Vector3(plane.a, plane.b, plane.c).normalize();
  const intersectionPoints: THREE.Vector3[] = [];

  for (const edge of edges) {
    const p1 = vertMap.get(edge.v1);
    const p2 = vertMap.get(edge.v2);
    if (!p1 || !p2) continue;

    const hit = intersectSegmentWithPlane(p1, p2, plane);
    if (hit) {
      intersectionPoints.push(hit);
    }
  }

  const ordered = orderPolygonPoints(intersectionPoints, normal);
  const area = computePolygonArea(ordered);
  const shapeName = getSectionShapeName(ordered.length);

  return {
    points: ordered,
    area,
    shapeName,
    hasIntersection: ordered.length >= 3,
  };
}
