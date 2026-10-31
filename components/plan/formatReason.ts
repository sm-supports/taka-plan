/**
 * Formats a bucket's raw `reasonParams` (numbers and instrument ids from the engine) into the
 * strings the plan.reason.* templates expect. The same param name means different things per
 * reason (emergency `months` is a plain count; debt `months` is a duration), so the mapping is
 * per reason key, with a by-name fallback for keys this file does not know yet.
 */
import type { Bucket } from "@taka/engine";
import { isInstrumentId } from "@/components/explain/formatInputs";
import type { Formatters } from "@/lib/i18n/useFormat";
import type { TFunction } from "@/lib/i18n/useT";
import type { TranslateParams } from "@/lib/i18n/types";

type Kind = "taka" | "percent" | "number" | "months" | "years" | "instrument" | "text";

const BY_REASON: Record<string, Record<string, Kind>> = {
  "plan.reason.emergency": { amount: "taka", covered: "number", months: "number", instrument: "instrument" },
  "plan.reason.emergencyFull": { months: "number" },
  "plan.reason.debt": { rate: "percent", amount: "taka", months: "months", count: "number" },
  "plan.reason.goal": { name: "text", amount: "taka", need: "taka", instrument: "instrument", fv: "taka", years: "years" },
  "plan.reason.addGoal": {},
  "plan.reason.insurance": { amount: "taka" },
  // planTo is an age, not money (the by-name fallback would format it as taka).
  "plan.reason.retirement": { amount: "taka", planTo: "number" },
  "plan.reason.future": { amount: "taka", instrument: "instrument" },
};

function fallbackKind(name: string, value: number | string): Kind {
  if (typeof value === "string") return isInstrumentId(value) ? "instrument" : "text";
  if (/(rate|share)$/i.test(name)) return "percent";
  if (/months$/i.test(name)) return "months";
  if (/years$/i.test(name)) return "years";
  if (/(covered|count)$/i.test(name)) return "number";
  return "taka";
}

function formatOne(kind: Kind, value: number | string, f: Formatters, t: TFunction): string {
  if (typeof value === "string") return kind === "instrument" ? t(`common.instrument.${value}`) : value;
  switch (kind) {
    case "taka":
      return f.money(value);
    case "percent":
      return f.percent(value);
    case "number":
      return f.number(value, Number.isInteger(value) ? 0 : 1);
    case "months":
      return f.months(value);
    case "years":
      return `${f.number(value)} ${t(value === 1 ? "common.unit.year" : "common.unit.years")}`;
    case "instrument":
      return t(`common.instrument.${String(value)}`);
    case "text":
      return String(value);
  }
}

export function formatReasonParams(bucket: Pick<Bucket, "reasonKey" | "reasonParams">, f: Formatters, t: TFunction): TranslateParams {
  const kinds = BY_REASON[bucket.reasonKey] ?? {};
  const out: TranslateParams = {};
  for (const [name, v] of Object.entries(bucket.reasonParams)) {
    out[name] = formatOne(kinds[name] ?? fallbackKind(name, v), v, f, t);
  }
  return out;
}

/** The translated one-line reason for a bucket card. */
export function bucketReason(bucket: Pick<Bucket, "reasonKey" | "reasonParams">, f: Formatters, t: TFunction): string {
  return t(bucket.reasonKey, formatReasonParams(bucket, f, t));
}

/** Card title: the bucket name, or "Goal: <name>" when the bucket is one goal. */
export function bucketTitle(bucket: Pick<Bucket, "id" | "reasonParams">, t: TFunction): string {
  const name = bucket.reasonParams.name;
  if (bucket.id === "goal" && typeof name === "string" && name.length > 0) return t("plan.card.goalTitle", { name });
  return t(`plan.card.bucket.${bucket.id}`);
}

/** Stable key for ?why=<bucketId>: the bucket id, or "<id>:<refId>" when several buckets share an id. */
export function bucketKey(bucket: Pick<Bucket, "id" | "refId">): string {
  return bucket.refId ? `${bucket.id}:${bucket.refId}` : bucket.id;
}

/** Matches ?why= against a bucket by full key, by refId alone, or by id when it is unique. */
export function bucketMatchesWhy(bucket: Pick<Bucket, "id" | "refId">, why: string | null): boolean {
  if (!why) return false;
  return why === bucketKey(bucket) || (bucket.refId !== undefined && why === bucket.refId) || (bucket.refId === undefined && why === bucket.id);
}
