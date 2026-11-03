import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  X,
  FlaskConical,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Layers,
  Droplets,
} from 'lucide-react';
import { KaTeX } from '../utils/katexRenderer';

interface FormulaLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaLabModal: React.FC<FormulaLabModalProps> = ({ isOpen, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Experiment selection
  const [experiment, setExperiment] = useState<'cavalieri' | 'cone_cylinder' | 'archimedes'>('cavalieri');

  // Cavalieri shear offset
  const [cavalieriShear, setCavalieriShear] = useState<number>(0);

  // Water pouring pours count (0, 1, 2, 3)
  const [pourStep, setPourStep] = useState<number>(0);
  const [isPouring, setIsPouring] = useState<boolean>(false);

  // Archimedes water displacement progress (0 to 1)
  const [archimedesProgress, setArchimedesProgress] = useState<number>(0);

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const expGroupRef = useRef<THREE.Group | null>(null);

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
    camera.position.set(4, 3, 5);
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

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 6);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(8, 12, 0x334155, 0x1e293b);
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

  // Build the 3D experiment models
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (expGroupRef.current) {
      scene.remove(expGroupRef.current);
    }

    const group = new THREE.Group();
    expGroupRef.current = group;
    scene.add(group);

    if (experiment === 'cavalieri') {
      // 1. Cavalieri Principle: Left is straight stack of slices, Right is sheared stack
      const sliceCount = 24;
      const sliceHeight = 0.08;
      const totalH = sliceCount * sliceHeight;
      const sliceSize = 1.2;

      // Left straight prism stack (Reference)
      const leftGroup = new THREE.Group();
      leftGroup.position.x = -1.5;

      for (let i = 0; i < sliceCount; i++) {
        const y = -totalH / 2 + i * sliceHeight + sliceHeight / 2;
        const boxGeo = new THREE.BoxGeometry(sliceSize, sliceHeight * 0.9, sliceSize);
        const mat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0x3b82f6 : 0x60a5fa,
          roughness: 0.3,
        });
        const mesh = new THREE.Mesh(boxGeo, mat);
        mesh.position.y = y;
        leftGroup.add(mesh);
      }
      group.add(leftGroup);

      // Right sheared stack (Cavalieri variable shear)
      const rightGroup = new THREE.Group();
      rightGroup.position.x = 1.5;

      for (let i = 0; i < sliceCount; i++) {
        const y = -totalH / 2 + i * sliceHeight + sliceHeight / 2;
        const normY = (i / sliceCount);
        // Shear offset grows smoothly with height
        const xOffset = normY * cavalieriShear;
        const boxGeo = new THREE.BoxGeometry(sliceSize, sliceHeight * 0.9, sliceSize);
        const mat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0x10b981 : 0x34d399,
          roughness: 0.3,
        });
        const mesh = new THREE.Mesh(boxGeo, mat);
        mesh.position.set(xOffset, y, 0);
        rightGroup.add(mesh);
      }
      group.add(rightGroup);
    } else if (experiment === 'cone_cylinder') {
      // 2. Cone vs Cylinder (3:1 Volume Ratio Water Pouring)
      const r = 0.8;
      const h = 1.8;

      // Left: Glass Cone
      const coneGroup = new THREE.Group();
      coneGroup.position.x = -1.5;

      // Inverted cone to hold water or apex up
      const coneGeo = new THREE.ConeGeometry(r, h, 32, 1, true);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x93c5fd,
        transmission: 0.9,
        opacity: 0.4,
        transparent: true,
        roughness: 0.1,
        side: THREE.DoubleSide,
      });
      const coneMesh = new THREE.Mesh(coneGeo, glassMat);
      coneGroup.add(coneMesh);

      // Right: Glass Cylinder with Water levels
      const cylGroup = new THREE.Group();
      cylGroup.position.x = 1.5;

      const cylGeo = new THREE.CylinderGeometry(r, r, h, 32, 1, true);
      const cylMesh = new THREE.Mesh(cylGeo, glassMat);
      cylGroup.add(cylMesh);

      // Bottom disk
      const bottomGeo = new THREE.CircleGeometry(r, 32);
      bottomGeo.rotateX(-Math.PI / 2);
      const bottomMesh = new THREE.Mesh(bottomGeo, glassMat);
      bottomMesh.position.y = -h / 2;
      cylGroup.add(bottomMesh);

      // Water mesh inside cylinder
      if (pourStep > 0) {
        const waterFraction = pourStep / 3;
        const waterH = h * waterFraction;
        const waterGeo = new THREE.CylinderGeometry(r * 0.98, r * 0.98, waterH, 32);
        const waterMat = new THREE.MeshStandardMaterial({
          color: 0x0ea5e9, // Bright water blue
          roughness: 0.1,
          transparent: true,
          opacity: 0.8,
        });
        const waterMesh = new THREE.Mesh(waterGeo, waterMat);
        waterMesh.position.y = -h / 2 + waterH / 2;
        cylGroup.add(waterMesh);
      }

      group.add(coneGroup);
      group.add(cylGroup);
    } else if (experiment === 'archimedes') {
      // 3. Archimedes: Sphere inscribed in Cylinder
      const R = 0.9;
      const H = 2 * R;

      // Transparent Outer Cylinder
      const cylGeo = new THREE.CylinderGeometry(R, R, H, 32, 1, true);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xa5b4fc,
        transmission: 0.92,
        opacity: 0.35,
        transparent: true,
        roughness: 0.1,
        side: THREE.DoubleSide,
      });
      const cylMesh = new THREE.Mesh(cylGeo, glassMat);
      group.add(cylMesh);

      // Inscribed Sphere (lowers into cylinder based on archimedesProgress)
      const sphereY = 2.5 * (1 - archimedesProgress);
      const sphereGeo = new THREE.SphereGeometry(R * 0.97, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b, // Gold
        roughness: 0.25,
        metalness: 0.2,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.y = sphereY;
      group.add(sphereMesh);

      // Water level inside cylinder rising as sphere enters
      const waterH = (H * 2 / 3) * archimedesProgress;
      if (waterH > 0.05) {
        const waterGeo = new THREE.CylinderGeometry(R * 0.99, R * 0.99, waterH, 32);
        const waterMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.5,
        });
        const waterMesh = new THREE.Mesh(waterGeo, waterMat);
        waterMesh.position.y = -H / 2 + waterH / 2;
        group.add(waterMesh);
      }
    }
  }, [experiment, cavalieriShear, pourStep, archimedesProgress]);

  // Handle Pour Animation
  const handlePourWater = () => {
    if (pourStep < 3 && !isPouring) {
      setIsPouring(true);
      setTimeout(() => {
        setPourStep((p) => Math.min(3, p + 1));
        setIsPouring(false);
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="h-14 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Phòng Thí Nghiệm Kiểm Chứng Bản Chất Công Thức
                <span className="text-xs font-normal text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                  Cavalieri • Archimedes • Tỉ số thể tích 1/3
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
          {/* Left Viewport */}
          <div className="relative flex-1 h-[50%] lg:h-full bg-slate-950">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Experiment Floating Info */}
            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-lg text-xs space-y-1.5 max-w-sm pointer-events-none">
              <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {experiment === 'cavalieri' && 'Nguyên lý Cavalieri (Lát cắt bảo toàn thể tích)'}
                {experiment === 'cone_cylinder' && 'Thực nghiệm rót nước Nón và Trụ (Tỉ số 1:3)'}
                {experiment === 'archimedes' && 'Định lý Archimedes: Khối cầu nội tiếp hình trụ'}
              </div>
              <div className="text-[11px] text-slate-300">
                {experiment === 'cavalieri' && 'Khi trượt nghiêng các lát cắt ngang, diện tích mỗi tầng S(z) không đổi, do đó thể tích khối đứng = thể tích khối xiên!'}
                {experiment === 'cone_cylinder' && `Đã rót: ${pourStep}/3 thể tích hình nón vào hình trụ có cùng đáy và chiều cao.`}
                {experiment === 'archimedes' && `Thể tích khối cầu chiếm đúng 2/3 thể tích hình trụ ngoại tiếp nó!`}
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/95 overflow-y-auto p-5 flex flex-col gap-5">
            {/* Experiment Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Chọn thí nghiệm kiểm chứng
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => setExperiment('cavalieri')}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-colors border flex items-center justify-between ${
                    experiment === 'cavalieri'
                      ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>1. Nguyên lý Cavalieri (Xếp chồng lát cắt)</span>
                  {experiment === 'cavalieri' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                </button>

                <button
                  onClick={() => setExperiment('cone_cylinder')}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-colors border flex items-center justify-between ${
                    experiment === 'cone_cylinder'
                      ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>2. Rót nước Nón và Trụ (Tỉ số 1/3)</span>
                  {experiment === 'cone_cylinder' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                </button>

                <button
                  onClick={() => setExperiment('archimedes')}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-colors border flex items-center justify-between ${
                    experiment === 'archimedes'
                      ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>3. Khối cầu nội tiếp hình trụ (Archimedes)</span>
                  {experiment === 'archimedes' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                </button>
              </div>
            </div>

            {/* Experiment Specific Controls */}
            {experiment === 'cavalieri' && (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-200">
                  Thanh trượt độ nghiêng các lát cắt:
                </div>
                <div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={cavalieriShear}
                    onChange={(e) => setCavalieriShear(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>Thẳng đứng (0)</span>
                    <span className="font-mono text-cyan-400 font-semibold">{cavalieriShear.toFixed(2)}</span>
                    <span>Nghiêng tối đa</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs text-amber-300">
                  <KaTeX math="V = \int_{0}^{H} S(z) \, dz \implies V_{\text{đứng}} = V_{\text{xiên}}" block />
                </div>
              </div>
            )}

            {experiment === 'cone_cylinder' && (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Tiến trình rót chất lỏng:</span>
                  <span className="text-cyan-400 font-mono font-bold">{pourStep}/3 lần</span>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={pourStep >= 3 || isPouring}
                    onClick={handlePourWater}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-cyan-600/30"
                  >
                    <Droplets className="w-4 h-4" />
                    {pourStep === 0 && 'Rót lần 1'}
                    {pourStep === 1 && 'Rót lần 2'}
                    {pourStep === 2 && 'Rót lần 3 (Đầy bình)'}
                    {pourStep >= 3 && 'Đã đầy'}
                  </button>

                  <button
                    onClick={() => setPourStep(0)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Đổ sạch nước"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs text-amber-300">
                  <KaTeX math="V_{\text{nón}} = \frac{1}{3} \pi r^2 h = \frac{1}{3} V_{\text{trụ}}" block />
                </div>
              </div>
            )}

            {experiment === 'archimedes' && (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-200">
                  Hạ quả cầu vào lòng hình trụ:
                </div>
                <div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={archimedesProgress}
                    onChange={(e) => setArchimedesProgress(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>Ở ngoài (0%)</span>
                    <span className="font-mono text-amber-400 font-semibold">{Math.round(archimedesProgress * 100)}%</span>
                    <span>Nội tiếp trọn vẹn</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs text-amber-300 space-y-1">
                  <KaTeX math="V_{\text{cầu}} = \frac{4}{3} \pi R^3 = \frac{2}{3} \cdot (\pi R^2 \cdot 2R) = \frac{2}{3} V_{\text{trụ}}" block />
                  <KaTeX math="S_{\text{cầu}} = 4\pi R^2 = S_{\text{xq trụ}}" block />
                </div>
              </div>
            )}

            {/* Pedagogical Note */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Thí nghiệm 3D tương tác giúp học sinh hiểu sâu sắc nguồn gốc hình học và cơ sở tích phân của các công thức thể tích thay vì chỉ học vẹt.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
