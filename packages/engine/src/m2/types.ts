/**
 * M2 Insurance & health (Bima Check). The PRD (docs/PRD-insurance.md) stops after the video outline,
 * so these formulas are ours, every default a rates row flagged "our assumption":
 *
 * Life cover (only when someone depends on the income, or debts would pass to the family):
 *   yearsCovered = max(0, min(coverToAge − age, insurance_child_independent_age − youngestChildAge))
 *                  (the child term only when children are dependents and the youngest child's age is known)
 *   ρ            = (1 + fixed_income_return_base) / (1 + inflation_projection) − 1   (real safe return, after tax)
 *   incomeNeed   = takeHome × 12 × incomeShare × (1 − (1 + ρ)^−n) / ρ × (1 + ρ)  (annuity due at ρ; ρ = 0 → × n)
 *   lifeCover    = incomeNeed + debts + educationGoals − liquidSavings − investments
 *   lifeGap      = max(0, lifeCover − existingLifeCover)            (rounded "lump")
 *   m2.note.multipleOutsideBand when lifeCover ÷ yearly take-home falls outside 10–15× (rule of thumb).
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
 * Policy check (an existing savings-type policy, never a recommendation to cancel), r = after-tax
 * 1-year term-deposit rate, n = termYears − yearsPaid (n = 0 → no check, note m2.note.policyMatured):
 *   termPremium  = sumAssured / per × band(age) (mid)
 *   stop paying  = surrenderValue × (1 + r)^n + FV of (annualPremium − termPremium) at the start of each
 *                  of the n years at r                                  (investDifferenceFV)
 *   keep paying  = expectedMaturity
 *   policyIrr    = marginal IRR of (−surrenderValue now, −annualPremium at the start of each of the n
 *                  years, +expectedMaturity after n years); maturity 0 → −100%
 *   No surrender value after premiums were paid → it counts as 0 and the comparison is a lower bound for
 *   stopping (lowerBound, note m2.note.policyNoSurrender).
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
  /** What the insurer pays today if the policy is stopped (surrender or paid-up value). Unknown → the comparison is labelled a lower bound. */
  surrenderValue?: Money;
}

export interface M2Input {
  age: number;
  dependents: Dependent[];
  /** Monthly take-home. */
  takeHome: Money;
  /** Number of children / parents to cover; default 1 child and 2 parents when the dependent is chosen. */
  childrenCount?: number;
  parentsCount?: number;
  /** Age of the youngest child; life cover then runs until that child is self-supporting (or coverToAge, whichever first). */
  youngestChildAge?: number;
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
  /** Value of the stop-paying path: the surrender value grown at the safe after-tax rate plus investing
   * (policy premium − term premium) each remaining year at that rate. */
  investDifferenceFV: Money;
  /** The surrender value part of investDifferenceFV (0 when unknown). */
  surrenderValueFV: Money;
  /** True when the surrender value was unknown after premiums were paid: stopping looks worse than it is. */
  lowerBound: boolean;
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
  "m2.note.policyNoSurrender",
  "m2.note.policyMatured",
  "m2.note.multipleOutsideBand",
  "m2.note.noHealthPriceTable",
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
