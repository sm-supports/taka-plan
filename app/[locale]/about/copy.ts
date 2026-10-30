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
