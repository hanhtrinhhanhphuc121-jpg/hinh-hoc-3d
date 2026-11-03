import React, { useState } from 'react';
import { Download, Smartphone, Check, X, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'dock' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  // If already running inside installed standalone PWA, suppress
  if (isInstalled) {
    return null;
  }

  // Handle click
  const handleClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General instructions for desktop/Android
      alert(
        'Để cài đặt ứng dụng vào máy:\n• Trên Chrome/Edge máy tính: Bấm biểu tượng Cài đặt trên thanh địa chỉ.\n• Trên điện thoại Android: Bấm menu 3 chấm ⋮ > "Thêm vào màn hình chính" (Add to Home screen).'
      );
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 shadow-sm ${
          variant === 'navbar'
            ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:text-white'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
        }`}
        title="Cài đặt Hình Học 3D về điện thoại hoặc máy tính để dùng ngoại tuyến (không bắt buộc)"
      >
        <Download className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Cài App Offline</span>
        <span className="sm:hidden">Cài App</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Cài đặt trên iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2.5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  1
                </span>
                <span>
                  Nhấn vào nút <strong>Chia sẻ (Share <Share className="w-3 h-3 inline mx-0.5 text-blue-400" />)</strong> ở thanh dưới trình duyệt Safari.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  2
                </span>
                <span>
                  Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  3
                </span>
                <span>
                  Nhấn <strong>"Thêm" (Add)</strong> ở góc trên bên phải để hoàn tất.
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Sau khi thêm, bạn có thể mở ứng dụng ngay trên màn hình chính và sử dụng khi không có mạng Internet!
            </p>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};
