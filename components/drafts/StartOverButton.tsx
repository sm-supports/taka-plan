"use client";
/**
 * "Start from the beginning", shown under a successful result (the plan, or a calculator's result).
 * A confirm sheet first; on confirm the store keeps the current answers as a draft (refreshing an
 * identical draft instead of adding one, see lib/store/drafts.ts), clears them and onboarding opens at
 * question 1. The confirm runs once per tap: a ref guards it and the button stays busy while the
 * next page loads. A toast says whether a new draft was made or the answers were already kept.
 */
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";
import { ConfirmSheet } from "./ConfirmSheet";
import { hasAnswers, saveOutcome } from "./label";
import { showDraftToast } from "./toast";

export interface StartOverButtonProps {
  className?: string;
}

export function StartOverButton({ className }: StartOverButtonProps) {
  const { t, locale } = useT();
  const router = useRouter();
  const startOver = useTakaStore((s) => s.startOver);
  const anything = useTakaStore(hasAnswers);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const fired = useRef(false);

  // Nothing answered: nothing to keep, so no button (the store would not save a draft anyway).
  if (!anything && !busy) return null;

  const onConfirm = () => {
    if (fired.current) return;
    fired.current = true;
    setBusy(true);
    const outcome = saveOutcome(useTakaStore.getState());
    startOver();
    if (outcome !== "none") showDraftToast(t(outcome === "new" ? "common.drafts.saved" : "common.drafts.alreadySaved"));
    router.push(`/${locale}/start/1`);
  };

  return (
    <div className={cn("flex flex-col gap-2 rounded-card border border-line bg-surface p-4", className)}>
      <Button variant="secondary" fullWidth onClick={() => setOpen(true)} loading={busy} aria-haspopup="dialog" data-testid="start-over">
        {t("common.drafts.startOver")}
      </Button>
      <p className="text-center text-sm text-text-muted">{t("common.drafts.startOverHint")}</p>
      <ConfirmSheet
        open={open}
        title={t("common.drafts.confirmTitle")}
        body={t("common.drafts.confirmBody")}
        confirmLabel={t("common.drafts.confirm")}
        cancelLabel={t("common.drafts.cancel")}
        busy={busy}
        onConfirm={onConfirm}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
