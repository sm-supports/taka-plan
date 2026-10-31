/**
 * M5 Goal planner.
 *
 * FV = C × (1 + i)^n, monthly = FV × rm / ((1 + rm)^months − 1).
 * Short and medium goals (and long goals without an M6 allocation) are priced at the best
 * fixed-income candidate after tax. With an allocation (the M6 hook), long goals are priced at the mix:
 *   r_mix = w_fi × r_fi + w_equity × r_equity + w_gold × r_gold
 * base case: the best available fixed-income slot after tax (sanchayapatra_5y, else tbond_10y, else
 * fdr_1y), equity_return_base and gold_return_base (no withholding tax on equity or gold);
 * low / high cases: fixed_income_return_*, equity_return_* and gold_return_*.
 * Every rate comes from the snapshot through the explain builder so "Why this number?"
 * lists each assumption; maths stays unrounded until the output boundary.
 */
import { roundingFor } from "../country/overlay";
import { createExplain, type ExplainBuilder } from "../explain";
import { roundDecimals, roundMoney, sum } from "../money";
import { afterTax as applyTax, instrumentNominal, isRateKey, realReturn, taxedAtSource, type RateKey, type RatesSnapshot } from "../rates";
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
/** Fixed-income slot of the long-horizon mix, in order of preference (the first one sold in the country wins). */
const MIX_FIXED_INCOME_SLOTS: readonly Instrument[] = ["sanchayapatra_5y", "tbond_10y", "fdr_1y"];

/**
 * Candidate instruments by horizon. `allocation` is the M6 hook: a long-horizon goal is then
 * priced at the mix, so the candidates are the mix's slots with a weight above zero (the
 * fixed-income candidates, then equity_fund, then gold).
 */
