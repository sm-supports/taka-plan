"use client";
/** Red/amber/green pill; a bucket demoted from red shows amber plus an "also needs attention" caption. */
import type { ReactNode } from "react";
import type { Status } from "@taka/engine";
import { useT } from "@/lib/i18n/useT";
import { cn } from "./cn";

export interface StatusPillProps {
  status: Status;
  demotedFromRed?: boolean;
  children?: ReactNode;
  className?: string;
}

const STYLE: Record<Status, string> = {
  red: "bg-status-red-soft text-status-red",
  amber: "bg-status-amber-soft text-status-amber",
  green: "bg-status-green-soft text-status-green",
};

const DOT: Record<Status, string> = {
  red: "bg-status-red",
  amber: "bg-status-amber",
  green: "bg-status-green",
};

export function StatusPill({ status, demotedFromRed, children, className }: StatusPillProps) {
  const { t } = useT();
  const shown: Status = demotedFromRed ? "amber" : status;
  const label = children ?? t(`common.status.${shown}`);
  return (
    <span className={cn("inline-flex flex-col items-start gap-0.5", className)}>
      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", STYLE[shown])}>
        <span className={cn("h-2 w-2 rounded-full", DOT[shown])} aria-hidden="true" />
        {label}
      </span>
      {demotedFromRed && <span className="text-xs text-text-muted">{t("common.alsoNeedsAttention")}</span>}
    </span>
  );
}
