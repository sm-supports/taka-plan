import type { Explanation } from "../explain";
import type { M1Input, M1Result } from "../m1/types";
import type { M2Input, M2Result } from "../m2/types";
import type { M3Input, M3Result } from "../m3/types";
import type { M4Input, M4Result } from "../m4/types";
import type { Allocation, M5Input, M5Result } from "../m5/types";
import type { M6Input, M6Result } from "../m6/types";
import type { M7Input, M7Result } from "../m7/types";
import type { Instrument, Money, Profile, Rate, Status } from "../types";

export interface PlanInput {
  profile: Profile;
  m1: M1Input;
  m4: M4Input;
  m3?: M3Input;
  m5?: M5Input;
  /** M2 insurance & health inputs; when present the plan computes M2 and reserves its premium. */
  m2?: M2Input;
  /** M6 asset allocation inputs; its weights become the allocation hook for M5 and M7. */
  m6?: M6Input;
  /** M7 retirement inputs; its monthly saving becomes the retirement bucket. */
  m7?: M7Input;
  /** M2 hook (explicit override of the computed premium). */
  insurance?: { monthlyPremiumNeed: Money };
  /** M6 hook (explicit override of the computed weights). */
  allocation?: Allocation;
  /** M7 hook (explicit override of the computed monthly saving). */
  retirement?: { monthlyNeed: Money };
}

/** Per-module overrides layered on top of the onboarding defaults in profileToPlanInput. */
export interface PlanOverrides {
  m1?: Partial<M1Input>;
  m3?: Partial<M3Input>;
  m4?: Partial<M4Input>;
  m5?: M5Input;
  m2?: Partial<M2Input>;
  m6?: Partial<M6Input>;
  m7?: Partial<M7Input>;
}

export type BucketId = "emergency" | "insurance" | "debt" | "goal" | "retirement" | "future";
export type BucketInstrument = Instrument | "loan_prepayment" | "term_insurance";
export type BucketModule = "m1" | "m2" | "m3" | "m5" | "m6" | "m7";

export interface Bucket {
  id: BucketId;
  /** Goal id or debt id when the bucket refers to one item. */
  refId?: string;
  /** 1 = highest. Buckets are listed in this order. */
  priority: number;
  amount: Money;
  instrument: BucketInstrument;
  status: Status;
  demotedFromRed: boolean;
  /** Dictionary key under plan.reason.* with `reasonParams` substituted. */
  reasonKey: string;
  reasonParams: Record<string, number | string>;
  /** Dictionary key under plan.next.* with the concrete next step. */
  nextStepKey: string;
  module: BucketModule;
}

export interface PlanSummary {
  emergencyShare: Rate;
  monthsToEmergencyFull: number | null;
  goalsShortfall: Money;
}

export interface Plan {
  monthlyTotal: Money;
  buckets: Bucket[];
  emergency: M1Result;
  budget: M4Result;
  debt?: M3Result;
  goals?: M5Result;
  insurance?: M2Result;
  allocation?: M6Result;
  retirement?: M7Result;
  summary: PlanSummary;
  explain: Explanation;
}

export const PLAN_STEP_IDS = ["plan.total", "plan.emergencyShare", "plan.debtShare", "plan.goalsShare", "plan.goalAllocation"] as const;
export type PlanStepId = (typeof PLAN_STEP_IDS)[number];

export const PLAN_REASON_KEYS = ["plan.reason.emergency", "plan.reason.emergencyFull", "plan.reason.debt", "plan.reason.goal", "plan.reason.addGoal", "plan.reason.insurance", "plan.reason.retirement", "plan.reason.future"] as const;
export const PLAN_NEXT_KEYS = [
  "plan.next.fdrLadder",
  "plan.next.openSavings",
  "plan.next.keepFull",
  "plan.next.prepayDebt",
  "plan.next.dps",
  "plan.next.sanchayapatra",
  "plan.next.tbond",
  "plan.next.fdr",
  "plan.next.addGoal",
  "plan.next.insurance",
  "plan.next.retirement",
  "plan.next.allocation",
] as const;
