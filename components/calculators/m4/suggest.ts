/**
 * Fallback for the suggested savings rate while the engine's computeSaveFirst still throws
 * "not implemented": min(savings_rate_default, feasible), every number read from the rates snapshot.
 * The page prefers result.suggestedRate and only uses this when the engine call fails.
 */
import { getRate, mean, type M4Input, type Rate, type RatesSnapshot } from "@taka/engine";

export type SuggestRateInput = Pick<M4Input, "takeHome" | "essentials" | "last6Incomes">;

export function averageIncomeLocal(input: SuggestRateInput): number {
  const incomes = (input.last6Incomes ?? []).filter((n) => Number.isFinite(n));
  const avg = incomes.length > 0 ? mean(incomes) : 0;
  return avg > 0 ? avg : input.takeHome;
}

export function feasibleRateLocal(input: SuggestRateInput): Rate {
  const avg = averageIncomeLocal(input);
  if (!(avg > 0)) return 0;
  return Math.max(0, (avg - input.essentials) / avg);
}

export function suggestedRateLocal(input: SuggestRateInput, rates: RatesSnapshot): Rate {
  return Math.min(getRate(rates, "savings_rate_default"), feasibleRateLocal(input));
}
