import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import CatalogView from '@/components/catalog/CatalogView';

export const metadata: Metadata = {
  title: 'Catalog Gạch Ốp Lát Kiến Trúc & Bề Mặt Cao Cấp',
  description: 'Khám phá hơn 800+ mẫu gạch ốp lát cẩm thạch Ý, đá vôi travertine, gạch lát nền 800x800, gạch ốp tường 600x1200 tuyển chọn từ Công ty TNHH Thường Sơn Thanh Hóa.',
  alternates: {
    canonical: 'https://thuong-son-ceramic.vercel.app/catalog',
  },
  openGraph: {
    title: 'Catalog Gạch Ốp Lát Kiến Trúc & Bề Mặt Cao Cấp | Thường Sơn Ceramic',
    description: 'Kho mẫu gạch ốp lát cẩm thạch, travertine, đá tự nhiên và giải pháp bề mặt công trình cao cấp tại Thanh Hóa.',
    url: 'https://thuong-son-ceramic.vercel.app/catalog',
  },
};

const catalogBreadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Trang chủ',
      item: 'https://thuong-son-ceramic.vercel.app',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Catalog',
      item: 'https://thuong-son-ceramic.vercel.app/catalog',
    },
  ],
};

export default function CatalogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogBreadcrumbSchema) }}
      />
      <Suspense
        fallback={
          <div className="py-24 text-center text-xs font-mono uppercase tracking-widest text-[#8B7C66]">
            Đang tải kho vật liệu catalog...
          </div>
        }
      >
        <CatalogView />
      </Suspense>
    </>
  );
}
