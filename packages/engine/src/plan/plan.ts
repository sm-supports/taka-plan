import { createExplain, mergeExplanations, type Explanation } from "../explain";
import { computeEmergencyFund } from "../m1/emergency-fund";
import type { M1Input, M1Result } from "../m1/types";
import { computeDebtHealth } from "../m3/debt-health";
import type { M3Input, M3Result } from "../m3/types";
import { computeSaveFirst } from "../m4/save-first";
import type { M4Input, M4Result } from "../m4/types";
import { computeGoals } from "../m5/goal-planner";
import type { Goal, GoalResult, M5Result } from "../m5/types";
import { clamp, roundDecimals, roundMoney, sum } from "../money";
import type { RatesSnapshot } from "../rates";
import { assertInput, isFiniteNumber, type Instrument, type ISODate, type Money, type Profile, type Status } from "../types";
import type { Bucket, BucketInstrument, BucketModule, Plan, PlanInput, PlanOverrides, PlanSummary } from "./types";

const INCOME_TYPES: ReadonlySet<string> = new Set(["salaried", "freelance", "business"]);
const DEPENDENTS: ReadonlySet<string> = new Set(["partner", "children", "parents"]);
const MIN_AGE = 15;
const MAX_AGE = 100;

/** Throws INVALID_INPUT unless the five onboarding answers are usable. */
export function assertProfile(profile: Profile): void {
  assertInput(typeof profile === "object" && profile !== null, "profile is required");
  assertInput(isFiniteNumber(profile.takeHome) && profile.takeHome > 0, "takeHome must be a positive number", { takeHome: profile.takeHome });
  assertInput(isFiniteNumber(profile.essentials) && profile.essentials >= 0, "essentials must be zero or more", { essentials: profile.essentials });
  assertInput(isFiniteNumber(profile.age) && profile.age >= MIN_AGE && profile.age <= MAX_AGE, `age must be between ${MIN_AGE} and ${MAX_AGE}`, { age: profile.age });
  assertInput(INCOME_TYPES.has(profile.incomeType), "incomeType must be salaried, freelance or business", { incomeType: profile.incomeType });
  assertInput(Array.isArray(profile.dependents) && profile.dependents.every((d) => DEPENDENTS.has(d)), "dependents must be a list of partner, children or parents", {
    dependents: profile.dependents,
  });
  assertInput(typeof profile.hasDebt === "boolean", "hasDebt must be true or false", { hasDebt: profile.hasDebt });
}

/**
 * Fill PRD defaults from the five onboarding answers: sole earner when there are dependents,
 * no health insurance, no liquid savings, m3 only when the user said they have debt.
 * `m3.savingsTarget` is left at 0 here and filled from the M4 amount inside computePlan.
 */
export function profileToPlanInput(profile: Profile, overrides: PlanOverrides = {}): PlanInput {
  assertProfile(profile);
  const { takeHome, essentials, incomeType, dependents, age } = profile;
  const m1: M1Input = {
    essentials,
    incomeType,
    dependents,
    soleEarner: dependents.length > 0,
    hasHealthInsurance: false,
    liquidSavings: 0,
    ...overrides.m1,
  };
  const m4: M4Input = { takeHome, essentials, incomeType, ...overrides.m4 };
  const input: PlanInput = { profile, m1, m4 };
  if (profile.hasDebt) {
    const m3: M3Input = { takeHome, essentials, savingsTarget: 0, loans: [], cards: [], ...overrides.m3 };
    input.m3 = m3;
  }
  input.m5 = overrides.m5 ?? { goals: [], age };
  return input;
}

/** Dictionary key under plan.next.* for the instrument a goal bucket goes into. */
export function nextStepForInstrument(instrument: Instrument): string {
  switch (instrument) {
    case "sanchayapatra_5y":
      return "plan.next.sanchayapatra";
    case "tbond_5y":
    case "tbond_10y":
    case "tbill_91d":
      return "plan.next.tbond";
    case "fdr_3m":
    case "fdr_1y":
      return "plan.next.fdr";
    case "savings_account":
      return "plan.next.openSavings";
    default:
      // dps, and the M6-reserved equity_fund / gold, start as a monthly DPS habit.
      return "plan.next.dps";
  }
}

interface BucketDraft {
  id: Bucket["id"];
  refId?: string;
  amount: Money;
  instrument: BucketInstrument;
  status: Status;
  reasonKey: string;
  reasonParams: Record<string, number | string>;
  nextStepKey: string;
  module: BucketModule;
}

/**
 * Drop buckets that get nothing this month; the only zero-amount bucket shown is the emergency
 * fund once it is full (`keepFull`), so the user sees that it is done.
 */
function dropEmpty(drafts: BucketDraft[], emergencyFull: boolean): BucketDraft[] {
  return drafts.filter((d) => d.amount > 0 || (d.id === "emergency" && emergencyFull));
}

