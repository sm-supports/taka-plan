// Response headers every HTML / JSON response should carry (SEC-8). Pure: API responses get them from json() in lib/server/http.ts; static pages get the same values from public/_headers (kept in sync by test/security-headers.test.ts).

/** No page of the site may be embedded in another site (clickjacking), the admin included. */
export const FRAME_CSP = "frame-ancestors 'none'";

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": FRAME_CSP,
};

/** Adds the security headers without overriding headers already set. */
export function applySecurityHeaders(headers: Headers): Headers {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) if (!headers.has(name)) headers.set(name, value);
  return headers;
}
