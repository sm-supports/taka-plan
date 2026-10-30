"use client";
/**
 * Goal fields: name, cost (MoneyInput), years (slider 1–40), type (ChoiceButtons).
 * Used for the new-goal draft (saved only when complete) and for editing a saved goal in place.
 */
import type { GoalType } from "@taka/engine";
import { ChoiceButtons } from "@/components/ui/ChoiceButtons";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { SliderWithNumber } from "@/components/ui/SliderWithNumber";
import { useT } from "@/lib/i18n/useT";
import { GOAL_TYPES, MAX_YEARS, MIN_YEARS, type GoalDraft } from "./goals";

export interface GoalEditorProps {
  id: string;
  draft: GoalDraft;
  onChange: (patch: Partial<GoalDraft>) => void;
  /** Shown under the name when the draft is incomplete. */
  incompleteMessage?: string;
}

export function GoalEditor({ id, draft, onChange, incompleteMessage }: GoalEditorProps) {
  const { t } = useT();
  const nameEmpty = draft.name.trim().length === 0;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-name`} className="text-base font-semibold text-text">
          {t("m5.input.name.label")}
        </label>
        <p className="text-sm text-text-muted">{t("m5.input.name.hint")}</p>
        <input
          id={`${id}-name`}
          type="text"
          autoComplete="off"
          enterKeyHint="next"
          value={draft.name}
          placeholder={t("m5.input.name.placeholder")}
          aria-invalid={nameEmpty && incompleteMessage ? true : undefined}
          onChange={(e) => onChange({ name: e.target.value })}
          className="tap w-full rounded-xl border border-line bg-surface px-4 py-3 text-lg font-semibold text-text placeholder:font-normal placeholder:text-text-faint focus:border-brand-500"
        />
      </div>
      <MoneyInput id={`${id}-cost`} label={t("m5.input.cost.label")} hint={t("m5.input.cost.hint")} value={draft.cost} min={1} onChange={(n) => onChange({ cost: n })} />
      <SliderWithNumber
        id={`${id}-years`}
        label={t("m5.input.years.label")}
        hint={t("m5.input.years.hint", { min: MIN_YEARS, max: MAX_YEARS })}
        value={draft.years}
        min={MIN_YEARS}
        max={MAX_YEARS}
        step={1}
        unitLabel={t("common.unit.years")}
        onChange={(n) => onChange({ years: Math.round(n) })}
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-base font-semibold text-text">{t("m5.input.type.label")}</span>
        <p className="text-sm text-text-muted">{t("m5.input.type.hint")}</p>
        <ChoiceButtons<GoalType>
          label={t("m5.input.type.label")}
          columns={2}
          options={GOAL_TYPES.map((v) => ({ value: v, label: t(`common.goalType.${v}`) }))}
          value={draft.type}
          onChange={(v) => onChange({ type: Array.isArray(v) ? v[0] : v })}
        />
      </div>
      {incompleteMessage && (
        <p role="status" className="text-sm text-status-amber">
          {incompleteMessage}
        </p>
      )}
    </div>
  );
}
