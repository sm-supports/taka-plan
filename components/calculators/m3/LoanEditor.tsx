"use client";
/** One loan row: type, outstanding, annual rate, EMI, months left, remove. */
import type { Loan, LoanType } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { ChoiceButtons } from "@/components/ui/ChoiceButtons";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { SliderWithNumber } from "@/components/ui/SliderWithNumber";
import { useT } from "@/lib/i18n/useT";
import { RateInput } from "./RateInput";

export const LOAN_TYPES: LoanType[] = ["personal", "home", "car", "education", "other"];
export const MAX_MONTHS_LEFT = 360;

export interface LoanEditorProps {
  loan: Loan;
  index: number;
  onChange: (patch: Partial<Loan>) => void;
  onRemove: () => void;
}

export function LoanEditor({ loan, index, onChange, onRemove }: LoanEditorProps) {
  const { t } = useT();
  const id = `loan-${loan.id}`;
  return (
    <fieldset className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4">
      <legend className="sr-only">
        {t("m3.input.loans.title")} {index + 1}
      </legend>
      <ChoiceButtons<LoanType>
        label={t("m3.input.loans.type.label")}
        columns={2}
        options={LOAN_TYPES.map((v) => ({ value: v, label: t(`common.loanType.${v}`) }))}
        value={loan.type}
        onChange={(v) => onChange({ type: Array.isArray(v) ? v[0] : v })}
      />
      <MoneyInput
        id={`${id}-outstanding`}
        label={t("m3.input.loans.outstanding.label")}
        hint={t("m3.input.loans.outstanding.hint")}
        value={loan.outstanding}
        min={0}
        onChange={(n) => n !== null && n >= 0 && onChange({ outstanding: n })}
      />
      <RateInput
        id={`${id}-rate`}
        label={t("m3.input.loans.annualRate.label")}
        hint={t("m3.input.loans.annualRate.hint")}
        value={loan.annualRate}
        onChange={(r) => r !== null && onChange({ annualRate: r })}
      />
      <MoneyInput id={`${id}-emi`} label={t("m3.input.loans.emi.label")} hint={t("m3.input.loans.emi.hint")} value={loan.emi} min={0} onChange={(n) => n !== null && n >= 0 && onChange({ emi: n })} />
      <SliderWithNumber
        id={`${id}-months`}
        label={t("m3.input.loans.monthsLeft.label")}
        hint={t("m3.input.loans.monthsLeft.hint")}
        value={loan.monthsLeft}
        min={1}
        max={MAX_MONTHS_LEFT}
        step={1}
        unitLabel={t("common.unit.months")}
        onChange={(n) => onChange({ monthsLeft: Math.round(n) })}
      />
      <Button variant="secondary" onClick={onRemove}>
        {t("m3.input.loans.remove")}
      </Button>
    </fieldset>
  );
}
