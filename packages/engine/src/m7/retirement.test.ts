import { describe, expect, it } from "vitest";
import seed from "../data/rates.seed.json";
import { assertSnapshot, type RateKey, type RatesSnapshot } from "../rates";
import { withCountry } from "../country/overlay";
import { FIXTURE_BD, FIXTURE_IN, FIXTURE_US } from "../fixtures/countries";
import type { CountryProfile } from "../country/types";
import { EngineError } from "../types";
import {
  annuityFv,
  computeRetirement,
  corpusFor,
  countedServiceYears,
  firstYearWithdrawal,
  gratuityAmount,
  gratuityDays,
  levelAnnuityValue,
  monthlyRateOf,
  projectedPension,
  providentFundAt,
  publicPensionValueAtRetirement,
  retireeOptions,
  sinkingMonthly,
} from "./retirement";
import { M7_NOTE_KEYS, M7_OPTION_KEYS, M7_STEP_IDS, type M7Input, type M7Result } from "./types";

const rates = assertSnapshot(seed);
const today = "2026-10-30";
const LAKH = 100_000;
const CRORE = 10_000_000;

function withValue(s: RatesSnapshot, key: RateKey, value: number): RatesSnapshot {
  return { ...s, rows: { ...s.rows, [key]: { ...s.rows[key], value } } };
}

function withJson(s: RatesSnapshot, key: RateKey, valueJson: unknown): RatesSnapshot {
  return { ...s, rows: { ...s.rows, [key]: { ...s.rows[key], valueJson } } };
}

function within1pct(actual: number, expected: number): void {
  expect(Math.abs(actual - expected) / expected).toBeLessThan(0.01);
}

function stepRaw(r: M7Result, id: string): number {
  const st = r.explain.steps.find((s) => s.id === id);
  if (!st) throw new Error(`no step ${id}`);
  return st.raw;
}

const working30: M7Input = { mode: "working", age: 30, monthlySpending: 40_000, savings: 0, monthlySaving: 0 };

