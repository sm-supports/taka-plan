/**
 * M6 Asset allocation (Mix Check, docs/PRD-allocation.md, F1–F5).
 *
 * F1 risk score = Σ four answers (0–2 each): 0–3 careful, 4–5 balanced, 6–8 growth.
 * F2 equity = min(E0, max(Emin, E0 − max(0, age − 30))), never above allocation_equity_cap;
 *    gold = allocation_gold_default (user 5–15%); fixed income = 1 − equity − gold.
 *    Horizon < allocation_no_equity_years → equity 0 (its share moves to fixed income);
 *    horizon < allocation_cash_only_years → 100% fixed income in deposits or bills only.
 * F3 instrument map per bucket from the country's available product slots.
 * F4 trade_b = w_b × (ΣV + N) − V_b; new money goes to under-weight buckets first and sales are only
 *    proposed when new money cannot close the gap; drift > allocation_drift_band triggers it.
 * F5 r_mix = Σ w_b r_b per case; r_m = (1 + r_mix)^(1/12) − 1; FV = M × ((1 + r_m)^(12n) − 1) / r_m
 *    (+ lump × (1 + r_mix)^n), and in today's money ÷ (1 + inflation_projection)^n.
 */
import type { Explanation } from "../explain";
import type { Allocation } from "../m5/types";
import type { Instrument, Money, Rate, Status } from "../types";

export const RISK_PROFILES = ["careful", "balanced", "growth"] as const;
export type RiskProfile = (typeof RISK_PROFILES)[number];

export type RiskAnswer = 0 | 1 | 2;

/** The four F1 questions, each scored 0–2 (higher = more room for risk). */
export interface M6RiskAnswers {
  /** 0: 50+, 1: 35–49, 2: under 35. */
  ageBand: RiskAnswer;
  /** 0: business, 1: freelance, 2: salaried. */
  incomeStability: RiskAnswer;
  /** 0: under 5 years, 1: 5–10 years, 2: over 10 years. */
  horizon: RiskAnswer;
  /** "If your investments fell 20% in a year": 0 sell, 1 wait, 2 buy more. */
  reaction: RiskAnswer;
}

export const ALLOCATION_BUCKETS = ["equity", "gold", "fixedIncome"] as const;
export type AllocationBucket = (typeof ALLOCATION_BUCKETS)[number];
export type BucketAmounts = Record<AllocationBucket, Money>;

export interface M6Input {
  age: number;
  risk: M6RiskAnswers;
  /** User override; never pushes equity above the cap. */
  profileOverride?: RiskProfile;
  /** User gold share, clamped to allocation_gold_min..max. */
  goldShare?: Rate;
  /** Years until the money is needed. */
  horizonYears: number;
  lumpSum: Money;
  monthly: Money;
  /** Projection length; default horizonYears. */
  projectionYears?: number;
  /** "I already invest": current value per bucket (F4). */
  holdings?: BucketAmounts;
  /** New money to add at the rebalance. */
  newMoney?: Money;
  /** Property owned: shown in net worth, never in the split. */
  propertyValue?: Money;
  /** Gate check: emergency fund in place, card debt carried (from M1 and M3). */
  gate: { hasEmergencyFund: boolean; hasCardDebt: boolean };
  /** User opts into direct shares instead of a fund for the equity bucket. */
  directShares?: boolean;
}

export interface InstrumentCard {
  bucket: AllocationBucket;
  /** Default product slot for this bucket in this country; null when none is available. */
  primary: Instrument | null;
  alternatives: Instrument[];
  /** Dictionary keys under m6.howto.* */
  howToKeys: string[];
}

export interface ProjectionCase {
  rate: Rate;
  nominal: Money;
  /** In today's money. */
  real: Money;
}

export interface M6Projection {
  years: number;
  paidIn: Money;
  low: ProjectionCase;
  base: ProjectionCase;
  high: ProjectionCase;
  /** The low case loses buying power (real < paid in). */
  lowLosesValue: boolean;
}

export interface M6Rebalance {
  total: Money;
  /** Positive = buy, negative = sell. */
  trades: BucketAmounts;
  /** Current weight − target weight, per bucket. */
  drift: Record<AllocationBucket, Rate>;
  /** Some bucket drifted beyond allocation_drift_band. */
  triggered: boolean;
  /** New money alone closes the gap (no sales). */
  newMoneyOnly: boolean;
}

export interface M6Result {
  score: number;
  suggestedProfile: RiskProfile;
  profile: RiskProfile;
  /** Target weights; sums to 1. Also the M5/M7 allocation hook. */
  weights: Allocation;
  horizonRule: "none" | "noEquity" | "cashOnly";
  amounts: { lump: BucketAmounts; monthly: BucketAmounts };
  instruments: InstrumentCard[];
  projection: M6Projection;
  rebalance?: M6Rebalance;
  /** Dictionary keys under m6.gate.* to show before the result (the user may still continue). */
  gateWarnings: string[];
  status: Status;
  /** Dictionary keys under m6.note.* */
  notes: string[];
  explain: Explanation;
}

export const M6_STEP_IDS = ["m6.score", "m6.equity", "m6.gold", "m6.fixedIncome", "m6.mixLow", "m6.mixBase", "m6.mixHigh", "m6.fv", "m6.real", "m6.trade"] as const;
export type M6StepId = (typeof M6_STEP_IDS)[number];

export const M6_NOTE_KEYS = [
  "m6.note.capApplied",
  "m6.note.horizonNoEquity",
  "m6.note.horizonCashOnly",
  "m6.note.propertyExcluded",
  "m6.note.lowLosesValue",
  "m6.note.noIndexFund",
  "m6.note.neverBreakCertificates",
  "m6.note.exitCosts",
] as const;

export const M6_GATE_KEYS = ["m6.gate.noEmergencyFund", "m6.gate.cardDebt"] as const;

export const M6_HOWTO_KEYS = ["m6.howto.fixedIncome", "m6.howto.equityFund", "m6.howto.directShares", "m6.howto.gold"] as const;
