import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const isProd = process.env.NODE_ENV === "production";

const { version: APP_VERSION } = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf8"),
) as { version: string };

function resolveApiOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) {
    if (isProd) {
      throw new Error(
        "NEXT_PUBLIC_API_URL não está definida. Configure a URL da API antes do build de produção.",
      );
    }
    return "http://localhost:5232";
  }
  try {
    return new URL(raw).origin;
  } catch {
    throw new Error(`NEXT_PUBLIC_API_URL inválida: "${raw}"`);
  }
}

const apiOrigin = resolveApiOrigin();

// CSP sem nonces (páginas estáticas). Em desenvolvimento o React precisa de 'unsafe-eval'
// e o HMR usa WebSocket; por isso a CSP só é aplicada em produção.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin}`,
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(apiOrigin.startsWith("https://") ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  ...(isProd ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_APP_VERSION: APP_VERSION,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // O service worker precisa ser revalidado sempre para receber atualizações.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