describe("pure formulas", () => {
  it("PRD: retiring at 60 on ৳50,000 a month needs about ৳92 lakh to 80 and ৳1.56 crore to 100 (i 8%, r 10%)", () => {
    within1pct(corpusFor(12 * 50_000, 0.1, 0.08, 20), 92 * LAKH);
    within1pct(corpusFor(12 * 50_000, 0.1, 0.08, 40), 1.56 * CRORE);
  });

  it("r = i corpus is E × n / (1 + r) and the withdrawal formula inverts it", () => {
    expect(corpusFor(600_000, 0.08, 0.08, 20)).toBeCloseTo((600_000 * 20) / 1.08, 6);
    expect(firstYearWithdrawal(corpusFor(600_000, 0.08, 0.08, 20), 0.08, 0.08, 20)).toBeCloseTo(600_000, 6);
    // Continuity: just off r = i the general formula agrees with the limit.
    const limit = (600_000 * 20) / 1.08;
    expect(Math.abs(corpusFor(600_000, 0.08 + 1e-7, 0.08, 20) - limit) / limit).toBeLessThan(1e-5);
  });

  it("PRD: ৳1 crore at 60 to 100 at 10% / 8% supports about ৳3.85 lakh in year one", () => {
    within1pct(firstYearWithdrawal(CRORE, 0.1, 0.08, 40), 3.85 * LAKH);
    within1pct(firstYearWithdrawal(CRORE, 0.1, 0.08, 40) / 12, 32_000);
  });

  it("level annuity value of a fixed pension", () => {
    expect(levelAnnuityValue(120_000, 0.1, 20)).toBeCloseTo((120_000 * (1 - 1.1 ** -20)) / 0.1, 6);
    within1pct(levelAnnuityValue(120_000, 0.1, 20), 1_021_627);
    expect(levelAnnuityValue(120_000, 0, 20)).toBe(2_400_000);
    expect(levelAnnuityValue(120_000, 0.1, 0)).toBe(0);
  });

  it("sinking fund and monthly rate", () => {
    expect(monthlyRateOf(0.09)).toBeCloseTo(1.09 ** (1 / 12) - 1, 12);
    expect(sinkingMonthly(1_200_000, 0, 120)).toBe(10_000);
    const m = monthlyRateOf(0.09);
    expect(annuityFv(sinkingMonthly(5_000_000, m, 240), m, 240)).toBeCloseTo(5_000_000, 4);
  });

  it("provident fund grows the balance and the contributions at the fund's own rate", () => {
    const pf = { balance: 500_000, monthlyContribution: 6_000, rate: 0.1 };
    const m = monthlyRateOf(0.1);
    expect(providentFundAt(pf, 20)).toBeCloseTo(500_000 * 1.1 ** 20 + (6_000 * ((1 + m) ** 240 - 1)) / m, 4);
    expect(providentFundAt({ balance: 100, monthlyContribution: 10, rate: 0 }, 2)).toBe(340);
  });

  it("gratuity: 30 days a year up to 10 years, 45 days once service exceeds 10, employer's rule if higher", () => {
    const rule = rates.rows.gratuity_rule.valueJson as { daysPerYear: number; daysPerYearAfter: number; afterYears: number; daysPerMonth: number };
    expect(gratuityDays({ yearsOfService: 9 }, rule)).toBe(30);
    // Labour Act: 45 days only when service exceeds 10 years (was 45 at exactly 10).
    expect(gratuityDays({ yearsOfService: 10 }, rule)).toBe(30);
    expect(gratuityDays({ yearsOfService: 11 }, rule)).toBe(45);
    expect(gratuityAmount({ yearsOfService: 9, basicMonthly: 30_000 }, rule)).toBe(270_000);
    // 30 000 / 30 × 30 × 10 = 300 000 (was 450 000)
    expect(gratuityAmount({ yearsOfService: 10, basicMonthly: 30_000 }, rule)).toBe(300_000);
    // 30 000 / 30 × 45 × 11 = 495 000
    expect(gratuityAmount({ yearsOfService: 11, basicMonthly: 30_000 }, rule)).toBe(495_000);
    expect(gratuityAmount({ yearsOfService: 9, basicMonthly: 30_000, employerDaysPerYear: 60 }, rule)).toBe(540_000);
    // The employer's lower rule never beats the law.
    expect(gratuityAmount({ yearsOfService: 11, basicMonthly: 30_000, employerDaysPerYear: 20 }, rule)).toBe(495_000);
  });

  it("gratuity: a part year over six months counts as a year; no rule → the employer's days alone", () => {
    const rule = rates.rows.gratuity_rule.valueJson as { daysPerYear: number; daysPerYearAfter: number; afterYears: number; daysPerMonth: number };
    expect(countedServiceYears(9.5)).toBe(9);
    expect(countedServiceYears(9.6)).toBe(10);
    expect(countedServiceYears(10.7)).toBe(11);
    // 10 years 7 months → 11 counted years, over 10 → 45 days: 1 000 × 45 × 11 = 495 000
    expect(gratuityAmount({ yearsOfService: 10.6, basicMonthly: 30_000 }, rule)).toBe(495_000);
    expect(gratuityDays({ yearsOfService: 12 }, null)).toBe(0);
    expect(gratuityAmount({ yearsOfService: 12, basicMonthly: 30_000, employerDaysPerYear: 15 }, null)).toBe(180_000);
  });

  it("public pension projection passes through the official points and scales by contribution", () => {
    const proj = [
      { monthlyContribution: 1000, years: 10, monthlyPension: 1530 },
      { monthlyContribution: 1000, years: 42, monthlyPension: 34465 },
    ];
    expect(projectedPension(1000, 10, proj)).toBeCloseTo(1530, 6);
    expect(projectedPension(1000, 42, proj)).toBeCloseTo(34465, 6);
    expect(projectedPension(2000, 10, proj)).toBeCloseTo(3060, 6);
    const mid = projectedPension(1000, 30, proj);
    expect(mid).toBeGreaterThan(1530);
    expect(mid).toBeLessThan(34465);
    expect(projectedPension(1000, 31, proj)).toBeGreaterThan(mid);
    expect(projectedPension(1000, 20, [proj[0]!])).toBeCloseTo(3060, 6);
    expect(projectedPension(1000, 20, [])).toBe(0);
    expect(projectedPension(0, 20, proj)).toBe(0);
  });
});

