"use client";
/**
 * M6 Asset mix page body.
 * - First visit (no M6 answer in the store): the one-question-per-screen flow (M6Flow), then the result.
 * - Returning visit: the result, the rebalancer and every input on one page.
 * The input is built by the engine's own profileToPlanInput (the plan runs the same one), with the
 * gate taken from the plan's M1 and M3. `?demo=1` shows the PRD sample without reading or writing
 * the store.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";
import { computeAllocation, getRate, type BucketAmounts, type M6Input, type M6Result } from "@taka/engine";
import { StartOverButton } from "@/components/drafts/StartOverButton";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { useCountryRates } from "@/lib/country/useCountry";
import { useT } from "@/lib/i18n/useT";
import { selectProfile } from "@/lib/store/selectors";
import { useTakaStore } from "@/lib/store/store";
import type { M6State } from "@/lib/store/types";
import { usePlan } from "@/lib/store/usePlan";
import { calcErrorKey, type CalcErrorKey } from "../shared/engineError";
import { DemoBanner } from "../shared/Figures";
import { useDemoMode, useToday } from "../shared/hooks";
import { M6_DEMO_INPUT, m6DemoResult } from "./demo";
import { M6Flow } from "./M6Flow";
import { M6Inputs } from "./M6Inputs";
import { M6ResultView } from "./M6ResultView";
import { FALLBACK_AGE, ageBandFor, carriesCardDebt, hasM6Answers, incomeAnswerFor, m6InputFor, type Gate } from "./input";

interface Outcome {
  input: M6Input | null;
  result: M6Result | null;
  errorKey: CalcErrorKey | null;
}

export function M6Calculator() {
  const { t, locale } = useT();
  const snapshot = useCountryRates();
  const today = useToday();
  const demo = useDemoMode() !== null;

  const m6 = useTakaStore((s) => s.m6);
  const setM6 = useTakaStore((s) => s.setM6);
  const partialProfile = useTakaStore((s) => s.profile);
  const cards = useTakaStore((s) => s.m3.cards);
  const profile = useTakaStore(useShallow(selectProfile));
  const { plan } = usePlan();

  // Decided once per visit, so answering the first question does not jump to the calculator.
  const [mode, setMode] = useState<"flow" | "calc">(() => (hasM6Answers(useTakaStore.getState().m6) ? "calc" : "flow"));

  const gate: Gate | null = useMemo(() => (plan ? { hasEmergencyFund: plan.emergency.gap === 0, hasCardDebt: carriesCardDebt(cards) } : null), [plan, cards]);

  const rules = useMemo(
    () => ({
      noEquityYears: getRate(snapshot, "allocation_no_equity_years"),
      cashOnlyYears: getRate(snapshot, "allocation_cash_only_years"),
      driftBand: getRate(snapshot, "allocation_drift_band"),
      gold: { min: getRate(snapshot, "allocation_gold_min"), max: getRate(snapshot, "allocation_gold_max"), default: getRate(snapshot, "allocation_gold_default") },
    }),
    [snapshot],
  );

  const outcome = useMemo<Outcome>(() => {
    try {
      if (demo) return { input: M6_DEMO_INPUT, result: m6DemoResult(snapshot, today), errorKey: null };
      const input = m6InputFor(m6, profile, partialProfile, gate ?? { hasEmergencyFund: false, hasCardDebt: carriesCardDebt(cards) });
      if (!input) return { input: null, result: null, errorKey: null };
      return { input, result: computeAllocation(input, snapshot, today), errorKey: null };
    } catch (e) {
      return { input: null, result: null, errorKey: calcErrorKey(e) };
    }
  }, [demo, m6, profile, partialProfile, gate, cards, snapshot, today]);

  const age = profile?.age ?? (typeof partialProfile.age === "number" ? partialProfile.age : FALLBACK_AGE);
  const incomeType = profile?.incomeType ?? partialProfile.incomeType ?? "salaried";

  if (!demo && mode === "flow") {
    return (
      <M6Flow
        gate={gate}
        prefill={{ ageBand: ageBandFor(age), incomeStability: incomeAnswerFor(incomeType) }}
        noEquityYears={rules.noEquityYears}
        cashOnlyYears={rules.cashOnlyYears}
        onDone={() => {
          setMode("calc");
          if (typeof window !== "undefined") window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  const write = (patch: Partial<M6State>) => !demo && setM6(patch);
  const { input, result } = outcome;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-text">{t("m6.title")}</h1>
        <p className="mt-1 text-base text-text-muted">{t("m6.intro")}</p>
        {demo && <DemoBanner text={t("m6.demo")} />}
        {!demo && !profile && (
          <p className="mt-3 text-sm text-text-muted">
            {t("m6.needProfile")}{" "}
            <Link href={`/${locale}/start/1`} className="font-semibold text-brand-700 underline">
              {t("m6.startLink")}
            </Link>
          </p>
        )}
      </header>

      {outcome.errorKey && <ErrorCard title={t("m6.title")} message={t(outcome.errorKey)} />}

      {result && input && (
        <M6ResultView
          result={result}
          holdings={demo ? M6_DEMO_INPUT.holdings : m6.holdings}
          newMoney={demo ? M6_DEMO_INPUT.newMoney : m6.newMoney}
          lumpSum={input.lumpSum}
          propertyValue={input.propertyValue ?? 0}
          driftBand={rules.driftBand}
          onHoldings={(next: BucketAmounts | null) => write(next ? { holdings: next } : { holdings: undefined, newMoney: undefined })}
          onNewMoney={(n) => write({ newMoney: n })}
          readOnly={demo}
        />
      )}

      {input && result && (
        <M6Inputs
          input={input}
          storedRisk={demo ? M6_DEMO_INPUT.risk : m6.risk}
          suggestedProfile={result.suggestedProfile}
          goldBounds={rules.gold}
          noEquityYears={rules.noEquityYears}
          cashOnlyYears={rules.cashOnlyYears}
          onChange={write}
          readOnly={demo}
        />
      )}

      {!demo && result && (
        <div className="flex flex-col gap-3">
          <Link
            href={`/${locale}/plan`}
            data-testid="back-to-plan"
            className="tap inline-flex items-center justify-center rounded-xl border border-line bg-surface px-4 text-base font-semibold text-text hover:bg-surface-muted"
          >
            {t("m6.backToPlan")}
          </Link>
          <StartOverButton />
        </div>
      )}
    </div>
  );
}
