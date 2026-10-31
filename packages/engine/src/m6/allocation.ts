/**
 * M6 Asset allocation (Mix Check). Formulas F1–F5 are in ./types.ts and docs/PRD-allocation.md.
 *
 * Weights are kept in whole thousandths so the three buckets always sum to exactly 1000/1000;
 * money is rounded once at the output with the country's steps (roundingFor).
 */
import { roundingFor } from "../country/overlay";
import { createExplain, type ExplainBuilder } from "../explain";
import { clamp, roundDecimals, roundMoney, type RoundSteps } from "../money";
import { getRate, getRow, type RateKey, type RatesSnapshot } from "../rates";
import { jsonShapeOk, type AllocationProfiles } from "../rates-json";
import type { Allocation } from "../m5/types";
import { EngineError, assertInput, isFiniteNumber, type ISODate, type Instrument, type Money, type Rate, type Status } from "../types";
import {
  ALLOCATION_BUCKETS,
  RISK_PROFILES,
  type AllocationBucket,
  type BucketAmounts,
  type InstrumentCard,
  type M6Input,
  type M6Projection,
  type M6Rebalance,
  type M6Result,
  type M6StepId,
  type ProjectionCase,
  type RiskProfile,
} from "./types";

/**
 * Structural constants from the PRD (shape of the formula, not rates-table rows):
 * - F2 equity starts falling one point a year after this age;
 * - F3 fixed income moves from savings certificates to deposits and bills below this horizon.
 */
const EQUITY_KNEE_AGE = 30;
const SHORT_FIXED_INCOME_YEARS = 3;
const MAX_AGE = 120;
/** Weights are rounded to 3 decimals (whole thousandths). */
const W = 1000;

/** F1 bands: 0–3 careful, 4–5 balanced, 6–8 growth. */
export function riskProfileFor(score: number): RiskProfile {
  if (!Number.isInteger(score) || score < 0 || score > 8) throw new EngineError("INVALID_INPUT", "risk score must be an integer 0–8", { score });
  return score <= 3 ? "careful" : score <= 5 ? "balanced" : "growth";
}

interface Readers {
  num(key: RateKey): number;
  profiles(): AllocationProfiles;
}

function readProfiles(rates: RatesSnapshot, record?: (key: RateKey) => void): AllocationProfiles {
  record?.("allocation_profiles");
  const v = getRow(rates, "allocation_profiles").valueJson;
  if (!jsonShapeOk("allocation_profiles", v)) throw new EngineError("MISSING_RATE", 'Rates row "allocation_profiles" has no valid value', { key: "allocation_profiles" });
  return v as AllocationProfiles;
}

function plainReaders(rates: RatesSnapshot): Readers {
  return { num: (key) => getRate(rates, key), profiles: () => readProfiles(rates) };
}

function explainReaders(ex: ExplainBuilder, rates: RatesSnapshot): Readers {
  return { num: (key) => ex.use(key), profiles: () => readProfiles(rates, (key) => ex.useRow(key)) };
}

interface WeightsBreakdown {
  e0: number;
  emin: number;
  cap: number;
  /** min(E0, max(Emin, E0 − max(0, age − 30))) before the cap. */
  ageEquity: number;
  /** Equity after the cap, unrounded. */
  equity: number;
  capApplied: boolean;
  goldChosen: number;
  goldMin: number;
  goldMax: number;
  /** Clamped gold, unrounded (also never more than 1 − equity). */
  gold: number;
  /** Weights in thousandths; they sum to W. */
  milli: Record<AllocationBucket, number>;
}

function assertAge(age: number): void {
  assertInput(isFiniteNumber(age) && age >= 0 && age <= MAX_AGE, `age must be a number from 0 to ${MAX_AGE}`, { age });
}

function assertProfile(profile: RiskProfile): void {
  assertInput((RISK_PROFILES as readonly string[]).includes(profile), "profile must be careful, balanced or growth", { profile });
}

