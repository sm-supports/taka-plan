import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** The engine must stay pure: no React, Next, Node, Cloudflare or app imports. */
const FORBIDDEN = [/from\s+["']react/, /from\s+["']next/, /from\s+["']node:/, /from\s+["']cloudflare:/, /from\s+["']@\//, /from\s+["']zustand/];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.ts$/.test(name) && !/\.test\.ts$/.test(name)) out.push(p);
  }
  return out;
}

describe("engine purity", () => {
  it("imports nothing outside the engine", () => {
    const files = walk(__dirname);
    expect(files.length).toBeGreaterThan(10);
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      for (const re of FORBIDDEN) expect(src, `${f} matches ${re}`).not.toMatch(re);
    }
  });
});
