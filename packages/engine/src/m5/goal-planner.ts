/**
 * M5 Goal planner (MVP: fixed-income instruments only).
 *
 * FV = C × (1 + i)^n, monthly = FV × rm / ((1 + rm)^months − 1).
 * Every rate comes from the snapshot through the explain builder so "Why this number?"
 * lists each assumption; maths stays unrounded until the output boundary.
 */
import { roundingFor } from "../country/overlay";
import { createExplain, type ExplainBuilder } from "../explain";
import { roundDecimals, roundMoney, sum } from "../money";
import { afterTax as applyTax, instrumentNominal, isRateKey, realReturn, type RateKey, type RatesSnapshot } from "../rates";
import { EngineError, assertInput, isFiniteNumber, type ISODate, type Instrument, type Money, type Rate, type Status } from "../types";
import { GOAL_TYPES, GOAL_YEARS_MAX, GOAL_YEARS_MIN, type Allocation, type Goal, type GoalResult, type GoalType, type Horizon, type M5Input, type M5Result } from "./types";

/** C × (1 + i)^n. */
export function futureValue(cost: Money, inflation: Rate, years: number): number {
  assertInput(isFiniteNumber(cost) && isFiniteNumber(inflation) && isFiniteNumber(years), "futureValue needs finite inputs", { cost, inflation, years });
  return cost * (1 + inflation) ** years;
}

/** FV × rm / ((1 + rm)^n − 1), rm = annual/12. rm = 0 → FV / n. months ≤ 0 → INVALID_INPUT. */
export function sinkingFundMonthly(fv: Money, annualAfterTax: Rate, months: number): number {
  assertInput(isFiniteNumber(fv) && isFiniteNumber(annualAfterTax) && isFiniteNumber(months), "sinkingFundMonthly needs finite inputs", { fv, annualAfterTax, months });
  assertInput(months > 0, "sinkingFundMonthly needs months > 0", { months });
  const rm = annualAfterTax / 12;
  if (rm === 0) return fv / months;
  return (fv * rm) / ((1 + rm) ** months - 1);
}

const HORIZON_SHORT_BELOW_YEARS = 3;
const HORIZON_MEDIUM_UP_TO_YEARS = 5;

/** < 3 years short, 3–5 medium (inclusive), > 5 long. */
export function horizonFor(years: number): Horizon {
  assertInput(isFiniteNumber(years), "horizonFor needs a finite number of years", { years });
  if (years < HORIZON_SHORT_BELOW_YEARS) return "short";
  if (years <= HORIZON_MEDIUM_UP_TO_YEARS) return "medium";
  return "long";
}

const SHORT_CANDIDATES: readonly Instrument[] = ["fdr_1y", "dps", "tbill_91d"];
const MEDIUM_CANDIDATES: readonly Instrument[] = ["sanchayapatra_5y", "tbond_5y"];
const LONG_CANDIDATES_MVP: readonly Instrument[] = ["sanchayapatra_5y", "tbond_10y"];

/**
 * Candidate instruments by horizon. `allocation` is the M6 hook: when it is given for a
 * long horizon the caller is expected to price the mix itself (M6), so no fixed-income
 * candidates are returned.
 */
export function instrumentsFor(h: Horizon, allocation?: Allocation): Instrument[] {
  switch (h) {
    case "short":
      return [...SHORT_CANDIDATES];
    case "medium":
      return [...MEDIUM_CANDIDATES];
    case "long":
      // TODO(M6): price the allocation mix (equity_fund / gold / fixed income) instead of returning nothing.
      if (allocation) return [];
      return [...LONG_CANDIDATES_MVP];
  }
}

/** Fallbacks, in order, when a country has none of a horizon's candidates. */
const FALLBACK_CANDIDATES: readonly Instrument[] = ["fdr_1y", "savings_account"];

/**
 * Drops the product slots the snapshot's country does not have (`rates.country.unavailable`).
 * When that empties a non-empty list, the first available fallback (1-year term deposit, then a
 * savings account) is used, so every goal keeps a priced instrument. An empty list stays empty.
 */
export function availableCandidates(list: readonly Instrument[], rates: Pick<RatesSnapshot, "country">): Instrument[] {
  const unavailable = rates.country?.unavailable ?? [];
  if (list.length === 0 || unavailable.length === 0) return [...list];
  const kept = list.filter((i) => !unavailable.includes(i));
  if (kept.length > 0) return kept;
  const fallback = FALLBACK_CANDIDATES.find((i) => !unavailable.includes(i)) ?? "savings_account";
  return [fallback];
}

const GOAL_TYPE_SET: ReadonlySet<string> = new Set(GOAL_TYPES);

export function isGoalType(x: unknown): x is GoalType {
  return typeof x === "string" && GOAL_TYPE_SET.has(x);
}

/** A goal is saved only with a name, a cost and whole years within bounds (PRD episode 5). */
export function isValidGoal(g: Goal): boolean {
  return (
    typeof g.name === "string" &&
    g.name.trim().length > 0 &&
    isFiniteNumber(g.cost) &&
    g.cost > 0 &&
    Number.isInteger(g.years) &&
    g.years >= GOAL_YEARS_MIN &&
    g.years <= GOAL_YEARS_MAX &&
    isGoalType(g.type)
  );
}

