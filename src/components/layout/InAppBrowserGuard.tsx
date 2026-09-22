'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { ExternalLink, Copy, Check, X, ArrowUpRight, Smartphone, Compass } from 'lucide-react';

interface InAppInfo {
  isInApp: boolean;
  appName: string;
  isAndroid: boolean;
  isIOS: boolean;
  intentUrl: string;
}

const emptySnapshot: InAppInfo = {
  isInApp: false,
  appName: 'ứng dụng',
  isAndroid: false,
  isIOS: false,
  intentUrl: '',
};

let cachedSnapshot: InAppInfo | null = null;

function getInAppSnapshot(): InAppInfo {
  if (typeof window === 'undefined') return emptySnapshot;
  if (cachedSnapshot) return cachedSnapshot;

  try {
    if (sessionStorage.getItem('inapp_guard_dismissed') === '1') {
      cachedSnapshot = emptySnapshot;
      return cachedSnapshot;
    }
  } catch {
    // Ignore storage issues
  }

  const ua = navigator.userAgent || navigator.vendor || '';

  const isZaloDetected = /Zalo/i.test(ua);
  const isFbDetected = /FBAN|FBAV/i.test(ua);
  const isInstaDetected = /Instagram/i.test(ua);
  const isTikTokDetected = /ByteLocale|TikTok/i.test(ua);
  const isGeneralInApp = isZaloDetected || isFbDetected || isInstaDetected || isTikTokDetected;

  if (!isGeneralInApp) {
    cachedSnapshot = emptySnapshot;
    return cachedSnapshot;
  }

  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  let detectedApp = 'ứng dụng';
  if (isZaloDetected) detectedApp = 'Zalo';
  else if (isFbDetected) detectedApp = 'Facebook';
  else if (isInstaDetected) detectedApp = 'Instagram';
  else if (isTikTokDetected) detectedApp = 'TikTok';

  const cleanUrl = window.location.href.replace(/^https?:\/\//, '');
  const generatedIntent = `intent://${cleanUrl}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end;`;

  cachedSnapshot = {
    isInApp: true,
    appName: detectedApp,
    isAndroid,
    isIOS,
    intentUrl: generatedIntent,
  };
  return cachedSnapshot;
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export default function InAppBrowserGuard() {
  const inAppInfo = useSyncExternalStore(subscribe, getInAppSnapshot, () => emptySnapshot);
  const [isDismissed, setIsDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-redirect on Android to break out of in-app browser
  useEffect(() => {
    if (inAppInfo.isInApp && inAppInfo.isAndroid && inAppInfo.intentUrl) {
      const cleanUrl = window.location.href.replace(/^https?:\/\//, '');
      const autoRedirectKey = `inapp_auto_redirect_${encodeURIComponent(cleanUrl)}`;
      try {
        if (!sessionStorage.getItem(autoRedirectKey)) {
          sessionStorage.setItem(autoRedirectKey, '1');
          window.location.href = inAppInfo.intentUrl;
        }
      } catch {
        // Fallback if browser security blocks automated intent
      }
    }
  }, [inAppInfo]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('inapp_guard_dismissed', '1');
    } catch {
      // Ignore
    }
  };

  const triggerAndroidIntent = () => {
    if (inAppInfo.intentUrl) {
      try {
        window.location.href = inAppInfo.intentUrl;
      } catch {
        // Ignore
      }
    }
  };

  if (!inAppInfo.isInApp || isDismissed) return null;

  const { appName, isAndroid, isIOS } = inAppInfo;

  return (
    <>
      {/* Top Floating Pointer Arrow for iOS Zalo Menu (Pointing to ⋯ button at top-right) */}
      {isIOS && (
        <div className="fixed top-2 right-3 z-[100] flex items-center gap-1.5 bg-[#044C42] text-[#FFB088] px-3 py-1.5 rounded-full shadow-2xl border border-[#FFB088]/40 text-xs font-mono font-bold animate-bounce select-none pointer-events-none">
          <span>Bấm ⋯ góc trên</span>
          <ArrowUpRight size={16} className="text-[#FFB088]" />
        </div>
      )}

      {/* Main Escape Guide Modal / Sheet */}
      <div className="fixed inset-0 z-[99] bg-black/75 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center p-3 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-[#FAF8F4] w-full max-w-md rounded-2xl shadow-2xl border border-[#D5CDBE] overflow-hidden flex flex-col text-[#1C1B19]">
          {/* Header */}
          <div className="bg-[#044C42] text-white px-4 py-3.5 flex items-center justify-between border-b border-[#B85C38]">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-[#FFB088]" />
              <h3 className="font-serif font-semibold text-sm sm:text-base">
                Mở Trên Trình Duyệt Ngoài
              </h3>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-start gap-3 bg-[#044C42]/5 border border-[#044C42]/20 rounded-xl p-3">
              <div className="w-8 h-8 rounded-full bg-[#044C42] text-[#FFB088] flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone size={16} />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#044C42] block">
                  Đang mở trong trình duyệt nội bộ của {appName}
                </span>
                <p className="text-[11px] text-[#6E6254] leading-relaxed">
                  Để hình ảnh sản phẩm sắc nét chuẩn 4K, lưu poster không bị mờ và thao tác mượt mà nhất, hãy mở trang trên trình duyệt chính của máy.
                </p>
              </div>
            </div>

            {/* Step-by-Step Guide for iOS / Zalo */}
            {isIOS ? (
              <div className="bg-white border border-[#D5CDBE] rounded-xl p-3.5 space-y-2.5 shadow-sm text-xs">
                <span className="font-mono font-bold text-[#B85C38] uppercase tracking-wide text-[10px] block">
                  👉 Hướng dẫn thao tác nhanh 2 bước:
                </span>
                <ol className="space-y-2 list-decimal list-inside text-[#1C1B19] leading-relaxed">
                  <li>
                    Nhấn vào biểu tượng <strong>⋯ (3 chấm)</strong> ở <strong>góc trên cùng bên phải màn hình {appName}</strong>.
                  </li>
                  <li>
                    Chọn mục <strong>&ldquo;Mở bằng trình duyệt&rdquo;</strong> (Safari / Chrome).
                  </li>
                </ol>
              </div>
            ) : isAndroid ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={triggerAndroidIntent}
                  className="w-full py-3 px-4 bg-[#044C42] hover:bg-[#003831] text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                >
                  <ExternalLink size={16} />
                  MỞ NGAY TRONG TRÌNH DUYỆT CHROME
                </button>
                <p className="text-[10px] text-center text-[#8B7C66] font-mono">
                  (Nếu chưa tự động chuyển, chạm nút trên để mở Chrome)
                </p>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2.5 px-3 bg-white hover:bg-[#F5F1EA] text-[#044C42] border border-[#D5CDBE] hover:border-[#044C42] rounded-xl font-mono text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-[#044C42]" />
                    <span className="text-[#044C42] font-semibold">✓ Đã chép link! Dán vào Safari / Chrome</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Sao chép liên kết trang</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-2 text-[#8B7C66] hover:text-[#1C1B19] text-center font-mono text-xs transition-colors cursor-pointer"
              >
                Tiếp tục xem trên {appName}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