function weightsBreakdown(age: number, profile: RiskProfile, read: Readers, goldShare: Rate | undefined): WeightsBreakdown {
  const { e0, emin } = read.profiles()[profile];
  const cap = read.num("allocation_equity_cap");
  const ageEquity = Math.min(e0, Math.max(emin, e0 - Math.max(0, age - EQUITY_KNEE_AGE) / 100));
  const equity = Math.min(ageEquity, cap);
  const goldDefault = read.num("allocation_gold_default");
  const goldMin = read.num("allocation_gold_min");
  const goldMax = read.num("allocation_gold_max");
  const goldChosen = goldShare ?? goldDefault;
  const gold = Math.min(clamp(goldChosen, goldMin, goldMax), Math.max(0, 1 - equity));
  const e = Math.round(equity * W);
  const g = Math.min(Math.round(gold * W), W - e);
  return { e0, emin, cap, ageEquity, equity, capApplied: ageEquity > cap, goldChosen, goldMin, goldMax, gold, milli: { equity: e, gold: g, fixedIncome: W - e - g } };
}

function toAllocation(m: Record<AllocationBucket, number>): Allocation {
  return { equity: m.equity / W, gold: m.gold / W, fixedIncome: m.fixedIncome / W };
}

/** Gold that cannot be bought in this country moves to fixed income (no empty bucket). */
function withoutUnavailableGold(milli: Record<AllocationBucket, number>, rates: Pick<RatesSnapshot, "country">): Record<AllocationBucket, number> {
  if (!(rates.country?.unavailable ?? []).includes("gold") || milli.gold === 0) return milli;
  return { equity: milli.equity, gold: 0, fixedIncome: milli.fixedIncome + milli.gold };
}

/**
 * F2 target weights for an age and profile, without the horizon rule (that rule is about one pot of
 * money, not the plan's long-term money). Used by the plan as the M5 / M7 allocation hook.
 */
export function allocationWeights(age: number, profile: RiskProfile, rates: RatesSnapshot, goldShare?: Rate): Allocation {
  assertAge(age);
  assertProfile(profile);
  if (goldShare !== undefined) assertInput(isFiniteNumber(goldShare), "goldShare must be a number", { goldShare });
  return toAllocation(withoutUnavailableGold(weightsBreakdown(age, profile, plainReaders(rates), goldShare).milli, rates));
}

function isRiskAnswer(x: unknown): boolean {
  return x === 0 || x === 1 || x === 2;
}

function isNonNegative(x: unknown): boolean {
  return isFiniteNumber(x) && x >= 0;
}

function validate(input: M6Input): void {
  assertAge(input.age);
  const r = input.risk;
  assertInput(typeof r === "object" && r !== null, "risk answers are required", { risk: r });
  for (const k of ["ageBand", "incomeStability", "horizon", "reaction"] as const) {
    assertInput(isRiskAnswer(r[k]), `risk.${k} must be 0, 1 or 2`, { [k]: r[k] });
  }
  if (input.profileOverride !== undefined) assertProfile(input.profileOverride);
  if (input.goldShare !== undefined) assertInput(isFiniteNumber(input.goldShare), "goldShare must be a number", { goldShare: input.goldShare });
  assertInput(isNonNegative(input.horizonYears), "horizonYears must be zero or more", { horizonYears: input.horizonYears });
  assertInput(isNonNegative(input.lumpSum), "lumpSum must be zero or more", { lumpSum: input.lumpSum });
  assertInput(isNonNegative(input.monthly), "monthly must be zero or more", { monthly: input.monthly });
  if (input.projectionYears !== undefined) assertInput(isNonNegative(input.projectionYears), "projectionYears must be zero or more", { projectionYears: input.projectionYears });
  if (input.holdings !== undefined) {
    for (const b of ALLOCATION_BUCKETS) assertInput(isNonNegative(input.holdings[b]), `holdings.${b} must be zero or more`, { [b]: input.holdings[b] });
  }
  if (input.newMoney !== undefined) assertInput(isNonNegative(input.newMoney), "newMoney must be zero or more", { newMoney: input.newMoney });
  if (input.propertyValue !== undefined) assertInput(isNonNegative(input.propertyValue), "propertyValue must be zero or more", { propertyValue: input.propertyValue });
  assertInput(
    typeof input.gate === "object" && input.gate !== null && typeof input.gate.hasEmergencyFund === "boolean" && typeof input.gate.hasCardDebt === "boolean",
    "gate needs hasEmergencyFund and hasCardDebt",
    { gate: input.gate },
  );
}

