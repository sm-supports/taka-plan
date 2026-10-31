"use client";
/**
 * M7 Retirement & family ("Plan to 100"). First visit (no m7 answer in the store): the PRD's fork and
 * one question per screen, then the result. Returning visit: every M7 field on one page, the plan-to
 * slider (85–105, default 100), the income sources (F2) and the result, which updates live.
 * `?demo=1` (or `?demo=retired`) shows a sample result computed by the engine; nothing is written.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { computeRetirement, getRate, hasOverrideAnswers, M7_AGE_MAX, M7_AGE_MIN, type M7Input, type M7Mode, type M7Result, type RetireeType, type Sex } from "@taka/engine";
import { StartOverButton } from "@/components/drafts/StartOverButton";
import { Button } from "@/components/ui/Button";
import { ChoiceButtons } from "@/components/ui/ChoiceButtons";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { SliderWithNumber } from "@/components/ui/SliderWithNumber";
import { useCountryRates } from "@/lib/country/useCountry";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";
import { usePlan } from "@/lib/store/usePlan";
import { calcErrorKey, type CalcErrorKey } from "../shared/engineError";
import { DemoBanner, Field, Section } from "../shared/Figures";
import { useDemoMode, useToday } from "../shared/hooks";
import { m7DemoInput } from "./demo";
import { IncomeSources } from "./IncomeSources";
import { buildM7Input, shiftedStart, START_SHIFT_YEARS, withoutSources } from "./input";
import { RETIREMENT_AGE_MAX, RetirementFlow } from "./RetirementFlow";
import { RetirementResult } from "./RetirementResult";

type Phase = "flow" | "result" | "calculator";
type SexChoice = Sex | "unknown";

interface Outcome {
  result: M7Result | null;
  errorKey: CalcErrorKey | null;
  earlier: M7Result | null;
  later: M7Result | null;
  /** Monthly saving without any income source (to show what the sources save). */
  baseline: number | null;
}

const EMPTY: Outcome = { result: null, errorKey: null, earlier: null, later: null, baseline: null };

