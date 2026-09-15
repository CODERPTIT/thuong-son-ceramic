'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

interface MaterialCardData {
  title: string;
  vietnameseName: string;
  category: string;
  description: string;
  image: string;
  codeSnippet: string;
  spanClass: string;
}

const MATERIALS: MaterialCardData[] = [
  {
    title: 'Marble',
    vietnameseName: 'Cẩm Thạch',
    category: 'Vân đá cẩm thạch Ý',
    description: 'Calacatta, Statuario, Nero Marquina với đường vân rạn sống động và chiều sâu quang học.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    codeSnippet: '142 MÃ SẢN PHẨM',
    spanClass: 'md:col-span-8 md:row-span-2 min-h-[420px]',
  },
  {
    title: 'Stone',
    vietnameseName: 'Đá Tự Nhiên',
    category: 'Travertine & Bazan',
    description: 'Bề mặt đá vôi trầm tích và đá núi lửa chịu lực cao, nhám R10 - R11.',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
    codeSnippet: '98 MÃ SẢN PHẨM',
    spanClass: 'md:col-span-4 min-h-[300px]',
  },
  {
    title: 'Cement',
    vietnameseName: 'Bê Tông',
    category: 'Bê tông kiến trúc',
    description: 'Chất cảm xám tro thô mộc, tinh tế cho phong cách Modern Minimalist.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    codeSnippet: '76 MÃ SẢN PHẨM',
    spanClass: 'md:col-span-4 min-h-[300px]',
  },
  {
    title: 'Terrazzo',
    vietnameseName: 'Đá Mài Venice',
    category: 'Hạt thạch anh đúc',
    description: 'Mật độ hạt đa sắc nhã nhặn, thổi bừng cá tính hiện đại vào không gian sống.',
    image: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&w=800&q=80',
    codeSnippet: '32 MÃ SẢN PHẨM',
    spanClass: 'md:col-span-4 min-h-[320px]',
  },
  {
    title: 'Wood',
    vietnameseName: 'Vân Gỗ Bắc Âu',
    category: 'Thanh gỗ Porcelain',
    description: 'Khổ 200x1200mm vân nổi 3D, không cong vênh, chống nước tuyệt đối.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    codeSnippet: '45 MÃ SẢN PHẨM',
    spanClass: 'md:col-span-4 min-h-[320px]',
  },
  {
    title: 'Solid Color',
    vietnameseName: 'Đơn Sắc Thuần Khiết',
    category: 'Màu nền trung tính',
    description: 'Bề mặt phẳng mịn không gân vân, tôn vinh hình khối kiến trúc và ánh sáng.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    codeSnippet: '24 MÃ SẢN PHẨM',
    spanClass: 'md:col-span-4 min-h-[320px]',
  },
];

export default function MaterialTypesSection() {
  return (
    <section className="py-24 md:py-36 bg-[#FAF8F4] border-b border-[#D5CDBE]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8B7C66] block mb-3">
              — PHÂN LOẠI CHẤT LIỆU —
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1C1B19]">
              Sáu Nhóm Bề Mặt Cốt Lõi
            </h2>
          </div>
          <p className="text-sm text-[#8B7C66] max-w-md font-light leading-relaxed">
            Mỗi nhóm chất liệu sở hữu tính năng quang học và độ bền cơ học đặc thù, được phân chia theo công năng ứng dụng thực tế.
          </p>
        </div>

        {/* Asymmetrical Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {MATERIALS.map((mat) => (
            <Link
              key={mat.title}
              href={`/catalog?material=${encodeURIComponent(mat.title)}`}
              className={`group relative overflow-hidden bg-[#1C1B19] ${mat.spanClass} flex flex-col justify-end p-6 md:p-8 transition-transform duration-300`}
            >
              {/* Background Image */}
              <Image
                src={mat.image}
                alt={mat.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B19]/90 via-[#1C1B19]/30 to-transparent" />

              {/* Text overlay */}
              <div className="relative z-10 text-[#F5F1EA]">
                <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-[#D7CEBE] mb-2 uppercase">
                  <span>{mat.codeSnippet}</span>
                  <ArrowUpRight size={16} className="text-[#B85C38] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-normal text-white group-hover:translate-x-1 transition-transform duration-300">
                  {mat.title} <span className="font-sans text-sm font-light text-[#D7CEBE] ml-2">({mat.vietnameseName})</span>
                </h3>
                <p className="text-xs text-[#F5F1EA]/80 mt-2 font-light line-clamp-2 max-w-md">
                  {mat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
