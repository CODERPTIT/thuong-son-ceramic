import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from 'lucide-react';
import { JOURNAL_ARTICLES } from '@/data/mockData';

export default function JournalPreviewSection() {
  return (
    <section id="cam-nang" className="py-14 sm:py-20 md:py-36 bg-[#FAF8F4] border-b border-[#D5CDBE]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-16 gap-4 sm:gap-6">
          <div>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#8B7C66] block mb-2 sm:mb-3">
              — CẨM NANG KIẾN TRÚC —
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-[#1C1B19]">
              Bài Viết &amp; Nghiên Cứu Bề Mặt
            </h2>
          </div>
          <Link
            href="/journal"
            className="btn btn-ghost text-xs self-start md:self-auto"
          >
            Đọc Toàn Bộ Tạp Chí
          </Link>
        </div>

        {/* 3 Editorial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          {JOURNAL_ARTICLES.slice(0, 3).map((article) => (
            <article
              key={article.id}
              className="group flex flex-col bg-white border border-[#D5CDBE] hover:border-[#B85C38] transition-all duration-300"
            >
              {/* Image */}
              <Link
                href={`/journal/${article.slug}`}
                className="relative aspect-[16/10] overflow-hidden bg-[#EBE5DA] block"
              >
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#1C1B19]/85 text-[#F5F1EA] text-[10px] font-mono px-2 py-0.5 uppercase">
                  {article.category}
                </div>
              </Link>

              {/* Content */}
              <div className="p-5 sm:p-6 md:p-8 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#8B7C66] mb-3">
                    <span>{article.date}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {article.readTime}
                    </span>
                  </div>

                  <Link href={`/journal/${article.slug}`}>
                    <h3 className="font-serif text-lg sm:text-xl font-normal text-[#1C1B19] group-hover:text-[#B85C38] transition-colors leading-snug mb-2 sm:mb-3">
                      {article.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-[#1C1B19]/70 font-light leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#D5CDBE]/60 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#8B7C66] line-clamp-1">
                    {article.author}
                  </span>
                  <Link
                    href={`/journal/${article.slug}`}
                    className="text-xs font-mono text-[#B85C38] group-hover:translate-x-1 transition-transform flex items-center gap-1"
                  >
                    Đọc tiếp <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
