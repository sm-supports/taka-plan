"use client";
/**
 * "Why this number?" button + drawer. Local to the calculator slices until the shared
 * components/explain/WhyButton lands; swap the import then (same props: `explanation`).
 * Steps come from `explain.<stepId>` dictionary templates with the step's inputs substituted,
 * then the rates used (label, value, as-of, source, stale/assumption tag), then notes.
 */
import { useState } from "react";
import type { Explanation } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { StaleTag } from "@/components/ui/StaleTag";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { assumptionLabel, assumptionValue, stepParams } from "./explainFormat";

export interface WhyButtonProps {
  explanation: Explanation;
  /** Which step ids to show; defaults to every step in the explanation. */
  stepIds?: readonly string[];
  className?: string;
}

export interface WhyDrawerProps extends WhyButtonProps {
  open: boolean;
  onClose: () => void;
}

export function WhyDrawer({ explanation, stepIds, open, onClose }: WhyDrawerProps) {
  const { t, locale } = useT();
  const f = useFormat();
  const instrumentLabel = (id: string) => t(`common.instrument.${id}`);
  const steps = stepIds ? explanation.steps.filter((s) => stepIds.includes(s.id)) : explanation.steps;

  return (
    <Sheet open={open} onClose={onClose} title={t("common.explain.title")}>
      <div className="flex flex-col gap-5">
        {steps.length > 0 && (
          <section aria-labelledby="why-steps">
            <h3 id="why-steps" className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              {t("common.explain.steps")}
            </h3>
            <ol className="mt-2 flex flex-col gap-3">
              {steps.map((s, i) => (
                <li key={`${s.id}-${i}`} className="rounded-xl bg-surface-muted p-3">
                  <p className="font-semibold text-text">{t(`explain.${s.id}.title`)}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text">{t(`explain.${s.id}.body`, stepParams(s, f, instrumentLabel))}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {explanation.assumptions.length > 0 && (
          <section aria-labelledby="why-assumptions">
            <h3 id="why-assumptions" className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              {t("common.explain.assumptions")}
            </h3>
            <ul className="mt-2 divide-y divide-line">
              {explanation.assumptions.map((a) => {
                const value = assumptionValue(a, f);
                return (
                  <li key={a.key} className="flex flex-col gap-1 py-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-medium text-text">{assumptionLabel(a, locale)}</span>
                      {value !== null && <span className="shrink-0 text-sm font-semibold tabular-nums text-brand-700">{value}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                      <span>{t("common.asOf", { date: f.asOf(a.asOf) })}</span>
                      <span aria-hidden="true">·</span>
                      <a href={a.sourceUrl} target="_blank" rel="noreferrer noopener" className="underline decoration-dotted underline-offset-2">
                        {t("common.source")}: {a.sourceName}
                      </a>
                      {a.stale && <StaleTag kind="stale" />}
                      {a.isAppAssumption && <StaleTag kind="assumption" />}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {explanation.notes.length > 0 && (
          <section aria-labelledby="why-notes">
            <h3 id="why-notes" className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              {t("common.explain.notes")}
            </h3>
            <ul className="mt-2 flex flex-col gap-2">
              {explanation.notes.map((n) => (
                <li key={n} className="text-sm leading-relaxed text-text">
                  {t(n)}
                </li>
              ))}
            </ul>
          </section>
        )}

        <Button variant="secondary" fullWidth onClick={onClose}>
          {t("common.button.close")}
        </Button>
      </div>
    </Sheet>
  );
}

export function WhyButton({ explanation, stepIds, className }: WhyButtonProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" className={className} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        <span className="inline-flex items-center gap-1.5">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="17" r="1" fill="currentColor" />
          </svg>
          {t("common.button.whyThisNumber")}
        </span>
      </Button>
      <WhyDrawer explanation={explanation} stepIds={stepIds} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
