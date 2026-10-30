import type { Explanation } from "../explain";
import type { Instrument, Money, Rate, Status } from "../types";

export const GOAL_TYPES = ["general", "education", "health", "wedding", "vehicle", "home", "travel"] as const;
export type GoalType = (typeof GOAL_TYPES)[number];

/** Whole years away a goal may be (validation bounds, not a rate). */
export const GOAL_YEARS_MIN = 1;
export const GOAL_YEARS_MAX = 40;

export interface Goal {
  id: string;
  name: string;
  /** Cost in today's taka. */
  cost: Money;
  /** Whole years away, 1–40. */
  years: number;
  type: GoalType;
}

export interface M5Input {
  goals: Goal[];
  age: number;
}

/** <3 years short, 3–5 medium, >5 long. */
export type Horizon = "short" | "medium" | "long";

/** M6 hook: when present, long-horizon goals use this mix instead of fixed income only. */
export interface Allocation {
  equity: Rate;
  fixedIncome: Rate;
  gold: Rate;
}

export interface GoalResult {
  goalId: string;
  valid: boolean;
  horizon: Horizon;
  /** Inflation applied to this goal type. */
  inflation: Rate;
  futureValue: Money;
  instrument: Instrument;
  candidates: Instrument[];
  nominal: Rate;
  afterTax: Rate;
  /** Fisher real return of the chosen instrument vs the inflation applied to this goal (`inflation`). */
  real: Rate;
  /** Fisher real return vs today's inflation_cpi, for display only. */
  realVsCpi: Rate;
  /** real < 0: the after-tax return does not keep up with the goal's inflation. */
  belowInflation: boolean;
  monthly: { low: Money; base: Money; high: Money };
  months: number;
  status: Status;
  explain: Explanation;
}

export interface M5Result {
  goals: GoalResult[];
  /** Sum of monthly.base over valid goals. */
  totalMonthly: Money;
  /** False until M6 allocation is wired in. */
  usesAllocation: boolean;
}

export const M5_STEP_IDS = ["m5.fv", "m5.rate", "m5.monthly", "m5.real"] as const;
export type M5StepId = (typeof M5_STEP_IDS)[number];

export const M5_NOTE_KEYS = ["m5.note.noAllocationYet", "m5.note.belowInflation"] as const;
