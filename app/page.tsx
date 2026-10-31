"use client";
/**
 * "/" (static, client-only logic). A returning visitor goes straight to their locale: the tp_locale
 * cookie, or, when cookies were cleared, the store's own locale once it shows answers or a finished
 * onboarding (both cookies are rewritten on every visit, so they do not expire while the app is in
 * use). A new visitor picks a country (step 1), then that country's language or English (step 2),
 * then starts the five questions. `?change=country` reopens the picker even when the cookies exist
 * (header country link); `?change=language` opens step 2 for the current country.
 *
 * Nothing is written until the language is picked: the country tap only moves to the next screen,
 * so Back (the browser's, or "Change country") leaves the old country in place. When the user has
 * answers and picks a different country, a confirm screen comes first; confirming keeps the
 * answers as a draft and starts fresh in the new country (store.switchCountry) at the language pick.
 * useSearchParams sits inside <Suspense> so the page still exports statically.
 */
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { CountryPicker } from "@/components/onboarding/CountryPicker";
import { LanguageStep } from "@/components/onboarding/LanguageStep";
import { SwitchCountryStep } from "@/components/onboarding/SwitchCountryStep";
import { showDraftToast } from "@/components/drafts/toast";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  COUNTRY_INDEX,
  currencySymbol,
  findCountry,
  isBanglaTag,
  loadCountryIndex,
  readCookie,
  readCountryCookie,
  regionName,
  setCountryCookie,
  suggestCountries,
  writeCookie,
  type CountryIndexEntry,
} from "@/lib/country/index-data";
import { LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n/config";
import { onboardingEntry as BN } from "@/lib/i18n/dictionaries/bn/onboarding";
import { onboardingEntry as EN } from "@/lib/i18n/dictionaries/en/onboarding";
import { draftDroppedBy, isEmptyAnswers, MAX_DRAFTS } from "@/lib/store/drafts";
import { answersOf, useHydrated, useTakaStore } from "@/lib/store/store";

type Phase = "loading" | "country" | "confirm" | "language";

function browserLanguages(): readonly string[] {
  if (typeof navigator === "undefined") return [];
  return navigator.languages?.length ? navigator.languages : navigator.language ? [navigator.language] : [];
}

function browserTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

/** Bangla copy is shown next to the English when the country speaks Bangla first or the browser asks for Bangla. */
const speaksBangla = (e: CountryIndexEntry | undefined) => e?.languages[0] === "bn" || browserLanguages().some(isBanglaTag);

/** True when the store holds answers worth keeping (the onboarding defaults alone do not count). */
function storeHasAnswers(): boolean {
  return !isEmptyAnswers(answersOf(useTakaStore.getState()));
}

/** Asks the service worker (when there is one) to keep the chosen locale's home and plan for offline use. */
function precacheLocale(locale: Locale): void {
  try {
    void navigator.serviceWorker?.ready
      .then((r) => r.active?.postMessage({ type: "precache", urls: [`/${locale}`, `/${locale}/plan`] }))
      .catch(() => {});
  } catch {
    // no service worker support
  }
}

function Entry() {
  const router = useRouter();
  const params = useSearchParams();
  const change = params.get("change");
  const hydrated = useHydrated();

  const [phase, setPhase] = useState<Phase>("loading");
  const [list, setList] = useState<CountryIndexEntry[]>(COUNTRY_INDEX);
  const [suggested, setSuggested] = useState<CountryIndexEntry[]>([]);
  const [current, setCurrent] = useState<string | undefined>();
  const [country, setCountryEntry] = useState<CountryIndexEntry | undefined>();
  /** The user confirmed starting fresh for `country` (applied at the language pick). */
  const [fresh, setFresh] = useState(false);
  const [busy, setBusy] = useState<Locale | null>(null);

  useEffect(() => {
    // "/" is outside [locale]: undo a previous page's lang/dir (e.g. dir="rtl" after /ar/*).
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    if (!hydrated) return;

    const store = useTakaStore.getState();
    const known = store.onboarding.completed || storeHasAnswers();
    const savedLocale = readCookie(LOCALE_COOKIE);
    const savedCountry = readCountryCookie() ?? (known ? store.country : undefined);
    if (!change) {
      const target = isLocale(savedLocale) ? savedLocale : known ? store.locale : null;
      if (target) {
        // Rewrite both cookies on every visit (a year from today), from the store when they were lost.
        writeCookie(LOCALE_COOKIE, target);
        const countryNow = known ? store.country : savedCountry;
        if (countryNow) setCountryCookie(countryNow);
        router.replace(`/${target}`);
        return;
      }
    }
    const suggest = (l: readonly CountryIndexEntry[]) => suggestCountries({ cookie: savedCountry, languages: browserLanguages(), timeZone: browserTimeZone() }, l);
    setCurrent(savedCountry);
    setSuggested(suggest(COUNTRY_INDEX));
    const saved = findCountry(savedCountry);
    if (change === "language" && saved) {
      setCountryEntry(saved);
      setPhase("language");
    } else {
      setPhase("country");
    }
    let live = true;
    void loadCountryIndex().then((l) => {
      if (!live || l === COUNTRY_INDEX) return;
      setList(l);
      setSuggested(suggest(l));
    });
    return () => {
      live = false;
    };
  }, [change, hydrated, router]);

  const pickCountry = useCallback(
    (entry: CountryIndexEntry) => {
      setCountryEntry(entry);
      setFresh(false);
      const switching = entry.code !== useTakaStore.getState().country && storeHasAnswers();
      setPhase(switching ? "confirm" : "language");
      for (const l of entry.locales) router.prefetch(`/${l}/start/1`);
      window.scrollTo({ top: 0 });
    },
    [router],
  );

  const pickLocale = useCallback(
    (locale: Locale) => {
      if (busy || !country) return;
      setBusy(locale);
      const store = useTakaStore.getState();
      const restart = fresh && country.code !== store.country;
      if (restart) {
        const kept = storeHasAnswers();
        store.switchCountry(country.code);
        if (kept) showDraftToast(locale === "bn" ? BN.switchCountry.saved : EN.switchCountry.saved);
      } else {
        store.setCountry(country.code);
      }
      setCountryCookie(country.code);
      writeCookie(LOCALE_COOKIE, locale);
      store.setLocale(locale);
      precacheLocale(locale);
      // A returning visitor changing language or keeping their answers goes back to where they were; anyone else starts the questions.
      router.push(change && !restart ? `/${locale}` : `/${locale}/start/1`);
    },
    [busy, change, country, fresh, router],
  );

  const backToPicker = useCallback(() => {
    setFresh(false);
    setPhase("country");
    window.scrollTo({ top: 0 });
  }, []);

  if (phase === "loading") return <Skeleton page />;
  if (phase === "confirm" && country) {
    const store = useTakaStore.getState();
    const dropping = draftDroppedBy(store.drafts, answersOf(store)) !== null;
    return (
      <SwitchCountryStep
        countryEn={country.nameEn}
        countryBn={regionName(country.code, "bn", country.nameEn)}
        currency={currencySymbol(findCountry(store.country)?.currency)}
        cap={dropping ? { en: String(MAX_DRAFTS), bn: new Intl.NumberFormat("bn-BD").format(MAX_DRAFTS) } : null}
        bilingual={speaksBangla(findCountry(store.country)) || speaksBangla(country)}
        onConfirm={() => {
          setFresh(true);
          setPhase("language");
          window.scrollTo({ top: 0 });
        }}
        onCancel={backToPicker}
      />
    );
  }
  if (phase === "language" && country) {
    return <LanguageStep country={country} bilingual={speaksBangla(country)} busy={busy} onPick={pickLocale} onChangeCountry={backToPicker} />;
  }
  return <CountryPicker list={list} suggested={suggested} current={current} bilingual={speaksBangla(suggested[0])} busy={busy !== null} onPick={pickCountry} />;
}

export default function Home() {
  return (
    <Suspense fallback={<Skeleton page />}>
      <Entry />
    </Suspense>
  );
}