export function instrumentsFor(h: Horizon, allocation?: Allocation): Instrument[] {
  switch (h) {
    case "short":
      return [...SHORT_CANDIDATES];
    case "medium":
      return [...MEDIUM_CANDIDATES];
    case "long": {
      if (!allocation) return [...LONG_CANDIDATES_MVP];
      const out: Instrument[] = [];
      if (allocation.fixedIncome > 0) out.push(...LONG_CANDIDATES_MVP);
      if (allocation.equity > 0) out.push("equity_fund");
      if (allocation.gold > 0) out.push("gold");
      return out;
    }
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

/** Fixed-income slot the mix uses: sanchayapatra_5y, else tbond_10y, else fdr_1y (skipping slots the country does not sell). */
export function mixFixedIncomeSlot(rates: Pick<RatesSnapshot, "country">): Instrument {
  const unavailable = rates.country?.unavailable ?? [];
  return MIX_FIXED_INCOME_SLOTS.find((i) => !unavailable.includes(i)) ?? "fdr_1y";
}

/**
 * Product slot of the allocation's largest bucket (ties: fixed income, then equity, then gold).
 * What a goal or plan bucket priced at the mix shows as its instrument.
 */
export function dominantSlot(allocation: Allocation, rates: Pick<RatesSnapshot, "country">): Instrument {
  let slot: Instrument = mixFixedIncomeSlot(rates);
  let top = allocation.fixedIncome;
  if (allocation.equity > top) {
    slot = "equity_fund";
    top = allocation.equity;
  }
  if (allocation.gold > top) slot = "gold";
  return slot;
}

function assertAllocation(a: Allocation): void {
  assertInput(typeof a === "object" && a !== null, "allocation must be an object", { allocation: a });
  const parts = [a.equity, a.fixedIncome, a.gold];
  assertInput(parts.every((w) => isFiniteNumber(w) && w >= 0 && w <= 1), "allocation weights must be between 0 and 1", { allocation: a });
  assertInput(Math.abs(parts.reduce((t, w) => t + w, 0) - 1) < 1e-6, "allocation weights must add up to 1", { allocation: a });
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

/**
 * Reads the candidate's rate and tax rows through the builder so both land in the assumptions.
 * Equity and gold are a total return with no withholding tax: their tax row is neither read nor applied.
 */
function priceCandidate(ex: ExplainBuilder, rates: RatesSnapshot, instrument: Instrument): PricedCandidate {
  const { rateKey, taxKey } = instrumentNominal(rates, instrument);
  const nominal = ex.use(rateKey);
  const tax = taxedAtSource(instrument) ? ex.use(taxKey) : 0;
  return { instrument, nominal, tax, afterTax: applyTax(nominal, tax) };
}

/** What the sinking fund is priced at: one instrument, or the M6 mix. */
interface Pricing {
  instrument: Instrument;
  candidates: Instrument[];
  nominal: Rate;
  afterTax: Rate;
  /** After-tax return of the "low" path (the higher monthly saving). */
  low: Rate;
  /** After-tax return of the "high" path (the lower monthly saving). */
  high: Rate;
}

/** Best fixed-income candidate (highest after tax; ties → first listed); the lowest gives the "low" path. */
function priceCandidates(ex: ExplainBuilder, rates: RatesSnapshot, list: readonly Instrument[], first: Instrument): Pricing {
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
  // Fixed income only, so the "high" path equals the expected one.
  return { instrument: base.instrument, candidates: [...list], nominal: base.nominal, afterTax: base.afterTax, low: low.afterTax, high: base.afterTax };
}

/** M6 F5 blended return for the base, low and high cases; every row goes through the builder. */
function priceMix(ex: ExplainBuilder, rates: RatesSnapshot, w: Allocation): Pricing {
  const fi = priceCandidate(ex, rates, mixFixedIncomeSlot(rates));
  const equity = ex.use("equity_return_base");
  const gold = ex.use("gold_return_base");
  const nominal = w.fixedIncome * fi.nominal + w.equity * equity + w.gold * gold;
  const afterTax = w.fixedIncome * fi.afterTax + w.equity * equity + w.gold * gold;
  const lowMix = w.fixedIncome * ex.use("fixed_income_return_low") + w.equity * ex.use("equity_return_low") + w.gold * ex.use("gold_return_low");
  const highMix = w.fixedIncome * ex.use("fixed_income_return_high") + w.equity * ex.use("equity_return_high") + w.gold * ex.use("gold_return_high");
  const instrument = dominantSlot(w, rates);
  ex.step({
    id: "m5.rate",
    inputs: {
      instrument,
      nominal,
      // Only the fixed-income part is taxed at source, so the blended tax is nominal → after tax.
      tax: nominal > 0 ? 1 - afterTax / nominal : 0,
      fixedIncomeShare: w.fixedIncome,
      equityShare: w.equity,
      goldShare: w.gold,
      fixedIncomeRate: fi.afterTax,
      equityRate: equity,
      goldRate: gold,
    },
    raw: afterTax,
    rounded: roundDecimals(afterTax, 3),
    unit: "rate",
  });
  const candidates: Instrument[] = [];
  if (w.fixedIncome > 0) candidates.push(fi.instrument);
  if (w.equity > 0) candidates.push("equity_fund");
  if (w.gold > 0) candidates.push("gold");
  return {
    instrument,
    candidates,
    nominal,
    afterTax,
    // The base case uses today's best fixed-income rate, which can sit outside the generic
    // fixed_income_return_low..high band: keep low ≤ base ≤ high so the range reads the right way.
    low: Math.min(lowMix, afterTax),
    high: Math.max(highMix, afterTax),
  };
}

/**
 * Plan one valid goal against a candidate list. `candidates` defaults to the horizon's
 * instruments; M6 (or a test) may pass its own. With an `allocation` and no explicit candidates,
 * a long-horizon goal is priced at the mix instead. Throws INVALID_INPUT for an invalid goal.
 */
export function computeGoal(goal: Goal, rates: RatesSnapshot, today: ISODate, candidates?: readonly Instrument[], allocation?: Allocation): GoalResult {
  assertInput(isValidGoal(goal), "goal is not valid", { goalId: goal.id });
  if (allocation !== undefined) assertAllocation(allocation);
  const horizon = horizonFor(goal.years);
  const mix = allocation !== undefined && candidates === undefined && horizon === "long" ? allocation : undefined;
  const list = availableCandidates(candidates ?? instrumentsFor(horizon), rates);
  const first = list[0];
  if (!mix && first === undefined) throw new EngineError("INVALID_INPUT", "no candidate instruments for this goal", { goalId: goal.id, horizon });

  const R = roundingFor(rates);
  const ex = createExplain(rates, today);

  const inflation = ex.use(inflationKeyFor(goal.type, rates));
  const fvRaw = futureValue(goal.cost, inflation, goal.years);
  const fv = ex.step({ id: "m5.fv", inputs: { cost: goal.cost, inflation, years: goal.years }, raw: fvRaw, rounded: roundMoney(fvRaw, "lump", R), unit: "bdt" });
  const months = goal.years * 12;

  const priced = mix ? priceMix(ex, rates, mix) : priceCandidates(ex, rates, list, first as Instrument);

  // The sinking fund is sized from the unrounded future value; only the output is rounded.
  const monthlyRaw = sinkingFundMonthly(fvRaw, priced.afterTax, months);
  const monthlyBase = ex.step({
    id: "m5.monthly",
    inputs: { fv, monthlyRate: priced.afterTax / 12, months },
    raw: monthlyRaw,
    rounded: roundMoney(monthlyRaw, "monthly", R),
    unit: "bdt",
  });
  const monthlyLow = roundMoney(sinkingFundMonthly(fvRaw, priced.low, months), "monthly", R);
  const monthlyHigh = priced.high === priced.afterTax ? monthlyBase : roundMoney(sinkingFundMonthly(fvRaw, priced.high, months), "monthly", R);

  // Real return against the inflation this goal is priced with (education/health have their own rows);
  // the CPI comparison is kept for display only.
  const real = realReturn(priced.afterTax, inflation);
  ex.step({ id: "m5.real", inputs: { afterTax: priced.afterTax, inflation }, raw: real, rounded: roundDecimals(real, 3), unit: "rate" });
  const cpi = ex.use("inflation_cpi");
  const realVsCpi = realReturn(priced.afterTax, cpi);

  const belowInflation = real < 0;
  let status: Status = "green";
  if (belowInflation) {
    status = "red";
    ex.note("m5.note.belowInflation");
  } else if (horizon === "long" && !mix) {
    // A long goal held in fixed income only: amber until an allocation is set.
    status = "amber";
  }
  if (horizon === "long" && !mix) ex.note("m5.note.noAllocationYet");

  return {
    goalId: goal.id,
    valid: true,
    horizon,
    inflation,
    futureValue: fv,
    instrument: priced.instrument,
    candidates: priced.candidates,
    nominal: priced.nominal,
    afterTax: priced.afterTax,
    real,
    realVsCpi,
    belowInflation,
    monthly: { low: monthlyLow, base: monthlyBase, high: monthlyHigh },
    months,
    status,
    explain: ex.done(),
  };
}

/**
 * Plans every goal. `allocation` is the M6 hook (the plan passes M6's weights): long-horizon goals
 * are then priced at the mix, and `usesAllocation` is true when at least one valid goal was.
 */
export function computeGoals(input: M5Input, rates: RatesSnapshot, today: ISODate, allocation?: Allocation): M5Result {
  assertInput(typeof input === "object" && input !== null && Array.isArray(input.goals), "M5Input.goals must be an array");
  if (allocation !== undefined) assertAllocation(allocation);
  const goals = input.goals.map((g) => (isValidGoal(g) ? computeGoal(g, rates, today, undefined, allocation) : invalidGoalResult(g)));
  return {
    goals,
    totalMonthly: roundMoney(sum(goals.filter((g) => g.valid).map((g) => g.monthly.base)), "exact", roundingFor(rates)),
    usesAllocation: allocation !== undefined && goals.some((g) => g.valid && g.horizon === "long"),
  };
}
