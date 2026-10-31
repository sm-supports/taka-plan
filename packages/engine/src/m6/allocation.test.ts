import { describe, expect, it, test } from "vitest";
import seed from "../data/rates.seed.json";
import { withCountry } from "../country/overlay";
import { FIXTURE_US } from "../fixtures/countries";
import { assertSnapshot, type RateKey, type RatesSnapshot } from "../rates";
import { EngineError } from "../types";
import { allocationWeights, computeAllocation, mixFutureValue, riskProfileFor, waterFill } from "./allocation";
import { M6_GATE_KEYS, M6_HOWTO_KEYS, M6_NOTE_KEYS, M6_STEP_IDS, type M6Input, type RiskProfile } from "./types";

const rates = assertSnapshot(seed);
const today = "2026-10-30";

function withValue(s: RatesSnapshot, key: RateKey, value: number): RatesSnapshot {
  return { ...s, rows: { ...s.rows, [key]: { ...s.rows[key], value } } };
}

function withJson(s: RatesSnapshot, key: RateKey, valueJson: unknown): RatesSnapshot {
  return { ...s, rows: { ...s.rows, [key]: { ...s.rows[key], valueJson } } };
}

/** Balanced (score 4), age 30, 20-year horizon, ৳10,000 a month, emergency fund in place, no card debt. */
const base: M6Input = {
  age: 30,
  risk: { ageBand: 2, incomeStability: 2, horizon: 0, reaction: 0 },
  horizonYears: 20,
  lumpSum: 0,
  monthly: 10000,
  gate: { hasEmergencyFund: true, hasCardDebt: false },
};

const run = (over: Partial<M6Input> = {}, s: RatesSnapshot = rates) => computeAllocation({ ...base, ...over }, s, today);

const PROJECTION_KEYS: readonly RateKey[] = [
  "equity_return_low",
  "equity_return_base",
  "equity_return_high",
  "gold_return_low",
  "gold_return_base",
  "gold_return_high",
  "fixed_income_return_low",
  "fixed_income_return_base",
  "fixed_income_return_high",
  "inflation_projection",
];

const ALLOCATION_KEYS: readonly RateKey[] = [
  "allocation_profiles",
  "allocation_equity_cap",
  "allocation_gold_default",
  "allocation_gold_min",
  "allocation_gold_max",
  "allocation_no_equity_years",
  "allocation_cash_only_years",
];

describe("riskProfileFor (F1 bands)", () => {
  test.each<[number, RiskProfile]>([
    [0, "careful"],
    [3, "careful"],
    [4, "balanced"],
    [5, "balanced"],
    [6, "growth"],
    [8, "growth"],
  ])("score %i → %s", (score, profile) => expect(riskProfileFor(score)).toBe(profile));

  test.each([-1, 9, 2.5, Number.NaN])("score %s is invalid", (score) => expect(() => riskProfileFor(score)).toThrow(EngineError));
});

