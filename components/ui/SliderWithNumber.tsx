"use client";
/** Range slider paired with a typed-number box (typed value wins); shows the formatted value. */
import { useEffect, useId, useState } from "react";
import { fromBanglaDigits } from "@taka/engine";
import { useFormat } from "@/lib/i18n/useFormat";
import { cn } from "./cn";

export interface SliderWithNumberProps {
  id?: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  hint?: string;
  unitLabel?: string;
  format?: (n: number) => string;
  className?: string;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function SliderWithNumber({ id, value, onChange, min, max, step, label, hint, unitLabel, format, className }: SliderWithNumberProps) {
  const uid = useId();
  const sliderId = id ?? `${uid}-slider`;
  const boxId = `${sliderId}-box`;
  const hintId = `${sliderId}-hint`;
  const { number } = useFormat();
  const fmt = format ?? ((n: number) => number(n, Number.isInteger(step) ? 0 : 1));
  const [text, setText] = useState(String(value));

  useEffect(() => {
    const parsed = Number(fromBanglaDigits(text));
    if (!Number.isFinite(parsed) || parsed !== value) setText(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commitText = (raw: string) => {
    setText(raw);
    const n = Number(fromBanglaDigits(raw).replace(/[,\s]/g, ""));
    if (raw.trim() !== "" && Number.isFinite(n)) onChange(clamp(n, min, max));
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={sliderId} className="text-base font-semibold text-text">
          {label}
        </label>
        <output htmlFor={sliderId} className="text-lg font-bold tabular-nums text-brand-700" aria-live="polite">
          {fmt(value)}
          {unitLabel ? <span className="ml-1 text-sm font-medium text-text-muted">{unitLabel}</span> : null}
        </output>
      </div>
      {hint && (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
      <div className="flex items-center gap-3">
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamp(value, min, max)}
          aria-describedby={hint ? hintId : undefined}
          aria-valuetext={`${fmt(value)}${unitLabel ? ` ${unitLabel}` : ""}`}
          onChange={(e) => {
            const n = Number(e.target.value);
            setText(String(n));
            onChange(n);
          }}
          className="min-w-0 flex-1"
        />
        <input
          id={boxId}
          type="text"
          inputMode={Number.isInteger(step) ? "numeric" : "decimal"}
          aria-label={label}
          value={text}
          onChange={(e) => commitText(e.target.value)}
          onBlur={() => setText(String(value))}
          className="tap w-24 rounded-xl border border-line bg-surface px-3 py-2 text-center text-lg font-semibold tabular-nums focus:border-brand-500"
        />
      </div>
    </div>
  );
}
