import React, { useState, useMemo } from 'react';
import { X, Search, Check, Layers, Compass, Atom } from 'lucide-react';
import { GeometryModel, ModelCategory } from '../types/geometry';
import { allModels, categoriesConfig } from '../models/modelRegistry';

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModelId: string;
  onSelectModel: (model: GeometryModel) => void;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  isOpen,
  onClose,
  currentModelId,
  onSelectModel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredModels = useMemo(() => {
    return allModels.filter((m) => {
      const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [searchTerm, selectedCategory]);

  if (!isOpen) return null;

  const getCategoryIcon = (cat: ModelCategory) => {
    switch (cat) {
      case 'spatial':
        return <Layers className="w-4 h-4 text-indigo-400" />;
      case 'coordinate':
        return <Compass className="w-4 h-4 text-cyan-400" />;
      case 'interdisciplinary':
        return <Atom className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Thư Viện 30 Mô Hình Toán Học</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chọn mô hình ba chiều để khám phá hình học không gian, tọa độ Oxyz và liên môn
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm mô hình (lập phương, nón, Oxyz, H2O, SA vuông góc...)"
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-950 rounded-lg border border-slate-800">
            {categoriesConfig.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Model Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredModels.map((item, index) => {
            const isSelected = item.id === currentModelId;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectModel(item);
                  onClose();
                }}
                className={`group relative p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {getCategoryIcon(item.category)}
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {item.description}
                </p>

                {/* Metadata row with clean unboxed text and separator discipline */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="text-slate-400 font-medium">
                    {item.gradeLevel === 'all' ? 'THCS và THPT' : item.gradeLevel}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{item.params.length} tham số</span>
                  {item.netDefinition && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400 font-medium">Khai triển 2D</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {filteredModels.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 text-sm">
              Không tìm thấy mô hình nào khớp với từ khóa "{searchTerm}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Tổng số: 30 mô hình chính thức chuẩn bộ GD và ĐT</span>
          <span>Nhấn ESC hoặc bấm bên ngoài để đóng</span>
        </div>
      </div>
    </div>
  );
};
