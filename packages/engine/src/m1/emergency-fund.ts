import { roundingFor } from "../country/overlay";
import { createExplain } from "../explain";
import { clamp, roundDecimals, roundMoney, roundMoneyUp } from "../money";
import { getRate, type RateKey, type RatesSnapshot } from "../rates";
import { assertInput, isFiniteNumber, type ISODate, type Status } from "../types";
import { M1_NEXT_KEYS, M1_RULE_KEYS, type M1Input, type M1Result, type M1StepId, type M1Tiers } from "./types";

/**
 * Structural constants from the PRD's "Where to keep it" section. These describe the
 * shape of the ladder, not a rate or threshold, so they are not rates-table rows:
 * - tier 1 holds one month of essentials in a same-day savings account;
 * - tier 2 is a ladder of 3-month FDRs, one opened each month, so it has three slices.
 */
const TIER1_MONTHS = 1;
const FDR_LADDER_SLICES = 3;

type Reader = (key: RateKey) => number;

interface MonthsBreakdown {
  base: number;
  irregular: number;
  soleEarner: number;
  noInsurance: number;
  min: number;
  max: number;
  /** Unclamped sum of base and applied bumps. */
  raw: number;
  /** Clamped suggestion. */
  suggested: number;
}

type MonthsProfile = Pick<M1Input, "incomeType" | "dependents" | "soleEarner" | "hasHealthInsurance">;

function monthsBreakdown(input: MonthsProfile, read: Reader): MonthsBreakdown {
  const base = read("emergency_base_months");
  const bumpIrregular = read("emergency_bump_irregular_income");
  const bumpSoleEarner = read("emergency_bump_sole_earner");
  const bumpNoInsurance = read("emergency_bump_no_health_insurance");
  const min = read("emergency_min_months");
  const max = read("emergency_max_months");

  const irregular = input.incomeType === "freelance" || input.incomeType === "business" ? bumpIrregular : 0;
  const soleEarner = input.soleEarner && input.dependents.length > 0 ? bumpSoleEarner : 0;
  const noInsurance = input.hasHealthInsurance ? 0 : bumpNoInsurance;
  const raw = base + irregular + soleEarner + noInsurance;
  return { base, irregular, soleEarner, noInsurance, min, max, raw, suggested: clamp(raw, min, max) };
}

/** Suggested months of cover from the household profile (PRD M1 heuristic). */
export function suggestMonths(input: MonthsProfile, rates: RatesSnapshot): number {
  return monthsBreakdown(input, (key) => getRate(rates, key)).suggested;
}

function validate(input: M1Input): void {
  assertInput(isFiniteNumber(input.essentials) && input.essentials > 0, "essentials must be a positive number", { essentials: input.essentials });
  assertInput(isFiniteNumber(input.liquidSavings) && input.liquidSavings >= 0, "liquidSavings must be zero or more", { liquidSavings: input.liquidSavings });
  assertInput(Array.isArray(input.dependents), "dependents must be a list", { dependents: input.dependents });
  if (input.buildMonths !== undefined) {
    assertInput(Number.isInteger(input.buildMonths) && input.buildMonths > 0, "buildMonths must be a positive whole number", { buildMonths: input.buildMonths });
  }
}

