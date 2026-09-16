'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, RotateCcw, Check, Sparkles } from 'lucide-react';
import { PRODUCTS } from '@/data/mockData';
import { Product } from '@/types';

const SPACES_OPTIONS = [
  { id: 'Phòng khách', label: 'Phòng khách', desc: 'Điểm nhìn trung tâm, cần khổ lớn' },
  { id: 'Phòng tắm', label: 'Phòng tắm', desc: 'Chống trơn R10-R11, dễ lau cặn' },
  { id: 'Phòng bếp', label: 'Phòng bếp', desc: 'Chịu nhiệt, chống ngấm dầu mỡ' },
  { id: 'Phòng ngủ', label: 'Phòng ngủ', desc: 'Tone màu ấm cúng, ánh sáng dịu' },
  { id: 'Ngoài trời', label: 'Ngoài trời', desc: 'Chịu tải cao, chống thời tiết' },
];

const AREA_OPTIONS = [
  { id: '<20', label: 'Dưới 20 m²', desc: 'Khổ 300x600, 600x600 cân đối' },
  { id: '20-40', label: '20 - 40 m²', desc: 'Khổ 600x1200 hoặc 800x800' },
  { id: '40-80', label: '40 - 80 m²', desc: 'Khổ lớn 800x1600 liền mạch' },
  { id: '>80', label: 'Trên 80 m²', desc: 'Slab 1200x2400 cao cấp' },
];

const STYLE_OPTIONS = [
  { id: 'Minimal', label: 'Tối Giản (Minimal)', desc: 'Gọn gàng, thanh lịch, ít chi tiết' },
  { id: 'Modern', label: 'Hiện Đại (Modern)', desc: 'Đương đại, chuẩn mực công năng' },
  { id: 'Luxury', label: 'Sang Trọng (Luxury)', desc: 'Cẩm thạch Ý, chỉ vàng hoàng gia' },
  { id: 'Natural', label: 'Tự Nhiên (Natural)', desc: 'Đá vôi mộc mạc, thiền định' },
  { id: 'Warm', label: 'Ấm Áp (Warm & Cozy)', desc: 'Vân gỗ sồi, tone đất nung' },
];

const COLOR_OPTIONS = [
  { id: 'Light', label: 'Sáng & Trắng (Light)', hex: '#F0EFEB' },
  { id: 'Warm', label: 'Beige & Đất (Warm)', hex: '#D7CEBE' },
  { id: 'Neutral', label: 'Xám Trung Tính (Neutral)', hex: '#9E9A93' },
  { id: 'Dark', label: 'Đen & Tro Đậm (Dark)', hex: '#2B2A28' },
];

const SURFACE_OPTIONS = [
  { id: 'Matt', label: 'Matt (Mờ mịn)', desc: 'Chống chói, cảm nhận tự nhiên' },
  { id: 'Polished', label: 'Polished (Bóng gương)', desc: 'Phản quang mở rộng không gian' },
  { id: 'Textured', label: 'Textured / Honed (Nhám sần)', desc: 'Chống trơn trượt R10 - R11' },
];

