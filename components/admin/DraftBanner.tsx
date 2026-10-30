"use client";
/** "Draft vN" strip with Publish (locked until the preview was opened this session) and Discard. */
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n/useT";
import { adminApi, errorMessage, wasPreviewSeen } from "./api";

export interface DraftBannerProps {
  draftVersion: number;
  publishedVersion: number;
  onPublished: (version: number) => void;
  onDiscarded: () => void;
  onError: (message: string) => void;
}

export function DraftBanner({ draftVersion, publishedVersion, onPublished, onDiscarded, onError }: DraftBannerProps) {
  const { t } = useT();
  const [previewSeen, setPreviewSeen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"publish" | "discard" | null>(null);
  // Inline two-step confirm (no native dialog): the second tap does the work.
  const [confirming, setConfirming] = useState<"publish" | "discard" | null>(null);

  // sessionStorage is read after mount so the server and first client render agree.
  useEffect(() => {
    setPreviewSeen(wasPreviewSeen(draftVersion));
  }, [draftVersion]);

  async function publish() {
    setConfirming(null);
    setBusy("publish");
    try {
      const { version } = await adminApi.publish(note);
      setNote("");
      onPublished(version);
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function discard() {
    setConfirming(null);
    setBusy("discard");
    try {
      await adminApi.discard();
      onDiscarded();
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section aria-label={t("admin.state.draft", { version: draftVersion })} className="flex flex-col gap-3 rounded-card border border-status-amber bg-status-amber-soft p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-status-amber">{t("admin.state.draft", { version: draftVersion })}</h2>
        <span className="text-sm text-text-muted">{t("admin.state.published", { version: publishedVersion })}</span>
      </div>
      <p className="text-sm text-text-muted">{t("admin.state.draftExplainer", { version: publishedVersion })}</p>
      <label htmlFor="publish-note" className="flex flex-col gap-1 text-sm font-semibold">
        {t("admin.state.publishNote")}
        <input id="publish-note" type="text" value={note} onChange={(e) => setNote(e.target.value)} className="tap w-full rounded-xl border border-line bg-surface px-3 py-2 text-base font-normal" />
      </label>
      <p className="text-sm" aria-live="polite">
        {previewSeen ? t("admin.state.previewSeen") : t("admin.state.previewRequired")}
      </p>
      {confirming ? (
        <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3" role="group" aria-label={t(confirming === "publish" ? "admin.action.confirmPublish" : "admin.action.confirmDiscard", { version: draftVersion })}>
          <p className="text-sm font-semibold">{t(confirming === "publish" ? "admin.action.confirmPublish" : "admin.action.confirmDiscard", { version: draftVersion })}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={confirming === "publish" ? publish : discard} fullWidth>
              {t(confirming === "publish" ? "admin.action.yesPublish" : "admin.action.yesDiscard", { version: draftVersion })}
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(null)} fullWidth>
              {t("admin.action.cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          {previewSeen ? (
            <Button onClick={() => setConfirming("publish")} loading={busy === "publish"} disabled={busy !== null} fullWidth>
              {t("admin.action.publish", { version: draftVersion })}
            </Button>
          ) : (
            <Link href="/admin/preview" className="tap inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 font-semibold text-white hover:bg-brand-700">
              {t("admin.action.previewFirst")}
            </Link>
          )}
          <Button variant="secondary" onClick={() => setConfirming("discard")} loading={busy === "discard"} disabled={busy !== null} fullWidth>
            {t("admin.action.discard")}
          </Button>
        </div>
      )}
    </section>
  );
}
