/**
 * `?demo=1` fixture for the M6 page: the PRD's worked examples (Balanced, age 30, 45 / 10 / 45;
 * ৳10 lakh held as ৳5.5 / ৳1.5 / ৳3 lakh; ৳10,000 a month for 20 years), run through the real
 * engine on the current rates snapshot so the demo never drifts from the maths. Nothing is written.
 */
import { computeAllocation, type ISODate, type M6Input, type M6Result, type RatesSnapshot } from "@taka/engine";

export const M6_DEMO_INPUT: M6Input = {
  age: 30,
  risk: { ageBand: 2, incomeStability: 2, horizon: 1, reaction: 0 },
  horizonYears: 20,
  lumpSum: 1000000,
  monthly: 10000,
  holdings: { equity: 550000, gold: 150000, fixedIncome: 300000 },
  newMoney: 0,
  propertyValue: 0,
  gate: { hasEmergencyFund: true, hasCardDebt: false },
};

export function m6DemoResult(rates: RatesSnapshot, today: ISODate): M6Result {
  return computeAllocation(M6_DEMO_INPUT, rates, today);
}
