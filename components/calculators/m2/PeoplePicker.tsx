"use client";
/** Who the health cover includes (self, partner, children, parents) plus how many children and parents. */
import type { CoverPerson } from "@taka/engine";
import { ChoiceButtons } from "@/components/ui/ChoiceButtons";
import { SliderWithNumber } from "@/components/ui/SliderWithNumber";
import { useT } from "@/lib/i18n/useT";
import { CHILDREN_MAX, COVER_PEOPLE, PARENTS_MAX } from "./input";

export interface PeopleValue {
  healthCovered: CoverPerson[];
  childrenCount: number;
  parentsCount: number;
}

export interface PeoplePickerProps {
  id: string;
  value: PeopleValue;
  onChange: (patch: Partial<PeopleValue>) => void;
  /** Accessible name of the choice group. */
  label: string;
}

export function PeoplePicker({ id, value, onChange, label }: PeoplePickerProps) {
  const { t } = useT();
  const has = (p: CoverPerson) => value.healthCovered.includes(p);
  return (
    <div className="flex flex-col gap-4">
      <ChoiceButtons<CoverPerson>
        multi
        columns={2}
        label={label}
        options={COVER_PEOPLE.map((p) => ({ value: p, label: t(`m2.person.${p}`) }))}
        value={value.healthCovered}
        onChange={(next) => {
          const arr = Array.isArray(next) ? next : [next];
          // Keep the fixed order so the stored list never depends on tap order.
          onChange({ healthCovered: COVER_PEOPLE.filter((p) => arr.includes(p)) });
        }}
      />
      {has("child") && (
        <SliderWithNumber
          id={`${id}-children`}
          value={value.childrenCount}
          onChange={(n) => onChange({ childrenCount: Math.round(n) })}
          min={1}
          max={CHILDREN_MAX}
          step={1}
          label={t("m2.input.childrenCount.label")}
        />
      )}
      {has("parent") && (
        <SliderWithNumber
          id={`${id}-parents`}
          value={value.parentsCount}
          onChange={(n) => onChange({ parentsCount: Math.round(n) })}
          min={1}
          max={PARENTS_MAX}
          step={1}
          label={t("m2.input.parentsCount.label")}
        />
      )}
    </div>
  );
}
