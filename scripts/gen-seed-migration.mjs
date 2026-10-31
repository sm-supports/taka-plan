#!/usr/bin/env node
// Generates the rates seed migrations from packages/engine/src/data/rates.seed.json:
//   migrations/0002_seed_rates.sql            launch rows (version 1), frozen to V1_KEYS
//   migrations/0003_rates_m2_m6_m7.sql        rows added for insurance, allocation and retirement
// A migration that production D1 has already applied never changes, so each batch of new keys gets
// its own migration that inserts the rows into the published (and any draft) version.
// Do not hand-edit the generated files; edit the JSON and re-run `npm run rates:gen-seed`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(root, "packages/engine/src/data/rates.seed.json");

/** Keys of the launch seed (migration 0002). Frozen: production D1 applied it on 31 Oct 2026. */
export const V1_KEYS = [
  "bank_deposit_avg_rate", "card_min_payment_share", "card_utilisation_amber", "cash_buffer_share",
  "credit_card_rate_cap", "debt_payoff_target_months", "deposit_insurance_limit", "dps_rate",
  "emergency_base_months", "emergency_build_months_default", "emergency_bump_irregular_income",
  "emergency_bump_no_health_insurance", "emergency_bump_sole_earner", "emergency_large_buffer_threshold",
  "emergency_max_months", "emergency_min_months", "emi_ratio_red", "equity_return_base",
  "equity_return_high", "equity_return_low", "fdr_1y_rate", "fdr_3m_rate", "goal_inflation_education",
  "goal_inflation_health", "gold_22k_per_bhori", "gold_return_base", "high_interest_debt_threshold",
  "inflation_cpi", "inflation_projection", "life_claim_settlement_rate", "life_expectancy", "min_tax",
  "min_tax_new", "oop_health_share", "paribar_sanchayapatra_5y_rate", "pensioner_sanchayapatra_5y_rate",
  "personal_loan_rate_default", "personal_loan_tenure_default_months", "plan_emergency_max_share",
  "plan_emergency_min_share", "plan_to_age", "policy_rate", "proof_of_return_threshold",
  "rebate_cap", "rebate_dps_cap", "rebate_govt_securities_cap", "rebate_share_of_income",
  "rebate_share_of_investment", "sanchayapatra_3m_profit_3y_rate", "sanchayapatra_5y_rate",
  "sanchayapatra_5y_rate_above_cap", "sanchayapatra_5y_year1_rate", "sanchayapatra_tier_cap",
  "savings_account_rate", "savings_rate_default", "tax_bank_interest", "tax_bank_interest_no_return",
  "tax_free_threshold_general", "tax_free_threshold_women_senior", "tax_sanchayapatra_profit", "tax_slabs",
  "tbill_91d_rate", "tbond_10y_rate", "tbond_5y_rate", "ups_return_fy2526",
];

/** Keys added for M2 insurance and health, M6 asset allocation and M7 retirement (migration 0003). */
export const M2_M6_M7_KEYS = [
  "insurance_income_share", "insurance_cover_to_age", "insurance_term_premium_table",
  "health_hospitalisation_cost", "health_premium_table", "health_cover_weights", "health_public_cover_floor",
  "allocation_profiles", "allocation_gold_default", "allocation_gold_min", "allocation_gold_max",
  "allocation_equity_cap", "allocation_drift_band", "allocation_no_equity_years",
  "allocation_cash_only_years", "fixed_income_return_low", "fixed_income_return_base",
  "fixed_income_return_high", "gold_return_low", "gold_return_high", "retirement_age_default",
  "retirement_age_government", "retirement_return_low", "retirement_return_base", "retirement_return_high",
  "retirement_accumulation_return_low", "retirement_accumulation_return_base",
  "retirement_accumulation_return_high", "plan_to_age_min", "plan_to_age_max", "plan_contrast_age",
  "old_age_allowance_monthly", "old_age_allowance_eligibility", "gratuity_rule", "public_pension_scheme",
  "pensioner_sanchayapatra_cap", "life_table_remaining", "support_ratio", "withdrawal_safe_pot_years",
];

/** Every batch of rows, in migration order. A new batch of keys means a new entry and a new file. */
export const ROW_BATCHES = [
  { file: "0002_seed_rates.sql", keys: V1_KEYS, mode: "seed" },
  { file: "0003_rates_m2_m6_m7.sql", keys: M2_M6_M7_KEYS, mode: "add" },
];

const q = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const n = (v) => (v === null || v === undefined ? "NULL" : Number(v).toString());
const COLUMNS = "version, key, value, value_json, unit, range_low, range_high, label_en, label_bn, source_name, source_url, as_of, reviewed_by, next_review, note, is_app_assumption";

function rowValues(r) {
  return [
    q(r.key), n(r.value), r.valueJson === undefined ? "NULL" : q(JSON.stringify(r.valueJson)), q(r.unit),
    n(r.rangeLow), n(r.rangeHigh), q(r.labelEn), q(r.labelBn), q(r.sourceName), q(r.sourceUrl), q(r.asOf), q(r.reviewedBy), q(r.nextReview), q(r.note), r.isAppAssumption ? "1" : "0",
  ].join(", ");
}

function rowsFor(snapshot, keys) {
  return [...keys].sort().map((key) => {
    const r = snapshot.rows[key];
    if (!r) throw new Error(`seed has no row "${key}"`);
    return r;
  });
}

/** 0002: the launch version and its rows. */
export function generateSeedSql(snapshot, keys = V1_KEYS) {
  const lines = [
    "-- GENERATED by scripts/gen-seed-migration.mjs from packages/engine/src/data/rates.seed.json. Do not edit.",
    `INSERT INTO rate_versions (version, status, created_at, published_at, published_by, note) VALUES (${n(snapshot.version)}, 'published', ${q(snapshot.publishedAt)}, ${q(snapshot.publishedAt)}, 'seed', 'Launch values from the PRD');`,
  ];
  for (const r of rowsFor(snapshot, keys)) lines.push(`INSERT INTO rates (${COLUMNS}) VALUES (${n(snapshot.version)}, ${rowValues(r)});`);
  return lines.join("\n") + "\n";
}

/** Later batches: add the rows to the published version and to an open draft, if any. */
export function generateAddedRowsSql(snapshot, keys, file) {
  const lines = [`-- GENERATED by scripts/gen-seed-migration.mjs (${file}) from packages/engine/src/data/rates.seed.json. Do not edit.`];
  for (const r of rowsFor(snapshot, keys)) {
    lines.push(`INSERT INTO rates (${COLUMNS}) SELECT version, ${rowValues(r)} FROM rate_versions WHERE status IN ('published', 'draft');`);
  }
  return lines.join("\n") + "\n";
}

/** The text of every generated migration, keyed by file name. */
export function generateAll(snapshot) {
  const all = new Set(ROW_BATCHES.flatMap((b) => b.keys));
  const unassigned = Object.keys(snapshot.rows).filter((k) => !all.has(k));
  if (unassigned.length) throw new Error(`seed rows not assigned to a migration batch: ${unassigned.join(", ")}`);
  return Object.fromEntries(ROW_BATCHES.map((b) => [b.file, b.mode === "seed" ? generateSeedSql(snapshot, b.keys) : generateAddedRowsSql(snapshot, b.keys, b.file)]));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const snapshot = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  for (const [file, sql] of Object.entries(generateAll(snapshot))) {
    fs.writeFileSync(path.join(root, "migrations", file), sql);
    console.log(`wrote migrations/${file}`);
  }
}
