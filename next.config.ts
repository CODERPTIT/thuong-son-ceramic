import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "grandtiles.com.vn",
      },
      {
        protocol: "https",
        hostname: "ymyceramic.com.vn",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/khong-gian",
        destination: "/spaces",
      },
      {
        source: "/lien-he",
        destination: "/showroom",
      },
      {
        source: "/tin-tuc",
        destination: "/journal",
      },
      {
        source: "/p/:slug",
        destination: "/products/:slug",
      },
    ];
  },
};

export default nextConfig;
