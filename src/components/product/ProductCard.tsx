'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  aspectRatio?: 'square' | 'portrait';
}

export default function ProductCard({ product, aspectRatio = 'portrait' }: ProductCardProps) {
  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-[4/5]';
  const [imgSrc, setImgSrc] = React.useState(product.images.thumbnail);

  return (
    <article className="group flex flex-col bg-white border border-[#D5CDBE]/70 hover:border-[#B85C38] transition-all duration-300">
      {/* Image container */}
      <Link
        href={`/products/${product.slug}`}
        className={`relative ${aspectClass} overflow-hidden bg-[#FAF8F4] block`}
      >
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={() => {
            if (!imgSrc.includes('product-photo')) {
              setImgSrc(`https://grandtiles.com.vn/product-photo/${product.code}/${product.code}__4_product_photo_v1.png`);
            } else {
              setImgSrc('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80');
            }
          }}
        />
        {/* Surface tag */}
        <div className="absolute top-3 left-3 bg-[#1C1B19]/85 text-[#F5F1EA] text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider">
          {product.surface}
        </div>
        {product.new && (
          <div className="absolute top-3 right-3 bg-[#B85C38] text-[#F5F1EA] text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider">
            Mới
          </div>
        )}
      </Link>

      {/* Meta details */}
      <div className="p-4 md:p-5 flex flex-col flex-1 justify-between bg-[#FAF8F4]/50">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8B7C66] mb-1.5 uppercase">
            <span>{product.brand}</span>
            <span>{product.code}</span>
          </div>

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-base text-[#1C1B19] group-hover:text-[#B85C38] transition-colors leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <div className="text-xs text-[#8B7C66] mt-2 flex items-center gap-2">
            <span>{product.sizes[0]}</span>
            <span>·</span>
            <span>{product.material}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#D5CDBE]/50 flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-[#1C1B19]">
            {product.price || 'Liên hệ báo giá'}
          </span>
          <Link
            href={`/products/${product.slug}`}
            className="text-xs font-mono text-[#8B7C66] group-hover:text-[#B85C38] flex items-center gap-1 transition-colors"
          >
            Chi tiết <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
