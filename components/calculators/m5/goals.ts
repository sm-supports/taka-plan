/** Pure helpers for the goal planner UI: draft validation and the one-red rule across goals. */
import type { Goal, GoalType, Status } from "@taka/engine";

export const GOAL_TYPES: GoalType[] = ["general", "education", "health", "wedding", "vehicle", "home", "travel"];
export const MIN_YEARS = 1;
export const MAX_YEARS = 40;
export const DEFAULT_YEARS = 5;

/** A goal in the making: cost may still be blank. */
export interface GoalDraft {
  name: string;
  cost: number | null;
  years: number;
  type: GoalType;
}

export const EMPTY_DRAFT: GoalDraft = { name: "", cost: null, years: DEFAULT_YEARS, type: "general" };

/** PRD: a goal without name, cost and years is not saved. */
export function isValidDraft(d: GoalDraft): d is GoalDraft & { cost: number } {
  return d.name.trim().length > 0 && d.cost !== null && Number.isFinite(d.cost) && d.cost > 0 && Number.isInteger(d.years) && d.years >= MIN_YEARS && d.years <= MAX_YEARS;
}

export function draftToGoal(d: GoalDraft & { cost: number }, id: string): Goal {
  return { id, name: d.name.trim(), cost: d.cost, years: d.years, type: d.type };
}

/**
 * At most one red on screen: the first red keeps its colour, every later red shows as amber
 * with the "also needs attention" caption. Returns the display status per index.
 */
export function applyOneRed(statuses: readonly Status[]): Array<{ status: Status; demotedFromRed: boolean }> {
  let seenRed = false;
  return statuses.map((s) => {
    if (s !== "red") return { status: s, demotedFromRed: false };
    if (seenRed) return { status: "amber", demotedFromRed: true };
    seenRed = true;
    return { status: "red", demotedFromRed: false };
  });
}
