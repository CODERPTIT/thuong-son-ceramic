import nodemailer from 'nodemailer';

export const RECIPIENT_EMAIL = process.env.NOTIFICATION_EMAIL || 'nguyenhieu32005@gamil.com';

export interface AppointmentData {
  name: string;
  phone: string;
  space?: string;
  date?: string;
  timeSlot?: string;
  note?: string;
}

export interface InquiryData {
  name: string;
  phone: string;
  productCode?: string;
  productName?: string;
  area?: string;
  note?: string;
}

export interface MailerResult {
  success: boolean;
  delivered: boolean;
  message: string;
  zaloUrl: string;
  mailtoUrl: string;
  error?: string;
}

/**
 * Tạo transporter nodemailer nếu có cấu hình SMTP
 */
function getTransporter() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = port === 465;

  // Nếu dùng Gmail, nodemailer có sẵn service 'gmail' được tối ưu sẵn SSL/TLS và DNS
  if (host.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

/**
 * Gửi qua Resend API nếu có cấu hình RESEND_API_KEY
 */
async function sendViaResend(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.SMTP_FROM || 'Thường Sơn Ceramic <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html
      })
    });
    return res.ok;
  } catch (err) {
    console.error('[RESEND ERROR]', err);
    return false;
  }
}

/**
 * Gửi email thông báo Đặt Lịch Trải Nghiệm Showroom về nguyenhieu32005@gamil.com
 */
