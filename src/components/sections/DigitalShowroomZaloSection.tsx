import React from 'react';
import Link from 'next/link';
import { MessageSquare, BookOpen, UserCheck } from 'lucide-react';
import { COMPANY_INFO } from '@/data/mockData';

export default function DigitalShowroomZaloSection() {
  return (
    <section id="zalo-hub" className="py-16 md:py-20 bg-[#F5F1EA] border-b border-[#D5CDBE]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        <div className="bg-[#FAF8F4] border border-[#D5CDBE] p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Description (7 cols) */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#B85C38] mb-3">
              <MessageSquare size={13} /> TƯ VẤN VẬT LIỆU TRỰC TIẾP QUA ZALO
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-light text-[#1C1B19] mb-3">
              Gửi Bản Vẽ &amp; Nhận Ảnh Mặt Gạch Thật
            </h2>
            <p className="text-sm text-[#1C1B19]/75 font-light leading-relaxed max-w-2xl mb-6">
              Kết nối trực tiếp qua Zalo cùng chuyên viên tư vấn của Công ty TNHH Thường Sơn. Gửi ảnh phối cảnh, diện tích phòng hoặc mã gạch đang cân nhắc để nhận video quay cận cảnh men sứ và báo giá tốt nhất cho công trình.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/catalog"
                className="btn btn-ghost text-xs flex items-center gap-2"
              >
                <BookOpen size={14} /> Khám Phá Catalog Online
              </Link>
              <Link
                href="/showroom"
                className="btn btn-ink text-xs flex items-center gap-2"
              >
                <UserCheck size={14} /> Đặt Lịch Ghé Showroom
              </Link>
            </div>
          </div>

          {/* Right Direct Zalo Cards (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMPANY_INFO.phones.map((p, idx) => (
              <a
                key={p.raw}
                href={p.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 bg-white border border-[#D5CDBE] hover:border-[#B85C38] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#B85C38]">
                      Tư vấn Zalo 0{idx + 1}
                    </span>
                    <MessageSquare size={16} className="text-[#B85C38] group-hover:scale-110 transition-transform" />
                  </div>
                  <strong className="font-serif text-lg text-[#1C1B19] block mb-1 group-hover:text-[#B85C38] transition-colors">
                    {p.number}
                  </strong>
                  <p className="text-[11px] text-[#8B7C66] font-mono">
                    Hỗ trợ kỹ thuật &amp; báo giá
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#D5CDBE]/50 text-xs font-mono text-[#B85C38] flex items-center justify-between">
                  <span>Mở Chat Zalo</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
