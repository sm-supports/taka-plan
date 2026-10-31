"use client";
/**
 * The M6 result (PRD "Result screen"): gate warnings, profile and score with "Why this split?",
 * the three-part bar, an instrument card per bucket, the three-case projection, the rebalancer,
 * net worth with property outside the split, and the engine's notes.
 */
import Link from "next/link";
import type { BucketAmounts, M6Result } from "@taka/engine";
import { WhyButton } from "@/components/explain/WhyButton";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { FigureList, Section } from "../shared/Figures";
import { InstrumentCards } from "./InstrumentCards";
import { MixBar } from "./MixBar";
import { Projection } from "./Projection";
import { Rebalancer } from "./Rebalancer";

const SPLIT_STEPS = ["m6.score", "m6.equity", "m6.gold", "m6.fixedIncome"] as const;
/** Notes shown next to the figure they belong to rather than in the list. */
const PLACED_NOTES = new Set(["m6.note.lowLosesValue", "m6.note.exitCosts"]);
const MAX_SCORE = 8;

export interface M6ResultViewProps {
  result: M6Result;
  holdings: BucketAmounts | undefined;
  newMoney: number | undefined;
  lumpSum: number;
  propertyValue: number;
  driftBand: number;
  onHoldings: (next: BucketAmounts | null) => void;
  onNewMoney: (n: number | undefined) => void;
  readOnly?: boolean;
}

export function GateWarnings({ keys }: { keys: readonly string[] }) {
  const { t, locale } = useT();
  if (keys.length === 0) return null;
  return (
    <div className="flex flex-col gap-2" data-testid="gate-warnings">
      {keys.map((k) => (
        <div key={k} role="note" className="rounded-xl border border-status-amber/30 bg-status-amber-soft px-3 py-2.5 text-sm text-status-amber">
          <p>{t(k)}</p>
          <Link href={k === "m6.gate.cardDebt" ? `/${locale}/m3` : `/${locale}/m1`} className="mt-1 inline-flex min-h-10 items-center font-semibold underline">
            {t(k === "m6.gate.cardDebt" ? "m6.flow.gate.openDebt" : "m6.flow.gate.openEmergency")}
          </Link>
        </div>
      ))}
    </div>
  );
}

export function M6ResultView({ result, holdings, newMoney, lumpSum, propertyValue, driftBand, onHoldings, onNewMoney, readOnly }: M6ResultViewProps) {
  const { t } = useT();
  const f = useFormat();
  const profileName = t(`m6.profile.${result.profile}`);
  const notes = result.notes.filter((n) => !PLACED_NOTES.has(n) && !(result.rebalance && n === "m6.note.neverBreakCertificates"));
  const held = holdings ? holdings.equity + holdings.gold + holdings.fixedIncome : 0;
  const inMix = held > 0 ? held + (newMoney ?? 0) : lumpSum;

  return (
    <>
      <Section title={t("m6.section.result")} id="m6-result">
        <GateWarnings keys={result.gateWarnings} />

        <Card data-testid="m6-profile">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-2xl font-bold text-text">{t("m6.result.profileLine", { profile: profileName })}</p>
              <p className="mt-0.5 text-sm text-text-muted">{t("m6.result.score", { score: f.number(result.score), max: f.number(MAX_SCORE) })}</p>
              {result.profile !== result.suggestedProfile && <p className="mt-0.5 text-sm text-text-muted">{t("m6.result.suggestedLine", { profile: t(`m6.profile.${result.suggestedProfile}`) })}</p>}
            </div>
            <StatusPill status={result.status} className="shrink-0" />
          </div>
          {result.horizonRule !== "none" && <p className="mt-3 rounded-xl bg-surface-muted px-3 py-2 text-sm text-text">{t(`m6.result.horizon.${result.horizonRule}`)}</p>}
          <div className="mt-4">
            <MixBar weights={result.weights} lump={result.amounts.lump} monthly={result.amounts.monthly} />
          </div>
          <div className="mt-2 flex justify-end">
            <WhyButton explanation={result.explain} stepIds={SPLIT_STEPS} title={t("m6.result.whySplit")} />
          </div>
        </Card>
      </Section>

      <Section title={t("m6.section.instruments")}>
        <InstrumentCards result={result} />
      </Section>

      <Section title={t("m6.section.projection")}>
        <Projection result={result} />
      </Section>

      <Rebalancer result={result} holdings={holdings} newMoney={newMoney} driftBand={driftBand} onHoldings={onHoldings} onNewMoney={onNewMoney} readOnly={readOnly} />

      {propertyValue > 0 && (
        <Section title={t("m6.section.netWorth")}>
          <Card data-testid="net-worth">
            <FigureList
              items={[
                { key: "mix", label: t("m6.netWorth.inMix"), value: f.money(inMix) },
                { key: "property", label: t("m6.netWorth.property"), value: f.money(propertyValue) },
                { key: "total", label: t("m6.netWorth.total"), value: f.money(inMix + propertyValue) },
              ]}
            />
          </Card>
        </Section>
      )}

      {notes.length > 0 && (
        <Card header={<span className="text-base font-semibold text-text">{t("m6.section.notes")}</span>} data-testid="m6-notes">
          <ul className="flex flex-col gap-2 text-sm leading-relaxed text-text-muted">
            {notes.map((k) => (
              <li key={k} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-xs leading-relaxed text-text-faint">{t("m6.disclaimer")}</p>
    </>
  );
}
