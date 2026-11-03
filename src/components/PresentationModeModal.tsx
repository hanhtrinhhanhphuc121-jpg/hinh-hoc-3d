/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  X,
  Presentation,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  PenTool,
  Eraser,
  Maximize2,
  Minimize2,
  Sparkles,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { GeometryModel } from '../types/geometry';
import { KaTeX } from '../utils/katexRenderer';

interface PresentationSlide {
  title: string;
  subtitle: string;
  bulletPoints: string[];
  mathFormula?: string;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  highlightFace?: string;
}

interface PresentationModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: GeometryModel;
  params: Record<string, number>;
}

/**
 * Creates high-contrast vertex billboard text sprite
 */
function createVertexTextSprite(text: string, color = '#f8fafc', borderColor = '#6366f1'): THREE.Sprite {
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
    ctx.strokeStyle = borderColor;
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

export const PresentationModeModal: React.FC<PresentationModeModalProps> = ({
  isOpen,
  onClose,
  model,
  params,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasDrawRef = useRef<HTMLCanvasElement>(null);

  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>('#f59e0b'); // Amber default
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Generate dynamic pedagogical slides without '&'
  const slides: PresentationSlide[] = [
    {
      title: `1. Tổng Quan Về ${model.name.toUpperCase()}`,
      subtitle: 'Định nghĩa và Các yếu tố cấu thành cơ bản',
      bulletPoints: [
        `Khảo sát hình học không gian 3 chiều của ${model.name.toLowerCase()}.`,
        'Xác định số đỉnh, số cạnh, số mặt và các mặt đối diện.',
        'Quan sát hình thái từ góc nhìn phối cảnh không gian 360°.',
      ],
      cameraPos: [4.5, 3.2, 5.2],
      cameraTarget: [0, 0, 0],
    },
    {
      title: '2. Cấu Trúc Mặt Đáy và Cạnh Đáy',
      subtitle: 'Quan sát hình dạng và đặc tính mặt phẳng đáy',
      bulletPoints: [
        'Mặt phẳng đáy quyết định các tính chất đối xứng của khối hình.',
        'Đa giác hoặc đường tròn đáy với các kích thước tham số hóa.',
        'Quan hệ song song hoặc đồng quy giữa các cạnh đáy.',
      ],
      cameraPos: [0.1, 5.5, 0.1], // Top view
      cameraTarget: [0, 0, 0],
    },
    {
      title: '3. Chiều Cao và Trục Đối Xứng',
      subtitle: 'Đường cao vuông góc hạ từ đỉnh xuống đáy',
      bulletPoints: [
        'Chiều cao h là khoảng cách vuông góc từ đỉnh đến mặt đáy.',
        'Phân biệt giữa chiều cao vuông góc và đường sinh / cạnh bên.',
        'Chân đường cao là điểm then chốt để giải mọi bài toán khoảng cách và thể tích.',
      ],
      cameraPos: [5.2, 0.8, 0], // Side view
      cameraTarget: [0, 0, 0],
    },
    {
      title: '4. Hệ Thống Công Thức Tính Toán',
      subtitle: 'Diện tích xung quanh, toàn phần và thể tích',
      bulletPoints: [
        'Áp dụng công thức chuẩn bám sát sách giáo khoa.',
        'Tự động cập nhật kết quả thế số khi thay đổi kích thước tham số.',
      ],
      mathFormula:
        model.calculateFormulas(model.defaultParams, 'cm')[0]?.latexFormula ||
        'V = \\frac{1}{3} S_{\\text{đáy}} \\cdot h',
      cameraPos: [3.5, 2.5, 4.5],
      cameraTarget: [0, 0, 0],
    },
  ];

  const currentSlide = slides[currentSlideIdx];

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);

  // Drawing state
  const isMouseDownRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Helper to build 3D geometry of the current model
  const rebuildModel = useCallback((scene: THREE.Scene) => {
    if (!model) return;

    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
      modelGroupRef.current.traverse((child) => {
        if ((child as any).geometry) (child as any).geometry.dispose();
        if ((child as any).material) {
          if (Array.isArray((child as any).material)) {
            (child as any).material.forEach((m: any) => m.dispose());
          } else {
            (child as any).material.dispose();
          }
        }
      });
    }

    const group = new THREE.Group();
    modelGroupRef.current = group;
    scene.add(group);

    const geoData = model.generateGeometry(params);
    const vertMap = new Map<string, [number, number, number]>();
    geoData.vertices.forEach((v) => vertMap.set(v.id, v.pos));

    // 1. Faces with semi-transparent vivid indigo shading
    const faceMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5, // Indigo
      roughness: 0.25,
      metalness: 0.15,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });

    geoData.faces.forEach((face) => {
      const faceVerts = face.vertexIds
        .map((id: string) => vertMap.get(id))
        .filter(Boolean) as [number, number, number][];

      if (faceVerts.length >= 3) {
        const geom = new THREE.BufferGeometry();
        const posArray: number[] = [];
        for (let i = 1; i < faceVerts.length - 1; i++) {
          posArray.push(...faceVerts[0], ...faceVerts[i], ...faceVerts[i + 1]);
        }
        geom.setAttribute('position', new THREE.Float32BufferAttribute(posArray, 3));
        geom.computeVertexNormals();
        const mesh = new THREE.Mesh(geom, faceMat);
        group.add(mesh);
      }
    });

    // 2. Edges
    const edgeCoords: number[] = [];
    geoData.edges.forEach((e) => {
      const p1 = vertMap.get(e.v1);
      const p2 = vertMap.get(e.v2);
      if (p1 && p2) edgeCoords.push(...p1, ...p2);
    });

    if (edgeCoords.length > 0) {
      const edgeGeom = new THREE.BufferGeometry();
      edgeGeom.setAttribute('position', new THREE.Float32BufferAttribute(edgeCoords, 3));
      const edgeLines = new THREE.LineSegments(
        edgeGeom,
        new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2.5 })
      );
      group.add(edgeLines);
    }

    // 3. Vertices & Billboard Text Labels (Clean presentation without sampling dots)
    geoData.vertices.forEach((v) => {
      // Vertex Text Label for actual named vertices only
      if (v.name) {
        const textSprite = createVertexTextSprite(v.name, '#ffffff', '#f59e0b');
        textSprite.position.set(v.pos[0], v.pos[1] + 0.22, v.pos[2]);
        group.add(textSprite);
      }
    });

    // 4. Right angle markers
    if (geoData.rightAngleMarkers && geoData.rightAngleMarkers.length > 0) {
      geoData.rightAngleMarkers.forEach((ra) => {
        const p0 = new THREE.Vector3(...ra.vertex);
        const d1 = new THREE.Vector3(...ra.dir1).normalize().multiplyScalar(0.24);
        const d2 = new THREE.Vector3(...ra.dir2).normalize().multiplyScalar(0.24);

        const p1 = p0.clone().add(d1);
        const p2 = p0.clone().add(d1).add(d2);
        const p3 = p0.clone().add(d2);

        const raGeom = new THREE.BufferGeometry().setFromPoints([p1, p2, p3]);
        const raLine = new THREE.Line(
          raGeom,
          new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2.5 })
        );
        group.add(raLine);
      });
    }
  }, [model, params]);

  // Initialize Three.js scene and setup ResizeObserver
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;
    const container = mountRef.current;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(...currentSlide.cameraPos);
    camera.lookAt(...currentSlide.cameraTarget);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
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
    controls.target.set(...currentSlide.cameraTarget);
    controlsRef.current = controls;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambient);
    const dir1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dir1.position.set(5, 8, 6);
    scene.add(dir1);
    const dir2 = new THREE.DirectionalLight(0x60a5fa, 0.7);
    dir2.position.set(-5, -4, -6);
    scene.add(dir2);

    // Grid
    const grid = new THREE.GridHelper(8, 16, 0x1e293b, 0x0f172a);
    grid.position.y = -1.2;
    scene.add(grid);

    // Build the 3D geometry immediately
    rebuildModel(scene);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Auto-resize handler via ResizeObserver
    const handleResize = (w: number, h: number) => {
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      if (canvasDrawRef.current) {
        canvasDrawRef.current.width = w;
        canvasDrawRef.current.height = h;
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        handleResize(w, h);
      }
    });
    resizeObserver.observe(container);

    // Trigger immediate resize check in case container was laid out slightly late
    setTimeout(() => {
      if (container) {
        handleResize(container.clientWidth, container.clientHeight);
      }
    }, 100);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
      pmremGenerator.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isOpen, rebuildModel]);

  // Update geometry when model or params change while modal is open
  useEffect(() => {
    if (isOpen && sceneRef.current) {
      rebuildModel(sceneRef.current);
    }
  }, [isOpen, rebuildModel]);

  // Smooth camera transition on slide change
  useEffect(() => {
    if (cameraRef.current && controlsRef.current) {
      const targetPos = new THREE.Vector3(...currentSlide.cameraPos);
      const targetCenter = new THREE.Vector3(...currentSlide.cameraTarget);

      cameraRef.current.position.set(targetPos.x, targetPos.y, targetPos.z);
      controlsRef.current.target.set(targetCenter.x, targetCenter.y, targetCenter.z);
      controlsRef.current.update();
    }
  }, [currentSlideIdx, currentSlide]);

  // Auto play slideshow
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  // Whiteboard drawing handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !canvasDrawRef.current) return;
    isMouseDownRef.current = true;
    const rect = canvasDrawRef.current.getBoundingClientRect();
    lastPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !isMouseDownRef.current || !canvasDrawRef.current || !lastPosRef.current) return;
    const ctx = canvasDrawRef.current.getContext('2d');
    if (!ctx) return;

    const rect = canvasDrawRef.current.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    lastPosRef.current = { x: currX, y: currY };
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    lastPosRef.current = null;
  };

  const handleClearDraw = () => {
    if (canvasDrawRef.current) {
      const ctx = canvasDrawRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasDrawRef.current.width, canvasDrawRef.current.height);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full h-full flex flex-col overflow-hidden text-slate-100">
        {/* Top Minimal Presentation Bar */}
        <div className="h-14 border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Presentation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">
                Chế Độ Trình Chiếu Bài Giảng 3D
              </span>
              <span className="text-xs text-indigo-400 ml-2 font-medium">
                • {model.name}
              </span>
            </div>
          </div>

          {/* Teacher Drawing and Controls Toolbar */}
          <div className="flex items-center gap-3">
            {/* Whiteboard Pen Toolbar */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setIsDrawingMode(!isDrawingMode)}
                className={`p-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  isDrawingMode ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Bút vẽ phấn ảo"
              >
                <PenTool className="w-4 h-4" />
                <span className="hidden sm:inline">Bút phấn</span>
              </button>

              {isDrawingMode && (
                <>
                  <div className="flex items-center gap-1 px-1">
                    {['#f59e0b', '#ef4444', '#10b981', '#3b82f6'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setPenColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-4 h-4 rounded-full border ${penColor === c ? 'border-white scale-125' : 'border-transparent'}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleClearDraw}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Xóa nét vẽ"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Slideshow Auto Play */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title={isPlaying ? 'Tạm dừng chiếu' : 'Tự động phát'}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Toàn màn hình"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Presentation Stage */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          {/* 3D Viewport */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Virtual Whiteboard Transparent Canvas Layer */}
          <canvas
            ref={canvasDrawRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`absolute inset-0 w-full h-full ${
              isDrawingMode ? 'cursor-crosshair z-10 pointer-events-auto' : 'pointer-events-none'
            }`}
          />

          {/* Floating High-Contrast Lecture Slide Card (Left Top) */}
          <div className="absolute top-6 left-6 max-w-md bg-slate-950/85 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-3 pointer-events-auto select-none">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                Slide {currentSlideIdx + 1} / {slides.length}
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">{currentSlide.title}</h3>
              <p className="text-xs text-slate-400">{currentSlide.subtitle}</p>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-300">
              {currentSlide.bulletPoints.map((bp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{bp}</span>
                </li>
              ))}
            </ul>

            {currentSlide.mathFormula && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-amber-300 text-sm">
                <KaTeX math={currentSlide.mathFormula} block />
              </div>
            )}
          </div>

          {/* Bottom Slide Navigation Bar */}
          <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-4 z-20 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 shadow-xl">
              <button
                disabled={currentSlideIdx === 0}
                onClick={() => setCurrentSlideIdx((i) => Math.max(0, i - 1))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition-colors"
                title="Slide trước (Mũi tên trái)"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlideIdx(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      currentSlideIdx === i ? 'w-8 bg-indigo-500' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>

              <button
                disabled={currentSlideIdx === slides.length - 1}
                onClick={() => setCurrentSlideIdx((i) => Math.min(slides.length - 1, i + 1))}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors shadow-sm shadow-indigo-600/30"
                title="Slide tiếp (Mũi tên phải)"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
