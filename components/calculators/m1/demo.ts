/**
 * `?demo=1` fixture for the M1 page: the PRD/contract vector (essentials 25,000, salaried, partner +
 * children, sole earner, no health insurance, 50,000 saved → 10 months, target 2,50,000, 16,700 a month),
 * computed by the real engine on the current rates snapshot so the demo never drifts from the maths.
 */
import { computeEmergencyFund, type ISODate, type M1Input, type M1Result, type RatesSnapshot } from "@taka/engine";

export const M1_DEMO_INPUT: M1Input = {
  essentials: 25000,
  incomeType: "salaried",
  dependents: ["partner", "children"],
  soleEarner: true,
  hasHealthInsurance: false,
  liquidSavings: 50000,
};

export function m1DemoResult(rates: RatesSnapshot, today: ISODate): M1Result {
  return computeEmergencyFund(M1_DEMO_INPUT, rates, today);
}
