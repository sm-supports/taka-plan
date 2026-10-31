/**
 * M7 Retirement & family (Plan to 100, docs/PRD-retirement.md, F1–F4).
 *
 * F1  E_R = 12 × E_0 × (1 + i)^(R − A) − rent at R (inflation-linked income)
 *     Corpus(L) = E_R × (1 − ((1 + i)/(1 + r))^(L − R)) / (r − i);  r = i → E_R × (L − R) / (1 + r)
 *     Gap = Corpus − FV(savings) − FV(PF) − gratuity − PV(fixed pensions as a level annuity)
 *     M = Gap × r_m / ((1 + r_m)^(12(R − A)) − 1) − current monthly saving's share already counted
 *     Always computed for L = plan-to age (default 100) and L = plan_contrast_age (80).
 * F2  Income sources: PF grown at the user's own rate; gratuity = basic × days/daysPerMonth × counted
 *     years (completed years, a part year over six months counts; gratuity_rule's higher days once
 *     service exceeds afterYears, or the employer's days if higher; no rule (null) → the employer's
 *     days alone, note m7.note.noStatutoryGratuity); public pension valued as a level annuity from the
 *     scheme's pensionFromAge P, discounted to R (P > R) or with the payments before R saved at the
 *     accumulation return (P < R); no scheme row (null) → no projection, a known expectedMonthly still
 *     counts; other fixed pensions as a level annuity from R; rent subtracted from spending; old-age
 *     allowance and family support shown, never counted (no allowance rows → nothing shown).
 * F3  Long-horizon bucket follows the M6 age rule (equity −1 point a year after 30).
 * F4  W_1 = Savings × (r − i) / (1 − ((1 + i)/(1 + r))^(L − A)), rising with inflation, for the low /
 *     base / high retirement returns; other monthly income is a fixed amount (level annuity, not
 *     inflation-linked); two-pot rule keeps withdrawal_safe_pot_years of withdrawals in safe instruments.
 * Rounding (PRD): monthly results to the currency's lump step (BDT 500, saving rounded up, withdrawals
 * down) and corpus / gap figures to 200 lump steps (BDT 1 lakh); income values and the chart to the lump step.
 * The year-by-year simulation reaches exactly zero at the plan-to age when the plan is fully funded.
 */
import type { Explanation } from "../explain";
import type { Allocation } from "../m5/types";
import type { Money, Rate, Sex, Status } from "../types";

export type M7Mode = "working" | "retired";
export type RetireeType = "government" | "private";

export interface ProvidentFund {
  balance: Money;
  /** Own plus employer contribution a month. */
  monthlyContribution: Money;
  /** The fund's own yearly rate, asked from the user (never assumed). */
  rate: Rate;
}

export interface Gratuity {
  yearsOfService: number;
  /** Last basic pay a month. */
  basicMonthly: Money;
  /** Employer's own rule in days per year, when higher than the law. */
  employerDaysPerYear?: number;
}

export interface PublicPension {
  /** Monthly contribution to the public / universal scheme. */
  monthlyContribution: Money;
  /** Expected monthly pension at retirement when the user knows it (overrides the projection). */
  expectedMonthly?: Money;
}

export interface M7IncomeSources {
  providentFund?: ProvidentFund;
  gratuity?: Gratuity;
  publicPension?: PublicPension;
  /** Any other pension paid as a fixed amount (not inflation-linked), a month. */
  fixedPensionMonthly?: Money;
  /** Rent received today, a month; assumed to rise with inflation. */
  rentMonthly?: Money;
  /** Shown, never counted. */
  oldAgeAllowanceEligible?: boolean;
  /** Shown, never counted. */
  familySupportMonthly?: Money;
}

