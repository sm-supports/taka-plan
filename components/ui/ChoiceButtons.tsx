"use client";
/** Big tappable options instead of a <select>; supports single or multi-select with aria-pressed. */
import { cn } from "./cn";

export interface ChoiceOption<V extends string = string> {
  value: V;
  label: string;
  hint?: string;
}

export interface ChoiceButtonsProps<V extends string = string> {
  options: ChoiceOption<V>[];
  value: V | V[] | null;
  onChange: (next: V | V[]) => void;
  multi?: boolean;
  columns?: 1 | 2;
  /** Accessible name for the group. */
  label?: string;
  className?: string;
}

export function ChoiceButtons<V extends string = string>({ options, value, onChange, multi, columns = 1, label, className }: ChoiceButtonsProps<V>) {
  const selected: V[] = Array.isArray(value) ? value : value === null ? [] : [value];

  const toggle = (v: V) => {
    if (multi) {
      onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
    } else {
      onChange(v);
    }
  };

  return (
    <div role="group" aria-label={label} className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-1", className)}>
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(o.value)}
            className={cn(
              "tap flex min-h-14 flex-col items-start justify-center rounded-xl border px-4 py-3 text-left transition-colors",
              on ? "border-brand-600 bg-brand-50 text-brand-900" : "border-line bg-surface text-text hover:bg-surface-muted",
            )}
          >
            <span className="flex w-full items-center justify-between gap-2 text-base font-semibold">
              {o.label}
              {on && (
                <svg className="h-5 w-5 shrink-0 text-brand-600" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {o.hint && <span className="mt-0.5 text-sm text-text-muted">{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}
