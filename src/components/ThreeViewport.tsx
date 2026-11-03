import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GeometryModel, SelectedElement, Vertex3D } from '../types/geometry';
import { computeEdgeVisibilities } from '../utils/hiddenLineDetector';

export type ViewMode = 'solid' | 'wireframe' | 'technical';
export type CameraPreset = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'iso';

interface ThreeViewportProps {
  model: GeometryModel;
  params: Record<string, number>;
  viewMode: ViewMode;
  hiddenLineMode: boolean; // True: hidden edges are dashed
  showLabels: boolean;
  showRightAngles: boolean;
  autoRotate: boolean;
  onSelectElement: (elem: SelectedElement) => void;
  selectedElement: SelectedElement;
  canvasRefCallback?: (canvas: HTMLCanvasElement | null) => void;
  examExportMode?: boolean; // When true, white background and black lines
}

export const ThreeViewport: React.FC<ThreeViewportProps> = ({
  model,
  params,
  viewMode,
  hiddenLineMode,
  showLabels,
  showRightAngles,
  autoRotate,
  onSelectElement,
  selectedElement,
  canvasRefCallback,
  examExportMode = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // References for Three.js instance
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const linesGroupRef = useRef<THREE.Group | null>(null);
  const facesGroupRef = useRef<THREE.Group | null>(null);
  const verticesGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);

  // Screen-projected vertex labels
  const [projectedLabels, setProjectedLabels] = useState<
    { id: string; name: string; x: number; y: number; color?: string }[]
  >([]);

  // Update label screen projections
  const updateScreenLabels = useCallback(() => {
    if (!showLabels || !cameraRef.current || !containerRef.current) {
      setProjectedLabels([]);
      return;
    }

    const { vertices } = model.generateGeometry(params);
    const camera = cameraRef.current;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const labels: { id: string; name: string; x: number; y: number; color?: string }[] = [];

    // Calculate centroid for smart outward label offsetting
    const centroid = new THREE.Vector3();
    for (const v of vertices) {
      centroid.add(new THREE.Vector3(...v.pos));
    }
    if (vertices.length > 0) centroid.divideScalar(vertices.length);

    for (const v of vertices) {
      if (!v.name) continue;
      const vWorld = new THREE.Vector3(...v.pos);
      if (modelGroupRef.current) {
        vWorld.applyMatrix4(modelGroupRef.current.matrixWorld);
      }

      // Small outward offset from centroid to prevent label overlapping the vertex
      const offsetDir = new THREE.Vector3().subVectors(vWorld, centroid).normalize();
      const labelWorld = vWorld.clone().add(offsetDir.multiplyScalar(0.25));

      const screenPos = labelWorld.clone().project(camera);

      // Check if inside camera view frustum
      if (screenPos.z < 1) {
        const x = ((screenPos.x + 1) * width) / 2;
        const y = ((-screenPos.y + 1) * height) / 2;
        labels.push({
          id: v.id,
          name: v.name,
          x,
          y,
          color: v.color,
        });
      }
    }

    setProjectedLabels(labels);
  }, [model, params, showLabels]);

  // Dynamic lines rebuild (solid vs dashed)
  const rebuildDynamicEdges = useCallback(() => {
    if (!linesGroupRef.current || !cameraRef.current) return;
    const linesGroup = linesGroupRef.current;

    // Dispose old lines
    while (linesGroup.children.length > 0) {
      const obj = linesGroup.children[0] as THREE.Line;
      if (obj.geometry) obj.geometry.dispose();
      linesGroup.remove(obj);
    }

    const { vertices, edges, faces } = model.generateGeometry(params);
    const cameraPos = cameraRef.current.position;
    const modelMatrix = modelGroupRef.current ? modelGroupRef.current.matrixWorld : new THREE.Matrix4();

    const evaluatedEdges = computeEdgeVisibilities(
      vertices,
      edges,
      faces,
      cameraPos,
      modelMatrix
    );

    const isTech = viewMode === 'technical' || examExportMode;

    for (const edge of evaluatedEdges) {
      const p1 = new THREE.Vector3(...edge.v1);
      const p2 = new THREE.Vector3(...edge.v2);

      const isSelected = selectedElement.type === 'edge' && selectedElement.id === edge.id;

      // Determine visibility
      // If hiddenLineMode is false, all polyhedral edges are rendered solid
      const isVisible = !hiddenLineMode ? true : edge.isVisible;

      const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);

      let color = isTech ? 0x0f172a : (edge.isAxis ? 0xef4444 : (edge.isHeight ? 0xf43f5e : 0x64748b));
      if (isSelected) color = 0xf59e0b; // Bright amber for selected edge

      if (isVisible) {
        const mat = new THREE.LineBasicMaterial({
          color,
          linewidth: isSelected ? 3 : 2,
        });
        const line = new THREE.Line(geometry, mat);
        line.userData = { type: 'edge', id: edge.id, name: edge.name, p1: edge.v1, p2: edge.v2 };
        linesGroup.add(line);
      } else {
        // Dashed hidden line
        const dashedMat = new THREE.LineDashedMaterial({
          color: isTech ? 0x64748b : 0x94a3b8,
          linewidth: 1.5,
          dashSize: 0.22,
          gapSize: 0.14,
        });
        const line = new THREE.LineSegments(geometry, dashedMat);
        line.computeLineDistances();
        line.userData = { type: 'edge', id: edge.id, name: edge.name, p1: edge.v1, p2: edge.v2 };
        linesGroup.add(line);
      }
    }
  }, [model, params, hiddenLineMode, viewMode, selectedElement, examExportMode]);

  // Main Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(6, 5, 7);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // Needed for high-res PNG export
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    canvasRef.current = renderer.domElement;
    if (canvasRefCallback) {
      canvasRefCallback(renderer.domElement);
    }
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Environment & Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3-point Studio Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    fillLight.position.set(-8, -4, -6);
    scene.add(fillLight);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;
    controls.minDistance = 2;
    controls.maxDistance = 25;
    controlsRef.current = controls;

    // Scene Groups
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    const facesGroup = new THREE.Group();
    modelGroup.add(facesGroup);
    facesGroupRef.current = facesGroup;

    const linesGroup = new THREE.Group();
    modelGroup.add(linesGroup);
    linesGroupRef.current = linesGroup;

    const verticesGroup = new THREE.Group();
    modelGroup.add(verticesGroup);
    verticesGroupRef.current = verticesGroup;

    const markersGroup = new THREE.Group();
    modelGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Soft ground plane contact shadow
    const shadowGeo = new THREE.PlaneGeometry(16, 16);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -3;
    scene.add(shadowMesh);

    // Animation Loop
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 1.8;
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }

      controls.update();
      renderer.render(scene, camera);
      updateScreenLabels();
    };
    animate();

    // Recompute hidden lines whenever controls rotate
    controls.addEventListener('change', () => {
      rebuildDynamicEdges();
      updateScreenLabels();
    });

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updateScreenLabels();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Update Scene when Model, Params, or ViewMode change
  useEffect(() => {
    if (!facesGroupRef.current || !verticesGroupRef.current || !markersGroupRef.current) return;

    const facesGroup = facesGroupRef.current;
    const verticesGroup = verticesGroupRef.current;
    const markersGroup = markersGroupRef.current;

    // Clear old meshes
    while (facesGroup.children.length > 0) {
      const obj = facesGroup.children[0] as THREE.Mesh;
      if (obj.geometry) obj.geometry.dispose();
      facesGroup.remove(obj);
    }
    while (verticesGroup.children.length > 0) {
      const obj = verticesGroup.children[0] as THREE.Mesh;
      if (obj.geometry) obj.geometry.dispose();
      verticesGroup.remove(obj);
    }
    while (markersGroup.children.length > 0) {
      const obj = markersGroup.children[0] as THREE.Line;
      if (obj.geometry) obj.geometry.dispose();
      markersGroup.remove(obj);
    }

    const { vertices, faces, rightAngleMarkers } = model.generateGeometry(params);

    const isWire = viewMode === 'wireframe';
    const isTech = viewMode === 'technical' || examExportMode;

    // Build Faces
    if (!isWire) {
      const vertMap = new Map<string, THREE.Vector3>();
      for (const v of vertices) {
        vertMap.set(v.id, new THREE.Vector3(...v.pos));
      }

      for (const face of faces) {
        if (face.vertexIds.length < 3) continue;

        // Triangulate n-gon face fan
        const points = face.vertexIds.map((id) => vertMap.get(id)).filter(Boolean) as THREE.Vector3[];
        if (points.length < 3) continue;

        const triPositions: number[] = [];
        for (let i = 1; i < points.length - 1; i++) {
          triPositions.push(
            points[0].x, points[0].y, points[0].z,
            points[i].x, points[i].y, points[i].z,
            points[i + 1].x, points[i + 1].y, points[i + 1].z
          );
        }

        const faceGeo = new THREE.BufferGeometry();
        faceGeo.setAttribute('position', new THREE.Float32BufferAttribute(triPositions, 3));
        faceGeo.computeVertexNormals();

        const isFaceSelected = selectedElement.type === 'face' && selectedElement.id === face.id;

        let faceColor = face.color || '#3b82f6';
        let opacity = isTech ? 0.35 : (face.opacity ?? 0.7);
        if (isFaceSelected) {
          faceColor = '#f59e0b';
          opacity = 0.85;
        }

        const faceMat = new THREE.MeshStandardMaterial({
          color: isTech ? 0xffffff : faceColor,
          roughness: 0.35,
          metalness: 0.1,
          transparent: true,
          opacity,
          side: THREE.DoubleSide,
          depthWrite: false, // Prevents z-fighting with edges
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        });

        const faceMesh = new THREE.Mesh(faceGeo, faceMat);
        faceMesh.userData = { type: 'face', id: face.id, name: face.name, vertexIds: face.vertexIds };
        facesGroup.add(faceMesh);
      }
    }

    // Build Vertex Spheres - Visually hidden to keep 3D models pristine, clean and free of cluttering dots
    // Data, positions, and coordinates are 100% preserved for mathematical calculations and raycasting.
    // If a vertex is explicitly selected, an amber highlight marker (0xf59e0b) appears.
    // All unselected vertices (including curve, edge and circle sampling points) remain completely invisible.
    const vertSphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
    for (const v of vertices) {
      const isVertSelected = selectedElement.type === 'vertex' && selectedElement.id === v.id;

      const vertMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: isVertSelected ? 1 : 0,
        colorWrite: isVertSelected,
      });

      const sphere = new THREE.Mesh(vertSphereGeo, vertMat);
      sphere.position.set(...v.pos);
      sphere.userData = { type: 'vertex', id: v.id, name: v.name, pos: v.pos };

      // Sampling points on curves, edges and circles without names are not raycast targets
      if (!v.name && !isVertSelected) {
        sphere.raycast = () => {};
      }

      verticesGroup.add(sphere);
    }

    // Build Right-Angle Markers
    if (showRightAngles && rightAngleMarkers) {
      for (const m of rightAngleMarkers) {
        const s = m.size || 0.3;
        const v = new THREE.Vector3(...m.vertex);
        const d1 = new THREE.Vector3(...m.dir1).normalize().multiplyScalar(s);
        const d2 = new THREE.Vector3(...m.dir2).normalize().multiplyScalar(s);

        const p1 = v.clone().add(d1);
        const p2 = v.clone().add(d1).add(d2);
        const p3 = v.clone().add(d2);

        const cornerGeo = new THREE.BufferGeometry().setFromPoints([p1, p2, p3]);
        const cornerMat = new THREE.LineBasicMaterial({
          color: isTech ? 0x0f172a : 0xef4444,
          linewidth: 2,
        });
        const cornerLine = new THREE.Line(cornerGeo, cornerMat);
        markersGroup.add(cornerLine);
      }
    }

    rebuildDynamicEdges();
    updateScreenLabels();
  }, [model, params, viewMode, showRightAngles, selectedElement, examExportMode]);

  // Click & Raycasting Selection
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rendererRef.current || !cameraRef.current || !modelGroupRef.current) return;
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.params.Line = { threshold: 0.15 };
    raycaster.params.Points = { threshold: 0.2 };
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    // Prioritize vertices, then lines, then faces
    if (verticesGroupRef.current) {
      const vIntersects = raycaster.intersectObjects(verticesGroupRef.current.children);
      if (vIntersects.length > 0) {
        const data = vIntersects[0].object.userData;
        onSelectElement({
          type: 'vertex',
          id: data.id,
          name: data.name || data.id,
          details: {
            'Tọa độ X': Number(data.pos[0].toFixed(2)),
            'Tọa độ Y': Number(data.pos[1].toFixed(2)),
            'Tọa độ Z': Number(data.pos[2].toFixed(2)),
          },
        });
        return;
      }
    }

    if (linesGroupRef.current) {
      const lIntersects = raycaster.intersectObjects(linesGroupRef.current.children);
      if (lIntersects.length > 0) {
        const data = lIntersects[0].object.userData;
        const p1 = new THREE.Vector3(...data.p1);
        const p2 = new THREE.Vector3(...data.p2);
        const length = p1.distanceTo(p2);
        onSelectElement({
          type: 'edge',
          id: data.id,
          name: data.name || data.id,
          details: {
            'Độ dài đoạn thẳng': Number(length.toFixed(2)),
            'Điểm đầu': `(${data.p1.map((n: number) => n.toFixed(1)).join(', ')})`,
            'Điểm cuối': `(${data.p2.map((n: number) => n.toFixed(1)).join(', ')})`,
          },
        });
        return;
      }
    }

    if (facesGroupRef.current) {
      const fIntersects = raycaster.intersectObjects(facesGroupRef.current.children);
      if (fIntersects.length > 0) {
        const data = fIntersects[0].object.userData;
        onSelectElement({
          type: 'face',
          id: data.id,
          name: data.name || data.id,
          details: {
            'Các đỉnh tạo mặt': data.vertexIds.join(', '),
          },
        });
        return;
      }
    }

    // If clicked empty space, deselect
    onSelectElement({ type: 'none' });
  };

  // Camera presets
  const setCameraPreset = (preset: CameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const dist = 9;

    switch (preset) {
      case 'front':
        camera.position.set(0, 0, dist);
        break;
      case 'back':
        camera.position.set(0, 0, -dist);
        break;
      case 'left':
        camera.position.set(-dist, 0, 0);
        break;
      case 'right':
        camera.position.set(dist, 0, 0);
        break;
      case 'top':
        camera.position.set(0, dist, 0.001);
        break;
      case 'bottom':
        camera.position.set(0, -dist, 0.001);
        break;
      case 'iso':
      default:
        camera.position.set(6, 5, 7);
        break;
    }
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    rebuildDynamicEdges();
    updateScreenLabels();
  };

  // Expose reset / presets to parent if needed
  useEffect(() => {
    (window as any).__set3DCameraPreset = setCameraPreset;
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none ${
        examExportMode ? 'bg-white' : 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950'
      }`}
    >
      {/* Projected Vertex Labels (HTML Overlay) */}
      {showLabels &&
        projectedLabels.map((lbl) => {
          const isSelected = selectedElement.type === 'vertex' && selectedElement.id === lbl.id;
          return (
            <div
              key={lbl.id}
              style={{
                transform: `translate(${lbl.x}px, ${lbl.y}px) translate(-50%, -50%)`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectElement({
                  type: 'vertex',
                  id: lbl.id,
                  name: lbl.name,
                });
              }}
              className={`absolute pointer-events-auto cursor-pointer transition-transform duration-100 px-1.5 py-0.5 rounded text-xs font-bold font-mono shadow-sm ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 scale-125 ring-2 ring-amber-300'
                  : examExportMode
                  ? 'bg-white text-slate-900 border border-slate-300'
                  : 'bg-slate-900/80 backdrop-blur-sm text-slate-100 border border-slate-700/60 hover:scale-110'
              }`}
            >
              {lbl.name}
            </div>
          );
        })}
    </div>
  );
};
