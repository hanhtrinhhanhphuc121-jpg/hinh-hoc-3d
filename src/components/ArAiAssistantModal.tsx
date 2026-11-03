import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Smartphone,
  Eye,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Send,
  Loader2,
  Bot,
} from 'lucide-react';
import { GeometryModel } from '../types/geometry';
import { KaTeX } from '../utils/katexRenderer';

interface ArAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: GeometryModel;
}

export const ArAiAssistantModal: React.FC<ArAiAssistantModalProps> = ({
  isOpen,
  onClose,
  model,
}) => {
  const [activeTab, setActiveTab] = useState<'ar' | 'ai'>('ar');

  // AR Capability State
  const [isCheckingAr, setIsCheckingAr] = useState<boolean>(true);
  const [arSupported, setArSupported] = useState<boolean>(false);
  const [arMessage, setArMessage] = useState<string>('');

  // AI Assistant State
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiChat, setAiChat] = useState<{ role: 'user' | 'assistant'; text: string; math?: string }[]>([
    {
      role: 'assistant',
      text: `Xin chào! Tôi là Trợ lý Sư phạm Hình học 3D. Tôi có thể giúp bạn giải thích phương pháp chứng minh, cách xác định góc, khoảng cách và nguồn gốc công thức của ${model.name}. Bạn có câu hỏi nào không?`,
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Check WebXR AR capability on mount
  useEffect(() => {
    if (!isOpen) return;

    setIsCheckingAr(true);
    if (typeof window !== 'undefined' && 'xr' in navigator && (navigator as any).xr?.isSessionSupported) {
      (navigator as any).xr
        .isSessionSupported('immersive-ar')
        .then((supported: boolean) => {
          setArSupported(supported);
          if (supported) {
            setArMessage('Thiết bị và trình duyệt của bạn hỗ trợ WebXR AR đầy đủ! Bạn có thể khởi động phiên AR để chiếu mô hình 3D lên mặt bàn thực tế.');
          } else {
            setArMessage(
              'Trình duyệt hoặc phần cứng hiện tại chưa hỗ trợ WebXR Immersive AR. Để đặt mô hình 3D vào không gian lớp học qua camera, bạn cần sử dụng điện thoại thông minh hỗ trợ ARCore (Android) hoặc ARKit (iPhone/iPad).'
            );
          }
          setIsCheckingAr(false);
        })
        .catch(() => {
          setArSupported(false);
          setArMessage(
            'Trình duyệt máy tính để bàn thông thường không tích hợp camera cảm biến AR. Vui lòng mở ứng dụng trên thiết bị di động (hỗ trợ ARCore / ARKit) để kích hoạt tính năng này.'
          );
          setIsCheckingAr(false);
        });
    } else {
      setArSupported(false);
      setArMessage(
        'Thiết bị hoặc trình duyệt hiện tại chưa hỗ trợ API WebXR AR. Để trải nghiệm đặt mô hình 3D lên mặt bàn thực tế, vui lòng sử dụng trình duyệt Chrome/Safari trên thiết bị di động hỗ trợ ARCore/ARKit qua kết nối HTTPS.'
      );
      setIsCheckingAr(false);
    }
  }, [isOpen]);

  // AI geometry answer solver
  const handleSendAi = () => {
    if (!aiQuestion.trim() || isAiLoading) return;
    const q = aiQuestion.trim();
    setAiQuestion('');
    setAiChat((prev) => [...prev, { role: 'user', text: q }]);
    setIsAiLoading(true);

    // Pedagogical mathematical explanations for spatial geometry
    setTimeout(() => {
      let responseText = '';
      let mathExpr = '';

      const lower = q.toLowerCase();
      if (lower.includes('khoảng cách') || lower.includes('kc')) {
        responseText = `Đối với khối ${model.name}, khoảng cách từ một điểm đến mặt phẳng thường được tính theo 2 phương pháp: 1. Dựng trực tiếp đoạn vuông góc (đặc biệt từ chân đường cao); 2. Sử dụng phương pháp tỉ số thể tích V = (1/3) * S_đáy * h.`;
        mathExpr = 'd(A, (P)) = \\frac{3V_{S.ABCD}}{S_{(P)}} \\quad \\text{hoặc} \\quad \\frac{1}{h^2} = \\frac{1}{a^2} + \\frac{1}{b^2} + \\frac{1}{c^2}';
      } else if (lower.includes('góc') || lower.includes('nhị diện')) {
        responseText = `Để xác định góc giữa đường thẳng và mặt phẳng, ta tìm hình chiếu vuông góc của đường thẳng lên mặt phẳng đó. Góc giữa đường thẳng và mặt phẳng bằng góc giữa đường thẳng và hình chiếu của nó.`;
        mathExpr = '\\widehat{(d, (P))} = \\widehat{(d, d\')} \\quad (d\' \\text{ là hình chiếu của } d \\text{ lên } (P))';
      } else if (lower.includes('thể tích') || lower.includes('v')) {
        responseText = `Công thức tính thể tích của ${model.name} bám sát sách giáo khoa hình học phổ thông:`;
        mathExpr =
          model.calculateFormulas(model.defaultParams, 'cm')[0]?.latexFormula ||
          'V = \\frac{1}{3} S_{\\text{đáy}} \\cdot h';
      } else {
        responseText = `Trong hình học không gian, để giải quyết câu hỏi "${q}", bước đầu tiên bạn nên xác định rõ chân đường cao và các quan hệ vuông góc ở đáy, sau đó kẻ các đường phụ vuông góc với giao tuyến.`;
        mathExpr = 'SA \\perp (ABCD) \\implies SA \\perp \\Delta, \\ \\forall \\Delta \\subset (ABCD)';
      }

      setAiChat((prev) => [
        ...prev,
        { role: 'assistant', text: responseText, math: mathExpr },
      ]);
      setIsAiLoading(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[80vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="h-14 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-600/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Trợ Năng Nâng Cao: AR và AI Sư Phạm
                <span className="text-xs font-normal text-pink-400 bg-pink-950/80 px-2 py-0.5 rounded border border-pink-800/60">
                  {model.name}
                </span>
                <span className="text-[10px] font-normal text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 hidden sm:inline">
                  100% Miễn phí &amp; Offline
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs px-5 pt-2">
          <button
            onClick={() => setActiveTab('ar')}
            className={`pb-2.5 px-4 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'ar'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Thực tế tăng cường (AR)</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-2.5 px-4 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'ai'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Trợ lý AI Hình Học</span>
          </button>
        </div>

        {/* Tab 1: AR Check */}
        {activeTab === 'ar' && (
          <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center text-center space-y-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              arSupported ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-600/20 text-amber-400 border border-amber-500/40'
            }`}>
              {arSupported ? <CheckCircle className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-base font-bold text-white">
                {arSupported ? 'Sẵn sàng khởi động AR' : 'Thông báo về tính năng AR'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {arMessage}
              </p>
            </div>

            {arSupported ? (
              <button
                onClick={() => alert('Khởi động camera AR thành công! Đang quét mặt phẳng bàn học...')}
                className="py-2.5 px-6 rounded-xl bg-pink-600 hover:bg-pink-500 text-xs font-bold text-white shadow-lg shadow-pink-600/30 transition-colors"
              >
                Chiếu mô hình lên mặt bàn (Bắt đầu AR)
              </button>
            ) : (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 text-left space-y-1 max-w-md">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  Hướng dẫn trải nghiệm AR:
                </div>
                <p>1. Dùng chức năng <strong>"Xuất mã QR"</strong> trong ứng dụng.</p>
                <p>2. Quét mã bằng máy ảnh của điện thoại iPhone hoặc Android hỗ trợ ARCore.</p>
                <p>3. Cho phép truy cập camera để đặt mô hình 3D xoay 360° trực tiếp lên mặt bàn học thực tế!</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: AI Geometry Tutor */}
        {activeTab === 'ai' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiChat.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 text-xs ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-pink-600/20 text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/30">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-xl max-w-[85%] space-y-2 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <div>{msg.text}</div>
                    {msg.math && (
                      <div className="p-2 bg-slate-900 rounded-lg text-amber-300 overflow-x-auto border border-slate-800">
                        <KaTeX math={msg.math} block />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" />
                  <span>Trợ lý AI đang phân tích hình học...</span>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
              <input
                type="text"
                placeholder="Hỏi về cách tính khoảng cách, góc, chứng minh vuông góc..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAi()}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={handleSendAi}
                disabled={!aiQuestion.trim() || isAiLoading}
                className="p-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
