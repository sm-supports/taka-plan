"use client";
/**
 * Plain sentences under the cards: emergency share, months to full, goals shortfall and the
 * retirement shortfall. The "no goals yet" line only shows when the plan has neither goals nor a
 * retirement bucket (retirement is a goal). Modules left out of the plan get their note here.
 */
import type { Plan } from "@taka/engine";
import { iso } from "@/components/ui/bidi";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";

export function PlanSummary({ plan }: { plan: Plan }) {
  const { t } = useT();
  const f = useFormat();
  const { emergencyShare, monthsToEmergencyFull, goalsShortfall, retirementShortfall } = plan.summary;
  const hasGoals = (plan.goals?.goals.length ?? 0) > 0;
  const hasRetirement = plan.buckets.some((b) => b.id === "retirement") || plan.retirement !== undefined;
  // A module whose answers no longer fit the profile is left out of the plan with a note (plan.note.*).
  const planNotes = plan.explain.notes.filter((n) => n.startsWith("plan.note."));
  return (
    <section aria-labelledby="plan-summary" className="rounded-card bg-surface-muted px-4 py-3 text-sm leading-relaxed text-text-muted">
      <h2 id="plan-summary" className="text-xs font-semibold uppercase tracking-wide text-text-faint">
        {t("plan.summary.title")}
      </h2>
      <ul className="mt-1 flex flex-col gap-1">
        {monthsToEmergencyFull === null ? (
          <li dir="auto">{t("plan.summary.emergencyFull")}</li>
        ) : (
          <>
            <li dir="auto">{t("plan.summary.emergencyShare", { share: iso(f.percent(emergencyShare, 0)) })}</li>
            <li dir="auto">{t("plan.summary.monthsToFull", { months: f.months(monthsToEmergencyFull) })}</li>
          </>
        )}
        {hasGoals ? (
          <li dir="auto">{goalsShortfall > 0 ? t("plan.summary.goalsShortfall", { amount: iso(f.money(goalsShortfall)) }) : t("plan.summary.noShortfall")}</li>
        ) : (
          !hasRetirement && <li dir="auto">{t("plan.emptyGoals")}</li>
        )}
        {hasRetirement && retirementShortfall !== undefined && retirementShortfall > 0 && (
          <li dir="auto" data-testid="plan-retirement-shortfall">
            {t("plan.summary.retirementShortfall", { amount: iso(f.money(retirementShortfall)) })}
          </li>
        )}
        {planNotes.map((n) => (
          <li key={n} dir="auto" className="font-medium text-status-amber" data-testid="plan-note">
            {t(n)}
          </li>
        ))}
      </ul>
    </section>
  );
}
