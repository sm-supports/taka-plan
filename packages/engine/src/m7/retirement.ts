import type { RatesSnapshot } from "../rates";
import { EngineError, type ISODate } from "../types";
import type { M7Input, M7Result } from "./types";

/** M7 Retirement & family. See the formulas in ./types.ts. */
export function computeRetirement(_input: M7Input, _rates: RatesSnapshot, _today: ISODate): M7Result {
  throw new EngineError("INVALID_INPUT", "M7 not implemented yet");
}
