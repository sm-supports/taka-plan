/**
 * M2 Insurance & health (Bima Check). Formulas in ./types.ts; every default is a rates row read
 * through the explain builder so "Why this number?" lists it. Maths stays unrounded inside a step;
 * each step's rounded output feeds the next one, so the formula the user sees adds up.
 */
import { createExplain, type ExplainBuilder, type ExplainUnit } from "../explain";
import { roundDecimals, roundMoney, type RoundKind } from "../money";
import { afterTax as applyTax, instrumentNominal, type RateKey, type RatesSnapshot } from "../rates";
import { jsonShapeOk, type HealthCoverWeights, type HealthPremiumTable, type PremiumBand, type TermPremiumTable } from "../rates-json";
import { roundingFor } from "../country/overlay";
import { EngineError, assertInput, isFiniteNumber, type Dependent, type ISODate, type Money, type Rate, type Status } from "../types";
import {
  M2_CHECK_KEYS,
  type CoverPerson,
  type ExistingPolicy,
  type M2ChecklistItem,
  type M2HealthResult,
  type M2Input,
  type M2LifeResult,
  type M2PolicyCheck,
  type M2Result,
  type M2StepId,
  type PremiumRange,
} from "./types";

/** Structural constants (not rates): ages used to price cover for people whose age we do not ask. */
const CHILD_AGE = 10;
const PARENT_AGE_GAP = 28;
const DEFAULT_CHILDREN = 1;
const DEFAULT_PARENTS = 2;
/** Policy check: within 5% of the maturity value the two paths count as similar. */
const SIMILAR_SHARE = 0.05;
/** IRR search interval. */
const IRR_LO = -0.5;
const IRR_HI = 1;

const AGE_MIN = 15;
const AGE_MAX = 100;
const COUNT_MAX = 10;
const PERSON_AGE_MAX = 120;
const POLICY_TERM_MAX = 100;

const DEPENDENTS: readonly Dependent[] = ["partner", "children", "parents"];
const COVER_PEOPLE: readonly CoverPerson[] = ["self", "partner", "child", "parent"];

const money = (x: unknown): boolean => isFiniteNumber(x) && x >= 0;

function validatePolicy(p: ExistingPolicy): void {
  assertInput(typeof p === "object" && p !== null, "policy must be an object", { policy: p });
  assertInput(money(p.annualPremium), "policy.annualPremium must be zero or more", { annualPremium: p.annualPremium });
  assertInput(money(p.sumAssured), "policy.sumAssured must be zero or more", { sumAssured: p.sumAssured });
  assertInput(money(p.expectedMaturity), "policy.expectedMaturity must be zero or more", { expectedMaturity: p.expectedMaturity });
  assertInput(Number.isInteger(p.termYears) && p.termYears >= 1 && p.termYears <= POLICY_TERM_MAX, `policy.termYears must be a whole number from 1 to ${POLICY_TERM_MAX}`, {
    termYears: p.termYears,
  });
  assertInput(Number.isInteger(p.yearsPaid) && p.yearsPaid >= 0 && p.yearsPaid <= p.termYears, "policy.yearsPaid must be a whole number from 0 to termYears", {
    yearsPaid: p.yearsPaid,
    termYears: p.termYears,
  });
}