describe("computeRetirement: working (F1, F2)", () => {
  const r = computeRetirement(working30, rates, today);

  it("PRD: age 30 on ৳40,000 → about ৳48 lakh a year at 60", () => {
    expect(r.retirementAge).toBe(60);
    expect(r.planToAge).toBe(100);
    expect(r.yearsToRetire).toBe(30);
    within1pct(r.spendingAtRetirementYearly, 48 * LAKH);
  });

  it("PRD: targets about ৳7.4 crore to 80 and ৳12.6 crore to 100", () => {
    expect(r.targets.contrast.planTo).toBe(80);
    expect(r.targets.plan.planTo).toBe(100);
    within1pct(r.targets.contrast.corpus, 7.4 * CRORE);
    within1pct(r.targets.plan.corpus, 12.6 * CRORE);
    expect(r.targets.plan.gap).toBe(r.targets.plan.corpus);
  });

  it("PRD: about ৳43,600 and ৳73,800 a month at 9% before PF, gratuity and pension", () => {
    within1pct(r.targets.contrast.monthlySaving, 43_600);
    within1pct(r.targets.plan.monthlySaving, 73_800);
    expect(r.extraMonthlyForLongLife).toBe(r.targets.plan.monthlySaving - r.targets.contrast.monthlySaving);
    expect(r.monthlyNeed).toBe(r.targets.plan.monthlySaving);
  });

  it("the low / high range brackets the base (pessimistic rates need more)", () => {
    expect(r.monthlySavingRange.base).toBe(r.targets.plan.monthlySaving);
    expect(r.monthlySavingRange.low).toBeGreaterThan(r.monthlySavingRange.base);
    expect(r.monthlySavingRange.high).toBeLessThan(r.monthlySavingRange.base);
  });

  it("PRD rounding: monthly results up to ৳500, corpus to ৳1 lakh, other lump sums to ৳500", () => {
    // 73 779.8 → 74 000 (was 73 800 with ৳100 steps); 43 5xx → 44 000 (was 43 600)
    expect(r.targets.plan.monthlySaving).toBe(74_000);
    expect(r.targets.contrast.monthlySaving).toBe(44_000);
    // 12 55 81 537 → ৳12.56 crore; 7 41 84 745 → ৳7.42 crore
    expect(r.targets.plan.corpus).toBe(125_600_000);
    expect(r.targets.contrast.corpus).toBe(74_200_000);
    for (const v of [r.targets.plan.monthlySaving, r.targets.contrast.monthlySaving, ...Object.values(r.monthlySavingRange)]) expect(v % 500).toBe(0);
    for (const v of [r.targets.plan.corpus, r.targets.contrast.corpus, r.targets.plan.gap, r.targets.contrast.gap]) expect(v % LAKH).toBe(0);
    for (const v of [r.spendingAtRetirementYearly, ...r.simulation.map((p) => p.balance)]) expect(v % 500).toBe(0);
    expect(r.targets.plan.monthlySaving).toBeGreaterThanOrEqual(stepRaw(r, "m7.monthly"));
  });

  it("with nothing saved the money runs out at retirement (red) and the chart never goes below zero", () => {
    expect(r.verdict).toEqual({ kind: "runsOut", age: 61, status: "red" });
    expect(r.status).toBe("red");
    expect(r.simulation[0]).toEqual({ age: 30, balance: 0 });
    expect(r.simulation).toHaveLength(71);
    expect(r.simulation.at(-1)!.age).toBe(100);
    expect(r.simulation.every((p) => p.balance >= 0)).toBe(true);
  });

  it("a fully funded plan reaches ≈ 0 at the plan-to age, with every income source", () => {
    const input: M7Input = {
      mode: "working",
      age: 35,
      retirementAge: 60,
      monthlySpending: 60_000,
      savings: 1_500_000,
      monthlySaving: 0,
      sources: {
        providentFund: { balance: 400_000, monthlyContribution: 8_000, rate: 0.1 },
        gratuity: { yearsOfService: 25, basicMonthly: 80_000 },
        publicPension: { monthlyContribution: 2_000 },
        fixedPensionMonthly: 5_000,
        rentMonthly: 10_000,
      },
    };
    const first = computeRetirement(input, rates, today);
    const funded = computeRetirement({ ...input, monthlySaving: stepRaw(first, "m7.monthly") }, rates, today);
    const end = funded.simulation.at(-1)!;
    expect(end.age).toBe(100);
    expect(Math.abs(end.balance)).toBeLessThanOrEqual(500);
    expect(funded.verdict).toEqual({ kind: "onTrack", age: 100, status: "green" });
    // At the shown (rounded-up) monthly saving the plan is on track too.
    const shown = computeRetirement({ ...input, monthlySaving: first.targets.plan.monthlySaving }, rates, today);
    expect(shown.verdict.kind).toBe("onTrack");
    // PF and gratuity land in the pot on reaching the retirement age.
    const at59 = funded.simulation.find((p) => p.age === 59)!.balance;
    const at60 = funded.simulation.find((p) => p.age === 60)!.balance;
    expect(at60 - at59).toBeGreaterThan(funded.income.providentFundAtRetirement + funded.income.gratuity);
  });

  it("a plan funded only to 80 lasts past 80 (amber); one funded to 70 runs out before (red)", () => {
    const to80 = computeRetirement({ ...working30, monthlySaving: r.targets.contrast.monthlySaving }, rates, today);
    expect(to80.verdict.kind).toBe("lastsTo");
    expect(to80.verdict.status).toBe("amber");
    expect(to80.verdict.age).toBeGreaterThan(80);
    expect(to80.verdict.age).toBeLessThanOrEqual(82);
    const half = computeRetirement({ ...working30, monthlySaving: r.targets.contrast.monthlySaving / 2 }, rates, today);
    expect(half.verdict.kind).toBe("runsOut");
    expect(half.verdict.age).toBeLessThanOrEqual(80);
    expect(half.simulation.filter((p) => p.age >= half.verdict.age).every((p) => p.balance === 0)).toBe(true);
  });

  it("rent rises with inflation and is subtracted from spending at retirement", () => {
    const withRent = computeRetirement({ ...working30, sources: { rentMonthly: 10_000 } }, rates, today);
    within1pct(withRent.income.rentAtRetirementYearly, 120_000 * 1.08 ** 30);
    within1pct(withRent.spendingAtRetirementYearly, 360_000 * 1.08 ** 30);
    expect(computeRetirement({ ...working30, sources: { rentMonthly: 50_000 } }, rates, today).spendingAtRetirementYearly).toBe(0);
  });

  it("a fixed pension is valued as a level annuity and lowers the gap by that value", () => {
    const p = computeRetirement({ ...working30, sources: { fixedPensionMonthly: 10_000 } }, rates, today);
    const value = levelAnnuityValue(120_000, 0.1, 40);
    expect(p.income.fixedPensionsValue).toBe(Math.round(value / 500) * 500);
    // Compared unrounded: the shown gaps are rounded to ৳1 lakh.
    within1pct(stepRaw(r, "m7.gap") - stepRaw(p, "m7.gap"), value);
    expect(p.notes).toContain("m7.note.pensionFixed");
    expect(r.notes).not.toContain("m7.note.pensionFixed");
  });

  it("PF and gratuity lower the gap by their value at retirement", () => {
    const g = { yearsOfService: 11, basicMonthly: 30_000 };
    const pf = { balance: 200_000, monthlyContribution: 5_000, rate: 0.09 };
    const p = computeRetirement({ ...working30, sources: { gratuity: g, providentFund: pf } }, rates, today);
    expect(p.income.gratuity).toBe(495_000);
    expect(p.income.providentFundAtRetirement).toBe(Math.round(providentFundAt(pf, 30) / 500) * 500);
    within1pct(stepRaw(r, "m7.gap") - stepRaw(p, "m7.gap"), 495_000 + providentFundAt(pf, 30));
  });

  it("no gratuity rule for the country (null): the employer's days alone, with a note", () => {
    const none = withJson(rates, "gratuity_rule", null);
    const own = computeRetirement({ ...working30, sources: { gratuity: { yearsOfService: 10, basicMonthly: 30_000, employerDaysPerYear: 15 } } }, none, today);
    // 30 000 / 30 × 15 × 10 = 150 000
    expect(own.income.gratuity).toBe(150_000);
    expect(own.notes).toContain("m7.note.noStatutoryGratuity");
    expect(own.explain.assumptions.map((a) => a.key)).not.toContain("gratuity_rule");
    const zero = computeRetirement({ ...working30, sources: { gratuity: { yearsOfService: 10, basicMonthly: 30_000 } } }, none, today);
    expect(zero.income.gratuity).toBe(0);
  });

  it("unknown public pension scheme or allowance rows (null) never throw", () => {
    const noScheme = withJson(rates, "public_pension_scheme", null);
    const projected = computeRetirement({ ...working30, sources: { publicPension: { monthlyContribution: 1_000 } } }, noScheme, today);
    expect(projected.income.publicPensionMonthly).toBe(0);
    // A pension the user knows still counts (from the retirement age).
    const known = computeRetirement({ ...working30, sources: { publicPension: { monthlyContribution: 1_000, expectedMonthly: 5_000 } } }, noScheme, today);
    expect(known.income.publicPensionMonthly).toBe(5_000);
    expect(known.income.fixedPensionsValue).toBe(Math.round(levelAnnuityValue(60_000, 0.1, 40) / 500) * 500);
    const noAllowance = withJson(rates, "old_age_allowance_eligibility", null);
    const a = computeRetirement({ ...working30, sex: "female", sources: { oldAgeAllowanceEligible: true } }, noAllowance, today);
    expect(a.income.oldAgeAllowanceMonthly).toBe(0);
    expect(a.notes).not.toContain("m7.note.allowanceNotCounted");
  });

  it("public pension is valued from the scheme's pension age, not the retirement age", () => {
    const pp = { monthlyContribution: 1_000, expectedMonthly: 10_000 };
    const yearly = 120_000;
    // Retiring at 55, pension from 60: the 60..100 annuity discounted 5 years at 10%.
    const early = computeRetirement({ ...working30, retirementAge: 55, sources: { publicPension: pp } }, rates, today);
    expect(stepRaw(early, "m7.fixedPensions")).toBeCloseTo(levelAnnuityValue(yearly, 0.1, 40) / 1.1 ** 5, 4);
    expect(publicPensionValueAtRetirement(yearly, 0.1, 0.09, 55, 60, 100)).toBeCloseTo(levelAnnuityValue(yearly, 0.1, 40) / 1.1 ** 5, 6);
    // Retiring at 65, pension from 60: five years of pension saved at the accumulation return, then 65..100.
    const late = computeRetirement({ ...working30, retirementAge: 65, sources: { publicPension: pp } }, rates, today);
    expect(stepRaw(late, "m7.fixedPensions")).toBeCloseTo(levelAnnuityValue(yearly, 0.1, 35) + (yearly * (1.09 ** 5 - 1)) / 0.09, 4);
    expect(late.explain.steps.find((s) => s.id === "m7.fixedPensions")?.inputs.pensionFromAgeYears).toBe(60);
    // Fully funded with the pension starting before retirement, the chart still ends at ≈ 0.
    const funded = computeRetirement({ ...working30, retirementAge: 65, sources: { publicPension: pp }, monthlySaving: stepRaw(late, "m7.monthly") }, rates, today);
    expect(Math.abs(funded.simulation.at(-1)!.balance)).toBeLessThanOrEqual(500);
    expect(funded.verdict.kind).toBe("onTrack");
    const fundedEarly = computeRetirement({ ...working30, retirementAge: 55, sources: { publicPension: pp }, monthlySaving: stepRaw(early, "m7.monthly") }, rates, today);
    expect(Math.abs(fundedEarly.simulation.at(-1)!.balance)).toBeLessThanOrEqual(500);
  });

  it("Universal Pension: projected from the scheme; entry age above 50 → 0 with a note", () => {
    const young = computeRetirement({ ...working30, sources: { publicPension: { monthlyContribution: 1_000 } } }, rates, today);
    expect(young.income.publicPensionMonthly).toBeGreaterThan(1_530);
    expect(young.income.publicPensionMonthly).toBeLessThan(34_465);
    const at50 = computeRetirement({ ...working30, age: 50, sources: { publicPension: { monthlyContribution: 1_000 } } }, rates, today);
    expect(at50.income.publicPensionMonthly).toBe(1_500); // 1,530 rounded to ৳100
    const late = computeRetirement({ ...working30, age: 51, sources: { publicPension: { monthlyContribution: 1_000 } } }, rates, today);
    expect(late.income.publicPensionMonthly).toBe(0);
    expect(late.income.fixedPensionsValue).toBe(0);
    expect(late.notes).toContain("m7.note.pensionEntryClosed");
    expect(late.notes).not.toContain("m7.note.pensionFixed");
    const known = computeRetirement({ ...working30, age: 55, sources: { publicPension: { monthlyContribution: 1_000, expectedMonthly: 4_000 } } }, rates, today);
    expect(known.income.publicPensionMonthly).toBe(4_000);
    expect(known.notes).not.toContain("m7.note.pensionEntryClosed");
  });

  it("the old-age allowance is shown but never reduces the gap", () => {
    const a = computeRetirement({ ...working30, sex: "female", sources: { oldAgeAllowanceEligible: true } }, rates, today);
    expect(a.income.oldAgeAllowanceMonthly).toBe(700);
    expect(a.targets.plan.gap).toBe(r.targets.plan.gap);
    expect(a.targets.plan.monthlySaving).toBe(r.targets.plan.monthlySaving);
    expect(a.simulation).toEqual(r.simulation);
    expect(a.notes).toContain("m7.note.allowanceNotCounted");
    expect(r.income.oldAgeAllowanceMonthly).toBe(0);
    expect(r.notes).not.toContain("m7.note.allowanceNotCounted");
    const over90 = computeRetirement({ mode: "retired", age: 92, monthlySpending: 10_000, savings: 100_000, monthlySaving: 0, sources: { oldAgeAllowanceEligible: true } }, rates, today);
    expect(over90.income.oldAgeAllowanceMonthly).toBe(1_000);
    const govt = computeRetirement({ mode: "retired", retireeType: "government", age: 66, monthlySpending: 10_000, savings: 100_000, monthlySaving: 0, sources: { oldAgeAllowanceEligible: true } }, rates, today);
    expect(govt.income.oldAgeAllowanceMonthly).toBe(0);
  });

  it("family support is shown but never reduces the gap; the family note is always there", () => {
    const f = computeRetirement({ ...working30, sources: { familySupportMonthly: 20_000 } }, rates, today);
    expect(f.income.familySupportMonthly).toBe(20_000);
    expect(f.targets.plan.gap).toBe(r.targets.plan.gap);
    expect(f.targets.contrast.monthlySaving).toBe(r.targets.contrast.monthlySaving);
    expect(f.simulation).toEqual(r.simulation);
    expect(f.notes).toContain("m7.note.familyNotCounted");
    expect(r.notes).toContain("m7.note.familyNotCounted");
  });

  it("an M6 allocation sets the accumulation return to the weighted mix", () => {
    const a = computeRetirement({ ...working30, allocation: { equity: 0.6, fixedIncome: 0.3, gold: 0.1 } }, rates, today);
    const ra = 0.6 * 0.09 + 0.3 * 0.085 + 0.1 * 0.08;
    const raw = sinkingMonthly(stepRaw(a, "m7.gap"), monthlyRateOf(ra), 360);
    expect(stepRaw(a, "m7.monthly")).toBeCloseTo(raw, 6);
    const keys = a.explain.assumptions.map((x) => x.key);
    expect(keys).toEqual(expect.arrayContaining(["equity_return_base", "fixed_income_return_base", "gold_return_base", "equity_return_low", "gold_return_high"]));
    expect(keys).not.toContain("retirement_accumulation_return_base");
  });

  it("government employees default to retirement_age_government", () => {
    expect(computeRetirement({ ...working30, retireeType: "government" }, rates, today).retirementAge).toBe(59);
  });
});

