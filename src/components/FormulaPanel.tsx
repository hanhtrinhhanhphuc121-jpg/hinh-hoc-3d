import React, { useState } from 'react';
import { Calculator, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
import { GeometryModel } from '../types/geometry';
import { KaTeX } from '../utils/katexRenderer';

interface FormulaPanelProps {
  model: GeometryModel;
  params: Record<string, number>;
  unit: string;
  setUnit: (u: string) => void;
}

export const FormulaPanel: React.FC<FormulaPanelProps> = ({
  model,
  params,
  unit,
  setUnit,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const units = ['cm', 'dm', 'm', 'mm'];

  const formulaSteps = model.calculateFormulas(params, unit);

  return (
    <aside
      className={`fixed top-16 right-4 z-30 transition-all duration-300 pointer-events-none select-none ${
        isOpen ? 'w-80 sm:w-96' : 'w-10'
      }`}
    >
      <div className="pointer-events-auto bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden max-h-[calc(100vh-6rem)]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Calculator className="w-3.5 h-3.5" />
            </div>
            {isOpen && (
              <h3 className="text-xs font-bold text-white tracking-wide truncate">
                CÔNG THỨC TOÁN HỌC VÀ TÍNH TOÁN
              </h3>
            )}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title={isOpen ? 'Thu gọn bảng công thức' : 'Mở bảng công thức'}
          >
            {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {isOpen && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Unit selector row */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800/80">
              <span className="text-slate-400 font-medium">Đơn vị đo độ dài:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                {units.map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`px-2 py-0.5 text-xs font-mono font-medium rounded transition-colors ${
                      unit === u
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Educational notes & definition differences */}
            {model.educationalNotes && model.educationalNotes.length > 0 && (
              <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
                <div className="flex items-center gap-1.5 text-indigo-300 font-semibold mb-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Bản chất hình học và Phân biệt:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  {model.educationalNotes.slice(0, 3).map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* List of formula steps with KaTeX & live numbers */}
            <div className="space-y-3">
              {formulaSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-200">
                      {step.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-400 tabular-nums">
                      {step.result} {step.unit}
                    </span>
                  </div>

                  {/* KaTeX formula */}
                  <div className="bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800/80 mb-2 overflow-x-auto text-center">
                    <KaTeX math={step.latexFormula} block={false} className="text-sm text-indigo-300 font-serif" />
                  </div>

                  {/* Substitution Step */}
                  <div className="text-[11px] text-slate-400 flex items-center justify-between bg-slate-900/40 px-2 py-1 rounded">
                    <span>Thay số:</span>
                    <span className="font-mono text-slate-300">
                      <KaTeX math={step.substitution} className="text-xs" />
                    </span>
                  </div>

                  {/* Explanation text */}
                  <p className="text-[10px] text-slate-500 mt-1.5 italic">
                    {step.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
