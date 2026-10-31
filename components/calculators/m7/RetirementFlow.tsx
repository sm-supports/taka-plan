"use client";
/**
 * First visit to M7 (store m7 empty): the PRD's fork, then one question per screen. Working: age
 * (from the profile, confirmed), retirement age, spending, savings, monthly saving, sex (optional).
 * Retired: age, government or private, savings, other income, spending, sex (optional). Every answer
 * is written to the store as soon as it is given; a prefilled value is written when the user moves on.
 */
import { useState } from "react";
import { getRate, M7_AGE_MAX, M7_AGE_MIN, type M7Mode, type RetireeType, type Sex } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { ChoiceButtons } from "@/components/ui/ChoiceButtons";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { SliderWithNumber } from "@/components/ui/SliderWithNumber";
import { StepFrame } from "@/components/ui/StepFrame";
import { useCountryRates } from "@/lib/country/useCountry";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";
import type { M7State } from "@/lib/store/types";

type StepId = "mode" | "age" | "retirementAge" | "spending" | "savings" | "monthlySaving" | "retireeType" | "otherIncome" | "sex";

const WORKING_STEPS: StepId[] = ["mode", "age", "retirementAge", "spending", "savings", "monthlySaving", "sex"];
const RETIRED_STEPS: StepId[] = ["mode", "age", "retireeType", "savings", "otherIncome", "spending", "sex"];

/** Highest retirement age the slider offers. */
export const RETIREMENT_AGE_MAX = 80;

type MoneyKey = "monthlySpending" | "savings" | "monthlySaving" | "otherMonthlyIncome";

