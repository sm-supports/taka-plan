"use client";
/** Question 5: loans or carried card balances, yes/no, then a short recap before "See my plan". */
import { YesNo } from "@/components/ui/YesNo";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { Notice } from "./Notice";
import type { Onboarding } from "./useOnboarding";

export function StepDebt({ profile, setProfile }: Onboarding) {
  const { t } = useT();
  const { money, number } = useFormat();
  const hasDebt = typeof profile.hasDebt === "boolean" ? profile.hasDebt : null;
  const recap = [
    typeof profile.age === "number" ? t("onboarding.summary.age", { age: number(profile.age) }) : null,
    typeof profile.takeHome === "number" ? t("onboarding.summary.takeHome", { amount: money(profile.takeHome) }) : null,
    typeof profile.essentials === "number" ? t("onboarding.summary.essentials", { amount: money(profile.essentials) }) : null,
  ].filter((x): x is string => x !== null);

  return (
    <div className="flex flex-col gap-5">
      <YesNo
        label={t("onboarding.step.5.label")}
        value={hasDebt}
        onChange={(v) => setProfile({ hasDebt: v })}
        yesLabel={t("onboarding.step.5.yes")}
        noLabel={t("onboarding.step.5.no")}
      />
      {hasDebt !== null && <Notice tone="info">{hasDebt ? t("onboarding.step.5.yesNote") : t("onboarding.step.5.noNote")}</Notice>}
      <section className="rounded-card border border-line bg-surface p-4" aria-labelledby="ready-title">
        <h2 id="ready-title" className="text-base font-bold text-text">
          {t("onboarding.step.5.readyTitle")}
        </h2>
        <p className="mt-1 text-sm text-text-muted">{t("onboarding.step.5.ready")}</p>
        {recap.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {recap.map((line) => (
              <li key={line} className="rounded-full bg-surface-muted px-3 py-1 text-sm font-medium tabular-nums text-text">
                {line}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
