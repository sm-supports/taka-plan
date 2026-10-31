import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { FIXTURE_BD, FIXTURE_IN, FIXTURE_US, LOCALES, indexEntryFor as engineIndexEntryFor } from "@taka/engine";
import { copyCountryData, indexEntryFor, LOCALES as SCRIPT_LOCALES } from "../../scripts/copy-country-data.mjs";

const dirs: string[] = [];
function tmp(): string {
  const d = mkdtempSync(path.join(tmpdir(), "country-data-"));
  dirs.push(d);
  return d;
}
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

describe("scripts/copy-country-data.mjs", () => {
  it("mirrors the engine's indexEntryFor and LOCALES", () => {
    expect(SCRIPT_LOCALES).toEqual([...LOCALES]);
    for (const p of [FIXTURE_BD, FIXTURE_IN, FIXTURE_US]) expect(indexEntryFor(p)).toEqual(engineIndexEntryFor(p));
  });

  it("does nothing without profiles (and clears a stale output)", () => {
    const src = tmp();
    const out = path.join(tmp(), "out");
    mkdirSync(path.join(src, "_global"));
    mkdirSync(out);
    expect(copyCountryData(src, out)).toEqual({ profiles: 0, indexGenerated: false, files: [] });
    expect(existsSync(out)).toBe(false);
  });

  it("copies profiles and regions, never _global, and generates index.json", () => {
    const src = tmp();
    const out = path.join(tmp(), "out");
    mkdirSync(path.join(src, "_global"));
    writeFileSync(path.join(src, "_global", "cldr.json"), "{}");
    writeFileSync(path.join(src, "IN.json"), JSON.stringify(FIXTURE_IN, null, 2));
    writeFileSync(path.join(src, "US.json"), JSON.stringify(FIXTURE_US, null, 2));
    writeFileSync(path.join(src, "_regions.json"), JSON.stringify({ south_asia: {} }));
    writeFileSync(path.join(src, "notes.md"), "not published");
    const r = copyCountryData(src, out);
    expect(r).toEqual({ profiles: 2, indexGenerated: true, files: ["IN.json", "US.json", "_regions.json", "index.json"] });
    expect(readdirSync(out).sort()).toEqual(["IN.json", "US.json", "_regions.json", "index.json"]);
    const index = JSON.parse(readFileSync(path.join(out, "index.json"), "utf8"));
    expect(index).toEqual([engineIndexEntryFor(FIXTURE_IN), engineIndexEntryFor(FIXTURE_US)]);
    expect(JSON.parse(readFileSync(path.join(out, "IN.json"), "utf8"))).toEqual(FIXTURE_IN);
  });

  it("keeps a researched index.json as is", () => {
    const src = tmp();
    const out = path.join(tmp(), "out");
    writeFileSync(path.join(src, "IN.json"), JSON.stringify(FIXTURE_IN));
    writeFileSync(path.join(src, "index.json"), JSON.stringify([{ code: "IN", custom: true }]));
    expect(copyCountryData(src, out).indexGenerated).toBe(false);
    expect(JSON.parse(readFileSync(path.join(out, "index.json"), "utf8"))).toEqual([{ code: "IN", custom: true }]);
  });
});
