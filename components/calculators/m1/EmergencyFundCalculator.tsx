"use client";
/**
 * M1 Emergency fund calculator. Pre-filled from the store (profile + m1 overrides); every edit writes
 * straight back so the plan screen updates live. Inputs first, then one big number (monthly saving
 * toward the fund), supporting figures, the two-tier "where to keep it" cards, next step and rules.
 * `?demo=1` renders the local fixture instead of the engine (see ./demo.ts).
 */
import { useMemo } from "react";
import { computeEmergencyFund, getRate, suggestMonths, type Dependent, type IncomeType, type M1Input, type M1Result, type RatesSnapshot } from "@taka/engine";
import { StartOverButton } from "@/components/drafts/StartOverButton";
import { BigNumber } from "@/components/ui/BigNumber";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceButtons } from "@/components/ui/ChoiceButtons";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { SliderWithNumber } from "@/components/ui/SliderWithNumber";
import { StatusPill } from "@/components/ui/StatusPill";
import { Term } from "@/components/ui/Term";
import { YesNo } from "@/components/ui/YesNo";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { useCountryRates } from "@/lib/country/useCountry";
import { useTakaStore } from "@/lib/store/store";
import { calcErrorKey, type CalcErrorKey } from "../shared/engineError";
import { DemoBanner, Field, FigureList, Section } from "../shared/Figures";
import { useDemoMode, useToday } from "../shared/hooks";
import { WhyButton } from "@/components/explain/WhyButton";
import { M1_DEMO_INPUT, m1DemoResult } from "./demo";

/** UI bounds for the "build it over" slider (months). */
const BUILD_MIN = 3;
const BUILD_MAX = 36;

const INCOME_TYPES: IncomeType[] = ["salaried", "freelance", "business"];

/** Slider bounds for months of cover and the default build period, from the rates snapshot. */
function monthsBounds(rates: RatesSnapshot): { min: number; max: number } {
  return { min: getRate(rates, "emergency_min_months"), max: getRate(rates, "emergency_max_months") };
}
function defaultBuildMonths(rates: RatesSnapshot): number {
  return getRate(rates, "emergency_build_months_default");
}
const DEPENDENTS: Dependent[] = ["partner", "children", "parents"];
type DependentChoice = Dependent | "none";

interface Outcome {
  result: M1Result | null;
  errorKey: CalcErrorKey | null;
}

