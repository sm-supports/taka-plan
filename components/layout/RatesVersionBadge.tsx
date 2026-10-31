"use client";
/**
 * "Rates v3, Oct 2026" from the active snapshot, with a grey "may be outdated" tag when any row is
 * past review. The label takes its direction from its own text, so on an Arabic or Urdu page showing
 * English copy the ellipsis cuts the end ("Rates v3, Oc…"), never the start.
 */
import { StaleTag } from "@/components/ui/StaleTag";
import { cn } from "@/components/ui/cn";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { useRates } from "@/lib/rates/useRates";

export function RatesVersionBadge({ className }: { className?: string }) {
  const { t } = useT();
  const { asOf, number } = useFormat();
  const { snapshot, version, staleKeys } = useRates();
  return (
    <span className={cn("inline-flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-text-muted", className)}>
      {/* dir="auto": the label truncates at its own end, also inside a right-to-left page. */}
      <span dir="auto" className="min-w-0 truncate" title={t("common.ratesVersion", { version: number(version), asOf: asOf(snapshot.publishedAt) })}>
        {t("common.ratesVersion", { version: number(version), asOf: asOf(snapshot.publishedAt) })}
      </span>
      {staleKeys.length > 0 && <StaleTag kind="stale" />}
    </span>
  );
}
