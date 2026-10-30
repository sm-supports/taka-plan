"use client";
/** Two big side-by-side buttons for a yes/no question. */
import { ChoiceButtons } from "./ChoiceButtons";

export interface YesNoProps {
  value: boolean | null;
  onChange: (v: boolean) => void;
  yesLabel: string;
  noLabel: string;
  label?: string;
  className?: string;
}

export function YesNo({ value, onChange, yesLabel, noLabel, label, className }: YesNoProps) {
  return (
    <ChoiceButtons<"yes" | "no">
      label={label}
      columns={2}
      className={className}
      options={[
        { value: "yes", label: yesLabel },
        { value: "no", label: noLabel },
      ]}
      value={value === null ? null : value ? "yes" : "no"}
      onChange={(v) => onChange(v === "yes")}
    />
  );
}
