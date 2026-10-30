import { EngineError, type ISODate, type Instrument, type Money, type Rate } from "../types";
import type { RatesSnapshot } from "../rates";
import type { Allocation, Horizon, M5Input, M5Result } from "./types";

/** C × (1 + i)^n. */
export function futureValue(_cost: Money, _inflation: Rate, _years: number): number {
  throw new EngineError("INVALID_INPUT", "not implemented: futureValue");
}

/** FV × rm / ((1 + rm)^n − 1), rm = annual/12. rm = 0 → FV / n. */
export function sinkingFundMonthly(_fv: Money, _annualAfterTax: Rate, _months: number): number {
  throw new EngineError("INVALID_INPUT", "not implemented: sinkingFundMonthly");
}

export function horizonFor(_years: number): Horizon {
  throw new EngineError("INVALID_INPUT", "not implemented: horizonFor");
}

/** Candidate instruments by horizon. `allocation` is the M6 hook (unused in MVP). */
export function instrumentsFor(_h: Horizon, _allocation?: Allocation): Instrument[] {
  throw new EngineError("INVALID_INPUT", "not implemented: instrumentsFor");
}

export function computeGoals(_input: M5Input, _rates: RatesSnapshot, _today: ISODate): M5Result {
  throw new EngineError("INVALID_INPUT", "not implemented: computeGoals");
}
