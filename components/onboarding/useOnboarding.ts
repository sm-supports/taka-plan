"use client";
/**
 * Shared onboarding state: the profile with PRD defaults applied, the current step's
 * validation, and the navigation helpers every step screen uses.
 */
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import type { Profile } from "@taka/engine";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";
import { clampStep, PROFILE_DEFAULTS, TOTAL_STEPS, validateStep, withProfileDefaults, type OnboardingStep, type Validation } from "@/lib/onboarding/validate";

export interface Onboarding {
  step: OnboardingStep;
  total: number;
  locale: string;
  /** The stored profile with defaults filled in for anything untouched. */
  profile: Partial<Profile>;
  validation: Validation;
  setProfile: (patch: Partial<Profile>) => void;
  next: () => void;
  back: () => void;
  /** Step 5's "See my plan": marks onboarding complete and opens the plan. */
  finish: () => void;
}

export function useOnboarding(step: OnboardingStep): Onboarding {
  const router = useRouter();
  const { locale } = useT();
  const stored = useTakaStore((s) => s.profile);
  const storedStep = useTakaStore((s) => s.onboarding.step);
  const setProfile = useTakaStore((s) => s.setProfile);
  const setOnboardingStep = useTakaStore((s) => s.setOnboardingStep);
  const completeOnboarding = useTakaStore((s) => s.completeOnboarding);

  const profile = useMemo(() => withProfileDefaults(stored), [stored]);
  const validation = useMemo(() => validateStep(step, profile), [step, profile]);

  // Persist the PRD defaults the first time a question is reached, so a reload keeps them.
  useEffect(() => {
    const patch: Partial<Profile> = {};
    if (stored.age === undefined) patch.age = PROFILE_DEFAULTS.age;
    if (stored.incomeType === undefined) patch.incomeType = PROFILE_DEFAULTS.incomeType;
    if (stored.dependents === undefined) patch.dependents = PROFILE_DEFAULTS.dependents;
    if (stored.hasDebt === undefined) patch.hasDebt = PROFILE_DEFAULTS.hasDebt;
    if (Object.keys(patch).length > 0) setProfile(patch);
  }, [stored.age, stored.incomeType, stored.dependents, stored.hasDebt, setProfile]);

  // Never let a deep link skip an unanswered question; otherwise remember where the user is.
  useEffect(() => {
    const allowed = clampStep(step, profile);
    if (allowed !== step) {
      router.replace(`/${locale}/start/${allowed}`);
      return;
    }
    if (storedStep !== step) setOnboardingStep(step);
  }, [step, profile, storedStep, locale, router, setOnboardingStep]);

  const go = useCallback(
    (target: number) => {
      const clamped = Math.min(TOTAL_STEPS, Math.max(1, target)) as OnboardingStep;
      setOnboardingStep(clamped);
      router.push(`/${locale}/start/${clamped}`);
    },
    [locale, router, setOnboardingStep],
  );

  const next = useCallback(() => {
    if (validation.ok) go(step + 1);
  }, [go, step, validation.ok]);

  const back = useCallback(() => go(step - 1), [go, step]);

  const finish = useCallback(() => {
    if (!validation.ok) return;
    completeOnboarding();
    router.push(`/${locale}/plan`);
  }, [completeOnboarding, locale, router, validation.ok]);

  return { step, total: TOTAL_STEPS, locale, profile, validation, setProfile, next, back, finish };
}
