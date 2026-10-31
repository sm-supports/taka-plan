import type { RatesSnapshot } from "../rates";
import { EngineError, type ISODate } from "../types";
import type { M2Input, M2Result } from "./types";

/** M2 Insurance & health. See the formulas in ./types.ts. */
export function computeInsurance(_input: M2Input, _rates: RatesSnapshot, _today: ISODate): M2Result {
  throw new EngineError("INVALID_INPUT", "M2 not implemented yet");
}