export function computeEmergencyFund(input: M1Input, rates: RatesSnapshot, today: ISODate): M1Result {
  validate(input);
  const R = roundingFor(rates);
  const explain = createExplain(rates, today);
  const step = (id: M1StepId, inputs: Record<string, number | string>, raw: number, rounded: number, unit: "bdt" | "months" | "count") =>
    explain.step({ id, inputs, raw, rounded, unit });

  // Step 1: months of cover.
  const mb = monthsBreakdown(input, (key) => explain.use(key));
  const override = input.monthsOverride;
  if (override !== undefined) {
    assertInput(Number.isInteger(override) && override >= mb.min && override <= mb.max, `monthsOverride must be a whole number between ${mb.min} and ${mb.max}`, {
      monthsOverride: override,
      min: mb.min,
      max: mb.max,
    });
  }
  const months = override ?? mb.suggested;
  step(
    "m1.months",
    {
      base: mb.base,
      bumpIrregular: mb.irregular,
      bumpSoleEarner: mb.soleEarner,
      bumpNoHealth: mb.noInsurance,
      min: mb.min,
      max: mb.max,
      suggested: mb.suggested,
      source: override === undefined ? "suggested" : "override",
    },
    mb.raw,
    months,
    "months",
  );

  // Step 2: target.
  const essentials = input.essentials;
  const saved = roundMoney(input.liquidSavings, "exact", R);
  const targetRaw = essentials * months;
  const target = step("m1.target", { essentials, months }, targetRaw, roundMoney(targetRaw, "exact", R), "bdt");

  // Step 3: gap.
  const gapRaw = Math.max(0, target - saved);
  const gap = step("m1.gap", { target, saved }, gapRaw, roundMoney(gapRaw, "exact", R), "bdt");

  // Step 4: monthly saving over the build period. Rounded UP to the monthly step (৳100 in taka) so the fund is full
  // within buildMonths (monthsToFull ≤ buildMonths); rounding to nearest could add a 13th month.
  const buildMonths = input.buildMonths ?? explain.use("emergency_build_months_default");
  const monthlyRaw = gap / buildMonths;
  const monthlySaving = step("m1.monthly", { gap, buildMonths }, monthlyRaw, roundMoneyUp(monthlyRaw, "monthly", R), "bdt");

  // Step 5: months already covered.
  const coveredRaw = saved / essentials;
  const monthsCovered = step("m1.covered", { saved, essentials }, coveredRaw, roundDecimals(coveredRaw, 1), "months");

  const monthsToFull = gap === 0 || monthlySaving <= 0 ? null : Math.ceil(gap / monthlySaving);

  // Steps 6–8: where to keep it. Tier 1 is exactly one month of essentials (whole taka, not ৳500 steps).
  const tier1Raw = essentials * TIER1_MONTHS;
  const savingsAccount = step("m1.tier1", { essentials, months: TIER1_MONTHS }, tier1Raw, roundMoney(tier1Raw, "exact", R), "bdt");
  const tier2Raw = Math.max(0, target - savingsAccount);
  const fdrLadder = step("m1.tier2", { target, tier1: savingsAccount }, tier2Raw, roundMoney(tier2Raw, "exact", R), "bdt");
  const fdrPerSlice = roundMoney(fdrLadder / FDR_LADDER_SLICES, "lump", R);
  const limit = explain.use("deposit_insurance_limit");
  const banksRaw = target / limit;
  const banksNeeded = step("m1.banks", { target, tier2: fdrLadder, limit }, banksRaw, Math.max(1, Math.ceil(banksRaw)), "count");
  const largeBuffer = explain.use("emergency_large_buffer_threshold");
  // The government-certificate third layer is a Bangladesh rule (Sanchayapatra); other countries skip it.
  const country = rates.country;
  const certificateLayerApplies = (country === undefined || country.code === "BD") && !(country?.unavailable.includes("sanchayapatra_5y") ?? false);
  const sanchayapatraLayer = certificateLayerApplies && target > largeBuffer;

  const tiers: M1Tiers = { savingsAccount, fdrLadder, fdrPerSlice, banksNeeded, sanchayapatraLayer };

  const status: Status = monthsCovered < 1 ? "red" : monthsCovered < months ? "amber" : "green";

  const rules = M1_RULE_KEYS.filter((k) => k !== "m1.rule.sanchayapatraThirdLayer" || sanchayapatraLayer);

  const [openSavings, fdrLadderKey, splitBanks, full] = M1_NEXT_KEYS;
  const nextStep = gap === 0 ? full : saved < savingsAccount ? openSavings : banksNeeded > 1 && saved >= limit ? splitBanks : fdrLadderKey;

  return {
    suggestedMonths: mb.suggested,
    months,
    target,
    saved,
    gap,
    monthlySaving,
    monthsCovered,
    monthsToFull,
    tiers,
    status,
    rules,
    nextStep,
    explain: explain.done(),
  };
}
