"use client";
/**
 * F2 income sources: provident fund (with the fund's own rate, asked, never assumed), gratuity,
 * public pension (the country's scheme name when known), other fixed pension and rent are counted;
 * the old-age allowance and family support are shown, never counted. Every edit writes to the store,
 * so the result below lowers live.
 */
import type { ReactNode } from "react";
import { getRate, type M7IncomeSources, type M7Mode, type OldAgeAllowanceEligibility, type Sex } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { YesNo } from "@/components/ui/YesNo";
import { useCountry, useCountryRates } from "@/lib/country/useCountry";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";
import { localizeName } from "@/components/explain/localizeName";
import { RateInput } from "../m3/RateInput";
import { CountInput } from "./CountInput";

export function NotCounted() {
  const { t } = useT();
  return <span className="inline-flex shrink-0 items-center rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-muted">{t("m7.sources.notCounted")}</span>;
}

function SourceCard({ title, hint, on, onAdd, onRemove, badge, children, testId }: { title: string; hint: string; on: boolean; onAdd?: () => void; onRemove?: () => void; badge?: ReactNode; children?: ReactNode; testId: string }) {
  const { t } = useT();
  return (
    <Card data-testid={testId}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-text">{title}</h3>
          <p className="mt-0.5 text-sm text-text-muted">{hint}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {badge}
          {onAdd && !on && (
            <Button variant="secondary" onClick={onAdd} aria-label={`${t("m7.sources.add")}: ${title}`}>
              {t("m7.sources.add")}
            </Button>
          )}
          {onRemove && on && (
            <Button variant="ghost" onClick={onRemove} aria-label={`${t("m7.sources.remove")}: ${title}`}>
              {t("m7.sources.remove")}
            </Button>
          )}
        </div>
      </div>
      {on && children && <div className="mt-4 flex flex-col gap-4">{children}</div>}
    </Card>
  );
}

export interface IncomeSourcesProps {
  mode: M7Mode;
  sex?: Sex;
  /** Monthly saving the sources save (baseline minus with sources); null when unknown. */
  loweredBy: number | null;
}

