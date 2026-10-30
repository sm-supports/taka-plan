import { beforeEach, describe, expect, it, vi } from "vitest";
import seed from "../data/rates.seed.json";
import type { Explanation } from "../explain";
import { computeEmergencyFund } from "../m1/emergency-fund";
import type { M1Result } from "../m1/types";
import { computeDebtHealth } from "../m3/debt-health";
import type { DebtSummary, M3Result } from "../m3/types";
import { computeSaveFirst } from "../m4/save-first";
import type { M4Result } from "../m4/types";
import { computeGoals } from "../m5/goal-planner";
import type { Goal, GoalResult, M5Result } from "../m5/types";
import { assertSnapshot } from "../rates";
import { EngineError, type Profile } from "../types";
import { computePlan, nextStepForInstrument, profileToPlanInput } from "./plan";
import { PLAN_NEXT_KEYS, PLAN_REASON_KEYS, PLAN_STEP_IDS, type Bucket, type PlanInput } from "./types";

// Sibling slices implement these at the same time; here they are replaced by hand-built results.
vi.mock("../m1/emergency-fund", () => ({ computeEmergencyFund: vi.fn(), suggestMonths: vi.fn() }));
vi.mock("../m3/debt-health", () => ({ computeDebtHealth: vi.fn() }));
vi.mock("../m4/save-first", () => ({ computeSaveFirst: vi.fn() }));
vi.mock("../m5/goal-planner", () => ({ computeGoals: vi.fn() }));

const rates = assertSnapshot(seed);
const TODAY = "2026-10-30";

const emptyExplain = (): Explanation => ({ steps: [], assumptions: [], notes: [] });

const PROFILE: Profile = { age: 28, incomeType: "salaried", takeHome: 50000, essentials: 30000, dependents: [], hasDebt: false };

function m4Result(overrides: Partial<M4Result> = {}): M4Result {
  return {
    averageIncome: 50000,
    suggestedRate: 0.2,
    feasibleRate: 0.4,
    savingsRate: 0.2,
    savingsAmount: 10000,
    expensesAllowed: 40000,
    essentialsShortfall: 0,
    mode: "fixed",
    instrument: "dps",
    transferDay: null,
    status: "green",
    explain: { steps: [{ id: "m4.amount", inputs: { average: 50000, rate: 0.2 }, raw: 10000, rounded: 10000, unit: "bdt" }], assumptions: [], notes: [] },
    ...overrides,
  };
}

/** 30 000 essentials, 8 months → 240 000 target; `saved` drives gap, monthly saving and months covered. */
function m1Result(saved: number, overrides: Partial<M1Result> = {}): M1Result {
  const target = 240000;
  const gap = Math.max(0, target - saved);
  // Mirrors M1: rounded UP to ৳100 so the fund is full inside the build period (240 000 / 12 → 20 000; 40 000 / 12 → 3 400).
  const monthlySaving = Math.ceil(gap / 12 / 100) * 100;
  return {
    suggestedMonths: 8,
    months: 8,
    target,
    saved,
    gap,
    monthlySaving,
    monthsCovered: Math.round((saved / 30000) * 10) / 10,
    monthsToFull: gap === 0 ? null : Math.ceil(gap / monthlySaving),
    tiers: { savingsAccount: 30000, fdrLadder: 210000, fdrPerSlice: 70000, banksNeeded: 2, sanchayapatraLayer: false },
    status: gap === 0 ? "green" : saved < 90000 ? "red" : "amber",
    rules: ["m1.rule.noStocks"],
    nextStep: gap === 0 ? "m1.next.full" : "m1.next.fdrLadder",
    explain: { steps: [{ id: "m1.target", inputs: { essentials: 30000, months: 8 }, raw: target, rounded: target, unit: "bdt" }], assumptions: [], notes: [] },
    ...overrides,
  };
}

