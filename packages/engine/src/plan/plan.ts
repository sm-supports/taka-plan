import { roundingFor } from "../country/overlay";
import { createExplain, mergeExplanations, type Explanation } from "../explain";
import { computeEmergencyFund } from "../m1/emergency-fund";
import type { M1Input, M1Result } from "../m1/types";
import { computeInsurance } from "../m2/insurance";
import type { M2Input, M2Result } from "../m2/types";
import { computeDebtHealth } from "../m3/debt-health";
import { simulatePayoff } from "../m3/payoff";
import type { M3Input, M3Result } from "../m3/types";
import { computeSaveFirst } from "../m4/save-first";
import type { M4Input, M4Result } from "../m4/types";
import { computeGoals, dominantSlot, mixFixedIncomeSlot } from "../m5/goal-planner";
import type { Allocation, Goal, GoalResult, M5Input, M5Result } from "../m5/types";
import { allocationWeights, computeAllocation } from "../m6/allocation";
import type { M6Input, M6Result, M6RiskAnswers, RiskAnswer } from "../m6/types";
import { computeRetirement } from "../m7/retirement";
import type { M7Input, M7Result } from "../m7/types";
import { clamp, roundDecimals, roundMoney, sum } from "../money";
import { getRate, type RatesSnapshot } from "../rates";
import { assertInput, isFiniteNumber, type IncomeType, type Instrument, type ISODate, type Money, type Profile, type Status } from "../types";
import type { Bucket, BucketId, BucketInstrument, BucketModule, Plan, PlanInput, PlanOverrides, PlanSummary } from "./types";

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

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/**
 * Presence rule for the m2 / m6 / m7 override slices: the slice counts as the user's own answers
 * when at least one key holds a defined value (a nested object such as M6's `risk` counts only
 * when it holds a defined value itself). The store has no "started" flag, so an untouched
 * calculator ({} in the store) never adds its module to the plan.
 */
export function hasOverrideAnswers(slice: unknown): boolean {
  if (!isPlainObject(slice)) return false;
  return Object.values(slice).some((v) => v !== undefined && (!isPlainObject(v) || hasOverrideAnswers(v)));
}

/** The slice without its undefined keys, so spreading it never wipes a default. */
function definedOnly<T extends object>(slice: T | undefined): Partial<T> {
  const out: Partial<T> = {};
  if (!slice) return out;
  for (const [k, v] of Object.entries(slice)) if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  return out;
}

/** Card balance the user carries from month to month (feeds M6's gate). */
function carriesCardDebt(m3: Pick<M3Input, "cards"> | undefined): boolean {
  return (m3?.cards ?? []).some((c) => !c.paysInFull && c.balance > 0);
}

/**
 * Default answers to the four M6 risk questions when the user left some out: age band and income
 * stability follow the profile, the horizon answer follows horizonYears, and the reaction to a 20%
 * fall defaults to the middle answer ("wait").
 */
const DEFAULT_REACTION: RiskAnswer = 1;
/** Years the plan's long-term money is invested for when M6 has no horizon answer (beyond allocation_no_equity_years). */
export const DEFAULT_ALLOCATION_HORIZON_YEARS = 10;

function ageBandAnswer(age: number): RiskAnswer {
  return age >= 50 ? 0 : age >= 35 ? 1 : 2;
}

function incomeStabilityAnswer(incomeType: IncomeType): RiskAnswer {
  return incomeType === "business" ? 0 : incomeType === "freelance" ? 1 : 2;
}

function horizonAnswer(years: number): RiskAnswer {
  return years < 5 ? 0 : years <= 10 ? 1 : 2;
}

/**
 * Fill PRD defaults from the five onboarding answers: sole earner when there are dependents,
 * no health insurance, no liquid savings, m3 only when the user said they have debt.
 * `m3.savingsTarget` is left at 0 here and filled from the M4 amount inside computePlan.
 *
 * M2, M6 and M7 join the plan only when their override slice holds the user's own answers
 * (hasOverrideAnswers). Their other fields default from the profile and the other modules:
 * - M2: age, dependents and take-home from the profile; debts = M3 loan and card balances;
 *   educationGoals = today's cost of the M5 education goals; liquidSavings from M1; no existing
 *   cover; non-smoker. M1's hasHealthInsurance (when not set) follows M2's existing health cover.
 * - M6: age from the profile, missing risk answers derived (see above), horizonYears
 *   DEFAULT_ALLOCATION_HORIZON_YEARS, no lump sum or monthly amount; the gate is refined in computePlan.
 *   The age-band answer always follows the profile's age, and the horizon answer follows horizonYears
 *   whenever the user gave the years, so the two can never contradict.
 * - M7: working, age from the profile, monthlySpending = the profile's monthly essentials,
 *   savings = M1 liquid savings, no current monthly saving. When the user gave no savings figure,
 *   `m7SavingsDefault` is set and computePlan counts only what sits above the emergency-fund target
 *   (the fund is not retirement money).
 */
