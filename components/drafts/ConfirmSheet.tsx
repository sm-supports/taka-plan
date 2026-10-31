"use client";
/**
 * Small yes/no confirmation in the bottom sheet (Escape, backdrop and Cancel close it; focus stays
 * inside and returns to the trigger). The confirm button shows a spinner and stays disabled while
 * `busy`, so one tap can never run the action twice.
 */
import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

export interface ConfirmSheetProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmSheet({ open, title, body, confirmLabel, cancelLabel, busy, onConfirm, onCancel }: ConfirmSheetProps) {
  // Sheet re-runs its focus effect when onClose changes: keep one stable close handler per mount.
  const latest = useRef({ busy, onCancel });
  useEffect(() => {
    latest.current = { busy, onCancel };
  });
  const close = useCallback(() => {
    if (!latest.current.busy) latest.current.onCancel();
  }, []);

  return (
    <Sheet open={open} onClose={close} title={title}>
      <p className="text-base leading-relaxed text-text">{body}</p>
      <div className="mt-5 flex flex-col gap-3">
        <Button fullWidth size="lg" onClick={onConfirm} loading={busy}>
          {confirmLabel}
        </Button>
        <Button fullWidth variant="secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
      </div>
    </Sheet>
  );
}
