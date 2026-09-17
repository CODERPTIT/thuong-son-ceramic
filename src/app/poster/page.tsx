'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Upload, Download, Sparkles, CheckCircle2, RefreshCw, ExternalLink, ArrowLeft, ShieldCheck, Share2, Maximize2 } from 'lucide-react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import productCodeMapRaw from '@/data/productCodeMap.json';

interface ProductInfo {
  code: string;
  slug: string;
  name: string;
}

const productCodeMap = productCodeMapRaw as Record<string, ProductInfo>;

interface DetectionResult {
  found: boolean;
  type: 1 | 2;
  method: 'jsqr' | 'template_fallback';
  qrX: number;
  qrY: number;
  qrSize: number;
  footerYPercent: number;
  extractedCode: string | null;
  matchedProduct: ProductInfo | null;
}

export default function StandalonePosterPage() {
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

  const [uploadedImageElement, setUploadedImageElement] = useState<HTMLImageElement | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Calibration state
  const [qrX, setQrX] = useState<number>(84.67);
  const [qrY, setQrY] = useState<number>(79.35);
  const [qrSize, setQrSize] = useState<number>(9.20);
  const [cropBottom, setCropBottom] = useState<number>(7.71);
  const [detectedResult, setDetectedResult] = useState<DetectionResult | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compute final product QR URL
  const targetProductUrl = detectedResult?.matchedProduct
    ? `${baseUrl}/products/${detectedResult.matchedProduct.slug}`
    : detectedResult?.extractedCode
    ? `${baseUrl}/catalog?search=${encodeURIComponent(detectedResult.extractedCode)}`
    : `${baseUrl}/catalog`;

  // Auto-scan image when loaded using Computer Vision (jsQR)
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
      extractedCode: null,
      matchedProduct: null,
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

          // Extract product code from URL (e.g. https://grandth.duckdns.org/q/MP62003)
          let extractedCode: string | null = null;
          const match = qrCode.data.match(/\/q\/([A-Za-z0-9_-]+)/i) || qrCode.data.match(/\/products\/([A-Za-z0-9_-]+)/i);
          if (match && match[1]) {
            extractedCode = match[1].trim().toUpperCase();
          }

          let matchedProduct: ProductInfo | null = null;
          if (extractedCode && productCodeMap[extractedCode]) {
            matchedProduct = productCodeMap[extractedCode];
          }

          result = {
            found: true,
            type: detectedType,
            method: 'jsqr',
            qrX: (minX / W) * 100,
            qrY: (minY / H) * 100,
            qrSize: (detectedSize / W) * 100,
            footerYPercent: 92.29,
            extractedCode,
            matchedProduct,
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
          extractedCode: null,
          matchedProduct: null,
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

    // 2. Replace Footer bar with clean Thường Sơn info
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
      const qrDataUrl = await QRCode.toDataURL(targetProductUrl, {
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
  }, [uploadedImageElement, cropBottom, qrX, qrY, qrSize, targetProductUrl]);

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

  // 1. Direct Download Button (Never opens unwanted share sheet)
  const handleDownloadFile = async () => {
    setIsProcessing(true);
    try {
      const canvasToExport = await renderCompositeCanvas(true);
      if (!canvasToExport) return;

      const dataUrl = canvasToExport.toDataURL('image/png');
      setPreviewDataUrl(dataUrl);

      const codeTag = detectedResult?.extractedCode || 'Catalog';
      const fileName = `Poster_${codeTag}_ThuongSon.png`;

      // Trigger standard download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        setDownloadSuccess(true);
      }, 400);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Open Fullscreen Image for Easy Saving on Mobile
  const handleOpenFullImage = () => {
    if (!previewDataUrl) return;
    const win = window.open();
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Poster Thường Sơn</title>
            <style>
              body { margin: 0; background: #1C1B19; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 12px; box-sizing: border-box; font-family: -apple-system, sans-serif; }
              img { max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
              p { color: #FAF8F4; text-align: center; font-size: 14px; margin-top: 14px; line-height: 1.5; }
            </style>
          </head>
          <body>
            <img src="${previewDataUrl}" alt="Poster">
            <p>👆 <strong>Chạm &amp; giữ ngón tay vào ảnh 1 giây</strong><br>chọn <em>"Lưu hình ảnh"</em> để lưu vào Album ảnh điện thoại</p>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  // 3. Optional Share to Zalo / Messenger (Only when user explicitly taps Share)
  const handleShareZalo = async () => {
    if (!canvasRef.current) return;
    const codeTag = detectedResult?.extractedCode || 'Catalog';
    const fileName = `Poster_${codeTag}_ThuongSon.png`;

    if (typeof navigator !== 'undefined' && 'canShare' in navigator && 'share' in navigator) {
      try {
        const blob = await new Promise<Blob | null>((res) => canvasRef.current?.toBlob(res, 'image/png'));
        if (blob) {
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Poster ${codeTag}`,
              text: `Poster catalog ${codeTag} - Thường Sơn Ceramic`,
            });
            return;
          }
        }
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
          return;
        }
      }
    }

    // Fallback if share sheet not available
    handleOpenFullImage();
  };

  // Full Zero-Click Pipeline (Processes image, updates preview, WITHOUT auto-popping share dialog)
  const processImage = async (img: HTMLImageElement) => {
    setIsProcessing(true);

    const detection = autoDetectAndConfigure(img);
    setDetectedResult(detection);
    setQrX(detection.qrX);
    setQrY(detection.qrY);
    setQrSize(detection.qrSize);
    setCropBottom(parseFloat((100 - detection.footerYPercent).toFixed(2)));

    // Render preview cleanly
    setTimeout(async () => {
      try {
        const exportCanvas = await renderCompositeCanvas(true);
        if (exportCanvas) {
          const dataUrl = exportCanvas.toDataURL('image/png');
          setPreviewDataUrl(dataUrl);

          // On desktop only: trigger auto download link
          const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (!isMobile) {
            const codeTag = detection.extractedCode || 'Catalog';
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `Poster_${codeTag}_ThuongSon.png`;
            document.body.appendChild(link);
            link.click();
            setTimeout(() => document.body.removeChild(link), 300);
            setDownloadSuccess(true);
          }
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
    <div className="min-h-screen bg-[#F5F1EA] text-[#1C1B19] flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-[#044C42] text-white border-b border-[#B85C38] px-4 py-3 sticky top-0 z-40 shadow-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-xs font-mono"
          >
            <ArrowLeft size={16} /> Trang Chủ
          </Link>
          <div className="flex items-center gap-1.5 font-serif font-bold text-sm tracking-wide">
            <Sparkles size={16} className="text-[#FFB088]" />
            Chế Bản Poster Tự Động
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#FFB088] border border-white/20">
            0-Click
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
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
          /* State 1: Upload Box & Quick Test */
          <div className="bg-[#FAF8F4] border border-[#D5CDBE] rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1.5">
              <h1 className="font-serif text-xl sm:text-2xl font-semibold text-[#1C1B19]">
                Chế Poster Catalog Tự Động
              </h1>
              <p className="text-xs text-[#6E6254] font-mono">
                Tự động nhận diện mã sản phẩm từ mã QR cũ &amp; tạo poster Thường Sơn
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-[#044C42] hover:border-[#003831] bg-[#044C42]/5 hover:bg-[#044C42]/10 transition-all rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer active:scale-[0.98]"
            >
              <div className="w-16 h-16 rounded-full bg-[#044C42] text-white flex items-center justify-center shadow-lg">
                <Upload size={28} />
              </div>
              <div>
                <span className="text-sm sm:text-base font-semibold text-[#1C1B19] block">
                  Chạm để chọn ảnh poster từ máy
                </span>
                <span className="text-xs text-[#6E6254] font-mono mt-1 block">
                  Hỗ trợ cả 2 dạng poster catalog (Đá Slab &amp; 6 Face)
                </span>
              </div>
            </button>

            {/* Quick Test Samples */}
            <div className="pt-4 border-t border-[#D5CDBE]/70 space-y-2.5">
              <span className="text-[11px] font-mono text-[#8B7C66] block text-center uppercase tracking-wider">
                Hoặc thử nhanh với 2 mẫu catalog tiêu chuẩn:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => loadSamplePoster('/samples/poster_sample_1.jpg')}
                  className="p-3 bg-white hover:bg-[#F5F1EA] border border-[#D5CDBE] hover:border-[#044C42] rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer shadow-sm active:scale-95"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/samples/poster_sample_1.jpg" alt="Mẫu 1" className="w-8 h-11 object-cover rounded border border-[#E5E0D8]" />
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold text-[#1C1B19] block truncate">Mẫu 1: Đá Slab</span>
                    <span className="text-[10px] text-[#8B7C66] font-mono block">Thẻ kem MP62003</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => loadSamplePoster('/samples/poster_sample_2.jpg')}
                  className="p-3 bg-white hover:bg-[#F5F1EA] border border-[#D5CDBE] hover:border-[#044C42] rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer shadow-sm active:scale-95"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/samples/poster_sample_2.jpg" alt="Mẫu 2" className="w-8 h-11 object-cover rounded border border-[#E5E0D8]" />
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold text-[#1C1B19] block truncate">Mẫu 2: 6 Face</span>
                    <span className="text-[10px] text-[#8B7C66] font-mono block">Dải đen MP62003</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* State 2: Preview & Clear Download/Save Options */
          <div className="bg-[#FAF8F4] border border-[#D5CDBE] rounded-2xl shadow-xl p-4 sm:p-5 space-y-3.5">
            {/* Detection Result Pill */}
            <div className="px-3.5 py-2.5 bg-[#044C42]/10 border border-[#044C42]/20 rounded-xl text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-[#044C42] font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  {detectedResult?.matchedProduct ? (
                    <>Đã nhận diện: <span className="font-bold text-[#B85C38]">{detectedResult.matchedProduct.code}</span></>
                  ) : detectedResult?.extractedCode ? (
                    <>Mã phát hiện: <span className="font-bold text-[#B85C38]">{detectedResult.extractedCode}</span></>
                  ) : (
                    'Đã quét xong (Dạng ' + (detectedResult?.type || 1) + ')'
                  )}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-[#044C42] text-white rounded font-normal">
                  {downloadSuccess ? '✓ Đã tải về' : '✓ Đã xử lý xong'}
                </span>
              </div>

              {detectedResult?.matchedProduct && (
                <div className="flex items-center justify-between text-[11px] text-[#6E6254] pt-0.5 border-t border-[#044C42]/10">
                  <span className="truncate">{detectedResult.matchedProduct.name}</span>
                  <Link
                    href={`/products/${detectedResult.matchedProduct.slug}`}
                    target="_blank"
                    className="text-[#044C42] hover:underline flex items-center gap-1 shrink-0 ml-2"
                  >
                    Xem web <ExternalLink size={11} />
                  </Link>
                </div>
              )}
            </div>

            {/* Poster Result: Displayed as real <img> so users can touch & hold to save to Photos */}
            <div className="bg-[#1C1B19] p-2 rounded-xl flex items-center justify-center max-h-[58vh] overflow-hidden shadow-inner relative group">
              <canvas ref={canvasRef} className="hidden" />
              {previewDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewDataUrl}
                  alt="Poster hoàn thiện"
                  className="max-h-[55vh] max-w-full w-auto h-auto object-contain block rounded shadow select-none"
                />
              ) : (
                <div className="text-white/60 text-xs font-mono py-12 flex items-center gap-2">
                  <Sparkles size={16} className="animate-spin text-[#FFB088]" /> Đang tạo bản xem trước...
                </div>
              )}
            </div>

            {/* Crucial Mobile Tip: Clear & Easy */}
            <div className="text-[11px] text-center font-mono text-[#044C42] bg-[#044C42]/8 py-2 px-3 rounded-lg border border-[#044C42]/20">
              💡 <strong>Lưu vào Thư viện ảnh iPhone / Android nhanh nhất:</strong><br/>
              Chạm và giữ ngón tay vào ảnh trên 1 giây ➔ chọn <strong>&ldquo;Lưu hình ảnh&rdquo;</strong> (Save Image).
            </div>

            {/* Clear Action Buttons */}
            <div className="space-y-2 pt-1">
              {/* Primary Download Button */}
              <button
                type="button"
                onClick={handleDownloadFile}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 bg-[#044C42] hover:bg-[#003831] text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                <Download size={16} />
                {isProcessing ? 'Đang xuất poster...' : 'TẢI POSTER VỀ MÁY (GỐC 100%)'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Fullscreen View Button */}
                <button
                  type="button"
                  onClick={handleOpenFullImage}
                  className="py-2.5 px-3 bg-white hover:bg-[#F5F1EA] text-[#1C1B19] border border-[#D5CDBE] rounded-xl font-mono text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Maximize2 size={13} /> Mở ảnh để lưu
                </button>

                {/* Explicit Share / Zalo Button */}
                <button
                  type="button"
                  onClick={handleShareZalo}
                  className="py-2.5 px-3 bg-white hover:bg-[#F5F1EA] text-[#044C42] border border-[#044C42]/40 rounded-xl font-mono text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 size={13} /> Gửi qua Zalo
                </button>
              </div>

              {/* Reset Button */}
              <button
                type="button"
                onClick={() => {
                  setUploadedImageElement(null);
                  setPreviewDataUrl(null);
                  setDownloadSuccess(false);
                }}
                className="w-full py-2.5 px-4 text-[#8B7C66] hover:text-[#1C1B19] text-center font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer pt-1"
              >
                <RefreshCw size={12} /> Chế poster sản phẩm khác
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Compact Footer */}
      <footer className="text-center py-3 text-[11px] font-mono text-[#8B7C66] border-t border-[#D5CDBE]">
        Thường Sơn Ceramic · Hotline: 0916 640 316 - 0912 958 578
      </footer>
    </div>
  );
}
