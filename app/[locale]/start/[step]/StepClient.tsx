"use client";
/** /{locale}/start/[step]: one of the five onboarding questions; an unknown step goes back to question 1. */
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { OnboardingStep } from "@/components/onboarding/OnboardingStep";
import { Skeleton } from "@/components/ui/Skeleton";
import { useT } from "@/lib/i18n/useT";
import { parseStep } from "@/lib/onboarding/validate";

export function StepClient() {
  const params = useParams<{ locale: string; step: string }>();
  const router = useRouter();
  const { locale } = useT();
  const step = parseStep(params?.step);

  useEffect(() => {
    if (step === null) router.replace(`/${locale}/start/1`);
  }, [step, locale, router]);

  if (step === null) return <Skeleton page />;
  return <OnboardingStep step={step} />;
}
