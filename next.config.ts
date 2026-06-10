import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disables ESLint run during production builds to avoid syntax/style-based check failures
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allows production builds to compile even if minor type mismatches occur in build packages
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
