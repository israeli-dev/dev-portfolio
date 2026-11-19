import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 *
 * A strict CSP is deliberately not set here: the App Router injects inline
 * bootstrap scripts and this app sets per-portfolio accent colours as inline
 * styles. Add a nonce-based CSP at the edge/proxy if you need one — see
 * docs/SECURITY.md for the exact policy that works with this codebase.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // PGlite ships a WASM build that must not be bundled by webpack.
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
