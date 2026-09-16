'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] md:min-h-[94vh] flex flex-col justify-between bg-[#F5F1EA] overflow-hidden border-b border-[#D5CDBE]">
      <div className="max-w-[1440px] w-full mx-auto px-5 lg:px-12 pt-8 md:pt-14 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1">
        {/* Left Column: Architectural Editorial Statement (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-center z-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-[#8B7C66] mb-5">
            <span className="w-6 h-[1px] bg-[#B85C38]" />
            <span>ARCHITECTURAL CERAMIC ATELIER</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-[#1C1B19] leading-[1.08] tracking-tight mb-6">
            Bề mặt định hình <br />
            <em className="serif-italic text-[#8B7C66]">không gian.</em>
          </h1>

          <p className="text-base sm:text-lg text-[#1C1B19]/80 font-light leading-relaxed max-w-lg mb-8">
            Thường Sơn Ceramic tuyển chọn giải pháp gạch ốp lát và vật liệu bề mặt cho nhà ở cao cấp và công trình kiến trúc. Bắt đầu từ không gian thực tế, kiểm tra đúng mặt face gạch và thông số trước khi hoàn thiện.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/catalog" className="btn btn-ink text-xs">
              Khám Phá Catalog
            </Link>
            <Link href="/spaces/living-room" className="btn btn-ghost text-xs">
              Xem Theo Không Gian
            </Link>
          </div>

          {/* Surface index tracker */}
          <div className="mt-8 sm:mt-12 pt-5 sm:pt-6 border-t border-[#D5CDBE] flex items-center justify-between text-[10px] sm:text-xs font-mono text-[#8B7C66] gap-2 sm:gap-4">
            <div>
              <span className="text-[#1C1B19] font-medium block">800+ MÃ</span>
              <span>Được tuyển chọn</span>
            </div>
            <div className="w-[1px] h-7 sm:h-8 bg-[#D5CDBE]" />
            <div>
              <span className="text-[#1C1B19] font-medium block">4 THƯƠNG HIỆU</span>
              <span>Chiến lược hàng đầu</span>
            </div>
            <div className="w-[1px] h-7 sm:h-8 bg-[#D5CDBE]" />
            <div>
              <span className="text-[#1C1B19] font-medium block">SHOWROOM THẬT</span>
              <a
                href="https://maps.google.com/?q=Công+ty+TNHH+Thường+Sơn+Hoằng+Lộc+Thanh+Hóa"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#B85C38] hover:underline transition-colors block"
                title="Mở bản đồ Google Maps chỉ đường"
              >
                Hoằng Lộc, Thanh Hóa ↗
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Real Architectural Visual (7 cols) */}
        <div className="lg:col-span-7 relative h-[320px] sm:h-[480px] lg:h-[680px] w-full bg-[#EBE5DA] overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85"
            alt="Phối cảnh kiến trúc không gian phòng khách sử dụng gạch vân đá cao cấp Thường Sơn Ceramic"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover group-hover:scale-103 transition-transform duration-1000 ease-out"
          />

          {/* Floating Surface Spec Badge */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-auto bg-[#FAF8F4]/95 backdrop-blur-md border border-[#D5CDBE] p-3 sm:p-5 shadow-lg max-w-sm">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#8B7C66] mb-1">
              <span>Specimen: MM48001</span>
              <span className="text-[#B85C38]">Monalisa</span>
            </div>
            <h4 className="font-serif text-xs sm:text-sm font-medium text-[#1C1B19]">
              Aureo Pietra Statuary White
            </h4>
            <div className="text-[11px] sm:text-xs text-[#8B7C66] mt-1 flex items-center justify-between">
              <span>Matt Microcid · 800×1600mm</span>
              <Link
                href="/products/monalisa-aureo-pietra-mm48001"
                className="text-[#B85C38] hover:underline flex items-center gap-0.5 ml-2"
              >
                Xem mặt gạch <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <div className="hidden md:flex items-center justify-center pb-4 text-xs font-mono tracking-widest uppercase text-[#8B7C66] gap-1 animate-pulse">
        <span>Cuộn để khám phá vật liệu</span>
        <ChevronDown size={14} />
      </div>
    </section>
  );
}
