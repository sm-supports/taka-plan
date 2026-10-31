// Pure loading logic for country profiles: validation, "which copy is newest", and the two network
// sources (the static file from the build, then the D1 API). No React; the provider wires it up.
import { assertCountryProfile, parseRegionDefaults, RATES_SEED, unitsFrom, type CountryCode, type CountryProfile, type RateKey, type RateUnit, type RegionDefaults } from "@taka/engine";

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

function versionOf(x: unknown): number {
  return typeof x === "number" && Number.isFinite(x) && x >= 0 ? x : 0;
}

/**
 * Reads a profile body in any of its shapes:
 * - `{ version, status?, profile }`: the API (GET /api/countries/:code) and the localStorage copy;
 * - a bare CountryProfile, optionally with a top-level `version` (static files from the build).
 * Throws when the profile is invalid or not `expected`.
 */
export function parseCountryBody(body: unknown, source: CountrySource, expected?: CountryCode): LoadedCountry {
  if (typeof body !== "object" || body === null) throw new Error("country body is not an object");
  const o = body as Record<string, unknown>;
  const wrapped = "profile" in o && typeof o.profile === "object" && o.profile !== null;
  let raw: unknown = wrapped ? o.profile : body;
  let version = versionOf(o.version);
  if (!wrapped && "version" in o) {
    // A bare profile carrying its published version: read it, keep it out of the profile itself.
    const { version: _v, ...rest } = o;
    raw = rest;
  } else if (wrapped && version === 0) {
    version = versionOf((o.profile as Record<string, unknown>).version);
  }
  const profile = assertCountryProfile(raw, seedUnits());
  if (expected && profile.code !== expected) throw new Error(`country file for ${expected} holds ${profile.code}`);
  return { profile, version, source };
}

/**
 * On a tie (same researchedAt and version) the copy closest to the server wins: the API, then this
 * build's static file and bundled profile, and the localStorage copy last. A copy saved by an
 * earlier build therefore never shadows the current one for ever.
 */
const SOURCE_RANK: Record<CountrySource, number> = { api: 4, static: 3, bundled: 2, stored: 1, fallback: 0 };

/** Newer = later researchedAt, then higher version, then the fresher source (SOURCE_RANK). Full ties keep `a`. */
export function isNewer(b: LoadedCountry, a: LoadedCountry): boolean {
  if (b.profile.researchedAt !== a.profile.researchedAt) return b.profile.researchedAt > a.profile.researchedAt;
  if (b.version !== a.version) return b.version > a.version;
  return SOURCE_RANK[b.source] > SOURCE_RANK[a.source];
}

/** The newest of the candidates (isNewer; the first wins full ties); null when none. */
export function pickNewest(candidates: readonly (LoadedCountry | null | undefined)[]): LoadedCountry | null {
  let best: LoadedCountry | null = null;
  for (const c of candidates) if (c && (best === null || isNewer(c, best))) best = c;
  return best;
}

/** Keeps the well-formed regional figures and drops the rest (the file is optional and advisory). */
export function parseRegions(body: unknown): RegionDefaults {
  // The engine's parser knows every group the file may hold (the seven regions and "global").
  return parseRegionDefaults(body, seedUnits());
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
