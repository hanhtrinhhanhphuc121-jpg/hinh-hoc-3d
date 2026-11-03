import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  BookOpen,
  GraduationCap,
  Download,
  Compass,
  Layers,
  Scissors,
  Crosshair,
  FlaskConical,
  Gamepad2,
  QrCode,
  Presentation,
  Sparkles,
  ChevronDown,
  HelpCircle,
  Maximize,
  Minimize,
} from 'lucide-react';
import { GeometryModel } from '../types/geometry';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentModel: GeometryModel;
  activeTab: 'explore' | 'guided' | 'quiz' | 'spatial';
  setActiveTab: (tab: 'explore' | 'guided' | 'quiz' | 'spatial') => void;
  onOpenModelSelector: () => void;
  onOpenUnfolding: () => void;
  onOpenExport: () => void;
  onOpenTeacherStudio: () => void;
  // New Modules
  onOpenCrossSection: () => void;
  onOpenGeometricProof: () => void;
  onOpenOxyzStudio: () => void;
  onOpenFormulaLab: () => void;
  onOpenInteractiveGames: () => void;
  onOpenCurriculumWorksheet: () => void;
  onOpenExportQr: () => void;
  onOpenPresentationMode: () => void;
  onOpenArAiAssistant: () => void;
  onOpenLessonDesigner: () => void;
  // Student & Offline extras
  onOpenStudentGuide?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentModel,
  activeTab,
  setActiveTab,
  onOpenModelSelector,
  onOpenUnfolding,
  onOpenExport,
  onOpenTeacherStudio,
  onOpenCrossSection,
  onOpenGeometricProof,
  onOpenOxyzStudio,
  onOpenFormulaLab,
  onOpenInteractiveGames,
  onOpenCurriculumWorksheet,
  onOpenExportQr,
  onOpenPresentationMode,
  onOpenArAiAssistant,
  onOpenLessonDesigner,
  onOpenStudentGuide,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-3 md:px-6 flex items-center justify-between gap-4 md:gap-8 z-40 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Box className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            Hình Học 3D Tương Tác
          </span>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline whitespace-nowrap">
            Giáo viên phát triển: Cao Thị Thu Thảo (GV trường THCS và THPT Long Hiệp)
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (single-line, clean text links) */}
      <nav className="flex items-center gap-1.5 md:gap-3 text-xs md:text-sm font-medium overflow-x-auto no-scrollbar">
        {/* Model Selector button */}
        <button
          onClick={onOpenModelSelector}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors whitespace-nowrap shrink-0 border border-slate-800"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline font-semibold">{currentModel.name}</span>
          <span className="sm:hidden font-semibold">Mô hình</span>
          <span className="text-xs text-slate-400 ml-0.5 font-mono">▾</span>
        </button>

        {/* Explore */}
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'explore'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Khám phá 3D</span>
        </button>

        {/* Spatial Thinking */}
        <button
          onClick={() => setActiveTab('spatial')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'spatial'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
              : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-900 border border-amber-500/30'
          }`}
          title="Rèn luyện tư duy không gian THCS và THPT"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline font-semibold">Tư duy không gian</span>
          <span className="md:hidden font-semibold">Tư duy</span>
        </button>

        {/* Teacher Studio */}
        <button
          onClick={onOpenTeacherStudio}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-slate-900 border border-emerald-500/30 transition-colors whitespace-nowrap shrink-0"
          title="Chế độ Giáo viên – Thiết kế mô hình và bài tập (Cô Cao Thị Thu Thảo)"
        >
          <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline font-semibold">Chế độ Giáo viên</span>
          <span className="md:hidden font-semibold">Giáo viên</span>
        </button>

        {/* Dedicated 3D Lesson Designer */}
        <button
          onClick={onOpenLessonDesigner}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-amber-300 hover:text-white bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 border border-amber-500/40 transition-all whitespace-nowrap shrink-0 shadow-sm"
          title="Trình thiết kế bài học hình học 3D – Dựng hình và ràng buộc toán học"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline font-semibold">Thiết kế bài học 3D</span>
          <span className="lg:hidden font-semibold">Soạn bài 3D</span>
        </button>

        {/* Advanced Tools & Labs Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap border ${
              isToolsDropdownOpen
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold">Phòng Thí Nghiệm</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isToolsDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
              <button
                onClick={() => {
                  setIsToolsDropdownOpen(false);
                  onOpenLessonDesigner();
                }}
                className="w-full text-left p-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 hover:from-amber-500/20 hover:to-indigo-500/20 border border-amber-500/30 transition-colors flex items-center gap-3 text-xs text-slate-200"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-amber-300">Thiết Kế Bài Học 3D</div>
                  <div className="text-[10px] text-slate-400">Ràng buộc toán học, tam giác vuông SAC</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsToolsDropdownOpen(false);
                  onOpenCrossSection();
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-3 text-xs text-slate-200"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Cắt Khối và Thiết Diện</div>
                  <div className="text-[10px] text-slate-400">Mặt phẳng cắt, diện tích thiết diện</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsToolsDropdownOpen(false);
                  onOpenGeometricProof();
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-3 text-xs text-slate-200"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Dựng Hình và Chứng Minh</div>
                  <div className="text-[10px] text-slate-400">Vuông góc, góc nhị diện, khoảng cách</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsToolsDropdownOpen(false);
                  onOpenOxyzStudio();
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-3 text-xs text-slate-200"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Crosshair className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Hệ Tọa Độ Oxyz Chuyên Sâu</div>
                  <div className="text-[10px] text-slate-400">Vectơ, mặt phẳng, tích có hướng</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsToolsDropdownOpen(false);
                  onOpenFormulaLab();
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-3 text-xs text-slate-200"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Thí Nghiệm Công Thức</div>
                  <div className="text-[10px] text-slate-400">Cavalieri, rót nước 1/3, Archimedes</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsToolsDropdownOpen(false);
                  onOpenInteractiveGames();
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-3 text-xs text-slate-200"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Trò Chơi Tương Tác</div>
                  <div className="text-[10px] text-slate-400">Đấu trường Euler, đoán thiết diện</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsToolsDropdownOpen(false);
                  onOpenCurriculumWorksheet();
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-3 text-xs text-slate-200"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Kho Bài Học và Phiếu Học Tập</div>
                  <div className="text-[10px] text-slate-400">Chuẩn GDPT 2018 Lớp 7-12</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsToolsDropdownOpen(false);
                  onOpenExportQr();
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-3 text-xs text-slate-200"
              >
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Mã QR và Xuất Phiếu A4</div>
                  <div className="text-[10px] text-slate-400">Quét camera điện thoại xem 3D</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsToolsDropdownOpen(false);
                  onOpenArAiAssistant();
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-3 text-xs text-slate-200"
              >
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">AR và Trợ Lý AI</div>
                  <div className="text-[10px] text-slate-400">Kiểm tra WebXR và Giải đáp sư phạm</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Zone 3: Actions & Utilities */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        {/* Student Guide Button */}
        {onOpenStudentGuide && (
          <button
            onClick={onOpenStudentGuide}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors whitespace-nowrap"
            title="Hướng dẫn sử dụng nhanh dành cho học sinh"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xl:inline">Hướng dẫn</span>
          </button>
        )}

        {/* PWA Install Button */}
        <PWAInstallButton variant="navbar" />

        {/* Fullscreen Toggle Button */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors whitespace-nowrap"
            title={isFullscreen ? 'Thu nhỏ màn hình (Esc)' : 'Bật toàn màn hình'}
          >
            {isFullscreen ? (
              <Minimize className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Maximize className="w-3.5 h-3.5 text-slate-300" />
            )}
          </button>
        )}

        {/* Presentation Mode Button */}
        <button
          onClick={onOpenPresentationMode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          title="Trình chiếu bài giảng toàn màn hình và Bút vẽ phấn"
        >
          <Presentation className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Trình chiếu</span>
        </button>

        {/* 2D Net Unfolding Button */}
        {currentModel.netDefinition && (
          <button
            onClick={onOpenUnfolding}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <span>Mở hình 2D</span>
          </button>
        )}
      </div>
    </header>
  );
};
