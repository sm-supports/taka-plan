/**
 * Country reference data: one CountryProfile per country (packages/engine/src/data/countries/<CC>.json,
 * mirrored in D1). `withCountry` (overlay.ts) applies a profile to the rates snapshot, so every
 * calculator keeps reading plain rate keys.
 */
import type { RateKey } from "../rates";
import type { CountryCode, CurrencyCode, ISODate, Instrument, Locale } from "../types";

/** How a figure was obtained. `missing` = researched but not published anywhere we could find. */
export type FieldStatus = "sourced" | "assumption" | "missing";

/** World Bank regions, used for regional fallback figures. */
export const REGIONS = [
  "south_asia",
  "east_asia_pacific",
  "europe_central_asia",
  "latin_america_caribbean",
  "middle_east_north_africa",
  "north_america",
  "sub_saharan_africa",
] as const;
export type Region = (typeof REGIONS)[number];

/** One researched figure. Exactly one of `value` (numeric keys) or `valueJson` (JSON keys) is set unless status is "missing". */
export interface CountryField {
  value: number | null;
  valueJson?: unknown;
  status: FieldStatus;
  sourceName: string;
  /** https URL of the primary source; empty only when status is "missing". */
  sourceUrl: string;
  /** Date the figure refers to (YYYY-MM-DD). */
  asOf: ISODate;
  note?: string | null;
  /**
   * Only with status "missing": the research found that the thing itself does not exist in the
   * country (no gratuity law, no public pension, no old-age allowance, no term-life market), not
   * merely that no figure was published. The overlay applies it as "none" (JSON null, 0, or the
   * product slot unavailable). Without it, "missing" means "could not find it".
   */
  absent?: boolean;
}

/** How money is written in this country. Formatting itself uses Intl with the user's locale. */
export interface CurrencyInfo {
  code: CurrencyCode;
  /** Narrow symbol as written locally ("৳", "₹", "$", "€"). */
  symbol: string;
  /** Minor-unit digits (ISO 4217): 0 for JPY, 2 for USD, 3 for KWD. The app never shows minor units. */
  decimals: number;
  /** Compact style for big numbers: lakh/crore (South Asia) or Intl compact notation. */
  compact: "lakh_crore" | "intl";
  /** Local currency units per 1 US dollar; drives rounding steps and money-valued fallbacks. */
  usdRate: CountryField;
}

/** A generic product slot (see Instrument) as it exists in this country. */
export interface InstrumentInfo {
  available: boolean;
  /** Local product name in the main local language, e.g. "Sanchayapatra", "Public Provident Fund". */
  localName: string | null;
  /** Local name in English, when different from localName. */
  localNameEn?: string | null;
  note?: string | null;
  sourceUrl?: string | null;
}

/** A public body or scheme the app links to (never a company or product seller). */
export interface Institution {
  name: string;
  url: string;
  note?: string | null;
}

export interface CountryInstitutions {
  centralBank?: Institution | null;
  insuranceRegulator?: Institution | null;
  /** Where to complain about an insurer (ombudsman, regulator complaint desk). */
  insuranceComplaints?: Institution | null;
  pensionScheme?: Institution | null;
  oldAgeAllowance?: Institution | null;
  publicHealthCover?: Institution | null;
  depositInsurance?: Institution | null;
  statistics?: Institution | null;
}

export interface CountryProfile {
  schemaVersion: 1;
  /** ISO 3166-1 alpha-2, upper case. */
  code: CountryCode;
  /** ISO 3166-1 alpha-3, upper case. */
  iso3: string;
  nameEn: string;
  /** Name in the main local language and script. */
  nameNative: string;
  region: Region;
  /** ISO 639-1 (two-letter) or, for languages without one, ISO 639-3 (three-letter) codes of widely used languages, most used first (official or not). */
  languages: string[];
  currency: CurrencyInfo;
  /** Researched figures by rate key (see COUNTRY_FIELD_KEYS). Keys not listed fall back (overlay.ts). */
  fields: Partial<Record<RateKey, CountryField>>;
  instruments: Record<Instrument, InstrumentInfo>;
  institutions: CountryInstitutions;
  /** When the research for this profile was last done. */
  researchedAt: ISODate;
  reviewedBy: string;
}

/** Small entry for the country picker (data/countries/index.json). */
export interface CountryIndexEntry {
  code: CountryCode;
  nameEn: string;
  nameNative: string;
  region: Region;
  currency: CurrencyCode;
  languages: string[];
  /** UI locales the app can offer for this country (country languages that are translated, plus "en"). */
  locales: Locale[];
}

/** Rounding steps in local currency units (BDT: 500 / 100 / 100 / 1). */
export interface RoundingSteps {
  lump: number;
  monthly: number;
  interest: number;
  exact: number;
}

/** What the engine and UI need to know about the selected country, attached to the rates snapshot. */
export interface CountryContext {
  code: CountryCode;
  nameEn: string;
  region: Region;
  currency: Omit<CurrencyInfo, "usdRate"> & { usdRate: number };
  rounding: RoundingSteps;
  /** Product slots that do not exist in this country; calculators skip them. */
  unavailable: Instrument[];
  /** Local product names by slot, for display. */
  instrumentNames: Partial<Record<Instrument, { local: string | null; en: string | null }>>;
  /** Rate keys that only apply to Bangladesh (tax slabs, Sanchayapatra tiers, ...); hidden in the UI. */
  notApplicable: RateKey[];
  /** Rate keys whose figure is a regional or converted fallback rather than this country's own. */
  fallbackKeys: RateKey[];
  institutions: CountryInstitutions;
}

/** Keys of data/countries/_regions.json: every region, plus "global" (the median over all countries). */
export const REGION_DEFAULT_KEYS = [...REGIONS, "global"] as const;
export type RegionDefaultKey = (typeof REGION_DEFAULT_KEYS)[number];

/**
 * Regional fallback figures (data/countries/_regions.json, written by scripts/gen-region-defaults.mjs):
 * per-region and global medians of the sourced figures. Money-valued figures (unit "bdt") are in
 * US dollars here; the overlay converts them with each country's dollar rate.
 */
export type RegionDefaults = Partial<Record<RegionDefaultKey, Partial<Record<RateKey, CountryField>>>>;
