import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { BATHROOM_SOLUTIONS } from '@/data/mockData';

export default function BathroomSolutionsSection() {
  return (
    <section id="giai-phap" className="py-24 md:py-36 bg-[#FAF8F4] border-b border-[#D5CDBE]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8B7C66] block mb-3">
              — GIẢI PHÁP ĐỒNG BỘ —
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1C1B19]">
              Hoàn Thiện Không Gian Phòng Tắm
            </h2>
          </div>
          <p className="text-sm text-[#8B7C66] max-w-md font-light leading-relaxed">
            Không dừng lại ở một viên gạch lát sàn. Thường Sơn mang đến gói giải pháp tổng thể gồm thiết bị vệ sinh, sen nhiệt độ và phụ kiện đồng bộ cao cấp.
          </p>
        </div>

        {/* 4 Solution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BATHROOM_SOLUTIONS.map((sol) => (
            <div
              key={sol.id}
              className="bg-white border border-[#D5CDBE] hover:border-[#B85C38] p-6 flex flex-col justify-between transition-all duration-300 group"
            >
              <div>
                <div className="relative aspect-[4/3] overflow-hidden bg-[#EBE5DA] mb-5">
                  <Image
                    src={sol.image}
                    alt={sol.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-[#1C1B19]/80 text-[#F5F1EA] text-[10px] font-mono px-2 py-0.5 uppercase">
                    {sol.category}
                  </div>
                </div>

                <h3 className="font-serif text-lg font-normal text-[#1C1B19] group-hover:text-[#B85C38] transition-colors mb-2">
                  {sol.title}
                </h3>

                <p className="text-xs text-[#1C1B19]/70 leading-relaxed font-light mb-4">
                  {sol.description}
                </p>

                <div className="space-y-1.5 mb-4">
                  {sol.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-[11px] text-[#8B7C66]">
                      <CheckCircle size={12} className="text-[#B85C38] shrink-0" />
                      <span className="line-clamp-1">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#D5CDBE]/60 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#8B7C66]">
                  {sol.brands.slice(0, 2).join(' · ')}
                </span>
                <Link
                  href="/showroom"
                  className="text-xs font-mono text-[#B85C38] hover:underline flex items-center gap-1"
                >
                  Nhận báo giá <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
