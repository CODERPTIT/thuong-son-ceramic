import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import { JOURNAL_ARTICLES } from '@/data/mockData';

export const metadata: Metadata = {
  title: 'Cẩm Nang Kiến Trúc & Nghiên Cứu Bề Mặt | Thường Sơn Journal',
  description: 'Các bài viết phân tích chuyên sâu về tỷ lệ gạch, hiệu ứng ánh sáng trên men sứ và xu hướng vật liệu kiến trúc đương đại.',
};

export default function JournalPage() {
  const featuredArticle = JOURNAL_ARTICLES[0];
  const remainingArticles = JOURNAL_ARTICLES.slice(1);

  return (
    <div className="py-12 md:py-20 bg-[#F5F1EA]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        {/* Editorial Masthead */}
        <div className="text-center max-w-3xl mx-auto mb-16 pb-10 border-b border-[#D5CDBE]">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#B85C38] block mb-3">
            — THE GRAND MONOGRAPH —
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-light text-[#1C1B19] leading-tight mb-4">
            Cẩm Nang Kiến Trúc &amp; Bề Mặt
          </h1>
          <p className="text-sm md:text-base text-[#1C1B19]/75 font-light leading-relaxed">
            Nơi ghi chép những cuộc đối thoại giữa kiến trúc sư, nghệ nhân chế tác gạch và ánh sáng tự nhiên.
          </p>
        </div>

        {/* Featured Cover Story Article (Breakout Header) */}
        {featuredArticle && (
          <article className="mb-20 bg-[#FAF8F4] border border-[#D5CDBE] overflow-hidden group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 relative aspect-[16/10] bg-[#EBE5DA] overflow-hidden">
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 left-4 bg-[#1C1B19]/85 text-[#F5F1EA] text-[10px] font-mono px-3 py-1 uppercase tracking-widest">
                  Bài viết tiêu biểu
                </div>
              </div>

              <div className="lg:col-span-5 p-8 lg:p-12 space-y-5">
                <div className="flex items-center gap-3 text-xs font-mono text-[#8B7C66]">
                  <span className="text-[#B85C38] font-medium">{featuredArticle.category}</span>
                  <span>·</span>
                  <span>{featuredArticle.date}</span>
                </div>

                <Link href={`/journal/${featuredArticle.slug}`}>
                  <h2 className="font-serif text-2xl sm:text-4xl font-light text-[#1C1B19] group-hover:text-[#B85C38] transition-colors leading-snug">
                    {featuredArticle.title}
                  </h2>
                </Link>

                <p className="text-sm text-[#1C1B19]/75 font-light leading-relaxed">
                  {featuredArticle.excerpt}
                </p>

                <div className="pt-4 border-t border-[#D5CDBE]/60 flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8B7C66]">{featuredArticle.author}</span>
                  <Link
                    href={`/journal/${featuredArticle.slug}`}
                    className="btn btn-ink text-xs py-2 px-4"
                  >
                    Đọc Bài Viết
                  </Link>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Secondary Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {remainingArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white border border-[#D5CDBE] hover:border-[#B85C38] transition-all p-6 flex flex-col justify-between group"
            >
              <div>
                <Link
                  href={`/journal/${article.slug}`}
                  className="relative aspect-[16/10] overflow-hidden bg-[#EBE5DA] block mb-5"
                >
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-[#1C1B19]/80 text-[#F5F1EA] text-[10px] font-mono px-2 py-0.5 uppercase">
                    {article.category}
                  </div>
                </Link>

                <div className="flex items-center gap-3 text-[11px] font-mono text-[#8B7C66] mb-2">
                  <span>{article.date}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {article.readTime}
                  </span>
                </div>

                <Link href={`/journal/${article.slug}`}>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1C1B19] group-hover:text-[#B85C38] transition-colors leading-snug mb-3">
                    {article.title}
                  </h3>
                </Link>

                <p className="text-xs md:text-sm text-[#1C1B19]/70 font-light leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#D5CDBE]/60 flex items-center justify-between text-xs font-mono">
                <span className="text-[#8B7C66]">{article.author}</span>
                <Link
                  href={`/journal/${article.slug}`}
                  className="text-[#B85C38] hover:underline flex items-center gap-1"
                >
                  Chi tiết <ArrowRight size={12} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
