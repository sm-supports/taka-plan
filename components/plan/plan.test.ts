import { PLAN_NEXT_KEYS, PLAN_REASON_KEYS, PLAN_STEP_IDS, RATES_SEED, assertSnapshot, computePlan, roundMoney, type Bucket, type ExplainStep, type Plan } from "@taka/engine";
import { describe, expect, it } from "vitest";
import { en } from "@/lib/i18n/dictionaries/en";
import { bn } from "@/lib/i18n/dictionaries/bn";
import { getPath, translate } from "@/lib/i18n/translate";
import { createFormatters } from "@/lib/i18n/useFormat";
import { bucketExplanation, headlineExplanation } from "./explanationFor";
import { DEMO_BUILD_MONTHS, DEMO_TODAY, samplePlan, samplePlanInput } from "./fixtures";
import { bucketKey, bucketMatchesWhy, bucketReason, bucketTitle, formatReasonParams } from "./formatReason";
import { calculatorPath, isTermKey, termForInstrument } from "./terms";

const fEn = createFormatters("en");
const fBn = createFormatters("bn");
const tEn = (key: string, params?: Record<string, string | number>) => translate(en, key, params);
const tBn = (key: string, params?: Record<string, string | number>) => translate(bn, key, params);

const SAMPLE_PLAN = samplePlan("en");
const goalBuckets = (plan: Plan) => plan.buckets.filter((b) => b.id === "goal");

