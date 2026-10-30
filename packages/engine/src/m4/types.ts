import type { Explanation } from "../explain";
import type { IncomeType, Instrument, Money, Rate, Status } from "../types";

export interface M4Input {
  takeHome: Money;
  essentials: Money;
  incomeType: IncomeType;
  /** User-chosen savings rate (share of income). Undefined → suggestion. */
  savingsRate?: Rate;
  /** Day of month the salary lands (1–31). */
  payday?: number;
  /** Freelancers/business: last six monthly incomes, for the average. */
  last6Incomes?: Money[];
}

export interface M4Result {
  /** mean(last6Incomes) when given, else takeHome. */
  averageIncome: Money;
  /** min(savings_rate_default, feasibleRate). */
  suggestedRate: Rate;
  /** max(0, (average − essentials) / average). */
  feasibleRate: Rate;
  /** The rate actually used. */
  savingsRate: Rate;
  savingsAmount: Money;
  /** average − savingsAmount: income − savings = expenses. */
  expensesAllowed: Money;
  /** max(0, essentials − expensesAllowed). */
  essentialsShortfall: Money;
  mode: "fixed" | "percentOfEachPayment";
  /** Set when mode is percentOfEachPayment (freelance/business). */
  percentOfEachPayment?: Rate;
  instrument: Instrument;
  /** Day after payday for the standing transfer; null when payday unknown. */
  transferDay: number | null;
  status: Status;
  explain: Explanation;
}

export const M4_STEP_IDS = ["m4.average", "m4.feasible", "m4.amount", "m4.expenses"] as const;
export type M4StepId = (typeof M4_STEP_IDS)[number];

/** Free-text notes the module may attach (dictionary keys under m4.note.*). */
export const M4_NOTE_KEYS = ["m4.note.instrumentDps"] as const;
export type M4NoteKey = (typeof M4_NOTE_KEYS)[number];