export interface M7Input {
  mode: M7Mode;
  age: number;
  sex?: Sex;
  /** Default retirement_age_default (or _government for government employees). */
  retirementAge?: number;
  /** Default plan_to_age (100); clamped to plan_to_age_min..max. */
  planToAge?: number;
  /** Household spending a month, today's money. */
  monthlySpending: Money;
  savings: Money;
  monthlySaving: Money;
  sources?: M7IncomeSources;
  /** Retired users: government retirees can use the pensioner savings product. */
  retireeType?: RetireeType;
  /** Retired users: other monthly income (pension, rent) besides savings. */
  otherMonthlyIncome?: Money;
  /** Before-retirement mix from M6; default retirement_accumulation_return_*. */
  allocation?: Allocation;
}

export interface M7Target {
  planTo: number;
  corpus: Money;
  gap: Money;
  /** Monthly saving needed from now (0 when already funded). */
  monthlySaving: Money;
}

export interface M7IncomeValues {
  providentFundAtRetirement: Money;
  gratuity: Money;
  /** Present value at retirement of fixed pensions (public scheme + other fixed; retired: other monthly income). */
  fixedPensionsValue: Money;
  publicPensionMonthly: Money;
  rentAtRetirementYearly: Money;
  /** Shown only. */
  oldAgeAllowanceMonthly: Money;
  /** Shown only. */
  familySupportMonthly: Money;
}

export interface SimulationPoint {
  age: number;
  /** Balance at the start of that year of age, in money of that year. */
  balance: Money;
}

export interface M7Verdict {
  kind: "onTrack" | "lastsTo" | "runsOut";
  /** Age the money lasts to (plan-to age when on track). */
  age: number;
  status: Status;
}

export interface M7Withdrawal {
  firstYear: Money;
  monthly: Money;
  /** Monthly withdrawal under the low / base / high return cases (never a single number in the UI). */
  monthlyRange?: { low: Money; base: Money; high: Money };
  /** Safe pot = withdrawal_safe_pot_years × first-year withdrawal. */
  safePot: Money;
  /** Age the money runs out at the user's current spending; null when it lasts. */
  runsOutAt: number | null;
  /** Dictionary keys under m7.option.* for the retiree type. */
  options: string[];
}

export interface M7Result {
  mode: M7Mode;
  retirementAge: number;
  planToAge: number;
  yearsToRetire: number;
  spendingAtRetirementYearly: Money;
  /** Always both: the contrast age (80) and the plan-to age (100). */
  targets: { contrast: M7Target; plan: M7Target };
  /** plan.monthlySaving − contrast.monthlySaving: the extra that buys the years past 80. */
  extraMonthlyForLongLife: Money;
  monthlySavingRange: { low: Money; base: Money; high: Money };
  income: M7IncomeValues;
  /** Year-by-year balance at the user's current saving, for the "how long will it last" chart. */
  simulation: SimulationPoint[];
  verdict: M7Verdict;
  withdrawal?: M7Withdrawal;
  /** Monthly saving the plan should reserve (feeds PlanInput.retirement). */
  monthlyNeed: Money;
  status: Status;
  /** Dictionary keys under m7.note.* */
  notes: string[];
  explain: Explanation;
}

export const M7_STEP_IDS = [
  "m7.spendingAtRetirement",
  "m7.corpusContrast",
  "m7.corpusPlan",
  "m7.savingsFv",
  "m7.providentFund",
  "m7.gratuity",
  "m7.fixedPensions",
  "m7.gap",
  "m7.monthly",
  "m7.withdrawal",
  "m7.safePot",
] as const;
export type M7StepId = (typeof M7_STEP_IDS)[number];

export const M7_NOTE_KEYS = [
  "m7.note.planTo100",
  "m7.note.lifeAt60",
  "m7.note.womenLiveLonger",
  "m7.note.familyNotCounted",
  "m7.note.allowanceNotCounted",
  "m7.note.pensionFixed",
  "m7.note.pensionEntryClosed",
  "m7.note.supportRatio",
  "m7.note.lock",
  "m7.note.startEarlier",
  "m7.note.noStatutoryGratuity",
  "m7.note.lowCaseInflation",
] as const;

export const M7_OPTION_KEYS = [
  "m7.option.pensionerCertificate",
  "m7.option.savingsCertificate",
  "m7.option.tbonds",
  "m7.option.depositLadder",
  "m7.option.annuity",
] as const;