/** Number the drafts 1..n and apply the one-red rule: the red with the lowest priority number stays, later reds become amber. */
function toBuckets(drafts: BucketDraft[]): Bucket[] {
  let redSeen = false;
  return drafts.map((d, i) => {
    let status = d.status;
    let demotedFromRed = false;
    if (status === "red") {
      if (redSeen) {
        status = "amber";
        demotedFromRed = true;
      } else {
        redSeen = true;
      }
    }
    const bucket: Bucket = {
      id: d.id,
      priority: i + 1,
      amount: d.amount,
      instrument: d.instrument,
      status,
      demotedFromRed,
      reasonKey: d.reasonKey,
      reasonParams: d.reasonParams,
      nextStepKey: d.nextStepKey,
      module: d.module,
    };
    if (d.refId !== undefined) bucket.refId = d.refId;
    return bucket;
  });
}

function highestRate(debt: M3Result): number {
  let top = 0;
  for (const d of debt.highInterestDebts) if (d.annualRate > top) top = d.annualRate;
  return top;
}

export function computePlan(input: PlanInput, rates: RatesSnapshot, today: ISODate): Plan {
  assertProfile(input.profile);
  const ex = createExplain(rates, today);
  const minShare = ex.use("plan_emergency_min_share");
  const maxShare = ex.use("plan_emergency_max_share");
  const payoffMonths = ex.use("debt_payoff_target_months");
  assertInput(payoffMonths > 0, "debt_payoff_target_months must be positive", { payoffMonths });

  const budget: M4Result = computeSaveFirst(input.m4, rates, today);
  const total: Money = Math.max(0, budget.savingsAmount);
  ex.step({ id: "plan.total", inputs: { savings: budget.savingsAmount }, raw: total, rounded: total, unit: "bdt" });

  const emergency: M1Result = computeEmergencyFund(input.m1, rates, today);
  const debt: M3Result | undefined = input.m3 ? computeDebtHealth({ ...input.m3, savingsTarget: input.m3.savingsTarget || total }, rates, today) : undefined;
  const goals: M5Result | undefined = input.m5 && input.m5.goals.length > 0 ? computeGoals(input.m5, rates, today) : undefined;

  const drafts: BucketDraft[] = [];
  let remaining: Money = total;

  // (1) Emergency fund: the M1 monthly amount, kept between minShare and maxShare of the budget so
  // other buckets are never starved, and never more than the remaining gap.
  const emergencyFull = emergency.gap === 0;
  const toSavingsAccount = emergency.saved < emergency.tiers.savingsAccount;
  const emergencyInstrument: Instrument = toSavingsAccount ? "savings_account" : "fdr_3m";
  let emergencyAmount: Money = 0;
  if (!emergencyFull) {
    const clamped = clamp(emergency.monthlySaving, minShare * total, maxShare * total);
    const raw = Math.min(emergency.gap, clamped);
    emergencyAmount = Math.min(total, emergency.gap, roundMoney(clamped, "monthly"));
    ex.step({
      id: "plan.emergencyShare",
      inputs: { total, minShare, maxShare, m1Monthly: emergency.monthlySaving, gap: emergency.gap },
      raw,
      rounded: emergencyAmount,
      unit: "bdt",
    });
    drafts.push({
      id: "emergency",
      amount: emergencyAmount,
      instrument: emergencyInstrument,
      status: emergency.status,
      reasonKey: "plan.reason.emergency",
      reasonParams: { amount: emergencyAmount, covered: emergency.monthsCovered, months: emergency.months, instrument: emergencyInstrument },
      nextStepKey: toSavingsAccount ? "plan.next.openSavings" : "plan.next.fdrLadder",
      module: "m1",
    });
  } else {
    ex.step({ id: "plan.emergencyShare", inputs: { total, minShare, maxShare, m1Monthly: 0, gap: 0 }, raw: 0, rounded: 0, unit: "bdt" });
    drafts.push({
      id: "emergency",
      amount: 0,
      instrument: emergencyInstrument,
      status: "green",
      reasonKey: "plan.reason.emergencyFull",
      reasonParams: { months: emergency.months },
      nextStepKey: "plan.next.keepFull",
      module: "m1",
    });
  }
  remaining = Math.max(0, remaining - emergencyAmount);

  // (2) Insurance premiums (M2 hook; absent in the MVP).
  if (input.insurance) {
    const need = roundMoney(Math.max(0, input.insurance.monthlyPremiumNeed), "monthly");
    const amount = Math.min(remaining, need);
    drafts.push({
      id: "insurance",
      amount,
      instrument: "term_insurance",
      status: amount >= need ? "green" : "amber",
      reasonKey: "plan.reason.insurance",
      reasonParams: { amount },
      nextStepKey: "plan.next.openSavings",
      module: "m2",
    });
    remaining = Math.max(0, remaining - amount);
  }

  // (3) High-interest debt: clear the balances over debt_payoff_target_months.
  if (debt && debt.highInterestDebts.length > 0) {
    const balance = sum(debt.highInterestDebts.map((d) => d.balance));
    const need = roundMoney(balance / payoffMonths, "monthly");
    const amount = Math.min(remaining, need);
    ex.step({ id: "plan.debtShare", inputs: { remaining, headroom: need }, raw: Math.min(remaining, balance / payoffMonths), rounded: amount, unit: "bdt" });
    // Months actually needed at the allocated amount (the target months when nothing can be allocated).
    const monthsNeeded = amount > 0 && balance > 0 ? Math.ceil(balance / amount) : payoffMonths;
    const draft: BucketDraft = {
      id: "debt",
      amount,
      instrument: "loan_prepayment",
      status: debt.status,
      reasonKey: "plan.reason.debt",
      reasonParams: { amount, rate: highestRate(debt), count: debt.highInterestDebts.length, months: monthsNeeded },
      nextStepKey: "plan.next.prepayDebt",
      module: "m3",
    };
    const only = debt.highInterestDebts.length === 1 ? debt.highInterestDebts[0] : undefined;
    if (only) draft.refId = only.id;
    drafts.push(draft);
    remaining = Math.max(0, remaining - amount);
  }

  // (4) Goals: split what is left in proportion to each goal's monthly need.
  const goalExplains: Explanation[] = [];
  let goalsShortfall: Money = 0;
  if (goals && input.m5) {
    const byId = new Map<string, Goal>(input.m5.goals.map((g) => [g.id, g]));
    const validGoals: GoalResult[] = goals.goals.filter((g) => g.valid);
    const goalsNeed = sum(validGoals.map((g) => g.monthly.base));
    const available = remaining;
    let allocatedTotal: Money = 0;
    const allocations: { goalId: string; need: Money; share: number; amount: Money }[] = [];
    for (const g of validGoals) {
      const need = g.monthly.base;
      const share = goalsNeed > 0 ? (available * need) / goalsNeed : 0;
      const amount = Math.max(0, Math.min(need, roundMoney(Math.min(need, share), "monthly"), remaining));
      allocations.push({ goalId: g.goalId, need, share: Math.min(need, share), amount });
      allocatedTotal += amount;
      remaining = Math.max(0, remaining - amount);
      const goal = byId.get(g.goalId);
      drafts.push({
        id: "goal",
        refId: g.goalId,
        amount,
        instrument: g.instrument,
        status: g.status,
        reasonKey: "plan.reason.goal",
        reasonParams: {
          name: goal?.name ?? g.goalId,
          amount,
          need,
          instrument: g.instrument,
          fv: g.futureValue,
          years: goal?.years ?? roundDecimals(g.months / 12, 1),
        },
        nextStepKey: nextStepForInstrument(g.instrument),
        module: "m5",
      });
      goalExplains.push(g.explain);
    }
    if (validGoals.length > 0) {
      goalsShortfall = Math.max(0, goalsNeed - allocatedTotal);
      ex.step({ id: "plan.goalsShare", inputs: { remaining: available, goalsNeed }, raw: Math.min(available, goalsNeed), rounded: allocatedTotal, unit: "bdt" });
      for (const a of allocations) {
        ex.step({ id: "plan.goalAllocation", inputs: { goalId: a.goalId, need: a.need, goalsNeed, remaining: available }, raw: a.share, rounded: a.amount, unit: "bdt" });
      }
    }
  }

  // Retirement (M7 hook; absent in the MVP).
  if (input.retirement) {
    const need = roundMoney(Math.max(0, input.retirement.monthlyNeed), "monthly");
    const amount = Math.min(remaining, need);
    drafts.push({
      id: "future",
      amount,
      instrument: "dps",
      status: amount >= need ? "green" : "amber",
      reasonKey: "plan.reason.addGoal",
      reasonParams: {},
      nextStepKey: "plan.next.dps",
      module: "m7",
    });
    remaining = Math.max(0, remaining - amount);
  }

  // (5) Nothing to aim at yet, or room to spare: start the habit in a DPS and ask for a goal, so the
  // buckets always add up to the budget. Omitted when nothing is left.
  if (remaining > 0) {
    drafts.push({
      id: "future",
      amount: remaining,
      instrument: "dps",
      status: "green",
      reasonKey: "plan.reason.addGoal",
      reasonParams: {},
      nextStepKey: "plan.next.addGoal",
      module: "m5",
    });
    remaining = 0;
  }

  const buckets = toBuckets(dropEmpty(drafts, emergencyFull));
  const monthlyTotal: Money = sum(buckets.map((b) => b.amount));

  const summary: PlanSummary = {
    emergencyShare: total > 0 ? roundDecimals(emergencyAmount / total, 3) : 0,
    monthsToEmergencyFull: emergency.gap === 0 || emergencyAmount <= 0 ? null : Math.ceil(emergency.gap / emergencyAmount),
    goalsShortfall,
  };

  const parts: Explanation[] = [ex.done(), budget.explain, emergency.explain];
  if (debt) parts.push(debt.explain);
  parts.push(...goalExplains);
  const explain = mergeExplanations(parts);

  const plan: Plan = { monthlyTotal, buckets, emergency, budget, summary, explain };
  if (debt) plan.debt = debt;
  if (goals) plan.goals = goals;
  return plan;
}
