"use client";
/**
 * One kept set of answers: its name (or the auto label), when it was last updated, and Open /
 * Rename / Delete. Rename edits inline (Enter or leaving the box saves, Escape cancels, at most
 * DRAFT_NAME_MAX characters); Delete asks first.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import type { Draft } from "@/lib/store/types";
import { ConfirmSheet } from "./ConfirmSheet";
import { cleanDraftName, DRAFT_NAME_MAX } from "./label";

export interface DraftCardProps {
  draft: Draft;
  /** The name or auto label, already formatted. */
  label: string;
  /** "Updated Oct 2026", already formatted. */
  updated: string;
  /** These are the answers open right now. */
  current: boolean;
  /** Disables Open while a draft is being opened. */
  busy?: boolean;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

export function DraftCard({ draft, label, updated, current, busy, onOpen, onRename, onDelete }: DraftCardProps) {
  const { t } = useT();
  const f = useFormat();
  const titleId = useId();
  const inputId = useId();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(draft.name ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);

  // Focus the box when editing starts and the Rename button again when it ends.
  useEffect(() => {
    if (editing) inputRef.current?.select();
    else if (wasEditing.current) renameRef.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  const startEdit = () => {
    setValue(draft.name ?? "");
    setEditing(true);
  };
  const save = () => {
    if (!editing) return;
    const name = cleanDraftName(value);
    if (name !== (draft.name ?? "")) onRename(name);
    setEditing(false);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditing(false);
    }
  };

  return (
    <li data-testid="draft-card">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <h3 id={titleId} className="min-w-0 break-words text-base font-semibold text-text">
            {label}
          </h3>
          {current && <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{t("common.drafts.current")}</span>}
        </div>
        <p className="mt-1 text-sm text-text-muted">{updated}</p>

        {editing && (
          <div className="mt-3 flex flex-col gap-1.5">
            <label htmlFor={inputId} className="text-sm font-medium text-text">
              {t("common.drafts.renameLabel")}
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              value={value}
              maxLength={DRAFT_NAME_MAX}
              placeholder={label}
              enterKeyHint="done"
              autoComplete="off"
              onChange={(e) => setValue(e.target.value.slice(0, DRAFT_NAME_MAX))}
              onKeyDown={onKey}
              onBlur={save}
              className="min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-text focus:border-brand-500"
            />
            <p className="text-xs text-text-faint">{t("common.drafts.renameHint", { max: f.number(DRAFT_NAME_MAX) })}</p>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <Button className="flex-1" onClick={onOpen} disabled={busy} aria-describedby={titleId}>
            {t("common.drafts.open")}
          </Button>
          {!editing && (
            <button
              ref={renameRef}
              type="button"
              onClick={startEdit}
              aria-describedby={titleId}
              className="tap inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-surface px-4 text-base font-semibold text-text hover:bg-surface-muted"
            >
              {t("common.drafts.rename")}
            </button>
          )}
          <Button variant="ghost" onClick={() => setConfirmDelete(true)} aria-haspopup="dialog" aria-describedby={titleId}>
            {t("common.drafts.delete")}
          </Button>
        </div>
      </Card>

      <ConfirmSheet
        open={confirmDelete}
        title={t("common.drafts.deleteTitle")}
        body={t("common.drafts.deleteBody")}
        confirmLabel={t("common.drafts.deleteConfirm")}
        cancelLabel={t("common.drafts.cancel")}
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </li>
  );
}
