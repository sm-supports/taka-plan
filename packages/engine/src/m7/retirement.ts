/**
 * M7 Retirement & family (Plan to 100). Formulas in ./types.ts and docs/PRD-retirement.md (F1, F2, F4).
 *
 * Timing convention (shared by the corpus formula, the withdrawal formula and the simulation):
 * - before retirement, savings grow at the accumulation return `ra` and the monthly saving is paid at
 *   the end of each month at r_m = (1 + ra)^(1/12) − 1;
 * - from the retirement age the pot grows at `r` for a year and that year's spending is taken at the
 *   end of it: E_R in the first retirement year, rising with inflation after that. Fixed pensions are
 *   paid the same way (a level amount at the end of each year).
 * With those conventions Corpus(L) is exactly the pot at R that the simulation spends down to zero at L.
 *
 * Maths stays unrounded; every output is rounded once with the country's steps (roundingFor).
 */
import { createExplain, type ExplainBuilder } from "../explain";
import { clamp, roundMoney, roundMoneyUp, type RoundKind, type RoundSteps } from "../money";
import type { RateKey, RatesSnapshot } from "../rates";
import { jsonShapeOk, type GratuityRule, type OldAgeAllowanceEligibility, type PensionProjection, type PublicPensionScheme } from "../rates-json";
import { roundingFor } from "../country/overlay";
import { EngineError, assertInput, isFiniteNumber, type ISODate, type Instrument, type Money, type Rate } from "../types";
import type { Allocation } from "../m5/types";
import {
  M7_NOTE_KEYS,
  type Gratuity,
  type M7IncomeValues,
  type M7Input,
  type M7Result,
  type M7StepId,
  type M7Target,
  type M7Verdict,
  type M7Withdrawal,
  type ProvidentFund,
  type PublicPension,
  type SimulationPoint,
} from "./types";

/** Validation bounds for ages (not rates). */
export const M7_AGE_MIN = 15;
export const M7_AGE_MAX = 100;

/** |r − i| below this uses the r = i limit of the annuity formulas. */
const EQUAL_RATES_EPS = 1e-9;

/** A simulated balance this far below zero (one currency unit) counts as run out; smaller is float noise. */
const RUN_OUT_TOLERANCE = 1;

// ---------------------------------------------------------------------------------------------
// Pure formulas (exported for tests and the UI's "what if" sliders).
// ---------------------------------------------------------------------------------------------

/** Monthly rate equivalent to a yearly effective rate: (1 + a)^(1/12) − 1. */
export function monthlyRateOf(annual: Rate): Rate {
  return (1 + annual) ** (1 / 12) - 1;
}

/**
 * Pot needed at retirement to pay `firstYear` at the end of each of `years` years, rising with
 * inflation `i`, when the pot earns `r`: E × (1 − ((1+i)/(1+r))^n) / (r − i); r = i → E × n / (1 + r).
 */
export function corpusFor(firstYear: Money, r: Rate, i: Rate, years: number): number {
  if (years <= 0 || firstYear <= 0) return 0;
  if (Math.abs(r - i) < EQUAL_RATES_EPS) return (firstYear * years) / (1 + r);
  return (firstYear * (1 - ((1 + i) / (1 + r)) ** years)) / (r - i);
}

/** F4: first-year withdrawal that lasts `years`, rising with inflation (the inverse of corpusFor). */
export function firstYearWithdrawal(savings: Money, r: Rate, i: Rate, years: number): number {
  if (savings <= 0) return 0;
  if (years <= 0) return savings;
  if (Math.abs(r - i) < EQUAL_RATES_EPS) return (savings * (1 + r)) / years;
  return (savings * (r - i)) / (1 - ((1 + i) / (1 + r)) ** years);
}

/** Present value of a level yearly payment for `years` years at `r` (end of each year). */
export function levelAnnuityValue(yearly: Money, r: Rate, years: number): number {
  if (years <= 0 || yearly <= 0) return 0;
  if (Math.abs(r) < EQUAL_RATES_EPS) return yearly * years;
  return (yearly * (1 - (1 + r) ** -years)) / r;
}

