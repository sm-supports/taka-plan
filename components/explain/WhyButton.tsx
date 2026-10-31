"use client";
/**
 * The "Why this number?" affordance. Uncontrolled by default; pass `open` + `onOpenChange`
 * to drive it from the URL (?why=<bucketId>).
 */
import { useCallback, useState } from "react";
import type { Explanation } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n/useT";
import { WhyDrawer } from "./WhyDrawer";

export interface WhyButtonProps {
  explanation: Explanation;
  /** Drawer title, e.g. "Why ৳5,700 for Emergency fund?"; defaults to common.explain.title. */
  title?: string;
  /** Which step ids to show; defaults to every step in the explanation. */
  stepIds?: readonly string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  /** Narrow columns: show the short "Why?" (the accessible name stays "Why this number?"). */
  short?: boolean;
}

export function WhyButton({ explanation, title, stepIds, open, onOpenChange, className, short }: WhyButtonProps) {
  const { t } = useT();
  const [internal, setInternal] = useState(false);
  const controlled = open !== undefined;
  const shown = controlled ? open : internal;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInternal(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );
  const close = useCallback(() => setOpen(false), [setOpen]);

  return (
    <>
      <Button
        variant="ghost"
        className={className}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={shown}
        aria-label={short ? t("common.button.whyThisNumber") : undefined}
      >
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="17" r="1" fill="currentColor" />
          </svg>
          <span dir="auto">{short ? t("common.button.why") : t("common.button.whyThisNumber")}</span>
        </span>
      </Button>
      <WhyDrawer explanation={explanation} title={title ?? t("common.explain.title")} stepIds={stepIds} open={shown} onClose={close} />
    </>
  );
}
