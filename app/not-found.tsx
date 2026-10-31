"use client";
/**
 * 404 for unknown routes and unknown locale segments (exported as 404.html). Bilingual heading;
 * the main link goes to the tp_locale cookie's locale (read in the browser; bn until then), the
 * second one to "/" to pick a country and language again.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { LOCALE_COOKIE, LOCALE_META, defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

export default function NotFound() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  useEffect(() => {
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`));
    const saved = m?.[1];
    if (isLocale(saved)) setLocale(saved);
    // Outside [locale]: no right-to-left layout left over from a previous page.
    document.documentElement.dir = "ltr";
  }, []);
  const bn = locale === "bn";
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 py-10 text-center">
      <p className="text-6xl font-bold text-brand-700" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-xl font-semibold text-text" lang="bn">
        পাতাটি পাওয়া যায়নি
      </h1>
      <p className="text-lg text-text-muted" lang="en">
        Page not found
      </p>
      <div className="mt-8 flex w-full flex-col gap-3">
        <Link
          href={`/${locale}`}
          lang={bn ? "bn" : "en"}
          data-locale={locale}
          className="tap inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 text-base font-semibold text-white hover:bg-brand-700"
        >
          {bn ? "শুরুতে ফিরে যান" : "Back to start"}
          {!bn && locale !== "en" && <span className="ms-1 font-normal opacity-90">({LOCALE_META[locale].nativeName})</span>}
        </Link>
        <Link href="/?change=country" lang="en" className="tap inline-flex items-center justify-center rounded-xl border border-line bg-surface px-4 text-base font-semibold text-text hover:bg-surface-muted">
          Choose country and language
        </Link>
      </div>
    </main>
  );
}
