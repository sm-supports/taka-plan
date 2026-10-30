/**
 * `?demo=1` fixture for the M3 page: two loans and a carried card, run through the real engine on
 * the current rates snapshot (one red: the carried card; EMI ratio demoted to amber).
 */
import { computeDebtHealth, type ISODate, type M3Input, type M3Result, type RatesSnapshot } from "@taka/engine";

export const DEMO_M3_INPUT: M3Input = {
  takeHome: 70000,
  essentials: 25000,
  savingsTarget: 7000,
  loans: [
    { id: "demo-l1", type: "personal", outstanding: 500000, annualRate: 0.14, emi: 17100, monthsLeft: 36 },
    { id: "demo-l2", type: "car", outstanding: 300000, annualRate: 0.1, emi: 9700, monthsLeft: 36 },
  ],
  cards: [{ id: "demo-c1", balance: 60000, limit: 100000, paysInFull: false }],
};

export function buildDemoM3Result(input: M3Input, s: RatesSnapshot, today: ISODate): M3Result {
  return computeDebtHealth(input, s, today);
}
