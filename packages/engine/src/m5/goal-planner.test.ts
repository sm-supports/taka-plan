import { describe, expect, it } from "vitest";
import seed from "../data/rates.seed.json";
import { roundMoney } from "../money";
import { assertSnapshot, instrumentAfterTax } from "../rates";
import { computeGoal, computeGoals, futureValue, horizonFor, instrumentsFor, isValidGoal, sinkingFundMonthly } from "./goal-planner";
import { M5_STEP_IDS, type Goal } from "./types";

const snapshot = assertSnapshot(seed);
const TODAY = "2026-10-30";

const goal = (over: Partial<Goal> = {}): Goal => ({ id: "g1", name: "Flat deposit", cost: 500000, years: 5, type: "general", ...over });

describe("formulas", () => {
  it("futureValue = C(1+i)^n", () => {
    expect(futureValue(500000, 0.08, 5)).toBeCloseTo(734664.04, 1);
    expect(futureValue(1000, 0, 10)).toBe(1000);
    expect(() => futureValue(Number.NaN, 0.08, 5)).toThrow(/finite/);
  });

  it("sinkingFundMonthly uses the monthly rate, and FV/months when the rate is zero", () => {
    expect(sinkingFundMonthly(120000, 0, 12)).toBe(10000);
    // 10.647% after tax, 60 months: the PRD's Sanchayapatra path is about ৳9,326 a month.
    expect(sinkingFundMonthly(734500, 0.10647, 60)).toBeCloseTo(9326, -2);
    expect(() => sinkingFundMonthly(1000, 0.08, 0)).toThrow(/months/);
    expect(() => sinkingFundMonthly(1000, 0.08, -3)).toThrow(/months/);
  });

  it("horizonFor: < 3 short, 3–5 medium, > 5 long", () => {
    expect(horizonFor(1)).toBe("short");
    expect(horizonFor(2)).toBe("short");
    expect(horizonFor(3)).toBe("medium");
    expect(horizonFor(5)).toBe("medium");
    expect(horizonFor(6)).toBe("long");
    expect(horizonFor(40)).toBe("long");
  });

  it("instrumentsFor lists fixed-income candidates per horizon; an allocation is the M6 hook", () => {
    expect(instrumentsFor("short")).toEqual(["fdr_1y", "dps", "tbill_91d"]);
    expect(instrumentsFor("medium")).toEqual(["sanchayapatra_5y", "tbond_5y"]);
    expect(instrumentsFor("long")).toEqual(["sanchayapatra_5y", "tbond_10y"]);
    expect(instrumentsFor("long", { equity: 0.5, fixedIncome: 0.4, gold: 0.1 })).toEqual([]);
    expect(instrumentsFor("short", { equity: 0.5, fixedIncome: 0.4, gold: 0.1 })).toEqual(["fdr_1y", "dps", "tbill_91d"]);
  });
});

