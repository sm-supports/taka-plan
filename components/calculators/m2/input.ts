/**
 * Pure helpers for the M2 screen: the engine input built exactly as the plan builds it
 * (profileToPlanInput over the store), the default people to cover, and the policy draft rules.
 * No React.
 */
import { hasOverrideAnswers, profileToPlanInput, type CoverPerson, type Dependent, type ExistingPolicy, type M1Input, type M2Input } from "@taka/engine";
import { selectPlanOverrides, selectProfile } from "@/lib/store/selectors";
import type { M2State, TakaData } from "@/lib/store/types";

/** UI bounds. */
export const COVER_TO_AGE_MIN = 50;
export const COVER_TO_AGE_MAX = 70;
export const INCOME_SHARE_MIN = 40;
export const INCOME_SHARE_MAX = 100;
export const CHILDREN_MAX = 10;
export const PARENTS_MAX = 4;
export const PARENT_AGE_MIN = 35;
export const PARENT_AGE_MAX = 100;
export const POLICY_TERM_MAX = 50;
/** The engine's own defaults (m2/insurance.ts), shown until the user answers. */
export const DEFAULT_CHILDREN = 1;
export const DEFAULT_PARENTS = 2;
export const PARENT_AGE_GAP = 28;

export const COVER_PEOPLE: readonly CoverPerson[] = ["self", "partner", "child", "parent"];

/** The engine's default: self plus every dependent. */
export function defaultCovered(dependents: readonly Dependent[]): CoverPerson[] {
  const kinds = new Set<CoverPerson>(["self"]);
  for (const d of dependents) kinds.add(d === "partner" ? "partner" : d === "children" ? "child" : "parent");
  return COVER_PEOPLE.filter((p) => kinds.has(p));
}

/** True when the store's m2 slice holds at least one real answer (the plan's presence rule). */
export function hasM2Answers(m2: M2State): boolean {
  return hasOverrideAnswers(m2);
}

/**
 * The M2 input for the current store, the same one the plan computes (age, dependents, take-home,
 * debts, education goals and liquid savings from the profile and the other modules). Null while the
 * onboarding profile is incomplete. While the m2 slice is still empty (first questions), the
 * engine's defaults stand in so a result can show; nothing is written.
 */
export function buildM2Input(data: TakaData): M2Input | null {
  const profile = selectProfile(data);
  if (!profile) return null;
  const overrides = selectPlanOverrides(data);
  const m1: M1Input = {
    essentials: profile.essentials,
    incomeType: profile.incomeType,
    dependents: profile.dependents,
    soleEarner: overrides.m1.soleEarner ?? profile.dependents.length > 0,
    hasHealthInsurance: overrides.m1.hasHealthInsurance ?? false,
    liquidSavings: overrides.m1.liquidSavings ?? 0,
  };
  // profileToPlanInput builds M2 only when the slice has an answer; smoker: false is its own default.
  const m2 = { smoker: false, ...(overrides.m2 ?? {}) };
  return profileToPlanInput(profile, { ...overrides, m1, m2 }).m2 ?? null;
}

/** The five policy-checker boxes plus the optional surrender value, each possibly empty while the user types. */
export interface PolicyDraft {
  annualPremium: number | null;
  sumAssured: number | null;
  termYears: number | null;
  yearsPaid: number | null;
  expectedMaturity: number | null;
  /** Optional: what the insurer pays today if the policy is stopped. */
  surrenderValue?: number | null;
}

export const EMPTY_POLICY: PolicyDraft = { annualPremium: null, sumAssured: null, termYears: null, yearsPaid: null, expectedMaturity: null, surrenderValue: null };

export function policyToDraft(p: ExistingPolicy | undefined): PolicyDraft {
  return p ? { ...p, surrenderValue: p.surrenderValue ?? null } : EMPTY_POLICY;
}

/** A complete, engine-valid policy, or null. */
export function draftToPolicy(d: PolicyDraft): ExistingPolicy | null {
  const { annualPremium, sumAssured, termYears, yearsPaid, expectedMaturity } = d;
  if (annualPremium === null || sumAssured === null || termYears === null || yearsPaid === null || expectedMaturity === null) return null;
  if (!(annualPremium > 0) || sumAssured < 0 || expectedMaturity < 0) return null;
  if (!Number.isInteger(termYears) || termYears < 1 || termYears > POLICY_TERM_MAX) return null;
  if (!Number.isInteger(yearsPaid) || yearsPaid < 0 || yearsPaid > termYears) return null;
  const sv = d.surrenderValue;
  return { annualPremium, sumAssured, termYears, yearsPaid, expectedMaturity, ...(sv !== null && sv !== undefined && sv >= 0 ? { surrenderValue: sv } : {}) };
}
