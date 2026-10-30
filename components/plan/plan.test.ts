import { PLAN_NEXT_KEYS, PLAN_REASON_KEYS, PLAN_STEP_IDS, roundMoney, type Bucket } from "@taka/engine";
import { describe, expect, it } from "vitest";
import { en } from "@/lib/i18n/dictionaries/en";
import { bn } from "@/lib/i18n/dictionaries/bn";
import { getPath, translate } from "@/lib/i18n/translate";
import { createFormatters } from "@/lib/i18n/useFormat";
import { bucketExplanation, headlineExplanation } from "./explanationFor";
import { SAMPLE_PLAN } from "./fixtures";
import { bucketKey, bucketMatchesWhy, bucketReason, bucketTitle, formatReasonParams } from "./formatReason";
import { calculatorPath, isTermKey, termForInstrument } from "./terms";

// The engine's m5 helpers are stubs in this worktree; these are the contract formulas written out.
const futureValue = (cost: number, inflation: number, years: number) => cost * (1 + inflation) ** years;
const sinkingFundMonthly = (fv: number, annual: number, months: number) => {
  const rm = annual / 12;
  return (fv * rm) / ((1 + rm) ** months - 1);
};

const fEn = createFormatters("en");
const fBn = createFormatters("bn");
const tEn = (key: string, params?: Record<string, string | number>) => translate(en, key, params);
const tBn = (key: string, params?: Record<string, string | number>) => translate(bn, key, params);

