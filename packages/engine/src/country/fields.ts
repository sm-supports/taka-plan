/**
 * Which rate keys a country profile may set, and what each one means for research.
 * The research workflow, the validator, the D1 country tables and the admin editor all read this list.
 */
import type { RateKey } from "../rates";
import type { Instrument } from "../types";

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

/**
 * Neutral row labels for every country field, used outside Bangladesh so no Bangladeshi name
 * ("Bangladesh Bank", "Sanchayapatra", "FDR", "DPS", "Universal Pension Scheme") leaks into
 * another country's rates. Bangladesh keeps the labels of its own rates table.
 */
export const NEUTRAL_LABELS: Readonly<Partial<Record<RateKey, { en: string; bn: string }>>> = {
  inflation_cpi: { en: "Inflation (consumer prices, year on year)", bn: "মূল্যস্ফীতি (ভোক্তা মূল্য, বছরওয়ারি)" },
  inflation_projection: { en: "Inflation used for projections", bn: "প্রক্ষেপণে ব্যবহৃত মূল্যস্ফীতি" },
  policy_rate: { en: "Central bank policy rate", bn: "কেন্দ্রীয় ব্যাংকের নীতি সুদহার" },
  savings_account_rate: { en: "Savings account interest", bn: "সেভিংস অ্যাকাউন্ট সুদ" },
  fdr_3m_rate: { en: "Term deposit, 3 months", bn: "মেয়াদি আমানত, ৩ মাস" },
  fdr_1y_rate: { en: "Term deposit, 1 year", bn: "মেয়াদি আমানত, ১ বছর" },
  dps_rate: { en: "Monthly recurring deposit", bn: "মাসিক কিস্তির সঞ্চয় (রেকারিং ডিপোজিট)" },
  bank_deposit_avg_rate: { en: "Average bank deposit rate", bn: "গড় ব্যাংক আমানত সুদহার" },
  sanchayapatra_5y_rate: { en: "Government savings certificate, about 5 years", bn: "সরকারি সঞ্চয় সার্টিফিকেট, প্রায় ৫ বছর" },
  tbill_91d_rate: { en: "Treasury bill, 3 months", bn: "ট্রেজারি বিল, ৩ মাস" },
  tbond_5y_rate: { en: "Government bond, 5 years", bn: "সরকারি বন্ড, ৫ বছর" },
  tbond_10y_rate: { en: "Government bond, 10 years", bn: "সরকারি বন্ড, ১০ বছর" },
  tax_bank_interest: { en: "Tax on bank interest", bn: "ব্যাংক সুদের উপর কর" },
  tax_sanchayapatra_profit: { en: "Tax on savings-certificate returns", bn: "সঞ্চয় সার্টিফিকেটের মুনাফার উপর কর" },
  deposit_insurance_limit: { en: "Deposit insurance per depositor, per bank", bn: "আমানত বিমা, প্রতি আমানতকারী প্রতি ব্যাংক" },
  credit_card_rate_cap: { en: "Credit card interest (legal cap or typical rate)", bn: "ক্রেডিট কার্ডের সুদ (আইনি সীমা বা সাধারণ হার)" },
  equity_return_low: { en: "Equity return, low case", bn: "শেয়ার মুনাফা, কম ক্ষেত্রে" },
  equity_return_base: { en: "Equity return, base case", bn: "শেয়ার মুনাফা, ভিত্তি" },
  equity_return_high: { en: "Equity return, high case", bn: "শেয়ার মুনাফা, বেশি ক্ষেত্রে" },
  gold_return_low: { en: "Gold return, low case", bn: "সোনার মুনাফা, কম ক্ষেত্রে" },
  gold_return_base: { en: "Gold return, base case", bn: "সোনার মুনাফা, ভিত্তি" },
  gold_return_high: { en: "Gold return, high case", bn: "সোনার মুনাফা, বেশি ক্ষেত্রে" },
  fixed_income_return_low: { en: "Safe fixed-income return after tax, low case", bn: "নিরাপদ স্থির আয়ের মুনাফা কর-পরবর্তী, কম ক্ষেত্রে" },
  fixed_income_return_base: { en: "Safe fixed-income return after tax, base case", bn: "নিরাপদ স্থির আয়ের মুনাফা কর-পরবর্তী, ভিত্তি" },
  fixed_income_return_high: { en: "Safe fixed-income return after tax, high case", bn: "নিরাপদ স্থির আয়ের মুনাফা কর-পরবর্তী, বেশি ক্ষেত্রে" },
  life_claim_settlement_rate: { en: "Life-insurer claim settlement rate", bn: "জীবন বিমা দাবি নিষ্পত্তির হার" },
  insurance_term_premium_table: { en: "Indicative yearly term-life premium per 1,000 of cover, by age", bn: "বয়স অনুযায়ী প্রতি ১,০০০ বিমা অঙ্কে আনুমানিক বার্ষিক টার্ম প্রিমিয়াম" },
  health_hospitalisation_cost: { en: "Typical cost of one major hospital stay", bn: "একবার বড় হাসপাতাল ভর্তির সাধারণ খরচ" },
  health_premium_table: { en: "Indicative yearly health-insurance premium per 100,000 of cover, by age", bn: "বয়স অনুযায়ী প্রতি ১,০০,০০০ কভারে আনুমানিক বার্ষিক স্বাস্থ্য বিমা প্রিমিয়াম" },
  oop_health_share: { en: "Out-of-pocket share of health spending", bn: "স্বাস্থ্য ব্যয়ে নিজ পকেটের অংশ" },
  goal_inflation_health: { en: "Inflation for health goals", bn: "স্বাস্থ্য লক্ষ্যের মূল্যস্ফীতি" },
  goal_inflation_education: { en: "Inflation for education goals", bn: "শিক্ষা লক্ষ্যের মূল্যস্ফীতি" },
  life_expectancy: { en: "Life expectancy at birth", bn: "জন্মকালীন প্রত্যাশিত আয়ু" },
  life_table_remaining: { en: "Remaining years of life at 60, 65, 70 and 80", bn: "৬০, ৬৫, ৭০ ও ৮০ বছর বয়সে বাকি আয়ু" },
  support_ratio: { en: "Working-age people per elderly person", bn: "প্রতি প্রবীণের বিপরীতে কর্মক্ষম মানুষ" },
  retirement_age_default: { en: "Pension age, private sector", bn: "পেনশনের বয়স, বেসরকারি খাত" },
  retirement_age_government: { en: "Retirement age, government service", bn: "অবসরের বয়স, সরকারি চাকরি" },
  retirement_return_low: { en: "Return in retirement after tax, low case", bn: "অবসরে কর-পরবর্তী মুনাফা, কম ক্ষেত্রে" },
  retirement_return_base: { en: "Return in retirement after tax, base case", bn: "অবসরে কর-পরবর্তী মুনাফা, ভিত্তি" },
  retirement_return_high: { en: "Return in retirement after tax, high case", bn: "অবসরে কর-পরবর্তী মুনাফা, বেশি ক্ষেত্রে" },
  retirement_accumulation_return_low: { en: "Return before retirement, low case", bn: "অবসরের আগে মুনাফা, কম ক্ষেত্রে" },
  retirement_accumulation_return_base: { en: "Return before retirement, base case", bn: "অবসরের আগে মুনাফা, ভিত্তি" },
  retirement_accumulation_return_high: { en: "Return before retirement, high case", bn: "অবসরের আগে মুনাফা, বেশি ক্ষেত্রে" },
  old_age_allowance_monthly: { en: "Basic old-age (social) pension a month", bn: "মাসিক বয়স্ক ভাতা (সামাজিক পেনশন)" },
  old_age_allowance_eligibility: { en: "Basic old-age (social) pension eligibility", bn: "বয়স্ক ভাতার (সামাজিক পেনশন) যোগ্যতা" },
  gratuity_rule: { en: "Statutory gratuity or end-of-service benefit", bn: "আইনি গ্র্যাচুইটি বা চাকরি শেষের সুবিধা" },
  public_pension_scheme: { en: "Public pension scheme rules", bn: "সরকারি পেনশন স্কিমের নিয়ম" },
};

