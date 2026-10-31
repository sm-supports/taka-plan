"use client";
/**
 * First visit (no M6 answer in the store yet): the PRD flow, one question per screen.
 * Gate check (computed from the plan; the user may continue) → the four risk questions (age band and
 * income prefilled from the profile but shown) → amounts and when the money is needed → result.
 * Every answer is written with setM6 as soon as the user gives or confirms it; nothing is written
 * for a screen the user has not reached.
 */
import Link from "next/link";
import { useState } from "react";
import type { RiskAnswer } from "@taka/engine";
import { ChoiceButtons } from "@/components/ui/ChoiceButtons";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { SliderWithNumber } from "@/components/ui/SliderWithNumber";
import { StepFrame } from "@/components/ui/StepFrame";
import { cn } from "@/components/ui/cn";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";
import { HORIZON_MAX, HORIZON_MIN, RISK_ANSWERS, yearsForHorizonAnswer, type Gate, type RiskKey } from "./input";

const STEPS = ["gate", "ageBand", "incomeStability", "horizon", "reaction", "amounts"] as const;
type Step = (typeof STEPS)[number];

/** Age and income read youngest / steadiest first; horizon and the 20% fall read in time / calm order. */
export function answerOrder(k: RiskKey): RiskAnswer[] {
  return k === "ageBand" || k === "incomeStability" ? [...RISK_ANSWERS].reverse() : [...RISK_ANSWERS];
}

export interface M6FlowProps {
  /** null while the profile is incomplete (no plan to read the gate from). */
  gate: Gate | null;
  /** Prefills for the first two questions, from the profile. */
  prefill: { ageBand: RiskAnswer; incomeStability: RiskAnswer };
  noEquityYears: number;
  cashOnlyYears: number;
  onDone: () => void;
}

function GateRow({ ok, okText, badText, href, linkText }: { ok: boolean; okText: string; badText: string; href: string; linkText: string }) {
  return (
    <li className={cn("rounded-xl border px-4 py-3", ok ? "border-status-green/30 bg-status-green-soft" : "border-status-amber/30 bg-status-amber-soft")}>
      <p className={cn("flex items-center gap-2 text-base font-semibold", ok ? "text-status-green" : "text-status-amber")}>
        <span aria-hidden="true">{ok ? "✓" : "!"}</span>
        {ok ? okText : badText}
      </p>
      {!ok && (
        <Link href={href} className="mt-1 inline-flex min-h-10 items-center text-sm font-semibold text-status-amber underline">
          {linkText}
        </Link>
      )}
    </li>
  );
}

