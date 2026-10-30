/** Padded rounded surface with an optional header slot; the basic container for plan cards. */
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  children?: ReactNode;
}

export function Card({ header, children, className, ...rest }: CardProps) {
  return (
    <div className={cn("rounded-card border border-line bg-surface p-4 shadow-sm", className)} {...rest}>
      {header && <div className="mb-3 flex items-start justify-between gap-3">{header}</div>}
      {children}
    </div>
  );
}
