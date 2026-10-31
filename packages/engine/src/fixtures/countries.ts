/**
 * Hand-made country profiles for tests and demo screens only. Figures are illustrative, marked
 * "assumption" with the fixture source; the shipped data lives in data/countries/*.json.
 */
import type { CountryField, CountryProfile, InstrumentInfo } from "../country/types";
import type { Instrument } from "../types";

const FIXTURE = { sourceName: "Test fixture (illustrative)", sourceUrl: "docs/ARCHITECTURE.md", asOf: "2026-10-30" } as const;

function f(value: number, note?: string): CountryField {
  return { value, status: "assumption", ...FIXTURE, ...(note ? { note } : {}) };
}

function j(valueJson: unknown): CountryField {
  return { value: null, valueJson, status: "assumption", ...FIXTURE };
}

const MISSING: CountryField = { value: null, status: "missing", sourceName: "", sourceUrl: "", asOf: "2026-10-30" };

function instruments(over: Partial<Record<Instrument, InstrumentInfo>>): Record<Instrument, InstrumentInfo> {
  const all: Instrument[] = ["savings_account", "fdr_3m", "fdr_1y", "dps", "sanchayapatra_5y", "tbill_91d", "tbond_5y", "tbond_10y", "equity_fund", "gold"];
  return Object.fromEntries(all.map((i) => [i, over[i] ?? { available: true, localName: null }])) as Record<Instrument, InstrumentInfo>;
}

/** Bangladesh: identity profile (the rates seed is the source of truth for BD figures). */
export const FIXTURE_BD: CountryProfile = {
  schemaVersion: 1,
  code: "BD",
  iso3: "BGD",
  nameEn: "Bangladesh",
  nameNative: "বাংলাদেশ",
  region: "south_asia",
  languages: ["bn", "en"],
  currency: { code: "BDT", symbol: "৳", decimals: 2, compact: "lakh_crore", usdRate: f(122) },
  fields: {},
  instruments: instruments({
    dps: { available: true, localName: "ডিপিএস", localNameEn: "DPS" },
    fdr_1y: { available: true, localName: "এফডিআর", localNameEn: "FDR" },
    fdr_3m: { available: true, localName: "এফডিআর", localNameEn: "FDR" },
    sanchayapatra_5y: { available: true, localName: "সঞ্চয়পত্র", localNameEn: "Sanchayapatra" },
  }),
  institutions: {
    centralBank: { name: "Bangladesh Bank", url: "https://www.bb.org.bd/" },
    insuranceRegulator: { name: "Insurance Development and Regulatory Authority", url: "https://idra.org.bd/" },
    pensionScheme: { name: "Universal Pension Scheme", url: "https://www.upension.gov.bd/" },
  },
  researchedAt: "2026-10-30",
  reviewedBy: "fixture",
};

/** India: lakh/crore currency, a different savings certificate, no recurring-deposit gap. */
export const FIXTURE_IN: CountryProfile = {
  schemaVersion: 1,
  code: "IN",
  iso3: "IND",
  nameEn: "India",
  nameNative: "भारत",
  region: "south_asia",
  languages: ["hi", "en", "bn"],
  currency: { code: "INR", symbol: "₹", decimals: 2, compact: "lakh_crore", usdRate: f(84) },
  fields: {
    inflation_cpi: f(0.045),
    inflation_projection: f(0.045),
    fdr_1y_rate: f(0.067),
    sanchayapatra_5y_rate: f(0.077, "National Savings Certificate"),
    tbill_91d_rate: f(0.065),
    tax_bank_interest: f(0.1),
    oop_health_share: f(0.5),
    life_expectancy: f(70.9),
    health_hospitalisation_cost: f(250000),
    retirement_age_default: f(58),
    equity_return_base: f(0.11),
    deposit_insurance_limit: f(500000),
    gratuity_rule: j({ daysPerYear: 15, daysPerYearAfter: null, afterYears: null, daysPerMonth: 26 }),
    insurance_term_premium_table: MISSING,
  },
  instruments: instruments({
    sanchayapatra_5y: { available: true, localName: "राष्ट्रीय बचत पत्र", localNameEn: "National Savings Certificate" },
    dps: { available: true, localName: "आवर्ती जमा", localNameEn: "Recurring deposit" },
  }),
  institutions: { insuranceRegulator: { name: "IRDAI", url: "https://irdai.gov.in/" } },
  researchedAt: "2026-10-30",
  reviewedBy: "fixture",
};

/** United States: dollar, no government savings certificate slot used, no gratuity law. */
export const FIXTURE_US: CountryProfile = {
  schemaVersion: 1,
  code: "US",
  iso3: "USA",
  nameEn: "United States",
  nameNative: "United States",
  region: "north_america",
  languages: ["en", "es"],
  currency: { code: "USD", symbol: "$", decimals: 2, compact: "intl", usdRate: f(1) },
  fields: {
    inflation_cpi: f(0.03),
    inflation_projection: f(0.025),
    fdr_1y_rate: f(0.04),
    tbill_91d_rate: f(0.042),
    tax_bank_interest: f(0.22, "Federal marginal rate for a middle earner"),
    oop_health_share: f(0.11),
    life_expectancy: f(77.5),
    health_hospitalisation_cost: f(15000),
    retirement_age_default: f(67),
    old_age_allowance_monthly: f(0),
    gratuity_rule: MISSING,
  },
  instruments: instruments({
    sanchayapatra_5y: { available: true, localName: "I bonds", localNameEn: "Series I savings bonds" },
    dps: { available: false, localName: null },
  }),
  institutions: { insuranceRegulator: { name: "NAIC", url: "https://content.naic.org/" } },
  researchedAt: "2026-10-30",
  reviewedBy: "fixture",
};

export const FIXTURE_COUNTRIES = { BD: FIXTURE_BD, IN: FIXTURE_IN, US: FIXTURE_US } as const;