export default function MaterialFinderSection() {
  const [step, setStep] = useState(1);
  const [selectedSpace, setSelectedSpace] = useState<string>('Phòng khách');
  const [selectedArea, setSelectedArea] = useState<string>('20-40');
  const [selectedStyle, setSelectedStyle] = useState<string>('Modern');
  const [selectedColor, setSelectedColor] = useState<string>('Warm');
  const [selectedSurface, setSelectedSurface] = useState<string>('Matt');

  // Filter recommendations based on answers
  const recommendedProducts: Product[] = useMemo(() => {
    // Score products based on matching criteria
    const scored = PRODUCTS.map(product => {
      let score = 0;
      if (product.useCases.includes(selectedSpace)) score += 3;
      if (selectedSurface === 'Matt' && product.surface === 'Matt') score += 2;
      if (selectedSurface === 'Polished' && product.surface === 'Polished') score += 2;
      if (selectedSurface === 'Textured' && (product.surface === 'Textured' || product.surface === 'Honed')) score += 2;
      if (selectedStyle === 'Luxury' && product.material === 'Marble') score += 2;
      if (selectedStyle === 'Natural' && product.material === 'Stone') score += 2;
      if (selectedStyle === 'Minimal' && product.material === 'Cement') score += 2;
      if (selectedStyle === 'Warm' && (product.material === 'Wood' || product.material === 'Stone')) score += 2;
      return { product, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map(s => s.product);
  }, [selectedSpace, selectedSurface, selectedStyle]);

  const handleReset = () => {
    setStep(1);
    setSelectedSpace('Phòng khách');
    setSelectedArea('20-40');
    setSelectedStyle('Modern');
    setSelectedColor('Warm');
    setSelectedSurface('Matt');
  };

  return (
    <section id="material-finder" className="py-14 sm:py-20 md:py-36 bg-[#1C1B19] text-[#F5F1EA] border-b border-[#2A2825] relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#B85C38] mb-2 sm:mb-3">
            <Sparkles size={14} /> TÌM VẬT LIỆU TƯƠNG TÁC
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-white leading-tight mb-3 sm:mb-4">
            Material Finder
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#F5F1EA]/70 font-light leading-relaxed">
            Trả lời 5 câu hỏi nhanh để tìm ra mẫu gạch lý tưởng có tỷ lệ, ánh sáng và bề mặt hòa hợp tuyệt đối với không gian sống của bạn.
          </p>
        </div>

        {/* Wizard Container */}
        <div className="max-w-4xl mx-auto bg-[#292825] border border-white/10 p-4 sm:p-8 md:p-12 shadow-2xl relative">
          {/* Step Progress Tracker */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 transition-all duration-300 ${
                    s === step
                      ? 'w-8 bg-[#B85C38]'
                      : s < step
                      ? 'w-4 bg-white/60'
                      : 'w-4 bg-white/20'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#8B7C66]">
              {step <= 5 ? `Bước ${step} / 5` : 'Kết Quả Đề Xuất'}
            </span>
          </div>

          {/* STEP 1: Space */}
          {step === 1 && (
            <div>
              <h3 className="font-serif text-2xl md:text-3xl font-light text-white mb-2">
                1. Bạn đang hoàn thiện không gian nào?
              </h3>
              <p className="text-xs font-mono text-[#8B7C66] mb-8">
                Mỗi không gian có yêu cầu riêng biệt về chống trơn trượt và độ chịu lực.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SPACES_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedSpace(opt.id)}
                    className={`p-5 text-left border transition-all flex items-start justify-between ${
                      selectedSpace === opt.id
                        ? 'bg-[#B85C38]/15 border-[#B85C38] text-white'
                        : 'bg-[#1C1B19]/50 border-white/10 hover:border-white/30 text-[#F5F1EA]/80'
                    }`}
                  >
                    <div>
                      <span className="font-serif text-lg font-normal block text-white">{opt.label}</span>
                      <span className="text-xs font-light text-[#8B7C66] mt-1 block">{opt.desc}</span>
                    </div>
                    {selectedSpace === opt.id && <Check size={18} className="text-[#B85C38] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Area */}
          {step === 2 && (
            <div>
              <h3 className="font-serif text-2xl md:text-3xl font-light text-white mb-2">
                2. Diện tích ước tính của căn phòng?
              </h3>
              <p className="text-xs font-mono text-[#8B7C66] mb-8">
                Tỷ lệ khổ gạch tương ứng với diện tích giúp giảm thiểu hao hụt và đường ron vụn.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AREA_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedArea(opt.id)}
                    className={`p-5 text-left border transition-all flex items-start justify-between ${
                      selectedArea === opt.id
                        ? 'bg-[#B85C38]/15 border-[#B85C38] text-white'
                        : 'bg-[#1C1B19]/50 border-white/10 hover:border-white/30 text-[#F5F1EA]/80'
                    }`}
                  >
                    <div>
                      <span className="font-serif text-lg font-normal block text-white">{opt.label}</span>
                      <span className="text-xs font-light text-[#8B7C66] mt-1 block">{opt.desc}</span>
                    </div>
                    {selectedArea === opt.id && <Check size={18} className="text-[#B85C38] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Style */}
          {step === 3 && (
            <div>
              <h3 className="font-serif text-2xl md:text-3xl font-light text-white mb-2">
                3. Phong cách kiến trúc hướng đến?
              </h3>
              <p className="text-xs font-mono text-[#8B7C66] mb-8">
                Chọn phong cách để hệ thống lọc chất liệu tương ứng (Marble, Stone, Cement, Wood).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedStyle(opt.id)}
                    className={`p-5 text-left border transition-all flex items-start justify-between ${
                      selectedStyle === opt.id
                        ? 'bg-[#B85C38]/15 border-[#B85C38] text-white'
                        : 'bg-[#1C1B19]/50 border-white/10 hover:border-white/30 text-[#F5F1EA]/80'
                    }`}
                  >
                    <div>
                      <span className="font-serif text-lg font-normal block text-white">{opt.label}</span>
                      <span className="text-xs font-light text-[#8B7C66] mt-1 block">{opt.desc}</span>
                    </div>
                    {selectedStyle === opt.id && <Check size={18} className="text-[#B85C38] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Color Tone */}
          {step === 4 && (
            <div>
              <h3 className="font-serif text-2xl md:text-3xl font-light text-white mb-2">
                4. Tone màu sắc chủ đạo mong muốn?
              </h3>
              <p className="text-xs font-mono text-[#8B7C66] mb-8">
                Màu sắc quyết định độ sáng và nhiệt độ cảm xúc của không gian.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedColor(opt.id)}
                    className={`p-5 text-left border transition-all flex items-center justify-between ${
                      selectedColor === opt.id
                        ? 'bg-[#B85C38]/15 border-[#B85C38] text-white'
                        : 'bg-[#1C1B19]/50 border-white/10 hover:border-white/30 text-[#F5F1EA]/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: opt.hex }}
                      />
                      <span className="font-serif text-base font-normal text-white">{opt.label}</span>
                    </div>
                    {selectedColor === opt.id && <Check size={18} className="text-[#B85C38] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Surface */}
          {step === 5 && (
            <div>
              <h3 className="font-serif text-2xl md:text-3xl font-light text-white mb-2">
                5. Hiệu ứng bề mặt mong muốn?
              </h3>
              <p className="text-xs font-mono text-[#8B7C66] mb-8">
                Cân nhắc giữa độ bắt sáng và tính năng chống trơn an toàn khi sử dụng.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {SURFACE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedSurface(opt.id)}
                    className={`p-5 text-left border transition-all flex flex-col justify-between ${
                      selectedSurface === opt.id
                        ? 'bg-[#B85C38]/15 border-[#B85C38] text-white'
                        : 'bg-[#1C1B19]/50 border-white/10 hover:border-white/30 text-[#F5F1EA]/80'
                    }`}
                  >
                    <div>
                      <span className="font-serif text-base font-normal block text-white">{opt.label}</span>
                      <span className="text-xs font-light text-[#8B7C66] mt-1 block">{opt.desc}</span>
                    </div>
                    {selectedSurface === opt.id && <Check size={18} className="text-[#B85C38] mt-3 self-end" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Recommendations Result */}
          {step === 6 && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl font-light text-white">
                    3 Mẫu Gạch Đề Xuất Phù Hợp Nhất
                  </h3>
                  <p className="text-xs font-mono text-[#B85C38] mt-1">
                    Đã lọc theo: {selectedSpace} · Diện tích {selectedArea}m² · Phong cách {selectedStyle} · Bề mặt {selectedSurface}
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs font-mono uppercase tracking-wider text-[#8B7C66] hover:text-[#B85C38] flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={14} /> Làm lại
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {recommendedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-[#1C1B19] border border-white/15 p-4 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative aspect-square overflow-hidden bg-black/40 mb-3">
                        <Image
                          src={prod.images.thumbnail}
                          alt={prod.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 bg-[#1C1B19]/80 text-[10px] font-mono px-2 py-0.5 text-white">
                          {prod.surface}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono uppercase text-[#8B7C66]">
                        {prod.brand} · {prod.code}
                      </div>
                      <h4 className="font-serif text-base text-white mt-1 group-hover:text-[#B85C38] transition-colors">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-[#8B7C66] mt-1">
                        Khổ: {prod.sizes[0]}
                      </p>
                    </div>

                    <Link
                      href={`/products/${prod.slug}`}
                      className="mt-4 pt-3 border-t border-white/10 text-xs font-mono text-[#B85C38] hover:underline flex items-center justify-between"
                    >
                      <span>Xem hồ sơ kỹ thuật</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>

              <div className="bg-[#1C1B19]/70 border border-white/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[#F5F1EA]/80 font-light">
                  Muốn mang các mẫu này về thử với ánh sáng thực tế tại công trình?
                </p>
                <Link href="/showroom" className="btn btn-clay text-[11px] py-2 px-4 whitespace-nowrap">
                  Đặt Lịch Xem Mẫu Tại Showroom
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          {step <= 5 && (
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="text-xs font-mono uppercase tracking-widest text-[#8B7C66] hover:text-white transition-colors"
                >
                  ← Quay lại
                </button>
              ) : (
                <span />
              )}

              <button
                onClick={() => setStep(step + 1)}
                className="btn btn-clay text-xs flex items-center gap-2"
              >
                <span>{step === 5 ? 'Xem Kết Quả Đề Xuất' : 'Tiếp tục'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
