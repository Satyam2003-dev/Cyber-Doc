import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/Cyber-Doc",
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
