"use client";
/**
 * The three-part split as one horizontal bar (flex divs, no chart library): fixed income / equity /
 * gold, each segment as wide as its weight with its percentage, then a legend row per bucket with
 * the lump-sum and monthly amounts. A zero-weight bucket has no segment but keeps its legend row.
 */
import type { AllocationBucket, BucketAmounts, M6Result } from "@taka/engine";
import { cn } from "@/components/ui/cn";
import { iso } from "@/components/ui/bidi";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { weightDecimals } from "./input";

/** Display order (PRD: fixed income / equity / gold). */
export const BAR_ORDER: readonly AllocationBucket[] = ["fixedIncome", "equity", "gold"];

export const BUCKET_COLOR: Record<AllocationBucket, { bar: string; dot: string; text: string }> = {
  fixedIncome: { bar: "bg-brand-700", dot: "bg-brand-700", text: "text-white" },
  equity: { bar: "bg-brand-500", dot: "bg-brand-500", text: "text-white" },
  gold: { bar: "bg-status-amber", dot: "bg-status-amber", text: "text-white" },
};

export interface MixBarProps {
  weights: M6Result["weights"];
  lump: BucketAmounts;
  monthly: BucketAmounts;
}

export function MixBar({ weights, lump, monthly }: MixBarProps) {
  const { t } = useT();
  const f = useFormat();
  const pct = (b: AllocationBucket) => iso(f.percent(weights[b], weightDecimals(weights[b])));
  const parts = BAR_ORDER.map((b) => `${t(`m6.bucket.${b}`)} ${pct(b)}`).join(", ");
  const showLump = lump.equity + lump.gold + lump.fixedIncome > 0;
  const showMonthly = monthly.equity + monthly.gold + monthly.fixedIncome > 0;

  return (
    <div className="flex flex-col gap-4">
      <div role="img" aria-label={t("m6.result.barLabel", { parts })} data-testid="mix-bar" className="flex h-14 w-full overflow-hidden rounded-xl border border-line">
        {BAR_ORDER.filter((b) => weights[b] > 0).map((b) => (
          <div
            key={b}
            data-testid="mix-segment"
            data-bucket={b}
            className={cn(
              "flex min-w-0 items-center justify-center overflow-hidden font-bold tabular-nums",
              weights[b] < 0.15 ? "text-[11px]" : "text-sm",
              BUCKET_COLOR[b].bar,
              BUCKET_COLOR[b].text,
            )}
            style={{ width: `${weights[b] * 100}%` }}
          >
            <bdi className={cn("whitespace-nowrap", weights[b] < 0.15 ? "px-0" : "px-1")}>{pct(b)}</bdi>
          </div>
        ))}
      </div>
      <ul className="flex flex-col divide-y divide-line">
        {BAR_ORDER.map((b) => (
          <li key={b} data-testid="mix-legend-row" data-bucket={b} className="flex items-start justify-between gap-3 py-2.5">
            <span className="flex shrink-0 items-center gap-2">
              <span className={cn("h-3 w-3 shrink-0 rounded-full", BUCKET_COLOR[b].dot)} aria-hidden="true" />
              <span className="text-base font-semibold text-text">{t(`m6.bucket.${b}`)}</span>
              <bdi className="text-base font-bold tabular-nums text-brand-700">{pct(b)}</bdi>
            </span>
            <span className="flex min-w-0 flex-col items-end text-end text-sm tabular-nums">
              {showLump && (
                <bdi className="font-semibold text-text">
                  <bdi>{f.money(lump[b])}</bdi> <span className="font-normal text-text-muted">{t("m6.result.lump")}</span>
                </bdi>
              )}
              {showMonthly && (
                <bdi className="font-semibold text-text">
                  <bdi>{f.money(monthly[b])}</bdi>
                  <span className="ms-1 font-normal text-text-muted">{t("common.unit.perMonth")}</span>
                </bdi>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
