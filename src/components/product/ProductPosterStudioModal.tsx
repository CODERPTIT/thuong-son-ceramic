'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Upload, Download, Sparkles, CheckCircle2, RefreshCw, Share2 } from 'lucide-react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { Product } from '@/types';

interface ProductPosterStudioModalProps {
  product: Product;
  onClose: () => void;
}

interface DetectionResult {
  found: boolean;
  type: 1 | 2;
  method: 'jsqr' | 'template_fallback';
  qrX: number;
  qrY: number;
  qrSize: number;
  footerYPercent: number;
}

function dataUrlToBlobAndFile(dataUrl: string, fileName: string): { blob: Blob; file: File } {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const blob = new Blob([u8arr], { type: mime });
  const file = new File([blob], fileName, { type: mime });
  return { blob, file };
}

export default function ProductPosterStudioModal({ product, onClose }: ProductPosterStudioModalProps) {
  // Base website URL for QR
  const [baseUrl, setBaseUrl] = useState('https://thuong-son-ceramic.vercel.app');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (origin.includes('localhost') || origin.includes('git-') || origin.includes('-c456.vercel.app')) {
        setBaseUrl('https://thuong-son-ceramic.vercel.app');
      } else {
        setBaseUrl(origin);
      }
    }
  }, []);

  const productUrl = `${baseUrl}/products/${product.slug}`;

  // Image Upload state
  const [uploadedImageElement, setUploadedImageElement] = useState<HTMLImageElement | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const fileCacheRef = useRef<{ file: File; blob: Blob } | null>(null);

  // Auto-calibrated parameters
  const [qrX, setQrX] = useState<number>(84.67);
  const [qrY, setQrY] = useState<number>(79.35);
  const [qrSize, setQrSize] = useState<number>(9.20);
  const [cropBottom, setCropBottom] = useState<number>(7.71);
  const [detectedType, setDetectedType] = useState<1 | 2>(1);

  // Preview canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scan image when loaded using Computer Vision (jsQR) + Smart Classification Fallback
  const autoDetectAndConfigure = (img: HTMLImageElement): DetectionResult => {
    const W = img.naturalWidth;
    const H = img.naturalHeight;

    const offscreen = document.createElement('canvas');
    offscreen.width = W;
    offscreen.height = H;
    const ctx = offscreen.getContext('2d');

    let result: DetectionResult = {
      found: false,
      type: 1,
      method: 'template_fallback',
      qrX: 84.67,
      qrY: 79.35,
      qrSize: 9.20,
      footerYPercent: 92.29,
    };

    if (!ctx) return result;

    ctx.drawImage(img, 0, 0, W, H);
    let imgData: ImageData | null = null;
    try {
      imgData = ctx.getImageData(0, 0, W, H);
    } catch {
      imgData = null;
    }

    if (imgData) {
      // 1. Scan with jsQR Computer Vision
      try {
        const qrCode = jsQR(imgData.data, W, H);
        if (qrCode) {
          const xs = [
            qrCode.location.topLeftCorner.x,
            qrCode.location.topRightCorner.x,
            qrCode.location.bottomLeftCorner.x,
            qrCode.location.bottomRightCorner.x,
          ];
          const ys = [
            qrCode.location.topLeftCorner.y,
            qrCode.location.topRightCorner.y,
            qrCode.location.bottomLeftCorner.y,
            qrCode.location.bottomRightCorner.y,
          ];
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);

          const rawQrW = maxX - minX;
          const rawQrH = maxY - minY;
          const detectedSize = Math.max(rawQrW, rawQrH);

          // Classify Type 1 vs Type 2 based on QR horizontal center
          const detectedType: 1 | 2 = (minX / W) > 0.83 ? 1 : 2;

          result = {
            found: true,
            type: detectedType,
            method: 'jsqr',
            qrX: (minX / W) * 100,
            qrY: (minY / H) * 100,
            qrSize: (detectedSize / W) * 100,
            footerYPercent: 92.29,
          };
        }
      } catch (err) {
        console.warn('jsQR scan error:', err);
      }

      // 2. Fallback classification if jsQR did not detect
      if (!result.found) {
        const sampleY = Math.round(H * 0.80);
        const sampleX = Math.round(W * 0.50);
        const idx = (sampleY * W + sampleX) * 4;
        const brightness = (imgData.data[idx] + imgData.data[idx + 1] + imgData.data[idx + 2]) / 3;

        const isType2 = brightness < 90;
        result = {
          found: false,
          type: isType2 ? 2 : 1,
          method: 'template_fallback',
          qrX: isType2 ? 81.30 : 84.67,
          qrY: isType2 ? 79.67 : 79.35,
          qrSize: isType2 ? 10.82 : 9.20,
          footerYPercent: 92.29,
        };
      }

      // 3. Detect exact footer bar start (Green bar)
      try {
        for (let y = Math.round(H * 0.88); y < H; y += 2) {
          let rSum = 0, gSum = 0;
          let samples = 0;
          for (let x = 40; x < W - 40; x += 30) {
            const pIdx = (y * W + x) * 4;
            rSum += imgData.data[pIdx];
            gSum += imgData.data[pIdx + 1];
            samples++;
          }
          const avgR = rSum / samples;
          const avgG = gSum / samples;
          if (avgG > avgR * 1.5 && avgG > 40) {
            result.footerYPercent = (y / H) * 100;
            break;
          }
        }
      } catch (err) {
        console.warn('Footer scan error:', err);
      }
    }

    return result;
  };

  // Render composite canvas
  const renderCompositeCanvas = useCallback(async (isExport = false): Promise<HTMLCanvasElement | null> => {
    if (!uploadedImageElement) return null;

    const srcW = uploadedImageElement.naturalWidth;
    const srcH = uploadedImageElement.naturalHeight;

    const footerBarHeightPx = Math.round((srcH * cropBottom) / 100);
    const finalW = srcW;
    const finalH = srcH;

    const canvas = isExport ? document.createElement('canvas') : (canvasRef.current || document.createElement('canvas'));
    canvas.width = finalW;
    canvas.height = finalH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Draw base poster image
    ctx.drawImage(uploadedImageElement, 0, 0, srcW, finalH, 0, 0, finalW, finalH);

    // 2. Replace Footer bar with clean Thường Sơn info (NO "THE ART OF LIVING SPACES", NO "THUONGSONCERAMIC.VN")
    const footerY = srcH - footerBarHeightPx;

    // Deep Emerald Green matching Monalisa catalog top bar
    ctx.fillStyle = '#044C42';
    ctx.fillRect(0, footerY, finalW, footerBarHeightPx);

    // Terracotta top accent line
    ctx.fillStyle = '#B85C38';
    const borderLineH = Math.max(2, Math.round(srcH * 0.0025));
    ctx.fillRect(0, footerY, finalW, borderLineH);

    // Left: Brand Title & Subtitle
    ctx.fillStyle = '#FFFFFF';
    const fontSizeTitle = Math.round(footerBarHeightPx * 0.30);
    ctx.font = `bold ${fontSizeTitle}px Georgia, "Playfair Display", serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('THƯỜNG SƠN CERAMIC', Math.round(finalW * 0.04), footerY + footerBarHeightPx * 0.40);

    ctx.fillStyle = '#D5CDBE';
    const fontSizeSub = Math.round(footerBarHeightPx * 0.17);
    ctx.font = `500 ${fontSizeSub}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('Nhà Phân Phối Gạch Kiến Trúc & Bề Mặt Cao Cấp', Math.round(finalW * 0.04), footerY + footerBarHeightPx * 0.72);

    // Right: Showroom & Hotline (Clean, separated, no collision)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${fontSizeSub}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('SHOWROOM: SỐ 01 ĐÌNH BẢNG, HOẰNG LỘC, THANH HÓA', Math.round(finalW * 0.96), footerY + footerBarHeightPx * 0.40);

    ctx.fillStyle = '#F5F1EA';
    ctx.font = `500 ${fontSizeSub}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('HOTLINE: 0916 640 316 - 0912 958 578', Math.round(finalW * 0.96), footerY + footerBarHeightPx * 0.72);

    // 3. Generate & Draw System QR Code covering old QR location
    try {
      const qrDataUrl = await QRCode.toDataURL(productUrl, {
        width: 1024,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });

      const qrImg = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () => rej();
        i.src = qrDataUrl;
      });

      const qx = (finalW * qrX) / 100;
      const qy = (srcH * qrY) / 100;
      const qs = (finalW * qrSize) / 100;

      // Smart padding to fully mask quiet zone of the previous QR code
      const pad = Math.round(qs * 0.04);
      const maskX = qx - pad;
      const maskY = qy - pad;
      const maskSize = qs + pad * 2;

      // Pure clean white container mask
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(maskX, maskY, maskSize, maskSize);

      // Draw the new Thường Sơn product QR
      ctx.drawImage(qrImg, qx, qy, qs, qs);

      // Fine hairline border around the QR container
      ctx.strokeStyle = '#D5CDBE';
      ctx.lineWidth = Math.max(1, Math.round(qs * 0.015));
      ctx.strokeRect(maskX, maskY, maskSize, maskSize);
    } catch (err) {
      console.error('QR overlay error:', err);
    }

    return canvas;
  }, [uploadedImageElement, cropBottom, qrX, qrY, qrSize, productUrl]);

  // Update canvas on parameter change & sync preview Data URL
  useEffect(() => {
    if (uploadedImageElement) {
      renderCompositeCanvas(false).then((c) => {
        if (c) {
          try {
            setPreviewDataUrl(c.toDataURL('image/png'));
          } catch (e) {
            console.warn('Canvas toDataURL failed:', e);
          }
        }
      });
    }
  }, [uploadedImageElement, renderCompositeCanvas]);

  // 1. Download poster directly to computer/phone
  const handleDownloadFile = async () => {
    setIsProcessing(true);
    try {
      const fileName = `Poster_${product.code}_ThuongSon.png`;

      let dataUrl = previewDataUrl;
      if (!dataUrl) {
        const canvasToExport = await renderCompositeCanvas(true);
        if (!canvasToExport) return;
        dataUrl = canvasToExport.toDataURL('image/png');
        setPreviewDataUrl(dataUrl);
      }

      // Standard direct download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        setDownloadSuccess(true);
      }, 300);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Open Native Share Sheet (Zalo, Messenger, Save Image to Photos)
  const handleShare = async () => {
    if (!previewDataUrl) return;

    // Get pre-cached File or convert synchronously (preserves user gesture on iOS Safari)
    let cached = fileCacheRef.current;
    if (!cached) {
      const fileName = `Poster_${product.code}_ThuongSon.png`;
      cached = dataUrlToBlobAndFile(previewDataUrl, fileName);
      fileCacheRef.current = cached;
    }

    const { file, blob } = cached;

    // Direct Web Share API (Safari iOS, Chrome Android)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          files: [file],
        });
        return; // Opened native share sheet successfully
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
          return; // User dismissed share sheet
        }
        console.warn('Native share failed or unsupported files:', err);
      }
    }

    // FALLBACK: NEVER call handleDownloadFile()!
    // Try copying image directly to clipboard on desktop/browser
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setShareNotice('✓ Đã sao chép ảnh vào Clipboard! Bạn có thể dán (Ctrl + V) trực tiếp vào Zalo hoặc Messenger.');
        setTimeout(() => setShareNotice(null), 5000);
        return;
      }
    } catch (clipErr) {
      console.warn('Clipboard write error:', clipErr);
    }

    // Friendly notice on devices without native file sharing
    setShareNotice('Bảng chia sẻ (Zalo, Tin nhắn) chỉ hoạt động trên trình duyệt điện thoại (Safari, Chrome). Trên máy tính, bạn hãy bấm nút "TẢI POSTER VỀ MÁY" ở trên.');
    setTimeout(() => setShareNotice(null), 6000);
  };

  // Process image on upload
  const processImage = async (img: HTMLImageElement) => {
    setIsProcessing(true);
    setShareNotice(null);
    fileCacheRef.current = null;

    const detection = autoDetectAndConfigure(img);
    setDetectedType(detection.type);
    setQrX(detection.qrX);
    setQrY(detection.qrY);
    setQrSize(detection.qrSize);
    setCropBottom(parseFloat((100 - detection.footerYPercent).toFixed(2)));

    setTimeout(async () => {
      try {
        const exportCanvas = await renderCompositeCanvas(true);
        if (exportCanvas) {
          const dataUrl = exportCanvas.toDataURL('image/png');
          setPreviewDataUrl(dataUrl);

          const fileName = `Poster_${product.code}_ThuongSon.png`;
          exportCanvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], fileName, { type: 'image/png' });
              fileCacheRef.current = { blob, file };
            }
          }, 'image/png');
        }
      } catch (err) {
        console.error('Process error:', err);
      } finally {
        setIsProcessing(false);
      }
    }, 200);
  };

  // Handle file input
  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setDownloadSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setUploadedImageElement(img);
        processImage(img);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const loadSamplePoster = (url: string) => {
    setDownloadSuccess(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setUploadedImageElement(img);
      processImage(img);
    };
    img.src = url;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#FAF8F4] w-full max-w-lg rounded-xl shadow-2xl border border-[#D5CDBE] overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Compact Mobile Header */}
        <div className="bg-[#044C42] text-white px-4 py-3 flex items-center justify-between border-b border-[#B85C38]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#FFB088]" />
            <h3 className="font-serif text-sm sm:text-base font-medium">
              Chế Poster Catalog · <span className="font-mono text-[#FFB088] font-bold">{product.code}</span>
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng"
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content: Mobile-First Single-Column Flow */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            className="hidden"
          />

          {!uploadedImageElement ? (
            /* Screen 1: Simple Upload Zone */
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#044C42] hover:border-[#003831] bg-[#044C42]/5 hover:bg-[#044C42]/10 transition-all rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-full bg-[#044C42] text-white flex items-center justify-center shadow-md">
                  <Upload size={24} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#1C1B19] block">
                    Chạm để chọn ảnh poster từ máy
                  </span>
                  <span className="text-xs text-[#6E6254] font-mono mt-1 block">
                    Tự động phủ mã QR Thường Sơn &amp; thay chân trang
                  </span>
                </div>
              </button>

              {/* 2 Fast Sample Buttons */}
              <div className="pt-2 border-t border-[#D5CDBE]/70">
                <span className="text-[11px] font-mono text-[#8B7C66] block mb-2 text-center uppercase tracking-wider">
                  Hoặc thử ngay với 2 mẫu catalog:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => loadSamplePoster('/samples/poster_sample_1.jpg')}
                    className="p-2.5 bg-white hover:bg-[#F5F1EA] border border-[#D5CDBE] hover:border-[#044C42] rounded-lg text-left transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/samples/poster_sample_1.jpg" alt="Mẫu 1" className="w-7 h-10 object-cover rounded border border-[#E5E0D8]" />
                    <div className="overflow-hidden">
                      <span className="text-xs font-semibold text-[#1C1B19] block truncate">Mẫu 1: Đá Slab</span>
                      <span className="text-[10px] text-[#8B7C66] font-mono block">Thẻ kem</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => loadSamplePoster('/samples/poster_sample_2.jpg')}
                    className="p-2.5 bg-white hover:bg-[#F5F1EA] border border-[#D5CDBE] hover:border-[#044C42] rounded-lg text-left transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/samples/poster_sample_2.jpg" alt="Mẫu 2" className="w-7 h-10 object-cover rounded border border-[#E5E0D8]" />
                    <div className="overflow-hidden">
                      <span className="text-xs font-semibold text-[#1C1B19] block truncate">Mẫu 2: 6 Face</span>
                      <span className="text-[10px] text-[#8B7C66] font-mono block">Dải đen</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Screen 2: Result Preview & 2 Clear Buttons */
            <div className="space-y-3">
              {/* Status Pill */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#044C42]/10 border border-[#044C42]/20 rounded-lg text-xs font-mono text-[#044C42]">
                <span className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 size={15} className="text-[#044C42]" />
                  {downloadSuccess ? '✓ Đã tải về máy!' : `✓ Đã tạo xong (Dạng ${detectedType})`}
                </span>
                <span className="text-[10px] text-[#6E6254]">100% Ảnh gốc</span>
              </div>

              {/* Live Image Preview: Real <img> */}
              <div className="bg-[#1C1B19] p-2 rounded-lg flex items-center justify-center max-h-[55vh] overflow-hidden shadow-inner">
                <canvas ref={canvasRef} className="hidden" />
                {previewDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewDataUrl}
                    alt="Poster hoàn thiện"
                    className="max-h-[52vh] max-w-full w-auto h-auto object-contain block rounded shadow select-none"
                  />
                ) : (
                  <div className="text-white/60 text-xs font-mono py-12 flex items-center gap-2">
                    <Sparkles size={16} className="animate-spin text-[#FFB088]" /> Đang tạo poster...
                  </div>
                )}
              </div>

              {/* Action Buttons: Download + Share */}
              <div className="space-y-2.5 pt-1">
                {/* Button 1: Download to device */}
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 bg-[#044C42] hover:bg-[#003831] text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  <Download size={16} />
                  {isProcessing ? 'Đang tải poster...' : 'TẢI POSTER VỀ MÁY (GỐC 100%)'}
                </button>

                {/* Button 2: Native Share (Opens iOS / Android Share Sheet) */}
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-white hover:bg-[#F5F1EA] text-[#044C42] border border-[#044C42] rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Share2 size={16} className="text-[#044C42]" />
                  CHIA SẺ POSTER (ZALO, TIN NHẮN, LƯU ẢNH)
                </button>

                {/* Share feedback notice */}
                {shareNotice && (
                  <div className="p-3 bg-[#044C42]/10 border border-[#044C42]/30 rounded-lg text-xs font-mono text-[#044C42] text-center leading-relaxed">
                    {shareNotice}
                  </div>
                )}

                {/* Reset Button */}
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImageElement(null);
                    setPreviewDataUrl(null);
                    setDownloadSuccess(false);
                    setShareNotice(null);
                    fileCacheRef.current = null;
                  }}
                  className="w-full py-2 px-4 text-[#8B7C66] hover:text-[#1C1B19] text-center font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer pt-0.5"
                >
                  <RefreshCw size={12} /> Đổi ảnh poster khác
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