describe("allocationWeights (F2)", () => {
  it("Balanced at age 30 → 45 / 10 / 45 (PRD)", () => {
    expect(allocationWeights(30, "balanced", rates)).toEqual({ equity: 0.45, gold: 0.1, fixedIncome: 0.45 });
  });

  // Knees: age 30 (E0), the floor age (E0 − Emin + 30) and 70.
  test.each<[RiskProfile, number, number]>([
    ["careful", 25, 0.3],
    ["careful", 30, 0.3],
    ["careful", 40, 0.2],
    ["careful", 50, 0.1],
    ["careful", 70, 0.1],
    ["balanced", 30, 0.45],
    ["balanced", 45, 0.3],
    ["balanced", 60, 0.15],
    ["balanced", 70, 0.15],
    ["growth", 30, 0.6],
    ["growth", 50, 0.4],
    ["growth", 70, 0.2],
    ["growth", 80, 0.2],
  ])("%s at %i → equity %d", (profile, age, equity) => {
    const w = allocationWeights(age, profile, rates);
    expect(w.equity).toBe(equity);
    expect(w.gold).toBe(0.1);
    expect(w.fixedIncome).toBeCloseTo(0.9 - equity, 12);
    expect(Math.round((w.equity + w.gold + w.fixedIncome) * 1000)).toBe(1000);
  });

  it("weights are 3-decimal and sum to 1 for fractional ages", () => {
    const w = allocationWeights(33.37, "balanced", rates);
    expect(w).toEqual({ equity: 0.416, gold: 0.1, fixedIncome: 0.484 });
    expect(w.equity + w.gold + w.fixedIncome).toBeCloseTo(1, 12);
  });

  it("caps equity at 70% (allocation_equity_cap)", () => {
    const s = withJson(rates, "allocation_profiles", { careful: { e0: 0.3, emin: 0.1 }, balanced: { e0: 0.45, emin: 0.15 }, growth: { e0: 0.8, emin: 0.2 } });
    expect(allocationWeights(30, "growth", s)).toEqual({ equity: 0.7, gold: 0.1, fixedIncome: 0.2 });
    expect(allocationWeights(35, "growth", s).equity).toBe(0.7);
    expect(allocationWeights(45, "growth", s).equity).toBe(0.65);
    expect(allocationWeights(30, "growth", withValue(rates, "allocation_equity_cap", 0.5)).equity).toBe(0.5);
  });

  it("clamps the user's gold share to 5–15%", () => {
    expect(allocationWeights(30, "balanced", rates, 0.2)).toEqual({ equity: 0.45, gold: 0.15, fixedIncome: 0.4 });
    expect(allocationWeights(30, "balanced", rates, 0.01)).toEqual({ equity: 0.45, gold: 0.05, fixedIncome: 0.5 });
    expect(allocationWeights(30, "balanced", rates, 0.12)).toEqual({ equity: 0.45, gold: 0.12, fixedIncome: 0.43 });
  });

  it("rejects a bad age or profile", () => {
    expect(() => allocationWeights(-1, "balanced", rates)).toThrow(EngineError);
    expect(() => allocationWeights(30, "reckless" as RiskProfile, rates)).toThrow(EngineError);
  });
});

describe("computeAllocation: profile and horizon", () => {
  it("score is the sum of the four answers; the profile follows the band", () => {
    const r = run();
    expect(r.score).toBe(4);
    expect(r.suggestedProfile).toBe("balanced");
    expect(r.profile).toBe("balanced");
    expect(r.weights).toEqual({ equity: 0.45, gold: 0.1, fixedIncome: 0.45 });
    expect(r.horizonRule).toBe("none");
  });

  it("an override replaces the suggestion but never lifts equity above the cap", () => {
    const r = run({ risk: { ageBand: 2, incomeStability: 2, horizon: 2, reaction: 2 }, profileOverride: "careful" });
    expect(r.suggestedProfile).toBe("growth");
    expect(r.profile).toBe("careful");
    expect(r.weights.equity).toBe(0.3);

    const s = withJson(rates, "allocation_profiles", { careful: { e0: 0.3, emin: 0.1 }, balanced: { e0: 0.45, emin: 0.15 }, growth: { e0: 0.9, emin: 0.2 } });
    const capped = run({ profileOverride: "growth" }, s);
    expect(capped.weights).toEqual({ equity: 0.7, gold: 0.1, fixedIncome: 0.2 });
    expect(capped.notes).toContain("m6.note.capApplied");
    expect(run().notes).not.toContain("m6.note.capApplied");
  });

  test.each<[number, "none" | "noEquity" | "cashOnly", { equity: number; gold: number; fixedIncome: number }]>([
    [20, "none", { equity: 0.45, gold: 0.1, fixedIncome: 0.45 }],
    [5, "none", { equity: 0.45, gold: 0.1, fixedIncome: 0.45 }],
    [4.9, "noEquity", { equity: 0, gold: 0.1, fixedIncome: 0.9 }],
    [1, "noEquity", { equity: 0, gold: 0.1, fixedIncome: 0.9 }],
    [0.5, "cashOnly", { equity: 0, gold: 0, fixedIncome: 1 }],
    [0, "cashOnly", { equity: 0, gold: 0, fixedIncome: 1 }],
  ])("horizon %d years → %s", (horizonYears, rule, weights) => {
    const r = run({ horizonYears });
    expect(r.horizonRule).toBe(rule);
    expect(r.weights).toEqual(weights);
    if (rule === "noEquity") expect(r.notes).toContain("m6.note.horizonNoEquity");
    if (rule === "cashOnly") expect(r.notes).toContain("m6.note.horizonCashOnly");
    if (rule === "none") expect(r.notes.filter((n) => n.startsWith("m6.note.horizon"))).toEqual([]);
  });

  it("property is noted, never split", () => {
    const r = run({ propertyValue: 5_000_000, lumpSum: 100_000 });
    expect(r.notes).toContain("m6.note.propertyExcluded");
    expect(r.amounts.lump.equity + r.amounts.lump.gold + r.amounts.lump.fixedIncome).toBe(100_000);
    expect(run().notes).not.toContain("m6.note.propertyExcluded");
  });

  it("rejects bad answers and amounts", () => {
    expect(() => run({ risk: { ageBand: 3 as 2, incomeStability: 0, horizon: 0, reaction: 0 } })).toThrow(EngineError);
    expect(() => run({ age: Number.NaN })).toThrow(EngineError);
    expect(() => run({ monthly: -1 })).toThrow(EngineError);
    expect(() => run({ horizonYears: -1 })).toThrow(EngineError);
    expect(() => run({ holdings: { equity: -5, gold: 0, fixedIncome: 0 } })).toThrow(EngineError);
    expect(() => run({ profileOverride: "yolo" as RiskProfile })).toThrow(EngineError);
  });
});

