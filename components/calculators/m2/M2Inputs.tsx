"use client";
/** Returning visit: every M2 answer on one page. Each edit writes straight to the store. */
import type { M2Input } from "@taka/engine";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { SliderWithNumber } from "@/components/ui/SliderWithNumber";
import { YesNo } from "@/components/ui/YesNo";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";
import { Field, Section } from "../shared/Figures";
import {
  COVER_TO_AGE_MAX,
  COVER_TO_AGE_MIN,
  DEFAULT_CHILDREN,
  DEFAULT_PARENTS,
  INCOME_SHARE_MAX,
  INCOME_SHARE_MIN,
  PARENT_AGE_GAP,
  PARENT_AGE_MAX,
  PARENT_AGE_MIN,
  defaultCovered,
} from "./input";
import { PeoplePicker } from "./PeoplePicker";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export interface M2InputsProps {
  /** The engine input the result uses (profile values and defaults filled in). */
  input: M2Input;
  /** Rates defaults for the two sliders. */
  defaultCoverToAge: number;
  defaultIncomeShare: number;
}

export function M2Inputs({ input, defaultCoverToAge, defaultIncomeShare }: M2InputsProps) {
  const { t } = useT();
  const f = useFormat();
  const m2 = useTakaStore((s) => s.m2);
  const setM2 = useTakaStore((s) => s.setM2);

  const covered = m2.healthCovered ?? defaultCovered(input.dependents);
  const coverToAge = clamp(m2.coverToAge ?? defaultCoverToAge, COVER_TO_AGE_MIN, COVER_TO_AGE_MAX);
  const sharePct = clamp(Math.round((m2.incomeShare ?? defaultIncomeShare) * 100), INCOME_SHARE_MIN, INCOME_SHARE_MAX);
  const parentAge = clamp(m2.parentAge ?? input.age + PARENT_AGE_GAP, PARENT_AGE_MIN, PARENT_AGE_MAX);

  return (
    <Section title={t("m2.section.inputs")}>
      <Field id="m2-smoker" label={t("m2.input.smoker.label")} hint={t("m2.input.smoker.hint")}>
        <YesNo label={t("m2.input.smoker.label")} value={m2.smoker ?? false} onChange={(v) => setM2({ smoker: v })} yesLabel={t("common.yes")} noLabel={t("common.no")} />
      </Field>

      <MoneyInput
        id="m2-life"
        value={m2.existingLifeCover ?? null}
        onChange={(n) => setM2({ existingLifeCover: n ?? undefined })}
        label={t("m2.input.existingLifeCover.label")}
        hint={t("m2.input.existingLifeCover.hint")}
        min={0}
      />

      <MoneyInput
        id="m2-health"
        value={m2.existingHealthCover ?? null}
        onChange={(n) => setM2({ existingHealthCover: n ?? undefined })}
        label={t("m2.input.existingHealthCover.label")}
        hint={t("m2.input.existingHealthCover.hint")}
        min={0}
      />

      <Field id="m2-people" label={t("m2.input.people.label")} hint={t("m2.input.people.hint")}>
        <PeoplePicker
          id="m2-people"
          label={t("m2.input.people.label")}
          value={{ healthCovered: covered, childrenCount: m2.childrenCount ?? DEFAULT_CHILDREN, parentsCount: m2.parentsCount ?? DEFAULT_PARENTS }}
          onChange={(patch) => setM2(patch)}
        />
      </Field>

      {covered.includes("parent") && (
        <SliderWithNumber
          id="m2-parentAge"
          value={parentAge}
          onChange={(n) => setM2({ parentAge: Math.round(n) })}
          min={PARENT_AGE_MIN}
          max={PARENT_AGE_MAX}
          step={1}
          label={t("m2.input.parentAge.label")}
          hint={t("m2.input.parentAge.hint")}
          unitLabel={t("common.unit.years")}
        />
      )}

      <SliderWithNumber
        id="m2-coverToAge"
        value={coverToAge}
        onChange={(n) => setM2({ coverToAge: Math.round(n) })}
        min={COVER_TO_AGE_MIN}
        max={COVER_TO_AGE_MAX}
        step={1}
        label={t("m2.input.coverToAge.label")}
        hint={t("m2.input.coverToAge.hint")}
        unitLabel={t("common.unit.years")}
      />

      <SliderWithNumber
        id="m2-incomeShare"
        value={sharePct}
        onChange={(n) => setM2({ incomeShare: Math.round(n) / 100 })}
        min={INCOME_SHARE_MIN}
        max={INCOME_SHARE_MAX}
        step={5}
        label={t("m2.input.incomeShare.label")}
        hint={t("m2.input.incomeShare.hint")}
        format={(n) => f.percent(n / 100, 0)}
      />

      <MoneyInput
        id="m2-investments"
        value={m2.investments ?? null}
        onChange={(n) => setM2({ investments: n ?? undefined })}
        label={t("m2.input.investments.label")}
        hint={t("m2.input.investments.hint")}
        min={0}
      />
    </Section>
  );
}
