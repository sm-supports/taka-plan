import { assertInput, isFiniteNumber, type Money, type Rate } from "../types";

/** r/12, validated. Negative or non-finite annual rates are rejected. */
function monthlyRate(annualRate: Rate): number {
  assertInput(isFiniteNumber(annualRate) && annualRate >= 0, "annualRate must be a finite rate ≥ 0", { annualRate });
  return annualRate / 12;
}

function assertMonths(months: number): void {
  assertInput(isFiniteNumber(months) && months > 0, "months must be a finite number > 0", { months });
}

/** Standard annuity EMI: P·r/(1−(1+r)^−n), r = annual/12. r = 0 → P/n. Unrounded. */
export function emi(principal: Money, annualRate: Rate, months: number): number {
  assertInput(isFiniteNumber(principal) && principal >= 0, "principal must be a finite amount ≥ 0", { principal });
  assertMonths(months);
  const rm = monthlyRate(annualRate);
  if (rm === 0) return principal / months;
  return (principal * rm) / (1 - Math.pow(1 + rm, -months));
}

/** Largest principal an EMI can service: E·(1−(1+r)^−n)/r. r = 0 → E·n. Unrounded. */
export function maxLoan(emiCapacity: Money, annualRate: Rate, months: number): number {
  assertInput(isFiniteNumber(emiCapacity) && emiCapacity >= 0, "emiCapacity must be a finite amount ≥ 0", { emiCapacity });
  assertMonths(months);
  const rm = monthlyRate(annualRate);
  if (rm === 0) return emiCapacity * months;
  return (emiCapacity * (1 - Math.pow(1 + rm, -months))) / rm;
}

/** Total interest paid over the life of an annuity loan: EMI × n − P. Unrounded. */
export function totalInterest(principal: Money, annualRate: Rate, months: number): number {
  return emi(principal, annualRate, months) * months - principal;
}