describe("computeAllocation: amounts", () => {
  it("splits the lump sum (৳500) and monthly amount (৳100) per bucket", () => {
    const r = run({ lumpSum: 100_000, monthly: 10_000 });
    expect(r.amounts.lump).toEqual({ equity: 45_000, gold: 10_000, fixedIncome: 45_000 });
    expect(r.amounts.monthly).toEqual({ equity: 4_500, gold: 1_000, fixedIncome: 4_500 });
  });

  it("parts sum to the rounded total; fixed income takes the remainder", () => {
    const r = run({ lumpSum: 101_000, monthly: 7_777 });
    expect(r.amounts.lump).toEqual({ equity: 45_500, gold: 10_000, fixedIncome: 45_500 });
    const m = r.amounts.monthly;
    expect(m.equity + m.gold + m.fixedIncome).toBe(7_800);
    expect(m).toEqual({ equity: 3_500, gold: 800, fixedIncome: 3_500 });
  });
});

describe("computeAllocation: instrument map (F3)", () => {
  it("long horizon: savings certificate first, then bills, bonds and deposits; fund for equity; bars for gold", () => {
    const r = run();
    expect(r.instruments).toEqual([
      { bucket: "fixedIncome", primary: "sanchayapatra_5y", alternatives: ["tbill_91d", "tbond_5y", "fdr_1y"], howToKeys: ["m6.howto.fixedIncome"] },
      { bucket: "equity", primary: "equity_fund", alternatives: [], howToKeys: ["m6.howto.equityFund"] },
      { bucket: "gold", primary: "gold", alternatives: [], howToKeys: ["m6.howto.gold"] },
    ]);
    expect(r.notes).toEqual(expect.arrayContaining(["m6.note.noIndexFund", "m6.note.neverBreakCertificates"]));
  });

  it("under 3 years: a 1-year deposit with bills; cash only: deposit, bills or savings; buckets at 0% get no card", () => {
    expect(run({ horizonYears: 2 }).instruments).toEqual([
      { bucket: "fixedIncome", primary: "fdr_1y", alternatives: ["tbill_91d"], howToKeys: ["m6.howto.fixedIncome"] },
      { bucket: "gold", primary: "gold", alternatives: [], howToKeys: ["m6.howto.gold"] },
    ]);
    expect(run({ horizonYears: 0.5 }).instruments).toEqual([{ bucket: "fixedIncome", primary: "fdr_1y", alternatives: ["tbill_91d", "savings_account"], howToKeys: ["m6.howto.fixedIncome"] }]);
  });

  it("direct shares swap the equity how-to", () => {
    const eq = run({ directShares: true }).instruments.find((c) => c.bucket === "equity");
    expect(eq?.howToKeys).toEqual(["m6.howto.directShares"]);
  });

  it("drops slots the country lacks: gold unavailable → its share moves to fixed income; certificate unavailable → first alternative", () => {
    const profile = {
      ...FIXTURE_US,
      instruments: { ...FIXTURE_US.instruments, gold: { available: false, localName: null }, sanchayapatra_5y: { available: false, localName: null } },
    };
    const us = withCountry(rates, profile, { bdUsdRate: 122 });
    expect(us.country?.unavailable).toEqual(expect.arrayContaining(["gold", "sanchayapatra_5y", "dps"]));
    const r = run({ lumpSum: 12_345 }, us);
    expect(r.weights).toEqual({ equity: 0.45, gold: 0, fixedIncome: 0.55 });
    expect(r.instruments.find((c) => c.bucket === "gold")).toBeUndefined();
    expect(r.instruments.find((c) => c.bucket === "fixedIncome")).toEqual({ bucket: "fixedIncome", primary: "tbill_91d", alternatives: ["tbond_5y", "fdr_1y"], howToKeys: ["m6.howto.fixedIncome"] });
    // Dollar rounding steps (lump 5): 12,345 → 5,555 equity, 6,790 fixed income.
    expect(r.amounts.lump).toEqual({ equity: 5_555, gold: 0, fixedIncome: 6_790 });
    // Bangladesh-only notes are not shown for the US without a savings certificate.
    expect(r.notes).not.toContain("m6.note.noIndexFund");
    expect(r.notes).not.toContain("m6.note.neverBreakCertificates");
  });
});

