/**
 * Pure helpers that turn an engine ExplainStep / Assumption into pre-formatted strings for
 * the dictionary templates. No React: unit-testable and shared by WhyDrawer.
 *
 * Input naming convention (docs/ARCHITECTURE-CONTRACTS.md "Explain-template input names"):
 * names ending in Rate / inflation / tax / share (and nominal / afterTax / real) → percent;
 * months / years / count and the m1.months month counts → plain number; everything else → taka.
 * Instrument ids (strings) are translated via common.instrument; other strings (e.g. m1.months
 * `source`) pass through unchanged. Reference ids such as plan.goalAllocation's `goalId` are
 * never shown: they only tell the UI which bucket a step belongs to.
 */
import type { Assumption, ExplainStep, ExplainUnit, RateUnit } from "@taka/engine";
import type { Formatters } from "@/lib/i18n/useFormat";
import type { TFunction } from "@/lib/i18n/useT";
import type { TranslateParams } from "@/lib/i18n/types";

const PERCENT_SUFFIX = /(rate|inflation|tax|share)$/i;
const PERCENT_NAMES: ReadonlySet<string> = new Set(["nominal", "real", "afterTax"]);
const NUMBER_SUFFIX = /(months|years|count)$/i;
/** m1.months inputs: all whole-month counts, shown as plain numbers. */
const NUMBER_NAMES: ReadonlySet<string> = new Set(["base", "bumpIrregular", "bumpSoleEarner", "bumpNoHealth", "irregular", "soleEarner", "noInsurance", "min", "max", "suggested"]);
/** Inputs that identify something (a goal id) rather than describe a quantity: omitted from the template params. */
const HIDDEN_NAMES: ReadonlySet<string> = new Set(["goalId"]);

export function isHiddenInput(name: string): boolean {
  return HIDDEN_NAMES.has(name);
}

const INSTRUMENT_IDS: ReadonlySet<string> = new Set([
  "savings_account",
  "fdr_3m",
  "fdr_1y",
  "dps",
  "sanchayapatra_5y",
  "tbill_91d",
  "tbond_5y",
  "tbond_10y",
  "equity_fund",
  "gold",
  "loan_prepayment",
  "term_insurance",
]);

export function isInstrumentId(x: string): boolean {
  return INSTRUMENT_IDS.has(x);
}

/** Format one named input by the naming convention. */
export function formatInput(name: string, value: number | string, f: Formatters, t: TFunction): string {
  if (typeof value === "string") return isInstrumentId(value) ? t(`common.instrument.${value}`) : value;
  if (PERCENT_SUFFIX.test(name) || PERCENT_NAMES.has(name)) return f.percent(value);
  if (NUMBER_SUFFIX.test(name) || NUMBER_NAMES.has(name)) return f.number(value, Number.isInteger(value) ? 0 : 1);
  return f.taka(value);
}

/** Format a value by an ExplainStep unit (the step's `rounded` result). */
export function formatByUnit(value: number, unit: ExplainUnit, f: Formatters): string {
  switch (unit) {
    case "bdt":
      return f.taka(value);
    case "rate":
      return f.percent(value);
    case "months":
      return f.months(value);
    case "years":
    case "count":
      return f.number(value, Number.isInteger(value) ? 0 : 1);
  }
}

/** Every step input formatted (hidden ids left out), plus `result` = the rounded value in the step's unit. */
export function formatStepParams(step: ExplainStep, f: Formatters, t: TFunction): TranslateParams {
  const out: TranslateParams = {};
  for (const [name, v] of Object.entries(step.inputs)) {
    if (isHiddenInput(name)) continue;
    out[name] = formatInput(name, v, f, t);
  }
  out.result = formatByUnit(step.rounded, step.unit, f);
  return out;
}

/** A rates-table value formatted by its row unit; JSON rows have no single value. */
export function formatAssumptionValue(value: number | null, unit: RateUnit, f: Formatters, t: TFunction): string {
  if (value === null) return "—";
  switch (unit) {
    case "rate":
    case "ratio":
      return f.percent(value);
    case "bdt":
      return f.taka(value);
    case "months":
      return f.months(value);
    case "years":
      return `${f.number(value, Number.isInteger(value) ? 0 : 1)} ${t(value === 1 ? "common.unit.year" : "common.unit.years")}`;
    case "json":
      return "—";
  }
}

/** Bangla label when the row has one and the UI is in Bangla; English otherwise. */
export function assumptionLabel(a: Assumption, locale: "bn" | "en"): string {
  return locale === "bn" && a.labelBn ? a.labelBn : a.labelEn;
}

/** Only real web links get an anchor; "docs/PRD.md#…" style sources are shown as plain text. */
export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
