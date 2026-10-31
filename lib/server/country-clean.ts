// Strict server-side cleaning for admin country edits, on top of the engine validator
// (packages/engine/src/country/validate.ts): string and size caps, real calendar dates not in the
// future, typed meta patches with unknown keys refused, and JSON field values reduced to the keys
// their shape knows. Everything here runs before D1 is touched, so a rejected edit never creates a draft.
import type { CountryField, CountryInstitutions, CountryProfile, CurrencyInfo, Instrument, InstrumentInfo, Institution } from "@taka/engine";
import type { CountryMetaPatch } from "./country-repo";
import { HttpError } from "./http";

/** Longest names (country, local product names, reviewer) the admin may store. */
export const MAX_NAME = 100;
/** Longest source name, URL or institution name. */
export const MAX_SOURCE = 300;
/** Longest note (field, product, institution or change-log note). */
export const MAX_NOTE = 1000;
/** Largest serialised profile (UTF-8 bytes) a draft may grow to; real profiles are about 25 KB. */
export const MAX_PROFILE_BYTES = 48 * 1024;

/** How far ahead dates may run: researchedAt at most tomorrow (time zones), asOf at most a year. */
export const RESEARCHED_AT_LEEWAY_DAYS = 1;
export const AS_OF_LEEWAY_DAYS = 366;

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const LANG = /^[a-z]{2,3}$/;
const CC3 = /^[A-Z]{3}$/;
const SOURCE_URL = /^(https?:\/\/[^\s]+|docs\/[^\s]*)$/;
const LINK_URL = /^https?:\/\/[^\s]+$/;
const MAX_LANGUAGES = 12;

export const INSTRUMENT_SLOTS = ["savings_account", "fdr_3m", "fdr_1y", "dps", "sanchayapatra_5y", "tbill_91d", "tbond_5y", "tbond_10y", "equity_fund", "gold"] as const satisfies readonly Instrument[];
export const INSTITUTION_KEYS = [
  "centralBank",
  "insuranceRegulator",
  "insuranceComplaints",
  "pensionScheme",
  "oldAgeAllowance",
  "publicHealthCover",
  "depositInsurance",
  "statistics",
] as const satisfies readonly (keyof CountryInstitutions)[];
const SLOT_SET: ReadonlySet<string> = new Set(INSTRUMENT_SLOTS);
const INSTITUTION_SET: ReadonlySet<string> = new Set(INSTITUTION_KEYS);

