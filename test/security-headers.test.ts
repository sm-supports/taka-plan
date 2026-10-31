import { readFileSync } from "node:fs";
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

/** Parses Cloudflare Pages `_headers`: a path line followed by indented `Name: value` lines. */
function parseHeadersFile(text: string): Map<string, Map<string, string>> {
  const rules = new Map<string, Map<string, string>>();
  let current: Map<string, string> | null = null;
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      current = new Map();
      rules.set(line.trim(), current);
    } else if (current) {
      const i = line.indexOf(":");
      current.set(line.slice(0, i).trim().toLowerCase(), line.slice(i + 1).trim());
    }
  }
  return rules;
}

describe("public/_headers (static pages on Cloudflare Pages)", () => {
  const rules = parseHeadersFile(readFileSync("public/_headers", "utf8"));

  it("sends the same security headers as the API on every path", () => {
    const all = rules.get("/*");
    expect(all).toBeDefined();
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) expect(all!.get(name.toLowerCase())).toBe(value);
  });

  it("forbids framing the admin pages", () => {
    for (const path of ["/admin", "/admin/*"]) expect(rules.get(path)?.get("content-security-policy")).toBe(ADMIN_CSP);
  });
});
