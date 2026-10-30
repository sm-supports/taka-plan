/**
 * Which glossary entry (terms.*) explains each instrument shown on a bucket card, so the
 * instrument name can be wrapped in <Term k=…>. Instruments with no jargon get no entry.
 */
import type { BucketId, BucketInstrument, BucketModule } from "@taka/engine";

export const TERM_KEYS = ["fdr", "dps", "sanchayapatra", "bo_account", "sum_insured", "emi", "cib", "tbill", "tbond", "ladder", "real_return", "take_home", "grace_period"] as const;
export type TermKey = (typeof TERM_KEYS)[number];

const TERM_KEY_SET: ReadonlySet<string> = new Set(TERM_KEYS);

export function isTermKey(x: string | null | undefined): x is TermKey {
  return typeof x === "string" && TERM_KEY_SET.has(x);
}

const INSTRUMENT_TERM: Partial<Record<BucketInstrument, TermKey>> = {
  fdr_3m: "fdr",
  fdr_1y: "fdr",
  dps: "dps",
  sanchayapatra_5y: "sanchayapatra",
  tbill_91d: "tbill",
  tbond_5y: "tbond",
  tbond_10y: "tbond",
  equity_fund: "bo_account",
  loan_prepayment: "emi",
  term_insurance: "sum_insured",
};

/** The emergency fund's FDR money is a ladder, which has its own entry. */
export function termForInstrument(instrument: BucketInstrument, bucket: BucketId): TermKey | undefined {
  if (bucket === "emergency" && instrument === "fdr_3m") return "ladder";
  return INSTRUMENT_TERM[instrument];
}

/** Calculator route per module; M2 and M7 are not built yet, so those buckets get no link. */
export function calculatorPath(module: BucketModule, locale: string): string | null {
  switch (module) {
    case "m1":
    case "m3":
    case "m5":
      return `/${locale}/${module}`;
    case "m2":
    case "m7":
      return null;
  }
}
