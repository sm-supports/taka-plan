"use client";
/** Per-goal result: future value, horizon, instrument + candidates, monthly low/base/high, real return, status, why. */
import type { GoalResult, Status } from "@taka/engine";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { Term } from "@/components/ui/Term";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { WhyButton } from "@/components/calculators/m3/WhyButton";

export interface GoalResultCardProps {
  name: string;
  result: GoalResult;
  /** Display status after the one-red rule. */
  shown: { status: Status; demotedFromRed: boolean };
}

const TERM_FOR_INSTRUMENT: Partial<Record<GoalResult["instrument"], string>> = {
  fdr_3m: "fdr",
  fdr_1y: "fdr",
  dps: "dps",
  sanchayapatra_5y: "sanchayapatra",
  tbill_91d: "tbill",
  tbond_5y: "tbond",
  tbond_10y: "tbond",
};

export function GoalResultCard({ name, result, shown }: GoalResultCardProps) {
  const { t } = useT();
  const f = useFormat();
  const years = Math.round(result.months / 12);
  const yearsLabel = `${f.number(years)} ${t(years === 1 ? "common.unit.year" : "common.unit.years")}`;
  const instrumentName = t(`common.instrument.${result.instrument}`);
  const term = TERM_FOR_INSTRUMENT[result.instrument];
  const others = result.candidates.filter((c) => c !== result.instrument);
  /* The red "below inflation" line is the one red element; the pill is red only when this goal is the shown red. */
  const showRedLine = result.belowInflation && shown.status === "red";

  return (
    <Card
      header={
        <>
          <h3 className="text-lg font-bold text-text">{name}</h3>
          <StatusPill status={shown.status} demotedFromRed={shown.demotedFromRed}>
            {t(`m5.status.${result.status}`)}
          </StatusPill>
        </>
      }
    >
      {!result.valid ? (
        <p className="text-sm text-status-amber">{t("m5.result.invalid")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl bg-brand-50 p-3 text-center">
            <p className="text-sm font-medium text-text-muted">{t("m5.result.monthly")}</p>
            <p className="mt-0.5 text-3xl font-bold tabular-nums text-brand-700">
              {f.taka(result.monthly.base)}
              <span className="ml-1 text-base font-medium text-text-muted">{t("common.unit.perMonth")}</span>
            </p>
            <p className="mt-1 text-sm text-text-muted">{t("m5.result.months", { months: f.months(result.months) })}</p>
          </div>

          <dl className="flex flex-col divide-y divide-line">
            <Row label={t("m5.result.futureValue")} value={t("m5.result.futureValueIn", { fv: f.taka(result.futureValue, { compact: true }), years: yearsLabel })} hint={`${t("m5.result.inflation")}: ${f.percent(result.inflation)}`} />
            <Row label={t("m5.result.horizon")} value={t(`common.horizon.${result.horizon}`)} />
            <Row
              label={t("m5.result.instrument")}
              value={term ? <Term k={term}>{instrumentName}</Term> : instrumentName}
              hint={others.length > 0 ? `${t("m5.result.candidates")}: ${others.map((c) => t(`common.instrument.${c}`)).join(", ")}` : undefined}
            />
            <Row label={t("m5.result.monthlyLow")} value={f.taka(result.monthly.low)} />
            <Row label={t("m5.result.monthlyBase")} value={f.taka(result.monthly.base)} />
            <Row label={t("m5.result.monthlyHigh")} value={f.taka(result.monthly.high)} />
            <Row label={t("m5.result.nominal")} value={f.percent(result.nominal)} />
            <Row label={t("m5.result.afterTax")} value={f.percent(result.afterTax)} />
            <Row label={<Term k="real_return">{t("m5.result.real")}</Term>} value={f.percent(result.real)} strong={!result.belowInflation} />
          </dl>

          {result.belowInflation ? (
            <p role={showRedLine ? "alert" : undefined} className={showRedLine ? "rounded-xl border border-status-red/30 bg-status-red-soft p-3 text-sm font-semibold text-status-red" : "rounded-xl border border-status-amber/30 bg-status-amber-soft p-3 text-sm font-semibold text-status-amber"}>
              {t("m5.result.belowInflation")}
            </p>
          ) : (
            <p className="text-sm text-status-green">{t("m5.result.realAbove")}</p>
          )}

          <WhyButton explanation={result.explain} />
        </div>
      )}
    </Card>
  );
}

function Row({ label, value, hint, strong }: { label: React.ReactNode; value: React.ReactNode; hint?: string; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <dt className="text-base text-text">{label}</dt>
        <dd className={`shrink-0 text-right text-base tabular-nums ${strong ? "font-bold text-brand-700" : "font-semibold text-text"}`}>{value}</dd>
      </div>
      {hint && <p className="text-sm text-text-muted">{hint}</p>}
    </div>
  );
}
