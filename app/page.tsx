"use client";
/**
 * "/" (static, client-only logic): a returning visitor (tp_locale cookie) goes straight to their
 * locale. A new visitor picks a country (step 1), then that country's language or English
 * (step 2), then starts the five questions. `?change=country` reopens the picker even when the
 * cookies exist (header country link); `?change=language` opens step 2 for the cookie's country.
 * useSearchParams sits inside <Suspense> so the page still exports statically.
 */
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { CountryPicker } from "@/components/onboarding/CountryPicker";
import { LanguageStep } from "@/components/onboarding/LanguageStep";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  COUNTRY_INDEX,
  findCountry,
  loadCountryIndex,
  readCookie,
  readCountryCookie,
  setCountryCookie,
  suggestCountries,
  writeCookie,
  type CountryIndexEntry,
} from "@/lib/country/index-data";
import { LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n/config";
import { useTakaStore } from "@/lib/store/store";

type Phase = "loading" | "country" | "language";

function browserLanguages(): readonly string[] {
  if (typeof navigator === "undefined") return [];
  return navigator.languages?.length ? navigator.languages : navigator.language ? [navigator.language] : [];
}

/** Bangla copy is shown next to the English when the country in question speaks Bangla first. */
const speaksBangla = (e: CountryIndexEntry | undefined) => e?.languages[0] === "bn";

function Entry() {
  const router = useRouter();
  const params = useSearchParams();
  const change = params.get("change");
  const setCountry = useTakaStore((s) => s.setCountry);
  const setLocale = useTakaStore((s) => s.setLocale);

  const [phase, setPhase] = useState<Phase>("loading");
  const [list, setList] = useState<CountryIndexEntry[]>(COUNTRY_INDEX);
  const [suggested, setSuggested] = useState<CountryIndexEntry[]>([]);
  const [current, setCurrent] = useState<string | undefined>();
  const [country, setCountryEntry] = useState<CountryIndexEntry | undefined>();
  const [busy, setBusy] = useState<Locale | null>(null);

  useEffect(() => {
    // "/" is outside [locale]: undo a previous page's lang/dir (e.g. dir="rtl" after /ar/*).
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";

    const savedLocale = readCookie(LOCALE_COOKIE);
    const savedCountry = readCountryCookie();
    if (!change && isLocale(savedLocale)) {
      router.replace(`/${savedLocale}`);
      return;
    }
    const suggest = (l: readonly CountryIndexEntry[]) => suggestCountries({ cookie: savedCountry, languages: browserLanguages() }, l);
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
  }, [change, router]);

  const pickCountry = useCallback(
    (entry: CountryIndexEntry) => {
      setCountry(entry.code);
      setCountryCookie(entry.code);
      setCurrent(entry.code);
      setCountryEntry(entry);
      setPhase("language");
      for (const l of entry.locales) router.prefetch(`/${l}/start/1`);
      window.scrollTo({ top: 0 });
    },
    [router, setCountry],
  );

  const pickLocale = useCallback(
    (locale: Locale) => {
      if (busy) return;
      setBusy(locale);
      writeCookie(LOCALE_COOKIE, locale);
      setLocale(locale);
      // A returning visitor changing country goes back to where they were; a new one starts the questions.
      router.push(change ? `/${locale}` : `/${locale}/start/1`);
    },
    [busy, change, router, setLocale],
  );

  if (phase === "loading") return <Skeleton page />;
  if (phase === "language" && country) {
    return (
      <LanguageStep
        country={country}
        bilingual={speaksBangla(country)}
        busy={busy}
        onPick={pickLocale}
        onChangeCountry={() => {
          setPhase("country");
          window.scrollTo({ top: 0 });
        }}
      />
    );
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
