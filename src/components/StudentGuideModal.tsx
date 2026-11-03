import React from 'react';
import {
  X,
  HelpCircle,
  Rotate3d,
  Layers,
  Scissors,
  Maximize2,
  Sliders,
  CheckCircle,
  Eye,
  Smartphone,
  BookOpen,
} from 'lucide-react';

interface StudentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentGuideModal: React.FC<StudentGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="h-14 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Hướng Dẫn Sử Dụng Nhanh Cho Học Sinh
              </h2>
              <p className="text-[11px] text-slate-400">
                Khám phá hình học không gian 3D tương tác – 100% Miễn phí &amp; Không cần đăng nhập
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 text-xs">
          {/* Quick tips list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. Thao tác xoay 3D */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <Rotate3d className="w-4 h-4 text-indigo-400" />
                <span>1. Xoay &amp; Phóng To 3D</span>
              </div>
              <ul className="text-slate-300 space-y-1 text-[11px] leading-relaxed list-disc list-inside">
                <li><strong>Trên điện thoại/tablet:</strong> Dùng 1 ngón vuốt để xoay 360°, chụm 2 ngón để phóng to / thu nhỏ.</li>
                <li><strong>Trên máy tính:</strong> Kéo chuột trái để xoay, lăn con trỏ để phóng to, kéo chuột phải để di chuyển khối.</li>
              </ul>
            </div>

            {/* 2. Nét thấy - Nét khuất */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>2. Nhận Diện Nét Đứt / Nét Khuất</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Nút <strong>"Nét khuất (Auto)"</strong> ở thanh dưới tự động tính toán góc nhìn của mắt. Khi bạn xoay hình, các cạnh bị khuất sẽ tự động chuyển sang nét đứt đúng quy ước vẽ hình học SGK!
              </p>
            </div>

            {/* 3. Đổi 30 mô hình toán */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>3. Thư Viện 30 Mô Hình</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Bấm vào nút <strong>"Mô hình"</strong> ở góc trên bên trái để đổi sang: Khối lập phương, Khối chóp S.ABCD, Lăng trụ tam giác, Hình nón, Hình trụ, Khối cầu, Kim tự tháp, Hệ tọa độ Oxyz...
              </p>
            </div>

            {/* 4. Kéo thanh trượt tham số */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>4. Thay Đổi Kích Thước &amp; Công Thức</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Kéo thanh trượt cạnh đáy, chiều cao hoặc bán kính. Bảng công thức góc trên bên phải sẽ tự động thế số và tính Diện tích xung quanh, Diện tích toàn phần, Thể tích theo thời gian thực.
              </p>
            </div>

            {/* 5. Mở hình khai triển 2D */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <Scissors className="w-4 h-4 text-indigo-400" />
                <span>5. Mở Hình Khai Triển 2D</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Bấm <strong>"Mở hình 2D"</strong> để trải phẳng các mặt của hình hộp, hình chóp, nón, trụ ra mặt phẳng. Kéo thanh trượt để quan sát quá trình gấp - mở trực quan!
              </p>
            </div>

            {/* 6. Chế độ toàn màn hình */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <Maximize2 className="w-4 h-4 text-indigo-400" />
                <span>6. Chế Độ Toàn Màn Hình</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Bấm biểu tượng <strong>Toàn màn hình</strong> trên thanh công cụ để mở rộng không gian 3D, loại bỏ viền trình duyệt giúp học tập và quan sát tập trung nhất.
              </p>
            </div>
          </div>

          {/* Offline notice */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 space-y-1.5">
            <div className="font-bold flex items-center gap-2 text-emerald-300">
              <CheckCircle className="w-4 h-4" />
              <span>Sử dụng Ngoại Tuyến (Offline) Không Tốn Dung Lượng 4G</span>
            </div>
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              Trang web hoạt động hoàn toàn trên trình duyệt của em. Sau khi truy cập lần đầu, ứng dụng được lưu vào bộ nhớ đệm (PWA Cache). Em có thể bấm nút <strong>"Cài App Offline"</strong> để đặt biểu tượng lên màn hình chính điện thoại và mở học bất cứ khi nào, kể cả lúc không có mạng!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-slate-800 px-5 flex items-center justify-between shrink-0 bg-slate-950/80 text-[11px] text-slate-400">
          <span>Giáo viên phát triển: Cao Thị Thu Thảo (GV trường THCS và THPT Long Hiệp)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            Đã hiểu, Bắt đầu học
          </button>
        </div>
      </div>
    </div>
  );
};
