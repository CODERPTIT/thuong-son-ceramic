import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function EditorialStorySection() {
  return (
    <section className="py-24 md:py-36 bg-[#F5F1EA] border-b border-[#D5CDBE]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Small text column (5 cols) */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center space-y-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#B85C38]">
              — EDITORIAL ARCHITECTURE —
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1C1B19] leading-[1.15]">
              Khi viên gạch đối thoại cùng <em className="serif-italic text-[#8B7C66]">ánh sáng tự nhiên.</em>
            </h2>

            <p className="text-sm md:text-base text-[#1C1B19]/80 font-light leading-relaxed">
              Một kiến trúc sư tài ba từng nói: &ldquo;Ánh sáng là vật liệu xây dựng duy nhất không tốn tiền, nhưng lại đắt giá nhất.&rdquo; Một bề mặt gạch hoàn hảo là bề mặt biết cách đón nhận ánh sáng vào lúc bình minh, làm dịu ánh nắng gay gắt buổi trưa và lưu giữ sự ấm áp lúc hoàng hôn buông xuống.
            </p>

            <p className="text-sm md:text-base text-[#1C1B19]/80 font-light leading-relaxed">
              Trong cuốn cẩm nang kiến trúc của mình, Thường Sơn chia sẻ các nguyên lý phối hợp chất liệu và ánh sáng giúp mỗi ngôi nhà trở thành một tác phẩm nghệ thuật tĩnh lặng.
            </p>

            <div className="pt-4">
              <Link
                href="/journal"
                className="btn btn-ink text-xs inline-flex items-center gap-2"
              >
                Xem Toàn Bộ Cẩm Nang Kiến Trúc <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Large image (7 cols) */}
          <div className="lg:col-span-7 order-1 lg:order-2 relative aspect-[4/3] bg-[#EBE5DA] overflow-hidden group">
            <Image
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80"
              alt="Ánh sáng tự nhiên chiếu rọi trên sàn đá cẩm thạch Ý trong không gian mở"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
            />
            <div className="absolute bottom-4 right-4 bg-[#1C1B19]/85 text-[#F5F1EA] text-[10px] font-mono px-3 py-1.5 uppercase tracking-wider">
              Issue 04 · The Light & Surface Monograph
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