/** Future value of `monthly` paid at the end of each month for `months` months at monthly rate `m`. */
export function annuityFv(monthly: Money, m: Rate, months: number): number {
  if (months <= 0 || monthly <= 0) return 0;
  if (Math.abs(m) < EQUAL_RATES_EPS) return monthly * months;
  return (monthly * ((1 + m) ** months - 1)) / m;
}

/** Monthly saving that grows to `gap` over `months` months at monthly rate `m` (r_m = 0 → gap / months). */
export function sinkingMonthly(gap: Money, m: Rate, months: number): number {
  if (gap <= 0 || months <= 0) return 0;
  if (Math.abs(m) < EQUAL_RATES_EPS) return gap / months;
  return (gap * m) / ((1 + m) ** months - 1);
}

/** Provident fund at retirement: balance × (1 + rate)^n + contribution × annuity over 12n months. */
export function providentFundAt(pf: ProvidentFund, years: number): number {
  const n = Math.max(0, years);
  return pf.balance * (1 + pf.rate) ** n + annuityFv(pf.monthlyContribution, monthlyRateOf(pf.rate), 12 * n);
}

/** Days of last basic pay per year of service: the law's rule, or the employer's if higher. */
export function gratuityDays(g: Pick<Gratuity, "yearsOfService" | "employerDaysPerYear">, rule: GratuityRule): number {
  const after = rule.daysPerYearAfter ?? null;
  const afterYears = rule.afterYears ?? null;
  const law = after !== null && afterYears !== null && g.yearsOfService >= afterYears ? after : rule.daysPerYear;
  return Math.max(law, g.employerDaysPerYear ?? 0);
}

/** Gratuity lump sum: basic / daysPerMonth × days × years of service. */
export function gratuityAmount(g: Gratuity, rule: GratuityRule): number {
  return (g.basicMonthly / rule.daysPerMonth) * gratuityDays(g, rule) * g.yearsOfService;
}

function fvAnnualAnnuityFactor(g: number, n: number): number {
  return Math.abs(g) < EQUAL_RATES_EPS ? n : ((1 + g) ** n - 1) / g;
}

/**
 * Growth rate implied by two official projections (pension per unit of contribution after n1 and n2
 * years): solves FV-annuity(n2)/FV-annuity(n1) = p2/p1 by bisection. Null when no rate in −50%..100% fits.
 */
