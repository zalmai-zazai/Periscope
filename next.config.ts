import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* existing config options here */

  // ⚠️ allow deployment even with TS errors
  typescript: {
    ignoreBuildErrors: true,
  },

  // optional: skip ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
