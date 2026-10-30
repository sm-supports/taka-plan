/** Maps a thrown engine error to an `errors.*` dictionary key for the ErrorCard. */
import { isEngineError } from "@taka/engine";

export type EngineErrorKey = "errors.engineNotReady" | "errors.invalidInput" | "errors.missingRate" | "errors.generic";

export function engineErrorKey(e: unknown): EngineErrorKey {
  if (isEngineError(e)) {
    if (e.message.startsWith("not implemented")) return "errors.engineNotReady";
    if (e.code === "MISSING_RATE") return "errors.missingRate";
    return "errors.invalidInput";
  }
  return "errors.generic";
}

/** Today as YYYY-MM-DD (UTC), for the engine's `today` argument. */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
