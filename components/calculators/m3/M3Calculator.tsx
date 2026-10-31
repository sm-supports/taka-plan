"use client";
/**
 * M3 Debt health check page body. Inputs are prefilled from the store and every edit writes
 * back (profile take-home/essentials, loans, cards, extra monthly, borrowing scenario), so the
 * plan screen updates live. With `demo`, a sample input replaces the store.
 */
import { useMemo, useState } from "react";
import { computeDebtHealth, getRate, type Card as CardT, type Loan, type M3Input, type M3Result } from "@taka/engine";
import { StartOverButton } from "@/components/drafts/StartOverButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { SliderWithNumber } from "@/components/ui/SliderWithNumber";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { useRates } from "@/lib/rates/useRates";
import { makeId, useTakaStore } from "@/lib/store/store";
import { CardEditor } from "./CardEditor";
import { DEMO_M3_INPUT, buildDemoM3Result } from "./demo";
import { engineErrorKey, todayISO } from "./engineError";
import { LoanEditor } from "./LoanEditor";
import { M3Results } from "./M3Results";
import { RateInput } from "./RateInput";

export interface M3CalculatorProps {
  demo?: boolean;
}

const SCENARIO_MIN_MONTHS = 6;
const SCENARIO_MAX_MONTHS = 360;
const SCENARIO_DEFAULT_MONTHS = 60;

