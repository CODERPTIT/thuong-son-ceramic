import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { SPACES, getSpaceBySlug, getProductsBySpace } from '@/data/mockData';
import ProductCard from '@/components/product/ProductCard';

interface SpacePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return SPACES.map((s) => ({
    slug: s.slug,
  }));
}

export async function generateMetadata({ params }: SpacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const space = getSpaceBySlug(slug);

  if (!space) {
    return { title: 'Không tìm thấy không gian | Thường Sơn Ceramic' };
  }

  return {
    title: `Gạch Ốp Lát ${space.name} Cao Cấp | Thường Sơn Ceramic`,
    description: `${space.tagline}. ${space.description}`,
    openGraph: {
      title: `Gạch ${space.name} — Thường Sơn Ceramic`,
      description: space.tagline,
      images: [{ url: space.heroImage }],
    },
  };
}

export default async function SpaceDetailPage({ params }: SpacePageProps) {
  const { slug } = await params;
  const space = getSpaceBySlug(slug);

  if (!space) {
    notFound();
  }

  // Get products matching this space
  const matchingProducts = getProductsBySpace(space.name);
  const otherSpaces = SPACES.filter((s) => s.slug !== space.slug);

  return (
    <div className="bg-[#F5F1EA]">
      {/* Breadcrumb Navigation */}
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12 pt-8 pb-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#D5CDBE]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8B7C66]">
            <Link href="/" className="hover:text-[#1C1B19]">Trang chủ</Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-[#1C1B19]">Không Gian</Link>
            <span>/</span>
            <span className="text-[#1C1B19]">{space.name}</span>
          </div>

          <Link
            href="/spaces/living-room"
            className="text-xs font-mono uppercase tracking-widest text-[#8B7C66] hover:text-[#B85C38] flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Tất cả không gian
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-20 border-b border-[#D5CDBE]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#B85C38] flex items-center gap-2">
                <Sparkles size={14} /> KHÔNG GIAN KIẾN TRÚC
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl font-light text-[#1C1B19] leading-[1.1]">
                Gạch {space.name}
              </h1>
              <p className="font-serif italic text-lg text-[#8B7C66]">
                &ldquo;{space.tagline}&rdquo;
              </p>
              <p className="text-sm md:text-base text-[#1C1B19]/80 font-light leading-relaxed">
                {space.description}
              </p>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href={`/catalog?useCase=${encodeURIComponent(space.name)}`}
                  className="btn btn-ink text-xs"
                >
                  Lọc {matchingProducts.length} Mẫu Trong Catalog
                </Link>
                <Link
                  href="/showroom"
                  className="btn btn-ghost text-xs"
                >
                  Tư Vấn Thiết Kế
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 relative aspect-[16/10] bg-[#EBE5DA] overflow-hidden">
              <Image
                src={space.heroImage}
                alt={space.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
              <div className="absolute top-4 right-4 bg-[#1C1B19]/85 text-[#F5F1EA] text-[10px] font-mono px-3 py-1">
                {space.hint}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications & Recommended Dimensions */}
      <section className="py-16 md:py-20 bg-[#FAF8F4] border-b border-[#D5CDBE]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recommended Sizes */}
            <div className="p-6 md:p-8 bg-white border border-[#D5CDBE]">
              <span className="text-xs uppercase font-mono tracking-widest text-[#8B7C66] block mb-3">
                Kích Thước Khuyên Dùng Cho {space.name}
              </span>
              <div className="flex flex-wrap gap-2 mb-4">
                {space.recommendedSizes.map((size) => (
                  <span
                    key={size}
                    className="text-xs px-3 py-1.5 bg-[#FAF8F4] border border-[#D5CDBE] text-[#1C1B19] font-mono"
                  >
                    {size}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#1C1B19]/70 font-light leading-relaxed">
                Tỷ lệ kích thước này được tính toán để giảm tối đa đường cắt chéo, tạo bề mặt liền lạc và giữ nguyên vẹn hoa văn của mặt gạch.
              </p>
            </div>

            {/* Recommended Surfaces */}
            <div className="p-6 md:p-8 bg-white border border-[#D5CDBE]">
              <span className="text-xs uppercase font-mono tracking-widest text-[#8B7C66] block mb-3">
                Bề Mặt Men Khuyên Dùng
              </span>
              <div className="flex flex-wrap gap-2 mb-4">
                {space.recommendedSurfaces.map((surf) => (
                  <span
                    key={surf}
                    className="text-xs px-3 py-1.5 bg-[#FAF8F4] border border-[#D5CDBE] text-[#1C1B19] font-mono"
                  >
                    Bề mặt {surf}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#1C1B19]/70 font-light leading-relaxed">
                Đảm bảo sự cân bằng tuyệt đối giữa tính năng chống trượt an toàn cho cả gia đình và khả năng vệ sinh bề mặt dễ dàng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Products For This Space */}
      <section className="py-20 md:py-28 border-b border-[#D5CDBE]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
          <div className="flex items-center justify-between mb-12 pb-4 border-b border-[#D5CDBE]">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#8B7C66] block mb-1">
                — MẪU GẠCH TIÊU BIỂU —
              </span>
              <h2 className="font-serif text-3xl font-light text-[#1C1B19]">
                Sản Phẩm Được Tuyển Chọn Cho {space.name}
              </h2>
            </div>
            <Link
              href={`/catalog?useCase=${encodeURIComponent(space.name)}`}
              className="text-xs font-mono uppercase text-[#B85C38] hover:underline flex items-center gap-1"
            >
              Xem tất cả mẫu {space.name} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {matchingProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Design Tips Section */}
      <section className="py-20 md:py-28 bg-[#FAF8F4] border-b border-[#D5CDBE]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
          <div className="max-w-3xl mb-12">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#B85C38] block mb-2">
              — LỜI KHUYÊN TỪ CHUYÊN GIA —
            </span>
            <h3 className="font-serif text-3xl font-light text-[#1C1B19]">
              Kinh Nghiệm Chọn Gạch Cho {space.name}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {space.designTips.map((tip, idx) => (
              <div
                key={tip.title}
                className="p-8 bg-white border border-[#D5CDBE] flex items-start gap-4"
              >
                <CheckCircle2 size={20} className="text-[#B85C38] shrink-0 mt-1" />
                <div>
                  <h4 className="font-serif text-xl font-normal text-[#1C1B19] mb-2">
                    0{idx + 1}. {tip.title}
                  </h4>
                  <p className="text-sm text-[#1C1B19]/75 font-light leading-relaxed">
                    {tip.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Other Spaces */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
          <div className="flex items-center justify-between mb-12 pb-4 border-b border-[#D5CDBE]">
            <h3 className="font-serif text-2xl font-light text-[#1C1B19]">
              Khám Phá Các Không Gian Khác
            </h3>
            <Link href="/spaces/living-room" className="text-xs font-mono uppercase text-[#B85C38] hover:underline">
              Tất cả không gian →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {otherSpaces.map((s) => (
              <Link
                key={s.id}
                href={`/spaces/${s.slug}`}
                className="group block bg-white border border-[#D5CDBE] hover:border-[#B85C38] p-3 transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#EBE5DA] mb-3">
                  <Image
                    src={s.heroImage}
                    alt={s.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h4 className="font-serif text-base font-normal text-[#1C1B19] group-hover:text-[#B85C38] transition-colors">
                  {s.name}
                </h4>
                <span className="text-[11px] font-mono text-[#8B7C66]">
                  {s.productCount} mã
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
