/**
 * Shared primitive types for the Taka Plan calculation engine.
 * This package is pure TypeScript: no React, no DOM, no I/O.
 */

export type Locale = "bn" | "en";

/** Whole taka. The engine never produces paisa. */
export type Money = number;

/** Decimal rate: 0.08 means 8% a year. */
export type Rate = number;

/** Calendar date as "YYYY-MM-DD". */
export type ISODate = string;

export type IncomeType = "salaried" | "freelance" | "business";

export type Dependent = "partner" | "children" | "parents";

/** Traffic-light status. The plan screen shows at most one red at a time. */
export type Status = "red" | "amber" | "green";

/**
 * Instrument types the app can name. Never a product, bank or fund name.
 * `equity_fund` and `gold` are reserved for M6 (asset allocation).
 */
export type Instrument =
  | "savings_account"
  | "fdr_3m"
  | "fdr_1y"
  | "dps"
  | "sanchayapatra_5y"
  | "tbill_91d"
  | "tbond_5y"
  | "tbond_10y"
  | "equity_fund"
  | "gold";

/** The five onboarding answers. */
export interface Profile {
  age: number;
  incomeType: IncomeType;
  /** Monthly take-home; for freelance/business the 6-month average. */
  takeHome: Money;
  /** Monthly essential spending: rent, food, utilities, transport, school fees, support to parents, existing EMIs. */
  essentials: Money;
  dependents: Dependent[];
  /** "Do you have loans or card balances?" from onboarding step 5. */
  hasDebt: boolean;
}

export type EngineErrorCode = "MISSING_RATE" | "INVALID_INPUT";

export class EngineError extends Error {
  readonly code: EngineErrorCode;
  readonly details?: unknown;
  constructor(code: EngineErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "EngineError";
    this.code = code;
    this.details = details;
  }
}

export function isEngineError(e: unknown): e is EngineError {
  return e instanceof EngineError || (typeof e === "object" && e !== null && (e as { name?: string }).name === "EngineError");
}

/** Throws INVALID_INPUT unless `cond` holds. */
export function assertInput(cond: boolean, message: string, details?: unknown): asserts cond {
  if (!cond) throw new EngineError("INVALID_INPUT", message, details);
}

export function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}
