"use client";
/**
 * F4 rebalancer behind "I already invest": current value per bucket plus any new money → buy / sell
 * per bucket, the drift from target, and whether new money alone closes the gap. Sales come with
 * the exit-costs note, and the savings-certificate note says never to cash one early to rebalance.
 */
import { useState } from "react";
import type { AllocationBucket, BucketAmounts, M6Result } from "@taka/engine";
import { WhyButton } from "@/components/explain/WhyButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { cn } from "@/components/ui/cn";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { BAR_ORDER, BUCKET_COLOR } from "./MixBar";
import { weightDecimals } from "./input";

const ZERO: BucketAmounts = { equity: 0, gold: 0, fixedIncome: 0 };
const CERTIFICATE_NOTE = "m6.note.neverBreakCertificates";
const EXIT_NOTE = "m6.note.exitCosts";

export interface RebalancerProps {
  result: M6Result;
  holdings: BucketAmounts | undefined;
  newMoney: number | undefined;
  driftBand: number;
  /** null clears what the user holds. */
  onHoldings: (next: BucketAmounts | null) => void;
  onNewMoney: (n: number | undefined) => void;
  readOnly?: boolean;
}

export function Rebalancer({ result, holdings, newMoney, driftBand, onHoldings, onNewMoney, readOnly }: RebalancerProps) {
  const { t } = useT();
  const f = useFormat();
  const [open, setOpen] = useState(holdings !== undefined);
  const r = result.rebalance;

  const setBucket = (b: AllocationBucket, n: number | null) => {
    if (readOnly) return;
    onHoldings({ ...(holdings ?? ZERO), [b]: n ?? 0 });
  };

  if (!open) {
    return (
      <Button variant="secondary" fullWidth size="lg" onClick={() => setOpen(true)} aria-expanded={false} data-testid="rebalance-open">
        {t("m6.rebalance.open")}
      </Button>
    );
  }

  const held = holdings ? holdings.equity + holdings.gold + holdings.fixedIncome : 0;
  /** A share difference in percentage points with its sign: "+5.0 points", "−2.5 points". */
  const points = (share: number, decimals = 1) => {
    const n = Math.round(share * 100 * 10 ** decimals) / 10 ** decimals;
    const sign = n > 0 ? "+" : n < 0 ? "−" : "";
    return t("m6.rebalance.points", { value: `${sign}${f.number(Math.abs(n), decimals)}` });
  };
  const bandPoints = Math.round(driftBand * 1000) / 10;
  const band = t("m6.rebalance.points", { value: f.number(bandPoints, Number.isInteger(bandPoints) ? 0 : 1) });

  return (
    <Card
      data-testid="rebalancer"
      header={
        <>
          <h3 className="text-base font-bold text-text">{t("m6.section.rebalance")}</h3>
          <Button variant="ghost" onClick={() => setOpen(false)} aria-expanded={true}>
            {t("m6.rebalance.close")}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-muted">{t("m6.rebalance.intro")}</p>
      <div className="mt-4 flex flex-col gap-4">
        {BAR_ORDER.map((b) => (
          <MoneyInput
            key={b}
            id={`m6-holding-${b}`}
            value={holdings ? holdings[b] : null}
            onChange={(n) => setBucket(b, n)}
            label={t("m6.rebalance.holding", { bucket: t(`m6.bucket.${b}`) })}
            min={0}
          />
        ))}
        <MoneyInput
          id="m6-newMoney"
          value={newMoney ?? null}
          onChange={(n) => !readOnly && onNewMoney(n ?? undefined)}
          label={t("m6.rebalance.newMoney.label")}
          hint={t("m6.rebalance.newMoney.hint")}
          min={0}
        />
      </div>

      {r && (() => {
        const hasTrade = BAR_ORDER.some((b) => r.trades[b] !== 0);
        const hasSale = BAR_ORDER.some((b) => r.trades[b] < 0);
        return (
        <div className="mt-5 flex flex-col gap-3" data-testid="rebalance-result">
          <p className="text-sm font-semibold text-text">{t("m6.rebalance.total", { amount: f.money(r.total) })}</p>
          <ul className="flex flex-col divide-y divide-line">
            {BAR_ORDER.map((b) => {
              const trade = r.trades[b];
              const target = result.weights[b];
              const current = held > 0 && holdings ? holdings[b] / held : 0;
              const label = trade > 0 ? t("m6.rebalance.buy", { amount: f.money(trade) }) : trade < 0 ? t("m6.rebalance.sell", { amount: f.money(-trade) }) : t("m6.rebalance.none");
              return (
                <li key={b} data-testid="trade-row" data-bucket={b} className="flex items-start justify-between gap-3 py-2.5">
                  <span className="flex min-w-0 flex-col">
                    <span className="flex items-center gap-2 text-base font-semibold text-text">
                      <span className={cn("h-3 w-3 shrink-0 rounded-full", BUCKET_COLOR[b].dot)} aria-hidden="true" />
                      {t(`m6.bucket.${b}`)}
                    </span>
                    <span className="text-xs text-text-muted">
                      {t("m6.rebalance.target", { share: f.percent(target, weightDecimals(target)) })}
                      {held > 0 && <> · {t("m6.rebalance.drift", { current: f.percent(current), drift: points(r.drift[b]) })}</>}
                    </span>
                  </span>
                  <span data-testid="trade" className={cn("shrink-0 text-base font-bold tabular-nums", trade > 0 ? "text-status-green" : trade < 0 ? "text-status-red" : "text-text-muted")}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
          {r.triggered ? (
            <p className="text-sm text-text">{t("m6.rebalance.triggered", { band })}</p>
          ) : (
            // "Within the band" only when nothing is proposed; with a trade on screen it would contradict it.
            !hasTrade && <p className="text-sm text-text">{t("m6.rebalance.withinBand", { band })}</p>
          )}
          {r.newMoneyOnly ? (
            <p role="status" data-testid="new-money-only" className="rounded-xl bg-status-green-soft px-3 py-2 text-sm font-medium text-status-green">
              {t("m6.rebalance.newMoneyOnly")}
            </p>
          ) : (
            hasSale && (
              <p role="note" className="rounded-xl border border-status-amber/30 bg-status-amber-soft px-3 py-2 text-sm text-status-amber">
                {t("m6.rebalance.sellNote")} {result.notes.includes(EXIT_NOTE) ? t(EXIT_NOTE) : null}
              </p>
            )
          )}
          {result.notes.includes(CERTIFICATE_NOTE) && <p className="text-sm text-text-muted">{t(CERTIFICATE_NOTE)}</p>}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {!readOnly && holdings && (
              <Button variant="ghost" onClick={() => onHoldings(null)}>
                {t("m6.rebalance.clear")}
              </Button>
            )}
            <WhyButton explanation={result.explain} stepIds={["m6.trade"]} title={t("m6.rebalance.why")} className="ms-auto" />
          </div>
        </div>
        );
      })()}
    </Card>
  );
}
