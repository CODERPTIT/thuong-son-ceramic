import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Clock, MessageSquare, Navigation } from 'lucide-react';
import { COMPANY_INFO } from '@/data/mockData';

export default function ShowroomSection() {
  return (
    <section id="showroom" className="py-24 md:py-36 bg-[#1C1B19] text-[#F5F1EA] border-b border-[#2A2825]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Large architectural showroom photo (7 cols) */}
          <div className="lg:col-span-7 relative aspect-[16/10] bg-[#2A2825] overflow-hidden group">
            <Image
              src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80"
              alt="Không gian trưng bày vật liệu gạch thực tế tại Showroom Thường Sơn Hoằng Lộc"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B19]/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-[#D7CEBE]">
              <span>Khu Trưng Bày Slab Khổ Lớn &amp; Bề Mặt Chân Thực</span>
              <span>Hoằng Lộc · Thanh Hóa</span>
            </div>
          </div>

          {/* Showroom Details & CTAs (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#B85C38] block mb-2">
                — SHOWROOM THƯỜNG SƠN —
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
                Chạm Mẫu Thật Trước Khi Chốt
              </h2>
            </div>

            <p className="text-sm md:text-base text-[#F5F1EA]/75 font-light leading-relaxed">
              Công ty TNHH Thường Sơn khuyến khích quý khách ghé thăm showroom hoặc mượn mẫu gạch về đối chiếu với điều kiện ánh sáng thực tế tại công trình. Đội ngũ kỹ thuật của chúng tôi luôn sẵn sàng chuẩn bị trước khay mẫu theo yêu cầu.
            </p>

            {/* Structured details list */}
            <div className="space-y-4 pt-2 border-t border-white/10 text-xs font-mono">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#B85C38] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans text-sm">{COMPANY_INFO.name}</strong>
                  <span className="text-[#8B7C66]">{COMPANY_INFO.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={16} className="text-[#B85C38] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans text-sm">Giờ mở cửa</strong>
                  <span className="text-[#8B7C66]">Thứ Hai - Thứ Bảy: 07:30 – 18:00 · Chủ Nhật: 08:00 – 12:00</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={16} className="text-[#B85C38] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans text-sm">Hotline &amp; Zalo</strong>
                  <div className="flex items-center gap-3 mt-0.5">
                    <a href="tel:0916640316" className="text-[#B85C38] hover:underline font-bold">
                      0916 640 316
                    </a>
                    <span>·</span>
                    <a href="tel:0912958578" className="text-[#B85C38] hover:underline font-bold">
                      0912 958 578
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/showroom"
                className="btn btn-clay text-xs"
              >
                Đặt Lịch Tư Vấn Mẫu
              </Link>
              <a
                href="https://zalo.me/0916640316"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost text-white border-white/30 hover:border-[#B85C38] text-xs flex items-center gap-1.5"
              >
                <MessageSquare size={13} /> Chat Zalo
              </a>
              <a
                href={COMPANY_INFO.mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost text-white border-white/30 hover:border-[#B85C38] text-xs flex items-center gap-1.5"
              >
                <Navigation size={13} /> Chỉ Đường
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
