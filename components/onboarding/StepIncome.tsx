"use client";
/** Question 2: how the user earns, then monthly take-home (6-month average for irregular income). */
import type { IncomeType } from "@taka/engine";
import { ChoiceButtons } from "@/components/ui/ChoiceButtons";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { useT } from "@/lib/i18n/useT";
import { Notice } from "./Notice";
import { SixMonthAverage } from "./SixMonthAverage";
import type { Onboarding } from "./useOnboarding";

const INCOME_TYPES: IncomeType[] = ["salaried", "freelance", "business"];

export function StepIncome({ profile, setProfile, validation }: Onboarding) {
  const { t } = useT();
  const incomeType = profile.incomeType ?? "salaried";
  const irregular = incomeType !== "salaried";
  const takeHome = typeof profile.takeHome === "number" ? profile.takeHome : null;
  const showError = takeHome !== null && !validation.ok && validation.error === "positiveAmount";

  return (
    <div className="flex flex-col gap-5">
      <ChoiceButtons<IncomeType>
        label={t("onboarding.step.2.incomeTypeLabel")}
        options={INCOME_TYPES.map((v) => ({ value: v, label: t(`common.incomeType.${v}`), hint: t(`onboarding.step.2.incomeTypeHint.${v}`) }))}
        value={incomeType}
        onChange={(v) => {
          if (!Array.isArray(v)) setProfile({ incomeType: v });
        }}
      />
      <MoneyInput
        id="take-home"
        value={takeHome}
        onChange={(n) => setProfile({ takeHome: n ?? undefined })}
        label={t("onboarding.step.2.label")}
        hint={irregular ? t("onboarding.step.2.hintFreelance") : undefined}
        placeholder={t("onboarding.step.2.placeholder")}
        error={showError ? t("onboarding.validation.positiveAmount") : undefined}
        autoFocus
      />
      {irregular && <SixMonthAverage onUse={(avg) => setProfile({ takeHome: avg })} />}
      {!irregular && <Notice tone="info">{t("onboarding.step.2.hintFreelance")}</Notice>}
    </div>
  );
}