describe("computeAllocation: projection (F5)", () => {
  it("PRD: ৳10,000/month for 20 years at 45/10/45 → mix 4.0 / 8.7 / 12.2%, about 36.5 / 61.5 / 93.6 lakh, 7.8 / 13.2 / 20.1 lakh real", () => {
    const p = run().projection;
    expect(p.years).toBe(20);
    expect(p.paidIn).toBe(2_400_000);
    expect(p.low.rate).toBeCloseTo(0.04025, 10);
    expect(p.base.rate).toBeCloseTo(0.08675, 10);
    expect(p.high.rate).toBeCloseTo(0.12225, 10);
    const near = (x: number, target: number) => expect(Math.abs(x / target - 1)).toBeLessThan(0.01);
    near(p.low.nominal, 3_650_000);
    near(p.base.nominal, 6_150_000);
    near(p.high.nominal, 9_360_000);
    near(p.low.real, 780_000);
    near(p.base.real, 1_320_000);
    near(p.high.real, 2_010_000);
    for (const c of [p.low, p.base, p.high]) {
      expect(c.nominal % 500).toBe(0);
      expect(c.real % 500).toBe(0);
    }
    expect(p.lowLosesValue).toBe(true);
  });

  it("the low case losing value is noted and makes the result amber", () => {
    const r = run();
    expect(r.notes).toContain("m6.note.lowLosesValue");
    expect(r.status).toBe("amber");
  });

  it("r = 0 → FV is the money paid in", () => {
    expect(mixFutureValue(1_000, 5_000, 0, 2)).toBe(29_000);
    let s = rates;
    for (const k of PROJECTION_KEYS) s = withValue(s, k, 0);
    const p = run({ lumpSum: 50_000, projectionYears: 3 }, s).projection;
    expect(p.years).toBe(3);
    expect(p.paidIn).toBe(410_000);
    for (const c of [p.low, p.base, p.high]) expect(c).toEqual({ rate: 0, nominal: 410_000, real: 410_000 });
    expect(p.lowLosesValue).toBe(false);
  });

  it("a lump sum compounds annually: FV = lump × (1 + r)^n", () => {
    const p = run({ monthly: 0, lumpSum: 100_000, horizonYears: 10 }).projection;
    expect(p.base.nominal).toBe(Math.round((100_000 * 1.08675 ** 10) / 500) * 500);
    expect(p.base.real).toBe(Math.round((100_000 * (1.08675 / 1.08) ** 10) / 500) * 500);
  });

  it("is green when the low case keeps its value and the gates pass", () => {
    const r = run({}, withValue(withValue(rates, "inflation_projection", 0.02), "equity_return_low", 0.05));
    expect(r.projection.lowLosesValue).toBe(false);
    expect(r.status).toBe("green");
  });
});

