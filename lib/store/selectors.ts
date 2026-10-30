// Pure selectors turning store data into engine inputs. No React, no I/O.
import type { M1Input, M3Input, M4Input, M5Input, Profile } from "@taka/engine";
import type { TakaData } from "./types";

/** Rough default savings target (20% of take-home) when the M4 result is not yet known. */
const ROUGH_SAVINGS_SHARE = 0.2;

/** True when the user has listed at least one loan or card, whatever onboarding said. */
export function selectHasDebtItems(s: TakaData): boolean {
  return s.m3.loans.length > 0 || s.m3.cards.length > 0;
}

/**
 * The complete onboarding profile, or null while any answer is missing or invalid.
 * `hasDebt` is true as soon as a loan or card exists, so a "no debt" onboarding answer never hides
 * debt the user added later in M3 (the engine only runs M3 when the profile says hasDebt).
 */
export function selectProfile(s: TakaData): Profile | null {
  const { age, incomeType, takeHome, essentials, dependents } = s.profile;
  const hasDebt = s.profile.hasDebt === undefined ? undefined : s.profile.hasDebt || selectHasDebtItems(s);
  if (typeof age !== "number" || !Number.isFinite(age)) return null;
  if (incomeType === undefined) return null;
  if (typeof takeHome !== "number" || !(takeHome > 0)) return null;
  if (typeof essentials !== "number" || !(essentials >= 0)) return null;
  if (!Array.isArray(dependents)) return null;
  if (typeof hasDebt !== "boolean") return null;
  return { age, incomeType, takeHome, essentials, dependents, hasDebt };
}

export function selectOnboardingDone(s: TakaData): boolean {
  return s.onboarding.completed;
}

export interface PlanOverrides {
  m1: Partial<M1Input>;
  m3?: M3Input;
  m4: M4Input;
  m5?: M5Input;
}

/** Builds the PlanInput module sections from profile + per-module state, filling PRD defaults. */
export function selectPlanOverrides(s: TakaData): PlanOverrides {
  const p = s.profile;
  const dependents = p.dependents ?? [];
  const takeHome = p.takeHome ?? 0;
  const essentials = p.essentials ?? 0;

  const m1: Partial<M1Input> = {
    ...(p.essentials !== undefined ? { essentials: p.essentials } : {}),
    ...(p.incomeType !== undefined ? { incomeType: p.incomeType } : {}),
    dependents,
    soleEarner: s.m1.soleEarner ?? dependents.length > 0,
    hasHealthInsurance: s.m1.hasHealthInsurance ?? false,
    liquidSavings: s.m1.liquidSavings ?? 0,
    ...(s.m1.monthsOverride !== undefined ? { monthsOverride: s.m1.monthsOverride } : {}),
    ...(s.m1.buildMonths !== undefined ? { buildMonths: s.m1.buildMonths } : {}),
  };

  const m4: M4Input = {
    takeHome,
    essentials,
    incomeType: p.incomeType ?? "salaried",
    ...(s.m4.savingsRate !== undefined ? { savingsRate: s.m4.savingsRate } : {}),
    ...(s.m4.payday !== undefined ? { payday: s.m4.payday } : {}),
    ...(s.m4.last6Incomes !== undefined ? { last6Incomes: s.m4.last6Incomes } : {}),
  };

  // Any listed loan or card feeds the plan, regardless of the onboarding hasDebt answer (P5).
  const m3: M3Input | undefined = selectHasDebtItems(s)
    ? {
          takeHome,
          essentials,
          savingsTarget: Math.round(takeHome * ROUGH_SAVINGS_SHARE),
          loans: s.m3.loans,
          cards: s.m3.cards,
          ...(s.m3.extraMonthly !== undefined ? { extraMonthly: s.m3.extraMonthly } : {}),
          ...(s.m3.scenario !== undefined ? { scenario: s.m3.scenario } : {}),
        }
    : undefined;

  const m5: M5Input | undefined = s.m5.goals.length > 0 && p.age !== undefined ? { goals: s.m5.goals, age: p.age } : undefined;

  return { m1, ...(m3 ? { m3 } : {}), m4, ...(m5 ? { m5 } : {}) };
}
