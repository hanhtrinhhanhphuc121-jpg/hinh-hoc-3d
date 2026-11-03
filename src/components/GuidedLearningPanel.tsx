import React, { useState } from 'react';
import { BookOpen, HelpCircle, CheckCircle2, ChevronRight, Eye, Sparkles } from 'lucide-react';
import { GeometryModel } from '../types/geometry';

interface GuidedLearningPanelProps {
  model: GeometryModel;
  onClose: () => void;
}

export const GuidedLearningPanel: React.FC<GuidedLearningPanelProps> = ({
  model,
  onClose,
}) => {
  const steps = model.guidedSteps || [
    {
      id: 1,
      title: 'Quan sát các yếu tố hình học',
      question: `Hãy quan sát và đếm các đỉnh, cạnh và mặt của ${model.name}. Bạn nhận thấy những đặc điểm gì đặc biệt?`,
      hint: 'Hãy dùng chuột xoay tròn 360 độ và bật nhãn đỉnh để quan sát toàn diện.',
      answerExplanation: `Mô hình ${model.name} có cấu trúc không gian chuẩn với các đỉnh và mặt tuân theo định lý Euler hoặc tính chất đối xứng.`,
      expectedObservation: 'Quan sát thấy các mặt đối xứng và quan hệ vị trí tương đối.',
    },
    {
      id: 2,
      title: 'Khám phá sự biến thiên kích thước',
      question: 'Khi bạn thay đổi thanh trượt kích thước (chiều cao, bán kính, cạnh đáy), diện tích và thể tích thay đổi như thế nào?',
      hint: 'Nhìn vào bảng công thức bên phải để thấy các bước thay số cập nhật tự động.',
      answerExplanation: 'Diện tích thay đổi tỉ lệ thuận với bình phương kích thước dài (k²), còn thể tích thay đổi theo lũy thừa ba (k³)!',
      expectedObservation: 'Hiểu bản chất công thức tỉ số thể tích và diện tích.',
    },
  ];

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const step = steps[currentStepIdx] || steps[0];

  const handleNextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
      setShowHint(false);
      setIsAnswerRevealed(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
      setShowHint(false);
      setIsAnswerRevealed(false);
    }
  };

  return (
    <div className="fixed top-16 left-4 z-30 w-80 sm:w-96 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden max-h-[calc(100vh-6rem)] select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">
              HỌC TẬP CÓ HƯỚNG DẪN
            </h3>
            <p className="text-[10px] text-slate-400">
              Bước {currentStepIdx + 1} / {steps.length}: {step.title}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800"
        >
          Đóng
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Question card */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nhiệm vụ khám phá:</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {step.question}
          </p>
        </div>

        {/* Hint toggle */}
        <div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý gợi mở'}</span>
          </button>
          {showHint && (
            <div className="mt-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
              {step.hint}
            </div>
          )}
        </div>

        {/* Verification & answer reveal */}
        <div>
          {!isAnswerRevealed ? (
            <button
              onClick={() => setIsAnswerRevealed(true)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Kiểm chứng và Xem giải thích</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Kết luận toán học chính xác:</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {step.answerExplanation}
              </p>
              <div className="pt-2 border-t border-emerald-500/20 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Bài học rút ra: </span>
                {step.expectedObservation}
              </div>
            </div>
          )}
        </div>

        {/* Navigation between steps */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIdx === 0}
            className="px-3 py-1.5 text-xs font-medium bg-slate-950 border border-slate-800 rounded-lg text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
          >
            Bước trước
          </button>

          <span className="text-xs text-slate-500 font-mono">
            {currentStepIdx + 1} / {steps.length}
          </span>

          <button
            onClick={handleNextStep}
            disabled={currentStepIdx === steps.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg disabled:opacity-40 hover:bg-indigo-500 transition-colors"
          >
            <span>Bước kế</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