describe("computeAllocation: rebalancer (F4)", () => {
  const holdings = { equity: 550_000, gold: 150_000, fixedIncome: 300_000 };

  it("PRD: 45/10/45 on 10 lakh, holdings 5.5 / 1.5 / 3 lakh → sell 1 lakh equity, sell 50,000 gold, buy 1.5 lakh fixed income", () => {
    const r = run({ holdings });
    expect(r.rebalance).toBeDefined();
    const rb = r.rebalance!;
    expect(rb.total).toBe(1_000_000);
    expect(rb.trades).toEqual({ equity: -100_000, gold: -50_000, fixedIncome: 150_000 });
    expect(rb.drift.equity).toBeCloseTo(0.1, 6);
    expect(rb.drift.gold).toBeCloseTo(0.05, 6);
    expect(rb.drift.fixedIncome).toBeCloseTo(-0.15, 6);
    expect(rb.triggered).toBe(true);
    expect(rb.newMoneyOnly).toBe(false);
    expect(r.notes).toContain("m6.note.exitCosts");
  });

  it("PRD: with 1.5 lakh new money, all of it goes to fixed income and nothing is sold", () => {
    // Targets on 11.5 lakh: 517,500 / 115,000 / 517,500 → only fixed income is short (217,500): all 1.5 lakh goes there.
    // That alone leaves fixed income 5.9 points under, but with ৳10,000 a month for 12 months
    // (2.7 lakh in all, water-filled on 12.7 lakh) every bucket ends within 5 points, so nothing is sold.
    const r = run({ holdings, newMoney: 150_000 });
    const rb = r.rebalance!;
    expect(rb.total).toBe(1_150_000);
    expect(rb.trades).toEqual({ equity: 0, gold: 0, fixedIncome: 150_000 });
    expect(rb.newMoneyOnly).toBe(true);
    expect(r.notes).not.toContain("m6.note.exitCosts");
    // Without a monthly amount the drift is still 5.9 points after the buy → full trades with sales.
    const once = run({ holdings, newMoney: 150_000, monthly: 0 }).rebalance!;
    expect(once.newMoneyOnly).toBe(false);
    expect(once.trades).toEqual({ equity: -32_500, gold: -35_000, fixedIncome: 217_500 });
  });

  it("too little new money and no monthly amount → full target trades with sales", () => {
    const r = run({ holdings, newMoney: 50_000, monthly: 0 });
    const rb = r.rebalance!;
    // Total 10.5 lakh: targets 472,500 / 105,000 / 472,500.
    expect(rb.trades).toEqual({ equity: -77_500, gold: -45_000, fixedIncome: 172_500 });
    expect(rb.newMoneyOnly).toBe(false);
    expect(r.notes).toContain("m6.note.exitCosts");
  });

  it("the next 12 months of the monthly amount count before any sale", () => {
    // 50,000 now + 12 × 10,000 = 1.7 lakh on 11.7 lakh: fixed income ends 4.8 points under → no sales;
    // the 50,000 goes to fixed income now (was: sell 77,500 equity and 45,000 gold).
    const r = run({ holdings, newMoney: 50_000 });
    expect(r.rebalance).toMatchObject({ trades: { equity: 0, gold: 0, fixedIncome: 50_000 }, newMoneyOnly: true });
    expect(r.notes).not.toContain("m6.note.exitCosts");
  });

  it("new money is water-filled across two under-weight buckets", () => {
    // Targets on 13 lakh: 585,000 / 130,000 / 585,000; short: gold 80,000, fixed income 235,000.
    // Level λ: (80,000 − λ) + (235,000 − λ) = 300,000 → λ = 7,500 → gold 72,500, fixed income 227,500
    // (was 100,000 / 200,000 in proportion to the gaps on 10 lakh).
    const r = run({ holdings: { equity: 600_000, gold: 50_000, fixedIncome: 350_000 }, newMoney: 300_000 });
    const rb = r.rebalance!;
    expect(rb.trades).toEqual({ equity: 0, gold: 72_500, fixedIncome: 227_500 });
    expect(rb.newMoneyOnly).toBe(true);
  });

  it("waterFill closes the largest shortfall first and never exceeds the pool", () => {
    const held = { equity: 0, gold: 0, fixedIncome: 0 };
    // Only the largest shortfall until it is down to the next one: 30 all to equity.
    expect(waterFill(held, { equity: 100, gold: 10, fixedIncome: 50 }, 30)).toEqual({ equity: 30, gold: 0, fixedIncome: 0 });
    // (100 − λ) + (50 − λ) = 60 → λ = 45
    expect(waterFill(held, { equity: 100, gold: 10, fixedIncome: 50 }, 60)).toEqual({ equity: 55, gold: 0, fixedIncome: 5 });
    // (100 − λ) + (50 − λ) = 120 → λ = 15
    expect(waterFill(held, { equity: 100, gold: 10, fixedIncome: 50 }, 120)).toEqual({ equity: 85, gold: 0, fixedIncome: 35 });
    expect(waterFill(held, { equity: 100, gold: 10, fixedIncome: 50 }, 0)).toEqual({ equity: 0, gold: 0, fixedIncome: 0 });
  });

  it("on target: no trades, not triggered; with new money every bucket buys at its weight", () => {
    const on = run({ holdings: { equity: 450_000, gold: 100_000, fixedIncome: 450_000 } }).rebalance!;
    expect(on.trades).toEqual({ equity: 0, gold: 0, fixedIncome: 0 });
    expect(on.triggered).toBe(false);
    expect(on.newMoneyOnly).toBe(true);
    const add = run({ holdings: { equity: 450_000, gold: 100_000, fixedIncome: 450_000 }, newMoney: 100_000 }).rebalance!;
    expect(add.trades).toEqual({ equity: 45_000, gold: 10_000, fixedIncome: 45_000 });
  });

  it("drift exactly at the 5-point band does not trigger, and nothing is traded", () => {
    const rb = run({ holdings: { equity: 500_000, gold: 100_000, fixedIncome: 400_000 } }).rebalance!;
    expect(rb.drift.equity).toBe(0.05);
    expect(rb.triggered).toBe(false);
    expect(rb.newMoneyOnly).toBe(true);
    expect(rb.trades).toEqual({ equity: 0, gold: 0, fixedIncome: 0 });
  });

  it("empty holdings: drift 0, buy the target with new money", () => {
    const rb = run({ holdings: { equity: 0, gold: 0, fixedIncome: 0 }, newMoney: 200_000 }).rebalance!;
    expect(rb.drift).toEqual({ equity: 0, gold: 0, fixedIncome: 0 });
    expect(rb.trades).toEqual({ equity: 90_000, gold: 20_000, fixedIncome: 90_000 });
    expect(rb.newMoneyOnly).toBe(true);
  });

  it("no holdings → no rebalance", () => {
    expect(run().rebalance).toBeUndefined();
  });
});

