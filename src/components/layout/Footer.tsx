import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Phone, Mail, MapPin, MessageSquare } from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';
import { COMPANY_INFO } from '@/data/mockData';

export default function Footer() {
  return (
    <footer className="bg-[#1C1B19] text-[#F5F1EA] border-t border-[#2A2825] mt-12 sm:mt-24">
      {/* Editorial Pull-Quote / Final CTA Banner */}
      <div className="border-b border-white/10 py-12 sm:py-20 md:py-24 px-5 lg:px-12 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-[0.25em] sm:tracking-[0.35em] text-[#B85C38] block mb-3 sm:mb-4">
            — THE ART OF SURFACE —
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-6xl font-light leading-[1.2] sm:leading-[1.15] mb-4 sm:mb-6">
            Không gian bắt đầu từ <em className="serif-italic text-[#D7CEBE]">bề mặt.</em>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#F5F1EA]/70 max-w-xl mx-auto leading-relaxed mb-6 sm:mb-8">
            Công ty TNHH Thường Sơn tuyển chọn giải pháp gạch ốp lát và bề mặt kiến trúc cho các công trình mang dấu ấn riêng. Sẵn sàng đón tiếp quý khách tại showroom Hoằng Lộc, Thanh Hóa.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Link href="/catalog" className="btn btn-clay text-xs flex items-center justify-center">
              Khám Phá Toàn Bộ Catalog
            </Link>
            <Link
              href="/showroom"
              className="btn btn-ghost text-[#F5F1EA] border-[#F5F1EA]/30 hover:border-[#B85C38] text-xs flex items-center justify-center"
            >
              Đặt Lịch Hẹn Showroom
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links Columns */}
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12 py-10 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        {/* Brand & Address (4 cols) */}
        <div className="md:col-span-4 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <BrandLogo variant="light" />
            </div>
            <p className="text-xs text-[#F5F1EA]/70 leading-relaxed max-w-sm mb-6">
              Công ty TNHH Thường Sơn. Đại lý phân phối chiến lược các thương hiệu gạch ốp lát kiến trúc cao cấp: Apodio, Monalisa, Changyih Premium và Việt Ý SC tại Thanh Hóa và khu vực Bắc Trung Bộ.
            </p>
            <div className="space-y-3 text-xs text-[#F5F1EA]/80 font-mono">
              <a
                href={COMPANY_INFO.mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 hover:text-[#B85C38] transition-colors group"
                title="Mở bản đồ Google Maps chỉ đường"
              >
                <MapPin size={15} className="text-[#B85C38] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="group-hover:underline">Số 01, thôn Đình Bảng, Xã Hoằng Lộc, tỉnh Thanh Hóa ↗</span>
              </a>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-[#B85C38] shrink-0" />
                <div className="flex items-center gap-2">
                  <a href="tel:0916640316" className="hover:text-[#B85C38] transition-colors">
                    0916 640 316
                  </a>
                  <span className="opacity-40">/</span>
                  <a href="tel:0912958578" className="hover:text-[#B85C38] transition-colors">
                    0912 958 578
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-[#B85C38] shrink-0" />
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="hover:text-[#B85C38] hover:underline transition-colors"
                  title="Nhấn để gửi email cho Thường Sơn Ceramic"
                >
                  {COMPANY_INFO.email}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-[11px] font-mono text-[#8B7C66]">
            Giờ mở cửa: Thứ 2 – Thứ 7 (07:30 – 18:00) · CN (08:00 – 12:00)
          </div>
        </div>

        {/* Column: Catalog (2 cols) */}
        <div className="md:col-span-2">
          <h4 className="text-xs uppercase font-mono tracking-[0.2em] text-[#8B7C66] mb-5">
            — Catalog
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/catalog?material=Marble" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Gạch Cẩm Thạch</Link></li>
            <li><Link href="/catalog?material=Stone" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Đá Vôi Travertine</Link></li>
            <li><Link href="/catalog?material=Cement" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Bê Tông Kiến Trúc</Link></li>
            <li><Link href="/catalog?material=Wood" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Thanh Gỗ Bắc Âu</Link></li>
            <li><Link href="/catalog?material=Terrazzo" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Hạt Đá Terrazzo</Link></li>
            <li><Link href="/catalog" className="text-[#B85C38] hover:underline font-mono inline-flex items-center gap-1 mt-1">Tất cả mẫu <ArrowUpRight size={12} /></Link></li>
          </ul>
        </div>

        {/* Column: Không Gian (2 cols) */}
        <div className="md:col-span-2">
          <h4 className="text-xs uppercase font-mono tracking-[0.2em] text-[#8B7C66] mb-5">
            — Không Gian
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/spaces/living-room" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Phòng Khách</Link></li>
            <li><Link href="/spaces/bathroom" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Phòng Tắm</Link></li>
            <li><Link href="/spaces/kitchen" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Phòng Bếp</Link></li>
            <li><Link href="/spaces/bedroom" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Phòng Ngủ</Link></li>
            <li><Link href="/spaces/outdoor" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Ngoài Trời & Sân</Link></li>
            <li><Link href="/spaces/commercial" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Sảnh & Khách Sạn</Link></li>
          </ul>
        </div>

        {/* Column: Bộ Sưu Tập & Giải Pháp (2 cols) */}
        <div className="md:col-span-2">
          <h4 className="text-xs uppercase font-mono tracking-[0.2em] text-[#8B7C66] mb-5">
            — Bộ Sưu Tập
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/collections/the-quiet-stone" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">The Quiet Stone</Link></li>
            <li><Link href="/collections/lumina-carrara" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Lumina Carrara</Link></li>
            <li><Link href="/collections/apodio-ciment" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Apodio Ciment</Link></li>
            <li><Link href="/collections/terrazzo-studio" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Terrazzo Studio</Link></li>
            <li><Link href="/#giai-phap" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Thiết Bị Vệ Sinh</Link></li>
            <li><Link href="/journal" className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors">Cẩm Nang Kiến Trúc</Link></li>
          </ul>
        </div>

        {/* Column: Hotline & Zalo Trực Tiếp (2 cols) */}
        <div className="md:col-span-2">
          <h4 className="text-xs uppercase font-mono tracking-[0.2em] text-[#8B7C66] mb-5">
            — Kết Nối Zalo
          </h4>
          <ul className="space-y-3 text-xs">
            <li>
              <a
                href="https://zalo.me/0916640316"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors flex items-center gap-1.5"
              >
                <MessageSquare size={13} className="text-[#B85C38]" />
                <span>Zalo: 0916 640 316</span>
              </a>
            </li>
            <li>
              <a
                href="https://zalo.me/0912958578"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors flex items-center gap-1.5"
              >
                <MessageSquare size={13} className="text-[#B85C38]" />
                <span>Zalo: 0912 958 578</span>
              </a>
            </li>
            <li className="pt-2">
              <a
                href="https://maps.google.com/?q=Công+ty+TNHH+Thường+Sơn+Hoằng+Lộc+Thanh+Hóa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5F1EA]/80 hover:text-[#B85C38] transition-colors flex items-center gap-1"
              >
                Google Maps Chỉ Đường <ArrowUpRight size={12} />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar / Colophon */}
      <div className="border-t border-white/10 py-6 px-6 lg:px-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4 max-w-[1440px] mx-auto text-[11px] font-mono text-[#8B7C66]">
        <div>
          © 2026 Công ty TNHH Thường Sơn.{' '}
          <a
            href={COMPANY_INFO.mapDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#B85C38] hover:underline transition-colors"
            title="Mở bản đồ Google Maps chỉ đường"
          >
            Số 01, thôn Đình Bảng, Xã Hoằng Lộc, tỉnh Thanh Hóa.
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/showroom" className="hover:underline">Bản đồ chỉ đường</Link>
          <span>·</span>
          <Link href="/catalog" className="hover:underline">Catalog số</Link>
          <span>·</span>
          <span>Architectural Surface Atelier</span>
        </div>
      </div>
    </footer>
  );
}