describe("SAMPLE_PLAN fixture", () => {
  it("sums its buckets to the monthly total, in priority order, with at most one red", () => {
    const total = SAMPLE_PLAN.buckets.reduce((s, b) => s + b.amount, 0);
    expect(total).toBe(SAMPLE_PLAN.monthlyTotal);
    expect(SAMPLE_PLAN.buckets.map((b) => b.priority)).toEqual([1, 2, 3]);
    const visibleReds = SAMPLE_PLAN.buckets.filter((b) => b.status === "red" && !b.demotedFromRed);
    expect(visibleReds).toHaveLength(1);
    expect(visibleReds[0]!.id).toBe("emergency");
    expect(SAMPLE_PLAN.buckets.some((b) => b.demotedFromRed)).toBe(true);
  });

  it("matches the engine formulas for the numbers it hard-codes", () => {
    const { emergency, budget } = SAMPLE_PLAN;
    expect(budget.savingsAmount).toBe(roundMoney(45000 * 0.2, "monthly"));
    expect(emergency.target).toBe(28000 * 8);
    expect(emergency.monthlySaving).toBe(roundMoney((28000 * 8 - 20000) / 36, "monthly"));
    // Plan split: emergency = min(B, max(m1.monthly, 60% of B)); the rest to goals ∝ monthly.base.
    const emergencyShare = Math.min(budget.savingsAmount, Math.max(emergency.monthlySaving, 0.6 * budget.savingsAmount));
    expect(SAMPLE_PLAN.buckets[0]!.amount).toBe(emergencyShare);
    const bike = SAMPLE_PLAN.goals!.goals[0]!;
    expect(bike.futureValue).toBe(roundMoney(futureValue(250000, 0.08, 2), "lump"));
    expect(bike.monthly.base).toBe(roundMoney(sinkingFundMonthly(futureValue(250000, 0.08, 2), 0.081, 24), "monthly"));
    const wedding = SAMPLE_PLAN.goals!.goals[1]!;
    expect(wedding.monthly.base).toBe(roundMoney(sinkingFundMonthly(futureValue(600000, 0.08, 4), 0.1183 * 0.9, 48), "monthly"));
    expect(SAMPLE_PLAN.summary.goalsShortfall).toBe(bike.monthly.base + wedding.monthly.base - (budget.savingsAmount - emergencyShare));
  });

  it("only uses dictionary keys that exist in both languages", () => {
    const reasonKeys: readonly string[] = PLAN_REASON_KEYS;
    const nextKeys: readonly string[] = PLAN_NEXT_KEYS;
    const stepIds: readonly string[] = PLAN_STEP_IDS;
    for (const b of SAMPLE_PLAN.buckets) {
      expect(reasonKeys).toContain(b.reasonKey);
      expect(nextKeys).toContain(b.nextStepKey);
    }
    for (const s of SAMPLE_PLAN.explain.steps) {
      if (s.id.startsWith("plan.")) expect(stepIds).toContain(s.id);
      for (const dict of [en, bn]) {
        expect(typeof getPath(dict, `explain.${s.id}.title`)).toBe("string");
        expect(typeof getPath(dict, `explain.${s.id}.body`)).toBe("string");
      }
    }
    for (const n of SAMPLE_PLAN.explain.notes) expect(typeof getPath(en, n)).toBe("string");
  });

  it("carries real as-of dates on every assumption", () => {
    expect(SAMPLE_PLAN.explain.assumptions.length).toBeGreaterThan(5);
    for (const a of SAMPLE_PLAN.explain.assumptions) expect(a.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("bucket reasons", () => {
  const [emergency, bike, wedding] = SAMPLE_PLAN.buckets as [Bucket, Bucket, Bucket];

  it("formats emergency params as taka / plain numbers", () => {
    expect(formatReasonParams(emergency, fEn, tEn)).toEqual({ amount: "৳5,700", covered: "0.7", months: "8" });
    expect(bucketReason(emergency, fEn, tEn)).toBe("Emergency fund — ৳5,700/month into a 3-month FDR ladder — you have 0.7 of 8 months covered");
  });

  it("translates the goal instrument and adds the years unit", () => {
    expect(bucketReason(bike, fEn, tEn)).toBe("Motorbike — ৳1,500/month into DPS — you will need ৳2,91,500 in 2 years");
    const bnReason = bucketReason(wedding, fBn, tBn);
    expect(bnReason).toContain("৫ বছর মেয়াদি সঞ্চয়পত্র-এ মাসে ৳১,৮০০");
    expect(bnReason).toContain("৪ বছর পর লাগবে ৳৮,১৬,৫০০");
    expect(bnReason).not.toMatch(/[0-9]/);
  });

  it("formats debt reasons with a percent rate and a months duration", () => {
    const debt: Pick<Bucket, "reasonKey" | "reasonParams"> = { reasonKey: "plan.reason.debt", reasonParams: { rate: 0.25, amount: 5000, months: 12 } };
    expect(bucketReason(debt, fEn, tEn)).toBe("High-interest debt at 25.0% — ৳5,000/month on top of your EMI — cleared in about 12 months");
  });

  it("titles goal buckets by goal name and the rest by bucket", () => {
    expect(bucketTitle(emergency, tEn)).toBe("Emergency fund");
    expect(bucketTitle(bike, tEn)).toBe("Goal: Motorbike");
    expect(bucketTitle(bike, tBn)).toBe("লক্ষ্য: Motorbike");
  });

  it("keys buckets for ?why= and matches by key, refId or unique id", () => {
    expect(bucketKey(emergency)).toBe("emergency");
    expect(bucketKey(bike)).toBe("goal:g-bike");
    expect(bucketMatchesWhy(emergency, "emergency")).toBe(true);
    expect(bucketMatchesWhy(bike, "goal:g-bike")).toBe(true);
    expect(bucketMatchesWhy(bike, "g-bike")).toBe(true);
    expect(bucketMatchesWhy(bike, "goal")).toBe(false);
    expect(bucketMatchesWhy(wedding, "g-bike")).toBe(false);
    expect(bucketMatchesWhy(emergency, null)).toBe(false);
  });
});

describe("explanations per figure", () => {
  it("headline = budget steps + plan.total", () => {
    const ids = headlineExplanation(SAMPLE_PLAN).steps.map((s) => s.id);
    expect(ids).toContain("m4.amount");
    expect(ids).toContain("plan.total");
    expect(ids).not.toContain("plan.emergencyShare");
  });

  it("emergency bucket = m1 steps + plan.emergencyShare; goal bucket = that goal's m5 steps + plan.goalsShare", () => {
    const [emergency, bike, wedding] = SAMPLE_PLAN.buckets as [Bucket, Bucket, Bucket];
    const e = bucketExplanation(SAMPLE_PLAN, emergency);
    expect(e.steps.map((s) => s.id)).toEqual([...SAMPLE_PLAN.emergency.explain.steps.map((s) => s.id), "plan.emergencyShare"]);
    expect(e.assumptions.some((a) => a.key === "plan_emergency_min_share")).toBe(true);
    const g = bucketExplanation(SAMPLE_PLAN, bike);
    expect(g.steps.filter((s) => s.id.startsWith("m5.")).length).toBe(4);
    expect(g.notes).toContain("m5.note.belowInflation");
    expect(bucketExplanation(SAMPLE_PLAN, wedding).notes).toEqual([]);
  });
});

describe("terms and routes", () => {
  it("maps instruments to glossary entries, with the ladder for the emergency fund", () => {
    expect(termForInstrument("fdr_3m", "emergency")).toBe("ladder");
    expect(termForInstrument("fdr_3m", "goal")).toBe("fdr");
    expect(termForInstrument("sanchayapatra_5y", "goal")).toBe("sanchayapatra");
    expect(termForInstrument("savings_account", "emergency")).toBeUndefined();
    expect(isTermKey("dps")).toBe(true);
    expect(isTermKey("nope")).toBe(false);
  });

  it("links m1 / m3 / m5 and nothing for m2 / m7", () => {
    expect(calculatorPath("m1", "bn")).toBe("/bn/m1");
    expect(calculatorPath("m5", "en")).toBe("/en/m5");
    expect(calculatorPath("m2", "en")).toBeNull();
    expect(calculatorPath("m7", "bn")).toBeNull();
  });
});
