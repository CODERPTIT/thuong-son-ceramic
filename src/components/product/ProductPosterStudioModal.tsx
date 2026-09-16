'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Upload, Download, Sparkles, Sliders, Image as ImageIcon, QrCode, Check, RefreshCw, Scissors, Eye } from 'lucide-react';
import QRCode from 'qrcode';
import { Product } from '@/types';

interface ProductPosterStudioModalProps {
  product: Product;
  onClose: () => void;
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
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Settings for auto-overlay
  // Default values are precision-tuned for Monalisa / Grand catalog posters (matching user's samples)
  const [qrX, setQrX] = useState<number>(84.5); // % from left
  const [qrY, setQrY] = useState<number>(79.5); // % from top
  const [qrSize, setQrSize] = useState<number>(10.2); // % of poster width
  const [cropBottom, setCropBottom] = useState<number>(7.4); // % cut off bottom (removes green footer bar)
  const [footerAction, setFooterAction] = useState<'crop' | 'replace' | 'keep'>('crop');
  const [mobileTab, setMobileTab] = useState<'preview' | 'settings'>('preview');

  // Optional Tile Image Overlay
  const [enableExtraTile, setEnableExtraTile] = useState<boolean>(false);
  const [selectedExtraImage, setSelectedExtraImage] = useState<string>(product.images.fullFace || product.images.thumbnail || '');
  const [tileX, setTileX] = useState<number>(18); // % from left
  const [tileY, setTileY] = useState<number>(44); // % from top
  const [tileWidth, setTileWidth] = useState<number>(26); // % of poster width
  const [tileHeight, setTileHeight] = useState<number>(42); // % of poster height

  // Preview canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setUploadedImageSrc(src);

      const img = new Image();
      img.onload = () => {
        setUploadedImageElement(img);
        setDownloadSuccess(false);
        setMobileTab('preview');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Re-render canvas whenever settings or image change
  const renderCompositeCanvas = useCallback(async (isExport = false): Promise<HTMLCanvasElement | null> => {
    if (!uploadedImageElement) return null;

    const srcW = uploadedImageElement.naturalWidth;
    const srcH = uploadedImageElement.naturalHeight;

    // Calculate crop
    const bottomCutPx = footerAction === 'crop' ? Math.round((srcH * cropBottom) / 100) : 0;
    const finalW = srcW;
    const finalH = srcH - bottomCutPx;

    const canvas = isExport ? document.createElement('canvas') : (canvasRef.current || document.createElement('canvas'));
    canvas.width = finalW;
    canvas.height = finalH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Draw base image
    ctx.drawImage(
      uploadedImageElement,
      0, 0, srcW, finalH,
      0, 0, finalW, finalH
    );

    // 2. If footer action is 'replace', paint Thường Sơn branded bar over the footer
    if (footerAction === 'replace') {
      const footerH = Math.round((srcH * cropBottom) / 100);
      const footerY = finalH - footerH;

      // Dark luxury background
      ctx.fillStyle = '#1C1B19';
      ctx.fillRect(0, footerY, finalW, footerH);

      // Accent gold/terracotta line
      ctx.fillStyle = '#B85C38';
      ctx.fillRect(0, footerY, finalW, Math.max(3, Math.round(srcH * 0.003)));

      // Branding text
      ctx.fillStyle = '#F5F1EA';
      const fontSizeTitle = Math.round(footerH * 0.28);
      ctx.font = `bold ${fontSizeTitle}px Georgia, "Playfair Display", serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('THƯỜNG SƠN CERAMIC', Math.round(finalW * 0.05), footerY + footerH * 0.4);

      ctx.fillStyle = '#D5CDBE';
      const fontSizeSub = Math.round(footerH * 0.17);
      ctx.font = `500 ${fontSizeSub}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText('SỐ 01 THÔN ĐÌNH BẢNG, HOẰNG LỘC, THANH HÓA  ·  HOTLINE: 0916 640 316 - 0912 958 578', Math.round(finalW * 0.05), footerY + footerH * 0.72);

      // Right Tag
      ctx.textAlign = 'right';
      ctx.fillStyle = '#B85C38';
      ctx.font = `bold ${fontSizeSub}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace`;
      ctx.fillText('THUONGSONCERAMIC.VN', Math.round(finalW * 0.95), footerY + footerH * 0.5);
    }

    // 3. Draw Extra Tile Image (Optional)
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

        // Shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = Math.round(tw * 0.08);
        ctx.shadowOffsetX = Math.round(tw * 0.03);
        ctx.shadowOffsetY = Math.round(tw * 0.03);

        ctx.drawImage(tileImg, tx, ty, tw, th);
        ctx.restore();

        // Subtle border around tile
        ctx.strokeStyle = '#D5CDBE';
        ctx.lineWidth = Math.max(1, Math.round(tw * 0.006));
        ctx.strokeRect(tx, ty, tw, th);
      } catch (err) {
        console.warn('Failed to draw extra tile image:', err);
      }
    }

    // 4. Generate & Draw Thường Sơn QR Code over the original QR location
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

      // Clean white background mask covering the old QR code
      const padding = Math.round(qs * 0.03);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qx - padding, qy - padding, qs + padding * 2, qs + padding * 2);

