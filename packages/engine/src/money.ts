import type { Money } from "./types";

/**
 * Rounding happens once, at the output boundary. Internal maths stays unrounded.
 * - lump:     targets, future values, loan principals, corpus → nearest ৳500
 * - monthly:  monthly savings, EMIs, bucket amounts, EMI capacity → nearest ৳100
 * - interest: interest-saved comparisons → nearest ৳100
 * - exact:    sums of user-entered numbers → nearest ৳1
 */
export type RoundKind = "lump" | "monthly" | "exact" | "interest";

const STEP: Record<RoundKind, number> = { lump: 500, monthly: 100, interest: 100, exact: 1 };

/**
 * Rounding steps per kind in local currency units. Pass `roundingFor(rates)` (country/overlay.ts) so
 * other currencies round sensibly; omitted = taka steps.
 */
export type RoundSteps = Record<RoundKind, number>;

export function roundMoney(x: number, kind: RoundKind, steps: RoundSteps = STEP): Money {
  if (!Number.isFinite(x)) return 0;
  const step = steps[kind] > 0 ? steps[kind] : STEP[kind];
  return Math.round(x / step) * step;
}

/**
 * Round UP to the step of `kind`. Used where rounding down would break a promise,
 * e.g. the M1 monthly saving must fill the gap inside the build period.
 */
export function roundMoneyUp(x: number, kind: RoundKind, steps: RoundSteps = STEP): Money {
  if (!Number.isFinite(x)) return 0;
  const step = steps[kind] > 0 ? steps[kind] : STEP[kind];
  return Math.ceil(x / step) * step;
}

export function roundTo(x: number, step: number): number {
  if (!Number.isFinite(x) || step <= 0) return 0;
  return Math.round(x / step) * step;
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

/** 0.08345 → 8.3 (percent with `decimals` places). */
export function pct(rate: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(rate * 100 * f) / f;
}

/** Round a plain number to `decimals` places (for months covered, ratios). */
export function roundDecimals(x: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(x * f) / f;
}

export function sum(xs: readonly number[]): number {
  let t = 0;
  for (const x of xs) t += x;
  return t;
}

export function mean(xs: readonly number[]): number {
  return xs.length === 0 ? 0 : sum(xs) / xs.length;
}
