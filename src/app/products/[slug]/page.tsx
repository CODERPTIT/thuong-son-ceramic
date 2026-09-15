import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS, getProductBySlug, getCollectionBySlug } from '@/data/mockData';
import ProductDetailView from '@/components/product/ProductDetailView';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm | Thường Sơn Ceramic',
    };
  }

  return {
    title: `${product.name} (${product.code}) | Thường Sơn Ceramic`,
    description: `${product.description} Kích thước: ${product.sizes.join(', ')}. Bề mặt: ${product.surface}. Thương hiệu: ${product.brand}.`,
    openGraph: {
      title: `${product.name} — Thường Sơn Ceramic`,
      description: product.description,
      images: [{ url: product.images.thumbnail }],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const collection = getCollectionBySlug(product.collectionSlug);

  // Filter similar products (same material or collection, excluding current)
  const similarProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.material === product.material || p.collectionSlug === product.collectionSlug)
  ).slice(0, 4);

  return (
    <ProductDetailView
      product={product}
      similarProducts={similarProducts}
      collection={collection}
    />
  );
}
