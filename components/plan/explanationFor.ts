/**
 * Picks the Explanation behind a plan figure. A bucket has no explanation of its own: its
 * numbers come from its module result plus the plan.* split step(s) that produced its amount.
 *
 * Step ids are matched as strings (not the engine's PlanStepId tuple) so this file keeps
 * compiling while the engine adds steps such as plan.goalAllocation.
 */
import { mergeExplanations, type Bucket, type Explanation, type ExplainStep, type Plan } from "@taka/engine";

const EMPTY: Explanation = { steps: [], assumptions: [], notes: [] };

/** Rows each plan split step reads; `plan.explain` is a merge of every module, so this picks the plan's own rows per step. */
const STEP_ASSUMPTIONS: Record<string, readonly string[]> = {
  "plan.total": ["savings_rate_default"],
  "plan.emergencyShare": ["plan_emergency_min_share", "plan_emergency_max_share"],
  "plan.debtShare": ["high_interest_debt_threshold", "debt_payoff_target_months"],
  "plan.goalsShare": [],
  "plan.goalAllocation": [],
};

/** The plan-level explanation reduced to the named split steps and their rows (module notes stay with their module). */
function planSteps(plan: Plan, ids: readonly string[], keep: (step: ExplainStep) => boolean = () => true): Explanation {
  const wanted: ReadonlySet<string> = new Set(ids);
  const keys: ReadonlySet<string> = new Set(ids.flatMap((id) => STEP_ASSUMPTIONS[id] ?? []));
  return {
    steps: plan.explain.steps.filter((s) => wanted.has(s.id) && keep(s)),
    assumptions: plan.explain.assumptions.filter((a) => keys.has(a.key)),
    notes: [],
  };
}

/** True for the plan.goalAllocation step that belongs to `goalId` (every other step passes). */
function forGoal(goalId: string | undefined): (step: ExplainStep) => boolean {
  return (step) => step.id !== "plan.goalAllocation" || (goalId !== undefined && step.inputs.goalId === goalId);
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
      return mergeExplanations([goal?.explain ?? EMPTY, planSteps(plan, ["plan.goalsShare", "plan.goalAllocation"], forGoal(bucket.refId))]);
    }
    case "future":
      // With an allocation the spare money follows the M6 mix, so its steps lead.
      return mergeExplanations([...(bucket.module === "m6" && plan.allocation ? [plan.allocation.explain] : []), plan.budget.explain, planSteps(plan, ["plan.goalsShare"])]);
    case "insurance":
      return mergeExplanations([plan.insurance?.explain ?? EMPTY, planSteps(plan, ["plan.total"])]);
    case "retirement":
      return mergeExplanations([plan.retirement?.explain ?? EMPTY, planSteps(plan, ["plan.total"])]);
  }
}
