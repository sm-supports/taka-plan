import { EngineError, type ISODate, type Instrument, type Rate } from "./types";

/** Every assumption the engine may read. Keep in sync with data/rates.seed.json (rates.test.ts asserts it). */
export const RATE_KEYS = [
  // macro
  "inflation_cpi",
  "inflation_projection",
  "policy_rate",
  // bank products
  "savings_account_rate",
  "fdr_3m_rate",
  "fdr_1y_rate",
  "dps_rate",
  "bank_deposit_avg_rate",
  // national savings certificates
  "sanchayapatra_5y_rate",
  "sanchayapatra_5y_rate_above_cap",
  "sanchayapatra_tier_cap",
  "sanchayapatra_5y_year1_rate",
  "paribar_sanchayapatra_5y_rate",
  "pensioner_sanchayapatra_5y_rate",
  "sanchayapatra_3m_profit_3y_rate",
  // government securities
  "tbill_91d_rate",
  "tbond_5y_rate",
  "tbond_10y_rate",
  // equity and gold (M6)
  "equity_return_low",
  "equity_return_base",
  "equity_return_high",
  "gold_return_base",
  "gold_22k_per_bhori",
  // credit, insurance, health, longevity
  "credit_card_rate_cap",
  "deposit_insurance_limit",
  "life_claim_settlement_rate",
  "oop_health_share",
  "life_expectancy",
  "plan_to_age",
  "ups_return_fy2526",
  // tax FY2026-27
  "tax_free_threshold_general",
  "tax_free_threshold_women_senior",
  "tax_slabs",
  "min_tax",
  "min_tax_new",
  "rebate_share_of_income",
  "rebate_share_of_investment",
  "rebate_cap",
  "rebate_dps_cap",
  "rebate_govt_securities_cap",
  "tax_sanchayapatra_profit",
  "tax_bank_interest",
  "tax_bank_interest_no_return",
  "proof_of_return_threshold",
  // app policy: M1
  "emergency_base_months",
  "emergency_bump_irregular_income",
  "emergency_bump_sole_earner",
  "emergency_bump_no_health_insurance",
  "emergency_min_months",
  "emergency_max_months",
  "emergency_build_months_default",
  "emergency_large_buffer_threshold",
  // app policy: M3
  "cash_buffer_share",
  "card_min_payment_share",
  "emi_ratio_red",
  "card_utilisation_amber",
  "high_interest_debt_threshold",
  "personal_loan_rate_default",
  // app policy: M4, plan, M5
  "savings_rate_default",
  "plan_emergency_min_share",
  "debt_payoff_target_months",
  "goal_inflation_education",
  "goal_inflation_health",
] as const;

export type RateKey = (typeof RATE_KEYS)[number];

export type RateUnit = "rate" | "bdt" | "years" | "months" | "ratio" | "json";

export interface RateRow {
  key: RateKey;
  /** Numeric value, or null when the row is JSON-valued (see `valueJson`). */
  value: number | null;
  valueJson?: unknown;
  unit: RateUnit;
  /** Market range the default was chosen from, when one exists. */
  rangeLow?: number | null;
  rangeHigh?: number | null;
  labelEn: string;
  labelBn?: string | null;
  sourceName: string;
  sourceUrl: string;
  asOf: ISODate;
  reviewedBy: string;
  nextReview: ISODate;
  note?: string | null;
  /** True for rows we chose ourselves (policy defaults), shown with an "our assumption" tag. */
  isAppAssumption: boolean;
}

export interface RatesSnapshot {
  version: number;
  publishedAt: ISODate;
  rows: Record<RateKey, RateRow>;
}

export interface TaxSlab {
  /** Width of the slab in taka; null for the open-ended top slab. */
  width: number | null;
  rate: Rate;
}

const RATE_KEY_SET: ReadonlySet<string> = new Set(RATE_KEYS);

export function isRateKey(x: string): x is RateKey {
  return RATE_KEY_SET.has(x);
}

export function getRow(s: RatesSnapshot, key: RateKey): RateRow {
  const row = s.rows[key];
  if (!row) throw new EngineError("MISSING_RATE", `Rates table has no row "${key}"`, { key, version: s.version });
  return row;
}

/** Numeric value of a row. Throws MISSING_RATE for absent or JSON-only rows. */
export function getRate(s: RatesSnapshot, key: RateKey): number {
  const row = getRow(s, key);
  if (row.value === null || row.value === undefined || !Number.isFinite(row.value)) {
    throw new EngineError("MISSING_RATE", `Rates row "${key}" has no numeric value`, { key, version: s.version });
  }
  return row.value;
}

export function getTaxSlabs(s: RatesSnapshot): TaxSlab[] {
  const row = getRow(s, "tax_slabs");
  const slabs = row.valueJson;
  if (!Array.isArray(slabs)) throw new EngineError("MISSING_RATE", "tax_slabs row has no JSON value");
  return slabs as TaxSlab[];
}

/** Nominal after a flat withholding tax on the return: n × (1 − tax). */
export function afterTax(nominal: Rate, tax: Rate): Rate {
  return nominal * (1 - tax);
}

