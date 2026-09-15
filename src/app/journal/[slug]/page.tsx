import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import { JOURNAL_ARTICLES, getArticleBySlug } from '@/data/mockData';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return JOURNAL_ARTICLES.map((a) => ({
    slug: a.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: 'Không tìm thấy bài viết | Thường Sơn Ceramic' };
  }

  return {
    title: `${article.title} | Thường Sơn Journal`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.image }],
    },
  };
}

export default async function JournalDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = JOURNAL_ARTICLES.filter((a) => a.slug !== article.slug);

  return (
    <div className="bg-[#F5F1EA] py-12 md:py-20">
      {/* Top Header & Breadcrumb */}
      <div className="max-w-[800px] mx-auto px-5 mb-10">
        <Link
          href="/journal"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#8B7C66] hover:text-[#B85C38] mb-8"
        >
          <ArrowLeft size={13} /> Quay lại cẩm nang
        </Link>

        <div className="flex items-center gap-3 text-xs font-mono text-[#8B7C66] mb-4">
          <span className="text-[#B85C38] uppercase font-medium">{article.category}</span>
          <span>·</span>
          <span>{article.date}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {article.readTime}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#1C1B19] leading-[1.18] tracking-tight mb-6">
          {article.title}
        </h1>

        <p className="font-serif italic text-lg sm:text-xl text-[#8B7C66] leading-relaxed pb-8 border-b border-[#D5CDBE]">
          {article.excerpt}
        </p>
      </div>

      {/* Breakout Hero Image (Max-w 1100px) */}
      <div className="max-w-[1100px] mx-auto px-5 mb-16">
        <div className="relative aspect-[16/9] bg-[#EBE5DA] overflow-hidden border border-[#D5CDBE]">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1100px"
            className="object-cover"
          />
          <div className="absolute bottom-3 left-4 bg-[#1C1B19]/80 text-[#F5F1EA] text-[10px] font-mono px-2.5 py-1">
            Ảnh nghiên cứu thực tế · Thường Sơn Monograph
          </div>
        </div>
      </div>

      {/* Main Reading Column (Strictly Max-w 750px for optimum typography) */}
      <div className="max-w-[750px] mx-auto px-5 space-y-8">
        {article.content.map((section, idx) => (
          <div key={idx} className="space-y-4">
            {section.heading && (
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1C1B19] pt-4">
                {section.heading}
              </h2>
            )}

            {section.paragraph && (
              <p className="text-base sm:text-lg text-[#1C1B19]/85 font-light leading-[1.75]">
                {section.paragraph}
              </p>
            )}

            {section.quote && (
              <blockquote className="my-8 py-6 px-8 bg-[#FAF8F4] border-l-2 border-[#B85C38] font-serif italic text-xl sm:text-2xl text-[#1C1B19] leading-snug">
                &ldquo;{section.quote}&rdquo;
              </blockquote>
            )}
          </div>
        ))}

        {/* Author Colophon Box */}
        <div className="mt-16 pt-8 border-t border-[#D5CDBE] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B7C66] block">
              Tác giả nghiên cứu
            </span>
            <strong className="font-serif text-base text-[#1C1B19] mt-0.5 block">
              {article.author}
            </strong>
          </div>
          <div className="text-xs font-mono text-[#8B7C66]">
            Thường Sơn Publications
          </div>
        </div>
      </div>

      {/* Related Articles Footer */}
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12 mt-24 pt-16 border-t border-[#D5CDBE]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-serif text-2xl font-light text-[#1C1B19]">
            Bài Viết Liên Quan Khác
          </h3>
          <Link href="/journal" className="text-xs font-mono uppercase text-[#B85C38] hover:underline">
            Tất cả cẩm nang →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {relatedArticles.map((rel) => (
            <Link
              key={rel.id}
              href={`/journal/${rel.slug}`}
              className="p-6 bg-white border border-[#D5CDBE] hover:border-[#B85C38] block transition-all group"
            >
              <span className="text-[10px] font-mono uppercase text-[#B85C38] block mb-2">
                {rel.category}
              </span>
              <h4 className="font-serif text-xl font-normal text-[#1C1B19] group-hover:text-[#B85C38] transition-colors mb-2">
                {rel.title}
              </h4>
              <p className="text-xs text-[#8B7C66] line-clamp-2 leading-relaxed">
                {rel.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
