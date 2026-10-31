"use client";
/**
 * Between the country and language steps on "/", only when the user already has answers and picks
 * a different country: the answers are amounts in the old currency, so continuing starts fresh and
 * keeps them as a draft. Nothing changes until the language is picked (app/page.tsx), so "Keep my
 * answers" (or the browser's Back) leaves the old country and answers untouched. Copy comes from the
 * en/bn `onboardingEntry` objects, English plus Bangla when `bilingual`.
 */
import { useEffect, useRef } from "react";
import { onboardingEntry as BN } from "@/lib/i18n/dictionaries/bn/onboarding";
import { onboardingEntry as EN } from "@/lib/i18n/dictionaries/en/onboarding";
import { interpolate } from "@/lib/i18n/translate";
import { Logo } from "./CountryPicker";

export interface SwitchCountryStepProps {
  /** The new country's name, in English and in Bangla. */
  countryEn: string;
  countryBn: string;
  /** The current answers' currency symbol ("৳"). */
  currency: string;
  /** When saving the draft will push the oldest unnamed draft out: the draft cap, already formatted per language. */
  cap: { en: string; bn: string } | null;
  bilingual: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SwitchCountryStep({ countryEn, countryBn, currency, cap, bilingual, onConfirm, onCancel }: SwitchCountryStepProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);
  const en = { country: countryEn, currency };
  const bn = { country: countryBn, currency };
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10" data-testid="switch-country">
      <div className="text-center">
        <Logo />
        <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-bold text-text focus:outline-none">
          {bilingual && (
            <span lang="bn" className="block">
              {interpolate(BN.switchCountry.title, bn)}
            </span>
          )}
          <span lang="en" className={bilingual ? "mt-1 block text-lg font-medium text-text-muted" : "block"}>
            {interpolate(EN.switchCountry.title, en)}
          </span>
        </h1>
      </div>

      <div role="note" className="mt-6 flex flex-col gap-2 rounded-xl bg-status-amber-soft px-4 py-3 text-base leading-relaxed text-text">
        {bilingual && <p lang="bn">{interpolate(BN.switchCountry.body, bn)}</p>}
        <p lang="en">{interpolate(EN.switchCountry.body, en)}</p>
        {cap && (
          <>
            {bilingual && (
              <p lang="bn" className="text-sm">
                {interpolate(BN.switchCountry.capWarning, { max: cap.bn })}
              </p>
            )}
            <p lang="en" className="text-sm">
              {interpolate(EN.switchCountry.capWarning, { max: cap.en })}
            </p>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <button
          type="button"
          onClick={onConfirm}
          data-testid="switch-country-confirm"
          className="tap min-h-16 w-full rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-md transition-colors hover:bg-brand-700 active:bg-brand-900"
        >
          {bilingual ? (
            <>
              <span lang="bn">{BN.switchCountry.confirm}</span>
              <span aria-hidden="true"> / </span>
              <span lang="en">{EN.switchCountry.confirm}</span>
            </>
          ) : (
            <span lang="en">{EN.switchCountry.confirm}</span>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          data-testid="switch-country-cancel"
          className="tap min-h-14 w-full rounded-2xl border-2 border-brand-600 bg-surface text-lg font-semibold text-brand-700 transition-colors hover:bg-brand-50 active:bg-brand-100"
        >
          {bilingual ? (
            <>
              <span lang="bn">{BN.switchCountry.cancel}</span>
              <span aria-hidden="true"> / </span>
              <span lang="en">{EN.switchCountry.cancel}</span>
            </>
          ) : (
            <span lang="en">{EN.switchCountry.cancel}</span>
          )}
        </button>
      </div>
    </main>
  );
}
