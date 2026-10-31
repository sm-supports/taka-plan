"use client";
/**
 * M2 Insurance & health. First visit (empty m2 slice): four questions one per screen (M2Flow), then
 * the result. Returning visit: every answer on one page, then the result. The engine input is the
 * one the plan uses (./input.ts), so the plan's Insurance bucket matches this screen.
 * `?demo=1` shows the fixture (./demo.ts) and writes nothing.
 */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";
import { computeInsurance, getRate, type M2Input, type M2Result } from "@taka/engine";
import { StartOverButton } from "@/components/drafts/StartOverButton";
import { Card } from "@/components/ui/Card";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { useCountryRates } from "@/lib/country/useCountry";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";
import type { TakaData } from "@/lib/store/types";
import { calcErrorKey, type CalcErrorKey } from "../shared/engineError";
import { DemoBanner, Section } from "../shared/Figures";
import { useDemoMode, useToday } from "../shared/hooks";
import { M2_DEMO_INPUT, m2DemoResult } from "./demo";
import { buildM2Input, hasM2Answers, policyToDraft } from "./input";
import { InsurerChecklist } from "./InsurerChecklist";
import { M2Flow } from "./M2Flow";
import { M2Inputs } from "./M2Inputs";
import { M2Results } from "./M2Results";
import { PolicyChecker } from "./PolicyChecker";

/** The persisted slices buildM2Input reads (stable references until they change). */
function pickData(s: TakaData): TakaData {
  const { schemaVersion, country, locale, onboarding, profile, m1, m2, m3, m4, m5, m6, m7, drafts } = s;
  return { schemaVersion, country, locale, onboarding, profile, m1, m2, m3, m4, m5, m6, m7, drafts };
}

interface Outcome {
  input: M2Input | null;
  result: M2Result | null;
  errorKey: CalcErrorKey | null;
}

const linkClass = "tap inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-surface px-4 text-base font-semibold text-text hover:bg-surface-muted";

export function M2Calculator() {
  const { t, locale } = useT();
  const snapshot = useCountryRates();
  const today = useToday();
  const demo = useDemoMode() !== null;
  const data = useTakaStore(useShallow(pickData));

  // Decided once per visit (the store is hydrated before this renders): an empty slice opens the questions.
  const [mode, setMode] = useState<"flow" | "calculator">(() => (hasM2Answers(data.m2) ? "calculator" : "flow"));
  const [justFinished, setJustFinished] = useState(false);

  const defaultCoverToAge = useMemo(() => getRate(snapshot, "insurance_cover_to_age"), [snapshot]);
  const defaultIncomeShare = useMemo(() => getRate(snapshot, "insurance_income_share"), [snapshot]);

  const outcome = useMemo<Outcome>(() => {
    if (demo) {
      try {
        return { input: M2_DEMO_INPUT, result: m2DemoResult(snapshot, today), errorKey: null };
      } catch (e) {
        return { input: M2_DEMO_INPUT, result: null, errorKey: calcErrorKey(e) };
      }
    }
    const input = buildM2Input(data);
    if (!input) return { input: null, result: null, errorKey: null };
    try {
      return { input, result: computeInsurance(input, snapshot, today), errorKey: null };
    } catch (e) {
      return { input, result: null, errorKey: calcErrorKey(e) };
    }
  }, [demo, data, snapshot, today]);

  useEffect(() => {
    if (justFinished) document.getElementById("m2-result")?.scrollIntoView({ block: "start" });
  }, [justFinished]);

  const header = (
    <header>
      <h1 className="text-2xl font-bold text-text">{t("m2.title")}</h1>
      <p className="mt-1 text-base text-text-muted">{t("m2.intro")}</p>
      {demo && <DemoBanner text={t("m2.demo")} />}
    </header>
  );

  // No complete onboarding profile: this check needs age, income and dependents first.
  if (!demo && !outcome.input) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Card header={<h2 className="text-lg font-bold text-text">{t("m2.needProfile.title")}</h2>}>
          <p className="text-base leading-relaxed text-text-muted">{t("m2.needProfile.body")}</p>
          <Link href={`/${locale}/start/1`} className={`${linkClass} mt-4 w-full border-brand-600 bg-brand-600 text-white hover:bg-brand-700`}>
            {t("m2.needProfile.cta")}
          </Link>
        </Card>
      </div>
    );
  }

  if (!demo && mode === "flow" && outcome.input) {
    return (
      <M2Flow
        dependents={outcome.input.dependents}
        onDone={() => {
          setMode("calculator");
          setJustFinished(true);
        }}
      />
    );
  }

  const { input, result } = outcome;
  const coverToAge = input?.coverToAge ?? defaultCoverToAge;

  return (
    <div className="flex flex-col gap-8">
      {header}

      {!demo && input && <M2Inputs input={input} defaultCoverToAge={defaultCoverToAge} defaultIncomeShare={defaultIncomeShare} />}

      <Section title={t("m2.section.result")} id="m2-result" className="scroll-mt-20">
        {outcome.errorKey && <ErrorCard title={t("m2.title")} message={t(outcome.errorKey)} />}
        {result && input && (
          <>
            <M2Results input={input} result={result} coverToAge={coverToAge} />
            <PolicyChecker check={result.policyCheck} notes={result.notes} explanation={result.explain} readOnly={demo} demoDraft={demo ? policyToDraft(M2_DEMO_INPUT.policy) : undefined} />
            <InsurerChecklist items={result.checklist} />
            {!demo && (
              <>
                <Link href={`/${locale}/plan`} className={linkClass} data-testid="m2-back-to-plan">
                  {t("m2.backToPlan")}
                </Link>
                <StartOverButton />
              </>
            )}
          </>
        )}
      </Section>
    </div>
  );
}
