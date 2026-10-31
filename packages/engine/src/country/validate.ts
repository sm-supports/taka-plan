/**
 * Runtime validation for country profiles arriving from data files, D1, the API or localStorage.
 * Numeric bounds follow the unit of the rate key in the base snapshot (rates.ts), with JSON shapes
 * from rates-json.ts. Researched figures must carry a source unless their status is "missing".
 * Dates must be real calendar dates and not in the future (asOf up to a year ahead, for figures
 * that refer to a scheduled date; researchedAt at most one day ahead, for time zones).
 */
import { jsonShapeOk } from "../rates-json";
import { RATE_KEYS, isRateKey, type RateKey, type RateUnit } from "../rates";
import { EngineError, LOCALES, type ISODate } from "../types";
import { COUNTRY_FIELD_KEYS } from "./fields";
import { REGIONS, REGION_DEFAULT_KEYS, type CountryField, type CountryIndexEntry, type CountryInstitutions, type CountryProfile, type RegionDefaults } from "./types";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const CC = /^[A-Z]{2}$/;
const CC3 = /^[A-Z]{3}$/;
/** ISO 639-1 (two letters) or ISO 639-3 (three letters). */
const LANG = /^[a-z]{2,3}$/;
const URL_OK = /^(https?:\/\/|docs\/)/;
const FIELD_KEY_SET: ReadonlySet<string> = new Set(COUNTRY_FIELD_KEYS);
export const INSTRUMENT_SLOTS = ["savings_account", "fdr_3m", "fdr_1y", "dps", "sanchayapatra_5y", "tbill_91d", "tbond_5y", "tbond_10y", "equity_fund", "gold"] as const;
export const INSTITUTION_KEYS: readonly (keyof CountryInstitutions)[] = [
  "centralBank",
  "insuranceRegulator",
  "insuranceComplaints",
  "pensionScheme",
  "oldAgeAllowance",
  "publicHealthCover",
  "depositInsurance",
  "statistics",
];

/** String length caps (characters). Institution names describe a body or scheme ("Compulsory superannuation (… Act 2000), supervised by …"), so they get more room. */
export const COUNTRY_TEXT_LIMITS = { name: 100, institutionName: 200, source: 300, note: 1000 } as const;
/** Largest money figure a country field may hold (local currency units). */
export const MAX_MONEY_VALUE = 1e12;
/** Bounds for local currency units per US dollar. */
export const USD_RATE_MIN = 1e-4;
export const USD_RATE_MAX = 1e7;

/**
 * Plausible bounds by unit for country figures. Rates may be negative (deflation, negative yields)
 * and high (hyperinflation), so they are wider than the admin bounds for the Bangladesh table.
 */
function numericOk(unit: RateUnit, key: RateKey, v: number): boolean {
  if (!Number.isFinite(v)) return false;
  switch (unit) {
    case "rate":
      if (key === "inflation_cpi" || key === "inflation_projection") return v >= -0.2 && v <= 10;
      if (key.startsWith("tax_")) return v >= 0 && v <= 1;
      return v >= -0.2 && v <= 3;
    case "ratio":
      return v >= 0 && v <= 1;
    case "bdt":
      return v >= 0 && v <= MAX_MONEY_VALUE;
    case "years":
    case "months":
      return v > 0 && v <= 1200;
    default:
      return false;
  }
}

function fail(code: string, field: string, detail?: unknown): never {
  throw new EngineError("INVALID_INPUT", `country ${code}: bad ${field}`, { code, field, detail });
}

