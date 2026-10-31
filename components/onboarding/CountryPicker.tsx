"use client";
/**
 * Step 1 on "/": which country do you live in? A big search box (English and native names,
 * accent-insensitive), suggested countries (tp_country cookie, browser language regions), then
 * every country grouped by region. Lives outside the [locale] segment, so its copy comes straight
 * from the en/bn `onboardingEntry` objects (English, plus Bangla when `bilingual`).
 */
import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { onboardingEntry as BN } from "@/lib/i18n/dictionaries/bn/onboarding";
import { onboardingEntry as EN } from "@/lib/i18n/dictionaries/en/onboarding";
import { interpolate } from "@/lib/i18n/translate";
import type { Dictionary } from "@/lib/i18n/types";
import { REGION_ORDER, searchCountries, type CountryIndexEntry } from "@/lib/country/index-data";

export interface CountryPickerProps {
  list: readonly CountryIndexEntry[];
  suggested: readonly CountryIndexEntry[];
  /** The country already chosen (cookie), highlighted in the list. */
  current?: string;
  /** Show the Bangla copy above the English. */
  bilingual: boolean;
  busy?: boolean;
  onPick: (entry: CountryIndexEntry) => void;
}

type Copy = Dictionary["onboarding"]["country"];

/** One string in English, with the Bangla line first when bilingual. */
function Bi({ pick, bilingual, sep = " / " }: { pick: (c: Copy) => string; bilingual: boolean; sep?: string }) {
  if (!bilingual) return <span lang="en">{pick(EN.country)}</span>;
  return (
    <>
      <span lang="bn">{pick(BN.country)}</span>
      {sep}
      <span lang="en">{pick(EN.country)}</span>
    </>
  );
}

export function Logo({ className = "mx-auto h-14 w-14" }: { className?: string }) {
  return (
    <svg className={`${className} text-brand-600`} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="24" height="24" rx="7" fill="currentColor" />
      <path d="M9 10h10M14 10v9M11 19h6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CountryRow({ entry, current, busy, onPick }: { entry: CountryIndexEntry; current?: string; busy?: boolean; onPick: (e: CountryIndexEntry) => void }) {
  const selected = entry.code === current;
  const sameName = entry.nameNative === entry.nameEn;
  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(entry)}
        disabled={busy}
        aria-current={selected || undefined}
        data-country={entry.code}
        className={`tap flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-start transition-colors hover:bg-brand-50 active:bg-brand-100 disabled:opacity-70 ${
          selected ? "border-brand-600 bg-brand-50" : "border-line bg-surface"
        }`}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg font-semibold text-text" lang={entry.languages[0]} dir="auto">
            {entry.nameNative}
          </span>
          {!sameName && (
            <span className="block truncate text-sm text-text-muted" lang="en">
              {entry.nameEn}
            </span>
          )}
        </span>
        <span className="shrink-0 rounded-md bg-surface-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-text-muted" lang="en">
          {entry.currency}
        </span>
      </button>
    </li>
  );
}

export function CountryPicker({ list, suggested, current, bilingual, busy, onPick }: CountryPickerProps) {
  const [query, setQuery] = useState("");
  const searchId = useId();
  const matches = useMemo(() => (query.trim() ? searchCountries(query, list) : null), [query, list]);
  const groups = useMemo(() => {
    const byRegion = new Map<string, CountryIndexEntry[]>();
    for (const e of list) byRegion.set(e.region, [...(byRegion.get(e.region) ?? []), e]);
    for (const rows of byRegion.values()) rows.sort((a, b) => a.nameEn.localeCompare(b.nameEn, "en"));
    return REGION_ORDER.filter((r) => byRegion.has(r)).map((r) => ({ region: r, rows: byRegion.get(r)! }));
  }, [list]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && matches && matches.length > 0) {
      e.preventDefault();
      onPick(matches[0]!);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-8">
      <div className="text-center">
        <Logo />
        <p className="mt-3 text-2xl font-bold text-brand-700">Taka Plan</p>
        <h1 className="mt-4 text-xl font-semibold text-text">
          {bilingual ? (
            <>
              <span lang="bn" className="block">
                {BN.country.title}
              </span>
              <span lang="en" className="block text-base font-medium text-text-muted">
                {EN.country.title}
              </span>
            </>
          ) : (
            <span lang="en">{EN.country.title}</span>
          )}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          <Bi pick={(c) => c.subtitle} bilingual={bilingual} sep=" " />
        </p>
      </div>

      <div className="sticky top-0 z-10 -mx-4 mt-6 bg-page/95 px-4 py-2 backdrop-blur">
        <label htmlFor={searchId} className="mb-1 block text-sm font-semibold text-text">
          <Bi pick={(c) => c.searchLabel} bilingual={bilingual} />
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={bilingual ? BN.country.searchPlaceholder : EN.country.searchPlaceholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          dir="auto"
          className="tap w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-lg text-text shadow-sm placeholder:text-text-faint focus:border-brand-600 focus:outline-none"
        />
      </div>

      <div className="mt-4 flex flex-col gap-6">
        {matches ? (
          <section aria-labelledby="country-results">
            <h2 id="country-results" className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
              <Bi pick={(c) => c.results} bilingual={bilingual} />
            </h2>
            {matches.length === 0 ? (
              <p role="status" className="rounded-xl bg-surface-muted px-4 py-3 text-text-muted">
                {bilingual && (
                  <span lang="bn" className="block">
                    {interpolate(BN.country.noMatch, { query: query.trim() })}
                  </span>
                )}
                <span lang="en" className="block">
                  {interpolate(EN.country.noMatch, { query: query.trim() })}
                </span>
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {matches.map((e) => (
                  <CountryRow key={e.code} entry={e} current={current} busy={busy} onPick={onPick} />
                ))}
              </ul>
            )}
          </section>
        ) : (
          <>
            {suggested.length > 0 && (
              <section aria-labelledby="country-suggested">
                <h2 id="country-suggested" className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-700">
                  <Bi pick={(c) => c.suggested} bilingual={bilingual} />
                </h2>
                <ul className="flex flex-col gap-2">
                  {suggested.map((e) => (
                    <CountryRow key={e.code} entry={e} current={current} busy={busy} onPick={onPick} />
                  ))}
                </ul>
              </section>
            )}
            {groups.map(({ region, rows }) => (
              <section key={region} aria-labelledby={`region-${region}`}>
                <h2 id={`region-${region}`} className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
                  <Bi pick={(c) => c.region[region]} bilingual={bilingual} />
                </h2>
                <ul className="flex flex-col gap-2">
                  {rows.map((e) => (
                    <CountryRow key={e.code} entry={e} current={current} busy={busy} onPick={onPick} />
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>

      <p className="mt-8 text-center text-sm leading-relaxed text-text-muted">
        <Bi pick={(c) => c.intro} bilingual={bilingual} sep=" " />
      </p>
      <p className="mt-3 text-center text-xs leading-relaxed text-text-faint">
        <Bi pick={(c) => c.disclaimer} bilingual={bilingual} sep=" " />
      </p>
    </main>
  );
}
