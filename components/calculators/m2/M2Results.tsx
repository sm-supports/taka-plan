"use client";
/** Result cards: life cover, health cover, the premium ranges with the monthly amount the plan reserves, and the notes. */
import type { M2Input, M2Result, M2StepId } from "@taka/engine";
import { WhyButton } from "@/components/explain/WhyButton";
import { BigNumber } from "@/components/ui/BigNumber";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { Term } from "@/components/ui/Term";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { FigureList } from "../shared/Figures";

const LIFE_STEPS: readonly M2StepId[] = ["m2.years", "m2.incomeNeed", "m2.lifeCover", "m2.lifeGap"];
const HEALTH_STEPS: readonly M2StepId[] = ["m2.perStay", "m2.healthTarget", "m2.healthGap"];
const PREMIUM_STEPS: readonly M2StepId[] = ["m2.lifePremium", "m2.healthPremium", "m2.monthlyNeed"];

export interface M2ResultsProps {
  input: M2Input;
  result: M2Result;
  /** Cover-to age the result used (the answer or the rates default). */
  coverToAge: number;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-bold text-text">{children}</h3>;
}

export function M2Results({ input, result, coverToAge }: M2ResultsProps) {
  const { t } = useT();
  const f = useFormat();
  const { life, health } = result;
  const yearsLabel = (n: number) => `${f.number(n)} ${t(n === 1 ? "common.unit.year" : "common.unit.years")}`;
  const range = (low: number, high: number) => t("m2.premium.range", { low: f.money(low), high: f.money(high) });
  // The premium caption names only the covers that are still to buy.
  const buyLife = life.needed && life.gap > 0;
  const buyHealth = health.gap > 0;
  const premiumCaptionKey =
    result.monthlyPremiumNeed === 0 || (!buyLife && !buyHealth) ? "m2.premium.captionNone" : buyLife && buyHealth ? "m2.premium.caption" : buyLife ? "m2.premium.captionLife" : "m2.premium.captionHealth";
  // Notes already shown inside the life card are not repeated in "Good to know".
  const notes = result.notes.filter((k) => !(k === "m2.note.noDependents" && !life.needed) && !(k === "m2.note.debtsOnly" && life.needed));

  return (
    <>
      {life.needed ? (
        <Card data-testid="m2-life" header={<CardTitle>{t("m2.life.title")}</CardTitle>}>
          <div className="flex flex-col items-center gap-3 text-center">
            <StatusPill status={life.status}>{t(`m2.life.status.${life.status}`)}</StatusPill>
            <BigNumber label={t("m2.life.label")} value={f.money(life.cover)} caption={t("m2.life.multiple", { multiple: f.number(life.incomeMultiple, 1) })} />
            <WhyButton explanation={result.explain} stepIds={LIFE_STEPS} title={t("m2.life.why", { amount: f.money(life.cover) })} />
          </div>
          <FigureList
            className="mt-3"
            items={[
              { key: "existing", label: <Term k="sum_insured">{t("m2.life.existing")}</Term>, value: f.money(input.existingLifeCover) },
              { key: "gap", label: t("m2.life.gap"), value: f.money(life.gap), hint: life.gap === 0 ? t("m2.life.enough") : undefined },
              { key: "years", label: t("m2.life.years"), value: t("m2.life.yearsValue", { years: yearsLabel(life.yearsCovered), age: f.number(coverToAge) }) },
              ...(life.incomeNeed > 0 ? [{ key: "income", label: t("m2.life.incomeNeed"), value: f.money(life.incomeNeed), hint: t("m2.life.incomeNeedHint") }] : []),
            ]}
          />
          {result.notes.includes("m2.note.debtsOnly") && <p className="mt-3 text-sm leading-relaxed text-text-muted">{t("m2.note.debtsOnly")}</p>}
        </Card>
      ) : (
        <Card data-testid="m2-life" header={<CardTitle>{t("m2.life.title")}</CardTitle>}>
          <StatusPill status="green">{t("m2.life.notNeeded")}</StatusPill>
          <p className="mt-3 text-base leading-relaxed text-text">{t("m2.note.noDependents")}</p>
        </Card>
      )}

      <Card data-testid="m2-health" header={<CardTitle>{t("m2.health.title")}</CardTitle>}>
        <div className="flex flex-col items-center gap-3 text-center">
          <StatusPill status={health.status}>{t(`m2.health.status.${health.status}`)}</StatusPill>
          <BigNumber label={t("m2.health.label")} value={f.money(health.target)} caption={t(health.people === 1 ? "m2.health.captionOne" : "m2.health.caption", { people: f.number(health.people) })} />
          <WhyButton explanation={result.explain} stepIds={HEALTH_STEPS} title={t("m2.health.why", { amount: f.money(health.target) })} />
        </div>
        <FigureList
          className="mt-3"
          items={[
            { key: "perPerson", label: t("m2.health.perPerson"), value: f.money(health.perStay), hint: t("m2.health.perPersonHint") },
            { key: "existing", label: t("m2.health.existing"), value: f.money(input.existingHealthCover) },
            { key: "gap", label: t("m2.health.gap"), value: f.money(health.gap), hint: health.gap === 0 ? t("m2.health.enough") : undefined },
          ]}
        />
      </Card>

      <Card data-testid="m2-premium" header={<CardTitle>{t("m2.premium.title")}</CardTitle>}>
        <div className="flex flex-col items-center gap-3 text-center">
          <BigNumber
            label={t("m2.premium.monthly")}
            value={
              <>
                <bdi>{f.money(result.monthlyPremiumNeed)}</bdi>
                <span className="ms-1 text-lg font-medium text-text-muted">{t("common.unit.perMonth")}</span>
              </>
            }
            caption={t(premiumCaptionKey)}
          />
          <WhyButton explanation={result.explain} stepIds={PREMIUM_STEPS} title={t("m2.premium.why", { amount: f.money(result.monthlyPremiumNeed) })} />
        </div>
        <FigureList
          className="mt-3"
          items={[
            ...(life.needed
              ? [
                  {
                    key: "life",
                    label: t("m2.premium.life"),
                    value: life.gap > 0 ? range(life.premiumYearly.low, life.premiumYearly.high) : t("m2.premium.none"),
                    hint: life.gap > 0 ? t(input.smoker ? "m2.premium.smokerHint" : "m2.premium.lifeHint", { gap: f.money(life.gap) }) : undefined,
                  },
                ]
              : []),
            {
              key: "health",
              label: t("m2.premium.health"),
              value: health.gap > 0 ? range(health.premiumYearly.low, health.premiumYearly.high) : t("m2.premium.none"),
              hint: health.gap > 0 ? t("m2.premium.healthHint", { gap: f.money(health.gap) }) : undefined,
            },
          ]}
        />
        <p className="mt-2 text-xs font-medium text-status-amber">{t("m2.premium.indicative")}</p>
      </Card>

      {notes.length > 0 && (
        <Card header={<CardTitle>{t("m2.section.notes")}</CardTitle>}>
          <ul className="flex flex-col gap-2 text-sm leading-relaxed text-text-muted" data-testid="m2-notes">
            {notes.map((k) => (
              <li key={k} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
