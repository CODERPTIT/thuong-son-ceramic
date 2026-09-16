'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Clock, CheckCircle2, Navigation, MessageSquare, Mail } from 'lucide-react';
import { COMPANY_INFO } from '@/data/mockData';

const SHOWROOM_GALLERY = [
  {
    title: 'Khu Trưng Bày Slab Khổ Lớn',
    desc: 'Các phiến cẩm thạch 1200×2400 và 800×1600 được dựng đứng để quan sát toàn bộ nhịp vân.',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Bàn Trải Nghiệm Mẫu Gạch (Material Table)',
    desc: 'Khu vực thử nghiệm ánh sáng nhân tạo và tự nhiên với từng mẫu gạch thật.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Phòng Mẫu Phòng Tắm Tiêu Chuẩn',
    desc: 'Phối cảnh hoàn thiện gồm gạch ốp lát, thiết bị vệ sinh cao cấp và sen vòi.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Lounge Tiếp Đón Kiến Trúc Sư',
    desc: 'Không gian yên tĩnh để thảo luận bản vẽ và lựa chọn bảng màu vật liệu tổng thể.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
  },
];

import type { MailerResult } from '@/lib/mailer';

export default function ShowroomPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointmentResult, setAppointmentResult] = useState<MailerResult | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    space: 'Phòng khách',
    date: '',
    timeSlot: '08:30 - 10:30',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          space: formData.space,
          date: formData.date,
          timeSlot: formData.timeSlot,
          note: formData.notes,
        }),
      });
      const data = await res.json();
      if (data?.details) {
        setAppointmentResult(data.details);
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Lỗi gửi lịch hẹn:', err);
      // Vẫn hiển thị xác nhận cho khách và cung cấp liên kết Zalo trực tiếp
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F1EA]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-28 bg-[#1C1B19] text-[#F5F1EA] border-b border-[#2A2825]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#B85C38] block">
              — SHOWROOM TRẢI NGHIỆM VẬT LIỆU —
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-light text-white leading-tight">
              {COMPANY_INFO.name}
            </h1>
            <p className="text-base sm:text-lg text-[#F5F1EA]/80 font-light leading-relaxed">
              Showroom kiến trúc trưng bày gạch ốp lát cao cấp, cẩm thạch Ý, đá tự nhiên và thiết bị hoàn thiện phòng tắm. Nơi bạn nhìn tận mắt, sờ tận tay và đối chiếu bề mặt vật liệu trước khi đưa vào công trình.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#dat-lich"
                className="btn btn-clay text-xs"
              >
                Đặt Lịch Tư Vấn Mẫu Thật
              </a>
              <a
                href="#ban-do"
                className="btn btn-ghost text-white border-white/30 hover:border-[#B85C38] text-xs flex items-center gap-2"
              >
                <Navigation size={13} /> Xem Bản Đồ Chỉ Đường
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 relative aspect-[16/10] bg-[#2A2825] overflow-hidden border border-white/10">
            <Image
              src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80"
              alt="Mặt tiền và không gian trưng bày Showroom Thường Sơn Hoằng Lộc"
              fill
              priority
              className="object-cover"
            />
            <a
              href={COMPANY_INFO.mapDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 left-4 bg-[#1C1B19]/80 backdrop-blur-sm text-xs font-mono px-3 py-1 text-[#D7CEBE] hover:text-[#B85C38] transition-colors"
              title="Mở Google Maps chỉ đường"
            >
              📍 {COMPANY_INFO.address} ↗
            </a>
          </div>
        </div>
      </section>

      {/* Showroom Information Cards */}
      <section className="py-16 md:py-24 border-b border-[#D5CDBE]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Address */}
          <div className="p-8 bg-white border border-[#D5CDBE]">
            <MapPin size={24} className="text-[#B85C38] mb-4" />
            <h3 className="font-serif text-xl font-normal text-[#1C1B19] mb-2">
              Địa Chỉ Showroom
            </h3>
            <a
              href={COMPANY_INFO.mapDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#1C1B19]/75 font-light leading-relaxed mb-4 block hover:text-[#B85C38] transition-colors group"
              title="Mở bản đồ Google Maps chỉ đường"
            >
              <span className="group-hover:underline">{COMPANY_INFO.address}</span>
            </a>
            <div className="flex flex-col gap-2">
              <a
                href={COMPANY_INFO.mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono uppercase text-[#B85C38] hover:underline inline-flex items-center gap-1 font-medium"
              >
                Mở Google Maps chỉ đường ↗
              </a>
              <a
                href="#ban-do"
                className="text-xs font-mono uppercase text-[#8B7C66] hover:text-[#1C1B19] hover:underline inline-flex items-center gap-1"
              >
                Xem bản đồ nhúng bên dưới ↓
              </a>
            </div>
          </div>

          {/* Card 2: Hours */}
          <div className="p-8 bg-white border border-[#D5CDBE]">
            <Clock size={24} className="text-[#B85C38] mb-4" />
            <h3 className="font-serif text-xl font-normal text-[#1C1B19] mb-2">
              Thời Gian Mở Cửa
            </h3>
            <ul className="space-y-2 text-xs font-mono text-[#1C1B19]/80 mb-4">
              <li className="flex justify-between">
                <span>Thứ Hai - Thứ Bảy:</span>
                <strong>{COMPANY_INFO.openingHours.weekdays}</strong>
              </li>
              <li className="flex justify-between">
                <span>Chủ Nhật:</span>
                <strong>{COMPANY_INFO.openingHours.sunday}</strong>
              </li>
            </ul>
            <span className="text-[11px] text-[#8B7C66] font-mono block">
              * Có bãi đỗ xe ô tô rộng rãi và chỗ đón khách riêng biệt.
            </span>
          </div>

          {/* Card 3: Direct Contact */}
          <div className="p-8 bg-white border border-[#D5CDBE]">
            <Phone size={24} className="text-[#B85C38] mb-4" />
            <h3 className="font-serif text-xl font-normal text-[#1C1B19] mb-2">
              Hotline &amp; Zalo Trực Tiếp
            </h3>
            <div className="space-y-2.5 text-xs font-mono text-[#1C1B19]/80 mb-4">
              <div className="flex items-center justify-between">
                <span>Hotline / Zalo 1:</span>
                <a href="tel:0916640316" className="text-[#B85C38] font-bold">0916 640 316</a>
              </div>
              <div className="flex items-center justify-between">
                <span>Hotline / Zalo 2:</span>
                <a href="tel:0912958578" className="text-[#B85C38] font-bold">0912 958 578</a>
              </div>
              <div className="pt-2 border-t border-[#D5CDBE]/50 flex items-center gap-3">
                <a
                  href="https://zalo.me/0916640316"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#B85C38] hover:underline flex items-center gap-1"
                >
                  <MessageSquare size={12} /> Chat Zalo 1
                </a>
                <span>·</span>
                <a
                  href="https://zalo.me/0912958578"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#B85C38] hover:underline flex items-center gap-1"
                >
                  <MessageSquare size={12} /> Chat Zalo 2
                </a>
              </div>
              <div className="pt-2 border-t border-[#D5CDBE]/50 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Mail size={12} className="text-[#B85C38]" /> Email:
                </span>
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="text-[#B85C38] hover:underline font-mono text-[11px]"
                  title="Nhấn để gửi email cho Thường Sơn Ceramic"
                >
                  {COMPANY_INFO.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Google Maps Section */}
      <section id="ban-do" className="py-16 md:py-20 bg-[#FAF8F4] border-b border-[#D5CDBE]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#B85C38] block mb-2">
                — VỊ TRÍ GOOGLE MAPS —
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-light text-[#1C1B19]">
                Bản Đồ Đến Công Ty TNHH Thường Sơn
              </h2>
            </div>
            <a
              href="https://maps.google.com/?q=Công+ty+TNHH+Thường+Sơn+Hoằng+Lộc+Thanh+Hóa"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ink text-xs self-start md:self-auto flex items-center gap-2"
            >
              <Navigation size={13} /> Mở Ứng Dụng Google Maps
            </a>
          </div>

          {/* User's exact Google Maps Embed */}
          <div className="w-full bg-white border border-[#D5CDBE] shadow-sm overflow-hidden p-2">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15014.110678631532!2d105.83495825823277!3d19.817614004728835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313659c48b4c3e87%3A0x8e254cb7629c6c1d!2zQ8O0bmcgdHkgVE5ISCBUaMaw4budbmcgU8ahbg!5e0!3m2!1svi!2s!4v1789483459858!5m2!1svi!2s"
              width="100%"
              height="480"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Bản đồ vị trí Công ty TNHH Thường Sơn tại Hoằng Lộc Thanh Hóa"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Large Image Gallery (4 Gallery Spaces) */}
      <section className="py-20 md:py-28 border-b border-[#D5CDBE]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
          <div className="max-w-3xl mb-14">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8B7C66] block mb-2">
              — KHÔNG GIAN THỰC TẾ —
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1C1B19]">
              Ghé Thăm Showroom Thường Sơn
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SHOWROOM_GALLERY.map((item) => (
              <div
                key={item.title}
                className="bg-white border border-[#D5CDBE] overflow-hidden group"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#EBE5DA]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="font-serif text-xl font-normal text-[#1C1B19] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-[#1C1B19]/70 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Booking Form Section */}
      <section id="dat-lich" className="py-20 md:py-28 bg-[#FAF8F4]">
        <div className="max-w-4xl mx-auto px-5">
          <div className="bg-white border border-[#D5CDBE] p-8 md:p-14 shadow-lg">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#B85C38] block mb-2">
                — ĐẶT LỊCH HẸN TRƯỚC —
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1C1B19] mb-3">
                Đặt Lịch Trải Nghiệm &amp; Tư Vấn Mẫu
              </h2>
              <p className="text-xs md:text-sm text-[#1C1B19]/70 font-light leading-relaxed">
                Quý khách vui lòng để lại thông tin để Công ty TNHH Thường Sơn chuẩn bị trước nhóm mẫu gạch thực tế và cử chuyên viên tư vấn riêng tại showroom Hoằng Lộc.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 md:p-10 bg-[#FAF8F4] border border-[#B85C38] text-center space-y-4">
                <CheckCircle2 size={48} className="text-[#B85C38] mx-auto" />
                <h3 className="font-serif text-2xl md:text-3xl text-[#1C1B19]">
                  Đã Gửi Lịch Hẹn Thành Công!
                </h3>
                <p className="text-xs md:text-sm text-[#1C1B19]/75 font-light leading-relaxed max-w-md mx-auto">
                  Cảm ơn quý khách <strong>{formData.name}</strong>. Thông tin đã được tiếp nhận và xử lý ưu tiên gửi về ban quản lý Showroom Thường Sơn.
                </p>

                {/* Delivery Badge */}
                {appointmentResult?.delivered ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono">
                    <span>✓</span> Đã chuyển email trực tiếp tới <strong>{COMPANY_INFO.email}</strong>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono">
                    <span>ℹ</span> Đã lưu thông tin! Quý khách có thể bấm gửi nhanh qua Zalo hoặc Email bên dưới để được ưu tiên xếp lịch ngay:
                  </div>
                )}

                <p className="text-xs text-[#8B7C66] font-mono">
                  Thời gian hẹn: <strong>{formData.timeSlot}</strong> ngày <strong>{formData.date || 'sớm nhất'}</strong> · SĐT: <strong>{formData.phone}</strong>
                </p>

                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={appointmentResult?.zaloUrl || "https://zalo.me/0916640316"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-clay text-xs flex items-center gap-1.5"
                  >
                    <MessageSquare size={13} /> Chat Zalo 0916 640 316 (Xác Nhận Ngay)
                  </a>
                  {appointmentResult?.mailtoUrl && (
                    <a
                      href={appointmentResult.mailtoUrl}
                      className="btn btn-ghost text-xs flex items-center gap-1.5 border-[#D5CDBE] hover:border-[#B85C38]"
                    >
                      <Mail size={13} /> Gửi Thẳng Qua Email
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setAppointmentResult(null);
                      setFormData({
                        name: '',
                        phone: '',
                        space: 'Phòng khách',
                        date: '',
                        timeSlot: '08:30 - 10:30',
                        notes: '',
                      });
                    }}
                    className="btn btn-ghost text-xs"
                  >
                    Đặt Lịch Cho Công Trình Khác
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#8B7C66] uppercase mb-1.5">Họ và tên quý khách *</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full bg-[#FAF8F4] border border-[#D5CDBE] p-3 text-xs focus:outline-none focus:border-[#B85C38]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8B7C66] uppercase mb-1.5">Số điện thoại / Zalo *</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0916 640 316"
                      className="w-full bg-[#FAF8F4] border border-[#D5CDBE] p-3 text-xs focus:outline-none focus:border-[#B85C38]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[#8B7C66] uppercase mb-1.5">Không gian quan tâm</label>
                    <select
                      value={formData.space}
                      onChange={(e) => setFormData({ ...formData, space: e.target.value })}
                      className="w-full bg-[#FAF8F4] border border-[#D5CDBE] p-3 text-xs focus:outline-none focus:border-[#B85C38]"
                    >
                      <option value="Phòng khách">Phòng khách</option>
                      <option value="Phòng tắm">Phòng tắm</option>
                      <option value="Phòng bếp">Phòng bếp</option>
                      <option value="Phòng ngủ">Phòng ngủ</option>
                      <option value="Ngoài trời / Sân">Ngoài trời / Sân</option>
                      <option value="Toàn bộ công trình">Toàn bộ công trình</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#8B7C66] uppercase mb-1.5">Ngày dự kiến đến</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-[#FAF8F4] border border-[#D5CDBE] p-2.5 text-xs focus:outline-none focus:border-[#B85C38]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8B7C66] uppercase mb-1.5">Khung giờ</label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full bg-[#FAF8F4] border border-[#D5CDBE] p-3 text-xs focus:outline-none focus:border-[#B85C38]"
                    >
                      <option value="08:30 - 10:30">08:30 - 10:30 (Sáng)</option>
                      <option value="10:30 - 12:00">10:30 - 12:00 (Trưa)</option>
                      <option value="14:00 - 16:00">14:00 - 16:00 (Chiều)</option>
                      <option value="16:00 - 18:00">16:00 - 18:00 (Cuối ngày)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#8B7C66] uppercase mb-1.5">Ghi chú hoặc mã gạch đang cân nhắc</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ví dụ: Cần xem mẫu gạch Apodio 300x600 ACM-36001 hoặc Monalisa MM48001..."
                    className="w-full bg-[#FAF8F4] border border-[#D5CDBE] p-3 text-xs focus:outline-none focus:border-[#B85C38]"
                  />
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-ink text-xs py-3.5 px-8 disabled:opacity-50"
                  >
                    {loading ? 'Đang Gửi Thông Tin Đến Thường Sơn...' : 'Xác Nhận Đặt Lịch Hẹn Showroom'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