/** Fisher real return: (1 + n) / (1 + i) − 1. */
export function realReturn(nominal: Rate, inflation: Rate): Rate {
  return (1 + nominal) / (1 + inflation) - 1;
}

const INSTRUMENT_KEYS: Record<Instrument, { rateKey: RateKey; taxKey: RateKey }> = {
  savings_account: { rateKey: "savings_account_rate", taxKey: "tax_bank_interest" },
  fdr_3m: { rateKey: "fdr_3m_rate", taxKey: "tax_bank_interest" },
  fdr_1y: { rateKey: "fdr_1y_rate", taxKey: "tax_bank_interest" },
  dps: { rateKey: "dps_rate", taxKey: "tax_bank_interest" },
  sanchayapatra_5y: { rateKey: "sanchayapatra_5y_rate", taxKey: "tax_sanchayapatra_profit" },
  tbill_91d: { rateKey: "tbill_91d_rate", taxKey: "tax_bank_interest" },
  tbond_5y: { rateKey: "tbond_5y_rate", taxKey: "tax_bank_interest" },
  tbond_10y: { rateKey: "tbond_10y_rate", taxKey: "tax_bank_interest" },
  // M6: equity and gold returns are modelled as total return with no withholding tax applied here.
  equity_fund: { rateKey: "equity_return_base", taxKey: "tax_bank_interest" },
  gold: { rateKey: "gold_return_base", taxKey: "tax_bank_interest" },
};

export function instrumentKeys(i: Instrument): { rateKey: RateKey; taxKey: RateKey } {
  return INSTRUMENT_KEYS[i];
}

export function instrumentNominal(s: RatesSnapshot, i: Instrument): { rate: Rate; rateKey: RateKey; taxKey: RateKey } {
  const { rateKey, taxKey } = INSTRUMENT_KEYS[i];
  return { rate: getRate(s, rateKey), rateKey, taxKey };
}

export function instrumentAfterTax(s: RatesSnapshot, i: Instrument): Rate {
  const { rate, taxKey } = instrumentNominal(s, i);
  if (i === "equity_fund" || i === "gold") return rate;
  return afterTax(rate, getRate(s, taxKey));
}

export function instrumentReal(s: RatesSnapshot, i: Instrument, inflationKey: RateKey = "inflation_cpi"): Rate {
  return realReturn(instrumentAfterTax(s, i), getRate(s, inflationKey));
}

/** A row is stale once today is past its next-review date. */
export function isStale(row: RateRow, today: ISODate): boolean {
  return row.nextReview < today;
}

export function staleKeys(s: RatesSnapshot, today: ISODate): RateKey[] {
  return RATE_KEYS.filter((k) => s.rows[k] !== undefined && isStale(s.rows[k], today));
}

const UNITS: ReadonlySet<string> = new Set(["rate", "bdt", "years", "months", "ratio", "json"]);
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Runtime validation for snapshots arriving from the API, localStorage or the admin draft. */
export function assertSnapshot(x: unknown): RatesSnapshot {
  if (typeof x !== "object" || x === null) throw new EngineError("INVALID_INPUT", "snapshot is not an object");
  const s = x as Partial<RatesSnapshot>;
  if (typeof s.version !== "number" || !Number.isInteger(s.version) || s.version < 1) throw new EngineError("INVALID_INPUT", "snapshot.version must be a positive integer");
  if (typeof s.publishedAt !== "string" || !ISO.test(s.publishedAt)) throw new EngineError("INVALID_INPUT", "snapshot.publishedAt must be YYYY-MM-DD");
  if (typeof s.rows !== "object" || s.rows === null) throw new EngineError("INVALID_INPUT", "snapshot.rows missing");
  const rows = s.rows as Record<string, unknown>;
  const missing = RATE_KEYS.filter((k) => rows[k] === undefined);
  if (missing.length) throw new EngineError("INVALID_INPUT", `snapshot is missing rows: ${missing.join(", ")}`, { missing });
  for (const [key, raw] of Object.entries(rows)) {
    if (!isRateKey(key)) throw new EngineError("INVALID_INPUT", `unknown rates key "${key}"`, { key });
    const r = raw as Partial<RateRow>;
    const bad = (field: string) => new EngineError("INVALID_INPUT", `row "${key}": bad ${field}`, { key, field });
    if (r.key !== key) throw bad("key");
    if (!UNITS.has(String(r.unit))) throw bad("unit");
    const hasValue = typeof r.value === "number" && Number.isFinite(r.value);
    if (!hasValue && r.valueJson === undefined) throw bad("value");
    if (r.unit === "json" && r.valueJson === undefined) throw bad("valueJson");
    for (const f of ["labelEn", "sourceName", "sourceUrl", "reviewedBy"] as const) if (typeof r[f] !== "string" || r[f].length === 0) throw bad(f);
    for (const f of ["asOf", "nextReview"] as const) if (typeof r[f] !== "string" || !ISO.test(r[f])) throw bad(f);
    if (typeof r.isAppAssumption !== "boolean") throw bad("isAppAssumption");
    for (const f of ["rangeLow", "rangeHigh"] as const) if (r[f] !== undefined && r[f] !== null && typeof r[f] !== "number") throw bad(f);
  }
  return s as RatesSnapshot;
}