export function EmergencyFundCalculator() {
  const { t } = useT();
  const f = useFormat();
  const snapshot = useCountryRates();
  const today = useToday();
  const demo = useDemoMode();

  const profile = useTakaStore((s) => s.profile);
  const m1 = useTakaStore((s) => s.m1);
  const setProfile = useTakaStore((s) => s.setProfile);
  const setM1 = useTakaStore((s) => s.setM1);

  // In demo mode the fixture's inputs fill any field the store has not answered yet (display only; nothing is written).
  const fallback = demo ? M1_DEMO_INPUT : null;
  const essentials = profile.essentials ?? fallback?.essentials ?? null;
  const incomeType: IncomeType = profile.incomeType ?? fallback?.incomeType ?? "salaried";
  const dependents: Dependent[] = profile.dependents ?? fallback?.dependents ?? [];
  const soleEarner = m1.soleEarner ?? fallback?.soleEarner ?? dependents.length > 0;
  const hasHealthInsurance = m1.hasHealthInsurance ?? fallback?.hasHealthInsurance ?? false;
  const liquidSavings = m1.liquidSavings ?? fallback?.liquidSavings ?? null;

  const bounds = useMemo(() => monthsBounds(snapshot), [snapshot]);
  const buildDefault = useMemo(() => defaultBuildMonths(snapshot), [snapshot]);
  const depositLimit = useMemo(() => getRate(snapshot, "deposit_insurance_limit"), [snapshot]);
  const buildMonths = m1.buildMonths ?? buildDefault;

  const suggested = useMemo(() => suggestMonths({ incomeType, dependents, soleEarner, hasHealthInsurance }, snapshot), [incomeType, dependents, soleEarner, hasHealthInsurance, snapshot]);
  const months = m1.monthsOverride ?? suggested;
  const overridden = m1.monthsOverride !== undefined && m1.monthsOverride !== suggested;

  const input = useMemo<M1Input>(
    () => ({
      essentials: essentials ?? 0,
      incomeType,
      dependents,
      soleEarner,
      hasHealthInsurance,
      liquidSavings: liquidSavings ?? 0,
      ...(m1.monthsOverride !== undefined ? { monthsOverride: m1.monthsOverride } : {}),
      buildMonths,
    }),
    [essentials, incomeType, dependents, soleEarner, hasHealthInsurance, liquidSavings, m1.monthsOverride, buildMonths],
  );

  const outcome = useMemo<Outcome>(() => {
    if (demo) return { result: m1DemoResult(snapshot, today), errorKey: null };
    try {
      return { result: computeEmergencyFund(input, snapshot, today), errorKey: null };
    } catch (e) {
      return { result: null, errorKey: calcErrorKey(e) };
    }
  }, [demo, input, snapshot, today]);
  const result = outcome.result;

  const onDependents = (next: DependentChoice | DependentChoice[]) => {
    const arr = Array.isArray(next) ? next : [next];
    const picked = arr.filter((x): x is Dependent => x !== "none");
    const noneTapped = arr.includes("none") && dependents.length > 0;
    setProfile({ dependents: noneTapped ? [] : picked });
  };

  const dependentOptions = [
    { value: "none" as DependentChoice, label: t("common.dependent.none") },
    ...DEPENDENTS.map((d) => ({ value: d as DependentChoice, label: t(`common.dependent.${d}`) })),
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-text">{t("m1.title")}</h1>
        <p className="mt-1 text-base text-text-muted">{t("m1.intro")}</p>
        {demo && <DemoBanner text={t("m1.demo")} />}
      </header>

      <Section title={t("m1.section.inputs")}>
        <MoneyInput id="m1-essentials" value={essentials} onChange={(n) => setProfile({ essentials: n ?? undefined })} label={t("m1.input.essentials.label")} hint={t("m1.input.essentials.hint")} min={0} />

        <Field id="m1-incomeType" label={t("m1.input.incomeType.label")} hint={t("m1.input.incomeType.hint")}>
          <ChoiceButtons<IncomeType>
            label={t("m1.input.incomeType.label")}
            options={INCOME_TYPES.map((v) => ({ value: v, label: t(`common.incomeType.${v}`) }))}
            value={incomeType}
            onChange={(v) => {
              const pick = Array.isArray(v) ? v[0] : v;
              if (pick) setProfile({ incomeType: pick });
            }}
          />
        </Field>

        <Field id="m1-dependents" label={t("m1.input.dependents.label")} hint={t("m1.input.dependents.hint")}>
          <ChoiceButtons<DependentChoice> multi columns={2} label={t("m1.input.dependents.label")} options={dependentOptions} value={dependents.length === 0 ? ["none"] : dependents} onChange={onDependents} />
        </Field>

        <Field id="m1-soleEarner" label={t("m1.input.soleEarner.label")} hint={t("m1.input.soleEarner.hint")}>
          <YesNo label={t("m1.input.soleEarner.label")} value={soleEarner} onChange={(v) => setM1({ soleEarner: v })} yesLabel={t("common.yes")} noLabel={t("common.no")} />
        </Field>

        <Field id="m1-health" label={t("m1.input.hasHealthInsurance.label")} hint={t("m1.input.hasHealthInsurance.hint")}>
          <YesNo label={t("m1.input.hasHealthInsurance.label")} value={hasHealthInsurance} onChange={(v) => setM1({ hasHealthInsurance: v })} yesLabel={t("common.yes")} noLabel={t("common.no")} />
        </Field>

        <MoneyInput id="m1-liquid" value={liquidSavings} onChange={(n) => setM1({ liquidSavings: n ?? undefined })} label={t("m1.input.liquidSavings.label")} hint={t("m1.input.liquidSavings.hint")} min={0} />

        <div className="flex flex-col gap-1.5">
          <SliderWithNumber
            id="m1-months"
            value={months}
            onChange={(n) => setM1({ monthsOverride: n })}
            min={bounds.min}
            max={bounds.max}
            step={1}
            label={t("m1.input.months.label")}
            hint={t("m1.input.months.hint", { min: f.number(bounds.min), max: f.number(bounds.max) })}
            unitLabel={t("common.unit.months")}
          />
          <div className="flex min-h-12 items-center justify-between gap-3">
            <p className="text-sm font-medium text-brand-700" aria-live="polite">
              {t("m1.input.months.suggested", { months: f.months(suggested) })}
            </p>
            {overridden && (
              <Button variant="ghost" onClick={() => setM1({ monthsOverride: undefined })}>
                {t("m1.input.months.useSuggested")}
              </Button>
            )}
          </div>
        </div>

        <SliderWithNumber id="m1-build" value={buildMonths} onChange={(n) => setM1({ buildMonths: n })} min={BUILD_MIN} max={BUILD_MAX} step={1} label={t("m1.input.buildMonths.label")} hint={t("m1.input.buildMonths.hint")} unitLabel={t("common.unit.months")} />
      </Section>

      <Section title={t("m1.section.result")} id="m1-result">
        {outcome.errorKey && <ErrorCard title={t("m1.title")} message={t(outcome.errorKey)} />}

        {result && (
          <>
            <Card className="flex flex-col items-center gap-3 text-center">
              <StatusPill status={result.status}>{t(`m1.status.${result.status}`)}</StatusPill>
              <BigNumber
                label={t("m1.result.monthlySaving")}
                value={
                  <>
                    {f.money(result.monthlySaving)}
                    <span className="ms-1 text-lg font-medium text-text-muted">{t("common.unit.perMonth")}</span>
                  </>
                }
                caption={result.gap === 0 ? t("m1.result.full") : t("m1.result.monthsCoveredOf", { covered: f.number(result.monthsCovered, 1), months: f.number(result.months) })}
              />
              <WhyButton explanation={result.explain} />
            </Card>

            <Card>
              <FigureList
                items={[
                  { key: "target", label: t("m1.result.target"), value: f.money(result.target), hint: t("m1.result.suggestedMonths", { months: f.months(result.suggestedMonths) }) },
                  { key: "saved", label: t("m1.result.saved"), value: f.money(result.saved) },
                  { key: "gap", label: t("m1.result.gap"), value: f.money(result.gap) },
                  { key: "covered", label: t("m1.result.monthsCovered"), value: f.months(result.monthsCovered) },
                  { key: "toFull", label: t("m1.input.buildMonths.label"), value: result.monthsToFull === null ? t("m1.result.full") : t("m1.result.monthsToFull", { months: f.months(result.monthsToFull) }) },
                ]}
              />
            </Card>

            <h3 className="text-base font-bold text-text">{t("m1.result.tiers.title")}</h3>

            <Card header={<span className="text-base font-semibold text-text">{t("m1.result.tiers.savingsAccount")}</span>}>
              <div className="text-2xl font-bold tabular-nums text-brand-700">{f.money(result.tiers.savingsAccount)}</div>
              <p className="mt-1 text-sm text-text-muted">{t("m1.result.tiers.savingsAccountHint")}</p>
            </Card>

            <Card
              header={
                <span className="text-base font-semibold text-text">
                  <Term k="ladder">{t("m1.result.tiers.fdrLadder")}</Term>
                </span>
              }
            >
              <div className="text-2xl font-bold tabular-nums text-brand-700">{f.money(result.tiers.fdrLadder)}</div>
              <p className="mt-1 text-sm text-text-muted">{t("m1.result.tiers.fdrLadderHint")}</p>
              <FigureList
                className="mt-3"
                items={[
                  { key: "slice", label: t("m1.result.tiers.fdrPerSlice"), value: f.money(result.tiers.fdrPerSlice), hint: t("m1.result.tiers.fdrSlices", { amount: f.money(result.tiers.fdrPerSlice) }) },
                  { key: "banks", label: t("m1.result.tiers.banksNeeded"), value: f.number(result.tiers.banksNeeded), hint: t("m1.result.tiers.banksNeededHint", { limit: f.money(depositLimit, { compact: true }) }) },
                ]}
              />
            </Card>

            {result.tiers.sanchayapatraLayer && (
              <Card
                header={
                  <span className="text-base font-semibold text-text">
                    <Term k="sanchayapatra">{t("m1.result.tiers.sanchayapatraLayer")}</Term>
                  </span>
                }
              >
                <p className="text-sm text-text-muted">{t("m1.result.tiers.sanchayapatraLayerHint")}</p>
              </Card>
            )}

            <Card className="border-brand-200 bg-brand-50" header={<span className="text-base font-semibold text-brand-900">{t("m1.section.nextStep")}</span>}>
              <p className="text-base leading-relaxed text-brand-900">{t(result.nextStep)}</p>
            </Card>

            <Card header={<span className="text-base font-semibold text-text">{t("m1.section.rules")}</span>}>
              <ul className="flex flex-col gap-2 text-sm leading-relaxed text-text-muted">
                {result.rules.map((k) => (
                  <li key={k} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                    <span>{t(k)}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {!demo && <StartOverButton />}
          </>
        )}
      </Section>
    </div>
  );
}
