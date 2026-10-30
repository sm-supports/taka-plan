import type { Assumption, ExplainStep } from "@taka/engine";
import { describe, expect, it } from "vitest";
import { en } from "@/lib/i18n/dictionaries/en";
import { bn } from "@/lib/i18n/dictionaries/bn";
import { translate } from "@/lib/i18n/translate";
import { createFormatters } from "@/lib/i18n/useFormat";
import { assumptionLabel, formatAssumptionValue, formatByUnit, formatInput, formatStepParams, isExternalUrl } from "./formatInputs";

const fEn = createFormatters("en");
const fBn = createFormatters("bn");
const tEn = (key: string, params?: Record<string, string | number>) => translate(en, key, params);
const tBn = (key: string, params?: Record<string, string | number>) => translate(bn, key, params);

describe("formatInput naming convention", () => {
  it("percent for names ending in rate / inflation / tax / share and the known rate names", () => {
    expect(formatInput("monthlyRate", 0.00675, fEn, tEn)).toBe("0.7%");
    expect(formatInput("inflation", 0.08, fEn, tEn)).toBe("8.0%");
    expect(formatInput("tax", 0.1, fEn, tEn)).toBe("10.0%");
    expect(formatInput("minShare", 0.6, fEn, tEn)).toBe("60.0%");
    expect(formatInput("nominal", 0.1183, fEn, tEn)).toBe("11.8%");
    expect(formatInput("afterTax", 0.081, fEn, tEn)).toBe("8.1%");
  });

  it("plain numbers for months / years / count and the m1.months inputs", () => {
    expect(formatInput("months", 24, fEn, tEn)).toBe("24");
    expect(formatInput("buildMonths", 12, fEn, tEn)).toBe("12");
    expect(formatInput("years", 2, fEn, tEn)).toBe("2");
    expect(formatInput("bumpNoHealth", 2, fEn, tEn)).toBe("2");
    expect(formatInput("max", 15, fBn, tBn)).toBe("১৫");
  });

  it("taka for everything else, with Bangla digits in bn", () => {
    expect(formatInput("essentials", 28000, fEn, tEn)).toBe("৳28,000");
    expect(formatInput("target", 224000, fBn, tBn)).toBe("৳২,২৪,০০০");
  });

  it("translates instrument ids and passes other strings through", () => {
    expect(formatInput("instrument", "dps", fEn, tEn)).toBe("DPS");
    expect(formatInput("instrument", "sanchayapatra_5y", fBn, tBn)).toBe("৫ বছর মেয়াদি সঞ্চয়পত্র");
    expect(formatInput("name", "Motorbike", fEn, tEn)).toBe("Motorbike");
  });
});

describe("formatStepParams", () => {
  const step: ExplainStep = { id: "m1.target", inputs: { essentials: 28000, months: 8 }, raw: 224000, rounded: 224000, unit: "bdt" };

  it("adds result in the step unit and fills the dictionary template with no leftover slots", () => {
    const params = formatStepParams(step, fEn, tEn);
    expect(params).toEqual({ essentials: "৳28,000", months: "8", result: "৳2,24,000" });
    const body = tEn("explain.m1.target.body", params);
    expect(body).toContain("৳28,000 × 8 = ৳2,24,000");
    expect(body).not.toMatch(/\{\w+\}/);
  });

  it("uses Bangla digits throughout in bn", () => {
    const body = tBn("explain.m1.target.body", formatStepParams(step, fBn, tBn));
    expect(body).toContain("৳২৮,০০০ × ৮ = ৳২,২৪,০০০");
    expect(body).not.toMatch(/[0-9]/);
  });

  it("formats results by unit", () => {
    expect(formatByUnit(0.7, "months", fEn)).toBe("0.7 months");
    expect(formatByUnit(2, "count", fEn)).toBe("2");
    expect(formatByUnit(0.378, "rate", fEn)).toBe("37.8%");
    expect(formatByUnit(5700, "bdt", fBn)).toBe("৳৫,৭০০");
  });
});

describe("assumptions", () => {
  const a: Assumption = {
    key: "fdr_3m_rate",
    value: 0.07,
    unit: "rate",
    labelEn: "FDR, 3 months",
    labelBn: "এফডিআর, ৩ মাস",
    asOf: "2026-09-30",
    sourceUrl: "https://example.com/rates",
    sourceName: "Bank rate sheets",
    stale: false,
    isAppAssumption: false,
  };

  it("picks the Bangla label only in bn, falling back to English", () => {
    expect(assumptionLabel(a, "bn")).toBe("এফডিআর, ৩ মাস");
    expect(assumptionLabel(a, "en")).toBe("FDR, 3 months");
    expect(assumptionLabel({ ...a, labelBn: null }, "bn")).toBe("FDR, 3 months");
  });

  it("formats values by row unit", () => {
    expect(formatAssumptionValue(0.07, "rate", fEn, tEn)).toBe("7.0%");
    expect(formatAssumptionValue(0.6, "ratio", fEn, tEn)).toBe("60.0%");
    expect(formatAssumptionValue(200000, "bdt", fBn, tBn)).toBe("৳২,০০,০০০");
    expect(formatAssumptionValue(6, "months", fEn, tEn)).toBe("6 months");
    expect(formatAssumptionValue(72.3, "years", fEn, tEn)).toBe("72.3 years");
    expect(formatAssumptionValue(null, "json", fEn, tEn)).toBe("—");
  });

  it("only links real web sources", () => {
    expect(isExternalUrl("https://www.bb.org.bd/")).toBe(true);
    expect(isExternalUrl("docs/PRD.md#m1-emergency-fund")).toBe(false);
  });
});
