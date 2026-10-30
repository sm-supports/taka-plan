import { describe, expect, it } from "vitest";
import { ADMIN_CSP, SECURITY_HEADERS, applySecurityHeaders, isAdminPath } from "@/lib/server/security-headers";
import { json } from "@/lib/server/http";

describe("security headers (SEC-8)", () => {
  it("sets nosniff, referrer and permissions policies on every path, and the admin CSP only under /admin", () => {
    const page = applySecurityHeaders(new Headers(), "/bn/plan");
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) expect(page.get(name)).toBe(value);
    expect(page.get("Content-Security-Policy")).toBeNull();
    expect(applySecurityHeaders(new Headers(), "/admin").get("Content-Security-Policy")).toBe(ADMIN_CSP);
    expect(applySecurityHeaders(new Headers(), "/admin/preview").get("Content-Security-Policy")).toBe(ADMIN_CSP);
    expect(applySecurityHeaders(new Headers(), "/administrator").get("Content-Security-Policy")).toBeNull();
    expect(isAdminPath("/api/admin/rates")).toBe(false);
  });

  it("never overrides a header a handler already set", () => {
    const h = applySecurityHeaders(new Headers({ "Referrer-Policy": "no-referrer" }), "/admin");
    expect(h.get("Referrer-Policy")).toBe("no-referrer");
  });

  it("API JSON responses carry the headers too", () => {
    const res = json({ ok: true });
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(res.headers.get("permissions-policy")).toBe("camera=(), microphone=(), geolocation=()");
  });
});
