import { describe, expect, it } from "vitest";
import seed from "../data/rates.seed.json";
import { SAMPLE_PROFILES, SAMPLE_PROFILE_IDS } from "../fixtures/profiles";
import { assertSnapshot } from "../rates";
import type { Profile } from "../types";
import { computePlan, profileToPlanInput } from "./plan";
import { PLAN_NEXT_KEYS, PLAN_REASON_KEYS, PLAN_STEP_IDS } from "./types";

/** Unmocked end-to-end run of every engine module through computePlan with the real seed. */
const rates = assertSnapshot(seed);
const today = "2026-10-30";

const ONBOARDING: Profile = { age: 28, incomeType: "salaried", takeHome: 50000, essentials: 30000, dependents: [], hasDebt: false };

describe("computePlan with the real engine and seed", () => {
  it.each(SAMPLE_PROFILE_IDS)("%s produces a complete plan that adds up to the budget", (id) => {
    const plan = computePlan(SAMPLE_PROFILES[id], rates, today);
    expect(plan.monthlyTotal).toBeGreaterThan(0);
    expect(plan.monthlyTotal).toBe(plan.budget.savingsAmount);
    expect(plan.buckets.length).toBeGreaterThanOrEqual(1);
    expect(plan.buckets.filter((b) => b.status === "red" && !b.demotedFromRed).length).toBeLessThanOrEqual(1);
    for (const b of plan.buckets) {
      expect(PLAN_REASON_KEYS).toContain(b.reasonKey);
      expect(PLAN_NEXT_KEYS).toContain(b.nextStepKey);
      // No zero-amount buckets while the emergency fund is still being built.
      expect(b.amount).toBeGreaterThan(0);
      expect(b.amount % 100).toBe(0);
    }
    expect(plan.buckets.reduce((s, b) => s + b.amount, 0)).toBe(plan.monthlyTotal);
    const em = plan.buckets[0];
    expect(em?.id).toBe("emergency");
    expect(em?.amount).toBeLessThanOrEqual(plan.emergency.gap);
    expect(em?.amount).toBeLessThanOrEqual(0.8 * plan.monthlyTotal);
    expect(em?.amount).toBeGreaterThanOrEqual(0.6 * plan.monthlyTotal);
    expect(em?.reasonParams.instrument).toBe(em?.instrument);
    for (const s of plan.explain.steps.filter((x) => x.id.startsWith("plan."))) expect(PLAN_STEP_IDS).toContain(s.id);
    expect(plan.explain.steps.length).toBeGreaterThan(4);
    for (const a of plan.explain.assumptions) expect(a.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(plan.explain.assumptions.map((a) => a.key)).toEqual(expect.arrayContaining(["plan_emergency_min_share", "plan_emergency_max_share"]));
  });

  it("firstJob: 9 000 a month → 7 200 (80% cap) to the fund in a savings account, 1 800 to the motorbike", () => {
    const plan = computePlan(SAMPLE_PROFILES.firstJob, rates, today);
    expect(plan.budget.savingsAmount).toBe(9000);
    expect(plan.emergency).toMatchObject({ months: 8, target: 224000, saved: 20000, gap: 204000, monthlySaving: 17000, monthsCovered: 0.7, status: "red" });
    expect(plan.emergency.tiers.savingsAccount).toBe(28000);
    expect(plan.buckets.map((b) => [b.id, b.amount, b.instrument, b.status, b.nextStepKey])).toEqual([
      ["emergency", 7200, "savings_account", "red", "plan.next.openSavings"],
      ["goal", 1800, "dps", "green", "plan.next.dps"],
    ]);
    expect(plan.buckets[0]?.reasonParams).toEqual({ amount: 7200, covered: 0.7, months: 8, instrument: "savings_account" });
    expect(plan.buckets[1]?.reasonParams).toMatchObject({ name: "Motorbike", amount: 1800, need: 11200, instrument: "dps", fv: 291500, years: 2 });
    expect(plan.summary).toEqual({ emergencyShare: 0.8, monthsToEmergencyFull: 29, goalsShortfall: 9400 });
    expect(plan.monthlyTotal).toBe(9000);
    // The 2-year DPS goal beats the 8% projection it is priced with (8.1% after tax), though not today's CPI.
    const bike = plan.goals?.goals[0];
    expect(bike?.belowInflation).toBe(false);
    expect(bike?.real).toBeGreaterThan(0);
    expect(bike?.realVsCpi).toBeLessThan(0);
    expect(plan.explain.steps.filter((s) => s.id.startsWith("plan.")).map((s) => s.id)).toEqual(["plan.total", "plan.emergencyShare", "plan.goalsShare", "plan.goalAllocation"]);
    expect(plan.explain.steps.find((s) => s.id === "plan.goalAllocation")).toMatchObject({ inputs: { goalId: "g-bike", need: 11200, goalsNeed: 11200, remaining: 1800 }, raw: 1800, rounded: 1800 });
  });

  it("freelancer: 18 000 a month → 14 400 to the FDR ladder, 3 600 to the flat", () => {
    const plan = computePlan(SAMPLE_PROFILES.freelancer, rates, today);
    expect(plan.budget.savingsAmount).toBe(18000);
    expect(plan.emergency).toMatchObject({ months: 13, target: 650000, gap: 500000, monthlySaving: 41700, status: "amber" });
    expect(plan.buckets.map((b) => [b.id, b.amount, b.instrument, b.status, b.nextStepKey])).toEqual([
      ["emergency", 14400, "fdr_3m", "amber", "plan.next.fdrLadder"],
      ["goal", 3600, "sanchayapatra_5y", "amber", "plan.next.sanchayapatra"],
    ]);
    expect(plan.summary).toEqual({ emergencyShare: 0.8, monthsToEmergencyFull: 35, goalsShortfall: 37900 });
  });

  it("familyWithDebt: 24 000 a month → 19 200 to the fund, 4 800 to the carried card, nothing (and no bucket) for the goal", () => {
    const plan = computePlan(SAMPLE_PROFILES.familyWithDebt, rates, today);
    expect(plan.budget.savingsAmount).toBe(24000);
    expect(plan.emergency).toMatchObject({ months: 8, target: 600000, gap: 500000, monthlySaving: 41700, monthsCovered: 1.3, status: "amber" });
    expect(plan.debt?.highInterestDebts.map((d) => d.id)).toEqual(["c-1"]);
    expect(plan.buckets.map((b) => [b.id, b.refId, b.amount, b.status, b.demotedFromRed])).toEqual([
      ["emergency", undefined, 19200, "amber", false],
      ["debt", "c-1", 4800, "red", false],
    ]);
    // 60 000 at 4 800 a month → 13 months, not the 12-month target.
    expect(plan.buckets[1]?.reasonParams).toEqual({ amount: 4800, rate: 0.25, count: 1, months: 13 });
    expect(plan.buckets.some((b) => b.id === "goal" || b.id === "future")).toBe(false);
    expect(plan.summary).toEqual({ emergencyShare: 0.8, monthsToEmergencyFull: 27, goalsShortfall: 18300 });
    expect(plan.explain.steps.find((s) => s.id === "plan.goalsShare")).toMatchObject({ inputs: { remaining: 0, goalsNeed: 18300 }, rounded: 0 });
    expect(plan.monthlyTotal).toBe(24000);
  });

  it("onboarding answers only (50 000 / 30 000, no goals, no debt): 8 000 to the fund and 2 000 to a future DPS", () => {
    const plan = computePlan(profileToPlanInput(ONBOARDING), rates, today);
    expect(plan.budget.savingsAmount).toBe(10000);
    expect(plan.emergency).toMatchObject({ months: 8, target: 240000, gap: 240000, monthlySaving: 20000 });
    expect(plan.buckets.map((b) => [b.id, b.amount, b.instrument, b.nextStepKey])).toEqual([
      ["emergency", 8000, "savings_account", "plan.next.openSavings"],
      ["future", 2000, "dps", "plan.next.addGoal"],
    ]);
    expect(plan.summary).toEqual({ emergencyShare: 0.8, monthsToEmergencyFull: 30, goalsShortfall: 0 });
    expect(plan.monthlyTotal).toBe(10000);
    expect(plan.explain.steps.find((s) => s.id === "plan.emergencyShare")).toMatchObject({
      inputs: { total: 10000, minShare: 0.6, maxShare: 0.8, m1Monthly: 20000, gap: 240000 },
      raw: 8000,
      rounded: 8000,
    });
  });

  it("a full emergency fund keeps a first bucket of 0 with keepFull and sends the whole budget to the future bucket", () => {
    const plan = computePlan(profileToPlanInput(ONBOARDING, { m1: { liquidSavings: 300000 } }), rates, today);
    expect(plan.emergency).toMatchObject({ gap: 0, monthlySaving: 0, status: "green" });
    expect(plan.buckets.map((b) => [b.id, b.amount, b.instrument, b.status, b.reasonKey, b.nextStepKey])).toEqual([
      ["emergency", 0, "fdr_3m", "green", "plan.reason.emergencyFull", "plan.next.keepFull"],
      ["future", 10000, "dps", "green", "plan.reason.addGoal", "plan.next.addGoal"],
    ]);
    expect(plan.buckets[0]?.reasonParams).toEqual({ months: 8 });
    expect(plan.summary).toEqual({ emergencyShare: 0, monthsToEmergencyFull: null, goalsShortfall: 0 });
    expect(plan.monthlyTotal).toBe(10000);
  });

  it("the emergency amount is capped at the remaining gap", () => {
    // 1 500 left to save: the 60% floor (6 000) must not overshoot the gap.
    const plan = computePlan(profileToPlanInput(ONBOARDING, { m1: { liquidSavings: 238500 } }), rates, today);
    expect(plan.emergency.gap).toBe(1500);
    expect(plan.buckets.map((b) => [b.id, b.amount])).toEqual([
      ["emergency", 1500],
      ["future", 8500],
    ]);
    expect(plan.summary.monthsToEmergencyFull).toBe(1);
    expect(plan.monthlyTotal).toBe(10000);
  });
});
