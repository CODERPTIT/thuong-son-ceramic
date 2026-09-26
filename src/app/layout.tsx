import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/navigation/Header";
import Footer from "@/components/layout/Footer";
import InAppBrowserGuard from "@/components/layout/InAppBrowserGuard";

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
  metadataBase: new URL('https://thuong-son-ceramic.vercel.app'),
  title: {
    default: "Thường Sơn Ceramic — Gạch ốp lát & Bề mặt kiến trúc cao cấp Thanh Hóa",
    template: "%s | Thường Sơn Ceramic"
  },
  description: "Công ty TNHH Thường Sơn — Showroom phân phối gạch ốp lát kiến trúc, cẩm thạch Ý, đá vôi travertine, gạch lát nền 800x800, gạch ốp tường 600x1200 chính hãng Ý MỸ, Apodio tại Hoằng Lộc, Thanh Hóa.",
  keywords: [
    "thường sơn ceramic",
    "công ty tnhh thường sơn",
    "gạch ốp lát thanh hóa",
    "showroom gạch hoằng lộc",
    "gạch ý mỹ thanh hóa",
    "gạch ốp lát cao cấp",
    "gạch granite 800x800",
    "gạch 600x1200 thanh hóa",
    "gạch lát nền thanh hóa",
    "gạch ốp tường thanh hóa",
    "apodio thanh hóa",
    "vật liệu kiến trúc thanh hóa"
  ],
  authors: [{ name: "Công ty TNHH Thường Sơn", url: "https://thuong-son-ceramic.vercel.app" }],
  creator: "Thường Sơn Ceramic",
  publisher: "Công ty TNHH Thường Sơn",
  alternates: {
    canonical: "https://thuong-son-ceramic.vercel.app",
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/icon.svg'
  },
  openGraph: {
    title: "Thường Sơn Ceramic — The Art of Surface | Công ty TNHH Thường Sơn",
    description: "Khám phá thế giới vật liệu và gạch ốp lát kiến trúc tuyển chọn chính hãng Ý MỸ, Apodio tại Hoằng Lộc, Thanh Hóa.",
    type: "website",
    locale: "vi_VN",
    url: "https://thuong-son-ceramic.vercel.app",
    siteName: "Thường Sơn Ceramic",
    images: [
      {
        url: "/icon.svg",
        width: 800,
        height: 800,
        alt: "Thường Sơn Ceramic - Logo & Thương hiệu gạch ốp lát Thanh Hóa",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thường Sơn Ceramic — Gạch ốp lát & Vật liệu kiến trúc cao cấp Thanh Hóa",
    description: "Showroom tuyển chọn gạch ốp lát kiến trúc, cẩm thạch Ý, đá vôi travertine chính hãng tại Hoằng Lộc, Thanh Hóa.",
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'HomeGoodsStore',
  '@id': 'https://thuong-son-ceramic.vercel.app/#store',
  name: 'Công ty TNHH Thường Sơn',
  alternateName: ['Thường Sơn Ceramic', 'Showroom Gạch Thường Sơn'],
  url: 'https://thuong-son-ceramic.vercel.app',
  logo: 'https://thuong-son-ceramic.vercel.app/icon.svg',
  image: 'https://thuong-son-ceramic.vercel.app/icon.svg',
  description: 'Showroom tuyển chọn gạch ốp lát kiến trúc, cẩm thạch Ý, đá vôi travertine, gạch Ý MỸ, Apodio và giải pháp hoàn thiện bề mặt cao cấp tại Thanh Hóa.',
  telephone: '+84916640316',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Sn 01 Đường đôi TL510, Đình Bảng, Xã Hoằng Lộc',
    addressLocality: 'Hoằng Lộc',
    addressRegion: 'Thanh Hóa',
    postalCode: '440000',
    addressCountry: 'VN'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 19.8176,
    longitude: 105.8350
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '07:00',
      closes: '21:00'
    }
  ],
  hasMap: 'https://maps.google.com/?q=Công+ty+TNHH+Thường+Sơn+Hoằng+Lộc+Thanh+Hóa',
  sameAs: [
    'https://zalo.me/0916640316'
  ]
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F5F1EA] text-[#1C1B19]">
        <InAppBrowserGuard />
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
