/**
 * `?demo=1` fixture for the M7 page: the PRD worked example (aged 30, retiring at 60, spending
 * 40,000 a month) with some savings, a monthly habit and a provident fund, computed by the real
 * engine on the current rates so the demo never drifts from the maths. `?demo=retired` shows the
 * withdrawal plan (1 crore at 60, the PRD's F4 example).
 */
import { computeRetirement, type ISODate, type M7Input, type M7Result, type RatesSnapshot } from "@taka/engine";

export const M7_DEMO_INPUT: M7Input = {
  mode: "working",
  age: 30,
  retirementAge: 60,
  monthlySpending: 40_000,
  savings: 200_000,
  monthlySaving: 10_000,
  sources: {
    providentFund: { balance: 150_000, monthlyContribution: 6_000, rate: 0.09 },
    rentMonthly: 0,
    familySupportMonthly: 5_000,
  },
};

export const M7_DEMO_RETIRED_INPUT: M7Input = {
  mode: "retired",
  age: 60,
  monthlySpending: 40_000,
  savings: 10_000_000,
  monthlySaving: 0,
  otherMonthlyIncome: 0,
  retireeType: "private",
};

export function m7DemoInput(variant: string): M7Input {
  return variant === "retired" ? M7_DEMO_RETIRED_INPUT : M7_DEMO_INPUT;
}

export function m7DemoResult(variant: string, rates: RatesSnapshot, today: ISODate): M7Result {
  return computeRetirement(m7DemoInput(variant), rates, today);
}