describe("computeGoals (PRD vectors)", () => {
  it("500,000 today, 5 years, general → FV 734,500 via Sanchayapatra, about 9,300 a month, green", () => {
    const out = computeGoals({ goals: [goal()], age: 30 }, snapshot, TODAY);
    expect(out.usesAllocation).toBe(false);
    expect(out.goals).toHaveLength(1);
    const g = out.goals[0]!;
    expect(g.valid).toBe(true);
    expect(g.horizon).toBe("medium");
    expect(g.inflation).toBe(0.08);
    expect(g.futureValue).toBe(734500);
    expect(g.months).toBe(60);
    expect(g.candidates).toEqual(["sanchayapatra_5y", "tbond_5y"]);
    expect(g.instrument).toBe("sanchayapatra_5y");
    expect(g.nominal).toBe(0.1183);
    expect(g.afterTax).toBeCloseTo(0.10647, 5);
    expect(g.monthly.base).toBe(9300);
    expect(g.monthly.high).toBe(9300);
    const monthlyStep = g.explain.steps.find((s) => s.id === "m5.monthly")!;
    // Sized from the unrounded FV (734 664.04), not the ৳500-rounded 734 500 shown.
    const fvRaw = futureValue(500000, 0.08, 5);
    expect(monthlyStep.raw).toBeCloseTo(sinkingFundMonthly(fvRaw, 0.1183 * 0.9, 60), 6);
    expect(Math.abs(monthlyStep.raw - 9326)).toBeLessThanOrEqual(100);
    expect(monthlyStep.rounded).toBe(9300);
    expect(monthlyStep.inputs.fv).toBe(734500);
    // Low path: the 5-year bond (8.5% → 7.65% after tax) needs more each month.
    const lowRaw = sinkingFundMonthly(fvRaw, instrumentAfterTax(snapshot, "tbond_5y"), 60);
    expect(g.monthly.low).toBe(roundMoney(lowRaw, "monthly"));
    expect(g.monthly.low).toBeGreaterThan(g.monthly.base);
    // Real return is judged against the goal's own inflation (8% projection); the CPI figure is for display.
    expect(g.real).toBeCloseTo(1.10647 / 1.08 - 1, 4);
    expect(g.realVsCpi).toBeCloseTo(0.0213, 3);
    expect(g.belowInflation).toBe(false);
    expect(g.status).toBe("green");
    expect(g.explain.notes).toEqual([]);
    expect(out.totalMonthly).toBe(9300);
  });

  it("the same goal with only a 1-year FDR available → real −1.47% → below inflation, red", () => {
    const g = computeGoal(goal(), snapshot, TODAY, ["fdr_1y"]);
    expect(g.instrument).toBe("fdr_1y");
    expect(g.afterTax).toBeCloseTo(0.0675, 6);
    expect(g.real).toBeCloseTo(1.0675 / 1.08 - 1, 4);
    expect(g.realVsCpi).toBeCloseTo(-0.0147, 3);
    expect(g.belowInflation).toBe(true);
    expect(g.status).toBe("red");
    expect(g.explain.notes).toEqual(["m5.note.belowInflation"]);
    expect(g.monthly.low).toBe(g.monthly.base);
  });

  it("2-year goal → short horizon, DPS wins at 9% → 8.1% after tax, just above the 8% projection", () => {
    const g = computeGoals({ goals: [goal({ years: 2, cost: 200000 })], age: 30 }, snapshot, TODAY).goals[0]!;
    expect(g.horizon).toBe("short");
    expect(g.candidates).toEqual(["fdr_1y", "dps", "tbill_91d"]);
    expect(g.instrument).toBe("dps");
    expect(g.nominal).toBe(0.09);
    expect(g.afterTax).toBeCloseTo(0.081, 6);
    const fv = roundMoney(200000 * 1.08 ** 2, "lump");
    expect(fv).toBe(233500);
    expect(g.futureValue).toBe(fv);
    expect(g.months).toBe(24);
    const fvRaw = futureValue(200000, 0.08, 2);
    expect(g.monthly.base).toBe(roundMoney(sinkingFundMonthly(fvRaw, 0.081, 24), "monthly"));
    expect(g.monthly.base).toBe(9000);
    expect(g.monthly.low).toBe(roundMoney(sinkingFundMonthly(fvRaw, instrumentAfterTax(snapshot, "fdr_1y"), 24), "monthly"));
    // 8.1% after tax beats the 8% the goal is inflated with, so it is not below inflation (green);
    // against today's 8.34% CPI it is slightly negative, which realVsCpi reports for display.
    expect(g.real).toBeCloseTo(1.081 / 1.08 - 1, 6);
    expect(g.realVsCpi).toBeCloseTo(1.081 / 1.0834 - 1, 6);
    expect(g.belowInflation).toBe(false);
    expect(g.status).toBe("green");
  });

  it("a goal priced with 10% inflation is below inflation when the after-tax return is under 10%", () => {
    // Education at 10%: the 1-year FDR (6.75% after tax) loses ground even though Sanchayapatra would not.
    const g = computeGoal(goal({ type: "education", years: 4 }), snapshot, TODAY, ["fdr_1y"]);
    expect(g.inflation).toBe(0.1);
    expect(g.real).toBeCloseTo(1.0675 / 1.1 - 1, 6);
    expect(g.belowInflation).toBe(true);
    expect(g.status).toBe("red");
    const realStep = g.explain.steps.find((s) => s.id === "m5.real")!;
    expect(realStep.inputs.afterTax).toBeCloseTo(0.0675, 6);
    expect(realStep.inputs.inflation).toBe(0.1);
    // Sanchayapatra (10.647%) clears 10%, so the same goal is not below inflation.
    expect(computeGoal(goal({ type: "education", years: 4 }), snapshot, TODAY).belowInflation).toBe(false);
  });

  it("10-year education goal of 15 lakh → 10% inflation, long horizon, amber with the allocation note", () => {
    const g = computeGoals({ goals: [goal({ id: "edu", name: "University", cost: 1500000, years: 10, type: "education" })], age: 35 }, snapshot, TODAY).goals[0]!;
    expect(g.inflation).toBe(0.1);
    expect(g.horizon).toBe("long");
    expect(g.futureValue).toBe(roundMoney(1500000 * 1.1 ** 10, "lump"));
    expect(g.futureValue).toBe(3890500);
    expect(g.candidates).toEqual(["sanchayapatra_5y", "tbond_10y"]);
    expect(g.instrument).toBe("sanchayapatra_5y");
    expect(g.belowInflation).toBe(false);
    expect(g.status).toBe("amber");
    expect(g.explain.notes).toEqual(["m5.note.noAllocationYet"]);
    expect(g.explain.assumptions.map((a) => a.key)).toContain("goal_inflation_education");
    expect(g.explain.assumptions.map((a) => a.key)).not.toContain("inflation_projection");
  });

  it("health goals use their own inflation row; other types use the projection", () => {
    const out = computeGoals({ goals: [goal({ id: "h", type: "health", years: 3 }), goal({ id: "w", type: "wedding", years: 3 })], age: 30 }, snapshot, TODAY);
    expect(out.goals[0]!.inflation).toBe(0.1);
    expect(out.goals[0]!.explain.assumptions.map((a) => a.key)).toContain("goal_inflation_health");
    expect(out.goals[1]!.inflation).toBe(0.08);
    expect(out.goals[1]!.explain.assumptions.map((a) => a.key)).toContain("inflation_projection");
  });

  it("invalid goals come back valid:false, zeroed, red, and are excluded from the total", () => {
    const bad: Goal[] = [
      goal({ id: "noname", name: "   " }),
      goal({ id: "zero", cost: 0 }),
      goal({ id: "y0", years: 0 }),
      goal({ id: "y41", years: 41 }),
      goal({ id: "y2.5", years: 2.5 }),
      goal({ id: "nan", cost: Number.NaN }),
      goal({ id: "type", type: "boat" as Goal["type"] }),
    ];
    for (const b of bad) expect(isValidGoal(b), b.id).toBe(false);
    const out = computeGoals({ goals: [...bad, goal({ id: "ok" })], age: 30 }, snapshot, TODAY);
    expect(out.goals).toHaveLength(bad.length + 1);
    for (const g of out.goals.slice(0, bad.length)) {
      expect(g.valid).toBe(false);
      expect(g.futureValue).toBe(0);
      expect(g.monthly).toEqual({ low: 0, base: 0, high: 0 });
      expect(g.months).toBe(0);
      expect(g.afterTax).toBe(0);
      expect(g.real).toBe(0);
      expect(g.realVsCpi).toBe(0);
      expect(g.candidates).toEqual([]);
      expect(g.status).toBe("red");
      expect(g.explain).toEqual({ steps: [], assumptions: [], notes: [] });
    }
    expect(out.goals.at(-1)!.valid).toBe(true);
    expect(out.totalMonthly).toBe(9300);
    expect(() => computeGoal(bad[0]!, snapshot, TODAY)).toThrow(/valid/);
  });

  it("totalMonthly sums monthly.base over valid goals", () => {
    const out = computeGoals({ goals: [goal({ id: "a" }), goal({ id: "b", years: 2, cost: 200000 })], age: 30 }, snapshot, TODAY);
    expect(out.totalMonthly).toBe(out.goals[0]!.monthly.base + out.goals[1]!.monthly.base);
    expect(computeGoals({ goals: [], age: 30 }, snapshot, TODAY)).toEqual({ goals: [], totalMonthly: 0, usesAllocation: false });
  });

  it("explanation step ids are exactly M5_STEP_IDS, with the contract's input names and rate rows as assumptions", () => {
    const g = computeGoals({ goals: [goal()], age: 30 }, snapshot, TODAY).goals[0]!;
    expect(g.explain.steps.map((s) => s.id)).toEqual([...M5_STEP_IDS]);
    const byId = Object.fromEntries(g.explain.steps.map((s) => [s.id, s]));
    expect(Object.keys(byId["m5.fv"]!.inputs)).toEqual(["cost", "inflation", "years"]);
    expect(Object.keys(byId["m5.rate"]!.inputs)).toEqual(["instrument", "nominal", "tax"]);
    expect(byId["m5.rate"]!.inputs.instrument).toBe("sanchayapatra_5y");
    expect(byId["m5.rate"]!.rounded).toBe(0.106);
    expect(Object.keys(byId["m5.monthly"]!.inputs)).toEqual(["fv", "monthlyRate", "months"]);
    expect(byId["m5.monthly"]!.inputs.monthlyRate).toBeCloseTo(0.10647 / 12, 8);
    expect(Object.keys(byId["m5.real"]!.inputs)).toEqual(["afterTax", "inflation"]);
    expect(byId["m5.real"]!.inputs.inflation).toBe(0.08);
    expect(byId["m5.real"]!.rounded).toBe(0.025);
    for (const s of g.explain.steps) {
      expect(Number.isFinite(s.raw)).toBe(true);
      expect(Number.isFinite(s.rounded)).toBe(true);
    }
    const keys = g.explain.assumptions.map((a) => a.key);
    expect(keys).toEqual(["inflation_projection", "sanchayapatra_5y_rate", "tax_sanchayapatra_profit", "tbond_5y_rate", "tax_bank_interest", "inflation_cpi"]);
    expect(g.explain.assumptions.every((a) => !a.stale)).toBe(true);
  });
});
