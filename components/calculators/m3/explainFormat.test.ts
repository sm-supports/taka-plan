import { RATES_SEED, assertSnapshot, type Assumption, type ExplainStep } from "@taka/engine";
import { describe, expect, it } from "vitest";
import { createFormatters } from "@/lib/i18n/useFormat";
import { assumptionLabel, assumptionValue, formatByUnit, formatInput, stepParams } from "./explainFormat";
import { engineErrorKey } from "./engineError";
import { parsePercent } from "./percent";
import { DEMO_M3_INPUT, buildDemoM3Result } from "./demo";

const en = createFormatters("en");
const bn = createFormatters("bn");
const inst = (id: string) => `<${id}>`;
const snapshot = assertSnapshot(RATES_SEED);
const TODAY = "2026-10-30";

describe("formatInput", () => {
  it("formats by name suffix: rate/inflation/tax/share/nominal → percent, months/years/count → number, else taka", () => {
    expect(formatInput("monthlyRate", 0.01, en, inst)).toBe("1.0%");
    expect(formatInput("inflation", 0.08, en, inst)).toBe("8.0%");
    expect(formatInput("tax", 0.1, en, inst)).toBe("10.0%");
    expect(formatInput("afterTax", 0.10647, en, inst)).toBe("10.6%");
    expect(formatInput("minShare", 0.6, en, inst)).toBe("60.0%");
    expect(formatInput("nominal", 0.1183, en, inst)).toBe("11.8%");
    expect(formatInput("months", 60, en, inst)).toBe("60 months");
    expect(formatInput("buildMonths", 12, en, inst)).toBe("12 months");
    expect(formatInput("years", 5, en, inst)).toBe("5");
    expect(formatInput("takeHome", 120000, en, inst)).toBe("৳1,20,000");
    expect(formatInput("instrument", "dps", en, inst)).toBe("<dps>");
    expect(formatInput("takeHome", 120000, bn, inst)).toBe("৳১,২০,০০০");
  });
});

describe("stepParams / formatByUnit", () => {
  it("adds result by the step unit", () => {
    const step: ExplainStep = { id: "m3.emiRatio", inputs: { totalEmi: 28000, takeHome: 120000 }, raw: 0.2333, rounded: 0.233, unit: "rate" };
    expect(stepParams(step, en, inst)).toEqual({ totalEmi: "৳28,000", takeHome: "৳1,20,000", result: "23.3%" });
    expect(formatByUnit(899000, "bdt", en)).toBe("৳8,99,000");
    expect(formatByUnit(8, "months", bn)).toBe("৮ মাস");
    expect(formatByUnit(2, "count", en)).toBe("2");
  });
});

describe("assumption rows", () => {
  const base: Assumption = { key: "emi_ratio_red", value: 0.4, unit: "ratio", labelEn: "EMI ratio red line", labelBn: "ইএমআই লাল সীমা", asOf: "2026-10-30", sourceUrl: "https://example.org", sourceName: "Taka Plan", stale: false, isAppAssumption: true };
  it("formats value by row unit and picks the Bangla label only in bn", () => {
    expect(assumptionValue(base, en)).toBe("40.0%");
    expect(assumptionValue({ ...base, unit: "bdt", value: 200000 }, en)).toBe("৳2,00,000");
    expect(assumptionValue({ ...base, unit: "json", value: null }, en)).toBeNull();
    expect(assumptionLabel(base, "bn")).toBe("ইএমআই লাল সীমা");
    expect(assumptionLabel(base, "en")).toBe("EMI ratio red line");
    expect(assumptionLabel({ ...base, labelBn: null }, "bn")).toBe("EMI ratio red line");
  });
});

describe("engineErrorKey", () => {
  it("maps stub, missing-rate, invalid-input and unknown errors", () => {
    expect(engineErrorKey(new Error("boom"))).toBe("errors.generic");
    expect(engineErrorKey(Object.assign(new Error("not implemented: computeDebtHealth"), { name: "EngineError", code: "INVALID_INPUT" }))).toBe("errors.engineNotReady");
    expect(engineErrorKey(Object.assign(new Error("x"), { name: "EngineError", code: "MISSING_RATE" }))).toBe("errors.missingRate");
    expect(engineErrorKey(Object.assign(new Error("x"), { name: "EngineError", code: "INVALID_INPUT" }))).toBe("errors.invalidInput");
  });
});

describe("parsePercent", () => {
  it("accepts Latin and Bangla digits, strips %, rejects out-of-range", () => {
    expect(parsePercent("12")).toBe(0.12);
    expect(parsePercent("12.5 %")).toBe(0.125);
    expect(parsePercent("১২")).toBe(0.12);
    expect(parsePercent("")).toBeNull();
    expect(parsePercent("abc")).toBeNull();
    expect(parsePercent("150")).toBeNull();
  });
});

describe("demo M3 fixture", () => {
  const r = buildDemoM3Result(DEMO_M3_INPUT, snapshot, TODAY);
  it("follows the contract: one red, demoted reds amber, step ids match M3_STEP_IDS", () => {
    expect(r.flags.filter((f) => f.status === "red")).toHaveLength(1);
    expect(r.primaryFlag?.id).toBe("card_carried");
    expect(r.flags.find((f) => f.id === "emi_ratio")).toMatchObject({ status: "amber", demotedFromRed: true });
    expect(r.flags.find((f) => f.id === "card_utilisation")).toMatchObject({ status: "amber", demotedFromRed: false });
    expect(r.explain.steps.map((s) => s.id)).toEqual(["m3.totalEmi", "m3.emiRatio", "m3.capacity", "m3.maxLoan", "m3.scenarioEmi", "m3.interestSaved"]);
    expect(r.totalEmi).toBe(29800);
    expect(r.emiCapacity).toBe(34500);
    expect(r.headroom).toBe(4700);
    expect(r.maxAffordableLoan % 500).toBe(0);
    expect(r.scenario.emi % 100).toBe(0);
    expect(r.avalanche.totalInterest).toBeLessThanOrEqual(r.snowball.totalInterest);
    expect(r.interestSaved).toBe(r.snowball.totalInterest - r.avalanche.totalInterest);
    expect(r.avalanche.order).toEqual(["demo-c1", "demo-l1", "demo-l2"]);
    expect(r.snowball.order).toEqual(["demo-c1", "demo-l2", "demo-l1"]);
    expect(r.debtTrapPath).toHaveLength(5);
  });
  it("reproduces the PRD vector: ৳20,000 headroom at 12% over 60 months ≈ 9.0 lakh", () => {
    const v = buildDemoM3Result({ takeHome: 100000, essentials: 55000, savingsTarget: 20000, loans: [], cards: [], scenario: { annualRate: 0.12, months: 60 } }, snapshot, TODAY);
    expect(v.headroom).toBe(20000);
    expect(v.maxAffordableLoan).toBe(899000);
    expect(v.scenario.emi).toBe(20000);
    expect(v.status).toBe("green");
    expect(v.flags).toEqual([]);
  });
});
