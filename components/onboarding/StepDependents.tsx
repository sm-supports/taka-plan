"use client";
/** Question 4: who depends on the income. Multi-select; "No one" clears the rest. */
import { ChoiceButtons } from "@/components/ui/ChoiceButtons";
import { useT } from "@/lib/i18n/useT";
import { choicesToDependents, DEPENDENT_CHOICES, dependentsToChoices, type DependentChoice } from "@/lib/onboarding/validate";
import { Notice } from "./Notice";
import type { Onboarding } from "./useOnboarding";

export function StepDependents({ profile, setProfile, validation }: Onboarding) {
  const { t } = useT();
  const choices = dependentsToChoices(profile.dependents);

  return (
    <div className="flex flex-col gap-5">
      <ChoiceButtons<DependentChoice>
        label={t("onboarding.step.4.label")}
        multi
        options={DEPENDENT_CHOICES.map((c) =>
          c === "none"
            ? { value: c, label: t("onboarding.step.4.none") }
            : { value: c, label: t(`onboarding.step.4.option.${c}`), hint: t(`onboarding.step.4.optionHint.${c}`) },
        )}
        value={choices}
        onChange={(next) => {
          const list = Array.isArray(next) ? next : [next];
          setProfile({ dependents: choicesToDependents(choices, list) });
        }}
      />
      {!validation.ok && <Notice tone="red">{t("onboarding.validation.pickOne")}</Notice>}
    </div>
  );
}