/** Split `total` by weights; parts are rounded and fixed income takes the rounding remainder. */
function splitAmount(total: Money, w: Allocation, kind: "lump" | "monthly", steps: RoundSteps): BucketAmounts {
  const rounded = roundMoney(total, kind, steps);
  const equity = roundMoney(total * w.equity, kind, steps);
  const gold = roundMoney(total * w.gold, kind, steps);
  return { equity, gold, fixedIncome: rounded - equity - gold };
}

function instrumentCard(bucket: AllocationBucket, primary: Instrument, alternatives: readonly Instrument[], howToKeys: string[], unavailable: readonly Instrument[]): InstrumentCard {
  const ok = (i: Instrument) => !unavailable.includes(i);
  const alts = alternatives.filter(ok);
  if (ok(primary)) return { bucket, primary, alternatives: alts, howToKeys };
  const [first = null, ...rest] = alts;
  return { bucket, primary: first, alternatives: rest, howToKeys };
}

function instrumentsFor(w: Allocation, horizonRule: M6Result["horizonRule"], horizonYears: number, directShares: boolean, unavailable: readonly Instrument[]): InstrumentCard[] {
  const cards: InstrumentCard[] = [];
  if (w.fixedIncome > 0) {
    const [primary, alts]: [Instrument, Instrument[]] =
      horizonRule === "cashOnly"
        ? ["fdr_1y", ["tbill_91d", "savings_account"]]
        : horizonYears < SHORT_FIXED_INCOME_YEARS
          ? ["fdr_1y", ["tbill_91d"]]
          : ["sanchayapatra_5y", ["tbill_91d", "tbond_5y", "fdr_1y"]];
    cards.push(instrumentCard("fixedIncome", primary, alts, ["m6.howto.fixedIncome"], unavailable));
  }
  if (w.equity > 0) cards.push(instrumentCard("equity", "equity_fund", [], [directShares ? "m6.howto.directShares" : "m6.howto.equityFund"], unavailable));
  if (w.gold > 0) cards.push(instrumentCard("gold", "gold", [], ["m6.howto.gold"], unavailable));
  return cards;
}

/** F5 future value of a monthly amount plus a lump sum at annual rate r over n years. */
export function mixFutureValue(monthly: Money, lumpSum: Money, r: Rate, years: number): number {
  const rm = (1 + r) ** (1 / 12) - 1;
  const months = 12 * years;
  const annuity = Math.abs(rm) < 1e-15 ? monthly * months : (monthly * ((1 + rm) ** months - 1)) / rm;
  return annuity + lumpSum * (1 + r) ** years;
}

const CASES = ["low", "base", "high"] as const;
type Case = (typeof CASES)[number];
const CASE_STEP: Record<Case, M6StepId> = { low: "m6.mixLow", base: "m6.mixBase", high: "m6.mixHigh" };
const RETURN_KEYS: Record<Case, Record<AllocationBucket, RateKey>> = {
  low: { equity: "equity_return_low", gold: "gold_return_low", fixedIncome: "fixed_income_return_low" },
  base: { equity: "equity_return_base", gold: "gold_return_base", fixedIncome: "fixed_income_return_base" },
  high: { equity: "equity_return_high", gold: "gold_return_high", fixedIncome: "fixed_income_return_high" },
};

