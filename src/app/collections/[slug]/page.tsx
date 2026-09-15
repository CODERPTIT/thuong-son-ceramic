import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { COLLECTIONS, getCollectionBySlug, PRODUCTS } from '@/data/mockData';
import ProductCard from '@/components/product/ProductCard';

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return COLLECTIONS.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return { title: 'Không tìm thấy bộ sưu tập | Thường Sơn Ceramic' };
  }

  return {
    title: `${collection.name} | Thường Sơn Ceramic Collections`,
    description: `${collection.subtitle}. ${collection.description}`,
    openGraph: {
      title: `${collection.name} — Thường Sơn Ceramic`,
      description: collection.subtitle,
      images: [{ url: collection.heroImage }],
    },
  };
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  // Get products in this collection
  const collectionProducts = PRODUCTS.filter((p) => p.collectionSlug === collection.slug);
  const otherCollections = COLLECTIONS.filter((c) => c.slug !== collection.slug);

  return (
    <div className="bg-[#F5F1EA]">
      {/* Editorial Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12 pt-8 pb-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#D5CDBE]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8B7C66]">
            <Link href="/" className="hover:text-[#1C1B19]">Trang chủ</Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-[#1C1B19]">Bộ Sưu Tập</Link>
            <span>/</span>
            <span className="text-[#1C1B19]">{collection.name}</span>
          </div>

          <Link
            href="/catalog"
            className="text-xs font-mono uppercase tracking-widest text-[#8B7C66] hover:text-[#B85C38] flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Tất cả bộ sưu tập
          </Link>
        </div>
      </div>

      {/* Hero: Collection Story & Large Image */}
      <section className="py-12 md:py-20 border-b border-[#D5CDBE]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#B85C38] flex items-center gap-2">
                <Sparkles size={14} /> EDITORIAL COLLECTION
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl font-light text-[#1C1B19] leading-[1.1]">
                {collection.name}
              </h1>
              <p className="font-serif italic text-lg text-[#8B7C66]">
                &ldquo;{collection.subtitle}&rdquo;
              </p>
              <p className="text-sm md:text-base text-[#1C1B19]/80 font-light leading-relaxed">
                {collection.story}
              </p>

              {/* Attributes */}
              <div className="pt-4 border-t border-[#D5CDBE] flex flex-wrap items-center gap-6 text-xs font-mono text-[#8B7C66]">
                <span>Chất liệu: <strong>{collection.material}</strong></span>
                <span>·</span>
                <span>Số mẫu: <strong>{collectionProducts.length} Mẫu thực tế</strong></span>
              </div>
            </div>

            <div className="lg:col-span-7 relative aspect-[16/10] bg-[#EBE5DA] overflow-hidden">
              <Image
                src={collection.heroImage}
                alt={collection.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-[#1C1B19]/85 text-[#F5F1EA] text-[10px] font-mono px-3 py-1 uppercase tracking-wider">
                Cảm hứng thiết kế từ thiên nhiên
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Material Overview, Color Palette & Textures */}
      <section className="py-16 md:py-20 bg-[#FAF8F4] border-b border-[#D5CDBE]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Color Palette */}
            <div className="p-6 bg-white border border-[#D5CDBE]">
              <span className="text-xs uppercase font-mono tracking-widest text-[#8B7C66] block mb-3">
                Bảng Màu Chủ Đạo
              </span>
              <div className="space-y-3">
                {collection.colorPalette.map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full border border-black/10 inline-block shadow-inner"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="text-xs font-mono">
                      <strong className="text-[#1C1B19] block">{c.name}</strong>
                      <span className="text-[#8B7C66]">{c.hex}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Textures */}
            <div className="p-6 bg-white border border-[#D5CDBE]">
              <span className="text-xs uppercase font-mono tracking-widest text-[#8B7C66] block mb-3">
                Hiệu Ứng Bề Mặt &amp; Men
              </span>
              <ul className="space-y-2.5 text-xs font-mono">
                {collection.textures.map((t) => (
                  <li key={t} className="flex items-center gap-2 text-[#1C1B19]">
                    <span className="w-1.5 h-1.5 bg-[#B85C38]" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Application Spaces */}
            <div className="p-6 bg-white border border-[#D5CDBE]">
              <span className="text-xs uppercase font-mono tracking-widest text-[#8B7C66] block mb-3">
                Không Gian Khuyên Dùng
              </span>
              <div className="flex flex-wrap gap-2">
                {collection.applicationSpaces.map((sp) => (
                  <span
                    key={sp}
                    className="text-xs px-2.5 py-1 bg-[#FAF8F4] border border-[#D5CDBE] text-[#1C1B19] font-mono"
                  >
                    {sp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Products Grid */}
      <section className="py-20 md:py-28 border-b border-[#D5CDBE]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
          <div className="flex items-center justify-between mb-12 pb-4 border-b border-[#D5CDBE]">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#8B7C66] block mb-1">
                — DANH MỤC SẢN PHẨM —
              </span>
              <h2 className="font-serif text-3xl font-light text-[#1C1B19]">
                Các Mẫu Thuộc Bộ Sưu Tập {collection.name}
              </h2>
            </div>
            <Link
              href="/catalog"
              className="btn btn-ghost text-xs hidden sm:inline-flex"
            >
              Mở Toàn Bộ Catalog
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collectionProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Related Collections */}
      <section className="py-20 md:py-28 bg-[#FAF8F4]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
          <div className="flex items-center justify-between mb-12 pb-4 border-b border-[#D5CDBE]">
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1C1B19]">
              Khám Phá Các Bộ Sưu Tập Khác
            </h3>
            <Link href="/catalog" className="text-xs font-mono uppercase text-[#B85C38] hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherCollections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                className="group bg-white border border-[#D5CDBE] hover:border-[#B85C38] p-5 block transition-all"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#EBE5DA] mb-4">
                  <Image
                    src={col.heroImage}
                    alt={col.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 bg-[#1C1B19]/85 text-white text-[10px] font-mono px-2 py-0.5">
                    {col.material}
                  </div>
                </div>
                <h4 className="font-serif text-xl font-normal text-[#1C1B19] group-hover:text-[#B85C38] transition-colors mb-1">
                  {col.name}
                </h4>
                <p className="text-xs text-[#8B7C66] line-clamp-2 leading-relaxed">
                  {col.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
