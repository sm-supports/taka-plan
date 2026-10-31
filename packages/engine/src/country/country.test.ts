import { describe, expect, it } from "vitest";
import seed from "../data/rates.seed.json";
import { FIXTURE_BD, FIXTURE_IN, FIXTURE_US } from "../fixtures/countries";
import { assertSnapshot, getRate, RATE_KEYS } from "../rates";
import { LOCALES } from "../types";
import { BANGLADESH_ONLY_KEYS, COUNTRY_FIELD_KEYS } from "./fields";
import { BDT_ROUNDING, localesForLanguages, niceStep, roundingFor, roundingForUsdRate, withCountry } from "./overlay";
import { assertCountryProfile, unitsFrom } from "./validate";

const base = assertSnapshot(seed);
const units = unitsFrom(base.rows);
const opts = { bdUsdRate: 122 };

describe("country field catalogue", () => {
  it("only lists real rate keys, once, never Bangladesh-only ones", () => {
    expect(new Set(COUNTRY_FIELD_KEYS).size).toBe(COUNTRY_FIELD_KEYS.length);
    for (const k of COUNTRY_FIELD_KEYS) expect(RATE_KEYS).toContain(k);
    for (const k of BANGLADESH_ONLY_KEYS) {
      expect(RATE_KEYS).toContain(k);
      expect(COUNTRY_FIELD_KEYS).not.toContain(k);
    }
  });
});

describe("assertCountryProfile", () => {
  it("accepts the fixtures", () => {
    for (const p of [FIXTURE_BD, FIXTURE_IN, FIXTURE_US]) expect(assertCountryProfile(p, units).code).toBe(p.code);
  });

  it("rejects a figure without a source, a bad JSON shape and a non-field key", () => {
    const noSource = { ...FIXTURE_IN, fields: { ...FIXTURE_IN.fields, fdr_1y_rate: { value: 0.07, status: "sourced", sourceName: "", sourceUrl: "", asOf: "2026-10-01" } } };
    expect(() => assertCountryProfile(noSource, units)).toThrow(/fdr_1y_rate/);
    const badJson = { ...FIXTURE_IN, fields: { gratuity_rule: { value: null, valueJson: { daysPerYear: "15" }, status: "sourced", sourceName: "x", sourceUrl: "https://x.test", asOf: "2026-10-01" } } };
    expect(() => assertCountryProfile(badJson, units)).toThrow(/gratuity_rule/);
    const notField = { ...FIXTURE_IN, fields: { emergency_base_months: { value: 6, status: "sourced", sourceName: "x", sourceUrl: "https://x.test", asOf: "2026-10-01" } } };
    expect(() => assertCountryProfile(notField, units)).toThrow(/emergency_base_months/);
  });
});

describe("withCountry", () => {
  it("is the identity for Bangladesh (rows unchanged, taka rounding)", () => {
    const s = withCountry(base, FIXTURE_BD, opts);
    expect(s.rows).toEqual(base.rows);
    expect(s.country?.rounding).toEqual(BDT_ROUNDING);
    expect(s.country?.notApplicable).toEqual([]);
    expect(s.country?.instrumentNames.sanchayapatra_5y?.en).toBe("Sanchayapatra");
  });

  it("uses the country's own figure, flags fallbacks and converts money policy", () => {
    const s = withCountry(base, FIXTURE_IN, opts);
    expect(getRate(s, "fdr_1y_rate")).toBe(0.067);
    expect(s.rows.fdr_1y_rate.isAppAssumption).toBe(true); // fixture figures are assumptions
    // Missing term premium table means no term-life market: the row becomes "none", not a fallback.
    expect(s.rows.insurance_term_premium_table.valueJson).toBeNull();
    expect(s.country?.fallbackKeys).not.toContain("insurance_term_premium_table");
    // A key the country did not report at all still falls back (flagged).
    expect(s.country?.fallbackKeys).toContain("health_premium_table");
    // App-policy money threshold converted from taka at 84/122.
    expect(getRate(s, "emergency_large_buffer_threshold")).toBe(Math.round((getRate(base, "emergency_large_buffer_threshold") * 84) / 122));
    expect(s.country?.notApplicable).toEqual([...BANGLADESH_ONLY_KEYS]);
    expect(s.country?.currency.code).toBe("INR");
  });

  it("prefers a regional figure over the base row when the country has none", () => {
    const regions = { north_america: { fdr_3m_rate: { value: 0.035, status: "assumption" as const, sourceName: "Regional median", sourceUrl: "docs/ARCHITECTURE.md", asOf: "2026-10-30" } } };
    const s = withCountry(base, FIXTURE_US, { ...opts, regions });
    expect(getRate(s, "fdr_3m_rate")).toBe(0.035);
    expect(s.rows.fdr_3m_rate.note).toMatch(/Regional figure/);
    expect(s.country?.unavailable).toEqual(["dps"]);
  });
});

describe("rounding", () => {
  it("derives nice steps from the dollar rate", () => {
    expect(niceStep(122)).toBe(100);
    expect(niceStep(610)).toBe(500);
    expect(niceStep(0.9)).toBe(1);
    expect(niceStep(16000)).toBe(10000);
    expect(roundingForUsdRate(122)).toEqual({ lump: 500, monthly: 100, interest: 100, exact: 1 });
    expect(roundingForUsdRate(1)).toEqual({ lump: 5, monthly: 1, interest: 1, exact: 1 });
    expect(roundingFor(base)).toEqual(BDT_ROUNDING);
  });
});

describe("locales for a country", () => {
  it("offers translated country languages first, then English", () => {
    expect(localesForLanguages(["bn", "en"])).toEqual(["bn", "en"]);
    expect(localesForLanguages(["hi", "en", "bn"])).toEqual(["hi", "bn", "en"]);
    expect(localesForLanguages(["th"])).toEqual(["en"]);
    for (const l of localesForLanguages(["ar", "fr", "sw"])) expect(LOCALES).toContain(l);
  });
});