/**
 * Water-fill: share `pool` across the buckets below their target (`target_b − held_b`) so the largest
 * shortfalls are closed first and the shortfalls left are equal (that keeps the largest drift as small
 * as possible). Σ(target − held) = pool, so the pool never exceeds the positive shortfalls.
 */
export function waterFill(held: BucketAmounts, targets: BucketAmounts, pool: Money): BucketAmounts {
  const out: BucketAmounts = { equity: 0, gold: 0, fixedIncome: 0 };
  if (!(pool > 0)) return out;
  const deficits = ALLOCATION_BUCKETS.map((b) => ({ b, d: targets[b] - held[b] }))
    .filter((x) => x.d > 0)
    .sort((a, b) => b.d - a.d);
  const positive = deficits.reduce((t, x) => t + x.d, 0);
  if (positive <= pool) {
    for (const x of deficits) out[x.b] = x.d;
    return out;
  }
  // Level λ with Σ max(0, d − λ) = pool: try the top k deficits in turn.
  let level = 0;
  let sumTop = 0;
  for (let k = 0; k < deficits.length; k++) {
    sumTop += deficits[k]!.d;
    level = (sumTop - pool) / (k + 1);
    const next = deficits[k + 1]?.d ?? 0;
    if (level >= next) break;
  }
  for (const x of deficits) out[x.b] = Math.max(0, x.d - level);
  return out;
}

/** Largest |weight after the buys − target weight| over the buckets. */
function driftAfter(held: BucketAmounts, buys: BucketAmounts, total: Money, w: Allocation): number {
  if (!(total > 0)) return 0;
  return Math.max(...ALLOCATION_BUCKETS.map((b) => Math.abs((held[b] + buys[b]) / total - w[b])));
}

/** Round each trade and make them sum to the rounded new money (remainder on the largest trade). */
function roundTrades(raw: BucketAmounts, newMoney: Money, steps: RoundSteps): BucketAmounts {
  const out = { equity: roundMoney(raw.equity, "lump", steps), gold: roundMoney(raw.gold, "lump", steps), fixedIncome: roundMoney(raw.fixedIncome, "lump", steps) };
  const diff = roundMoney(newMoney, "lump", steps) - (out.equity + out.gold + out.fixedIncome);
  if (diff !== 0) {
    const largest = ALLOCATION_BUCKETS.reduce((a, b) => (Math.abs(raw[b]) > Math.abs(raw[a]) ? b : a), "fixedIncome" as AllocationBucket);
    out[largest] += diff;
  }
  return out;
}

