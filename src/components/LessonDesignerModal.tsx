/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Download,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Layers,
  HelpCircle,
  FileText,
  Save,
  FolderOpen,
  Play,
  Pause,
  Award,
} from 'lucide-react';
import { KaTeX } from '../utils/katexRenderer';
import {
  GeometricConstraintSpec,
  SolvedGeometricLesson,
} from '../types/lessonDesigner';
import {
  PRESET_GEOMETRIC_LESSONS,
  solveGeometricLessonFromSpec,
} from '../utils/geometricConstraintSolver';

interface LessonDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Creates high-contrast billboard text sprite for 3D vertices
 */
function createVertexTextSprite(text: string, color = '#f8fafc', bgBorder = '#38bdf8'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.arc(64, 64, 44, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = bgBorder;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 66);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.45, 0.45, 1);
  return sprite;
}

export const LessonDesignerModal: React.FC<LessonDesignerModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Navigation tabs: 'designer' | 'worksheet' | 'saved'
  const [activeTab, setActiveTab] = useState<'designer' | 'worksheet' | 'saved'>('designer');

  // Currently loaded lesson
  const [currentLesson, setCurrentLesson] = useState<SolvedGeometricLesson>(
    PRESET_GEOMETRIC_LESSONS[0]
  );

  // Active step index (0-based)
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  // Auto-play steps state
  const [isPlayingSteps, setIsPlayingSteps] = useState<boolean>(false);

  // Student interactive quiz state for Step 4
  const [studentChoice, setStudentChoice] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  // Visual toggle
  const [showSolidFaces, setShowSolidFaces] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  // Custom prompt input in teacher config panel
  const [customPrompt, setCustomPrompt] = useState<string>(
    PRESET_GEOMETRIC_LESSONS[0].promptText
  );
  const [paramA, setParamA] = useState<number>(2);
  const [paramH, setParamH] = useState<number>(4);
  const [paramFoot, setParamFoot] = useState<'A' | 'O'>('A');

  // Worksheet metadata
  const [teacherName, setTeacherName] = useState<string>(
    'Giáo viên phát triển: Cao Thị Thu Thảo (GV trường THCS và THPT Long Hiệp)'
  );
  const [className, setClassName] = useState<string>('Lớp 11A1');
  const [studentName, setStudentName] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [snapshotImgUrl, setSnapshotImgUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Saved lessons collection in LocalStorage
  const [savedLessons, setSavedLessons] = useState<SolvedGeometricLesson[]>(() => {
    try {
      const stored = localStorage.getItem('hinhhoc3d_designed_lessons');
      return stored ? JSON.parse(stored) : PRESET_GEOMETRIC_LESSONS;
    } catch {
      return PRESET_GEOMETRIC_LESSONS;
    }
  });

  // Three.js refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);

  const activeStep = currentLesson.steps[currentStepIdx] || currentLesson.steps[0];

  // Auto-play timer
  useEffect(() => {
    if (!isPlayingSteps) return;
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < currentLesson.steps.length - 1) {
          return prev + 1;
        } else {
          setIsPlayingSteps(false);
          return prev;
        }
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlayingSteps, currentLesson.steps.length]);

  // Reset student interaction when step changes
  useEffect(() => {
    setStudentChoice(null);
    setIsAnswerSubmitted(false);
  }, [currentStepIdx, currentLesson.id]);

  // Generate QR code for current lesson
  useEffect(() => {
    const lessonShareUrl = `${window.location.origin}${window.location.pathname}?lesson=${encodeURIComponent(
      currentLesson.id
    )}`;
    QRCode.toDataURL(lessonShareUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [currentLesson.id]);

  // 1. Initialize Three.js scene
  useEffect(() => {
    if (!isOpen || !mountRef.current || activeTab !== 'designer') return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.8, 2.8, 4.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controlsRef.current = controls;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 0.6);
    dirLight2.position.set(-5, -4, -5);
    scene.add(dirLight2);

    // Coordinate grid
    const grid = new THREE.GridHelper(6, 12, 0x334155, 0x1e293b);
    grid.position.y = -1.2;
    scene.add(grid);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (autoRotate && controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.5;
      } else if (controls) {
        controls.autoRotate = false;
      }
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
      pmrem.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isOpen, activeTab, autoRotate]);

  // 2. Build 3D objects according to current lesson and step
  useEffect(() => {
    if (!sceneRef.current || activeTab !== 'designer') return;
    const scene = sceneRef.current;

    if (dynamicGroupRef.current) {
      scene.remove(dynamicGroupRef.current);
    }

    const dynGroup = new THREE.Group();
    dynamicGroupRef.current = dynGroup;
    scene.add(dynGroup);

    const vertMap = new Map<string, [number, number, number]>();
    currentLesson.vertices3D.forEach((v) => vertMap.set(v.id, v.pos));

    const hlVerts = new Set(activeStep.highlightVertices || []);
    const hlEdges = new Set(activeStep.highlightEdges || []);

    // A. Solid Polyhedron Faces
    if (showSolidFaces) {
      const faceMatDefault = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.22,
        roughness: 0.3,
        side: THREE.DoubleSide,
      });

      currentLesson.faces3D.forEach((face) => {
        const faceVerts = face.vertexIds
          .map((id) => vertMap.get(id))
          .filter(Boolean) as [number, number, number][];

        if (faceVerts.length >= 3) {
          const geom = new THREE.BufferGeometry();
          const posArray: number[] = [];
          for (let i = 1; i < faceVerts.length - 1; i++) {
            posArray.push(...faceVerts[0], ...faceVerts[i], ...faceVerts[i + 1]);
          }
          geom.setAttribute('position', new THREE.Float32BufferAttribute(posArray, 3));
          geom.computeVertexNormals();

          const mesh = new THREE.Mesh(geom, faceMatDefault);
          dynGroup.add(mesh);
        }
      });
    }

    // B. Highlighted Auxiliary Triangles (e.g., triangle SAC)
    if (activeStep.highlightFaceTriangles && activeStep.highlightFaceTriangles.length > 0) {
      const hlTriMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4, // Cyan glow
        transparent: true,
        opacity: 0.55,
        roughness: 0.2,
        side: THREE.DoubleSide,
      });

      activeStep.highlightFaceTriangles.forEach((tri) => {
        const geom = new THREE.BufferGeometry();
        const posArray: number[] = [
          ...tri[0], ...tri[1], ...tri[2],
        ];
        geom.setAttribute('position', new THREE.Float32BufferAttribute(posArray, 3));
        geom.computeVertexNormals();
        const mesh = new THREE.Mesh(geom, hlTriMat);
        dynGroup.add(mesh);

        // Add glowing border around the highlighted triangle
        const borderGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...tri[0]),
          new THREE.Vector3(...tri[1]),
          new THREE.Vector3(...tri[2]),
          new THREE.Vector3(...tri[0]),
        ]);
        const borderMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, linewidth: 3 });
        const borderLine = new THREE.Line(borderGeom, borderMat);
        dynGroup.add(borderLine);
      });
    }

    // C. Model Edges
    currentLesson.edges3D.forEach((edge) => {
      const p1 = vertMap.get(edge.v1);
      const p2 = vertMap.get(edge.v2);
      if (!p1 || !p2) return;

      const isHl =
        hlEdges.has(edge.id) ||
        hlEdges.has(`${edge.v1}-${edge.v2}`) ||
        hlEdges.has(`${edge.v2}-${edge.v1}`);

      const isHeightEdge = edge.isHeight;

      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...p1),
        new THREE.Vector3(...p2),
      ]);

      const lineColor = isHl
        ? 0xf59e0b // Amber if highlighted
        : isHeightEdge
        ? 0x10b981 // Emerald for altitude SA
        : 0x94a3b8; // Slate for normal edges

      const lineMat = new THREE.LineBasicMaterial({
        color: lineColor,
        linewidth: isHl || isHeightEdge ? 3 : 1.5,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      dynGroup.add(line);
    });

    // D. Auxiliary Projection Edges (e.g., projection AC)
    if (activeStep.auxiliaryEdges && activeStep.auxiliaryEdges.length > 0) {
      activeStep.auxiliaryEdges.forEach((aux) => {
        const geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...aux.from),
          new THREE.Vector3(...aux.to),
        ]);
        const colorVal = parseInt(aux.color.replace('#', '0x'), 16) || 0xf59e0b;
        const mat = aux.dashed
          ? new THREE.LineDashedMaterial({
              color: colorVal,
              dashSize: 0.18,
              gapSize: 0.09,
              linewidth: 3,
            })
          : new THREE.LineBasicMaterial({ color: colorVal, linewidth: 3 });

        const auxLine = new THREE.Line(geom, mat);
        if (aux.dashed) auxLine.computeLineDistances();
        dynGroup.add(auxLine);
      });
    }

    // E. 3D Right Angle Markers (e.g., at vertex A for SA ⊥ AB, SA ⊥ AD, SA ⊥ AC)
    if (activeStep.rightAngleMarkers && activeStep.rightAngleMarkers.length > 0) {
      activeStep.rightAngleMarkers.forEach((ra) => {
        const p0 = new THREE.Vector3(...ra.vertex);
        const d1 = new THREE.Vector3(...ra.dir1).normalize().multiplyScalar(0.24);
        const d2 = new THREE.Vector3(...ra.dir2).normalize().multiplyScalar(0.24);

        const p1 = p0.clone().add(d1);
        const p2 = p0.clone().add(d1).add(d2);
        const p3 = p0.clone().add(d2);

        const raGeom = new THREE.BufferGeometry().setFromPoints([p1, p2, p3]);
        const raMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2.5 });
        const raLine = new THREE.Line(raGeom, raMat);
        dynGroup.add(raLine);

        // Add semi-transparent fill in the right angle corner
        const cornerTriGeom = new THREE.BufferGeometry().setFromPoints([p0, p1, p2, p0, p2, p3]);
        const cornerTriMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
        });
        const cornerMesh = new THREE.Mesh(cornerTriGeom, cornerTriMat);
        dynGroup.add(cornerMesh);
      });
    }

    // F. Vertices Spheres & Billboard Labels
    currentLesson.vertices3D.forEach((vert) => {
      const isHl = hlVerts.has(vert.id);

      // Vertex sphere dot - only when actively highlighted
      if (isHl) {
        const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set(...vert.pos);
        dynGroup.add(sphere);
      }

      // Text sprite
      const textSprite = createVertexTextSprite(
        vert.name,
        isHl ? '#fef08a' : '#ffffff',
        isHl ? '#f59e0b' : '#38bdf8'
      );
      // Offset sprite slightly above/around vertex
      const offset = new THREE.Vector3(...vert.pos).add(new THREE.Vector3(0, 0.24, 0));
      textSprite.position.copy(offset);
      dynGroup.add(textSprite);
    });
  }, [currentLesson, activeStep, showSolidFaces, activeTab]);

  // Handle Teacher Constraint Solving
  const handleSolveFromConstraints = () => {
    const spec: GeometricConstraintSpec = {
      polyhedronType: 'pyramid_quad',
      baseType: 'square',
      baseParams: { a: paramA },
      heightParams: {
        vertexApex: 'S',
        footOfAltitude: paramFoot,
        heightValue: paramH,
        heightExpression: `${(paramH / paramA).toFixed(1)}a`,
      },
      targetTask: {
        type: 'angle_line_plane',
        lineName: 'SC',
        planeName: '(ABCD)',
        targetAngleName: '\\widehat{SCA}',
      },
    };

    const newLesson = solveGeometricLessonFromSpec(
      spec,
      customPrompt,
      `Bài giảng: Hình chóp S.ABCD (SA ⊥ đáy, SA = ${(paramH / paramA).toFixed(1)}a)`
    );

    setCurrentLesson(newLesson);
    setCurrentStepIdx(0);
  };

  // Select a preset lesson
  const handleSelectPreset = (preset: SolvedGeometricLesson) => {
    setCurrentLesson(preset);
    setCustomPrompt(preset.promptText);
    setCurrentStepIdx(0);
  };

  // Student interaction submission in Step 4
  const handleStudentSubmit = () => {
    if (studentChoice === null) return;
    setIsAnswerSubmitted(true);
    const correctIdx = activeStep.studentInteractivePrompt?.correctIndex ?? 1;
    if (studentChoice === correctIdx) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
      });
    }
  };

  // Take snapshot of 3D canvas for worksheet
  const captureSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    setSnapshotImgUrl(dataUrl);
    setActiveTab('worksheet');
  };

  // Save lesson to LocalStorage
  const handleSaveLesson = () => {
    const updated = [
      currentLesson,
      ...savedLessons.filter((l) => l.id !== currentLesson.id),
    ];
    setSavedLessons(updated);
    try {
      localStorage.setItem('hinhhoc3d_designed_lessons', JSON.stringify(updated));
    } catch {
      // ignore
    }
    alert('Đã lưu bài học thành công vào kho giáo án cá nhân!');
  };

  // Export lesson to JSON file
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentLesson, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${currentLesson.id}.json`);
    dlAnchor.click();
  };

  // Copy share link
  const handleCopyLink = () => {
    const lessonShareUrl = `${window.location.origin}${window.location.pathname}?lesson=${encodeURIComponent(
      currentLesson.id
    )}`;
    navigator.clipboard.writeText(lessonShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[94vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="h-14 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Trình Thiết Kế Bài Học Hình Học 3D
                <span className="text-xs font-medium text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/60">
                  Dành riêng cho Giáo viên
                </span>
              </h2>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('designer')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'designer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Soạn Bài và Mô Hình 3D
            </button>
            <button
              onClick={() => {
                if (!snapshotImgUrl && rendererRef.current) {
                  setSnapshotImgUrl(rendererRef.current.domElement.toDataURL('image/png'));
                }
                setActiveTab('worksheet');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'worksheet'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Phiếu Học Tập A4 và QR 3D
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Kho Giáo Án ({savedLessons.length})
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 1: Lesson Designer & 3D Interactive Pedagogical Player */}
        {activeTab === 'designer' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Panel: Teacher Constraint Input & Presets */}
            <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
              {/* Exemplar Presets */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Bài toán mẫu chuẩn mực</span>
                  <span className="text-[10px] text-amber-400 font-normal">Ràng buộc toán học</span>
                </label>
                <div className="space-y-2">
                  {PRESET_GEOMETRIC_LESSONS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                        currentLesson.id === preset.id
                          ? 'bg-indigo-950/70 border-indigo-500/80 text-white shadow-sm'
                          : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-semibold text-indigo-300">{preset.title}</div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {preset.promptText}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Teacher Natural Problem Input */}
              <div className="border-t border-slate-800 pt-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">
                  Đề bài giáo viên soạn
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                  placeholder="Nhập đề bài hình học không gian..."
                />
              </div>

              {/* Mathematical Constraints Parameters */}
              <div className="space-y-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Thông số hình học chính xác
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Cạnh đáy a</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="4"
                      value={paramA}
                      onChange={(e) => setParamA(parseFloat(e.target.value) || 2)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Chiều cao SA (h)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="6"
                      value={paramH}
                      onChange={(e) => setParamH(parseFloat(e.target.value) || 4)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Chân đường cao</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => setParamFoot('A')}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                        paramFoot === 'A'
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      SA ⊥ đáy (Đỉnh A)
                    </button>
                    <button
                      onClick={() => setParamFoot('O')}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                        paramFoot === 'O'
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      SO ⊥ đáy (Tâm O)
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSolveFromConstraints}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Dựng Hình Theo Ràng Buộc Toán Học
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={handleSaveLesson}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Lưu Bài Học
                </button>
                <button
                  onClick={captureSnapshot}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Tạo Phiếu A4
                </button>
              </div>
            </div>

            {/* Center: Interactive 3D Viewport */}
            <div className="flex-1 relative flex flex-col bg-slate-950 overflow-hidden">
              {/* 3D Canvas Container */}
              <div ref={mountRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" />

              {/* Top Viewport Controls Toolbar */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                {/* 3D Visual Badges */}
                <div className="flex items-center gap-2 pointer-events-auto">
                  <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/70 shadow-lg text-xs font-medium text-slate-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{currentLesson.title}</span>
                  </div>
                </div>

                {/* Viewport Toggles */}
                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={() => setShowSolidFaces(!showSolidFaces)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium backdrop-blur-md transition-all shadow-md ${
                      showSolidFaces
                        ? 'bg-indigo-600/90 border-indigo-500 text-white'
                        : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {showSolidFaces ? 'Mặt khối (Đầy đủ)' : 'Khung dây (Chỉ cạnh)'}
                  </button>
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`p-1.5 rounded-xl border backdrop-blur-md transition-all shadow-md ${
                      autoRotate
                        ? 'bg-amber-600/90 border-amber-500 text-white'
                        : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                    title="Tự động xoay 360°"
                  >
                    <RotateCcw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Bottom: Step-by-Step Pedagogical Flow Player */}
              <div className="bg-slate-900/95 border-t border-slate-800 p-4 shrink-0 shadow-2xl backdrop-blur-md">
                {/* Step Progress Bar & Controls */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 bg-amber-950/70 px-2.5 py-1 rounded-lg border border-amber-800/60">
                      Bước {activeStep.stepIndex} / {currentLesson.steps.length}
                    </span>
                    <h3 className="text-sm font-bold text-white">{activeStep.title}</h3>
                  </div>

                  {/* Step Navigation & Auto-play Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlayingSteps(!isPlayingSteps)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 ${
                        isPlayingSteps
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isPlayingSteps ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {isPlayingSteps ? 'Tạm dừng' : 'Tự động chạy'}
                    </button>
                    <button
                      onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                      disabled={currentStepIdx === 0}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentStepIdx((prev) =>
                          Math.min(currentLesson.steps.length - 1, prev + 1)
                        )
                      }
                      disabled={currentStepIdx === currentLesson.steps.length - 1}
                      className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium flex items-center gap-1 shadow-sm"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Step Details & Instruction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left: Mathematical Instruction & KaTeX */}
                  <div className="space-y-2">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {activeStep.instruction}
                    </p>
                    {activeStep.katexMath && (
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-amber-300 flex items-center justify-center font-serif text-sm">
                        <KaTeX math={activeStep.katexMath} />
                      </div>
                    )}
                  </div>

                  {/* Right: Student Interactive Prediction / Verification */}
                  <div>
                    {activeStep.studentInteractivePrompt ? (
                      <div className="bg-indigo-950/40 border border-indigo-800/60 p-3 rounded-xl space-y-2">
                        <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-amber-400" />
                          Học sinh tương tác: {activeStep.studentInteractivePrompt.question}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {activeStep.studentInteractivePrompt.options.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setStudentChoice(idx);
                                setIsAnswerSubmitted(false);
                              }}
                              className={`p-2 rounded-lg text-left border text-xs transition-all ${
                                studentChoice === idx
                                  ? 'bg-indigo-600 border-indigo-400 text-white font-medium'
                                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={handleStudentSubmit}
                            disabled={studentChoice === null}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs shadow-md transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Kiểm tra kết quả
                          </button>

                          {isAnswerSubmitted && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                              {studentChoice === activeStep.studentInteractivePrompt.correctIndex ? (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" /> Chính xác!
                                </span>
                              ) : (
                                <span className="text-rose-400 flex items-center gap-1">
                                  <XCircle className="w-4 h-4" /> Chưa đúng, em hãy thử lại!
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {isAnswerSubmitted && (
                          <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                            {activeStep.studentInteractivePrompt.explanation}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col justify-center bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl">
                        <div className="text-slate-400 text-[11px] uppercase font-semibold mb-1">
                          Tóm tắt kết quả hình học
                        </div>
                        <div className="text-amber-300 font-serif text-sm">
                          <KaTeX math={currentLesson.finalResultKaTeX} />
                        </div>
                        <div className="text-slate-400 text-[11px] mt-2">
                          Mô hình đang tô sáng đoạn <span className="text-amber-400 font-semibold">SA ⊥ (ABCD)</span> và hình chiếu <span className="text-amber-400 font-semibold">AC</span>.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Printable A4 Worksheet with QR Code */}
        {activeTab === 'worksheet' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950">
            {/* Left Config for Worksheet */}
            <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/60 p-4 space-y-4 overflow-y-auto">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Thiết lập phiếu học tập
              </h3>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Giáo viên biên soạn</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Lớp</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tên học sinh (Tùy chọn)</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Để trống nếu in phát cho cả lớp"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  In Phiếu Học Tập (Khổ A4)
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Đã sao chép liên kết!' : 'Sao chép link 3D tương tác'}
                </button>
              </div>

              {/* QR Code Preview */}
              {qrCodeUrl && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-2">
                  <div className="text-[11px] text-slate-400">Mã QR truy cập mô hình 3D</div>
                  <img src={qrCodeUrl} alt="QR Code 3D" className="w-36 h-36 mx-auto rounded-lg shadow-md" />
                  <div className="text-[10px] text-indigo-400">
                    Học sinh quét mã để mở ngay mô hình 3D trên điện thoại
                  </div>
                </div>
              )}
            </div>

            {/* Right: Realistic A4 Printable Page Preview */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto flex justify-center bg-slate-950">
              <div
                id="printable-worksheet"
                className="w-full max-w-3xl bg-white text-slate-900 p-8 rounded-xl shadow-2xl border border-slate-300 font-sans text-sm leading-relaxed"
                style={{ minHeight: '1000px' }}
              >
                {/* School & Header */}
                <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      SỞ GIÁO DỤC VÀ ĐÀO TẠO VĨNH LONG
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      TRƯỜNG THCS VÀ THPT LONG HIỆP
                    </div>
                    <div className="text-[11px] text-slate-600 italic">
                      Giáo viên: {teacherName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-indigo-900 uppercase">
                      PHIẾU HỌC TẬP HÌNH HỌC 3D
                    </div>
                    <div className="text-xs font-medium text-slate-600">
                      Chủ đề: Góc giữa đường thẳng và mặt phẳng
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-1">
                      Lớp: {className} {studentName ? `• Học sinh: ${studentName}` : '• Họ và tên: .......................................'}
                    </div>
                  </div>
                </div>

                {/* Problem Statement Box */}
                <div className="bg-slate-50 border border-slate-300 rounded-lg p-3.5 mb-4">
                  <div className="text-xs font-bold text-slate-900 uppercase mb-1 flex items-center gap-1.5">
                    <span>ĐỀ BÀI:</span>
                  </div>
                  <div className="text-xs text-slate-800 leading-relaxed font-serif text-justify">
                    {currentLesson.promptText}
                  </div>
                </div>

                {/* 3D Geometry Diagram and QR Side-by-Side */}
                <div className="grid grid-cols-3 gap-4 mb-5 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="col-span-2 text-center">
                    {snapshotImgUrl ? (
                      <img
                        src={snapshotImgUrl}
                        alt="3D Geometric Diagram"
                        className="max-h-56 mx-auto rounded border border-slate-300 shadow-sm"
                      />
                    ) : (
                      <div className="h-48 border border-dashed border-slate-300 rounded flex items-center justify-center text-xs text-slate-500">
                        (Mô hình 3D hình chóp S.ABCD và tam giác vuông SAC)
                      </div>
                    )}
                    <div className="text-[11px] text-slate-600 italic mt-1.5">
                      Hình 1: Mô hình không gian 3D với SA ⊥ (ABCD) và hình chiếu trực giao AC
                    </div>
                  </div>

                  <div className="col-span-1 text-center border-l border-slate-200 pl-3">
                    {qrCodeUrl && (
                      <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28 mx-auto border border-slate-300 rounded" />
                    )}
                    <div className="text-[10px] text-slate-700 font-semibold mt-1">
                      Quét mã xem 3D
                    </div>
                    <div className="text-[9px] text-slate-500">
                      Xoay 360° và kiểm chứng ngay
                    </div>
                  </div>
                </div>

                {/* Part 1: Guided Discovery Questions */}
                <div className="mb-4">
                  <div className="text-xs font-bold uppercase text-indigo-900 border-b border-indigo-200 pb-1 mb-2">
                    PHẦN I: HƯỚNG DẪN KHÁM PHÁ VÀ ĐIỀN KHUYẾT
                  </div>
                  <ol className="list-decimal list-inside text-xs space-y-2 text-slate-800">
                    <li>
                      Do <span className="font-serif">SA ⊥ (ABCD)</span>, nên hình chiếu trực giao của đỉnh <span className="font-serif">S</span> lên mặt phẳng <span className="font-serif">(ABCD)</span> là điểm: ....................
                    </li>
                    <li>
                      Điểm <span className="font-serif">C</span> thuộc mặt phẳng <span className="font-serif">(ABCD)</span>, do đó hình chiếu trực giao của đoạn <span className="font-serif">SC</span> lên <span className="font-serif">(ABCD)</span> là đoạn thẳng: ....................
                    </li>
                    <li>
                      Góc giữa đường thẳng <span className="font-serif">SC</span> và mặt phẳng đáy <span className="font-serif">(ABCD)</span> là góc: ....................
                    </li>
                    <li>
                      Tam giác <span className="font-serif">SAC</span> là tam giác gì? .................................................... Tại đỉnh nào? ....................
                    </li>
                    <li>
                      Độ dài đường chéo hình vuông đáy <span className="font-serif">AC =</span> ........................................................................
                    </li>
                  </ol>
                </div>

                {/* Part 2: Detailed Proof and Calculation Rubric */}
                <div>
                  <div className="text-xs font-bold uppercase text-indigo-900 border-b border-indigo-200 pb-1 mb-2">
                    PHẦN II: TRÌNH BÀY BÀI TOÁN VÀ TÍNH TOÁN
                  </div>
                  <div className="border border-slate-300 rounded-lg p-3 min-h-[140px] bg-slate-50/50">
                    <div className="text-[11px] text-slate-500 italic mb-2">
                      (Học sinh trình bày lời giải chi tiết và tính tan của góc theo hướng dẫn):
                    </div>
                    <div className="space-y-4">
                      <div className="border-b border-dotted border-slate-300 h-6" />
                      <div className="border-b border-dotted border-slate-300 h-6" />
                      <div className="border-b border-dotted border-slate-300 h-6" />
                      <div className="border-b border-dotted border-slate-300 h-6" />
                    </div>
                  </div>
                </div>

                {/* Footer notes */}
                <div className="mt-6 pt-3 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
                  <div>Học liệu số hóa môn Toán • Thiết kế bài học 3D tương tác</div>
                  <div>Trang 1/1</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Saved Lessons Repository */}
        {activeTab === 'saved' && (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Kho Giáo Án và Bài Học Đã Lưu</h3>
                  <p className="text-xs text-slate-400">
                    Quản lý các bài học hình học 3D đã thiết kế với đầy đủ ràng buộc toán học
                  </p>
                </div>
                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Xuất File JSON
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-bold text-indigo-300">{lesson.title}</h4>
                      <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                        {lesson.createdDate}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {lesson.promptText}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-serif">
                        <KaTeX math={lesson.finalResultKaTeX} />
                      </span>
                      <button
                        onClick={() => {
                          setCurrentLesson(lesson);
                          setCustomPrompt(lesson.promptText);
                          setCurrentStepIdx(0);
                          setActiveTab('designer');
                        }}
                        className="px-3 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium text-xs transition-all flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Mở Bài Học
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
