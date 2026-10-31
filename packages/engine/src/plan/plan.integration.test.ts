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
      // While the fund is being built, only an unfunded insurance, debt or retirement need shows at zero.
      if (b.amount === 0) {
        expect(["insurance", "debt", "retirement"]).toContain(b.id);
        expect(b.status).not.toBe("green");
      }
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
    // The motorbike gets 1 800 of its 11 200: amber (was green, which ignored the shortfall).
    expect(plan.buckets.map((b) => [b.id, b.amount, b.instrument, b.status, b.nextStepKey])).toEqual([
      ["emergency", 7200, "savings_account", "red", "plan.next.openSavings"],
      ["goal", 1800, "dps", "amber", "plan.next.dps"],
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

  it("firstJob also answered the asset mix: growth (60/10/30) for the plan, buckets unchanged (the only goal is 2 years away)", () => {
    const plan = computePlan(SAMPLE_PROFILES.firstJob, rates, today);
    // Score 2 + 2 + 2 + 1 = 7 → growth; equity 0.60 at 25 (no age cut before 30), gold 0.10.
    expect(plan.allocation).toMatchObject({ score: 7, profile: "growth", weights: { equity: 0.6, gold: 0.1, fixedIncome: 0.3 }, horizonRule: "none" });
    // The plan's own M1 says the fund is not full yet, whatever the fixture's gate said.
    expect(plan.allocation?.gateWarnings).toEqual(["m6.gate.noEmergencyFund"]);
    // A short goal never uses the mix.
    expect(plan.goals?.usesAllocation).toBe(false);
    expect(plan.goals?.goals[0]?.instrument).toBe("dps");
  });

  it("familyWithDebt: 24 000 a month → 19 200 to the fund, then 2 400 to insurance and 2 400 to the card, nothing for the goal or retirement", () => {
    const plan = computePlan(SAMPLE_PROFILES.familyWithDebt, rates, today);
    expect(plan.budget.savingsAmount).toBe(24000);
    expect(plan.emergency).toMatchObject({ months: 8, target: 600000, gap: 500000, monthlySaving: 41700, monthsCovered: 1.3, status: "amber" });
    expect(plan.debt?.highInterestDebts.map((d) => d.id)).toEqual(["c-1"]);
    // M2: 24 years of 120 000 × 12 × 0.7 at the real safe return (annuity due) + debts + education − savings
    // − 20 lakh group cover leaves a 2.49 crore life gap (was 2.80 crore) and a 13.09 lakh family health gap
    // → 15 500 a month of premiums (was 16 700).
    expect(plan.insurance).toMatchObject({ monthlyPremiumNeed: 15500, status: "red", life: { gap: 24912000, status: "red" }, health: { people: 5, gap: 1309000 } });
    // Insurance comes before debt but, with a 25% card open, may take only half of the 4 800 left
    // (plan_insurance_max_share_with_debt 0.5): with the card's minimum plus 2 400 a month it clears
    // in 13 months with interest (was 25 = 60 000 / 2 400).
    // Retirement gets nothing: it stays on the plan as a zero bucket (red, shown amber by the one-red rule).
    expect(plan.buckets.map((b) => [b.id, b.refId, b.amount, b.status, b.demotedFromRed])).toEqual([
      ["emergency", undefined, 19200, "amber", false],
      ["insurance", undefined, 2400, "red", false],
      ["debt", "c-1", 2400, "amber", true],
      ["retirement", undefined, 0, "amber", true],
    ]);
    expect(plan.buckets[1]).toMatchObject({ instrument: "term_insurance", reasonKey: "plan.reason.insurance", reasonParams: { amount: 2400 }, nextStepKey: "plan.next.insurance", module: "m2" });
    expect(plan.buckets[2]?.reasonParams).toMatchObject({ amount: 2400, months: 13 });
    // M7 runs with savings above the emergency-fund target only (100 000 − 600 000 → 0, was 100 000):
    // 1 40 500 a month to fund spending to 100 (was 1 39 500, now rounded up to ৳500); at zero saving
    // the money runs out at 63.
    expect(plan.retirement).toMatchObject({ monthlyNeed: 140500, planToAge: 100, verdict: { kind: "runsOut", age: 63, status: "red" } });
    expect(plan.buckets[3]).toMatchObject({ instrument: "equity_fund", reasonParams: { amount: 0, need: 140500, planTo: 100, lastsTo: 63 } });
    expect(plan.buckets.some((b) => b.id === "goal" || b.id === "future")).toBe(false);
    expect(plan.summary).toEqual({ emergencyShare: 0.8, monthsToEmergencyFull: 27, goalsShortfall: 18300, retirementShortfall: 140500 });
    expect(plan.explain.steps.find((s) => s.id === "plan.goalsShare")).toMatchObject({ inputs: { remaining: 0, goalsNeed: 18300 }, rounded: 0 });
    expect(plan.monthlyTotal).toBe(24000);
  });

  it("familyWithDebt without M2: the card gets the 4 800 (9 months at that pace)", () => {
    const { m2: _m2, ...withoutInsurance } = SAMPLE_PROFILES.familyWithDebt;
    const plan = computePlan(withoutInsurance, rates, today);
    expect(plan.buckets.map((b) => [b.id, b.refId, b.amount, b.status])).toEqual([
      ["emergency", undefined, 19200, "amber"],
      ["debt", "c-1", 4800, "red"],
      ["retirement", undefined, 0, "amber"],
    ]);
    // 60 000 at 25%, the card minimum plus 4 800 a month → 9 months with interest (was 13 = 60 000 / 4 800).
    expect(plan.buckets[1]?.reasonParams).toEqual({ amount: 4800, rate: 0.25, count: 1, months: 9 });
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
    // The future bucket now carries plan.reason.future (was plan.reason.addGoal with no params).
    expect(plan.buckets.map((b) => [b.id, b.amount, b.instrument, b.status, b.reasonKey, b.nextStepKey])).toEqual([
      ["emergency", 0, "fdr_3m", "green", "plan.reason.emergencyFull", "plan.next.keepFull"],
      ["future", 10000, "dps", "green", "plan.reason.future", "plan.next.addGoal"],
    ]);
    expect(plan.buckets[0]?.reasonParams).toEqual({ months: 8 });
    expect(plan.buckets[1]?.reasonParams).toEqual({ amount: 10000, instrument: "dps" });
    expect(plan.summary).toEqual({ emergencyShare: 0, monthsToEmergencyFull: null, goalsShortfall: 0 });
    expect(plan.monthlyTotal).toBe(10000);
  });

  it("an asset-mix answer (20 years) prices a 15-year goal at the mix and sends spare money to the mix", () => {
    const home = { id: "g-home", name: "Home", cost: 2000000, years: 15, type: "home" } as const;
    const overrides = { m1: { liquidSavings: 300000 }, m5: { goals: [home], age: 28 } };
    const fixedOnly = computePlan(profileToPlanInput(ONBOARDING, overrides), rates, today);
    const input = profileToPlanInput(ONBOARDING, { ...overrides, m6: { horizonYears: 20 } });
    // Missing risk answers come from the profile (under 35, salaried, > 10 years) plus "wait": 7 → growth.
    expect(input.m6).toMatchObject({ age: 28, horizonYears: 20, lumpSum: 0, monthly: 0, risk: { ageBand: 2, incomeStability: 2, horizon: 2, reaction: 1 } });
    const plan = computePlan(input, rates, today);
    expect(plan.allocation?.weights).toEqual({ equity: 0.6, gold: 0.1, fixedIncome: 0.3 });
    // Full fund, no card: no gate warnings.
    expect(plan.allocation?.gateWarnings).toEqual([]);
    const fixed = fixedOnly.goals?.goals[0];
    const mixed = plan.goals?.goals[0];
    expect(fixed).toMatchObject({ instrument: "sanchayapatra_5y", monthly: { low: 17800, base: 14400, high: 14400 }, status: "amber" });
    // Priced like M6: 0.3 × 8.5% (fixed_income_return_base) + 0.6 × 9% (equity) + 0.1 × 8% (gold) = 8.75%
    // at the effective monthly rate (was 9.394% with Sanchayapatra's after-tax rate at r / 12).
    expect(mixed?.afterTax).toBeCloseTo(0.0875, 6);
    expect(mixed).toMatchObject({ instrument: "equity_fund", candidates: ["sanchayapatra_5y", "equity_fund", "gold"], monthly: { low: 27300, base: 17700, high: 12600 }, status: "green" });
    expect(mixed?.explain.notes).not.toContain("m5.note.noAllocationYet");
    expect(plan.goals?.usesAllocation).toBe(true);
    // 10 000 of the 17 700 the goal needs → amber.
    expect(plan.buckets.map((b) => [b.id, b.amount, b.instrument, b.status, b.nextStepKey])).toEqual([
      ["emergency", 0, "fdr_3m", "green", "plan.next.keepFull"],
      ["goal", 10000, "equity_fund", "amber", "plan.next.allocation"],
    ]);

    // No goal: the whole budget goes to the mix's largest bucket, with the asset mix as the next step.
    const spare = computePlan(profileToPlanInput(ONBOARDING, { m1: { liquidSavings: 300000 }, m6: { horizonYears: 20 } }), rates, today);
    expect(spare.buckets.map((b) => [b.id, b.amount, b.instrument, b.reasonKey, b.nextStepKey, b.module])).toEqual([
      ["emergency", 0, "fdr_3m", "plan.reason.emergencyFull", "plan.next.keepFull", "m1"],
      ["future", 10000, "equity_fund", "plan.reason.future", "plan.next.allocation", "m6"],
    ]);
    expect(spare.buckets[1]?.reasonParams).toEqual({ amount: 10000, instrument: "equity_fund" });
  });

  it("insurance and retirement answers add their buckets in order, and M2's health cover feeds M1", () => {
    const input = profileToPlanInput({ ...ONBOARDING, dependents: ["partner"] }, { m1: { liquidSavings: 300000 }, m2: { existingHealthCover: 300000 }, m7: { monthlySaving: 0 } });
    expect(input.m1.hasHealthInsurance).toBe(true);
    expect(input.m2).toMatchObject({ age: 28, dependents: ["partner"], takeHome: 50000, smoker: false, liquidSavings: 300000, debts: 0, educationGoals: 0, existingLifeCover: 0, existingHealthCover: 300000 });
    expect(input.m7).toEqual({ mode: "working", age: 28, monthlySpending: 30000, savings: 300000, monthlySaving: 0 });
    expect(input.m7SavingsDefault).toBe(true);
    const plan = computePlan(input, rates, today);
    // Life cover at the real safe return: 3 400 a month of premiums (was 4 000).
    expect(plan.insurance?.monthlyPremiumNeed).toBe(3400);
    // M7 counts only the 60 000 above the 2.4 lakh emergency fund (was all 3 lakh): 53 500 a month
    // (was 51 400; now rounded up to ৳500).
    expect(plan.retirement?.monthlyNeed).toBe(53500);
    // Insurance is red (life gap above half the cover); retirement gets 6 600 of 53 500: amber, and at
    // that saving the money lasts to 64.
    expect(plan.insurance?.status).toBe("red");
    expect(plan.retirement?.verdict.status).toBe("red");
    expect(plan.buckets.map((b) => [b.id, b.amount, b.instrument, b.status, b.demotedFromRed, b.nextStepKey, b.module])).toEqual([
      ["emergency", 0, "fdr_3m", "green", false, "plan.next.keepFull", "m1"],
      ["insurance", 3400, "term_insurance", "red", false, "plan.next.insurance", "m2"],
      ["retirement", 6600, "equity_fund", "amber", false, "plan.next.retirement", "m7"],
    ]);
    expect(plan.buckets[2]?.reasonParams).toEqual({ amount: 6600, need: 53500, planTo: 100, lastsTo: 64 });
    expect(plan.summary.retirementShortfall).toBe(46900);
    expect(plan.monthlyTotal).toBe(10000);
  });

  it("untouched M2 / M6 / M7 slices ({} in the store) leave the plan as before", () => {
    const plan = computePlan(profileToPlanInput(ONBOARDING, { m2: {}, m6: { risk: {} }, m7: {} }), rates, today);
    expect(plan.insurance).toBeUndefined();
    expect(plan.allocation).toBeUndefined();
    expect(plan.retirement).toBeUndefined();
    expect(plan.buckets.map((b) => [b.id, b.amount])).toEqual([
      ["emergency", 8000],
      ["future", 2000],
    ]);
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
