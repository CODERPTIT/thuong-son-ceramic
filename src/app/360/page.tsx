import React from 'react';
import type { Metadata } from 'next';
import { getProductBySlug } from '@/data/mockData';
import Viewer360, { Scene360 } from '@/components/viewer360/Viewer360';

export const metadata: Metadata = {
  title: 'Showroom 360° VR Trực Tuyến | Thường Sơn Ceramic',
  description: 'Trải nghiệm không gian thực tế ảo 360 độ xoay đa chiều các mẫu gạch ốp lát cao cấp tại Thường Sơn Ceramic. Quét QR khám phá ngay trên điện thoại.',
};

export default function General360Page() {
  const sampleProduct = getProductBySlug('orinda-airson-hk-2256');

  const presetScenes: Scene360[] = [
    {
      id: 'orinda-airson',
      name: 'Phòng khách Orinda AIRSON 2256',
      url: '/panoramas/airson-hk-2256.jpg',
      thumbnail: '/images/products/orinda-airson/face-main.jpg',
      roomType: 'Phòng khách hoàng gia'
    },
    {
      id: 'living-luxe',
      name: 'Phòng khách Living Luxe (Calacatta)',
      url: 'https://grandtiles.com.vn/static/pano720/scenes/SCN-01-living-luxe/SCN-01-living-luxe_web4k.jpg',
      thumbnail: 'https://grandtiles.com.vn/static/pano720/scenes/SCN-01-living-luxe/SCN-01-living-luxe_web4k.jpg',
      roomType: 'Biệt thự cao cấp'
    },
    {
      id: 'hotel-lobby',
      name: 'Đại sảnh Hotel Grand (Marble)',
      url: 'https://grandtiles.com.vn/static/pano720/scenes/SCN-15-hotel-lobby/SCN-15-hotel-lobby_web4k.jpg',
      thumbnail: 'https://grandtiles.com.vn/static/pano720/scenes/SCN-15-hotel-lobby/SCN-15-hotel-lobby_web4k.jpg',
      roomType: 'Đại sảnh'
    }
  ];

  return (
    <main className="w-screen h-screen overflow-hidden bg-stone-950">
      <Viewer360
        initialPanoramaUrl="/panoramas/airson-hk-2256.jpg"
        product={sampleProduct}
        scenes={presetScenes}
        title="Showroom Thực Tế Ảo 360° VR"
        subtitle="Khám phá không gian lát gạch toàn cảnh 360 độ đa chiều"
      />
    </main>
  );
}
