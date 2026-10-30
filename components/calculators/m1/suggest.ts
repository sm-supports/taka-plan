/**
 * Fallback for the months-of-cover suggestion while the engine's `suggestMonths` still throws
 * "not implemented". Same PRD heuristic, every number read from the rates snapshot; the page
 * prefers the engine result and only uses this when the engine call fails.
 */
import { getRate, type M1Input, type RatesSnapshot } from "@taka/engine";

export type SuggestInput = Pick<M1Input, "incomeType" | "dependents" | "soleEarner" | "hasHealthInsurance">;

export function suggestMonthsLocal(input: SuggestInput, rates: RatesSnapshot): number {
  const base = getRate(rates, "emergency_base_months");
  const irregular = input.incomeType === "freelance" || input.incomeType === "business" ? getRate(rates, "emergency_bump_irregular_income") : 0;
  const sole = input.soleEarner && input.dependents.length > 0 ? getRate(rates, "emergency_bump_sole_earner") : 0;
  const noHealth = input.hasHealthInsurance ? 0 : getRate(rates, "emergency_bump_no_health_insurance");
  const min = getRate(rates, "emergency_min_months");
  const max = getRate(rates, "emergency_max_months");
  return Math.min(max, Math.max(min, base + irregular + sole + noHealth));
}

/** Slider bounds for months of cover, from the rates snapshot. */
export function monthsBounds(rates: RatesSnapshot): { min: number; max: number } {
  return { min: getRate(rates, "emergency_min_months"), max: getRate(rates, "emergency_max_months") };
}

export function defaultBuildMonths(rates: RatesSnapshot): number {
  return getRate(rates, "emergency_build_months_default");
}
