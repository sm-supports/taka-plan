"use client";
/**
 * One bucket of the monthly plan: amount, instrument (tap-to-explain), status, one-line reason,
 * the concrete next step, a link to its calculator and "Why this number?".
 */
import Link from "next/link";
import type { Bucket, Plan } from "@taka/engine";
import { WhyButton } from "@/components/explain/WhyButton";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { Term } from "@/components/ui/Term";
import { cn } from "@/components/ui/cn";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { bucketExplanation } from "./explanationFor";
import { bucketReason, bucketTitle } from "./formatReason";
import { calculatorPath, termForInstrument } from "./terms";

export interface BucketCardProps {
  plan: Plan;
  bucket: Bucket;
  whyOpen?: boolean;
  onWhyOpenChange?: (open: boolean) => void;
}

export function BucketCard({ plan, bucket, whyOpen, onWhyOpenChange }: BucketCardProps) {
  const { t, locale } = useT();
  const f = useFormat();
  const title = bucketTitle(bucket, t);
  const amount = f.taka(bucket.amount);
  const instrumentLabel = t(`common.instrument.${bucket.instrument}`);
  const termKey = termForInstrument(bucket.instrument, bucket.id);
  const href = calculatorPath(bucket.module, locale);
  const urgent = bucket.status === "red" && !bucket.demotedFromRed;

  return (
    <Card
      className={cn(urgent && "border-status-red/40")}
      header={
        <>
          <div className="min-w-0">
            <div className="text-xs font-medium text-text-faint">{t("plan.card.priority", { n: f.number(bucket.priority) })}</div>
            <h2 className="text-lg font-bold leading-snug text-text">{title}</h2>
          </div>
          <StatusPill status={bucket.status} demotedFromRed={bucket.demotedFromRed} className="shrink-0 items-end text-end" />
        </>
      }
    >
      <div className="text-3xl font-bold tabular-nums text-brand-700">{t("plan.card.perMonth", { amount })}</div>

      <dl className="mt-3 flex flex-col gap-2 text-sm">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-text-muted">{t("plan.card.instrument")}</dt>
          <dd className="font-medium text-text">{termKey ? <Term k={termKey}>{instrumentLabel}</Term> : instrumentLabel}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-text-muted">{t("plan.card.reason")}</dt>
          <dd className="text-text">{bucketReason(bucket, f, t)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-text-muted">{t("plan.card.nextStep")}</dt>
          <dd className="text-text">{t(bucket.nextStepKey)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        {href ? (
          <Link
            href={href}
            className={cn(
              "tap inline-flex items-center justify-center rounded-xl px-4 text-base font-semibold transition-colors",
              urgent ? "bg-brand-600 text-white hover:bg-brand-700" : "border border-line bg-surface text-text hover:bg-surface-muted",
            )}
          >
            {t("plan.card.open")}
          </Link>
        ) : (
          <span />
        )}
        <WhyButton explanation={bucketExplanation(plan, bucket)} title={t("plan.why.bucket", { amount, bucket: title })} open={whyOpen} onOpenChange={onWhyOpenChange} />
      </div>
    </Card>
  );
}
