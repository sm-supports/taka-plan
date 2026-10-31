"use client";
/**
 * Returning visit: every M6State input on one page. Shown values are what the engine runs with
 * (filled risk answers, default gold share and horizon); only what the user changes is written.
 */
import { RISK_PROFILES, type M6Input, type RiskAnswer, type RiskProfile } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { ChoiceButtons } from "@/components/ui/ChoiceButtons";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { SliderWithNumber } from "@/components/ui/SliderWithNumber";
import { YesNo } from "@/components/ui/YesNo";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import type { M6State } from "@/lib/store/types";
import { Field, Section } from "../shared/Figures";
import { answerOrder } from "./M6Flow";
import { HORIZON_MAX, HORIZON_MIN, RISK_KEYS, type RiskKey } from "./input";

export interface M6InputsProps {
  /** What the engine runs with. */
  input: M6Input;
  /** The risk answers the user gave (the rest are filled from the profile). */
  storedRisk: M6State["risk"];
  suggestedProfile: RiskProfile;
  goldBounds: { min: number; max: number; default: number };
  noEquityYears: number;
  cashOnlyYears: number;
  onChange: (patch: Partial<M6State>) => void;
  readOnly?: boolean;
}

export function M6Inputs({ input, storedRisk, suggestedProfile, goldBounds, noEquityYears, cashOnlyYears, onChange, readOnly }: M6InputsProps) {
  const { t } = useT();
  const f = useFormat();
  const write = (patch: Partial<M6State>) => !readOnly && onChange(patch);
  const setRisk = (k: RiskKey, v: RiskAnswer) => write({ risk: { ...storedRisk, [k]: v } });
  const profile = input.profileOverride ?? suggestedProfile;
  const goldPct = Math.round((input.goldShare ?? goldBounds.default) * 100);

  return (
    <Section title={t("m6.section.inputs")} id="m6-inputs">
      {RISK_KEYS.map((k) => (
        <Field key={k} id={`m6-${k}`} label={t(`m6.input.${k}.label`)}>
          <ChoiceButtons<string>
            label={t(`m6.input.${k}.label`)}
            options={answerOrder(k).map((a) => ({ value: String(a), label: t(`m6.answer.${k}.${a}`) }))}
            value={String(input.risk[k])}
            onChange={(v) => {
              const pick = Array.isArray(v) ? v[0] : v;
              if (pick !== undefined) setRisk(k, Number(pick) as RiskAnswer);
            }}
          />
        </Field>
      ))}

      <Field id="m6-profile" label={t("m6.input.profileOverride.label")} hint={t("m6.input.profileOverride.hint")}>
        <ChoiceButtons<RiskProfile>
          label={t("m6.input.profileOverride.label")}
          options={RISK_PROFILES.map((p) => ({ value: p, label: t(`m6.profile.${p}`), hint: p === suggestedProfile ? t("m6.input.profileOverride.suggested") : undefined }))}
          value={profile}
          onChange={(v) => {
            const pick = Array.isArray(v) ? v[0] : v;
            if (pick) write({ profileOverride: pick === suggestedProfile ? undefined : pick });
          }}
        />
      </Field>

      <SliderWithNumber
        id="m6-gold"
        value={goldPct}
        onChange={(n) => write({ goldShare: n / 100 })}
        min={Math.round(goldBounds.min * 100)}
        max={Math.round(goldBounds.max * 100)}
        step={1}
        label={t("m6.input.goldShare.label")}
        hint={t("m6.input.goldShare.hint", { min: f.percent(goldBounds.min, 0), max: f.percent(goldBounds.max, 0) })}
        format={(n) => f.percent(n / 100, 0)}
      />
      {input.goldShare !== undefined && Math.abs(input.goldShare - goldBounds.default) > 1e-9 && (
        <Button variant="ghost" className="self-start" onClick={() => write({ goldShare: undefined })}>
          {t("m6.input.goldShare.reset", { share: f.percent(goldBounds.default, 0) })}
        </Button>
      )}

      <SliderWithNumber
        id="m6-horizon"
        value={input.horizonYears}
        onChange={(n) => write({ horizonYears: n })}
        min={HORIZON_MIN}
        max={HORIZON_MAX}
        step={1}
        label={t("m6.input.horizonYears.label")}
        hint={t("m6.input.horizonYears.hint", { noEquity: f.number(noEquityYears), cashOnly: f.number(cashOnlyYears) })}
        unitLabel={t(input.horizonYears === 1 ? "common.unit.year" : "common.unit.years")}
      />

      <MoneyInput id="m6-lump" value={input.lumpSum} onChange={(n) => write({ lumpSum: n ?? undefined })} label={t("m6.input.lumpSum.label")} hint={t("m6.input.lumpSum.hint")} min={0} />
      <MoneyInput id="m6-monthly" value={input.monthly} onChange={(n) => write({ monthly: n ?? undefined })} label={t("m6.input.monthly.label")} hint={t("m6.input.monthly.hint")} min={0} />
      <MoneyInput
        id="m6-property"
        value={input.propertyValue ?? null}
        onChange={(n) => write({ propertyValue: n ?? undefined })}
        label={t("m6.input.propertyValue.label")}
        hint={t("m6.input.propertyValue.hint")}
        min={0}
      />

      <Field id="m6-direct" label={t("m6.input.directShares.label")} hint={t("m6.input.directShares.hint")}>
        <YesNo label={t("m6.input.directShares.label")} value={input.directShares === true} onChange={(v) => write({ directShares: v })} yesLabel={t("common.yes")} noLabel={t("common.no")} />
      </Field>

    </Section>
  );
}
