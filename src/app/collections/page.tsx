import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { COLLECTIONS } from '@/data/mockData';

export const metadata: Metadata = {
  title: 'Bộ Sưu Tập Gạch Kiến Trúc Tuyển Chọn | Thường Sơn Ceramic',
  description: 'Khám phá các bộ sưu tập gạch ốp lát cẩm thạch, đá vôi, bê tông và đá mài terrazzo định hình phong cách kiến trúc đương đại.',
};

export default function CollectionsIndexPage() {
  return (
    <div className="py-12 md:py-20 bg-[#F5F1EA]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        {/* Breadcrumb & Masthead */}
        <div className="mb-14 pb-8 border-b border-[#D5CDBE]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8B7C66] mb-3">
            <Link href="/" className="hover:text-[#1C1B19]">Trang chủ</Link>
            <span>/</span>
            <span className="text-[#1C1B19]">Bộ Sưu Tập Kiến Trúc</span>
          </div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-[#B85C38] mb-3">
            <Sparkles size={14} /> CURATED ARCHITECTURAL COLLECTIONS
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#1C1B19] leading-tight mb-4">
            Bộ Sưu Tập Được Tuyển Theo Chất Liệu &amp; Tỷ Lệ
          </h1>
          <p className="text-sm md:text-base text-[#1C1B19]/75 font-light leading-relaxed max-w-3xl">
            Từ cẩm thạch Calacatta vương giả đến sắc độ thô mộc của bê tông kiến trúc và đá núi lửa bazan. Mỗi bộ sưu tập là một câu chuyện riêng biệt về xúc giác và cảm xúc không gian.
          </p>
        </div>

        {/* Collections Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {COLLECTIONS.map((col, idx) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group flex flex-col bg-[#FAF8F4] border border-[#D5CDBE] hover:border-[#B85C38] transition-all duration-300 overflow-hidden"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#EBE5DA]">
                <Image
                  src={col.heroImage}
                  alt={col.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 left-4 bg-[#1C1B19]/85 text-[#F5F1EA] text-[10px] font-mono px-3 py-1 uppercase tracking-widest">
                  Collection 0{idx + 1}
                </div>
                <div className="absolute top-4 right-4 bg-[#1C1B19]/85 text-[#F5F1EA] text-[10px] font-mono px-2 py-1 uppercase tracking-wider">
                  {col.material}
                </div>
              </div>

              <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1C1B19] group-hover:text-[#B85C38] transition-colors mb-2">
                    {col.name}
                  </h2>
                  <p className="text-sm text-[#8B7C66] italic font-serif mb-4">
                    &ldquo;{col.subtitle}&rdquo;
                  </p>
                  <p className="text-xs md:text-sm text-[#1C1B19]/75 font-light leading-relaxed line-clamp-2 mb-6">
                    {col.description}
                  </p>

                  {/* Swatches */}
                  <div className="flex items-center gap-3 mb-6">
                    {col.colorPalette.map((cp) => (
                      <span
                        key={cp.name}
                        className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-inner"
                        style={{ backgroundColor: cp.hex }}
                        title={cp.name}
                      />
                    ))}
                    <span className="text-[11px] font-mono text-[#8B7C66]">
                      {col.colorPalette.length} Tone màu chính
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#D5CDBE]/60 flex items-center justify-between text-xs font-mono text-[#8B7C66]">
                  <span>{col.productIds.length} Mẫu gạch thực tế</span>
                  <span className="text-[#B85C38] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Khám phá bộ sưu tập <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
