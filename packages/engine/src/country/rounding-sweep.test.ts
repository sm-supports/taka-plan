/** The M1, M3, M4, M5 and plan modules round in the snapshot country's steps and skip unavailable product slots. */
import { describe, expect, it } from "vitest";
import seed from "../data/rates.seed.json";
import { FIXTURE_BD, FIXTURE_IN, FIXTURE_US } from "../fixtures/countries";
import { SAMPLE_PROFILES } from "../fixtures/profiles";
import { computeEmergencyFund } from "../m1/emergency-fund";
import type { M1Input } from "../m1/types";
import { computeDebtHealth } from "../m3/debt-health";
import { simulatePayoff } from "../m3/payoff";
import { computeSaveFirst } from "../m4/save-first";
import { availableCandidates, computeGoal, computeGoals } from "../m5/goal-planner";
import type { Goal } from "../m5/types";
import { computePlan } from "../plan/plan";
import { assertSnapshot } from "../rates";
import type { Instrument } from "../types";
import { withCountry } from "./overlay";
import type { CountryProfile } from "./types";

const TODAY = "2026-10-30";
const base = assertSnapshot(seed);
const opts = { bdUsdRate: 122 };
const bd = withCountry(base, FIXTURE_BD, opts);
const us = withCountry(base, FIXTURE_US, opts);
const inr = withCountry(base, FIXTURE_IN, opts);

const m1: M1Input = { essentials: 2_345, incomeType: "salaried", dependents: [], soleEarner: false, hasHealthInsurance: true, liquidSavings: 0 };
const goal = (over: Partial<Goal> = {}): Goal => ({ id: "g1", name: "Car", cost: 12_345, years: 2, type: "general", ...over });

const isMultiple = (x: number, step: number) => Math.abs(x / step - Math.round(x / step)) < 1e-9;

function without(profile: CountryProfile, slots: Instrument[]): CountryProfile {
  const instruments = { ...profile.instruments };
  for (const s of slots) instruments[s] = { available: false, localName: null };
  return { ...profile, instruments };
}

describe("rounding steps per currency", () => {
  it("the overlay gives dollar and rupee steps", () => {
    expect(us.country?.rounding).toEqual({ lump: 5, monthly: 1, interest: 1, exact: 1 });
    expect(inr.country?.rounding).toEqual({ lump: 200, monthly: 50, interest: 50, exact: 1 });
  });

  it("M1 rounds the monthly saving up to the dollar, not to ৳100", () => {
    const r = computeEmergencyFund(m1, us, TODAY);
    // gap = 2345 × 6 = 14070 over 12 months = 1172.5 → $1,173 (taka steps would give 1,200).
    expect(r.target).toBe(14_070);
    expect(r.monthlySaving).toBe(1_173);
    expect(computeEmergencyFund(m1, base, TODAY).monthlySaving).toBe(1_200);
    expect(isMultiple(r.tiers.fdrPerSlice, 5)).toBe(true);
  });

  it("M1 rounds to ₹50 monthly and ₹200 lumps", () => {
    // 2240 × 6 / 12 = 1120 → ₹1,150 (taka steps would give 1,200).
    const r = computeEmergencyFund({ ...m1, essentials: 2_240 }, inr, TODAY);
    expect(r.monthlySaving).toBe(1_150);
    expect(isMultiple(r.tiers.fdrPerSlice, 200)).toBe(true);
  });

  it("M3 and the payoff simulation use the currency steps", () => {
    const r = computeDebtHealth({ takeHome: 4_321, essentials: 2_000, savingsTarget: 500, loans: [], cards: [] }, us, TODAY);
    expect(isMultiple(r.maxAffordableLoan, 5)).toBe(true);
    expect(r.maxAffordableLoan % 500).not.toBe(0);
    const payoff = simulatePayoff([{ id: "c", kind: "card", balance: 1_000, annualRate: 0.24, minPayment: 37 }], 0, "avalanche", 600, { lump: 5, monthly: 1, interest: 1, exact: 1 });
    expect(payoff.totalInterest % 100).not.toBe(0);
  });

  it("M4 rounds the savings amount to the dollar", () => {
    const r = computeSaveFirst({ takeHome: 3_333, essentials: 1_500, incomeType: "salaried" }, us, TODAY);
    expect(Number.isInteger(r.savingsAmount)).toBe(true);
    expect(r.savingsAmount % 100).not.toBe(0);
  });

  it("M5 rounds the future value and the monthly amount in dollars", () => {
    const r = computeGoal(goal(), us, TODAY);
    expect(isMultiple(r.futureValue, 5)).toBe(true);
    expect(r.futureValue % 500).not.toBe(0);
    expect(r.monthly.base % 100).not.toBe(0);
  });
});

describe("unavailable product slots", () => {
  it("M5 drops a slot the country lacks (no recurring deposit in the US fixture)", () => {
    const r = computeGoal(goal(), us, TODAY);
    expect(r.candidates).not.toContain("dps");
    expect(r.candidates).toEqual(["fdr_1y", "tbill_91d"]);
    expect(computeGoal(goal(), base, TODAY).candidates).toEqual(["fdr_1y", "dps", "tbill_91d"]);
  });

  it("M5 falls back to the 1-year term deposit, then the savings account", () => {
    const noMedium = withCountry(base, without(FIXTURE_US, ["sanchayapatra_5y", "tbond_5y"]), opts);
    expect(computeGoal(goal({ years: 4 }), noMedium, TODAY).candidates).toEqual(["fdr_1y"]);
    const noDeposits = withCountry(base, without(FIXTURE_US, ["sanchayapatra_5y", "tbond_5y", "fdr_1y"]), opts);
    const r = computeGoal(goal({ years: 4 }), noDeposits, TODAY);
    expect(r.candidates).toEqual(["savings_account"]);
    expect(r.instrument).toBe("savings_account");
    expect(availableCandidates([], noDeposits)).toEqual([]);
  });

  it("M1 adds the certificate layer only in Bangladesh", () => {
    const big: M1Input = { ...m1, essentials: 400_000 };
    expect(computeEmergencyFund(big, base, TODAY).tiers.sanchayapatraLayer).toBe(true);
    expect(computeEmergencyFund(big, bd, TODAY).tiers.sanchayapatraLayer).toBe(true);
    expect(computeEmergencyFund(big, inr, TODAY).tiers.sanchayapatraLayer).toBe(false);
    const r = computeEmergencyFund(big, us, TODAY);
    expect(r.tiers.sanchayapatraLayer).toBe(false);
    expect(r.rules).not.toContain("m1.rule.sanchayapatraThirdLayer");
  });
});

describe("Bangladesh is unchanged", () => {
  it("the BD overlay gives the same plans and goals as the plain snapshot", () => {
    for (const input of Object.values(SAMPLE_PROFILES)) {
      const a = computePlan(input, base, TODAY);
      const b = computePlan(input, bd, TODAY);
      expect(b.buckets).toEqual(a.buckets);
      expect(b.summary).toEqual(a.summary);
    }
    const goals = { goals: [goal(), goal({ id: "g2", years: 4, cost: 500_000 }), goal({ id: "g3", years: 10, cost: 2_000_000 })], age: 30 };
    expect(computeGoals(goals, bd, TODAY).goals.map((g) => g.monthly)).toEqual(computeGoals(goals, base, TODAY).goals.map((g) => g.monthly));
  });
});
