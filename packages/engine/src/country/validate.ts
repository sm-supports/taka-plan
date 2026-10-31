/**
 * Runtime validation for country profiles arriving from data files, D1, the API or localStorage.
 * Numeric bounds follow the unit of the rate key in the base snapshot (rates.ts), with JSON shapes
 * from rates-json.ts. Researched figures must carry a source unless their status is "missing".
 */
import { jsonShapeOk } from "../rates-json";
import { RATE_KEYS, isRateKey, type RateKey, type RateUnit } from "../rates";
import { EngineError, LOCALES } from "../types";
import { COUNTRY_FIELD_KEYS } from "./fields";
import { REGIONS, type CountryField, type CountryIndexEntry, type CountryProfile } from "./types";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const CC = /^[A-Z]{2}$/;
const CC3 = /^[A-Z]{3}$/;
const LANG = /^[a-z]{2,3}$/;
const URL_OK = /^(https?:\/\/|docs\/)/;
const FIELD_KEY_SET: ReadonlySet<string> = new Set(COUNTRY_FIELD_KEYS);
const INSTRUMENTS = ["savings_account", "fdr_3m", "fdr_1y", "dps", "sanchayapatra_5y", "tbill_91d", "tbond_5y", "tbond_10y", "equity_fund", "gold"] as const;

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
      return v >= 0;
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

/** Validates one researched figure for rate key `key` with base unit `unit`. */
export function assertCountryField(code: string, key: RateKey, unit: RateUnit, f: unknown): CountryField {
  if (typeof f !== "object" || f === null) fail(code, `fields.${key}`);
  const x = f as Partial<CountryField>;
  if (x.status !== "sourced" && x.status !== "assumption" && x.status !== "missing") fail(code, `fields.${key}.status`);
  if (typeof x.asOf !== "string" || !ISO.test(x.asOf)) fail(code, `fields.${key}.asOf`);
  if (typeof x.sourceName !== "string") fail(code, `fields.${key}.sourceName`);
  if (typeof x.sourceUrl !== "string") fail(code, `fields.${key}.sourceUrl`);
  if (x.status === "missing") {
    if (x.value !== null && x.value !== undefined) fail(code, `fields.${key}.value`, "missing figures carry no value");
    return x as CountryField;
  }
  if (x.sourceName.length === 0) fail(code, `fields.${key}.sourceName`);
  if (!URL_OK.test(x.sourceUrl)) fail(code, `fields.${key}.sourceUrl`);
  if (unit === "json") {
    if (!jsonShapeOk(key, x.valueJson)) fail(code, `fields.${key}.valueJson`);
  } else if (typeof x.value !== "number" || !numericOk(unit, key, x.value)) {
    fail(code, `fields.${key}.value`, x.value);
  }
  return x as CountryField;
}

/**
 * Throws INVALID_INPUT unless `x` is a well-formed CountryProfile. `units` maps every rate key to
 * its unit (take it from the base snapshot or rates.seed.json).
 */
export function assertCountryProfile(x: unknown, units: Record<RateKey, RateUnit>): CountryProfile {
  if (typeof x !== "object" || x === null) throw new EngineError("INVALID_INPUT", "country profile is not an object");
  const p = x as Partial<CountryProfile>;
  const code = typeof p.code === "string" ? p.code : "??";
  if (p.schemaVersion !== 1) fail(code, "schemaVersion");
  if (!CC.test(code)) fail(code, "code");
  if (typeof p.iso3 !== "string" || !CC3.test(p.iso3)) fail(code, "iso3");
  for (const f of ["nameEn", "nameNative", "reviewedBy"] as const) if (typeof p[f] !== "string" || p[f].length === 0) fail(code, f);
  if (!REGIONS.includes(p.region as never)) fail(code, "region");
  if (!Array.isArray(p.languages) || p.languages.length === 0 || !p.languages.every((l) => typeof l === "string" && LANG.test(l))) fail(code, "languages");
  if (typeof p.researchedAt !== "string" || !ISO.test(p.researchedAt)) fail(code, "researchedAt");

  const c = p.currency;
  if (typeof c !== "object" || c === null) fail(code, "currency");
  if (typeof c.code !== "string" || !CC3.test(c.code)) fail(code, "currency.code");
  if (typeof c.symbol !== "string" || c.symbol.length === 0 || c.symbol.length > 8) fail(code, "currency.symbol");
  if (!Number.isInteger(c.decimals) || c.decimals < 0 || c.decimals > 4) fail(code, "currency.decimals");
  if (c.compact !== "lakh_crore" && c.compact !== "intl") fail(code, "currency.compact");
  const usd = c.usdRate as Partial<CountryField> | undefined;
  if (!usd || usd.status === "missing" || typeof usd.value !== "number" || !(usd.value > 0)) fail(code, "currency.usdRate");
  if (typeof usd.sourceUrl !== "string" || !URL_OK.test(usd.sourceUrl) || typeof usd.asOf !== "string" || !ISO.test(usd.asOf)) fail(code, "currency.usdRate.source");

  if (typeof p.fields !== "object" || p.fields === null) fail(code, "fields");
  for (const [key, f] of Object.entries(p.fields)) {
    if (!isRateKey(key) || !FIELD_KEY_SET.has(key)) fail(code, `fields.${key}`, "not a country field key");
    assertCountryField(code, key, units[key], f);
  }

  if (typeof p.instruments !== "object" || p.instruments === null) fail(code, "instruments");
  for (const i of INSTRUMENTS) {
    const info = (p.instruments as Record<string, unknown>)[i] as Partial<CountryProfile["instruments"][typeof i]> | undefined;
    if (!info || typeof info.available !== "boolean") fail(code, `instruments.${i}`);
    if (info.localName !== null && typeof info.localName !== "string") fail(code, `instruments.${i}.localName`);
    if (info.sourceUrl !== undefined && info.sourceUrl !== null && !URL_OK.test(info.sourceUrl)) fail(code, `instruments.${i}.sourceUrl`);
  }

  if (typeof p.institutions !== "object" || p.institutions === null) fail(code, "institutions");
  for (const [k, inst] of Object.entries(p.institutions)) {
    if (inst === null || inst === undefined) continue;
    if (typeof inst !== "object" || typeof (inst as { name?: unknown }).name !== "string" || !URL_OK.test(String((inst as { url?: unknown }).url))) fail(code, `institutions.${k}`);
  }
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

export function assertCountryIndex(x: unknown): CountryIndexEntry[] {
  if (!Array.isArray(x) || x.length === 0) throw new EngineError("INVALID_INPUT", "country index must be a non-empty array");
  const seen = new Set<string>();
  for (const e of x as Partial<CountryIndexEntry>[]) {
    const code = String(e?.code);
    if (!CC.test(code) || seen.has(code)) fail(code, "index.code");
    seen.add(code);
    if (typeof e.nameEn !== "string" || typeof e.nameNative !== "string") fail(code, "index.name");
    if (!REGIONS.includes(e.region as never)) fail(code, "index.region");
    if (typeof e.currency !== "string" || !CC3.test(e.currency)) fail(code, "index.currency");
    if (!Array.isArray(e.locales) || !e.locales.includes("en") || !e.locales.every((l) => (LOCALES as readonly string[]).includes(l))) fail(code, "index.locales");
  }
  return x as CountryIndexEntry[];
}
