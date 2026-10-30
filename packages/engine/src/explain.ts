import { getRow, isStale, type RateKey, type RateRow, type RateUnit, type RatesSnapshot } from "./rates";
import { EngineError, type ISODate } from "./types";

/** One rates-table row that a calculation used, as shown in "Why this number?". */
export interface Assumption {
  key: RateKey;
  value: number | null;
  unit: RateUnit;
  labelEn: string;
  labelBn?: string | null;
  asOf: ISODate;
  sourceUrl: string;
  sourceName: string;
  stale: boolean;
  isAppAssumption: boolean;
}

export type ExplainUnit = "bdt" | "months" | "rate" | "count" | "years";

/**
 * One formula step. `id` is a stable dictionary key (e.g. "m1.target") declared in the
 * module's STEP_IDS; `inputs` are the named symbols the dictionary template substitutes.
 */
export interface ExplainStep {
  id: string;
  inputs: Record<string, number | string>;
  raw: number;
  rounded: number;
  unit: ExplainUnit;
}

export interface Explanation {
  steps: ExplainStep[];
  assumptions: Assumption[];
  /** Dictionary keys for free-text notes (e.g. "m5.note.noAllocationYet"). */
  notes: string[];
}

export function toAssumption(row: RateRow, today: ISODate): Assumption {
  return {
    key: row.key,
    value: row.value ?? null,
    unit: row.unit,
    labelEn: row.labelEn,
    labelBn: row.labelBn ?? null,
    asOf: row.asOf,
    sourceUrl: row.sourceUrl,
    sourceName: row.sourceName,
    stale: isStale(row, today),
    isAppAssumption: row.isAppAssumption,
  };
}

export interface ExplainBuilder {
  /** Read a numeric rate and record it as an assumption (once per key). */
  use(key: RateKey): number;
  /** Record a row without reading a numeric value (for JSON rows). */
  useRow(key: RateKey): RateRow;
  /** Record a step and return its rounded value. */
  step(st: ExplainStep): number;
  note(key: string): void;
  done(): Explanation;
}

export function createExplain(s: RatesSnapshot, today: ISODate): ExplainBuilder {
  const steps: ExplainStep[] = [];
  const used = new Map<RateKey, Assumption>();
  const notes: string[] = [];
  const record = (key: RateKey): RateRow => {
    const row = getRow(s, key);
    if (!used.has(key)) used.set(key, toAssumption(row, today));
    return row;
  };
  return {
    use(key) {
      const row = record(key);
      if (row.value === null || row.value === undefined || !Number.isFinite(row.value)) {
        throw new EngineError("MISSING_RATE", `Rates row "${key}" has no numeric value`, { key });
      }
      return row.value;
    },
    useRow: record,
    step(st) {
      steps.push(st);
      return st.rounded;
    },
    note(key) {
      if (!notes.includes(key)) notes.push(key);
    },
    done() {
      return { steps: [...steps], assumptions: [...used.values()], notes: [...notes] };
    },
  };
}

/** Merge several explanations (plan screen aggregates module explanations). */
export function mergeExplanations(parts: Explanation[]): Explanation {
  const steps: ExplainStep[] = [];
  const assumptions = new Map<RateKey, Assumption>();
  const notes: string[] = [];
  for (const p of parts) {
    steps.push(...p.steps);
    for (const a of p.assumptions) if (!assumptions.has(a.key)) assumptions.set(a.key, a);
    for (const n of p.notes) if (!notes.includes(n)) notes.push(n);
  }
  return { steps, assumptions: [...assumptions.values()], notes };
}
