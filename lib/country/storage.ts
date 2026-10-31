// localStorage copies of the country profiles and regional figures seen, so the app works offline.
import type { CountryCode, RegionDefaults } from "@taka/engine";
import { BASE_CODE, parseCountryBody, parseRegions, type LoadedCountry } from "./loader";
import { mergeEntry, type CountryEntry } from "./resolve";

export const COUNTRY_STORAGE_PREFIX = "taka-plan.country.";
export const REGIONS_STORAGE_KEY = `${COUNTRY_STORAGE_PREFIX}_regions`;

export function countryStorageKey(code: CountryCode): string {
  return `${COUNTRY_STORAGE_PREFIX}${code}`;
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** The stored copy of `code` (source "stored"), or null when absent, invalid or storage is unavailable. */
export function loadStoredCountry(code: CountryCode): LoadedCountry | null {
  try {
    const raw = storage()?.getItem(countryStorageKey(code));
    if (!raw) return null;
    return parseCountryBody(JSON.parse(raw), "stored", code);
  } catch {
    return null;
  }
}

/** Best-effort save as `{ version, profile }`; quota or privacy-mode errors are ignored. */
export function saveStoredCountry(c: LoadedCountry): void {
  try {
    storage()?.setItem(countryStorageKey(c.profile.code), JSON.stringify({ version: c.version, profile: c.profile }));
  } catch {
    // ignore
  }
}

/**
 * What the provider knows before any network answer: the stored copies of `code` and Bangladesh.
 * Read synchronously for the provider's first render, so a returning user's currency shows at once.
 */
export function initialEntries(code: CountryCode): Record<CountryCode, CountryEntry> {
  const out: Record<CountryCode, CountryEntry> = {};
  for (const c of new Set([code, BASE_CODE])) {
    const stored = loadStoredCountry(c);
    if (stored) out[c] = mergeEntry(undefined, stored, false);
  }
  return out;
}

/**
 * Removes the stored copies of every country except `keep` (the current country and Bangladesh),
 * so localStorage holds at most two profiles however many countries were tried. Regional figures
 * stay. Returns the codes removed.
 */
export function pruneStoredCountries(keep: readonly CountryCode[]): CountryCode[] {
  const removed: CountryCode[] = [];
  try {
    const s = storage();
    if (!s) return removed;
    const keys: string[] = [];
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (k && k.startsWith(COUNTRY_STORAGE_PREFIX) && k !== REGIONS_STORAGE_KEY) keys.push(k);
    }
    for (const k of keys) {
      const code = k.slice(COUNTRY_STORAGE_PREFIX.length);
      if (keep.includes(code)) continue;
      s.removeItem(k);
      removed.push(code);
    }
  } catch {
    // ignore
  }
  return removed;
}

export function loadStoredRegions(): RegionDefaults | null {
  try {
    const raw = storage()?.getItem(REGIONS_STORAGE_KEY);
    return raw ? parseRegions(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveStoredRegions(r: RegionDefaults): void {
  try {
    storage()?.setItem(REGIONS_STORAGE_KEY, JSON.stringify(r));
  } catch {
    // ignore
  }
}