function m3Result(highInterestDebts: DebtSummary[], overrides: Partial<M3Result> = {}): M3Result {
  return {
    totalEmi: 3000,
    emiRatio: 0.06,
    emiCapacity: 7500,
    headroom: 4500,
    maxAffordableLoan: 300000,
    scenario: { annualRate: 0.12, months: 60, emi: 6700 },
    flags: [],
    primaryFlag: null,
    status: "amber",
    highInterestDebts,
    avalanche: { order: highInterestDebts.map((d) => d.id), months: 12, totalInterest: 7000 },
    snowball: { order: highInterestDebts.map((d) => d.id), months: 12, totalInterest: 7000 },
    interestSaved: 0,
    debtTrapPath: [],
    explain: { steps: [{ id: "m3.totalEmi", inputs: { emis: 0, cardMinimums: 3000 }, raw: 3000, rounded: 3000, unit: "bdt" }], assumptions: [], notes: [] },
    ...overrides,
  };
}

function goalResult(goal: Goal, base: number, overrides: Partial<GoalResult> = {}): GoalResult {
  return {
    goalId: goal.id,
    valid: true,
    horizon: goal.years < 3 ? "short" : goal.years <= 5 ? "medium" : "long",
    inflation: 0.0834,
    futureValue: Math.round(goal.cost * (1 + 0.0834) ** goal.years),
    instrument: "dps",
    candidates: ["dps", "fdr_1y"],
    nominal: 0.09,
    afterTax: 0.081,
    real: 0.0009,
    realVsCpi: -0.002,
    belowInflation: false,
    monthly: { low: base * 0.9, base, high: base * 1.1 },
    months: goal.years * 12,
    status: "amber",
    explain: { steps: [{ id: "m5.monthly", inputs: { fv: 1, monthlyRate: 0.00675, months: goal.years * 12 }, raw: base, rounded: base, unit: "bdt" }], assumptions: [], notes: [] },
    ...overrides,
  };
}

function m5Result(goals: GoalResult[]): M5Result {
  return { goals, totalMonthly: goals.filter((g) => g.valid).reduce((t, g) => t + g.monthly.base, 0), usesAllocation: false };
}

const CARD_60K: DebtSummary = { id: "c-1", kind: "card", balance: 60000, annualRate: 0.25, minPayment: 3000 };

function baseInput(overrides: Partial<PlanInput> = {}): PlanInput {
  return {
    profile: PROFILE,
    m1: { essentials: 30000, incomeType: "salaried", dependents: [], soleEarner: false, hasHealthInsurance: false, liquidSavings: 0 },
    m4: { takeHome: 50000, essentials: 30000, incomeType: "salaried" },
    m5: { goals: [], age: 28 },
    ...overrides,
  };
}

function assertKeys(buckets: Bucket[]): void {
  for (const b of buckets) {
    expect(PLAN_REASON_KEYS).toContain(b.reasonKey);
    expect(PLAN_NEXT_KEYS).toContain(b.nextStepKey);
  }
  expect(buckets.map((b) => b.priority)).toEqual(buckets.map((_, i) => i + 1));
}

const mockedM4 = vi.mocked(computeSaveFirst);
const mockedM1 = vi.mocked(computeEmergencyFund);
const mockedM3 = vi.mocked(computeDebtHealth);
const mockedM5 = vi.mocked(computeGoals);

beforeEach(() => {
  vi.resetAllMocks();
  mockedM4.mockReturnValue(m4Result());
  mockedM1.mockReturnValue(m1Result(0));
  mockedM3.mockImplementation(() => m3Result([]));
  mockedM5.mockImplementation(() => m5Result([]));
});

