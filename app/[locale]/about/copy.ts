/** Display grouping of the rates table on the About page. The copy lives in the `about` dictionary namespace. */
import type { RateKey } from "@taka/engine";

export type RateGroupId = "macro" | "bank" | "sanchayapatra" | "govt" | "market" | "risk" | "tax" | "policy" | "other";

/** Display order of the sources table and which rows fall in each group. Unlisted keys render under "other". */
export const RATE_GROUPS: ReadonlyArray<{ id: RateGroupId; keys: readonly RateKey[] }> = [
  { id: "macro", keys: ["inflation_cpi", "inflation_projection", "policy_rate"] },
  { id: "bank", keys: ["savings_account_rate", "fdr_3m_rate", "fdr_1y_rate", "dps_rate", "bank_deposit_avg_rate"] },
  {
    id: "sanchayapatra",
    keys: [
      "sanchayapatra_5y_rate",
      "sanchayapatra_5y_rate_above_cap",
      "sanchayapatra_tier_cap",
      "sanchayapatra_5y_year1_rate",
      "paribar_sanchayapatra_5y_rate",
      "pensioner_sanchayapatra_5y_rate",
      "sanchayapatra_3m_profit_3y_rate",
    ],
  },
  { id: "govt", keys: ["tbill_91d_rate", "tbond_5y_rate", "tbond_10y_rate"] },
  { id: "market", keys: ["equity_return_low", "equity_return_base", "equity_return_high", "gold_return_base", "gold_22k_per_bhori"] },
  {
    id: "risk",
    keys: ["credit_card_rate_cap", "deposit_insurance_limit", "life_claim_settlement_rate", "oop_health_share", "life_expectancy", "plan_to_age", "ups_return_fy2526"],
  },
  {
    id: "tax",
    keys: [
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
    ],
  },
  {
    id: "policy",
    keys: [
      "emergency_base_months",
      "emergency_bump_irregular_income",
      "emergency_bump_sole_earner",
      "emergency_bump_no_health_insurance",
      "emergency_min_months",
      "emergency_max_months",
      "emergency_build_months_default",
      "emergency_large_buffer_threshold",
      "cash_buffer_share",
      "card_min_payment_share",
      "emi_ratio_red",
      "card_utilisation_amber",
      "high_interest_debt_threshold",
      "personal_loan_rate_default",
      "savings_rate_default",
      "plan_emergency_min_share",
      "debt_payoff_target_months",
      "goal_inflation_education",
      "goal_inflation_health",
    ],
  },
];

/**
 * About-page wording that is not in the dictionaries: neutral group headings for countries other
 * than Bangladesh and the labels of the small tables that show JSON-valued rows. English and
 * Bangla; every other locale reads English (row labels and notes are English there too).
 */
export interface AboutTableCopy {
  group: { sanchayapatra: string; tax: string };
  notFound: string;
  none: string;
  upToAge: string;
  low: string;
  high: string;
  perCover: string;
  smoker: string;
  weights: { self: string; partner: string; child: string; parent: string };
  weightsCaption: string;
  profiles: { careful: string; balanced: string; growth: string };
  profileLine: string;
  gratuity: string;
  gratuityAfter: string;
  gratuityMonth: string;
  pensionEntry: string;
  pensionFrom: string;
  pensionLinked: string;
  pensionFixed: string;
  pensionTaxFree: string;
  pensionTaxed: string;
  pensionNominee: string;
  pensionExample: string;
  eligibility: string;
  meansTested: string;
  notMeansTested: string;
  over90: string;
  lifeRow: string;
  lifeSplit: string;
  supportPoint: string;
  supportCaption: string;
}

