"use client";
/**
 * Language menu in the header: a button showing the current language, opening a list of the
 * current country's translated languages plus English (bn/en when the country is unknown).
 * Picking one writes the tp_locale cookie, updates the store and swaps the URL's locale prefix
 * (LOCALE_PREFIX), keeping the query string. The country list loads lazily on first use, so it
 * never weighs on first paint.
 */
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { LOCALE_COOKIE, LOCALE_META, LOCALE_PREFIX, type Locale } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";

const ONE_YEAR = 60 * 60 * 24 * 365;
const FALLBACK: readonly Locale[] = ["bn", "en"];

export function setLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`;
}

type IndexModule = typeof import("@/lib/country/index-data");
let indexModule: Promise<IndexModule> | null = null;
/** Loads lib/country/index-data (and the researched index when published) once per page load. */
function loadIndex(): Promise<IndexModule> {
  indexModule ??= import("@/lib/country/index-data").then(async (m) => {
    await m.loadCountryIndex();
    return m;
  });
  return indexModule;
}

/** The menu's languages: the country's locales (ending in English), with the current one first if it is not among them. */
export function menuLocales(countryLocales: readonly Locale[] | undefined, current: Locale): Locale[] {
  const base = countryLocales && countryLocales.length > 0 ? [...countryLocales] : [...FALLBACK];
  if (!base.includes("en")) base.push("en");
  return base.includes(current) ? base : [current, ...base];
}

export function LocaleSwitch() {
  const { t, locale } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const setLocale = useTakaStore((s) => s.setLocale);
  const country = useTakaStore((s) => s.country);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<IndexModule | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const prefetch = useCallback(() => {
    void loadIndex()
      .then(setIndex)
      .catch(() => {});
  }, []);
  const countryLocales = index?.localesForCountry(country);

  // Close on outside tap and on Escape (focus back on the button).
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Move focus into the list when it opens.
  useEffect(() => {
    if (open) rootRef.current?.querySelector<HTMLButtonElement>('[aria-current="true"], li button')?.focus();
  }, [open, index]);

  const choose = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    setLocaleCookie(next);
    setLocale(next);
    const path = (pathname || "/").replace(LOCALE_PREFIX, `/${next}`);
    router.replace(path + window.location.search);
  };

  const items = menuLocales(countryLocales, locale);
  const current = LOCALE_META[locale];

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          prefetch();
          setOpen((o) => !o);
        }}
        onPointerEnter={prefetch}
        onFocus={prefetch}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("common.languageMenu", { language: current.nativeName })}
        className="tap inline-flex max-w-[8.5rem] items-center justify-center gap-1 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-text hover:bg-surface-muted"
      >
        <svg className="h-4 w-4 shrink-0 text-text-muted" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2.75 10h14.5M10 2.75c2 2.1 2.9 4.5 2.9 7.25S12 15.15 10 17.25M10 2.75C8 4.85 7.1 7.25 7.1 10s.9 5.15 2.9 7.25" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="truncate" lang={current.tag}>
          {current.nativeName}
        </span>
        <svg className="h-3 w-3 shrink-0 text-text-muted" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul id={menuId} aria-label={t("common.language.pick")} className="absolute end-0 top-full z-50 mt-2 flex min-w-48 flex-col gap-1 rounded-2xl border border-line bg-surface p-2 shadow-lg">
          {items.map((l) => {
            const meta = LOCALE_META[l];
            const selected = l === locale;
            return (
              <li key={l}>
                <button
                  type="button"
                  lang={meta.tag}
                  dir={meta.dir}
                  onClick={() => choose(l)}
                  aria-current={selected || undefined}
                  className={`tap flex w-full items-center justify-between gap-3 rounded-xl px-3 text-start text-base font-semibold hover:bg-surface-muted ${selected ? "bg-brand-50 text-brand-700" : "text-text"}`}
                >
                  <span>{meta.nativeName}</span>
                  {meta.englishName !== meta.nativeName && (
                    <span className="text-xs font-normal text-text-muted" lang="en" dir="ltr">
                      {meta.englishName}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
