/**
 * Formats a bucket's raw `reasonParams` (numbers and instrument ids from the engine) into the
 * strings the plan.reason.* templates expect. The same param name means different things per
 * reason (emergency `months` is a plain count; debt `months` is a duration), so the mapping is
 * per reason key, with a by-name fallback for keys this file does not know yet.
 */
import type { Bucket, Instrument } from "@taka/engine";
import { isInstrumentId } from "@/components/explain/formatInputs";
import type { ProductNames } from "@/components/ui/useProductName";
import { iso } from "@/components/ui/bidi";
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
  // planTo and lastsTo are ages, not money (the by-name fallback would format them as taka).
  "plan.reason.retirement": { amount: "taka", need: "taka", planTo: "number", lastsTo: "number" },
  "plan.reason.retirementShort": { amount: "taka", need: "taka", planTo: "number", lastsTo: "number" },
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

/** An instrument inside a sentence ("into a savings account", "into 3-month FDRs"), with the country's product name. */
function instrumentInline(id: string, t: TFunction, names?: ProductNames): string {
  const product = names && isInstrumentId(id) ? names.prose(id as Instrument) : isInstrumentId(id) ? t(`common.productProse.${id}`) : "";
  return t(`common.instrumentInline.${id}`, { product });
}

function formatOne(kind: Kind, value: number | string, f: Formatters, t: TFunction, names?: ProductNames): string {
  if (typeof value === "string") return kind === "instrument" ? instrumentInline(value, t, names) : value;
  switch (kind) {
    case "taka":
      return iso(f.money(value));
    case "percent":
      return iso(f.percent(value));
    case "number":
      return f.number(value, Number.isInteger(value) ? 0 : 1);
    case "months":
      return f.months(value);
    case "years":
      return `${f.number(value)} ${t(value === 1 ? "common.unit.year" : "common.unit.years")}`;
    case "instrument":
      return instrumentInline(String(value), t, names);
    case "text":
      return String(value);
  }
}

/**
 * The dictionary key for a bucket's reason. The engine sends one retirement key; the card says
 * "… of the {need} you need — lasts to {lastsTo}" when the plan cannot fit the whole need (and the
 * engine sent those params), and "so your money lasts to {planTo}" otherwise.
 */
export function reasonKeyFor(bucket: Pick<Bucket, "reasonKey" | "reasonParams">): string {
  if (bucket.reasonKey === "plan.reason.retirement") {
    const { amount, need, lastsTo } = bucket.reasonParams;
    if (typeof amount === "number" && typeof need === "number" && typeof lastsTo === "number" && amount < need) return "plan.reason.retirementShort";
  }
  return bucket.reasonKey;
}

export function formatReasonParams(bucket: Pick<Bucket, "reasonKey" | "reasonParams">, f: Formatters, t: TFunction, names?: ProductNames): TranslateParams {
  const kinds = BY_REASON[reasonKeyFor(bucket)] ?? BY_REASON[bucket.reasonKey] ?? {};
  const out: TranslateParams = {};
  for (const [name, v] of Object.entries(bucket.reasonParams)) {
    out[name] = formatOne(kinds[name] ?? fallbackKind(name, v), v, f, t, names);
  }
  return out;
}

/** The translated one-line reason for a bucket card. */
export function bucketReason(bucket: Pick<Bucket, "reasonKey" | "reasonParams">, f: Formatters, t: TFunction, names?: ProductNames): string {
  return t(reasonKeyFor(bucket), formatReasonParams(bucket, f, t, names));
}

/** Which product a next-step string names as {product}. */
const NEXT_STEP_PRODUCT: Record<string, Instrument> = {
  "plan.next.fdrLadder": "fdr_3m",
  "plan.next.fdr": "fdr_1y",
  "plan.next.dps": "dps",
  "plan.next.sanchayapatra": "sanchayapatra_5y",
  "plan.next.tbond": "tbond_5y",
  "plan.next.openSavings": "savings_account",
};

/** The translated next step for a bucket card, with the country's product name. */
export function bucketNextStep(bucket: Pick<Bucket, "nextStepKey">, t: TFunction, names?: ProductNames): string {
  const slot = NEXT_STEP_PRODUCT[bucket.nextStepKey];
  const product = slot ? (names ? names.prose(slot) : t(`common.productProse.${slot}`)) : "";
  return t(bucket.nextStepKey, { product });
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
