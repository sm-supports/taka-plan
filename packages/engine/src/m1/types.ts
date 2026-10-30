import type { Explanation } from "../explain";
import type { Dependent, IncomeType, Money, Status } from "../types";

export interface M1Input {
  /** Monthly essential spending. */
  essentials: Money;
  incomeType: IncomeType;
  dependents: Dependent[];
  /** The user is the only earner in the household. */
  soleEarner: boolean;
  hasHealthInsurance: boolean;
  /** Cash and deposits the user can reach within a few days today. */
  liquidSavings: Money;
  /** User-chosen months (slider, 3–15). Undefined → use the suggestion. */
  monthsOverride?: number;
  /** Months over which to build the fund. Undefined → rates row emergency_build_months_default. */
  buildMonths?: number;
}

export interface M1Tiers {
  /** One month of essentials in a same-day savings account. */
  savingsAccount: Money;
  /** The rest, in 3-month FDRs opened one a month. */
  fdrLadder: Money;
  /** Size of each FDR slice (ladder / 3). */
  fdrPerSlice: Money;
  /** Banks needed to stay under the deposit-insurance limit per bank. */
  banksNeeded: number;
  /** Suggest a Sanchayapatra third layer for very large buffers. */
  sanchayapatraLayer: boolean;
}

export interface M1Result {
  suggestedMonths: number;
  /** Months actually used (override or suggestion). */
  months: number;
  target: Money;
  saved: Money;
  gap: Money;
  monthlySaving: Money;
  /** saved / essentials, 1 decimal. */
  monthsCovered: number;
  /** Months until the fund is full at `monthlySaving`; null when already full. */
  monthsToFull: number | null;
  tiers: M1Tiers;
  status: Status;
  /** Dictionary keys under m1.rule.* (no stocks, refill after use, holiday is not an emergency, …). */
  rules: string[];
  /** Dictionary key under m1.next.* with the concrete next step. */
  nextStep: string;
  explain: Explanation;
}

export const M1_STEP_IDS = ["m1.months", "m1.target", "m1.gap", "m1.monthly", "m1.covered", "m1.tier1", "m1.tier2", "m1.banks"] as const;
export type M1StepId = (typeof M1_STEP_IDS)[number];

export const M1_RULE_KEYS = ["m1.rule.noStocks", "m1.rule.sanchayapatraThirdLayer", "m1.rule.cardBridge", "m1.rule.refill", "m1.rule.notAnEmergency"] as const;
export const M1_NEXT_KEYS = ["m1.next.openSavings", "m1.next.fdrLadder", "m1.next.splitBanks", "m1.next.full"] as const;
