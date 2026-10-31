import type { PlanInput } from "../plan/types";

/**
 * Three PRD user segments. Used by engine tests, the i18n coverage test,
 * the admin preview and the Playwright smoke test.
 * firstJob also answered the asset mix (M6); familyWithDebt the insurance check (M2) and the
 * retirement plan (M7), so the preview exercises every plan bucket's module.
 */
export const SAMPLE_PROFILE_IDS = ["firstJob", "freelancer", "familyWithDebt"] as const;
export type SampleProfileId = (typeof SAMPLE_PROFILE_IDS)[number];

export const SAMPLE_PROFILES: Record<SampleProfileId, PlanInput> = {
  firstJob: {
    profile: { age: 25, incomeType: "salaried", takeHome: 45000, essentials: 28000, dependents: [], hasDebt: false },
    m1: { essentials: 28000, incomeType: "salaried", dependents: [], soleEarner: false, hasHealthInsurance: false, liquidSavings: 20000 },
    m4: { takeHome: 45000, essentials: 28000, incomeType: "salaried", payday: 1 },
    m5: { goals: [{ id: "g-bike", name: "Motorbike", cost: 250000, years: 2, type: "vehicle" }], age: 25 },
    // Under 35, salaried, investing for over 10 years, would wait out a 20% fall: score 7 (growth).
    m6: {
      age: 25,
      risk: { ageBand: 2, incomeStability: 2, horizon: 2, reaction: 1 },
      horizonYears: 20,
      lumpSum: 0,
      monthly: 2000,
      gate: { hasEmergencyFund: false, hasCardDebt: false },
    },
  },
  freelancer: {
    profile: { age: 31, incomeType: "freelance", takeHome: 90000, essentials: 50000, dependents: ["partner"], hasDebt: false },
    m1: { essentials: 50000, incomeType: "freelance", dependents: ["partner"], soleEarner: true, hasHealthInsurance: false, liquidSavings: 150000 },
    m4: { takeHome: 90000, essentials: 50000, incomeType: "freelance", last6Incomes: [60000, 120000, 70000, 110000, 90000, 90000] },
    m5: { goals: [{ id: "g-flat", name: "Flat down payment", cost: 3000000, years: 7, type: "home" }], age: 31 },
  },
  familyWithDebt: {
    profile: { age: 36, incomeType: "salaried", takeHome: 120000, essentials: 75000, dependents: ["partner", "children", "parents"], hasDebt: true },
    m1: { essentials: 75000, incomeType: "salaried", dependents: ["partner", "children", "parents"], soleEarner: false, hasHealthInsurance: false, liquidSavings: 100000 },
    m4: { takeHome: 120000, essentials: 75000, incomeType: "salaried", payday: 5 },
    m3: {
      takeHome: 120000,
      essentials: 75000,
      savingsTarget: 24000,
      loans: [{ id: "l-home", type: "home", outstanding: 2500000, annualRate: 0.12, emi: 25000, monthsLeft: 180 }],
      cards: [{ id: "c-1", balance: 60000, limit: 100000, paysInFull: false }],
    },
    m5: { goals: [{ id: "g-edu", name: "Daughter's university", cost: 1500000, years: 10, type: "education" }], age: 36 },
    // Defaults as profileToPlanInput would build them (debts = M3 balances, education goal cost from M5,
    // liquid savings from M1), plus ৳20 lakh of employer group life cover and no health cover.
    m2: {
      age: 36,
      dependents: ["partner", "children", "parents"],
      takeHome: 120000,
      smoker: false,
      liquidSavings: 100000,
      existingLifeCover: 2000000,
      debts: 2560000,
      educationGoals: 1500000,
      existingHealthCover: 0,
    },
    // Household spending = essentials, savings = M1 liquid savings, plus a provident fund.
    m7: {
      mode: "working",
      age: 36,
      monthlySpending: 75000,
      savings: 100000,
      monthlySaving: 0,
      sources: { providentFund: { balance: 300000, monthlyContribution: 12000, rate: 0.09 } },
    },
    // Savings came from M1's default, so only what sits above the emergency-fund target counts for M7.
    m7SavingsDefault: true,
  },
};