export function RetirementCalculator() {
  const { t, locale } = useT();
  const f = useFormat();
  const rates = useCountryRates();
  const today = useToday();
  const demo = useDemoMode();

  const profile = useTakaStore((s) => s.profile);
  const m1 = useTakaStore((s) => s.m1);
  const m7 = useTakaStore((s) => s.m7);
  const setM7 = useTakaStore((s) => s.setM7);
  const setProfile = useTakaStore((s) => s.setProfile);
  const { plan } = usePlan();
  const allocation = plan?.allocation?.weights;

  // Decided once per visit: the store is rehydrated before this mounts (HydrationGate).
  const [phase, setPhase] = useState<Phase>(() => (hasOverrideAnswers(m7) ? "calculator" : "flow"));

  const input = useMemo<M7Input | null>(() => {
    if (demo) return m7DemoInput(demo);
    return buildM7Input(m7, { age: profile.age ?? null, essentials: profile.essentials ?? null, liquidSavings: m1.liquidSavings ?? null }, allocation);
  }, [demo, m7, profile.age, profile.essentials, m1.liquidSavings, allocation]);

  const outcome = useMemo<Outcome>(() => {
    if (!input) return EMPTY;
    try {
      const result = computeRetirement(input, rates, today);
      const working = input.mode === "working";
      let baseline: number | null = null;
      if (working && input.sources && hasOverrideAnswers(input.sources)) {
        try {
          baseline = computeRetirement(withoutSources(input), rates, today).targets.plan.monthlySaving;
        } catch {
          baseline = null;
        }
      }
      return {
        result,
        errorKey: null,
        earlier: working ? shiftedStart(input, -START_SHIFT_YEARS, rates, today) : null,
        later: working ? shiftedStart(input, START_SHIFT_YEARS, rates, today) : null,
        baseline,
      };
    } catch (e) {
      return { ...EMPTY, errorKey: calcErrorKey(e) };
    }
  }, [input, rates, today]);

  const header = (
    <header>
      <h1 className="text-2xl font-bold text-text">{t("m7.title")}</h1>
      <p className="mt-1 text-base text-text-muted">{t((input?.mode ?? m7.mode) === "retired" ? "m7.introRetired" : "m7.intro")}</p>
      {demo && <DemoBanner text={t("m7.demo")} />}
    </header>
  );

  const resultBlock = (
    <>
      {outcome.errorKey && <ErrorCard title={t("m7.title")} message={t(outcome.errorKey)} />}
      {outcome.result && input && (
        <RetirementResult result={outcome.result} input={input} earlier={outcome.earlier} later={outcome.later} mixUsed={!demo && allocation !== undefined && input.mode === "working"} />
      )}
    </>
  );

  const footer = outcome.result && !demo && (
    <div className="flex flex-col gap-3">
      <Link href={`/${locale}/plan`} className="tap inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-surface px-4 text-base font-semibold text-text hover:bg-surface-muted" data-testid="m7-back-to-plan">
        {t("m7.backToPlan")}
      </Link>
      <StartOverButton />
    </div>
  );

  if (demo) {
    return (
      <div className="flex flex-col gap-8">
        {header}
        <Section title={t("m7.section.result")} id="m7-result">
          {resultBlock}
            </Section>
      </div>
    );
  }

  if (phase === "flow") return <RetirementFlow onDone={() => setPhase("result")} />;

  // The plan-to age, shown with the first result as well as on the full page.
  const planMin = getRate(rates, "plan_to_age_min");
  const planMax = getRate(rates, "plan_to_age_max");
  const planTo = m7.planToAge ?? getRate(rates, "plan_to_age");
  const planToSlider = (
    <SliderWithNumber
      id="m7-plan-to"
      value={planTo}
      onChange={(n) => setM7({ planToAge: n })}
      min={planMin}
      max={planMax}
      step={1}
      label={t("m7.input.planToAge.label")}
      hint={t("m7.input.planToAge.hint", { min: f.number(planMin), max: f.number(planMax) })}
      unitLabel={t("common.unit.years")}
    />
  );

  if (phase === "result") {
    return (
      <div className="flex flex-col gap-8">
        {header}
        <Section title={t("m7.section.result")} id="m7-result">
          {planToSlider}
          {resultBlock}
          <div className="flex flex-col gap-2">
            {input?.mode !== "retired" && (
              <Button
                size="lg"
                fullWidth
                data-testid="m7-add-sources"
                onClick={() => {
                  setPhase("calculator");
                  requestAnimationFrame(() => document.getElementById("m7-sources")?.scrollIntoView({ block: "start" }));
                }}
              >
                {t("m7.result.addSources")}
              </Button>
            )}
            <Button variant="secondary" fullWidth onClick={() => setPhase("calculator")}>
              {t("m7.result.editAnswers")}
            </Button>
          </div>
          {footer}
        </Section>
      </div>
    );
  }

  // ---- Returning visit: every field on one page. ----
  const mode: M7Mode = m7.mode ?? "working";
  const age = profile.age ?? null;
  const defaultRetire = getRate(rates, m7.retireeType === "government" ? "retirement_age_government" : "retirement_age_default");
  const retireMin = Math.min(M7_AGE_MAX - 1, (age ?? M7_AGE_MIN) + 1);
  const retireMax = Math.max(retireMin, Math.min(RETIREMENT_AGE_MAX, planTo - 1));
  const retirementAge = m7.retirementAge ?? Math.min(retireMax, Math.max(retireMin, defaultRetire));
  const sexChoice: SexChoice = m7.sex ?? "unknown";
  const spending = m7.monthlySpending ?? profile.essentials ?? null;
  const savings = m7.savings ?? m1.liquidSavings ?? null;
  const loweredBy = outcome.result && outcome.baseline !== null ? Math.max(0, outcome.baseline - outcome.result.targets.plan.monthlySaving) : null;

  const pick =
    <V extends string>(write: (v: V) => void) =>
    (v: V | V[]) => {
      const p = Array.isArray(v) ? v[0] : v;
      if (p) write(p);
    };

  return (
    <div className="flex flex-col gap-8">
      {header}

      <Section title={t("m7.section.inputs")}>
        <Field id="m7-mode" label={t("m7.input.mode")}>
          <ChoiceButtons<M7Mode>
            columns={2}
            label={t("m7.input.mode")}
            options={[
              { value: "working", label: t("m7.mode.working") },
              { value: "retired", label: t("m7.mode.retired") },
            ]}
            value={mode}
            onChange={pick<M7Mode>((v) => setM7({ mode: v }))}
          />
        </Field>

        <SliderWithNumber id="m7-age" value={age ?? 30} onChange={(n) => setProfile({ age: n })} min={M7_AGE_MIN} max={M7_AGE_MAX} step={1} label={t("m7.input.age.label")} hint={t("m7.input.age.hint")} unitLabel={t("common.unit.years")} />

        <Field id="m7-sex" label={t("m7.input.sex.label")} hint={t("m7.input.sex.hint")}>
          <ChoiceButtons<SexChoice>
            columns={2}
            label={t("m7.input.sex.label")}
            options={[
              { value: "female", label: t("m7.sex.female") },
              { value: "male", label: t("m7.sex.male") },
              { value: "unknown", label: t("m7.sex.unknown") },
            ]}
            value={sexChoice}
            onChange={pick<SexChoice>((v) => setM7({ sex: v === "unknown" ? undefined : v }))}
          />
        </Field>

        {mode === "working" ? (
          <>
            <SliderWithNumber
              id="m7-retire"
              value={retirementAge}
              onChange={(n) => setM7({ retirementAge: n })}
              min={retireMin}
              max={retireMax}
              step={1}
              label={t("m7.input.retirementAge.label")}
              hint={t("m7.input.retirementAge.hint", { age: f.number(defaultRetire) })}
              unitLabel={t("common.unit.years")}
            />
            <MoneyInput key={`${mode}-m7-spending`} id="m7-spending" value={spending} onChange={(n) => setM7({ monthlySpending: n ?? undefined })} label={t("m7.input.spending.label")} hint={t("m7.input.spending.hint")} min={0} />
            <MoneyInput key={`${mode}-m7-savings`} id="m7-savings" value={savings} onChange={(n) => setM7({ savings: n ?? undefined })} label={t("m7.input.savings.label")} hint={t("m7.input.savings.hint")} min={0} />
            <MoneyInput key={`${mode}-m7-monthly`} id="m7-monthly" value={m7.monthlySaving ?? null} onChange={(n) => setM7({ monthlySaving: n ?? undefined })} label={t("m7.input.monthlySaving.label")} hint={t("m7.input.monthlySaving.hint")} min={0} />
          </>
        ) : (
          <>
            <Field id="m7-retiree" label={t("m7.input.retireeType")}>
              <ChoiceButtons<RetireeType>
                label={t("m7.input.retireeType")}
                options={[
                  { value: "government", label: t("m7.retireeType.government"), hint: t("m7.retireeType.governmentHint") },
                  { value: "private", label: t("m7.retireeType.private"), hint: t("m7.retireeType.privateHint") },
                ]}
                value={m7.retireeType ?? "private"}
                onChange={pick<RetireeType>((v) => setM7({ retireeType: v }))}
              />
            </Field>
            <MoneyInput key={`${mode}-m7-savings`} id="m7-savings" value={savings} onChange={(n) => setM7({ savings: n ?? undefined })} label={t("m7.input.retiredSavings.label")} hint={t("m7.input.retiredSavings.hint")} min={0} />
            <MoneyInput key={`${mode}-m7-other`} id="m7-other" value={m7.otherMonthlyIncome ?? null} onChange={(n) => setM7({ otherMonthlyIncome: n ?? undefined })} label={t("m7.input.otherIncome.label")} hint={t("m7.input.otherIncome.hint")} min={0} />
            <MoneyInput key={`${mode}-m7-spending`} id="m7-spending" value={spending} onChange={(n) => setM7({ monthlySpending: n ?? undefined })} label={t("m7.input.spending.label")} hint={t("m7.input.spending.hint")} min={0} />
          </>
        )}

        {planToSlider}
      </Section>

      <Section title={t("m7.section.sources")} id="m7-sources">
        <IncomeSources mode={mode} sex={m7.sex} loweredBy={loweredBy} />
      </Section>

      <Section title={t("m7.section.result")} id="m7-result">
        {resultBlock}
        {footer}
      </Section>
    </div>
  );
}
