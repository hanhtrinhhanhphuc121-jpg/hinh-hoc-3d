import * as THREE from 'three';
import { Edge3D, Face3D, Vertex3D } from '../types/geometry';

export interface EvaluatedEdge {
  id: string;
  v1: [number, number, number];
  v2: [number, number, number];
  isVisible: boolean; // true = solid line, false = dashed line
  name?: string;
  isHeight?: boolean;
  isAxis?: boolean;
}

/**
 * Computes whether each edge is visible (solid) or occluded/hidden (dashed)
 * based on the current camera position and model orientation.
 */
export function computeEdgeVisibilities(
  vertices: Vertex3D[],
  edges: Edge3D[],
  faces: Face3D[],
  cameraPosition: THREE.Vector3,
  modelMatrix: THREE.Matrix4 = new THREE.Matrix4()
): EvaluatedEdge[] {
  // Map vertices by ID for quick lookup
  const vertMap = new Map<string, THREE.Vector3>();
  for (const v of vertices) {
    const vec = new THREE.Vector3(...v.pos).applyMatrix4(modelMatrix);
    vertMap.set(v.id, vec);
  }

  // Precompute face normals and front-facing status in world space
  interface FaceInfo {
    normal: THREE.Vector3;
    centroid: THREE.Vector3;
    isFrontFacing: boolean;
  }

  const faceInfoMap = new Map<string, FaceInfo>();
  const edgeToFacesMap = new Map<string, string[]>();

  for (const face of faces) {
    if (face.vertexIds.length < 3) continue;
    const p0 = vertMap.get(face.vertexIds[0]);
    const p1 = vertMap.get(face.vertexIds[1]);
    const p2 = vertMap.get(face.vertexIds[2]);

    if (!p0 || !p1 || !p2) continue;

    // Normal using Newell's method or cross product
    const vA = new THREE.Vector3().subVectors(p1, p0);
    const vB = new THREE.Vector3().subVectors(p2, p0);
    const normal = new THREE.Vector3().crossVectors(vA, vB).normalize();

    // Centroid of the face
    const centroid = new THREE.Vector3();
    for (const vId of face.vertexIds) {
      const pt = vertMap.get(vId);
      if (pt) centroid.add(pt);
    }
    centroid.divideScalar(face.vertexIds.length);

    // Vector from centroid to camera
    const toCamera = new THREE.Vector3().subVectors(cameraPosition, centroid).normalize();
    const dot = normal.dot(toCamera);
    // Face is front facing if dot > 0.02 (small epsilon for numerical stability)
    const isFrontFacing = dot > 0.01;

    faceInfoMap.set(face.id, { normal, centroid, isFrontFacing });

    // Associate edge with faces
    for (let i = 0; i < face.vertexIds.length; i++) {
      const u1 = face.vertexIds[i];
      const u2 = face.vertexIds[(i + 1) % face.vertexIds.length];
      const key1 = `${u1}_${u2}`;
      const key2 = `${u2}_${u1}`;
      
      const list1 = edgeToFacesMap.get(key1) || [];
      list1.push(face.id);
      edgeToFacesMap.set(key1, list1);

      const list2 = edgeToFacesMap.get(key2) || [];
      list2.push(face.id);
      edgeToFacesMap.set(key2, list2);
    }
  }

  const evaluatedEdges: EvaluatedEdge[] = [];

  for (const edge of edges) {
    const p1 = vertMap.get(edge.v1);
    const p2 = vertMap.get(edge.v2);
    if (!p1 || !p2) continue;

    const originalV1 = vertices.find(v => v.id === edge.v1)?.pos || [p1.x, p1.y, p1.z];
    const originalV2 = vertices.find(v => v.id === edge.v2)?.pos || [p2.x, p2.y, p2.z];

    // If it's explicitly marked as an internal height or axis line:
    if (edge.isHeight) {
      // Internal height line inside a solid is generally dashed unless viewed in wireframe
      evaluatedEdges.push({
        id: edge.id,
        v1: originalV1,
        v2: originalV2,
        isVisible: false, // Internal dashed line
        name: edge.name,
        isHeight: true,
      });
      continue;
    }

    if (edge.isAxis) {
      // Axis lines are visible
      evaluatedEdges.push({
        id: edge.id,
        v1: originalV1,
        v2: originalV2,
        isVisible: true,
        name: edge.name,
        isAxis: true,
      });
      continue;
    }

    // Look up incident faces for this edge
    const key = `${edge.v1}_${edge.v2}`;
    const incidentFaceIds = edgeToFacesMap.get(key) || [];

    let isVisible = true;

    if (incidentFaceIds.length > 0) {
      // If ANY incident face is front-facing, is this edge on the front or silhouette?
      let frontCount = 0;
      let backCount = 0;

      for (const fId of incidentFaceIds) {
        const info = faceInfoMap.get(fId);
        if (info) {
          if (info.isFrontFacing) frontCount++;
          else backCount++;
        }
      }

      if (frontCount === 0 && backCount > 0) {
        // Both (or all) incident faces are back-facing => strictly hidden from camera!
        isVisible = false;
      } else {
        // At least one incident face is front facing => it's visible on silhouette or front!
        isVisible = true;
      }
    } else {
      // Non-polyhedral or stand-alone edge
      isVisible = true;
    }

    evaluatedEdges.push({
      id: edge.id,
      v1: originalV1,
      v2: originalV2,
      isVisible,
      name: edge.name,
    });
  }

  return evaluatedEdges;
}
