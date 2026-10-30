/**
 * vinext middleware (Next 16 `proxy` convention): security headers on every response it routes
 * (pages, RSC payloads and route handlers) plus a frame-ancestors CSP under /admin (SEC-8).
 * Static files (/_next/static, icons, sw.js, manifest) are excluded by the matcher. The file is
 * discovered when the dev server starts, so a running `vite dev` must be restarted to pick it up.
 * The pure header logic lives in lib/server/security-headers.ts, which the API `json()` helper also
 * applies, so API responses carry the headers even where middleware does not run.
 */
import { NextResponse, type NextRequest } from "next/server";
import { applySecurityHeaders } from "@/lib/server/security-headers";

export function proxy(req: NextRequest): NextResponse {
  const res = NextResponse.next();
  applySecurityHeaders(res.headers, req.nextUrl.pathname);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icons/|sw\\.js|manifest\\.webmanifest|icon\\.png).*)"],
};
