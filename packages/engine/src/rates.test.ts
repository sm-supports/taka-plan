import { describe, expect, it } from "vitest";
import seed from "./data/rates.seed.json";
import { RATE_KEYS, afterTax, assertSnapshot, getRate, getTaxSlabs, instrumentAfterTax, instrumentReal, isStale, realReturn, staleKeys } from "./rates";

const snapshot = assertSnapshot(seed);

describe("seed snapshot", () => {
  it("has exactly the keys the engine knows", () => {
    expect(Object.keys(snapshot.rows).sort()).toEqual([...RATE_KEYS].sort());
    expect(snapshot.version).toBe(1);
  });
  it("validates every row", () => {
    for (const key of RATE_KEYS) {
      const row = snapshot.rows[key];
      expect(row.key).toBe(key);
      expect(row.sourceUrl.length).toBeGreaterThan(0);
      expect(row.asOf <= "2026-10-30").toBe(true);
      expect(row.nextReview > row.asOf).toBe(true);
    }
    expect(getTaxSlabs(snapshot)).toHaveLength(5);
  });
  it("rejects broken snapshots", () => {
    expect(() => assertSnapshot(null)).toThrow();
    expect(() => assertSnapshot({ ...snapshot, rows: { ...snapshot.rows, bogus_key: snapshot.rows.inflation_cpi } })).toThrow(/unknown/);
    const { inflation_cpi: _drop, ...rest } = snapshot.rows;
    expect(() => assertSnapshot({ ...snapshot, rows: rest })).toThrow(/missing/);
  });

  describe("value bounds by unit", () => {
    const withRow = (key: keyof typeof snapshot.rows, patch: Record<string, unknown>) => ({
      ...snapshot,
      rows: { ...snapshot.rows, [key]: { ...snapshot.rows[key], ...patch } },
    });
    const bad = (key: keyof typeof snapshot.rows, patch: Record<string, unknown>, field = "value") =>
      expect(() => assertSnapshot(withRow(key, patch))).toThrow(new RegExp(`row "${key}": bad ${field}`));

    it("rejects a 5.0 FDR rate (rates and ratios must be 0..1)", () => {
      bad("fdr_1y_rate", { value: 5 });
      bad("fdr_1y_rate", { value: -0.01 });
      bad("fdr_1y_rate", { value: Number.NaN });
      bad("fdr_1y_rate", { value: null });
      bad("fdr_1y_rate", { value: "0.075" });
      bad("plan_emergency_min_share", { value: 1.5 });
      expect(() => assertSnapshot(withRow("fdr_1y_rate", { value: 1 }))).not.toThrow();
      expect(() => assertSnapshot(withRow("fdr_1y_rate", { value: 0 }))).not.toThrow();
    });

    it("rejects a string tax_slabs and malformed slabs (json rows need an object or array)", () => {
      bad("tax_slabs", { valueJson: "[]" }, "valueJson");
      bad("tax_slabs", { valueJson: null }, "valueJson");
      bad("tax_slabs", { valueJson: undefined }, "valueJson");
      bad("tax_slabs", { valueJson: [] }, "valueJson");
      bad("tax_slabs", { valueJson: [{ width: 300000, rate: 1.5 }] }, "valueJson");
      bad("tax_slabs", { valueJson: [{ width: "300000", rate: 0.1 }] }, "valueJson");
      bad("tax_slabs", { valueJson: { width: null, rate: 0.1 } }, "valueJson");
      expect(() => assertSnapshot(withRow("tax_slabs", { valueJson: [{ width: null, rate: 0.3 }] }))).not.toThrow();
    });

    it("rejects negative taka amounts and out-of-range periods", () => {
      bad("deposit_insurance_limit", { value: -1 });
      bad("emergency_build_months_default", { value: 0 });
      bad("emergency_build_months_default", { value: 1201 });
      bad("life_expectancy", { value: -5 });
      expect(() => assertSnapshot(withRow("deposit_insurance_limit", { value: 0 }))).not.toThrow();
      expect(() => assertSnapshot(withRow("emergency_build_months_default", { value: 1200 }))).not.toThrow();
    });
  });
});

describe("real returns (PRD vectors)", () => {
  it("Sanchayapatra 11.83% → 10.647% after 10% tax → about +2.1% real vs 8.34% CPI", () => {
    const after = afterTax(0.1183, 0.1);
    expect(after).toBeCloseTo(0.10647, 5);
    expect(realReturn(after, 0.0834)).toBeCloseTo(0.0213, 3);
    expect(instrumentAfterTax(snapshot, "sanchayapatra_5y")).toBeCloseTo(0.10647, 5);
    expect(instrumentReal(snapshot, "sanchayapatra_5y")).toBeCloseTo(0.0213, 3);
  });
  it("1-year FDR 7.5% → 6.75% after tax → about −1.5% real", () => {
    expect(instrumentAfterTax(snapshot, "fdr_1y")).toBeCloseTo(0.0675, 6);
    expect(instrumentReal(snapshot, "fdr_1y")).toBeCloseTo(-0.0147, 3);
  });
  it("reads numeric rows and throws on JSON-only rows", () => {
    expect(getRate(snapshot, "deposit_insurance_limit")).toBe(200000);
    expect(() => getRate(snapshot, "tax_slabs")).toThrow(/numeric/);
  });
});

describe("staleness", () => {
  it("flags rows past their review date", () => {
    expect(isStale(snapshot.rows.inflation_cpi, "2026-10-30")).toBe(false);
    expect(isStale(snapshot.rows.inflation_cpi, "2027-01-01")).toBe(true);
    expect(staleKeys(snapshot, "2026-10-30")).toEqual([]);
    expect(staleKeys(snapshot, "2027-02-01")).toContain("sanchayapatra_5y_rate");
  });
});
