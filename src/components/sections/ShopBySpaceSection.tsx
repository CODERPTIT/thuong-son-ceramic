'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { SPACES } from '@/data/mockData';

export default function ShopBySpaceSection() {
  return (
    <section id="khong-gian" className="py-14 sm:py-20 md:py-36 bg-[#F5F1EA] border-b border-[#D5CDBE]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-16 gap-4 sm:gap-6">
          <div>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#8B7C66] block mb-2 sm:mb-3">
              — KHÔNG GIAN SỬ DỤNG —
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-[#1C1B19]">
              Bắt Đầu Từ Căn Phòng Bạn Hoàn Thiện
            </h2>
          </div>
          <Link
            href="/spaces/living-room"
            className="btn btn-ghost text-xs self-start md:self-auto"
          >
            Xem Đủ 6 Không Gian
          </Link>
        </div>

        {/* 2-Column / Editorial Masonry Space Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {SPACES.map((space, idx) => {
            const isWide = idx === 0 || idx === 3;
            return (
              <Link
                key={space.id}
                href={`/spaces/${space.slug}`}
                className="group flex flex-col bg-[#FAF8F4] border border-[#D5CDBE] hover:border-[#B85C38] transition-all duration-300"
              >
                {/* Image */}
                <div className={`relative ${isWide ? 'aspect-[16/11]' : 'aspect-[4/3]'} overflow-hidden bg-[#EBE5DA]`}>
                  <Image
                    src={space.heroImage}
                    alt={space.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 right-3 bg-[#1C1B19]/80 backdrop-blur-sm text-[#F5F1EA] text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider">
                    {space.productCount} mã
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#B85C38] block mb-1">
                      {space.hint}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1C1B19] group-hover:text-[#B85C38] transition-colors mb-2 sm:mb-3">
                      {space.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#1C1B19]/70 line-clamp-2 leading-relaxed font-light mb-4 sm:mb-6">
                      {space.tagline}
                    </p>
                  </div>

                  <div className="pt-3.5 sm:pt-4 border-t border-[#D5CDBE]/60 flex items-center justify-between text-xs font-mono text-[#8B7C66]">
                    <span>Khổ gạch: {space.recommendedSizes[0]}</span>
                    <span className="text-[#B85C38] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Khám phá <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
