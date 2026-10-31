// Pure decisions behind <CountryProvider>: which profile is active for the chosen code, and the
// overlaid snapshot every calculator reads. Kept free of React so vitest covers it.
import { withCountry, type CountryCode, type CountryContext, type CountryProfile, type RatesSnapshot, type RegionDefaults } from "@taka/engine";
import { BASE_CODE, bdUsdRateOf, pickNewest, type CountrySource, type LoadedCountry } from "./loader";

/** What the provider knows about one country code. */
export interface CountryEntry {
  /** Newest valid copy seen so far (bundled, stored, static or API). */
  best: LoadedCountry | null;
  /** True once the network sources have answered (or failed). */
  done: boolean;
}

export interface ActiveCountry {
  /** The code the user chose (store.country), even while Bangladesh is shown in its place. */
  code: CountryCode;
  profile: CountryProfile;
  source: CountrySource;
  /** True while the network copy of `code` is still on its way. */
  loading: boolean;
}

/**
 * The profile to use now. The chosen country's newest copy when there is one; otherwise Bangladesh,
 * as "bundled" while the network is still answering and as "fallback" once it is clear there is no
 * data for the code. Rendering never waits for a profile.
 */
export function resolveActive(code: CountryCode, entry: CountryEntry | undefined, bd: LoadedCountry): ActiveCountry {
  const loading = !(entry?.done ?? false);
  const own = code === BASE_CODE ? pickNewest([bd, entry?.best]) : (entry?.best ?? null);
  if (own) return { code, profile: own.profile, source: own.source, loading };
  return { code, profile: bd.profile, source: loading ? "bundled" : "fallback", loading };
}

/** Merge a newly seen copy into an entry, keeping the newest. */
export function mergeEntry(entry: CountryEntry | undefined, seen: LoadedCountry | null, done: boolean): CountryEntry {
  return { best: pickNewest([entry?.best, seen]), done: done || (entry?.done ?? false) };
}

/**
 * `base` with `profile` applied (BD = identity rows plus the taka country context). Never throws:
 * a profile the overlay cannot apply falls back to Bangladesh.
 */
export function overlaySnapshot(base: RatesSnapshot, profile: CountryProfile, opts: { regions?: RegionDefaults | null; bd: CountryProfile }): RatesSnapshot {
  const bdUsdRate = bdUsdRateOf(opts.bd);
  try {
    return withCountry(base, profile, { regions: opts.regions ?? undefined, bdUsdRate });
  } catch {
    return withCountry(base, opts.bd, { bdUsdRate });
  }
}

/** The country context of an overlaid snapshot (always set by overlaySnapshot). */
export function contextOf(s: RatesSnapshot): CountryContext {
  if (!s.country) throw new Error("snapshot has no country context; build it with overlaySnapshot()");
  return s.country;
}

/**
 * What the banner under the header says about the chosen country (components/layout/CountryNotice):
 * "missing" when there is no researched profile for it (Bangladesh is shown instead, also once the
 * network has answered with nothing), "partial" when its context lists regional or converted
 * fallback figures, else "none". While the first copy is still loading nothing is said.
 */
export function countryNoticeKind(c: { code: string; profileCode: string; source: string; loading: boolean; fallbackKeys: readonly string[] }): "none" | "missing" | "partial" {
  if (c.source === "fallback" || (!c.loading && c.profileCode !== c.code)) return "missing";
  if (c.profileCode === c.code && c.fallbackKeys.length > 0) return "partial";
  return "none";
}
