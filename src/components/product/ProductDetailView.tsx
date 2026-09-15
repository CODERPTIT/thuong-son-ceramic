'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Download, Phone, MessageSquare, Share2, Layers, CheckCircle } from 'lucide-react';
import { Product, Collection } from '@/types';
import ProductCard from '@/components/product/ProductCard';

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
  // Gallery images array
  const galleryImages = [
    { label: 'Face Gạch Thật', src: product.images.fullFace },
    { label: 'Phối Cảnh Không Gian', src: product.images.inSpace || product.images.thumbnail },
    { label: 'Cận Cảnh Men Sứ', src: product.images.closeUp || product.images.thumbnail },
  ];

  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryArea, setInquiryArea] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryLoading(true);
    try {
      await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName,
          phone: inquiryPhone,
          area: inquiryArea,
          productCode: product.code,
          productName: product.name,
        }),
      });
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
            <div className="relative aspect-[4/3] sm:aspect-[1/1] bg-[#FAF8F4] border border-[#D5CDBE] overflow-hidden group">
              <Image
                src={galleryImages[activeImage].src}
                alt={`${product.name} - ${galleryImages[activeImage].label}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-[#1C1B19]/85 text-[#F5F1EA] text-[10px] font-mono px-3 py-1 uppercase tracking-wider">
                {galleryImages[activeImage].label}
              </div>
              <div className="absolute bottom-4 right-4 bg-[#1C1B19]/80 backdrop-blur-sm text-[#F5F1EA] text-[10px] font-mono px-2.5 py-1">
                Mã: {product.code}
              </div>
            </div>

            {/* Thumbnail selector */}
            <div className="grid grid-cols-3 gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={img.label}
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

              {/* Description */}
              <p className="text-sm text-[#1C1B19]/75 font-light leading-relaxed mb-6">
                {product.description}
              </p>

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
                  {/* Download Spec CTA */}
                  <a
                    href={`/catalog`}
                    className="text-xs font-mono uppercase text-[#8B7C66] hover:text-[#B85C38] flex items-center gap-1.5"
                  >
                    <Download size={13} /> Tải Catalogue Kỹ Thuật (PDF)
                  </a>

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
                  Đã Gửi Yêu Cầu Báo Giá Thành Công!
                </h4>
                <p className="text-xs text-[#1C1B19]/75 leading-relaxed max-w-sm mx-auto">
                  Cảm ơn quý khách <strong>{inquiryName}</strong>. Yêu cầu mã gạch <strong>{product.code}</strong> đã được gửi tới chuyên viên Thường Sơn và thông báo về email <strong>nguyenhieu32005@gmail.com</strong>.
                </p>
                <div className="pt-3 flex items-center justify-center gap-3">
                  <a
                    href="https://zalo.me/0916640316"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-clay text-xs flex items-center gap-1.5"
                  >
                    <MessageSquare size={13} /> Chat Zalo Ngay
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setInquiryModalOpen(false);
                      setInquirySuccess(false);
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
                  <label className="block text-[#8B7C66] uppercase mb-1">Số điện thoại / Zalo *</label>
                  <input
                    required
                    type="tel"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="0916 640 316"
                    className="w-full bg-white border border-[#D5CDBE] p-2.5 focus:outline-none focus:border-[#B85C38]"
                  />
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
    </div>
  );
}