export function profileToPlanInput(profile: Profile, overrides: PlanOverrides = {}): PlanInput {
  assertProfile(profile);
  const { takeHome, essentials, incomeType, dependents, age } = profile;
  const m2Answers = hasOverrideAnswers(overrides.m2) ? definedOnly(overrides.m2) : undefined;
  const m1: M1Input = {
    essentials,
    incomeType,
    dependents,
    soleEarner: dependents.length > 0,
    // Mirrors M2Result.hasHealthCover (existing health cover > 0) when the user answered M2.
    hasHealthInsurance: (m2Answers?.existingHealthCover ?? 0) > 0,
    liquidSavings: 0,
    ...definedOnly(overrides.m1),
  };
  const m4: M4Input = { takeHome, essentials, incomeType, ...overrides.m4 };
  const input: PlanInput = { profile, m1, m4 };
  if (profile.hasDebt) {
    const m3: M3Input = { takeHome, essentials, savingsTarget: 0, loans: [], cards: [], ...overrides.m3 };
    input.m3 = m3;
  }
  const m5: M5Input = overrides.m5 ?? { goals: [], age };
  input.m5 = m5;

  if (m2Answers) {
    const debts = input.m3 ? sum(input.m3.loans.map((l) => l.outstanding)) + sum(input.m3.cards.map((c) => c.balance)) : 0;
    const educationGoals = sum(m5.goals.filter((g) => g.type === "education" && isFiniteNumber(g.cost) && g.cost > 0).map((g) => g.cost));
    const m2: M2Input = {
      age,
      dependents,
      takeHome,
      smoker: false,
      liquidSavings: m1.liquidSavings,
      existingLifeCover: 0,
      debts,
      educationGoals,
      existingHealthCover: 0,
      ...m2Answers,
    };
    input.m2 = m2;
  }

  if (hasOverrideAnswers(overrides.m6)) {
    const { risk: riskAnswers, ...rest } = definedOnly(overrides.m6);
    const horizonYears = rest.horizonYears ?? DEFAULT_ALLOCATION_HORIZON_YEARS;
    const given = definedOnly(riskAnswers);
    const risk: M6RiskAnswers = {
      ageBand: ageBandAnswer(age),
      incomeStability: given.incomeStability ?? incomeStabilityAnswer(incomeType),
      horizon: rest.horizonYears !== undefined ? horizonAnswer(rest.horizonYears) : (given.horizon ?? horizonAnswer(horizonYears)),
      reaction: given.reaction ?? DEFAULT_REACTION,
    };
    const m6: M6Input = {
      age,
      lumpSum: 0,
      monthly: 0,
      ...rest,
      risk,
      horizonYears,
      gate: rest.gate ?? { hasEmergencyFund: false, hasCardDebt: carriesCardDebt(input.m3) },
    };
    input.m6 = m6;
  }

  if (hasOverrideAnswers(overrides.m7)) {
    const answers = definedOnly(overrides.m7);
    const m7: M7Input = { mode: "working", age, monthlySpending: essentials, savings: m1.liquidSavings, monthlySaving: 0, ...answers };
    input.m7 = m7;
    if (answers.savings === undefined) input.m7SavingsDefault = true;
  }
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

/** Buckets still shown with nothing this month when they are not green: the need does not go away. */
const KEEP_WHEN_UNFUNDED: ReadonlySet<BucketId> = new Set<BucketId>(["insurance", "debt", "retirement"]);

/**
 * Drop buckets that get nothing this month, except the emergency fund once it is full (`keepFull`,
 * so the user sees that it is done) and an insurance, debt or retirement bucket that is not green
 * (so an unfunded need stays visible).
 */
function dropEmpty(drafts: BucketDraft[], emergencyFull: boolean): BucketDraft[] {
  return drafts.filter((d) => d.amount > 0 || (d.id === "emergency" && emergencyFull) || (KEEP_WHEN_UNFUNDED.has(d.id) && d.status !== "green"));
}

/** Runs an optional module; an error drops it from the plan (with a note) instead of failing the whole plan. */
function optional<T>(run: () => T, onError: () => void): T | undefined {
  try {
    return run();
  } catch {
    onError();
    return undefined;
  }
}

/** Funded → green, partly funded → amber, nothing → red. */
function fundedStatus(amount: Money, need: Money): Status {
  return amount >= need ? "green" : amount > 0 ? "amber" : "red";
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

/** Months the debt payoff simulation runs before it calls the pace "never" (50 years). */
const PAYOFF_HORIZON_MONTHS = 600;

function highestRate(debt: M3Result): number {
  let top = 0;
  for (const d of debt.highInterestDebts) if (d.annualRate > top) top = d.annualRate;
  return top;
}

export function computePlan(input: PlanInput, rates: RatesSnapshot, today: ISODate): Plan {
  assertProfile(input.profile);
  const R = roundingFor(rates);
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
  // M2, M6 and M7 are optional: one stale or impossible answer drops that module, never the plan.
  const m2 = input.m2;
  const insurance: M2Result | undefined = m2 ? optional(() => computeInsurance(m2, rates, today), () => ex.note("plan.note.insuranceSkipped")) : undefined;
  // M6's gate is what this plan's own M1 and M3 say, whatever the caller put there.
  const m6 = input.m6;
  const allocationResult: M6Result | undefined = m6
    ? optional(
        () => computeAllocation({ ...m6, gate: { hasEmergencyFund: emergency.gap === 0, hasCardDebt: carriesCardDebt(input.m3) } }, rates, today),
        () => ex.note("plan.note.allocationSkipped"),
      )
    : undefined;
  // An explicit allocation hook wins over the computed weights. The plan's long-term money uses M6's
  // age-and-profile weights without M6's horizon rule (that rule is about one pot, not the whole plan).
  const allocation: Allocation | undefined =
    input.allocation ??
    (m6 && allocationResult ? optional(() => allocationWeights(m6.age, allocationResult.profile, rates, m6.goldShare), () => ex.note("plan.note.allocationSkipped")) : undefined);
  const goals: M5Result | undefined =
    input.m5 && input.m5.goals.length > 0 ? (allocation ? computeGoals(input.m5, rates, today, allocation) : computeGoals(input.m5, rates, today)) : undefined;
  // M7's default savings (M1's liquid savings) count only above the emergency-fund target.
  const m7In: M7Input | undefined = input.m7
    ? retirementInput(input.m7, allocation, rates, input.m7SavingsDefault ? Math.max(0, input.m7.savings - emergency.target) : undefined)
    : undefined;
  const retirement: M7Result | undefined = m7In ? optional(() => computeRetirement(m7In, rates, today), () => ex.note("plan.note.retirementSkipped")) : undefined;

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
    emergencyAmount = Math.min(total, emergency.gap, roundMoney(clamped, "monthly", R));
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

  // (2) Insurance premiums: M2's monthly premium need (an explicit input.insurance hook wins).
  const premiumNeed = input.insurance?.monthlyPremiumNeed ?? insurance?.monthlyPremiumNeed;
  if (premiumNeed !== undefined) {
    const need = roundMoney(Math.max(0, premiumNeed), "monthly", R);
    // While high-interest debt is open, insurance may take only part of what is left, so the debt
    // still shrinks (plan_insurance_max_share_with_debt, our assumption).
    const hasHighInterestDebt = (debt?.highInterestDebts.length ?? 0) > 0;
    const cap = hasHighInterestDebt ? roundMoney(remaining * ex.use("plan_insurance_max_share_with_debt"), "monthly", R) : remaining;
    const amount = Math.min(remaining, cap, need);
    drafts.push({
      id: "insurance",
      amount,
      instrument: "term_insurance",
      status: insurance ? insurance.status : amount >= need ? "green" : "amber",
      reasonKey: "plan.reason.insurance",
      reasonParams: { amount },
      nextStepKey: "plan.next.insurance",
      module: "m2",
    });
    remaining = Math.max(0, remaining - amount);
  }

  // (3) High-interest debt: clear the balances over debt_payoff_target_months.
  if (debt && debt.highInterestDebts.length > 0) {
    const balance = sum(debt.highInterestDebts.map((d) => d.balance));
    const need = roundMoney(balance / payoffMonths, "monthly", R);
    const amount = Math.min(remaining, need);
    ex.step({ id: "plan.debtShare", inputs: { remaining, headroom: need }, raw: Math.min(remaining, balance / payoffMonths), rounded: amount, unit: "bdt" });
    // Months to clear the debts with interest: the minimum payments plus this extra amount, highest
    // rate first (M3's avalanche). Not cleared within PAYOFF_HORIZON_MONTHS → "never at this pace".
    const payoff = simulatePayoff(debt.highInterestDebts, amount, "avalanche", PAYOFF_HORIZON_MONTHS, R);
    const open = debt.highInterestDebts.filter((d) => d.balance >= 0.5).length;
    const cleared = payoff.order.length >= open;
    const paceParams: Record<string, number> = cleared ? { months: payoff.months } : { neverAtPace: 1 };
    const draft: BucketDraft = {
      id: "debt",
      amount,
      instrument: "loan_prepayment",
      status: debt.status,
      reasonKey: "plan.reason.debt",
      reasonParams: { amount, rate: highestRate(debt), count: debt.highInterestDebts.length, ...paceParams },
      nextStepKey: "plan.next.prepayDebt",
      module: "m3",
    };
    const only = debt.highInterestDebts.length === 1 ? debt.highInterestDebts[0] : undefined;
    if (only) draft.refId = only.id;
    drafts.push(draft);
    remaining = Math.max(0, remaining - amount);
  }

  // (4)+(5) Goals and retirement share what is left after debt (PRD: "then goals and retirement"):
  // when both needs do not fit, each side gets the remainder in proportion to its monthly need.
  const retirementNeedRaw = input.retirement?.monthlyNeed ?? retirement?.monthlyNeed;
  const retirementNeed: Money | undefined = retirementNeedRaw === undefined ? undefined : roundMoney(Math.max(0, retirementNeedRaw), "monthly", R);
  const validGoals: GoalResult[] = goals && input.m5 ? goals.goals.filter((g) => g.valid) : [];
  const goalsNeed = sum(validGoals.map((g) => g.monthly.base));
  const sharedAvailable = remaining;
  const demand = goalsNeed + (retirementNeed ?? 0);
  const fits = demand <= sharedAvailable;
  const goalsPool = fits ? goalsNeed : demand > 0 ? (sharedAvailable * goalsNeed) / demand : 0;
  const retirementPool = fits ? (retirementNeed ?? 0) : demand > 0 ? (sharedAvailable * (retirementNeed ?? 0)) / demand : 0;

  // (4) Goals: split the goals' share in proportion to each goal's monthly need.
  const goalExplains: Explanation[] = [];
  let goalsShortfall: Money = 0;
  if (goals && input.m5) {
    const byId = new Map<string, Goal>(input.m5.goals.map((g) => [g.id, g]));
    let allocatedTotal: Money = 0;
    const allocations: { goalId: string; need: Money; share: number; amount: Money }[] = [];
    for (const g of validGoals) {
      const need = g.monthly.base;
      const share = goalsNeed > 0 ? (goalsPool * need) / goalsNeed : 0;
      const amount = Math.max(0, Math.min(need, roundMoney(Math.min(need, share), "monthly", R), remaining));
      allocations.push({ goalId: g.goalId, need, share: Math.min(need, share), amount });
      allocatedTotal += amount;
      remaining = Math.max(0, remaining - amount);
      const goal = byId.get(g.goalId);
      drafts.push({
        id: "goal",
        refId: g.goalId,
        amount,
        instrument: g.instrument,
        // Green only when funded and beating inflation: a goal that gets less than its need is amber.
        status: g.belowInflation ? "red" : amount < need ? "amber" : g.status,
        reasonKey: "plan.reason.goal",
        reasonParams: {
          name: goal?.name ?? g.goalId,
          amount,
          need,
          instrument: g.instrument,
          fv: g.futureValue,
          years: goal?.years ?? roundDecimals(g.months / 12, 1),
        },
        // A long goal priced at the M6 mix is bought bucket by bucket: the next step is the asset mix.
        nextStepKey: allocation && g.horizon === "long" ? "plan.next.allocation" : nextStepForInstrument(g.instrument),
        module: "m5",
      });
      goalExplains.push(g.explain);
    }
    if (validGoals.length > 0) {
      goalsShortfall = Math.max(0, goalsNeed - allocatedTotal);
      ex.step({
        id: "plan.goalsShare",
        inputs: { remaining: sharedAvailable, goalsNeed, retirementNeed: retirementNeed ?? 0, goalsPool },
        raw: Math.min(goalsPool, goalsNeed),
        rounded: allocatedTotal,
        unit: "bdt",
      });
      for (const a of allocations) {
        ex.step({ id: "plan.goalAllocation", inputs: { goalId: a.goalId, need: a.need, goalsNeed, remaining: goalsPool }, raw: a.share, rounded: a.amount, unit: "bdt" });
      }
    }
  }

  // The long-term instrument: the allocation's largest bucket, or a DPS habit without one.
  const longTermInstrument: Instrument = allocation ? dominantSlot(allocation, rates) : "dps";

  // (5) Retirement: M7's monthly saving to the plan-to age (an explicit input.retirement hook wins),
  // up to its share of what is left.
  let retirementShortfall: Money | undefined;
  if (retirementNeed !== undefined) {
    const need = retirementNeed;
    const amount = Math.max(0, Math.min(remaining, need, roundMoney(retirementPool, "monthly", R)));
    retirementShortfall = Math.max(0, need - amount);
    const planTo = retirement?.planToAge ?? ex.use("plan_to_age");
    // The age the money lasts to at the amount the plan can put aside (M7 rerun at that saving).
    let lastsTo: number | undefined = amount >= need ? planTo : undefined;
    if (lastsTo === undefined && retirement && m7In) {
      const atAmount = optional(() => computeRetirement({ ...m7In, monthlySaving: amount }, rates, today), () => undefined);
      if (atAmount) lastsTo = atAmount.verdict.age;
    }
    // Long-horizon money: the allocation's largest bucket, else the growth slot (equity fund), never a DPS.
    const longAllocation = m7In?.allocation ?? allocation;
    const unavailable = rates.country?.unavailable ?? [];
    const instrument: Instrument = longAllocation ? dominantSlot(longAllocation, rates) : unavailable.includes("equity_fund") ? mixFixedIncomeSlot(rates) : "equity_fund";
    drafts.push({
      id: "retirement",
      amount,
      instrument,
      status: fundedStatus(amount, need),
      reasonKey: "plan.reason.retirement",
      reasonParams: { amount, need, planTo, ...(lastsTo !== undefined ? { lastsTo } : {}) },
      nextStepKey: "plan.next.retirement",
      module: "m7",
    });
    remaining = Math.max(0, remaining - amount);
  }

  // (6) Room to spare (or nothing to aim at yet): long-term savings so the buckets always add up to the
  // budget; with an allocation it follows the mix (M6), otherwise it starts a DPS habit and asks for a
  // goal. Omitted when nothing is left.
  if (remaining > 0) {
    drafts.push({
      id: "future",
      amount: remaining,
      instrument: longTermInstrument,
      status: "green",
      reasonKey: "plan.reason.future",
      reasonParams: { amount: remaining, instrument: longTermInstrument },
      nextStepKey: allocation ? "plan.next.allocation" : "plan.next.addGoal",
      module: allocation ? "m6" : "m5",
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
  if (retirementShortfall !== undefined) summary.retirementShortfall = retirementShortfall;

  // M2 / M6 / M7 explanations stay on plan.insurance / allocation / retirement (each bucket's
  // "Why this number?" picks its own); they join plan.explain once their dictionaries exist.
  const parts: Explanation[] = [ex.done(), budget.explain, emergency.explain];
  if (debt) parts.push(debt.explain);
  parts.push(...goalExplains);
  const explain = mergeExplanations(parts);

  const plan: Plan = { monthlyTotal, buckets, emergency, budget, summary, explain };
  if (debt) plan.debt = debt;
  if (goals) plan.goals = goals;
  if (insurance) plan.insurance = insurance;
  if (allocationResult) plan.allocation = allocationResult;
  if (retirement) plan.retirement = retirement;
  return plan;
}

/**
 * The M7 input the plan runs: the plan's allocation as the accumulation mix when the user set none
 * (no allocation → M7's retirement_accumulation_return_* default), `savings` replaced when given, and
 * "retired" for a working-mode user already at or past their retirement age (their own, e.g. an answer
 * given at 59 for 60 when the profile now says 61, or the default when they gave none): no saving years
 * are left.
 */
function retirementInput(m7: M7Input, allocation: Allocation | undefined, rates: RatesSnapshot, savings?: Money): M7Input {
  const out: M7Input = { ...m7 };
  if (savings !== undefined) out.savings = savings;
  if (out.allocation === undefined && allocation !== undefined) out.allocation = allocation;
  if (out.mode === "working") {
    const retireAt = out.retirementAge ?? getRate(rates, out.retireeType === "government" ? "retirement_age_government" : "retirement_age_default");
    if (out.age >= retireAt) out.mode = "retired";
  }
  return out;
}
