"use client";
/** Three plain sentences under the cards: emergency share, months to full, goals shortfall. */
import type { Plan } from "@taka/engine";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";

export function PlanSummary({ plan }: { plan: Plan }) {
  const { t } = useT();
  const f = useFormat();
  const { emergencyShare, monthsToEmergencyFull, goalsShortfall } = plan.summary;
  const hasGoals = (plan.goals?.goals.length ?? 0) > 0;
  return (
    <section aria-labelledby="plan-summary" className="rounded-card bg-surface-muted px-4 py-3 text-sm leading-relaxed text-text-muted">
      <h2 id="plan-summary" className="text-xs font-semibold uppercase tracking-wide text-text-faint">
        {t("plan.summary.title")}
      </h2>
      <ul className="mt-1 flex flex-col gap-1">
        {monthsToEmergencyFull === null ? (
          <li>{t("plan.summary.emergencyFull")}</li>
        ) : (
          <>
            <li>{t("plan.summary.emergencyShare", { share: f.percent(emergencyShare, 0) })}</li>
            <li>{t("plan.summary.monthsToFull", { months: f.months(monthsToEmergencyFull) })}</li>
          </>
        )}
        {hasGoals ? <li>{goalsShortfall > 0 ? t("plan.summary.goalsShortfall", { amount: f.money(goalsShortfall) }) : t("plan.summary.noShortfall")}</li> : <li>{t("plan.emptyGoals")}</li>}
      </ul>
    </section>
  );
}
