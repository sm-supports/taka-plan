"use client";
/**
 * Banner under the header about the chosen country's data:
 * - no researched profile for it (useCountry().source "fallback", or the profile in use is another
 *   country's once loading is over): amounts use Bangladesh's figures and taka; link to change country;
 * - a profile whose context lists fallbackKeys (regional or converted figures): a small line linking
 *   to About.
 * Nothing renders before the store has rehydrated, so the static HTML and first paint agree.
 */
import Link from "next/link";
import { countryNoticeKind } from "@/lib/country/resolve";
import { useCountry } from "@/lib/country/useCountry";
import { LOCALE_META } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/useT";
import { useHydrated } from "@/lib/store/store";

/** The country's name in the UI language ("IN" → "India", "ভারত"); the code when Intl has none. */
function nameOf(code: string, tag: string): string {
  try {
    return new Intl.DisplayNames([tag], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function CountryNotice() {
  const hydrated = useHydrated();
  const { t, locale } = useT();
  const { code, profile, source, loading, context } = useCountry();
  if (!hydrated) return null;
  const kind = countryNoticeKind({ code, profileCode: profile.code, source, loading, fallbackKeys: context.fallbackKeys ?? [] });
  if (kind === "none") return null;
  const country = nameOf(code, LOCALE_META[locale]?.tag ?? locale);

  if (kind === "missing") {
    return (
      <div className="mx-auto w-full max-w-md px-4 pt-3">
        <p role="status" data-testid="country-notice" className="rounded-xl bg-status-amber-soft px-4 py-3 text-sm leading-relaxed text-text">
          {t("common.countryNotice.noData", { country })}{" "}
          <Link href="/?change=country" className="font-semibold text-brand-700 underline underline-offset-2">
            {t("common.countryNotice.changeCountry")}
          </Link>
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-md px-4 pt-2">
      <p data-testid="country-fallback-note" className="text-xs leading-relaxed text-text-muted">
        {t("common.countryNotice.someFallback", { country })}{" "}
        <Link href={`/${locale}/about`} className="font-semibold text-brand-700 underline underline-offset-2">
          {t("common.countryNotice.about")}
        </Link>
      </p>
    </div>
  );
}