function impliedGrowth(n1: number, p1: number, n2: number, p2: number): number | null {
  const target = p2 / p1;
  const f = (g: number) => fvAnnualAnnuityFactor(g, n2) / fvAnnualAnnuityFactor(g, n1) - target;
  let lo = -0.5;
  let hi = 1;
  if (f(lo) * f(hi) > 0) return null;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (f(lo) * f(mid) <= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Monthly public pension from the scheme's official projections, scaled by contribution and
 * interpolated by years contributing. With two or more projections the curve between the shortest and
 * the longest one follows the growth rate they imply (so it passes through both exactly); with one it
 * scales in proportion to years. No projections → 0.
 */
export function projectedPension(monthlyContribution: Money, years: number, projections: readonly PensionProjection[] | undefined): number {
  if (monthlyContribution <= 0 || years <= 0) return 0;
  const pts = (projections ?? []).filter((p) => p.monthlyContribution > 0 && p.years > 0).map((p) => ({ years: p.years, perUnit: p.monthlyPension / p.monthlyContribution }));
  pts.sort((a, b) => a.years - b.years);
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (first === undefined || last === undefined) return 0;
  if (pts.length === 1 || last.years === first.years) return monthlyContribution * first.perUnit * (years / first.years);
  const exact = pts.find((p) => p.years === years);
  if (exact) return monthlyContribution * exact.perUnit;
  const g = impliedGrowth(first.years, first.perUnit, last.years, last.perUnit);
  if (g === null) {
    // Projections that no growth rate explains: straight line through the two ends.
    const perUnit = first.perUnit + ((last.perUnit - first.perUnit) * (years - first.years)) / (last.years - first.years);
    return Math.max(0, monthlyContribution * perUnit);
  }
  return monthlyContribution * first.perUnit * (fvAnnualAnnuityFactor(g, years) / fvAnnualAnnuityFactor(g, first.years));
}

// ---------------------------------------------------------------------------------------------
// Validation and rate reading.
// ---------------------------------------------------------------------------------------------

const money = (x: unknown): boolean => isFiniteNumber(x) && x >= 0;

function checkMoney(name: string, x: unknown): void {
  assertInput(money(x), `${name} must be zero or more`, { [name]: x });
}

function checkOptMoney(name: string, x: unknown): void {
  if (x !== undefined) checkMoney(name, x);
}

function validate(input: M7Input): void {
  assertInput(typeof input === "object" && input !== null, "M7Input must be an object");
  assertInput(input.mode === "working" || input.mode === "retired", 'mode must be "working" or "retired"', { mode: input.mode });
  assertInput(Number.isInteger(input.age) && input.age >= M7_AGE_MIN && input.age <= M7_AGE_MAX, `age must be a whole number from ${M7_AGE_MIN} to ${M7_AGE_MAX}`, { age: input.age });
  assertInput(input.sex === undefined || input.sex === "male" || input.sex === "female", 'sex must be "male" or "female"', { sex: input.sex });
  assertInput(input.retireeType === undefined || input.retireeType === "government" || input.retireeType === "private", 'retireeType must be "government" or "private"', {
    retireeType: input.retireeType,
  });
  if (input.retirementAge !== undefined) {
    assertInput(Number.isInteger(input.retirementAge) && input.retirementAge <= M7_AGE_MAX, `retirementAge must be a whole number up to ${M7_AGE_MAX}`, { retirementAge: input.retirementAge });
  }
  if (input.planToAge !== undefined) assertInput(isFiniteNumber(input.planToAge), "planToAge must be a number", { planToAge: input.planToAge });
  checkMoney("monthlySpending", input.monthlySpending);
  checkMoney("savings", input.savings);
  checkMoney("monthlySaving", input.monthlySaving);
  checkOptMoney("otherMonthlyIncome", input.otherMonthlyIncome);

  const s = input.sources;
  if (s !== undefined) {
    assertInput(typeof s === "object" && s !== null, "sources must be an object");
    if (s.providentFund) {
      checkMoney("providentFund.balance", s.providentFund.balance);
      checkMoney("providentFund.monthlyContribution", s.providentFund.monthlyContribution);
      assertInput(isFiniteNumber(s.providentFund.rate) && s.providentFund.rate >= 0 && s.providentFund.rate <= 1, "providentFund.rate must be between 0 and 1", { rate: s.providentFund.rate });
    }
    if (s.gratuity) {
      assertInput(isFiniteNumber(s.gratuity.yearsOfService) && s.gratuity.yearsOfService >= 0 && s.gratuity.yearsOfService <= 80, "gratuity.yearsOfService must be 0 to 80", {
        yearsOfService: s.gratuity.yearsOfService,
      });
      checkMoney("gratuity.basicMonthly", s.gratuity.basicMonthly);
      if (s.gratuity.employerDaysPerYear !== undefined) {
        assertInput(isFiniteNumber(s.gratuity.employerDaysPerYear) && s.gratuity.employerDaysPerYear >= 0 && s.gratuity.employerDaysPerYear <= 366, "gratuity.employerDaysPerYear must be 0 to 366", {
          employerDaysPerYear: s.gratuity.employerDaysPerYear,
        });
      }
    }
    if (s.publicPension) {
      checkMoney("publicPension.monthlyContribution", s.publicPension.monthlyContribution);
      checkOptMoney("publicPension.expectedMonthly", s.publicPension.expectedMonthly);
    }
    checkOptMoney("fixedPensionMonthly", s.fixedPensionMonthly);
    checkOptMoney("rentMonthly", s.rentMonthly);
    checkOptMoney("familySupportMonthly", s.familySupportMonthly);
    assertInput(s.oldAgeAllowanceEligible === undefined || typeof s.oldAgeAllowanceEligible === "boolean", "oldAgeAllowanceEligible must be true or false");
  }

  const a = input.allocation;
  if (a !== undefined) {
    const parts = [a.equity, a.fixedIncome, a.gold];
    assertInput(
      parts.every((w) => isFiniteNumber(w) && w >= 0 && w <= 1),
      "allocation weights must be between 0 and 1",
      { allocation: a },
    );
    assertInput(Math.abs(parts.reduce((t, w) => t + w, 0) - 1) < 1e-6, "allocation weights must add up to 1", { allocation: a });
  }
}

function jsonRow<T>(ex: ExplainBuilder, key: RateKey): T {
  const row = ex.useRow(key);
  if (!jsonShapeOk(key, row.valueJson)) throw new EngineError("MISSING_RATE", `Rates row "${key}" has no usable JSON value`, { key });
  return row.valueJson as T;
}

interface ReturnSet {
  /** Return in retirement (after tax). */
  r: Rate;
  /** Accumulation return before retirement. */
  ra: Rate;
}

const ALLOCATION_KEYS = {
  low: { fixedIncome: "fixed_income_return_low", equity: "equity_return_low", gold: "gold_return_low" },
  base: { fixedIncome: "fixed_income_return_base", equity: "equity_return_base", gold: "gold_return_base" },
  high: { fixedIncome: "fixed_income_return_high", equity: "equity_return_high", gold: "gold_return_high" },
} as const satisfies Record<"low" | "base" | "high", Record<keyof Allocation, RateKey>>;

const RETURN_KEYS = {
  low: { r: "retirement_return_low", ra: "retirement_accumulation_return_low" },
  base: { r: "retirement_return_base", ra: "retirement_accumulation_return_base" },
  high: { r: "retirement_return_high", ra: "retirement_accumulation_return_high" },
} as const satisfies Record<"low" | "base" | "high", Record<keyof ReturnSet, RateKey>>;

function readReturns(ex: ExplainBuilder, level: "low" | "base" | "high", allocation: Allocation | undefined): ReturnSet {
  const r = ex.use(RETURN_KEYS[level].r);
  if (!allocation) return { r, ra: ex.use(RETURN_KEYS[level].ra) };
  const k = ALLOCATION_KEYS[level];
  const ra = allocation.fixedIncome * ex.use(k.fixedIncome) + allocation.equity * ex.use(k.equity) + allocation.gold * ex.use(k.gold);
  return { r, ra };
}

// ---------------------------------------------------------------------------------------------
// Simulation.
// ---------------------------------------------------------------------------------------------

interface SimulationSpec {
  age: number;
  retirementAge: number;
  planToAge: number;
  savings: Money;
  monthlySaving: Money;
  ra: Rate;
  r: Rate;
  i: Rate;
  /** Added to the pot on reaching the retirement age (PF + gratuity). */
  lumpAtRetirement: Money;
  /** Net spending in the first retirement year (already net of inflation-linked income). */
  firstYearSpending: Money;
  /** Level yearly pension income from the retirement age. */
  fixedYearly: Money;
}

interface SimulationRaw {
  /** Unrounded balance at the start of each age, A..L; 0 from the age the money runs out. */
  balances: { age: number; balance: number }[];
  /** First age whose start balance is below zero (the age the money runs out at); null when it lasts. */
  runsOutAt: number | null;
}

function simulate(s: SimulationSpec): SimulationRaw {
  const yearlySaving = annuityFv(s.monthlySaving, monthlyRateOf(s.ra), 12);
  const balances: { age: number; balance: number }[] = [];
  let b = s.savings + (s.age >= s.retirementAge ? s.lumpAtRetirement : 0);
  let runsOutAt: number | null = null;
  balances.push({ age: s.age, balance: b });
  for (let a = s.age; a < s.planToAge; a++) {
    if (runsOutAt !== null) {
      balances.push({ age: a + 1, balance: 0 });
      continue;
    }
    if (a < s.retirementAge) {
      b = b * (1 + s.ra) + yearlySaving;
      if (a + 1 === s.retirementAge) b += s.lumpAtRetirement;
    } else {
      b = b * (1 + s.r) - s.firstYearSpending * (1 + s.i) ** (a - s.retirementAge) + s.fixedYearly;
    }
    if (b < -RUN_OUT_TOLERANCE) {
      runsOutAt = a + 1;
      b = 0;
    }
    balances.push({ age: a + 1, balance: Math.max(0, b) });
  }
  return { balances, runsOutAt };
}

function verdictFor(runsOutAt: number | null, planToAge: number, contrastAge: number): M7Verdict {
  if (runsOutAt === null) return { kind: "onTrack", age: planToAge, status: "green" };
  if (runsOutAt > contrastAge) return { kind: "lastsTo", age: runsOutAt, status: "amber" };
  return { kind: "runsOut", age: runsOutAt, status: "red" };
}

// ---------------------------------------------------------------------------------------------
// Retiree options.
// ---------------------------------------------------------------------------------------------

const OPTION_SLOT: Record<string, Instrument | null> = {
  "m7.option.pensionerCertificate": "sanchayapatra_5y",
  "m7.option.savingsCertificate": "sanchayapatra_5y",
  "m7.option.tbonds": "tbond_5y",
  "m7.option.depositLadder": "fdr_1y",
  "m7.option.annuity": null,
};

/** Safe income options for a retiree, minus product slots the country lacks. */
export function retireeOptions(type: "government" | "private", rates: Pick<RatesSnapshot, "country">): string[] {
  const unavailable = new Set<Instrument>(rates.country?.unavailable ?? []);
  const isBangladesh = rates.country === undefined || rates.country.code === "BD";
  const list =
    type === "government"
      ? ["m7.option.pensionerCertificate", "m7.option.tbonds", "m7.option.annuity"]
      : ["m7.option.savingsCertificate", "m7.option.tbonds", "m7.option.depositLadder", "m7.option.annuity"];
  return list.filter((k) => {
    if (k === "m7.option.pensionerCertificate" && !isBangladesh) return false;
    const slot = OPTION_SLOT[k];
    return slot === null || slot === undefined || !unavailable.has(slot);
  });
}

// ---------------------------------------------------------------------------------------------
// Main.
// ---------------------------------------------------------------------------------------------

function floorTo(x: number, kind: RoundKind, steps: RoundSteps): Money {
  if (!Number.isFinite(x)) return 0;
  const step = steps[kind] > 0 ? steps[kind] : 1;
  return Math.floor(x / step) * step;
}

interface FixedIncomeAtR {
  publicPensionMonthly: number;
  fixedMonthly: number;
}

function publicPensionMonthly(pp: PublicPension | undefined, age: number, retirementAge: number, ex: ExplainBuilder): { monthly: number; entryClosed: boolean } {
  if (!pp) return { monthly: 0, entryClosed: false };
  if (pp.expectedMonthly !== undefined) return { monthly: pp.expectedMonthly, entryClosed: false };
  if (pp.monthlyContribution <= 0) return { monthly: 0, entryClosed: false };
  const scheme = jsonRow<PublicPensionScheme>(ex, "public_pension_scheme");
  const entryMax = scheme.entryAgeMax ?? null;
  if (entryMax !== null && age > entryMax) return { monthly: 0, entryClosed: true };
  const start = Math.max(age, scheme.entryAgeMin ?? age);
  const end = Math.min(retirementAge, scheme.pensionFromAge);
  const years = Math.max(0, end - start);
  return { monthly: projectedPension(pp.monthlyContribution, years, scheme.projections), entryClosed: false };
}

export function computeRetirement(input: M7Input, rates: RatesSnapshot, today: ISODate): M7Result {
  validate(input);
  const ex = createExplain(rates, today);
  const steps = roundingFor(rates);
  const round = (x: number, kind: RoundKind) => roundMoney(x, kind, steps);
  const step = (id: M7StepId, inputs: Record<string, number | string>, raw: number, rounded: number) => ex.step({ id, inputs, raw, rounded, unit: "bdt" });

  const A = input.age;
  const working = input.mode === "working";
  const sources = input.sources ?? {};

  // Plan-to age: default plan_to_age, clamped to the slider range; a retiree is always planned past today.
  const planMin = ex.use("plan_to_age_min");
  const planMax = ex.use("plan_to_age_max");
  const planRaw = input.planToAge ?? ex.use("plan_to_age");
  let L = Math.round(clamp(planRaw, planMin, planMax));
  if (!working && L <= A) L = A + 1;
  const contrastAge = ex.use("plan_contrast_age");

  // Retirement age.
  let R = A;
  if (working) {
    R = input.retirementAge ?? ex.use(input.retireeType === "government" ? "retirement_age_government" : "retirement_age_default");
    assertInput(R > A, "retirementAge must be later than age", { age: A, retirementAge: R });
    assertInput(R < L, "retirementAge must be earlier than the plan-to age", { retirementAge: R, planToAge: L });
  }
  const n = R - A;

  const i = ex.use("inflation_projection");
  const base = working ? readReturns(ex, "base", input.allocation) : { r: ex.use("retirement_return_base"), ra: 0 };
  const yearsContrast = Math.max(0, contrastAge - R);
  const yearsPlan = L - R;

  // ---- Shown-only income: old-age allowance and family support. ----
  let allowanceMonthly = 0;
  if (sources.oldAgeAllowanceEligible === true && input.retireeType !== "government") {
    const elig = jsonRow<OldAgeAllowanceEligibility>(ex, "old_age_allowance_eligibility");
    const monthly = ex.use("old_age_allowance_monthly");
    // Eligible from menAge / womenAge (sex unknown → the later men's age); shown if the plan reaches it.
    const fromAge = input.sex === "female" ? elig.womenAge : elig.menAge;
    if (fromAge <= L) allowanceMonthly = A > 90 && elig.over90Monthly ? elig.over90Monthly : monthly;
  }
  const familyMonthly = sources.familySupportMonthly ?? 0;

  const notes = new Set<string>(["m7.note.planTo100", "m7.note.lifeAt60", "m7.note.lock", "m7.note.supportRatio", "m7.note.familyNotCounted"]);
  ex.useRow("life_table_remaining");
  ex.useRow("support_ratio");
  if (input.sex !== "male") notes.add("m7.note.womenLiveLonger");
  if (allowanceMonthly > 0) notes.add("m7.note.allowanceNotCounted");

  let result: Omit<M7Result, "notes" | "explain">;

  if (working) {
    // ---- F1: spending at retirement, net of inflation-linked rent. ----
    const growth = (1 + i) ** n;
    const rentAtR = (sources.rentMonthly ?? 0) * 12 * growth;
    const grossAtR = 12 * input.monthlySpending * growth;
    const eR = Math.max(0, grossAtR - rentAtR);
    const spendingAtRetirementYearly = step(
      "m7.spendingAtRetirement",
      { monthlySpending: input.monthlySpending, inflation: i, retireInYears: n, rentMonthly: sources.rentMonthly ?? 0, rentAtRetirement: round(rentAtR, "lump") },
      eR,
      round(eR, "lump"),
    );

    const corpusC = corpusFor(eR, base.r, i, yearsContrast);
    const corpusP = corpusFor(eR, base.r, i, yearsPlan);
    step("m7.corpusContrast", { spendingAtRetirement: spendingAtRetirementYearly, returnRate: base.r, inflation: i, retiredForYears: yearsContrast }, corpusC, round(corpusC, "lump"));
    step("m7.corpusPlan", { spendingAtRetirement: spendingAtRetirementYearly, returnRate: base.r, inflation: i, retiredForYears: yearsPlan }, corpusP, round(corpusP, "lump"));

    // ---- F2: income sources at retirement. ----
    const fvSavingsAt = (ra: Rate) => input.savings * (1 + ra) ** n;
    const fvSavings = fvSavingsAt(base.ra);
    step("m7.savingsFv", { savings: input.savings, accumulationRate: base.ra, retireInYears: n }, fvSavings, round(fvSavings, "lump"));

    const pf = sources.providentFund;
    const pfAtR = pf ? providentFundAt(pf, n) : 0;
    step(
      "m7.providentFund",
      { balance: pf?.balance ?? 0, monthlyContribution: pf?.monthlyContribution ?? 0, fundRate: pf?.rate ?? 0, retireInYears: n },
      pfAtR,
      round(pfAtR, "lump"),
    );

    const g = sources.gratuity;
    let gratuity = 0;
    if (g) {
      const rule = jsonRow<GratuityRule>(ex, "gratuity_rule");
      const days = gratuityDays(g, rule);
      gratuity = gratuityAmount(g, rule);
      step("m7.gratuity", { basicMonthly: g.basicMonthly, daysPerMonthCount: rule.daysPerMonth, daysCount: days, serviceYears: g.yearsOfService }, gratuity, round(gratuity, "lump"));
    } else {
      step("m7.gratuity", { basicMonthly: 0, daysPerMonthCount: 0, daysCount: 0, serviceYears: 0 }, 0, 0);
    }

    const pp = publicPensionMonthly(sources.publicPension, A, R, ex);
    if (pp.entryClosed) notes.add("m7.note.pensionEntryClosed");
    const fixed: FixedIncomeAtR = { publicPensionMonthly: pp.monthly, fixedMonthly: sources.fixedPensionMonthly ?? 0 };
    const fixedYearly = 12 * (fixed.publicPensionMonthly + fixed.fixedMonthly);
    if (fixedYearly > 0) notes.add("m7.note.pensionFixed");
    const fixedValueAt = (r: Rate, years: number) => levelAnnuityValue(fixedYearly, r, years);
    const fixedP = fixedValueAt(base.r, yearsPlan);
    step(
      "m7.fixedPensions",
      { publicPensionMonthly: round(fixed.publicPensionMonthly, "monthly"), fixedPensionMonthly: fixed.fixedMonthly, returnRate: base.r, retiredForYears: yearsPlan },
      fixedP,
      round(fixedP, "lump"),
    );

    const months = 12 * n;
    const target = (years: number, rs: ReturnSet): { corpus: number; gap: number; monthly: number } => {
      const corpus = corpusFor(eR, rs.r, i, years);
      const fv = fvSavingsAt(rs.ra);
      const fixedValue = fixedValueAt(rs.r, years);
      const gap = Math.max(0, corpus - fv - pfAtR - gratuity - fixedValue);
      return { corpus, gap, monthly: sinkingMonthly(gap, monthlyRateOf(rs.ra), months) };
    };
    const tC = target(yearsContrast, base);
    const tP = target(yearsPlan, base);

    step("m7.gap", { corpus: round(tP.corpus, "lump"), savingsFv: round(fvSavings, "lump"), providentFund: round(pfAtR, "lump"), gratuity: round(gratuity, "lump"), fixedPensions: round(fixedP, "lump") }, tP.gap, round(tP.gap, "lump"));
    // Rounded UP so saving the shown amount fully funds the plan (same rule as M1's monthly saving).
    const planMonthly = step("m7.monthly", { gap: round(tP.gap, "lump"), monthlyRate: monthlyRateOf(base.ra), savingMonths: months }, tP.monthly, roundMoneyUp(tP.monthly, "monthly", steps));

    const toTarget = (planTo: number, t: { corpus: number; gap: number; monthly: number }): M7Target => ({
      planTo,
      corpus: round(t.corpus, "lump"),
      gap: round(t.gap, "lump"),
      monthlySaving: roundMoneyUp(t.monthly, "monthly", steps),
    });
    const contrast = toTarget(contrastAge, tC);
    const plan = { ...toTarget(L, tP), monthlySaving: planMonthly };

    // Low = pessimistic rates (higher saving), high = optimistic rates (lower saving), both to the plan-to age.
    const low = target(yearsPlan, readReturns(ex, "low", input.allocation));
    const high = target(yearsPlan, readReturns(ex, "high", input.allocation));

    const sim = simulate({
      age: A,
      retirementAge: R,
      planToAge: L,
      savings: input.savings,
      monthlySaving: input.monthlySaving,
      ra: base.ra,
      r: base.r,
      i,
      lumpAtRetirement: pfAtR + gratuity,
      firstYearSpending: eR,
      fixedYearly,
    });
    const verdict = verdictFor(sim.runsOutAt, L, contrastAge);
    notes.add("m7.note.startEarlier");

    const income: M7IncomeValues = {
      providentFundAtRetirement: round(pfAtR, "lump"),
      gratuity: round(gratuity, "lump"),
      fixedPensionsValue: round(fixedP, "lump"),
      publicPensionMonthly: round(fixed.publicPensionMonthly, "monthly"),
      rentAtRetirementYearly: round(rentAtR, "lump"),
      oldAgeAllowanceMonthly: round(allowanceMonthly, "exact"),
      familySupportMonthly: round(familyMonthly, "exact"),
    };

    result = {
      mode: "working",
      retirementAge: R,
      planToAge: L,
      yearsToRetire: n,
      spendingAtRetirementYearly,
      targets: { contrast, plan },
      extraMonthlyForLongLife: Math.max(0, plan.monthlySaving - contrast.monthlySaving),
      monthlySavingRange: { low: roundMoneyUp(low.monthly, "monthly", steps), base: plan.monthlySaving, high: roundMoneyUp(high.monthly, "monthly", steps) },
      income,
      simulation: sim.balances.map((p): SimulationPoint => ({ age: p.age, balance: round(p.balance, "lump") })),
      verdict,
      // The plan reserves the full monthly need to the plan-to age (not the shortfall against the
      // user's current saving): the user's current saving is what the plan's buckets are built from.
      monthlyNeed: plan.monthlySaving,
      status: verdict.status,
    };
  } else {
    // ---- F4: already retired. Spending net of other monthly income, from today. ----
    const other = input.otherMonthlyIncome ?? 0;
    const e = Math.max(0, 12 * (input.monthlySpending - other));
    const spendingAtRetirementYearly = step("m7.spendingAtRetirement", { monthlySpending: input.monthlySpending, otherMonthlyIncome: other, inflation: i, retireInYears: 0 }, e, round(e, "lump"));
    const yearsC = Math.max(0, contrastAge - A);
    const corpusC = corpusFor(e, base.r, i, yearsC);
    const corpusP = corpusFor(e, base.r, i, yearsPlan);
    step("m7.corpusContrast", { spendingAtRetirement: spendingAtRetirementYearly, returnRate: base.r, inflation: i, retiredForYears: yearsC }, corpusC, round(corpusC, "lump"));
    step("m7.corpusPlan", { spendingAtRetirement: spendingAtRetirementYearly, returnRate: base.r, inflation: i, retiredForYears: yearsPlan }, corpusP, round(corpusP, "lump"));
    const gapC = Math.max(0, corpusC - input.savings);
    const gapP = Math.max(0, corpusP - input.savings);
    step("m7.gap", { corpus: round(corpusP, "lump"), savings: input.savings }, gapP, round(gapP, "lump"));

    // Rounded down: never suggest withdrawing more than lasts.
    const w1 = firstYearWithdrawal(input.savings, base.r, i, yearsPlan);
    const firstYear = step("m7.withdrawal", { savings: input.savings, returnRate: base.r, inflation: i, retiredForYears: yearsPlan }, w1, floorTo(w1, "lump", steps));
    const potYears = ex.use("withdrawal_safe_pot_years");
    const safePotRaw = potYears * w1;
    const safePot = step("m7.safePot", { firstYear, potYears }, safePotRaw, round(safePotRaw, "lump"));

    const sim = simulate({ age: A, retirementAge: A, planToAge: L, savings: input.savings, monthlySaving: 0, ra: 0, r: base.r, i, lumpAtRetirement: 0, firstYearSpending: e, fixedYearly: 0 });
    const verdict = verdictFor(sim.runsOutAt, L, contrastAge);

    const type = input.retireeType ?? "private";
    const options = retireeOptions(type, rates);
    if (options.includes("m7.option.pensionerCertificate")) ex.use("pensioner_sanchayapatra_cap");

    const withdrawal: M7Withdrawal = { firstYear, monthly: floorTo(w1 / 12, "monthly", steps), safePot, runsOutAt: sim.runsOutAt, options };
    const zeroTarget = (planTo: number, corpus: number, gap: number): M7Target => ({ planTo, corpus: round(corpus, "lump"), gap: round(gap, "lump"), monthlySaving: 0 });

    result = {
      mode: "retired",
      retirementAge: A,
      planToAge: L,
      yearsToRetire: 0,
      spendingAtRetirementYearly,
      targets: { contrast: zeroTarget(contrastAge, corpusC, gapC), plan: zeroTarget(L, corpusP, gapP) },
      extraMonthlyForLongLife: 0,
      monthlySavingRange: { low: 0, base: 0, high: 0 },
      income: {
        providentFundAtRetirement: 0,
        gratuity: 0,
        fixedPensionsValue: 0,
        publicPensionMonthly: 0,
        rentAtRetirementYearly: 0,
        oldAgeAllowanceMonthly: round(allowanceMonthly, "exact"),
        familySupportMonthly: round(familyMonthly, "exact"),
      },
      simulation: sim.balances.map((p): SimulationPoint => ({ age: p.age, balance: round(p.balance, "lump") })),
      verdict,
      withdrawal,
      monthlyNeed: 0,
      status: verdict.status,
    };
  }

  const ordered = M7_NOTE_KEYS.filter((k) => notes.has(k));
  for (const k of ordered) ex.note(k);
  return { ...result, notes: ordered, explain: ex.done() };
}
