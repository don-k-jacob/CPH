import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Work around a Next.js dev-mode RSC manifest bug seen on events routes.
    devtoolSegmentExplorer: false
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" }
    ]
  }
};

export default nextConfig;