describe("computeAllocation: gates and status", () => {
  const green = withValue(withValue(rates, "inflation_projection", 0.02), "equity_return_low", 0.05);

  it("warns before the result but never goes red", () => {
    const r = run({ gate: { hasEmergencyFund: false, hasCardDebt: true } }, green);
    expect(r.gateWarnings).toEqual(["m6.gate.noEmergencyFund", "m6.gate.cardDebt"]);
    expect(r.status).toBe("amber");
    expect(run({ gate: { hasEmergencyFund: true, hasCardDebt: true } }, green).gateWarnings).toEqual(["m6.gate.cardDebt"]);
    expect(run({}, green).gateWarnings).toEqual([]);
  });

  it("keys come from the contract tuples", () => {
    const r = run({ gate: { hasEmergencyFund: false, hasCardDebt: true }, holdings: { equity: 1, gold: 0, fixedIncome: 0 }, propertyValue: 1, horizonYears: 3 });
    for (const k of r.gateWarnings) expect(M6_GATE_KEYS).toContain(k);
    for (const k of r.notes) expect(M6_NOTE_KEYS).toContain(k);
    for (const c of r.instruments) for (const k of c.howToKeys) expect(M6_HOWTO_KEYS).toContain(k);
    expect(r.notes).toEqual(r.explain.notes);
  });
});

