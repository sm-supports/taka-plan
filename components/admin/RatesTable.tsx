"use client";
/** The rates list: one card per row (mobile first), draft banner on top, filter box, edit sheet. */
import { useMemo, useState } from "react";
import { RATE_KEYS, isStale, type RateKey, type RateRow, type RatesSnapshot } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/components/ui/cn";
import { useT } from "@/lib/i18n/useT";
import { clearPreviewSeen } from "./api";
import { DraftBanner } from "./DraftBanner";
import { RateRowEditor } from "./RateRowEditor";
import { formatRange, formatValue } from "./format";
import { useAdminRates } from "./useAdminRates";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function rowDiffers(a: RateRow, b: RateRow): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export function RatesTable() {
  const { t } = useT();
  const { data, loading, error, reload, setDraft } = useAdminRates();
  const [editing, setEditing] = useState<RateKey | null>(null);
  const [filter, setFilter] = useState("");
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const today = useMemo(todayIso, []);

  const shown: RatesSnapshot | null = data ? (data.draft ?? data.published) : null;

  const rows = useMemo(() => {
    if (!shown) return [];
    const q = filter.trim().toLowerCase();
    return RATE_KEYS.map((k) => shown.rows[k])
      .filter((r): r is RateRow => r !== undefined)
      .filter((r) => q === "" || r.key.includes(q) || r.labelEn.toLowerCase().includes(q));
  }, [shown, filter]);

  const staleCount = useMemo(() => (shown ? RATE_KEYS.filter((k) => shown.rows[k] && isStale(shown.rows[k], today)).length : 0), [shown, today]);

  if (loading && !data) return <Skeleton page />;
  if (error && !data) {
    return (
      <div className="flex flex-col gap-3 rounded-card border border-status-red bg-status-red-soft p-4">
        <p role="alert">{t("admin.state.error", { message: error })}</p>
        <Button variant="secondary" onClick={() => void reload()}>
          {t("admin.action.reload")}
        </Button>
      </div>
    );
  }
  if (!data || !shown) return null;

  const editingRow = editing ? (shown.rows[editing] ?? null) : null;

  return (
    <div className="flex flex-col gap-4">
      {data.draft ? (
        <DraftBanner
          draftVersion={data.draft.version}
          publishedVersion={data.published.version}
          onPublished={(version) => {
            clearPreviewSeen();
            setToast({ kind: "ok", text: t("admin.state.publishedNow", { version }) });
            void reload();
          }}
          onDiscarded={() => {
            clearPreviewSeen();
            setToast({ kind: "ok", text: t("admin.state.discarded") });
            void reload();
          }}
          onError={(message) => setToast({ kind: "error", text: t("admin.state.error", { message }) })}
        />
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-line bg-surface p-4">
          <h2 className="text-lg font-bold text-brand-700">{t("admin.state.published", { version: data.published.version })}</h2>
          <span className="text-sm text-text-muted">{t("admin.state.publishedAt", { date: data.published.publishedAt })}</span>
          <p className="w-full text-sm text-text-muted">{t("admin.state.noDraft")}</p>
        </section>
      )}

      {toast && (
        <p role="status" aria-live="polite" className={cn("rounded-xl px-4 py-3 text-sm", toast.kind === "ok" ? "bg-status-green-soft text-status-green" : "bg-status-red-soft text-status-red")}>
          {toast.text}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="rates-filter" className="sr-only">
          {t("admin.table.filter")}
        </label>
        <input
          id="rates-filter"
          type="search"
          placeholder={t("admin.table.filter")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="tap w-full rounded-xl border border-line bg-surface px-4 py-2 text-base"
        />
        <div className="flex flex-wrap justify-between gap-2 text-sm text-text-muted">
          <span>{t("admin.table.showing", { shown: rows.length, total: RATE_KEYS.length })}</span>
          <span className={cn(staleCount > 0 && "font-semibold text-status-amber")}>{staleCount > 0 ? t("admin.table.staleCount", { count: staleCount }) : t("admin.table.noStale")}</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-text-muted">{t("admin.table.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => {
            const publishedRow = data.published.rows[row.key];
            const edited = data.draft !== null && publishedRow !== undefined && rowDiffers(row, publishedRow);
            return (
              <li key={row.key}>
                <RateCard row={row} publishedRow={edited ? publishedRow : null} stale={isStale(row, today)} onEdit={() => setEditing(row.key)} />
              </li>
            );
          })}
        </ul>
      )}

      <RateRowEditor
        row={editingRow}
        onClose={() => setEditing(null)}
        onSaved={(draft, key) => {
          setDraft(draft);
          setEditing(null);
          setToast({ kind: "ok", text: t("admin.state.rowSaved", { key, version: draft.version }) });
        }}
      />
    </div>
  );
}

function RateCard({ row, publishedRow, stale, onEdit }: { row: RateRow; publishedRow: RateRow | null; stale: boolean; onEdit: () => void }) {
  const { t } = useT();
  const range = formatRange(row);
  const external = /^https?:\/\//.test(row.sourceUrl);
  return (
    <article className={cn("flex flex-col gap-2 rounded-card border bg-surface p-4 shadow-sm", publishedRow ? "border-status-amber" : "border-line")} aria-labelledby={`row-${row.key}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`row-${row.key}`} className="truncate font-mono text-sm text-text-muted">
            {row.key}
          </h3>
          <p className="font-semibold leading-snug">{row.labelEn}</p>
        </div>
        <Button variant="secondary" onClick={onEdit} aria-label={`${t("admin.action.edit")} ${row.key}`} className="shrink-0">
          {t("admin.action.edit")}
        </Button>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-2xl font-bold tabular-nums">{formatValue(row)}</span>
        {range && (
          <span className="text-sm text-text-muted">
            {t("admin.table.range")} {range}
          </span>
        )}
      </div>
      {publishedRow && <p className="text-sm text-status-amber">{t("admin.table.publishedWas", { value: formatValue(publishedRow) })}</p>}

      <div className="flex flex-wrap gap-1.5">
        {row.isAppAssumption && <Tag>{t("admin.table.ourAssumption")}</Tag>}
        {stale && <Tag tone="warn">{t("admin.table.stale")}</Tag>}
        {publishedRow && <Tag tone="warn">{t("admin.table.edited")}</Tag>}
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
        <dt className="text-text-muted">{t("admin.table.asOf")}</dt>
        <dd className="tabular-nums">{row.asOf}</dd>
        <dt className="text-text-muted">{t("admin.table.nextReview")}</dt>
        <dd className={cn("tabular-nums", stale && "font-semibold text-status-amber")}>{row.nextReview}</dd>
        <dt className="text-text-muted">{t("admin.table.reviewedBy")}</dt>
        <dd>{row.reviewedBy}</dd>
        <dt className="text-text-muted">{t("admin.table.source")}</dt>
        <dd className="min-w-0 truncate">
          {external ? (
            <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">
              {row.sourceName}
            </a>
          ) : (
            <span title={row.sourceUrl}>{row.sourceName}</span>
          )}
        </dd>
        {row.note && (
          <>
            <dt className="text-text-muted">{t("admin.table.note")}</dt>
            <dd>{row.note}</dd>
          </>
        )}
      </dl>
    </article>
  );
}

function Tag({ tone = "muted", children }: { tone?: "muted" | "warn"; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-xs", tone === "warn" ? "bg-status-amber-soft text-status-amber" : "bg-surface-muted text-text-muted")}>{children}</span>;
}
