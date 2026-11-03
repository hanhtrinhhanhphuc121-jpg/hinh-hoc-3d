import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import confetti from 'canvas-confetti';
import {
  X,
  Gamepad2,
  Trophy,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flame,
  Award,
} from 'lucide-react';
import { allModels, getModelById } from '../models/modelRegistry';
import { KaTeX } from '../utils/katexRenderer';

interface InteractiveGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveGamesModal: React.FC<InteractiveGamesModalProps> = ({ isOpen, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Active game mode: 'euler' | 'section'
  const [gameMode, setGameMode] = useState<'euler' | 'section'>('euler');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Euler Game State
  const eulerModelPool = ['cube', 'tetrahedron', 'pyramid_quad', 'prism_tri', 'prism_regular', 'octahedron', 'icosahedron'];
  const [eulerIdx, setEulerIdx] = useState<number>(0);
  const [inputV, setInputV] = useState<string>('');
  const [inputE, setInputE] = useState<string>('');
  const [inputF, setInputF] = useState<string>('');
  const [eulerFeedback, setEulerFeedback] = useState<{ isChecked: boolean; isCorrect: boolean; msg: string }>({
    isChecked: false,
    isCorrect: false,
    msg: '',
  });

  // Section Game State
  const sectionQuestions = [
    {
      modelId: 'cube',
      title: 'Mặt phẳng đi qua 3 đỉnh B, D, C\' của hình lập phương ABCD.A\'B\'C\'D\' tạo thiết diện là hình gì?',
      options: ['Tam giác đều', 'Tam giác vuông', 'Hình chữ nhật', 'Hình bình hành'],
      correctIdx: 0,
      explanation: 'BD = DC\' = C\'B = a√2 (là 3 đường chéo của 3 mặt vuông bằng nhau), do đó thiết diện BDC\' là tam giác đều!',
    },
    {
      modelId: 'cube',
      title: 'Thiết diện lớn nhất khi cắt hình lập phương bởi một mặt phẳng có thể có tối đa bao nhiêu cạnh?',
      options: ['4 cạnh (Tứ giác)', '5 cạnh (Ngũ giác)', '6 cạnh (Lục giác)', '8 cạnh (Bát giác)'],
      correctIdx: 2,
      explanation: 'Hình lập phương có 6 mặt, mặt phẳng cắt qua tối đa 6 mặt nên thiết diện có tối đa 6 cạnh (lục giác lồi)!',
    },
    {
      modelId: 'pyramid_quad',
      title: 'Mặt phẳng đi qua đỉnh S và song song với cạnh đáy AB của hình chóp tứ giác đều S.ABCD cắt hình chóp tạo thiết diện là hình gì?',
      options: ['Tam giác cân', 'Tam giác đều', 'Hình thang', 'Hình chữ nhật'],
      correctIdx: 0,
      explanation: 'Mặt phẳng qua S và // AB chứa đường thẳng qua S song song AB, tạo thiết diện tam giác cân qua S!',
    },
  ];
  const [sectionQIdx, setSectionQIdx] = useState<number>(0);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [hasAnsweredSection, setHasAnsweredSection] = useState<boolean>(false);

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelMeshGroupRef = useRef<THREE.Group | null>(null);

  // Current active model
  const currentModelId = gameMode === 'euler' ? eulerModelPool[eulerIdx] : sectionQuestions[sectionQIdx].modelId;
  const currentModel = getModelById(currentModelId) || getModelById('cube');

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
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 6);
    scene.add(dirLight);

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

  // Update 3D Model
  useEffect(() => {
    if (!sceneRef.current || !currentModel) return;
    const scene = sceneRef.current;

    if (modelMeshGroupRef.current) {
      scene.remove(modelMeshGroupRef.current);
    }

    const group = new THREE.Group();
    modelMeshGroupRef.current = group;
    scene.add(group);

    const geoData = currentModel.generateGeometry(currentModel.defaultParams);
    const vertMap = new Map<string, [number, number, number]>();
    geoData.vertices.forEach((v) => vertMap.set(v.id, v.pos));

    // Faces
    const solidMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, // Violet
      roughness: 0.3,
      metalness: 0.15,
      transparent: true,
      opacity: 0.8,
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
        const mesh = new THREE.Mesh(geom, solidMat);
        group.add(mesh);
      }
    });

    // Edges
    const edgeCoords: number[] = [];
    geoData.edges.forEach((e) => {
      const p1 = vertMap.get(e.v1);
      const p2 = vertMap.get(e.v2);
      if (p1 && p2) edgeCoords.push(...p1, ...p2);
    });
    const edgeGeom = new THREE.BufferGeometry();
    edgeGeom.setAttribute('position', new THREE.Float32BufferAttribute(edgeCoords, 3));
    const edgeLine = new THREE.LineSegments(
      edgeGeom,
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    group.add(edgeLine);

    // Vertices
    geoData.vertices.forEach((vert) => {
      const sp = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      sp.position.set(...vert.pos);
      group.add(sp);
    });
  }, [currentModel]);

  // Check Euler Answer
  const handleCheckEuler = () => {
    const geoData = currentModel.generateGeometry(currentModel.defaultParams);
    const correctV = geoData.vertices.length;
    const correctE = geoData.edges.length;
    const correctF = geoData.faces.length;

    const valV = parseInt(inputV, 10);
    const valE = parseInt(inputE, 10);
    const valF = parseInt(inputF, 10);

    const isMatch = valV === correctV && valE === correctE && valF === correctF;
    const isEulerValid = valV - valE + valF === 2;

    if (isMatch) {
      setScore((s) => s + 100 + streak * 10);
      setStreak((st) => st + 1);
      setEulerFeedback({
        isChecked: true,
        isCorrect: true,
        msg: `Xuất sắc! Khối ${currentModel.name} có V = ${correctV}, E = ${correctE}, F = ${correctF}. Thỏa mãn định lý Euler: ${correctV} - ${correctE} + ${correctF} = 2!`,
      });
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } else {
      setStreak(0);
      setEulerFeedback({
        isChecked: true,
        isCorrect: false,
        msg: `Chưa chính xác. Đáp án đúng: Đỉnh V = ${correctV}, Cạnh E = ${correctE}, Mặt F = ${correctF}. Công thức Euler: ${correctV} - ${correctE} + ${correctF} = 2.`,
      });
    }
  };

  const handleNextEuler = () => {
    setEulerIdx((i) => (i + 1) % eulerModelPool.length);
    setInputV('');
    setInputE('');
    setInputF('');
    setEulerFeedback({ isChecked: false, isCorrect: false, msg: '' });
  };

  // Section Question Answer
  const handleAnswerSection = (idx: number) => {
    if (hasAnsweredSection) return;
    setSelectedOptIdx(idx);
    setHasAnsweredSection(true);
    const q = sectionQuestions[sectionQIdx];
    if (idx === q.correctIdx) {
      setScore((s) => s + 100 + streak * 10);
      setStreak((st) => st + 1);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } else {
      setStreak(0);
    }
  };

  const handleNextSectionQ = () => {
    setSectionQIdx((i) => (i + 1) % sectionQuestions.length);
    setSelectedOptIdx(null);
    setHasAnsweredSection(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="h-14 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Đấu Trường Hình Học 3D – Trò Chơi Tương Tác
                <span className="text-xs font-normal text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60">
                  Euler và Thiết Diện Siêu Tốc
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Score & Streak Badges */}
            <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Trophy className="w-4 h-4" />
                <span>{score} điểm</span>
              </div>
              {streak > 1 && (
                <div className="flex items-center gap-1 text-orange-400 font-bold border-l border-slate-800 pl-2">
                  <Flame className="w-4 h-4" />
                  <span>x{streak}</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Viewport */}
          <div className="relative flex-1 h-[50%] lg:h-full bg-slate-950">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-lg text-xs space-y-1 pointer-events-none">
              <div className="font-semibold text-purple-300">
                Mô hình: <span className="text-white">{currentModel.name}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Khối đa diện đang tự động xoay 360°. Bạn có thể dùng chuột kéo xoay để đếm đỉnh, cạnh, mặt.
              </div>
            </div>
          </div>

          {/* Right Controls & Quiz Card */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/95 overflow-y-auto p-5 flex flex-col gap-5">
            {/* Game mode tabs */}
            <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setGameMode('euler')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                  gameMode === 'euler' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Thử thách Euler (V - E + F = 2)
              </button>
              <button
                onClick={() => setGameMode('section')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                  gameMode === 'section' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Thiết diện siêu tốc
              </button>
            </div>

            {/* Game 1: Euler Polyhedron Challenge */}
            {gameMode === 'euler' && (
              <div className="space-y-4">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-300">
                    Quan sát khối 3D và điền số lượng:
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Số đỉnh (V)</label>
                      <input
                        type="number"
                        placeholder="V"
                        value={inputV}
                        onChange={(e) => setInputV(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center text-sm font-bold text-amber-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Số cạnh (E)</label>
                      <input
                        type="number"
                        placeholder="E"
                        value={inputE}
                        onChange={(e) => setInputE(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center text-sm font-bold text-cyan-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Số mặt (F)</label>
                      <input
                        type="number"
                        placeholder="F"
                        value={inputF}
                        onChange={(e) => setInputF(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center text-sm font-bold text-emerald-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {!eulerFeedback.isChecked ? (
                    <button
                      onClick={handleCheckEuler}
                      disabled={!inputV || !inputE || !inputF}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-xs font-bold text-white transition-colors shadow-sm shadow-purple-600/30"
                    >
                      Kiểm tra định lý Euler
                    </button>
                  ) : (
                    <button
                      onClick={handleNextEuler}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors"
                    >
                      Mô hình tiếp theo →
                    </button>
                  )}
                </div>

                {eulerFeedback.isChecked && (
                  <div
                    className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      eulerFeedback.isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {eulerFeedback.msg}
                  </div>
                )}
              </div>
            )}

            {/* Game 2: Section Prediction */}
            {gameMode === 'section' && (
              <div className="space-y-4">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-white leading-relaxed">
                    {sectionQuestions[sectionQIdx].title}
                  </div>

                  <div className="space-y-2">
                    {sectionQuestions[sectionQIdx].options.map((opt, oIdx) => {
                      const isChosen = selectedOptIdx === oIdx;
                      const isCorrect = oIdx === sectionQuestions[sectionQIdx].correctIdx;

                      let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';
                      if (hasAnsweredSection) {
                        if (isCorrect) btnStyle = 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold';
                        else if (isChosen) btnStyle = 'bg-rose-600/20 border-rose-500 text-rose-300 line-through';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={hasAnsweredSection}
                          onClick={() => handleAnswerSection(oIdx)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs border transition-colors flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {hasAnsweredSection && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {hasAnsweredSection && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {hasAnsweredSection && (
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                        <strong className="text-amber-400">Giải thích: </strong>
                        {sectionQuestions[sectionQIdx].explanation}
                      </div>

                      <button
                        onClick={handleNextSectionQ}
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors"
                      >
                        Câu tiếp theo →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
