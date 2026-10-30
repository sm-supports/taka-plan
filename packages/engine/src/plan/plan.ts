import { EngineError, type ISODate, type Profile } from "../types";
import type { RatesSnapshot } from "../rates";
import type { Plan, PlanInput } from "./types";

/** Fill PRD defaults from the five onboarding answers (soleEarner, no health insurance, no savings, m3 only when hasDebt). */
export function profileToPlanInput(_profile: Profile, _overrides?: Partial<Pick<PlanInput, "m1" | "m3" | "m4" | "m5">>): PlanInput {
  throw new EngineError("INVALID_INPUT", "not implemented: profileToPlanInput");
}

export function computePlan(_input: PlanInput, _rates: RatesSnapshot, _today: ISODate): Plan {
  throw new EngineError("INVALID_INPUT", "not implemented: computePlan");
}
