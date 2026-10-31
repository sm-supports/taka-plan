/**
 * Which rate keys a country profile may set, and what each one means for research.
 * The research workflow, the validator, the D1 country tables and the admin editor all read this list.
 */
import type { RateKey } from "../rates";

export type FieldKind =
  /** Published fact for the country (central bank, statistics office, regulator, WHO, World Bank, UN). */
  | "fact"
  /** Our assumption for the country (forward-looking returns); status "assumption" with reasoning in note. */
  | "assumption";

export interface FieldSpec {
  key: RateKey;
  kind: FieldKind;
  /** What to find, in plain words, for the researcher. */
  research: string;
  /** Preferred global sources, tried before country sources. */
  preferredSources?: string[];
}

/** Rate keys a country profile can override. Every other key is app policy or Bangladesh-only. */
export const COUNTRY_FIELDS: readonly FieldSpec[] = [
  // macro
  { key: "inflation_cpi", kind: "fact", research: "Latest year-on-year consumer price inflation (decimal).", preferredSources: ["national statistics office", "IMF", "World Bank FP.CPI.TOTL.ZG"] },
  { key: "inflation_projection", kind: "assumption", research: "Long-run inflation to plan with: the central bank target if credible, else a rounded 5-year average." },
  { key: "policy_rate", kind: "fact", research: "Central bank policy rate (decimal)." },
  // deposits
  { key: "savings_account_rate", kind: "fact", research: "Typical interest rate on an ordinary savings account at large banks." },
  { key: "fdr_3m_rate", kind: "fact", research: "Typical 3-month term (fixed) deposit rate at large banks." },
  { key: "fdr_1y_rate", kind: "fact", research: "Typical 1-year term (fixed) deposit rate at large banks." },
  { key: "dps_rate", kind: "fact", research: "Typical rate on a monthly recurring deposit (5-year), if banks offer one." },
  { key: "bank_deposit_avg_rate", kind: "fact", research: "Weighted average deposit rate across banks.", preferredSources: ["central bank", "World Bank FR.INR.DPST"] },
  // government savings and securities
  { key: "sanchayapatra_5y_rate", kind: "fact", research: "Rate of the government savings certificate or retail savings bond sold to individuals (about 5 years), with its local name in instruments.sanchayapatra_5y." },
  { key: "tbill_91d_rate", kind: "fact", research: "Latest 91-day (3-month) treasury bill yield." },
  { key: "tbond_5y_rate", kind: "fact", research: "Latest 5-year government bond yield." },
  { key: "tbond_10y_rate", kind: "fact", research: "Latest 10-year government bond yield." },
  { key: "tax_bank_interest", kind: "fact", research: "Withholding or flat tax rate on bank interest for resident individuals (decimal; 0 if none)." },
  { key: "tax_sanchayapatra_profit", kind: "fact", research: "Tax rate on returns from the government savings certificate (decimal; 0 if exempt)." },
  { key: "deposit_insurance_limit", kind: "fact", research: "Deposit insurance cover per depositor per bank, in local currency (0 if no scheme)." },
  { key: "credit_card_rate_cap", kind: "fact", research: "Legal cap or typical annual rate on credit card balances." },
  // equity and gold
  { key: "equity_return_low", kind: "assumption", research: "Low-case long-run local equity return in local currency, based on the main index's 10-year total return; never above the base." },
  { key: "equity_return_base", kind: "assumption", research: "Base-case long-run local equity return in local currency; no higher than the safe rate plus a modest premium if the local index record is weak." },
  { key: "equity_return_high", kind: "assumption", research: "High-case long-run local equity return in local currency." },
  { key: "gold_return_low", kind: "assumption", research: "Low-case long-run gold return in local currency." },
  { key: "gold_return_base", kind: "assumption", research: "Base-case long-run gold return in local currency (dollar gold trend plus expected currency depreciation)." },
  { key: "gold_return_high", kind: "assumption", research: "High-case long-run gold return in local currency." },
  { key: "fixed_income_return_low", kind: "assumption", research: "Low-case after-tax return on safe fixed income (deposits, bills, savings certificates)." },
  { key: "fixed_income_return_base", kind: "assumption", research: "Base-case after-tax return on safe fixed income." },
  { key: "fixed_income_return_high", kind: "assumption", research: "High-case after-tax return on safe fixed income." },
  // insurance and health
  { key: "life_claim_settlement_rate", kind: "fact", research: "Life insurance claim settlement ratio (share of claims paid), from the insurance regulator, industry-wide." },
  { key: "insurance_term_premium_table", kind: "fact", research: "Indicative yearly premium for pure term life cover per 1,000 local currency of cover, non-smoker, for ages up to 30, 40, 50 and 65 (low and high), plus the smoker multiplier. Same JSON shape as Bangladesh. If term life is not sold, status missing." },
  { key: "health_hospitalisation_cost", kind: "fact", research: "Typical out-of-pocket cost of one major hospital stay (surgery or 5+ nights) at a private or mid-range hospital, local currency." },
  { key: "health_premium_table", kind: "fact", research: "Indicative yearly private health insurance premium per 100,000 local currency of cover by age band (low and high). Same JSON shape as Bangladesh." },
  { key: "oop_health_share", kind: "fact", research: "Out-of-pocket share of current health expenditure (decimal).", preferredSources: ["World Bank SH.XPD.OOPC.CH.ZS", "WHO GHED"] },
  { key: "goal_inflation_health", kind: "assumption", research: "Medical cost inflation to plan with (decimal); published medical CPI if available." },
  { key: "goal_inflation_education", kind: "assumption", research: "Education cost inflation to plan with (decimal); published education CPI if available." },
  // longevity and retirement
  { key: "life_expectancy", kind: "fact", research: "Life expectancy at birth, both sexes (years).", preferredSources: ["UN WPP", "World Bank SP.DYN.LE00.IN"] },
  { key: "life_table_remaining", kind: "fact", research: "Remaining life expectancy at ages 60, 65, 70 and 80, total and by sex where available. Same JSON shape as Bangladesh.", preferredSources: ["UN WPP", "WHO GHO life tables"] },
  { key: "support_ratio", kind: "fact", research: "Working-age people (15–64) per person 65+, now and projected for 2040 and 2065. Same JSON shape as Bangladesh.", preferredSources: ["UN WPP"] },
  { key: "retirement_age_default", kind: "fact", research: "Statutory or normal pension age for private-sector workers (men if it differs; note women's age)." },
  { key: "retirement_age_government", kind: "fact", research: "Retirement age for government employees." },
  { key: "retirement_return_low", kind: "assumption", research: "Low-case after-tax return in retirement (mostly safe instruments)." },
  { key: "retirement_return_base", kind: "assumption", research: "Base-case after-tax return in retirement; no higher than the safe rate after tax." },
  { key: "retirement_return_high", kind: "assumption", research: "High-case after-tax return in retirement." },
  { key: "retirement_accumulation_return_low", kind: "assumption", research: "Low-case return before retirement on a balanced long-term mix." },
  { key: "retirement_accumulation_return_base", kind: "assumption", research: "Base-case return before retirement on a balanced long-term mix." },
  { key: "retirement_accumulation_return_high", kind: "assumption", research: "High-case return before retirement on a balanced long-term mix." },
  { key: "old_age_allowance_monthly", kind: "fact", research: "Monthly amount of the basic non-contributory old-age (social) pension, local currency (0 if none)." },
  { key: "old_age_allowance_eligibility", kind: "fact", research: "Eligibility ages (men, women) and whether means-tested, for the non-contributory old-age pension. Same JSON shape as Bangladesh." },
  { key: "gratuity_rule", kind: "fact", research: "Statutory gratuity or end-of-service benefit for private employees: days of last wages per year of service, and any higher rate after N years. Same JSON shape as Bangladesh; status missing if no such law." },
  { key: "public_pension_scheme", kind: "fact", research: "Main public or universal contributory pension: entry ages, pension age, whether inflation-linked, tax treatment, and any official projection examples. Same JSON shape as Bangladesh." },
] as const;

export const COUNTRY_FIELD_KEYS: readonly RateKey[] = COUNTRY_FIELDS.map((f) => f.key);

/** Rate keys that describe Bangladeshi rules only. Other countries keep the row (the snapshot needs every key) but the UI hides it. */
export const BANGLADESH_ONLY_KEYS: readonly RateKey[] = [
  "sanchayapatra_5y_rate_above_cap",
  "sanchayapatra_tier_cap",
  "sanchayapatra_5y_year1_rate",
  "paribar_sanchayapatra_5y_rate",
  "pensioner_sanchayapatra_5y_rate",
  "pensioner_sanchayapatra_cap",
  "sanchayapatra_3m_profit_3y_rate",
  "gold_22k_per_bhori",
  "ups_return_fy2526",
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
  "tax_bank_interest_no_return",
  "proof_of_return_threshold",
] as const;
