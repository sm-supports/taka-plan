"use client";
/** Question 3: monthly essential spending, with the PRD list of what counts and a check against take-home. */
import { MoneyInput } from "@/components/ui/MoneyInput";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { Notice } from "./Notice";
import type { Onboarding } from "./useOnboarding";

const COUNTS = ["rent", "food", "utilities", "transport", "school", "parents", "emi"] as const;

export function StepEssentials({ profile, setProfile, validation }: Onboarding) {
  const { t } = useT();
  const { money } = useFormat();
  const essentials = typeof profile.essentials === "number" ? profile.essentials : null;
  const takeHome = typeof profile.takeHome === "number" ? profile.takeHome : null;
  const showError = essentials !== null && !validation.ok && validation.error === "positiveAmount";
  const showWarning = validation.ok && validation.warning === "essentialsAboveIncome";
  const leftOver = essentials !== null && takeHome !== null && essentials <= takeHome ? takeHome - essentials : null;

  return (
    <div className="flex flex-col gap-5">
      <MoneyInput
        id="essentials"
        value={essentials}
        onChange={(n) => setProfile({ essentials: n ?? undefined })}
        label={t("onboarding.step.3.label")}
        hint={takeHome !== null ? t("onboarding.step.3.takeHomeReminder", { amount: money(takeHome) }) : undefined}
        placeholder={t("onboarding.step.3.placeholder")}
        error={showError ? t("onboarding.validation.positiveAmount") : undefined}
        autoFocus
      />
      {showWarning && <Notice tone="amber">{t("onboarding.validation.essentialsAboveIncome")}</Notice>}
      {leftOver !== null && !showWarning && (
        <p className="text-sm font-medium text-text-muted" aria-live="polite">
          {t("onboarding.step.3.leftOver", { amount: money(leftOver) })}
        </p>
      )}
      <section className="rounded-card border border-line bg-surface-muted p-4" aria-labelledby="counts-title">
        <h2 id="counts-title" className="text-sm font-bold uppercase tracking-wide text-text-muted">
          {t("onboarding.step.3.countsTitle")}
        </h2>
        <ul className="mt-2 flex flex-col gap-1.5 text-base text-text">
          {COUNTS.map((k) => (
            <li key={k} className="flex items-start gap-2">
              <svg className="mt-1.5 h-4 w-4 shrink-0 text-brand-600" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t(`onboarding.step.3.counts.${k}`)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-text-muted">{t("onboarding.step.3.leaveOut")}</p>
      </section>
    </div>
  );
}
