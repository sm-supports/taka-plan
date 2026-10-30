"use client";
/** Layout bits shared by the calculator pages: sections, label/value rows, field wrapper, demo banner. */
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ title, children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("flex flex-col gap-4", className)} aria-label={title}>
      <h2 className="text-lg font-bold text-text">{title}</h2>
      {children}
    </section>
  );
}

export interface Figure {
  key: string;
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
}

/** A compact definition list of supporting figures. */
export function FigureList({ items, className }: { items: Figure[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-line", className)}>
      {items.map((it) => (
        <div key={it.key} className="flex items-start justify-between gap-4 py-2.5">
          <div className="min-w-0">
            <dt className="text-sm font-medium text-text-muted">{it.label}</dt>
            {it.hint && <p className="mt-0.5 text-xs text-text-faint">{it.hint}</p>}
          </div>
          <dd className="shrink-0 text-base font-semibold tabular-nums text-text">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Shown while `?demo=1` renders fixture numbers instead of the engine result. */
export function DemoBanner({ text }: { text: string }) {
  return (
    <p role="status" className="mt-3 rounded-xl border border-status-amber/30 bg-status-amber-soft px-3 py-2 text-xs font-medium text-status-amber">
      {text}
    </p>
  );
}

/** Field wrapper: label, optional hint, then a control that carries no label of its own (ChoiceButtons, YesNo). */
export function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5" role="group" aria-labelledby={`${id}-label`}>
      <span id={`${id}-label`} className="text-base font-semibold text-text">
        {label}
      </span>
      {hint && <p className="text-sm text-text-muted">{hint}</p>}
      {children}
    </div>
  );
}
