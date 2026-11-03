import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Award, RotateCcw, HelpCircle, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sampleQuizQuestions } from '../models/modelRegistry';
import { QuizQuestion } from '../types/geometry';

interface QuizPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuizPracticeModal: React.FC<QuizPracticeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [questions] = useState<QuizQuestion[]>(sampleQuizQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    setAnsweredCount((prev) => prev + 1);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setAnsweredCount(0);
    setQuizCompleted(false);
  };

  const getTopicLabel = (topic: string) => {
    switch (topic) {
      case 'recognition':
        return 'Nhận diện hình khối';
      case 'properties':
        return 'Yếu tố và Tính chất hình học';
      case 'relation':
        return 'Quan hệ vuông góc và song song';
      case 'calculation':
        return 'Tính toán diện tích và thể tích';
      default:
        return 'Hình học không gian';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <span>Luyện Tập và Kiểm Tra Kiến Thức Hình Học 3D</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Bộ câu hỏi nhận diện hình, tính chất đối xứng, quan hệ vuông góc và bài toán thể tích
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {quizCompleted ? (
            /* Quiz Completed Results */
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center mb-4 ring-8 ring-indigo-500/10">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Hoàn Thành Bài Luyện Tập!</h3>
              <p className="text-sm text-slate-400 mb-6">
                Bạn đã trả lời đúng <span className="font-bold text-indigo-400 font-mono text-base">{score}</span> trên tổng số{' '}
                <span className="font-bold text-slate-200 font-mono text-base">{questions.length}</span> câu hỏi.
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Làm lại từ đầu</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : (
            /* Active Question */
            <div className="space-y-4">
              {/* Question metadata row */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 font-bold font-mono">
                    Câu {currentIndex + 1} / {questions.length}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-300 font-medium">
                    {getTopicLabel(currentQ.topic)}
                  </span>
                </div>
                <div className="text-slate-300 font-mono font-medium">
                  Điểm: <span className="text-emerald-400 font-bold">{score}</span> / {answeredCount}
                </div>
              </div>

              {/* Question text */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <h3 className="text-sm font-semibold text-white leading-relaxed">
                  {currentQ.question}
                </h3>
              </div>

              {/* Multiple choice options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isChosen = selectedOption === idx;
                  const isCorrectAnswer = idx === currentQ.correctIndex;

                  let btnStyle = 'bg-slate-950/80 border-slate-800 hover:bg-slate-800/80 text-slate-200';
                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                    } else if (isChosen && !isCorrectAnswer) {
                      btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500';
                    } else {
                      btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isAnswered && isCorrectAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {isAnswered && isChosen && !isCorrectAnswer && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after answering */}
              {isAnswered && (
                <div className="mt-4 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-slate-200 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                    <HelpCircle className="w-4 h-4" />
                    <span>Giải thích toán học chi tiết:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Next Question Button */}
              {isAnswered && (
                <div className="flex justify-end pt-3">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <span>{currentIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
