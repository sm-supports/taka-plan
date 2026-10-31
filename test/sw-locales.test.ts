/** public/sw.js cannot import the app config: keep its hand-written locale list equal to `locales`. */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { locales } from "@/lib/i18n/config";

const sw = readFileSync(path.resolve(__dirname, "../public/sw.js"), "utf8");

describe("service worker locales", () => {
  it("lists the same twelve locales as lib/i18n/config.ts", () => {
    const m = /const LOCALES = (\[[^\]]*\]);/.exec(sw);
    expect(m, "LOCALES constant in sw.js").not.toBeNull();
    expect(JSON.parse(m![1]!)).toEqual([...locales]);
  });

  it("builds the plan-shell regex from LOCALES", () => {
    expect(sw).toMatch(/PLAN_SHELL = new RegExp\("\^\/\(" \+ LOCALES\.join\("\|"\) \+ "\)\/plan\$"\)/);
    expect(sw).not.toMatch(/\(bn\|en\)/);
  });
});
