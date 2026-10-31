// Response headers every HTML / JSON response should carry (SEC-8). Pure: API responses get them from json() in lib/server/http.ts; static pages get the same values from public/_headers (kept in sync by test/security-headers.test.ts).

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

/** The admin must never be embedded in another site. */
export const ADMIN_CSP = "frame-ancestors 'none'";

export function isAdminPath(pathname: string): boolean {
  return /^\/admin(\/|$)/.test(pathname);
}

/** Adds the security headers (and the admin CSP under /admin) without overriding headers already set. */
export function applySecurityHeaders(headers: Headers, pathname: string): Headers {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) if (!headers.has(name)) headers.set(name, value);
  if (isAdminPath(pathname) && !headers.has("Content-Security-Policy")) headers.set("Content-Security-Policy", ADMIN_CSP);
  return headers;
}
