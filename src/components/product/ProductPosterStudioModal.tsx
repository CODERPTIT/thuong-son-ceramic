'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Upload, Download, Sparkles, CheckCircle2, Share2, Plus, Layers, ArrowLeft } from 'lucide-react';
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

interface PosterItem {
  id: string;
  file: File;
  fileName: string;
  thumbnailUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  imgElement?: HTMLImageElement;
  previewDataUrl?: string | null;
  detectedResult?: DetectionResult | null;
  cropBottom: number;
  qrX: number;
  qrY: number;
  qrSize: number;
  shareFile?: { file: File; blob: Blob } | null;
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

// Pure function to render poster canvas — Always accurate replace (1:1 original poster dimensions)
async function renderProductPosterCanvas(
  imgElem: HTMLImageElement,
  productUrl: string,
  cropBottom: number,
  qrX: number,
  qrY: number,
  qrSize: number
): Promise<HTMLCanvasElement | null> {
  const srcW = imgElem.naturalWidth;
  const srcH = imgElem.naturalHeight;

  const finalW = srcW;
  const finalH = srcH;

  const canvas = document.createElement('canvas');
  canvas.width = finalW;
  canvas.height = finalH;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw base poster image
  ctx.drawImage(imgElem, 0, 0, srcW, srcH, 0, 0, finalW, srcH);

  // 2. Exact footer position with guaranteed minimum height for clear legibility
  const minFooterBarPx = Math.max(44, Math.round(srcH * 0.055));
  const footerBarHeightPx = Math.max(minFooterBarPx, Math.round((srcH * cropBottom) / 100));
  const footerY = srcH - footerBarHeightPx;

  // 3. Generate & Draw System QR Code
  try {
    // Level 'M' (Medium 15% error correction):
    // Standard for marketing/posters. Modules are significantly larger and clearer,
    // allowing phone cameras and Zalo to scan instantly from a distance without failure.
    const qrDataUrl = await QRCode.toDataURL(productUrl, {
      width: 1024,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });

    const qrImg = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej();
      i.src = qrDataUrl;
    });

    const qx = (finalW * qrX) / 100;
    let qy = (srcH * qrY) / 100;
    const qs = (finalW * qrSize) / 100;

    // Snug quiet zone matching original poster (2-4px, ~4% of QR size)
    const pad = Math.max(2, Math.round(qs * 0.04));
    const maskSize = qs + pad * 2;
    let maskX = Math.round(qx - pad);
    let maskY = Math.round(qy - pad);

    // Anti-overflow right clamp: keep comfortably inside image border
    if (maskX + maskSize > finalW - 4) {
      maskX = (finalW - 4) - maskSize;
    }
    if (maskX < 4) maskX = 4;

    const isNearFooter = (qy >= footerY - 25) || (qy > srcH * 0.72);
    if (isNearFooter) {
      if (maskY + maskSize > footerY) {
        maskY = footerY - maskSize;
      }
      if (maskY > qy - 4) {
        maskY = qy - 4;
      }
    }
    if (maskY < 4) maskY = 4;

    // 100% COMPLETE ERASURE OF OLD QR:
    // Erase any and all traces of the original QR code bounding box
    const wipeLeft = Math.max(0, Math.min(maskX, qx - 4));
    const wipeRight = Math.min(finalW, Math.max(maskX + maskSize, qx + qs + 4));
    const wipeTop = Math.max(0, Math.min(maskY, qy - 4));
    const wipeBottom = isNearFooter ? Math.max(maskY + maskSize, footerY + 2) : Math.max(maskY + maskSize, qy + qs + 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(wipeLeft, wipeTop, wipeRight - wipeLeft, wipeBottom - wipeTop);

    // Pure clean white container mask with elegant rounded corners
    ctx.fillStyle = '#FFFFFF';
    const borderRadius = Math.max(3, Math.round(qs * 0.04));
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(maskX, maskY, maskSize, maskSize, borderRadius);
      ctx.fill();
    } else {
      ctx.fillRect(maskX, maskY, maskSize, maskSize);
    }

    // Draw the new Thường Sơn product QR with high contrast
    ctx.drawImage(qrImg, maskX + pad, maskY + pad, qs, qs);

