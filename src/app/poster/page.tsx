'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Upload, Download, Sparkles, ExternalLink, ArrowLeft, ShieldCheck, Share2, Plus, Layers } from 'lucide-react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import productCodeMapRaw from '@/data/productCodeMap.json';

interface ProductInfo {
  code: string;
  slug: string;
  name: string;
}

const productCodeMap = productCodeMapRaw as unknown as Record<string, ProductInfo>;

// Helper to auto-detect product from filename (case-insensitive)
function detectProductFromFilename(fileName: string): ProductInfo | null {
  if (!fileName) return null;
  const cleanName = fileName.replace(/\.[^/.]+$/, '').toUpperCase();
  const codes = Object.keys(productCodeMap).sort((a, b) => b.length - a.length);
  for (const code of codes) {
    const upperCode = code.toUpperCase();
    if (cleanName.includes(upperCode)) {
      return productCodeMap[code];
    }
  }
  // Check known hashes of sample poster images
  const sampleHashMap: Record<string, string> = {
    'D3B765F6D25E50FE82B23274A5C8679A': 'N88027R',
    '4A3397BC4EDCE0E5B7DEEA34D9463C5A': 'N88007R',
    'CCBF632C308A52EFD593FA358E2E9D60': 'N88069R',
    'E52CBC3955E7366054AD3A8292FA372D': 'EN89012R',
    '580FD28F86731CB28ECC38523D0ADA68': 'N88042R',
    '962C43FF2397B982F90B796423E7C99F': 'P88038R',
    '25E939D33DD9FB1E2DA124E9F368AD32': 'N85027RH',
  };
  for (const [hash, pCode] of Object.entries(sampleHashMap)) {
    if (cleanName.includes(hash)) {
      return productCodeMap[pCode] || null;
    }
  }
  return null;
}


interface DetectionResult {
  found: boolean;
  type: 1 | 2;
  method: 'filename' | 'jsqr' | 'template_fallback';
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
  selectedProduct?: ProductInfo | null;
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

  // 2. Exact footer position with guaranteed minimum height for clear legibility
  const minFooterBarPx = Math.max(44, Math.round(srcH * 0.055));
  const footerBarHeightPx = Math.max(minFooterBarPx, Math.round((srcH * cropBottom) / 100));
  const footerY = srcH - footerBarHeightPx;

