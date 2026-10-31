// Formatting for the admin table: values by unit, always Latin digits (the admin reads source documents in English).
import { formatNumber, formatPercent, formatTaka, type RateRow, type RateUnit } from "@taka/engine";

const DIGITS = "latn" as const;

/** Trims trailing zeros of a fixed-decimal string. */
function trimZeros(s: string): string {
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
}

/** A row's numeric value in its unit: "11.83%", "৳2,00,000", "72.3 years", JSON for json rows. */
export function formatValue(row: Pick<RateRow, "value" | "valueJson" | "unit">): string {
  if (row.unit === "json" || row.value === null || row.value === undefined) {
    return row.valueJson === undefined ? "—" : JSON.stringify(row.valueJson);
  }
  return formatByUnit(row.value, row.unit);
}

export function formatByUnit(value: number, unit: RateUnit): string {
  switch (unit) {
    case "rate":
      return trimZeros(formatPercent(value, { digits: DIGITS, decimals: 2 }).replace("%", "")) + "%";
    case "bdt":
      return formatTaka(value, { digits: DIGITS });
    case "years":
      return `${trimZeros(formatNumber(value, { digits: DIGITS, decimals: 1 }))} yrs`;
    case "months":
      return `${trimZeros(formatNumber(value, { digits: DIGITS, decimals: 0 }))} mo`;
    case "ratio":
      return trimZeros(formatNumber(value, { digits: DIGITS, decimals: 3 }));
    case "json":
    default:
      return String(value);
  }
}

/** "Range 1.25%–3%" or null when the row has no range. */
export function formatRange(row: Pick<RateRow, "rangeLow" | "rangeHigh" | "unit">): string | null {
  const lo = row.rangeLow;
  const hi = row.rangeHigh;
  if (lo === null || lo === undefined || hi === null || hi === undefined) return null;
  return `${formatByUnit(lo, row.unit)}–${formatByUnit(hi, row.unit)}`;
}

/** Editor text ↔ stored number. Rates are edited as per cent ("11.83"), everything else as-is. */
export function valueToInput(value: number | null | undefined, unit: RateUnit): string {
  if (value === null || value === undefined) return "";
  if (unit === "rate") return trimZeros((value * 100).toFixed(6));
  return String(value);
}

export function inputToValue(text: string, unit: RateUnit): number | null {
  const cleaned = text.replace(/[,%\s৳]/g, "");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  // Per-cent input → fraction, rounded to kill float noise (11.83 / 100 = 0.11830000000000001).
  return unit === "rate" ? Math.round(n * 1e8) / 1e10 : n;
}

export function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** "2026-11-01T10:00:00.000Z" → "2026-11-01 10:00" (UTC). */
export function formatWhen(iso: string): string {
  return iso.replace("T", " ").slice(0, 16) + (iso.endsWith("Z") ? " UTC" : "");
}

/** A rates key as a readable label: "fdr_1y_rate" → "fdr 1y rate". */
export function keyWords(key: string): string {
  return key.replace(/_/g, " ");
}

/** JSON with object keys sorted, so key order never counts as a change. */
export function stableJson(x: unknown): string {
  return JSON.stringify(x ?? null, (_k, v: unknown) =>
    v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) : v,
  );
}
