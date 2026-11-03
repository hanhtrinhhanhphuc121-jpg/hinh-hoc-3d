import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  X,
  Crosshair,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  Eye,
  Sliders,
  Maximize2,
} from 'lucide-react';
import {
  OxyzPoint,
  computeVectorBetweenPoints,
  computeDotProduct,
  computeCrossProduct,
  computePlaneFrom3Points,
  computeDistancePointToPlane,
  PlaneCoeffs,
} from '../utils/oxyzMath';
import { KaTeX } from '../utils/katexRenderer';

interface OxyzStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OxyzStudioModal: React.FC<OxyzStudioModalProps> = ({ isOpen, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Coordinate Points State
  const [points, setPoints] = useState<OxyzPoint[]>([
    { id: 'pt-a', name: 'A', x: 2, y: 1, z: 0, color: '#ef4444' },
    { id: 'pt-b', name: 'B', x: 0, y: 3, z: 1, color: '#10b981' },
    { id: 'pt-c', name: 'C', x: 1, y: 0, z: 2, color: '#3b82f6' },
    { id: 'pt-m', name: 'M', x: 2, y: 2, z: 3, color: '#f59e0b' },
  ]);

  const [activeTab, setActiveTab] = useState<'plane' | 'vector' | 'distance'>('plane');
  const [showProjectionBoxes, setShowProjectionBoxes] = useState<boolean>(true);
  const [showCoordinatePlanes, setShowCoordinatePlanes] = useState<boolean>(true);

  // Computed results
  const pA = points.find((p) => p.name === 'A') || points[0];
  const pB = points.find((p) => p.name === 'B') || points[1];
  const pC = points.find((p) => p.name === 'C') || points[2];
  const pM = points.find((p) => p.name === 'M') || points[3];

  const planeCoeffs = computePlaneFrom3Points(pA, pB, pC);
  const distMToPlane = planeCoeffs ? computeDistancePointToPlane(pM, planeCoeffs) : 0;
  const vecAB = computeVectorBetweenPoints(pA, pB);
  const vecAC = computeVectorBetweenPoints(pA, pC);
  const normalVec = computeCrossProduct(vecAB.coords, vecAC.coords);
  const dotProd = computeDotProduct(vecAB.coords, vecAC.coords);

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);

  // Initialize Three.js viewport
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5, 4, 6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controlsRef.current = controls;

    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 6);
    scene.add(dirLight);

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

  // Update Dynamic Oxyz elements
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (dynamicGroupRef.current) {
      scene.remove(dynamicGroupRef.current);
    }

    const group = new THREE.Group();
    dynamicGroupRef.current = group;
    scene.add(group);

    // 1. Coordinate Axes Ox (Red), Oy (Green), Oz (Blue)
    const axisLen = 5;
    // Ox: Three.js X
    const oxGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-axisLen, 0, 0),
      new THREE.Vector3(axisLen, 0, 0),
    ]);
    const oxMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2.5 });
    group.add(new THREE.Line(oxGeom, oxMat));

    // Arrow head Ox
    const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(axisLen, 0, 0), 0.3, 0xef4444, 0.15, 0.1);
    group.add(arrowX);

    // Oy: Three.js Z (in math convention (Oxy) is floor, Oz is height)
    // Here we map math (x, y, z) -> Three.js (x, z, -y) or (x, y, z)
    // In our spatial models: X is width, Y is height, Z is depth.
    // For standard Oxyz math: X is Ox, Y is Oy, Z is Oz (vertical).
    const oyGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -axisLen),
      new THREE.Vector3(0, 0, axisLen),
    ]);
    const oyMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2.5 });
    group.add(new THREE.Line(oyGeom, oyMat));
    const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, axisLen), 0.3, 0x10b981, 0.15, 0.1);
    group.add(arrowY);

    // Oz: Vertical Y
    const ozGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -axisLen, 0),
      new THREE.Vector3(0, axisLen, 0),
    ]);
    const ozMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2.5 });
    group.add(new THREE.Line(ozGeom, ozMat));
    const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, axisLen, 0), 0.3, 0x3b82f6, 0.15, 0.1);
    group.add(arrowZ);

    // Coordinate Planes
    if (showCoordinatePlanes) {
      const gridFloor = new THREE.GridHelper(8, 8, 0x334155, 0x1e293b);
      gridFloor.position.y = 0;
      group.add(gridFloor);
    }

    // 2. Render Points and Projection Boxes
    points.forEach((pt) => {
      // Map point: x -> X, y -> Z, z -> Y
      const posX = pt.x;
      const posY = pt.z; // vertical in 3D
      const posZ = pt.y; // horizontal depth

      const sphereGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: pt.color || 0xffffff });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(posX, posY, posZ);
      group.add(sphere);

      // Projection drop lines to coordinate planes
      if (showProjectionBoxes) {
        const dropLineGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(posX, posY, posZ),
          new THREE.Vector3(posX, 0, posZ),
          new THREE.Vector3(posX, 0, 0),
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, posZ),
          new THREE.Vector3(posX, 0, posZ),
        ]);
        const dropMat = new THREE.LineDashedMaterial({
          color: 0x64748b,
          dashSize: 0.1,
          gapSize: 0.05,
        });
        const dropLine = new THREE.Line(dropLineGeom, dropMat);
        dropLine.computeLineDistances();
        group.add(dropLine);
      }
    });

    // 3. Triangle Plane (ABC) and Normal Vector
    if (planeCoeffs) {
      const aPos = new THREE.Vector3(pA.x, pA.z, pA.y);
      const bPos = new THREE.Vector3(pB.x, pB.z, pB.y);
      const cPos = new THREE.Vector3(pC.x, pC.z, pC.y);

      // Triangle polygon
      const triGeom = new THREE.BufferGeometry().setFromPoints([aPos, bPos, cPos]);
      triGeom.computeVertexNormals();
      const triMat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6, // Violet
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const triMesh = new THREE.Mesh(triGeom, triMat);
      group.add(triMesh);

      // Edges AB, BC, CA
      const triEdges = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints([aPos, bPos, cPos]),
        new THREE.LineBasicMaterial({ color: 0xc4b5fd, linewidth: 2 })
      );
      group.add(triEdges);

      // Normal Vector Arrow starting from point A
      const nVec = new THREE.Vector3(normalVec[0], normalVec[2], normalVec[1]).normalize();
      const normArrow = new THREE.ArrowHelper(nVec, aPos, 1.5, 0xf59e0b, 0.25, 0.15);
      group.add(normArrow);

      // Point M to Plane distance segment
      const mPos = new THREE.Vector3(pM.x, pM.z, pM.y);
      // Project M onto plane
      const normalMath = new THREE.Vector3(planeCoeffs.a, planeCoeffs.c, planeCoeffs.b).normalize();
      const distSigned = (planeCoeffs.a * pM.x + planeCoeffs.b * pM.y + planeCoeffs.c * pM.z + planeCoeffs.d) / Math.hypot(planeCoeffs.a, planeCoeffs.b, planeCoeffs.c);
      const projM = mPos.clone().sub(normalMath.clone().multiplyScalar(distSigned));

      const distLineGeom = new THREE.BufferGeometry().setFromPoints([mPos, projM]);
      const distLine = new THREE.Line(
        distLineGeom,
        new THREE.LineBasicMaterial({ color: 0xec4899, linewidth: 3 })
      );
      group.add(distLine);

      // Projection point H
      const hSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xec4899 })
      );
      hSphere.position.copy(projM);
      group.add(hSphere);
    }
  }, [points, showProjectionBoxes, showCoordinatePlanes, planeCoeffs]);

  const updatePoint = (id: string, field: 'x' | 'y' | 'z', value: number) => {
    setPoints((prev) =>
      prev.map((pt) => (pt.id === id ? { ...pt, [field]: value } : pt))
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="h-14 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Phòng Thí Nghiệm Hệ Tọa Độ Oxyz Chuyên Sâu
                <span className="text-xs font-normal text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                  Toán 12 • Vectơ, Mặt phẳng, Đường thẳng
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: 3D Viewport */}
          <div className="relative flex-1 h-[50%] lg:h-full bg-slate-950">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Quick floating axes legend */}
            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-lg text-xs space-y-1 pointer-events-none">
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Trục Ox
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ml-1"></span> Trục Oy
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block ml-1"></span> Trục Oz
              </div>
              <div className="text-[11px] text-slate-400">
                Mũi tên vàng: Vectơ pháp tuyến <span className="font-mono text-amber-300">\vec{'{n}'} = [\vec{'{AB}'}, \vec{'{AC}'}]</span>
              </div>
              <div className="text-[11px] text-pink-400">
                Đoạn màu hồng: Khoảng cách <span className="font-mono">d(M, (ABC)) = {distMToPlane.toFixed(2)}</span>
              </div>
            </div>

            {/* View toggles */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 text-xs">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer px-2">
                <input
                  type="checkbox"
                  checked={showProjectionBoxes}
                  onChange={(e) => setShowProjectionBoxes(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-500"
                />
                <span>Hộp hình chiếu tọa độ</span>
              </label>
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer border-l border-slate-700 pl-3 pr-2">
                <input
                  type="checkbox"
                  checked={showCoordinatePlanes}
                  onChange={(e) => setShowCoordinatePlanes(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-500"
                />
                <span>Lưới tọa độ (Oxy)</span>
              </label>
            </div>
          </div>

          {/* Right Sidebar: Coordinate Inputs & Math Calculations */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/95 overflow-y-auto p-5 flex flex-col gap-5">
            {/* Points coordinate editor */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Tọa độ các điểm trong không gian
              </label>
              <div className="space-y-2">
                {points.map((pt) => (
                  <div key={pt.id} className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
                    <span className="font-bold text-sm w-5" style={{ color: pt.color }}>{pt.name}</span>
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-slate-400">x:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={pt.x}
                        onChange={(e) => updatePoint(pt.id, 'x', parseFloat(e.target.value) || 0)}
                        className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-100 font-mono text-center"
                      />
                      <span className="text-slate-400 ml-1">y:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={pt.y}
                        onChange={(e) => updatePoint(pt.id, 'y', parseFloat(e.target.value) || 0)}
                        className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-100 font-mono text-center"
                      />
                      <span className="text-slate-400 ml-1">z:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={pt.z}
                        onChange={(e) => updatePoint(pt.id, 'z', parseFloat(e.target.value) || 0)}
                        className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-100 font-mono text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Card */}
            <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Kết quả tính toán đại số Oxyz
              </div>

              {/* Vector AB & AC */}
              <div className="space-y-1 text-xs">
                <div className="text-slate-400">1. Tọa độ vectơ và độ dài:</div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-amber-300">
                  <KaTeX math={vecAB.latex} />
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-amber-300">
                  <KaTeX math={vecAC.latex} />
                </div>
              </div>

              {/* Cross Product -> Normal Vector */}
              <div className="space-y-1 text-xs">
                <div className="text-slate-400">2. Tích có hướng (VTPT của mp ABC):</div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-emerald-300">
                  <KaTeX
                    math={`\\vec{n} = [\\vec{AB}, \\vec{AC}] = (${normalVec[0].toFixed(1)}, \\ ${normalVec[1].toFixed(1)}, \\ ${normalVec[2].toFixed(1)})`}
                  />
                </div>
              </div>

              {/* Plane Equation */}
              {planeCoeffs && (
                <div className="space-y-1 text-xs">
                  <div className="text-slate-400">3. Phương trình tổng quát mặt phẳng (ABC):</div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 text-indigo-300 font-semibold">
                    <KaTeX
                      math={`(ABC): ${planeCoeffs.a.toFixed(1)}x + ${planeCoeffs.b.toFixed(1)}y + ${planeCoeffs.c.toFixed(1)}z + (${planeCoeffs.d.toFixed(1)}) = 0`}
                    />
                  </div>
                </div>
              )}

              {/* Distance from M to plane */}
              {planeCoeffs && (
                <div className="space-y-1 text-xs">
                  <div className="text-slate-400">4. Khoảng cách từ điểm M đến mặt phẳng (ABC):</div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 text-pink-400 font-semibold">
                    <KaTeX math={`d(M, (ABC)) = ${distMToPlane.toFixed(3)}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick guide */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Thầy cô và học sinh có thể trực tiếp thay đổi tọa độ các điểm $A, B, C, M$ để ứng dụng tự động dựng hình và tính toán phương trình ngay tức thì.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
