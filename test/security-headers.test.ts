import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FRAME_CSP, SECURITY_HEADERS, applySecurityHeaders } from "@/lib/server/security-headers";
import { json } from "@/lib/server/http";

describe("security headers (SEC-8)", () => {
  it("sets nosniff, referrer, permissions and frame-ancestors 'none' policies", () => {
    const page = applySecurityHeaders(new Headers());
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) expect(page.get(name)).toBe(value);
    expect(page.get("Content-Security-Policy")).toBe("frame-ancestors 'none'");
    expect(FRAME_CSP).toBe("frame-ancestors 'none'");
  });

  it("never overrides a header a handler already set", () => {
    const h = applySecurityHeaders(new Headers({ "Referrer-Policy": "no-referrer" }));
    expect(h.get("Referrer-Policy")).toBe("no-referrer");
  });

  it("API JSON responses carry the headers too", () => {
    const res = json({ ok: true });
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(res.headers.get("permissions-policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(res.headers.get("content-security-policy")).toBe("frame-ancestors 'none'");
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

  it("forbids framing every page, public ones included (S9)", () => {
    expect(rules.get("/*")?.get("content-security-policy")).toBe("frame-ancestors 'none'");
  });

  it("keeps the admin noindex rules and never repeats a /* header in them (Pages would comma-join it)", () => {
    const all = rules.get("/*")!;
    for (const path of ["/admin", "/admin/*"]) {
      const r = rules.get(path);
      expect(r?.get("x-robots-tag")).toBe("noindex");
      for (const name of r!.keys()) expect(all.has(name), `${path} repeats ${name}`).toBe(false);
    }
  });
});
