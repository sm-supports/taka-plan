/**
 * Hand-built sample Plan for the ?demo=1 switch on /{locale}/plan (and for screenshots).
 *
 * computePlan() is not implemented in this slice's worktree, so this fixture is what the
 * engine is expected to produce for SAMPLE_PROFILES.firstJob (৳45,000 take-home, ৳28,000
 * essentials, ৳20,000 saved, no health insurance, one goal "Motorbike") with two documented
 * tweaks that make the screen worth looking at:
 *   - buildMonths 36 (the user slid "months to build" out) so the emergency fund does not
 *     swallow the whole ৳9,000 budget and the goals get a share;
 *   - a second goal, "Wedding" (৳6,00,000 in 4 years), so there are three cards.
 * Every number was checked by hand against the formulas in docs/ARCHITECTURE-CONTRACTS.md
 * using rates seed v1 (fixtures.test.ts re-derives the key ones).
 *
 * The one-red rule is exercised: the emergency fund (0.7 of 8 months) and the motorbike goal
 * (DPS loses to inflation) are both red in their modules; the plan keeps the most urgent and
 * demotes the goal to amber with demotedFromRed = true.
 */
import {
  assertSnapshot,
  getRow,
  mergeExplanations,
  RATES_SEED,
  SAMPLE_PROFILES,
  toAssumption,
  type Assumption,
  type Explanation,
  type ISODate,
  type M1Result,
  type M4Result,
  type M5Result,
  type Plan,
  type RateKey,
  type RatesSnapshot,
} from "@taka/engine";

export const DEMO_TODAY: ISODate = "2026-10-30";

const seed: RatesSnapshot = assertSnapshot(RATES_SEED);
const used = (keys: readonly RateKey[]): Assumption[] => keys.map((k) => toAssumption(getRow(seed, k), DEMO_TODAY));

const first = SAMPLE_PROFILES.firstJob;
const essentials = first.profile.essentials; // 28 000
const takeHome = first.profile.takeHome; // 45 000
const saved = first.m1.liquidSavings; // 20 000
const BUILD_MONTHS = 36;

/* ---------- M4: save-first budget ---------- */
const budgetExplain: Explanation = {
  steps: [
    { id: "m4.feasible", inputs: { average: takeHome, essentials }, raw: 0.3777777, rounded: 0.378, unit: "rate" },
    { id: "m4.amount", inputs: { average: takeHome, rate: 0.2 }, raw: 9000, rounded: 9000, unit: "bdt" },
    { id: "m4.expenses", inputs: { average: takeHome, savings: 9000 }, raw: 36000, rounded: 36000, unit: "bdt" },
  ],
  assumptions: used(["savings_rate_default", "dps_rate"]),
  notes: [],
};

const budget: M4Result = {
  averageIncome: takeHome,
  suggestedRate: 0.2,
  feasibleRate: 0.378,
  savingsRate: 0.2,
  savingsAmount: 9000,
  expensesAllowed: 36000,
  essentialsShortfall: 0,
  mode: "fixed",
  instrument: "dps",
  transferDay: 2,
  status: "green",
  explain: budgetExplain,
};

/* ---------- M1: emergency fund ---------- */
const target = essentials * 8; // 224 000
const gap = target - saved; // 204 000
const emergencyExplain: Explanation = {
  steps: [
    { id: "m1.months", inputs: { base: 6, bumpIrregular: 0, bumpSoleEarner: 0, bumpNoHealth: 2, min: 3, max: 15 }, raw: 8, rounded: 8, unit: "months" },
    { id: "m1.target", inputs: { essentials, months: 8 }, raw: target, rounded: target, unit: "bdt" },
    { id: "m1.gap", inputs: { target, saved }, raw: gap, rounded: gap, unit: "bdt" },
    { id: "m1.monthly", inputs: { gap, buildMonths: BUILD_MONTHS }, raw: gap / BUILD_MONTHS, rounded: 5700, unit: "bdt" },
    { id: "m1.covered", inputs: { saved, essentials }, raw: saved / essentials, rounded: 0.7, unit: "months" },
    { id: "m1.tier1", inputs: { essentials }, raw: essentials, rounded: essentials, unit: "bdt" },
    { id: "m1.tier2", inputs: { target, tier1: essentials }, raw: target - essentials, rounded: target - essentials, unit: "bdt" },
    { id: "m1.banks", inputs: { tier2: target - essentials, limit: 200000 }, raw: target / 200000, rounded: 2, unit: "count" },
  ],
  assumptions: used([
    "emergency_base_months",
    "emergency_bump_irregular_income",
    "emergency_bump_sole_earner",
    "emergency_bump_no_health_insurance",
    "emergency_min_months",
    "emergency_max_months",
    "deposit_insurance_limit",
    "emergency_large_buffer_threshold",
    "savings_account_rate",
    "fdr_3m_rate",
  ]),
  notes: [],
};

const emergency: M1Result = {
  suggestedMonths: 8,
  months: 8,
  target,
  saved,
  gap,
  monthlySaving: 5700,
  monthsCovered: 0.7,
  monthsToFull: 36,
  tiers: { savingsAccount: essentials, fdrLadder: target - essentials, fdrPerSlice: 65500, banksNeeded: 2, sanchayapatraLayer: false },
  status: "red",
  rules: ["m1.rule.noStocks", "m1.rule.cardBridge", "m1.rule.refill", "m1.rule.notAnEmergency"],
  nextStep: "m1.next.openSavings",
  explain: emergencyExplain,
};

