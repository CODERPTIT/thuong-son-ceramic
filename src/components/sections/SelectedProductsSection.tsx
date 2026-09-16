'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS } from '@/data/mockData';

export default function SelectedProductsSection() {
  const selectedProducts = PRODUCTS.slice(0, 8);

  return (
    <section className="py-14 sm:py-20 md:py-36 bg-[#F5F1EA] border-b border-[#D5CDBE]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-16 gap-4 sm:gap-6">
          <div>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#8B7C66] block mb-2 sm:mb-3">
              — SẢN PHẨM TUYỂN CHỌN —
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-[#1C1B19]">
              Chiêm Ngưỡng Từng Mặt Gạch
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#8B7C66] max-w-md font-light leading-relaxed">
            Mỗi mẫu gạch dưới đây đều sở hữu thông số kỹ thuật rõ ràng, tỷ lệ chuẩn xác và có thể trực tiếp chạm thử tại showroom.
          </p>
        </div>

        {/* 4-Column Product Grid (2 columns on mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {selectedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>

        {/* Bottom CTA to Catalog */}
        <div className="mt-10 sm:mt-16 text-center">
          <Link
            href="/catalog"
            className="btn btn-ink text-xs inline-flex items-center gap-2"
          >
            Mở Toàn Bộ 800+ Mẫu Trong Catalog <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
