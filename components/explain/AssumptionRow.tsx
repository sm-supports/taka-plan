"use client";
/**
 * One rates-table row inside "Why this number?": label, value, as-of date, source link and stale /
 * assumption tags. A source in our own docs/ reads "Taka Plan (our assumption)"; the row's internal
 * research note is never shown. In Bangla, source names get Bangla institution names and digits.
 */
import type { Assumption } from "@taka/engine";
import { StaleTag } from "@/components/ui/StaleTag";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { assumptionLabel, formatAssumptionValue, isExternalUrl } from "./formatInputs";
import { isOwnDocSource, sourceLabel } from "./localizeName";

export interface AssumptionRowProps {
  assumption: Assumption;
}

export function AssumptionRow({ assumption: a }: AssumptionRowProps) {
  const { t, locale } = useT();
  const f = useFormat();
  const label = assumptionLabel(a, locale);
  const value = formatAssumptionValue(a.value, a.unit, f, t);
  const asOf = t("common.asOf", { date: f.asOf(a.asOf) });
  const source = sourceLabel(a.sourceName, a.sourceUrl, locale, t("common.ourSource"));
  // Our own docs are an assumption, which the "Our assumption" tag already says once.
  const ownDoc = isOwnDocSource(a.sourceUrl);
  return (
    <li className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <span dir="auto" className="text-sm text-text">
          {label}
        </span>
        <bdi className="shrink-0 text-base font-semibold tabular-nums text-text">{value}</bdi>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
        <span>{asOf}</span>
        <span aria-hidden="true">·</span>
        {!ownDoc && isExternalUrl(a.sourceUrl) ? (
          <a
            href={a.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center underline decoration-dotted underline-offset-2 hover:text-brand-700"
          >
            {t("common.source")}: <bdi className="ms-1">{source}</bdi>
          </a>
        ) : (
          <span>
            {t("common.source")}: <bdi>{source}</bdi>
          </span>
        )}
        {a.stale && <StaleTag kind="stale" />}
        {a.isAppAssumption && !ownDoc && <StaleTag kind="assumption" />}
      </div>
    </li>
  );
}
