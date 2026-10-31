"use client";
/**
 * First visit (empty m2 slice): four questions, one per screen. Each answer is written to the store
 * as soon as it is given; the prefilled "who to cover" answer is written when the user confirms it.
 */
import { useState } from "react";
import type { Dependent } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { StepFrame } from "@/components/ui/StepFrame";
import { YesNo } from "@/components/ui/YesNo";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";
import { DEFAULT_CHILDREN, DEFAULT_PARENTS, defaultCovered } from "./input";
import { PeoplePicker, type PeopleValue } from "./PeoplePicker";

const TOTAL = 4;

export interface M2FlowProps {
  dependents: Dependent[];
  onDone: () => void;
}

export function M2Flow({ dependents, onDone }: M2FlowProps) {
  const { t } = useT();
  const m2 = useTakaStore((s) => s.m2);
  const setM2 = useTakaStore((s) => s.setM2);
  const [step, setStep] = useState(1);

  const people: PeopleValue = {
    healthCovered: m2.healthCovered ?? defaultCovered(dependents),
    childrenCount: m2.childrenCount ?? DEFAULT_CHILDREN,
    parentsCount: m2.parentsCount ?? DEFAULT_PARENTS,
  };

  const back = step > 1 ? () => setStep((s) => s - 1) : undefined;
  const advance = () => setStep((s) => Math.min(TOTAL, s + 1));

  const finish = () => {
    // Confirming the prefilled list is the user's answer; counts only for the kinds they kept.
    setM2({
      healthCovered: people.healthCovered,
      ...(people.healthCovered.includes("child") ? { childrenCount: people.childrenCount } : {}),
      ...(people.healthCovered.includes("parent") ? { parentsCount: people.parentsCount } : {}),
    });
    onDone();
  };

  return (
    <div>
      <p className="text-sm font-semibold text-brand-700">{t("m2.flow.eyebrow")}</p>
      {step === 1 && (
        <StepFrame step={1} total={TOTAL} title={t("m2.flow.smoker.title")} hint={t("m2.flow.smoker.hint")} onNext={advance} nextDisabled={m2.smoker === undefined}>
          <YesNo label={t("m2.flow.smoker.title")} value={m2.smoker ?? null} onChange={(v) => setM2({ smoker: v })} yesLabel={t("common.yes")} noLabel={t("common.no")} />
        </StepFrame>
      )}
      {step === 2 && (
        <StepFrame step={2} total={TOTAL} title={t("m2.flow.lifeCover.title")} hint={t("m2.flow.lifeCover.hint")} onBack={back} onNext={advance} nextDisabled={m2.existingLifeCover === undefined}>
          <MoneyInput
            id="m2-flow-life"
            value={m2.existingLifeCover ?? null}
            onChange={(n) => setM2({ existingLifeCover: n ?? undefined })}
            label={t("m2.input.existingLifeCover.label")}
            min={0}
            autoFocus
          />
          <Button
            variant="ghost"
            className="mt-3"
            onClick={() => {
              setM2({ existingLifeCover: 0 });
              advance();
            }}
          >
            {t("m2.flow.lifeCover.none")}
          </Button>
        </StepFrame>
      )}
      {step === 3 && (
        <StepFrame step={3} total={TOTAL} title={t("m2.flow.healthCover.title")} hint={t("m2.flow.healthCover.hint")} onBack={back} onNext={advance} nextDisabled={m2.existingHealthCover === undefined}>
          <MoneyInput
            id="m2-flow-health"
            value={m2.existingHealthCover ?? null}
            onChange={(n) => setM2({ existingHealthCover: n ?? undefined })}
            label={t("m2.input.existingHealthCover.label")}
            min={0}
            autoFocus
          />
          <Button
            variant="ghost"
            className="mt-3"
            onClick={() => {
              setM2({ existingHealthCover: 0 });
              advance();
            }}
          >
            {t("m2.flow.healthCover.none")}
          </Button>
        </StepFrame>
      )}
      {step === 4 && (
        <StepFrame step={4} total={TOTAL} title={t("m2.flow.people.title")} hint={t("m2.flow.people.hint")} onBack={back} onNext={finish} nextLabel={t("m2.flow.seeResult")}>
          <PeoplePicker
            id="m2-flow-people"
            label={t("m2.flow.people.title")}
            value={people}
            onChange={(patch) => setM2(patch)}
          />
        </StepFrame>
      )}
    </div>
  );
}
