import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  X,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { geometricProofScenarios, GeometricProofScenario } from '../data/proofPresets';
import { getModelById } from '../models/modelRegistry';
import { KaTeX } from '../utils/katexRenderer';

interface GeometricProofModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeometricProofModal: React.FC<GeometricProofModalProps> = ({ isOpen, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const scenario = geometricProofScenarios[selectedScenarioIndex];
  const step = scenario.steps[currentStepIdx];
  const model = getModelById(scenario.baseModelId) || getModelById('pyramid_sa_perp_base');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);

  // Initialize Three.js scene
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
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(5, 8, 6);
    scene.add(dir);

    const grid = new THREE.GridHelper(6, 12, 0x334155, 0x1e293b);
    grid.position.y = -1.2;
    scene.add(grid);

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

  // Update 3D Geometry and Dynamic Proof Overlays when step changes
  useEffect(() => {
    if (!sceneRef.current || !model) return;
    const scene = sceneRef.current;

    if (dynamicGroupRef.current) {
      scene.remove(dynamicGroupRef.current);
    }

    const dynGroup = new THREE.Group();
    dynamicGroupRef.current = dynGroup;
    scene.add(dynGroup);

    const geoData = model.generateGeometry(model.defaultParams);
    const vertMap = new Map<string, [number, number, number]>();
    geoData.vertices.forEach((v) => vertMap.set(v.id, v.pos));

    const hlVerts = new Set(step.highlightElements.vertices || []);
    const hlEdges = new Set(step.highlightElements.edges || []);
    const hlFaces = new Set(step.highlightElements.faces || []);

    // 1. Polyhedron solid faces
    const faceMatDefault = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.25,
      roughness: 0.4,
      side: THREE.DoubleSide,
    });

    const faceMatHighlight = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber highlight
      transparent: true,
      opacity: 0.6,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });

    geoData.faces.forEach((face) => {
      const faceVerts = face.vertexIds.map((id: string) => vertMap.get(id)).filter(Boolean) as [number, number, number][];
      if (faceVerts.length >= 3) {
        const geom = new THREE.BufferGeometry();
        const posArray: number[] = [];
        for (let i = 1; i < faceVerts.length - 1; i++) {
          posArray.push(...faceVerts[0], ...faceVerts[i], ...faceVerts[i + 1]);
        }
        geom.setAttribute('position', new THREE.Float32BufferAttribute(posArray, 3));
        geom.computeVertexNormals();

        const isHl = hlFaces.has(face.id);
        const mesh = new THREE.Mesh(geom, isHl ? faceMatHighlight : faceMatDefault);
        dynGroup.add(mesh);
      }
    });

    // 2. Base wireframe edges
    geoData.edges.forEach((edge) => {
      const p1 = vertMap.get(edge.v1);
      const p2 = vertMap.get(edge.v2);
      if (!p1 || !p2) return;

      const isHl = hlEdges.has(edge.id) || hlEdges.has(`${edge.v1}-${edge.v2}`) || hlEdges.has(`${edge.v2}-${edge.v1}`);
      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...p1),
        new THREE.Vector3(...p2),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: isHl ? 0xf59e0b : 0x64748b,
        linewidth: isHl ? 3 : 1.5,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      dynGroup.add(line);
    });

    // 3. Auxiliary Lines (Dựng thêm đường phụ)
    if (step.highlightElements.auxiliaryLines) {
      step.highlightElements.auxiliaryLines.forEach((aux) => {
        const geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...aux.from),
          new THREE.Vector3(...aux.to),
        ]);
        const mat = aux.dashed
          ? new THREE.LineDashedMaterial({ color: aux.color, dashSize: 0.15, gapSize: 0.08, linewidth: 3 })
          : new THREE.LineBasicMaterial({ color: aux.color, linewidth: 3 });
        const auxLine = new THREE.Line(geom, mat);
        if (aux.dashed) auxLine.computeLineDistances();
        dynGroup.add(auxLine);
      });
    }

    // 4. Right Angle Markers
    if (step.highlightElements.rightAngles) {
      step.highlightElements.rightAngles.forEach((ra) => {
        const p0 = new THREE.Vector3(...ra.pos);
        const d1 = new THREE.Vector3(...ra.dir1).normalize().multiplyScalar(0.22);
        const d2 = new THREE.Vector3(...ra.dir2).normalize().multiplyScalar(0.22);

        const p1 = p0.clone().add(d1);
        const p2 = p0.clone().add(d1).add(d2);
        const p3 = p0.clone().add(d2);

        const geom = new THREE.BufferGeometry().setFromPoints([p1, p2, p3]);
        const mat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2.5 });
        const raLine = new THREE.Line(geom, mat);
        dynGroup.add(raLine);
      });
    }

    // 5. Vertices Spheres - Only show amber sphere if vertex is actively highlighted in the proof step
    geoData.vertices.forEach((vert) => {
      const isHl = hlVerts.has(vert.id);
      if (isHl) {
        const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set(...vert.pos);
        dynGroup.add(sphere);
      }
    });

    // Animate camera position smoothly if defined
    if (step.cameraPosition && cameraRef.current && controlsRef.current) {
      const targetCam = new THREE.Vector3(...step.cameraPosition);
      cameraRef.current.position.lerp(targetCam, 0.4);
      controlsRef.current.update();
    }
  }, [step, model]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="h-14 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Dựng Hình và Chứng Minh Hình Học Không Gian
                <span className="text-xs font-normal text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                  Lớp {scenario.grade} • {scenario.category}
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

        {/* Body content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left / Center 3D Proof Viewport */}
          <div className="relative flex-1 h-[50%] lg:h-full bg-slate-950">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Floating Banner */}
            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 max-w-sm shadow-lg text-xs space-y-1 pointer-events-none">
              <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {scenario.title}
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed">
                {scenario.givenText}
              </div>
            </div>

            {/* Step navigation overlay in viewport */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800">
                <button
                  disabled={currentStepIdx === 0}
                  onClick={() => setCurrentStepIdx((i) => Math.max(0, i - 1))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Bước trước
                </button>
                <span className="text-xs font-mono text-slate-300 px-2">
                  Bước {currentStepIdx + 1} / {scenario.steps.length}
                </span>
                <button
                  disabled={currentStepIdx === scenario.steps.length - 1}
                  onClick={() => setCurrentStepIdx((i) => Math.min(scenario.steps.length - 1, i + 1))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white flex items-center gap-1.5 transition-colors shadow-sm shadow-indigo-600/30"
                >
                  Bước tiếp
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400">
                Xoay chuột 360° để kiểm tra trực quan
              </div>
            </div>
          </div>

          {/* Right Sidebar: Scenarios list & Math Reasoning Steps */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/95 overflow-y-auto p-5 flex flex-col gap-5">
            {/* Scenarios picker */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Chọn bài toán chứng minh
              </label>
              <div className="space-y-1.5">
                {geometricProofScenarios.map((sc, idx) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setSelectedScenarioIndex(idx);
                      setCurrentStepIdx(0);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-colors border flex items-start justify-between gap-2 ${
                      selectedScenarioIndex === idx
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{sc.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{sc.category} • Lớp {sc.grade}</div>
                    </div>
                    {selectedScenarioIndex === idx && <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Step Detailed Card */}
            <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Bước {step.stepNumber}: {step.title}
                </span>
                <span className="text-[10px] text-slate-400">
                  {currentStepIdx + 1}/{scenario.steps.length}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {step.explanation}
              </p>

              {step.mathExpression && (
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto text-amber-300">
                  <KaTeX math={step.mathExpression} block />
                </div>
              )}
            </div>

            {/* Stepper dots */}
            <div className="flex items-center justify-center gap-2 py-2">
              {scenario.steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStepIdx(i)}
                  className={`h-2 rounded-full transition-all ${
                    currentStepIdx === i ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Bước ${i + 1}`}
                />
              ))}
            </div>

            {/* Pedagogical Hint */}
            <div className="mt-auto bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Mỗi bước chứng minh đều liên kết với mô hình 3D: quan sát các đường phụ màu cam/hồng và ký hiệu vuông góc đỏ được tự động thêm vào đúng thời điểm.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
