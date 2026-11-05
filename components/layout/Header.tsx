"use client";
/**
 * Top bar: app name linking to the locale home, the offline badge, then the country and the language
 * menu at the end. The country shows as its two-letter code, linking to the picker on
 * "/?change=country": a full name doesn't fit next to the rest on a phone. Its label says the full name.
 */
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { COUNTRY_COOKIE, LOCALE_COOKIE, LOCALE_META } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/useT";
import { useHydrated, useTakaStore } from "@/lib/store/store";
import { LocaleSwitch } from "./LocaleSwitch";
import { OfflineBadge } from "./OfflineBadge";

const ONE_YEAR = 60 * 60 * 24 * 365;

// Inline (not lib/country/index-data) so the bundled country list stays off every page's first load.
function hasCookie(name: string): boolean {
  return document.cookie.split(/;\s*/).some((c) => c.startsWith(`${name}=`));
}
function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`;
}

/** The country's short name in the UI language ("US" → "US", "BD" → "Bangladesh", "বাংলাদেশ", "بنغلاديش"); the code when Intl has none. */
export function shortCountryName(code: string, tag: string): string {
  try {
    return new Intl.DisplayNames([tag], { type: "region", style: "short" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function Header() {
  const { t, locale } = useT();
  const country = useTakaStore((s) => s.country);
  // The persisted country is only known after rehydration; /about renders before it (no mismatch).
  const hydrated = useHydrated();
  const completed = useTakaStore((s) => s.onboarding.completed);
  const countryLabel = useMemo(() => shortCountryName(country, LOCALE_META[locale]?.tag ?? locale), [country, locale]);
  // Rewrite both cookies on every visit (a year from today), so a returning user keeps going straight
  // to their locale from "/". Only once the user has chosen (cookie present or onboarding finished).
  useEffect(() => {
    if (!hydrated || !(completed || hasCookie(LOCALE_COOKIE))) return;
    setCookie(LOCALE_COOKIE, locale);
    // The store's country is the user's own only once onboarding is done (before that it may be the default).
    if (completed && /^[A-Z]{2}$/.test(country)) setCookie(COUNTRY_COOKIE, country);
  }, [hydrated, completed, locale, country]);
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
          {hydrated ? (
            <Link
              href="/?change=country"
              aria-label={t("common.countryLink", { country: countryLabel })}
              title={t("common.changeCountry")}
              className="tap inline-flex shrink-0 items-center justify-center rounded-xl border border-line bg-surface px-2 text-sm font-semibold text-text hover:bg-surface-muted"
              data-country={country}
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