export function M3Calculator({ demo = false }: M3CalculatorProps) {
  const { t } = useT();
  const f = useFormat();
  const { snapshot } = useRates();
  const [today] = useState(todayISO);

  const profile = useTakaStore((s) => s.profile);
  const m3 = useTakaStore((s) => s.m3);
  const setProfile = useTakaStore((s) => s.setProfile);
  const addLoan = useTakaStore((s) => s.addLoan);
  const updateLoan = useTakaStore((s) => s.updateLoan);
  const removeLoan = useTakaStore((s) => s.removeLoan);
  const addCard = useTakaStore((s) => s.addCard);
  const updateCard = useTakaStore((s) => s.updateCard);
  const removeCard = useTakaStore((s) => s.removeCard);
  const setM3 = useTakaStore((s) => s.setM3);

  const cardCap = getRate(snapshot, "credit_card_rate_cap");
  const defaultLoanRate = getRate(snapshot, "personal_loan_rate_default");
  const savingsShare = getRate(snapshot, "savings_rate_default");

  const input: M3Input = useMemo(() => {
    if (demo) return DEMO_M3_INPUT;
    const takeHome = profile.takeHome ?? 0;
    return {
      takeHome,
      essentials: profile.essentials ?? 0,
      savingsTarget: Math.round(takeHome * savingsShare),
      loans: m3.loans,
      cards: m3.cards,
      ...(m3.extraMonthly !== undefined ? { extraMonthly: m3.extraMonthly } : {}),
      ...(m3.scenario !== undefined ? { scenario: m3.scenario } : {}),
    };
  }, [demo, profile.takeHome, profile.essentials, m3, savingsShare]);

  const computed = useMemo<{ result: M3Result | null; errorKey: string | null }>(() => {
    try {
      return { result: demo ? buildDemoM3Result(input, snapshot, today) : computeDebtHealth(input, snapshot, today), errorKey: null };
    } catch (e) {
      return { result: null, errorKey: engineErrorKey(e) };
    }
  }, [demo, input, snapshot, today]);

  const scenarioRate = input.scenario?.annualRate ?? defaultLoanRate;
  const scenarioMonths = input.scenario?.months ?? SCENARIO_DEFAULT_MONTHS;
  const setScenario = (patch: Partial<{ annualRate: number; months: number }>) =>
    setM3({ scenario: { annualRate: patch.annualRate ?? scenarioRate, months: patch.months ?? scenarioMonths } });

  const onAddLoan = () => {
    const loan: Loan = { id: makeId("loan"), type: "personal", outstanding: 0, annualRate: defaultLoanRate, emi: 0, monthsLeft: 12 };
    addLoan(loan);
  };
  const onAddCard = () => {
    const card: CardT = { id: makeId("card"), balance: 0, limit: 0, paysInFull: true };
    addCard(card);
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-text">{t("m3.title")}</h1>
        <p className="mt-1 text-base text-text-muted">{t("m3.intro")}</p>
      </header>

      {demo && (
        <p role="status" className="rounded-xl border border-status-amber/30 bg-status-amber-soft px-3 py-2 text-sm text-text">
          {t("m3.demoBanner")}
        </p>
      )}

      {/* Profile numbers the check depends on */}
      <Card header={<h2 className="text-lg font-bold text-text">{t("m3.profile.title")}</h2>}>
        <p className="-mt-2 mb-3 text-sm text-text-muted">{t("m3.profile.hint")}</p>
        <div className="flex flex-col gap-4">
          <MoneyInput
            id="m3-takeHome"
            label={t("m3.input.takeHome.label")}
            hint={t("m3.input.takeHome.hint")}
            value={input.takeHome || null}
            min={0}
            onChange={(n) => !demo && n !== null && n >= 0 && setProfile({ takeHome: n })}
          />
          <MoneyInput
            id="m3-essentials"
            label={t("m3.input.essentials.label")}
            hint={t("m3.input.essentials.hint")}
            value={input.essentials || null}
            min={0}
            onChange={(n) => !demo && n !== null && n >= 0 && setProfile({ essentials: n })}
          />
          <p className="text-sm text-text-muted">
            {t("m3.input.savingsTarget.label")}: <span className="font-semibold text-text">{f.taka(input.savingsTarget)}</span> — {t("m3.input.savingsTarget.hint")}
          </p>
        </div>
      </Card>

      {/* Loans */}
      <section aria-labelledby="m3-loans" className="flex flex-col gap-3">
        <h2 id="m3-loans" className="text-lg font-bold text-text">
          {t("m3.input.loans.title")}
        </h2>
        {input.loans.length === 0 && <p className="text-sm text-text-muted">{t("m3.input.loans.empty")}</p>}
        {input.loans.map((loan, i) => (
          <LoanEditor key={loan.id} loan={loan} index={i} onChange={(patch) => !demo && updateLoan(loan.id, patch)} onRemove={() => !demo && removeLoan(loan.id)} />
        ))}
        <Button variant="secondary" fullWidth onClick={onAddLoan} disabled={demo}>
          + {t("m3.input.loans.add")}
        </Button>
      </section>

      {/* Cards */}
      <section aria-labelledby="m3-cards" className="flex flex-col gap-3">
        <h2 id="m3-cards" className="text-lg font-bold text-text">
          {t("m3.input.cards.title")}
        </h2>
        {input.cards.length === 0 && <p className="text-sm text-text-muted">{t("m3.input.cards.empty")}</p>}
        {input.cards.map((card, i) => (
          <CardEditor key={card.id} card={card} index={i} capRate={cardCap} onChange={(patch) => !demo && updateCard(card.id, patch)} onRemove={() => !demo && removeCard(card.id)} />
        ))}
        <Button variant="secondary" fullWidth onClick={onAddCard} disabled={demo}>
          + {t("m3.input.cards.add")}
        </Button>
      </section>

      {/* Extra monthly + scenario */}
      <Card header={<h2 className="text-lg font-bold text-text">{t("m3.input.scenario.title")}</h2>}>
        <div className="flex flex-col gap-4">
          <MoneyInput
            id="m3-extra"
            label={`${t("m3.input.extraMonthly.label")} (${t("common.optional")})`}
            hint={t("m3.input.extraMonthly.hint")}
            value={input.extraMonthly ?? null}
            min={0}
            onChange={(n) => !demo && setM3({ extraMonthly: n === null || n < 0 ? undefined : n })}
          />
          <RateInput
            id="m3-scenario-rate"
            label={t("m3.input.scenario.annualRate.label")}
            hint={t("m3.input.scenario.annualRate.hint")}
            value={scenarioRate}
            onChange={(r) => !demo && r !== null && setScenario({ annualRate: r })}
          />
          <SliderWithNumber
            id="m3-scenario-months"
            label={t("m3.input.scenario.months.label")}
            hint={t("m3.input.scenario.months.hint")}
            value={scenarioMonths}
            min={SCENARIO_MIN_MONTHS}
            max={SCENARIO_MAX_MONTHS}
            step={6}
            unitLabel={t("common.unit.months")}
            onChange={(n) => !demo && setScenario({ months: Math.round(n) })}
          />
        </div>
      </Card>

      {computed.result ? <M3Results input={input} result={computed.result} snapshot={snapshot} /> : <ErrorCard title={t("m3.title")} message={t(computed.errorKey ?? "errors.generic")} />}
      {computed.result && !demo && <StartOverButton />}
    </div>
  );
}
