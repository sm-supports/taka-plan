// localStorage cache of the last rates snapshot seen, so the app works offline.
import { assertSnapshot, type RatesSnapshot } from "@taka/engine";

export const RATES_STORAGE_KEY = "taka-plan.rates";

/** Returns the cached snapshot, or null when absent, invalid or storage is unavailable. */
export function loadStoredSnapshot(): RatesSnapshot | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(RATES_STORAGE_KEY);
    if (!raw) return null;
    return assertSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Best-effort save; quota or privacy-mode errors are ignored. */
export function saveStoredSnapshot(s: RatesSnapshot): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}
