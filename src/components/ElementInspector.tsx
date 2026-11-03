import React from 'react';
import { X, Info, CornerDownRight } from 'lucide-react';
import { SelectedElement } from '../types/geometry';

interface ElementInspectorProps {
  element: SelectedElement;
  onClear: () => void;
}

export const ElementInspector: React.FC<ElementInspectorProps> = ({
  element,
  onClear,
}) => {
  if (element.type === 'none') return null;

  const getTypeBadge = () => {
    switch (element.type) {
      case 'vertex':
        return 'Đỉnh';
      case 'edge':
        return 'Cạnh / Đoạn thẳng';
      case 'face':
        return 'Mặt phẳng';
      default:
        return 'Yếu tố';
    }
  };

  return (
    <div className="fixed top-16 left-4 z-20 pointer-events-auto bg-slate-900/95 border border-indigo-500/40 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs text-slate-200 min-w-56 animate-in slide-in-from-top-2 duration-150 select-none">
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300 font-medium text-[10px] font-mono">
            {getTypeBadge()}
          </span>
          <span className="font-bold text-white text-sm">
            {element.name || element.id}
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors"
          title="Bỏ chọn"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {element.details && (
        <div className="mt-2 space-y-1">
          {Object.entries(element.details).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between gap-4 text-[11px]">
              <span className="text-slate-400">{key}:</span>
              <span className="font-mono font-semibold text-indigo-300 tabular-nums">
                {String(val)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
