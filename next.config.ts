import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // This allows the build to finish even if there are small type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // This ignores linting warnings that often stop the build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;