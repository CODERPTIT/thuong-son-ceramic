'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Upload, Download, Sparkles, CheckCircle2, RefreshCw, Share2, Sliders } from 'lucide-react';
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
  const [showAdjust, setShowAdjust] = useState<boolean>(false);
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

      // 3. Universal Multi-Color Footer Boundary Detection
      // Detects the horizontal dividing line or start of bottom distributor footer
      // Works accurately across ALL footer colors (green, black, dark gray, navy, red, white, brown)
      try {
        const startScanY = Math.round(H * 0.83);
        const endScanY = Math.round(H * 0.96);

        let bestBoundaryY: number | null = null;
        let maxEdgeScore = 0;
        let prevRowAvg: { r: number; g: number; b: number; bright: number } | null = null;

        for (let y = startScanY; y < endScanY; y += 2) {
          let rSum = 0, gSum = 0, bSum = 0;
          let samples = 0;
          // Sample across middle 80% of width to avoid frame padding
          for (let x = Math.round(W * 0.1); x < Math.round(W * 0.9); x += 15) {
            const pIdx = (y * W + x) * 4;
            rSum += imgData.data[pIdx];
            gSum += imgData.data[pIdx + 1];
            bSum += imgData.data[pIdx + 2];
            samples++;
          }
          const r = rSum / samples;
          const g = gSum / samples;
          const b = bSum / samples;
          const bright = (r + g + b) / 3;

          if (prevRowAvg !== null) {
            const diff =
              Math.abs(bright - prevRowAvg.bright) * 1.5 +
              Math.abs(r - prevRowAvg.r) +
              Math.abs(g - prevRowAvg.g) +
              Math.abs(b - prevRowAvg.b);

            if (diff > 30 && diff > maxEdgeScore) {
              maxEdgeScore = diff;
              bestBoundaryY = y;
            }
          }
          prevRowAvg = { r, g, b, bright };
        }

        if (bestBoundaryY !== null) {
          // Add 2px safety padding to cleanly eliminate the dividing border line
          const cleanY = Math.max(Math.round(H * 0.80), bestBoundaryY - 2);
          result.footerYPercent = (cleanY / H) * 100;
        } else {
          // Aspect-ratio aware adaptive default
          const ratio = H / W;
          if (ratio > 1.6) {
            result.footerYPercent = 91.5; // ~8.5% for 9:16 tall vertical
          } else if (ratio < 1.25) {
            result.footerYPercent = 88.5; // ~11.5% for square / wider posters
          } else {
            result.footerYPercent = 90.5; // ~9.5% for standard catalog
          }
        }
      } catch (err) {
        console.warn('Footer scan error:', err);
      }
    }

    return result;
  };

  // Render composite canvas
  const renderCompositeCanvas = useCallback(async (
    isExport = false,
    overrideImg?: HTMLImageElement,
    overrideCropBottom?: number,
    overrideQrX?: number,
    overrideQrY?: number,
    overrideQrSize?: number
  ): Promise<HTMLCanvasElement | null> => {
    const imgElem = overrideImg || uploadedImageElement;
    if (!imgElem) return null;

    const srcW = imgElem.naturalWidth;
    const srcH = imgElem.naturalHeight;

    const activeCropBottom = overrideCropBottom !== undefined ? overrideCropBottom : cropBottom;
    const activeQrX = overrideQrX !== undefined ? overrideQrX : qrX;
    const activeQrY = overrideQrY !== undefined ? overrideQrY : qrY;
    const activeQrSize = overrideQrSize !== undefined ? overrideQrSize : qrSize;

    // Aspect-ratio aware footer height calculation:
    // Ensures footer is always tall enough for 2 text rows even on wide or square posters
    const rawFooterHeight = (srcH * activeCropBottom) / 100;
    const minFooterHeight = Math.round(srcW * 0.072);
    const footerBarHeightPx = Math.round(Math.max(rawFooterHeight, minFooterHeight));
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
    ctx.drawImage(imgElem, 0, 0, srcW, finalH, 0, 0, finalW, finalH);

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
    const showroomText = 'SHOWROOM: SN 01 ĐƯỜNG ĐÔI TL510, ĐÌNH BẢNG, XÃ HOẰNG LỘC, THANH HÓA';
    let addrFontSize = fontSizeSub;
    ctx.font = `bold ${addrFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const maxAddrW = finalW * 0.58;
    const textW = ctx.measureText(showroomText).width;
    if (textW > maxAddrW) {
      addrFontSize = Math.floor(addrFontSize * (maxAddrW / textW));
      ctx.font = `bold ${addrFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    }
    ctx.fillText(showroomText, Math.round(finalW * 0.96), footerY + footerBarHeightPx * 0.40);

    ctx.fillStyle = '#F5F1EA';
    ctx.font = `500 ${fontSizeSub}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('HOTLINE: 0916 640 316 - 0912 958 578', Math.round(finalW * 0.96), footerY + footerBarHeightPx * 0.72);

    // 3. Generate & Draw System QR Code covering old QR location
    try {
      const qrDataUrl = await QRCode.toDataURL(productUrl, {
        width: 1024,
        // margin: 4 modules quiet zone — required by QR spec for reliable detection
        margin: 4,
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

      const qx = (finalW * activeQrX) / 100;
      const qy = (srcH * activeQrY) / 100;
      const qs = (finalW * activeQrSize) / 100;

      // Generous white quiet zone (15% of QR size each side):
      // QR spec requires 4 quiet modules; too-thin zones cause scan failures in Zalo.
      const pad = Math.round(qs * 0.15);
      const maskX = qx - pad;
      const maskY = qy - pad;
      const maskSize = qs + pad * 2;

      // Pure clean white container mask (covers old QR + quiet zone)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(maskX, maskY, maskSize, maskSize);

      // Draw the new Thường Sơn product QR (inside the white zone)
      ctx.drawImage(qrImg, qx, qy, qs, qs);

      // Fine hairline border around the white container
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

  // Fallback: open image in new tab (mobile) or copy to clipboard (desktop)
  const handleShareFallback = (blob: Blob) => {
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Open the image in a new browser tab.
      // On mobile, the user can long-press the image → "Save Image" / "Share".
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
      setShareNotice('📱 Ảnh đã mở trên tab mới. Nhấn giữ vào ảnh → chọn "Lưu ảnh" hoặc "Chia sẻ".');
      setTimeout(() => setShareNotice(null), 8000);
      return;
    }

    // Desktop: try clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        .then(() => {
          setShareNotice('✓ Đã sao chép ảnh vào Clipboard! Dán (Ctrl + V) trực tiếp vào Zalo, Messenger hoặc Zalo PC.');
          setTimeout(() => setShareNotice(null), 6000);
        })
        .catch(() => {
          setShareNotice('Trình duyệt không hỗ trợ bảng chia sẻ. Hãy dùng nút TẢI POSTER VỀ MÁY rồi chia sẻ từ thư mục tải về.');
          setTimeout(() => setShareNotice(null), 7000);
        });
      return;
    }

    setShareNotice('Hãy dùng nút TẢI POSTER VỀ MÁY rồi chia sẻ tệp từ thư mục tải về.');
    setTimeout(() => setShareNotice(null), 7000);
  };

  // 2. Open Native Share Sheet — works on iOS Safari + Android Chrome
  // CRITICAL: NON-async. iOS Safari kills the user-gesture activation token
  // at the very first microtask yield.
  const handleShare = () => {
    if (!previewDataUrl) return;

    // Build File synchronously — zero async ops before navigator.share()
    let cached = fileCacheRef.current;
    if (!cached) {
      const fileName = `Poster_${product.code}_ThuongSon.png`;
      cached = dataUrlToBlobAndFile(previewDataUrl, fileName);
      fileCacheRef.current = cached;
    }

    const { file, blob } = cached;

    // Check canShare({files}) so we don't call share() when files aren't supported
    const supportsFileShare =
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      (typeof navigator.canShare === 'function'
        ? navigator.canShare({ files: [file] })
        : true);

    if (supportsFileShare) {
      navigator.share({ files: [file] })
        .then(() => { /* success */ })
        .catch((err: unknown) => {
          if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
            return; // user dismissed — normal
          }
          console.warn('navigator.share error:', err);
          handleShareFallback(blob);
        });
      return;
    }

    handleShareFallback(blob);
  };

  // Process image on upload
  const processImage = async (img: HTMLImageElement) => {
    setIsProcessing(true);
    setShareNotice(null);
    fileCacheRef.current = null;

    const detection = autoDetectAndConfigure(img);
    const computedCrop = parseFloat((100 - detection.footerYPercent).toFixed(2));

    setDetectedType(detection.type);
    setQrX(detection.qrX);
    setQrY(detection.qrY);
    setQrSize(detection.qrSize);
    setCropBottom(computedCrop);

    try {
      // Direct render with current image & newly detected parameters — eliminates React state lag
      const exportCanvas = await renderCompositeCanvas(
        true,
        img,
        computedCrop,
        detection.qrX,
        detection.qrY,
        detection.qrSize
      );
      if (exportCanvas) {
        // Preview uses PNG for lossless display quality
        const dataUrl = exportCanvas.toDataURL('image/png');
        setPreviewDataUrl(dataUrl);

        // Share cache: JPEG 90% — keeps file under ~2MB so Zalo can detect QR.
        const shareFileName = `Poster_${product.code}_ThuongSon.jpg`;
        exportCanvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], shareFileName, { type: 'image/jpeg' });
            fileCacheRef.current = { blob, file };
          }
        }, 'image/jpeg', 0.90);
      }
    } catch (err) {
      console.error('Process error:', err);
    } finally {
      setIsProcessing(false);
    }
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

              {/* Footer Fine-Tuning Bar (Auto-detected + Manual Slider) */}
              <div className="bg-white border border-[#D5CDBE] rounded-lg overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowAdjust(!showAdjust)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-mono text-[#1C1B19] hover:bg-[#FAF8F4] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sliders size={14} className="text-[#B85C38]" />
                    <span>Độ phủ chân trang Thường Sơn: <strong>{cropBottom}%</strong></span>
                  </span>
                  <span className="text-[11px] text-[#B85C38] flex items-center gap-1 font-semibold">
                    {showAdjust ? 'Ẩn điều chỉnh ▲' : 'Tùy chỉnh độ cao ▼'}
                  </span>
                </button>

                {showAdjust && (
                  <div className="p-3.5 pt-1.5 border-t border-[#D5CDBE]/60 bg-[#FAF8F4] space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#6E6254]">Kéo để cắt sâu hơn / tăng độ dày chân trang:</span>
                      <span className="font-bold text-[#044C42]">{cropBottom}%</span>
                    </div>

                    <input
                      type="range"
                      min="5"
                      max="22"
                      step="0.5"
                      value={cropBottom}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setCropBottom(val);
                        fileCacheRef.current = null;
                      }}
                      className="w-full accent-[#044C42] cursor-pointer"
                    />

                    {/* Quick preset chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] font-mono">
                      <span className="text-[#8B7C66]">Mức mẫu:</span>
                      {[
                        { label: 'Gọn (7.5%)', val: 7.5 },
                        { label: 'Chuẩn (9.5%)', val: 9.5 },
                        { label: 'Vừa (12%)', val: 12.0 },
                        { label: 'Lớn (15%)', val: 15.0 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setCropBottom(preset.val);
                            fileCacheRef.current = null;
                          }}
                          className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            Math.abs(cropBottom - preset.val) < 0.3
                              ? 'bg-[#044C42] text-white border-[#044C42] font-bold'
                              : 'bg-white text-[#1C1B19] border-[#D5CDBE] hover:border-[#044C42]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
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
