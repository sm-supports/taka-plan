// Pure loading logic for country profiles: validation, "which copy is newest", and the two network
// sources (the static file from the build, then the D1 API). No React; the provider wires it up.
import {
  assertCountryField,
  assertCountryProfile,
  isRateKey,
  RATES_SEED,
  REGIONS,
  unitsFrom,
  type CountryCode,
  type CountryField,
  type CountryProfile,
  type RateKey,
  type RateUnit,
  type Region,
  type RegionDefaults,
} from "@taka/engine";

/** Where the active profile came from. "fallback" = no data for the chosen country, Bangladesh shown. */
export type CountrySource = "bundled" | "stored" | "static" | "api" | "fallback";

/** A validated profile with the version it was published as (0 for the build's static files). */
export interface LoadedCountry {
  profile: CountryProfile;
  version: number;
  source: CountrySource;
}

/** Bangladesh: the base country, always available offline. */
export const BASE_CODE: CountryCode = "BD";

/** Taka per dollar if even the bundled profile had none (it always has one; assertCountryProfile checks). */
export const DEFAULT_BD_USD_RATE = 122;

export const STATIC_COUNTRY_PATH = "/data/countries";
export const API_COUNTRY_PATH = "/api/countries";

let units: Record<RateKey, RateUnit> | null = null;
function seedUnits(): Record<RateKey, RateUnit> {
  units ??= unitsFrom(RATES_SEED.rows as Record<string, { unit: RateUnit }>);
  return units;
}

/** "bd" → "BD"; anything that is not two letters → null. */
export function normaliseCode(code: unknown): CountryCode | null {
  if (typeof code !== "string") return null;
  const c = code.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(c) ? c : null;
}

/**
 * Reads a profile body: a bare CountryProfile (static file) or `{ version, profile }` (API, see
 * lib/server/country-repo.ts StoredCountry). Throws when the profile is invalid or not `expected`.
 */
export function parseCountryBody(body: unknown, source: CountrySource, expected?: CountryCode): LoadedCountry {
  const wrapped = typeof body === "object" && body !== null && "profile" in body ? (body as { profile: unknown; version?: unknown }) : null;
  const profile = assertCountryProfile(wrapped ? wrapped.profile : body, seedUnits());
  if (expected && profile.code !== expected) throw new Error(`country file for ${expected} holds ${profile.code}`);
  const v = wrapped && typeof wrapped.version === "number" && Number.isFinite(wrapped.version) ? wrapped.version : 0;
  return { profile, version: v, source };
}

/** Newer = later researchedAt, then higher version. Ties keep `a`. */
export function isNewer(b: LoadedCountry, a: LoadedCountry): boolean {
  if (b.profile.researchedAt !== a.profile.researchedAt) return b.profile.researchedAt > a.profile.researchedAt;
  return b.version > a.version;
}

/** The newest of the candidates (first wins ties); null when none. */
export function pickNewest(candidates: readonly (LoadedCountry | null | undefined)[]): LoadedCountry | null {
  let best: LoadedCountry | null = null;
  for (const c of candidates) if (c && (best === null || isNewer(c, best))) best = c;
  return best;
}

/** Keeps the well-formed regional figures and drops the rest (the file is optional and advisory). */
export function parseRegions(body: unknown): RegionDefaults {
  const out: RegionDefaults = {};
  if (typeof body !== "object" || body === null) return out;
  const u = seedUnits();
  for (const [region, fields] of Object.entries(body as Record<string, unknown>)) {
    if (!(REGIONS as readonly string[]).includes(region) || typeof fields !== "object" || fields === null) continue;
    const kept: Partial<Record<RateKey, CountryField>> = {};
    for (const [key, f] of Object.entries(fields as Record<string, unknown>)) {
      if (!isRateKey(key)) continue;
      try {
        kept[key] = assertCountryField(`region ${region}`, key, u[key], f);
      } catch {
        // skip one bad figure, keep the others
      }
    }
    out[region as Region] = kept;
  }
  return out;
}

/** Taka per US dollar from a Bangladesh profile. */
export function bdUsdRateOf(bd: CountryProfile | null | undefined): number {
  const v = bd?.currency.usdRate.value;
  return typeof v === "number" && v > 0 ? v : DEFAULT_BD_USD_RATE;
}

type FetchLike = (input: string, init?: { signal?: AbortSignal; headers?: Record<string, string> }) => Promise<Pick<Response, "ok" | "status" | "json">>;

async function getJson(fetcher: FetchLike, url: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetcher(url, { signal, headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

export interface FetchCountryOptions {
  signal?: AbortSignal;
  fetch?: FetchLike;
}

/**
 * The newest network copy of `code`: the static file from the build (/data/countries/<CC>.json) and
 * the D1 API (/api/countries/<CC>), fetched together. Either may be missing (404) or invalid; errors
 * are swallowed and null means neither source had a usable profile.
 */
export async function fetchCountryProfile(code: CountryCode, o: FetchCountryOptions = {}): Promise<LoadedCountry | null> {
  const fetcher = o.fetch ?? (globalThis.fetch as unknown as FetchLike);
  const attempt = async (url: string, source: CountrySource): Promise<LoadedCountry | null> => {
    try {
      return parseCountryBody(await getJson(fetcher, url, o.signal), source, code);
    } catch {
      return null;
    }
  };
  const [fromStatic, fromApi] = await Promise.all([attempt(`${STATIC_COUNTRY_PATH}/${code}.json`, "static"), attempt(`${API_COUNTRY_PATH}/${code}`, "api")]);
  return pickNewest([fromStatic, fromApi]);
}

/** Regional fallbacks (/data/countries/_regions.json); null when absent or unreachable. */
export async function fetchRegions(o: FetchCountryOptions = {}): Promise<RegionDefaults | null> {
  const fetcher = o.fetch ?? (globalThis.fetch as unknown as FetchLike);
  try {
    return parseRegions(await getJson(fetcher, `${STATIC_COUNTRY_PATH}/_regions.json`, o.signal));
  } catch {
    return null;
  }
}
