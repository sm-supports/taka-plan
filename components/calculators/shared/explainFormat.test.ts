import { describe, expect, it } from "vitest";
import type { Assumption, ExplainStep } from "@taka/engine";
import { createFormatters } from "@/lib/i18n/useFormat";
import { classifyExplainInput, formatAssumptionValue, formatStepResult, stepParams } from "./explainFormat";

const en = createFormatters("en");
const bn = createFormatters("bn");
const instrument = (id: string) => `<${id}>`;

describe("classifyExplainInput", () => {
  it("follows the contract naming convention", () => {
    expect(classifyExplainInput("monthlyRate", 0.01)).toBe("percent");
    expect(classifyExplainInput("rate", 0.2)).toBe("percent");
    expect(classifyExplainInput("inflation", 0.08)).toBe("percent");
    expect(classifyExplainInput("tax", 0.1)).toBe("percent");
    expect(classifyExplainInput("minShare", 0.6)).toBe("percent");
    expect(classifyExplainInput("months", 10)).toBe("number");
    expect(classifyExplainInput("buildMonths", 12)).toBe("number");
    expect(classifyExplainInput("years", 5)).toBe("number");
    expect(classifyExplainInput("base", 6)).toBe("number");
    expect(classifyExplainInput("bumpNoHealth", 2)).toBe("number");
    expect(classifyExplainInput("essentials", 25000)).toBe("taka");
    expect(classifyExplainInput("limit", 200000)).toBe("taka");
    expect(classifyExplainInput("instrument", "dps")).toBe("instrument");
    expect(classifyExplainInput("instrument", "something else")).toBe("text");
  });
});

describe("stepParams", () => {
  const step: ExplainStep = { id: "m1.monthly", inputs: { gap: 200000, buildMonths: 12 }, raw: 200000 / 12, rounded: 16700, unit: "bdt" };

  it("formats inputs by name and the result by unit, in both locales", () => {
    expect(stepParams(step, en, instrument)).toEqual({ gap: "৳2,00,000", buildMonths: "12", result: "৳16,700" });
    expect(stepParams(step, bn, instrument)).toEqual({ gap: "৳২,০০,০০০", buildMonths: "১২", result: "৳১৬,৭০০" });
  });

  it("formats months, rate and count results", () => {
    expect(formatStepResult({ id: "m1.months", inputs: {}, raw: 10, rounded: 10, unit: "months" }, en)).toBe("10 months");
    expect(formatStepResult({ id: "m1.covered", inputs: {}, raw: 2, rounded: 2, unit: "months" }, bn)).toBe("২ মাস");
    expect(formatStepResult({ id: "m4.feasible", inputs: {}, raw: 0.4, rounded: 0.4, unit: "rate" }, en)).toBe("40.0%");
    expect(formatStepResult({ id: "m1.banks", inputs: {}, raw: 1.125, rounded: 2, unit: "count" }, en)).toBe("2");
  });

  it("translates instrument ids through the callback", () => {
    const s: ExplainStep = { id: "m5.rate", inputs: { instrument: "sanchayapatra_5y", nominal: 0.1183, tax: 0.1 }, raw: 0.10647, rounded: 0.106, unit: "rate" };
    expect(stepParams(s, en, instrument)).toEqual({ instrument: "<sanchayapatra_5y>", nominal: "11.8%", tax: "10.0%", result: "10.6%" });
  });
});

describe("formatAssumptionValue", () => {
  const base: Assumption = { key: "dps_rate", value: 0.09, unit: "rate", labelEn: "DPS", asOf: "2026-09-30", sourceUrl: "", sourceName: "x", stale: false, isAppAssumption: false };
  it("formats by the row unit", () => {
    expect(formatAssumptionValue(base, en)).toBe("9.0%");
    expect(formatAssumptionValue({ ...base, key: "deposit_insurance_limit", unit: "bdt", value: 200000 }, en)).toBe("৳2,00,000");
    expect(formatAssumptionValue({ ...base, key: "emergency_base_months", unit: "months", value: 6 }, bn)).toBe("৬ মাস");
    expect(formatAssumptionValue({ ...base, key: "tax_slabs", unit: "json", value: null }, en)).toBe("—");
  });
});
