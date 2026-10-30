import { EngineError, type ISODate } from "../types";
import type { RatesSnapshot } from "../rates";
import type { M4Input, M4Result } from "./types";

export function computeSaveFirst(_input: M4Input, _rates: RatesSnapshot, _today: ISODate): M4Result {
  throw new EngineError("INVALID_INPUT", "not implemented: computeSaveFirst");
}
