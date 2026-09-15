import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SPACES } from '@/data/mockData';

export const metadata: Metadata = {
  title: 'Không Gian Ứng Dụng Gạch Kiến Trúc | Thường Sơn Ceramic',
  description: 'Khám phá gạch ốp lát theo từng công năng: phòng khách, phòng tắm, phòng bếp, phòng ngủ, sân ngoài trời và sảnh thương mại.',
};

export default function SpacesIndexPage() {
  return (
    <div className="py-12 md:py-20 bg-[#F5F1EA]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        {/* Breadcrumb & Masthead */}
        <div className="mb-14 pb-8 border-b border-[#D5CDBE]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8B7C66] mb-3">
            <Link href="/" className="hover:text-[#1C1B19]">Trang chủ</Link>
            <span>/</span>
            <span className="text-[#1C1B19]">Không Gian Ứng Dụng</span>
          </div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-[#B85C38] mb-3">
            <Sparkles size={14} /> TỔ HỢP CÔNG NĂNG KIẾN TRÚC
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#1C1B19] leading-tight mb-4">
            Khám Phá Vật Liệu Theo Không Gian
          </h1>
          <p className="text-sm md:text-base text-[#1C1B19]/75 font-light leading-relaxed max-w-3xl">
            Mỗi căn phòng trong ngôi nhà có một &ldquo;ngôn ngữ ánh sáng&rdquo; và yêu cầu công năng cơ học riêng biệt. Bắt đầu từ công năng thực tế để lựa chọn đúng tỷ lệ kích thước và độ chống trơn trượt hoàn hảo.
          </p>
        </div>

        {/* 6 Spaces Editorial Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {SPACES.map((space, idx) => (
            <Link
              key={space.id}
              href={`/spaces/${space.slug}`}
              className="group flex flex-col bg-[#FAF8F4] border border-[#D5CDBE] hover:border-[#B85C38] transition-all duration-300 overflow-hidden"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#EBE5DA]">
                <Image
                  src={space.heroImage}
                  alt={space.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 left-4 bg-[#1C1B19]/85 text-[#F5F1EA] text-[10px] font-mono px-3 py-1 uppercase tracking-widest">
                  Không gian 0{idx + 1}
                </div>
                <div className="absolute top-4 right-4 bg-[#B85C38] text-white text-[10px] font-mono px-2 py-1 uppercase tracking-wider">
                  {space.productCount} mã tuyển chọn
                </div>
              </div>

              <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#B85C38] block mb-1">
                    {space.hint}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1C1B19] group-hover:text-[#B85C38] transition-colors mb-2">
                    {space.name}
                  </h2>
                  <p className="text-sm text-[#8B7C66] italic font-serif mb-4">
                    &ldquo;{space.tagline}&rdquo;
                  </p>
                  <p className="text-xs md:text-sm text-[#1C1B19]/75 font-light leading-relaxed line-clamp-2 mb-6">
                    {space.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D5CDBE]/60 flex items-center justify-between text-xs font-mono text-[#8B7C66]">
                  <span>Khổ khuyên dùng: {space.recommendedSizes[0]}</span>
                  <span className="text-[#B85C38] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Xem chi tiết <ArrowRight size={14} />
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
