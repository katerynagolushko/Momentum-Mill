import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The app lives inside the Momentum Mill site repo; pin the root so Next
  // doesn't pick up the parent Vite project's lockfile and postcss config.
  turbopack: { root: __dirname },
};

export default nextConfig;
