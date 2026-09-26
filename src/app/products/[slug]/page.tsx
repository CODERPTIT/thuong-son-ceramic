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

  const productUrl = `https://thuong-son-ceramic.vercel.app/products/${product.slug}`;
  const images = [
    product.images.thumbnail,
    product.images.fullFace,
    product.images.inSpace,
  ].filter(Boolean) as string[];

  return {
    title: `${product.name} (${product.code})`,
    description: `${product.description} Kích thước: ${product.sizes.join(', ')}. Bề mặt: ${product.surface}. Thương hiệu: ${product.brand}. Phân phối chính hãng tại Thường Sơn Ceramic Hoằng Lộc, Thanh Hóa.`,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.name} (${product.code}) — Thường Sơn Ceramic`,
      description: product.description,
      url: productUrl,
      images: images.map((url) => ({ url, alt: `${product.name} - ${product.code}` })),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} (${product.code}) | Thường Sơn Ceramic`,
      description: product.description,
      images: [product.images.thumbnail],
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

  const productUrl = `https://thuong-son-ceramic.vercel.app/products/${product.slug}`;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [
      product.images.fullFace || product.images.thumbnail,
      product.images.inSpace,
      product.images.closeUp,
    ].filter(Boolean),
    description: product.description,
    sku: product.code,
    mpn: product.code,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Ý MỸ Ceramic',
    },
    category: 'Gạch ốp lát',
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'VND',
      price: '0',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Công ty TNHH Thường Sơn',
      },
    },
  };

  const breadcrumbSchema = {
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
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailView
        product={product}
        similarProducts={similarProducts}
        collection={collection}
      />
    </>
  );
}
