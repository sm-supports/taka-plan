/** Maps a thrown engine error to the errors.* dictionary key the ErrorCard shows. */
import { isEngineError } from "@taka/engine";

export type CalcErrorKey = "errors.engineNotReady" | "errors.invalidInput" | "errors.missingRate" | "errors.generic";

export function calcErrorKey(e: unknown): CalcErrorKey {
  const message = e instanceof Error ? e.message : String(e);
  if (/not implemented/i.test(message)) return "errors.engineNotReady";
  if (isEngineError(e)) return e.code === "MISSING_RATE" ? "errors.missingRate" : "errors.invalidInput";
  return "errors.generic";
}
