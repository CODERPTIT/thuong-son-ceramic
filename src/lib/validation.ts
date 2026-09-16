/**
 * Chuẩn hóa và kiểm tra số điện thoại di động Việt Nam hợp lệ:
 * - Phải có đúng 10 chữ số
 * - Bắt đầu bằng các đầu số di động chuẩn: 03, 05, 07, 08, 09 (hoặc +84 tương đương)
 */
export function validateVietnamesePhone(phone: string): { isValid: boolean; error?: string; formatted?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Vui lòng nhập số điện thoại.' };
  }

  // Loại bỏ khoảng trắng, dấu chấm, dấu gạch nối, dấu ngoặc
  let clean = phone.trim().replace(/[\s.\-()]/g, '');

  // Xử lý đầu số quốc tế +84 hoặc 84
  if (clean.startsWith('+84')) {
    clean = '0' + clean.slice(3);
  } else if (clean.startsWith('84') && clean.length === 11) {
    clean = '0' + clean.slice(2);
  }

  // Kiểm tra chỉ chứa chữ số
  if (!/^\d+$/.test(clean)) {
    return { isValid: false, error: 'Số điện thoại chỉ được chứa các chữ số.' };
  }

  // Kiểm tra độ dài đúng 10 chữ số
  if (clean.length !== 10) {
    return { 
      isValid: false, 
      error: `Số điện thoại phải gồm đúng 10 chữ số (hiện có ${clean.length} số).` 
    };
  }

  // Kiểm tra đầu số nhà mạng Việt Nam hợp lệ (03, 05, 07, 08, 09)
  const validPrefixes = /^(03|05|07|08|09)\d{8}$/;
  if (!validPrefixes.test(clean)) {
    return { 
      isValid: false, 
      error: 'Đầu số không hợp lệ. Vui lòng nhập số di động bắt đầu bằng 03, 05, 07, 08 hoặc 09.' 
    };
  }

  return { isValid: true, formatted: clean };
}
