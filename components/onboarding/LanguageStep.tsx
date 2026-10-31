"use client";
/**
 * Step 2 on "/": the chosen country's languages that the app is translated into and English, in
 * orderedLocales order (English first where it is the main language or the main one is untranslated),
 * as very large buttons labelled in their own language. When the country's main language is not
 * translated yet, a short note says English is used. "Change country" goes back to step 1.
 */
import { LOCALE_META, type Locale } from "@/lib/i18n/config";
import { onboardingEntry as BN } from "@/lib/i18n/dictionaries/bn/onboarding";
import { onboardingEntry as EN } from "@/lib/i18n/dictionaries/en/onboarding";
import { interpolate } from "@/lib/i18n/translate";
import { orderedLocales, type CountryIndexEntry } from "@/lib/country/index-data";
import { Logo } from "./CountryPicker";

export interface LanguageStepProps {
  country: CountryIndexEntry;
  /** Show the Bangla copy above the English. */
  bilingual: boolean;
  busy: Locale | null;
  onPick: (locale: Locale) => void;
  onChangeCountry: () => void;
}

/** True when the country's most used language has no translation (English is offered instead). */
export function mainLanguageMissing(country: CountryIndexEntry): boolean {
  const main = country.languages[0];
  return !!main && main !== "en" && !(country.locales as readonly string[]).includes(main);
}

export function LanguageStep({ country, bilingual, busy, onPick, onChangeCountry }: LanguageStepProps) {
  const countryName = country.nameNative === country.nameEn ? country.nameEn : `${country.nameNative} (${country.nameEn})`;
  const missing = mainLanguageMissing(country);
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="text-center">
        <Logo />
        <p className="mt-3 text-sm font-medium text-text-muted" dir="auto">
          <span lang="en">{interpolate(EN.language.country, { country: countryName })}</span>
        </p>
        <h1 className="mt-3 text-2xl font-bold text-text">
          {bilingual ? (
            <>
              <span lang="bn" className="block">
                {BN.language.title}
              </span>
              <span lang="en" className="mt-1 block text-lg font-medium text-text-muted">
                {EN.language.title}
              </span>
            </>
          ) : (
            <span lang="en">{EN.language.title}</span>
          )}
        </h1>
        <p className="mt-2 text-sm text-text-faint">
          {bilingual && <span lang="bn">{BN.language.subtitle} </span>}
          <span lang="en">{EN.language.subtitle}</span>
        </p>
      </div>

      {missing && (
        <p role="note" className="mt-6 rounded-xl bg-status-amber-soft px-4 py-3 text-sm text-text">
          {bilingual && (
            <span lang="bn" className="block">
              {BN.language.notAvailable}
            </span>
          )}
          <span lang="en" className="block">
            {EN.language.notAvailable}
          </span>
        </p>
      )}

      <div className="mt-8 flex flex-col gap-4" role="group" aria-label={EN.language.title}>
        {orderedLocales(country).map((l, i) => {
          const meta = LOCALE_META[l];
          return (
            <button
              key={l}
              type="button"
              lang={meta.tag}
              dir={meta.dir}
              data-locale={l}
              onClick={() => onPick(l)}
              disabled={busy !== null}
              aria-busy={busy === l || undefined}
              className={
                i === 0
                  ? "tap min-h-20 w-full rounded-2xl bg-brand-600 text-2xl font-bold text-white shadow-md transition-colors hover:bg-brand-700 active:bg-brand-900 disabled:opacity-70"
                  : "tap min-h-20 w-full rounded-2xl border-2 border-brand-600 bg-surface text-2xl font-bold text-brand-700 shadow-sm transition-colors hover:bg-brand-50 active:bg-brand-100 disabled:opacity-70"
              }
            >
              {meta.nativeName}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onChangeCountry}
        disabled={busy !== null}
        className="tap mx-auto mt-8 inline-flex items-center justify-center rounded-xl px-4 text-base font-semibold text-brand-700 underline decoration-dotted underline-offset-4 hover:bg-brand-50"
      >
        {bilingual ? (
          <>
            <span lang="bn">{BN.language.changeCountry}</span>
            <span aria-hidden="true">&nbsp;/&nbsp;</span>
            <span lang="en">{EN.language.changeCountry}</span>
          </>
        ) : (
          <span lang="en">{EN.language.changeCountry}</span>
        )}
      </button>
    </main>
  );
}