export function IncomeSources({ mode, sex, loweredBy }: IncomeSourcesProps) {
  const { t, locale } = useT();
  const f = useFormat();
  const rates = useCountryRates();
  const { context } = useCountry();
  const sources: M7IncomeSources = useTakaStore((s) => s.m7.sources) ?? {};
  const setM7 = useTakaStore((s) => s.setM7);
  const patch = (p: Partial<M7IncomeSources>) => setM7({ sources: { ...sources, ...p } });

  const scheme = context.institutions?.pensionScheme ?? null;
  const elig = rates.rows.old_age_allowance_eligibility?.valueJson as OldAgeAllowanceEligibility | undefined;
  const allowanceAge = elig ? (sex === "female" ? elig.womenAge : elig.menAge) : null;
  const allowanceMonthly = rates.rows.old_age_allowance_monthly ? getRate(rates, "old_age_allowance_monthly") : null;

  const pf = sources.providentFund;
  const gr = sources.gratuity;
  const pp = sources.publicPension;

  const counted =
    mode === "working" ? (
      <>
        <SourceCard
          testId="m7-source-pf"
          title={t("m7.sources.pf.title")}
          hint={t("m7.sources.pf.hint")}
          on={pf !== undefined}
          onAdd={() => patch({ providentFund: { balance: 0, monthlyContribution: 0, rate: 0 } })}
          onRemove={() => patch({ providentFund: undefined })}
        >
          {pf && (
            <>
              <MoneyInput id="m7-pf-balance" value={pf.balance} onChange={(n) => patch({ providentFund: { ...pf, balance: n ?? 0 } })} label={t("m7.sources.pf.balance")} min={0} />
              <MoneyInput
                id="m7-pf-contribution"
                value={pf.monthlyContribution}
                onChange={(n) => patch({ providentFund: { ...pf, monthlyContribution: n ?? 0 } })}
                label={t("m7.sources.pf.contribution")}
                hint={t("m7.sources.pf.contributionHint")}
                min={0}
              />
              <RateInput id="m7-pf-rate" value={pf.rate} onChange={(r) => patch({ providentFund: { ...pf, rate: r ?? 0 } })} label={t("m7.sources.pf.rate")} hint={t("m7.sources.pf.rateHint")} />
            </>
          )}
        </SourceCard>

        <SourceCard
          testId="m7-source-gratuity"
          title={t("m7.sources.gratuity.title")}
          hint={t("m7.sources.gratuity.hint")}
          on={gr !== undefined}
          onAdd={() => patch({ gratuity: { yearsOfService: 0, basicMonthly: 0 } })}
          onRemove={() => patch({ gratuity: undefined })}
        >
          {gr && (
            <>
              <CountInput id="m7-gratuity-years" value={gr.yearsOfService} onChange={(n) => patch({ gratuity: { ...gr, yearsOfService: n ?? 0 } })} label={t("m7.sources.gratuity.years")} min={0} max={80} unitLabel={t("common.unit.years")} />
              <MoneyInput id="m7-gratuity-basic" value={gr.basicMonthly} onChange={(n) => patch({ gratuity: { ...gr, basicMonthly: n ?? 0 } })} label={t("m7.sources.gratuity.basic")} min={0} />
              <CountInput
                id="m7-gratuity-days"
                value={gr.employerDaysPerYear ?? null}
                onChange={(n) => patch({ gratuity: { ...gr, employerDaysPerYear: n ?? undefined } })}
                label={t("m7.sources.gratuity.employerDays")}
                hint={t("m7.sources.gratuity.employerDaysHint")}
                min={0}
                max={366}
              />
            </>
          )}
        </SourceCard>

        <SourceCard
          testId="m7-source-pension"
          title={t("m7.sources.pension.title")}
          hint={t("m7.sources.pension.hint")}
          on={pp !== undefined}
          onAdd={() => patch({ publicPension: { monthlyContribution: 0 } })}
          onRemove={() => patch({ publicPension: undefined })}
        >
          {pp && (
            <>
              {scheme && (
                <p className="text-sm text-text-muted">
                  <a href={scheme.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center font-medium text-brand-700 underline underline-offset-2">
                    {t("m7.sources.pension.scheme", { name: localizeName(scheme.name, locale) })}
                  </a>
                </p>
              )}
              <MoneyInput id="m7-pension-contribution" value={pp.monthlyContribution} onChange={(n) => patch({ publicPension: { ...pp, monthlyContribution: n ?? 0 } })} label={t("m7.sources.pension.contribution")} min={0} />
              <MoneyInput
                id="m7-pension-expected"
                value={pp.expectedMonthly ?? null}
                onChange={(n) => patch({ publicPension: { ...pp, expectedMonthly: n ?? undefined } })}
                label={t("m7.sources.pension.expected")}
                hint={t("m7.sources.pension.expectedHint")}
                min={0}
              />
            </>
          )}
        </SourceCard>

        <SourceCard
          testId="m7-source-fixed"
          title={t("m7.sources.fixedPension.title")}
          hint={t("m7.sources.fixedPension.hint")}
          on={sources.fixedPensionMonthly !== undefined}
          onAdd={() => patch({ fixedPensionMonthly: 0 })}
          onRemove={() => patch({ fixedPensionMonthly: undefined })}
        >
          <MoneyInput id="m7-fixed" value={sources.fixedPensionMonthly ?? null} onChange={(n) => patch({ fixedPensionMonthly: n ?? 0 })} label={t("m7.sources.fixedPension.label")} min={0} />
        </SourceCard>

        <SourceCard
          testId="m7-source-rent"
          title={t("m7.sources.rent.title")}
          hint={t("m7.sources.rent.hint")}
          on={sources.rentMonthly !== undefined}
          onAdd={() => patch({ rentMonthly: 0 })}
          onRemove={() => patch({ rentMonthly: undefined })}
        >
          <MoneyInput id="m7-rent" value={sources.rentMonthly ?? null} onChange={(n) => patch({ rentMonthly: n ?? 0 })} label={t("m7.sources.rent.label")} min={0} />
        </SourceCard>
      </>
    ) : null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">{mode === "working" ? t("m7.sources.intro") : t("m7.sources.retiredIntro")}</p>
      {loweredBy !== null && loweredBy > 0 && (
        <p className="rounded-xl bg-status-green-soft px-3 py-2 text-sm font-medium text-status-green" aria-live="polite" data-testid="m7-sources-lowered">
          {t("m7.sources.lowered", { amount: f.money(loweredBy) })}
        </p>
      )}
      {counted}

      <SourceCard testId="m7-source-allowance" title={t("m7.sources.allowance.title")} hint={t("m7.sources.allowance.hint")} on badge={<NotCounted />}>
        <YesNo
          label={t("m7.sources.allowance.label")}
          value={sources.oldAgeAllowanceEligible ?? null}
          onChange={(v) => patch({ oldAgeAllowanceEligible: v })}
          yesLabel={t("common.yes")}
          noLabel={t("common.no")}
        />
        {sources.oldAgeAllowanceEligible === true && allowanceMonthly !== null && allowanceAge !== null && (
          <p className="text-sm text-text-muted">{t("m7.sources.allowance.amount", { amount: f.money(allowanceMonthly), age: f.number(allowanceAge) })}</p>
        )}
      </SourceCard>

      <SourceCard testId="m7-source-family" title={t("m7.sources.family.title")} hint={t("m7.sources.family.hint")} on badge={<NotCounted />}>
        <MoneyInput id="m7-family" value={sources.familySupportMonthly ?? null} onChange={(n) => patch({ familySupportMonthly: n ?? undefined })} label={t("m7.sources.family.label")} min={0} />
      </SourceCard>
    </div>
  );
}