/** YYYY-MM-DD for now (UTC). */
export function todayUtc(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** `today` plus `days`, as YYYY-MM-DD. */
export function addDays(today: string, days: number): string {
  return new Date(Date.parse(`${today}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

/** True for a real calendar date in YYYY-MM-DD form (2026-02-30 is not). */
export function isRealDate(s: unknown): s is string {
  if (typeof s !== "string" || !ISO.test(s)) return false;
  const t = Date.parse(`${s}T00:00:00Z`);
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === s;
}

function bad(path: string, why: string): never {
  throw new HttpError(400, "INVALID_META", `meta.${path} ${why}`);
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

function onlyKeys(path: string, x: Record<string, unknown>, allowed: readonly string[]): void {
  for (const k of Object.keys(x)) if (!allowed.includes(k)) bad(`${path}.${k}`, "is not a known property");
}

function str(path: string, v: unknown, max: number): string {
  if (typeof v !== "string" || v.trim().length === 0) bad(path, "must be a non-empty string");
  if (v.length > max) bad(path, `must be at most ${max} characters`);
  return v;
}

function optStr(path: string, v: unknown, max: number): string | null | undefined {
  if (v === undefined || v === null) return v;
  if (typeof v !== "string") bad(path, "must be a string or null");
  if (v.length > max) bad(path, `must be at most ${max} characters`);
  return v;
}

function url(path: string, v: unknown, pattern: RegExp): string {
  if (typeof v !== "string" || !pattern.test(v)) bad(path, "must be an http(s) link");
  if (v.length > MAX_SOURCE) bad(path, `must be at most ${MAX_SOURCE} characters`);
  return v;
}

/** Throws unless `date` is a real date no later than `today + leewayDays`. */
export function assertNotFuture(label: string, date: unknown, today: string, leewayDays: number): void {
  if (!isRealDate(date)) throw new HttpError(400, "INVALID_DATE", `${label} must be a real date (YYYY-MM-DD)`);
  const latest = addDays(today, leewayDays);
  if (date > latest) throw new HttpError(400, "INVALID_DATE", `${label} ${date} is in the future (latest allowed ${latest})`);
}

/**
 * The string, date and size rules for one figure (country field or currency.usdRate), applied after
 * the engine validator accepted its value. Throws HttpError 400.
 */
export function assertFieldLimits(label: string, f: Pick<CountryField, "sourceName" | "sourceUrl" | "asOf" | "note" | "status">, today: string): void {
  if (f.sourceName.length > MAX_SOURCE) throw new HttpError(400, "INVALID_FIELD", `${label}.sourceName must be at most ${MAX_SOURCE} characters`);
  if (f.sourceUrl.length > MAX_SOURCE) throw new HttpError(400, "INVALID_FIELD", `${label}.sourceUrl must be at most ${MAX_SOURCE} characters`);
  if (f.status !== "missing" && !SOURCE_URL.test(f.sourceUrl)) throw new HttpError(400, "INVALID_FIELD", `${label}.sourceUrl must be an http(s) link or a docs/ path`);
  if (typeof f.note === "string" && f.note.length > MAX_NOTE) throw new HttpError(400, "INVALID_FIELD", `${label}.note must be at most ${MAX_NOTE} characters`);
  assertNotFuture(`${label}.asOf`, f.asOf, today, AS_OF_LEEWAY_DAYS);
}

function cleanUsdRate(raw: unknown, today: string): CountryField {
  const path = "currency.usdRate";
  if (!isObj(raw)) bad(path, "must be an object");
  onlyKeys(path, raw, ["value", "status", "sourceName", "sourceUrl", "asOf", "note"]);
  if (raw.status !== "sourced" && raw.status !== "assumption") bad(`${path}.status`, 'must be "sourced" or "assumption"');
  if (typeof raw.value !== "number" || !Number.isFinite(raw.value) || raw.value < 1e-4 || raw.value > 1e7) bad(`${path}.value`, "must be a number between 0.0001 and 10,000,000");
  assertNotFuture(`meta.${path}.asOf`, raw.asOf, today, AS_OF_LEEWAY_DAYS);
  const out: CountryField = {
    value: raw.value,
    status: raw.status,
    sourceName: str(`${path}.sourceName`, raw.sourceName, MAX_SOURCE),
    sourceUrl: url(`${path}.sourceUrl`, raw.sourceUrl, SOURCE_URL),
    asOf: raw.asOf as string,
  };
  const note = optStr(`${path}.note`, raw.note, MAX_NOTE);
  if (typeof note === "string" && note.length > 0) out.note = note;
  return out;
}

function cleanCurrency(raw: unknown, today: string): CurrencyInfo {
  if (!isObj(raw)) bad("currency", "must be an object");
  onlyKeys("currency", raw, ["code", "symbol", "decimals", "compact", "usdRate"]);
  if (typeof raw.code !== "string" || !CC3.test(raw.code)) bad("currency.code", "must be three capital letters (ISO 4217)");
  if (typeof raw.symbol !== "string" || raw.symbol.length === 0 || raw.symbol.length > 8) bad("currency.symbol", "must be 1 to 8 characters");
  if (typeof raw.decimals !== "number" || !Number.isInteger(raw.decimals) || raw.decimals < 0 || raw.decimals > 4) bad("currency.decimals", "must be a whole number from 0 to 4");
  if (raw.compact !== "lakh_crore" && raw.compact !== "intl") bad("currency.compact", 'must be "lakh_crore" or "intl"');
  return { code: raw.code, symbol: raw.symbol, decimals: raw.decimals, compact: raw.compact, usdRate: cleanUsdRate(raw.usdRate, today) };
}

function cleanInstrument(slot: string, raw: unknown): InstrumentInfo {
  const path = `instruments.${slot}`;
  if (!isObj(raw)) bad(path, "must be an object");
  onlyKeys(path, raw, ["available", "localName", "localNameEn", "note", "sourceUrl"]);
  if (typeof raw.available !== "boolean") bad(`${path}.available`, "must be true or false");
  const localName = optStr(`${path}.localName`, raw.localName, MAX_NAME);
  if (localName === undefined) bad(`${path}.localName`, "must be a string or null");
  const out: InstrumentInfo = { available: raw.available, localName };
  const en = optStr(`${path}.localNameEn`, raw.localNameEn, MAX_NAME);
  if (en !== undefined) out.localNameEn = en;
  const note = optStr(`${path}.note`, raw.note, MAX_NOTE);
  if (note !== undefined) out.note = note;
  if (raw.sourceUrl !== undefined && raw.sourceUrl !== null) out.sourceUrl = url(`${path}.sourceUrl`, raw.sourceUrl, SOURCE_URL);
  else if (raw.sourceUrl === null) out.sourceUrl = null;
  return out;
}

function cleanInstruments(raw: unknown): Record<Instrument, InstrumentInfo> {
  if (!isObj(raw)) bad("instruments", "must be an object");
  const out: Partial<Record<Instrument, InstrumentInfo>> = {};
  for (const [slot, info] of Object.entries(raw)) {
    if (!SLOT_SET.has(slot)) bad(`instruments.${slot}`, "is not a product slot");
    out[slot as Instrument] = cleanInstrument(slot, info);
  }
  for (const slot of INSTRUMENT_SLOTS) if (!out[slot]) bad(`instruments.${slot}`, "is missing (send every product slot)");
  return out as Record<Instrument, InstrumentInfo>;
}

function cleanInstitution(key: string, raw: unknown): Institution | null {
  const path = `institutions.${key}`;
  if (raw === null) return null;
  if (!isObj(raw)) bad(path, "must be an object or null");
  onlyKeys(path, raw, ["name", "url", "note"]);
  const out: Institution = { name: str(`${path}.name`, raw.name, MAX_SOURCE), url: url(`${path}.url`, raw.url, LINK_URL) };
  const note = optStr(`${path}.note`, raw.note, MAX_NOTE);
  if (note !== undefined) out.note = note;
  return out;
}

function cleanInstitutions(raw: unknown): CountryInstitutions {
  if (!isObj(raw)) bad("institutions", "must be an object");
  const out: CountryInstitutions = {};
  for (const [key, inst] of Object.entries(raw)) {
    if (!INSTITUTION_SET.has(key)) bad(`institutions.${key}`, "is not a known institution");
    if (inst === undefined) continue;
    out[key as keyof CountryInstitutions] = cleanInstitution(key, inst);
  }
  return out;
}

function cleanLanguages(raw: unknown): string[] {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_LANGUAGES) bad("languages", `must list 1 to ${MAX_LANGUAGES} language codes`);
  const seen = new Set<string>();
  for (const l of raw) {
    if (typeof l !== "string" || !LANG.test(l)) bad("languages", "must hold ISO 639 codes (two or three lower-case letters)");
    if (seen.has(l)) bad("languages", `lists "${l}" twice`);
    seen.add(l);
  }
  return [...seen];
}

/** The CountryProfile keys an admin may patch (identity code, iso3, region and schemaVersion are fixed). */
export const META_PATCH_KEYS = ["nameEn", "nameNative", "languages", "currency", "instruments", "institutions", "researchedAt", "reviewedBy"] as const satisfies readonly (keyof CountryMetaPatch)[];
const META_KEY_SET: ReadonlySet<string> = new Set(META_PATCH_KEYS);

/**
 * A meta patch with only the patchable keys, each typed and capped, and copied so no stray property
 * survives. Unknown top-level keys, null and empty patches are 400 BAD_PATCH; bad values are 400
 * INVALID_META (or INVALID_DATE for a researchedAt in the future).
 */
export function cleanMetaPatch(raw: unknown, today: string = todayUtc()): CountryMetaPatch {
  if (!isObj(raw)) throw new HttpError(400, "BAD_PATCH", "meta must be an object");
  const patch: CountryMetaPatch = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!META_KEY_SET.has(k)) throw new HttpError(400, "BAD_PATCH", `meta.${k} cannot be edited`);
    if (v === undefined) continue;
    if (v === null) throw new HttpError(400, "BAD_PATCH", `meta.${k} cannot be empty`);
    switch (k as (typeof META_PATCH_KEYS)[number]) {
      case "nameEn":
      case "nameNative":
      case "reviewedBy":
        patch[k as "nameEn"] = str(k, v, MAX_NAME);
        break;
      case "languages":
        patch.languages = cleanLanguages(v);
        break;
      case "researchedAt":
        if (!isRealDate(v)) bad("researchedAt", "must be a real date (YYYY-MM-DD)");
        assertNotFuture("meta.researchedAt", v, today, RESEARCHED_AT_LEEWAY_DAYS);
        patch.researchedAt = v;
        break;
      case "currency":
        patch.currency = cleanCurrency(v, today);
        break;
      case "instruments":
        patch.instruments = cleanInstruments(v);
        break;
      case "institutions":
        patch.institutions = cleanInstitutions(v);
        break;
    }
  }
  if (Object.keys(patch).length === 0) throw new HttpError(400, "BAD_PATCH", "meta patch is empty");
  return patch;
}

/**
 * Publish-time checks the engine validator does not make: researchedAt and every asOf not in the
 * future (a future researchedAt would make this copy look newest to every client for good), string
 * caps, and the serialised size. Throws HttpError 400.
 */
export function assertProfileLimits(p: CountryProfile, today: string = todayUtc()): void {
  assertNotFuture("researchedAt", p.researchedAt, today, RESEARCHED_AT_LEEWAY_DAYS);
  for (const k of ["nameEn", "nameNative", "reviewedBy"] as const) if (p[k].length > MAX_NAME) throw new HttpError(400, "INVALID_META", `${k} must be at most ${MAX_NAME} characters`);
  assertFieldLimits("currency.usdRate", p.currency.usdRate, today);
  for (const [key, f] of Object.entries(p.fields)) if (f) assertFieldLimits(`fields.${key}`, f, today);
  assertProfileSize(p);
}

/** UTF-8 size of the profile as stored and served. */
export function profileBytes(p: CountryProfile): number {
  return new TextEncoder().encode(JSON.stringify(p)).byteLength;
}

/** 413 PROFILE_TOO_LARGE when the serialised profile is over MAX_PROFILE_BYTES. */
export function assertProfileSize(p: CountryProfile): void {
  const n = profileBytes(p);
  if (n > MAX_PROFILE_BYTES) throw new HttpError(413, "PROFILE_TOO_LARGE", `The profile would be ${Math.ceil(n / 1024)} KB; the limit is ${MAX_PROFILE_BYTES / 1024} KB`);
}

/** Change-log note: trimmed, null when blank, 400 when over MAX_NOTE. */
export function cleanNote(body: unknown): string | null {
  const n = (body as { note?: unknown } | null)?.note;
  if (n === undefined || n === null) return null;
  if (typeof n !== "string") throw new HttpError(400, "BAD_NOTE", "note must be a string");
  const t = n.trim();
  if (t.length > MAX_NOTE) throw new HttpError(400, "BAD_NOTE", `note must be at most ${MAX_NOTE} characters`);
  return t.length > 0 ? t : null;
}

// ---- JSON field values: keep only the keys each shape knows (rates-json.ts JSON_SHAPES) ----

/** `true` keeps a scalar, an object nests, a one-element array is a list of that shape. */
type Shape = { readonly [k: string]: true | Shape | readonly [Shape] };

const BAND: Shape = { maxAge: true, low: true, high: true };
const JSON_PICK: Readonly<Record<string, Shape>> = {
  insurance_term_premium_table: { per: true, smokerMultiplier: true, bands: [BAND] },
  health_premium_table: { per: true, bands: [BAND] },
  health_cover_weights: { self: true, partner: true, child: true, parent: true },
  allocation_profiles: { careful: { e0: true, emin: true }, balanced: { e0: true, emin: true }, growth: { e0: true, emin: true } },
  old_age_allowance_eligibility: { menAge: true, womenAge: true, over90Monthly: true, meansTested: true },
  gratuity_rule: { daysPerYear: true, daysPerYearAfter: true, afterYears: true, daysPerMonth: true },
  public_pension_scheme: {
    entryAgeMin: true,
    entryAgeMax: true,
    pensionFromAge: true,
    nomineeUntilAge: true,
    inflationLinked: true,
    taxFree: true,
    projections: [{ monthlyContribution: true, years: true, monthlyPension: true }],
  },
  life_table_remaining: { rows: [{ age: true, total: true, men: true, women: true, projected: true, projectedMen: true, projectedWomen: true }] },
  support_ratio: { points: [{ year: true, value: true }] },
};

function pick(v: unknown, shape: Shape): unknown {
  if (!isObj(v)) return v;
  const out: Record<string, unknown> = {};
  for (const [k, s] of Object.entries(shape)) {
    if (!(k in v) || v[k] === undefined) continue;
    const x = v[k];
    if (s === true) out[k] = x;
    else if (Array.isArray(s)) out[k] = Array.isArray(x) ? x.map((e) => pick(e, (s as readonly [Shape])[0])) : x;
    else out[k] = pick(x, s as Shape);
  }
  return out;
}

/** A JSON figure reduced to the properties its shape knows; keys without a known shape pass through. */
export function pickJsonShape(key: string, value: unknown): unknown {
  const shape = JSON_PICK[key];
  return shape ? pick(value, shape) : value;
}
