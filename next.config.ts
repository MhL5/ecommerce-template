import "@/env/clientEnv";
import "@/env/serverEnv";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
  logging: { browserToTerminal: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    typedEnv: true,
    authInterrupts: true,
    turbopackRustReactCompiler: true,
  },
};

export default nextConfig;
