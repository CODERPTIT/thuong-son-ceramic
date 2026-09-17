'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, Download, QrCode, Loader2, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { Product } from '@/types';

interface ProductQRModalProps {
  product: Product;
  onClose: () => void;
}

function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

export default function ProductQRModal({ product, onClose }: ProductQRModalProps) {
  const [baseUrl, setBaseUrl] = useState('https://thuong-son-ceramic.vercel.app');
  const [generating, setGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [cardDataUrl, setCardDataUrl] = useState('');

  // Target product URL: Luôn ưu tiên dùng domain production chính thức thuong-son-ceramic.vercel.app
  // để khi in QR ra dán vào mẫu gạch hoặc quét bằng điện thoại sẽ mở trực tiếp trang công khai không bị chặn
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      // Nếu là domain chính thức hoặc domain riêng thì dùng, nếu là preview/localhost thì trỏ về production chuẩn
      if (origin.includes('localhost') || origin.includes('git-') || origin.includes('-c456.vercel.app')) {
        setBaseUrl('https://thuong-son-ceramic.vercel.app');
      } else {
        setBaseUrl(origin);
      }
    }
  }, []);

  const productUrl = `${baseUrl}/products/${product.slug}`;

  // Generate the complete printable card with Canvas locally in ultra-sharp 4K / 300+ DPI quality
  const generateCard = useCallback(async (): Promise<string> => {
    // Scale factor for ultra-high resolution (4x supersampling -> 1800 x 2400 px, print-ready 300+ DPI)
    const SCALE = 4;
    const baseW = 450;
    const baseH = 600;
    const W = baseW * SCALE; // 1800px
    const H = baseH * SCALE; // 2400px

    const baseQrSize = 290;
    const qrSize = baseQrSize * SCALE; // 1160px ultra crisp QR matrix

    // 1. Generate QR code as high-res DataURL offline via qrcode library
    const qrDataUrl = await QRCode.toDataURL(productUrl, {
      width: qrSize,
      margin: 1,
      color: {
        dark: '#1C1B19',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    const qrImg = await loadImage(qrDataUrl);

    // 2. Setup Canvas
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // Outer card border
    ctx.strokeStyle = '#E8E3DA';
    ctx.lineWidth = 2 * SCALE;
    ctx.strokeRect(1 * SCALE, 1 * SCALE, W - 2 * SCALE, H - 2 * SCALE);

    // Top accent line (Terracotta luxury)
    ctx.fillStyle = '#B85C38';
    ctx.fillRect(0, 0, W, 7 * SCALE);

    // Store Branding Header
    ctx.fillStyle = '#1C1B19';
    ctx.font = `bold ${24 * SCALE}px Georgia, "Playfair Display", "Times New Roman", serif`;
    ctx.textAlign = 'center';
    ctx.fillText('THƯỜNG SƠN', W / 2, 48 * SCALE);

    ctx.fillStyle = '#8B7C66';
    ctx.font = `600 ${10.5 * SCALE}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace`;
    ctx.letterSpacing = `${1.5 * SCALE}px`;
    ctx.fillText('CERAMIC & SURFACE ATELIER  ·  THUONGSONCERAMIC.VN', W / 2, 68 * SCALE);
    ctx.letterSpacing = '0px';

    // Divider above QR
    ctx.strokeStyle = '#ECE8E1';
    ctx.lineWidth = 1.5 * SCALE;
    ctx.beginPath();
    ctx.moveTo(32 * SCALE, 82 * SCALE);
    ctx.lineTo(W - 32 * SCALE, 82 * SCALE);
    ctx.stroke();

    // QR Image (crisp 1160x1160 centered)
    const qrX = (W - qrSize) / 2;
    const qrY = 98 * SCALE;
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // Divider below QR
    const divider2Y = qrY + qrSize + 16 * SCALE;
    ctx.strokeStyle = '#ECE8E1';
    ctx.beginPath();
    ctx.moveTo(32 * SCALE, divider2Y);
    ctx.lineTo(W - 32 * SCALE, divider2Y);
    ctx.stroke();

    // Product Code (Mono accent)
    const codeY = divider2Y + 28 * SCALE;
    ctx.fillStyle = '#B85C38';
    ctx.font = `bold ${15 * SCALE}px -apple-system, BlinkMacSystemFont, "SF Mono", Menlo, Consolas, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`MÃ: ${product.code}`, W / 2, codeY);

    // Product Name (Truncated cleanly if too long)
    const displayName = product.name.length > 38 ? product.name.slice(0, 36) + '...' : product.name;
    const nameY = codeY + 26 * SCALE;
    ctx.fillStyle = '#1C1B19';
    ctx.font = `bold ${18 * SCALE}px Georgia, "Playfair Display", "Times New Roman", serif`;
    ctx.fillText(displayName, W / 2, nameY);

    // Specs: Dimensions · Surface · Material
    const specsY = nameY + 24 * SCALE;
    const specs = `${product.sizes[0] || 'Kích thước chuẩn'}   ·   ${product.surface || 'Bề mặt cao cấp'}   ·   ${product.material || 'Xương Porcelain'}`;
    ctx.fillStyle = '#6E6254';
    ctx.font = `500 ${12 * SCALE}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(specs, W / 2, specsY);

    // Scanning hint
    const hintY = specsY + 22 * SCALE;
    ctx.fillStyle = '#9C9080';
    ctx.font = `italic ${10 * SCALE}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('Quét mã để tra cứu thông số kỹ thuật & phối cảnh không gian', W / 2, hintY);

    // Footer Bar
    const footerH = 46 * SCALE;
    ctx.fillStyle = '#FBF9F5';
    ctx.fillRect(0, H - footerH, W, footerH);

    ctx.strokeStyle = '#ECE8E1';
    ctx.beginPath();
    ctx.moveTo(0, H - footerH);
    ctx.lineTo(W, H - footerH);
    ctx.stroke();

    ctx.fillStyle = '#6E6254';
    ctx.font = `500 ${10.5 * SCALE}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('Hotline: 0916 640 316  ·  Showroom Hoằng Lộc, Hoằng Hóa, Thanh Hóa', W / 2, H - 18 * SCALE);

    return canvas.toDataURL('image/png');
  }, [product, productUrl]);

  // Pre-generate the card as soon as the modal mounts
  useEffect(() => {
    generateCard()
      .then((url) => setCardDataUrl(url))
      .catch((err) => console.error('Failed to pre-generate card:', err));
  }, [generateCard]);

  // Universal download & mobile save handler
  const handleDownload = async () => {
    setGenerating(true);
    try {
      const dataUrl = cardDataUrl || (await generateCard());
      if (!cardDataUrl) setCardDataUrl(dataUrl);

      const fileName = `QR-ThuongSon-${product.code.replace(/[\s/]/g, '-')}.png`;
      const blob = dataURLtoBlob(dataUrl);

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Option A: Try native Web Share API (native "Save to Photos" dialog on iOS / Android)
        let shared = false;
        if (typeof navigator !== 'undefined' && 'canShare' in navigator && 'share' in navigator) {
          try {
            const file = new File([blob], fileName, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
              });
              shared = true;
              setDownloaded(true);
            }
          } catch (e) {
            console.log('Native share cancelled or failed:', e);
          }
        }

        if (!shared) {
          // Option B: Trigger download directly via Blob URL
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
          }, 200);

          // Also open in new tab so user can touch & hold to save to Photos if browser blocks background downloads
          const win = window.open();
          if (win) {
            win.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Thẻ QR - ${product.code}</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { margin: 0; background: #1C1B19; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; box-sizing: border-box; font-family: sans-serif; }
                    img { max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                    p { color: #D5CDBE; text-align: center; font-size: 13px; margin-top: 18px; line-height: 1.5; }
                  </style>
                </head>
                <body>
                  <img src="${dataUrl}" alt="Thẻ QR ${product.code}">
                  <p>👆 <strong>Chạm &amp; giữ ngón tay vào ảnh</strong><br>chọn <em>"Lưu hình ảnh"</em> để lưu vào Thư Viện ảnh</p>
                </body>
              </html>
            `);
            win.document.close();
          }
          setDownloaded(true);
        }
      } else {
        // Desktop: Clean reliable Blob download
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 200);
        setDownloaded(true);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#1C1B19]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-[360px] sm:max-w-sm shadow-2xl border border-[#D5CDBE] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top accent line */}
        <div className="h-1 bg-[#B85C38]" />

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QrCode size={18} className="text-[#B85C38]" />
              <span className="font-serif text-base text-[#1C1B19] font-medium">Thẻ Mã QR Sản Phẩm</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="p-1 text-[#8B7C66] hover:text-[#B85C38] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Generated Card Preview */}
          <div className="flex justify-center mb-4">
            <div className="p-2 bg-[#FAF8F4] border border-[#D5CDBE] text-center w-full flex flex-col items-center justify-center min-h-[220px]">
              {cardDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={cardDataUrl}
                  alt={'Thẻ QR ' + product.name}
                  width={220}
                  className="mx-auto block shadow-sm border border-[#E5E0D8]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-xs font-mono text-[#8B7C66]">
                  <Loader2 size={24} className="animate-spin text-[#B85C38]" />
                  <span>Đang tạo thẻ QR...</span>
                </div>
              )}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleDownload}
            disabled={generating}
            className="w-full btn btn-clay text-xs py-3 flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm font-medium tracking-wide"
          >
            {generating ? (
              <Loader2 size={15} className="animate-spin" />
            ) : downloaded ? (
              <Check size={15} />
            ) : (
              <Download size={15} />
            )}
            {generating ? 'Đang xử lý ảnh sắc nét 4K...' : downloaded ? 'Đã Tải / Lưu Thẻ QR Thành Công!' : 'Tải Ảnh Thẻ QR (Ultra HD 4K)'}
          </button>


          <p className="text-[10px] font-mono text-[#8B7C66] text-center mt-1 leading-relaxed">
            📱 Mobile: Chạm &amp; giữ ảnh để chọn <em>Lưu hình ảnh vào máy</em>
          </p>
        </div>
      </div>
    </div>
  );
}
