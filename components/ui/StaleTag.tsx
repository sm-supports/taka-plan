"use client";
/** Small grey tag: "may be outdated" for rates past review, or "our assumption" for defaults. */
import { useT } from "@/lib/i18n/useT";
import { cn } from "./cn";

export interface StaleTagProps {
  kind: "stale" | "assumption";
  className?: string;
}

export function StaleTag({ kind, className }: StaleTagProps) {
  const { t } = useT();
  return (
    <span className={cn("inline-flex items-center rounded-md bg-surface-muted px-1.5 py-0.5 text-xs text-text-muted", className)}>
      {kind === "stale" ? t("common.mayBeOutdated") : t("common.ourAssumption")}
    </span>
  );
}