describe("sample plan (engine over the firstJob profile)", () => {
  it("is the engine's own output for the sample input, with the seed rates", () => {
    const seed = assertSnapshot(RATES_SEED);
    expect(SAMPLE_PLAN).toEqual(computePlan(samplePlanInput("en"), seed, DEMO_TODAY));
    expect(SAMPLE_PLAN.budget.savingsAmount).toBe(roundMoney(45000 * 0.2, "monthly"));
    expect(SAMPLE_PLAN.emergency.monthlySaving).toBe(roundMoney(SAMPLE_PLAN.emergency.gap / DEMO_BUILD_MONTHS, "monthly"));
  });

  it("sums its buckets to the monthly total, in priority order, with at most one visible red", () => {
    const total = SAMPLE_PLAN.buckets.reduce((s, b) => s + b.amount, 0);
    expect(total).toBe(SAMPLE_PLAN.monthlyTotal);
    expect(SAMPLE_PLAN.monthlyTotal).toBe(SAMPLE_PLAN.budget.savingsAmount);
    expect(SAMPLE_PLAN.buckets.map((b) => b.priority)).toEqual(SAMPLE_PLAN.buckets.map((_, i) => i + 1));
    const visibleReds = SAMPLE_PLAN.buckets.filter((b) => b.status === "red" && !b.demotedFromRed);
    expect(visibleReds).toHaveLength(1);
    expect(visibleReds[0]!.id).toBe("emergency");
    expect(goalBuckets(SAMPLE_PLAN)).toHaveLength(2);
  });

  it("names its goals in the locale", () => {
    expect(goalBuckets(SAMPLE_PLAN).map((b) => b.reasonParams.name)).toEqual(["Motorbike", "Wedding"]);
    expect(goalBuckets(samplePlan("bn")).map((b) => b.reasonParams.name)).toEqual(["মোটরবাইক", "বিয়ে"]);
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
  const emergency: Pick<Bucket, "reasonKey" | "reasonParams"> = { reasonKey: "plan.reason.emergency", reasonParams: { amount: 5700, covered: 0.7, months: 8, instrument: "fdr_3m" } };
  const bike: Pick<Bucket, "id" | "refId" | "reasonKey" | "reasonParams"> = {
    id: "goal",
    refId: "g-bike",
    reasonKey: "plan.reason.goal",
    reasonParams: { name: "Motorbike", amount: 1500, need: 11200, instrument: "dps", fv: 291500, years: 2 },
  };
  const wedding: Pick<Bucket, "id" | "refId" | "reasonKey" | "reasonParams"> = {
    id: "goal",
    refId: "g-wedding",
    reasonKey: "plan.reason.goal",
    reasonParams: { name: "বিয়ে", amount: 1800, need: 13700, instrument: "sanchayapatra_5y", fv: 816500, years: 4 },
  };

  it("formats emergency params as taka / plain numbers and translates the instrument (P2: same name as the Where line)", () => {
    expect(formatReasonParams(emergency, fEn, tEn)).toEqual({ amount: "৳5,700", covered: "0.7", months: "8", instrument: "3-month FDR" });
    expect(bucketReason(emergency, fEn, tEn)).toBe("Emergency fund — ৳5,700/month into 3-month FDR — you have 0.7 of 8 months covered");
    expect(bucketReason({ ...emergency, reasonParams: { ...emergency.reasonParams, instrument: "savings_account" } }, fBn, tBn)).toContain("সেভিংস অ্যাকাউন্ট-এ মাসে ৳৫,৭০০");
  });

  it("translates the goal instrument and adds the years unit", () => {
    expect(bucketReason(bike, fEn, tEn)).toBe("Motorbike — ৳1,500/month into DPS — you will need ৳2,91,500 in 2 years");
    const bnReason = bucketReason(wedding, fBn, tBn);
    expect(bnReason).toContain("৫ বছর মেয়াদি সঞ্চয়পত্র-এ মাসে ৳১,৮০০");
    expect(bnReason).toContain("৪ বছর পর লাগবে ৳৮,১৬,৫০০");
    expect(bnReason).not.toMatch(/[0-9]/);
  });

  it("formats debt reasons with a percent rate, a months duration and a plain count", () => {
    const debt: Pick<Bucket, "reasonKey" | "reasonParams"> = { reasonKey: "plan.reason.debt", reasonParams: { rate: 0.25, amount: 5000, months: 14, count: 2 } };
    expect(formatReasonParams(debt, fEn, tEn).count).toBe("2");
    expect(bucketReason(debt, fEn, tEn)).toBe("High-interest debt at 25.0% — ৳5,000/month on top of your EMI — cleared in about 14 months at this pace");
  });

  it("titles goal buckets by goal name and the rest by bucket", () => {
    const [first, second] = goalBuckets(SAMPLE_PLAN) as [Bucket, Bucket];
    expect(bucketTitle(SAMPLE_PLAN.buckets[0]!, tEn)).toBe("Emergency fund");
    expect(bucketTitle(first, tEn)).toBe("Goal: Motorbike");
    expect(bucketTitle(second, tEn)).toBe("Goal: Wedding");
    expect(bucketTitle(goalBuckets(samplePlan("bn"))[0]!, tBn)).toBe("লক্ষ্য: মোটরবাইক");
  });

  it("keys buckets for ?why= and matches by key, refId or unique id", () => {
    const emergencyBucket = SAMPLE_PLAN.buckets[0]!;
    const [first, second] = goalBuckets(SAMPLE_PLAN) as [Bucket, Bucket];
    expect(bucketKey(emergencyBucket)).toBe("emergency");
    expect(bucketKey(first)).toBe("goal:g-bike");
    expect(bucketMatchesWhy(emergencyBucket, "emergency")).toBe(true);
    expect(bucketMatchesWhy(first, "goal:g-bike")).toBe(true);
    expect(bucketMatchesWhy(first, "g-bike")).toBe(true);
    expect(bucketMatchesWhy(first, "goal")).toBe(false);
    expect(bucketMatchesWhy(second, "g-bike")).toBe(false);
    expect(bucketMatchesWhy(emergencyBucket, null)).toBe(false);
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
    const emergency = SAMPLE_PLAN.buckets[0]!;
    const [bike, wedding] = goalBuckets(SAMPLE_PLAN) as [Bucket, Bucket];
    const e = bucketExplanation(SAMPLE_PLAN, emergency);
    expect(e.steps.map((s) => s.id)).toEqual([...SAMPLE_PLAN.emergency.explain.steps.map((s) => s.id), "plan.emergencyShare"]);
    expect(e.assumptions.some((a) => a.key === "plan_emergency_min_share")).toBe(true);
    const g = bucketExplanation(SAMPLE_PLAN, bike);
    expect(g.steps.filter((s) => s.id.startsWith("m5.")).length).toBe(4);
    expect(g.steps.map((s) => s.id)).toContain("plan.goalsShare");
    expect(g.notes).toEqual(SAMPLE_PLAN.goals!.goals[0]!.explain.notes);
    expect(bucketExplanation(SAMPLE_PLAN, wedding).notes).toEqual(SAMPLE_PLAN.goals!.goals[1]!.explain.notes);
  });

  it("a goal bucket's drawer includes only the plan.goalAllocation step whose goalId is its refId (P7)", () => {
    const [bike, wedding] = goalBuckets(SAMPLE_PLAN) as [Bucket, Bucket];
    // The engine's own steps first.
    const own = bucketExplanation(SAMPLE_PLAN, bike).steps.filter((s) => s.id === "plan.goalAllocation");
    expect(own.map((s) => s.inputs.goalId)).toEqual([bike.refId]);
    expect(own[0]!.rounded).toBe(bike.amount);
    const alloc = (goalId: string, rounded: number): ExplainStep => ({ id: "plan.goalAllocation", inputs: { goalId, need: 11200, goalsNeed: 24900, remaining: 3300 }, raw: rounded, rounded, unit: "bdt" });
    const withAllocation: Plan = {
      ...SAMPLE_PLAN,
      explain: { ...SAMPLE_PLAN.explain, steps: [...SAMPLE_PLAN.explain.steps.filter((s) => s.id !== "plan.goalAllocation"), alloc(bike.refId!, 1500), alloc(wedding.refId!, 1800)] },
    };
    const bikeSteps = bucketExplanation(withAllocation, bike).steps.filter((s) => s.id === "plan.goalAllocation");
    expect(bikeSteps).toHaveLength(1);
    expect(bikeSteps[0]!.inputs.goalId).toBe(bike.refId);
    expect(bikeSteps[0]!.rounded).toBe(1500);
    const weddingSteps = bucketExplanation(withAllocation, wedding).steps.filter((s) => s.id === "plan.goalAllocation");
    expect(weddingSteps).toHaveLength(1);
    expect(weddingSteps[0]!.rounded).toBe(1800);
    // Non-goal buckets never pick up an allocation step.
    expect(bucketExplanation(withAllocation, withAllocation.buckets[0]!).steps.some((s) => s.id === "plan.goalAllocation")).toBe(false);
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
