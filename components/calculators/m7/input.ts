/**
 * Pure helpers turning the store's M7 answers into an engine input, the same way the plan does
 * (packages/engine/src/plan/plan.ts profileToPlanInput): working by default, age from the profile,
 * spending defaulting to the profile's essentials and savings to what M1's liquid savings hold above
 * the emergency-fund target (the fund is not retirement money; PlanInput.m7SavingsDefault), and the plan's
 * asset mix (M6) as the before-retirement mix when there is one.
 */
import { computeRetirement, type Allocation, type ISODate, type M7Input, type M7Result, type Money, type RatesSnapshot } from "@taka/engine";
import type { M7State } from "@/lib/store/types";

export interface M7Defaults {
  age: number | null;
  essentials: Money | null;
  liquidSavings: Money | null;
}

function definedOnly<T extends object>(slice: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(slice)) if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  return out;
}

/**
 * Savings M7 starts from when the person has not typed a figure: the liquid savings above the
 * emergency-fund target, as the plan counts them. Without a plan yet, all of the liquid savings.
 */
export function defaultM7Savings(liquidSavings: Money | null, emergencyTarget: Money | undefined): Money | null {
  if (liquidSavings === null) return null;
  return emergencyTarget === undefined ? liquidSavings : Math.max(0, liquidSavings - emergencyTarget);
}

/** The engine input for these answers, or null while the age is unknown. */
export function buildM7Input(m7: M7State, d: M7Defaults, allocation?: Allocation): M7Input | null {
  if (d.age === null || !Number.isFinite(d.age)) return null;
  const input: M7Input = {
    mode: "working",
    age: d.age,
    monthlySpending: d.essentials ?? 0,
    savings: d.liquidSavings ?? 0,
    monthlySaving: 0,
    ...definedOnly(m7),
  };
  if (allocation) input.allocation = allocation;
  return input;
}

/** The same input without any income source: the baseline that shows what the sources save. */
export function withoutSources(input: M7Input): M7Input {
  const { sources: _sources, ...rest } = input;
  return rest;
}

/** The result had the user started `delta` years later (positive) or earlier (negative); null when that age is not valid. */
export function shiftedStart(input: M7Input, delta: number, rates: RatesSnapshot, today: ISODate): M7Result | null {
  const age = input.age + delta;
  if (input.mode !== "working") return null;
  try {
    return computeRetirement({ ...input, age }, rates, today);
  } catch {
    return null;
  }
}

/** Years the "start earlier or later" comparison moves the start by. */
export const START_SHIFT_YEARS = 5;
