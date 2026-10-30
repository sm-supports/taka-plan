/**
 * Local fixtures for `?demo=1` (salaried: 50,000 / 30,000 → save 10,000) and `?demo=freelance`
 * (last six months 40/60/30/70/50/50k → average 50,000, 20% of each payment). Contract vectors for M4.
 * Lets the page layout be built and verified while computeSaveFirst is still a stub.
 */
import { getRow, toAssumption, type Assumption, type ISODate, type M4Input, type M4Result, type RatesSnapshot } from "@taka/engine";

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
  const assumptions: Assumption[] = [toAssumption(getRow(rates, "savings_rate_default"), today), toAssumption(getRow(rates, "dps_rate"), today)];
  const freelance = variant === "freelance";
  return {
    averageIncome: 50000,
    suggestedRate: 0.2,
    feasibleRate: 0.4,
    savingsRate: 0.2,
    savingsAmount: 10000,
    expensesAllowed: 40000,
    essentialsShortfall: 0,
    mode: freelance ? "percentOfEachPayment" : "fixed",
    ...(freelance ? { percentOfEachPayment: 0.2 } : {}),
    instrument: "dps",
    transferDay: freelance ? null : 11,
    status: "green",
    explain: {
      steps: [
        freelance
          ? { id: "m4.average", inputs: { months: 6, total: 300000 }, raw: 50000, rounded: 50000, unit: "bdt" }
          : { id: "m4.average", inputs: { months: 1, total: 50000 }, raw: 50000, rounded: 50000, unit: "bdt" },
        { id: "m4.feasible", inputs: { average: 50000, essentials: 30000 }, raw: 0.4, rounded: 0.4, unit: "rate" },
        { id: "m4.amount", inputs: { average: 50000, rate: 0.2 }, raw: 10000, rounded: 10000, unit: "bdt" },
        { id: "m4.expenses", inputs: { average: 50000, savings: 10000 }, raw: 40000, rounded: 40000, unit: "bdt" },
      ],
      assumptions,
      notes: [],
    },
  };
}
