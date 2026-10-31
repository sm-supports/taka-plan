"use client";
/** Taka text input: accepts Latin or Bangla digits and "12.5 lakh"; the box shows the locale's digits; the formatted amount sits under the field. */
import { useEffect, useId, useState } from "react";
import { parseTakaInput } from "@taka/engine";
import { useFormat } from "@/lib/i18n/useFormat";
import { cn } from "./cn";

export interface MoneyInputProps {
  id: string;
  value: number | null;
  onChange: (n: number | null) => void;
  label: string;
  hint?: string;
  error?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function MoneyInput({ id, value, onChange, label, hint, error, min, max, placeholder, autoFocus, className }: MoneyInputProps) {
  const { taka, inputDigits } = useFormat();
  const uid = useId();
  const hintId = `${id || uid}-hint`;
  const previewId = `${id || uid}-preview`;
  const errorId = `${id || uid}-error`;
  const [text, setText] = useState<string>(() => (value === null ? "" : inputDigits(String(value))));

  // Keep the box in sync when the value is changed from outside (e.g. a slider) and the text does not already parse to it.
  useEffect(() => {
    const parsed = parseTakaInput(text);
    if (value === null && text.trim() === "") return;
    if (parsed !== value) setText(value === null ? "" : inputDigits(String(value)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inputDigits]);

  const parsed = parseTakaInput(text);
  const outOfRange = parsed !== null && ((min !== undefined && parsed < min) || (max !== undefined && parsed > max));
  const invalid = Boolean(error) || (text.trim() !== "" && parsed === null) || outOfRange;
  const describedBy = [hint ? hintId : null, parsed !== null ? previewId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

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
        <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-xl font-semibold text-text-muted" aria-hidden="true">
          ৳
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="next"
          autoFocus={autoFocus}
          value={text}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            // Latin digits from a hardware keyboard are shown in the locale's script; parseTakaInput reads both.
            const next = inputDigits(e.target.value);
            setText(next);
            onChange(parseTakaInput(next));
          }}
          className={cn(
            "tap w-full rounded-xl border bg-surface py-3 ps-10 pe-4 text-2xl font-semibold tabular-nums text-text placeholder:text-text-faint placeholder:font-normal",
            invalid ? "border-status-red" : "border-line focus:border-brand-500",
          )}
        />
      </div>
      {parsed !== null && !invalid && (
        <p id={previewId} className="text-sm text-brand-700" aria-live="polite">
          = {taka(parsed)}
        </p>
      )}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-status-red">
          {error}
        </p>
      ) : outOfRange ? (
        <p id={errorId} role="alert" className="text-sm text-status-red">
          {min !== undefined && max !== undefined ? `${taka(min)} – ${taka(max)}` : min !== undefined ? `≥ ${taka(min)}` : max !== undefined ? `≤ ${taka(max)}` : null}
        </p>
      ) : null}
    </div>
  );
}
