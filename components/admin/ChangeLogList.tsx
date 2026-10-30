"use client";
/** Change log, newest first, 50 per page with "Load more". */
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useT } from "@/lib/i18n/useT";
import { adminApi, errorMessage } from "./api";
import { formatWhen } from "./format";
import type { ChangeLogEntry } from "./types";

const PAGE = 50;

/** Which fields changed in an "edit" entry (old/new are JSON rows). */
function changedFields(e: ChangeLogEntry): { field: string; from: string; to: string }[] {
  if (e.action !== "edit" || !e.oldValue || !e.newValue) return [];
  try {
    const a = JSON.parse(e.oldValue) as Record<string, unknown>;
    const b = JSON.parse(e.newValue) as Record<string, unknown>;
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const out: { field: string; from: string; to: string }[] = [];
    for (const k of keys) {
      const av = JSON.stringify(a[k] ?? null);
      const bv = JSON.stringify(b[k] ?? null);
      if (av !== bv) out.push({ field: k, from: av, to: bv });
    }
    return out;
  } catch {
    return [];
  }
}

export function ChangeLogList() {
  const { t } = useT();
  const [entries, setEntries] = useState<ChangeLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const load = useCallback(async (before?: number) => {
    setLoading(true);
    setError(null);
    try {
      const { changeLog } = await adminApi.rates(before);
      setEntries((cur) => (before === undefined ? changeLog : [...(cur ?? []), ...changeLog]));
      if (changeLog.length < PAGE) setDone(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (entries === null && loading) return <Skeleton page />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t("admin.changeLog.title")}</h1>
      {error && (
        <p role="alert" className="rounded-xl bg-status-red-soft px-4 py-3 text-sm text-status-red">
          {t("admin.state.error", { message: error })}
        </p>
      )}
      {entries && entries.length === 0 && <p className="text-text-muted">{t("admin.changeLog.empty")}</p>}
      {entries && entries.length > 0 && (
        <ol className="flex flex-col gap-3">
          {entries.map((e) => (
            <li key={e.id} className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4 text-sm shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-base font-semibold">
                  {t(`admin.changeLog.action.${e.action}`)} · v{e.version}
                  {e.key && <span className="font-mono text-text-muted"> · {e.key}</span>}
                </span>
                <span className="tabular-nums text-text-muted">{formatWhen(e.at)}</span>
              </div>
              <p className="text-text-muted">
                {t("admin.changeLog.who")}: {e.actor}
                {e.action === "publish" && e.oldValue && ` · v${e.oldValue} → v${e.newValue}`}
              </p>
              {changedFields(e).map((c) => (
                <p key={c.field} className="break-all font-mono text-xs">
                  {c.field}: {c.from} → {c.to}
                </p>
              ))}
              {e.note && (
                <p>
                  {t("admin.changeLog.note")}: {e.note}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
      {entries && entries.length > 0 && (done ? <p className="text-center text-sm text-text-muted">{t("admin.changeLog.end")}</p> : (
        <Button variant="secondary" loading={loading} onClick={() => void load(entries[entries.length - 1]!.id)}>
          {t("admin.action.loadMore")}
        </Button>
      ))}
    </div>
  );
}
