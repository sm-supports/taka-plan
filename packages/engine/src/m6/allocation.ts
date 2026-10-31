import type { Allocation } from "../m5/types";
import type { RatesSnapshot } from "../rates";
import { EngineError, type ISODate, type Rate } from "../types";
import type { M6Input, M6Result, RiskProfile } from "./types";

/** F1 bands: 0–3 careful, 4–5 balanced, 6–8 growth. */
export function riskProfileFor(score: number): RiskProfile {
  if (!Number.isInteger(score) || score < 0 || score > 8) throw new EngineError("INVALID_INPUT", "risk score must be an integer 0–8", { score });
  return score <= 3 ? "careful" : score <= 5 ? "balanced" : "growth";
}

/** F2 target weights for an age and profile (no horizon rule). Used by M5 and M7 as the allocation hook. */
export function allocationWeights(_age: number, _profile: RiskProfile, _rates: RatesSnapshot, _goldShare?: Rate): Allocation {
  throw new EngineError("INVALID_INPUT", "M6 not implemented yet");
}

/** M6 Asset allocation. See the formulas in ./types.ts. */
export function computeAllocation(_input: M6Input, _rates: RatesSnapshot, _today: ISODate): M6Result {
  throw new EngineError("INVALID_INPUT", "M6 not implemented yet");
}
