import {
  PLAN_NEXT_KEYS,
  PLAN_REASON_KEYS,
  PLAN_STEP_IDS,
  RATES_SEED,
  SAMPLE_PROFILES,
  assertSnapshot,
  computePlan,
  profileToPlanInput,
  roundMoney,
  type Bucket,
  type ExplainStep,
  type Plan,
} from "@taka/engine";
import { describe, expect, it } from "vitest";
import { en } from "@/lib/i18n/dictionaries/en";
import { bn } from "@/lib/i18n/dictionaries/bn";
import { getPath, translate } from "@/lib/i18n/translate";
import { createFormatters } from "@/lib/i18n/useFormat";
import { bucketExplanation, headlineExplanation } from "./explanationFor";
import { DEMO_BUILD_MONTHS, DEMO_TODAY, samplePlan, samplePlanInput } from "./fixtures";
import { bucketKey, bucketMatchesWhy, bucketNextStep, bucketReason, bucketTitle, formatReasonParams } from "./formatReason";
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

  it("formats emergency params as taka / plain numbers and puts the instrument inside the sentence", () => {
    expect(formatReasonParams(emergency, fEn, tEn)).toEqual({ amount: "৳5,700", covered: "0.7", months: "8", instrument: "3-month fixed deposits" });
    expect(bucketReason(emergency, fEn, tEn)).toBe("Emergency fund — ৳5,700/month into 3-month fixed deposits — you have 0.7 of 8 months covered");
    // Lower case with an article, never "into Savings account".
    expect(bucketReason({ ...emergency, reasonParams: { ...emergency.reasonParams, instrument: "savings_account" } }, fEn, tEn)).toContain("into a savings account");
    expect(bucketReason({ ...emergency, reasonParams: { ...emergency.reasonParams, instrument: "savings_account" } }, fBn, tBn)).toContain("সেভিংস অ্যাকাউন্ট-এ মাসে ৳৫,৭০০");
    // With the country's product names (Bangladesh: "FDR (3-month fixed deposit)" → "FDR").
    const names = { label: (s: string) => s, prose: (s: string) => (s === "fdr_3m" ? "FDR" : s) };
    expect(bucketReason(emergency, fEn, tEn, names)).toContain("into 3-month FDRs");
  });

  it("uses the shortfall wording when the plan cannot fit the retirement need", () => {
    const short: Pick<Bucket, "reasonKey" | "reasonParams"> = { reasonKey: "plan.reason.retirement", reasonParams: { amount: 2000, need: 9000, planTo: 100, lastsTo: 71 } };
    expect(bucketReason(short, fEn, tEn)).toBe("Retirement — ৳2,000/month of the ৳9,000 you need — lasts to age 71");
    const bnShort = bucketReason(short, fBn, tBn);
    expect(bnShort).not.toMatch(/[0-9]/);
    expect(bnShort.split("—")).toHaveLength(2);
    expect(bnShort.endsWith("।")).toBe(true);
    const funded = { ...short, reasonParams: { amount: 9000, need: 9000, planTo: 100, lastsTo: 100 } };
    expect(bucketReason(funded, fEn, tEn)).toBe("Retirement — ৳9,000/month so your money lasts to age 100");
  });

  it("says when a debt never clears, and when a kept bucket has nothing this month", () => {
    const never: Pick<Bucket, "reasonKey" | "reasonParams"> = { reasonKey: "plan.reason.debt", reasonParams: { amount: 2000, rate: 0.3, count: 1, neverAtPace: 1 } };
    expect(bucketReason(never, fEn, tEn)).toContain("at this pace it never clears");
    expect(bucketReason(never, fEn, tEn)).not.toContain("{months}");
    expect(bucketReason({ ...never, reasonParams: { ...never.reasonParams, amount: 0 } }, fEn, tEn)).toContain("nothing fits this month yet");
    expect(bucketReason({ reasonKey: "plan.reason.insurance", reasonParams: { amount: 0 } }, fEn, tEn)).toContain("nothing fits this month yet");
    expect(bucketReason({ reasonKey: "plan.reason.retirement", reasonParams: { amount: 0, need: 9000, planTo: 100 } }, fEn, tEn)).toBe("Retirement — nothing fits this month yet of the ৳9,000 a month you need");
    expect(bucketReason({ reasonKey: "plan.reason.retirement", reasonParams: { amount: 3000, need: 9000, planTo: 100 } }, fEn, tEn)).toBe("Retirement — ৳3,000/month of the ৳9,000 you need");
    for (const r of [never, { reasonKey: "plan.reason.retirement", reasonParams: { amount: 0, need: 9000, planTo: 100 } }]) {
      const bnText = bucketReason(r, fBn, tBn);
      expect(bnText).not.toMatch(/[0-9{]/);
      expect(bnText.endsWith("।")).toBe(true);
    }
  });

  it("names the country's product in the next step", () => {
    expect(bucketNextStep({ nextStepKey: "plan.next.dps" }, tEn)).toContain("open a recurring deposit");
    const names = { label: (s: string) => s, prose: (s: string) => (s === "dps" ? "DPS" : s) };
    expect(bucketNextStep({ nextStepKey: "plan.next.dps" }, tEn, names)).toContain("open a DPS");
    expect(bucketNextStep({ nextStepKey: "plan.next.sanchayapatra" }, tBn)).toContain("৫ বছর মেয়াদি সঞ্চয়পত্র চান");
    for (const key of ["plan.next.fdrLadder", "plan.next.fdr", "plan.next.sanchayapatra", "plan.next.tbond", "plan.next.openSavings", "plan.next.dps"]) {
      expect(bucketNextStep({ nextStepKey: key }, tEn)).not.toMatch(/\{product\}|NID|TIN|scheduled|Sanchayapatra/);
    }
  });

  it("translates the goal instrument and adds the years unit", () => {
    expect(bucketReason(bike, fEn, tEn)).toBe("Motorbike — ৳1,500/month into a recurring deposit — you will need ৳2,91,500 in 2 years");
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

  it("formats retirement (age, not money), future and insurance reasons in both languages", () => {
    const retirement: Pick<Bucket, "reasonKey" | "reasonParams"> = { reasonKey: "plan.reason.retirement", reasonParams: { amount: 6000, planTo: 100 } };
    expect(formatReasonParams(retirement, fEn, tEn)).toEqual({ amount: "৳6,000", planTo: "100" });
    expect(bucketReason(retirement, fEn, tEn)).toBe("Retirement — ৳6,000/month so your money lasts to age 100");
    expect(bucketReason(retirement, fBn, tBn)).not.toMatch(/[0-9]/);
    const future: Pick<Bucket, "reasonKey" | "reasonParams"> = { reasonKey: "plan.reason.future", reasonParams: { amount: 10000, instrument: "equity_fund" } };
    expect(bucketReason(future, fEn, tEn)).toBe("Long-term savings — ৳10,000/month into an open-end equity fund until you add a goal");
    const insurance: Pick<Bucket, "reasonKey" | "reasonParams"> = { reasonKey: "plan.reason.insurance", reasonParams: { amount: 4800 } };
    expect(bucketReason(insurance, fEn, tEn)).toBe("Insurance — ৳4,800/month set aside for term life and health cover");
    expect(bucketTitle({ id: "retirement", reasonParams: {} }, tEn)).toBe("Retirement");
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

describe("explanations for the M2 / M6 / M7 buckets", () => {
  const seed = assertSnapshot(RATES_SEED);
  const family = computePlan(SAMPLE_PROFILES.familyWithDebt, seed, DEMO_TODAY);
  const spare = computePlan(profileToPlanInput(SAMPLE_PROFILES.firstJob.profile, { m1: { liquidSavings: 300000 }, m6: { horizonYears: 20 } }), seed, DEMO_TODAY);

  it("insurance = M2's steps + plan.total; retirement = M7's steps + the split steps that leave its amount", () => {
    const insurance = family.buckets.find((b) => b.id === "insurance")!;
    const ids = bucketExplanation(family, insurance).steps.map((s) => s.id);
    expect(ids).toEqual([...family.insurance!.explain.steps.map((s) => s.id), "plan.total"]);
    const retirementBucket: Bucket = { ...insurance, id: "retirement", module: "m7", reasonKey: "plan.reason.retirement", nextStepKey: "plan.next.retirement" };
    const splitIds = family.explain.steps.map((s) => s.id).filter((id) => ["plan.total", "plan.emergencyShare", "plan.debtShare", "plan.goalsShare", "plan.retirementShare"].includes(id));
    expect(bucketExplanation(family, retirementBucket).steps.map((s) => s.id)).toEqual([...family.retirement!.explain.steps.map((s) => s.id), ...splitIds]);
  });

  it("a future bucket that follows the mix leads with M6's steps", () => {
    const future = spare.buckets.find((b) => b.id === "future")!;
    expect(future).toMatchObject({ module: "m6", nextStepKey: "plan.next.allocation" });
    const ids = bucketExplanation(spare, future).steps.map((s) => s.id);
    expect(ids.slice(0, spare.allocation!.explain.steps.length)).toEqual(spare.allocation!.explain.steps.map((s) => s.id));
    expect(ids).toContain("m4.amount");
    // The demo plan carries firstJob's allocation but no future bucket.
    expect(SAMPLE_PLAN.allocation?.profile).toBe("growth");
    expect(SAMPLE_PLAN.buckets.some((b) => b.id === "future")).toBe(false);
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

  it("links every module to its calculator route", () => {
    expect(calculatorPath("m1", "bn")).toBe("/bn/m1");
    expect(calculatorPath("m5", "en")).toBe("/en/m5");
    expect(calculatorPath("m2", "en")).toBe("/en/m2");
    expect(calculatorPath("m6", "hi")).toBe("/hi/m6");
    expect(calculatorPath("m7", "bn")).toBe("/bn/m7");
  });
});
