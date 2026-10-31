"use client";
/**
 * M4 Save-first budget calculator. Pre-filled from the store (profile + m4 state); every edit writes
 * straight back so the plan screen updates live. Inputs first, then one big number (the monthly
 * saving) with "income − savings = expenses" rewritten in the user's numbers, the supporting figures,
 * the instrument + transfer-day card (or the per-payment share for freelancers), next step.
 * `?demo=1` (salaried) / `?demo=freelance` render local fixtures instead of the engine (see ./demo.ts).
 */
import { useMemo, useState } from "react";
import { computeSaveFirst, type IncomeType, type M4Input, type M4Result, type Money } from "@taka/engine";
import { BigNumber } from "@/components/ui/BigNumber";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceButtons } from "@/components/ui/ChoiceButtons";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { SliderWithNumber } from "@/components/ui/SliderWithNumber";
import { StatusPill } from "@/components/ui/StatusPill";
import { Term } from "@/components/ui/Term";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { useCountryRates } from "@/lib/country/useCountry";
import { useTakaStore } from "@/lib/store/store";
import { calcErrorKey, type CalcErrorKey } from "../shared/engineError";
import { DemoBanner, Field, FigureList, Section, type Figure } from "../shared/Figures";
import { useDemoMode, useToday } from "../shared/hooks";
import { WhyButton } from "@/components/explain/WhyButton";
import { m4DemoInput, m4DemoResult, type M4DemoVariant } from "./demo";

/** UI bounds: savings rate slider in whole percent, payday as day of month. */
const RATE_MIN_PCT = 0;
const RATE_MAX_PCT = 60;
const PAYDAY_MIN = 1;
const PAYDAY_MAX = 31;
const INCOME_MONTHS = 6;

const INCOME_TYPES: IncomeType[] = ["salaried", "freelance", "business"];

interface Outcome {
  result: M4Result | null;
  errorKey: CalcErrorKey | null;
}

function padIncomes(list: readonly Money[] | undefined): Array<Money | null> {
  return Array.from({ length: INCOME_MONTHS }, (_, i) => list?.[i] ?? null);
}