    // Fine hairline border around the white container
    ctx.strokeStyle = '#D5CDBE';
    ctx.lineWidth = 1;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(maskX, maskY, maskSize, maskSize, borderRadius);
      ctx.stroke();
    } else {
      ctx.strokeRect(maskX, maskY, maskSize, maskSize);
    }
  } catch (err) {
    console.error('QR overlay error:', err);
  }

  // 4. Draw Footer bar
  ctx.fillStyle = '#044C42';
  ctx.fillRect(0, footerY, finalW, footerBarHeightPx);

  ctx.fillStyle = '#B85C38';
  const borderLineH = Math.max(2, Math.round(srcH * 0.0025));
  ctx.fillRect(0, footerY, finalW, borderLineH);

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

  return canvas;
}

export default function ProductPosterStudioModal({ product, onClose }: ProductPosterStudioModalProps) {
  const [baseUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (origin.includes('localhost') || origin.includes('git-') || origin.includes('-c456.vercel.app')) {
        return 'https://thuong-son-ceramic.vercel.app';
      }
      return origin;
    }
    return 'https://thuong-son-ceramic.vercel.app';
  });

  const productUrl = `${baseUrl}/products/${product.slug}`;

  // Multi-image items list
  const [items, setItems] = useState<PosterItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  const activeItem = items[activeIndex] || null;

  // Auto-scan Computer Vision (jsQR) + Precise Top-Down Footer Boundary Detection
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
      qrX: 80.0,
      qrY: 71.5,
      qrSize: 14.5,
      footerYPercent: 91.80,
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
          const detectedSizePct = (Math.max(rawQrW, rawQrH) / W) * 100;
          // Match original QR size directly (no artificial inflation)
          const finalSizePct = Number(detectedSizePct.toFixed(2));
          const detectedType: 1 | 2 = (minX / W) > 0.83 ? 1 : 2;

          result = {
            found: true,
            type: detectedType,
            method: 'jsqr',
            qrX: (minX / W) * 100,
            qrY: (minY / H) * 100,
            qrSize: finalSizePct,
            footerYPercent: 91.80,
          };
        }
      } catch (err) {
        console.warn('jsQR scan error:', err);
      }

      if (!result.found) {
        const sampleY = Math.round(H * 0.80);
        const sampleX = Math.round(W * 0.50);
        const idx = (sampleY * W + sampleX) * 4;
        const brightness = (imgData.data[idx] + imgData.data[idx + 1] + imgData.data[idx + 2]) / 3;

        const isLandscape = (W / H) > 1.2;
        const defaultSize = isLandscape ? 5.6 : 9.0;
        const isType2 = brightness < 90;
        result = {
          found: false,
          type: isType2 ? 2 : 1,
          method: 'template_fallback',
          qrX: isType2 ? 78.0 : 80.0,
          qrY: isType2 ? 71.5 : 71.5,
          qrSize: defaultSize,
          footerYPercent: 91.80,
        };
      }

      // Accurate Universal Top-Down Footer Boundary Detection
      try {
        const minSafeY = Math.round(H * 0.88);

        const sampleBottomY = H - 4;
        let bR = 0, bG = 0, bB = 0, bSamples = 0;
        for (let x = Math.round(W * 0.15); x < Math.round(W * 0.85); x += 4) {
          const idx = (sampleBottomY * W + x) * 4;
          bR += imgData.data[idx];
          bG += imgData.data[idx + 1];
          bB += imgData.data[idx + 2];
          bSamples++;
        }
        bR /= bSamples; bG /= bSamples; bB /= bSamples;

        let topDownEdgeY: number | null = null;
        for (let y = minSafeY; y < H - 15; y++) {
          let rSum = 0, gSum = 0, bSum = 0, count = 0;
          for (let x = Math.round(W * 0.15); x < Math.round(W * 0.85); x += 4) {
            const idx = (y * W + x) * 4;
            rSum += imgData.data[idx];
            gSum += imgData.data[idx + 1];
            bSum += imgData.data[idx + 2];
            count++;
          }
          const r = rSum / count, g = gSum / count, b = bSum / count;
          const diffFromFooter = Math.abs(r - bR) + Math.abs(g - bG) + Math.abs(b - bB);
          const isFooterColor = diffFromFooter < 40;
          const isDarkLine = (r + g + b) / 3 < 65;

          if (isFooterColor || isDarkLine) {
            topDownEdgeY = y;
            break;
          }
        }

        const finalFooterY = topDownEdgeY ? topDownEdgeY - 2 : Math.round(H * 0.912);
        result.footerYPercent = Math.max(89.0, (finalFooterY / H) * 100);
      } catch (err) {
        console.warn('Footer scan error:', err);
        result.footerYPercent = 91.2;
      }
    }

    return result;
  };

  // Helper to process a single item
  const processSingleItem = useCallback(async (item: PosterItem): Promise<PosterItem> => {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (e) => reject(e);
        image.src = item.thumbnailUrl;
      });

      const detection = autoDetectAndConfigure(img);
      const computedCrop = parseFloat((100 - detection.footerYPercent).toFixed(2));

      const canvas = await renderProductPosterCanvas(
        img,
        productUrl,
        computedCrop,
        detection.qrX,
        detection.qrY,
        detection.qrSize
      );

      if (!canvas) {
        return {
          ...item,
          status: 'error',
          errorMessage: 'Không thể vẽ canvas',
        };
      }

      const previewDataUrl = canvas.toDataURL('image/png');
      const shareFileName = `Poster_${product.code}_ThuongSon.jpg`;
      const shareBlob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.90));
      const shareFile = shareBlob ? new File([shareBlob], shareFileName, { type: 'image/jpeg' }) : null;

      return {
        ...item,
        status: 'done',
        imgElement: img,
        previewDataUrl,
        detectedResult: detection,
        cropBottom: computedCrop,
        qrX: detection.qrX,
        qrY: detection.qrY,
        qrSize: detection.qrSize,
        shareFile: shareFile && shareBlob ? { file: shareFile, blob: shareBlob } : null,
      };
    } catch (err: unknown) {
      console.error('Lỗi xử lý modal poster:', err);
      return {
        ...item,
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Lỗi không xác định',
      };
    }
  }, [productUrl, product.code]);

  // Sequential batch processor queue
  useEffect(() => {
    const hasPending = items.some((it) => it.status === 'pending');
    if (!hasPending || isProcessingRef.current) return;

    const processQueue = async () => {
      isProcessingRef.current = true;

      for (let i = 0; i < items.length; i++) {
        if (items[i].status === 'pending') {
          setItems((prev) =>
            prev.map((it, idx) => (idx === i ? { ...it, status: 'processing' } : it))
          );

          const updated = await processSingleItem(items[i]);

          setItems((prev) =>
            prev.map((it, idx) => (idx === i ? updated : it))
          );
        }
      }

      isProcessingRef.current = false;
    };

    processQueue();
  }, [items, processSingleItem]);

  // Handle files
  const handleFiles = (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    const validImages = rawFiles.filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) return;

    setDownloadSuccess(false);

    const newItems: PosterItem[] = validImages.map((file, i) => {
      const id = `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`;
      const thumbnailUrl = URL.createObjectURL(file);
      return {
        id,
        file,
        fileName: file.name,
        thumbnailUrl,
        status: 'pending',
        cropBottom: 8.8,
        qrX: 84.67,
        qrY: 79.35,
        qrSize: 9.20,
      };
    });

    const currentLen = items.length;
    setItems((prev) => [...prev, ...newItems]);
    if (currentLen === 0) {
      setActiveIndex(0);
    }
  };

  const removeItem = (idxToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemToRemove = items[idxToRemove];
    if (itemToRemove && itemToRemove.thumbnailUrl.startsWith('blob:')) {
      URL.revokeObjectURL(itemToRemove.thumbnailUrl);
    }

    setItems((prev) => {
      const next = prev.filter((_, idx) => idx !== idxToRemove);
      if (next.length === 0) {
        setActiveIndex(0);
      } else if (activeIndex >= next.length) {
        setActiveIndex(next.length - 1);
      }
      return next;
    });
  };

  const loadSamplePoster = async (url: string) => {
    setDownloadSuccess(false);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], 'sample.jpg', { type: 'image/jpeg' });
      const newItem: PosterItem = {
        id: `sample_${Date.now()}`,
        file,
        fileName: 'sample.jpg',
        thumbnailUrl: url,
        status: 'pending',
        cropBottom: 8.8,
        qrX: 84.67,
        qrY: 79.35,
        qrSize: 9.20,
      };
      const currentLen = items.length;
      setItems((prev) => [...prev, newItem]);
      if (currentLen === 0) {
        setActiveIndex(0);
      }
    } catch (err) {
      console.warn('Lỗi tải sample poster:', err);
    }
  };

  // Download active poster
  const handleDownloadActive = () => {
    if (!activeItem || !activeItem.previewDataUrl) return;

    const fileName = `Poster_${product.code}_${activeIndex + 1}_ThuongSon.png`;
    const link = document.createElement('a');
    link.href = activeItem.previewDataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      setDownloadSuccess(true);
    }, 300);
  };

  // Download ALL completed posters sequentially
  const handleDownloadAll = async () => {
    const doneItems = items.filter((it) => it.status === 'done' && it.previewDataUrl);
    if (doneItems.length === 0) return;

    setIsDownloadingAll(true);
    setDownloadSuccess(false);

    for (let i = 0; i < doneItems.length; i++) {
      const it = doneItems[i];
      const fileName = `Poster_${product.code}_${i + 1}_ThuongSon.png`;

      const link = document.createElement('a');
      link.href = it.previewDataUrl!;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await new Promise((resolve) => setTimeout(resolve, 380));
    }

    setIsDownloadingAll(false);
    setDownloadSuccess(true);
    setShareNotice(`✓ Đã tải ${doneItems.length} poster về thiết bị!`);
    setTimeout(() => setShareNotice(null), 5000);
  };

  // Share active poster
  const handleShareActive = () => {
    if (!activeItem || !activeItem.previewDataUrl) return;

    let cached = activeItem.shareFile;
    if (!cached) {
      const fileName = `Poster_${product.code}_ThuongSon.png`;
      cached = dataUrlToBlobAndFile(activeItem.previewDataUrl, fileName);
    }

    const { file, blob } = cached;

    const supportsFileShare =
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      (typeof navigator.canShare === 'function'
        ? navigator.canShare({ files: [file] })
        : true);

    if (supportsFileShare) {
      navigator.share({ files: [file] })
        .then(() => {})
        .catch((err: unknown) => {
          if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
            return;
          }
          handleShareFallback(blob);
        });
      return;
    }

    handleShareFallback(blob);
  };

  const handleShareFallback = (blob: Blob) => {
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
      setShareNotice('📱 Ảnh đã mở trên tab mới. Nhấn giữ vào ảnh → chọn "Lưu ảnh" hoặc "Chia sẻ".');
      setTimeout(() => setShareNotice(null), 8000);
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        .then(() => {
          setShareNotice('✓ Đã sao chép ảnh vào Clipboard! Dán trực tiếp vào Zalo hoặc Messenger.');
          setTimeout(() => setShareNotice(null), 6000);
        })
        .catch(() => {
          setShareNotice('Hãy dùng nút TẢI POSTER VỀ MÁY.');
          setTimeout(() => setShareNotice(null), 7000);
        });
      return;
    }

    setShareNotice('Hãy dùng nút TẢI POSTER VỀ MÁY rồi chia sẻ.');
    setTimeout(() => setShareNotice(null), 7000);
  };

  const handleResetAll = () => {
    items.forEach((it) => {
      if (it.thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(it.thumbnailUrl);
      }
    });
    setItems([]);
    setActiveIndex(0);
    setDownloadSuccess(false);
    setShareNotice(null);
  };

  const doneCount = items.filter((it) => it.status === 'done').length;
  const pendingCount = items.filter((it) => it.status === 'pending' || it.status === 'processing').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#FAF8F4] w-full max-w-lg rounded-xl shadow-2xl border border-[#D5CDBE] overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#044C42] text-white px-4 py-3 flex items-center justify-between border-b border-[#B85C38]">
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleResetAll}
                className="flex items-center gap-1.5 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors text-xs font-mono font-medium cursor-pointer mr-1"
                title="Thoát về tải ảnh"
              >
                <ArrowLeft size={13} /> Thoát về tải ảnh
              </button>
            )}
            <Sparkles size={16} className="text-[#FFB088]" />
            <h3 className="font-serif text-sm sm:text-base font-medium">
              Chế Poster · <span className="font-mono text-[#FFB088] font-bold">{product.code}</span>
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

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          {/* Multi-file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files);
                e.target.value = '';
              }
            }}
            className="hidden"
          />

          {items.length === 0 ? (
            /* Upload Screen */
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#044C42] hover:border-[#003831] bg-[#044C42]/5 hover:bg-[#044C42]/10 transition-all rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-full bg-[#044C42] text-white flex items-center justify-center shadow-md">
                  <Upload size={24} />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-[#1C1B19] block">
                    Chạm để chọn một hoặc nhiều ảnh poster
                  </span>
                  <span className="text-xs text-[#B85C38] font-mono font-medium block">
                    ✓ Hỗ trợ tích chọn nhiều ảnh như gửi ảnh Zalo
                  </span>
                  <span className="text-[11px] text-[#8B7C66] font-mono block">
                    Tự động nhận diện &amp; cắt đè chân trang Thường Sơn chuẩn 100%
                  </span>
                </div>
              </button>

              {/* 2 Quick Samples */}
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
            /* Multi-Image Manager Screen */
            <div className="space-y-3">
              {/* Batch Processing Notice */}
              {pendingCount > 0 && (
                <div className="px-3 py-1.5 bg-[#044C42]/10 border border-[#044C42]/20 rounded-lg text-xs font-mono flex items-center justify-between text-[#044C42]">
                  <span className="flex items-center gap-2">
                    <Sparkles size={13} className="animate-spin text-[#B85C38]" />
                    Đang chế bản: <strong>{doneCount}/{items.length} ảnh</strong>
                  </span>
                  <span className="text-[10px] text-[#6E6254]">Tự động</span>
                </div>
              )}

              {/* Zalo-style Thumbnail Strip */}
              <div className="bg-white border border-[#D5CDBE] rounded-xl p-2 shadow-sm space-y-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-mono font-semibold text-[#1C1B19] flex items-center gap-1.5">
                    <Layers size={13} className="text-[#044C42]" />
                    Danh sách ảnh ({items.length}):
                  </span>
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="text-[11px] font-mono text-[#B85C38] hover:text-[#044C42] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <ArrowLeft size={11} /> Thoát về tải ảnh
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 scrollbar-thin">
                  {items.map((it, idx) => {
                    const isActive = idx === activeIndex;
                    const isDone = it.status === 'done';
                    const isProc = it.status === 'processing' || it.status === 'pending';

                    return (
                      <div
                        key={it.id}
                        onClick={() => setActiveIndex(idx)}
                        className={`relative shrink-0 w-14 h-18 sm:w-16 sm:h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all select-none ${
                          isActive
                            ? 'border-[#044C42] ring-2 ring-[#044C42]/30 shadow-md scale-[1.02]'
                            : 'border-[#D5CDBE] opacity-75 hover:opacity-100 hover:border-[#044C42]/60'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={it.previewDataUrl || it.thumbnailUrl}
                          alt={it.fileName}
                          className="w-full h-full object-cover"
                        />

                        {/* Status Icon */}
                        <div className="absolute top-1 left-1">
                          {isDone ? (
                            <div className="w-4 h-4 rounded-full bg-[#044C42] text-white flex items-center justify-center text-[9px] font-bold shadow">
                              ✓
                            </div>
                          ) : isProc ? (
                            <div className="w-4 h-4 rounded-full bg-[#B85C38] text-white flex items-center justify-center shadow">
                              <Sparkles size={9} className="animate-spin" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-bold shadow">
                              !
                            </div>
                          )}
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={(e) => removeItem(idx, e)}
                          title="Xóa"
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                        >
                          ×
                        </button>

                        <div className="absolute bottom-0 inset-x-0 bg-black/75 px-1 py-0.5 text-[8px] font-mono text-white text-center truncate">
                          #{idx + 1}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add more slot */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 w-14 h-18 sm:w-16 sm:h-20 rounded-lg border-2 border-dashed border-[#044C42]/50 hover:border-[#044C42] bg-[#044C42]/5 hover:bg-[#044C42]/10 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-colors"
                  >
                    <Plus size={16} className="text-[#044C42]" />
                    <span className="text-[9px] font-mono font-medium text-[#044C42] leading-tight">
                      Thêm
                    </span>
                  </button>
                </div>
              </div>

              {/* Status Pill for active */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#044C42]/10 border border-[#044C42]/20 rounded-lg text-xs font-mono text-[#044C42]">
                <span className="flex items-center gap-1.5 font-semibold truncate">
                  <CheckCircle2 size={14} className="text-[#044C42] shrink-0" />
                  {downloadSuccess ? (
                    <span>✓ Đã tải poster về máy!</span>
                  ) : activeItem?.status === 'done' ? (
                    <span>Ảnh {activeIndex + 1}/{items.length}: Đã cắt đè chuẩn</span>
                  ) : (
                    <span>Ảnh {activeIndex + 1}/{items.length}: Đang xử lý...</span>
                  )}
                </span>
                <span className="text-[10px] text-[#6E6254] shrink-0 ml-2">100% Ảnh gốc</span>
              </div>

              {/* Live Image Preview */}
              <div className="bg-[#1C1B19] p-2 rounded-lg flex items-center justify-center min-h-[300px] max-h-[52vh] overflow-hidden shadow-inner">
                {activeItem?.previewDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={activeItem.previewDataUrl}
                    alt="Poster hoàn thiện"
                    className="max-h-[50vh] max-w-full w-auto h-auto object-contain block rounded shadow select-none"
                  />
                ) : (
                  <div className="text-white/60 text-xs font-mono py-12 flex items-center gap-2">
                    <Sparkles size={16} className="animate-spin text-[#FFB088]" /> Đang tạo poster...
                  </div>
                )}
              </div>

              {/* Action Buttons: 1 Unified Download Button + 1 Share Button */}
              <div className="space-y-2 pt-1">
                {/* Single Unified Download Button */}
                {items.length > 1 ? (
                  <button
                    type="button"
                    onClick={handleDownloadAll}
                    disabled={isDownloadingAll || doneCount === 0}
                    className="w-full py-3 px-4 bg-[#044C42] hover:bg-[#003831] text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
                  >
                    <Download size={15} />
                    {isDownloadingAll ? 'ĐANG TẢI CÁC POSTER...' : `TẢI TẤT CẢ POSTER VỀ MÁY (${doneCount}/${items.length} ẢNH)`}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownloadActive}
                    disabled={!activeItem?.previewDataUrl}
                    className="w-full py-3 px-4 bg-[#044C42] hover:bg-[#003831] text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
                  >
                    <Download size={15} />
                    TẢI POSTER VỀ MÁY (GỐC 100%)
                  </button>
                )}

                {/* Native Share Button */}
                <button
                  type="button"
                  onClick={handleShareActive}
                  disabled={!activeItem?.previewDataUrl}
                  className="w-full py-2.5 px-3 bg-white hover:bg-[#F5F1EA] text-[#044C42] border border-[#044C42] rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  <Share2 size={14} className="text-[#044C42]" />
                  CHIA SẺ POSTER (ZALO/ALBUM)
                </button>

                {/* Secondary option if multiple: download only active item */}
                {items.length > 1 && (
                  <div className="text-center pt-0.5">
                    <button
                      type="button"
                      onClick={handleDownloadActive}
                      disabled={!activeItem?.previewDataUrl}
                      className="text-[10px] font-mono text-[#044C42] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Download size={11} />
                      Hoặc chỉ tải riêng ảnh đang chọn (Ảnh {activeIndex + 1})
                    </button>
                  </div>
                )}

                {shareNotice && (
                  <div className="p-2.5 bg-[#044C42]/10 border border-[#044C42]/30 rounded-lg text-xs font-mono text-[#044C42] text-center leading-relaxed">
                    {shareNotice}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResetAll}
                  className="w-full py-2 px-3 bg-white/90 hover:bg-white border border-[#D5CDBE] hover:border-[#8B7C66] text-[#6E6254] hover:text-[#1C1B19] rounded-lg font-mono text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <ArrowLeft size={13} /> Thoát về trang tải ảnh (Chọn lại ảnh)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
