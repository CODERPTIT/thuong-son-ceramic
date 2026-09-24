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

// Encode spaces in URL paths so browsers fetch correctly
function sanitizeImageUrl(url: string): string {
  if (!url) return '';
  try {
    // Only encode the path portion, not the full URL
    const u = new URL(url);
    u.pathname = u.pathname.split('/').map(seg => encodeURIComponent(decodeURIComponent(seg))).join('/');
    return u.toString();
  } catch {
    return url;
  }
}

export default function ProductCard({ product, aspectRatio = 'portrait' }: ProductCardProps) {
  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-[4/5]';
  const encodedCode = encodeURIComponent(product.code);
  const showcaseImage = product.images.inSpace || product.images.thumbnail;
  const [imgSrc, setImgSrc] = React.useState(sanitizeImageUrl(showcaseImage));

  React.useEffect(() => {
    setImgSrc(sanitizeImageUrl(product.images.inSpace || product.images.thumbnail));
  }, [product.images.inSpace, product.images.thumbnail]);

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
              setImgSrc(`https://grandtiles.com.vn/product-photo/${encodedCode}/${encodedCode}__4_product_photo_v1.png`);
            } else {
              setImgSrc('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80');
            }
          }}
        />
        {/* Surface tag */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#1C1B19]/85 text-[#F5F1EA] text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 uppercase tracking-wider">
          {product.surface}
        </div>
        {product.new && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#B85C38] text-[#F5F1EA] text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 uppercase tracking-wider">
            Mới
          </div>
        )}
      </Link>

      {/* Meta details */}
      <div className="p-2.5 sm:p-4 md:p-5 flex flex-col flex-1 justify-between bg-[#FAF8F4]/50">
        <div>
          <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-mono text-[#8B7C66] mb-1 sm:mb-1.5 uppercase">
            <span className="truncate max-w-[55%]">{product.brand}</span>
            <span className="truncate max-w-[45%] text-right">{product.code}</span>
          </div>

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-xs sm:text-base text-[#1C1B19] group-hover:text-[#B85C38] transition-colors leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <div className="text-[10px] sm:text-xs text-[#8B7C66] mt-1 sm:mt-2 flex items-center gap-1 sm:gap-2 truncate">
            <span>{product.sizes[0]}</span>
            <span>·</span>
            <span className="truncate">{product.material}</span>
          </div>
        </div>

        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-[#D5CDBE]/50 flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-xs font-mono font-medium text-[#1C1B19] truncate">
            {product.price || 'Liên hệ báo giá'}
          </span>
          <Link
            href={`/products/${product.slug}`}
            className="text-[10px] sm:text-xs font-mono text-[#8B7C66] group-hover:text-[#B85C38] flex items-center gap-0.5 sm:gap-1 transition-colors shrink-0"
          >
            <span>Chi tiết</span> <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