/** M6 Asset allocation. See the formulas in ./types.ts. */
export function computeAllocation(input: M6Input, rates: RatesSnapshot, today: ISODate): M6Result {
  validate(input);
  const ex = createExplain(rates, today);
  const read = explainReaders(ex, rates);
  const steps = roundingFor(rates);

  // F1 risk score.
  const { ageBand, incomeStability, horizon, reaction } = input.risk;
  const score = ageBand + incomeStability + horizon + reaction;
  const suggestedProfile = riskProfileFor(score);
  ex.step({ id: "m6.score", inputs: { ageBandCount: ageBand, incomeCount: incomeStability, horizonCount: horizon, reactionCount: reaction }, raw: score, rounded: score, unit: "count" });
  const profile = input.profileOverride ?? suggestedProfile;

  // F2 weights and the horizon rule.
  const wb = weightsBreakdown(input.age, profile, read, input.goldShare);
  const noEquityYears = read.num("allocation_no_equity_years");
  const cashOnlyYears = read.num("allocation_cash_only_years");
  const horizonYears = input.horizonYears;
  const horizonRule: M6Result["horizonRule"] = horizonYears < cashOnlyYears ? "cashOnly" : horizonYears < noEquityYears ? "noEquity" : "none";
  const milli = { ...wb.milli };
  if (horizonRule === "cashOnly") {
    milli.equity = 0;
    milli.gold = 0;
    milli.fixedIncome = W;
    ex.note("m6.note.horizonCashOnly");
  } else if (horizonRule === "noEquity") {
    milli.fixedIncome += milli.equity;
    milli.equity = 0;
    ex.note("m6.note.horizonNoEquity");
  } else if (wb.capApplied) {
    ex.note("m6.note.capApplied");
  }
  const unavailableSlots = rates.country?.unavailable ?? [];
  const weights = toAllocation(withoutUnavailableGold(milli, rates));
  const equityRaw = horizonRule === "none" ? wb.equity : 0;
  const goldRaw = horizonRule === "cashOnly" || unavailableSlots.includes("gold") ? 0 : wb.gold;
  ex.step({
    id: "m6.equity",
    inputs: {
      ageYears: input.age,
      startShare: wb.e0,
      floorShare: wb.emin,
      capShare: wb.cap,
      ageEquityShare: wb.ageEquity,
      horizonYears,
      noEquityYears,
      cashOnlyYears,
    },
    raw: equityRaw,
    rounded: weights.equity,
    unit: "rate",
  });
  ex.step({ id: "m6.gold", inputs: { chosenShare: wb.goldChosen, minShare: wb.goldMin, maxShare: wb.goldMax }, raw: goldRaw, rounded: weights.gold, unit: "rate" });
  ex.step({ id: "m6.fixedIncome", inputs: { equityShare: weights.equity, goldShare: weights.gold }, raw: 1 - equityRaw - goldRaw, rounded: weights.fixedIncome, unit: "rate" });

  if ((input.propertyValue ?? 0) > 0) ex.note("m6.note.propertyExcluded");

  const amounts = { lump: splitAmount(input.lumpSum, weights, "lump", steps), monthly: splitAmount(input.monthly, weights, "monthly", steps) };

  // F3 instrument map.
  const instruments = instrumentsFor(weights, horizonRule, horizonYears, input.directShares === true, rates.country?.unavailable ?? []);
  // Bangladesh-specific advice: no index fund is sold there, and savings certificates lose rate if cashed early.
  const isBangladesh = rates.country === undefined || rates.country.code === "BD";
  if (isBangladesh) ex.note("m6.note.noIndexFund");
  if (!unavailableSlots.includes("sanchayapatra_5y")) ex.note("m6.note.neverBreakCertificates");

  // F5 projection.
  const years = input.projectionYears ?? horizonYears;
  const inflation = read.num("inflation_projection");
  const deflator = (1 + inflation) ** years;
  const mix = {} as Record<Case, Rate>;
  for (const c of CASES) {
    const k = RETURN_KEYS[c];
    const r = { equity: read.num(k.equity), gold: read.num(k.gold), fixedIncome: read.num(k.fixedIncome) };
    mix[c] = weights.equity * r.equity + weights.gold * r.gold + weights.fixedIncome * r.fixedIncome;
    ex.step({
      id: CASE_STEP[c],
      inputs: { equityShare: weights.equity, goldShare: weights.gold, fixedIncomeShare: weights.fixedIncome, equityRate: r.equity, goldRate: r.gold, fixedIncomeRate: r.fixedIncome },
      raw: mix[c],
      rounded: roundDecimals(mix[c], 4),
      unit: "rate",
    });
  }
  const paidInRaw = input.lumpSum + input.monthly * 12 * years;
  const paidIn = roundMoney(paidInRaw, "exact", steps);
  const fvRaw = {} as Record<Case, number>;
  const cases = {} as Record<Case, ProjectionCase>;
  for (const c of CASES) {
    fvRaw[c] = mixFutureValue(input.monthly, input.lumpSum, mix[c], years);
    cases[c] = { rate: mix[c], nominal: roundMoney(fvRaw[c], "lump", steps), real: roundMoney(fvRaw[c] / deflator, "lump", steps) };
  }
  ex.step({
    id: "m6.fv",
    inputs: { monthly: input.monthly, lumpSum: input.lumpSum, mixRate: mix.base, monthlyRate: (1 + mix.base) ** (1 / 12) - 1, years, paidIn },
    raw: fvRaw.base,
    rounded: cases.base.nominal,
    unit: "bdt",
  });
  ex.step({ id: "m6.real", inputs: { fv: cases.base.nominal, inflation, years }, raw: fvRaw.base / deflator, rounded: cases.base.real, unit: "bdt" });
  const lowLosesValue = fvRaw.low / deflator < paidInRaw;
  if (lowLosesValue) ex.note("m6.note.lowLosesValue");
  const projection: M6Projection = { years, paidIn, low: cases.low, base: cases.base, high: cases.high, lowLosesValue };

  // F4 rebalance.
  let rebalance: M6Rebalance | undefined;
  if (input.holdings) {
    const v = input.holdings;
    const newMoney = input.newMoney ?? 0;
    const band = read.num("allocation_drift_band");
    const held = v.equity + v.gold + v.fixedIncome;
    const totalRaw = held + newMoney;
    const target = (b: AllocationBucket) => weights[b] * totalRaw - v[b];
    const fullTrades: BucketAmounts = { equity: target("equity"), gold: target("gold"), fixedIncome: target("fixedIncome") };
    const drift = {} as Record<AllocationBucket, Rate>;
    for (const b of ALLOCATION_BUCKETS) drift[b] = held > 0 ? roundDecimals(v[b] / held - weights[b], 6) : 0;
    const triggered = ALLOCATION_BUCKETS.some((b) => Math.abs(drift[b]) > band);

    // Rule order (PRD F4): new money goes to the under-weight buckets first (water-filled against the
    // targets on holdings + new money). Nothing is sold when that leaves every bucket within the drift
    // band, or when the next 12 months of the monthly amount would (new money now, the monthly amount
    // after it, both to the under-weight buckets). Otherwise the full trades, with sales.
    const targetsOn = (total: Money): BucketAmounts => ({ equity: weights.equity * total, gold: weights.gold * total, fixedIncome: weights.fixedIncome * total });
    const EPS = 1e-9;
    const buys = waterFill(v, targetsOn(totalRaw), newMoney);
    const yearPool = newMoney + 12 * input.monthly;
    const yearTotal = held + yearPool;
    const newMoneyOnly =
      driftAfter(v, buys, totalRaw, weights) <= band + EPS || (input.monthly > 0 && driftAfter(v, waterFill(v, targetsOn(yearTotal), yearPool), yearTotal, weights) <= band + EPS);
    const rawTrades = newMoneyOnly ? buys : fullTrades;
    if (!newMoneyOnly) ex.note("m6.note.exitCosts");
    const trades = roundTrades(rawTrades, newMoney, steps);
    const total = roundMoney(totalRaw, "lump", steps);
    ex.step({
      id: "m6.trade",
      inputs: {
        holdingsTotal: held,
        newMoney,
        equityShare: weights.equity,
        goldShare: weights.gold,
        fixedIncomeShare: weights.fixedIncome,
        driftBandShare: band,
        equityTrade: trades.equity,
        goldTrade: trades.gold,
        fixedIncomeTrade: trades.fixedIncome,
      },
      raw: totalRaw,
      rounded: total,
      unit: "bdt",
    });
    rebalance = { total, trades, drift, triggered, newMoneyOnly };
  }

  const gateWarnings: string[] = [];
  if (!input.gate.hasEmergencyFund) gateWarnings.push("m6.gate.noEmergencyFund");
  if (input.gate.hasCardDebt) gateWarnings.push("m6.gate.cardDebt");

  const status: Status = gateWarnings.length > 0 || lowLosesValue ? "amber" : "green";
  const explain = ex.done();

  return {
    score,
    suggestedProfile,
    profile,
    weights,
    horizonRule,
    amounts,
    instruments,
    projection,
    ...(rebalance ? { rebalance } : {}),
    gateWarnings,
    status,
    notes: [...explain.notes],
    explain,
  };
}
