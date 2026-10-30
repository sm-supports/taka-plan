/**
 * Pure onboarding helpers: step parsing, per-question validation, defaults and the
 * "none clears others" rule for dependents. No React, no store, no I/O, so the UI can
 * stay thin and the rules can be unit-tested in the `lib` vitest project.
 */
import type { Dependent, IncomeType, Profile } from "@taka/engine";

export const ONBOARDING_STEPS = [1, 2, 3, 4, 5] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export const TOTAL_STEPS = ONBOARDING_STEPS.length;

/** PRD: age 15..100. */
export const AGE_MIN = 15;
export const AGE_MAX = 100;

/** PRD "no-brainer rules": defaults for everything except income and spending. */
export const PROFILE_DEFAULTS: Pick<Profile, "age" | "incomeType" | "dependents" | "hasDebt"> = {
  age: 30,
  incomeType: "salaried",
  dependents: [],
  hasDebt: false,
};

/** Decade shortcuts shown above the age box: label key → the age they pre-fill. */
export const AGE_DECADES = [
  { key: "under20", age: 18, from: AGE_MIN, to: 19 },
  { key: "twenties", age: 25, from: 20, to: 29 },
  { key: "thirties", age: 35, from: 30, to: 39 },
  { key: "forties", age: 45, from: 40, to: 49 },
  { key: "fifties", age: 55, from: 50, to: 59 },
  { key: "sixtyPlus", age: 65, from: 60, to: AGE_MAX },
] as const;
export type AgeDecadeKey = (typeof AGE_DECADES)[number]["key"];

/** The decade shortcut that contains `age`, or null when the age is out of range or unset. */
export function decadeForAge(age: number | null | undefined): AgeDecadeKey | null {
  if (typeof age !== "number" || !Number.isFinite(age)) return null;
  const hit = AGE_DECADES.find((d) => age >= d.from && age <= d.to);
  return hit ? hit.key : null;
}

/** "/start/3" → 3; anything else (0, 6, "abc", "2.5", undefined) → null. */
export function parseStep(raw: string | string[] | undefined | null): OnboardingStep | null {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (typeof s !== "string" || !/^[1-9]$/.test(s)) return null;
  const n = Number(s);
  return (ONBOARDING_STEPS as readonly number[]).includes(n) ? (n as OnboardingStep) : null;
}

export function isOnboardingStep(n: unknown): n is OnboardingStep {
  return typeof n === "number" && (ONBOARDING_STEPS as readonly number[]).includes(n);
}

/** Dictionary keys under `onboarding.validation`. */
export type ValidationKey = "required" | "number" | "ageRange" | "positiveAmount" | "essentialsAboveIncome" | "pickOne";

export interface Validation {
  ok: boolean;
  /** Blocking problem: Next stays disabled and the message shows in red. */
  error?: ValidationKey;
  /** Non-blocking caution: Next works, the message shows in amber. */
  warning?: ValidationKey;
}

const OK: Validation = { ok: true };

/** Parse a typed age (Latin or Bangla digits, stray spaces) into a whole number, or null. */
export function parseAgeInput(text: string): number | null {
  const t = text.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/\s/g, "");
  if (!/^\d{1,3}$/.test(t)) return null;
  return Number(t);
}

export function validateAge(age: number | null | undefined): Validation {
  if (typeof age !== "number" || !Number.isFinite(age)) return { ok: false, error: "required" };
  if (!Number.isInteger(age)) return { ok: false, error: "number" };
  if (age < AGE_MIN || age > AGE_MAX) return { ok: false, error: "ageRange" };
  return OK;
}

export function validateTakeHome(takeHome: number | null | undefined): Validation {
  if (typeof takeHome !== "number" || !Number.isFinite(takeHome)) return { ok: false, error: "required" };
  if (takeHome <= 0) return { ok: false, error: "positiveAmount" };
  return OK;
}

