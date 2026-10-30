"use client";
/**
 * "Why this number?" bottom sheet: each formula step in plain words (dictionary template with the
 * step's formatted inputs and result), then every rates-table row used with its as-of date and
 * source, then any notes.
 */
import type { Explanation } from "@taka/engine";
import { Sheet } from "@/components/ui/Sheet";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { AssumptionRow } from "./AssumptionRow";
import { formatStepParams } from "./formatInputs";

export interface WhyDrawerProps {
  explanation: Explanation;
  title: string;
  /** Which step ids to show; defaults to every step in the explanation. */
  stepIds?: readonly string[];
  open: boolean;
  onClose: () => void;
}

export function WhyDrawer({ explanation, title, stepIds, open, onClose }: WhyDrawerProps) {
  const { t } = useT();
  const f = useFormat();
  const { assumptions, notes } = explanation;
  const steps = stepIds ? explanation.steps.filter((s) => stepIds.includes(s.id)) : explanation.steps;
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {steps.length > 0 && (
        <section aria-label={t("common.explain.steps")}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{t("common.explain.steps")}</h3>
          <ol className="mt-2 flex flex-col gap-4">
            {steps.map((step, i) => {
              const params = formatStepParams(step, f, t);
              return (
                <li key={`${step.id}-${i}`} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700" aria-hidden="true">
                    {f.number(i + 1)}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-text">{t(`explain.${step.id}.title`)}</h4>
                    <p className="mt-0.5 text-sm leading-relaxed text-text-muted">{t(`explain.${step.id}.body`, params)}</p>
                    <p className="mt-1 text-sm font-semibold tabular-nums text-brand-700">= {params.result}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {assumptions.length > 0 && (
        <section className="mt-6" aria-label={t("common.explain.assumptions")}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{t("common.explain.assumptions")}</h3>
          <ul className="mt-1">
            {assumptions.map((a) => (
              <AssumptionRow key={a.key} assumption={a} />
            ))}
          </ul>
        </section>
      )}

      {notes.length > 0 && (
        <section className="mt-6" aria-label={t("common.explain.notes")}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{t("common.explain.notes")}</h3>
          <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-text-muted">
            {notes.map((n) => (
              <li key={n}>{t(n)}</li>
            ))}
          </ul>
        </section>
      )}
    </Sheet>
  );
}