/** True for a real calendar date written YYYY-MM-DD ("2026-02-30" is not one). */
export function isRealDate(x: unknown): x is ISODate {
  if (typeof x !== "string" || !ISO.test(x)) return false;
  const [y, m, d] = x.split("-").map(Number) as [number, number, number];
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

function addDays(iso: ISODate, days: number): ISODate {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function todayIso(): ISODate {
  return new Date().toISOString().slice(0, 10);
}

export interface CountryValidateOptions {
  /** Today's date (YYYY-MM-DD) for the future-date checks; defaults to the clock (UTC). */
  today?: ISODate;
}

function limits(o: CountryValidateOptions | undefined): { maxAsOf: ISODate; maxResearchedAt: ISODate } {
  const today = o?.today && isRealDate(o.today) ? o.today : todayIso();
  return { maxAsOf: addDays(today, 366), maxResearchedAt: addDays(today, 1) };
}

const isStr = (x: unknown, max: number, min = 0): x is string => typeof x === "string" && x.length >= min && x.length <= max;
const optStr = (x: unknown, max: number) => x === undefined || x === null || isStr(x, max);

/** Validates one researched figure for rate key `key` with base unit `unit`. */
export function assertCountryField(code: string, key: RateKey, unit: RateUnit, f: unknown, o?: CountryValidateOptions): CountryField {
  if (typeof f !== "object" || f === null || Array.isArray(f)) fail(code, `fields.${key}`);
  const x = f as Partial<CountryField>;
  const { maxAsOf } = limits(o);
  if (x.status !== "sourced" && x.status !== "assumption" && x.status !== "missing") fail(code, `fields.${key}.status`);
  if (!isRealDate(x.asOf) || x.asOf > maxAsOf) fail(code, `fields.${key}.asOf`, x.asOf);
  if (!isStr(x.sourceName, COUNTRY_TEXT_LIMITS.source)) fail(code, `fields.${key}.sourceName`);
  if (!isStr(x.sourceUrl, COUNTRY_TEXT_LIMITS.source)) fail(code, `fields.${key}.sourceUrl`);
  if (!optStr(x.note, COUNTRY_TEXT_LIMITS.note)) fail(code, `fields.${key}.note`);
  if (x.absent !== undefined && typeof x.absent !== "boolean") fail(code, `fields.${key}.absent`);
  if (x.status === "missing") {
    if (x.value !== null && x.value !== undefined) fail(code, `fields.${key}.value`, "missing figures carry no value");
    if (x.valueJson !== undefined && x.valueJson !== null) fail(code, `fields.${key}.valueJson`, "missing figures carry no value");
    if (x.sourceUrl !== "" && !URL_OK.test(x.sourceUrl)) fail(code, `fields.${key}.sourceUrl`);
    return x as CountryField;
  }
  if (x.absent === true) fail(code, `fields.${key}.absent`, "absent is only allowed with status missing");
  if (x.sourceName.length === 0) fail(code, `fields.${key}.sourceName`);
  if (!URL_OK.test(x.sourceUrl)) fail(code, `fields.${key}.sourceUrl`);
  if (unit === "json") {
    if (!jsonShapeOk(key, x.valueJson)) fail(code, `fields.${key}.valueJson`);
  } else if (typeof x.value !== "number" || !numericOk(unit, key, x.value)) {
    fail(code, `fields.${key}.value`, x.value);
  }
  return x as CountryField;
}

function assertInstruments(code: string, x: unknown): void {
  if (typeof x !== "object" || x === null || Array.isArray(x)) fail(code, "instruments");
  const map = x as Record<string, unknown>;
  for (const k of Object.keys(map)) if (!(INSTRUMENT_SLOTS as readonly string[]).includes(k)) fail(code, `instruments.${k}`, "not a product slot");
  for (const i of INSTRUMENT_SLOTS) {
    const info = map[i] as Partial<CountryProfile["instruments"][typeof i]> | undefined;
    if (typeof info !== "object" || info === null || typeof info.available !== "boolean") fail(code, `instruments.${i}`);
    if (info.localName !== null && !isStr(info.localName, COUNTRY_TEXT_LIMITS.name)) fail(code, `instruments.${i}.localName`);
    if (!optStr(info.localNameEn, COUNTRY_TEXT_LIMITS.name)) fail(code, `instruments.${i}.localNameEn`);
    if (!optStr(info.note, COUNTRY_TEXT_LIMITS.note)) fail(code, `instruments.${i}.note`);
    if (info.sourceUrl !== undefined && info.sourceUrl !== null && !(isStr(info.sourceUrl, COUNTRY_TEXT_LIMITS.source) && URL_OK.test(info.sourceUrl))) fail(code, `instruments.${i}.sourceUrl`);
  }
}

function assertInstitutions(code: string, x: unknown): void {
  if (typeof x !== "object" || x === null || Array.isArray(x)) fail(code, "institutions");
  for (const [k, inst] of Object.entries(x as Record<string, unknown>)) {
    if (!(INSTITUTION_KEYS as readonly string[]).includes(k)) fail(code, `institutions.${k}`, "not an institution key");
    if (inst === null || inst === undefined) continue;
    if (typeof inst !== "object" || Array.isArray(inst)) fail(code, `institutions.${k}`);
    const i = inst as { name?: unknown; url?: unknown; note?: unknown };
    if (!isStr(i.name, COUNTRY_TEXT_LIMITS.institutionName, 1)) fail(code, `institutions.${k}.name`);
    if (!isStr(i.url, COUNTRY_TEXT_LIMITS.source) || !URL_OK.test(i.url)) fail(code, `institutions.${k}.url`);
    if (!optStr(i.note, COUNTRY_TEXT_LIMITS.note)) fail(code, `institutions.${k}.note`);
  }
}

/**
 * Throws INVALID_INPUT unless `x` is a well-formed CountryProfile. `units` maps every rate key to
 * its unit (take it from the base snapshot or rates.seed.json).
 */
export function assertCountryProfile(x: unknown, units: Record<RateKey, RateUnit>, o?: CountryValidateOptions): CountryProfile {
  if (typeof x !== "object" || x === null || Array.isArray(x)) throw new EngineError("INVALID_INPUT", "country profile is not an object");
  const p = x as Partial<CountryProfile>;
  const code = typeof p.code === "string" ? p.code.slice(0, 8) : "??";
  const { maxAsOf, maxResearchedAt } = limits(o);
  if (p.schemaVersion !== 1) fail(code, "schemaVersion");
  if (!CC.test(code)) fail(code, "code");
  if (typeof p.iso3 !== "string" || !CC3.test(p.iso3)) fail(code, "iso3");
  for (const f of ["nameEn", "nameNative", "reviewedBy"] as const) if (!isStr(p[f], COUNTRY_TEXT_LIMITS.name, 1)) fail(code, f);
  if (!REGIONS.includes(p.region as never)) fail(code, "region");
  if (!Array.isArray(p.languages) || p.languages.length === 0 || p.languages.length > 20 || !p.languages.every((l) => typeof l === "string" && LANG.test(l))) fail(code, "languages");
  if (!isRealDate(p.researchedAt) || p.researchedAt > maxResearchedAt) fail(code, "researchedAt", p.researchedAt);

  const c = p.currency;
  if (typeof c !== "object" || c === null) fail(code, "currency");
  if (typeof c.code !== "string" || !CC3.test(c.code)) fail(code, "currency.code");
  if (typeof c.symbol !== "string" || c.symbol.length === 0 || c.symbol.length > 8) fail(code, "currency.symbol");
  if (!Number.isInteger(c.decimals) || c.decimals < 0 || c.decimals > 4) fail(code, "currency.decimals");
  if (c.compact !== "lakh_crore" && c.compact !== "intl") fail(code, "currency.compact");
  const usd = c.usdRate as Partial<CountryField> | undefined;
  if (typeof usd !== "object" || usd === null || (usd.status !== "sourced" && usd.status !== "assumption")) fail(code, "currency.usdRate.status");
  if (typeof usd.value !== "number" || !Number.isFinite(usd.value) || usd.value < USD_RATE_MIN || usd.value > USD_RATE_MAX) fail(code, "currency.usdRate", usd.value);
  if (!isStr(usd.sourceUrl, COUNTRY_TEXT_LIMITS.source) || !URL_OK.test(usd.sourceUrl) || !isStr(usd.sourceName, COUNTRY_TEXT_LIMITS.source)) fail(code, "currency.usdRate.source");
  if (!isRealDate(usd.asOf) || usd.asOf > maxAsOf) fail(code, "currency.usdRate.asOf");
  if (!optStr(usd.note, COUNTRY_TEXT_LIMITS.note)) fail(code, "currency.usdRate.note");

  if (typeof p.fields !== "object" || p.fields === null || Array.isArray(p.fields)) fail(code, "fields");
  for (const [key, f] of Object.entries(p.fields)) {
    if (!isRateKey(key) || !FIELD_KEY_SET.has(key)) fail(code, `fields.${key.slice(0, 64)}`, "not a country field key");
    assertCountryField(code, key, units[key], f, o);
  }

  assertInstruments(code, p.instruments);
  assertInstitutions(code, p.institutions);
  return p as CountryProfile;
}

/** Unit of every rate key, read from a rates snapshot or the seed JSON. */
export function unitsFrom(rows: Record<string, { unit: RateUnit }>): Record<RateKey, RateUnit> {
  const out = {} as Record<RateKey, RateUnit>;
  for (const k of RATE_KEYS) {
    const r = rows[k];
    if (!r) throw new EngineError("INVALID_INPUT", `no unit for rate key "${k}"`);
    out[k] = r.unit;
  }
  return out;
}

/**
 * Regional defaults (data/countries/_regions.json) with every malformed region or figure dropped:
 * the file is optional and advisory, so one bad figure never blocks the others. Keys are the
 * regions plus "global"; figures must be country field keys.
 */
export function parseRegionDefaults(body: unknown, units: Record<RateKey, RateUnit>, o?: CountryValidateOptions): RegionDefaults {
  const out: RegionDefaults = {};
  if (typeof body !== "object" || body === null || Array.isArray(body)) return out;
  for (const [region, fields] of Object.entries(body as Record<string, unknown>)) {
    if (!(REGION_DEFAULT_KEYS as readonly string[]).includes(region) || typeof fields !== "object" || fields === null || Array.isArray(fields)) continue;
    const kept: Partial<Record<RateKey, CountryField>> = {};
    for (const [key, f] of Object.entries(fields as Record<string, unknown>)) {
      if (!isRateKey(key) || !FIELD_KEY_SET.has(key)) continue;
      try {
        kept[key] = assertCountryField(`region ${region}`, key, units[key], f, o);
      } catch {
        // skip one bad figure, keep the others
      }
    }
    out[region as keyof RegionDefaults] = kept;
  }
  return out;
}

export function assertCountryIndex(x: unknown): CountryIndexEntry[] {
  if (!Array.isArray(x) || x.length === 0) throw new EngineError("INVALID_INPUT", "country index must be a non-empty array");
  const seen = new Set<string>();
  for (const e of x as Partial<CountryIndexEntry>[]) {
    const code = String(e?.code).slice(0, 8);
    if (!CC.test(code) || seen.has(code)) fail(code, "index.code");
    seen.add(code);
    if (!isStr(e.nameEn, COUNTRY_TEXT_LIMITS.name) || !isStr(e.nameNative, COUNTRY_TEXT_LIMITS.name)) fail(code, "index.name");
    if (!REGIONS.includes(e.region as never)) fail(code, "index.region");
    if (typeof e.currency !== "string" || !CC3.test(e.currency)) fail(code, "index.currency");
    if (!Array.isArray(e.locales) || !e.locales.includes("en") || !e.locales.every((l) => (LOCALES as readonly string[]).includes(l))) fail(code, "index.locales");
  }
  return x as CountryIndexEntry[];
}
