import { EngineError, type ISODate } from "../types";
import type { RatesSnapshot } from "../rates";
import type { M1Input, M1Result } from "./types";

/** Suggested months of cover from the household profile (PRD M1 heuristic). */
export function suggestMonths(
  _input: Pick<M1Input, "incomeType" | "dependents" | "soleEarner" | "hasHealthInsurance">,
  _rates: RatesSnapshot,
): number {
  throw new EngineError("INVALID_INPUT", "not implemented: suggestMonths");
}

export function computeEmergencyFund(_input: M1Input, _rates: RatesSnapshot, _today: ISODate): M1Result {
  throw new EngineError("INVALID_INPUT", "not implemented: computeEmergencyFund");
}