  // 3. Generate & Draw System QR Code covering old QR location
  try {
    // Level 'M' (Medium 15% error correction):
    // Standard for marketing/posters. Modules are significantly larger and clearer,
    // allowing phone cameras and Zalo to scan instantly from a distance without failure.
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
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

    // Absolute guarantee: QR container NEVER spills down into footer bar
    if (maskY + maskSize > footerY - 2) {
      maskY = footerY - maskSize - 2;
    }
    if (maskY < 4) maskY = 4;

    // 100% COMPLETE ERASURE OF OLD QR:
    // Erase any and all traces of the original QR code bounding box
    const wipeLeft = Math.max(0, Math.min(maskX, qx - 4));
    const wipeRight = Math.min(finalW, Math.max(maskX + maskSize, qx + qs + 4));
    const wipeTop = Math.max(0, Math.min(maskY, qy - 4));
    const wipeBottom = Math.max(maskY + maskSize, footerY + 2);
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

  // Product search & custom configuration state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Active item
  const activeItem = items[activeIndex] || null;

  // Auto-scan image with Computer Vision (jsQR) + Precise Top-Down Footer Boundary Detection + Filename matching
  const autoDetectAndConfigure = (img: HTMLImageElement, fileName?: string): DetectionResult => {
    const W = img.naturalWidth;
    const H = img.naturalHeight;

    const offscreen = document.createElement('canvas');
    offscreen.width = W;
    offscreen.height = H;
    const ctx = offscreen.getContext('2d');

    // Default: larger, high-visibility QR (14.5% width instead of 9.2%)
    let result: DetectionResult = {
      found: false,
      type: 1,
      method: 'template_fallback',
      qrX: 80.0,
      qrY: 71.5,
      qrSize: 14.5,
      footerYPercent: 91.80,
      extractedCode: null,
      matchedProduct: null,
    };

    // 1. First priority: Check filename for product code (handles posters without pre-existing QR)
    if (fileName) {
      const fileMatch = detectProductFromFilename(fileName);
      if (fileMatch) {
        result.found = true;
        result.method = 'filename';
        result.extractedCode = fileMatch.code;
        result.matchedProduct = fileMatch;
      }
    }

    if (!ctx) return result;

    ctx.drawImage(img, 0, 0, W, H);
    let imgData: ImageData | null = null;
    try {
      imgData = ctx.getImageData(0, 0, W, H);
    } catch {
      imgData = null;
    }

    if (imgData) {
      // 2. Scan with jsQR Computer Vision for pre-existing QR codes
      try {
        let qrCode = jsQR(imgData.data, W, H);
        if (!qrCode) {
          // Sub-region scan: Try cropping bottom-right corner (~35% x ~35%)
          try {
            const cropW = Math.round(W * 0.35);
            const cropH = Math.round(H * 0.35);
            const cropX = W - cropW;
            const cropY = H - cropH;

            // Strategy A: Direct 2x scaled crop (detects EN89012R, N88007R, N88042R, etc.)
            const subCanvas = document.createElement('canvas');
            subCanvas.width = cropW * 2;
            subCanvas.height = cropH * 2;
            const subCtx = subCanvas.getContext('2d');
            if (subCtx) {
              subCtx.drawImage(offscreen, cropX, cropY, cropW, cropH, 0, 0, cropW * 2, cropH * 2);
              const subData = subCtx.getImageData(0, 0, subCanvas.width, subCanvas.height);
              const subQr = jsQR(subData.data, subCanvas.width, subCanvas.height);
              if (subQr) {
                const scale = 2;
                const origX = cropX + subQr.location.topLeftCorner.x / scale;
                const origY = cropY + subQr.location.topLeftCorner.y / scale;
                const origW = (subQr.location.topRightCorner.x - subQr.location.topLeftCorner.x) / scale;
                const origH = (subQr.location.bottomLeftCorner.y - subQr.location.topLeftCorner.y) / scale;
                qrCode = {
                  data: subQr.data,
                  location: {
                    topLeftCorner: { x: origX, y: origY },
                    topRightCorner: { x: origX + origW, y: origY },
                    bottomLeftCorner: { x: origX, y: origY + origH },
                    bottomRightCorner: { x: origX + origW, y: origY + origH },
                  }
                } as any;
              }
            }

            // Strategy B: If still not detected, scan for small boxed QR in the bottom-right corner (strip thin black border & pad white quiet zone)
            if (!qrCode) {
              const borderCanvas = document.createElement('canvas');
              const bCtx = borderCanvas.getContext('2d');
              if (bCtx) {
                for (let boxSize = 40; boxSize <= 64; boxSize += 2) {
                  if (qrCode) break;
                  for (let bx = W - boxSize - 25; bx <= W - boxSize - 2; bx += 3) {
                    if (qrCode) break;
                    for (let by = H - boxSize - 18; by <= H - boxSize - 2; by += 3) {
                      const innerW = boxSize - 4;
                      const innerH = boxSize - 4;
                      const pad = 8;
                      const tw = innerW + pad * 2;
                      const th = innerH + pad * 2;
                      borderCanvas.width = tw * 2;
                      borderCanvas.height = th * 2;
                      bCtx.fillStyle = '#FFFFFF';
                      bCtx.fillRect(0, 0, borderCanvas.width, borderCanvas.height);
                      bCtx.drawImage(offscreen, bx + 2, by + 2, innerW, innerH, pad * 2, pad * 2, innerW * 2, innerH * 2);
                      const bData = bCtx.getImageData(0, 0, borderCanvas.width, borderCanvas.height);
                      const bQr = jsQR(bData.data, borderCanvas.width, borderCanvas.height);
                      if (bQr) {
                        qrCode = {
                          data: bQr.data,
                          location: {
                            topLeftCorner: { x: bx, y: by },
                            topRightCorner: { x: bx + boxSize, y: by },
                            bottomLeftCorner: { x: bx, y: by + boxSize },
                            bottomRightCorner: { x: bx + boxSize, y: by + boxSize },
                          }
                        } as any;
                        break;
                      }
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.warn('Sub-region QR scan error:', e);
          }
        }

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

          let extractedCode: string | null = null;
          const match = 
            qrCode.data.match(/\/san-pham\/([A-Za-z0-9_-]+)/i) ||
            qrCode.data.match(/\/q\/([A-Za-z0-9_-]+)/i) || 
            qrCode.data.match(/\/products\/([A-Za-z0-9_-]+)/i);
          if (match && match[1]) {
            extractedCode = match[1].trim().toUpperCase();
          }

          let matchedProduct: ProductInfo | null = result.matchedProduct;
          if (!matchedProduct && extractedCode) {
            if (productCodeMap[extractedCode]) {
              matchedProduct = productCodeMap[extractedCode];
            } else {
              // Try stripping trailing permalink numbers (e.g. P68131R-2 -> P68131R)
              const stripped = extractedCode.replace(/-\d+$/, '');
              if (productCodeMap[stripped]) {
                matchedProduct = productCodeMap[stripped];
              } else {
                const clean = extractedCode.toLowerCase();
                const found = Object.values(productCodeMap).find(p => 
                  p.code?.toUpperCase() === extractedCode ||
                  p.code?.toUpperCase() === stripped ||
                  p.slug?.toLowerCase() === clean ||
                  p.slug?.toLowerCase().includes(clean)
                );
                if (found) matchedProduct = found;
              }
            }
          }

          result = {
            found: true,
            type: detectedType,
            method: result.matchedProduct ? 'filename' : 'jsqr',
            qrX: (minX / W) * 100,
            qrY: (minY / H) * 100,
            qrSize: finalSizePct,
            footerYPercent: 91.80,
            extractedCode: extractedCode || result.extractedCode,
            matchedProduct,
          };
        }
      } catch (err) {
        console.warn('jsQR scan error:', err);
      }

      // 3. Fallback classification if jsQR did not detect position
      if (result.method === 'template_fallback' || !result.found) {
        const sampleY = Math.round(H * 0.80);
        const sampleX = Math.round(W * 0.50);
        const idx = (sampleY * W + sampleX) * 4;
        const brightness = (imgData.data[idx] + imgData.data[idx + 1] + imgData.data[idx + 2]) / 3;

        const isLandscape = (W / H) > 1.2;
        const defaultSize = isLandscape ? 5.6 : 9.0;
        const isType2 = brightness < 90;
        result.type = isType2 ? 2 : 1;
        result.qrX = isType2 ? 78.0 : 80.0;
        result.qrY = isType2 ? 71.5 : 71.5;
        result.qrSize = defaultSize;
      }

      // 4. Accurate Universal Top-Down Footer Boundary Detection
      try {
        const minSafeY = Math.round(H * 0.88);

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

  // Helper to process a single item (supports manual product override and QR size override)
  const processSingleItem = useCallback(async (
    item: PosterItem,
    overrideProduct?: ProductInfo | null,
    overrideQrSize?: number
  ): Promise<PosterItem> => {
    try {
      // 1. Load image
      let img = item.imgElement;
      if (!img) {
        img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = (e) => reject(e);
          image.src = item.thumbnailUrl;
        });
      }

      // 2. Auto-detect with accurate footer boundary
      const detection = item.detectedResult || autoDetectAndConfigure(img, item.fileName);
      const computedCrop = item.cropBottom !== undefined && item.cropBottom !== 8.8
        ? item.cropBottom
        : parseFloat((100 - detection.footerYPercent).toFixed(2));

      // Effective product: prioritized from manual override -> manual selection -> detected product
      const product = overrideProduct !== undefined
        ? overrideProduct
        : (item.selectedProduct ?? detection.matchedProduct);

      const targetUrl = product
        ? `${baseUrl}/products/${product.slug}`
        : detection.extractedCode
        ? `${baseUrl}/catalog?q=${encodeURIComponent(detection.extractedCode)}`
        : `${baseUrl}/catalog`;

      const defaultSize = (img.naturalWidth / img.naturalHeight > 1.2) ? 5.6 : 9.0;
      // Prioritize: manual override -> detected size from image -> item property -> default
      const currentQrSize = overrideQrSize !== undefined
        ? overrideQrSize
        : (detection.found ? detection.qrSize : (item.qrSize || detection.qrSize || defaultSize));
      const currentQrX = detection.found ? detection.qrX : (item.qrX || detection.qrX || 80.0);
      const currentQrY = detection.found ? detection.qrY : (item.qrY || detection.qrY || 71.5);

      // 3. Render Canvas (Always accurate replace)
      const canvas = await renderPosterCanvas(
        img,
        targetUrl,
        computedCrop,
        currentQrX,
        currentQrY,
        currentQrSize
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
      const codeTag = product?.code || detection.extractedCode || 'Catalog';
      const shareFileName = `Poster_${codeTag}_ThuongSon.jpg`;
      const shareBlob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.90));
      const shareFile = shareBlob ? new File([shareBlob], shareFileName, { type: 'image/jpeg' }) : null;

      return {
        ...item,
        status: 'done',
        imgElement: img,
        previewDataUrl,
        detectedResult: detection,
        selectedProduct: product,
        cropBottom: computedCrop,
        qrX: currentQrX,
        qrY: currentQrY,
        qrSize: currentQrSize,
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

  // Handle manual product selection for active poster
  const handleSelectProductForActive = async (prod: ProductInfo | null) => {
    if (!activeItem) return;
    const updated = await processSingleItem(activeItem, prod, activeItem.qrSize);
    setItems((prev) => prev.map((it, idx) => (idx === activeIndex ? updated : it)));
    setIsSearchingProduct(false);
    setSearchQuery('');
  };

  // Handle manual QR size change for active poster
  const handleChangeActiveQrSize = async (newSize: number) => {
    if (!activeItem) return;
    const updated = await processSingleItem(activeItem, activeItem.selectedProduct, newSize);
    setItems((prev) => prev.map((it, idx) => (idx === activeIndex ? updated : it)));
  };

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
      const preMatched = detectProductFromFilename(file.name);
      return {
        id,
        file,
        fileName: file.name,
        thumbnailUrl,
        status: 'pending',
        selectedProduct: preMatched,
        cropBottom: 8.8,
        qrX: 0,
        qrY: 0,
        qrSize: 0,
        targetProductUrl: preMatched ? `${baseUrl}/products/${preMatched.slug}` : `${baseUrl}/catalog`,
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
          qrX: 0,
          qrY: 0,
          qrSize: 0,
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
          {items.length > 0 ? (
            <button
              type="button"
              onClick={handleResetAll}
              className="flex items-center gap-1.5 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors text-xs font-mono font-medium cursor-pointer"
            >
              <ArrowLeft size={15} /> Thoát về tải ảnh
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-xs font-mono"
            >
              <ArrowLeft size={16} /> Trang Chủ
            </Link>
          )}
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
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-[11px] font-mono text-[#B85C38] hover:text-[#044C42] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <ArrowLeft size={12} /> Thoát về tải ảnh
                </button>
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
            {/* Active Item Detection & Product Selection & QR Size Controls */}
            {activeItem && (
              <div className="bg-white border border-[#D5CDBE] rounded-xl p-3 sm:p-3.5 shadow-sm space-y-2.5 font-mono text-xs">
                {/* Header status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-[#1C1B19]">
                    <ShieldCheck size={16} className={activeItem.selectedProduct || activeItem.detectedResult?.matchedProduct ? 'text-[#044C42]' : 'text-amber-600'} />
                    <span>{`Ảnh ${activeIndex + 1}/${items.length}: ${activeItem.fileName}`}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-[#044C42] text-white rounded font-normal shrink-0 ml-2">
                    {downloadSuccess ? '✓ Đã tải về' : activeItem.status === 'done' ? '✓ Đã cắt đè chuẩn' : activeItem.status === 'processing' ? 'Đang tạo...' : 'Chờ xử lý'}
                  </span>
                </div>

                {/* Linked Product Status & Switcher */}
                {activeItem.selectedProduct || activeItem.detectedResult?.matchedProduct ? (
                  <div className="p-2.5 bg-[#044C42]/5 border border-[#044C42]/20 rounded-lg space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 text-[#044C42]">
                        <span className="font-bold text-white bg-[#044C42] px-1.5 py-0.5 rounded text-[11px]">
                          {(activeItem.selectedProduct || activeItem.detectedResult?.matchedProduct)!.code}
                        </span>
                        <span className="font-medium truncate max-w-[260px] sm:max-w-xs text-[11px] text-[#1C1B19]">
                          {(activeItem.selectedProduct || activeItem.detectedResult?.matchedProduct)!.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <Link
                          href={`/products/${(activeItem.selectedProduct || activeItem.detectedResult?.matchedProduct)!.slug}`}
                          target="_blank"
                          className="text-[#044C42] hover:text-[#B85C38] hover:underline flex items-center gap-0.5 font-medium"
                        >
                          Kiểm tra link web <ExternalLink size={11} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setIsSearchingProduct(!isSearchingProduct)}
                          className="text-[#B85C38] hover:underline font-semibold cursor-pointer"
                        >
                          {isSearchingProduct ? 'Đóng' : 'Đổi sản phẩm'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[11px] flex items-center gap-1 text-amber-800">
                        ⚠️ Chưa nhận diện được mã gạch cho ảnh này
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSearchingProduct(true)}
                        className="text-xs font-bold text-[#044C42] underline cursor-pointer"
                      >
                        Chọn sản phẩm ngay
                      </button>
                    </div>
                    <p className="text-[10px] text-amber-700 leading-tight">
                      Mã QR hiện đang dẫn về trang catalog chung. Hãy chọn đúng sản phẩm bên dưới để mã QR mở thẳng trang chi tiết!
                    </p>
                  </div>
                )}

                {/* Search / Select Product Dropdown */}
                {(isSearchingProduct || (!activeItem.selectedProduct && !activeItem.detectedResult?.matchedProduct)) && (
                  <div className="pt-1.5 border-t border-[#D5CDBE]/60 space-y-2">
                    <label className="block text-[11px] font-semibold text-[#1C1B19]">
                      Tìm &amp; gán mã sản phẩm Thường Sơn:
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Gõ mã (vd: P61245005RMG, N61245005H, F612, 800x800...)"
                      className="w-full px-3 py-1.5 text-xs bg-[#FAF8F4] border border-[#044C42] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#044C42]/30"
                    />

                    {/* Filtered suggestions */}
                    <div className="max-h-40 overflow-y-auto space-y-1 border border-[#D5CDBE] rounded-lg p-1 bg-white">
                      {Object.values(productCodeMap)
                        .filter((p) => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
                        })
                        .slice(0, 8)
                        .map((prod) => (
                          <button
                            key={prod.code}
                            type="button"
                            onClick={() => handleSelectProductForActive(prod)}
                            className="w-full text-left p-1.5 hover:bg-[#044C42]/10 rounded flex items-center justify-between text-xs cursor-pointer transition-colors"
                          >
                            <span className="font-bold text-[#044C42]">{prod.code}</span>
                            <span className="truncate max-w-[280px] text-[10px] text-[#6E6254] ml-2">
                              {prod.name}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* QR Size Quick Control */}
                <div className="pt-2 border-t border-[#D5CDBE]/60 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                  <span className="text-[#6E6254] font-medium">Cỡ mã QR:</span>
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const isLandscape = activeItem.imgElement ? (activeItem.imgElement.naturalWidth / activeItem.imgElement.naturalHeight > 1.2) : true;
                      const baseSize = activeItem.detectedResult?.qrSize || (isLandscape ? 5.6 : 9.0);
                      const currentSize = activeItem.qrSize || baseSize;
                      return [
                        { size: baseSize, label: 'Khớp gốc (Chuẩn)' },
                        { size: Number((baseSize * 1.15).toFixed(2)), label: '+15%' },
                        { size: Number((baseSize * 1.30).toFixed(2)), label: '+30%' },
                      ].map((opt) => {
                        const isCurrent = Math.abs(currentSize - opt.size) < 0.2;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => handleChangeActiveQrSize(opt.size)}
                            className={`px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer transition-all ${
                              isCurrent
                                ? 'bg-[#044C42] text-white font-bold shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
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

              {/* Reset / Exit Button */}
              <button
                type="button"
                onClick={handleResetAll}
                className="w-full py-2.5 px-4 bg-white/90 hover:bg-white border border-[#D5CDBE] hover:border-[#8B7C66] text-[#6E6254] hover:text-[#1C1B19] rounded-xl font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <ArrowLeft size={14} /> Thoát về trang tải ảnh (Chọn lại ảnh khác)
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
