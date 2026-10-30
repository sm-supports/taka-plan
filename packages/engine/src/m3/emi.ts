import { EngineError, type Money, type Rate } from "../types";

/** Standard annuity EMI: P·r/(1−(1+r)^−n), r = annual/12. r = 0 → P/n. */
export function emi(_principal: Money, _annualRate: Rate, _months: number): number {
  throw new EngineError("INVALID_INPUT", "not implemented: emi");
}

/** Largest principal an EMI can service: E·(1−(1+r)^−n)/r. r = 0 → E·n. */
export function maxLoan(_emiCapacity: Money, _annualRate: Rate, _months: number): number {
  throw new EngineError("INVALID_INPUT", "not implemented: maxLoan");
}
