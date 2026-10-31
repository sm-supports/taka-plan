"use client";
/**
 * "Already paying a savings-type policy?" (collapsed by default). Five boxes; once all five are valid
 * the policy is written to the store and the engine's comparison shows both paths side by side.
 * The copy never tells anyone to stop a policy (m2.note.policyNotAdvice is always shown).
 */
import { useState } from "react";
import { fromBanglaDigits, type M2PolicyCheck, type M2StepId, type Explanation } from "@taka/engine";
import { WhyButton } from "@/components/explain/WhyButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { cn } from "@/components/ui/cn";
import { useProductName } from "@/components/ui/useProductName";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";
import { FigureList } from "../shared/Figures";
import { EMPTY_POLICY, POLICY_TERM_MAX, draftToPolicy, policyToDraft, type PolicyDraft } from "./input";

const POLICY_STEPS: readonly M2StepId[] = ["m2.policyTerm", "m2.policyInvest", "m2.policyIrr"];

/** Whole-number box (years) that reads Bangla or Latin digits and shows the locale's digits. */
function YearsBox({ id, label, value, onChange, max }: { id: string; label: string; value: number | null; onChange: (n: number | null) => void; max: number }) {
  const { t } = useT();
  const { inputDigits } = useFormat();
  const [text, setText] = useState(() => (value === null ? "" : inputDigits(String(value))));
  const parse = (s: string): number | null => {
    const raw = fromBanglaDigits(s).trim();
    if (!/^\d+$/.test(raw)) return null;
    const n = Number(raw);
    return n <= max ? n : null;
  };
  const invalid = text.trim() !== "" && parse(text) === null;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-semibold text-text">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={text}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            const next = inputDigits(e.target.value);
            setText(next);
            onChange(parse(next));
          }}
          className={cn(
            "tap w-full rounded-xl border bg-surface py-3 ps-4 pe-20 text-2xl font-semibold tabular-nums text-text",
            invalid ? "border-status-red" : "border-line focus:border-brand-500",
          )}
        />
        <span className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-base text-text-muted" aria-hidden="true">
          {t("common.unit.years")}
        </span>
      </div>
    </div>
  );
}

export interface PolicyCheckerProps {
  check: M2PolicyCheck | undefined;
  /** The M2 result's notes: the policy ones (matured, no surrender value) are shown here. */
  notes?: readonly string[];
  explanation: Explanation;
  /** Demo: show the fixture's numbers, write nothing. */
  readOnly?: boolean;
  /** Demo policy numbers to show in the boxes. */
  demoDraft?: PolicyDraft;
}

