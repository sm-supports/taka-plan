import { describe, expect, it } from "vitest";
import seed from "../data/rates.seed.json";
import { FIXTURE_BD, FIXTURE_IN, FIXTURE_US } from "../fixtures/countries";
import { assertSnapshot, getRate, RATE_KEYS } from "../rates";
import { LOCALES } from "../types";
import { BANGLADESH_ONLY_KEYS, COUNTRY_FIELD_KEYS, NEUTRAL_LABELS, OUR_ASSUMPTION_SOURCE, displaySourceName } from "./fields";
import { BDT_ROUNDING, localesForLanguages, niceStep, roundingFor, roundingForUsdRate, withCountry } from "./overlay";
import type { CountryField, RegionDefaults } from "./types";
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

  const today = { today: "2026-10-31" };
  const src = { status: "sourced" as const, sourceName: "x", sourceUrl: "https://x.test", asOf: "2026-10-01" };
  const withUsd = (usdRate: Record<string, unknown>) => ({ ...FIXTURE_IN, currency: { ...FIXTURE_IN.currency, usdRate: { ...FIXTURE_IN.currency.usdRate, ...usdRate } } });
  const withField = (key: string, f: unknown) => ({ ...FIXTURE_IN, fields: { ...FIXTURE_IN.fields, [key]: f } });

  it("bounds the dollar rate and its status", () => {
    expect(() => assertCountryProfile(withUsd({ value: 0 }), units, today)).toThrow(/usdRate/);
    expect(() => assertCountryProfile(withUsd({ value: 0.00001 }), units, today)).toThrow(/usdRate/);
    expect(() => assertCountryProfile(withUsd({ value: 2e7 }), units, today)).toThrow(/usdRate/);
    expect(() => assertCountryProfile(withUsd({ status: "missing" }), units, today)).toThrow(/usdRate/);
    expect(assertCountryProfile(withUsd({ value: 0.0003 }), units, today).code).toBe("IN"); // KWD-like
    expect(assertCountryProfile(withUsd({ value: 9_000_000 }), units, today).code).toBe("IN");
  });

  it("caps money, checks every source URL and the absent flag", () => {
    expect(() => assertCountryProfile(withField("health_hospitalisation_cost", { ...src, value: 2e12 }), units, today)).toThrow(/health_hospitalisation_cost/);
    expect(assertCountryProfile(withField("health_hospitalisation_cost", { ...src, value: 1e12 }), units, today).code).toBe("IN");
    expect(() => assertCountryProfile(withField("policy_rate", { value: null, status: "missing", sourceName: "", sourceUrl: "javascript:alert(1)", asOf: "2026-10-01" }), units, today)).toThrow(/sourceUrl/);
    expect(assertCountryProfile(withField("policy_rate", { value: null, status: "missing", sourceName: "", sourceUrl: "", asOf: "2026-10-01", absent: true }), units, today).code).toBe("IN");
    expect(() => assertCountryProfile(withField("policy_rate", { ...src, value: 0.05, absent: true }), units, today)).toThrow(/absent/);
    expect(() => assertCountryProfile(withField("policy_rate", { value: null, status: "missing", sourceName: "", sourceUrl: "", asOf: "2026-10-01", absent: "yes" }), units, today)).toThrow(/absent/);
  });

  it("rejects unknown or mistyped instruments and institutions", () => {
    expect(() => assertCountryProfile({ ...FIXTURE_IN, instruments: { ...FIXTURE_IN.instruments, crypto: { available: true, localName: null } } }, units, today)).toThrow(/instruments.crypto/);
    expect(() => assertCountryProfile({ ...FIXTURE_IN, instruments: { ...FIXTURE_IN.instruments, gold: { available: true, localName: null, note: 5 } } }, units, today)).toThrow(/instruments.gold.note/);
    expect(() => assertCountryProfile({ ...FIXTURE_IN, instruments: { ...FIXTURE_IN.instruments, gold: { available: true, localName: "x".repeat(101) } } }, units, today)).toThrow(/localName/);
    expect(() => assertCountryProfile({ ...FIXTURE_IN, institutions: { taxOffice: { name: "x", url: "https://x.test" } } }, units, today)).toThrow(/institutions.taxOffice/);
    expect(() => assertCountryProfile({ ...FIXTURE_IN, institutions: { centralBank: { name: "x", url: "https://x.test", note: 1 } } }, units, today)).toThrow(/centralBank.note/);
    expect(() => assertCountryProfile({ ...FIXTURE_IN, institutions: { centralBank: { name: "", url: "https://x.test" } } }, units, today)).toThrow(/centralBank.name/);
  });

  it("requires real dates, none too far ahead, and caps text", () => {
    expect(() => assertCountryProfile({ ...FIXTURE_IN, researchedAt: "2026-02-30" }, units, today)).toThrow(/researchedAt/);
    expect(() => assertCountryProfile({ ...FIXTURE_IN, researchedAt: "2026-11-02" }, units, today)).toThrow(/researchedAt/);
    expect(assertCountryProfile({ ...FIXTURE_IN, researchedAt: "2026-11-01" }, units, today).code).toBe("IN");
    expect(() => assertCountryProfile(withField("policy_rate", { ...src, value: 0.05, asOf: "2027-12-01" }), units, today)).toThrow(/asOf/);
    expect(assertCountryProfile(withField("policy_rate", { ...src, value: 0.05, asOf: "2027-06-01" }), units, today).code).toBe("IN");
    expect(() => assertCountryProfile(withField("policy_rate", { ...src, value: 0.05, sourceName: "s".repeat(301) }), units, today)).toThrow(/sourceName/);
    expect(() => assertCountryProfile(withField("policy_rate", { ...src, value: 0.05, note: "n".repeat(1001) }), units, today)).toThrow(/note/);
    expect(() => assertCountryProfile({ ...FIXTURE_IN, nameEn: "N".repeat(101) }, units, today)).toThrow(/nameEn/);
  });

  it("accepts ISO 639-3 language codes", () => {
    expect(assertCountryProfile({ ...FIXTURE_IN, languages: ["hi", "fil", "tpi"] }, units, today).code).toBe("IN");
    expect(() => assertCountryProfile({ ...FIXTURE_IN, languages: ["hind"] }, units, today)).toThrow(/languages/);
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
    // "missing" means "could not find it": with no regional table, the Bangladesh table (a ratio per cover) is used, flagged.
    expect(s.rows.insurance_term_premium_table.valueJson).toEqual(base.rows.insurance_term_premium_table.valueJson);
    expect(s.rows.insurance_term_premium_table.isAppAssumption).toBe(true);
    expect(s.country?.fallbackKeys).toContain("insurance_term_premium_table");
    // A key the country did not report at all still falls back (flagged).
    expect(s.country?.fallbackKeys).toContain("health_premium_table");
    // Unknown public pension and allowance stay unknown (null), never the Bangladeshi scheme.
    expect(s.rows.public_pension_scheme.valueJson).toBeNull();
    expect(s.rows.old_age_allowance_eligibility.valueJson).toBeNull();
    expect(s.rows.old_age_allowance_monthly.value).toBeNull();
    expect(s.country?.fallbackKeys).not.toContain("public_pension_scheme");
    // App-policy money threshold converted from taka at 84/122.
    expect(getRate(s, "emergency_large_buffer_threshold")).toBe(Math.round((getRate(base, "emergency_large_buffer_threshold") * 84) / 122));
    expect(s.country?.notApplicable).toEqual([...BANGLADESH_ONLY_KEYS]);
    expect(s.country?.currency.code).toBe("INR");
  });

  it("prefers a regional figure over the base row when the country has none", () => {
    const regions = { north_america: { fdr_3m_rate: { value: 0.035, status: "assumption" as const, sourceName: "Regional median", sourceUrl: "docs/ARCHITECTURE.md", asOf: "2026-10-30" } } };
    const s = withCountry(base, FIXTURE_US, { ...opts, regions });
    expect(getRate(s, "fdr_3m_rate")).toBe(0.035);
    expect(s.rows.fdr_3m_rate.note).toMatch(/Regional median for north america/);
    expect(s.country?.unavailable).toContain("dps"); // the profile says so
    expect(s.country?.unavailable).not.toContain("fdr_3m"); // priced from the region
  });

  const field = (value: number | null, extra: Partial<CountryField> = {}): CountryField => ({ value, status: "assumption", sourceName: OUR_ASSUMPTION_SOURCE, sourceUrl: "docs/CONTRACTS-V2.md", asOf: "2026-10-30", ...extra });

  it("goes regional → global, converts US-dollar money figures, and never prices a product at the Bangladeshi rate", () => {
    const regions: RegionDefaults = {
      north_america: { fdr_3m_rate: field(0.035) },
      global: { fdr_3m_rate: field(0.02), policy_rate: field(0.04), health_hospitalisation_cost: field(500), deposit_insurance_limit: field(80000) },
    };
    const inr = withCountry(base, FIXTURE_IN, { ...opts, regions });
    expect(getRate(inr, "fdr_3m_rate")).toBe(0.02); // no south_asia figure → global
    expect(inr.rows.fdr_3m_rate.note).toMatch(/Global median/);
    expect(getRate(inr, "policy_rate")).toBe(0.04);
    // Own money figure kept in rupees; a global USD money figure converted at 84 rupees per dollar.
    expect(getRate(inr, "health_hospitalisation_cost")).toBe(250000);
    const us = withCountry(base, FIXTURE_US, { ...opts, regions });
    expect(getRate(us, "deposit_insurance_limit")).toBe(80000);
    expect(withCountry(base, { ...FIXTURE_IN, fields: {} }, { ...opts, regions }).rows.health_hospitalisation_cost.value).toBe(500 * 84);
    // No regional figure: the country's own nearest rate (a treasury bill for a 3-month deposit), flagged.
    const proxied = withCountry(base, FIXTURE_US, { ...opts, regions: {} });
    expect(getRate(proxied, "fdr_3m_rate")).toBe(0.042);
    expect(proxied.rows.fdr_3m_rate.note).toMatch(/Treasury bill, 3 months used instead/);
    expect(proxied.country?.fallbackKeys).toContain("fdr_3m_rate");
    // Nothing at all: the slot is unavailable rather than priced at the Bangladeshi rate.
    const bare = withCountry(base, { ...FIXTURE_US, fields: {} }, { ...opts, regions: {} });
    expect(bare.country?.unavailable).toEqual(expect.arrayContaining(["dps", "fdr_3m", "savings_account", "tbond_10y"]));
    expect(bare.country?.instrumentNames.sanchayapatra_5y).toBeUndefined();
  });

  it("honours absent: true as none, clears ranges and uses neutral labels", () => {
    const absent = (extra: Partial<CountryField> = {}): CountryField => ({ value: null, status: "missing", absent: true, sourceName: "", sourceUrl: "", asOf: "2026-10-30", note: "No such law.", ...extra });
    const p = { ...FIXTURE_US, fields: { ...FIXTURE_US.fields, gratuity_rule: absent(), insurance_term_premium_table: absent(), deposit_insurance_limit: absent(), tbond_5y_rate: absent(), inflation_cpi: absent() } };
    const s = withCountry(base, p, { ...opts, regions: { global: { inflation_cpi: field(0.03), tbond_5y_rate: field(0.04) } } });
    expect(s.rows.gratuity_rule.valueJson).toBeNull();
    expect(s.rows.gratuity_rule.note).toMatch(/None in United States/);
    expect(s.rows.insurance_term_premium_table.valueJson).toBeNull();
    expect(getRate(s, "deposit_insurance_limit")).toBe(0);
    expect(s.country?.unavailable).toContain("tbond_5y");
    // absent never applies to a figure that always exists: inflation still falls back.
    expect(getRate(s, "inflation_cpi")).toBe(0.03);
    for (const key of COUNTRY_FIELD_KEYS) {
      expect(s.rows[key].rangeLow ?? null, key).toBeNull();
      expect(s.rows[key].rangeHigh ?? null, key).toBeNull();
      expect(s.rows[key].labelEn, key).toBe(NEUTRAL_LABELS[key]?.en);
      expect(s.rows[key].labelBn, key).toBe(NEUTRAL_LABELS[key]?.bn);
    }
    // Bangladesh keeps its own labels and ranges.
    expect(withCountry(base, FIXTURE_BD, opts).rows.fdr_1y_rate.labelEn).toBe(base.rows.fdr_1y_rate.labelEn);
  });

  it("leaves an allowance with ages but no amount out", () => {
    const p = { ...FIXTURE_IN, fields: { ...FIXTURE_IN.fields, old_age_allowance_eligibility: { value: null, valueJson: { menAge: 60, womenAge: 60, meansTested: true }, status: "sourced" as const, sourceName: "x", sourceUrl: "https://x.test", asOf: "2026-10-01" } } };
    const s = withCountry(base, p, opts);
    expect(s.rows.old_age_allowance_monthly.value).toBeNull();
    expect(s.rows.old_age_allowance_eligibility.valueJson).toBeNull();
  });
});

describe("displaySourceName", () => {
  it("shows our own docs/ sources as Taka Plan's assumption", () => {
    expect(displaySourceName("PRD.md section 4", "docs/PRD.md#m7")).toBe(OUR_ASSUMPTION_SOURCE);
    expect(displaySourceName("Bangladesh Bank", "https://www.bb.org.bd/")).toBe("Bangladesh Bank");
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
