/**
 * Formats an engine ExplainStep into the `{placeholder}` params of its explain.* template.
 * Pure (no React) so it can be unit-tested. Mirrors the convention in docs/ARCHITECTURE-CONTRACTS.md:
 * names ending in rate/inflation/tax/share → percent; months/years/count (and the m1.months
 * symbols base/min/max/bump*) → plain number; Instrument ids → translated name; everything else → taka.
 */
import type { Assumption, ExplainStep } from "@taka/engine";
import type { TranslateParams } from "@/lib/i18n/types";
import type { Formatters } from "@/lib/i18n/useFormat";

export type ExplainInputKind = "percent" | "number" | "taka" | "instrument" | "text";

const INSTRUMENT_IDS: ReadonlySet<string> = new Set(["savings_account", "fdr_3m", "fdr_1y", "dps", "sanchayapatra_5y", "tbill_91d", "tbond_5y", "tbond_10y", "equity_fund", "gold"]);
const NUMBER_NAMES: ReadonlySet<string> = new Set(["base", "min", "max", "bumpIrregular", "bumpSoleEarner", "bumpNoHealth"]);
/** Percent inputs the suffix rule does not catch (m5.rate's headline rate). */
const PERCENT_NAMES: ReadonlySet<string> = new Set(["nominal"]);

export function classifyExplainInput(name: string, value: number | string): ExplainInputKind {
  if (typeof value === "string") return INSTRUMENT_IDS.has(value) ? "instrument" : "text";
  if (PERCENT_NAMES.has(name) || /(rate|inflation|tax|share)$/i.test(name)) return "percent";
  if (NUMBER_NAMES.has(name) || /(months|years|count)$/i.test(name)) return "number";
  return "taka";
}

export type InstrumentLabel = (id: string) => string;

export function formatExplainInput(name: string, value: number | string, f: Formatters, instrumentLabel: InstrumentLabel): string {
  if (typeof value === "string") return classifyExplainInput(name, value) === "instrument" ? instrumentLabel(value) : value;
  switch (classifyExplainInput(name, value)) {
    case "percent":
      return f.percent(value);
    case "number":
      return f.number(value, Number.isInteger(value) ? 0 : 1);
    default:
      return f.taka(value);
  }
}

/** The step's rounded result, formatted by the step's unit. */
export function formatStepResult(step: ExplainStep, f: Formatters): string {
  switch (step.unit) {
    case "bdt":
      return f.taka(step.rounded);
    case "months":
      return f.months(step.rounded);
    case "rate":
      return f.percent(step.rounded);
    case "years":
    case "count":
    default:
      return f.number(step.rounded, Number.isInteger(step.rounded) ? 0 : 1);
  }
}

/** Every `{slot}` the template can ask for: the step's inputs plus `{result}`. */
export function stepParams(step: ExplainStep, f: Formatters, instrumentLabel: InstrumentLabel): TranslateParams {
  const params: TranslateParams = {};
  for (const [name, value] of Object.entries(step.inputs)) params[name] = formatExplainInput(name, value, f, instrumentLabel);
  params.result = formatStepResult(step, f);
  return params;
}

/** A rates-table row's value, formatted by its unit ("—" for JSON rows). */
export function formatAssumptionValue(a: Assumption, f: Formatters): string {
  if (a.value === null) return "—";
  switch (a.unit) {
    case "rate":
    case "ratio":
      return f.percent(a.value);
    case "bdt":
      return f.taka(a.value);
    case "months":
      return f.months(a.value);
    case "years":
    case "json":
    default:
      return f.number(a.value);
  }
}