export function PolicyChecker({ check, notes = [], explanation, readOnly, demoDraft }: PolicyCheckerProps) {
  const { t } = useT();
  const f = useFormat();
  const names = useProductName();
  const stored = useTakaStore((s) => s.m2.policy);
  const setM2 = useTakaStore((s) => s.setM2);
  const [draft, setDraft] = useState<PolicyDraft>(() => demoDraft ?? policyToDraft(stored));
  // Remount the boxes on "clear" so their text empties too.
  const [generation, setGeneration] = useState(0);

  const complete = draftToPolicy(draft) !== null;
  const edit = (patch: Partial<PolicyDraft>) => {
    if (readOnly) return;
    const next = { ...draft, ...patch };
    setDraft(next);
    const policy = draftToPolicy(next);
    if (policy) setM2({ policy });
  };
  const clear = () => {
    setDraft(EMPTY_POLICY);
    setGeneration((g) => g + 1);
    setM2({ policy: undefined });
  };

  // The safe deposit the difference goes into (the 1-year term deposit slot), named as sold locally,
  // in a phrase that fits the sentence (no brackets inside the hint's own wording).
  const instrument = t("common.instrumentInline.fdr_1y", { product: names.prose("fdr_1y") });
  const years = (n: number) => `${f.number(n)} ${t(n === 1 ? "common.unit.year" : "common.unit.years")}`;

  return (
    <details className="group rounded-card border border-line bg-surface" data-testid="m2-policy">
      <summary className="tap flex cursor-pointer list-none flex-col gap-1 px-4 py-3">
        <span className="flex items-center justify-between gap-3 text-base font-bold text-text">
          {t("m2.policy.title")}
          <svg className="h-5 w-5 shrink-0 text-text-muted transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-sm text-text-muted">{t("m2.policy.hint")}</span>
      </summary>

      <div className="flex flex-col gap-4 border-t border-line p-4" key={generation}>
        <p className="text-sm leading-relaxed text-text-muted">{t("m2.policy.intro")}</p>
        <MoneyInput id="m2-policy-premium" value={draft.annualPremium} onChange={(n) => edit({ annualPremium: n })} label={t("m2.policy.annualPremium.label")} min={0} />
        <MoneyInput id="m2-policy-sum" value={draft.sumAssured} onChange={(n) => edit({ sumAssured: n })} label={t("m2.policy.sumAssured.label")} hint={t("m2.policy.sumAssured.hint")} min={0} />
        <div className="grid grid-cols-2 gap-3">
          <YearsBox id="m2-policy-term" label={t("m2.policy.termYears.label")} value={draft.termYears} onChange={(n) => edit({ termYears: n })} max={POLICY_TERM_MAX} />
          <YearsBox id="m2-policy-paid" label={t("m2.policy.yearsPaid.label")} value={draft.yearsPaid} onChange={(n) => edit({ yearsPaid: n })} max={POLICY_TERM_MAX} />
        </div>
        <MoneyInput
          id="m2-policy-maturity"
          value={draft.expectedMaturity}
          onChange={(n) => edit({ expectedMaturity: n })}
          label={t("m2.policy.expectedMaturity.label")}
          hint={t("m2.policy.expectedMaturity.hint")}
          min={0}
        />
        <MoneyInput
          id="m2-policy-surrender"
          value={draft.surrenderValue ?? null}
          onChange={(n) => edit({ surrenderValue: n })}
          label={t("m2.policy.surrenderValue.label")}
          hint={t("m2.policy.surrenderValue.hint")}
          min={0}
        />

        {!complete && <p className="text-sm font-medium text-text-muted">{t("m2.policy.incomplete")}</p>}

        {/* A fully paid policy has nothing left to compare (no policyCheck). */}
        {complete && !check && notes.includes("m2.note.policyMatured") && (
          <p className="text-base leading-relaxed text-text" data-testid="m2-policy-matured">
            {t("m2.note.policyMatured")}
          </p>
        )}

        {complete && check && (
          <>
            <div className="grid grid-cols-2 gap-3" data-testid="m2-policy-compare">
              <Card className="flex flex-col gap-1 p-3">
                <span className="text-sm font-semibold text-text">{t("m2.policy.keep")}</span>
                <span className="text-xl font-bold tabular-nums text-brand-700">{f.money(check.policyMaturity)}</span>
                <span className="text-xs text-text-muted">{t("m2.policy.keepHint")}</span>
              </Card>
              <Card className="flex flex-col gap-1 p-3">
                <span className="text-sm font-semibold text-text">{t("m2.policy.alternative")}</span>
                <span className="text-xl font-bold tabular-nums text-brand-700">
                  {check.lowerBound ? t("m2.policy.atLeast", { amount: f.money(check.investDifferenceFV) }) : f.money(check.investDifferenceFV)}
                </span>
                <span className="text-xs text-text-muted">{t("m2.policy.alternativeHint", { instrument, years: years(check.remainingYears) })}</span>
                {check.surrenderValueFV > 0 && <span className="text-xs text-text-muted">{t("m2.policy.surrenderPart", { amount: f.money(check.surrenderValueFV) })}</span>}
              </Card>
            </div>
            <p className="text-base leading-relaxed text-text">{t(`m2.policy.verdict.${check.verdict}`, { amount: f.money(Math.abs(check.difference)) })}</p>
            {check.lowerBound && notes.includes("m2.note.policyNoSurrender") && (
              <p className="text-sm leading-relaxed text-text-muted" data-testid="m2-policy-lower-bound">
                {t("m2.note.policyNoSurrender")}
              </p>
            )}
            <FigureList
              items={[
                { key: "irr", label: t("m2.policy.irr"), value: f.percent(check.policyIrr), hint: t("m2.policy.irrHint") },
                { key: "term", label: t("m2.policy.termPremium"), value: f.money(check.termPremiumYearly) },
                { key: "remaining", label: t("m2.policy.remaining"), value: years(check.remainingYears) },
              ]}
            />
            <WhyButton explanation={explanation} stepIds={POLICY_STEPS} title={t("m2.policy.why")} />
          </>
        )}

        <p className="rounded-xl border border-status-amber/30 bg-status-amber-soft px-3 py-2 text-sm leading-relaxed text-text" data-testid="m2-policy-note">
          {t("m2.note.policyNotAdvice")}
        </p>

        {!readOnly && (complete || stored) && (
          <Button variant="secondary" onClick={clear}>
            {t("m2.policy.clear")}
          </Button>
        )}
      </div>
    </details>
  );
}
