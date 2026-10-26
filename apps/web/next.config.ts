import type { NextConfig } from "next";

const normalizeApiUrl = (url?: string): string => {
  if (!url) return "http://localhost:5000/api";
  let formatted = url.trim();
  if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
    formatted = `https://${formatted}`;
  }
  formatted = formatted.replace(/\/$/, "");
  if (!formatted.endsWith("/api")) {
    formatted = `${formatted}/api`;
  }
  return formatted;
};

const apiDestination = normalizeApiUrl(
  process.env.API_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
);

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "standalone",
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/manifest.json",
        destination: "/manifest.webmanifest",
      },
      {
        source: "/api/:path*",
        destination: `${apiDestination}/:path*`,
      },
    ];
  },
};

export default nextConfig;