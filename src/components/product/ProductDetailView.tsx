'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Download, Phone, MessageSquare, Share2, Layers, CheckCircle, QrCode, Mail } from 'lucide-react';
import { Product, Collection } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import ProductQRModal from '@/components/product/ProductQRModal';
import { validateVietnamesePhone } from '@/lib/validation';

// Encode spaces in URL paths for products with spaces in their code
function sanitizeImageUrl(url: string): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    u.pathname = u.pathname.split('/').map(seg => encodeURIComponent(decodeURIComponent(seg))).join('/');
    return u.toString();
  } catch {
    return url;
  }
}

interface ProductDetailViewProps {
  product: Product;
  similarProducts: Product[];
  collection?: Collection;
}

export default function ProductDetailView({
  product,
  similarProducts,
  collection,
}: ProductDetailViewProps) {
  const encodedCode = product.code.replace(/ /g, '%20');
  // Dynamic gallery: Chỉ lấy các ảnh THỰC TẾ có thật và KHÔNG trùng lặp
  const galleryImages: { label: string; src: string }[] = [];
  const addedSrcs = new Set<string>();

  const addUnique = (label: string, rawSrc?: string) => {
    if (!rawSrc) return;
    const cleanSrc = sanitizeImageUrl(rawSrc);
    if (!cleanSrc || addedSrcs.has(cleanSrc)) return;
    addedSrcs.add(cleanSrc);
    galleryImages.push({ label, src: cleanSrc });
  };

  // 1. Mặt face gạch thật
  addUnique('Face Gạch Thật', product.images.fullFace);

  // 2. Phối cảnh không gian thực tế (nếu nhà máy có chụp riêng)
  if (product.images.inSpace) {
    addUnique('Phối Cảnh Không Gian', product.images.inSpace);
  }

  // 3. Ảnh chụp mẫu gạch studio (nếu có và khác face gạch)
  if (product.images.thumbnail) {
    addUnique('Ảnh Mẫu Gạch', product.images.thumbnail);
  }

  // 4. Cận cảnh men sứ / Face 2 (nếu có và khác các ảnh trên)
  if (product.images.closeUp) {
    addUnique('Cận Cảnh Men Sứ', product.images.closeUp);
  }

  // Fallback nếu sản phẩm chỉ có 1 ảnh
  if (galleryImages.length === 0) {
    addUnique('Ảnh Sản Phẩm', product.images.fullFace || product.images.thumbnail);
  }

  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryArea, setInquiryArea] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryResult, setInquiryResult] = useState<{ delivered?: boolean; mailtoUrl?: string; zaloUrl?: string } | null>(null);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra số điện thoại chuẩn 10 số trước khi gửi
    const phoneCheck = validateVietnamesePhone(inquiryPhone);
    if (!phoneCheck.isValid) {
      setPhoneError(phoneCheck.error || 'Số điện thoại không hợp lệ.');
      return;
    }
    setPhoneError('');
    setInquiryLoading(true);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName,
          phone: phoneCheck.formatted,
          area: inquiryArea,
          productCode: product.code,
          productName: product.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhoneError(data.error || 'Có lỗi xảy ra.');
        return;
      }
      setInquiryResult(data.details || null);
      setInquirySuccess(true);
    } catch (err) {
      console.error('Lỗi gửi báo giá:', err);
      setInquirySuccess(true);
    } finally {
      setInquiryLoading(false);
    }
  };

  return (
    <div className="py-10 md:py-16 bg-[#F5F1EA]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#D5CDBE]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8B7C66]">
            <Link href="/" className="hover:text-[#1C1B19]">Trang chủ</Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-[#1C1B19]">Catalog</Link>
            <span>/</span>
            <Link href={`/catalog?material=${product.material}`} className="hover:text-[#1C1B19]">
              {product.material}
            </Link>
            <span>/</span>
            <span className="text-[#1C1B19] truncate max-w-[200px]">{product.name}</span>
          </div>

          <Link
            href="/catalog"
            className="text-xs font-mono uppercase tracking-widest text-[#8B7C66] hover:text-[#B85C38] flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Quay lại catalog
          </Link>
        </div>

        {/* Main 2-Column Product Section (Left Gallery + Right Sticky Info) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start mb-24">
          {/* Left Column: Large Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Active Image Display */}
            {(() => {
              const currentActive = galleryImages[activeImage] || galleryImages[0];
              return (
                <>
                  <div className="relative aspect-[4/3] sm:aspect-[1/1] bg-[#FAF8F4] border border-[#D5CDBE] overflow-hidden group">
                    <Image
                      src={currentActive.src}
                      alt={`${product.name} - ${currentActive.label}`}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-[#1C1B19]/85 text-[#F5F1EA] text-[10px] font-mono px-3 py-1 uppercase tracking-wider">
                      {currentActive.label}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-[#1C1B19]/80 backdrop-blur-sm text-[#F5F1EA] text-[10px] font-mono px-2.5 py-1">
                      Mã: {product.code}
                    </div>
                  </div>

                  {/* Thumbnail selector: chỉ hiển thị nếu sản phẩm có từ 2 ảnh thật khác nhau trở lên */}
                  {galleryImages.length > 1 && (
                    <div className={`grid gap-3 ${
                      galleryImages.length === 2 
                        ? 'grid-cols-2' 
                        : galleryImages.length === 3 
                          ? 'grid-cols-3' 
                          : 'grid-cols-4'
                    }`}>
                      {galleryImages.map((img, idx) => (
                        <button
                          key={`${img.label}-${idx}`}
                          onClick={() => setActiveImage(idx)}
                          className={`relative aspect-[4/3] overflow-hidden border transition-all ${
                            activeImage === idx
                              ? 'border-[#B85C38] ring-1 ring-[#B85C38]'
                              : 'border-[#D5CDBE] opacity-75 hover:opacity-100'
                          }`}
                        >
                          <Image
                            src={img.src}
                            alt={img.label}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute bottom-1 left-1 bg-[#1C1B19]/85 text-white text-[9px] font-mono px-1.5 py-0.5">
                            {img.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Face verification banner */}
            <div className="p-4 bg-[#FAF8F4] border border-[#D5CDBE] flex items-center gap-3 text-xs text-[#1C1B19]/80 font-light">
              <Layers size={18} className="text-[#B85C38] shrink-0" />
              <span>
                <strong>Cam kết Face gạch thực tế:</strong> Sản phẩm sở hữu {product.technicalSpecs.facesCount} mặt face vân ngẫu nhiên khác nhau, triệt tiêu sự lặp vân khi thi công trên diện tích rộng.
              </span>
            </div>
          </div>

          {/* Right Column: Sticky Product Info & Specs (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:sticky lg:top-28">
            <div>
              {/* Brand & Code */}
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#8B7C66] mb-2">
                <span>{product.brand}</span>
                <span className="text-[#B85C38] font-medium">{product.code}</span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1C1B19] leading-tight mb-3">
                {product.name}
              </h1>

              {/* Price */}
              <div className="text-xl font-serif text-[#1C1B19] font-medium mb-6">
                {product.price || 'Liên hệ báo giá theo khối lượng'}
              </div>

              {/* Editorial Description */}
              <div className="text-xs md:text-sm text-[#1C1B19]/80 font-light leading-relaxed mb-6 space-y-3">
                {(() => {
                  const paragraphs = product.description.split('\n').map(p => p.trim()).filter(Boolean);
                  const firstParagraph = paragraphs[0] || product.description;
                  const restParagraphs = paragraphs.slice(1);

                  return (
                    <>
                      <p className="leading-relaxed">{firstParagraph}</p>
                      {restParagraphs.length > 0 && (
                        <>
                          {showFullDesc && (
                            <div className="space-y-3 pt-3 border-t border-[#D5CDBE]/60 text-xs font-light text-[#1C1B19]/85">
                              {restParagraphs.map((para, pIdx) => {
                                const isHeading = para.startsWith('Ưu Điểm') || para.startsWith('Ứng Dụng') || para.startsWith('Đặc Tính');
                                if (isHeading) {
                                  return (
                                    <h4 key={pIdx} className="font-serif font-medium text-sm text-[#1C1B19] pt-2 border-b border-[#D5CDBE]/30 pb-1">
                                      {para}
                                    </h4>
                                  );
                                }
                                return <p key={pIdx} className="leading-relaxed">{para}</p>;
                              })}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowFullDesc(!showFullDesc)}
                            className="text-[#B85C38] hover:underline font-mono text-[11px] uppercase tracking-wider inline-flex items-center gap-1 font-medium pt-1"
                          >
                            {showFullDesc ? '▲ Thu gọn mô tả' : '▼ Xem chi tiết đặc tính & ứng dụng'}
                          </button>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Primary Attributes Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#FAF8F4] border border-[#D5CDBE] mb-6 text-xs font-mono">
                <div>
                  <span className="text-[#8B7C66] uppercase block mb-0.5">Kích thước:</span>
                  <strong className="text-[#1C1B19] font-medium">{product.sizes.join(' · ')}</strong>
                </div>
                <div>
                  <span className="text-[#8B7C66] uppercase block mb-0.5">Bề mặt men:</span>
                  <strong className="text-[#1C1B19] font-medium">{product.surface}</strong>
                </div>
                <div>
                  <span className="text-[#8B7C66] uppercase block mb-0.5">Chất liệu:</span>
                  <strong className="text-[#1C1B19] font-medium">{product.material}</strong>
                </div>
                <div>
                  <span className="text-[#8B7C66] uppercase block mb-0.5">Bộ sưu tập:</span>
                  <Link href={`/collections/${product.collectionSlug}`} className="text-[#B85C38] hover:underline">
                    {product.collection}
                  </Link>
                </div>
              </div>

              {/* Use cases tags */}
              <div className="mb-8">
                <span className="text-xs uppercase font-mono tracking-wider text-[#8B7C66] block mb-2">
                  Phù hợp cho không gian:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.useCases.map((uc) => (
                    <span
                      key={uc}
                      className="text-xs px-2.5 py-1 bg-white border border-[#D5CDBE] text-[#1C1B19]"
                    >
                      {uc}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <button
                  onClick={() => setInquiryModalOpen(true)}
                  className="btn btn-ink w-full py-3.5 text-xs text-center"
                >
                  Yêu Cầu Báo Giá &amp; Xem Mẫu Thật
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="https://zalo.me/0916640316"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-clay text-xs flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={13} /> Chat Zalo
                  </a>
                  <a
                    href="tel:0916640316"
                    className="btn btn-ghost text-xs flex items-center justify-center gap-1.5"
                  >
                    <Phone size={13} /> 0916 640 316
                  </a>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {/* QR Code button */}
                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="text-xs font-mono uppercase text-[#8B7C66] hover:text-[#B85C38] flex items-center gap-1.5 transition-colors"
                  >
                    <QrCode size={13} /> Tải Mã QR Sản Phẩm
                  </button>

                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className="text-xs font-mono uppercase text-[#8B7C66] hover:text-[#B85C38] flex items-center gap-1.5"
                  >
                    <Share2 size={13} /> {copied ? 'Đã sao chép link!' : 'Chia sẻ mẫu'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Properties Table (Bảng thông số kỹ thuật chi tiết) */}
        <div className="mb-24 pt-12 border-t border-[#D5CDBE]">
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1C1B19] mb-6">
            Bảng Thông Số Kỹ Thuật (Technical Specifications)
          </h2>
          <div className="bg-white border border-[#D5CDBE] overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <tbody className="divide-y divide-[#D5CDBE]">
                <tr className="bg-[#FAF8F4]/50">
                  <td className="p-4 font-medium text-[#8B7C66] w-1/3">Mã sản phẩm (SKU)</td>
                  <td className="p-4 text-[#1C1B19] font-bold">{product.code}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-[#8B7C66]">Độ dày xương gạch</td>
                  <td className="p-4 text-[#1C1B19]">{product.technicalSpecs.thickness}</td>
                </tr>
                <tr className="bg-[#FAF8F4]/50">
                  <td className="p-4 font-medium text-[#8B7C66]">Độ hút nước (Water Absorption)</td>
                  <td className="p-4 text-[#1C1B19]">{product.technicalSpecs.waterAbsorption}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-[#8B7C66]">Hệ số chống trơn (Slip Resistance)</td>
                  <td className="p-4 text-[#1C1B19]">{product.technicalSpecs.slipResistance}</td>
                </tr>
                <tr className="bg-[#FAF8F4]/50">
                  <td className="p-4 font-medium text-[#8B7C66]">Số lượng mặt Face</td>
                  <td className="p-4 text-[#1C1B19]">{product.technicalSpecs.facesCount} Faces ngẫu nhiên</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-[#8B7C66]">Xuất xứ &amp; Công nghệ</td>
                  <td className="p-4 text-[#1C1B19]">{product.technicalSpecs.origin}</td>
                </tr>
                <tr className="bg-[#FAF8F4]/50">
                  <td className="p-4 font-medium text-[#8B7C66]">Ứng dụng khuyến nghị</td>
                  <td className="p-4 text-[#1C1B19]">{product.technicalSpecs.application}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Related Collection Story Banner */}
        {collection && (
          <div className="mb-24 p-8 md:p-12 bg-[#FAF8F4] border border-[#D5CDBE] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#B85C38] block mb-2">
                — CÙNG BỘ SƯU TẬP —
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1B19] mb-3">
                {collection.name}
              </h3>
              <p className="text-sm text-[#1C1B19]/75 font-light leading-relaxed max-w-xl">
                {collection.description}
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link
                href={`/collections/${collection.slug}`}
                className="btn btn-ink text-xs"
              >
                Khám Phá Toàn Bộ Bộ Sưu Tập
              </Link>
            </div>
          </div>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#D5CDBE]">
              <h3 className="font-serif text-2xl font-light text-[#1C1B19]">
                Sản Phẩm Tương Tự
              </h3>
              <Link
                href={`/catalog?material=${product.material}`}
                className="text-xs font-mono uppercase text-[#B85C38] hover:underline"
              >
                Xem thêm dòng {product.material} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      {inquiryModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#1C1B19]/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-[#FAF8F4] border border-[#D5CDBE] w-full max-w-lg p-6 md:p-8 shadow-2xl relative">
            <h3 className="font-serif text-2xl text-[#1C1B19] mb-1">
              Yêu Cầu Báo Giá &amp; Mẫu Thật
            </h3>
            <p className="text-xs font-mono text-[#8B7C66] mb-6">
              Sản phẩm: {product.name} ({product.code})
            </p>

            {inquirySuccess ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle size={44} className="text-[#B85C38] mx-auto" />
                <h4 className="font-serif text-xl text-[#1C1B19]">
                  Đã Tiếp Nhận Yêu Cầu Báo Giá!
                </h4>
                <div className="text-xs text-[#1C1B19]/75 leading-relaxed max-w-sm mx-auto space-y-2">
                  <p>
                    Cảm ơn quý khách <strong>{inquiryName}</strong>. Yêu cầu mã gạch <strong>{product.code}</strong> đã được ghi nhận vào hệ thống Thường Sơn.
                  </p>
                  {inquiryResult?.delivered ? (
                    <div className="p-2.5 bg-[#FAF8F4] border border-[#3B7A57]/30 text-[#3B7A57] font-mono text-[11px] rounded">
                      ✓ Đã gửi email thông báo trực tiếp tới nguyenhieu32005@gamil.com!
                    </div>
                  ) : (
                    <p className="text-[#8B7C66] text-[11px]">
                      Chuyên viên sẽ liên hệ ngay theo số <strong>{inquiryPhone}</strong>, hoặc quý khách có thể gửi bản vẽ/nhắn tin trực tiếp qua các kênh dưới đây:
                    </p>
                  )}
                </div>
                <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5">
                  <a
                    href={inquiryResult?.zaloUrl || "https://zalo.me/0916640316"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-clay text-xs flex items-center gap-1.5"
                  >
                    <MessageSquare size={13} /> Chat Zalo 0916 640 316
                  </a>
                  {inquiryResult?.mailtoUrl && (
                    <a
                      href={inquiryResult.mailtoUrl}
                      className="btn btn-ink text-xs flex items-center gap-1.5"
                    >
                      <Mail size={13} /> Gửi Trực Tiếp Qua Email
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setInquiryModalOpen(false);
                      setInquirySuccess(false);
                      setInquiryResult(null);
                      setInquiryName('');
                      setInquiryPhone('');
                      setInquiryArea('');
                    }}
                    className="btn btn-ghost text-xs py-2 px-4"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-[#8B7C66] uppercase mb-1">Họ và tên *</label>
                  <input
                    required
                    type="text"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="Ví dụ: Anh Tuấn / KTS Nam"
                    className="w-full bg-white border border-[#D5CDBE] p-2.5 focus:outline-none focus:border-[#B85C38]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[#8B7C66] uppercase text-[11px]">Số điện thoại / Zalo (10 số) *</label>
                    <span className="text-[10px] text-[#8B7C66] font-mono">Bắt đầu bằng 03, 05, 07, 08, 09</span>
                  </div>
                  <input
                    required
                    type="tel"
                    maxLength={15}
                    value={inquiryPhone}
                    onChange={(e) => {
                      setInquiryPhone(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    placeholder="Ví dụ: 0916640316"
                    className={`w-full bg-white border p-2.5 text-xs focus:outline-none transition-colors ${
                      phoneError 
                        ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-600' 
                        : 'border-[#D5CDBE] focus:border-[#B85C38]'
                    }`}
                  />
                  {phoneError && (
                    <p className="text-red-600 text-[11px] font-mono mt-1.5 flex items-center gap-1">
                      <span>⚠</span> {phoneError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#8B7C66] uppercase mb-1">Diện tích dự tính (m²)</label>
                  <input
                    type="text"
                    value={inquiryArea}
                    onChange={(e) => setInquiryArea(e.target.value)}
                    placeholder="Ví dụ: 65 m² phòng khách"
                    className="w-full bg-white border border-[#D5CDBE] p-2.5 focus:outline-none focus:border-[#B85C38]"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setInquiryModalOpen(false)}
                    className="btn btn-ghost text-xs py-2 px-4"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={inquiryLoading}
                    className="btn btn-ink text-xs py-2.5 px-6 flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <CheckCircle size={14} /> {inquiryLoading ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalOpen && (
        <ProductQRModal
          product={product}
          onClose={() => setQrModalOpen(false)}
        />
      )}
    </div>
  );
}