export function SaveFirstCalculator() {
  const { t } = useT();
  const f = useFormat();
  const snapshot = useCountryRates();
  const today = useToday();
  const demo = useDemoMode();
  const demoVariant: M4DemoVariant = demo === "freelance" || demo === "business" ? "freelance" : "salaried";

  const profile = useTakaStore((s) => s.profile);
  const m4 = useTakaStore((s) => s.m4);
  const setProfile = useTakaStore((s) => s.setProfile);
  const setM4 = useTakaStore((s) => s.setM4);

  // In demo mode the fixture's inputs fill any field the store has not answered yet (display only; nothing is written).
  const fallback = demo ? m4DemoInput(demoVariant) : null;
  const takeHome = profile.takeHome ?? fallback?.takeHome ?? null;
  const essentials = profile.essentials ?? fallback?.essentials ?? null;
  const incomeType: IncomeType = profile.incomeType ?? fallback?.incomeType ?? "salaried";
  const irregular = incomeType !== "salaried";
  const payday = m4.payday ?? fallback?.payday;

  const [incomes, setIncomes] = useState<Array<Money | null>>(() => padIncomes(m4.last6Incomes ?? fallback?.last6Incomes));
  const last6Incomes = useMemo(() => {
    if (!irregular) return undefined;
    const given = incomes.filter((n): n is Money => n !== null && n > 0);
    return given.length > 0 ? given : undefined;
  }, [incomes, irregular]);

  const baseInput = useMemo(
    () => ({ takeHome: takeHome ?? 0, essentials: essentials ?? 0, incomeType, ...(payday !== undefined ? { payday } : {}), ...(last6Incomes ? { last6Incomes } : {}) }),
    [takeHome, essentials, incomeType, payday, last6Incomes],
  );
  const input = useMemo<M4Input>(() => ({ ...baseInput, ...(m4.savingsRate !== undefined ? { savingsRate: m4.savingsRate } : {}) }), [baseInput, m4.savingsRate]);

  const outcome = useMemo<Outcome>(() => {
    if (demo) return { result: m4DemoResult(snapshot, today, demoVariant), errorKey: null };
    try {
      return { result: computeSaveFirst(input, snapshot, today), errorKey: null };
    } catch (e) {
      return { result: null, errorKey: calcErrorKey(e) };
    }
  }, [demo, demoVariant, input, snapshot, today]);
  const result = outcome.result;

  // The suggestion comes from the engine result; without one (engine error) the slider shows the stored or default rate.
  const suggestedRate = result?.suggestedRate ?? m4.savingsRate ?? 0;
  const ratePct = Math.round((m4.savingsRate ?? suggestedRate) * 100);
  const overridden = m4.savingsRate !== undefined && Math.abs(m4.savingsRate - suggestedRate) >= 0.005;

  const setIncome = (i: number, n: Money | null) => {
    const next = incomes.slice();
    next[i] = n;
    setIncomes(next);
    const given = next.filter((x): x is Money => x !== null && x > 0);
    setM4({ last6Incomes: given.length > 0 ? given : undefined });
  };

  const figures: Figure[] = result
    ? [
        ...(result.mode === "percentOfEachPayment" || result.explain.steps.some((s) => s.id === "m4.average" && Number(s.inputs.months) > 1)
          ? [{ key: "avg", label: t("m4.result.averageIncome"), value: f.money(result.averageIncome) }]
          : []),
        { key: "rate", label: t("m4.result.savingsRate"), value: f.percent(result.savingsRate) },
        { key: "suggested", label: t("m4.result.suggestedRate"), value: f.percent(result.suggestedRate) },
        { key: "feasible", label: t("m4.result.feasibleRate"), value: f.percent(result.feasibleRate), hint: t("m4.result.feasibleRateHint") },
        { key: "expenses", label: t("m4.result.expensesAllowed"), value: f.money(result.expensesAllowed) },
        ...(result.essentialsShortfall > 0
          ? [{ key: "shortfall", label: t("m4.result.essentialsShortfall"), value: f.money(result.essentialsShortfall), hint: t("m4.result.essentialsShortfallHint") }]
          : []),
      ]
    : [];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-text">{t("m4.title")}</h1>
        <p className="mt-1 text-base text-text-muted">{t("m4.intro")}</p>
        {demo && <DemoBanner text={t("m4.demo")} />}
      </header>

      <Section title={t("m4.section.inputs")}>
        <MoneyInput id="m4-takeHome" value={takeHome} onChange={(n) => setProfile({ takeHome: n ?? undefined })} label={t("m4.input.takeHome.label")} hint={t("m4.input.takeHome.hint")} min={0} />
        <MoneyInput id="m4-essentials" value={essentials} onChange={(n) => setProfile({ essentials: n ?? undefined })} label={t("m4.input.essentials.label")} hint={t("m4.input.essentials.hint")} min={0} />

        <Field id="m4-incomeType" label={t("m4.input.incomeType.label")} hint={t("m4.input.incomeType.hint")}>
          <ChoiceButtons<IncomeType>
            label={t("m4.input.incomeType.label")}
            options={INCOME_TYPES.map((v) => ({ value: v, label: t(`common.incomeType.${v}`) }))}
            value={incomeType}
            onChange={(v) => {
              const pick = Array.isArray(v) ? v[0] : v;
              if (pick) setProfile({ incomeType: pick });
            }}
          />
        </Field>

        {irregular && (
          <Field id="m4-incomes" label={t("m4.input.last6Incomes.label")} hint={t("m4.input.last6Incomes.hint")}>
            <div className="grid grid-cols-2 gap-3">
              {incomes.map((n, i) => (
                <MoneyInput key={i} id={`m4-income-${i + 1}`} value={n} onChange={(v) => setIncome(i, v)} label={t("m4.input.last6Incomes.month", { n: f.number(i + 1) })} min={0} />
              ))}
            </div>
          </Field>
        )}

        <div className="flex flex-col gap-1.5">
          <SliderWithNumber
            id="m4-rate"
            value={ratePct}
            onChange={(n) => setM4({ savingsRate: n / 100 })}
            min={RATE_MIN_PCT}
            max={RATE_MAX_PCT}
            step={1}
            label={t("m4.input.savingsRate.label")}
            hint={t("m4.input.savingsRate.hint", { suggested: f.percent(suggestedRate, 0) })}
            unitLabel={t("common.unit.percent")}
          />
          <div className="flex min-h-12 items-center justify-between gap-3">
            <p className="text-sm font-medium text-brand-700" aria-live="polite">
              {t("m4.input.savingsRate.suggested", { rate: f.percent(suggestedRate, 0) })}
            </p>
            {overridden && (
              <Button variant="ghost" onClick={() => setM4({ savingsRate: undefined })}>
                {t("m4.input.savingsRate.useSuggested")}
              </Button>
            )}
          </div>
        </div>

        <SliderWithNumber id="m4-payday" value={payday ?? PAYDAY_MIN} onChange={(n) => setM4({ payday: n })} min={PAYDAY_MIN} max={PAYDAY_MAX} step={1} label={t("m4.input.payday.label")} hint={t("m4.input.payday.hint")} />
      </Section>

      <Section title={t("m4.section.result")} id="m4-result">
        {outcome.errorKey && <ErrorCard title={t("m4.title")} message={t(outcome.errorKey)} />}

        {result && (
          <>
            <Card className="flex flex-col items-center gap-3 text-center">
              <StatusPill status={result.status}>{t(`m4.status.${result.status}`)}</StatusPill>
              <BigNumber
                label={t("m4.result.savingsAmount")}
                value={
                  <>
                    {f.money(result.savingsAmount)}
                    <span className="ml-1 text-lg font-medium text-text-muted">{t("common.unit.perMonth")}</span>
                  </>
                }
                caption={
                  <span className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-text-faint">{t("m4.result.equationLabel")}</span>
                    <span className="font-semibold tabular-nums text-text">
                      {t("m4.result.equation", { income: f.money(result.averageIncome), savings: f.money(result.savingsAmount), expenses: f.money(result.expensesAllowed) })}
                    </span>
                  </span>
                }
              />
              <WhyButton explanation={result.explain} />
            </Card>

            <Card>
              <FigureList items={figures} />
            </Card>

            <Card className="border-brand-200 bg-brand-50" header={<span className="text-base font-semibold text-brand-900">{t("m4.section.where")}</span>}>
              <p className="text-sm text-brand-900/80">{t("m4.result.modeLabel")}</p>
              <p className="mt-0.5 text-base font-semibold text-brand-900">{t(`m4.result.mode.${result.mode}`)}</p>
              {result.mode === "percentOfEachPayment" && result.percentOfEachPayment !== undefined && (
                <p className="mt-3 text-2xl font-bold tabular-nums text-brand-700">{t("m4.result.percentOfEachPayment", { percent: f.percent(result.percentOfEachPayment, 0) })}</p>
              )}
              <div className="mt-3 border-t border-brand-200 pt-3">
                <p className="text-sm text-brand-900/80">{t("m4.result.instrument")}</p>
                <p className="mt-0.5 text-lg font-semibold text-brand-900">
                  <Term k="dps">{t(`common.instrument.${result.instrument}`)}</Term>
                </p>
                <p className="mt-1 text-sm text-brand-900/80">{t("m4.result.instrumentHint")}</p>
                {result.mode === "fixed" && (
                  <p className="mt-2 text-base font-semibold text-brand-900">{result.transferDay === null ? t("m4.result.transferDayUnknown") : t("m4.result.transferDay", { day: f.number(result.transferDay) })}</p>
                )}
              </div>
            </Card>

            <Card header={<span className="text-base font-semibold text-text">{t("m4.section.nextStep")}</span>}>
              <p className="text-base leading-relaxed text-text">
                {result.mode === "percentOfEachPayment"
                  ? t("m4.next.percentOfEachPayment", { percent: f.percent(result.percentOfEachPayment ?? result.savingsRate, 0) })
                  : result.transferDay === null
                    ? t("m4.next.dpsNoPayday")
                    : t("m4.next.dps", { day: f.number(result.transferDay) })}
              </p>
            </Card>
          </>
        )}
      </Section>
    </div>
  );
}
