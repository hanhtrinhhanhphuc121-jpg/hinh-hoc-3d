import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GeometryModel, SelectedElement } from './types/geometry';
import { allModels, getModelById } from './models/modelRegistry';
import { ThreeViewport, ViewMode, CameraPreset } from './components/ThreeViewport';
import { Navbar } from './components/Navbar';
import { ParametersDock } from './components/ParametersDock';
import { FormulaPanel } from './components/FormulaPanel';
import { ModelSelectorModal } from './components/ModelSelectorModal';
import { UnfoldingModal } from './components/UnfoldingModal';
import { GuidedLearningPanel } from './components/GuidedLearningPanel';
import { QuizPracticeModal } from './components/QuizPracticeModal';
import { ExportModal } from './components/ExportModal';
import { ElementInspector } from './components/ElementInspector';
import { SpatialThinkingModal } from './components/SpatialThinkingModal';
import { TeacherStudioModal } from './components/TeacherStudioModal';

// Advanced Educational & Geometric Modules
import { CrossSectionModal } from './components/CrossSectionModal';
import { GeometricProofModal } from './components/GeometricProofModal';
import { OxyzStudioModal } from './components/OxyzStudioModal';
import { FormulaLabModal } from './components/FormulaLabModal';
import { InteractiveGamesModal } from './components/InteractiveGamesModal';
import { CurriculumWorksheetModal } from './components/CurriculumWorksheetModal';
import { ExportQrModal } from './components/ExportQrModal';
import { PresentationModeModal } from './components/PresentationModeModal';
import { ArAiAssistantModal } from './components/ArAiAssistantModal';
import { LessonDesignerModal } from './components/LessonDesignerModal';
import { StudentGuideModal } from './components/StudentGuideModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Initialize model from URL or LocalStorage
  const getInitialModelId = (): string => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const mId = urlParams.get('model');
      if (mId && getModelById(mId)) return mId;
      const stored = localStorage.getItem('hinhhoc3d_model');
      if (stored && getModelById(stored)) return stored;
    }
    return 'cube';
  };

  const initialModelId = getInitialModelId();
  const [currentModelId, setCurrentModelId] = useState<string>(initialModelId);
  const [currentModel, setCurrentModel] = useState<GeometryModel>(() => getModelById(initialModelId));
  const [params, setParams] = useState<Record<string, number>>(() => getModelById(initialModelId).defaultParams);

  // 3D Visual & View Controls with LocalStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hinhhoc3d_view_mode');
      if (saved === 'solid' || saved === 'wireframe' || saved === 'technical') return saved;
    }
    return 'solid';
  });

  const [hiddenLineMode, setHiddenLineMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hinhhoc3d_hidden_lines');
      if (saved !== null) return saved === 'true';
    }
    return true; // Dynamic hidden line detection
  });

  const [showLabels, setShowLabels] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hinhhoc3d_show_labels');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const [showRightAngles, setShowRightAngles] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hinhhoc3d_show_angles');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [unit, setUnit] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hinhhoc3d_unit') || 'cm';
    }
    return 'cm';
  });

  // Selected 3D Element
  const [selectedElement, setSelectedElement] = useState<SelectedElement>({ type: 'none' });

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'explore' | 'guided' | 'quiz' | 'spatial'>('explore');
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState<boolean>(false);
  const [isUnfoldingOpen, setIsUnfoldingOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isTeacherStudioOpen, setIsTeacherStudioOpen] = useState<boolean>(false);
  const [isStudentGuideOpen, setIsStudentGuideOpen] = useState<boolean>(false);

  // New Educational Labs Modals
  const [isCrossSectionOpen, setIsCrossSectionOpen] = useState<boolean>(false);
  const [isGeometricProofOpen, setIsGeometricProofOpen] = useState<boolean>(false);
  const [isOxyzStudioOpen, setIsOxyzStudioOpen] = useState<boolean>(false);
  const [isFormulaLabOpen, setIsFormulaLabOpen] = useState<boolean>(false);
  const [isInteractiveGamesOpen, setIsInteractiveGamesOpen] = useState<boolean>(false);
  const [isCurriculumWorksheetOpen, setIsCurriculumWorksheetOpen] = useState<boolean>(false);
  const [isExportQrOpen, setIsExportQrOpen] = useState<boolean>(false);
  const [isPresentationModeOpen, setIsPresentationModeOpen] = useState<boolean>(false);
  const [isArAiAssistantOpen, setIsArAiAssistantOpen] = useState<boolean>(false);
  const [isLessonDesignerOpen, setIsLessonDesignerOpen] = useState<boolean>(false);

  // Canvas ref for image export
  const [canvasElem, setCanvasElem] = useState<HTMLCanvasElement | null>(null);

  // Sync preferences to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('hinhhoc3d_model', currentModelId);
      localStorage.setItem('hinhhoc3d_view_mode', viewMode);
      localStorage.setItem('hinhhoc3d_hidden_lines', String(hiddenLineMode));
      localStorage.setItem('hinhhoc3d_show_labels', String(showLabels));
      localStorage.setItem('hinhhoc3d_show_angles', String(showRightAngles));
      localStorage.setItem('hinhhoc3d_unit', unit);
    } catch (e) {
      // LocalStorage quota or private mode fallback
    }
  }, [currentModelId, viewMode, hiddenLineMode, showLabels, showRightAngles, unit]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // URL param detection (e.g. ?model=pyramid_quad)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const mId = urlParams.get('model');
      if (mId) {
        const found = getModelById(mId);
        if (found) {
          setCurrentModelId(found.id);
          setCurrentModel(found);
          setParams(found.defaultParams);
        }
      }
    }
  }, []);

  // Switch model handler
  const handleSelectModel = useCallback((model: GeometryModel) => {
    setCurrentModelId(model.id);
    setCurrentModel(model);
    setParams(model.defaultParams);
    setSelectedElement({ type: 'none' });
  }, []);

  // Slider change handler
  const handleParamChange = useCallback((paramId: string, val: number) => {
    setParams((prev) => ({
      ...prev,
      [paramId]: val,
    }));
  }, []);

  // Camera preset handler
  const handleSetCameraPreset = useCallback((preset: CameraPreset) => {
    if ((window as any).__set3DCameraPreset) {
      (window as any).__set3DCameraPreset(preset);
    }
  }, []);

  const handleResetCamera = useCallback(() => {
    handleSetCameraPreset('iso');
  }, [handleSetCameraPreset]);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* 1. Top Bar Navigation Contract */}
      <Navbar
        currentModel={currentModel}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenModelSelector={() => setIsModelSelectorOpen(true)}
        onOpenUnfolding={() => setIsUnfoldingOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenTeacherStudio={() => setIsTeacherStudioOpen(true)}
        onOpenCrossSection={() => setIsCrossSectionOpen(true)}
        onOpenGeometricProof={() => setIsGeometricProofOpen(true)}
        onOpenOxyzStudio={() => setIsOxyzStudioOpen(true)}
        onOpenFormulaLab={() => setIsFormulaLabOpen(true)}
        onOpenInteractiveGames={() => setIsInteractiveGamesOpen(true)}
        onOpenCurriculumWorksheet={() => setIsCurriculumWorksheetOpen(true)}
        onOpenExportQr={() => setIsExportQrOpen(true)}
        onOpenPresentationMode={() => setIsPresentationModeOpen(true)}
        onOpenArAiAssistant={() => setIsArAiAssistantOpen(true)}
        onOpenLessonDesigner={() => setIsLessonDesignerOpen(true)}
        onOpenStudentGuide={() => setIsStudentGuideOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* 2. Central 3D Viewport (100% Unobstructed Center) */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <ThreeViewport
          model={currentModel}
          params={params}
          viewMode={viewMode}
          hiddenLineMode={hiddenLineMode}
          showLabels={showLabels}
          showRightAngles={showRightAngles}
          autoRotate={autoRotate}
          onSelectElement={setSelectedElement}
          selectedElement={selectedElement}
          canvasRefCallback={setCanvasElem}
        />

        {/* Floating Element Inspector Badge when user clicks vertex, edge, or face */}
        <ElementInspector
          element={selectedElement}
          onClear={() => setSelectedElement({ type: 'none' })}
        />

        {/* Guided Learning Mode Panel */}
        {activeTab === 'guided' && (
          <GuidedLearningPanel
            model={currentModel}
            onClose={() => setActiveTab('explore')}
          />
        )}

        {/* Math & Formulas Panel (KaTeX, Step-by-step substitution, Unit selector) */}
        <FormulaPanel
          model={currentModel}
          params={params}
          unit={unit}
          setUnit={setUnit}
        />

        {/* Collapsible Ergonomic Bottom Dock (Zero Viewport Occlusion) */}
        <ParametersDock
          model={currentModel}
          params={params}
          onParamChange={handleParamChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
          hiddenLineMode={hiddenLineMode}
          setHiddenLineMode={setHiddenLineMode}
          showLabels={showLabels}
          setShowLabels={setShowLabels}
          showRightAngles={showRightAngles}
          setShowRightAngles={setShowRightAngles}
          autoRotate={autoRotate}
          setAutoRotate={setAutoRotate}
          onResetCamera={handleResetCamera}
          onSetCameraPreset={handleSetCameraPreset}
        />
      </main>

      {/* 3. Modals & Dialogs */}
      {/* Model Selector Library (30 Models) */}
      <ModelSelectorModal
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        currentModelId={currentModelId}
        onSelectModel={handleSelectModel}
      />

      {/* 2D Net Unfolding & Folding Modal */}
      <UnfoldingModal
        isOpen={isUnfoldingOpen}
        onClose={() => setIsUnfoldingOpen(false)}
        model={currentModel}
        params={params}
        onParamsChange={setParams}
      />

      {/* Practice & Quiz Modal */}
      <QuizPracticeModal
        isOpen={activeTab === 'quiz'}
        onClose={() => setActiveTab('explore')}
      />

      {/* Spatial Thinking Training Mode Modal (THCS & THPT) */}
      <SpatialThinkingModal
        isOpen={activeTab === 'spatial'}
        onClose={() => setActiveTab('explore')}
      />

      {/* High-Resolution PNG & Exam Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        canvas={canvasElem}
        model={currentModel}
      />

      {/* Chế độ Giáo viên – Biên soạn hình học & đề kiểm tra (Cô Cao Thị Thu Thảo - THCS & THPT Long Hiệp) */}
      <TeacherStudioModal
        isOpen={isTeacherStudioOpen}
        onClose={() => setIsTeacherStudioOpen(false)}
        currentModel={currentModel}
        onApplyConfigToMain={(config) => {
          const target = getModelById(config.modelId);
          if (target && target.id !== currentModel.id) {
            setCurrentModelId(target.id);
            setCurrentModel(target);
          }
          setParams(config.params);
          setIsTeacherStudioOpen(false);
        }}
      />

      {/* 1. Cắt khối & Quan sát thiết diện */}
      <CrossSectionModal
        isOpen={isCrossSectionOpen}
        onClose={() => setIsCrossSectionOpen(false)}
        model={currentModel}
        params={params}
      />

      {/* 2. Dựng hình & Chứng minh hình học không gian */}
      <GeometricProofModal
        isOpen={isGeometricProofOpen}
        onClose={() => setIsGeometricProofOpen(false)}
      />

      {/* 3. Hệ tọa độ Oxyz chuyên sâu */}
      <OxyzStudioModal
        isOpen={isOxyzStudioOpen}
        onClose={() => setIsOxyzStudioOpen(false)}
      />

      {/* 4. Thí nghiệm kiểm chứng công thức (Cavalieri, rót nước 1/3, Archimedes) */}
      <FormulaLabModal
        isOpen={isFormulaLabOpen}
        onClose={() => setIsFormulaLabOpen(false)}
      />

      {/* 5. Trò chơi tương tác (Euler Polyhedron & Đoán thiết diện) */}
      <InteractiveGamesModal
        isOpen={isInteractiveGamesOpen}
        onClose={() => setIsInteractiveGamesOpen(false)}
      />

      {/* 6. Kho bài học & Phiếu học tập chuẩn GDPT 2018 */}
      <CurriculumWorksheetModal
        isOpen={isCurriculumWorksheetOpen}
        onClose={() => setIsCurriculumWorksheetOpen(false)}
        onSelectModel={(mId) => {
          const found = getModelById(mId);
          if (found) handleSelectModel(found);
          setIsCurriculumWorksheetOpen(false);
        }}
      />

      {/* 7. Xuất tài liệu & Mã QR */}
      <ExportQrModal
        isOpen={isExportQrOpen}
        onClose={() => setIsExportQrOpen(false)}
        model={currentModel}
        canvas={canvasElem}
      />

      {/* 8. Chức năng trình chiếu bài giảng toàn màn hình & Bút vẽ phấn */}
      <PresentationModeModal
        isOpen={isPresentationModeOpen}
        onClose={() => setIsPresentationModeOpen(false)}
        model={currentModel}
        params={params}
      />

      {/* 9. Trợ năng AR & Trợ lý AI sư phạm */}
      <ArAiAssistantModal
        isOpen={isArAiAssistantOpen}
        onClose={() => setIsArAiAssistantOpen(false)}
        model={currentModel}
      />

      {/* 10. Trình thiết kế bài học hình học 3D (Ràng buộc toán học) */}
      <LessonDesignerModal
        isOpen={isLessonDesignerOpen}
        onClose={() => setIsLessonDesignerOpen(false)}
      />

      {/* 11. Hướng dẫn nhanh cho học sinh */}
      <StudentGuideModal
        isOpen={isStudentGuideOpen}
        onClose={() => setIsStudentGuideOpen(false)}
      />
    </div>
  );
}
