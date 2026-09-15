import { NextResponse } from 'next/server';
import { sendAppointmentEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, space, date, timeSlot, note } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đầy đủ họ tên và số điện thoại / Zalo.' },
        { status: 400 }
      );
    }

    const result = await sendAppointmentEmail({
      name: String(name).trim(),
      phone: String(phone).trim(),
      space: space ? String(space).trim() : undefined,
      date: date ? String(date).trim() : undefined,
      timeSlot: timeSlot ? String(timeSlot).trim() : undefined,
      note: note ? String(note).trim() : undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Đặt lịch thành công! Đội ngũ Thường Sơn sẽ liên hệ qua điện thoại hoặc Zalo trong ít phút.',
      details: result
    });
  } catch (error) {
    console.error('Lỗi khi xử lý đặt lịch hẹn:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xử lý yêu cầu. Quý khách vui lòng gọi trực tiếp hotline 0916 640 316.' },
      { status: 500 }
    );
  }
}
