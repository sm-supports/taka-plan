import { describe, expect, it } from "vitest";
import seed from "../data/rates.seed.json";
import { SAMPLE_PROFILES } from "../fixtures/profiles";
import { assertSnapshot, type RatesSnapshot } from "../rates";
import { EngineError } from "../types";
import { computeDebtHealth } from "./debt-health";
import { emi, maxLoan } from "./emi";
import { M3_PATH_KEYS, M3_STEP_IDS, type M3Input } from "./types";

const rates = assertSnapshot(seed);
const TODAY = "2026-10-30";

/** Spec "flags vector": take-home 60 000, essentials 25 000, savings 12 000, EMIs 20 000 @12% + 6 000 @15%, card 60 000/100 000 carried. */
const flagsVector: M3Input = {
  takeHome: 60000,
  essentials: 25000,
  savingsTarget: 12000,
  loans: [
    { id: "l-1", type: "personal", outstanding: 800000, annualRate: 0.12, emi: 20000, monthsLeft: 55 },
    { id: "l-2", type: "car", outstanding: 200000, annualRate: 0.15, emi: 6000, monthsLeft: 45 },
  ],
  cards: [{ id: "c-1", balance: 60000, limit: 100000, paysInFull: false }],
};

const noDebt: M3Input = { takeHome: 60000, essentials: 25000, savingsTarget: 12000, loans: [], cards: [] };

describe("computeDebtHealth — flags vector", () => {
  const r = computeDebtHealth(flagsVector, rates, TODAY);

  it("totals EMIs plus the carried-card minimum and computes the ratio", () => {
    // 20 000 + 6 000 + 5% × 60 000 = 29 000 → 29 000 / 60 000
    expect(r.totalEmi).toBe(29000);
    expect(r.emiRatio).toBeCloseTo(29000 / 60000, 10);
    expect(r.emiCapacity).toBe(20000); // 60 000 − 12 000 − 25 000 − 3 000
    expect(r.headroom).toBe(0);
    expect(r.maxAffordableLoan).toBe(0);
    expect(r.scenario).toEqual({ annualRate: 0.12, months: 60, emi: 0 });
  });

  it("card_carried is the primary red; emi_ratio is demoted to amber; utilisation amber", () => {
    expect(r.status).toBe("red");
    expect(r.primaryFlag?.id).toBe("card_carried");
    expect(r.primaryFlag?.ref).toBe("c-1");
    expect(r.primaryFlag?.value).toBe(60000);
    const byId = Object.fromEntries(r.flags.map((f) => [f.id, f]));
    expect(byId.card_carried?.status).toBe("red");
    expect(byId.emi_ratio?.status).toBe("amber");
    expect(byId.emi_ratio?.demotedFromRed).toBe(true);
    expect(byId.emi_ratio?.value).toBeCloseTo(29000 / 60000, 10);
    expect(byId.card_utilisation?.status).toBe("amber");
    expect(byId.card_utilisation?.demotedFromRed).toBe(false);
    expect(byId.card_utilisation?.value).toBeCloseTo(0.6, 10);
    expect(r.flags.filter((f) => f.status === "red")).toHaveLength(1);
    expect(r.flags.map((f) => f.id).sort()).toEqual(["card_carried", "card_utilisation", "emi_ratio"]);
  });

  it("lists only debts strictly above the high-interest threshold (card at the 25% cap; 15% loan is not above 15%)", () => {
    expect(r.highInterestDebts).toEqual([{ id: "c-1", kind: "card", balance: 60000, annualRate: 0.25, minPayment: 3000 }]);
  });

  it("payoff plans cover every loan and carried card; avalanche never costs more interest", () => {
    expect(r.avalanche.order.sort()).toEqual(["c-1", "l-1", "l-2"]);
    expect(r.snowball.order.sort()).toEqual(["c-1", "l-1", "l-2"]);
    expect(r.avalanche.months).toBeLessThan(600);
    expect(r.snowball.months).toBeLessThan(600);
    expect(r.avalanche.totalInterest).toBeLessThanOrEqual(r.snowball.totalInterest);
    expect(r.interestSaved).toBeGreaterThanOrEqual(0);
    expect(r.interestSaved).toBe(Math.round(Math.max(0, r.snowball.totalInterest - r.avalanche.totalInterest) / 100) * 100);
  });

  it("explanation step ids equal M3_STEP_IDS and the policy rows are recorded", () => {
    expect(r.explain.steps.map((s) => s.id)).toEqual([...M3_STEP_IDS]);
    const keys = r.explain.assumptions.map((a) => a.key);
    for (const k of ["cash_buffer_share", "card_min_payment_share", "emi_ratio_red", "card_utilisation_amber", "high_interest_debt_threshold", "personal_loan_rate_default", "credit_card_rate_cap"]) {
      expect(keys).toContain(k);
    }
    expect(r.explain.assumptions.every((a) => a.isAppAssumption || a.key === "credit_card_rate_cap")).toBe(true);
  });

  it("step inputs match the explain-template names", () => {
    const by = Object.fromEntries(r.explain.steps.map((s) => [s.id, s]));
    expect(Object.keys(by["m3.totalEmi"]?.inputs ?? {}).sort()).toEqual(["cardMinimums", "emis"]);
    expect(by["m3.totalEmi"]?.inputs).toEqual({ emis: 26000, cardMinimums: 3000 });
    expect(Object.keys(by["m3.emiRatio"]?.inputs ?? {}).sort()).toEqual(["takeHome", "totalEmi"]);
    expect(by["m3.emiRatio"]?.rounded).toBe(0.483);
    expect(Object.keys(by["m3.capacity"]?.inputs ?? {}).sort()).toEqual(["buffer", "essentials", "savings", "takeHome"]);
    expect(by["m3.capacity"]?.inputs.buffer).toBe(3000);
    expect(Object.keys(by["m3.maxLoan"]?.inputs ?? {}).sort()).toEqual(["capacity", "monthlyRate", "months"]);
    expect(Object.keys(by["m3.scenarioEmi"]?.inputs ?? {}).sort()).toEqual(["monthlyRate", "months", "principal"]);
    expect(Object.keys(by["m3.interestSaved"]?.inputs ?? {}).sort()).toEqual(["avalancheInterest", "snowballInterest"]);
  });

  it("debt-trap path is M3_PATH_KEYS in PRD order", () => {
    expect(r.debtTrapPath).toEqual([
      "m3.path.listLoans",
      "m3.path.tellFamily",
      "m3.path.stopBorrowing",
      "m3.path.sellUnaffordable",
      "m3.path.refinanceCheaper",
    ]);
    expect(r.debtTrapPath).toEqual([...M3_PATH_KEYS]);
  });
});

