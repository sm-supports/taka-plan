/**
 * `?demo=1` (salaried: 50,000 / 30,000 → save 10,000) and `?demo=freelance` (last six months
 * 40/60/30/70/50/50k → average 50,000, 20% of each payment) fixtures for the M4 page: the contract
 * vectors, computed by the real engine on the current rates snapshot.
 */
import { computeSaveFirst, type ISODate, type M4Input, type M4Result, type RatesSnapshot } from "@taka/engine";

export const M4_DEMO_INPUT: M4Input = { takeHome: 50000, essentials: 30000, incomeType: "salaried", payday: 10 };

export const M4_DEMO_INPUT_FREELANCE: M4Input = {
  takeHome: 50000,
  essentials: 30000,
  incomeType: "freelance",
  last6Incomes: [40000, 60000, 30000, 70000, 50000, 50000],
};

export type M4DemoVariant = "salaried" | "freelance";

export function m4DemoInput(variant: M4DemoVariant): M4Input {
  return variant === "freelance" ? M4_DEMO_INPUT_FREELANCE : M4_DEMO_INPUT;
}

export function m4DemoResult(rates: RatesSnapshot, today: ISODate, variant: M4DemoVariant): M4Result {
  return computeSaveFirst(m4DemoInput(variant), rates, today);
}
