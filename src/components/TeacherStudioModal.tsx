import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  X,
  GraduationCap,
  Sliders,
  Type,
  Square,
  Eye,
  Check,
  Plus,
  Trash2,
  Save,
  FolderOpen,
  Download,
  FileText,
  Printer,
  Sparkles,
  Layers,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { GeometryModel } from '../types/geometry';
import {
  TeacherLessonConfig,
  TeacherQuestion,
  CustomRightAngleMarker,
  EdgeStyleOverride,
} from '../types/teacher';
import { defaultTeacherPresets } from '../data/teacherPresets';
import { getModelById, allModels } from '../models/modelRegistry';
import { computeEdgeVisibilities } from '../utils/hiddenLineDetector';
import { exportCanvasAsPNG } from '../utils/exportUtils';
import { KaTeX } from '../utils/katexRenderer';

interface TeacherStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: GeometryModel;
  onApplyConfigToMain?: (config: TeacherLessonConfig) => void;
}

export const TeacherStudioModal: React.FC<TeacherStudioModalProps> = ({
  isOpen,
  onClose,
  currentModel: initialModel,
  onApplyConfigToMain,
}) => {
  // Current active teacher lesson config
  const [lessonConfig, setLessonConfig] = useState<TeacherLessonConfig>(() => {
    const saved = localStorage.getItem('hinhhoc3d_teacher_active_lesson');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return defaultTeacherPresets[0];
  });

  const [activeTab, setActiveTab] = useState<'params' | 'vertices' | 'edges' | 'angles' | 'faces' | 'questions' | 'export'>('params');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('thao_preset_1');

  // Question editing form state
  const [editingQuestion, setEditingQuestion] = useState<TeacherQuestion>({
    id: `q_${Date.now()}`,
    title: 'Câu hỏi hình học không gian',
    prompt: '',
    options: [
      { id: 'A', text: '', isCorrect: true },
      { id: 'B', text: '', isCorrect: false },
      { id: 'C', text: '', isCorrect: false },
      { id: 'D', text: '', isCorrect: false },
    ],
    solution: '',
    grade: 'THPT',
    topic: 'Thể tích khối đa diện',
  });

  // Three.js Canvas Refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);

  // Selected element in teacher mode
  const [selectedElemId, setSelectedElemId] = useState<string | null>(null);

  // Current active model
  const activeModel = getModelById(lessonConfig.modelId);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('hinhhoc3d_teacher_active_lesson', JSON.stringify(lessonConfig));
  }, [lessonConfig]);

  // Load Preset
  const handleLoadPreset = (preset: TeacherLessonConfig) => {
    setLessonConfig({ ...preset });
    setSelectedPresetId(preset.id);
  };

  // Switch Model in Teacher Studio
  const handleModelChange = (newModelId: string) => {
    const newModel = getModelById(newModelId);
    setLessonConfig((prev) => ({
      ...prev,
      modelId: newModelId,
      params: { ...newModel.defaultParams },
      vertexRenames: {},
      edgeOverrides: {},
      rightAngleMarkers: [],
      highlightedFaces: [],
    }));
  };

  // Param update
  const handleParamChange = (paramId: string, val: number) => {
    setLessonConfig((prev) => ({
      ...prev,
      params: {
        ...prev.params,
        [paramId]: val,
      },
    }));
  };

  // Vertex rename
  const handleRenameVertex = (vId: string, newName: string) => {
    setLessonConfig((prev) => ({
      ...prev,
      vertexRenames: {
        ...prev.vertexRenames,
        [vId]: newName,
      },
    }));
  };

  // Edge style override toggle
  const handleToggleEdgeStyle = (edgeId: string) => {
    const current = lessonConfig.edgeOverrides[edgeId] || 'auto';
    const nextStyle: EdgeStyleOverride =
      current === 'auto' ? 'dashed' : current === 'dashed' ? 'solid' : 'auto';

    setLessonConfig((prev) => ({
      ...prev,
      edgeOverrides: {
        ...prev.edgeOverrides,
        [edgeId]: nextStyle,
      },
    }));
  };

  // Face highlight toggle
  const handleToggleFaceHighlight = (faceId: string) => {
    setLessonConfig((prev) => {
      const exists = prev.highlightedFaces.includes(faceId);
      return {
        ...prev,
        highlightedFaces: exists
          ? prev.highlightedFaces.filter((id) => id !== faceId)
          : [...prev.highlightedFaces, faceId],
      };
    });
  };

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
      preserveDrawingBuffer: true, // Needed for PNG export
      alpha: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);

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

  // Rebuild 3D Scene when config changes
  const rebuild3DScene = useCallback(() => {
    if (!modelGroupRef.current || !cameraRef.current) return;
    const group = modelGroupRef.current;

    while (group.children.length > 0) {
      const obj = group.children[0] as any;
      if (obj.geometry) obj.geometry.dispose();
      group.remove(obj);
    }

    const { vertices, edges, faces } = activeModel.generateGeometry(lessonConfig.params);
    const cameraPos = cameraRef.current.position;

    // Evaluated edges (dynamic camera raycast)
    const evaluatedEdges = computeEdgeVisibilities(
      vertices,
      edges,
      faces,
      cameraPos,
      group.matrixWorld
    );

    const vertMap = new Map<string, THREE.Vector3>();
    for (const v of vertices) {
      vertMap.set(v.id, new THREE.Vector3(...v.pos));
    }

    // 1. Faces
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

      const isHighlighted = lessonConfig.highlightedFaces.includes(face.id);

      const faceMat = new THREE.MeshStandardMaterial({
        color: isHighlighted ? 0x10b981 : 0xffffff, // White clean face for textbook look or emerald for highlighted
        roughness: 0.3,
        metalness: 0.05,
        transparent: true,
        opacity: isHighlighted ? 0.75 : 0.35,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });

      const mesh = new THREE.Mesh(faceGeo, faceMat);
      mesh.userData = { type: 'face', id: face.id };
      group.add(mesh);
    }

    // 2. Edges (strictly adhering to overrides and dynamic visibility)
    for (const edge of evaluatedEdges) {
      const p1 = new THREE.Vector3(...edge.v1);
      const p2 = new THREE.Vector3(...edge.v2);

      const override = lessonConfig.edgeOverrides[edge.id] || 'auto';
      let isSolid = true;
      if (override === 'solid') {
        isSolid = true;
      } else if (override === 'dashed') {
        isSolid = false;
      } else {
        isSolid = edge.isVisible;
      }

      const geom = new THREE.BufferGeometry().setFromPoints([p1, p2]);

      if (isSolid) {
        const mat = new THREE.LineBasicMaterial({
          color: 0x0f172a, // Crisp black stroke for test papers
          linewidth: 2.5,
        });
        const line = new THREE.Line(geom, mat);
        line.userData = { type: 'edge', id: edge.id };
        group.add(line);
      } else {
        const dashedMat = new THREE.LineDashedMaterial({
          color: 0x475569, // Dark slate dashed line for exam print
          dashSize: 0.22,
          gapSize: 0.14,
          linewidth: 1.5,
        });
        const line = new THREE.LineSegments(geom, dashedMat);
        line.computeLineDistances();
        line.userData = { type: 'edge', id: edge.id };
        group.add(line);
      }
    }

    // 3. Right-Angle Markers (Custom + Default)
    const allMarkers = [...(lessonConfig.rightAngleMarkers || [])];
    for (const m of allMarkers) {
      const s = 0.32;
      const v = new THREE.Vector3(...m.pos);
      const d1 = new THREE.Vector3(...m.dir1).normalize().multiplyScalar(s);
      const d2 = new THREE.Vector3(...m.dir2).normalize().multiplyScalar(s);
      const p1 = v.clone().add(d1);
      const p2 = v.clone().add(d1).add(d2);
      const p3 = v.clone().add(d2);

      const cornerGeo = new THREE.BufferGeometry().setFromPoints([p1, p2, p3]);
      const cornerMat = new THREE.LineBasicMaterial({
        color: 0x0f172a, // Solid black right-angle mark
        linewidth: 2,
      });
      group.add(new THREE.Line(cornerGeo, cornerMat));
    }
  }, [activeModel, lessonConfig]);

  useEffect(() => {
    rebuild3DScene();
  }, [rebuild3DScene]);

  // Hook controls to dynamic edges
  useEffect(() => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    const handleChange = () => rebuild3DScene();
    ctrl.addEventListener('change', handleChange);
    return () => ctrl.removeEventListener('change', handleChange);
  }, [rebuild3DScene]);

  // Export Diagram PNG
  const handleExportTestPNG = () => {
    if (!rendererRef.current) return;
    exportCanvasAsPNG(
      rendererRef.current.domElement,
      {
        background: 'white',
        blackLines: true,
        includeLabels: true,
        scaleFactor: 3,
        title: `${lessonConfig.title} - GV: ${lessonConfig.author}`,
      },
      `${lessonConfig.id}_de_thi.png`
    );
  };

  // Auto-generate exam question from current live measurements
  const handleAutoGenerateQuestion = () => {
    const formulas = activeModel.calculateFormulas(lessonConfig.params, 'cm');
    const vol = formulas.find((f) => f.latexSymbol === 'V');
    const sxq = formulas.find((f) => f.latexSymbol === 'S_{xq}');

    if (vol) {
      const vVal = vol.result;
      setEditingQuestion({
        id: `q_${Date.now()}`,
        title: `Tính thể tích của ${activeModel.name}`,
        grade: activeModel.gradeLevel === 'THCS' ? 'THCS' : 'THPT',
        topic: 'Bài toán thể tích hình học không gian',
        prompt: `Cho ${activeModel.name.toLowerCase()} với các kích thước đã cho trên hình vẽ. Thể tích V của khối này bằng:`,
        options: [
          { id: 'A', text: `${vVal} cm³`, isCorrect: true },
          { id: 'B', text: `${(vVal * 1.5).toFixed(1)} cm³`, isCorrect: false },
          { id: 'C', text: `${(vVal * 0.5).toFixed(1)} cm³`, isCorrect: false },
          { id: 'D', text: `${(vVal * 2).toFixed(1)} cm³`, isCorrect: false },
        ],
        solution: `Áp dụng công thức thể tích: ${vol.latexFormula}. Thay số: ${vol.substitution} = ${vVal} cm³.`,
      });
    }
  };

  // Save question to lesson config
  const handleSaveQuestion = () => {
    if (!editingQuestion.prompt) return;
    setLessonConfig((prev) => ({
      ...prev,
      questions: [...prev.questions.filter((q) => q.id !== editingQuestion.id), editingQuestion],
    }));
  };

  // Delete question
  const handleDeleteQuestion = (qId: string) => {
    setLessonConfig((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== qId),
    }));
  };

  // Print Exam Paper
  const handlePrintExam = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dataUrl = rendererRef.current?.domElement.toDataURL('image/png') || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${lessonConfig.title} - ${lessonConfig.school}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 40px; color: #000; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
            .header-left { text-align: center; }
            .header-right { text-align: center; font-weight: bold; }
            .title { text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; text-transform: uppercase; }
            .meta { font-style: italic; text-align: center; margin-bottom: 25px; }
            .diagram-box { text-align: center; margin: 20px 0; }
            .diagram-box img { max-width: 420px; height: auto; border: 1px dashed #666; }
            .question { margin-bottom: 25px; page-break-inside: avoid; }
            .q-title { font-weight: bold; }
            .options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; padding-left: 20px; }
            .solution { background: #f8f9fa; border-left: 4px solid #333; padding: 10px 15px; margin-top: 15px; font-size: 14px; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #0f172a; color: white; border: none; border-radius: 6px;">In Đề Thi và Lời Giải</button>
          </div>
          <div class="header">
            <div class="header-left">
              <div>SỞ GD VÀ ĐT VĨNH LONG</div>
              <div style="font-weight: bold;">TRƯỜNG THCS VÀ THPT LONG HIỆP</div>
              <div>Giáo viên: <strong>${lessonConfig.author}</strong></div>
            </div>
            <div class="header-right">
              <div>ĐỀ BÀI TẬP VÀ KIỂM TRA HÌNH HỌC 3D</div>
              <div>Năm học 2026 - 2027</div>
              <div>Môn: Toán học</div>
            </div>
          </div>

          <div class="title">${lessonConfig.title}</div>
          <div class="meta">Mô hình: ${activeModel.name} | Ngày soạn: ${lessonConfig.createdDate}</div>

          <div class="diagram-box">
            <img src="${dataUrl}" alt="Hình vẽ minh họa đề thi" />
            <div style="font-size: 13px; font-style: italic; margin-top: 6px;">Hình vẽ minh họa (GV: ${lessonConfig.author})</div>
          </div>

          <div style="font-weight: bold; margin-bottom: 15px; text-decoration: underline;">PHẦN CÂU HỎI TRẮC NGHIỆM:</div>

          ${lessonConfig.questions
            .map(
              (q, idx) => `
            <div class="question">
              <div class="q-title">Câu ${idx + 1}: ${q.prompt}</div>
              <div class="options">
                ${q.options.map((opt) => `<div><strong>${opt.id}.</strong> ${opt.text}</div>`).join('')}
              </div>
            </div>
          `
            )
            .join('')}

          <div style="page-break-before: always; margin-top: 40px;"></div>
          <div class="title" style="margin-top: 30px;">HƯỚNG DẪN GIẢI CHI TIẾT VÀ ĐÁP ÁN</div>

          ${lessonConfig.questions
            .map((q, idx) => {
              const correct = q.options.find((o) => o.isCorrect);
              return `
              <div class="question">
                <div class="q-title">Câu ${idx + 1}: Đáp án đúng: <span style="color: #059669; font-size: 18px;">${correct?.id} (${correct?.text})</span></div>
                <div class="solution">
                  <strong>Lời giải chi tiết:</strong><br/>
                  ${q.solution}
                </div>
              </div>
            `;
            })
            .join('')}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  const { vertices, edges, faces } = activeModel.generateGeometry(lessonConfig.params);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-7xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[96vh]">
        {/* Header with Teacher Credit */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Chế Độ Giáo Viên – Soạn Giảng và Thiết Kế Đề Thi
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono">
                  Chuẩn Sư Phạm
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Giáo viên phát triển:{' '}
                <strong className="text-indigo-300 font-semibold">
                  Cao Thị Thu Thảo
                </strong>{' '}
                (GV trường THCS và THPT Long Hiệp)
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintExam}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
              title="In đề thi và lời giải chi tiết"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In đề thi và Lời giải</span>
            </button>

            <button
              onClick={handleExportTestPNG}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all"
              title="Xuất hình PNG nền trắng nét đen in đề"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất ảnh PNG</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-toolbar: Preset Selector + Tool Tabs */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Giáo án mẫu:</span>
            <select
              value={selectedPresetId}
              onChange={(e) => {
                const found = defaultTeacherPresets.find((p) => p.id === e.target.value);
                if (found) handleLoadPreset(found);
              }}
              className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              {defaultTeacherPresets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Tool Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto bg-slate-900 p-1 rounded-lg border border-slate-800">
            {[
              { id: 'params', label: '1. Kích thước tùy chọn' },
              { id: 'vertices', label: '2. Đặt tên đỉnh' },
              { id: 'edges', label: '3. Nét khuất / Nét liền' },
              { id: 'angles', label: '4. Đánh dấu góc vuông' },
              { id: 'faces', label: '5. Tô sáng mặt phẳng' },
              { id: 'questions', label: '6. Soạn câu hỏi và Lời giải' },
              { id: 'export', label: '7. Xuất đề thi' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2.5 py-1 rounded font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: 3D Stage (Left 55%) + Teacher Control Deck (Right 45%) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left: 3D Whiteboard Canvas (Textbook Technical Print Style) */}
          <div className="lg:col-span-7 relative bg-white flex flex-col min-h-[340px] sm:min-h-[440px] border-r border-slate-300">
            <div ref={mountRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing" />

            {/* Overlay Info */}
            <div className="absolute top-3 left-3 bg-white/90 border border-slate-300 px-3 py-1.5 rounded-lg text-xs text-slate-900 shadow-sm pointer-events-none font-medium">
              <span>{activeModel.name}</span> · <span className="font-mono text-slate-600">{lessonConfig.title}</span>
            </div>

            <div className="absolute bottom-3 left-3 bg-white/90 border border-slate-300 px-2.5 py-1 rounded text-[11px] text-slate-600 font-mono pointer-events-none">
              Nền trắng nét đen chuẩn máy in đề thi
            </div>
          </div>

          {/* Right: Teacher Tool Deck */}
          <div className="lg:col-span-5 bg-slate-900/95 flex flex-col overflow-y-auto p-5 space-y-4 text-xs">
            {/* TAB 1: KÍCH THƯỚC TÙY CHỌN */}
            {activeTab === 'params' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    1. Thiết lập hình học và Kích thước tùy chọn
                  </h3>
                  <p className="text-slate-400 text-[11px]">
                    Chọn mô hình không gian và nhập kích thước mong muốn cho bài thi
                  </p>
                </div>

                {/* Model switcher */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Chọn khối đa diện / tròn xoay:</label>
                  <select
                    value={lessonConfig.modelId}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {allModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.categoryName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Parameter sliders and number inputs */}
                <div className="space-y-3 pt-2">
                  <span className="text-slate-300 font-semibold block">Các thông số kích thước:</span>
                  {activeModel.params.map((p) => {
                    const currentVal = lessonConfig.params[p.id] ?? p.default;
                    return (
                      <div key={p.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-medium">{p.label}:</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={p.min}
                              max={p.max}
                              step={p.step}
                              value={currentVal}
                              onChange={(e) => handleParamChange(p.id, parseFloat(e.target.value) || p.default)}
                              className="w-16 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-right font-mono font-bold text-indigo-400 text-xs"
                            />
                            <span className="text-slate-400 font-mono">{p.unit || ''}</span>
                          </div>
                        </div>

                        <input
                          type="range"
                          min={p.min}
                          max={p.max}
                          step={p.step}
                          value={currentVal}
                          onChange={(e) => handleParamChange(p.id, parseFloat(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: ĐẶT TÊN ĐỈNH */}
            {activeTab === 'vertices' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    2. Đặt tên đỉnh theo quy ước đề bài
                  </h3>
                  <p className="text-slate-400 text-[11px]">
                    Đổi tên các đỉnh để phù hợp với đề kiểm tra (ví dụ: đổi A, B, C sang S, M, N, P...)
                  </p>
                </div>

                <div className="space-y-2">
                  {vertices.map((v) => {
                    const currentCustomName = lessonConfig.vertexRenames[v.id] || v.name || v.id;
                    return (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-mono font-bold">
                            {v.id}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            Tọa độ: ({v.pos.map((n) => n.toFixed(1)).join(', ')})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">Tên hiển thị:</span>
                          <input
                            type="text"
                            maxLength={4}
                            value={currentCustomName}
                            onChange={(e) => handleRenameVertex(v.id, e.target.value)}
                            className="w-16 px-2 py-1 bg-slate-900 border border-indigo-500/50 rounded font-bold font-mono text-center text-white text-xs focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CHỌN NÉT KHUẤT / NÉT LIỀN */}
            {activeTab === 'edges' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    3. Thiết lập nét thấy và nét khuất từng cạnh
                  </h3>
                  <p className="text-slate-400 text-[11px]">
                    Chủ động gán nét đứt hoặc nét liền cố định cho từng đoạn thẳng theo yêu cầu vẽ hình đề thi
                  </p>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {edges.map((e) => {
                    const override = lessonConfig.edgeOverrides[e.id] || 'auto';
                    return (
                      <div
                        key={e.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800"
                      >
                        <div>
                          <span className="font-bold text-white">{e.name || e.id}</span>
                          <span className="text-slate-500 text-[10px] ml-2 font-mono">
                            ({e.v1} - {e.v2})
                          </span>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                          <button
                            onClick={() =>
                              setLessonConfig((prev) => ({
                                ...prev,
                                edgeOverrides: { ...prev.edgeOverrides, [e.id]: 'auto' },
                              }))
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                              override === 'auto' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Tự động
                          </button>
                          <button
                            onClick={() =>
                              setLessonConfig((prev) => ({
                                ...prev,
                                edgeOverrides: { ...prev.edgeOverrides, [e.id]: 'solid' },
                              }))
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                              override === 'solid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Nét liền (—)
                          </button>
                          <button
                            onClick={() =>
                              setLessonConfig((prev) => ({
                                ...prev,
                                edgeOverrides: { ...prev.edgeOverrides, [e.id]: 'dashed' },
                              }))
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                              override === 'dashed' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Nét đứt (---)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: ĐÁNH DẤU GÓC VUÔNG */}
            {activeTab === 'angles' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    4. Đánh dấu ký hiệu góc vuông
                  </h3>
                  <p className="text-slate-400 text-[11px]">
                    Tuân thủ quy tắc toán học: Chỉ hiển thị ký hiệu góc vuông trên các đường thẳng đã được chứng minh hoặc giả thiết vuông góc
                  </p>
                </div>

                <div className="space-y-2">
                  {lessonConfig.rightAngleMarkers.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Square className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{m.description}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Đỉnh: {m.vertexId} | Cạnh: {m.edge1Id} và {m.edge2Id}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          setLessonConfig((prev) => ({
                            ...prev,
                            rightAngleMarkers: prev.rightAngleMarkers.filter((r) => r.id !== m.id),
                          }))
                        }
                        className="p-1 text-rose-400 hover:bg-rose-950/50 rounded"
                        title="Xóa ký hiệu góc vuông này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {lessonConfig.rightAngleMarkers.length === 0 && (
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-slate-500">
                      Chưa có ký hiệu góc vuông nào được đánh dấu.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: TÔ SÁNG MẶT PHẲNG */}
            {activeTab === 'faces' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    5. Tô sáng mặt phẳng và Thiết diện
                  </h3>
                  <p className="text-slate-400 text-[11px]">
                    Tô màu làm nổi bật mặt phẳng đáy hoặc mặt bên phục vụ bài toán góc và khoảng cách
                  </p>
                </div>

                <div className="space-y-2">
                  {faces.map((f) => {
                    const isHighlighted = lessonConfig.highlightedFaces.includes(f.id);
                    return (
                      <button
                        key={f.id}
                        onClick={() => handleToggleFaceHighlight(f.id)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isHighlighted
                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <span className="font-bold">{f.name || f.id}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Đỉnh tạo mặt: {f.vertexIds.join(', ')}
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isHighlighted ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isHighlighted ? 'Đang tô sáng' : 'Chưa chọn'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 6: SOẠN CÂU HỎI VÀ LỜI GIẢI */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">
                      6. Soạn câu hỏi trắc nghiệm và Lời giải
                    </h3>
                    <p className="text-slate-400 text-[11px]">
                      Gắn câu hỏi trực tiếp với các số đo hình học thực tế
                    </p>
                  </div>

                  <button
                    onClick={handleAutoGenerateQuestion}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-600/40 font-semibold"
                    title="Tự động tính toán số liệu và sinh câu hỏi thể tích chuẩn xác"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tự động tạo câu hỏi</span>
                  </button>
                </div>

                {/* Question Form */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Đề bài:</label>
                    <textarea
                      rows={2}
                      value={editingQuestion.prompt}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, prompt: e.target.value })}
                      placeholder="Nhập nội dung câu hỏi bài tập..."
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* 4 Options */}
                  <div className="grid grid-cols-2 gap-2">
                    {editingQuestion.options.map((opt, i) => (
                      <div key={opt.id} className="flex items-center gap-1.5">
                        <span className="font-bold font-mono text-slate-400">{opt.id}:</span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...editingQuestion.options];
                            newOpts[i].text = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                          }}
                          placeholder={`Đáp án ${opt.id}`}
                          className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newOpts = editingQuestion.options.map((o) => ({
                              ...o,
                              isCorrect: o.id === opt.id,
                            }));
                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                          }}
                          className={`p-1 rounded text-[10px] font-bold ${
                            opt.isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                          title="Chọn đáp án đúng"
                        >
                          {opt.isCorrect ? 'ĐÚNG' : 'SAI'}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Lời giải chi tiết và Công thức KaTeX:
                    </label>
                    <textarea
                      rows={2}
                      value={editingQuestion.solution}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, solution: e.target.value })}
                      placeholder="Trình bày các bước thay số và định lý..."
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    onClick={handleSaveQuestion}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-md"
                  >
                    Lưu câu hỏi vào bài giảng
                  </button>
                </div>

                {/* List of authored questions */}
                <div className="space-y-2 pt-2">
                  <span className="text-slate-300 font-semibold block">
                    Danh sách câu hỏi trong đề ({lessonConfig.questions.length}):
                  </span>
                  {lessonConfig.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-white mb-0.5">
                          Câu {idx + 1}: {q.title}
                        </div>
                        <p className="text-slate-400 line-clamp-1 text-[11px]">{q.prompt}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-rose-400 hover:text-rose-300 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: XUẤT ĐỀ THI VÀ LỜI GIẢI */}
            {activeTab === 'export' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    7. Xuất đề thi in ấn và Hướng dẫn chấm
                  </h3>
                  <p className="text-slate-400 text-[11px]">
                    Xuất bài tập chuẩn hóa gồm tiêu đề trường, hình vẽ minh họa, đề bài và đáp án chi tiết
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Đơn vị:</span>
                    <span className="font-bold text-white">{lessonConfig.school}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Giáo viên phát triển:</span>
                    <span className="font-bold text-indigo-400">{lessonConfig.author}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Số lượng câu hỏi:</span>
                    <span className="font-bold text-white">{lessonConfig.questions.length} câu</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mô hình hình học:</span>
                    <span className="font-bold text-white">{activeModel.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handlePrintExam}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In đề thi và Lời giải</span>
                  </button>

                  <button
                    onClick={handleExportTestPNG}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải hình PNG nét đen</span>
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
