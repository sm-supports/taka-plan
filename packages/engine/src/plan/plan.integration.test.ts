import { describe, expect, it } from "vitest";
import seed from "../data/rates.seed.json";
import { SAMPLE_PROFILES, SAMPLE_PROFILE_IDS } from "../fixtures/profiles";
import { assertSnapshot } from "../rates";
import { computePlan, profileToPlanInput } from "./plan";
import { PLAN_NEXT_KEYS, PLAN_REASON_KEYS } from "./types";

/** Unmocked end-to-end run of every engine module through computePlan with the real seed. */
const rates = assertSnapshot(seed);
const today = "2026-10-30";

describe("computePlan with the real engine and seed", () => {
  it.each(SAMPLE_PROFILE_IDS)("%s produces a complete plan", (id) => {
    const plan = computePlan(SAMPLE_PROFILES[id], rates, today);
    expect(plan.monthlyTotal).toBeGreaterThan(0);
    expect(plan.buckets.length).toBeGreaterThanOrEqual(1);
    expect(plan.buckets.filter((b) => b.status === "red" && !b.demotedFromRed).length).toBeLessThanOrEqual(1);
    for (const b of plan.buckets) {
      expect(PLAN_REASON_KEYS).toContain(b.reasonKey);
      expect(PLAN_NEXT_KEYS).toContain(b.nextStepKey);
      expect(b.amount).toBeGreaterThanOrEqual(0);
    }
    expect(plan.buckets.reduce((s, b) => s + b.amount, 0)).toBe(plan.monthlyTotal);
    expect(plan.explain.steps.length).toBeGreaterThan(4);
    for (const a of plan.explain.assumptions) expect(a.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("familyWithDebt gets a debt bucket for the carried card and the emergency bucket first", () => {
    const plan = computePlan(SAMPLE_PROFILES.familyWithDebt, rates, today);
    expect(plan.buckets[0]?.id).toBe("emergency");
    expect(plan.debt?.highInterestDebts.map((d) => d.id)).toContain("c-1");
    expect(plan.buckets.some((b) => b.id === "debt")).toBe(true);
  });

  it("profileToPlanInput feeds the onboarding answers through without overrides", () => {
    const input = profileToPlanInput({ age: 28, incomeType: "salaried", takeHome: 50000, essentials: 30000, dependents: [], hasDebt: false });
    const plan = computePlan(input, rates, today);
    expect(plan.budget.savingsAmount).toBe(10000);
    expect(plan.emergency.months).toBe(8);
    expect(plan.buckets[0]).toMatchObject({ id: "emergency", amount: 10000 });
    expect(plan.summary.monthsToEmergencyFull).toBe(24);
  });
});
