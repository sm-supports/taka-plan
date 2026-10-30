/** Headline figure (e.g. "Save ৳9,000 a month") with a caption under it. */
import type { ReactNode } from "react";
import { cn } from "./cn";

export interface BigNumberProps {
  value: ReactNode;
  caption?: ReactNode;
  /** Small label shown above the figure. */
  label?: ReactNode;
  className?: string;
}

export function BigNumber({ value, caption, label, className }: BigNumberProps) {
  return (
    <div className={cn("text-center", className)}>
      {label && <div className="text-sm font-medium text-text-muted">{label}</div>}
      <div className="mt-1 text-4xl font-bold tracking-tight text-brand-700 tabular-nums sm:text-5xl">{value}</div>
      {caption && <div className="mt-2 text-base text-text-muted">{caption}</div>}
    </div>
  );
}
