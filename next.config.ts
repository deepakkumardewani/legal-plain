import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
