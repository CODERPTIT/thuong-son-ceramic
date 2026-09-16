'use client';

import React, { useEffect, useState } from 'react';
import { X, Download, QrCode, Loader2 } from 'lucide-react';
import { Product } from '@/types';

interface ProductQRModalProps {
  product: Product;
  onClose: () => void;
}

// Load an image cross-origin so we can draw it on Canvas
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Cannot load image: ' + src));
    img.src = src;
  });
}

export default function ProductQRModal({ product, onClose }: ProductQRModalProps) {
  const [baseUrl, setBaseUrl] = useState('https://thuongsonceramic.vn');
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // Use production URL so QR works when scanned after printing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setBaseUrl(origin.includes('localhost') ? 'https://thuongsonceramic.vn' : origin);
    }
  }, []);

  const productUrl = baseUrl + '/products/' + product.slug;
  // High-res QR for canvas rendering (400x400)
  const qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=' + encodeURIComponent(productUrl) + '&color=1C1B19&bgcolor=FFFFFF&format=png&margin=10';
  // Preview QR (smaller, for the modal display)
  const qrPreviewUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(productUrl) + '&color=1C1B19&bgcolor=FAF8F4&format=png&margin=8';

  // Draw the full QR card onto a Canvas and return PNG data URL
  const generateCardImage = async (): Promise<string> => {
    const W = 420;
    const H = 560;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    // --- Background ---
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // --- Top accent bar ---
    ctx.fillStyle = '#B85C38';
    ctx.fillRect(0, 0, W, 5);

    // --- Store header ---
    ctx.fillStyle = '#1C1B19';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('TH\u01af\u1edcNG S\u01a0N', W / 2, 40);

    ctx.fillStyle = '#8B7C66';
    ctx.font = '10px monospace';
    ctx.fillText('CERAMIC & SURFACE ATELIER  ·  thuongsonceramic.vn', W / 2, 58);

    // --- Divider ---
    ctx.strokeStyle = '#E5E0D8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, 70);
    ctx.lineTo(W - 24, 70);
    ctx.stroke();

    // --- QR Code image ---
    const qrImg = await loadImage(qrApiUrl);
    const qrSize = 340;
    const qrX = (W - qrSize) / 2;
    const qrY = 82;
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // --- Divider below QR ---
    ctx.strokeStyle = '#E5E0D8';
    ctx.beginPath();
    ctx.moveTo(24, qrY + qrSize + 12);
    ctx.lineTo(W - 24, qrY + qrSize + 12);
    ctx.stroke();

    // --- Product info ---
    const infoY = qrY + qrSize + 34;

    // Code (clay color)
    ctx.fillStyle = '#B85C38';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(product.code, W / 2, infoY);

    // Name (truncated)
    const name = product.name.length > 45 ? product.name.slice(0, 42) + '...' : product.name;
    ctx.fillStyle = '#1C1B19';
    ctx.font = '15px Georgia, serif';
    ctx.fillText(name, W / 2, infoY + 22);

    // Specs row
    const specs = product.sizes[0] + '  ·  ' + product.surface + '  ·  ' + product.material;
    ctx.fillStyle = '#8B7C66';
    ctx.font = '11px monospace';
    ctx.fillText(specs, W / 2, infoY + 42);

    // --- Bottom footer ---
    ctx.fillStyle = '#E5E0D8';
    ctx.fillRect(0, H - 36, W, 36);

    ctx.fillStyle = '#8B7C66';
    ctx.font = '10px monospace';
    ctx.fillText('0916 640 316  ·  0912 958 578  ·  Showroom Ho\u1eb1ng L\u1ed9c, Thanh H\u00f3a', W / 2, H - 14);

    return canvas.toDataURL('image/png');
  };

  const handleSaveImage = async () => {
    setGenerating(true);
    try {
      const dataUrl = await generateCardImage();
      setPreviewUrl(dataUrl);

      // Detect mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // First try Web Share API with file (native "Save Image" to Photo Library on iOS / Android)
        let shared = false;
        if (typeof navigator !== 'undefined' && 'canShare' in navigator && 'share' in navigator) {
          try {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const fileName = 'QR-ThuongSon-' + product.code.replace(/ /g, '-') + '.png';
            const file = new File([blob], fileName, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: 'Thẻ QR ' + product.name,
                text: 'Mã QR sản phẩm ' + product.name + ' - Thường Sơn Ceramic',
              });
              shared = true;
            }
          } catch (e) {
            console.log('Web share bypassed or cancelled', e);
          }
        }

        if (!shared) {
          // Fallback: open image in new tab so user can long-press to save to camera roll / gallery
          const win = window.open('', '_blank');
          if (win) {
            win.document.write(
              '<!DOCTYPE html><html><head><title>QR - ' + product.code + '</title>' +
              '<meta name="viewport" content="width=device-width,initial-scale=1">' +
              '<style>body{margin:0;background:#1C1B19;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:16px;box-sizing:border-box;font-family:sans-serif}' +
              'img{max-width:100%;height:auto;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,0.5)}' +
              'p{color:#D5CDBE;text-align:center;font-size:13px;margin-top:16px;line-height:1.5}</style>' +
              '</head><body>' +
              '<img src="' + dataUrl + '" alt="QR ' + product.code + '">' +
              '<p>👆 <strong>Chạm &amp; giữ ngón tay vào ảnh</strong><br>chọn <em>"Lưu hình ảnh"</em> để lưu vào Thư Viện ảnh</p>' +
              '</body></html>'
            );
            win.document.close();
          } else {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'QR-ThuongSon-' + product.code.replace(/ /g, '-') + '.png';
            link.click();
          }
        }
      } else {
        // Desktop: trigger direct PNG download
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'QR-ThuongSon-' + product.code.replace(/ /g, '-') + '.png';
        link.click();
      }
    } catch (err) {
      console.error('QR generation error:', err);
      // Fallback: download raw QR from API
      const link = document.createElement('a');
      link.href = qrApiUrl;
      link.download = 'QR-' + product.code + '.png';
      link.target = '_blank';
      link.click();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#1C1B19]/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-sm shadow-2xl border border-[#D5CDBE] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top accent line */}
        <div className="h-1 bg-[#B85C38]" />

        <div className="p-6">
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

          {/* QR Preview Card */}
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-[#FAF8F4] border border-[#D5CDBE] text-center w-full flex flex-col items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl || qrPreviewUrl}
                alt={'QR ' + product.name}
                width={180}
                height={180}
                className="mx-auto block"
              />
            </div>
          </div>

          {/* Product info below QR */}
          <div className="text-center mb-5 space-y-1">
            <p className="text-[11px] font-mono text-[#B85C38] uppercase tracking-wider font-semibold">
              {product.code}
            </p>
            <h3 className="font-serif text-sm text-[#1C1B19] leading-snug line-clamp-2">
              {product.name}
            </h3>
            <p className="text-[10px] font-mono text-[#8B7C66]">
              {product.brand} · {product.sizes[0]} · {product.surface}
            </p>
            <p className="text-[10px] font-mono text-[#8B7C66] pt-1">
              Thường Sơn Ceramic · Hotline: 0916 640 316
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={handleSaveImage}
            disabled={generating}
            className="w-full btn btn-clay text-xs py-3 flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
          >
            {generating ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {generating ? 'Đang tạo thẻ ảnh...' : 'Lưu Ảnh Thẻ QR (PNG)'}
          </button>

          <p className="text-[10px] font-mono text-[#8B7C66] text-center mt-2.5 leading-relaxed">
            📱 Mobile: Chạm giữ ngón tay vào ảnh → Lưu vào Thư Viện ảnh
          </p>
        </div>
      </div>
    </div>
  );
}
