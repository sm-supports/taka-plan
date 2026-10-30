"use client";
/** One-question-per-screen frame: progress dots, title, hint, body and a sticky bottom CTA. */
import type { ReactNode } from "react";
import { useT } from "@/lib/i18n/useT";
import { Button } from "./Button";
import { cn } from "./cn";

export interface StepFrameProps {
  step: number;
  total: number;
  title: string;
  hint?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  className?: string;
}

export function StepFrame({ step, total, title, hint, children, onBack, onNext, nextLabel, nextDisabled, className }: StepFrameProps) {
  const { t } = useT();
  return (
    <section className={cn("flex min-h-[calc(100dvh-8rem)] flex-col", className)} aria-labelledby="step-title">
      <div className="flex items-center justify-between py-2">
        {onBack ? (
          <button type="button" onClick={onBack} className="tap -ml-2 inline-flex items-center gap-1 rounded-xl px-2 text-sm font-medium text-text-muted hover:bg-surface-muted">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("common.button.back")}
          </button>
        ) : (
          <span />
        )}
        <ol className="flex items-center gap-1.5" aria-label={`${step} / ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <li
              key={i}
              aria-current={i + 1 === step ? "step" : undefined}
              className={cn("h-2 rounded-full transition-all", i + 1 === step ? "w-6 bg-brand-600" : i + 1 < step ? "w-2 bg-brand-500" : "w-2 bg-line")}
            />
          ))}
        </ol>
      </div>
      <h1 id="step-title" className="mt-3 text-2xl font-bold text-text">
        {title}
      </h1>
      {hint && <p className="mt-1 text-base text-text-muted">{hint}</p>}
      <div className="mt-5 flex-1">{children}</div>
      {onNext && (
        <div className="sticky bottom-0 -mx-4 mt-6 border-t border-line bg-page/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <Button size="lg" fullWidth onClick={onNext} disabled={nextDisabled}>
            {nextLabel ?? t("common.button.next")}
          </Button>
        </div>
      )}
    </section>
  );
}
