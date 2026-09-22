'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Upload, Download, Sparkles, RefreshCw, ExternalLink, ArrowLeft, ShieldCheck, Share2, Plus, Layers } from 'lucide-react';
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
  targetProductUrl: string;
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
async function renderPosterCanvas(
  imgElem: HTMLImageElement,
  targetUrl: string,
  cropBottom: number,
  qrX: number,
  qrY: number,
  qrSize: number
): Promise<HTMLCanvasElement | null> {
  const srcW = imgElem.naturalWidth;
  const srcH = imgElem.naturalHeight;

  // Exact 1:1 original dimensions
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

  // 2. Exact footer position calculated from accurate crop detection
  const footerBarHeightPx = Math.round((srcH * cropBottom) / 100);
  const footerY = srcH - footerBarHeightPx;

  // 3. Generate & Draw System QR Code covering old QR location
  try {
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      width: 1024,
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

    const qx = (finalW * qrX) / 100;
    let qy = (srcH * qrY) / 100;
    const qs = (finalW * qrSize) / 100;

    // Generous white quiet zone (15% of QR size each side)
    const pad = Math.round(qs * 0.15);
    const maskSize = qs + pad * 2;
    const maskX = qx - pad;
    let maskY = qy - pad;

    // Anti-collision clamp: QR white box MUST NOT touch or cross footer bar
    const maxSafeBottom = footerY - 4;
    if (maskY + maskSize > maxSafeBottom) {
      const shift = (maskY + maskSize) - maxSafeBottom;
      maskY -= shift;
      qy -= shift;
    }

    // Pure clean white container mask
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(maskX, maskY, maskSize, maskSize);

    // Draw the new Thường Sơn product QR
    ctx.drawImage(qrImg, qx, qy, qs, qs);

    // Fine hairline border around the white container
    ctx.strokeStyle = '#D5CDBE';
    ctx.lineWidth = Math.max(1, Math.round(qs * 0.015));
    ctx.strokeRect(maskX, maskY, maskSize, maskSize);
  } catch (err) {
    console.error('QR overlay error:', err);
  }

  // 4. Draw Footer bar with clean Thường Sơn info AFTER QR code
  // Deep Emerald Green
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

  // Right: Showroom & Hotline
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

export default function StandalonePosterPage() {
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

  // Multi-image items list
  const [items, setItems] = useState<PosterItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Active item
  const activeItem = items[activeIndex] || null;

  // Auto-scan image with Computer Vision (jsQR) + Precise Top-Down Footer Boundary Detection
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
      footerYPercent: 91.80,
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

          const detectedType: 1 | 2 = (minX / W) > 0.83 ? 1 : 2;

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
            footerYPercent: 91.80,
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
          footerYPercent: 91.80,
          extractedCode: null,
          matchedProduct: null,
        };
      }

      // 3. Accurate Universal Top-Down Footer Boundary Detection
      // Identifies the exact row where the old distributor bar or its separator line begins
      try {
        const qrBottomPct = result.qrY + result.qrSize * 1.15;
        const minSafeY = Math.max(Math.round((H * (qrBottomPct + 1.2)) / 100), Math.round(H * 0.88));

        // Sample base footer color at the bottom (last 4 rows) across middle 70% width
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

        // Scan downwards from minSafeY to find the exact top edge of the footer / separator line
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

        // 2px safety overlap ensures 100% of old distributor footer is covered
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
      // 1. Load image
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (e) => reject(e);
        image.src = item.thumbnailUrl;
      });

      // 2. Auto-detect with accurate footer boundary
      const detection = autoDetectAndConfigure(img);
      const computedCrop = parseFloat((100 - detection.footerYPercent).toFixed(2));

      const targetUrl = detection.matchedProduct
        ? `${baseUrl}/products/${detection.matchedProduct.slug}`
        : detection.extractedCode
        ? `${baseUrl}/catalog?search=${encodeURIComponent(detection.extractedCode)}`
        : `${baseUrl}/catalog`;

      // 3. Render Canvas (Always accurate replace)
      const canvas = await renderPosterCanvas(
        img,
        targetUrl,
        computedCrop,
        detection.qrX,
        detection.qrY,
        detection.qrSize
      );

      if (!canvas) {
        return {
          ...item,
          status: 'error',
          errorMessage: 'Không thể tạo bản vẽ canvas',
        };
      }

      // Preview DataURL (PNG lossless)
      const previewDataUrl = canvas.toDataURL('image/png');

      // Share blob (JPEG 90%)
      const codeTag = detection.extractedCode || 'Catalog';
      const shareFileName = `Poster_${codeTag}_ThuongSon.jpg`;
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
        targetProductUrl: targetUrl,
        shareFile: shareFile && shareBlob ? { file: shareFile, blob: shareBlob } : null,
      };
    } catch (err: unknown) {
      console.error('Lỗi xử lý poster item:', err);
      return {
        ...item,
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Lỗi không xác định',
      };
    }
  }, [baseUrl]);

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

  // Handle file input selection (allows multiple files like Zalo)
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
        targetProductUrl: `${baseUrl}/catalog`,
      };
    });

    const currentLen = items.length;
    setItems((prev) => [...prev, ...newItems]);
    if (currentLen === 0) {
      setActiveIndex(0);
    }
  };

  // Remove a photo from list
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

  // Load sample posters
  const loadSamplePosters = async (urls: string[]) => {
    setDownloadSuccess(false);
    const newItems: PosterItem[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], `sample_${i + 1}.jpg`, { type: 'image/jpeg' });
        newItems.push({
          id: `sample_${Date.now()}_${i}`,
          file,
          fileName: `sample_${i + 1}.jpg`,
          thumbnailUrl: url,
          status: 'pending',
          cropBottom: 8.8,
          qrX: 84.67,
          qrY: 79.35,
          qrSize: 9.20,
          targetProductUrl: `${baseUrl}/catalog`,
        });
      } catch (err) {
        console.warn('Lỗi tải sample poster:', err);
      }
    }

    const currentLen = items.length;
    setItems((prev) => [...prev, ...newItems]);
    if (currentLen === 0) {
      setActiveIndex(0);
    }
  };

  // Download active poster
  const handleDownloadActive = () => {
    if (!activeItem || !activeItem.previewDataUrl) return;

    const codeTag = activeItem.detectedResult?.extractedCode || `Poster_${activeIndex + 1}`;
    const fileName = `Poster_${codeTag}_ThuongSon.png`;

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
      const codeTag = it.detectedResult?.extractedCode || `Poster_${i + 1}`;
      const fileName = `Poster_${codeTag}_ThuongSon.png`;

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
    setShareNotice(`✓ Đã tải trọn bộ ${doneItems.length} poster về thiết bị!`);
    setTimeout(() => setShareNotice(null), 5000);
  };

  // Native Web Share API (Zero-delay for iOS Safari / Android)
  const handleShareActive = () => {
    if (!activeItem || !activeItem.previewDataUrl) return;

    let cached = activeItem.shareFile;
    if (!cached) {
      const codeTag = activeItem.detectedResult?.extractedCode || 'Catalog';
      const fileName = `Poster_${codeTag}_ThuongSon.png`;
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
          setShareNotice('✓ Đã sao chép ảnh vào Clipboard! Dán (Ctrl + V) trực tiếp vào Zalo, Messenger hoặc Zalo PC.');
          setTimeout(() => setShareNotice(null), 6000);
        })
        .catch(() => {
          setShareNotice('Trình duyệt không hỗ trợ bảng chia sẻ. Hãy dùng nút TẢI POSTER VỀ MÁY.');
          setTimeout(() => setShareNotice(null), 7000);
        });
      return;
    }

    setShareNotice('Hãy dùng nút TẢI POSTER VỀ MÁY rồi chia sẻ từ thư mục tải về.');
    setTimeout(() => setShareNotice(null), 7000);
  };

  // Reset all
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
    <div className="min-h-screen bg-[#F5F1EA] text-[#1C1B19] flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-[#044C42] text-white border-b border-[#B85C38] px-4 py-3 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
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
            Cắt đè chuẩn 100%
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-3 sm:p-5 flex flex-col justify-center">
        {/* Hidden Multi-file input with 'multiple' attribute */}
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
          /* State 1: Upload Box & Quick Test */
          <div className="bg-[#FAF8F4] border border-[#D5CDBE] rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1.5">
              <h1 className="font-serif text-xl sm:text-2xl font-semibold text-[#1C1B19]">
                Chế Poster Catalog Tự Động
              </h1>
              <p className="text-xs text-[#6E6254] font-mono">
                Tự động nhận diện mã sản phẩm &amp; cắt đè chân trang Thường Sơn Ceramic chính xác 100%
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
              <div className="space-y-1">
                <span className="text-sm sm:text-base font-semibold text-[#1C1B19] block">
                  Chạm để chọn nhiều ảnh poster cùng lúc
                </span>
                <span className="text-xs text-[#B85C38] font-mono font-medium block">
                  ✓ Hỗ trợ tích chọn 1 hoặc nhiều ảnh như gửi ảnh Zalo
                </span>
                <span className="text-[11px] text-[#8B7C66] font-mono block">
                  Tự động căn chỉnh vị trí cắt đè dải chân trang cũ chuẩn xác từng pixel
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
                  onClick={() => loadSamplePosters(['/samples/poster_sample_1.jpg'])}
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
                  onClick={() => loadSamplePosters(['/samples/poster_sample_2.jpg'])}
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

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => loadSamplePosters(['/samples/poster_sample_1.jpg', '/samples/poster_sample_2.jpg'])}
                  className="text-xs font-mono text-[#044C42] hover:underline cursor-pointer"
                >
                  ⚡ Thử tải cả 2 mẫu cùng lúc (Hàng loạt)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* State 2: Multi-image Manager & Active Preview */
          <div className="bg-[#FAF8F4] border border-[#D5CDBE] rounded-2xl shadow-xl p-3.5 sm:p-5 space-y-3.5">
            {/* Batch Progress Bar (if processing) */}
            {pendingCount > 0 && (
              <div className="px-3 py-2 bg-[#044C42]/10 border border-[#044C42]/20 rounded-xl text-xs font-mono flex items-center justify-between text-[#044C42]">
                <span className="flex items-center gap-2">
                  <Sparkles size={14} className="animate-spin text-[#B85C38]" />
                  Đang quét &amp; chế bản: <strong>{doneCount}/{items.length} ảnh</strong>
                </span>
                <span className="text-[11px] text-[#6E6254]">Tự động xử lý nền</span>
              </div>
            )}

            {/* ZALO-STYLE THUMBNAIL STRIP */}
            <div className="bg-white border border-[#D5CDBE] rounded-xl p-2.5 shadow-sm space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono font-semibold text-[#1C1B19] flex items-center gap-1.5">
                  <Layers size={14} className="text-[#044C42]" />
                  Danh sách ảnh đã chọn ({items.length}):
                </span>
                <span className="text-[11px] font-mono text-[#8B7C66]">
                  Chạm vào ảnh để xem trước
                </span>
              </div>

              {/* Scrollable Horizontal Thumbnails */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 scrollbar-thin">
                {items.map((it, idx) => {
                  const isActive = idx === activeIndex;
                  const isDone = it.status === 'done';
                  const isProc = it.status === 'processing' || it.status === 'pending';
                  const isErr = it.status === 'error';
                  const codeTag = it.detectedResult?.extractedCode || `#${idx + 1}`;

                  return (
                    <div
                      key={it.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative shrink-0 w-16 h-20 sm:w-18 sm:h-22 rounded-lg overflow-hidden border-2 cursor-pointer transition-all select-none ${
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

                      {/* Status badge */}
                      <div className="absolute top-1 left-1">
                        {isDone ? (
                          <div className="w-4 h-4 rounded-full bg-[#044C42] text-white flex items-center justify-center text-[9px] font-bold shadow">
                            ✓
                          </div>
                        ) : isProc ? (
                          <div className="w-4 h-4 rounded-full bg-[#B85C38] text-white flex items-center justify-center shadow">
                            <Sparkles size={10} className="animate-spin" />
                          </div>
                        ) : isErr ? (
                          <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-bold shadow">
                            !
                          </div>
                        ) : null}
                      </div>

                      {/* Delete button on top-right */}
                      <button
                        type="button"
                        onClick={(e) => removeItem(idx, e)}
                        title="Xóa ảnh này"
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                      >
                        ×
                      </button>

                      {/* Bottom Product Code Pill */}
                      <div className="absolute bottom-0 inset-x-0 bg-black/75 px-1 py-0.5 text-[9px] font-mono text-white text-center truncate">
                        {codeTag}
                      </div>
                    </div>
                  );
                })}

                {/* "+ Thêm ảnh" slot at the end */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 w-16 h-20 sm:w-18 sm:h-22 rounded-lg border-2 border-dashed border-[#044C42]/50 hover:border-[#044C42] bg-[#044C42]/5 hover:bg-[#044C42]/10 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-colors"
                >
                  <Plus size={18} className="text-[#044C42]" />
                  <span className="text-[10px] font-mono font-medium text-[#044C42] leading-tight">
                    Thêm ảnh
                  </span>
                </button>
              </div>
            </div>

            {/* Active Item Detection Information */}
            {activeItem && (
              <div className="px-3.5 py-2 bg-[#044C42]/10 border border-[#044C42]/20 rounded-xl text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-[#044C42] font-semibold">
                  <span className="flex items-center gap-1.5 truncate">
                    <ShieldCheck size={16} className="shrink-0" />
                    {activeItem.detectedResult?.matchedProduct ? (
                      <>Đã nhận diện: <span className="font-bold text-[#B85C38]">{activeItem.detectedResult.matchedProduct.code}</span></>
                    ) : activeItem.detectedResult?.extractedCode ? (
                      <>Mã phát hiện: <span className="font-bold text-[#B85C38]">{activeItem.detectedResult.extractedCode}</span></>
                    ) : (
                      `Ảnh ${activeIndex + 1}/${items.length}: ${activeItem.fileName}`
                    )}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#044C42] text-white rounded font-normal shrink-0 ml-2">
                    {downloadSuccess ? '✓ Đã tải về' : activeItem.status === 'done' ? '✓ Đã cắt đè chuẩn' : activeItem.status === 'processing' ? 'Đang tạo...' : 'Chờ xử lý'}
                  </span>
                </div>

                {activeItem.detectedResult?.matchedProduct && (
                  <div className="flex items-center justify-between text-[11px] text-[#6E6254] pt-0.5 border-t border-[#044C42]/10">
                    <span className="truncate">{activeItem.detectedResult.matchedProduct.name}</span>
                    <Link
                      href={`/products/${activeItem.detectedResult.matchedProduct.slug}`}
                      target="_blank"
                      className="text-[#044C42] hover:underline flex items-center gap-1 shrink-0 ml-2"
                    >
                      Xem web <ExternalLink size={11} />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Active Poster Main Preview Canvas/Image */}
            <div className="bg-[#1C1B19] p-2 rounded-xl flex items-center justify-center min-h-[350px] max-h-[60vh] overflow-hidden shadow-inner">
              {activeItem?.previewDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={activeItem.previewDataUrl}
                  alt={`Poster ${activeItem.fileName}`}
                  className="max-h-[58vh] max-w-full w-auto h-auto object-contain block rounded shadow select-none"
                />
              ) : (
                <div className="text-white/70 text-xs font-mono py-12 flex flex-col items-center gap-2">
                  <Sparkles size={20} className="animate-spin text-[#FFB088]" />
                  <span>Đang xử lý ảnh ({activeIndex + 1}/{items.length})...</span>
                </div>
              )}
            </div>

            {/* Action Buttons: Exactly 1 Unified Download Button + 1 Share Button */}
            <div className="space-y-2.5 pt-1">
              {/* Single Unified Download Button */}
              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  disabled={isDownloadingAll || doneCount === 0}
                  className="w-full py-3.5 px-4 bg-[#044C42] hover:bg-[#003831] text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  <Download size={16} />
                  {isDownloadingAll ? 'ĐANG TẢI LẦN LƯỢT CÁC POSTER...' : `TẢI TẤT CẢ POSTER VỀ MÁY (${doneCount}/${items.length} ẢNH)`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownloadActive}
                  disabled={!activeItem?.previewDataUrl}
                  className="w-full py-3.5 px-4 bg-[#044C42] hover:bg-[#003831] text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  <Download size={16} />
                  TẢI POSTER VỀ MÁY (GỐC 100%)
                </button>
              )}

              {/* Native Share Button */}
              <button
                type="button"
                onClick={handleShareActive}
                disabled={!activeItem?.previewDataUrl}
                className="w-full py-3 px-4 bg-white hover:bg-[#F5F1EA] text-[#044C42] border border-[#044C42] rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                <Share2 size={16} className="text-[#044C42]" />
                CHIA SẺ POSTER (ZALO, TIN NHẮN, LƯU ẢNH)
              </button>

              {/* Secondary option if multiple: download only active item */}
              {items.length > 1 && (
                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={handleDownloadActive}
                    disabled={!activeItem?.previewDataUrl}
                    className="text-[11px] font-mono text-[#044C42] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <Download size={12} />
                    Hoặc chỉ tải riêng ảnh đang chọn ({activeItem?.detectedResult?.extractedCode || `Ảnh ${activeIndex + 1}`})
                  </button>
                </div>
              )}

              {/* Share feedback notice */}
              {shareNotice && (
                <div className="p-3 bg-[#044C42]/10 border border-[#044C42]/30 rounded-xl text-xs font-mono text-[#044C42] text-center leading-relaxed">
                  {shareNotice}
                </div>
              )}

              {/* Reset / Clear All */}
              <button
                type="button"
                onClick={handleResetAll}
                className="w-full py-2 px-4 text-[#8B7C66] hover:text-[#1C1B19] text-center font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer pt-0.5"
              >
                <RefreshCw size={12} /> Xóa tất cả &amp; Chế loạt poster mới
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
