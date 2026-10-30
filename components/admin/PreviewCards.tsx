"use client";
/** Three sample-profile cards: published vs draft plan numbers, with status changes coloured. */
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SampleProfileId, Status } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusPill } from "@/components/ui/StatusPill";
import { cn } from "@/components/ui/cn";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { adminApi, errorMessage, markPreviewSeen } from "./api";
import { isPreviewError, type PlanSummary, type PreviewBucket, type PreviewOutcome, type PreviewProfile, type PreviewResponse } from "./types";

const PROFILE_KEY: Record<SampleProfileId, string> = { firstJob: "first_job", freelancer: "freelancer", familyWithDebt: "family_with_debt" };

export function PreviewCards() {
  const { t } = useT();
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [why, setWhy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .preview()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        if (d.draft) markPreviewSeen(d.draft.version);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p role="alert" className="rounded-xl bg-status-red-soft px-4 py-3 text-sm text-status-red">
        {t("admin.state.error", { message: error })}
      </p>
    );
  }
  if (!data) return <Skeleton page />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t("admin.preview.title")}</h1>

      <section className={cn("flex flex-col gap-2 rounded-card border p-4", data.draft ? "border-status-amber bg-status-amber-soft" : "border-line bg-surface")}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold">{t("admin.state.published", { version: data.published.version })}</span>
          {data.draft && <span className="font-semibold text-status-amber">{t("admin.state.draft", { version: data.draft.version })}</span>}
        </div>
        {data.draft ? (
          <>
            <p className="text-sm">{data.changedKeys.length > 0 ? t("admin.preview.changedKeys", { count: data.changedKeys.length }) : t("admin.preview.noChangedKeys")}</p>
            {data.changedKeys.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {data.changedKeys.map((k) => (
                  <li key={k} className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-xs">
                    {k}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-sm text-text-muted">{t("admin.preview.seen", { version: data.draft.version })}</p>
            <Link href="/admin" className="tap inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 font-semibold text-white hover:bg-brand-700">
              {t("admin.action.publish", { version: data.draft.version })}
            </Link>
          </>
        ) : (
          <p className="text-sm text-text-muted">{t("admin.preview.noDraft")}</p>
        )}
      </section>

      <div>
        <Button variant="ghost" aria-expanded={why} onClick={() => setWhy((w) => !w)}>
          {t("admin.preview.why")}
        </Button>
        {why && (
          <p className="px-4 pb-2 text-sm text-text-muted">
            {data.draft
              ? t("admin.preview.whyBody", { published: data.published.version, draft: data.draft.version, today: data.today })
              : t("admin.preview.whyBodyNoDraft", { published: data.published.version, today: data.today })}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {data.profiles.map((p) => (
          <ProfileCard key={p.id} profile={p} hasDraft={data.draft !== null} />
        ))}
      </div>
    </div>
  );
}

function ProfileCard({ profile, hasDraft }: { profile: PreviewProfile; hasDraft: boolean }) {
  const { t } = useT();
  const key = PROFILE_KEY[profile.id];
  return (
    <Card
      header={
        <div>
          <h2 className="text-lg font-bold">{t(`admin.preview.profile.${key}`)}</h2>
          <p className="text-sm text-text-muted">{t(`admin.preview.profileNote.${key}`)}</p>
        </div>
      }
    >
      <Outcome published={profile.published} draft={hasDraft ? profile.draft : null} hasDraft={hasDraft} />
    </Card>
  );
}

function EngineMessage({ outcome }: { outcome: PreviewOutcome }) {
  const { t } = useT();
  if (!isPreviewError(outcome)) return null;
  return (
    <p className="rounded-xl bg-surface-muted px-3 py-2 text-sm text-text-muted">
      {outcome.error === "engine-not-ready" ? t("admin.preview.engineNotReady") : t("admin.preview.engineError", { message: outcome.message ?? "" })}
    </p>
  );
}

function Outcome({ published, draft, hasDraft }: { published: PreviewOutcome; draft: PreviewOutcome | null; hasDraft: boolean }) {
  const { t } = useT();
  const { taka } = useFormat();
  if (isPreviewError(published)) return <EngineMessage outcome={published} />;
  const after: PlanSummary | null = draft && !isPreviewError(draft) ? draft : null;

  return (
    <div className="flex flex-col gap-3">
      {draft && isPreviewError(draft) && <EngineMessage outcome={draft} />}
      <Row label={t("admin.preview.monthlyTotal")} before={taka(published.monthlyTotal)} after={after ? taka(after.monthlyTotal) : null} changed={after !== null && after.monthlyTotal !== published.monthlyTotal} hasDraft={hasDraft} />
      <Row label={t("admin.preview.emergencyTarget")} before={taka(published.emergencyTarget)} after={after ? taka(after.emergencyTarget) : null} changed={after !== null && after.emergencyTarget !== published.emergencyTarget} hasDraft={hasDraft} />

      <ul className="flex flex-col gap-2">
        {published.buckets.map((b, i) => {
          const match = after ? (after.buckets.find((x) => x.id === b.id && x.refId === b.refId) ?? after.buckets[i] ?? null) : null;
          return <BucketRow key={`${b.id}-${b.refId ?? i}`} before={b} after={match} hasDraft={hasDraft} />;
        })}
      </ul>

      {published.goals.map((g) => {
        const match = after?.goals.find((x) => x.id === g.id) ?? null;
        return <Row key={g.id} label={t("admin.preview.goalMonthly", { id: g.id })} before={taka(g.monthly)} after={match ? taka(match.monthly) : null} changed={match !== null && match.monthly !== g.monthly} hasDraft={hasDraft} />;
      })}
    </div>
  );
}

function Row({ label, before, after, changed, hasDraft }: { label: string; before: string; after: string | null; changed: boolean; hasDraft: boolean }) {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm text-text-muted">{label}</span>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className={cn("tabular-nums", changed ? "text-text-muted line-through" : "text-lg font-semibold")}>{before}</span>
        {hasDraft && after !== null && changed && (
          <>
            <span aria-hidden="true">→</span>
            <span className="text-lg font-semibold tabular-nums text-status-amber">{after}</span>
          </>
        )}
        {hasDraft && after !== null && !changed && <span className="text-xs text-text-faint">{t("admin.preview.unchanged")}</span>}
      </div>
    </div>
  );
}

function BucketRow({ before, after, hasDraft }: { before: PreviewBucket; after: PreviewBucket | null; hasDraft: boolean }) {
  const { t } = useT();
  const { taka } = useFormat();
  const name = t(`admin.preview.bucketName.${before.id}`) + (before.refId ? ` · ${before.refId}` : "");
  const instrument = (i: PreviewBucket["instrument"]) => (i === "loan_prepayment" || i === "term_insurance" ? t(`admin.preview.instrumentExtra.${i}`) : t(`common.instrument.${i}`));
  const amountChanged = after !== null && after.amount !== before.amount;
  const statusChanged = after !== null && after.status !== before.status;
  const instrumentChanged = after !== null && after.instrument !== before.instrument;
  return (
    <li className={cn("flex flex-col gap-1 rounded-xl border p-3", statusChanged ? statusBorder(after!.status) : "border-line")}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{name}</span>
        <span className="flex items-center gap-1">
          <StatusPill status={before.status} />
          {statusChanged && (
            <>
              <span aria-hidden="true">→</span>
              <StatusPill status={after!.status} />
            </>
          )}
        </span>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
        <span className={cn("tabular-nums", amountChanged ? "text-text-muted line-through" : "font-semibold")}>{taka(before.amount)}</span>
        {amountChanged && (
          <>
            <span aria-hidden="true">→</span>
            <span className="font-semibold tabular-nums text-status-amber">{taka(after!.amount)}</span>
          </>
        )}
        <span className="text-text-muted">· {instrument(before.instrument)}</span>
        {instrumentChanged && <span className="text-status-amber">→ {instrument(after!.instrument)}</span>}
        {hasDraft && after !== null && !amountChanged && !statusChanged && !instrumentChanged && <span className="text-xs text-text-faint">{t("admin.preview.unchanged")}</span>}
      </div>
    </li>
  );
}

function statusBorder(s: Status): string {
  return s === "red" ? "border-status-red bg-status-red-soft" : s === "amber" ? "border-status-amber bg-status-amber-soft" : "border-status-green bg-status-green-soft";
}
