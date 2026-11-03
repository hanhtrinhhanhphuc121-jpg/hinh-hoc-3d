import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  X,
  Scissors,
  Layers,
  RotateCcw,
  Eye,
  CheckCircle,
  HelpCircle,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { GeometryModel } from '../types/geometry';
import {
  PlaneEquation,
  computePolyhedronCrossSection,
  CrossSectionResult,
} from '../utils/crossSectionMath';
import { KaTeX } from '../utils/katexRenderer';

interface CrossSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: GeometryModel;
  params: Record<string, number>;
}

export const CrossSectionModal: React.FC<CrossSectionModalProps> = ({
  isOpen,
  onClose,
  model,
  params,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Plane equation: ax + by + cz + d = 0
  const [planeNormal, setPlaneNormal] = useState<{ x: number; y: number; z: number }>({
    x: 0,
    y: 1,
    z: 0,
  });
  const [planeOffset, setPlaneOffset] = useState<number>(0);
  const [clipMode, setClipMode] = useState<'both' | 'clipped'>('both');
  const [showPlaneMesh, setShowPlaneMesh] = useState<boolean>(true);
  const [presetIndex, setPresetIndex] = useState<number>(0);

  // Cross section computed results
  const [sectionResult, setSectionResult] = useState<CrossSectionResult>({
    points: [],
    area: 0,
    shapeName: '',
    hasIntersection: false,
  });

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sectionMeshRef = useRef<THREE.Mesh | null>(null);
  const sectionOutlineRef = useRef<THREE.LineLoop | null>(null);
  const planeHelperMeshRef = useRef<THREE.Mesh | null>(null);
  const modelSolidMeshRef = useRef<THREE.Group | null>(null);
  const modelWireframeRef = useRef<THREE.Group | null>(null);
  const clippingPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, -1, 0), 0));

  // Presets definition
  const presets = [
    { name: 'Mặt phẳng ngang (Song song đáy)', nx: 0, ny: 1, nz: 0, d: 0 },
    { name: 'Mặt phẳng chéo 45°', nx: 0.707, ny: 0.707, nz: 0, d: 0 },
    { name: 'Mặt phẳng đứng (Cắt dọc)', nx: 1, ny: 0, nz: 0, d: 0 },
    { name: 'Mặt phẳng qua 3 điểm chéo', nx: 0.577, ny: 0.577, nz: 0.577, d: 0.2 },
    { name: 'Mặt phẳng nghiêng trước', nx: 0, ny: 0.707, nz: 0.707, d: -0.2 },
  ];

  const handleApplyPreset = (index: number) => {
    setPresetIndex(index);
    const p = presets[index];
    setPlaneNormal({ x: p.nx, y: p.ny, z: p.nz });
    setPlaneOffset(p.d);
  };

  // Build the 3D scene
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.5, 2.5, 4.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controlsRef.current = controls;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 6);
    scene.add(dirLight);
    const dirLightBack = new THREE.DirectionalLight(0x88aaff, 0.6);
    dirLightBack.position.set(-5, -3, -5);
    scene.add(dirLightBack);

    // Subtle coordinate ground
    const grid = new THREE.GridHelper(6, 12, 0x334155, 0x1e293b);
    grid.position.y = -1.5;
    scene.add(grid);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      pmremGenerator.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isOpen]);

  // Update Polyhedron Meshes & Clipping Planes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clean previous models
    if (modelSolidMeshRef.current) scene.remove(modelSolidMeshRef.current);
    if (modelWireframeRef.current) scene.remove(modelWireframeRef.current);
    if (planeHelperMeshRef.current) scene.remove(planeHelperMeshRef.current);
    if (sectionMeshRef.current) scene.remove(sectionMeshRef.current);
    if (sectionOutlineRef.current) scene.remove(sectionOutlineRef.current);

    const geoData = model.generateGeometry(params);
    const vertMap = new Map<string, [number, number, number]>();
    geoData.vertices.forEach((v) => vertMap.set(v.id, v.pos));

    // Normalizing plane equation vector
    const nLen = Math.hypot(planeNormal.x, planeNormal.y, planeNormal.z) || 1;
    const nx = planeNormal.x / nLen;
    const ny = planeNormal.y / nLen;
    const nz = planeNormal.z / nLen;
    const planeEq: PlaneEquation = { a: nx, b: ny, c: nz, d: planeOffset };

    // Update clipping plane for Three.js
    clippingPlaneRef.current.set(new THREE.Vector3(nx, ny, nz), planeOffset);

    // 1. Build Solid Polyhedron Mesh with local clipping option
    const solidGroup = new THREE.Group();
    const solidMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: clipMode === 'clipped' ? 0.95 : 0.65,
      clippingPlanes: clipMode === 'clipped' ? [clippingPlaneRef.current] : [],
      clipShadows: true,
      side: THREE.DoubleSide,
    });

    geoData.faces.forEach((face) => {
      const faceVerts = face.vertexIds.map((id: string) => vertMap.get(id)).filter(Boolean) as [number, number, number][];
      if (faceVerts.length >= 3) {
        // Simple fan triangulation
        const geom = new THREE.BufferGeometry();
        const posArray: number[] = [];
        for (let i = 1; i < faceVerts.length - 1; i++) {
          posArray.push(...faceVerts[0]);
          posArray.push(...faceVerts[i]);
          posArray.push(...faceVerts[i + 1]);
        }
        geom.setAttribute('position', new THREE.Float32BufferAttribute(posArray, 3));
        geom.computeVertexNormals();
        const mesh = new THREE.Mesh(geom, solidMat);
        solidGroup.add(mesh);
      }
    });

    scene.add(solidGroup);
    modelSolidMeshRef.current = solidGroup;

    // 2. Build Wireframe Edges
    const wireGroup = new THREE.Group();
    const edgeLinesGeo = new THREE.BufferGeometry();
    const edgeCoords: number[] = [];
    geoData.edges.forEach((e) => {
      const p1 = vertMap.get(e.v1);
      const p2 = vertMap.get(e.v2);
      if (p1 && p2) {
        edgeCoords.push(...p1, ...p2);
      }
    });
    edgeLinesGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgeCoords, 3));
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.7,
      clippingPlanes: clipMode === 'clipped' ? [clippingPlaneRef.current] : [],
    });
    const wireMesh = new THREE.LineSegments(edgeLinesGeo, wireMat);
    wireGroup.add(wireMesh);
    scene.add(wireGroup);
    modelWireframeRef.current = wireGroup;

    // 3. Compute Mathematical Cross Section Polygon
    const crossRes = computePolyhedronCrossSection(geoData.vertices, geoData.edges, planeEq);
    setSectionResult(crossRes);

    if (crossRes.hasIntersection && crossRes.points.length >= 3) {
      // Create Cross Section Surface Mesh (Vibrant Emerald / Gold)
      const secGeom = new THREE.BufferGeometry();
      const secPositions: number[] = [];
      const center = crossRes.points[0];
      for (let i = 1; i < crossRes.points.length - 1; i++) {
        secPositions.push(center.x, center.y, center.z);
        secPositions.push(crossRes.points[i].x, crossRes.points[i].y, crossRes.points[i].z);
        secPositions.push(crossRes.points[i + 1].x, crossRes.points[i + 1].y, crossRes.points[i + 1].z);
      }
      secGeom.setAttribute('position', new THREE.Float32BufferAttribute(secPositions, 3));
      secGeom.computeVertexNormals();

      const secMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b, // Amber / Gold highlight
        emissive: 0xb45309,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        side: THREE.DoubleSide,
      });
      const secMesh = new THREE.Mesh(secGeom, secMat);
      scene.add(secMesh);
      sectionMeshRef.current = secMesh;

      // Outline of cross section
      const loopPoints = crossRes.points.map((p) => p.clone());
      const outlineGeom = new THREE.BufferGeometry().setFromPoints(loopPoints);
      const outlineMat = new THREE.LineBasicMaterial({
        color: 0xfffbeb,
        linewidth: 3,
      });
      const outline = new THREE.LineLoop(outlineGeom, outlineMat);
      scene.add(outline);
      sectionOutlineRef.current = outline;
    }

    // 4. Cutting Plane Representation (Semi-transparent disk/quad)
    if (showPlaneMesh) {
      const planeGeo = new THREE.PlaneGeometry(5, 5);
      const planeMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        roughness: 0.1,
        transmission: 0.85,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const pMesh = new THREE.Mesh(planeGeo, planeMat);

      // Orient plane to match normal and offset
      const normalVec = new THREE.Vector3(nx, ny, nz);
      const targetPos = normalVec.clone().multiplyScalar(-planeOffset);
      pMesh.position.copy(targetPos);
      pMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normalVec);

      // Plane outline
      const edges = new THREE.EdgesGeometry(planeGeo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.6 })
      );
      pMesh.add(line);

      scene.add(pMesh);
      planeHelperMeshRef.current = pMesh;
    }
  }, [isOpen, model, params, planeNormal, planeOffset, clipMode, showPlaneMesh]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="h-14 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Cắt Khối và Quan Sát Thiết Diện 3D
                <span className="text-xs font-normal text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  {model.name}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left / Center: Interactive 3D Viewport */}
          <div className="relative flex-1 h-[55%] lg:h-full bg-slate-950">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Quick Floating Overlays on 3D Canvas */}
            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 max-w-xs shadow-lg text-xs space-y-1.5 pointer-events-none">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Kết quả thiết diện:
              </div>
              <div className="text-emerald-400 font-bold text-sm">
                {sectionResult.hasIntersection ? sectionResult.shapeName : 'Không có thiết diện'}
              </div>
              {sectionResult.hasIntersection && (
                <div className="text-slate-300">
                  Diện tích thiết diện: <span className="font-mono text-amber-300 font-bold">{(sectionResult.area).toFixed(2)} cm²</span>
                </div>
              )}
              <div className="text-[11px] text-slate-400">
                Phương trình mặt cắt: <span className="font-mono text-indigo-300">
                  {planeNormal.x.toFixed(2)}x + {planeNormal.y.toFixed(2)}y + {planeNormal.z.toFixed(2)}z + ({planeOffset.toFixed(2)}) = 0
                </span>
              </div>
            </div>

            {/* View Mode Switcher in Viewport */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setClipMode('both')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  clipMode === 'both' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cả khối + Thiết diện
              </button>
              <button
                onClick={() => setClipMode('clipped')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  clipMode === 'clipped' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bỏ nửa khối bị cắt
              </button>
              <label className="flex items-center gap-1.5 text-slate-300 ml-2 cursor-pointer border-l border-slate-700 pl-3">
                <input
                  type="checkbox"
                  checked={showPlaneMesh}
                  onChange={(e) => setShowPlaneMesh(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
                />
                <span>Mặt phẳng cắt</span>
              </label>
            </div>
          </div>

          {/* Right Sidebar: Controls & Presets */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/95 overflow-y-auto p-5 flex flex-col gap-5">
            {/* Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Mặt phẳng cắt mẫu (Đề thi phổ thông)
              </label>
              <div className="space-y-1.5">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(idx)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors border flex items-center justify-between ${
                      presetIndex === idx
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{p.name}</span>
                    {presetIndex === idx && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders: Plane Normal & Offset */}
            <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Điều chỉnh vị trí và góc nghiêng mặt cắt
              </label>

              {/* Offset D slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Vị trí trượt qua tâm (d):</span>
                  <span className="font-mono text-emerald-400 font-semibold">{planeOffset.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2.0"
                  max="2.0"
                  step="0.05"
                  value={planeOffset}
                  onChange={(e) => setPlaneOffset(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Vector Normal X */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Nghiêng theo trục X:</span>
                  <span className="font-mono text-slate-200">{planeNormal.x.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.05"
                  value={planeNormal.x}
                  onChange={(e) => setPlaneNormal((prev) => ({ ...prev, x: parseFloat(e.target.value) }))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Vector Normal Y */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Nghiêng theo trục Y:</span>
                  <span className="font-mono text-slate-200">{planeNormal.y.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.05"
                  value={planeNormal.y}
                  onChange={(e) => setPlaneNormal((prev) => ({ ...prev, y: parseFloat(e.target.value) }))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Vector Normal Z */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Nghiêng theo trục Z:</span>
                  <span className="font-mono text-slate-200">{planeNormal.z.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.05"
                  value={planeNormal.z}
                  onChange={(e) => setPlaneNormal((prev) => ({ ...prev, z: parseFloat(e.target.value) }))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Theory & Method Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Phương pháp tìm thiết diện trong đề thi:
              </div>
              <p className="leading-relaxed">
                1. Tìm giao tuyến của mặt phẳng $(\alpha)$ với các mặt của khối đa diện.
              </p>
              <p className="leading-relaxed">
                2. Kéo dài các đoạn giao tuyến để cắt các cạnh tiếp theo, khép kín thành một đa giác phẳng lồi.
              </p>
              <p className="leading-relaxed">
                3. Đa giác khép kín đó chính là <strong className="text-amber-300">thiết diện</strong> của khối hình cắt bởi mặt phẳng $(\alpha)$.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
