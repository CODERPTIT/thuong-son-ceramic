import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/navigation/Header";
import Footer from "@/components/layout/Footer";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thường Sơn Ceramic — Công ty TNHH Thường Sơn | Gạch ốp lát & Vật liệu kiến trúc",
  description: "Showroom tuyển chọn gạch ốp lát kiến trúc cao cấp: cẩm thạch Ý, đá vôi travertine, bê tông tối giản và giải pháp hoàn thiện phòng tắm. Bề mặt định hình không gian sống.",
  keywords: ["thường sơn ceramic", "công ty tnhh thường sơn", "gạch ốp lát thanh hóa", "gạch ốp lát cao cấp", "apodio", "monalisa", "changyih", "gạch cẩm thạch", "hoằng lộc thanh hóa", "vật liệu kiến trúc"],
  openGraph: {
    title: "Thường Sơn Ceramic — The Art of Surface | Công ty TNHH Thường Sơn",
    description: "Khám phá thế giới vật liệu và gạch ốp lát kiến trúc được tuyển chọn cho những không gian mang dấu ấn riêng tại Hoằng Lộc, Thanh Hóa.",
    type: "website",
    locale: "vi_VN",
    url: "https://thuongsonceramic.vn/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${fraunces.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F5F1EA] text-[#1C1B19]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1C1B19] focus:text-[#F5F1EA] focus:outline-none text-xs font-mono"
        >
          Bỏ qua điều hướng đến nội dung chính
        </a>
        <Header />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
