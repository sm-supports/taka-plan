/** Pure percent-text helpers for RateInput: "12", "12.5 %", "১২" → decimal Rate; null when blank or out of range. */
import { fromBanglaDigits } from "@taka/engine";

const MAX_PERCENT = 100;

export function parsePercent(raw: string): number | null {
  const cleaned = fromBanglaDigits(raw).replace(/[%\s,]/g, "");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0 || n > MAX_PERCENT) return null;
  return n / 100;
}

/** Decimal Rate → percent text with up to 2 dp ("0.1183" → "11.83"). */
export function percentText(rate: number | null): string {
  if (rate === null) return "";
  return String(Math.round(rate * 10000) / 100);
}
