import { NextResponse } from 'next/server';
import { sendInquiryEmail } from '@/lib/mailer';
import { validateVietnamesePhone } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, productCode, productName, area, note } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Vui lòng nhập họ tên và số điện thoại / Zalo.' },
        { status: 400 }
      );
    }

    const phoneCheck = validateVietnamesePhone(String(phone));
    if (!phoneCheck.isValid) {
      return NextResponse.json(
        { error: phoneCheck.error },
        { status: 400 }
      );
    }

    const result = await sendInquiryEmail({
      name: String(name).trim(),
      phone: phoneCheck.formatted!,
      productCode: productCode ? String(productCode).trim() : undefined,
      productName: productName ? String(productName).trim() : undefined,
      area: area ? String(area).trim() : undefined,
      note: note ? String(note).trim() : undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Đã nhận yêu cầu báo giá! Chuyên viên Thường Sơn sẽ liên hệ tư vấn trong 15 phút.',
      details: result
    });
  } catch (error) {
    console.error('Lỗi khi xử lý yêu cầu báo giá:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra. Quý khách vui lòng gọi trực tiếp hotline 0916 640 316.' },
      { status: 500 }
    );
  }
}
