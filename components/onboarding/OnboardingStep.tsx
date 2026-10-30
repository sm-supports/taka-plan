"use client";
/**
 * One onboarding question inside a StepFrame: progress line, the question body, back/next.
 * Step 1 shows the disclaimer modal until accepted; step 5's CTA finishes onboarding.
 */
import { useMemo } from "react";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { StepFrame } from "@/components/ui/StepFrame";
import { I18nProvider } from "@/lib/i18n/provider";
import type { Dictionary } from "@/lib/i18n/types";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import type { OnboardingStep as StepNumber } from "@/lib/onboarding/validate";
import { useTakaStore } from "@/lib/store/store";
import { StepAge } from "./StepAge";
import { StepDebt } from "./StepDebt";
import { StepDependents } from "./StepDependents";
import { StepEssentials } from "./StepEssentials";
import { StepIncome } from "./StepIncome";
import { useOnboarding } from "./useOnboarding";

/**
 * StepFrame (frozen) reads `common.next` / `common.back`, which the common namespace spells
 * `common.button.next` / `common.button.back`. Until that is reconciled, give the frame a
 * dictionary view that carries both spellings so no raw key ever shows on screen.
 */
function withFrameKeys(dict: Dictionary): Dictionary {
  const common = dict.common as Dictionary["common"] & { next?: string; back?: string };
  if (common.next && common.back) return dict;
  return { ...dict, common: { ...dict.common, next: dict.onboarding.cta.next, back: dict.onboarding.cta.back } as Dictionary["common"] };
}

export function OnboardingStep({ step }: { step: StepNumber }) {
  const { t, locale, dict } = useT();
  const { number } = useFormat();
  const ob = useOnboarding(step);
  const disclaimerSeen = useTakaStore((s) => s.onboarding.disclaimerSeen);
  const markDisclaimerSeen = useTakaStore((s) => s.markDisclaimerSeen);
  const frameDict = useMemo(() => withFrameKeys(dict), [dict]);

  const last = step === ob.total;
  const body =
    step === 1 ? <StepAge {...ob} /> : step === 2 ? <StepIncome {...ob} /> : step === 3 ? <StepEssentials {...ob} /> : step === 4 ? <StepDependents {...ob} /> : <StepDebt {...ob} />;

  return (
    <I18nProvider locale={locale} dict={frameDict}>
      <StepFrame
        step={step}
        total={ob.total}
        title={t(`onboarding.step.${step}.title`)}
        hint={t(`onboarding.step.${step}.hint`)}
        onBack={step > 1 ? ob.back : undefined}
        onNext={last ? ob.finish : ob.next}
        nextLabel={last ? t("onboarding.cta.seePlan") : t("onboarding.cta.next")}
        nextDisabled={!ob.validation.ok}
      >
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-700" aria-live="polite">
          {t("onboarding.progress", { n: number(step) })}
        </p>
        {body}
      </StepFrame>
      {step === 1 && <Disclaimer variant="modal" open={!disclaimerSeen} onAccept={markDisclaimerSeen} />}
    </I18nProvider>
  );
}
