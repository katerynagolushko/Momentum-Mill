import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The app lives inside the Momentum Mill site repo; pin the root so Next
  // doesn't pick up the parent Vite project's lockfile and postcss config.
  turbopack: { root: __dirname },
  // Ship the build-time-seeded SQLite file with every serverless route so a
  // preview deployment renders the corpus before a real database is attached.
  outputFileTracingIncludes: { "/**": ["./prisma/dev.db"] },
};

export default nextConfig;
