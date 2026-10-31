/**
 * M2 Insurance & health (Bima Check). The PRD (docs/PRD-insurance.md) stops after the video outline,
 * so these formulas are ours, every default a rates row flagged "our assumption":
 *
 * Life cover (only when someone depends on the income, or debts would pass to the family):
 *   yearsCovered = max(0, coverToAge − age)
 *   incomeNeed   = PV of (takeHome × 12 × incomeShare) growing at inflation_projection for yearsCovered
 *                  years, discounted at the after-tax 1-year term-deposit rate (growing annuity)
 *   lifeCover    = incomeNeed + debts + educationGoals − liquidSavings − investments
 *   lifeGap      = max(0, lifeCover − existingLifeCover)            (rounded "lump")
 *
 * Health cover (everyone):
 *   perStay      = health_hospitalisation_cost, scaled by max(health_public_cover_floor, oop_health_share)
 *   target       = perStay × Σ health_cover_weights over the people covered
 *   healthGap    = max(0, target − existingHealthCover)               (rounded "lump")
 *
 * Premiums (yearly, low/high, from the country's indicative tables):
 *   life   = lifeGap / per × band(age) × (smoker ? smokerMultiplier : 1)
 *   health = Σ over people: (perPersonCover / per) × band(personAge)
 *   monthlyPremiumNeed = (life.mid + health.mid) / 12                  (rounded "monthly"; feeds the plan)
 *
 * Policy check (an existing savings-type policy, never a recommendation to cancel):
 *   termPremium  = sumAssured / per × band(age) (mid)
 *   investFV     = FV of (annualPremium − termPremium) yearly for remainingYears at the after-tax
 *                  1-year term-deposit rate
 *   policyIrr    = internal rate of return of the premiums against the expected maturity value
 */
import type { Explanation } from "../explain";
import type { Dependent, Money, Rate, Status } from "../types";

export type CoverPerson = "self" | "partner" | "child" | "parent";

export interface ExistingPolicy {
  /** Yearly premium paid on the savings-type (endowment) policy. */
  annualPremium: Money;
  /** Life cover the policy gives. */
  sumAssured: Money;
  /** Full policy term in years. */
  termYears: number;
  /** Years already paid. */
  yearsPaid: number;
  /** Maturity value the insurer illustrates (guaranteed plus expected bonus). */
  expectedMaturity: Money;
}

export interface M2Input {
  age: number;
  dependents: Dependent[];
  /** Monthly take-home. */
  takeHome: Money;
  /** Number of children / parents to cover; default 1 child and 2 parents when the dependent is chosen. */
  childrenCount?: number;
  parentsCount?: number;
  /** Ages used for parents' health premiums; default age + 28. */
  parentAge?: number;
  smoker: boolean;
  /** Life cover runs to this age; default rates row insurance_cover_to_age. */
  coverToAge?: number;
  /** Share of income the family would need; default insurance_income_share. */
  incomeShare?: Rate;
  liquidSavings: Money;
  investments?: Money;
  existingLifeCover: Money;
  /** Outstanding loans and card balances (from M3). */
  debts: Money;
  /** Today's cost of education goals (from M5) the cover should fund. */
  educationGoals: Money;
  /** Total health cover already held (employer or own policy) across the family. */
  existingHealthCover: Money;
  /** People to insure; default self plus the dependents. */
  healthCovered?: CoverPerson[];
  policy?: ExistingPolicy;
}

export interface PremiumRange {
  low: Money;
  high: Money;
}

export interface M2LifeResult {
  /** False when nobody depends on the income and there are no debts. */
  needed: boolean;
  yearsCovered: number;
  incomeNeed: Money;
  cover: Money;
  gap: Money;
  /** cover ÷ yearly take-home, 1 decimal. */
  incomeMultiple: number;
  premiumYearly: PremiumRange;
  status: Status;
}

export interface M2HealthResult {
  people: number;
  perStay: Money;
  target: Money;
  gap: Money;
  premiumYearly: PremiumRange;
  status: Status;
}

export interface M2PolicyCheck {
  remainingYears: number;
  termPremiumYearly: Money;
  /** Value of investing (policy premium − term premium) each year at the safe after-tax rate. */
  investDifferenceFV: Money;
  policyMaturity: Money;
  /** investDifferenceFV − policyMaturity. Positive = term plus investing comes out ahead. */
  difference: Money;
  policyIrr: Rate;
  verdict: "termPlusInvestAhead" | "policyAhead" | "similar";
}

export interface M2ChecklistItem {
  /** Dictionary key under m2.check.* */
  key: (typeof M2_CHECK_KEYS)[number];
  params: Record<string, number | string>;
}

export interface M2Result {
  life: M2LifeResult;
  health: M2HealthResult;
  /** Premium to reserve each month for the gaps (mid of the ranges ÷ 12). Feeds PlanInput.insurance. */
  monthlyPremiumNeed: Money;
  /** True when some health cover is already held (feeds M1's no-health-insurance bump). */
  hasHealthCover: boolean;
  policyCheck?: M2PolicyCheck;
  checklist: M2ChecklistItem[];
  status: Status;
  /** Dictionary keys under m2.note.* */
  notes: string[];
  explain: Explanation;
}

export const M2_STEP_IDS = [
  "m2.years",
  "m2.incomeNeed",
  "m2.lifeCover",
  "m2.lifeGap",
  "m2.perStay",
  "m2.healthTarget",
  "m2.healthGap",
  "m2.lifePremium",
  "m2.healthPremium",
  "m2.monthlyNeed",
  "m2.policyTerm",
  "m2.policyInvest",
  "m2.policyIrr",
] as const;
export type M2StepId = (typeof M2_STEP_IDS)[number];

export const M2_NOTE_KEYS = [
  "m2.note.noDependents",
  "m2.note.debtsOnly",
  "m2.note.publicCoverBroad",
  "m2.note.premiumIndicative",
  "m2.note.noTermSold",
  "m2.note.separateInvesting",
  "m2.note.policyNotAdvice",
] as const;

export const M2_CHECK_KEYS = [
  "m2.check.regulator",
  "m2.check.claimSettlement",
  "m2.check.complaints",
  "m2.check.waitingPeriods",
  "m2.check.exclusions",
  "m2.check.cashlessNetwork",
  "m2.check.honestProposal",
  "m2.check.buyYoung",
  "m2.check.medicalTests",
] as const;
