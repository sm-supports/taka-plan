// Wire types shared by the admin route handlers and the admin pages (no runtime code).
import type { BucketId, BucketInstrument, Money, RateKey, RatesSnapshot, SampleProfileId, Status } from "@taka/engine";
import type { ChangeLogEntry, RatePatch } from "@/lib/server/db";

/** GET /api/admin/rates */
export interface AdminRatesResponse {
  published: RatesSnapshot;
  draft: RatesSnapshot | null;
  changeLog: ChangeLogEntry[];
}

/** PUT /api/admin/rates body */
export interface EditRowRequest {
  key: RateKey;
  patch: RatePatch;
  note?: string;
}

export interface PreviewBucket {
  id: BucketId;
  refId?: string;
  amount: Money;
  status: Status;
  instrument: BucketInstrument;
}

/** What the preview compares, per profile and per snapshot. */
export interface PlanSummary {
  monthlyTotal: Money;
  buckets: PreviewBucket[];
  emergencyTarget: Money;
  goals: { id: string; monthly: Money }[];
}

export interface PreviewError {
  error: "engine-not-ready" | "engine-error";
  message?: string;
}

export type PreviewOutcome = PlanSummary | PreviewError;

export function isPreviewError(x: PreviewOutcome): x is PreviewError {
  return "error" in x;
}

export interface PreviewProfile {
  id: SampleProfileId;
  published: PreviewOutcome;
  draft: PreviewOutcome | null;
}

/** GET /api/admin/preview */
export interface PreviewResponse {
  today: string;
  published: { version: number; publishedAt: string };
  draft: { version: number; publishedAt: string } | null;
  changedKeys: RateKey[];
  profiles: PreviewProfile[];
}

export type { ChangeLogEntry, RatePatch };
