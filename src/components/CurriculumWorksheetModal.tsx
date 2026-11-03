import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Printer,
  CheckCircle,
  Sparkles,
  HelpCircle,
  Download,
  GraduationCap,
} from 'lucide-react';
import { curriculumLessons, CurriculumLesson } from '../data/curriculumLessons';
import { KaTeX } from '../utils/katexRenderer';

interface CurriculumWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel?: (modelId: string) => void;
}

export const CurriculumWorksheetModal: React.FC<CurriculumWorksheetModalProps> = ({
  isOpen,
  onClose,
  onSelectModel,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('Tất cả');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(curriculumLessons[0].id);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showSolutions, setShowSolutions] = useState<boolean>(false);

  const filteredLessons =
    selectedGrade === 'Tất cả'
      ? curriculumLessons
      : curriculumLessons.filter((l) => l.grade === selectedGrade);

  const activeLesson =
    curriculumLessons.find((l) => l.id === selectedLessonId) || curriculumLessons[0];

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="h-14 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Kho Bài Học và Phiếu Học Tập Chuẩn GDPT 2018
                <span className="text-xs font-normal text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60">
                  THCS và THPT
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-teal-400" />
              <span>In phiếu bài tập</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar: Lessons Catalog */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60 p-4 overflow-y-auto flex flex-col gap-4">
            {/* Grade filter */}
            <div className="flex flex-wrap gap-1.5">
              {['Tất cả', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 11', 'Lớp 12'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedGrade === g
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Lesson list */}
            <div className="space-y-2">
              {filteredLessons.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setSelectedLessonId(l.id);
                    setShowSolutions(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-colors flex flex-col gap-1 ${
                    selectedLessonId === l.id
                      ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{l.title}</span>
                    <span className="text-[10px] text-teal-400 font-mono bg-teal-950/80 px-1.5 py-0.5 rounded">
                      {l.grade}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{l.summary}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Right Main Panel: Lesson Overview & Worksheet */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-900/90 space-y-6">
            {/* Lesson Title Banner */}
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60">
                  {activeLesson.grade}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">{activeLesson.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{activeLesson.summary}</p>
            </div>

            {/* Key Formulas Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Công thức cốt lõi cần ghi nhớ
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeLesson.formulas.map((f, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[11px] text-slate-400">{f.label}:</div>
                    <div className="text-amber-300 text-xs">
                      <KaTeX math={f.math} block />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Worksheet Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                  Phiếu bài tập luyện tập
                </h4>
                <button
                  onClick={() => setShowSolutions(!showSolutions)}
                  className="text-xs text-teal-400 hover:text-teal-300 font-medium underline"
                >
                  {showSolutions ? 'Ẩn đáp án và hướng dẫn' : 'Xem đáp án và hướng dẫn'}
                </button>
              </div>

              <div className="space-y-4">
                {activeLesson.worksheetQuestions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <div className="font-semibold text-white">
                      Câu {qIdx + 1}: {q.question}
                    </div>

                    {q.type === 'multiple-choice' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                              userAnswers[q.id] === opt
                                ? 'bg-teal-600/20 border-teal-500 text-teal-200'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={userAnswers[q.id] === opt}
                              onChange={() => setUserAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                              className="text-teal-500 focus:ring-0"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {q.type === 'essay' && (
                      <input
                        type="text"
                        placeholder="Nhập kết quả của bạn..."
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => setUserAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                      />
                    )}

                    {showSolutions && (
                      <div className="p-3 bg-teal-950/40 border border-teal-800/60 rounded-lg text-teal-200 space-y-1 animate-in fade-in">
                        <div className="font-bold">Đáp án: {q.correctAnswer}</div>
                        <div className="text-[11px] text-slate-300">{q.guide}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