export function M6Flow({ gate, prefill, noEquityYears, cashOnlyYears, onDone }: M6FlowProps) {
  const { t, locale } = useT();
  const f = useFormat();
  const m6 = useTakaStore((s) => s.m6);
  const setM6 = useTakaStore((s) => s.setM6);
  const [index, setIndex] = useState(0);
  const step: Step = STEPS[index] ?? "amounts";

  const risk = m6.risk ?? {};
  const answerFor = (k: RiskKey): RiskAnswer | null => risk[k] ?? (k === "ageBand" ? prefill.ageBand : k === "incomeStability" ? prefill.incomeStability : null);
  const setRisk = (k: RiskKey, v: RiskAnswer) => setM6({ risk: { ...useTakaStore.getState().m6.risk, [k]: v } });

  const [horizonYears, setHorizonYears] = useState<number>(() => m6.horizonYears ?? yearsForHorizonAnswer(risk.horizon));
  const [horizonTouched, setHorizonTouched] = useState(m6.horizonYears !== undefined);
  const lumpSum = m6.lumpSum ?? null;
  const monthly = m6.monthly ?? null;
  const hasAmount = (lumpSum ?? 0) > 0 || (monthly ?? 0) > 0;

  const back = index > 0 ? () => setIndex(index - 1) : undefined;
  const next = () => {
    if (step === "ageBand" || step === "incomeStability" || step === "horizon" || step === "reaction") {
      const v = answerFor(step);
      if (v === null) return;
      // Confirming a prefilled answer makes it the user's own.
      if (risk[step] === undefined) setRisk(step, v);
      if (step === "horizon" && !horizonTouched && m6.horizonYears === undefined) setHorizonYears(yearsForHorizonAnswer(v));
    }
    if (step === "amounts") {
      if (!hasAmount) return;
      setM6({ horizonYears });
      onDone();
      return;
    }
    setIndex(index + 1);
  };

  const common = { step: index + 1, total: STEPS.length, onBack: back, onNext: next };

  if (step === "gate") {
    const allClear = gate !== null && gate.hasEmergencyFund && !gate.hasCardDebt;
    return (
      <StepFrame {...common} title={t("m6.flow.gate.title")} hint={t("m6.flow.gate.hint")} nextLabel={t(allClear ? "m6.flow.gate.continue" : "m6.flow.gate.continueAnyway")}>
        {gate ? (
          <ul className="flex flex-col gap-3" data-testid="gate-check">
            <GateRow ok={gate.hasEmergencyFund} okText={t("m6.flow.gate.emergencyOk")} badText={t("m6.flow.gate.emergencyMissing")} href={`/${locale}/m1`} linkText={t("m6.flow.gate.openEmergency")} />
            <GateRow ok={!gate.hasCardDebt} okText={t("m6.flow.gate.cardOk")} badText={t("m6.flow.gate.cardMissing")} href={`/${locale}/m3`} linkText={t("m6.flow.gate.openDebt")} />
            {!gate.hasEmergencyFund && <li className="text-sm text-text-muted">{t("m6.gate.noEmergencyFund")}</li>}
            {gate.hasCardDebt && <li className="text-sm text-text-muted">{t("m6.gate.cardDebt")}</li>}
            {allClear && <li className="text-sm font-medium text-status-green">{t("m6.flow.gate.allClear")}</li>}
          </ul>
        ) : (
          <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4" data-testid="gate-check">
            <p className="text-base text-text">{t("m6.needProfile")}</p>
            <Link href={`/${locale}/start/1`} className="inline-flex min-h-10 items-center font-semibold text-brand-700 underline">
              {t("m6.startLink")}
            </Link>
          </div>
        )}
      </StepFrame>
    );
  }

  if (step === "amounts") {
    return (
      <StepFrame {...common} title={t("m6.flow.amounts.title")} hint={t("m6.flow.amounts.hint")} nextLabel={t("m6.flow.amounts.seeResult")} nextDisabled={!hasAmount}>
        <div className="flex flex-col gap-5">
          <MoneyInput id="m6-flow-lump" value={lumpSum} onChange={(n) => setM6({ lumpSum: n ?? undefined })} label={t("m6.input.lumpSum.label")} hint={t("m6.input.lumpSum.hint")} min={0} />
          <MoneyInput id="m6-flow-monthly" value={monthly} onChange={(n) => setM6({ monthly: n ?? undefined })} label={t("m6.input.monthly.label")} hint={t("m6.input.monthly.hint")} min={0} />
          <SliderWithNumber
            id="m6-flow-horizon"
            value={horizonYears}
            onChange={(n) => {
              setHorizonTouched(true);
              setHorizonYears(n);
              setM6({ horizonYears: n });
            }}
            min={HORIZON_MIN}
            max={HORIZON_MAX}
            step={1}
            label={t("m6.input.horizonYears.label")}
            hint={t("m6.input.horizonYears.hint", { noEquity: f.number(noEquityYears), cashOnly: f.number(cashOnlyYears) })}
            unitLabel={t(horizonYears === 1 ? "common.unit.year" : "common.unit.years")}
          />
          {!hasAmount && <p className="text-sm text-text-muted">{t("m6.flow.amounts.needOne")}</p>}
        </div>
      </StepFrame>
    );
  }

  const value = answerFor(step);
  return (
    <StepFrame {...common} title={t(`m6.flow.${step}.title`)} hint={t(`m6.flow.${step}.hint`)} nextDisabled={value === null}>
      <ChoiceButtons<string>
        label={t(`m6.flow.${step}.title`)}
        options={answerOrder(step).map((a) => ({ value: String(a), label: t(`m6.answer.${step}.${a}`) }))}
        value={value === null ? null : String(value)}
        onChange={(v) => {
          const pick = Array.isArray(v) ? v[0] : v;
          if (pick !== undefined) setRisk(step, Number(pick) as RiskAnswer);
        }}
      />
    </StepFrame>
  );
}
