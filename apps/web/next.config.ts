import type { NextConfig } from "next";

const apiDestination = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiDestination}/:path*`,
      },
    ];
  },
};

export default nextConfig;