/** Zeroed result for a goal that fails validation: red, no explanation, excluded from totals. */
function invalidGoalResult(g: Goal): GoalResult {
  return {
    goalId: g.id,
    valid: false,
    horizon: isFiniteNumber(g.years) ? horizonFor(g.years) : "short",
    inflation: 0,
    futureValue: 0,
    instrument: "dps",
    candidates: [],
    nominal: 0,
    afterTax: 0,
    real: 0,
    realVsCpi: 0,
    belowInflation: false,
    monthly: { low: 0, base: 0, high: 0 },
    months: 0,
    status: "red",
    explain: { steps: [], assumptions: [], notes: [] },
  };
}

/** Inflation row for a goal type: `goal_inflation_<type>` when the snapshot has one, else the projection. */
export function inflationKeyFor(type: GoalType, rates: RatesSnapshot): RateKey {
  const key = `goal_inflation_${type}`;
  return isRateKey(key) && rates.rows[key] !== undefined ? key : "inflation_projection";
}

interface PricedCandidate {
  instrument: Instrument;
  nominal: Rate;
  tax: Rate;
  afterTax: Rate;
}

/** Reads the candidate's rate and tax rows through the builder so both land in the assumptions. */
function priceCandidate(ex: ExplainBuilder, rates: RatesSnapshot, instrument: Instrument): PricedCandidate {
  const { rateKey, taxKey } = instrumentNominal(rates, instrument);
  const nominal = ex.use(rateKey);
  const tax = ex.use(taxKey);
  return { instrument, nominal, tax, afterTax: applyTax(nominal, tax) };
}

/**
 * Plan one valid goal against a candidate list. `candidates` defaults to the horizon's
 * instruments; M6 (or a test) may pass its own. Throws INVALID_INPUT for an invalid goal.
 */
export function computeGoal(goal: Goal, rates: RatesSnapshot, today: ISODate, candidates?: readonly Instrument[]): GoalResult {
  assertInput(isValidGoal(goal), "goal is not valid", { goalId: goal.id });
  const horizon = horizonFor(goal.years);
  const list = availableCandidates(candidates ?? instrumentsFor(horizon), rates);
  const first = list[0];
  if (first === undefined) throw new EngineError("INVALID_INPUT", "no candidate instruments for this goal", { goalId: goal.id, horizon });

  const R = roundingFor(rates);
  const ex = createExplain(rates, today);

  const inflation = ex.use(inflationKeyFor(goal.type, rates));
  const fvRaw = futureValue(goal.cost, inflation, goal.years);
  const fv = ex.step({ id: "m5.fv", inputs: { cost: goal.cost, inflation, years: goal.years }, raw: fvRaw, rounded: roundMoney(fvRaw, "lump", R), unit: "bdt" });
  const months = goal.years * 12;

  // Highest after-tax return wins (ties → first listed); the lowest gives the "low" path.
  let base = priceCandidate(ex, rates, first);
  let low = base;
  for (const instrument of list.slice(1)) {
    const p = priceCandidate(ex, rates, instrument);
    if (p.afterTax > base.afterTax) base = p;
    if (p.afterTax < low.afterTax) low = p;
  }
  ex.step({
    id: "m5.rate",
    inputs: { instrument: base.instrument, nominal: base.nominal, tax: base.tax },
    raw: base.afterTax,
    rounded: roundDecimals(base.afterTax, 3),
    unit: "rate",
  });

  // The sinking fund is sized from the unrounded future value; only the output is rounded.
  const monthlyRaw = sinkingFundMonthly(fvRaw, base.afterTax, months);
  const monthlyBase = ex.step({
    id: "m5.monthly",
    inputs: { fv, monthlyRate: base.afterTax / 12, months },
    raw: monthlyRaw,
    rounded: roundMoney(monthlyRaw, "monthly", R),
    unit: "bdt",
  });
  const monthlyLow = roundMoney(sinkingFundMonthly(fvRaw, low.afterTax, months), "monthly", R);

  // Real return against the inflation this goal is priced with (education/health have their own rows);
  // the CPI comparison is kept for display only.
  const real = realReturn(base.afterTax, inflation);
  ex.step({ id: "m5.real", inputs: { afterTax: base.afterTax, inflation }, raw: real, rounded: roundDecimals(real, 3), unit: "rate" });
  const cpi = ex.use("inflation_cpi");
  const realVsCpi = realReturn(base.afterTax, cpi);

  const belowInflation = real < 0;
  let status: Status = "green";
  if (belowInflation) {
    status = "red";
    ex.note("m5.note.belowInflation");
  } else if (horizon === "long") {
    status = "amber";
  }
  if (horizon === "long") ex.note("m5.note.noAllocationYet");

  return {
    goalId: goal.id,
    valid: true,
    horizon,
    inflation,
    futureValue: fv,
    instrument: base.instrument,
    candidates: [...list],
    nominal: base.nominal,
    afterTax: base.afterTax,
    real,
    realVsCpi,
    belowInflation,
    // No equity in the MVP, so the "high" path equals the expected one.
    monthly: { low: monthlyLow, base: monthlyBase, high: monthlyBase },
    months,
    status,
    explain: ex.done(),
  };
}

export function computeGoals(input: M5Input, rates: RatesSnapshot, today: ISODate): M5Result {
  assertInput(typeof input === "object" && input !== null && Array.isArray(input.goals), "M5Input.goals must be an array");
  const R = roundingFor(rates);
  const goals = input.goals.map((g) => (isValidGoal(g) ? computeGoal(g, rates, today) : invalidGoalResult(g)));
  return {
    goals,
    totalMonthly: roundMoney(sum(goals.filter((g) => g.valid).map((g) => g.monthly.base)), "exact", R),
    usesAllocation: false,
  };
}
