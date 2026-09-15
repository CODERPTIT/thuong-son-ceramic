'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { PRODUCTS } from '@/data/mockData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_TAGS = ['Statuario', 'Bê tông', 'Travertine', 'Chống trơn R10', 'Calacatta', 'Khổ lớn 600x1200', 'Terrazzo'];
const RECENT_SEARCHES = ['MM48001', 'Gạch phòng tắm', 'Apodio 300x600'];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Filter products by query
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PRODUCTS.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.useCases.some(u => u.toLowerCase().includes(q))
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tìm kiếm sản phẩm và vật liệu"
      className="fixed inset-0 z-50 bg-[#1C1B19]/80 backdrop-blur-md flex flex-col justify-start items-center px-4 pt-16 md:pt-24 transition-opacity"
    >
      <div className="w-full max-w-4xl bg-[#F5F1EA] border border-[#D5CDBE] shadow-2xl p-6 md:p-10 relative max-h-[85vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Đóng tìm kiếm"
          className="absolute top-6 right-6 p-2 text-[#1C1B19]/60 hover:text-[#B85C38] transition-colors"
        >
          <X size={24} />
        </button>

        {/* Search Input Box */}
        <div className="flex items-center border-b-2 border-[#1C1B19] pb-3 mb-6">
          <Search size={24} className="text-[#1C1B19]/50 mr-4" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo mã gạch (MM48001), tên, chất liệu, không gian..."
            className="w-full bg-transparent text-xl md:text-2xl font-serif text-[#1C1B19] placeholder:text-[#1C1B19]/35 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs uppercase font-mono tracking-widest text-[#8B7C66] hover:text-[#B85C38] ml-2"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Content area: Results OR Suggestions */}
        <div className="overflow-y-auto no-scrollbar flex-1 pr-1">
          {query.trim() ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-widest font-mono text-[#8B7C66]">
                  Kết quả ({searchResults.length})
                </span>
                {searchResults.length > 0 && (
                  <Link
                    href={`/catalog?q=${encodeURIComponent(query)}`}
                    onClick={onClose}
                    className="text-xs text-[#B85C38] hover:underline flex items-center gap-1 font-mono uppercase"
                  >
                    Xem tất cả trong catalog <ArrowRight size={14} />
                  </Link>
                )}
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-12 text-[#8B7C66]">
                  <p className="font-serif text-lg text-[#1C1B19] mb-2">Không tìm thấy mã hoặc vật liệu phù hợp</p>
                  <p className="text-sm">Hãy thử tìm theo tên dòng sản phẩm (Marble, Travertine) hoặc mã ngắn.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 p-3 bg-white/70 hover:bg-white border border-[#D5CDBE]/50 hover:border-[#B85C38] transition-all group"
                    >
                      <div className="w-16 h-16 relative bg-[#FAF8F4] shrink-0 overflow-hidden">
                        <Image
                          src={product.images.thumbnail}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-mono text-[#8B7C66] uppercase">
                          {product.brand} · {product.code}
                        </div>
                        <h4 className="font-serif text-sm font-medium text-[#1C1B19] truncate group-hover:text-[#B85C38] transition-colors">
                          {product.name}
                        </h4>
                        <div className="text-xs text-[#8B7C66] mt-1">
                          {product.sizes[0]} · Bề mặt {product.surface}
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-[#1C1B19]/30 group-hover:text-[#B85C38] shrink-0 mr-2" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              {/* Recent searches */}
              <div>
                <h4 className="text-xs uppercase tracking-widest font-mono text-[#8B7C66] mb-3 flex items-center gap-1.5">
                  <Sparkles size={14} /> Tìm kiếm gần đây
                </h4>
                <div className="flex flex-wrap gap-2">
                  {RECENT_SEARCHES.map((item) => (
                    <button
                      key={item}
                      onClick={() => setQuery(item)}
                      className="text-xs px-3 py-1.5 bg-white/60 hover:bg-white border border-[#D5CDBE] text-[#1C1B19] transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular tags */}
              <div>
                <h4 className="text-xs uppercase tracking-widest font-mono text-[#8B7C66] mb-3">
                  Từ khóa phổ biến
                </h4>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="text-xs px-3 py-1.5 bg-white/60 hover:bg-white border border-[#D5CDBE] text-[#1C1B19] hover:border-[#B85C38] transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