describe("computeDebtHealth — no debt", () => {
  const r = computeDebtHealth(noDebt, rates, TODAY);

  it("is green with no flags, headroom = capacity and a positive affordable loan", () => {
    expect(r.status).toBe("green");
    expect(r.flags).toEqual([]);
    expect(r.primaryFlag).toBeNull();
    expect(r.totalEmi).toBe(0);
    expect(r.emiRatio).toBe(0);
    expect(r.emiCapacity).toBe(20000);
    expect(r.headroom).toBe(r.emiCapacity);
    expect(r.maxAffordableLoan).toBeGreaterThan(0);
    // maxLoan(20 000, 12%, 60) ≈ 899 100.8 → 899 000 (about 9.0 lakh)
    expect(r.maxAffordableLoan).toBe(899000);
    expect(r.scenario.emi).toBe(Math.round(emi(899000, 0.12, 60) / 100) * 100);
    expect(r.scenario.emi).toBe(20000);
    expect(r.highInterestDebts).toEqual([]);
    expect(r.avalanche).toEqual({ order: [], months: 0, totalInterest: 0 });
    expect(r.snowball).toEqual({ order: [], months: 0, totalInterest: 0 });
    expect(r.interestSaved).toBe(0);
    expect(r.explain.steps.map((s) => s.id)).toEqual([...M3_STEP_IDS]);
  });

  it("honours an explicit cash buffer and scenario", () => {
    const custom = computeDebtHealth({ ...noDebt, cashBuffer: 0, scenario: { annualRate: 0, months: 24 } }, rates, TODAY);
    expect(custom.emiCapacity).toBe(23000);
    expect(custom.maxAffordableLoan).toBe(Math.round(maxLoan(23000, 0, 24) / 500) * 500);
    expect(custom.scenario).toEqual({ annualRate: 0, months: 24, emi: Math.round(emi(custom.maxAffordableLoan, 0, 24) / 100) * 100 });
    const keys = custom.explain.assumptions.map((a) => a.key);
    expect(keys).not.toContain("cash_buffer_share");
    expect(keys).not.toContain("personal_loan_rate_default");
  });
});

