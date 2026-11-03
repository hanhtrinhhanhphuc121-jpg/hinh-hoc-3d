import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  RotateCw,
  Eye,
  Sliders,
  Maximize2,
  Box,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { GeometryModel } from '../types/geometry';
import { CameraPreset, ViewMode } from './ThreeViewport';

interface ParametersDockProps {
  model: GeometryModel;
  params: Record<string, number>;
  onParamChange: (paramId: string, val: number) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  hiddenLineMode: boolean;
  setHiddenLineMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  showLabels: boolean;
  setShowLabels: (val: boolean | ((prev: boolean) => boolean)) => void;
  showRightAngles: boolean;
  setShowRightAngles: (val: boolean | ((prev: boolean) => boolean)) => void;
  autoRotate: boolean;
  setAutoRotate: (val: boolean | ((prev: boolean) => boolean)) => void;
  onResetCamera: () => void;
  onSetCameraPreset: (preset: CameraPreset) => void;
}

export const ParametersDock: React.FC<ParametersDockProps> = ({
  model,
  params,
  onParamChange,
  viewMode,
  setViewMode,
  hiddenLineMode,
  setHiddenLineMode,
  showLabels,
  setShowLabels,
  showRightAngles,
  setShowRightAngles,
  autoRotate,
  setAutoRotate,
  onResetCamera,
  onSetCameraPreset,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'params' | 'view' | 'angles'>('params');

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-[min(940px,94vw)] pointer-events-none select-none transition-all duration-300">
      {/* Collapse / Expand Toggle Button */}
      <div className="flex justify-center pointer-events-auto mb-1.5">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-slate-700/80 rounded-full text-xs font-medium text-slate-300 hover:text-white shadow-md hover:bg-slate-800 transition-all"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Mở rộng bảng điều khiển</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Thu gọn điều khiển</span>
            </>
          )}
        </button>
      </div>

      {/* Main Dock Container */}
      {!isCollapsed && (
        <div className="pointer-events-auto bg-slate-900/95 border border-slate-800 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-2 duration-200">
          {/* Subtabs & Quick Toggles Row */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 gap-2 overflow-x-auto">
            {/* Dock Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
              <button
                onClick={() => setActiveTab('params')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'params'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Kích thước ({model.params.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('view')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'view'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Hiển thị và Nét khuất</span>
              </button>

              <button
                onClick={() => setActiveTab('angles')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'angles'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Góc nhìn 3D</span>
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setAutoRotate((prev) => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                  autoRotate
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Tự động xoay quanh trục"
              >
                <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                <span>{autoRotate ? 'Dừng xoay' : 'Tự xoay'}</span>
              </button>

              <button
                onClick={onResetCamera}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-950 text-slate-300 border border-slate-800 rounded-lg hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
                title="Khôi phục góc nhìn ban đầu"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Đặt lại góc nhìn</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Parameter Sliders */}
          {activeTab === 'params' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {model.params.map((p) => {
                const currentVal = params[p.id] ?? p.default;
                return (
                  <div key={p.id} className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-200">{p.label}</span>
                      <span className="font-mono text-indigo-400 font-bold tabular-nums">
                        {currentVal} {p.unit || ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={p.min}
                      max={p.max}
                      step={p.step}
                      value={currentVal}
                      onChange={(e) => onParamChange(p.id, parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>{p.min}</span>
                      <span>{p.max}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: View Mode & Hidden Line Toggles */}
          {activeTab === 'view' && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Shading mode switch */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewMode('solid')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    viewMode === 'solid'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Khối tô màu
                </button>
                <button
                  onClick={() => setViewMode('wireframe')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    viewMode === 'wireframe'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Khung dây
                </button>
                <button
                  onClick={() => setViewMode('technical')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    viewMode === 'technical'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Bản vẽ kỹ thuật
                </button>
              </div>

              {/* Dynamic Hidden Line Toggle (Crucial requirement #5) */}
              <button
                onClick={() => setHiddenLineMode((prev) => !prev)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  hiddenLineMode
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Nét khuất (Nét đứt / Nét liền động): {hiddenLineMode ? 'BẬT' : 'TẮT'}</span>
              </button>

              {/* Vertex Labels Toggle */}
              <button
                onClick={() => setShowLabels((prev) => !prev)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  showLabels
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>Tên đỉnh (A, B, C, S...): {showLabels ? 'HIỆN' : 'ẨN'}</span>
              </button>

              {/* Right Angles Toggle */}
              <button
                onClick={() => setShowRightAngles((prev) => !prev)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  showRightAngles
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>Ký hiệu góc vuông: {showRightAngles ? 'HIỆN' : 'ẨN'}</span>
              </button>
            </div>
          )}

          {/* Tab 3: Camera Presets (Front, Back, Left, Right, Top, Bottom, Isometric) */}
          {activeTab === 'angles' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium mr-1">Góc quan sát chuẩn:</span>
              <button
                onClick={() => onSetCameraPreset('front')}
                className="px-2.5 py-1 text-xs font-medium bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-200 whitespace-nowrap"
              >
                Mặt trước (Front)
              </button>
              <button
                onClick={() => onSetCameraPreset('back')}
                className="px-2.5 py-1 text-xs font-medium bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-200 whitespace-nowrap"
              >
                Mặt sau (Back)
              </button>
              <button
                onClick={() => onSetCameraPreset('left')}
                className="px-2.5 py-1 text-xs font-medium bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-200 whitespace-nowrap"
              >
                Bên trái (Left)
              </button>
              <button
                onClick={() => onSetCameraPreset('right')}
                className="px-2.5 py-1 text-xs font-medium bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-200 whitespace-nowrap"
              >
                Bên phải (Right)
              </button>
              <button
                onClick={() => onSetCameraPreset('top')}
                className="px-2.5 py-1 text-xs font-medium bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-200 whitespace-nowrap"
              >
                Từ trên xuống (Top)
              </button>
              <button
                onClick={() => onSetCameraPreset('bottom')}
                className="px-2.5 py-1 text-xs font-medium bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-200 whitespace-nowrap"
              >
                Từ dưới lên (Bottom)
              </button>
              <button
                onClick={() => onSetCameraPreset('iso')}
                className="px-2.5 py-1 text-xs font-medium bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/50 rounded-lg whitespace-nowrap"
              >
                Phối cảnh chuẩn (Isometric)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
