import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { COLLECTIONS, PRODUCTS } from '@/data/mockData';

export default function FeaturedCollectionSection() {
  const collection = COLLECTIONS.find(c => c.slug === 'the-quiet-stone') || COLLECTIONS[0];
  const collectionProducts = PRODUCTS.filter(p => collection.productIds.includes(p.id)).slice(0, 3);

  return (
    <section className="py-14 sm:py-20 md:py-36 bg-[#FAF8F4] border-b border-[#D5CDBE]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Image occupies ~65% (8 cols) */}
          <div className="lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/9] bg-[#EBE5DA] overflow-hidden group">
            <Image
              src={collection.heroImage}
              alt={collection.name}
              fill
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover group-hover:scale-103 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-[#1C1B19]/85 text-[#F5F1EA] text-[9px] sm:text-[10px] font-mono px-2.5 sm:px-3 py-1 uppercase tracking-widest">
              Bộ Sưu Tập Tiêu Biểu · 2026
            </div>
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between text-[#F5F1EA] text-[10px] sm:text-xs font-mono">
              <span className="bg-[#1C1B19]/70 backdrop-blur-sm px-2.5 sm:px-3 py-1">
                Chất liệu: {collection.material}
              </span>
              <span className="bg-[#1C1B19]/70 backdrop-blur-sm px-2.5 sm:px-3 py-1">
                {collection.productIds.length} Mẫu Thiết Kế
              </span>
            </div>
          </div>

          {/* Details occupy ~35% (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-5 sm:space-y-6">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#B85C38] block mb-2">
                — FEATURED COLLECTION —
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-light text-[#1C1B19] leading-tight">
                {collection.name}
              </h2>
            </div>

            <p className="text-sm font-serif italic text-[#8B7C66]">
              &ldquo;{collection.subtitle}&rdquo;
            </p>

            <p className="text-sm text-[#1C1B19]/80 font-light leading-relaxed">
              {collection.story}
            </p>

            {/* Color swatches */}
            <div className="pt-2">
              <span className="text-xs uppercase font-mono tracking-wider text-[#8B7C66] block mb-3">
                Bảng màu chủ đạo:
              </span>
              <div className="flex items-center gap-3">
                {collection.colorPalette.map((c) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-inner"
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                    <span className="text-[11px] text-[#1C1B19]/75 font-mono">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specimen Tiles Preview */}
            <div className="pt-2">
              <span className="text-xs uppercase font-mono tracking-wider text-[#8B7C66] block mb-2 sm:mb-3">
                Các mẫu tiêu biểu trong bộ:
              </span>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {collectionProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="p-1.5 sm:p-2 bg-white border border-[#D5CDBE] hover:border-[#B85C38] transition-colors group block"
                  >
                    <div className="relative aspect-square mb-1 sm:mb-1.5 overflow-hidden bg-[#FAF8F4]">
                      <Image
                        src={p.images.thumbnail}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono text-[#1C1B19] block truncate font-medium">
                      {p.code}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-[#8B7C66] block truncate">
                      {p.surface}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href={`/collections/${collection.slug}`}
                className="btn btn-ink text-xs"
              >
                Khám Phá Bộ Sưu Tập
              </Link>
              <Link
                href="/catalog"
                className="btn btn-ghost text-xs"
              >
                Xem Toàn Bộ Mẫu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
