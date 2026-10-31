/**
 * Shape checks for the persisted store (localStorage "taka-plan.v1"). Whatever is in storage, the
 * app gets well-typed data back: a field with the wrong type is dropped (the slice keeps its other
 * answers), a slice that is not an object starts from its initial value, list items that are not
 * objects with a string id are dropped, and drafts are re-hashed and de-duplicated. Pure; no React.
 */
import type { BucketAmounts, Card, CoverPerson, Dependent, ExistingPolicy, Goal, IncomeType, Loan, LoanType, M7IncomeSources, M7Mode, Profile, RetireeType, RiskProfile, Sex } from "@taka/engine";
import { isLocale } from "../i18n/config";
import { capDrafts, dedupeDrafts, hashAnswers } from "./drafts";
import { INITIAL_DATA, type Draft, type DraftAnswers, type M1Overrides, type M2State, type M3State, type M4State, type M6State, type M7State, type OnboardingState, type TakaData } from "./types";

type Rule = "num" | "bool" | "str" | { oneOf: readonly string[] } | { list: Rule } | { obj: Schema };
type Schema = Readonly<Record<string, Rule>>;
/** A schema naming every field of `T` (a field added to the type without a rule is a compile error). */
type SchemaFor<T> = Readonly<Record<keyof Required<T>, Rule>>;

// Copies of the engine's unions (the engine barrel stays out of "/"); `satisfies` keeps them in step.
const INCOME_TYPES = ["salaried", "freelance", "business"] as const satisfies readonly IncomeType[];
const DEPENDENTS = ["partner", "children", "parents"] as const satisfies readonly Dependent[];
const COVER_PEOPLE = ["self", "partner", "child", "parent"] as const satisfies readonly CoverPerson[];
const RISK_PROFILES = ["careful", "balanced", "growth"] as const satisfies readonly RiskProfile[];
const LOAN_TYPES = ["personal", "home", "car", "education", "other"] as const satisfies readonly LoanType[];
const MODES = ["working", "retired"] as const satisfies readonly M7Mode[];
const SEXES = ["male", "female"] as const satisfies readonly Sex[];
const RETIREE_TYPES = ["government", "private"] as const satisfies readonly RetireeType[];

const PROFILE: SchemaFor<Profile> = {
  age: "num",
  incomeType: { oneOf: INCOME_TYPES },
  takeHome: "num",
  essentials: "num",
  dependents: { list: { oneOf: DEPENDENTS } },
  hasDebt: "bool",
};
const M1: SchemaFor<M1Overrides> = { soleEarner: "bool", hasHealthInsurance: "bool", liquidSavings: "num", monthsOverride: "num", buildMonths: "num" };
const POLICY: SchemaFor<ExistingPolicy> = { annualPremium: "num", sumAssured: "num", termYears: "num", yearsPaid: "num", expectedMaturity: "num", surrenderValue: "num" };
const M2: SchemaFor<M2State> = {
  smoker: "bool",
  coverToAge: "num",
  incomeShare: "num",
  childrenCount: "num",
  youngestChildAge: "num",
  parentsCount: "num",
  parentAge: "num",
  investments: "num",
  existingLifeCover: "num",
  existingHealthCover: "num",
  healthCovered: { list: { oneOf: COVER_PEOPLE } },
  policy: { obj: POLICY },
};
const M3: SchemaFor<Omit<M3State, "loans" | "cards">> = { extraMonthly: "num", scenario: { obj: { annualRate: "num", months: "num" } } };
const LOAN: SchemaFor<Loan> = { id: "str", type: { oneOf: LOAN_TYPES }, outstanding: "num", annualRate: "num", emi: "num", monthsLeft: "num" };
const CARD: SchemaFor<Card> = { id: "str", balance: "num", limit: "num", annualRate: "num", paysInFull: "bool" };
const M4: SchemaFor<M4State> = { savingsRate: "num", payday: "num", last6Incomes: { list: "num" } };
const GOAL: SchemaFor<Goal> = { id: "str", name: "str", cost: "num", years: "num", type: "str" };
const BUCKETS: SchemaFor<BucketAmounts> = { equity: "num", gold: "num", fixedIncome: "num" };
const M6: SchemaFor<M6State> = {
  risk: { obj: { ageBand: "num", incomeStability: "num", horizon: "num", reaction: "num" } },
  // Unknown profile names are dropped rather than trusted.
  profileOverride: { oneOf: RISK_PROFILES },
  goldShare: "num",
  horizonYears: "num",
  lumpSum: "num",
  monthly: "num",
  holdings: { obj: BUCKETS },
  newMoney: "num",
  propertyValue: "num",
  directShares: "bool",
};
const SOURCES: SchemaFor<M7IncomeSources> = {
  providentFund: { obj: { balance: "num", monthlyContribution: "num", rate: "num" } },
  gratuity: { obj: { yearsOfService: "num", basicMonthly: "num", employerDaysPerYear: "num" } },
  publicPension: { obj: { monthlyContribution: "num", expectedMonthly: "num" } },
  fixedPensionMonthly: "num",
  rentMonthly: "num",
  oldAgeAllowanceEligible: "bool",
  familySupportMonthly: "num",
};
const M7: SchemaFor<M7State> = {
  mode: { oneOf: MODES },
  sex: { oneOf: SEXES },
  retirementAge: "num",
  planToAge: "num",
  monthlySpending: "num",
  savings: "num",
  monthlySaving: "num",
  sources: { obj: SOURCES },
  retireeType: { oneOf: RETIREE_TYPES },
  otherMonthlyIncome: "num",
};

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/** The value when it follows `rule`, else undefined (nested objects keep their valid fields). */
function check(rule: Rule, v: unknown): unknown {
  if (rule === "num") return typeof v === "number" && Number.isFinite(v) ? v : undefined;
  if (rule === "bool") return typeof v === "boolean" ? v : undefined;
  if (rule === "str") return typeof v === "string" ? v : undefined;
  if ("oneOf" in rule) return typeof v === "string" && rule.oneOf.includes(v) ? v : undefined;
  if ("list" in rule) {
    if (!Array.isArray(v)) return undefined;
    const out: unknown[] = [];
    for (const item of v) {
      const c = check(rule.list, item);
      if (c !== undefined) out.push(c);
    }
    return out;
  }
  return isPlainObject(v) ? pick(rule.obj, v) : undefined;
}