const EN: AboutTableCopy = {
  group: { sanchayapatra: "Government savings certificates", tax: "Tax" },
  notFound: "Not found for this country",
  none: "None",
  upToAge: "Up to age {age}",
  low: "Low",
  high: "High",
  perCover: "Yearly premium per {per} of cover",
  smoker: "Smokers pay about {times}× as much.",
  weights: { self: "You", partner: "Partner", child: "Each child", parent: "Each parent" },
  weightsCaption: "Share of one hospital stay to insure, per person",
  profiles: { careful: "Careful", balanced: "Balanced", growth: "Growth" },
  profileLine: "{profile}: {e0} in shares at 30, never below {emin}",
  gratuity: "{days} days of last wages for each year of service",
  gratuityAfter: "{days} days a year after {years} years",
  gratuityMonth: "A month counts as {days} days of wages",
  pensionEntry: "Join between ages {min} and {max}",
  pensionFrom: "Pension from age {age}",
  pensionLinked: "Rises with inflation",
  pensionFixed: "Fixed amount (does not rise with inflation)",
  pensionTaxFree: "Tax-free",
  pensionTaxed: "Taxed",
  pensionNominee: "Paid to a nominee until the holder would have been {age}",
  pensionExample: "{contribution} a month for {years} years → {pension} a month",
  eligibility: "Men from {men}, women from {women}",
  meansTested: "Means-tested",
  notMeansTested: "Not means-tested",
  over90: "Over 90: {amount} a month",
  lifeRow: "At {age}: {total} more years",
  lifeSplit: "men {men}, women {women}",
  supportPoint: "{year}: {value}",
  supportCaption: "Working-age people for each person aged 65 or more",
};

const BN: AboutTableCopy = {
  group: { sanchayapatra: "সরকারি সঞ্চয় সার্টিফিকেট", tax: "কর" },
  notFound: "এই দেশের জন্য পাওয়া যায়নি",
  none: "নেই",
  upToAge: "{age} বছর বয়স পর্যন্ত",
  low: "কম",
  high: "বেশি",
  perCover: "প্রতি {per} কভারে বার্ষিক প্রিমিয়াম",
  smoker: "ধূমপায়ীদের প্রায় {times} গুণ দিতে হয়।",
  weights: { self: "আপনি", partner: "স্বামী/স্ত্রী", child: "প্রতি সন্তান", parent: "প্রতি মা-বাবা" },
  weightsCaption: "প্রতি জনের জন্য একবার হাসপাতাল ভর্তির খরচের যে অংশ বিমা করা দরকার",
  profiles: { careful: "সাবধানী", balanced: "ভারসাম্য", growth: "প্রবৃদ্ধি" },
  profileLine: "{profile}: ৩০ বছর বয়সে শেয়ারে {e0}, কখনো {emin}-এর নিচে নয়",
  gratuity: "চাকরির প্রতি বছরের জন্য শেষ মজুরির {days} দিন",
  gratuityAfter: "{years} বছর পরে বছরে {days} দিন",
  gratuityMonth: "এক মাস ধরা হয় {days} দিনের মজুরি",
  pensionEntry: "{min} থেকে {max} বছর বয়সে যোগ দেওয়া যায়",
  pensionFrom: "{age} বছর বয়স থেকে পেনশন",
  pensionLinked: "মূল্যস্ফীতির সঙ্গে বাড়ে",
  pensionFixed: "নির্দিষ্ট অঙ্ক (মূল্যস্ফীতির সঙ্গে বাড়ে না)",
  pensionTaxFree: "করমুক্ত",
  pensionTaxed: "করযোগ্য",
  pensionNominee: "গ্রাহকের {age} বছর বয়স পর্যন্ত নমিনি পান",
  pensionExample: "মাসে {contribution}, {years} বছর ধরে → মাসে {pension}",
  eligibility: "পুরুষ {men} বছর থেকে, নারী {women} বছর থেকে",
  meansTested: "আয় ও সম্পদ যাচাই করে",
  notMeansTested: "আয় ও সম্পদ যাচাই ছাড়া",
  over90: "৯০ বছরের বেশি: মাসে {amount}",
  lifeRow: "{age} বছর বয়সে: আরও {total} বছর",
  lifeSplit: "পুরুষ {men}, নারী {women}",
  supportPoint: "{year}: {value}",
  supportCaption: "৬৫ বা তার বেশি বয়সী প্রতি জনের বিপরীতে কর্মক্ষম মানুষ",
};

export function aboutTableCopy(locale: string): AboutTableCopy {
  return locale === "bn" ? BN : EN;
}