/* ---------- M5: goals ---------- */
const bikeGoal = first.m5!.goals[0]!; // Motorbike, ৳2,50,000 in 2 years
const weddingGoal = { id: "g-wedding", name: "Wedding", cost: 600000, years: 4, type: "wedding" as const };

const bikeExplain: Explanation = {
  steps: [
    { id: "m5.fv", inputs: { cost: bikeGoal.cost, inflation: 0.08, years: 2 }, raw: 291600, rounded: 291500, unit: "bdt" },
    { id: "m5.rate", inputs: { instrument: "dps", nominal: 0.09, tax: 0.1 }, raw: 0.081, rounded: 0.081, unit: "rate" },
    { id: "m5.monthly", inputs: { fv: 291600, monthlyRate: 0.00675, months: 24 }, raw: 11233.28, rounded: 11200, unit: "bdt" },
    { id: "m5.real", inputs: { afterTax: 0.081, inflation: 0.0834 }, raw: -0.0022152, rounded: -0.002, unit: "rate" },
  ],
  assumptions: used(["inflation_projection", "fdr_1y_rate", "dps_rate", "tbill_91d_rate", "tax_bank_interest", "inflation_cpi"]),
  notes: ["m5.note.belowInflation"],
};

const weddingExplain: Explanation = {
  steps: [
    { id: "m5.fv", inputs: { cost: weddingGoal.cost, inflation: 0.08, years: 4 }, raw: 816293.38, rounded: 816500, unit: "bdt" },
    { id: "m5.rate", inputs: { instrument: "sanchayapatra_5y", nominal: 0.1183, tax: 0.1 }, raw: 0.10647, rounded: 0.106, unit: "rate" },
    { id: "m5.monthly", inputs: { fv: 816293.38, monthlyRate: 0.0088725, months: 48 }, raw: 13715.3, rounded: 13700, unit: "bdt" },
    { id: "m5.real", inputs: { afterTax: 0.10647, inflation: 0.0834 }, raw: 0.021294, rounded: 0.021, unit: "rate" },
  ],
  assumptions: used(["inflation_projection", "sanchayapatra_5y_rate", "tbond_5y_rate", "tax_sanchayapatra_profit", "tax_bank_interest", "inflation_cpi"]),
  notes: [],
};

const goals: M5Result = {
  goals: [
    {
      goalId: bikeGoal.id,
      valid: true,
      horizon: "short",
      inflation: 0.08,
      futureValue: 291500,
      instrument: "dps",
      candidates: ["fdr_1y", "dps", "tbill_91d"],
      nominal: 0.09,
      afterTax: 0.081,
      real: -0.002,
      belowInflation: true,
      monthly: { low: 11400, base: 11200, high: 11200 },
      months: 24,
      status: "red",
      explain: bikeExplain,
    },
    {
      goalId: weddingGoal.id,
      valid: true,
      horizon: "medium",
      inflation: 0.08,
      futureValue: 816500,
      instrument: "sanchayapatra_5y",
      candidates: ["sanchayapatra_5y", "tbond_5y"],
      nominal: 0.1183,
      afterTax: 0.106,
      real: 0.021,
      belowInflation: false,
      monthly: { low: 14600, base: 13700, high: 13700 },
      months: 48,
      status: "green",
      explain: weddingExplain,
    },
  ],
  totalMonthly: 24900,
  usesAllocation: false,
};

/* ---------- Plan split ---------- */
const planExplain: Explanation = {
  steps: [
    { id: "plan.total", inputs: { savings: 9000 }, raw: 9000, rounded: 9000, unit: "bdt" },
    { id: "plan.emergencyShare", inputs: { total: 9000, minShare: 0.6, gap }, raw: 5666.67, rounded: 5700, unit: "bdt" },
    { id: "plan.goalsShare", inputs: { remaining: 3300, goalsNeed: 24900 }, raw: 3300, rounded: 3300, unit: "bdt" },
  ],
  assumptions: used(["plan_emergency_min_share", "high_interest_debt_threshold"]),
  notes: [],
};

export const SAMPLE_PLAN: Plan = {
  monthlyTotal: 9000,
  buckets: [
    {
      id: "emergency",
      priority: 1,
      amount: 5700,
      instrument: "fdr_3m",
      status: "red",
      demotedFromRed: false,
      reasonKey: "plan.reason.emergency",
      reasonParams: { amount: 5700, covered: 0.7, months: 8 },
      nextStepKey: "plan.next.openSavings",
      module: "m1",
    },
    {
      id: "goal",
      refId: bikeGoal.id,
      priority: 2,
      amount: 1500,
      instrument: "dps",
      status: "red",
      demotedFromRed: true,
      reasonKey: "plan.reason.goal",
      reasonParams: { name: bikeGoal.name, amount: 1500, instrument: "dps", fv: 291500, years: 2 },
      nextStepKey: "plan.next.dps",
      module: "m5",
    },
    {
      id: "goal",
      refId: weddingGoal.id,
      priority: 3,
      amount: 1800,
      instrument: "sanchayapatra_5y",
      status: "green",
      demotedFromRed: false,
      reasonKey: "plan.reason.goal",
      reasonParams: { name: weddingGoal.name, amount: 1800, instrument: "sanchayapatra_5y", fv: 816500, years: 4 },
      nextStepKey: "plan.next.sanchayapatra",
      module: "m5",
    },
  ],
  emergency,
  budget,
  goals,
  summary: { emergencyShare: 0.633, monthsToEmergencyFull: 36, goalsShortfall: 21600 },
  explain: mergeExplanations([planExplain, budgetExplain, emergencyExplain, bikeExplain, weddingExplain]),
};
