'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, ChevronDown, Phone, MessageSquare, Mail } from 'lucide-react';
import SearchModal from '@/components/search/SearchModal';
import MegaMenu from '@/components/navigation/MegaMenu';
import BrandLogo from '@/components/ui/BrandLogo';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<'catalog' | 'spaces' | 'collections' | null>(null);

  // Track scroll position for header appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Top thin announcement bar with Thường Sơn store info */}
      <div className="bg-[#1C1B19] text-[#F5F1EA]/85 text-[10px] uppercase font-mono tracking-wider sm:tracking-[0.2em] text-center py-1.5 sm:py-2 px-3 sm:px-4 flex items-center justify-center gap-2 sm:gap-4 relative z-50 overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="shrink-0 font-medium">SHOWROOM</span>
        <span className="opacity-40 shrink-0">·</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <Phone size={11} className="text-[#B85C38]" />
          <a href="tel:0916640316" className="hover:text-[#B85C38] transition-colors">0916 640 316</a>
        </div>
        <span className="opacity-40 shrink-0">·</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <MessageSquare size={11} className="text-[#B85C38]" />
          <a
            href="https://zalo.me/0916640316"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B85C38] hover:text-white transition-colors font-medium"
          >
            Zalo
          </a>
        </div>
        <span className="hidden md:inline opacity-40 shrink-0">·</span>
        <a
          href="https://maps.google.com/?q=Công+ty+TNHH+Thường+Sơn+Hoằng+Lộc+Thanh+Hóa"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline hover:text-[#B85C38] transition-colors shrink-0"
          title="Mở Google Maps chỉ đường Showroom Hoằng Lộc"
        >
          HOẰNG LỘC · THANH HOÁ ↗
        </a>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F5F1EA]/95 backdrop-blur-md shadow-sm border-b border-[#D5CDBE]'
            : 'bg-[#F5F1EA]/80 backdrop-blur-sm border-b border-[#D5CDBE]/50'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-3.5 sm:py-4 md:py-5 flex items-center justify-between">
          {/* Left: Mobile Burger Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu"
              className="p-1.5 text-[#1C1B19] hover:text-[#B85C38] transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Logo Brand Wordmark (Thường Sơn) */}
          <BrandLogo variant="dark" />

          {/* Center Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 relative" aria-label="Menu chính">
            {/* Catalog with MegaMenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMegaMenu('catalog')}
            >
              <Link
                href="/catalog"
                className="nav-link flex items-center gap-1"
                onClick={() => setActiveMegaMenu(null)}
              >
                CATALOG <ChevronDown size={12} className="opacity-60" />
              </Link>
            </div>

            <span className="text-[#B85C38] text-[9px] opacity-60">◇</span>

            {/* Không gian with MegaMenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMegaMenu('spaces')}
            >
              <Link
                href="/spaces"
                className="nav-link flex items-center gap-1"
                onClick={() => setActiveMegaMenu(null)}
              >
                KHÔNG GIAN <ChevronDown size={12} className="opacity-60" />
              </Link>
            </div>

            <span className="text-[#B85C38] text-[9px] opacity-60">◇</span>

            {/* Bộ sưu tập with MegaMenu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMegaMenu('collections')}
            >
              <Link
                href="/collections"
                className="nav-link flex items-center gap-1"
                onClick={() => setActiveMegaMenu(null)}
              >
                BỘ SƯU TẬP <ChevronDown size={12} className="opacity-60" />
              </Link>
            </div>

            <span className="text-[#B85C38] text-[9px] opacity-60">◇</span>

            <Link href="/#giai-phap" className="nav-link" onMouseEnter={() => setActiveMegaMenu(null)}>
              GIẢI PHÁP
            </Link>

            <span className="text-[#B85C38] text-[9px] opacity-60">◇</span>

            <Link href="/journal" className="nav-link" onMouseEnter={() => setActiveMegaMenu(null)}>
              CẨM NANG
            </Link>

            <span className="text-[#B85C38] text-[9px] opacity-60">◇</span>

            <Link href="/showroom" className="nav-link" onMouseEnter={() => setActiveMegaMenu(null)}>
              SHOWROOM
            </Link>
          </nav>

          {/* Right Utility: Search + Lang + CTA */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              aria-label="Tìm kiếm sản phẩm"
              className="flex items-center gap-2 text-xs text-[#1C1B19] hover:text-[#B85C38] p-1.5 transition-colors"
            >
              <Search size={18} />
              <span className="hidden xl:inline text-[11px] font-mono uppercase tracking-widest text-[#8B7C66]">
                Tìm mã gạch
              </span>
            </button>

            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono tracking-widest text-[#8B7C66]">
              <span className="text-[#B85C38] font-medium">VI</span>
              <span className="opacity-40">/</span>
              <span className="hover:text-[#1C1B19] cursor-pointer">EN</span>
            </div>

            {/* Consultation CTA */}
            <Link
              href="/showroom"
              className="btn btn-ink text-[10px] px-3.5 md:px-5 py-2 hidden md:inline-flex"
            >
              Đặt lịch Showroom
            </Link>

            {/* Mobile Call Icon */}
            <a
              href="tel:0916640316"
              aria-label="Gọi hotline"
              className="p-1.5 text-[#1C1B19] hover:text-[#B85C38]"
            >
              <Phone size={18} />
            </a>
          </div>
        </div>

        {/* Mega Menu Overlay panel */}
        {activeMegaMenu && (
          <MegaMenu
            type={activeMegaMenu}
            onClose={() => setActiveMegaMenu(null)}
          />
        )}
      </header>

      {/* Mobile Drawer Navigation (Fullscreen Overlay) */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#F5F1EA] flex flex-col justify-between overflow-y-auto p-6 md:p-10 animate-in fade-in duration-200"
        >
          {/* Top bar of drawer */}
          <div className="flex items-center justify-between border-b border-[#D5CDBE] pb-4">
            <BrandLogo variant="dark" onClick={() => setMobileMenuOpen(false)} />
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Đóng menu"
              className="p-2 text-[#1C1B19] hover:text-[#B85C38]"
            >
              <X size={26} />
            </button>
          </div>

          {/* Quick Search inside Drawer */}
          <div className="mt-6">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchModalOpen(true);
              }}
              className="w-full flex items-center justify-between py-3 px-4 bg-white/80 border border-[#D5CDBE] text-left text-sm text-[#8B7C66] font-serif"
            >
              <span className="flex items-center gap-2">
                <Search size={16} /> Tìm mã gạch, tên, không gian...
              </span>
              <span className="text-[10px] font-mono uppercase bg-[#EBE5DA] px-2 py-0.5">Tìm</span>
            </button>
          </div>

          {/* Drawer Links */}
          <nav className="my-8 flex flex-col gap-2">
            {[
              { label: 'Catalog Sản Phẩm', href: '/catalog', subtitle: 'Toàn bộ mẫu gạch Apodio, Monalisa, Changyih' },
              { label: 'Không Gian Ứng Dụng', href: '/spaces', subtitle: 'Phòng khách, tắm, bếp, ngủ, ngoài trời' },
              { label: 'Bộ Sưu Tập Kiến Trúc', href: '/collections', subtitle: 'The Quiet Stone, Lumina Carrara, Apodio Ciment' },
              { label: 'Giải Pháp Phòng Tắm', href: '/#giai-phap', subtitle: 'Thiết bị vệ sinh, sen vòi, nước nóng' },
              { label: 'Cẩm Nang Chọn Gạch', href: '/journal', subtitle: 'Tư vấn tỷ lệ, ánh sáng và bề mặt' },
              { label: 'Showroom Hoằng Lộc', href: '/showroom', subtitle: 'Số 01 Đình Bảng, Hoằng Lộc, Thanh Hóa' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 border-b border-[#D5CDBE]/60 flex flex-col group"
              >
                <span className="font-serif text-2xl font-light text-[#1C1B19] group-hover:text-[#B85C38] transition-colors">
                  {item.label}
                </span>
                <span className="text-xs text-[#8B7C66] font-mono mt-0.5">
                  {item.subtitle}
                </span>
              </Link>
            ))}
          </nav>

          {/* Drawer Footer */}
          <div className="pt-6 border-t border-[#D5CDBE] flex flex-col gap-3">
            <Link
              href="/showroom"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-ink w-full py-3.5 text-center text-xs"
            >
              Đặt lịch xem mẫu tại Showroom Hoằng Lộc
            </Link>
            <div className="flex flex-col gap-2 text-xs font-mono text-[#8B7C66] pt-2">
              <div className="flex items-center justify-between">
                <span>Hotline:</span>
                <span className="text-[#1C1B19] font-medium">0916 640 316 · 0912 958 578</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#D5CDBE]/40">
                <span>Tư vấn Zalo:</span>
                <div className="flex gap-3">
                  <a
                    href="https://zalo.me/0916640316"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#B85C38] hover:underline"
                  >
                    0916 640 316
                  </a>
                  <span>·</span>
                  <a
                    href="https://zalo.me/0912958578"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#B85C38] hover:underline"
                  >
                    0912 958 578
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#D5CDBE]/40">
                <span>Email:</span>
                <a
                  href="mailto:nguyenhieu32005@gamil.com"
                  className="text-[#B85C38] hover:underline"
                  title="Nhấn để gửi email cho Thường Sơn Ceramic"
                >
                  nguyenhieu32005@gamil.com
                </a>
              </div>
              <div className="pt-1 border-t border-[#D5CDBE]/40">
                <a
                  href="https://maps.google.com/?q=Công+ty+TNHH+Thường+Sơn+Hoằng+Lộc+Thanh+Hóa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B85C38] hover:underline flex items-center gap-1 text-[11px]"
                  title="Mở Google Maps chỉ đường"
                >
                  📍 Số 01 Đình Bảng, Hoằng Lộc, Thanh Hóa ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
