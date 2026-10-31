/**
 * The country picker's list: /data/countries/index.json when the build has published it (research
 * data), else the bundled COUNTRY_INDEX. Plus the picker's helpers (search, suggestions, lookup).
 * Client-safe and engine-free at runtime (types only), so "/" never pulls the engine barrel.
 */
import type { CountryIndexEntry, Region } from "@taka/engine";
import { COUNTRY_COOKIE, isLocale, type Locale } from "@/lib/i18n/config";
import { COUNTRY_INDEX } from "./countries-index";

export { COUNTRY_INDEX };
export type { CountryIndexEntry };

/** Where the build will publish the researched index (Stage 2). */
export const INDEX_URL = "/data/countries/index.json";

/** Display order of the picker's region groups. */
export const REGION_ORDER: readonly Region[] = [
  "south_asia",
  "east_asia_pacific",
  "middle_east_north_africa",
  "sub_saharan_africa",
  "europe_central_asia",
  "latin_america_caribbean",
  "north_america",
];

let cached: CountryIndexEntry[] | null = null;
let pending: Promise<CountryIndexEntry[]> | null = null;

/** Light shape check for the fetched file: a bad or partial file must never break the picker. */
function looksLikeIndex(x: unknown): x is CountryIndexEntry[] {
  return (
    Array.isArray(x) &&
    x.length > 0 &&
    x.every(
      (e) =>
        e !== null &&
        typeof e === "object" &&
        typeof (e as CountryIndexEntry).code === "string" &&
        /^[A-Z]{2}$/.test((e as CountryIndexEntry).code) &&
        typeof (e as CountryIndexEntry).nameEn === "string" &&
        typeof (e as CountryIndexEntry).nameNative === "string" &&
        typeof (e as CountryIndexEntry).currency === "string" &&
        Array.isArray((e as CountryIndexEntry).locales) &&
        (e as CountryIndexEntry).locales.every((l) => isLocale(l)) &&
        (e as CountryIndexEntry).locales.includes("en"),
    )
  );
}

/** The list known right now (the fetched file once it has loaded, else the bundled one). */
export function countryIndexSync(): CountryIndexEntry[] {
  return cached ?? COUNTRY_INDEX;
}

/** Fetches /data/countries/index.json once per page load; falls back to the bundled list on any failure. */
export function loadCountryIndex(fetcher: typeof fetch = globalThis.fetch): Promise<CountryIndexEntry[]> {
  if (cached) return Promise.resolve(cached);
  if (pending) return pending;
  if (typeof fetcher !== "function") return Promise.resolve(COUNTRY_INDEX);
  pending = fetcher(INDEX_URL, { credentials: "same-origin" })
    .then(async (r) => {
      if (!r.ok || !(r.headers.get("content-type") ?? "").includes("json")) return COUNTRY_INDEX;
      const data: unknown = await r.json();
      return looksLikeIndex(data) ? data : COUNTRY_INDEX;
    })
    .catch(() => COUNTRY_INDEX)
    .then((list) => {
      cached = list;
      return list;
    });
  return pending;
}

/** Test hook: forget the fetched list. */
export function resetCountryIndexCache(): void {
  cached = null;
  pending = null;
}

export function findCountry(code: string | null | undefined, list: readonly CountryIndexEntry[] = countryIndexSync()): CountryIndexEntry | undefined {
  if (!code) return undefined;
  const upper = code.toUpperCase();
  return list.find((e) => e.code === upper) ?? COUNTRY_INDEX.find((e) => e.code === upper);
}

/** Lower case without Latin accents or Arabic vowel marks, so "cote", "Côte" and "COTE" (or عمان and عُمان) all match. Indic vowel signs are kept. */
export function normalize(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, "")
    .replace(/[’'`.]/g, "")
    .toLowerCase()
    .trim();
}

/** Countries whose English name, native name or code matches the query; name-prefix matches first. */
export function searchCountries(query: string, list: readonly CountryIndexEntry[]): CountryIndexEntry[] {
  const q = normalize(query);
  if (!q) return [...list];
  const scored: { e: CountryIndexEntry; score: number }[] = [];
  for (const e of list) {
    const en = normalize(e.nameEn);
    const native = normalize(e.nameNative);
    const code = e.code.toLowerCase();
    let score = -1;
    if (en.startsWith(q) || native.startsWith(q) || code === q) score = 0;
    else if (en.split(/[\s-]+/).some((w) => w.startsWith(q)) || native.split(/[\s-]+/).some((w) => w.startsWith(q))) score = 1;
    else if (en.includes(q) || native.includes(q)) score = 2;
    if (score >= 0) scored.push({ e, score });
  }
  return scored.sort((a, b) => a.score - b.score || a.e.nameEn.localeCompare(b.e.nameEn, "en")).map((s) => s.e);
}

/** Region subtag of a BCP 47 tag ("bn-BD" → "BD", "zh-Hant-TW" → "TW"); undefined when there is none. */
export function regionOfTag(tag: string): string | undefined {
  for (const part of tag.split(/[-_]/).slice(1)) if (/^[A-Za-z]{2}$/.test(part)) return part.toUpperCase();
  return undefined;
}

/**
 * Suggested countries: the tp_country cookie first, then each browser language's region
 * (navigator.languages, e.g. "bn-BD" → BD), without duplicates or unknown codes. At most `max`.
 */
export function suggestCountries(input: { cookie?: string | null; languages?: readonly string[] }, list: readonly CountryIndexEntry[], max = 3): CountryIndexEntry[] {
  const out: CountryIndexEntry[] = [];
  const add = (code: string | undefined) => {
    const e = findCountry(code, list);
    if (e && !out.includes(e) && out.length < max) out.push(e);
  };
  add(input.cookie ?? undefined);
  for (const tag of input.languages ?? []) add(regionOfTag(tag));
  return out;
}

/** The locales the UI offers for a country: its translated languages, then English (bn/en when unknown). */
export function localesForCountry(code: string | null | undefined): Locale[] {
  return findCountry(code)?.locales ?? ["bn", "en"];
}

/* ---- cookies (client only) ---- */

const ONE_YEAR = 60 * 60 * 24 * 365;

export function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m?.[1] ? decodeURIComponent(m[1]) : undefined;
}

export function writeCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`;
}

export function readCountryCookie(): string | undefined {
  const v = readCookie(COUNTRY_COOKIE)?.toUpperCase();
  return v && /^[A-Z]{2}$/.test(v) ? v : undefined;
}

export function setCountryCookie(code: string): void {
  writeCookie(COUNTRY_COOKIE, code.toUpperCase());
}
