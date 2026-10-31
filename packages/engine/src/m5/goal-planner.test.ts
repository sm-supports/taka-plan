import { describe, expect, it } from "vitest";
import seed from "../data/rates.seed.json";
import { roundMoney } from "../money";
import { assertSnapshot, instrumentAfterTax, type RatesSnapshot } from "../rates";
import { computeGoal, computeGoals, dominantSlot, futureValue, horizonFor, instrumentsFor, isValidGoal, mixFixedIncomeSlot, sinkingFundMonthly } from "./goal-planner";
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
    // With an allocation a long goal is priced at the mix: its slots with a weight above zero.
    expect(instrumentsFor("long", { equity: 0.5, fixedIncome: 0.4, gold: 0.1 })).toEqual(["sanchayapatra_5y", "tbond_10y", "equity_fund", "gold"]);
    expect(instrumentsFor("long", { equity: 0, fixedIncome: 1, gold: 0 })).toEqual(["sanchayapatra_5y", "tbond_10y"]);
    expect(instrumentsFor("short", { equity: 0.5, fixedIncome: 0.4, gold: 0.1 })).toEqual(["fdr_1y", "dps", "tbill_91d"]);
  });

  it("mixFixedIncomeSlot prefers Sanchayapatra, then the 10-year bond, then a 1-year deposit; dominantSlot picks the largest bucket", () => {
    expect(mixFixedIncomeSlot(snapshot)).toBe("sanchayapatra_5y");
    const noCertificate = { country: { unavailable: ["sanchayapatra_5y"] } } as unknown as RatesSnapshot;
    expect(mixFixedIncomeSlot(noCertificate)).toBe("tbond_10y");
    const depositsOnly = { country: { unavailable: ["sanchayapatra_5y", "tbond_10y"] } } as unknown as RatesSnapshot;
    expect(mixFixedIncomeSlot(depositsOnly)).toBe("fdr_1y");
    expect(dominantSlot({ equity: 0.6, gold: 0.1, fixedIncome: 0.3 }, snapshot)).toBe("equity_fund");
    expect(dominantSlot({ equity: 0.45, gold: 0.1, fixedIncome: 0.45 }, snapshot)).toBe("sanchayapatra_5y");
    expect(dominantSlot({ equity: 0.2, gold: 0.5, fixedIncome: 0.3 }, noCertificate)).toBe("gold");
  });
});

describe("long goals priced at the M6 mix", () => {
  const MIX = { equity: 0.6, gold: 0.1, fixedIncome: 0.3 };
  const home = goal({ id: "home", name: "Home", cost: 2000000, years: 15, type: "home" });

  it("blends the after-tax fixed income with untaxed equity and gold; low and high use the generic cases", () => {
    const g = computeGoal(home, snapshot, TODAY, undefined, MIX);
    // base 0.3 × 10.647% + 0.6 × 9% + 0.1 × 8%; nominal uses Sanchayapatra's 11.83% before tax.
    expect(g.afterTax).toBeCloseTo(0.3 * 0.10647 + 0.6 * 0.09 + 0.1 * 0.08, 10);
    expect(g.nominal).toBeCloseTo(0.3 * 0.1183 + 0.6 * 0.09 + 0.1 * 0.08, 10);
    expect(g).toMatchObject({ instrument: "equity_fund", candidates: ["sanchayapatra_5y", "equity_fund", "gold"], horizon: "long", status: "green" });
    const fvRaw = futureValue(2000000, 0.08, 15);
    const low = 0.3 * 0.065 + 0.6 * 0.02 + 0.1 * 0.02;
    const high = 0.3 * 0.105 + 0.6 * 0.14 + 0.1 * 0.12;
    expect(g.monthly.base).toBe(roundMoney(sinkingFundMonthly(fvRaw, g.afterTax, 180), "monthly"));
    expect(g.monthly.low).toBe(roundMoney(sinkingFundMonthly(fvRaw, low, 180), "monthly"));
    expect(g.monthly.high).toBe(roundMoney(sinkingFundMonthly(fvRaw, high, 180), "monthly"));
    expect(g.monthly).toEqual({ low: 27200, base: 16200, high: 11800 });
    expect(g.explain.notes).toEqual([]);
    const rate = g.explain.steps.find((s) => s.id === "m5.rate");
    expect(rate?.inputs).toMatchObject({ instrument: "equity_fund", fixedIncomeShare: 0.3, equityShare: 0.6, goldShare: 0.1, equityRate: 0.09, goldRate: 0.08 });
    // nominal × (1 − blended tax) = after tax, so the step's formula adds up.
    expect((rate!.inputs.nominal as number) * (1 - (rate!.inputs.tax as number))).toBeCloseTo(g.afterTax, 10);
    const keys = g.explain.assumptions.map((a) => a.key);
    expect(keys).toEqual(expect.arrayContaining(["sanchayapatra_5y_rate", "tax_sanchayapatra_profit", "equity_return_base", "gold_return_base", "fixed_income_return_low", "fixed_income_return_high", "equity_return_low", "equity_return_high", "gold_return_low", "gold_return_high"]));
    expect(keys).not.toContain("tax_bank_interest");
  });

  it("keeps low ≤ base ≤ high even when today's fixed-income rate beats the generic high case", () => {
    const g = computeGoal(home, snapshot, TODAY, undefined, { equity: 0, gold: 0, fixedIncome: 1 });
    // 10.647% after tax > fixed_income_return_high (10.5%): high falls back to the base.
    expect(g.monthly.high).toBe(g.monthly.base);
    expect(g.monthly.low).toBeGreaterThan(g.monthly.base);
    expect(g.instrument).toBe("sanchayapatra_5y");
  });

  it("only long goals use the mix; computeGoals reports usesAllocation", () => {
    const short = goal({ id: "s", years: 2, cost: 200000 });
    const out = computeGoals({ goals: [short, home], age: 30 }, snapshot, TODAY, MIX);
    expect(out.usesAllocation).toBe(true);
    expect(out.goals[0]).toEqual(computeGoal(short, snapshot, TODAY));
    expect(out.goals[1]?.instrument).toBe("equity_fund");
    expect(computeGoals({ goals: [short], age: 30 }, snapshot, TODAY, MIX).usesAllocation).toBe(false);
    // Explicit candidates win over the allocation.
    expect(computeGoal(home, snapshot, TODAY, ["fdr_1y"], MIX).instrument).toBe("fdr_1y");
    expect(() => computeGoals({ goals: [home], age: 30 }, snapshot, TODAY, { equity: 0.6, gold: 0.6, fixedIncome: 0 })).toThrow(/add up to 1/);
  });

  it("never applies interest tax to equity_fund or gold candidates", () => {
    const g = computeGoal(home, snapshot, TODAY, ["equity_fund", "gold"]);
    expect(g.instrument).toBe("equity_fund");
    expect(g.afterTax).toBe(instrumentAfterTax(snapshot, "equity_fund"));
    expect(g.afterTax).toBe(0.09);
    expect(g.explain.steps.find((s) => s.id === "m5.rate")?.inputs.tax).toBe(0);
    expect(g.explain.assumptions.map((a) => a.key)).not.toContain("tax_bank_interest");
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
