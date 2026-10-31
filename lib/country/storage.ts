// localStorage copies of the country profiles and regional figures seen, so the app works offline.
import type { CountryCode, RegionDefaults } from "@taka/engine";
import { parseCountryBody, parseRegions, type LoadedCountry } from "./loader";

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
