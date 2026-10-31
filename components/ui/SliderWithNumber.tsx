"use client";
/**
 * Range slider paired with a typed-number box (typed value wins, Bangla or Latin digits); shows the formatted value.
 * The box never clamps or rewrites what the person is typing: a typed value is committed (and clamped) on blur or Enter,
 * so typing "95" into a box whose minimum is 60 does not turn the first "9" into "60".
 */
import { useEffect, useId, useRef, useState } from "react";
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

/** Parses the box text (Bangla or Latin digits, commas and spaces ignored); null when it is not a number. */
export function parseBoxText(text: string): number | null {
  const cleaned = fromBanglaDigits(text).replace(/[,\s]/g, "");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function SliderWithNumber({ id, value, onChange, min, max, step, label, hint, unitLabel, format, className }: SliderWithNumberProps) {
  const uid = useId();
  const sliderId = id ?? `${uid}-slider`;
  const boxId = `${sliderId}-box`;
  const hintId = `${sliderId}-hint`;
  const { number, inputDigits } = useFormat();
  const fmt = format ?? ((n: number) => number(n, Number.isInteger(step) ? 0 : 1));
  const [text, setText] = useState(() => inputDigits(String(value)));
  const focused = useRef(false);

  useEffect(() => {
    // While the person is typing, leave their text alone; resync only when the box is not focused.
    if (focused.current) return;
    setText(inputDigits(String(value)));
  }, [value, inputDigits]);

  const commit = () => {
    const n = parseBoxText(text);
    if (n === null) {
      setText(inputDigits(String(value)));
      return;
    }
    const next = clamp(n, min, max);
    setText(inputDigits(String(next)));
    if (next !== value) onChange(next);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={sliderId} className="text-base font-semibold text-text">
          {label}
        </label>
        <output htmlFor={sliderId} className="text-lg font-bold tabular-nums text-brand-700" aria-live="polite">
          <bdi>
            {fmt(value)}
            {unitLabel ? <span className="ms-1 text-sm font-medium text-text-muted">{unitLabel}</span> : null}
          </bdi>
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
            setText(inputDigits(String(n)));
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
          onFocus={() => {
            focused.current = true;
          }}
          onChange={(e) => setText(inputDigits(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={() => {
            focused.current = false;
            commit();
          }}
          className="tap w-24 rounded-xl border border-line bg-surface px-3 py-2 text-center text-lg font-semibold tabular-nums focus:border-brand-500"
        />
      </div>
    </div>
  );
}
