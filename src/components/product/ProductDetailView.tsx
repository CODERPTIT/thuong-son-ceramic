'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Phone, MessageSquare, Share2, Layers, CheckCircle, QrCode, Mail, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X as CloseIcon, Sparkles, FileImage } from 'lucide-react';
import { Product, Collection } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import ProductQRModal from '@/components/product/ProductQRModal';
import ProductPosterStudioModal from '@/components/product/ProductPosterStudioModal';
import { validateVietnamesePhone } from '@/lib/validation';

// Clean repeated brand prefixes (e.g. "Grand Ceramics Grand Ceramics 800×800" -> "Grand Ceramics 800×800")
function cleanProductName(name: string): string {
  if (!name) return '';
  return name.replace(/^(Grand Ceramics|Apodio|Việt Ý|Viglacera)\s+\1\b/i, '$1');
}

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
  const displayName = useMemo(() => cleanProductName(product.name), [product.name]);

  // Dynamic gallery: Xây dựng danh sách ảnh KHÔNG TRÙNG LẶP, ảnh luôn khớp theo mã sản phẩm
  // Thứ tự ưu tiên: 1/ Phối cảnh không gian (inSpace) — 2/ Face gạch sạch (fullFace) — 3/ Face render (closeUp) — 4/ Studio thumbnail
  const rawGalleryImages: { label: string; src: string; type: string }[] = [];
  const addedSrcs = new Set<string>();

  const addUnique = (label: string, rawSrc?: string, type = '') => {
    if (!rawSrc) return;
    const cleanSrc = sanitizeImageUrl(rawSrc);
    if (!cleanSrc || addedSrcs.has(cleanSrc)) return;
    addedSrcs.add(cleanSrc);
    rawGalleryImages.push({ label, src: cleanSrc, type });
  };

  // 1. Phối cảnh không gian thực tế từ nhà máy
  addUnique('Phối Cảnh Không Gian', product.images.inSpace, 'inSpace');
  // 2. Mặt face gạch sạch (nền trắng clean, dùng face_clean nếu có)
  addUnique('Face Gạch Thực Tế', product.images.fullFace, 'fullFace');
  // 3. Cận cảnh men sứ / face vân thật (face thường, có texture rõ hơn)
  addUnique('Cận Cảnh Men Sứ', product.images.closeUp, 'closeUp');
  // 4. Ảnh studio product (nền trắng, có đóng gói/perspective)
  addUnique('Ảnh Studio Sản Phẩm', product.images.thumbnail, 'thumbnail');

  if (rawGalleryImages.length === 0) {
    addUnique('Ảnh Sản Phẩm', product.images.fullFace || product.images.thumbnail, 'fallback');
  }

  // Tự động loại bỏ ảnh hỏng (404) từ server nhà máy để không bao giờ hiện ảnh lỗi
  const [brokenUrls, setBrokenUrls] = useState<string[]>([]);
  const handleImageError = useCallback((src: string) => {
    if (!src) return;
    setBrokenUrls((prev) => (prev.includes(src) ? prev : [...prev, src]));
  }, []);

  const galleryImages = useMemo(() => {
    const valid = rawGalleryImages.filter((img) => !brokenUrls.includes(img.src));
    return valid.length > 0 ? valid : rawGalleryImages;
  }, [rawGalleryImages, brokenUrls]);

  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [posterModalOpen, setPosterModalOpen] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);

  // Mobile Touch Swipe support (vuốt trái/phải để đổi ảnh, vuốt xuống để đóng lightbox)
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (
    e: React.TouchEvent,
    onSwipeLeft: () => void,
    onSwipeRight: () => void,
    onSwipeDown?: () => void
  ) => {
    if (touchStartX === null || touchStartY === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -40) onSwipeLeft();
      else if (dx > 40) onSwipeRight();
    } else if (onSwipeDown && dy > 70) {
      onSwipeDown();
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxZoomed(false);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setLightboxZoomed(false);
  }, []);

  const lightboxPrev = useCallback(() => {
    setLightboxZoomed(false);
    setLightboxIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
  }, [galleryImages.length]);

  const lightboxNext = useCallback(() => {
    setLightboxZoomed(false);
    setLightboxIndex((i) => (i + 1) % galleryImages.length);
  }, [galleryImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, closeLightbox, lightboxPrev, lightboxNext]);

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
        {/* Breadcrumb Navigation - Responsive & horizontally scrollable on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 sm:mb-8 border-b border-[#D5CDBE]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8B7C66] overflow-x-auto whitespace-nowrap scrollbar-none py-1">
            <Link href="/" className="hover:text-[#1C1B19] shrink-0">Trang chủ</Link>
            <span className="shrink-0 text-[#8B7C66]/50">/</span>
            <Link href="/catalog" className="hover:text-[#1C1B19] shrink-0">Catalog</Link>
            <span className="shrink-0 text-[#8B7C66]/50">/</span>
            <Link href={`/catalog?material=${product.material}`} className="hover:text-[#1C1B19] shrink-0">
              {product.material}
            </Link>
            <span className="shrink-0 text-[#8B7C66]/50">/</span>
            <span className="text-[#1C1B19] truncate max-w-[220px] sm:max-w-[320px] font-medium shrink-0">{displayName}</span>
          </nav>

          <Link
            href="/catalog"
            className="text-xs font-mono uppercase tracking-widest text-[#8B7C66] hover:text-[#B85C38] flex items-center gap-1.5 shrink-0 self-start sm:self-auto py-1"
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
              const safeIdx = activeImage >= galleryImages.length ? 0 : activeImage;
              const currentActive = galleryImages[safeIdx] || galleryImages[0];
              return (
                <>
                  {/* Main image — click to open lightbox, swipe on mobile */}
                  <div
                    className="relative aspect-square sm:aspect-[4/3] lg:aspect-[1/1] bg-[#FAF8F4] border border-[#D5CDBE] overflow-hidden group cursor-zoom-in touch-pan-y"
                    onClick={() => openLightbox(safeIdx)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={(e) =>
                      handleTouchEnd(
                        e,
                        () => setActiveImage((safeIdx + 1) % galleryImages.length),
                        () => setActiveImage((safeIdx - 1 + galleryImages.length) % galleryImages.length)
                      )
                    }
                    title="Nhấn để xem ảnh toàn màn hình & phóng to"
                  >
                    <Image
                      src={currentActive.src}
                      alt={`${displayName} - ${currentActive.label}`}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      onError={() => handleImageError(currentActive.src)}
                    />
                    {/* Image type label */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-[#1C1B19]/90 backdrop-blur-sm text-[#F5F1EA] text-[10px] sm:text-xs font-mono px-2.5 sm:px-3 py-1 uppercase tracking-wider shadow-sm">
                      {currentActive.label}
                    </div>

                    {/* Product code & image count badge */}
                    <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-[#1C1B19]/85 backdrop-blur-sm text-[#F5F1EA] text-[10px] font-mono px-2.5 py-1 flex items-center gap-2 shadow-sm">
                      <span>Mã: {product.code}</span>
                      {galleryImages.length > 1 && (
                        <span className="text-[#B85C38] font-semibold border-l border-white/20 pl-2">
                          {safeIdx + 1}/{galleryImages.length}
                        </span>
                      )}
                    </div>

                    {/* Zoom hint icon (desktop) */}
                    <div className="hidden sm:flex absolute top-4 right-4 bg-white/85 backdrop-blur-sm p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm items-center gap-1 text-[11px] font-mono text-[#1C1B19]">
                      <ZoomIn size={14} /> Phóng to
                    </div>

                    {/* Mobile swipe hint banner (shows subtle indicator) */}
                    {galleryImages.length > 1 && (
                      <div className="sm:hidden absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white/90 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ZoomIn size={11} /> Chạm xem to
                      </div>
                    )}

                    {/* Navigation arrows (show when multiple images) */}
                    {galleryImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImage((safeIdx - 1 + galleryImages.length) % galleryImages.length);
                          }}
                          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-white/85 backdrop-blur-sm p-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:bg-white hover:scale-110 z-10 rounded-full"
                          aria-label="Ảnh trước"
                        >
                          <ChevronLeft size={16} className="text-[#1C1B19]" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImage((safeIdx + 1) % galleryImages.length);
                          }}
                          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-white/85 backdrop-blur-sm p-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:bg-white hover:scale-110 z-10 rounded-full"
                          aria-label="Ảnh tiếp theo"
                        >
                          <ChevronRight size={16} className="text-[#1C1B19]" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail selector: only shows when 2+ distinct images */}
                  {galleryImages.length > 1 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                      {galleryImages.map((img, idx) => (
                        <button
                          key={`${img.type}-${idx}`}
                          onClick={() => { setActiveImage(idx); }}
                          onDoubleClick={() => openLightbox(idx)}
                          className={`relative aspect-square overflow-hidden border-2 transition-all duration-200 ${
                            safeIdx === idx
                              ? 'border-[#B85C38] ring-1 ring-[#B85C38] shadow-md opacity-100'
                              : 'border-[#D5CDBE] opacity-65 hover:opacity-100 hover:border-[#8B7C66]'
                          }`}
                          title={img.label}
                        >
                          <Image
                            src={img.src}
                            alt={img.label}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 30vw, 15vw"
                            onError={() => handleImageError(img.src)}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1C1B19]/85 to-transparent pt-3 pb-1 px-1 text-center">
                            <p className="text-white text-[8px] sm:text-[9px] font-mono leading-tight truncate">{img.label}</p>
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
                {displayName}
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

                  <div className="flex items-center gap-3">
                    {/* Chế bản Poster — icon only */}
                    <button
                      onClick={() => setPosterModalOpen(true)}
                      title="Chế bản poster catalog (đè QR & cắt chân trang)"
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FAF8F4] border border-[#D5CDBE] hover:border-[#B85C38] hover:bg-white text-[#8B7C66] hover:text-[#B85C38] transition-all shadow-sm"
                    >
                      <FileImage size={13} />
                    </button>

                    {/* Share button */}
                    <button
                      onClick={handleShare}
                      className="text-xs font-mono uppercase text-[#8B7C66] hover:text-[#B85C38] flex items-center gap-1.5 transition-colors"
                    >
                      <Share2 size={13} /> {copied ? 'Đã sao chép link!' : 'Chia sẻ mẫu'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Packaging Tables (Thông số kỹ thuật & Quy cách đóng gói) */}
        <div className="mb-24 pt-12 border-t border-[#D5CDBE] space-y-12">
          {/* 1. BẢNG THÔNG SỐ KỸ THUẬT */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-[1px] bg-[#B85C38]" />
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#8B7C66]">
                  THÔNG SỐ KỸ THUẬT
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8B7C66] sm:hidden flex items-center gap-1">
                Vuốt ngang ↔
              </span>
            </div>

            <div className="bg-white border border-[#D5CDBE] overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs font-mono min-w-[600px]">
                <thead>
                  <tr className="bg-[#1C1B19] text-[#F5F1EA] uppercase tracking-wider text-[11px]">
                    <th className="p-3.5 text-center w-16">STT</th>
                    <th className="p-3.5 pl-6">CÁC CHỈ TIÊU</th>
                    <th className="p-3.5 text-center">ĐƠN VỊ</th>
                    <th className="p-3.5 text-center">TIÊU CHUẨN</th>
                    <th className="p-3.5 text-center">KẾT QUẢ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5CDBE]/70">
                  {(product.technicalStandards || [
                    { stt: 1, criterion: 'Độ dày', unit: 'mm', standard: '9.2 ± 0.2', result: '9.2' },
                    { stt: 2, criterion: 'Độ hút nước', unit: '%', standard: '≤ 0.5', result: '0.2' },
                    { stt: 3, criterion: 'Độ chịu mài mòn', unit: 'cấp-vòng', standard: 'I, II, III, IV', result: 'III (900)' },
                    { stt: 4, criterion: 'Độ bền uốn', unit: 'Mpa', standard: '≥ 35', result: '43.77' },
                    { stt: 5, criterion: 'Độ chống bám bẩn', unit: 'Loại', standard: '≥ 3', result: '5' },
                  ]).map((item, idx) => (
                    <tr 
                      key={item.stt}
                      className={idx % 2 === 0 ? 'bg-white hover:bg-[#FAF8F4]/80' : 'bg-[#FAF8F4]/60 hover:bg-[#FAF8F4]'}
                    >
                      <td className="p-3.5 text-center font-serif text-[#B85C38] text-sm font-medium">
                        {item.stt}
                      </td>
                      <td className="p-3.5 pl-6 font-medium text-[#1C1B19] text-sm">
                        {item.criterion}
                      </td>
                      <td className="p-3.5 text-center text-[#8B7C66]">
                        {item.unit}
                      </td>
                      <td className="p-3.5 text-center text-[#1C1B19]/80">
                        {item.standard}
                      </td>
                      <td className="p-3.5 text-center font-serif text-[#B85C38] text-base font-semibold">
                        {item.result}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. BẢNG QUY CÁCH ĐÓNG GÓI */}
          {product.packaging && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-[#B85C38]" />
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#8B7C66]">
                    QUY CÁCH ĐÓNG GÓI
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#8B7C66] sm:hidden flex items-center gap-1">
                  Vuốt ngang ↔
                </span>
              </div>

              <div className="bg-white border border-[#D5CDBE] overflow-x-auto shadow-sm">
                <table className="w-full text-center text-xs font-mono min-w-[600px]">
                  <thead>
                    <tr className="bg-[#1C1B19] text-[#F5F1EA] uppercase tracking-wider text-[11px]">
                      <th className="p-3.5">VIÊN / HỘP</th>
                      <th className="p-3.5">M² / HỘP</th>
                      <th className="p-3.5">KG / HỘP (±5%)</th>
                      <th className="p-3.5">HỘP / PALLET</th>
                      <th className="p-3.5">M² / PALLET</th>
                      <th className="p-3.5">KG / PALLET (±5%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-[#FAF8F4]">
                      <td className="p-4 font-serif text-lg text-[#B85C38] font-medium">
                        {product.packaging.vienPerBox ?? '—'}
                      </td>
                      <td className="p-4 font-serif text-lg text-[#B85C38] font-medium">
                        {product.packaging.m2PerBox ?? '—'}
                      </td>
                      <td className="p-4 font-serif text-lg text-[#B85C38] font-medium">
                        {product.packaging.kgPerBox ?? '—'}
                      </td>
                      <td className="p-4 font-serif text-lg text-[#B85C38] font-medium">
                        {product.packaging.boxPerPallet ?? '—'}
                      </td>
                      <td className="p-4 font-serif text-lg text-[#B85C38] font-medium">
                        {product.packaging.m2PerPallet ?? '—'}
                      </td>
                      <td className="p-4 font-serif text-lg text-[#B85C38] font-medium">
                        {product.packaging.kgPerPallet ? product.packaging.kgPerPallet.toLocaleString('vi-VN') : '—'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
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

      {/* Poster Studio Modal */}
      {posterModalOpen && (
        <ProductPosterStudioModal
          product={product}
          onClose={() => setPosterModalOpen(false)}
        />
      )}

      {/* ===== LIGHTBOX FULLSCREEN IMAGE VIEWER ===== */}
      {lightboxOpen && galleryImages.length > 0 && (() => {
        const safeLightboxIdx = lightboxIndex >= galleryImages.length ? 0 : lightboxIndex;
        const currentImg = galleryImages[safeLightboxIdx] || galleryImages[0];

        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Xem ảnh sản phẩm toàn màn hình"
            className="fixed inset-0 z-[70] flex flex-col justify-between items-center bg-[#070605]/98 backdrop-blur-md select-none touch-none overflow-hidden"
            onClick={closeLightbox}
          >
            {/* Top Bar: Code, Label, Zoom Button, Close Button */}
            <div
              className="w-full flex items-center justify-between px-4 sm:px-6 py-3 z-30 shrink-0 bg-gradient-to-b from-black/80 to-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-white/90 font-mono text-xs truncate max-w-[65%]">
                <span className="text-[#B85C38] font-bold shrink-0">{product.code}</span>
                <span className="text-white/40">·</span>
                <span className="truncate">{currentImg.label}</span>
                {galleryImages.length > 1 && (
                  <span className="ml-1 text-white/60 shrink-0 bg-white/10 px-2 py-0.5 rounded-full text-[10px]">
                    {safeLightboxIdx + 1}/{galleryImages.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Dedicated Zoom Toggle Button for mobile & desktop */}
                <button
                  onClick={() => setLightboxZoomed((z) => !z)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-white/90 bg-white/10 hover:bg-white/20 rounded-full transition-colors active:scale-95"
                  aria-label={lightboxZoomed ? 'Thu nhỏ' : 'Phóng to'}
                  title="Bật/tắt phóng to"
                >
                  {lightboxZoomed ? <ZoomOut size={15} /> : <ZoomIn size={15} />}
                  <span className="hidden sm:inline font-sans">{lightboxZoomed ? 'Thu nhỏ (1x)' : 'Phóng to (2x)'}</span>
                </button>

                <button
                  onClick={closeLightbox}
                  aria-label="Đóng ảnh"
                  className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all rounded-full active:scale-95"
                >
                  <CloseIcon size={20} />
                </button>
              </div>
            </div>

            {/* Main Center Image Viewport (Supports Touch Swipe & Zoom Drag) */}
            <div
              className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden touch-pan-y"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, lightboxNext, lightboxPrev, closeLightbox)}
            >
              {/* Prev button */}
              {galleryImages.length > 1 && (
                <button
                  onClick={lightboxPrev}
                  aria-label="Ảnh trước"
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 rounded-full backdrop-blur-md transition-all duration-200 border border-white/10 active:scale-90"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {/* The image — double-click or tap to toggle zoom */}
              <div
                className={`relative max-h-full max-w-full flex items-center justify-center transition-transform duration-300 ${
                  lightboxZoomed
                    ? 'cursor-zoom-out scale-[1.75] sm:scale-[2.1] origin-center z-10'
                    : 'cursor-zoom-in'
                }`}
                style={{
                  maxHeight: 'calc(100vh - 8rem)',
                  maxWidth: 'calc(100vw - 1rem)',
                }}
                onDoubleClick={() => setLightboxZoomed((z) => !z)}
                onClick={(e) => {
                  if (lightboxZoomed) {
                    e.stopPropagation();
                    setLightboxZoomed(false);
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImg.src}
                  alt={`${displayName} - ${currentImg.label}`}
                  style={{
                    maxHeight: 'calc(100vh - 8rem)',
                    maxWidth: 'calc(100vw - 1rem)',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  className="rounded shadow-2xl"
                  draggable={false}
                  onError={() => handleImageError(currentImg.src)}
                />
              </div>

              {/* Next button */}
              {galleryImages.length > 1 && (
                <button
                  onClick={lightboxNext}
                  aria-label="Ảnh tiếp theo"
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 rounded-full backdrop-blur-md transition-all duration-200 border border-white/10 active:scale-90"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            {/* Bottom Bar: Thumbnails & Dynamic Hint */}
            <div
              className="w-full flex flex-col items-center gap-2 px-4 py-3 z-30 shrink-0 bg-gradient-to-t from-black/90 to-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-2 scrollbar-none">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={`lb-thumb-${idx}`}
                      onClick={() => {
                        setLightboxIndex(idx);
                        setLightboxZoomed(false);
                      }}
                      className={`relative w-11 h-11 sm:w-14 sm:h-14 shrink-0 overflow-hidden border-2 transition-all rounded ${
                        safeLightboxIdx === idx
                          ? 'border-[#B85C38] opacity-100 scale-105 shadow-md'
                          : 'border-white/20 opacity-50 hover:opacity-80'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.src}
                        alt={img.label}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(img.src)}
                      />
                    </button>
                  ))}
                </div>
              )}
              <p className="text-white/60 text-[10px] sm:text-xs font-mono text-center">
                <span className="sm:hidden">
                  {lightboxZoomed
                    ? 'Chạm để thu nhỏ · Vuốt xuống để đóng'
                    : '📱 Vuốt ngang đổi ảnh · Chạm 2 lần phóng to · Vuốt xuống đóng'}
                </span>
                <span className="hidden sm:inline">
                  {lightboxZoomed
                    ? 'Double-click để thu nhỏ · Phím Esc để đóng'
                    : 'Phím ← → đổi ảnh · Double-click phóng to 2x · Phím Esc đóng'}
                </span>
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
