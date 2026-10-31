"use client";
/**
 * Top bar: app name linking to the locale home, rates version + offline badges, then the country
 * (its code, linking to the picker on "/?change=country") and the language menu at the end.
 */
import Link from "next/link";
import { useT } from "@/lib/i18n/useT";
import { useHydrated, useTakaStore } from "@/lib/store/store";
import { LocaleSwitch } from "./LocaleSwitch";
import { OfflineBadge } from "./OfflineBadge";
import { RatesVersionBadge } from "./RatesVersionBadge";

export function Header() {
  const { t, locale } = useT();
  const country = useTakaStore((s) => s.country);
  // The persisted country is only known after rehydration; /about renders before it (no mismatch).
  const hydrated = useHydrated();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between gap-2 px-4">
        <Link href={`/${locale}`} className="tap inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl text-lg font-bold text-brand-700">
          <svg className="h-7 w-7 shrink-0" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="24" height="24" rx="7" fill="currentColor" />
            <path d="M9 10h10M14 10v9M11 19h6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          {t("common.appName")}
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          <OfflineBadge className="shrink-0" />
          <RatesVersionBadge className="min-w-0 justify-end text-end" />
          {hydrated ? (
            <Link
              href="/?change=country"
              aria-label={t("common.countryLink", { country })}
              title={t("common.changeCountry")}
              className="tap inline-flex shrink-0 items-center justify-center rounded-xl border border-line bg-surface px-2 text-sm font-semibold tabular-nums text-text hover:bg-surface-muted"
              dir="ltr"
            >
              {country}
            </Link>
          ) : (
            <span className="tap inline-block shrink-0" aria-hidden="true" />
          )}
          <LocaleSwitch />
        </div>
      </div>
    </header>
  );
}
