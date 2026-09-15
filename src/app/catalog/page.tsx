import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import CatalogView from '@/components/catalog/CatalogView';

export const metadata: Metadata = {
  title: 'Catalog Gạch Ốp Lát Kiến Trúc & Bề Mặt Cao Cấp | Thường Sơn Ceramic',
  description: 'Khám phá hơn 800+ mẫu gạch ốp lát cẩm thạch Ý, đá vôi travertine, bê tông kiến trúc và thanh gỗ porcelain tuyển chọn từ Công ty TNHH Thường Sơn.',
};

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs font-mono uppercase tracking-widest text-[#8B7C66]">
          Đang tải kho vật liệu catalog...
        </div>
      }
    >
      <CatalogView />
    </Suspense>
  );
}
