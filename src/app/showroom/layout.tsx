import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Showroom Gạch Ốp Lát Thường Sơn Hoằng Lộc, Thanh Hóa | Đặt Lịch Xem Mẫu',
  description: 'Ghé thăm Showroom Thường Sơn Ceramic tại Sn 01 Đường đôi TL510, Đình Bảng, Xã Hoằng Lộc, Thanh Hóa. Trực tiếp trải nghiệm hơn 800+ mẫu gạch slab cẩm thạch, travertine, granite Ý MỸ, Apodio cao cấp.',
  alternates: {
    canonical: 'https://thuong-son-ceramic.vercel.app/showroom',
  },
  openGraph: {
    title: 'Showroom Gạch Ốp Lát Thường Sơn Hoằng Lộc, Thanh Hóa',
    description: 'Trực tiếp trải nghiệm các phiến slab cẩm thạch Ý, đá vôi travertine và bàn mẫu vật liệu thực tế tại Showroom Thường Sơn Ceramic.',
    url: 'https://thuong-son-ceramic.vercel.app/showroom',
  },
};

export default function ShowroomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