function validate(input: M2Input): void {
  assertInput(typeof input === "object" && input !== null, "M2Input must be an object");
  assertInput(isFiniteNumber(input.age) && input.age >= AGE_MIN && input.age <= AGE_MAX, `age must be between ${AGE_MIN} and ${AGE_MAX}`, { age: input.age });
  assertInput(Array.isArray(input.dependents) && input.dependents.every((d) => DEPENDENTS.includes(d)), "dependents must be a list of partner, children, parents", {
    dependents: input.dependents,
  });
  assertInput(typeof input.smoker === "boolean", "smoker must be true or false", { smoker: input.smoker });
  for (const k of ["takeHome", "liquidSavings", "existingLifeCover", "debts", "educationGoals", "existingHealthCover"] as const) {
    assertInput(money(input[k]), `${k} must be zero or more`, { [k]: input[k] });
  }
  if (input.investments !== undefined) assertInput(money(input.investments), "investments must be zero or more", { investments: input.investments });
  for (const k of ["childrenCount", "parentsCount"] as const) {
    const v = input[k];
    if (v !== undefined) assertInput(Number.isInteger(v) && v >= 0 && v <= COUNT_MAX, `${k} must be a whole number from 0 to ${COUNT_MAX}`, { [k]: v });
  }
  if (input.parentAge !== undefined) {
    assertInput(isFiniteNumber(input.parentAge) && input.parentAge >= 0 && input.parentAge <= PERSON_AGE_MAX, `parentAge must be between 0 and ${PERSON_AGE_MAX}`, { parentAge: input.parentAge });
  }
  if (input.coverToAge !== undefined) {
    assertInput(isFiniteNumber(input.coverToAge) && input.coverToAge >= AGE_MIN && input.coverToAge <= AGE_MAX, `coverToAge must be between ${AGE_MIN} and ${AGE_MAX}`, {
      coverToAge: input.coverToAge,
    });
  }
  if (input.incomeShare !== undefined) {
    assertInput(isFiniteNumber(input.incomeShare) && input.incomeShare >= 0 && input.incomeShare <= 1, "incomeShare must be between 0 and 1", { incomeShare: input.incomeShare });
  }
  if (input.healthCovered !== undefined) {
    assertInput(Array.isArray(input.healthCovered) && input.healthCovered.every((p) => COVER_PEOPLE.includes(p)), "healthCovered must be a list of self, partner, child, parent", {
      healthCovered: input.healthCovered,
    });
  }
  if (input.policy !== undefined) validatePolicy(input.policy);
}

/**
 * Present value of a yearly payment that starts at `payment` (end of year 1) and grows at `g`,
 * for `years` years, discounted at `r`: payment / (r − g) × (1 − ((1 + g) / (1 + r))^years).
 * r = g → payment × years / (1 + r).
 */
export function growingAnnuityPV(payment: Money, r: Rate, g: Rate, years: number): number {
  assertInput(isFiniteNumber(payment) && isFiniteNumber(r) && isFiniteNumber(g) && isFiniteNumber(years), "growingAnnuityPV needs finite inputs", { payment, r, g, years });
  assertInput(r > -1, "growingAnnuityPV needs a discount rate above −100%", { r });
  if (years <= 0 || payment === 0) return 0;
  if (Math.abs(r - g) < 1e-12) return (payment * years) / (1 + r);
  return (payment / (r - g)) * (1 - ((1 + g) / (1 + r)) ** years);
}

/** Future value of `payment` paid at the start of each year for `years` years at `r` (annuity due). */
export function annuityDueFV(payment: Money, r: Rate, years: number): number {
  assertInput(isFiniteNumber(payment) && isFiniteNumber(r) && isFiniteNumber(years), "annuityDueFV needs finite inputs", { payment, r, years });
  if (years <= 0) return 0;
  if (r === 0) return payment * years;
  return payment * (((1 + r) ** years - 1) / r) * (1 + r);
}

/**
 * Internal rate of return of `premium` paid at the start of each of `termYears` years against
 * `maturity` received at the end of the term, by bisection on −50%…100%. No root there → 0.
 */
