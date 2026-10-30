/**
 * Picks the Explanation behind a plan figure. A bucket has no explanation of its own: its
 * numbers come from its module result plus the one plan.* split step that produced its amount.
 */
import { mergeExplanations, type Bucket, type Explanation, type Plan, type PlanStepId, type RateKey } from "@taka/engine";

const EMPTY: Explanation = { steps: [], assumptions: [], notes: [] };

/** Rows each plan split step reads; `plan.explain` is a merge of every module, so this picks the plan's own rows per step. */
const STEP_ASSUMPTIONS: Record<PlanStepId, readonly RateKey[]> = {
  "plan.total": ["savings_rate_default"],
  "plan.emergencyShare": ["plan_emergency_min_share"],
  "plan.debtShare": ["high_interest_debt_threshold", "debt_payoff_target_months"],
  "plan.goalsShare": [],
};

/** The plan-level explanation reduced to the named split steps and their rows (module notes stay with their module). */
function planSteps(plan: Plan, ids: readonly PlanStepId[]): Explanation {
  const wanted: ReadonlySet<string> = new Set(ids);
  const keys: ReadonlySet<RateKey> = new Set(ids.flatMap((id) => STEP_ASSUMPTIONS[id]));
  return {
    steps: plan.explain.steps.filter((s) => wanted.has(s.id)),
    assumptions: plan.explain.assumptions.filter((a) => keys.has(a.key)),
    notes: [],
  };
}

/** Behind the headline "Save ৳X a month": the save-first budget and the plan total. */
export function headlineExplanation(plan: Plan): Explanation {
  return mergeExplanations([plan.budget.explain, planSteps(plan, ["plan.total"])]);
}

export function bucketExplanation(plan: Plan, bucket: Bucket): Explanation {
  switch (bucket.id) {
    case "emergency":
      return mergeExplanations([plan.emergency.explain, planSteps(plan, ["plan.emergencyShare"])]);
    case "debt":
      return mergeExplanations([plan.debt?.explain ?? EMPTY, planSteps(plan, ["plan.debtShare"])]);
    case "goal": {
      const goal = plan.goals?.goals.find((g) => g.goalId === bucket.refId);
      return mergeExplanations([goal?.explain ?? EMPTY, planSteps(plan, ["plan.goalsShare"])]);
    }
    case "future":
      return mergeExplanations([plan.budget.explain, planSteps(plan, ["plan.goalsShare"])]);
    case "insurance":
      return planSteps(plan, ["plan.total"]);
  }
}
