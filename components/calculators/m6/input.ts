/**
 * Pure helpers for the M6 screens: store answers → M6Input (through the engine's own
 * profileToPlanInput, so the page shows exactly what the plan uses), the gate from the plan, and
 * the defaults the first-visit flow prefills.
 */
import { hasOverrideAnswers, profileToPlanInput, type Card, type IncomeType, type M6Input, type M6RiskAnswers, type Profile, type RiskAnswer } from "@taka/engine";
import type { M6State } from "@/lib/store/types";

export const RISK_KEYS = ["ageBand", "incomeStability", "horizon", "reaction"] as const satisfies readonly (keyof M6RiskAnswers)[];
export type RiskKey = (typeof RISK_KEYS)[number];
export const RISK_ANSWERS: readonly RiskAnswer[] = [0, 1, 2];

/** Age used before the five starting questions are answered (display only). */
export const FALLBACK_AGE = 30;
/** Horizon slider bounds (years). 0 = needed within a year. */
export const HORIZON_MIN = 0;
export const HORIZON_MAX = 40;

/** Same bands as the engine's plan defaults: 50+ → 0, 35–49 → 1, under 35 → 2. */
export function ageBandFor(age: number): RiskAnswer {
  return age >= 50 ? 0 : age >= 35 ? 1 : 2;
}

/** business → 0, freelance → 1, salaried → 2. */
export function incomeAnswerFor(incomeType: IncomeType): RiskAnswer {
  return incomeType === "business" ? 0 : incomeType === "freelance" ? 1 : 2;
}

/** Years the amounts screen suggests for each horizon answer (under 5 / 5–10 / over 10). */
export function yearsForHorizonAnswer(a: RiskAnswer | undefined): number {
  return a === 0 ? 3 : a === 1 ? 7 : 15;
}

/** The horizon answer for a number of years (under 5 → 0, 5–10 → 1, over 10 → 2): one source, so the two cannot contradict. */
export function horizonAnswerFor(years: number): RiskAnswer {
  return years < 5 ? 0 : years <= 10 ? 1 : 2;
}

/** A card balance carried from month to month (the engine's gate rule). */
export function carriesCardDebt(cards: readonly Card[]): boolean {
  return cards.some((c) => !c.paysInFull && c.balance > 0);
}

export interface Gate {
  hasEmergencyFund: boolean;
  hasCardDebt: boolean;
}

/** True when the store holds at least one real M6 answer (the plan's presence rule). */
export function hasM6Answers(m6: M6State): boolean {
  return hasOverrideAnswers(m6);
}

/** A complete profile, or a stand-in built from what onboarding has so far (age and income only matter to M6). */
function profileOrStandIn(profile: Profile | null, partial: Partial<Profile>): Profile {
  if (profile) return profile;
  return {
    age: typeof partial.age === "number" && partial.age >= 18 && partial.age <= 100 ? partial.age : FALLBACK_AGE,
    incomeType: partial.incomeType ?? "salaried",
    takeHome: 1,
    essentials: 0,
    dependents: [],
    hasDebt: false,
  };
}

/**
 * The M6 input the plan would run for these answers, with the gate taken from the plan.
 * null while the store holds no M6 answer yet.
 */
export function m6InputFor(m6: M6State, profile: Profile | null, partial: Partial<Profile>, gate: Gate): M6Input | null {
  if (!hasM6Answers(m6)) return null;
  const input = profileToPlanInput(profileOrStandIn(profile, partial), { m6 }).m6;
  return input ? { ...input, gate } : null;
}

/** The four risk answers as the engine fills them (given answers win; the rest follow the profile). */
export function filledRisk(m6: M6State, age: number, incomeType: IncomeType, horizonYears: number): M6RiskAnswers {
  const r = m6.risk ?? {};
  return {
    ageBand: r.ageBand ?? ageBandFor(age),
    incomeStability: r.incomeStability ?? incomeAnswerFor(incomeType),
    horizon: r.horizon ?? horizonAnswerFor(horizonYears),
    reaction: r.reaction ?? 1,
  };
}

/** Percent text for a weight: whole points when exact, else one decimal. */
export function weightDecimals(w: number): number {
  return Math.abs(w * 100 - Math.round(w * 100)) < 1e-9 ? 0 : 1;
}