/**
 * Keys where "unknown" stays unknown: when a country has no usable figure the row becomes null
 * (JSON null, or no numeric value), never a regional or Bangladeshi rule, and M7 leaves the
 * gratuity, public pension or old-age allowance out. Only `absent: true` turns them into "none".
 */
export const UNKNOWN_MEANS_NULL: readonly RateKey[] = ["gratuity_rule", "public_pension_scheme", "old_age_allowance_monthly", "old_age_allowance_eligibility"];

/** The product slot each instrument rate key prices (the rate side of rates.ts INSTRUMENT_KEYS). */
export const PRODUCT_RATE_SLOTS: Readonly<Partial<Record<RateKey, Instrument>>> = {
  savings_account_rate: "savings_account",
  fdr_3m_rate: "fdr_3m",
  fdr_1y_rate: "fdr_1y",
  dps_rate: "dps",
  sanchayapatra_5y_rate: "sanchayapatra_5y",
  tbill_91d_rate: "tbill_91d",
  tbond_5y_rate: "tbond_5y",
  tbond_10y_rate: "tbond_10y",
};

/** What the app shows as the source of a row we chose ourselves (a docs/ source). */
export const OUR_ASSUMPTION_SOURCE = "Taka Plan (our assumption)";

/** Source name to display: "Taka Plan (our assumption)" for our own docs/ sources (and empty names), else the name. */
export function displaySourceName(sourceName: string, sourceUrl: string): string {
  return /^docs\//.test(sourceUrl) || sourceName.trim() === "" ? OUR_ASSUMPTION_SOURCE : sourceName;
}