describe("computeAllocation: explanation", () => {
  it("one step per M6_STEP_IDS in order; m6.trade only with holdings", () => {
    expect(run().explain.steps.map((s) => s.id)).toEqual(M6_STEP_IDS.filter((id) => id !== "m6.trade"));
    expect(run({ holdings: { equity: 1, gold: 1, fixedIncome: 1 } }).explain.steps.map((s) => s.id)).toEqual([...M6_STEP_IDS]);
  });

  it("records every rate row it used", () => {
    expect(new Set(run().explain.assumptions.map((a) => a.key))).toEqual(new Set([...ALLOCATION_KEYS, ...PROJECTION_KEYS]));
    expect(new Set(run({ holdings: { equity: 1, gold: 1, fixedIncome: 1 } }).explain.assumptions.map((a) => a.key))).toEqual(
      new Set([...ALLOCATION_KEYS, ...PROJECTION_KEYS, "allocation_drift_band"]),
    );
  });

  it("inputs are numeric and named for the UI formatter (percent / number / money)", () => {
    const steps = run({ holdings: { equity: 1, gold: 1, fixedIncome: 1 }, newMoney: 10 }).explain.steps;
    const byId = Object.fromEntries(steps.map((s) => [s.id, s]));
    expect(Object.keys(byId["m6.score"]!.inputs)).toEqual(["ageBandCount", "incomeCount", "horizonCount", "reactionCount"]);
    expect(Object.keys(byId["m6.equity"]!.inputs)).toEqual(["ageYears", "startShare", "floorShare", "capShare", "ageEquityShare", "horizonYears", "noEquityYears", "cashOnlyYears"]);
    expect(Object.keys(byId["m6.gold"]!.inputs)).toEqual(["chosenShare", "minShare", "maxShare"]);
    expect(Object.keys(byId["m6.fixedIncome"]!.inputs)).toEqual(["equityShare", "goldShare"]);
    for (const id of ["m6.mixLow", "m6.mixBase", "m6.mixHigh"]) {
      expect(Object.keys(byId[id]!.inputs)).toEqual(["equityShare", "goldShare", "fixedIncomeShare", "equityRate", "goldRate", "fixedIncomeRate"]);
    }
    expect(Object.keys(byId["m6.fv"]!.inputs)).toEqual(["monthly", "lumpSum", "mixRate", "monthlyRate", "years", "paidIn"]);
    expect(Object.keys(byId["m6.real"]!.inputs)).toEqual(["fv", "inflation", "years"]);
    expect(Object.keys(byId["m6.trade"]!.inputs)).toEqual([
      "holdingsTotal",
      "newMoney",
      "equityShare",
      "goldShare",
      "fixedIncomeShare",
      "driftBandShare",
      "equityTrade",
      "goldTrade",
      "fixedIncomeTrade",
    ]);
    for (const s of steps) for (const v of Object.values(s.inputs)) expect(typeof v).toBe("number");
    expect(byId["m6.mixBase"]!.rounded).toBeCloseTo(0.0867, 3);
    expect(byId["m6.equity"]!.rounded).toBe(0.45);
  });
});
