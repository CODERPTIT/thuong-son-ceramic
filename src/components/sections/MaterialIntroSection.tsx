import React from 'react';
import Image from 'next/image';

export default function MaterialIntroSection() {
  return (
    <section className="py-24 md:py-36 bg-[#F5F1EA] border-b border-[#D5CDBE]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        {/* Editorial Eyebrow */}
        <div className="text-center mb-12">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#8B7C66]">
            — TRIẾT LÝ VẬT LIỆU BỀ MẶT —
          </span>
        </div>

        {/* Large Typography Pull Quote */}
        <div className="max-w-5xl mx-auto text-center mb-16 md:mb-24">
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-[#1C1B19] leading-[1.18] tracking-tight">
            &ldquo;Vật liệu không chỉ hoàn thiện không gian.{' '}
            <em className="serif-italic text-[#B85C38]">
              Nó định hình cách chúng ta cảm nhận không gian.
            </em>&rdquo;
          </h2>
        </div>

        {/* Two-Column Editorial Craft Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-7 relative aspect-[16/10] bg-[#EBE5DA] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80"
              alt="Mặt cắt phiến đá vôi trầm tích Travertine tự nhiên"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="absolute bottom-3 left-4 text-[10px] font-mono text-[#F5F1EA] uppercase tracking-widest bg-[#1C1B19]/70 px-2 py-1">
              Fig. 01 — Bề mặt Travertine Honed tự nhiên
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <h3 className="font-serif text-2xl font-normal text-[#1C1B19] leading-snug">
              Từ cảm quan thị giác đến rung cảm xúc giác
            </h3>
            <p className="text-sm md:text-base text-[#1C1B19]/75 leading-relaxed font-light">
              Mỗi viên gạch khi bước vào ngôi nhà không đơn thuần là một sản phẩm hoàn thiện che phủ lớp bê tông thô. Độ mịn của men sứ matt, sự sâu thẳm của thớ vân cẩm thạch Ý, hay độ nhám trầm mặc của đá núi lửa bazan mang trong mình khả năng điều tiết ánh sáng và nuôi dưỡng xúc giác của con người mỗi ngày.
            </p>
            <p className="text-sm md:text-base text-[#1C1B19]/75 leading-relaxed font-light">
              Tại Thường Sơn, chúng tôi từ chối lối tiếp cận thương mại đại trà. Mọi mã gạch đều được đối chiếu trực tiếp dưới ánh sáng tự nhiên và bối cảnh sống thực trước khi giới thiệu đến kiến trúc sư và gia chủ.
            </p>
            <div className="pt-4 border-t border-[#D5CDBE] flex items-center gap-6 text-xs font-mono text-[#8B7C66]">
              <span>TIÊU CHUẨN XƯƠNG PORCELAIN E &lt; 0.1%</span>
              <span>·</span>
              <span>CÔNG NGHỆ CHÂU ÂU</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
