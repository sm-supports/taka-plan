import { EngineError, type Money } from "../types";
import type { DebtSummary, PayoffPlan } from "./types";

export type PayoffStrategy = "avalanche" | "snowball";

/**
 * Month-by-month simulation. Each debt accrues balance × r/12, pays its minimum,
 * and `extraMonthly` plus freed minimums go to the target debt (highest rate for
 * avalanche, smallest balance for snowball). Stops at `maxMonths`.
 */
export function simulatePayoff(_debts: DebtSummary[], _extraMonthly: Money, _strategy: PayoffStrategy, _maxMonths = 600): PayoffPlan {
  throw new EngineError("INVALID_INPUT", "not implemented: simulatePayoff");
}