/** Only the schema's keys, each checked; unknown keys are dropped. */
function pick(schema: Schema, v: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, rule] of Object.entries(schema)) {
    const c = check(rule, v[k]);
    if (c !== undefined) out[k] = c;
  }
  return out;
}

function slice<T>(schema: Schema, v: unknown): T {
  return (isPlainObject(v) ? pick(schema, v) : {}) as T;
}

/** List items that are objects with a non-empty string id, each with its valid fields only. */
function items<T>(schema: Schema, v: unknown, required: readonly string[]): T[] {
  if (!Array.isArray(v)) return [];
  const out: T[] = [];
  for (const x of v) {
    if (!isPlainObject(x)) continue;
    const p = pick(schema, x);
    if (typeof p.id !== "string" || p.id === "" || required.some((k) => p[k] === undefined)) continue;
    out.push(p as T);
  }
  return out;
}

function country(v: unknown, fallback: string): string {
  return typeof v === "string" && /^[A-Z]{2}$/.test(v) ? v : fallback;
}

function onboarding(v: unknown): OnboardingState {
  const o = isPlainObject(v) ? v : {};
  const step = typeof o.step === "number" && [1, 2, 3, 4, 5].includes(o.step) ? (o.step as OnboardingState["step"]) : 1;
  return {
    step,
    completed: o.completed === true,
    disclaimerSeen: o.disclaimerSeen === true,
  };
}

/** The answer slices of a draft or of the store, each checked. */
export function sanitizeAnswers(v: unknown, fallbackCountry = INITIAL_DATA.country): DraftAnswers {
  const p = isPlainObject(v) ? v : {};
  const m3 = isPlainObject(p.m3) ? p.m3 : {};
  const m5 = isPlainObject(p.m5) ? p.m5 : {};
  return {
    country: country(p.country, fallbackCountry),
    locale: isLocale(p.locale) ? p.locale : INITIAL_DATA.locale,
    profile: slice(PROFILE, p.profile),
    m1: slice(M1, p.m1),
    m2: slice(M2, p.m2),
    m3: {
      ...slice<Omit<DraftAnswers["m3"], "loans" | "cards">>(M3, m3),
      loans: items(LOAN, m3.loans, ["type", "outstanding", "annualRate", "emi", "monthsLeft"]),
      cards: items(CARD, m3.cards, ["balance", "limit", "paysInFull"]),
    },
    m4: slice(M4, p.m4),
    m5: { goals: items(GOAL, m5.goals, ["name", "cost", "years", "type"]) },
    m6: slice(M6, p.m6),
    m7: slice(M7, p.m7),
  };
}

const ISO = /^\d{4}-\d{2}-\d{2}T/;

/** Valid drafts only, re-hashed (the stored hash is never trusted), de-duplicated, newest first. */
export function sanitizeDrafts(v: unknown): Draft[] {
  if (!Array.isArray(v)) return [];
  const out: Draft[] = [];
  for (const x of v) {
    if (!isPlainObject(x) || typeof x.id !== "string" || x.id === "" || !isPlainObject(x.answers)) continue;
    const answers = sanitizeAnswers(x.answers);
    const updatedAt = typeof x.updatedAt === "string" && ISO.test(x.updatedAt) ? x.updatedAt : "1970-01-01T00:00:00.000Z";
    const createdAt = typeof x.createdAt === "string" && ISO.test(x.createdAt) ? x.createdAt : updatedAt;
    const name = typeof x.name === "string" && x.name.trim() ? x.name.trim().slice(0, 80) : undefined;
    out.push({ id: x.id, createdAt, updatedAt, ...(name ? { name } : {}), hash: hashAnswers(answers), answers });
  }
  // A tampered or very old list may be long: the cap drops the oldest unnamed drafts, never a named one.
  return capDrafts(dedupeDrafts(out));
}

/** Whole persisted state, checked field by field. Anything unusable falls back to INITIAL_DATA's value. */
export function sanitizeData(v: unknown): TakaData {
  const p = isPlainObject(v) ? v : {};
  const answers = sanitizeAnswers(p);
  return {
    schemaVersion: 2,
    ...answers,
    onboarding: onboarding(p.onboarding),
    drafts: sanitizeDrafts(p.drafts),
  };
}
