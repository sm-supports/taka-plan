"use client";
/** Whole-number input (years of service, days): any script's digits in, the locale's digits shown; null when blank. */
import { useEffect, useState } from "react";
import { fromBanglaDigits } from "@taka/engine";
import { cn } from "@/components/ui/cn";
import { useFormat } from "@/lib/i18n/useFormat";

export interface CountInputProps {
  id: string;
  value: number | null;
  onChange: (n: number | null) => void;
  label: string;
  hint?: string;
  min?: number;
  max?: number;
  unitLabel?: string;
}

function parseCount(raw: string, min: number, max: number): number | null {
  const cleaned = fromBanglaDigits(raw).replace(/[,\s]/g, "");
  if (cleaned === "" || !/^\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return n >= min && n <= max ? n : null;
}

export function CountInput({ id, value, onChange, label, hint, min = 0, max = 999, unitLabel }: CountInputProps) {
  const { inputDigits } = useFormat();
  const [text, setText] = useState(() => (value === null ? "" : inputDigits(String(value))));

  useEffect(() => {
    if (value === null && text.trim() === "") return;
    if (parseCount(text, min, max) !== value) setText(value === null ? "" : inputDigits(String(value)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inputDigits]);

  const invalid = text.trim() !== "" && parseCount(text, min, max) === null;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-semibold text-text">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={text}
          aria-invalid={invalid || undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => {
            const next = inputDigits(e.target.value);
            setText(next);
            onChange(parseCount(next, min, max));
          }}
          className={cn(
            "tap w-full rounded-xl border bg-surface py-3 ps-4 text-2xl font-semibold tabular-nums text-text",
            unitLabel ? "pe-20" : "pe-4",
            invalid ? "border-status-red" : "border-line focus:border-brand-500",
          )}
        />
        {unitLabel && (
          <span className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-base font-medium text-text-muted" aria-hidden="true">
            {unitLabel}
          </span>
        )}
      </div>
    </div>
  );
}
