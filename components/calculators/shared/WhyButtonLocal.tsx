"use client";
/**
 * "Why this number?" — renders an engine Explanation in a Sheet: the formula steps in plain words,
 * the rates used (with as-of date, source and stale/assumption tags) and any notes.
 * Local stand-in for components/explain/WhyButton (owned by the ui-plan slice); same props shape.
 */
import { useCallback, useState } from "react";
import type { Explanation } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { StaleTag } from "@/components/ui/StaleTag";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { formatAssumptionValue, stepParams } from "./explainFormat";

export interface WhyButtonLocalProps {
  explain: Explanation;
  /** Sheet title; defaults to "Why this number?". */
  title?: string;
  className?: string;
}

export function WhyButtonLocal({ explain, title, className }: WhyButtonLocalProps) {
  const { t, locale } = useT();
  const f = useFormat();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const instrumentLabel = useCallback((id: string) => t(`common.instrument.${id}`), [t]);

  return (
    <>
      <Button variant="ghost" className={className} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        {t("common.button.whyThisNumber")}
      </Button>
      <Sheet open={open} onClose={close} title={title ?? t("common.explain.title")}>
        <div className="flex flex-col gap-6 text-left">
          <section aria-label={t("common.explain.steps")}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">{t("common.explain.steps")}</h3>
            <ol className="mt-2 flex flex-col gap-4">
              {explain.steps.map((step, i) => (
                <li key={step.id} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700" aria-hidden="true">
                    {f.number(i + 1)}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-text">{t(`explain.${step.id}.title`)}</div>
                    <p className="mt-0.5 text-sm leading-relaxed text-text-muted">{t(`explain.${step.id}.body`, stepParams(step, f, instrumentLabel))}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {explain.assumptions.length > 0 && (
            <section aria-label={t("common.explain.assumptions")}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">{t("common.explain.assumptions")}</h3>
              <ul className="mt-2 divide-y divide-line">
                {explain.assumptions.map((a) => (
                  <li key={a.key} className="py-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-medium text-text">{locale === "bn" && a.labelBn ? a.labelBn : a.labelEn}</span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-text">{formatAssumptionValue(a, f)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-faint">
                      <span>{t("common.asOf", { date: f.asOf(a.asOf) })}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {t("common.source")}: {a.sourceName}
                      </span>
                      {a.stale && <StaleTag kind="stale" />}
                      {a.isAppAssumption && <StaleTag kind="assumption" />}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {explain.notes.length > 0 && (
            <section aria-label={t("common.explain.notes")}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">{t("common.explain.notes")}</h3>
              <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed text-text-muted">
                {explain.notes.map((n) => (
                  <li key={n}>{t(n)}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </Sheet>
    </>
  );
}