/** Essentials must be a positive amount; above take-home is allowed but flagged (PRD: plan still works). */
export function validateEssentials(essentials: number | null | undefined, takeHome: number | null | undefined): Validation {
  if (typeof essentials !== "number" || !Number.isFinite(essentials)) return { ok: false, error: "required" };
  if (essentials <= 0) return { ok: false, error: "positiveAmount" };
  if (typeof takeHome === "number" && Number.isFinite(takeHome) && takeHome > 0 && essentials > takeHome) {
    return { ok: true, warning: "essentialsAboveIncome" };
  }
  return OK;
}

export function validateDependents(dependents: readonly Dependent[] | null | undefined): Validation {
  return Array.isArray(dependents) ? OK : { ok: false, error: "pickOne" };
}

export function validateHasDebt(hasDebt: boolean | null | undefined): Validation {
  return typeof hasDebt === "boolean" ? OK : { ok: false, error: "required" };
}

const INCOME_TYPES: readonly IncomeType[] = ["salaried", "freelance", "business"];

export function isIncomeType(x: unknown): x is IncomeType {
  return typeof x === "string" && (INCOME_TYPES as readonly string[]).includes(x);
}

/** Validation for one onboarding step against the (partial) profile. */
export function validateStep(step: OnboardingStep, profile: Partial<Profile>): Validation {
  switch (step) {
    case 1:
      return validateAge(profile.age);
    case 2:
      return isIncomeType(profile.incomeType) ? validateTakeHome(profile.takeHome) : { ok: false, error: "required" };
    case 3:
      return validateEssentials(profile.essentials, profile.takeHome);
    case 4:
      return validateDependents(profile.dependents);
    case 5:
      return validateHasDebt(profile.hasDebt);
  }
}

/** The first step whose answer is missing or invalid, or null when all five are answered. */
export function firstIncompleteStep(profile: Partial<Profile>): OnboardingStep | null {
  for (const step of ONBOARDING_STEPS) {
    if (!validateStep(step, profile).ok) return step;
  }
  return null;
}

/** Where a visitor landing on `/start/{requested}` should actually be: never past the first unanswered question. */
export function clampStep(requested: OnboardingStep, profile: Partial<Profile>): OnboardingStep {
  const first = firstIncompleteStep(profile);
  return first !== null && first < requested ? first : requested;
}

/** The dependents multi-select includes a "none" pseudo-option. */
export type DependentChoice = Dependent | "none";
export const DEPENDENT_CHOICES: readonly DependentChoice[] = ["none", "partner", "children", "parents"];

/** What the ChoiceButtons group shows for a stored `dependents` list: `[]` reads as "none" selected. */
export function dependentsToChoices(dependents: readonly Dependent[] | undefined): DependentChoice[] {
  if (dependents === undefined) return [];
  return dependents.length === 0 ? ["none"] : [...dependents];
}

/**
 * Apply a ChoiceButtons change: tapping "none" clears the others; tapping any real dependent
 * drops "none". Keeps the fixed display order so the stored list is stable.
 */
export function choicesToDependents(previous: readonly DependentChoice[], next: readonly DependentChoice[]): Dependent[] {
  const added = next.find((c) => !previous.includes(c));
  if (added === "none") return [];
  const real = next.filter((c): c is Dependent => c !== "none");
  return (DEPENDENT_CHOICES.filter((c) => c !== "none") as Dependent[]).filter((d) => real.includes(d));
}

/** Mean of the months that were filled in, rounded to whole taka; null when none are. */
export function averageOfFilled(values: ReadonlyArray<number | null>): number | null {
  const filled = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0);
  if (filled.length === 0) return null;
  return Math.round(filled.reduce((a, b) => a + b, 0) / filled.length);
}

/** Profile with PRD defaults filled for anything the user has not answered yet. */
export function withProfileDefaults(profile: Partial<Profile>): Partial<Profile> {
  return {
    ...profile,
    age: profile.age ?? PROFILE_DEFAULTS.age,
    incomeType: profile.incomeType ?? PROFILE_DEFAULTS.incomeType,
    dependents: profile.dependents ?? PROFILE_DEFAULTS.dependents,
    hasDebt: profile.hasDebt ?? PROFILE_DEFAULTS.hasDebt,
  };
}
