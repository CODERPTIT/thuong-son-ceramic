'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Layers, Home, Sparkles } from 'lucide-react';
import { COLLECTIONS, SPACES } from '@/data/mockData';

interface MegaMenuProps {
  type: 'catalog' | 'spaces' | 'collections';
  onClose: () => void;
}

export default function MegaMenu({ type, onClose }: MegaMenuProps) {
  if (type === 'catalog') {
    return (
      <div 
        onMouseLeave={onClose}
        className="absolute top-full left-0 w-full bg-[#FAF8F4] border-b border-[#D5CDBE] shadow-xl transition-all duration-300 z-40 py-8 px-6 lg:px-16"
      >
        <div className="max-w-[1440px] mx-auto grid grid-cols-12 gap-8">
          {/* Column 1: Materials */}
          <div className="col-span-3 border-r border-[#D5CDBE]/60 pr-6">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#8B7C66] mb-4 flex items-center gap-2">
              <Layers size={14} /> Nhóm Vật Liệu
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Marble (Cẩm thạch)', href: '/catalog?material=Marble', count: '142 mẫu' },
                { name: 'Stone (Đá vôi & Bazan)', href: '/catalog?material=Stone', count: '98 mẫu' },
                { name: 'Cement (Bê tông kiến trúc)', href: '/catalog?material=Cement', count: '76 mẫu' },
                { name: 'Wood (Vân gỗ Bắc Âu)', href: '/catalog?material=Wood', count: '45 mẫu' },
                { name: 'Terrazzo (Hạt Venice)', href: '/catalog?material=Terrazzo', count: '32 mẫu' },
                { name: 'Solid Color (Đơn sắc)', href: '/catalog?material=Solid%20Color', count: '24 mẫu' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between text-sm text-[#1C1B19] hover:text-[#B85C38] transition-colors py-1 group"
                  >
                    <span>{item.name}</span>
                    <span className="text-[11px] font-mono text-[#8B7C66] group-hover:text-[#B85C38]">{item.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Surfaces & Sizes */}
          <div className="col-span-3 border-r border-[#D5CDBE]/60 pr-6">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#8B7C66] mb-4">
              Bề Mặt & Kích Thước
            </h4>
            <div className="mb-6">
              <span className="text-xs text-[#8B7C66] uppercase tracking-wider block mb-2 font-mono">Bề mặt</span>
              <div className="flex flex-wrap gap-2">
                {['Matt', 'Polished', 'Honed', 'Textured'].map((s) => (
                  <Link
                    key={s}
                    href={`/catalog?surface=${s}`}
                    onClick={onClose}
                    className="text-xs px-2.5 py-1 bg-white border border-[#D5CDBE] hover:border-[#B85C38] text-[#1C1B19] transition-colors"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs text-[#8B7C66] uppercase tracking-wider block mb-2 font-mono">Kích thước thông dụng</span>
              <ul className="space-y-2 text-sm">
                {['600x1200mm (Khổ chuẩn lớn)', '800x800mm (Vuông phòng khách)', '300x600mm (Ốp tường toilet)', '200x1200mm (Thanh vân gỗ)'].map((size) => (
                  <li key={size}>
                    <Link
                      href={`/catalog?size=${encodeURIComponent(size.split(' ')[0])}`}
                      onClick={onClose}
                      className="text-xs text-[#1C1B19] hover:text-[#B85C38] transition-colors block"
                    >
                      {size}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3: Featured Catalog Teaser */}
          <div className="col-span-6 pl-2">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="relative overflow-hidden bg-[#EBE5DA] group">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                  alt="Slab cẩm thạch khổ lớn"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B19]/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#F5F1EA]/80 mb-1">Xu hướng 2026</span>
                  <h5 className="font-serif text-base font-normal">Slab Cẩm Thạch 1200×2400</h5>
                  <Link
                    href="/catalog?material=Marble"
                    onClick={onClose}
                    className="mt-2 text-xs text-[#B85C38] hover:text-white flex items-center gap-1 font-mono uppercase"
                  >
                    Khám phá ngay <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              <div className="bg-[#EBE5DA]/60 p-6 flex flex-col justify-between border border-[#D5CDBE]">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#B85C38] block mb-2">Grand Atelier</span>
                  <h5 className="font-serif text-lg text-[#1C1B19] leading-snug mb-3">
                    Xem đúng mặt gạch thật trước khi quyết định.
                  </h5>
                  <p className="text-xs text-[#1C1B19]/75 leading-relaxed">
                    Hơn 800+ mã gạch chính hãng từ Monalisa, Apodio, Changyih và Việt Ý SC sẵn sàng tại kho.
                  </p>
                </div>
                <Link
                  href="/catalog"
                  onClick={onClose}
                  className="btn btn-ink text-[10px] py-2.5 px-4 self-start"
                >
                  Mở toàn bộ Catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'spaces') {
    return (
      <div 
        onMouseLeave={onClose}
        className="absolute top-full left-0 w-full bg-[#FAF8F4] border-b border-[#D5CDBE] shadow-xl transition-all duration-300 z-40 py-8 px-6 lg:px-16"
      >
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#D5CDBE]">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#8B7C66] flex items-center gap-2">
              <Home size={14} /> Không gian ứng dụng thực tế
            </h4>
            <Link
              href="/spaces/living-room"
              onClick={onClose}
              className="text-xs text-[#B85C38] hover:underline font-mono uppercase flex items-center gap-1"
            >
              Xem tất cả không gian <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {SPACES.map((space) => (
              <Link
                key={space.id}
                href={`/spaces/${space.slug}`}
                onClick={onClose}
                className="group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#EBE5DA] mb-3">
                  <Image
                    src={space.heroImage}
                    alt={space.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-[#1C1B19]/80 text-[#F5F1EA] text-[10px] font-mono px-1.5 py-0.5">
                    {space.productCount} mã
                  </div>
                </div>
                <h5 className="font-serif text-sm font-medium text-[#1C1B19] group-hover:text-[#B85C38] transition-colors">
                  {space.name}
                </h5>
                <p className="text-xs text-[#8B7C66] line-clamp-1 mt-0.5">
                  {space.hint}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'collections') {
    return (
      <div 
        onMouseLeave={onClose}
        className="absolute top-full left-0 w-full bg-[#FAF8F4] border-b border-[#D5CDBE] shadow-xl transition-all duration-300 z-40 py-8 px-6 lg:px-16"
      >
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#D5CDBE]">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#8B7C66] flex items-center gap-2">
              <Sparkles size={14} /> Bộ Sưu Tập Kiến Trúc Tuyển Chọn
            </h4>
            <Link
              href="/catalog"
              onClick={onClose}
              className="text-xs text-[#B85C38] hover:underline font-mono uppercase flex items-center gap-1"
            >
              Mở toàn bộ bộ sưu tập <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {COLLECTIONS.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                onClick={onClose}
                className="group block bg-white border border-[#D5CDBE] hover:border-[#B85C38] transition-all p-3"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#EBE5DA] mb-3">
                  <Image
                    src={col.heroImage}
                    alt={col.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 bg-[#1C1B19]/85 text-[#F5F1EA] text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider">
                    {col.material}
                  </div>
                </div>
                <h5 className="font-serif text-base font-normal text-[#1C1B19] group-hover:text-[#B85C38] transition-colors">
                  {col.name}
                </h5>
                <p className="text-xs text-[#8B7C66] line-clamp-2 mt-1 leading-relaxed">
                  {col.subtitle}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-[#D5CDBE]/50 pt-2 text-[11px] font-mono text-[#8B7C66]">
                  <span>{col.productIds.length} mẫu tiêu biểu</span>
                  <span className="text-[#B85C38] group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
