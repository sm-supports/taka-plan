"use client";
/**
 * F5 projection, always as three numbers (low / base / high), each nominal and in today's money,
 * low case first. Never a single number. The low-case warning shows when it loses buying power.
 */
import type { M6Result } from "@taka/engine";
import { WhyButton } from "@/components/explain/WhyButton";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";

const CASES = ["low", "base", "high"] as const;
const STEP_IDS = ["m6.mixLow", "m6.mixBase", "m6.mixHigh", "m6.fv", "m6.real"] as const;

export function Projection({ result }: { result: M6Result }) {
  const { t } = useT();
  const f = useFormat();
  const p = result.projection;
  const empty = p.paidIn <= 0;

  return (
    <Card data-testid="projection">
      <p className="text-sm text-text-muted">
        {empty ? t("m6.projection.introNone") : t("m6.projection.intro", { years: f.number(p.years), paidIn: f.money(p.paidIn) })}
      </p>
      {!empty && (
        <>
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {CASES.map((c) => (
              <li key={c} data-testid={`projection-${c}`} className={cn("flex min-w-0 flex-col rounded-xl border p-2.5", c === "base" ? "border-brand-200 bg-brand-50" : "border-line bg-surface")}>
                <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">{t(`m6.projection.${c}`)}</span>
                <span data-testid="projection-nominal" className="mt-1 break-words text-base font-bold tabular-nums text-text">
                  {f.money(p[c].nominal, { compact: true })}
                </span>
                <span className="mt-0.5 text-xs text-text-muted">{t("m6.projection.real", { amount: f.money(p[c].real, { compact: true }) })}</span>
                <span className="mt-1 text-xs tabular-nums text-text-faint">{t("m6.projection.rate", { rate: f.percent(p[c].rate) })}</span>
              </li>
            ))}
          </ul>
          {p.lowLosesValue && (
            <p role="note" className="mt-3 rounded-xl border border-status-amber/30 bg-status-amber-soft px-3 py-2 text-sm text-status-amber">
              {t("m6.projection.lowLosesValue")}
            </p>
          )}
        </>
      )}
      <div className="mt-2 flex justify-end">
        <WhyButton explanation={result.explain} stepIds={STEP_IDS} title={t("m6.projection.why")} />
      </div>
    </Card>
  );
}