export async function sendAppointmentEmail(data: AppointmentData): Promise<MailerResult> {
  const targetEmail = RECIPIENT_EMAIL;
  const subject = `[THƯỜNG SƠN CERAMIC] Khách đặt lịch xem mẫu: ${data.name} (${data.phone})`;

  const bodyPlain = `Họ tên: ${data.name}\nSố điện thoại / Zalo: ${data.phone}\nKhông gian: ${data.space || 'Chưa chọn'}\nNgày hẹn: ${data.date || 'Linh hoạt'} (${data.timeSlot || 'Chưa chọn'})\nGhi chú: ${data.note || 'Không có'}`;
  const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyPlain)}`;
  const zaloUrl = `https://zalo.me/0916640316`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5F1EA; margin: 0; padding: 24px; }
          .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #D5CDBE; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #1C1B19; color: #F5F1EA; padding: 24px; border-bottom: 2px solid #B85C38; }
          .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 500; letter-spacing: 0.5px; }
          .header p { margin: 0; font-size: 12px; color: #D7CEBE; font-family: monospace; letter-spacing: 1px; }
          .body { padding: 28px 24px; color: #1C1B19; }
          .badge { display: inline-block; background: #FAF8F4; border: 1px solid #D5CDBE; color: #B85C38; font-size: 11px; font-family: monospace; padding: 4px 8px; border-radius: 2px; margin-bottom: 16px; font-weight: 600; }
          .field { margin-bottom: 16px; }
          .label { font-size: 11px; font-family: monospace; text-transform: uppercase; color: #8B7C66; margin-bottom: 4px; }
          .value { font-size: 15px; font-weight: 500; color: #1C1B19; }
          .phone-highlight { font-size: 18px; font-weight: 700; color: #B85C38; letter-spacing: 0.5px; }
          .note-box { background: #FAF8F4; border-left: 3px solid #B85C38; padding: 12px 16px; margin-top: 20px; font-size: 14px; color: #2A2825; font-style: italic; }
          .footer { padding: 18px 24px; background: #FAF8F4; border-top: 1px solid #D5CDBE; font-size: 12px; color: #8B7C66; text-align: center; }
          .btn-call { display: inline-block; background: #B85C38; color: #FFFFFF !important; text-decoration: none; padding: 10px 20px; font-size: 13px; font-weight: 600; border-radius: 3px; margin-top: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>CÔNG TY TNHH THƯỜNG SƠN</h1>
            <p>THÔNG BÁO ĐẶT LỊCH HẸN SHOWROOM</p>
          </div>
          <div class="body">
            <span class="badge">LỊCH HẸN TRỰC TUYẾN MỚI</span>
            
            <div class="field">
              <div class="label">Họ và tên khách hàng:</div>
              <div class="value">${data.name}</div>
            </div>

            <div class="field">
              <div class="label">Số điện thoại / Zalo (Bấm gọi ngay):</div>
              <div class="phone-highlight">
                <a href="tel:${data.phone}" style="color: #B85C38; text-decoration: none;">${data.phone}</a>
              </div>
            </div>

            <div class="field">
              <div class="label">Không gian quan tâm:</div>
              <div class="value">${data.space || 'Chưa chọn cụ thể'}</div>
            </div>

            <div class="field">
              <div class="label">Thời gian dự kiến ghé Showroom:</div>
              <div class="value">${data.date ? `Ngày: ${data.date}` : 'Linh hoạt'} · ${data.timeSlot || 'Chưa chọn khung giờ'}</div>
            </div>

            ${data.note ? `
              <div class="field">
                <div class="label">Ghi chú &amp; Nhu cầu của khách:</div>
                <div class="note-box">&ldquo;${data.note}&rdquo;</div>
              </div>
            ` : ''}

            <div style="text-align: center; margin-top: 24px;">
              <a href="tel:${data.phone}" class="btn-call">📞 GỌI CHO KHÁCH NGAY</a>
            </div>
          </div>
          <div class="footer">
            Email gửi tự động từ hệ thống Website Công ty TNHH Thường Sơn<br>
            Showroom: Sn 01 Đường đôi TL510, Đình Bảng, Xã Hoằng Lộc, Thanh Hóa
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Thử gửi qua Resend nếu có API key
  if (process.env.RESEND_API_KEY) {
    const resendSuccess = await sendViaResend(targetEmail, subject, htmlContent);
    if (resendSuccess) {
      console.log(`[MAIL RESEND] Đã gửi thành công lịch hẹn tới ${targetEmail}`);
      return { success: true, delivered: true, message: 'Đã gửi email thông báo thành công qua Resend.', zaloUrl, mailtoUrl };
    }
  }

  // 2. Thử gửi qua Nodemailer SMTP nếu có cấu hình
  const transporter = getTransporter();
  if (transporter) {
    try {
      const sender = process.env.SMTP_FROM || `"Thường Sơn Website" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`;
      await transporter.sendMail({
        from: sender,
        to: targetEmail,
        subject: subject,
        html: htmlContent
      });
      console.log(`[MAIL SMTP] Đã gửi thành công email đặt lịch tới ${targetEmail}`);
      return { success: true, delivered: true, message: 'Đã gửi email thông báo trực tiếp thành công.', zaloUrl, mailtoUrl };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[MAIL SMTP ERROR]', errorMsg);
      return { success: true, delivered: false, message: 'Đã tiếp nhận yêu cầu. Lỗi SMTP gửi email.', error: errorMsg, zaloUrl, mailtoUrl };
    }
  }

  // 3. Chưa có SMTP_PASS cấu hình
  console.log(`[MAIL PENDING CONFIG] Yêu cầu từ ${data.name} (${data.phone}) đã ghi nhận. Cần cấu hình SMTP_PASS trong .env.local hoặc Vercel để nhận email tự động.`);
  return { 
    success: true, 
    delivered: false, 
    message: 'Đã tiếp nhận yêu cầu vào hệ thống Thường Sơn.',
    zaloUrl,
    mailtoUrl
  };
}

/**
 * Gửi email thông báo Yêu Cầu Báo Giá & Mẫu Thật về nguyenhieu32005@gamil.com
 */
export async function sendInquiryEmail(data: InquiryData): Promise<MailerResult> {
  const targetEmail = RECIPIENT_EMAIL;
  const subject = `[THƯỜNG SƠN CERAMIC] Yêu cầu báo giá mẫu gạch: ${data.productCode || ''} - ${data.name} (${data.phone})`;

  const bodyPlain = `Khách hàng: ${data.name}\nSố điện thoại / Zalo: ${data.phone}\nMã gạch quan tâm: ${data.productCode || 'Chung'} - ${data.productName || ''}\nDiện tích dự tính: ${data.area || 'Chưa rõ'}\nGhi chú: ${data.note || 'Không có'}`;
  const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyPlain)}`;
  const zaloUrl = `https://zalo.me/0916640316`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5F1EA; margin: 0; padding: 24px; }
          .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #D5CDBE; border-radius: 4px; overflow: hidden; }
          .header { background: #1C1B19; color: #F5F1EA; padding: 20px; border-bottom: 2px solid #B85C38; }
          .header h1 { margin: 0; font-size: 18px; font-weight: 500; }
          .body { padding: 24px; }
          .label { font-size: 11px; font-family: monospace; text-transform: uppercase; color: #8B7C66; margin-bottom: 3px; }
          .value { font-size: 15px; font-weight: 500; margin-bottom: 14px; }
          .phone { font-size: 18px; font-weight: 700; color: #B85C38; margin-bottom: 14px; }
          .btn-call { display: inline-block; background: #B85C38; color: #FFF !important; text-decoration: none; padding: 10px 18px; font-size: 13px; font-weight: 600; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>CÔNG TY TNHH THƯỜNG SƠN</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #D7CEBE; font-family: monospace;">YÊU CẦU BÁO GIÁ & XEM MẪU THẬT</p>
          </div>
          <div class="body">
            <div class="label">Khách hàng:</div>
            <div class="value">${data.name}</div>

            <div class="label">Số điện thoại / Zalo:</div>
            <div class="phone">
              <a href="tel:${data.phone}" style="color: #B85C38; text-decoration: none;">${data.phone}</a>
            </div>

            <div class="label">Mã gạch quan tâm:</div>
            <div class="value"><strong>${data.productCode || 'Chung'}</strong> — ${data.productName || ''}</div>

            ${data.area ? `
              <div class="label">Diện tích dự tính:</div>
              <div class="value">${data.area}</div>
            ` : ''}

            <div style="text-align: center; margin-top: 20px;">
              <a href="tel:${data.phone}" class="btn-call">📞 GỌI CHO KHÁCH NGAY</a>
              <br>
              <a href="https://zalo.me/${data.phone.replace(/[^0-9]/g, '')}" target="_blank" style="display: inline-block; font-size: 12px; color: #1C1B19; margin-top: 8px; text-decoration: underline;">
                Mở Chat Zalo với ${data.phone}
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Thử gửi qua Resend nếu có
  if (process.env.RESEND_API_KEY) {
    const resendSuccess = await sendViaResend(targetEmail, subject, htmlContent);
    if (resendSuccess) {
      console.log(`[MAIL RESEND] Đã gửi thành công yêu cầu báo giá tới ${targetEmail}`);
      return { success: true, delivered: true, message: 'Đã gửi email thông báo thành công qua Resend.', zaloUrl, mailtoUrl };
    }
  }

  // 2. Thử gửi qua Nodemailer SMTP
  const transporter = getTransporter();
  if (transporter) {
    try {
      const sender = process.env.SMTP_FROM || `"Thường Sơn Website" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`;
      await transporter.sendMail({
        from: sender,
        to: targetEmail,
        subject: subject,
        html: htmlContent
      });
      console.log(`[MAIL SMTP] Đã gửi thành công yêu cầu báo giá tới ${targetEmail}`);
      return { success: true, delivered: true, message: 'Đã gửi email thông báo thành công.', zaloUrl, mailtoUrl };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[MAIL SMTP ERROR]', errorMsg);
      return { success: true, delivered: false, message: 'Đã tiếp nhận yêu cầu. Lỗi kết nối SMTP.', error: errorMsg, zaloUrl, mailtoUrl };
    }
  }

  // 3. Chưa có SMTP_PASS
  console.log(`[MAIL PENDING CONFIG] Nhận yêu cầu báo giá mã ${data.productCode} từ ${data.name} (${data.phone}) tới ${targetEmail}.`);
  return { 
    success: true, 
    delivered: false, 
    message: 'Đã tiếp nhận thành công vào hệ thống Thường Sơn.',
    zaloUrl,
    mailtoUrl
  };
}
