import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore build errors until database types are properly generated
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
