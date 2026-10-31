import { describe, expect, it } from "vitest";
import { COUNTRY_FIELDS, FIXTURE_BD, FIXTURE_IN, OUR_ASSUMPTION_SOURCE, REGIONS, RATES_SEED, UNKNOWN_MEANS_NULL, parseRegionDefaults, unitsFrom, type CountryProfile } from "@taka/engine";
import {
  BASE_COUNTRY,
  MIN_COUNTRIES,
  REGIONS as SCRIPT_REGIONS,
  SOURCE_NAME,
  UNKNOWN_MEANS_NULL as SCRIPT_UNKNOWN,
  computeRegionDefaults,
  genRegionDefaults,
  readFieldSpecs,
} from "../scripts/gen-region-defaults.mjs";

const units = unitsFrom(RATES_SEED.rows as never);
const specs = readFieldSpecs();

describe("scripts/gen-region-defaults.mjs", () => {
  it("reads the same field list as the engine and mirrors its constants", () => {
    expect(specs).toEqual(COUNTRY_FIELDS.map((f) => ({ key: f.key, kind: f.kind })));
    expect([...SCRIPT_REGIONS]).toEqual([...REGIONS]);
    expect([...SCRIPT_UNKNOWN]).toEqual([...UNKNOWN_MEANS_NULL]);
    expect(SOURCE_NAME).toBe(OUR_ASSUMPTION_SOURCE);
    expect(BASE_COUNTRY).toBe("BD");
  });

  it("writes medians in US dollars, never with fewer than MIN_COUNTRIES figures, and never Bangladesh's tables", () => {
    const sourced = (value: number) => ({ value, status: "sourced", sourceName: "x", sourceUrl: "https://x.test", asOf: "2026-10-01" });
    const mk = (code: string, usd: number, fdr: number, cost: number): CountryProfile => ({
      ...FIXTURE_IN,
      code,
      nameEn: code,
      currency: { ...FIXTURE_IN.currency, usdRate: { ...FIXTURE_IN.currency.usdRate, value: usd } },
      fields: { fdr_1y_rate: sourced(fdr), health_hospitalisation_cost: sourced(cost), policy_rate: { ...sourced(0.05), status: "assumption" } } as CountryProfile["fields"],
    });
    const table = { per: 1000, smokerMultiplier: 1.5, bands: [{ maxAge: 65, low: 1, high: 2 }] };
    const bd = { ...FIXTURE_BD, fields: { insurance_term_premium_table: { value: null, valueJson: table, status: "sourced", sourceName: "x", sourceUrl: "https://x.test", asOf: "2026-10-01" } } } as CountryProfile;
    const out = computeRegionDefaults([mk("AA", 10, 0.04, 1000), mk("BB", 100, 0.06, 20000), mk("CC", 1, 0.08, 300), bd], units, specs);
    expect(Object.keys(out)).toEqual(["south_asia", "global"]);
    const sa = out.south_asia ?? {};
    expect(sa.fdr_1y_rate?.value).toBe(0.06);
    expect(sa.fdr_1y_rate?.note).toBe("Median of 3 sourced countries in South Asia.");
    // 100, 200, 300 US dollars → 200.
    expect(sa.health_hospitalisation_cost?.value).toBe(200);
    expect(sa.health_hospitalisation_cost?.note).toMatch(/in US dollars/);
    // A fact key reported only as an assumption does not count.
    expect(sa.policy_rate).toBeUndefined();
    // Bangladesh's own table is never copied.
    expect(sa.insurance_term_premium_table).toBeUndefined();
    expect(MIN_COUNTRIES).toBeGreaterThanOrEqual(3);
    const two = computeRegionDefaults([mk("AA", 10, 0.04, 1000), mk("BB", 100, 0.06, 20000)], units, specs);
    expect(two.south_asia?.fdr_1y_rate).toBeUndefined();
  });

  it("produces a file the engine accepts whole, for the shipped country files", () => {
    const { profiles, defaults } = genRegionDefaults();
    if (profiles === 0) return;
    const parsed = parseRegionDefaults(defaults, units);
    expect(Object.keys(defaults)).toContain("global");
    for (const [group, fields] of Object.entries(defaults)) {
      expect(Object.keys(parsed[group as keyof typeof parsed] ?? {}).sort(), group).toEqual(Object.keys(fields).sort());
      for (const [key, f] of Object.entries(fields)) {
        expect(UNKNOWN_MEANS_NULL as readonly string[]).not.toContain(key);
        expect(f.status).toBe("assumption");
        expect(f.sourceName).toBe(OUR_ASSUMPTION_SOURCE);
        expect(f.sourceUrl).toMatch(/^docs\//);
        expect(f.note).toMatch(/^(Median of \d+ sourced countries|Table from )/);
        expect(f.note).not.toMatch(/Table from Bangladesh/);
        if (units[key as keyof typeof units] === "json") expect(f.valueJson).toBeTruthy();
        else expect(typeof f.value).toBe("number");
      }
    }
  });
});
