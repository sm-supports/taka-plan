/**
 * `?demo=1` fixture for the M5 page while `computeGoals` is still a stub.
 * Follows the engine contract (docs/ARCHITECTURE-CONTRACTS.md §M5): FV by goal-type inflation,
 * candidates by horizon, base = best after-tax candidate, real return vs inflation_cpi.
 * Every rate comes from the snapshot. Delete once the engine lands.
 */
import {
  afterTax,
  createExplain,
  instrumentKeys,
  realReturn,
  roundDecimals,
  roundMoney,
  type Goal,
  type GoalResult,
  type Horizon,
  type ISODate,
  type Instrument,
  type M5Input,
  type M5Result,
  type RatesSnapshot,
} from "@taka/engine";

export const DEMO_M5_INPUT: M5Input = {
  age: 36,
  goals: [
    { id: "demo-g1", name: "Daughter's university", cost: 1500000, years: 10, type: "education" },
    { id: "demo-g2", name: "Motorbike", cost: 250000, years: 2, type: "vehicle" },
  ],
};

const CANDIDATES: Record<Horizon, Instrument[]> = {
  short: ["fdr_1y", "dps", "tbill_91d"],
  medium: ["sanchayapatra_5y", "tbond_5y"],
  long: ["sanchayapatra_5y", "tbond_10y"],
};

function horizonFor(years: number): Horizon {
  return years < 3 ? "short" : years <= 5 ? "medium" : "long";
}

function sinking(fv: number, annual: number, months: number): number {
  const rm = annual / 12;
  if (rm === 0) return fv / months;
  return (fv * rm) / ((1 + rm) ** months - 1);
}

function demoGoal(g: Goal, s: RatesSnapshot, today: ISODate): GoalResult {
  const x = createExplain(s, today);
  const inflation = g.type === "education" ? x.use("goal_inflation_education") : g.type === "health" ? x.use("goal_inflation_health") : x.use("inflation_projection");
  const horizon = horizonFor(g.years);
  const candidates = CANDIDATES[horizon];
  const months = g.years * 12;

  const fvRaw = g.cost * (1 + inflation) ** g.years;
  const futureValue = x.step({ id: "m5.fv", inputs: { cost: g.cost, inflation, years: g.years }, raw: fvRaw, rounded: roundMoney(fvRaw, "lump"), unit: "bdt" });

  const rated = candidates.map((i) => {
    const { rateKey, taxKey } = instrumentKeys(i);
    const nominal = x.use(rateKey);
    const tax = x.use(taxKey);
    return { i, nominal, tax, net: afterTax(nominal, tax) };
  });
  const best = rated.reduce((a, b) => (b.net > a.net ? b : a));
  const worst = rated.reduce((a, b) => (b.net < a.net ? b : a));
  const afterTaxRate = x.step({ id: "m5.rate", inputs: { instrument: best.i, nominal: best.nominal, tax: best.tax }, raw: best.net, rounded: roundDecimals(best.net, 4), unit: "rate" });

  const baseRaw = sinking(futureValue, best.net, months);
  const base = x.step({ id: "m5.monthly", inputs: { fv: futureValue, monthlyRate: best.net / 12, months }, raw: baseRaw, rounded: roundMoney(baseRaw, "monthly"), unit: "bdt" });
  const low = roundMoney(sinking(futureValue, worst.net, months), "monthly");

  const cpi = x.use("inflation_cpi");
  const realRaw = realReturn(best.net, cpi);
  const real = x.step({ id: "m5.real", inputs: { afterTax: best.net, inflation: cpi }, raw: realRaw, rounded: roundDecimals(realRaw, 4), unit: "rate" });
  const belowInflation = realRaw < 0;
  if (horizon === "long") x.note("m5.note.noAllocationYet");
  if (belowInflation) x.note("m5.note.belowInflation");

  return {
    goalId: g.id,
    valid: true,
    horizon,
    inflation,
    futureValue,
    instrument: best.i,
    candidates,
    nominal: best.nominal,
    afterTax: afterTaxRate,
    real,
    belowInflation,
    monthly: { low, base, high: base },
    months,
    status: belowInflation ? "red" : "green",
    explain: x.done(),
  };
}

export function buildDemoM5Result(input: M5Input, s: RatesSnapshot, today: ISODate): M5Result {
  const goals = input.goals.map((g) => demoGoal(g, s, today));
  return { goals, totalMonthly: goals.filter((g) => g.valid).reduce((a, g) => a + g.monthly.base, 0), usesAllocation: false };
}