describe("profileToPlanInput", () => {
  it("fills PRD defaults from the five answers", () => {
    const input = profileToPlanInput(PROFILE);
    expect(input.m1).toEqual({ essentials: 30000, incomeType: "salaried", dependents: [], soleEarner: false, hasHealthInsurance: false, liquidSavings: 0 });
    expect(input.m4).toEqual({ takeHome: 50000, essentials: 30000, incomeType: "salaried" });
    expect(input.m3).toBeUndefined();
    expect(input.m5).toEqual({ goals: [], age: 28 });
    expect(input.profile).toBe(PROFILE);
  });

  it("marks the sole earner when there are dependents and adds m3 only when hasDebt", () => {
    const profile: Profile = { ...PROFILE, dependents: ["partner", "children"], hasDebt: true, incomeType: "freelance" };
    const input = profileToPlanInput(profile);
    expect(input.m1.soleEarner).toBe(true);
    expect(input.m1.incomeType).toBe("freelance");
    expect(input.m3).toEqual({ takeHome: 50000, essentials: 30000, savingsTarget: 0, loans: [], cards: [] });
  });

  it("layers overrides on top of the defaults", () => {
    const goals: Goal[] = [{ id: "g1", name: "Bike", cost: 200000, years: 2, type: "vehicle" }];
    const input = profileToPlanInput(
      { ...PROFILE, hasDebt: true },
      {
        m1: { liquidSavings: 50000, hasHealthInsurance: true, monthsOverride: 6 },
        m4: { savingsRate: 0.25, payday: 1 },
        m3: { cards: [{ id: "c-1", balance: 60000, limit: 100000, paysInFull: false }] },
        m5: { goals, age: 28 },
      },
    );
    expect(input.m1).toMatchObject({ liquidSavings: 50000, hasHealthInsurance: true, monthsOverride: 6, soleEarner: false });
    expect(input.m4).toMatchObject({ savingsRate: 0.25, payday: 1, takeHome: 50000 });
    expect(input.m3?.cards).toHaveLength(1);
    expect(input.m3?.loans).toEqual([]);
    expect(input.m5?.goals).toBe(goals);
  });

  it("rejects invalid profiles with INVALID_INPUT", () => {
    const bad: Profile[] = [
      { ...PROFILE, takeHome: 0 },
      { ...PROFILE, takeHome: -1 },
      { ...PROFILE, takeHome: Number.NaN },
      { ...PROFILE, essentials: -5 },
      { ...PROFILE, age: 14 },
      { ...PROFILE, age: 101 },
      { ...PROFILE, incomeType: "other" as Profile["incomeType"] },
      { ...PROFILE, dependents: ["dog"] as unknown as Profile["dependents"] },
    ];
    for (const p of bad) {
      let caught: unknown;
      try {
        profileToPlanInput(p);
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(EngineError);
      expect((caught as EngineError).code).toBe("INVALID_INPUT");
    }
  });
});

describe("computePlan", () => {
  it("50 000 / 30 000, no savings: the emergency fund gets the 80% cap and the rest starts a DPS habit", () => {
    const plan = computePlan(baseInput(), rates, TODAY);
    expect(plan.monthlyTotal).toBe(10000);
    // M1 wants 20 000 a month; the cap keeps 20% free so the plan never starves every other bucket.
    expect(plan.buckets.map((b) => [b.id, b.amount])).toEqual([
      ["emergency", 8000],
      ["future", 2000],
    ]);
    const [em] = plan.buckets;
    expect(em).toMatchObject({ id: "emergency", priority: 1, amount: 8000, instrument: "savings_account", status: "red", module: "m1", demotedFromRed: false });
    expect(em?.reasonKey).toBe("plan.reason.emergency");
    expect(em?.reasonParams).toEqual({ amount: 8000, covered: 0, months: 8, instrument: "savings_account" });
    expect(em?.nextStepKey).toBe("plan.next.openSavings");
    expect(plan.summary).toEqual({ emergencyShare: 0.8, monthsToEmergencyFull: 30, goalsShortfall: 0 });
    const share = plan.explain.steps.find((s) => s.id === "plan.emergencyShare");
    expect(share).toMatchObject({ inputs: { total: 10000, minShare: 0.6, maxShare: 0.8, m1Monthly: 20000, gap: 240000 }, raw: 8000, rounded: 8000, unit: "bdt" });
    expect(plan.debt).toBeUndefined();
    expect(plan.goals).toBeUndefined();
    expect(mockedM3).not.toHaveBeenCalled();
    expect(mockedM5).not.toHaveBeenCalled();
    assertKeys(plan.buckets);
  });

  it("200 000 saved: the 60% floor applies and the rest becomes a future bucket", () => {
    mockedM1.mockReturnValue(m1Result(200000));
    const plan = computePlan(baseInput(), rates, TODAY);
    expect(plan.emergency.monthlySaving).toBe(3400);
    expect(plan.buckets.map((b) => [b.id, b.amount])).toEqual([
      ["emergency", 6000],
      ["future", 4000],
    ]);
    const [em, future] = plan.buckets;
    expect(em).toMatchObject({ instrument: "fdr_3m", nextStepKey: "plan.next.fdrLadder", status: "amber" });
    expect(em?.reasonParams).toEqual({ amount: 6000, covered: 6.7, months: 8, instrument: "fdr_3m" });
    expect(future).toMatchObject({ instrument: "dps", status: "green", reasonKey: "plan.reason.addGoal", nextStepKey: "plan.next.addGoal", module: "m5", priority: 2 });
    expect(plan.monthlyTotal).toBe(10000);
    expect(plan.summary.emergencyShare).toBe(0.6);
    expect(plan.summary.monthsToEmergencyFull).toBe(7);
    assertKeys(plan.buckets);
  });

  it("a goal needing 9 300 gets the 4 000 left and the shortfall is recorded", () => {
    mockedM1.mockReturnValue(m1Result(200000));
    const goal: Goal = { id: "g-bike", name: "Motorbike", cost: 200000, years: 2, type: "vehicle" };
    mockedM5.mockImplementation(() => m5Result([goalResult(goal, 9300, { instrument: "fdr_1y" })]));
    const plan = computePlan(baseInput({ m5: { goals: [goal], age: 28 } }), rates, TODAY);
    expect(mockedM5).toHaveBeenCalledWith({ goals: [goal], age: 28 }, rates, TODAY);
    expect(plan.buckets.map((b) => [b.id, b.amount])).toEqual([
      ["emergency", 6000],
      ["goal", 4000],
    ]);
    const g = plan.buckets[1];
    expect(g).toMatchObject({ refId: "g-bike", instrument: "fdr_1y", status: "amber", module: "m5", reasonKey: "plan.reason.goal", nextStepKey: "plan.next.fdr" });
    expect(g?.reasonParams).toMatchObject({ name: "Motorbike", amount: 4000, need: 9300, years: 2, instrument: "fdr_1y" });
    expect(plan.summary.goalsShortfall).toBe(5300);
    expect(plan.goals?.goals).toHaveLength(1);
    expect(plan.monthlyTotal).toBe(10000);
    const allocation = plan.explain.steps.filter((s) => s.id === "plan.goalAllocation");
    expect(allocation).toEqual([{ id: "plan.goalAllocation", inputs: { goalId: "g-bike", need: 9300, goalsNeed: 9300, remaining: 4000 }, raw: 4000, rounded: 4000, unit: "bdt" }]);
    assertKeys(plan.buckets);
  });

  it("splits the remainder across goals in proportion to need and never over-allocates", () => {
    mockedM1.mockReturnValue(m1Result(200000));
    const a: Goal = { id: "a", name: "A", cost: 100000, years: 2, type: "general" };
    const b: Goal = { id: "b", name: "B", cost: 100000, years: 8, type: "home" };
    const c: Goal = { id: "c", name: "C", cost: 1, years: 1, type: "general" };
    mockedM5.mockImplementation(() =>
      m5Result([goalResult(a, 3000), goalResult(b, 9000, { instrument: "sanchayapatra_5y" }), goalResult(c, 0, { valid: false })]),
    );
    const plan = computePlan(baseInput({ m5: { goals: [a, b, c], age: 28 } }), rates, TODAY);
    const goalBuckets = plan.buckets.filter((x) => x.id === "goal");
    expect(goalBuckets.map((x) => [x.refId, x.amount])).toEqual([
      ["a", 1000],
      ["b", 3000],
    ]);
    expect(goalBuckets[1]?.nextStepKey).toBe("plan.next.sanchayapatra");
    expect(plan.summary.goalsShortfall).toBe(8000);
    expect(plan.monthlyTotal).toBe(10000);
    expect(plan.buckets.some((x) => x.id === "future")).toBe(false);
    // One allocation step per valid goal, after plan.goalsShare, with the unrounded share as raw.
    const planSteps = plan.explain.steps.filter((s) => s.id.startsWith("plan."));
    expect(planSteps.map((s) => s.id)).toEqual(["plan.total", "plan.emergencyShare", "plan.goalsShare", "plan.goalAllocation", "plan.goalAllocation"]);
    const [allocA, allocB] = planSteps.filter((s) => s.id === "plan.goalAllocation");
    expect(allocA).toMatchObject({ inputs: { goalId: "a", need: 3000, goalsNeed: 12000, remaining: 4000 }, raw: 1000, rounded: 1000, unit: "bdt" });
    expect(allocB).toMatchObject({ inputs: { goalId: "b", need: 9000, goalsNeed: 12000, remaining: 4000 }, raw: 3000, rounded: 3000, unit: "bdt" });
    assertKeys(plan.buckets);
  });

  it("the emergency amount never exceeds the remaining gap, and the surplus goes to the future bucket", () => {
    // 2 500 left to save: M1 wants 300 a month but the 60% floor would be 6 000.
    mockedM1.mockReturnValue(m1Result(237500));
    const plan = computePlan(baseInput(), rates, TODAY);
    expect(plan.buckets.map((b) => [b.id, b.amount])).toEqual([
      ["emergency", 2500],
      ["future", 7500],
    ]);
    expect(plan.summary.monthsToEmergencyFull).toBe(1);
    expect(plan.explain.steps.find((s) => s.id === "plan.emergencyShare")).toMatchObject({ inputs: { gap: 2500, m1Monthly: 300 }, raw: 2500, rounded: 2500 });
  });

  it("a goal that gets nothing is dropped instead of shown as a zero bucket", () => {
    mockedM1.mockReturnValue(m1Result(0));
    mockedM3.mockImplementation(() => m3Result([CARD_60K]));
    const goal: Goal = { id: "g", name: "Trip", cost: 50000, years: 2, type: "travel" };
    mockedM5.mockImplementation(() => m5Result([goalResult(goal, 1500)]));
    // B 10 000 → emergency 8 000 (cap) → debt takes the last 2 000 → nothing for the goal.
    const plan = computePlan(
      baseInput({ profile: { ...PROFILE, hasDebt: true }, m3: { takeHome: 50000, essentials: 30000, savingsTarget: 0, loans: [], cards: [] }, m5: { goals: [goal], age: 28 } }),
      rates,
      TODAY,
    );
    expect(plan.buckets.map((b) => [b.id, b.amount])).toEqual([
      ["emergency", 8000],
      ["debt", 2000],
    ]);
    expect(plan.buckets.every((b) => b.amount > 0)).toBe(true);
    expect(plan.summary.goalsShortfall).toBe(1500);
    expect(plan.monthlyTotal).toBe(10000);
    expect(plan.buckets[1]?.reasonParams.months).toBe(30); // 60 000 / 2 000
  });

  it("a goal that fits leaves the surplus in a future bucket so the whole amount is placed", () => {
    mockedM1.mockReturnValue(m1Result(200000));
    const goal: Goal = { id: "g", name: "Trip", cost: 50000, years: 2, type: "travel" };
    mockedM5.mockImplementation(() => m5Result([goalResult(goal, 1500)]));
    const plan = computePlan(baseInput({ m5: { goals: [goal], age: 28 } }), rates, TODAY);
    expect(plan.buckets.map((b) => [b.id, b.amount])).toEqual([
      ["emergency", 6000],
      ["goal", 1500],
      ["future", 2500],
    ]);
    expect(plan.summary.goalsShortfall).toBe(0);
    expect(plan.monthlyTotal).toBe(10000);
  });

  it("high-interest card of 60 000: debt bucket is min(remaining, 60 000 / 12) and gets the M4 amount as savings target", () => {
    mockedM1.mockReturnValue(m1Result(200000));
    mockedM3.mockImplementation(() => m3Result([CARD_60K]));
    const m3: PlanInput["m3"] = { takeHome: 50000, essentials: 30000, savingsTarget: 0, loans: [], cards: [{ id: "c-1", balance: 60000, limit: 100000, paysInFull: false }] };
    const plan = computePlan(baseInput({ profile: { ...PROFILE, hasDebt: true }, m3 }), rates, TODAY);
    expect(mockedM3).toHaveBeenCalledWith({ ...m3, savingsTarget: 10000 }, rates, TODAY);
    expect(plan.buckets.map((b) => [b.id, b.amount])).toEqual([
      ["emergency", 6000],
      ["debt", 4000],
    ]);
    const d = plan.buckets[1];
    expect(d).toMatchObject({ instrument: "loan_prepayment", status: "amber", module: "m3", refId: "c-1", nextStepKey: "plan.next.prepayDebt", reasonKey: "plan.reason.debt" });
    // months = ceil(60 000 / 4 000): what the allocated amount actually achieves, not the 12-month target.
    expect(d?.reasonParams).toEqual({ amount: 4000, rate: 0.25, count: 1, months: 15 });
    expect(plan.debt).toBeDefined();
    const debtStep = plan.explain.steps.find((s) => s.id === "plan.debtShare");
    expect(debtStep?.inputs).toEqual({ remaining: 4000, headroom: 5000 });
    expect(debtStep?.rounded).toBe(4000);
    assertKeys(plan.buckets);
  });

  it("keeps a user-set savingsTarget for M3 and takes the full 5 000 when there is room", () => {
    mockedM1.mockReturnValue(m1Result(240000));
    mockedM3.mockImplementation(() => m3Result([CARD_60K]));
    const m3: PlanInput["m3"] = { takeHome: 50000, essentials: 30000, savingsTarget: 8000, loans: [], cards: [] };
    const plan = computePlan(baseInput({ profile: { ...PROFILE, hasDebt: true }, m3 }), rates, TODAY);
    expect(mockedM3).toHaveBeenCalledWith(m3, rates, TODAY);
    expect(plan.buckets.map((b) => [b.id, b.amount])).toEqual([
      ["emergency", 0],
      ["debt", 5000],
      ["future", 5000],
    ]);
    expect(plan.buckets[0]?.nextStepKey).toBe("plan.next.keepFull");
    expect(plan.buckets[1]?.reasonParams.months).toBe(12); // 60 000 / 5 000
  });

  it("one-red rule: emergency red and debt red → debt demoted to amber", () => {
    mockedM1.mockReturnValue(m1Result(0, { status: "red" }));
    mockedM4.mockReturnValue(m4Result({ savingsAmount: 20000 }));
    mockedM3.mockImplementation(() => m3Result([CARD_60K], { status: "red" }));
    const plan = computePlan(baseInput({ profile: { ...PROFILE, hasDebt: true }, m3: { takeHome: 50000, essentials: 30000, savingsTarget: 0, loans: [], cards: [] } }), rates, TODAY);
    expect(plan.buckets.map((b) => [b.id, b.status, b.demotedFromRed])).toEqual([
      ["emergency", "red", false],
      ["debt", "amber", true],
    ]);
    expect(plan.buckets.filter((b) => b.status === "red")).toHaveLength(1);
  });

  it("one-red rule keeps the lowest-priority red when the emergency fund is not red", () => {
    mockedM1.mockReturnValue(m1Result(200000));
    mockedM4.mockReturnValue(m4Result({ savingsAmount: 20000 }));
    mockedM3.mockImplementation(() => m3Result([CARD_60K], { status: "red" }));
    const goal: Goal = { id: "g", name: "Flat", cost: 3000000, years: 7, type: "home" };
    mockedM5.mockImplementation(() => m5Result([goalResult(goal, 30000, { status: "red" })]));
    const plan = computePlan(
      baseInput({ profile: { ...PROFILE, hasDebt: true }, m3: { takeHome: 50000, essentials: 30000, savingsTarget: 0, loans: [], cards: [] }, m5: { goals: [goal], age: 28 } }),
      rates,
      TODAY,
    );
    expect(plan.buckets.map((b) => [b.id, b.status, b.demotedFromRed])).toEqual([
      ["emergency", "amber", false],
      ["debt", "red", false],
      ["goal", "amber", true],
    ]);
  });

  it("emergency fund full: zero-amount green bucket listed first with the emergencyFull reason", () => {
    mockedM1.mockReturnValue(m1Result(240000));
    const plan = computePlan(baseInput(), rates, TODAY);
    expect(plan.buckets.map((b) => [b.id, b.amount])).toEqual([
      ["emergency", 0],
      ["future", 10000],
    ]);
    const [em] = plan.buckets;
    expect(em).toMatchObject({ status: "green", reasonKey: "plan.reason.emergencyFull", nextStepKey: "plan.next.keepFull", instrument: "fdr_3m", module: "m1", priority: 1, demotedFromRed: false });
    expect(em?.reasonParams).toEqual({ months: 8 });
    expect(plan.summary).toEqual({ emergencyShare: 0, monthsToEmergencyFull: null, goalsShortfall: 0 });
    expect(plan.explain.steps.find((s) => s.id === "plan.emergencyShare")).toMatchObject({ inputs: { total: 10000, minShare: 0.6, maxShare: 0.8, m1Monthly: 0, gap: 0 }, rounded: 0 });
    expect(plan.monthlyTotal).toBe(10000);
    assertKeys(plan.buckets);
  });

  it("zero budget: no buckets at all (a zero emergency bucket is only shown when the fund is full)", () => {
    mockedM4.mockReturnValue(m4Result({ savingsAmount: 0, savingsRate: 0 }));
    const plan = computePlan(baseInput(), rates, TODAY);
    expect(plan.monthlyTotal).toBe(0);
    expect(plan.buckets).toEqual([]);
    expect(plan.summary).toEqual({ emergencyShare: 0, monthsToEmergencyFull: null, goalsShortfall: 0 });
    expect(plan.explain.steps.find((s) => s.id === "plan.emergencyShare")).toMatchObject({ inputs: { total: 0, gap: 240000, m1Monthly: 20000 }, rounded: 0 });
  });

  it("zero budget with a full fund keeps the single keepFull bucket", () => {
    mockedM4.mockReturnValue(m4Result({ savingsAmount: 0, savingsRate: 0 }));
    mockedM1.mockReturnValue(m1Result(240000));
    const plan = computePlan(baseInput(), rates, TODAY);
    expect(plan.buckets.map((b) => [b.id, b.amount, b.nextStepKey])).toEqual([["emergency", 0, "plan.next.keepFull"]]);
  });

  it("insurance and retirement hooks reserve their need in priority order", () => {
    mockedM1.mockReturnValue(m1Result(240000));
    const plan = computePlan(baseInput({ insurance: { monthlyPremiumNeed: 2000 }, retirement: { monthlyNeed: 3000 } }), rates, TODAY);
    expect(plan.buckets.map((b) => [b.id, b.module, b.amount, b.instrument])).toEqual([
      ["emergency", "m1", 0, "fdr_3m"],
      ["insurance", "m2", 2000, "term_insurance"],
      ["future", "m7", 3000, "dps"],
      ["future", "m5", 5000, "dps"],
    ]);
    expect(plan.monthlyTotal).toBe(10000);
    assertKeys(plan.buckets);
  });

  it("explain merges module explanations and records the plan steps and both plan assumptions", () => {
    mockedM4.mockReturnValue(m4Result({ savingsAmount: 15000, savingsRate: 0.3 }));
    mockedM1.mockReturnValue(m1Result(200000));
    mockedM3.mockImplementation(() => m3Result([CARD_60K]));
    const goal: Goal = { id: "g", name: "Trip", cost: 50000, years: 2, type: "travel" };
    mockedM5.mockImplementation(() => m5Result([goalResult(goal, 1500)]));
    const plan = computePlan(
      baseInput({ profile: { ...PROFILE, hasDebt: true }, m3: { takeHome: 50000, essentials: 30000, savingsTarget: 0, loans: [], cards: [] }, m5: { goals: [goal], age: 28 } }),
      rates,
      TODAY,
    );
    const planSteps = plan.explain.steps.filter((s) => s.id.startsWith("plan."));
    expect(planSteps.map((s) => s.id)).toEqual([...PLAN_STEP_IDS]);
    for (const s of planSteps) expect(PLAN_STEP_IDS).toContain(s.id);
    expect(plan.explain.steps.map((s) => s.id)).toEqual(expect.arrayContaining(["m4.amount", "m1.target", "m3.totalEmi", "m5.monthly"]));
    const keys = plan.explain.assumptions.map((a) => a.key);
    expect(keys).toContain("plan_emergency_min_share");
    expect(keys).toContain("plan_emergency_max_share");
    expect(keys).toContain("debt_payoff_target_months");
    // B 15 000 → emergency 9 000 (60% floor) → debt 5 000 → 1 000 left for a goal needing 1 500.
    expect(plan.buckets.map((b) => [b.id, b.amount])).toEqual([
      ["emergency", 9000],
      ["debt", 5000],
      ["goal", 1000],
    ]);
    const total = plan.explain.steps.find((s) => s.id === "plan.total");
    expect(total).toMatchObject({ inputs: { savings: 15000 }, rounded: 15000, unit: "bdt" });
    const share = plan.explain.steps.find((s) => s.id === "plan.emergencyShare");
    expect(share).toMatchObject({ inputs: { total: 15000, minShare: 0.6, maxShare: 0.8, m1Monthly: 3400, gap: 40000 }, raw: 9000, rounded: 9000 });
    const goalsShare = plan.explain.steps.find((s) => s.id === "plan.goalsShare");
    expect(goalsShare).toMatchObject({ inputs: { remaining: 1000, goalsNeed: 1500 }, rounded: 1000 });
    expect(plan.summary.goalsShortfall).toBe(500);
  });

  it("the emergency floor and the debt payoff months come from the rates snapshot, not literals", () => {
    const custom = structuredClone(rates);
    custom.rows.plan_emergency_min_share = { ...custom.rows.plan_emergency_min_share, value: 0.8 };
    custom.rows.plan_emergency_max_share = { ...custom.rows.plan_emergency_max_share, value: 0.9 };
    custom.rows.debt_payoff_target_months = { ...custom.rows.debt_payoff_target_months, value: 24 };
    mockedM1.mockReturnValue(m1Result(200000));
    mockedM3.mockImplementation(() => m3Result([CARD_60K]));
    const plan = computePlan(baseInput({ profile: { ...PROFILE, hasDebt: true }, m3: { takeHome: 50000, essentials: 30000, savingsTarget: 0, loans: [], cards: [] } }), custom, TODAY);
    expect(plan.buckets.map((b) => [b.id, b.amount])).toEqual([
      ["emergency", 8000],
      ["debt", 2000],
    ]);
    expect(plan.explain.steps.find((s) => s.id === "plan.debtShare")?.inputs).toEqual({ remaining: 2000, headroom: 2500 });
    expect(plan.buckets[1]?.reasonParams.months).toBe(30); // 60 000 / 2 000, not the 24-month target
    expect(plan.explain.steps.find((s) => s.id === "plan.emergencyShare")?.inputs).toMatchObject({ minShare: 0.8, maxShare: 0.9 });
  });

  it("the emergency cap comes from plan_emergency_max_share", () => {
    const custom = structuredClone(rates);
    custom.rows.plan_emergency_max_share = { ...custom.rows.plan_emergency_max_share, value: 1 };
    const plan = computePlan(baseInput(), custom, TODAY);
    expect(plan.buckets.map((b) => [b.id, b.amount])).toEqual([["emergency", 10000]]);
    expect(plan.summary.emergencyShare).toBe(1);
  });

  it("throws MISSING_RATE when a plan assumption row is absent", () => {
    const broken = structuredClone(rates) as { rows: Partial<typeof rates.rows> };
    delete broken.rows.plan_emergency_min_share;
    let caught: unknown;
    try {
      computePlan(baseInput(), broken as typeof rates, TODAY);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(EngineError);
    expect((caught as EngineError).code).toBe("MISSING_RATE");
  });

  it("rejects an invalid profile inside the input with INVALID_INPUT", () => {
    let caught: unknown;
    try {
      computePlan(baseInput({ profile: { ...PROFILE, age: 7 } }), rates, TODAY);
    } catch (e) {
      caught = e;
    }
    expect((caught as EngineError).code).toBe("INVALID_INPUT");
    expect(mockedM4).not.toHaveBeenCalled();
  });
});

describe("nextStepForInstrument", () => {
  it("maps every instrument onto a member of PLAN_NEXT_KEYS", () => {
    const all = ["savings_account", "fdr_3m", "fdr_1y", "dps", "sanchayapatra_5y", "tbill_91d", "tbond_5y", "tbond_10y", "equity_fund", "gold"] as const;
    for (const i of all) expect(PLAN_NEXT_KEYS).toContain(nextStepForInstrument(i));
    expect(nextStepForInstrument("sanchayapatra_5y")).toBe("plan.next.sanchayapatra");
    expect(nextStepForInstrument("tbond_10y")).toBe("plan.next.tbond");
    expect(nextStepForInstrument("dps")).toBe("plan.next.dps");
    expect(nextStepForInstrument("fdr_3m")).toBe("plan.next.fdr");
  });
});
