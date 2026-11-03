import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Smartphone,
  Share2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { GeometryModel } from '../types/geometry';

interface ExportQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: GeometryModel;
  canvas: HTMLCanvasElement | null;
}

export const ExportQrModal: React.FC<ExportQrModalProps> = ({
  isOpen,
  onClose,
  model,
  canvas,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [modelImgUrl, setModelImgUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('');
  const [className, setClassName] = useState<string>('11A1');

  // Build current shareable link
  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?model=${model.id}`
    : `https://hinhhoc3d.edu.vn/?model=${model.id}`;

  // Generate QR code and capture snapshot of canvas
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(currentUrl, {
      width: 250,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));

    if (canvas) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        setModelImgUrl(dataUrl);
      } catch (e) {
        console.warn('Canvas export warning:', e);
      }
    }
  }, [isOpen, currentUrl, canvas, model]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="h-14 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Xuất Tài Liệu và Mã QR Mô Hình 3D
                <span className="text-xs font-normal text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800/60">
                  {model.name}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-sm shadow-indigo-600/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu Học Tập A4</span>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top: Mobile QR Scan Hero */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
            {qrDataUrl && (
              <div className="bg-white p-3 rounded-2xl shadow-xl shrink-0 flex flex-col items-center">
                <img src={qrDataUrl} alt="Mã QR Mô hình 3D" className="w-40 h-40" />
                <span className="text-[10px] text-slate-700 font-semibold mt-1">Quét bằng Camera</span>
              </div>
            )}

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  <Smartphone className="w-4 h-4 text-orange-400" />
                  Quét mã mở trực tiếp mô hình trên điện thoại / iPad
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Học sinh không cần đăng nhập hay cài ứng dụng. Chỉ cần bật máy ảnh quét mã QR để xoay 360°, mở hình khai triển 2D và kiểm tra công thức trực tiếp trên điện thoại.
                </p>
              </div>

              {/* Share link input with copy button */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1.5">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-transparent text-xs text-slate-300 px-2 flex-1 focus:outline-none font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-white flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép link'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Printable A4 Worksheet Preview */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Bản xem trước Phiếu Bài Tập Về Nhà (Chuẩn in A4)
            </h4>

            {/* Printable Paper Canvas (White BG with Black Text for crisp printing) */}
            <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-xl border border-slate-300 max-w-2xl mx-auto space-y-6">
              {/* Paper Header */}
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700">Trường THCS và THPT Long Hiệp</div>
                  <div className="text-base font-black uppercase text-slate-900">PHIẾU BÀI TẬP HÌNH HỌC KHÔNG GIAN</div>
                  <div className="text-xs font-semibold text-slate-600">Chủ đề: {model.name}</div>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <div>Họ và tên: .......................................</div>
                  <div>Lớp: .................  Ngày: ....../....../2026</div>
                </div>
              </div>

              {/* Diagram & QR Code Row */}
              <div className="flex items-center justify-between gap-6 border-b border-slate-200 pb-4">
                {modelImgUrl && (
                  <div className="flex-1 flex flex-col items-center">
                    <img src={modelImgUrl} alt="Hình vẽ mô hình 3D" className="max-h-48 object-contain" />
                    <span className="text-[11px] italic text-slate-500 mt-1">Hình 1. Mô hình không gian {model.name}</span>
                  </div>
                )}

                {qrDataUrl && (
                  <div className="w-32 flex flex-col items-center text-center p-2 border border-slate-300 rounded-lg shrink-0">
                    <img src={qrDataUrl} alt="Mã QR" className="w-24 h-24" />
                    <span className="text-[9px] font-bold text-slate-700 mt-1 uppercase">Quét xem 3D tương tác</span>
                  </div>
                )}
              </div>

              {/* Exercise Questions */}
              <div className="space-y-4 text-xs">
                <div>
                  <strong>Bài 1: </strong> Nêu định nghĩa và các tính chất cơ bản của {model.name.toLowerCase()} (số đỉnh, số cạnh, số mặt).
                  <div className="h-10 border-b border-dotted border-slate-400 mt-2"></div>
                </div>

                <div>
                  <strong>Bài 2: </strong> Viết công thức tính diện tích xung quanh và thể tích của {model.name.toLowerCase()}.
                  <div className="h-12 border-b border-dotted border-slate-400 mt-2"></div>
                </div>

                <div>
                  <strong>Bài 3: </strong> Cho các thông số kích thước cụ thể, hãy tính toán và kiểm chứng kết quả bằng cách quét mã QR trên điện thoại.
                  <div className="h-14 border-b border-dotted border-slate-400 mt-2"></div>
                </div>
              </div>

              {/* Paper Footer */}
              <div className="pt-2 border-t border-slate-200 text-center text-[10px] text-slate-500 italic">
                Giáo viên phát triển: Cao Thị Thu Thảo (GV trường THCS và THPT Long Hiệp)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