export function policyIrr(premium: Money, termYears: number, maturity: Money): Rate {
  if (!(premium > 0) || !(termYears > 0)) return 0;
  const npv = (r: number): number => {
    let pv = maturity / (1 + r) ** termYears;
    for (let t = 0; t < termYears; t++) pv -= premium / (1 + r) ** t;
    return pv;
  };
  let lo = IRR_LO;
  let hi = IRR_HI;
  let fLo = npv(lo);
  const fHi = npv(hi);
  if (!Number.isFinite(fLo) || !Number.isFinite(fHi)) return 0;
  if (fLo === 0) return lo;
  if (fHi === 0) return hi;
  if (Math.sign(fLo) === Math.sign(fHi)) return 0;
  for (let i = 0; i < 200 && hi - lo > 1e-12; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid);
    if (fMid === 0) return mid;
    if (Math.sign(fMid) === Math.sign(fLo)) {
      lo = mid;
      fLo = fMid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

/** First band whose maxAge ≥ age; above the last band, the last one. */
export function bandFor(bands: readonly PremiumBand[], age: number): PremiumBand {
  const found = bands.find((b) => b.maxAge >= age);
  const last = bands[bands.length - 1];
  if (found) return found;
  if (last) return last;
  throw new EngineError("MISSING_RATE", "premium table has no bands");
}

/** A JSON row when it exists and has the expected shape (recorded as an assumption); else undefined. */
function readTable<T>(ex: ExplainBuilder, rates: RatesSnapshot, key: RateKey): T | undefined {
  if (rates.rows[key] === undefined) return undefined;
  const row = ex.useRow(key);
  return jsonShapeOk(key, row.valueJson) ? (row.valueJson as T) : undefined;
}

/** People to cover: kinds from healthCovered (or self + dependents), children and parents by count. */
function coveredPeople(input: M2Input): CoverPerson[] {
  const kinds = new Set<CoverPerson>(
    input.healthCovered ??
      (["self", ...input.dependents.map((d): CoverPerson => (d === "partner" ? "partner" : d === "children" ? "child" : "parent"))] as CoverPerson[]),
  );
  const out: CoverPerson[] = [];
  for (const kind of COVER_PEOPLE) {
    if (!kinds.has(kind)) continue;
    const n = kind === "child" ? (input.childrenCount ?? DEFAULT_CHILDREN) : kind === "parent" ? (input.parentsCount ?? DEFAULT_PARENTS) : 1;
    for (let i = 0; i < n; i++) out.push(kind);
  }
  return out;
}

function personAge(kind: CoverPerson, input: M2Input): number {
  switch (kind) {
    case "self":
    case "partner":
      return input.age;
    case "child":
      return CHILD_AGE;
    case "parent":
      return input.parentAge ?? input.age + PARENT_AGE_GAP;
  }
}

/** Gap status: red when more than half the cover is missing, amber for any gap, else green. */
function gapStatus(gap: Money, cover: Money): Status {
  if (gap > 0.5 * cover && gap > 0) return "red";
  if (gap > 0) return "amber";
  return "green";
}

const RANK: Record<Status, number> = { green: 0, amber: 1, red: 2 };
const worst = (a: Status, b: Status): Status => (RANK[a] >= RANK[b] ? a : b);

export function computeInsurance(input: M2Input, rates: RatesSnapshot, today: ISODate): M2Result {
  validate(input);
  const ex = createExplain(rates, today);
  const steps = roundingFor(rates);
  const round = (x: number, kind: RoundKind): Money => roundMoney(x, kind, steps);
  const step = (id: M2StepId, inputs: Record<string, number | string>, raw: number, rounded: number, unit: ExplainUnit = "bdt"): number =>
    ex.step({ id, inputs, raw, rounded, unit });

  const { age, takeHome } = input;
  const investments = input.investments ?? 0;
  const hasDependents = input.dependents.length > 0;
  const needed = hasDependents || input.debts > 0;
  if (!needed) ex.note("m2.note.noDependents");
  else if (!hasDependents) ex.note("m2.note.debtsOnly");

  // ── Life cover ───────────────────────────────────────────────────────────────
  const coverToAge = input.coverToAge ?? ex.use("insurance_cover_to_age");
  const yearsRaw = coverToAge - age;
  const yearsCovered = step("m2.years", { ageYears: age, coverToAgeYears: coverToAge }, yearsRaw, Math.max(0, yearsRaw), "years");

  const incomeShare = input.incomeShare ?? ex.use("insurance_income_share");
  const inflation = ex.use("inflation_projection");
  const fdr = instrumentNominal(rates, "fdr_1y");
  const nominal = ex.use(fdr.rateKey);
  const tax = ex.use(fdr.taxKey);
  const discount = applyTax(nominal, tax);
  const yearlyNeed = takeHome * 12 * incomeShare;
  // Only dependents need the income replaced; debts alone are covered as a lump.
  const incomeNeedRaw = hasDependents ? growingAnnuityPV(yearlyNeed, discount, inflation, yearsCovered) : 0;
  const incomeNeed = step(
    "m2.incomeNeed",
    { takeHome, incomeShare, yearlyNeed, inflation, nominal, tax, afterTax: discount, coveredYears: yearsCovered },
    incomeNeedRaw,
    round(incomeNeedRaw, "lump"),
  );

  const coverRaw = needed ? Math.max(0, incomeNeed + input.debts + input.educationGoals - input.liquidSavings - investments) : 0;
  const lifeCover = step(
    "m2.lifeCover",
    { incomeNeed, debts: input.debts, educationGoals: input.educationGoals, liquidSavings: input.liquidSavings, investments },
    coverRaw,
    round(coverRaw, "lump"),
  );

  const lifeGapRaw = Math.max(0, lifeCover - input.existingLifeCover);
  const lifeGap = step("m2.lifeGap", { cover: lifeCover, existingLifeCover: input.existingLifeCover }, lifeGapRaw, round(lifeGapRaw, "lump"));

  // ── Health cover ─────────────────────────────────────────────────────────────
  const hospitalCost = ex.use("health_hospitalisation_cost");
  const oopShare = ex.use("oop_health_share");
  const publicFloorShare = ex.use("health_public_cover_floor");
  if (oopShare < publicFloorShare) ex.note("m2.note.publicCoverBroad");
  const appliedShare = Math.max(publicFloorShare, oopShare);
  const perStayRaw = hospitalCost * appliedShare;
  const perStay = step("m2.perStay", { hospitalCost, oopShare, publicFloorShare, appliedShare }, perStayRaw, round(perStayRaw, "lump"));

  const weights = readTable<HealthCoverWeights>(ex, rates, "health_cover_weights");
  if (!weights) throw new EngineError("MISSING_RATE", 'Rates row "health_cover_weights" is missing or malformed', { key: "health_cover_weights" });
  const people = coveredPeople(input);
  const weightSum = people.reduce((t, p) => t + weights[p], 0);
  const targetRaw = perStay * weightSum;
  const healthTarget = step("m2.healthTarget", { perStay, peopleCount: people.length, weightCount: weightSum }, targetRaw, round(targetRaw, "lump"));

  const healthGapRaw = Math.max(0, healthTarget - input.existingHealthCover);
  const healthGap = step("m2.healthGap", { target: healthTarget, existingHealthCover: input.existingHealthCover }, healthGapRaw, round(healthGapRaw, "lump"));

  // ── Premiums ─────────────────────────────────────────────────────────────────
  const termTable = readTable<TermPremiumTable>(ex, rates, "insurance_term_premium_table");
  if (!termTable) ex.note("m2.note.noTermSold");
  const smokerMultiple = input.smoker && termTable ? termTable.smokerMultiplier : 1;
  const lifeBand = termTable ? bandFor(termTable.bands, age) : { maxAge: 0, low: 0, high: 0 };
  const termPer = termTable?.per ?? 1;
  const lifeLowRaw = termTable ? (lifeGap / termPer) * lifeBand.low * smokerMultiple : 0;
  const lifeHighRaw = termTable ? (lifeGap / termPer) * lifeBand.high * smokerMultiple : 0;
  const lifeMid = (lifeLowRaw + lifeHighRaw) / 2;
  const lifePremium: PremiumRange = { low: round(lifeLowRaw, "monthly"), high: round(lifeHighRaw, "monthly") };
  step(
    "m2.lifePremium",
    { gap: lifeGap, per: termPer, bandLow: lifeBand.low, bandHigh: lifeBand.high, smokerMultipleCount: smokerMultiple, premiumLow: lifePremium.low, premiumHigh: lifePremium.high },
    lifeMid,
    round(lifeMid, "monthly"),
  );

  const healthTable = readTable<HealthPremiumTable>(ex, rates, "health_premium_table");
  let healthLowRaw = 0;
  let healthHighRaw = 0;
  if (healthTable && weightSum > 0 && healthGap > 0) {
    for (const p of people) {
      const share = (healthGap * weights[p]) / weightSum;
      const band = bandFor(healthTable.bands, personAge(p, input));
      healthLowRaw += (share / healthTable.per) * band.low;
      healthHighRaw += (share / healthTable.per) * band.high;
    }
  }
  const healthMid = (healthLowRaw + healthHighRaw) / 2;
  const healthPremium: PremiumRange = { low: round(healthLowRaw, "monthly"), high: round(healthHighRaw, "monthly") };
  step(
    "m2.healthPremium",
    { gap: healthGap, peopleCount: people.length, per: healthTable?.per ?? 0, premiumLow: healthPremium.low, premiumHigh: healthPremium.high },
    healthMid,
    round(healthMid, "monthly"),
  );

  const monthlyRaw = (lifeMid + healthMid) / 12;
  const monthlyPremiumNeed = step("m2.monthlyNeed", { lifePremium: lifeMid, healthPremium: healthMid, months: 12 }, monthlyRaw, round(monthlyRaw, "monthly"));
  ex.note("m2.note.premiumIndicative");

  // ── Policy check ─────────────────────────────────────────────────────────────
  let policyCheck: M2PolicyCheck | undefined;
  if (input.policy) {
    const p = input.policy;
    const remainingYears = p.termYears - p.yearsPaid;
    const termMid = (lifeBand.low + lifeBand.high) / 2;
    const termRaw = termTable ? (p.sumAssured / termPer) * termMid * smokerMultiple : 0;
    const termPremiumYearly = step(
      "m2.policyTerm",
      { sumAssured: p.sumAssured, per: termPer, bandLow: lifeBand.low, bandHigh: lifeBand.high, smokerMultipleCount: smokerMultiple },
      termRaw,
      round(termRaw, "monthly"),
    );

    const yearlyDifference = Math.max(0, p.annualPremium - termPremiumYearly);
    const investRaw = annuityDueFV(yearlyDifference, discount, remainingYears);
    const investDifferenceFV = step(
      "m2.policyInvest",
      { annualPremium: p.annualPremium, termPremium: termPremiumYearly, yearlyDifference, afterTax: discount, remainingYears },
      investRaw,
      round(investRaw, "lump"),
    );

    const policyMaturity = round(p.expectedMaturity, "exact");
    const difference = investDifferenceFV - policyMaturity;
    const irrRaw = policyIrr(p.annualPremium, p.termYears, p.expectedMaturity);
    const irr = step(
      "m2.policyIrr",
      { annualPremium: p.annualPremium, termYears: p.termYears, expectedMaturity: policyMaturity, investValue: investDifferenceFV, difference },
      irrRaw,
      roundDecimals(irrRaw, 4),
      "rate",
    );

    const verdict: M2PolicyCheck["verdict"] =
      difference === 0 || Math.abs(difference) < SIMILAR_SHARE * policyMaturity ? "similar" : difference > 0 ? "termPlusInvestAhead" : "policyAhead";
    policyCheck = { remainingYears, termPremiumYearly, investDifferenceFV, policyMaturity, difference, policyIrr: irr, verdict };
    ex.note("m2.note.policyNotAdvice");
    ex.note("m2.note.separateInvesting");
  }

  // ── Checklist and status ─────────────────────────────────────────────────────
  const claimSettlement = ex.use("life_claim_settlement_rate");
  const regulatorUrl = rates.country?.institutions.insuranceRegulator?.url ?? "";
  const checklist: M2ChecklistItem[] = M2_CHECK_KEYS.map((key) => ({ key, params: { claimSettlement, regulatorUrl } }));

  const annualTakeHome = takeHome * 12;
  const life: M2LifeResult = {
    needed,
    yearsCovered,
    incomeNeed,
    cover: lifeCover,
    gap: lifeGap,
    incomeMultiple: annualTakeHome > 0 ? roundDecimals(lifeCover / annualTakeHome, 1) : 0,
    premiumYearly: lifePremium,
    status: needed ? gapStatus(lifeGap, lifeCover) : "green",
  };
  const health: M2HealthResult = {
    people: people.length,
    perStay,
    target: healthTarget,
    gap: healthGap,
    premiumYearly: healthPremium,
    status: gapStatus(healthGap, healthTarget),
  };

  const explanation = ex.done();
  return {
    life,
    health,
    monthlyPremiumNeed,
    hasHealthCover: input.existingHealthCover > 0,
    ...(policyCheck ? { policyCheck } : {}),
    checklist,
    status: worst(life.status, health.status),
    notes: [...explanation.notes],
    explain: explanation,
  };
}
