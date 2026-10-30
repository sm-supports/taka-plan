/**
 * Local fixture for `?demo=1`: the PRD/contract M1 vector (essentials 25,000, salaried, partner +
 * children, sole earner, no health insurance, 50,000 saved → 10 months, target 2,50,000, 16,700 a month).
 * Lets the page layout be built and verified while computeEmergencyFund is still a stub.
 * Assumptions are real rows from the snapshot so the "Why this number?" sheet renders as it will live.
 */
import { getRow, toAssumption, type Assumption, type ISODate, type M1Input, type M1Result, type RateKey, type RatesSnapshot } from "@taka/engine";

export const M1_DEMO_INPUT: M1Input = {
  essentials: 25000,
  incomeType: "salaried",
  dependents: ["partner", "children"],
  soleEarner: true,
  hasHealthInsurance: false,
  liquidSavings: 50000,
};

const DEMO_ASSUMPTIONS: RateKey[] = [
  "emergency_base_months",
  "emergency_bump_irregular_income",
  "emergency_bump_sole_earner",
  "emergency_bump_no_health_insurance",
  "emergency_min_months",
  "emergency_max_months",
  "emergency_build_months_default",
  "deposit_insurance_limit",
  "emergency_large_buffer_threshold",
];

export function m1DemoResult(rates: RatesSnapshot, today: ISODate): M1Result {
  const assumptions: Assumption[] = DEMO_ASSUMPTIONS.map((k) => toAssumption(getRow(rates, k), today));
  return {
    suggestedMonths: 10,
    months: 10,
    target: 250000,
    saved: 50000,
    gap: 200000,
    monthlySaving: 16700,
    monthsCovered: 2,
    monthsToFull: 12,
    tiers: { savingsAccount: 25000, fdrLadder: 225000, fdrPerSlice: 75000, banksNeeded: 2, sanchayapatraLayer: false },
    status: "amber",
    rules: ["m1.rule.noStocks", "m1.rule.sanchayapatraThirdLayer", "m1.rule.cardBridge", "m1.rule.refill", "m1.rule.notAnEmergency"],
    nextStep: "m1.next.splitBanks",
    explain: {
      steps: [
        { id: "m1.months", inputs: { base: 6, bumpIrregular: 0, bumpSoleEarner: 2, bumpNoHealth: 2, min: 3, max: 15, suggested: 10, source: "suggested" }, raw: 10, rounded: 10, unit: "months" },
        { id: "m1.target", inputs: { essentials: 25000, months: 10 }, raw: 250000, rounded: 250000, unit: "bdt" },
        { id: "m1.gap", inputs: { target: 250000, saved: 50000 }, raw: 200000, rounded: 200000, unit: "bdt" },
        { id: "m1.monthly", inputs: { gap: 200000, buildMonths: 12 }, raw: 200000 / 12, rounded: 16700, unit: "bdt" },
        { id: "m1.covered", inputs: { saved: 50000, essentials: 25000 }, raw: 2, rounded: 2, unit: "months" },
        { id: "m1.tier1", inputs: { essentials: 25000 }, raw: 25000, rounded: 25000, unit: "bdt" },
        { id: "m1.tier2", inputs: { target: 250000, tier1: 25000 }, raw: 225000, rounded: 225000, unit: "bdt" },
        { id: "m1.banks", inputs: { target: 250000, tier2: 225000, limit: 200000 }, raw: 1.25, rounded: 2, unit: "count" },
      ],
      assumptions,
      notes: [],
    },
  };
}
