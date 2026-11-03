import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Download,
  Info,
  CheckCircle2,
  Box,
  Sliders,
  Sparkles,
  Maximize2,
  Layers,
} from 'lucide-react';
import { GeometryModel } from '../types/geometry';
import { build3DUnfoldingScene } from '../utils/unfolding3DBuilder';
import { exportSvgNet } from '../utils/exportUtils';
import { KaTeX } from '../utils/katexRenderer';

interface UnfoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: GeometryModel;
  params: Record<string, number>;
  onParamsChange?: (newParams: Record<string, number>) => void;
}

export const UnfoldingModal: React.FC<UnfoldingModalProps> = ({
  isOpen,
  onClose,
  model,
  params: initialParams,
  onParamsChange,
}) => {
  const [progress, setProgress] = useState(0); // 0 (folded 3D) -> 100 (flat 2D net)
  const [isPlaying, setIsPlaying] = useState(false);
  const [direction, setDirection] = useState<'open' | 'close'>('open');
  const [speed, setSpeed] = useState<number>(1);
  const [activeViewTab, setActiveViewTab] = useState<'3d' | '2d'>('3d');
  const [localParams, setLocalParams] = useState<Record<string, number>>(initialParams);

  // Sync initial params when opened
  useEffect(() => {
    setLocalParams(initialParams);
  }, [initialParams, isOpen]);

  const updateParam = (key: string, val: number) => {
    const updated = { ...localParams, [key]: val };
    setLocalParams(updated);
    if (onParamsChange) {
      onParamsChange(updated);
    }
  };

  // Three.js viewport refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Animation Playback loop
  useEffect(() => {
    let animId: any = null;
    if (isPlaying) {
      animId = setInterval(() => {
        setProgress((prev) => {
          const step = 1.2 * speed;
          if (direction === 'open') {
            if (prev >= 100) {
              setIsPlaying(false);
              return 100;
            }
            return Math.min(100, prev + step);
          } else {
            if (prev <= 0) {
              setIsPlaying(false);
              return 0;
            }
            return Math.max(0, prev - step);
          }
        });
      }, 25);
    }
    return () => clearInterval(animId);
  }, [isPlaying, direction, speed]);

  // Three.js Scene Setup
  useEffect(() => {
    if (!isOpen || activeViewTab !== '3d' || !mountRef.current) return;
    const container = mountRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(7, 8, 8);
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

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(8, 12, 10);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    fillLight.position.set(-8, -5, -6);
    scene.add(fillLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controlsRef.current = controls;

    // Group for dynamic unfolding meshes & lines
    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    dynamicGroupRef.current = dynamicGroup;

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
  }, [isOpen, activeViewTab]);

  // Rebuild 3D Unfolding geometry whenever progress or localParams change
  useEffect(() => {
    if (!dynamicGroupRef.current) return;
    const group = dynamicGroupRef.current;

    // Clear previous children
    while (group.children.length > 0) {
      const obj = group.children[0] as any;
      if (obj.geometry) obj.geometry.dispose();
      group.remove(obj);
    }

    const t = progress / 100;
    const { meshes, lines, hingeMarkers } = build3DUnfoldingScene(model.id, localParams, t);

    for (const m of meshes) group.add(m);
    for (const l of lines) group.add(l);
    for (const h of hingeMarkers) group.add(h);
  }, [model.id, localParams, progress, activeViewTab]);

  if (!isOpen) return null;

  const netDef = model.netDefinition;
  const polygons2D = netDef?.unfold2DPolygons ? netDef.unfold2DPolygons(localParams) : [];

  // Live Unfolding metrics
  const { metrics } = build3DUnfoldingScene(model.id, localParams, progress / 100);

  // Exact Cone math calculations
  const r_val = localParams.r ?? 2.2;
  const h_val = localParams.h ?? 3.8;
  const slantHeight = Math.sqrt(r_val * r_val + h_val * h_val);
  const centralAngleDeg = (r_val / slantHeight) * 360;
  const arcLength = 2 * Math.PI * r_val;

  // Handle Playback Controls
  const handleOpen2D = () => {
    setDirection('open');
    setIsPlaying(true);
  };

  const handleFold3D = () => {
    setDirection('close');
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(7, 8, 8);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // 2D SVG ViewBox bounds
  let minX = -100;
  let maxX = 200;
  let minY = -100;
  let maxY = 200;

  if (polygons2D.length > 0) {
    let allX: number[] = [];
    let allY: number[] = [];
    for (const poly of polygons2D) {
      for (const pt of poly.points) {
        allX.push(pt[0]);
        allY.push(pt[1]);
      }
    }
    if (allX.length > 0) {
      minX = Math.min(...allX) - 30;
      maxX = Math.max(...allX) + 30;
      minY = Math.min(...allY) - 30;
      maxY = Math.max(...allY) + 30;
    }
  }

  const svgWidth = Math.max(320, maxX - minX);
  const svgHeight = Math.max(320, maxY - minY);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Khai Triển 3D – 2D và Hoạt Ảnh Bản Lề: {model.name}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Xoay quanh đúng cạnh bản lề, giữ nguyên độ dài cạnh và tính toán chuẩn xác
              </p>
            </div>
          </div>

          {/* View Tab Switcher: 3D Hinge View vs 2D Technical Net */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveViewTab('3d')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeViewTab === '3d'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Không gian 3D
              </button>
              <button
                onClick={() => setActiveViewTab('2d')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeViewTab === '2d'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bản vẽ 2D (Net)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Layout: Viewport (Left 65%) + Control & Inspection Deck (Right 35%) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Stage Viewport */}
          <div className="lg:col-span-8 relative bg-slate-950 flex flex-col min-h-[340px] sm:min-h-[420px]">
            {/* If the model is a sphere or cannot be unfolded */}
            {!netDef?.canUnfold ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 max-w-lg text-center">
                  <Info className="w-10 h-10 mx-auto text-amber-400 mb-3" />
                  <h3 className="text-base font-bold text-amber-300 mb-2">
                    Không thể trải phẳng chính xác (Định lý Gauss)
                  </h3>
                  <p className="text-xs leading-relaxed text-amber-100/90 text-justify">
                    Theo Định lý *Theorema Egregium* của C.F. Gauss, độ cong Gauss của mặt cầu là $K = 1/R^2 {'>'} 0$ trong khi mặt phẳng có $K = 0$. Không thể trải phẳng mà không làm méo mó hoặc rách mép!
                  </p>
                </div>
              </div>
            ) : activeViewTab === '3d' ? (
              /* 3D Hinge Viewport */
              <div className="relative w-full h-full flex-1">
                <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

                {/* Progress Overlay Badge */}
                <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono text-indigo-300 shadow-lg pointer-events-none">
                  {progress === 0 && '● 3D Nguyên Khối (0%)'}
                  {progress > 0 && progress < 100 && `● Đang mở bản lề: ${progress.toFixed(0)}%`}
                  {progress === 100 && '● Đã trải phẳng hoàn toàn 2D (100%)'}
                </div>

                <div className="absolute top-3 right-3 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded text-[10px] text-slate-400 font-mono pointer-events-none">
                  Xoay chuột 360° để quan sát
                </div>
              </div>
            ) : (
              /* 2D Flat SVG Net Viewport */
              <div className="relative w-full h-full flex-1 flex items-center justify-center p-4 bg-slate-950/95 overflow-hidden">
                <svg
                  ref={svgRef}
                  viewBox={`${minX} ${minY} ${svgWidth} ${svgHeight}`}
                  className="w-full h-full max-h-[380px] transition-transform duration-300"
                >
                  {polygons2D.map((poly) => {
                    const pointsStr = poly.points.map((pt) => `${pt[0]},${pt[1]}`).join(' ');
                    const cx = poly.points.reduce((acc, p) => acc + p[0], 0) / poly.points.length;
                    const cy = poly.points.reduce((acc, p) => acc + p[1], 0) / poly.points.length;

                    return (
                      <g key={poly.id}>
                        <polygon
                          points={pointsStr}
                          fill={poly.color || '#38bdf8'}
                          fillOpacity={0.65}
                          stroke={poly.strokeColor || '#0284c7'}
                          strokeWidth="2"
                        />
                        {poly.name && (
                          <text
                            x={cx}
                            y={cy}
                            fill="#f8fafc"
                            fontSize="10"
                            fontWeight="600"
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="pointer-events-none select-none font-sans"
                          >
                            {poly.name}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {svgRef.current && (
                  <button
                    onClick={() => exportSvgNet(svgRef.current!)}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-medium shadow-md transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất file SVG</span>
                  </button>
                )}
              </div>
            )}

            {/* Bottom Progress Slider Bar */}
            {netDef?.canUnfold && (
              <div className="p-3 bg-slate-950/95 border-t border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Tiến trình mở/gấp:</span>
                  <span className="font-mono font-bold text-indigo-400 tabular-nums">
                    {progress.toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 font-mono">0% (3D)</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={progress}
                    onChange={(e) => setProgress(parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <span className="text-[11px] text-slate-500 font-mono">100% (2D)</span>
                </div>

                {/* Controls toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpen2D}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Mở hình 2D</span>
                    </button>

                    <button
                      onClick={handleFold3D}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Gấp thành 3D</span>
                    </button>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                      title={isPlaying ? 'Tạm dừng' : 'Tiếp tục'}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={handleReset}
                      className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs transition-all"
                    >
                      Đặt lại
                    </button>
                  </div>

                  {/* Speed switch */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>Tốc độ:</span>
                    {[0.5, 1, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={`px-1.5 py-0.5 rounded font-mono ${
                          speed === s ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Control & Inspection Deck (Parameters + Accurate Math Verification) */}
          <div className="lg:col-span-4 bg-slate-900/90 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col overflow-y-auto p-4 space-y-4">
            {/* Live Parameter Sliders */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Thay đổi thông số mô hình:</span>
              </div>

              {model.params.map((p) => {
                const currentVal = localParams[p.id] ?? p.default;
                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{p.label}:</span>
                      <span className="font-mono font-bold text-indigo-400 tabular-nums">
                        {currentVal} {p.unit || ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={p.min}
                      max={p.max}
                      step={p.step}
                      value={currentVal}
                      onChange={(e) => updateParam(p.id, parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                    />
                  </div>
                );
              })}
            </div>

            {/* Special Math Box for Cone */}
            {model.id === 'cone' && (
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Toán học chính xác mặt nón:</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span className="text-slate-400">Đường sinh l:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      l = √(h² + r²) = {slantHeight.toFixed(2)} cm
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span className="text-slate-400">Bán kính quạt tròn R:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      R = l = {slantHeight.toFixed(2)} cm
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span className="text-slate-400">Góc ở tâm θ:</span>
                    <span className="font-mono text-indigo-400 font-bold">
                      360° × (r/l) = {centralAngleDeg.toFixed(1)}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Độ dài cung quạt:</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      C = 2πr = {arcLength.toFixed(2)} cm
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Geometry Invariants & Verification Checklist */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kiểm chứng tính chất hình học:</span>
              </div>

              {metrics.map((m, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300 mb-0.5">
                    <span className="font-semibold">{m.label}:</span>
                    <span className="font-mono font-bold text-indigo-400 tabular-nums">{m.value}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">{m.description}</p>
                </div>
              ))}
            </div>

            {/* Educational takeaway */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
              <span className="text-indigo-400 font-semibold">Quy tắc bản lề: </span>
              Mọi mặt phẳng của đa diện xoay quanh cạnh chung mà không làm co giãn kích thước. Độ dài tất cả các cạnh được bảo toàn $100\%$ qua mọi tiến trình mở và gấp.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
