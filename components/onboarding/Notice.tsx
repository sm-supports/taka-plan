"use client";
/** Inline validation message. Amber for a caution the user may ignore, red for a blocker. */
import { cn } from "@/components/ui/cn";

export interface NoticeProps {
  tone: "red" | "amber" | "info";
  children: string;
  className?: string;
}

const TONE: Record<NoticeProps["tone"], string> = {
  red: "border-status-red/30 bg-status-red-soft text-status-red",
  amber: "border-status-amber/30 bg-status-amber-soft text-status-amber",
  info: "border-brand-200 bg-brand-50 text-brand-900",
};

export function Notice({ tone, children, className }: NoticeProps) {
  return (
    <p role={tone === "red" ? "alert" : "status"} className={cn("rounded-xl border px-3 py-2 text-sm leading-relaxed", TONE[tone], className)}>
      {children}
    </p>
  );
}
