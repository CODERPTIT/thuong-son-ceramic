'use client';

import React, { useRef, useEffect, useState } from 'react';
import { X, Printer, Download, QrCode, Smartphone } from 'lucide-react';
import { Product } from '@/types';

interface ProductQRModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductQRModal({ product, onClose }: ProductQRModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [baseUrl, setBaseUrl] = useState('https://thuongsonceramic.vn');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setBaseUrl(origin.includes('localhost') ? 'https://thuongsonceramic.vn' : origin);
    }
  }, []);

  const productUrl = baseUrl + '/products/' + product.slug;
  const qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=' + encodeURIComponent(productUrl) + '&color=1C1B19&bgcolor=FAF8F4&format=png&margin=12';

  const handlePrint = () => {
    if (!printRef.current) return;
    const html = printRef.current.outerHTML;
    const win = window.open('', '_blank', 'width=500,height=700');
    if (!win) return;
    win.document.write(
      '<!DOCTYPE html><html><head>' +
      '<title>QR - ' + product.code + '</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400&family=JetBrains+Mono:wght@400&family=Manrope:wght@400&display=swap" rel="stylesheet">' +
      '<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#F5F1EA;display:flex;align-items:center;justify-content:center;min-height:100vh}@page{size:90mm 140mm;margin:5mm}</style>' +
      '</head><body>' + html + '</body></html>'
    );
    win.document.close();
    win.onload = () => win.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrSrc;
    link.download = 'QR-ThuongSon-' + product.code.replace(/ /g, '-') + '.png';
    link.target = '_blank';
    link.click();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#1C1B19]/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#FAF8F4] w-full max-w-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-[#D5CDBE]">

        {/* LEFT — Printable QR Card */}
        <div
          ref={printRef}
          className="flex flex-col items-center justify-between bg-[#FAF8F4] p-8 md:p-10 flex-1 border-b md:border-b-0 md:border-r border-[#D5CDBE]"
        >
          {/* Branding */}
          <div className="w-full text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-8 h-8 bg-[#1C1B19] flex items-center justify-center border border-[#B85C38]/40 shrink-0">
                <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
                  <line x1="6" y1="10" x2="34" y2="10" stroke="#F5F1EA" strokeWidth="2.5" strokeLinecap="square" />
                  <line x1="20" y1="10" x2="20" y2="32" stroke="#F5F1EA" strokeWidth="2.5" strokeLinecap="square" />
                  <path d="M28 14C24 13 14 14 14 20C14 26 26 25 26 30C26 33 21 34 16 33" stroke="#B85C38" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-serif text-lg font-medium text-[#1C1B19] leading-none">THƯỜNG SƠN</span>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#8B7C66]">Ceramic &amp; Surface Atelier</span>
          </div>

          {/* QR Code */}
          <div className="relative p-3 bg-white border-2 border-[#1C1B19] shadow-sm">
            <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-2 border-l-2 border-[#B85C38]" />
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-2 border-r-2 border-[#B85C38]" />
            <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-2 border-l-2 border-[#B85C38]" />
            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-2 border-r-2 border-[#B85C38]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt={'QR ' + product.name} width={200} height={200} style={{ display: 'block', imageRendering: 'pixelated' }} />
          </div>

          <p className="text-[10px] font-mono text-[#8B7C66] text-center mt-4 uppercase tracking-[0.18em]">Quét để xem thông số kỹ thuật</p>

          {/* Product Info */}
          <div className="w-full mt-5 pt-5 border-t border-[#D5CDBE] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#8B7C66] uppercase">{product.brand}</span>
              <span className="text-[11px] font-mono text-[#B85C38] font-medium">{product.code}</span>
            </div>
            <h3 className="font-serif text-base text-[#1C1B19]">{product.name}</h3>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[10px] font-mono bg-[#EBE5DA] px-2 py-0.5 text-[#1C1B19]">{product.sizes[0]}</span>
              <span className="text-[10px] font-mono bg-[#EBE5DA] px-2 py-0.5 text-[#1C1B19]">{product.surface}</span>
              <span className="text-[10px] font-mono bg-[#EBE5DA] px-2 py-0.5 text-[#1C1B19]">{product.material}</span>
            </div>
            <p className="text-[9px] font-mono text-[#8B7C66] pt-1">thuongsonceramic.vn · 0916 640 316</p>
          </div>
        </div>

        {/* RIGHT — Instructions & Actions */}
        <div className="flex flex-col p-7 bg-[#1C1B19] text-[#F5F1EA] w-full md:max-w-[260px]">
          <div className="flex justify-end mb-4">
            <button onClick={onClose} aria-label="Dong QR" className="p-1.5 text-[#F5F1EA]/60 hover:text-[#B85C38] transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1">
            <QrCode size={30} className="text-[#B85C38] mb-4" />
            <h3 className="font-serif text-xl font-light text-white mb-2">Mã QR Sản Phẩm</h3>
            <p className="text-xs text-[#F5F1EA]/70 font-light leading-relaxed mb-6">
              Quét bằng camera điện thoại để xem thông số, hình ảnh và liên hệ báo giá — không cần cài app.
            </p>
            <div className="space-y-3.5 text-xs font-mono text-[#F5F1EA]/60 mb-8 border-t border-white/10 pt-5">
              <div className="flex items-start gap-2">
                <Smartphone size={13} className="text-[#B85C38] shrink-0 mt-0.5" />
                <span>Camera iPhone hoặc Android, không cần app</span>
              </div>
              <div className="flex items-start gap-2">
                <Printer size={13} className="text-[#B85C38] shrink-0 mt-0.5" />
                <span>In thẻ QR dán lên mẫu gạch tại showroom</span>
              </div>
              <div className="flex items-start gap-2">
                <Download size={13} className="text-[#B85C38] shrink-0 mt-0.5" />
                <span>Tải ảnh PNG gửi qua Zalo cho khách hàng</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 mb-6">
              <p className="text-[10px] font-mono text-[#B85C38] mb-1 uppercase tracking-wider">Link đích</p>
              <p className="text-[10px] font-mono text-[#F5F1EA]/50 break-all">{'/products/' + product.slug}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={handlePrint} className="w-full btn btn-clay text-xs py-3 flex items-center justify-center gap-2">
              <Printer size={14} /> In Thẻ QR
            </button>
            <button onClick={handleDownload} className="w-full btn btn-ghost text-[#F5F1EA] border-white/20 hover:border-[#B85C38] text-xs py-3 flex items-center justify-center gap-2">
              <Download size={14} /> Tải QR Code (PNG)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
