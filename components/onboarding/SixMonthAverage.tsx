"use client";
/** Freelancer / business helper: six monthly amounts → average, one tap to use it as take-home. */
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";
import { averageOfFilled } from "@/lib/onboarding/validate";

const MONTHS = [1, 2, 3, 4, 5, 6] as const;

export interface SixMonthAverageProps {
  onUse: (average: number) => void;
}

export function SixMonthAverage({ onUse }: SixMonthAverageProps) {
  const { t } = useT();
  const { taka, number } = useFormat();
  const stored = useTakaStore((s) => s.m4.last6Incomes);
  const setM4 = useTakaStore((s) => s.setM4);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Array<number | null>>(() => MONTHS.map((_, i) => stored?.[i] ?? null));
  const average = averageOfFilled(values);

  if (!open) {
    return (
      <Button variant="secondary" fullWidth onClick={() => setOpen(true)}>
        {t("onboarding.step.2.average.toggle")}
      </Button>
    );
  }

  return (
    <section className="rounded-card border border-line bg-surface-muted p-4" aria-labelledby="six-month-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="six-month-title" className="text-base font-bold text-text">
            {t("onboarding.step.2.average.title")}
          </h2>
          <p className="mt-1 text-sm text-text-muted">{t("onboarding.step.2.average.hint")}</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="tap shrink-0 rounded-xl px-2 text-sm font-semibold text-text-muted hover:bg-surface">
          {t("onboarding.step.2.average.close")}
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {MONTHS.map((m, i) => (
          <MoneyInput
            key={m}
            id={`income-month-${m}`}
            value={values[i] ?? null}
            onChange={(n) => setValues((prev) => prev.map((v, j) => (j === i ? n : v)))}
            label={t("onboarding.step.2.average.month", { n: number(m) })}
            min={0}
          />
        ))}
      </div>
      {average !== null && (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-base font-semibold text-brand-700" aria-live="polite">
            {t("onboarding.step.2.average.result", { amount: taka(average) })}
          </p>
          <Button
            fullWidth
            onClick={() => {
              const filled = values.filter((v): v is number => typeof v === "number");
              setM4({ last6Incomes: filled });
              onUse(average);
              setOpen(false);
            }}
          >
            {t("onboarding.step.2.average.use", { amount: taka(average) })}
          </Button>
        </div>
      )}
    </section>
  );
}
