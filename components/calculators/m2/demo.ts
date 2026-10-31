/**
 * `?demo=1` fixture for the M2 page: age 32, partner + one child, ৳60,000 a month take-home,
 * ৳1,00,000 saved, ৳5,00,000 of life cover and ৳1,00,000 of health cover already held, and a
 * savings-type policy (৳30,000 a year for 15 years, 5 paid, ৳5,00,000 cover, ৳6,50,000 at maturity).
 * Computed by the real engine on the current snapshot so the demo never drifts from the maths.
 */
import { computeInsurance, type ISODate, type M2Input, type M2Result, type RatesSnapshot } from "@taka/engine";

export const M2_DEMO_INPUT: M2Input = {
  age: 32,
  dependents: ["partner", "children"],
  takeHome: 60000,
  childrenCount: 1,
  smoker: false,
  liquidSavings: 100000,
  existingLifeCover: 500000,
  debts: 0,
  educationGoals: 0,
  existingHealthCover: 100000,
  healthCovered: ["self", "partner", "child"],
  policy: { annualPremium: 30000, sumAssured: 500000, termYears: 15, yearsPaid: 5, expectedMaturity: 650000 },
};

export function m2DemoResult(rates: RatesSnapshot, today: ISODate): M2Result {
  return computeInsurance(M2_DEMO_INPUT, rates, today);
}