describe("computeRetirement: retired (F4)", () => {
  const base: M7Input = { mode: "retired", age: 60, monthlySpending: 40_000, savings: CRORE, monthlySaving: 0 };

  it("PRD: ৳1 crore at 60 → about ৳3.85 lakh in year one, ৳32,000 a month", () => {
    const r = computeRetirement(base, rates, today);
    within1pct(r.withdrawal!.firstYear, 3.85 * LAKH);
    within1pct(r.withdrawal!.monthly, 32_000);
    expect(r.withdrawal!.monthly % 500).toBe(0);
    // Low / base / high returns (8% = inflation, 10%, 11%): 1 crore × 1.08 / 40 / 12 = 22 500; 32 000; 37 500.
    expect(r.withdrawal!.monthlyRange).toEqual({ low: 22_500, base: 32_000, high: 37_500 });
    expect(r.notes).toContain("m7.note.lowCaseInflation");
    expect(r.withdrawal!.monthly).toBeLessThanOrEqual(stepRaw(r, "m7.withdrawal") / 12);
    expect(r.withdrawal!.safePot).toBe(Math.round((3 * stepRaw(r, "m7.withdrawal")) / 500) * 500);
    expect(r.monthlyNeed).toBe(0);
    expect(r.yearsToRetire).toBe(0);
    expect(r.retirementAge).toBe(60);
  });

  it("spending above the safe amount runs out, and the age is reported", () => {
    const r = computeRetirement(base, rates, today);
    expect(r.withdrawal!.runsOutAt).not.toBeNull();
    expect(r.verdict.age).toBe(r.withdrawal!.runsOutAt);
    expect(r.verdict.kind).toBe("lastsTo");
    expect(r.simulation.every((p) => p.balance >= 0)).toBe(true);
    const tooMuch = computeRetirement({ ...base, monthlySpending: 100_000 }, rates, today);
    expect(tooMuch.verdict.kind).toBe("runsOut");
    expect(tooMuch.verdict.status).toBe("red");
  });

  it("spending exactly the safe amount lasts to the plan-to age and reaches ≈ 0", () => {
    const w1 = firstYearWithdrawal(CRORE, 0.1, 0.08, 40);
    const r = computeRetirement({ ...base, monthlySpending: w1 / 12 }, rates, today);
    expect(r.withdrawal!.runsOutAt).toBeNull();
    expect(r.verdict).toEqual({ kind: "onTrack", age: 100, status: "green" });
    expect(Math.abs(r.simulation.at(-1)!.balance)).toBeLessThanOrEqual(500);
    expect(r.simulation[0]).toEqual({ age: 60, balance: CRORE });
  });

  it("other monthly income is a fixed amount: it does not rise with prices", () => {
    const w1 = firstYearWithdrawal(CRORE, 0.1, 0.08, 40);
    // Spending the safe amount plus 15 000 covered by a fixed 15 000: the fixed part loses buying
    // power, so the money runs out before 100 (it lasted when other income was treated as rising).
    const r = computeRetirement({ ...base, monthlySpending: w1 / 12 + 15_000, otherMonthlyIncome: 15_000 }, rates, today);
    expect(r.withdrawal!.runsOutAt).not.toBeNull();
    expect(r.income.fixedPensionsValue).toBe(Math.round(levelAnnuityValue(180_000, 0.1, 40) / 500) * 500);
    expect(r.notes).toContain("m7.note.pensionFixed");
    // Gap = corpus for the full spending − value of the fixed income − savings.
    const corpus = corpusFor(12 * (w1 / 12 + 15_000), 0.1, 0.08, 40);
    expect(stepRaw(r, "m7.gap")).toBeCloseTo(Math.max(0, corpus - levelAnnuityValue(180_000, 0.1, 40) - CRORE), 2);
  });

  it("r = i withdrawal through the calculator", () => {
    const flat = withValue(rates, "retirement_return_base", 0.08);
    const r = computeRetirement(base, flat, today);
    expect(stepRaw(r, "m7.withdrawal")).toBeCloseTo((CRORE * 1.08) / 40, 6);
  });

  it("government retirees get the pensioner certificate; private retirees the other safe options", () => {
    const g = computeRetirement({ ...base, retireeType: "government" }, rates, today);
    expect(g.withdrawal!.options).toEqual(["m7.option.pensionerCertificate", "m7.option.tbonds", "m7.option.annuity"]);
    expect(g.explain.assumptions.map((a) => a.key)).toContain("pensioner_sanchayapatra_cap");
    const p = computeRetirement(base, rates, today);
    expect(p.withdrawal!.options).toEqual(["m7.option.savingsCertificate", "m7.option.tbonds", "m7.option.depositLadder", "m7.option.annuity"]);
    for (const k of [...g.withdrawal!.options, ...p.withdrawal!.options]) expect(M7_OPTION_KEYS).toContain(k);
  });

  it("options drop slots the country lacks; the pensioner certificate is Bangladesh only", () => {
    const bd = withCountry(rates, FIXTURE_BD, { bdUsdRate: 122 });
    expect(retireeOptions("government", bd)).toContain("m7.option.pensionerCertificate");
    const india = withCountry(rates, FIXTURE_IN, { bdUsdRate: 122 });
    expect(retireeOptions("government", india)).toEqual(["m7.option.tbonds", "m7.option.annuity"]);
    const noBonds: CountryProfile = {
      ...FIXTURE_US,
      instruments: { ...FIXTURE_US.instruments, tbond_5y: { available: false, localName: null }, fdr_1y: { available: false, localName: null }, sanchayapatra_5y: { available: false, localName: null } },
    };
    expect(retireeOptions("private", withCountry(rates, noBonds, { bdUsdRate: 122 }))).toEqual(["m7.option.annuity"]);
  });

  it("uses the country's rounding steps", () => {
    const us = withCountry(rates, FIXTURE_US, { bdUsdRate: 122 });
    const steps = us.country!.rounding;
    const r = computeRetirement({ mode: "retired", age: 65, monthlySpending: 4_000, savings: 800_000, monthlySaving: 0 }, us, today);
    expect(r.withdrawal!.firstYear % steps.lump).toBe(0);
    expect(r.withdrawal!.monthly % steps.monthly).toBe(0);
    const w = computeRetirement({ mode: "working", age: 30, monthlySpending: 4_000, savings: 10_000, monthlySaving: 500 }, us, today);
    expect(w.targets.plan.corpus % steps.lump).toBe(0);
    expect(w.targets.plan.monthlySaving % steps.monthly).toBe(0);
    expect(w.retirementAge).toBe(67);
  });
});

