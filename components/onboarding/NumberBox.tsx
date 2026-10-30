"use client";
/** MoneyInput-like box for a plain whole number (age): big digits, Latin or Bangla, unit suffix. */
import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";
import { useFormat } from "@/lib/i18n/useFormat";
import { parseAgeInput } from "@/lib/onboarding/validate";

export interface NumberBoxProps {
  id: string;
  value: number | null;
  onChange: (n: number | null) => void;
  label: string;
  unit?: string;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}

export function NumberBox({ id, value, onChange, label, unit, placeholder, invalid, describedBy, className }: NumberBoxProps) {
  const { number, inputDigits } = useFormat();
  const [text, setText] = useState<string>(() => (value === null ? "" : inputDigits(String(value))));

  // Follow outside changes (decade shortcut) unless the box already reads as that value.
  useEffect(() => {
    if (value === null) {
      if (text.trim() !== "" && parseAgeInput(text) !== null) setText("");
      return;
    }
    if (parseAgeInput(text) !== value) setText(inputDigits(String(value)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inputDigits]);

  const parsed = parseAgeInput(text);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-base font-semibold text-text">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="next"
          value={text}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            const nextText = inputDigits(e.target.value);
            setText(nextText);
            onChange(parseAgeInput(nextText));
          }}
          className={cn(
            "tap w-full rounded-xl border bg-surface py-3 pl-4 pr-20 text-2xl font-semibold tabular-nums text-text placeholder:text-text-faint placeholder:font-normal",
            invalid ? "border-status-red" : "border-line focus:border-brand-500",
          )}
        />
        {unit && (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-base font-medium text-text-muted" aria-hidden="true">
            {unit}
          </span>
        )}
      </div>
      {parsed !== null && !invalid && (
        <p className="text-sm text-brand-700" aria-live="polite">
          = {number(parsed)} {unit}
        </p>
      )}
    </div>
  );
}