export function RetirementFlow({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const f = useFormat();
  const rates = useCountryRates();
  const profile = useTakaStore((s) => s.profile);
  const m1 = useTakaStore((s) => s.m1);
  const m7 = useTakaStore((s) => s.m7);
  const setM7 = useTakaStore((s) => s.setM7);
  const setProfile = useTakaStore((s) => s.setProfile);
  const [index, setIndex] = useState(0);

  const mode: M7Mode | undefined = m7.mode;
  const steps = mode === "retired" ? RETIRED_STEPS : WORKING_STEPS;
  const step = steps[Math.min(index, steps.length - 1)]!;
  const total = steps.length;

  const age = profile.age ?? null;
  const defaultRetire = getRate(rates, "retirement_age_default");
  const retireMin = Math.min(M7_AGE_MAX - 1, (age ?? M7_AGE_MIN) + 1);
  const retireMax = Math.max(retireMin, RETIREMENT_AGE_MAX);
  const retirementAge = m7.retirementAge ?? Math.min(retireMax, Math.max(retireMin, defaultRetire));

  const moneyValue = (key: MoneyKey): number | null => {
    const stored = m7[key];
    if (stored !== undefined) return stored;
    if (key === "monthlySpending") return profile.essentials ?? null;
    if (key === "savings") return m1.liquidSavings ?? null;
    if (key === "otherMonthlyIncome") return 0;
    return null;
  };

  const back = index > 0 ? () => setIndex(index - 1) : undefined;
  const advance = (patch?: M7State) => {
    if (patch && Object.values(patch).some((v) => v !== undefined)) setM7(patch);
    if (index + 1 >= steps.length) onDone();
    else setIndex(index + 1);
  };
  /** Next on a money screen: confirms a prefilled value by writing it. */
  const nextMoney = (key: MoneyKey) => () => advance(m7[key] === undefined ? { [key]: moneyValue(key) ?? undefined } : undefined);

  const frame = { step: index + 1, total, onBack: back };

  switch (step) {
    case "mode":
      return (
        <StepFrame {...frame} title={t("m7.flow.mode.title")} hint={t("m7.flow.mode.hint")}>
          <ChoiceButtons<M7Mode>
            label={t("m7.flow.mode.title")}
            options={[
              { value: "working", label: t("m7.mode.working"), hint: t("m7.mode.workingHint") },
              { value: "retired", label: t("m7.mode.retired"), hint: t("m7.mode.retiredHint") },
            ]}
            value={mode ?? null}
            onChange={(v) => {
              const pick = Array.isArray(v) ? v[0] : v;
              if (pick) advance({ mode: pick });
            }}
          />
        </StepFrame>
      );

    case "age":
      return (
        <StepFrame {...frame} title={t("m7.flow.age.title")} hint={t("m7.flow.age.hint")} onNext={() => advance()} nextDisabled={age === null}>
          <SliderWithNumber
            key="m7-flow-age"
            id="m7-flow-age"
            value={age ?? 30}
            onChange={(n) => setProfile({ age: n })}
            min={M7_AGE_MIN}
            max={M7_AGE_MAX}
            step={1}
            label={t("m7.flow.age.label")}
            unitLabel={t("common.unit.years")}
          />
        </StepFrame>
      );

    case "retirementAge":
      return (
        <StepFrame
          {...frame}
          title={t("m7.flow.retirementAge.title")}
          hint={t("m7.flow.retirementAge.hint", { age: f.number(defaultRetire) })}
          onNext={() => advance(m7.retirementAge === undefined ? { retirementAge } : undefined)}
        >
          <SliderWithNumber
            key="m7-flow-retire"
            id="m7-flow-retire"
            value={retirementAge}
            onChange={(n) => setM7({ retirementAge: n })}
            min={retireMin}
            max={retireMax}
            step={1}
            label={t("m7.flow.retirementAge.label")}
            unitLabel={t("common.unit.years")}
          />
        </StepFrame>
      );

    case "retireeType":
      return (
        <StepFrame {...frame} title={t("m7.flow.retireeType.title")} hint={t("m7.flow.retireeType.hint")}>
          <ChoiceButtons<RetireeType>
            label={t("m7.flow.retireeType.title")}
            options={[
              { value: "government", label: t("m7.retireeType.government"), hint: t("m7.retireeType.governmentHint") },
              { value: "private", label: t("m7.retireeType.private"), hint: t("m7.retireeType.privateHint") },
            ]}
            value={m7.retireeType ?? null}
            onChange={(v) => {
              const pick = Array.isArray(v) ? v[0] : v;
              if (pick) advance({ retireeType: pick });
            }}
          />
        </StepFrame>
      );

    case "spending": {
      const retired = mode === "retired";
      const key = retired ? "m7.flow.retiredSpending" : "m7.flow.spending";
      return (
        <StepFrame {...frame} title={t(`${key}.title`)} hint={t(`${key}.hint`)} onNext={nextMoney("monthlySpending")} nextDisabled={moneyValue("monthlySpending") === null}>
          <MoneyInput key="m7-flow-spending" id="m7-flow-spending" value={moneyValue("monthlySpending")} onChange={(n) => setM7({ monthlySpending: n ?? undefined })} label={t(`${key}.label`)} min={0} autoFocus />
        </StepFrame>
      );
    }

    case "savings": {
      const key = mode === "retired" ? "m7.flow.retiredSavings" : "m7.flow.savings";
      return (
        <StepFrame {...frame} title={t(`${key}.title`)} hint={t(`${key}.hint`)} onNext={nextMoney("savings")} nextDisabled={moneyValue("savings") === null}>
          <MoneyInput key="m7-flow-savings" id="m7-flow-savings" value={moneyValue("savings")} onChange={(n) => setM7({ savings: n ?? undefined })} label={t(`${key}.label`)} min={0} autoFocus />
        </StepFrame>
      );
    }

    case "monthlySaving":
      return (
        <StepFrame {...frame} title={t("m7.flow.monthlySaving.title")} hint={t("m7.flow.monthlySaving.hint")} onNext={nextMoney("monthlySaving")} nextDisabled={moneyValue("monthlySaving") === null}>
          <MoneyInput key="m7-flow-monthly" id="m7-flow-monthly" value={moneyValue("monthlySaving")} onChange={(n) => setM7({ monthlySaving: n ?? undefined })} label={t("m7.flow.monthlySaving.label")} min={0} autoFocus />
        </StepFrame>
      );

    case "otherIncome":
      return (
        <StepFrame {...frame} title={t("m7.flow.otherIncome.title")} hint={t("m7.flow.otherIncome.hint")} onNext={nextMoney("otherMonthlyIncome")} nextDisabled={moneyValue("otherMonthlyIncome") === null}>
          <MoneyInput key="m7-flow-other" id="m7-flow-other" value={moneyValue("otherMonthlyIncome")} onChange={(n) => setM7({ otherMonthlyIncome: n ?? undefined })} label={t("m7.flow.otherIncome.label")} min={0} autoFocus />
        </StepFrame>
      );

    case "sex":
      return (
        <StepFrame {...frame} title={t("m7.flow.sex.title")} hint={t("m7.flow.sex.hint")} onNext={() => advance()} nextLabel={t("m7.flow.seeResult")}>
          <div className="flex flex-col gap-3">
            <ChoiceButtons<Sex>
              columns={2}
              label={t("m7.flow.sex.title")}
              options={[
                { value: "female", label: t("m7.sex.female") },
                { value: "male", label: t("m7.sex.male") },
              ]}
              value={m7.sex ?? null}
              onChange={(v) => {
                const pick = Array.isArray(v) ? v[0] : v;
                if (pick) setM7({ sex: pick });
              }}
            />
            <Button variant="ghost" onClick={() => advance()}>
              {t("m7.flow.sex.skip")}
            </Button>
          </div>
        </StepFrame>
      );
  }
}