describe("explain, notes and validation", () => {
  const working = computeRetirement(working30, rates, today);
  const retired = computeRetirement({ mode: "retired", age: 62, monthlySpending: 30_000, savings: 5_000_000, monthlySaving: 0 }, rates, today);

  it("step ids: working uses every step but withdrawal and safePot (source steps only for added sources); retired uses withdrawal and safePot", () => {
    const ids = (r: M7Result) => r.explain.steps.map((s) => s.id);
    const SOURCE_STEPS = ["m7.providentFund", "m7.gratuity", "m7.fixedPensions"];
    expect(new Set(ids(working))).toEqual(new Set(M7_STEP_IDS.filter((s) => s !== "m7.withdrawal" && s !== "m7.safePot" && !SOURCE_STEPS.includes(s))));
    expect(ids(working)).toHaveLength(6);
    const all = computeRetirement(
      { ...working30, sources: { providentFund: { balance: 1, monthlyContribution: 1, rate: 0.05 }, gratuity: { yearsOfService: 5, basicMonthly: 20_000 }, fixedPensionMonthly: 1_000 } },
      rates,
      today,
    );
    expect(ids(all)).toHaveLength(9);
    expect(ids(computeRetirement({ ...working30, sources: { rentMonthly: 5_000 } }, rates, today))).not.toContain("m7.fixedPensions");
    expect(ids(retired)).toEqual(expect.arrayContaining(["m7.withdrawal", "m7.safePot"]));
    for (const id of [...ids(working), ...ids(retired)]) expect(M7_STEP_IDS).toContain(id);
    expect(ids(retired)).not.toContain("m7.monthly");
    for (const s of [...working.explain.steps, ...retired.explain.steps]) {
      for (const v of Object.values(s.inputs)) expect(typeof v === "string" || Number.isFinite(v)).toBe(true);
      expect(Number.isFinite(s.raw)).toBe(true);
    }
  });

  it("explain input names never use bare age names the UI would show as money", () => {
    for (const s of [...working.explain.steps, ...retired.explain.steps]) for (const k of Object.keys(s.inputs)) expect(k).not.toMatch(/^(age|retirementAge|planToAge|years|days)$/);
  });

  it("assumption keys: every rate used is recorded", () => {
    const keys = working.explain.assumptions.map((a) => a.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "inflation_projection",
        "retirement_return_base",
        "retirement_return_low",
        "retirement_return_high",
        "retirement_accumulation_return_base",
        "retirement_accumulation_return_low",
        "retirement_accumulation_return_high",
        "plan_to_age",
        "plan_to_age_min",
        "plan_to_age_max",
        "plan_contrast_age",
        "retirement_age_default",
        "life_table_remaining",
        "support_ratio",
      ]),
    );
    const full = computeRetirement(
      { ...working30, sources: { gratuity: { yearsOfService: 5, basicMonthly: 20_000 }, publicPension: { monthlyContribution: 1_000 }, oldAgeAllowanceEligible: true } },
      rates,
      today,
    );
    expect(full.explain.assumptions.map((a) => a.key)).toEqual(expect.arrayContaining(["gratuity_rule", "public_pension_scheme", "old_age_allowance_monthly", "old_age_allowance_eligibility"]));
    expect(retired.explain.assumptions.map((a) => a.key)).toEqual(expect.arrayContaining(["withdrawal_safe_pot_years", "retirement_return_base", "inflation_projection"]));
    expect(retired.explain.assumptions.map((a) => a.key)).not.toContain("retirement_accumulation_return_base");
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("notes: always the four explainers and the family note; women and unknown sex get womenLiveLonger", () => {
    for (const r of [working, retired]) {
      expect(r.notes).toEqual(expect.arrayContaining(["m7.note.planTo100", "m7.note.lifeAt60", "m7.note.lock", "m7.note.supportRatio", "m7.note.familyNotCounted", "m7.note.womenLiveLonger"]));
      expect(r.explain.notes).toEqual(r.notes);
      for (const n of r.notes) expect(M7_NOTE_KEYS).toContain(n);
    }
    expect(working.notes).toContain("m7.note.startEarlier");
    expect(retired.notes).not.toContain("m7.note.startEarlier");
    expect(computeRetirement({ ...working30, sex: "male" }, rates, today).notes).not.toContain("m7.note.womenLiveLonger");
    expect(computeRetirement({ ...working30, sex: "female" }, rates, today).notes).toContain("m7.note.womenLiveLonger");
  });

  it("planToAge: default 100, clamped to 85..105", () => {
    expect(computeRetirement({ ...working30, planToAge: 120 }, rates, today).planToAge).toBe(105);
    expect(computeRetirement({ ...working30, planToAge: 70 }, rates, today).planToAge).toBe(85);
    expect(computeRetirement({ ...working30, planToAge: 95 }, rates, today).planToAge).toBe(95);
    const r95 = computeRetirement({ ...working30, planToAge: 95 }, rates, today);
    expect(r95.simulation.at(-1)!.age).toBe(95);
    expect(r95.targets.plan.planTo).toBe(95);
    // A retiree already at or past the plan-to age is planned one more year.
    expect(computeRetirement({ mode: "retired", age: 100, monthlySpending: 10_000, savings: 100_000, monthlySaving: 0 }, rates, today).planToAge).toBe(101);
  });

  it("validation", () => {
    const bad = (x: Partial<M7Input>) => () => computeRetirement({ ...working30, ...x } as M7Input, rates, today);
    expect(bad({ age: 14 })).toThrow(EngineError);
    expect(bad({ age: 101 })).toThrow(EngineError);
    expect(bad({ age: 30.5 })).toThrow(EngineError);
    expect(bad({ retirementAge: 30 })).toThrow(EngineError);
    expect(bad({ retirementAge: 25 })).toThrow(EngineError);
    expect(bad({ retirementAge: 90, planToAge: 85 })).toThrow(EngineError);
    expect(bad({ monthlySpending: -1 })).toThrow(EngineError);
    expect(bad({ savings: Number.NaN })).toThrow(EngineError);
    expect(bad({ mode: "other" as never })).toThrow(EngineError);
    expect(bad({ sources: { providentFund: { balance: 1, monthlyContribution: 1, rate: 8 } } })).toThrow(EngineError);
    expect(bad({ sources: { rentMonthly: -5 } })).toThrow(EngineError);
    expect(bad({ allocation: { equity: 0.5, fixedIncome: 0.3, gold: 0.1 } })).toThrow(EngineError);
    // A retiree's retirement age is ignored.
    expect(computeRetirement({ mode: "retired", age: 70, retirementAge: 60, monthlySpending: 10_000, savings: 1_000_000, monthlySaving: 0 }, rates, today).retirementAge).toBe(70);
  });
});
