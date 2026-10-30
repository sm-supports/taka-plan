import { EngineError, type ISODate } from "../types";
import type { RatesSnapshot } from "../rates";
import type { M3Input, M3Result } from "./types";

export function computeDebtHealth(_input: M3Input, _rates: RatesSnapshot, _today: ISODate): M3Result {
  throw new EngineError("INVALID_INPUT", "not implemented: computeDebtHealth");
}
