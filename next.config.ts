import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // builds can target a separate folder so they never clobber a running dev server
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // pages read the editable /content JSON at request time; ship it with every serverless function
  outputFileTracingIncludes: { "/**/*": ["./content/**/*.json"] },
};

export default nextConfig;
