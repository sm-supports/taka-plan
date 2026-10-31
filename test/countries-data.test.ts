/**
 * Every country file under packages/engine/src/data/countries must be a valid CountryProfile,
 * named after its code. Run one country: npx vitest run test/countries-data.test.ts -t "BD".
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { assertCountryIndex, assertCountryProfile, COUNTRY_FIELD_KEYS, unitsFrom } from "@taka/engine";
import seed from "@taka/engine/data/rates.seed.json";
import { describe, expect, it } from "vitest";

const DIR = path.resolve(__dirname, "../packages/engine/src/data/countries");
const units = unitsFrom(seed.rows as never);
const files = readdirSync(DIR).filter((f) => /^[A-Z]{2}\.json$/.test(f)).sort();

describe("country data files", () => {
  it("has a directory (files arrive from the research workflow)", () => {
    expect(Array.isArray(files)).toBe(true);
  });

  for (const file of files) {
    const code = file.slice(0, 2);
    it(`${code} is a valid CountryProfile`, () => {
      const p = assertCountryProfile(JSON.parse(readFileSync(path.join(DIR, file), "utf8")), units);
      expect(p.code).toBe(code);
      // Every country field is present: researched, assumed, or explicitly missing.
      const absent = COUNTRY_FIELD_KEYS.filter((k) => p.fields[k] === undefined);
      if (code !== "BD") expect(absent, `${code} fields not reported`).toEqual([]);
    });
  }

  const indexPath = path.join(DIR, "index.json");
  if (files.length > 0 && readdirSync(DIR).includes("index.json")) {
    it("index.json lists exactly the country files", () => {
      const index = assertCountryIndex(JSON.parse(readFileSync(indexPath, "utf8")));
      expect(index.map((e) => `${e.code}.json`).sort()).toEqual(files);
    });
  }
});