describe("computeDebtHealth — edge cases", () => {
  it("negative capacity → red negative_capacity flag with the shortfall, capacity floored at 0", () => {
    const r = computeDebtHealth({ takeHome: 30000, essentials: 25000, savingsTarget: 6000, loans: [], cards: [] }, rates, TODAY);
    // 30 000 − 6 000 − 25 000 − 1 500 = −2 500
    expect(r.emiCapacity).toBe(0);
    expect(r.headroom).toBe(0);
    expect(r.maxAffordableLoan).toBe(0);
    expect(r.status).toBe("red");
    expect(r.primaryFlag).toEqual({ id: "negative_capacity", status: "red", value: 2500, demotedFromRed: false });
    expect(r.explain.steps.find((s) => s.id === "m3.capacity")?.raw).toBe(-2500);
  });

  it("emi_ratio is the primary red when no card is carried", () => {
    const r = computeDebtHealth(
      { takeHome: 50000, essentials: 10000, savingsTarget: 5000, loans: [{ id: "l", type: "home", outstanding: 1500000, annualRate: 0.12, emi: 25000, monthsLeft: 120 }], cards: [{ id: "c", balance: 80000, limit: 100000, paysInFull: true }] },
      rates,
      TODAY,
    );
    expect(r.primaryFlag?.id).toBe("emi_ratio");
    expect(r.flags.map((f) => [f.id, f.status, f.demotedFromRed])).toEqual([
      ["card_utilisation", "amber", false],
      ["emi_ratio", "red", false],
    ]);
    expect(r.totalEmi).toBe(25000); // a card paid in full adds no minimum
    expect(r.highInterestDebts).toEqual([]); // 12% home loan is below the threshold; card not carried
  });

  it("zero-rate loan: no interest in either plan, months = balance / EMI", () => {
    const r = computeDebtHealth(
      { takeHome: 80000, essentials: 30000, savingsTarget: 16000, extraMonthly: 0, loans: [{ id: "z", type: "education", outstanding: 120000, annualRate: 0, emi: 10000, monthsLeft: 12 }], cards: [] },
      rates,
      TODAY,
    );
    expect(r.avalanche).toEqual({ order: ["z"], months: 12, totalInterest: 0 });
    expect(r.snowball).toEqual({ order: ["z"], months: 12, totalInterest: 0 });
    expect(r.interestSaved).toBe(0);
    expect(r.status).toBe("green");
    expect(r.emiRatio).toBe(0.125);
  });

  it("card rate defaults to the cap and an explicit card rate is used as given", () => {
    const base: M3Input = { takeHome: 100000, essentials: 30000, savingsTarget: 20000, loans: [], cards: [{ id: "c", balance: 50000, limit: 200000, annualRate: 0.1, paysInFull: false }] };
    const r = computeDebtHealth(base, rates, TODAY);
    expect(r.highInterestDebts).toEqual([]);
    expect(r.explain.assumptions.map((a) => a.key)).not.toContain("credit_card_rate_cap");
    expect(r.primaryFlag?.id).toBe("card_carried");
    expect(r.flags).toHaveLength(1); // 25% utilisation is under the amber line
  });

  it("takeHome 0 → ratio 0, no division by zero", () => {
    const r = computeDebtHealth({ takeHome: 0, essentials: 0, savingsTarget: 0, loans: [{ id: "l", type: "other", outstanding: 10000, annualRate: 0.1, emi: 1000, monthsLeft: 11 }], cards: [] }, rates, TODAY);
    expect(r.emiRatio).toBe(0);
    expect(Number.isFinite(r.maxAffordableLoan)).toBe(true);
    expect(r.flags.map((f) => f.id)).toEqual([]);
  });

  it("the familyWithDebt sample profile runs and is red on the carried card", () => {
    const input = SAMPLE_PROFILES.familyWithDebt.m3;
    expect(input).toBeDefined();
    if (!input) return;
    const r = computeDebtHealth(input, rates, TODAY);
    expect(r.status).toBe("red");
    expect(r.primaryFlag?.id).toBe("card_carried");
    expect(r.explain.steps.map((s) => s.id)).toEqual([...M3_STEP_IDS]);
  });

  it("throws MISSING_RATE when a policy row is absent", () => {
    const { card_min_payment_share: _omit, ...rows } = rates.rows;
    const broken = { ...rates, rows } as unknown as RatesSnapshot;
    expect(() => computeDebtHealth(noDebt, broken, TODAY)).toThrow(EngineError);
    try {
      computeDebtHealth(noDebt, broken, TODAY);
    } catch (e) {
      expect((e as EngineError).code).toBe("MISSING_RATE");
    }
  });

  it("rejects malformed input with INVALID_INPUT", () => {
    const bad: M3Input[] = [
      { ...noDebt, takeHome: -1 },
      { ...noDebt, essentials: Number.NaN },
      { ...noDebt, loans: [{ id: "", type: "personal", outstanding: 1, annualRate: 0.1, emi: 1, monthsLeft: 1 }] },
      { ...noDebt, cards: [{ id: "c", balance: -5, limit: 100, paysInFull: false }] },
      { ...noDebt, scenario: { annualRate: 0.1, months: 0 } },
      { ...noDebt, extraMonthly: -100 },
    ];
    for (const input of bad) {
      expect(() => computeDebtHealth(input, rates, TODAY)).toThrow(EngineError);
      try {
        computeDebtHealth(input, rates, TODAY);
      } catch (e) {
        expect((e as EngineError).code).toBe("INVALID_INPUT");
      }
    }
  });

  it("is pure: the input is not mutated", () => {
    const input = structuredClone(flagsVector);
    computeDebtHealth(input, rates, TODAY);
    expect(input).toEqual(flagsVector);
  });
});
