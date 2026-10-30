/**
 * Pure helpers that turn an engine ExplainStep into dictionary params.
 * Rule (docs/ARCHITECTURE-CONTRACTS.md "Explain-template input names"): names ending in
 * Rate/inflation/tax/share → percent; months/years/count → number; `instrument` → translated
 * instrument name; everything else → taka. `{result}` is formatted by the step's unit.
 */
import type { Assumption, ExplainStep, ExplainUnit } from "@taka/engine";
import type { Formatters } from "@/lib/i18n/useFormat";
import type { TranslateParams } from "@/lib/i18n/types";

const PERCENT_NAME = /(rate|inflation|tax|share|nominal)$/i;
const NUMBER_NAME = /(months|years|count)$/i;

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

export function formatInput(name: string, value: number | string, f: Formatters, instrumentLabel: (id: string) => string): string {
  if (typeof value === "string") return name === "instrument" ? instrumentLabel(value) : value;
  if (PERCENT_NAME.test(name)) return f.percent(value);
  if (NUMBER_NAME.test(name)) return name.toLowerCase().endsWith("months") ? f.months(value) : f.number(value, Number.isInteger(value) ? 0 : 1);
  return f.taka(value);
}

/** Every `inputs` entry formatted, plus `result` = the rounded value in the step's unit. */
export function stepParams(step: ExplainStep, f: Formatters, instrumentLabel: (id: string) => string): TranslateParams {
  const params: TranslateParams = {};
  for (const [name, value] of Object.entries(step.inputs)) params[name] = formatInput(name, value, f, instrumentLabel);
  params.result = formatByUnit(step.rounded, step.unit, f);
  return params;
}

/** Assumption value in its row unit ("ratio" rows are shares → percent; json rows have no number). */
export function assumptionValue(a: Assumption, f: Formatters): string | null {
  if (a.value === null) return null;
  switch (a.unit) {
    case "rate":
    case "ratio":
      return f.percent(a.value);
    case "bdt":
      return f.taka(a.value);
    case "months":
      return f.months(a.value);
    case "years":
      return f.number(a.value, Number.isInteger(a.value) ? 0 : 1);
    case "json":
      return null;
  }
}

/** Label for an assumption row: Bangla label when present in bn, else the English one (never the dictionary). */
export function assumptionLabel(a: Assumption, locale: "bn" | "en"): string {
  return locale === "bn" && a.labelBn ? a.labelBn : a.labelEn;
}
