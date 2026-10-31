/**
 * Applies a country to the rates snapshot. Calculators keep reading plain rate keys; this decides
 * which figure each key holds for the selected country:
 *
 *   1. the country's own researched field (status sourced or assumption);
 *   2. else the regional fallback (data/countries/_regions.json), flagged as an assumption;
 *   3. else, for money-valued keys, the Bangladesh figure converted at the exchange rate, flagged;
 *   4. else the base row unchanged (app policy, the same everywhere: emergency months, shares, ...).
 *
 * Bangladesh is the identity: its figures are the base snapshot itself, edited in the rates admin.
 */
import { LOCALES, type Instrument, type Locale } from "../types";
import type { RateKey, RateRow, RatesSnapshot } from "../rates";
import { BANGLADESH_ONLY_KEYS, COUNTRY_FIELD_KEYS } from "./fields";
import type { CountryContext, CountryField, CountryIndexEntry, CountryProfile, RegionDefaults, RoundingSteps } from "./types";

/** Taka rounding (money.ts): ৳500 lump, ৳100 monthly and interest, ৳1 exact. */
export const BDT_ROUNDING: RoundingSteps = { lump: 500, monthly: 100, interest: 100, exact: 1 };

/** The country whose figures are the base snapshot itself. */
export const BASE_COUNTRY = "BD";

/**
 * Keys where "missing" means the thing does not exist in the country (no term-life market, no
 * gratuity law, no public pension scheme, no old-age allowance), not that a figure is unknown.
 * For these an explicit `missing` from the research is applied as "none" (JSON null / 0) instead
 * of falling back to a regional or Bangladesh figure.
 */
export const ABSENCE_MEANS_NONE: readonly RateKey[] = [
  "insurance_term_premium_table",
  "health_premium_table",
  "gratuity_rule",
  "public_pension_scheme",
  "old_age_allowance_monthly",
  "old_age_allowance_eligibility",
];

/** Largest 1, 2 or 5 × 10^k that is ≤ x (never below 1). */
export function niceStep(x: number): number {
  if (!Number.isFinite(x) || x <= 1) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  const m = x / p;
  return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p;
}

/**
 * Rounding steps for a currency from its US-dollar rate: monthly ≈ 1 USD, lump ≈ 5 USD.
 * BDT at about 122 per dollar gives 100 and 500, matching the taka steps.
 */
export function roundingForUsdRate(usdRate: number): RoundingSteps {
  const monthly = niceStep(usdRate);
  return { lump: niceStep(usdRate * 5), monthly, interest: monthly, exact: 1 };
}

/** Rounding steps of the snapshot's country (taka steps when no country is applied). */
export function roundingFor(s: Pick<RatesSnapshot, "country">): RoundingSteps {
  return s.country?.rounding ?? BDT_ROUNDING;
}

function fieldUsable(f: CountryField | undefined): boolean {
  if (!f || f.status === "missing") return false;
  return (f.value !== null && f.value !== undefined) || (f.valueJson !== undefined && f.valueJson !== null);
}

function rowFromField(base: RateRow, f: CountryField, extraNote?: string): RateRow {
  const note = [f.note, extraNote].filter(Boolean).join(" ") || null;
  return {
    ...base,
    value: base.unit === "json" ? null : (f.value ?? null),
    valueJson: base.unit === "json" ? f.valueJson : undefined,
    sourceName: f.sourceName,
    sourceUrl: f.sourceUrl,
    asOf: f.asOf,
    note,
    isAppAssumption: f.status === "assumption" || extraNote !== undefined,
    rangeLow: null,
    rangeHigh: null,
  };
}

/** UI locales for a country: its languages that the app translates, then English. */
export function localesForLanguages(languages: readonly string[]): Locale[] {
  const out: Locale[] = [];
  for (const l of languages) if ((LOCALES as readonly string[]).includes(l) && l !== "en" && !out.includes(l as Locale)) out.push(l as Locale);
  out.push("en");
  return out;
}

export function indexEntryFor(p: CountryProfile): CountryIndexEntry {
  return { code: p.code, nameEn: p.nameEn, nameNative: p.nameNative, region: p.region, currency: p.currency.code, languages: p.languages, locales: localesForLanguages(p.languages) };
}

