import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  X,
  Compass,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCw,
  Maximize2,
  ChevronRight,
  Eye,
  Award,
  Sparkles,
  Layers,
  ArrowRight,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { spatialThinkingExercises } from '../data/spatialThinkingExercises';
import { SpatialThinkingExercise, SpatialGrade, SpatialCategory } from '../types/spatialThinking';
import { getModelById } from '../models/modelRegistry';
import { computeEdgeVisibilities } from '../utils/hiddenLineDetector';
import { build3DUnfoldingScene } from '../utils/unfolding3DBuilder';

interface SpatialThinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpatialThinkingModal: React.FC<SpatialThinkingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<'all' | SpatialGrade>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | SpatialCategory>('all');
  const [currentIdx, setCurrentIdx] = useState(0);

  // Filter exercises
  const filteredExercises = spatialThinkingExercises.filter((ex) => {
    const matchGrade = selectedGrade === 'all' || ex.gradeLevel === selectedGrade;
    const matchCat = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchGrade && matchCat;
  });

  const exercise: SpatialThinkingExercise | undefined = filteredExercises[currentIdx] || filteredExercises[0];

  // User state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // 3D verification state
  const [unfoldProgress, setUnfoldProgress] = useState(0);
  const [isUnfoldingRunning, setIsUnfoldingRunning] = useState(false);
  const [hiddenLineActive, setHiddenLineActive] = useState(true);

  // Three.js refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);

  // Reset answer when switching exercises
  useEffect(() => {
    setSelectedOptionId(null);
    setIsAnswered(false);
    setUnfoldProgress(0);
    setIsUnfoldingRunning(false);
  }, [currentIdx, selectedGrade, selectedCategory]);

  // Unfolding animation step
  useEffect(() => {
    let timer: any = null;
    if (isUnfoldingRunning) {
      timer = setInterval(() => {
        setUnfoldProgress((prev) => {
          if (prev >= 100) {
            setIsUnfoldingRunning(false);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
    }
    return () => clearInterval(timer);
  }, [isUnfoldingRunning]);

  // Three.js Mount Setup
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;
    const container = mountRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(6, 5, 7);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment & Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    fillLight.position.set(-8, -4, -6);
    scene.add(fillLight);

    const grid = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b);
    grid.position.y = -2;
    scene.add(grid);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controlsRef.current = controls;

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
    };
  }, [isOpen]);

  // Rebuild 3D Model when exercise, unfoldProgress, or hiddenLineActive changes
  const rebuild3DModel = useCallback(() => {
    if (!exercise || !modelGroupRef.current || !cameraRef.current) return;
    const group = modelGroupRef.current;

    // Clear old objects
    while (group.children.length > 0) {
      const obj = group.children[0] as any;
      if (obj.geometry) obj.geometry.dispose();
      group.remove(obj);
    }

    // If currently playing unfolding verification
    if (unfoldProgress > 0) {
      const { meshes, lines, hingeMarkers } = build3DUnfoldingScene(
        exercise.modelId,
        exercise.modelParams,
        unfoldProgress / 100
      );
      for (const m of meshes) group.add(m);
      for (const l of lines) group.add(l);
      for (const h of hingeMarkers) group.add(h);
      return;
    }

    const model = getModelById(exercise.modelId);
    const { vertices, edges, faces, rightAngleMarkers } = model.generateGeometry(exercise.modelParams);
    const cameraPos = cameraRef.current.position;

    // Evaluate edge visibilities
    const evaluatedEdges = computeEdgeVisibilities(
      vertices,
      edges,
      faces,
      cameraPos,
      group.matrixWorld
    );

    // Check highlights
    const highlightEdgeIds = new Set(
      exercise.highlightElements?.filter((e) => e.type === 'edge').map((e) => e.id) || []
    );
    const highlightFaceIds = new Set(
      exercise.highlightElements?.filter((e) => e.type === 'face').map((e) => e.id) || []
    );

    // Build Faces
    const vertMap = new Map<string, THREE.Vector3>();
    for (const v of vertices) {
      vertMap.set(v.id, new THREE.Vector3(...v.pos));
    }

    for (const face of faces) {
      if (face.vertexIds.length < 3) continue;
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

      const isFaceHighlighted = isAnswered && highlightFaceIds.has(face.id);

      const faceMat = new THREE.MeshStandardMaterial({
        color: isFaceHighlighted ? 0x10b981 : (face.color || 0x3b82f6),
        roughness: 0.35,
        metalness: 0.1,
        transparent: true,
        opacity: isFaceHighlighted ? 0.85 : 0.65,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });

      group.add(new THREE.Mesh(faceGeo, faceMat));
    }

    // Build Edges
    for (const edge of evaluatedEdges) {
      const p1 = new THREE.Vector3(...edge.v1);
      const p2 = new THREE.Vector3(...edge.v2);
      const isHighlighted = isAnswered && highlightEdgeIds.has(edge.id);
      const isVisible = !hiddenLineActive ? true : edge.isVisible;

      const geom = new THREE.BufferGeometry().setFromPoints([p1, p2]);

      if (isVisible) {
        const mat = new THREE.LineBasicMaterial({
          color: isHighlighted ? 0xf59e0b : 0x64748b,
          linewidth: isHighlighted ? 3.5 : 2,
        });
        group.add(new THREE.Line(geom, mat));
      } else {
        const dashedMat = new THREE.LineDashedMaterial({
          color: isHighlighted ? 0xf59e0b : 0x94a3b8,
          dashSize: 0.22,
          gapSize: 0.14,
          linewidth: 1.5,
        });
        const line = new THREE.LineSegments(geom, dashedMat);
        line.computeLineDistances();
        group.add(line);
      }
    }

    // Right angles
    if (rightAngleMarkers) {
      for (const m of rightAngleMarkers) {
        const s = m.size || 0.3;
        const v = new THREE.Vector3(...m.vertex);
        const d1 = new THREE.Vector3(...m.dir1).normalize().multiplyScalar(s);
        const d2 = new THREE.Vector3(...m.dir2).normalize().multiplyScalar(s);
        const p1 = v.clone().add(d1);
        const p2 = v.clone().add(d1).add(d2);
        const p3 = v.clone().add(d2);
        const cornerGeo = new THREE.BufferGeometry().setFromPoints([p1, p2, p3]);
        const cornerMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
        group.add(new THREE.Line(cornerGeo, cornerMat));
      }
    }
  }, [exercise, unfoldProgress, hiddenLineActive, isAnswered]);

  useEffect(() => {
    rebuild3DModel();
  }, [rebuild3DModel]);

  // Hook controls change to recompute hidden lines
  useEffect(() => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    const handleControlsChange = () => {
      if (unfoldProgress === 0) {
        rebuild3DModel();
      }
    };
    ctrl.addEventListener('change', handleControlsChange);
    return () => ctrl.removeEventListener('change', handleControlsChange);
  }, [rebuild3DModel, unfoldProgress]);

  if (!isOpen || !exercise) return null;

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isAnswered) return;
    setIsAnswered(true);

    const chosen = exercise.options.find((o) => o.id === selectedOptionId);
    if (chosen?.isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      setStreak(0);
    }
  };

  // 3D Verification Actions
  const handleSnapToCameraAngle = () => {
    if (!cameraRef.current || !controlsRef.current || !exercise.targetCameraAngle) return;
    const [x, y, z] = exercise.targetCameraAngle;
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0, 0);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    rebuild3DModel();
  };

  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(6, 5, 7);
    cameraRef.current.lookAt(0, 0, 0);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    setUnfoldProgress(0);
    setIsUnfoldingRunning(false);
    rebuild3DModel();
  };

  const handleStartUnfoldVerification = () => {
    setUnfoldProgress(0);
    setIsUnfoldingRunning(true);
  };

  const handleNextExercise = () => {
    if (currentIdx < filteredExercises.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCurrentIdx(0);
    }
    handleResetCamera();
  };

  const handlePrevExercise = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
    handleResetCamera();
  };

  const selectedOption = exercise.options.find((o) => o.id === selectedOptionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Rèn Luyện Tư Duy Không Gian 3D</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-mono">
                  THCS và THPT
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Dự đoán hình chiếu, nhận diện nét khuất, quan hệ vuông góc và hình khai triển trước khi kiểm chứng 3D
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">
                Điểm: <strong className="text-emerald-400">{score}</strong>
              </span>
              {streak > 1 && (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Chuỗi {streak}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Grade filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => { setSelectedGrade('all'); setCurrentIdx(0); }}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedGrade === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất cả khối
            </button>
            <button
              onClick={() => { setSelectedGrade('THCS'); setCurrentIdx(0); }}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedGrade === 'THCS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              THCS (Lớp 7 - 9)
            </button>
            <button
              onClick={() => { setSelectedGrade('THPT'); setCurrentIdx(0); }}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedGrade === 'THPT' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              THPT (Lớp 11 - 12)
            </button>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1 overflow-x-auto bg-slate-900 p-1 rounded-lg border border-slate-800">
            {[
              { id: 'all', label: 'Tất cả dạng bài' },
              { id: 'projection', label: 'Hình chiếu 3 hướng' },
              { id: 'hidden_line', label: 'Nét khuất' },
              { id: 'relations', label: 'Vuông góc và song song' },
              { id: 'net_prediction', label: 'Hình khai triển' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id as any); setCurrentIdx(0); }}
                className={`px-2.5 py-1 rounded font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Progress counter */}
          <div className="text-slate-400 font-mono">
            Bài {currentIdx + 1} / {filteredExercises.length}
          </div>
        </div>

        {/* Main Grid: 3D Stage (Left 55%) + Challenge & Verification (Right 45%) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left: 3D Interactive Stage */}
          <div className="lg:col-span-7 relative bg-slate-950 flex flex-col min-h-[320px] sm:min-h-[420px]">
            <div ref={mountRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing" />

            {/* Stage HUD Badges */}
            <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono text-indigo-300 shadow-lg pointer-events-none">
              Mô hình: <span className="text-white font-bold">{exercise.modelName}</span>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={() => setHiddenLineActive((v) => !v)}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                  hiddenLineActive
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Bật hoặc tắt hiển thị nét khuất"
              >
                Nét khuất: {hiddenLineActive ? 'BẬT' : 'TẮT'}
              </button>

              <button
                onClick={handleResetCamera}
                className="p-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition-colors"
                title="Khôi phục góc nhìn ban đầu"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom 3D Helper Toolbar */}
            <div className="p-2.5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Xoay chuột 360° để quan sát mô hình không gian</span>
              {isAnswered && exercise.targetCameraAngle && (
                <button
                  onClick={handleSnapToCameraAngle}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 rounded-lg hover:bg-indigo-600/30 font-semibold transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xoay tới góc chiếu kiểm chứng</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Challenge Deck & Pedagogical Verification */}
          <div className="lg:col-span-5 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col overflow-y-auto p-5 space-y-4">
            {/* Category badge and Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/30 text-indigo-400 font-semibold">
                  {exercise.categoryLabel}
                </span>
                <span className="text-[10px] text-slate-400">
                  {exercise.gradeLevel === 'THCS' ? 'Cấp THCS (Trực quan)' : 'Cấp THPT (Quan hệ và Góc)'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">
                {exercise.title}
              </h3>
            </div>

            {/* Prompt Question */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-medium">
              {exercise.prompt}
            </div>

            {/* Options List */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Hãy chọn phương án dự đoán của bạn:
              </span>
              {exercise.options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                let optStyle = 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/80 text-slate-200';

                if (isAnswered) {
                  if (opt.isCorrect) {
                    optStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500 font-medium';
                  } else if (isSelected && !opt.isCorrect) {
                    optStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500 font-medium';
                  } else {
                    optStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                  }
                } else if (isSelected) {
                  optStyle = 'bg-indigo-950/60 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => !isAnswered && setSelectedOptionId(opt.id)}
                    disabled={isAnswered}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 ${optStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt.label}</span>
                    </div>

                    {isAnswered && opt.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isSelected && !opt.isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Submit Action */}
            {!isAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOptionId}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Xác nhận dự đoán và Kiểm chứng 3D</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              /* Verification & Explanation Feedback */
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div
                  className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
                    selectedOption?.isCorrect
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {selectedOption?.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Chính xác! Tư duy không gian rất xuất sắc.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Chưa chính xác. Hãy cùng kiểm chứng mô hình 3D!</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {exercise.explanation}
                  </p>
                </div>

                {/* 3D Action verification buttons */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-300 block">
                    Thao tác 3D để kiểm chứng trực quan:
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {exercise.targetCameraAngle && (
                      <button
                        onClick={handleSnapToCameraAngle}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-sm transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem góc chiếu chuẩn</span>
                      </button>
                    )}

                    {exercise.supportsUnfolding && (
                      <button
                        onClick={handleStartUnfoldVerification}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium shadow-sm transition-all"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Chạy hoạt ảnh mở 2D</span>
                      </button>
                    )}

                    <button
                      onClick={handleResetCamera}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all"
                    >
                      Đặt lại 3D
                    </button>
                  </div>
                </div>

                {/* Spatial Cognition Tip */}
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-[11px] text-slate-300 leading-relaxed">
                  <span className="font-semibold text-indigo-400">Mẹo tư duy không gian: </span>
                  {exercise.spatialTip}
                </div>

                {/* Navigation to next exercise */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    onClick={handlePrevExercise}
                    disabled={currentIdx === 0}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-950 border border-slate-800 rounded-lg text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                  >
                    Bài trước
                  </button>

                  <button
                    onClick={handleNextExercise}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
                  >
                    <span>Bài tiếp theo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
