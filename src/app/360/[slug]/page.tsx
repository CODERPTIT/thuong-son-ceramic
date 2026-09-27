import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS, getProductBySlug } from '@/data/mockData';
import Viewer360, { Scene360 } from '@/components/viewer360/Viewer360';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return PRODUCTS.slice(0, 50).map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Không gian 360° thực tế ảo | Thường Sơn Ceramic',
      description: 'Trải nghiệm không gian 360 độ các mẫu gạch ốp lát cao cấp tại Thường Sơn Ceramic.'
    };
  }

  const title = `Phối cảnh 360° VR: ${product.name} (${product.code}) | Thường Sơn Ceramic`;
  const description = `Trải nghiệm không gian thực tế ảo 360 độ xoay đa chiều mẫu ${product.name} kích thước ${product.sizes.join(', ')}. Quét QR xem ngay trên điện thoại với cảm biến con quay hồi chuyển.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: product.images.thumbnail || '/panoramas/airson-hk-2256.jpg',
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export default async function Product360Page({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  // Default preset scenes
  const presetScenes: Scene360[] = [
    {
      id: 'orinda-airson',
      name: 'Phòng khách Orinda Royal',
      url: '/panoramas/airson-hk-2256.jpg',
      thumbnail: '/images/products/orinda-airson/face-main.jpg',
      roomType: 'Phòng khách'
    },
    {
      id: 'living-luxe',
      name: 'Phòng khách Living Luxe',
      url: 'https://grandtiles.com.vn/static/pano720/scenes/SCN-01-living-luxe/SCN-01-living-luxe_web4k.jpg',
      thumbnail: 'https://grandtiles.com.vn/static/pano720/scenes/SCN-01-living-luxe/SCN-01-living-luxe_web4k.jpg',
      roomType: 'Biệt thự cao cấp'
    },
    {
      id: 'hotel-lobby',
      name: 'Đại sảnh Hotel Grand',
      url: 'https://grandtiles.com.vn/static/pano720/scenes/SCN-15-hotel-lobby/SCN-15-hotel-lobby_web4k.jpg',
      thumbnail: 'https://grandtiles.com.vn/static/pano720/scenes/SCN-15-hotel-lobby/SCN-15-hotel-lobby_web4k.jpg',
      roomType: 'Đại sảnh'
    }
  ];

  // If product has specific panorama, put it first
  let initialUrl = '/panoramas/airson-hk-2256.jpg';
  let scenes = presetScenes;

  if (product?.images?.panorama360 || product?.panorama360) {
    const customPano = (product.images?.panorama360 || product.panorama360) as string;
    initialUrl = customPano;
    scenes = [
      {
        id: `prod-${product.id}`,
        name: `${product.code} - Không gian mẫu`,
        url: customPano,
        thumbnail: product.images.thumbnail,
        roomType: 'Không gian gạch'
      },
      ...presetScenes.filter(s => s.url !== customPano)
    ];
  }

  return (
    <main className="w-screen h-screen overflow-hidden bg-stone-950">
      <Viewer360
        initialPanoramaUrl={initialUrl}
        product={product}
        scenes={scenes}
        title={product ? `${product.name} (${product.code})` : 'Trải nghiệm không gian 360°'}
        subtitle={product ? `${product.brand} · ${product.sizes.join(', ')} · ${product.surface}` : undefined}
      />
    </main>
  );
}
