"use client";
/** Annual-rate input in percent (Latin or Bangla digits); value in and out is a decimal Rate (0.12). */
import { useEffect, useId, useState } from "react";
import { cn } from "@/components/ui/cn";
import { useFormat } from "@/lib/i18n/useFormat";
import { parsePercent, percentText } from "./percent";

export interface RateInputProps {
  id: string;
  value: number | null;
  onChange: (rate: number | null) => void;
  label: string;
  hint?: string;
  placeholder?: string;
  className?: string;
}

export function RateInput({ id, value, onChange, label, hint, placeholder, className }: RateInputProps) {
  const uid = useId();
  const hintId = `${id || uid}-hint`;
  const { percent, inputDigits } = useFormat();
  const [text, setText] = useState<string>(() => inputDigits(percentText(value)));

  // Keep the box in sync when the value changes from outside and the text does not already parse to it.
  useEffect(() => {
    const parsed = parsePercent(text);
    if (value === null && text.trim() === "") return;
    if (parsed !== value) setText(inputDigits(percentText(value)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inputDigits]);

  const parsed = parsePercent(text);
  const invalid = text.trim() !== "" && parsed === null;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-base font-semibold text-text">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={text}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={hint ? hintId : undefined}
          onChange={(e) => {
            const next = inputDigits(e.target.value);
            setText(next);
            onChange(parsePercent(next));
          }}
          className={cn(
            "tap w-full rounded-xl border bg-surface py-3 ps-4 pe-12 text-2xl font-semibold tabular-nums text-text placeholder:font-normal placeholder:text-text-faint",
            invalid ? "border-status-red" : "border-line focus:border-brand-500",
          )}
        />
        <span className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-xl font-semibold text-text-muted" aria-hidden="true">
          %
        </span>
      </div>
      {parsed !== null && !invalid && (
        <p className="text-sm text-brand-700" aria-live="polite">
          = {percent(parsed)}
        </p>
      )}
    </div>
  );
}
