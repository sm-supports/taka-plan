"use client";
/**
 * Debt-health result view. One red at most: the primary flag is the only red element; other
 * flags (incl. those the engine demoted) show amber with the "also needs attention" caption.
 */
import { getRate, type DebtFlag, type M3Input, type M3Result, type RatesSnapshot } from "@taka/engine";
import { BigNumber } from "@/components/ui/BigNumber";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { Term } from "@/components/ui/Term";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import type { TranslateParams } from "@/lib/i18n/types";
import { WhyButton } from "@/components/explain/WhyButton";

export interface M3ResultsProps {
  input: M3Input;
  result: M3Result;
  snapshot: RatesSnapshot;
}

export function M3Results({ input, result, snapshot }: M3ResultsProps) {
  const { t } = useT();
  const f = useFormat();
  const emiRatioRed = getRate(snapshot, "emi_ratio_red");
  const utilAmber = getRate(snapshot, "card_utilisation_amber");
  const cardCap = getRate(snapshot, "credit_card_rate_cap");
  const highThreshold = getRate(snapshot, "high_interest_debt_threshold");
  const hasDebt = input.loans.length > 0 || input.cards.length > 0;

  const flagParams = (flag: DebtFlag): TranslateParams => {
    switch (flag.id) {
      case "card_carried": {
        const card = input.cards.find((c) => c.id === flag.ref);
        return { rate: f.percent(card?.annualRate ?? cardCap) };
      }
      case "card_utilisation":
        return { threshold: f.percent(utilAmber, 0), value: f.percent(flag.value, 0) };
      case "emi_ratio":
        return { threshold: f.percent(emiRatioRed, 0), value: f.percent(flag.value) };
      case "negative_capacity":
        return {};
    }
  };

  const debtLabel = (id: string): string => {
    const loan = input.loans.find((l) => l.id === id);
    if (loan) return `${t(`common.loanType.${loan.type}`)} · ${f.taka(loan.outstanding)} · ${f.percent(loan.annualRate)}`;
    const card = input.cards.find((c) => c.id === id);
    if (card) return `${t("m3.result.cardLabel")} · ${f.taka(card.balance)} · ${f.percent(card.annualRate ?? cardCap)}`;
    return id;
  };

  const otherFlags = result.flags.filter((fl) => fl !== result.primaryFlag);
  const allSteps = result.explain;

  return (
    <div className="flex flex-col gap-4" aria-live="polite">
      {/* Status + the one red flag */}
      <Card
        header={
          <>
            <h2 className="text-lg font-bold text-text">{t("m3.result.flags")}</h2>
            <StatusPill status={result.status}>{t(`m3.status.${result.status}`)}</StatusPill>
          </>
        }
      >
        {result.primaryFlag ? (
          <div className="rounded-xl border border-status-red/30 bg-status-red-soft p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-status-red">{t("m3.result.primaryFlag")}</p>
            <p className="mt-1 font-semibold text-text">{t(`m3.flag.${result.primaryFlag.id}.title`, flagParams(result.primaryFlag))}</p>
            <p className="mt-1 text-sm leading-relaxed text-text">{t(`m3.flag.${result.primaryFlag.id}.body`, flagParams(result.primaryFlag))}</p>
          </div>
        ) : (
          <p className="text-base text-text">{hasDebt ? t("m3.result.noFlags") : t("m3.result.noDebt")}</p>
        )}
        {otherFlags.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{t("m3.result.otherFlags")}</p>
            <ul className="mt-2 flex flex-col gap-2">
              {otherFlags.map((fl, i) => (
                <li key={`${fl.id}-${fl.ref ?? i}`} className="rounded-xl border border-status-amber/30 bg-status-amber-soft p-3">
                  <StatusPill status="amber" demotedFromRed={fl.demotedFromRed} />
                  <p className="mt-2 font-semibold text-text">{t(`m3.flag.${fl.id}.title`, flagParams(fl))}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text">{t(`m3.flag.${fl.id}.body`, flagParams(fl))}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* EMI numbers */}
      <Card header={<h2 className="text-lg font-bold text-text">{t("m3.result.numbers")}</h2>}>
        <dl className="flex flex-col divide-y divide-line">
          <Row label={<Term k="emi">{t("m3.result.totalEmi")}</Term>} value={f.taka(result.totalEmi)} />
          <Row label={t("m3.result.emiRatio")} value={f.percent(result.emiRatio)} hint={t("m3.result.emiRatioNote", { threshold: f.percent(emiRatioRed, 0) })} />
          <Row label={t("m3.result.emiCapacity")} value={f.taka(result.emiCapacity)} hint={t("m3.result.emiCapacityHint")} />
          <Row label={t("m3.result.headroom")} value={f.taka(result.headroom)} hint={t("m3.result.headroomHint")} />
        </dl>
        <WhyButton explanation={allSteps} stepIds={["m3.totalEmi", "m3.emiRatio", "m3.capacity"]} className="mt-2" />
      </Card>

      {/* Borrowing scenario */}
      <Card header={<h2 className="text-lg font-bold text-text">{t("m3.result.borrow")}</h2>}>
        <BigNumber
          label={t("m3.result.maxAffordableLoan")}
          value={f.taka(result.maxAffordableLoan, { compact: true })}
          caption={t("m3.result.scenario", { rate: f.percent(result.scenario.annualRate), months: f.months(result.scenario.months) })}
        />
        <dl className="mt-3 flex flex-col divide-y divide-line">
          <Row label={t("m3.result.scenarioEmi")} value={f.taka(result.scenario.emi)} />
        </dl>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          {t("m3.result.maxLoanNote", {
            rate: f.percent(result.scenario.annualRate),
            months: f.months(result.scenario.months),
            emi: f.taka(result.scenario.emi),
            loan: f.taka(result.maxAffordableLoan, { compact: true }),
          })}
        </p>
        <WhyButton explanation={allSteps} stepIds={["m3.capacity", "m3.maxLoan", "m3.scenarioEmi"]} className="mt-2" />
      </Card>

      {/* Payoff order */}
      {hasDebt && (
        <Card header={<h2 className="text-lg font-bold text-text">{t("m3.result.payoffOrder")}</h2>}>
          <p className="text-sm text-text-muted">{t("m3.result.payoffOrderHint")}</p>
          {input.extraMonthly !== undefined && <p className="mt-1 text-sm text-text-muted">{t("m3.result.extraUsed", { amount: f.taka(input.extraMonthly) })}</p>}
          <h3 className="mt-3 font-semibold text-text">{t("m3.result.avalanche")}</h3>
          <ol className="mt-1 list-decimal pl-5 text-base text-text">
            {result.avalanche.order.map((id) => (
              <li key={id}>{debtLabel(id)}</li>
            ))}
          </ol>
          <dl className="mt-3 flex flex-col divide-y divide-line">
            <Row label={t("m3.result.payoffMonths", { months: f.months(result.avalanche.months) })} value={`${t("m3.result.totalInterest")}: ${f.taka(result.avalanche.totalInterest)}`} />
            <Row label={t("m3.result.compare")} value={`${t("m3.result.snowball")}: ${f.taka(result.snowball.totalInterest)}`} />
            <Row label={t("m3.result.interestSaved")} value={f.taka(result.interestSaved)} strong />
          </dl>
          {result.highInterestDebts.length > 0 && (
            <div className="mt-3">
              <h3 className="font-semibold text-text">{t("m3.result.highInterestDebts", { threshold: f.percent(highThreshold, 0) })}</h3>
              <ul className="mt-1 flex flex-col gap-1 text-sm text-text">
                {result.highInterestDebts.map((d) => (
                  <li key={d.id}>
                    {debtLabel(d.id)} · {t("m3.result.minPayment")} {f.taka(d.minPayment)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <WhyButton explanation={allSteps} stepIds={["m3.interestSaved"]} className="mt-2" />
        </Card>
      )}

      {/* Debt-trap path */}
      <Card header={<h2 className="text-lg font-bold text-text">{t("m3.result.path")}</h2>}>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-base leading-relaxed text-text">
          {result.debtTrapPath.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Row({ label, value, hint, strong }: { label: React.ReactNode; value: string; hint?: string; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <dt className="text-base text-text">{label}</dt>
        <dd className={`shrink-0 text-base tabular-nums ${strong ? "font-bold text-brand-700" : "font-semibold text-text"}`}>{value}</dd>
      </div>
      {hint && <p className="text-sm text-text-muted">{hint}</p>}
    </div>
  );
}
