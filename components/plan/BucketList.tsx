"use client";
/** Bucket cards in priority order. `why` (from ?why=) opens one card's drawer; closing it reports back. */
import type { Plan } from "@taka/engine";
import { BucketCard } from "./BucketCard";
import { bucketKey, bucketMatchesWhy } from "./formatReason";

export interface BucketListProps {
  plan: Plan;
  /** The bucket whose "Why this number?" drawer is open, or null. */
  why: string | null;
  onWhyChange: (key: string | null) => void;
}

export function BucketList({ plan, why, onWhyChange }: BucketListProps) {
  const buckets = [...plan.buckets].sort((a, b) => a.priority - b.priority);
  return (
    <ol className="flex flex-col gap-4">
      {buckets.map((bucket) => {
        const key = bucketKey(bucket);
        return (
          <li key={key}>
            <BucketCard plan={plan} bucket={bucket} whyOpen={bucketMatchesWhy(bucket, why)} onWhyOpenChange={(open) => onWhyChange(open ? key : null)} />
          </li>
        );
      })}
    </ol>
  );
}
