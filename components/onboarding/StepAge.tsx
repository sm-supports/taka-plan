"use client";
/** Question 1: age. Decade shortcuts for a one-tap answer, then an exact number box to correct it. */
import { ChoiceButtons } from "@/components/ui/ChoiceButtons";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { AGE_DECADES, AGE_MAX, AGE_MIN, decadeForAge, type AgeDecadeKey } from "@/lib/onboarding/validate";
import { Notice } from "./Notice";
import { NumberBox } from "./NumberBox";
import type { Onboarding } from "./useOnboarding";

export function StepAge({ profile, setProfile, validation }: Onboarding) {
  const { t } = useT();
  const { number } = useFormat();
  const age = typeof profile.age === "number" ? profile.age : null;
  const decade = decadeForAge(age);
  const showError = age !== null && !validation.ok && validation.error !== undefined;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-muted">{t("onboarding.step.1.decadeLabel")}</p>
      <ChoiceButtons<AgeDecadeKey>
        label={t("onboarding.step.1.decadeLabel")}
        columns={2}
        options={AGE_DECADES.map((d) => ({ value: d.key, label: t(`onboarding.step.1.decade.${d.key}`) }))}
        value={decade}
        onChange={(v) => {
          const hit = AGE_DECADES.find((d) => d.key === v);
          if (hit) setProfile({ age: hit.age });
        }}
      />
      <NumberBox
        id="age"
        value={age}
        onChange={(n) => setProfile({ age: n ?? undefined })}
        label={t("onboarding.step.1.label")}
        unit={t("onboarding.step.1.unit")}
        placeholder={t("onboarding.step.1.placeholder")}
        invalid={showError}
        describedBy={showError ? "age-error" : undefined}
      />
      {showError && (
        <Notice tone="red">
          {validation.error === "ageRange" ? t("onboarding.validation.ageRange", { min: number(AGE_MIN), max: number(AGE_MAX) }) : t("onboarding.validation.number", { example: number(30) })}
        </Notice>
      )}
    </div>
  );
}
