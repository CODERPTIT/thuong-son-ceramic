'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Upload, Download, Sparkles, Sliders, Image as ImageIcon, QrCode, Check, RefreshCw, Scissors, Eye, ChevronDown, ChevronUp, CheckCircle2, ShieldCheck } from 'lucide-react';
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
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedImageElement, setUploadedImageElement] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Detection and Calibration state
  const [detectionInfo, setDetectionInfo] = useState<DetectionResult | null>(null);
  const [qrX, setQrX] = useState<number>(84.67);
  const [qrY, setQrY] = useState<number>(79.35);
  const [qrSize, setQrSize] = useState<number>(9.20);
  const [cropBottom, setCropBottom] = useState<number>(7.71); // Default footer bar height %
  const [footerAction, setFooterAction] = useState<'replace' | 'crop' | 'keep'>('replace');
  const [footerTheme, setFooterTheme] = useState<'emerald' | 'dark'>('emerald');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // Optional Extra Tile Image Overlay
  const [enableExtraTile, setEnableExtraTile] = useState<boolean>(false);
  const [selectedExtraImage, setSelectedExtraImage] = useState<string>(product.images.fullFace || product.images.thumbnail || '');
  const [tileX, setTileX] = useState<number>(18);
  const [tileY, setTileY] = useState<number>(44);
  const [tileWidth, setTileWidth] = useState<number>(26);
  const [tileHeight, setTileHeight] = useState<number>(42);

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
      // Security/tainted canvas fallback
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
        console.warn('jsQR scan failed, switching to template fallback:', err);
      }

      // 2. Fallback classification if jsQR did not detect
      if (!result.found) {
        const sampleY = Math.round(H * 0.80);
        const sampleX = Math.round(W * 0.50);
        const idx = (sampleY * W + sampleX) * 4;
        const brightness = (imgData.data[idx] + imgData.data[idx + 1] + imgData.data[idx + 2]) / 3;

        // Dark bar indicates Type 2 (6 Face / Story), light cream indicates Type 1 (Slab)
        const isType2 = brightness < 90;

        if (isType2) {
          result = {
            found: false,
            type: 2,
            method: 'template_fallback',
            qrX: 81.30,
            qrY: 79.67,
            qrSize: 10.82,
            footerYPercent: 92.29,
          };
        } else {
          result = {
            found: false,
            type: 1,
            method: 'template_fallback',
            qrX: 84.67,
            qrY: 79.35,
            qrSize: 9.20,
            footerYPercent: 92.29,
          };
        }
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

  // Re-render canvas whenever settings or image change
  const renderCompositeCanvas = useCallback(async (isExport = false): Promise<HTMLCanvasElement | null> => {
    if (!uploadedImageElement) return null;

    const srcW = uploadedImageElement.naturalWidth;
    const srcH = uploadedImageElement.naturalHeight;

    // Calculate crop or replace height
    const footerBarHeightPx = Math.round((srcH * cropBottom) / 100);
    const finalW = srcW;
    const finalH = footerAction === 'crop' ? srcH - footerBarHeightPx : srcH;

    const canvas = isExport ? document.createElement('canvas') : (canvasRef.current || document.createElement('canvas'));
    canvas.width = finalW;
    canvas.height = finalH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Draw base poster image
    ctx.drawImage(
      uploadedImageElement,
      0, 0, srcW, finalH,
      0, 0, finalW, finalH
    );

    // 2. Footer bar processing: Replace with Thường Sơn brand bar or Crop
    if (footerAction === 'replace') {
      const footerY = srcH - footerBarHeightPx;

      // Background: Deep Emerald Green matching original catalog theme or Luxury Obsidian
      ctx.fillStyle = footerTheme === 'emerald' ? '#044C42' : '#1C1B19';
      ctx.fillRect(0, footerY, finalW, footerBarHeightPx);

      // Gold / Terracotta Top Line Accent
      ctx.fillStyle = '#B85C38';
      const borderLineH = Math.max(2, Math.round(srcH * 0.0025));
      ctx.fillRect(0, footerY, finalW, borderLineH);

      // Brand Title (Left)
      ctx.fillStyle = '#FFFFFF';
      const fontSizeTitle = Math.round(footerBarHeightPx * 0.28);
      ctx.font = `bold ${fontSizeTitle}px Georgia, "Playfair Display", serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('THƯỜNG SƠN CERAMIC', Math.round(finalW * 0.04), footerY + footerBarHeightPx * 0.42);

      // Subtitle (Left)
      ctx.fillStyle = '#E0D7C6';
      const fontSizeSub = Math.round(footerBarHeightPx * 0.16);
      ctx.font = `500 ${fontSizeSub}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText('Nhà Phân Phối Gạch Kiến Trúc & Bề Mặt Cao Cấp', Math.round(finalW * 0.04), footerY + footerBarHeightPx * 0.72);

      // Tagline (Center)
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      const fontSizeTagline = Math.round(footerBarHeightPx * 0.17);
      ctx.font = `600 ${fontSizeTagline}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText('THE ART OF LIVING SPACES', Math.round(finalW * 0.50), footerY + footerBarHeightPx * 0.56);

      // Contact Info (Right)
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${fontSizeSub}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText('SHOWROOM: SỐ 01 ĐÌNH BẢNG, HOẰNG LỘC, THANH HÓA', Math.round(finalW * 0.96), footerY + footerBarHeightPx * 0.40);

      ctx.fillStyle = '#F5F1EA';
      ctx.font = `500 ${fontSizeSub}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText('HOTLINE: 0916 640 316 - 0912 958 578  ·  THUONGSONCERAMIC.VN', Math.round(finalW * 0.96), footerY + footerBarHeightPx * 0.70);
    }

    // 3. Optional Extra Tile Image Overlay (for customization)
    if (enableExtraTile && selectedExtraImage) {
      try {
        const tileImg = await new Promise<HTMLImageElement>((res, rej) => {
          const i = new Image();
          i.crossOrigin = 'anonymous';
          i.onload = () => res(i);
          i.onerror = () => rej();
          i.src = selectedExtraImage;
        });

        const tx = (finalW * tileX) / 100;
        const ty = (srcH * tileY) / 100;
        const tw = (finalW * tileWidth) / 100;
        const th = (srcH * tileHeight) / 100;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = Math.round(tw * 0.08);
        ctx.shadowOffsetX = Math.round(tw * 0.03);
        ctx.shadowOffsetY = Math.round(tw * 0.03);

        ctx.drawImage(tileImg, tx, ty, tw, th);
        ctx.restore();

        ctx.strokeStyle = '#D5CDBE';
        ctx.lineWidth = Math.max(1, Math.round(tw * 0.006));
        ctx.strokeRect(tx, ty, tw, th);
      } catch (err) {
        console.warn('Failed to draw extra tile image:', err);
      }
    }

    // 4. Generate & Draw System QR Code covering old QR location
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
      console.error('Failed to generate or overlay QR:', err);
    }

    return canvas;
  }, [uploadedImageElement, cropBottom, footerAction, footerTheme, qrX, qrY, qrSize, enableExtraTile, selectedExtraImage, tileX, tileY, tileWidth, tileHeight, productUrl]);

  // Update canvas on parameter change
  useEffect(() => {
    if (uploadedImageElement) {
      renderCompositeCanvas(false);
    }
  }, [uploadedImageElement, renderCompositeCanvas]);

  // Execute export and download
  const triggerDownloadFile = async (customCanvas?: HTMLCanvasElement) => {
    const canvasToExport = customCanvas || (await renderCompositeCanvas(true));
    if (!canvasToExport) return;

    return new Promise<void>((resolve) => {
      canvasToExport.toBlob((blob) => {
        if (!blob) {
          resolve();
          return;
        }

        const fileName = `Poster_${product.code}_ThuongSon.png`;
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
          setDownloadSuccess(true);
          resolve();
        }, 300);
      }, 'image/png', 1.0);
    });
  };

  // Full Zero-Click Pipeline: Process Image -> Scan QR -> Composite Canvas -> Auto Download
  const processImageAndAutoDownload = async (img: HTMLImageElement, src: string) => {
    setIsProcessing(true);
    setStatusMessage('Đang tự động quét vị trí QR cũ qua thị giác máy tính...');

    // 1. Auto detect QR and footer
    const detection = autoDetectAndConfigure(img);
    setDetectionInfo(detection);
    setQrX(detection.qrX);
    setQrY(detection.qrY);
    setQrSize(detection.qrSize);
    setCropBottom(parseFloat((100 - detection.footerYPercent).toFixed(2)));
    setFooterAction('replace');

    setStatusMessage('Đang đè mã QR Thường Sơn & chèn đuôi nội dung thương hiệu...');

    // Small delay to ensure state and canvas are ready
    setTimeout(async () => {
      try {
        const exportCanvas = await renderCompositeCanvas(true);
        if (exportCanvas) {
          setStatusMessage('Đang xuất file poster 4K & tự động lưu về máy...');
          await triggerDownloadFile(exportCanvas);
          setStatusMessage('Hoàn tất! Poster đã được tự động lưu về máy.');
        }
      } catch (err) {
        console.error('Auto download error:', err);
      } finally {
        setIsProcessing(false);
      }
    }, 250);
  };

  // Handle image upload from file picker
  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setDownloadSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setUploadedImageSrc(src);

      const img = new Image();
      img.onload = () => {
        setUploadedImageElement(img);
        processImageAndAutoDownload(img, src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const loadSamplePoster = (url: string) => {
    setDownloadSuccess(false);
    setUploadedImageSrc(url);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setUploadedImageElement(img);
      processImageAndAutoDownload(img, url);
    };
    img.src = url;
  };

  const displayName = product.name.replace(/^(Grand Ceramics|Apodio|Việt Ý|Viglacera)\s+\1\b/i, '$1');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#FAF8F4] w-full max-w-5xl rounded-lg shadow-2xl border border-[#D5CDBE] overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Header Bar */}
        <div className="bg-[#044C42] text-[#F5F1EA] px-5 py-3.5 flex items-center justify-between border-b border-[#B85C38]">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-[#FFB088]" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-medium tracking-wide">
                  Chế Bản Poster Tự Động Thường Sơn
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-white/15 text-white rounded border border-white/20">
                  Zero-Click · Tự Động 100%
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#D5CDBE]">
                Sản phẩm: <span className="text-[#FFB088] font-bold">{product.code}</span> · {displayName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng"
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success / Status Banner */}
        {uploadedImageElement && (
          <div className={`px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-mono transition-colors ${
            downloadSuccess 
              ? 'bg-[#005A4E] text-white border-b border-[#067363]' 
              : 'bg-[#B85C38]/10 text-[#B85C38] border-b border-[#B85C38]/20'
          }`}>
            <div className="flex items-center gap-2 overflow-hidden">
              {downloadSuccess ? (
                <CheckCircle2 size={16} className="text-[#68D391] shrink-0" />
              ) : (
                <Sparkles size={16} className="animate-spin shrink-0 text-[#B85C38]" />
              )}
              <span className="truncate">
                {downloadSuccess
                  ? `✓ ĐÃ TỰ ĐỘNG CHẾ BẢN & LƯU POSTER (${detectionInfo ? `Dạng ${detectionInfo.type}` : 'Auto'}) VỀ MÁY!`
                  : statusMessage || 'Đang xử lý ảnh...'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => triggerDownloadFile()}
                disabled={isProcessing}
                className="px-3 py-1 bg-white text-[#044C42] hover:bg-[#FAF8F4] font-bold rounded shadow-sm flex items-center gap-1.5 transition-all text-[11px] cursor-pointer"
              >
                <Download size={13} /> Tải Lại Ảnh
              </button>
            </div>
          </div>
        )}

        {/* Content Body: Left Control & Info + Right Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Upload Box & Status (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 overflow-y-auto border-r border-[#D5CDBE]/70 space-y-4 bg-[#F5F1EA]">
            {/* 1. Drag & Drop Upload Zone */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1C1B19] font-semibold mb-2">
                Tải Lên Ảnh Poster Catalog Gốc (Dạng 1 hoặc Dạng 2)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed transition-all p-5 text-center rounded flex flex-col items-center justify-center gap-2 group cursor-pointer ${
                  isDragging 
                    ? 'border-[#044C42] bg-[#044C42]/10 scale-[0.99]' 
                    : 'border-[#B85C38] hover:border-[#044C42] hover:bg-white/60 bg-white/40'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-[#FAF8F4] border border-[#D5CDBE] flex items-center justify-center text-[#B85C38] group-hover:scale-110 transition-transform">
                  <Upload size={20} />
                </div>
                <div>
                  <span className="text-xs font-medium text-[#1C1B19] block">
                    {uploadedImageSrc ? 'Bấm để đổi poster khác (hoặc kéo thả vào đây)' : 'Kéo thả ảnh poster vào đây hoặc bấm để chọn'}
                  </span>
                  <span className="text-[10px] text-[#8B7C66] font-mono mt-0.5 block">
                    ⚡ Hệ thống tự quét vị trí QR, chèn chân trang &amp; lưu về máy ngay lập tức
                  </span>
                </div>
              </div>

              {/* Quick sample pickers */}
              <div className="mt-3 pt-3 border-t border-[#D5CDBE]/60">
                <span className="text-[10px] font-mono text-[#8B7C66] block mb-2 uppercase tracking-wider">
                  Hoặc thử nhanh với 2 mẫu poster catalog tiêu chuẩn:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => loadSamplePoster('/samples/poster_sample_1.jpg')}
                    className="p-2 bg-white hover:bg-[#FAF8F4] border border-[#D5CDBE] hover:border-[#044C42] rounded text-left transition-colors flex items-center gap-2 group cursor-pointer shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/samples/poster_sample_1.jpg" alt="Mẫu 1" className="w-8 h-10 object-cover rounded border border-[#E5E0D8]" />
                    <div className="overflow-hidden">
                      <span className="text-[11px] font-medium text-[#1C1B19] block group-hover:text-[#044C42] truncate">
                        Mẫu 1: Đá Slab
                      </span>
                      <span className="text-[9px] font-mono text-[#8B7C66] block">
                        Thẻ thông số kem
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSamplePoster('/samples/poster_sample_2.jpg')}
                    className="p-2 bg-white hover:bg-[#FAF8F4] border border-[#D5CDBE] hover:border-[#044C42] rounded text-left transition-colors flex items-center gap-2 group cursor-pointer shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/samples/poster_sample_2.jpg" alt="Mẫu 2" className="w-8 h-10 object-cover rounded border border-[#E5E0D8]" />
                    <div className="overflow-hidden">
                      <span className="text-[11px] font-medium text-[#1C1B19] block group-hover:text-[#044C42] truncate">
                        Mẫu 2: 6 Face
                      </span>
                      <span className="text-[9px] font-mono text-[#8B7C66] block">
                        Dải thông số đen
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Auto Detection Status Box */}
            {uploadedImageElement && detectionInfo && (
              <div className="p-3 bg-white border border-[#D5CDBE] rounded space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[#044C42] font-semibold border-b border-[#D5CDBE]/50 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#044C42]" />
                    Nhận Diện Tự Động: Dạng {detectionInfo.type}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#044C42]/10 rounded text-[#044C42]">
                    {detectionInfo.method === 'jsqr' ? 'Thị giác máy tính jsQR' : 'Phân loại mẫu'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6E6254]">
                  <div>
                    <span className="text-[#8B7C66] block">Tọa độ QR phủ:</span>
                    <span className="text-[#1C1B19] font-medium">X: {qrX.toFixed(1)}% · Y: {qrY.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[#8B7C66] block">Kích thước ô QR:</span>
                    <span className="text-[#1C1B19] font-medium">{qrSize.toFixed(1)}% (Phủ kín 100%)</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#8B7C66] block">Đuôi nội dung (Chân trang):</span>
                    <span className="text-[#1C1B19] font-medium">
                      {footerAction === 'replace' ? '🏛 Đè nhận diện Thường Sơn Ceramic' : '✂ Cắt chân trang cũ'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Expandable Advanced Fine-Tuning Settings (Collapsed by default for Zero-Interaction) */}
            {uploadedImageElement && (
              <div className="border border-[#D5CDBE] rounded overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F1EA] hover:bg-[#EAE4D9] flex items-center justify-between text-xs font-mono text-[#1C1B19] font-semibold transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders size={13} className="text-[#B85C38]" />
                    Tùy chỉnh thủ công nâng cao (Tùy chọn)
                  </span>
                  {showAdvancedSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showAdvancedSettings && (
                  <div className="p-3.5 space-y-3.5 text-xs font-mono border-t border-[#D5CDBE]">
                    {/* QR Calibration Sliders */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[#1C1B19] font-semibold">
                        <span className="flex items-center gap-1"><QrCode size={12} /> Tọa độ ô QR</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (detectionInfo) {
                              setQrX(detectionInfo.qrX);
                              setQrY(detectionInfo.qrY);
                              setQrSize(detectionInfo.qrSize);
                            }
                          }}
                          className="text-[10px] text-[#B85C38] hover:underline flex items-center gap-1"
                        >
                          <RefreshCw size={9} /> Reset theo máy tính
                        </button>
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <div className="flex justify-between text-[#8B7C66]">
                            <span>Vị trí X (%)</span>
                            <span>{qrX.toFixed(1)}%</span>
                          </div>
                          <input type="range" min="60" max="98" step="0.2" value={qrX} onChange={(e) => setQrX(parseFloat(e.target.value))} className="w-full accent-[#044C42]" />
                        </div>
                        <div>
                          <div className="flex justify-between text-[#8B7C66]">
                            <span>Vị trí Y (%)</span>
                            <span>{qrY.toFixed(1)}%</span>
                          </div>
                          <input type="range" min="60" max="98" step="0.2" value={qrY} onChange={(e) => setQrY(parseFloat(e.target.value))} className="w-full accent-[#044C42]" />
                        </div>
                        <div>
                          <div className="flex justify-between text-[#8B7C66]">
                            <span>Kích thước ô QR (%)</span>
                            <span>{qrSize.toFixed(1)}%</span>
                          </div>
                          <input type="range" min="6" max="18" step="0.2" value={qrSize} onChange={(e) => setQrSize(parseFloat(e.target.value))} className="w-full accent-[#044C42]" />
                        </div>
                      </div>
                    </div>

                    {/* Footer bar Action */}
                    <div className="pt-2 border-t border-[#D5CDBE]/60 space-y-2">
                      <span className="font-semibold text-[#1C1B19] flex items-center gap-1">
                        <Scissors size={12} /> Xử lý đuôi chân trang
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFooterAction('replace')}
                          className={`py-1.5 px-2 border rounded text-center transition-all ${
                            footerAction === 'replace' ? 'border-[#044C42] bg-[#044C42]/10 text-[#044C42] font-bold' : 'border-[#D5CDBE] text-[#6E6254]'
                          }`}
                        >
                          🏛 Đè Thường Sơn
                        </button>
                        <button
                          type="button"
                          onClick={() => setFooterAction('crop')}
                          className={`py-1.5 px-2 border rounded text-center transition-all ${
                            footerAction === 'crop' ? 'border-[#B85C38] bg-[#B85C38]/10 text-[#B85C38] font-bold' : 'border-[#D5CDBE] text-[#6E6254]'
                          }`}
                        >
                          ✂ Cắt bỏ hoàn toàn
                        </button>
                      </div>

                      {footerAction === 'replace' && (
                        <div className="flex gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setFooterTheme('emerald')}
                            className={`flex-1 py-1 text-[10px] border rounded ${
                              footerTheme === 'emerald' ? 'border-[#044C42] bg-[#044C42] text-white font-bold' : 'border-[#D5CDBE]'
                            }`}
                          >
                            Xanh Catalog (#044C42)
                          </button>
                          <button
                            type="button"
                            onClick={() => setFooterTheme('dark')}
                            className={`flex-1 py-1 text-[10px] border rounded ${
                              footerTheme === 'dark' ? 'border-[#1C1B19] bg-[#1C1B19] text-white font-bold' : 'border-[#D5CDBE]'
                            }`}
                          >
                            Đen Sang Trọng (#1C1B19)
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Extra tile image overlay */}
                    <div className="pt-2 border-t border-[#D5CDBE]/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1C1B19] flex items-center gap-1">
                          <ImageIcon size={12} /> Ghép thêm mặt gạch từ web
                        </span>
                        <input
                          type="checkbox"
                          checked={enableExtraTile}
                          onChange={(e) => setEnableExtraTile(e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#044C42]"
                        />
                      </div>
                      {enableExtraTile && (
                        <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                          <div>
                            <span>Tọa độ X: {tileX}%</span>
                            <input type="range" min="0" max="80" step="1" value={tileX} onChange={(e) => setTileX(parseFloat(e.target.value))} className="w-full accent-[#044C42]" />
                          </div>
                          <div>
                            <span>Tọa độ Y: {tileY}%</span>
                            <input type="range" min="0" max="80" step="1" value={tileY} onChange={(e) => setTileY(parseFloat(e.target.value))} className="w-full accent-[#044C42]" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Export CTA */}
            {uploadedImageElement && (
              <div className="pt-1">
                <button
                  onClick={() => triggerDownloadFile()}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 bg-[#044C42] hover:bg-[#003831] text-white rounded font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Download size={16} /> {isProcessing ? 'Đang xuất poster 4K...' : 'TẢI LẠI POSTER ĐÃ XỬ LÝ (GỐC 100%)'}
                </button>
                <p className="text-[10px] font-mono text-center text-[#8B7C66] mt-2">
                  ✓ Giữ nguyên 100% chất lượng ảnh gốc · Đè mã QR Thường Sơn và chân trang chuẩn in ấn
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Live Poster Output View (7 cols) */}
          <div className="lg:col-span-7 bg-[#1C1B19] p-4 sm:p-5 flex flex-col items-center justify-center relative min-h-[380px] sm:min-h-[520px]">
            {uploadedImageElement ? (
              <div className="flex flex-col items-center justify-center w-full h-full space-y-3">
                {/* Live Canvas */}
                <div className="relative max-h-[64vh] max-w-full overflow-hidden flex items-center justify-center border border-white/10 shadow-2xl rounded">
                  <canvas
                    ref={canvasRef}
                    className="max-h-[64vh] max-w-full w-auto h-auto object-contain block"
                  />
                </div>

                {/* Direct Action Bar below Preview */}
                <div className="w-full max-w-md flex items-center justify-between text-[11px] font-mono text-white/70 px-1 pt-1">
                  <span className="flex items-center gap-1.5 text-[#68D391]">
                    <Check size={13} /> Mã QR Thường Sơn đã phủ kín
                  </span>
                  <span className="text-white/50">
                    Đuôi: Thường Sơn Ceramic
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/60 space-y-3 p-8 max-w-sm">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#FFB088]">
                  <Sparkles size={28} />
                </div>
                <h4 className="font-serif text-base text-white/90">
                  Chế Bản Poster Tự Động 100%
                </h4>
                <p className="text-xs font-mono text-white/60 leading-relaxed">
                  Chỉ cần kéo thả hoặc chọn ảnh poster catalog (Dạng 1 hoặc Dạng 2), hệ thống sẽ tự động quét mã QR cũ, phủ mã QR Thường Sơn Ceramic và cập nhật đuôi nội dung rồi tự động lưu về máy.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#044C42] hover:bg-[#066F60] text-white text-xs font-mono rounded shadow transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Upload size={14} /> Chọn ảnh poster từ máy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