/**
 * The snapshot the calculators read for country `profile`. `base` is the published Bangladesh
 * snapshot; `bdUsdRate` is taka per dollar (from the BD profile) for converting money fallbacks.
 */
export function withCountry(base: RatesSnapshot, profile: CountryProfile, opts: { regions?: RegionDefaults; bdUsdRate: number }): RatesSnapshot {
  const usdRate = profile.currency.usdRate.value ?? opts.bdUsdRate;
  const rows = { ...base.rows } as Record<RateKey, RateRow>;
  const fallbackKeys: RateKey[] = [];
  const isBase = profile.code === BASE_COUNTRY;

  if (!isBase) {
    const regional = opts.regions?.[profile.region] ?? {};
    for (const key of COUNTRY_FIELD_KEYS) {
      const own = profile.fields[key];
      const baseRow = base.rows[key];
      if (fieldUsable(own)) {
        rows[key] = rowFromField(baseRow, own as CountryField);
        continue;
      }
      if (own?.status === "missing" && ABSENCE_MEANS_NONE.includes(key)) {
        rows[key] = {
          ...baseRow,
          value: baseRow.unit === "json" ? null : 0,
          valueJson: baseRow.unit === "json" ? null : undefined,
          sourceName: own.sourceName || "Country research",
          sourceUrl: own.sourceUrl || baseRow.sourceUrl,
          asOf: own.asOf,
          isAppAssumption: false,
          note: [own.note, `None found for ${profile.nameEn}.`].filter(Boolean).join(" "),
          rangeLow: null,
          rangeHigh: null,
        };
        continue;
      }
      const reg = regional[key];
      if (fieldUsable(reg)) {
        rows[key] = rowFromField(baseRow, reg as CountryField, `Regional figure for ${profile.region.replace(/_/g, " ")}; ${profile.nameEn} publishes none we could find.`);
        fallbackKeys.push(key);
        continue;
      }
      if (baseRow.unit === "bdt" && baseRow.value !== null) {
        rows[key] = { ...baseRow, value: Math.round((baseRow.value * usdRate) / opts.bdUsdRate), isAppAssumption: true, note: `Bangladesh figure converted at ${usdRate} ${profile.currency.code} per US dollar.` };
        fallbackKeys.push(key);
        continue;
      }
      // No figure anywhere: keep the base row, flagged.
      rows[key] = { ...baseRow, isAppAssumption: true, note: `No figure found for ${profile.nameEn}; Bangladesh value shown.` };
      fallbackKeys.push(key);
    }
    // App-policy money thresholds are scaled to the local currency.
    for (const [key, row] of Object.entries(base.rows) as [RateKey, RateRow][]) {
      if (row.unit !== "bdt" || COUNTRY_FIELD_KEYS.includes(key) || BANGLADESH_ONLY_KEYS.includes(key) || row.value === null) continue;
      rows[key] = { ...row, value: Math.round((row.value * usdRate) / opts.bdUsdRate), note: [row.note, `Converted from taka at ${usdRate} ${profile.currency.code} per US dollar.`].filter(Boolean).join(" ") };
    }
  }

  const unavailable = (Object.entries(profile.instruments) as [Instrument, CountryProfile["instruments"][Instrument]][]).filter(([, v]) => !v.available).map(([k]) => k);
  const instrumentNames: CountryContext["instrumentNames"] = {};
  for (const [k, v] of Object.entries(profile.instruments) as [Instrument, CountryProfile["instruments"][Instrument]][]) {
    if (v.available && v.localName) instrumentNames[k] = { local: v.localName, en: v.localNameEn ?? null };
  }

  const country: CountryContext = {
    code: profile.code,
    nameEn: profile.nameEn,
    region: profile.region,
    currency: { code: profile.currency.code, symbol: profile.currency.symbol, decimals: profile.currency.decimals, compact: profile.currency.compact, usdRate },
    rounding: isBase ? BDT_ROUNDING : roundingForUsdRate(usdRate),
    unavailable,
    instrumentNames,
    notApplicable: isBase ? [] : [...BANGLADESH_ONLY_KEYS],
    fallbackKeys,
    institutions: profile.institutions,
  };
  return { ...base, rows, country };
}
