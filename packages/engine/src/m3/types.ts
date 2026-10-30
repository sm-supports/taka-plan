import type { Explanation } from "../explain";
import type { Money, Rate, Status } from "../types";

export type LoanType = "personal" | "home" | "car" | "education" | "other";

export interface Loan {
  id: string;
  type: LoanType;
  outstanding: Money;
  annualRate: Rate;
  emi: Money;
  monthsLeft: number;
}

export interface Card {
  id: string;
  balance: Money;
  limit: Money;
  /** Undefined → rates row credit_card_rate_cap. */
  annualRate?: Rate;
  /** Pays the statement in full inside the grace period. */
  paysInFull: boolean;
}

export interface LoanScenario {
  annualRate: Rate;
  months: number;
}

export interface M3Input {
  takeHome: Money;
  essentials: Money;
  /** The M4 savings amount, reserved before any EMI. */
  savingsTarget: Money;
  /** Undefined → takeHome × cash_buffer_share. */
  cashBuffer?: Money;
  loans: Loan[];
  cards: Card[];
  /** Extra monthly amount thrown at the target debt. Undefined → headroom. */
  extraMonthly?: Money;
  /** "How much could I borrow?" scenario. Undefined → personal_loan_rate_default over 60 months. */
  scenario?: LoanScenario;
}

export type DebtFlagId = "card_carried" | "card_utilisation" | "emi_ratio" | "negative_capacity";

export interface DebtFlag {
  id: DebtFlagId;
  status: Status;
  /** Loan or card id the flag refers to, when specific. */
  ref?: string;
  /** The measured value (ratio, utilisation or balance) behind the flag. */
  value: number;
  /** True when this was red but demoted to amber by the one-red rule. */
  demotedFromRed: boolean;
}

export interface PayoffPlan {
  /** Debt ids in the order they get cleared. */
  order: string[];
  months: number;
  totalInterest: Money;
}

export interface DebtSummary {
  id: string;
  kind: "loan" | "card";
  balance: Money;
  annualRate: Rate;
  minPayment: Money;
}

export interface M3Result {
  totalEmi: Money;
  /** totalEmi / takeHome. */
  emiRatio: number;
  emiCapacity: Money;
  headroom: Money;
  maxAffordableLoan: Money;
  scenario: LoanScenario & { emi: Money };
  flags: DebtFlag[];
  primaryFlag: DebtFlag | null;
  status: Status;
  /** Loans and carried cards above high_interest_debt_threshold. */
  highInterestDebts: DebtSummary[];
  avalanche: PayoffPlan;
  snowball: PayoffPlan;
  /** snowball.totalInterest − avalanche.totalInterest (≥ 0). */
  interestSaved: Money;
  /** Dictionary keys under m3.path.* (tell the family, list loans, stop borrowing, sell, refinance). */
  debtTrapPath: string[];
  explain: Explanation;
}

export const M3_STEP_IDS = ["m3.totalEmi", "m3.emiRatio", "m3.capacity", "m3.maxLoan", "m3.scenarioEmi", "m3.interestSaved"] as const;
export type M3StepId = (typeof M3_STEP_IDS)[number];

export const M3_PATH_KEYS = ["m3.path.listLoans", "m3.path.tellFamily", "m3.path.stopBorrowing", "m3.path.sellUnaffordable", "m3.path.refinanceCheaper"] as const;
