"use client";
/** "Rates v3, Oct 2026" from the active snapshot, with a grey "may be outdated" tag when any row is past review. */
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
    <span className={cn("inline-flex flex-wrap items-center gap-1.5 text-xs text-text-muted", className)}>
      <span>{t("common.ratesVersion", { version: number(version), asOf: asOf(snapshot.publishedAt) })}</span>
      {staleKeys.length > 0 && <StaleTag kind="stale" />}
    </span>
  );
}