      // Draw the new QR
      ctx.drawImage(qrImg, qx, qy, qs, qs);

      // Subtle fine border around the QR
      ctx.strokeStyle = '#E5E0D8';
      ctx.lineWidth = Math.max(1, Math.round(qs * 0.015));
      ctx.strokeRect(qx - padding, qy - padding, qs + padding * 2, qs + padding * 2);
    } catch (err) {
      console.error('Failed to generate or overlay QR:', err);
    }

    return canvas;
  }, [uploadedImageElement, cropBottom, footerAction, qrX, qrY, qrSize, enableExtraTile, selectedExtraImage, tileX, tileY, tileWidth, tileHeight, productUrl]);

  // Update canvas on parameter change
  useEffect(() => {
    if (uploadedImageElement) {
      renderCompositeCanvas(false);
    }
  }, [uploadedImageElement, renderCompositeCanvas]);

  // One-click Export & Download
  const handleExportDownload = async () => {
    if (!uploadedImageElement) return;
    setIsProcessing(true);

    try {
      const exportCanvas = await renderCompositeCanvas(true);
      if (!exportCanvas) throw new Error('Render failed');

      exportCanvas.toBlob((blob) => {
        if (!blob) return;

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
          setIsProcessing(false);
          setDownloadSuccess(true);
        }, 300);
      }, 'image/png', 1.0);
    } catch (err) {
      console.error('Export error:', err);
      setIsProcessing(false);
    }
  };

  const loadSamplePoster = (url: string) => {
    setUploadedImageSrc(url);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setUploadedImageElement(img);
      setDownloadSuccess(false);
      setMobileTab('preview');
    };
    img.src = url;
  };

  const displayName = product.name.replace(/^(Grand Ceramics|Apodio|Việt Ý|Viglacera)\s+\1\b/i, '$1');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#FAF8F4] w-full max-w-5xl rounded-lg shadow-2xl border border-[#D5CDBE] overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Header Bar */}
        <div className="bg-[#1C1B19] text-[#F5F1EA] px-5 py-3.5 flex items-center justify-between border-b border-[#B85C38]">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-[#B85C38]" />
            <div>
              <h3 className="font-serif text-base sm:text-lg font-medium tracking-wide">
                Chế Bản Poster Catalog Thường Sơn
              </h3>
              <p className="text-[10px] font-mono text-[#D5CDBE]">
                Mã: <span className="text-[#B85C38] font-bold">{product.code}</span> · {displayName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng"
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex lg:hidden bg-[#1C1B19] border-b border-[#D5CDBE]/20 text-xs font-mono">
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors ${
              mobileTab === 'preview'
                ? 'text-[#B85C38] border-b-2 border-[#B85C38] font-bold bg-white/5'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Eye size={14} /> Xem &amp; Tải Về
          </button>
          <button
            onClick={() => setMobileTab('settings')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors ${
              mobileTab === 'settings'
                ? 'text-[#B85C38] border-b-2 border-[#B85C38] font-bold bg-white/5'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sliders size={14} /> Tùy Chỉnh (QR &amp; Cắt)
          </button>
        </div>

        {/* Content Body: Left Control Panel + Right Live Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Panel: Upload & Tuning Controls (5 cols) */}
          <div className={`lg:col-span-5 p-4 sm:p-6 overflow-y-auto border-r border-[#D5CDBE]/70 space-y-5 bg-[#F5F1EA] ${mobileTab === 'settings' ? 'block' : 'hidden lg:block'}`}>
            {/* 1. Upload Button */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1C1B19] font-semibold mb-2">
                1. Tải Lên Ảnh Poster Catalog Gốc
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#B85C38] hover:bg-[#B85C38]/5 transition-colors p-4 text-center rounded flex flex-col items-center justify-center gap-2 group cursor-pointer"
              >
                <Upload size={24} className="text-[#B85C38] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-[#1C1B19]">
                  {uploadedImageSrc ? 'Đổi ảnh poster khác từ máy tính/điện thoại' : 'Nhấn để chọn hoặc kéo thả ảnh poster'}
                </span>
                <span className="text-[10px] text-[#8B7C66] font-mono">
                  Hỗ trợ JPG, PNG chất lượng cao (ảnh catalog từ nhà máy)
                </span>
              </button>

              {/* Quick sample pickers */}
              <div className="mt-3 pt-3 border-t border-[#D5CDBE]/60">
                <span className="text-[10px] font-mono text-[#8B7C66] block mb-1.5 uppercase tracking-wider">
                  Hoặc thử nhanh với 2 ảnh mẫu bạn vừa cung cấp:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => loadSamplePoster('/samples/poster_sample_1.jpg')}
                    className="p-2 bg-white hover:bg-[#FAF8F4] border border-[#D5CDBE] hover:border-[#B85C38] rounded text-left transition-colors flex items-center gap-2 group cursor-pointer shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/samples/poster_sample_1.jpg" alt="Mẫu 1" className="w-7 h-10 object-cover rounded border border-[#E5E0D8]" />
                    <div className="overflow-hidden">
                      <span className="text-[11px] font-medium text-[#1C1B19] block group-hover:text-[#B85C38] truncate">Mẫu 1: Đá Slab</span>
                      <span className="text-[9px] font-mono text-[#8B7C66] block">MP62003</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSamplePoster('/samples/poster_sample_2.jpg')}
                    className="p-2 bg-white hover:bg-[#FAF8F4] border border-[#D5CDBE] hover:border-[#B85C38] rounded text-left transition-colors flex items-center gap-2 group cursor-pointer shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/samples/poster_sample_2.jpg" alt="Mẫu 2" className="w-7 h-10 object-cover rounded border border-[#E5E0D8]" />
                    <div className="overflow-hidden">
                      <span className="text-[11px] font-medium text-[#1C1B19] block group-hover:text-[#B85C38] truncate">Mẫu 2: 6 Face</span>
                      <span className="text-[9px] font-mono text-[#8B7C66] block">Bộ sưu tập</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {uploadedImageElement && (
              <>
                {/* 2. QR Code Overlay Settings */}
                <div className="p-3.5 bg-white border border-[#D5CDBE] rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1C1B19] font-semibold flex items-center gap-1.5">
                      <QrCode size={14} className="text-[#B85C38]" /> Vị trí đè Mã QR
                    </span>
                    <button
                      type="button"
                      onClick={() => { setQrX(84.5); setQrY(79.5); setQrSize(10.2); }}
                      className="text-[10px] font-mono text-[#B85C38] hover:underline flex items-center gap-1"
                      title="Đặt lại vị trí chuẩn cho poster Monalisa / Grand"
                    >
                      <RefreshCw size={10} /> Mặc định chuẩn
                    </button>
                  </div>

                  <div className="space-y-2 text-[11px] font-mono">
                    <div>
                      <div className="flex justify-between text-[#8B7C66]">
                        <span>Sang trái / phải (X)</span>
                        <span className="text-[#1C1B19]">{qrX}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="98"
                        step="0.5"
                        value={qrX}
                        onChange={(e) => setQrX(parseFloat(e.target.value))}
                        className="w-full accent-[#B85C38]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[#8B7C66]">
                        <span>Lên trên / xuống dưới (Y)</span>
                        <span className="text-[#1C1B19]">{qrY}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="98"
                        step="0.5"
                        value={qrY}
                        onChange={(e) => setQrY(parseFloat(e.target.value))}
                        className="w-full accent-[#B85C38]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[#8B7C66]">
                        <span>Kích cỡ ô QR</span>
                        <span className="text-[#1C1B19]">{qrSize}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        step="0.2"
                        value={qrSize}
                        onChange={(e) => setQrSize(parseFloat(e.target.value))}
                        className="w-full accent-[#B85C38]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Footer Bar Action: Crop or Replace */}
                <div className="p-3.5 bg-white border border-[#D5CDBE] rounded space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#1C1B19] font-semibold flex items-center gap-1.5">
                    <Scissors size={14} className="text-[#B85C38]" /> Xử lý thanh chân trang cũ
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setFooterAction('crop')}
                      className={`p-2 border text-center rounded transition-all ${
                        footerAction === 'crop'
                          ? 'border-[#B85C38] bg-[#B85C38]/10 text-[#B85C38] font-bold'
                          : 'border-[#D5CDBE] text-[#6E6254] hover:border-[#8B7C66]'
                      }`}
                    >
                      ✂ Cắt bỏ chân trang
                    </button>
                    <button
                      type="button"
                      onClick={() => setFooterAction('replace')}
                      className={`p-2 border text-center rounded transition-all ${
                        footerAction === 'replace'
                          ? 'border-[#B85C38] bg-[#B85C38]/10 text-[#B85C38] font-bold'
                          : 'border-[#D5CDBE] text-[#6E6254] hover:border-[#8B7C66]'
                      }`}
                    >
                      🏛 Đè Thường Sơn
                    </button>
                  </div>

                  {footerAction !== 'keep' && (
                    <div className="text-[11px] font-mono">
                      <div className="flex justify-between text-[#8B7C66]">
                        <span>Độ dày phần chân trang cần xử lý</span>
                        <span className="text-[#1C1B19]">{cropBottom}%</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="15"
                        step="0.2"
                        value={cropBottom}
                        onChange={(e) => setCropBottom(parseFloat(e.target.value))}
                        className="w-full accent-[#B85C38]"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Optional Extra Tile Overlay */}
                <div className="p-3.5 bg-white border border-[#D5CDBE] rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1C1B19] font-semibold flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-[#B85C38]" /> Ghép ảnh từ web (Tùy chọn)
                    </span>
                    <input
                      type="checkbox"
                      checked={enableExtraTile}
                      onChange={(e) => setEnableExtraTile(e.target.checked)}
                      className="w-4 h-4 accent-[#B85C38]"
                    />
                  </div>

                  {enableExtraTile && (
                    <div className="pt-2 space-y-2 border-t border-[#D5CDBE]/50 text-[11px] font-mono">
                      <p className="text-[#8B7C66]">Chọn ảnh sản phẩm cần ghép vào:</p>
                      <div className="flex gap-2">
                        {product.images.fullFace && (
                          <button
                            type="button"
                            onClick={() => setSelectedExtraImage(product.images.fullFace!)}
                            className={`px-2 py-1 border text-[10px] rounded ${selectedExtraImage === product.images.fullFace ? 'border-[#B85C38] bg-[#B85C38]/10 text-[#B85C38] font-bold' : 'border-[#D5CDBE]'}`}
                          >
                            Mặt Face Sạch
                          </button>
                        )}
                        {product.images.closeUp && (
                          <button
                            type="button"
                            onClick={() => setSelectedExtraImage(product.images.closeUp!)}
                            className={`px-2 py-1 border text-[10px] rounded ${selectedExtraImage === product.images.closeUp ? 'border-[#B85C38] bg-[#B85C38]/10 text-[#B85C38] font-bold' : 'border-[#D5CDBE]'}`}
                          >
                            Cận Cảnh Men
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-[#8B7C66] text-[10px]">Vị trí X: {tileX}%</span>
                          <input type="range" min="0" max="80" step="1" value={tileX} onChange={(e) => setTileX(parseFloat(e.target.value))} className="w-full accent-[#B85C38]" />
                        </div>
                        <div>
                          <span className="text-[#8B7C66] text-[10px]">Vị trí Y: {tileY}%</span>
                          <input type="range" min="0" max="80" step="1" value={tileY} onChange={(e) => setTileY(parseFloat(e.target.value))} className="w-full accent-[#B85C38]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* CTA Button */}
            {uploadedImageElement && (
              <div className="pt-2">
                <button
                  onClick={handleExportDownload}
                  disabled={isProcessing}
                  className="w-full btn btn-clay py-3.5 text-xs flex items-center justify-center gap-2 shadow-lg font-medium tracking-wide disabled:opacity-50"
                >
                  {downloadSuccess ? (
                    <>
                      <Check size={16} /> ĐÃ LƯU POSTER THÀNH CÔNG VỀ MÁY!
                    </>
                  ) : (
                    <>
                      <Download size={16} /> {isProcessing ? 'Đang xuất ảnh 4K...' : 'TẢI POSTER ĐÃ XỬ LÝ VỀ MÁY (GỐC 100%)'}
                    </>
                  )}
                </button>
                <p className="text-[10px] font-mono text-center text-[#8B7C66] mt-2">
                  ✓ Giữ nguyên độ phân giải gốc của ảnh ban đầu · Đè mã QR Thường Sơn chuẩn in ấn
                </p>
              </div>
            )}
          </div>

          {/* Right Panel: Live Canvas Interactive View (7 cols) */}
          <div className={`lg:col-span-7 bg-[#1C1B19] p-3 sm:p-5 flex flex-col items-center justify-center relative min-h-[380px] sm:min-h-[520px] ${mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
            {uploadedImageElement ? (
              <div className="flex flex-col items-center justify-center w-full h-full space-y-3">
                <div className="relative max-h-[60vh] lg:max-h-[72vh] max-w-full overflow-hidden flex items-center justify-center border border-white/10 shadow-2xl rounded">
                  <canvas
                    ref={canvasRef}
                    className="max-h-[60vh] lg:max-h-[72vh] max-w-full w-auto h-auto object-contain block"
                  />
                </div>

                {/* Direct Action Bar on Preview */}
                <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <button
                    onClick={handleExportDownload}
                    disabled={isProcessing}
                    className="w-full btn btn-clay py-3 text-xs flex items-center justify-center gap-2 shadow-lg font-medium tracking-wide disabled:opacity-50"
                  >
                    {downloadSuccess ? (
                      <>
                        <Check size={16} /> ĐÃ LƯU POSTER THÀNH CÔNG VỀ MÁY!
                      </>
                    ) : (
                      <>
                        <Download size={16} /> {isProcessing ? 'Đang xuất ảnh...' : 'LƯU POSTER VỀ MÁY NGAY (ẢNH GỐC)'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileTab('settings')}
                    className="lg:hidden w-full py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white/90 font-mono text-[11px] rounded flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sliders size={13} /> Chỉnh Vị Trí QR / Cắt Chân Trang
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/50 space-y-3 p-8">
                <ImageIcon size={48} className="mx-auto text-white/20" />
                <p className="font-serif text-base text-white/80">
                  Chưa có ảnh poster
                </p>
                <p className="text-xs font-mono text-white/50 max-w-xs mx-auto">
                  Hãy chọn một trong 2 ảnh mẫu ở cột bên trái hoặc tải ảnh poster catalog lên để hệ thống tự động đè QR và cắt chân trang.
                </p>
                <button
                  type="button"
                  onClick={() => setMobileTab('settings')}
                  className="lg:hidden btn btn-clay text-xs py-2 px-4 inline-flex items-center gap-1.5 mt-2"
                >
                  <Upload size={14} /> Chuyển sang tải ảnh
                </button>
              </div>
            )}

            {uploadedImageElement && (
              <div className="w-full flex items-center justify-between text-[10px] font-mono text-white/50 mt-2 px-1">
                <span>✓ Đã cắt bỏ chân trang cũ</span>
                <span>QR: Thường Sơn Ceramic</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
