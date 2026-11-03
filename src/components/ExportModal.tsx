import React, { useState } from 'react';
import { X, Download, FileImage, Check } from 'lucide-react';
import { exportCanvasAsPNG } from '../utils/exportUtils';
import { GeometryModel } from '../types/geometry';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: HTMLCanvasElement | null;
  model: GeometryModel;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvas,
  model,
}) => {
  const [background, setBackground] = useState<'white' | 'transparent' | 'dark'>('white');
  const [blackLines, setBlackLines] = useState(true);
  const [includeTitle, setIncludeTitle] = useState(true);

  if (!isOpen) return null;

  const handleExportPNG = () => {
    if (!canvas) return;
    const filename = `${model.id}_hinh_hoc_${background}.png`;
    exportCanvasAsPNG(
      canvas,
      {
        background,
        blackLines,
        includeLabels: true,
        scaleFactor: 2,
        title: includeTitle ? `${model.name}` : undefined,
      },
      filename
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <FileImage className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Xuất Ảnh Hình Học In Đề Thi và Giáo Trình</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          {/* Background choice */}
          <div>
            <label className="font-semibold text-slate-200 block mb-2">
              1. Màu nền ảnh xuất:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => setBackground('white')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  background === 'white'
                    ? 'bg-white text-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Nền trắng (In đề thi)
              </button>

              <button
                onClick={() => setBackground('transparent')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  background === 'transparent'
                    ? 'bg-slate-800 text-white border-indigo-500 ring-2 ring-indigo-500/30 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Nền trong suốt (PNG)
              </button>

              <button
                onClick={() => setBackground('dark')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  background === 'dark'
                    ? 'bg-slate-950 text-indigo-400 border-indigo-500 ring-2 ring-indigo-500/30 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Nền phòng Lab (Tối)
              </button>
            </div>
          </div>

          {/* Test paper options */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="font-semibold text-slate-200 block mb-1">
              2. Tùy chọn in ấn đề kiểm tra:
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={blackLines}
                onChange={(e) => setBlackLines(e.target.checked)}
                className="rounded accent-indigo-500 w-4 h-4"
              />
              <span>Tối ưu độ tương phản cho máy in đề đen trắng</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTitle}
                onChange={(e) => setIncludeTitle(e.target.checked)}
                className="rounded accent-indigo-500 w-4 h-4"
              />
              <span>In tiêu đề tên mô hình ở góc trên</span>
            </label>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-400 text-[11px] leading-relaxed">
            Mẹo: Hãy xoay mô hình 3D về góc nhìn mong muốn trước khi bấm xuất. Ảnh PNG xuất ra sẽ giữ nguyên chính xác góc nhìn hiện tại với độ phân giải cao sắc nét.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Tải ảnh PNG độ nét cao</span>
          </button>
        </div>
      </div>
    </div>
  );
};
