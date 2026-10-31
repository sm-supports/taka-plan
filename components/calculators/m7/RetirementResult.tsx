"use client";
/**
 * The M7 result screen (PRD "Result screen"). Working: the monthly amount first, then the corpus;
 * the 80-versus-100 card; the low / base / high range; the "how long would my money last" chart
 * with its one-line verdict; what starting five years earlier or later changes; what the income
 * sources add. Retired: the withdrawal plan, the two-pot rule and the retiree options. Both: the
 * long-horizon bucket (F3), the life table and support ratio, and the notes.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import {
  getRate,
  type Instrument,
  type LifeTableRemaining,
  type M7Input,
  type M7Result,
  type M7StepId,
  type SupportRatio,
} from "@taka/engine";
import { WhyButton } from "@/components/explain/WhyButton";
import { BigNumber } from "@/components/ui/BigNumber";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { useCountry, useCountryRates } from "@/lib/country/useCountry";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { FigureList, type Figure } from "../shared/Figures";
import { NotCounted } from "./IncomeSources";
import { START_SHIFT_YEARS } from "./input";
import { LongevityChart } from "./LongevityChart";

const PLAN_STEPS: readonly M7StepId[] = ["m7.spendingAtRetirement", "m7.corpusPlan", "m7.savingsFv", "m7.providentFund", "m7.gratuity", "m7.fixedPensions", "m7.gap", "m7.monthly"];
const CONTRAST_STEPS: readonly M7StepId[] = ["m7.spendingAtRetirement", "m7.corpusContrast"];
const WITHDRAWAL_STEPS: readonly M7StepId[] = ["m7.withdrawal", "m7.safePot"];
const RETIRED_TARGET_STEPS: readonly M7StepId[] = ["m7.spendingAtRetirement", "m7.corpusContrast", "m7.corpusPlan", "m7.gap"];

/** Option key → the product slot whose local name is shown (the pensioner certificate has no generic slot). */
const OPTION_SLOT: Partial<Record<string, Instrument>> = {
  "m7.option.savingsCertificate": "sanchayapatra_5y",
  "m7.option.tbonds": "tbond_5y",
  "m7.option.depositLadder": "fdr_1y",
};

export interface RetirementResultProps {
  result: M7Result;
  input: M7Input;
  /** Started START_SHIFT_YEARS earlier / later (working only); null when not possible. */
  earlier: M7Result | null;
  later: M7Result | null;
  /** Whether the before-retirement growth follows the plan's asset mix. */
  mixUsed?: boolean;
}

export function verdictKey(kind: M7Result["verdict"]["kind"]): string {
  return `m7.result.verdict.${kind}`;
}

export function RetirementResult({ result, input, earlier, later, mixUsed }: RetirementResultProps) {
  const { t, locale } = useT();
  const f = useFormat();
  const rates = useCountryRates();
  const { context } = useCountry();
  const working = result.mode === "working";
  const contrastAge = result.targets.contrast.planTo;
  const planTo = result.planToAge;
  const verdictText = t(verdictKey(result.verdict.kind), { age: f.number(result.verdict.age) });

  const verdict = (
    <div data-testid="m7-verdict" data-status={result.verdict.status} data-kind={result.verdict.kind}>
      <StatusPill status={result.verdict.status}>{verdictText}</StatusPill>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {working ? (
        <Card className="flex flex-col items-center gap-3 text-center" data-testid="m7-headline">
          {verdict}
          <BigNumber
            label={t("m7.result.headline")}
            value={
              <>
                {f.money(result.targets.plan.monthlySaving)}
                <span className="ms-1 text-lg font-medium text-text-muted">{t("common.unit.perMonth")}</span>
              </>
            }
            caption={
              result.targets.plan.monthlySaving === 0
                ? t("m7.result.funded", { planTo: f.number(planTo) })
                : t("m7.result.caption", { planTo: f.number(planTo), retirementAge: f.number(result.retirementAge), corpus: f.money(result.targets.plan.corpus, { compact: true }) })
            }
          />
          <p className="text-sm text-text-muted">{t("m7.result.currentSaving", { amount: f.money(input.monthlySaving) })}</p>
          {mixUsed && <p className="text-xs text-text-faint">{t("m7.result.mixUsed")}</p>}
          <WhyButton explanation={result.explain} stepIds={PLAN_STEPS} />
        </Card>
      ) : (
        <RetiredHeadline result={result} input={input} verdict={verdict} />
      )}

      {working ? <ContrastCard result={result} /> : <RetiredTargets result={result} />}

      {working && (
        <Card header={<h3 className="text-base font-semibold text-text">{t("m7.result.range.title")}</h3>} data-testid="m7-range">
          <FigureList
            items={[
              { key: "low", label: t("m7.result.range.low"), value: f.money(result.monthlySavingRange.low) },
              { key: "base", label: t("m7.result.range.base"), value: f.money(result.monthlySavingRange.base) },
              { key: "high", label: t("m7.result.range.high"), value: f.money(result.monthlySavingRange.high) },
            ]}
          />
          <p className="mt-2 text-xs text-text-faint">{t("m7.result.range.hint")}</p>
        </Card>
      )}

      <Card header={<h3 className="text-base font-semibold text-text">{t("m7.result.chart.title")}</h3>}>
        <p className="mb-3 text-sm text-text-muted">{t("m7.result.chart.hint")}</p>
        <LongevityChart points={result.simulation} retirementAge={result.retirementAge} contrastAge={contrastAge} verdict={result.verdict} verdictText={verdictText} />
        <div className="mt-3 flex justify-center">{verdict}</div>
      </Card>

      {working && <ShiftCard input={input} result={result} earlier={earlier} later={later} />}

      {working && <IncomeCard result={result} />}
      {!working && <ShownOnlyCard result={result} />}

      {!working && result.withdrawal && result.withdrawal.options.length > 0 && (
        <Card header={<h3 className="text-base font-semibold text-text">{t("m7.retired.options.title")}</h3>} data-testid="m7-options">
          <ul className="flex flex-col gap-3">
            {result.withdrawal.options.map((key) => {
              const slot = OPTION_SLOT[key];
              const names = slot ? context.instrumentNames?.[slot] : undefined;
              const local = names ? (locale === "bn" ? names.local : (names.en ?? names.local)) : null;
              return (
                <li key={key} className="flex gap-2 text-sm leading-relaxed text-text">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                  <span>
                    {t(key)}
                    {local && <span className="mt-0.5 block text-xs text-text-muted">{t("m7.retired.options.localName", { name: local })}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card className="border-brand-200 bg-brand-50" header={<h3 className="text-base font-semibold text-brand-900">{t("m7.bucket.title")}</h3>} data-testid="m7-bucket">
        <p className="text-sm leading-relaxed text-brand-900">{t("m7.bucket.body", { retirementAge: f.number(result.retirementAge) })}</p>
        {working && <p className="mt-2 text-sm font-medium text-brand-900">{t("m7.bucket.lock", { retirementAge: f.number(result.retirementAge) })}</p>}
        <Link href={`/${locale}/m6`} className="tap mt-3 inline-flex min-h-12 items-center rounded-xl px-1 text-base font-semibold text-brand-700 underline underline-offset-2">
          {t("m7.bucket.link")}
        </Link>
      </Card>

      <LifeTableCard rates={rates} />

      {result.notes.length > 0 && (
        <Card header={<h3 className="text-base font-semibold text-text">{t("m7.notes.title")}</h3>} data-testid="m7-notes">
          <ul className="flex flex-col gap-2 text-sm leading-relaxed text-text-muted">
            {result.notes.map((k) => (
              <li key={k} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function ContrastCard({ result }: { result: M7Result }) {
  const { t } = useT();
  const f = useFormat();
  const { contrast, plan } = result.targets;
  const cols = [
    { key: "contrast", target: contrast, emphasis: false },
    { key: "plan", target: plan, emphasis: true },
  ];
  return (
    <Card header={<h3 className="text-base font-semibold text-text">{t("m7.result.contrast.title", { contrast: f.number(contrast.planTo), planTo: f.number(plan.planTo) })}</h3>} data-testid="m7-contrast-card">
      <div className="grid grid-cols-2 gap-3">
        {cols.map(({ key, target, emphasis }) => (
          <div key={key} data-testid={`m7-target-${key}`} className={emphasis ? "rounded-xl border border-brand-200 bg-brand-50 p-3" : "rounded-xl border border-line bg-surface-muted p-3"}>
            <div className="text-sm font-semibold text-text">{t("m7.result.contrast.to", { age: f.number(target.planTo) })}</div>
            <div className="mt-2 text-xs text-text-muted">{t("m7.result.contrast.target")}</div>
            <div className="text-lg font-bold tabular-nums text-text" data-testid={`m7-target-${key}-corpus`}>
              {f.money(target.corpus, { compact: true })}
            </div>
            <div className="mt-2 text-xs text-text-muted">{t("m7.result.contrast.monthly")}</div>
            <div className={emphasis ? "text-xl font-bold tabular-nums text-brand-700" : "text-xl font-bold tabular-nums text-text"} data-testid={`m7-target-${key}-monthly`}>
              {f.money(target.monthlySaving)}
            </div>
            <WhyButton explanation={result.explain} stepIds={key === "plan" ? PLAN_STEPS : CONTRAST_STEPS} className="mt-1 -ms-2 px-2" />
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-text" data-testid="m7-extra">
        {result.extraMonthlyForLongLife > 0
          ? t("m7.result.contrast.extra", { amount: f.money(result.extraMonthlyForLongLife), years: f.number(plan.planTo - contrast.planTo), contrast: f.number(contrast.planTo), planTo: f.number(plan.planTo) })
          : t("m7.result.contrast.noExtra", { contrast: f.number(contrast.planTo) })}
      </p>
      <p className="mt-1 text-xs text-text-faint">{t("m7.result.contrast.footnote", { contrast: f.number(contrast.planTo) })}</p>
    </Card>
  );
}

function RetiredHeadline({ result, input, verdict }: { result: M7Result; input: M7Input; verdict: ReactNode }) {
  const { t } = useT();
  const f = useFormat();
  const rates = useCountryRates();
  const w = result.withdrawal;
  if (!w) return null;
  const fromSavings = Math.max(0, input.monthlySpending - (input.otherMonthlyIncome ?? 0));
  const potYears = rates.rows.withdrawal_safe_pot_years ? getRate(rates, "withdrawal_safe_pot_years") : null;
  return (
    <>
      <Card className="flex flex-col items-center gap-3 text-center" data-testid="m7-withdrawal">
        {verdict}
        <BigNumber
          label={t("m7.retired.headline")}
          value={
            <>
              {f.money(w.monthly)}
              <span className="ms-1 text-lg font-medium text-text-muted">{t("common.unit.perMonth")}</span>
            </>
          }
          caption={t("m7.retired.caption", { firstYear: f.money(w.firstYear), planTo: f.number(result.planToAge) })}
        />
        <p className="text-sm text-text-muted" data-testid="m7-runs-out">
          {w.runsOutAt !== null
            ? t("m7.retired.runsOut", { spending: f.money(fromSavings), age: f.number(w.runsOutAt) })
            : t("m7.retired.lasts", { spending: f.money(fromSavings), planTo: f.number(result.planToAge) })}
        </p>
        <WhyButton explanation={result.explain} stepIds={WITHDRAWAL_STEPS} />
      </Card>
      <Card header={<h3 className="text-base font-semibold text-text">{t("m7.retired.pot.title")}</h3>} data-testid="m7-pot">
        <div className="text-2xl font-bold tabular-nums text-brand-700">{f.money(w.safePot)}</div>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">{t("m7.retired.pot.body", { amount: f.money(w.safePot), years: f.number(potYears ?? 0) })}</p>
      </Card>
    </>
  );
}

function RetiredTargets({ result }: { result: M7Result }) {
  const { t } = useT();
  const f = useFormat();
  const { contrast, plan } = result.targets;
  return (
    <Card header={<h3 className="text-base font-semibold text-text">{t("m7.retired.target.title")}</h3>} data-testid="m7-contrast-card">
      <p className="mb-2 text-sm text-text-muted">{t("m7.retired.target.hint", { contrast: f.number(contrast.planTo), planTo: f.number(plan.planTo) })}</p>
      <FigureList
        items={[
          { key: "contrast", label: t("m7.result.contrast.to", { age: f.number(contrast.planTo) }), value: f.money(contrast.corpus, { compact: true }) },
          { key: "plan", label: t("m7.result.contrast.to", { age: f.number(plan.planTo) }), value: f.money(plan.corpus, { compact: true }) },
        ]}
      />
      <p className="mt-1 text-xs text-text-faint">{t("m7.result.contrast.footnote", { contrast: f.number(contrast.planTo) })}</p>
      <WhyButton explanation={result.explain} stepIds={RETIRED_TARGET_STEPS} className="mt-1 -ms-2 px-2" />
    </Card>
  );
}

function ShiftCard({ input, result, earlier, later }: { input: M7Input; result: M7Result; earlier: M7Result | null; later: M7Result | null }) {
  const { t } = useT();
  const f = useFormat();
  const row = (key: string, label: string, r: M7Result | null): Figure => ({
    key,
    label,
    value: r ? t("m7.result.shift.perMonth", { amount: f.money(r.targets.plan.monthlySaving) }) : t("m7.result.shift.notPossible"),
  });
  return (
    <Card header={<h3 className="text-base font-semibold text-text">{t("m7.result.shift.title", { years: f.number(START_SHIFT_YEARS) })}</h3>} data-testid="m7-shift">
      <FigureList
        items={[
          row("earlier", t("m7.result.shift.earlier", { age: f.number(input.age - START_SHIFT_YEARS) }), earlier),
          row("now", t("m7.result.shift.now", { age: f.number(input.age) }), result),
          row("later", t("m7.result.shift.later", { age: f.number(input.age + START_SHIFT_YEARS) }), later),
        ]}
      />
      <p className="mt-2 text-xs text-text-faint">{t("m7.result.shift.hint")}</p>
    </Card>
  );
}

function IncomeCard({ result }: { result: M7Result }) {
  const { t } = useT();
  const f = useFormat();
  const inc = result.income;
  const items: Figure[] = [];
  if (inc.providentFundAtRetirement > 0) items.push({ key: "pf", label: t("m7.result.income.pf"), value: f.money(inc.providentFundAtRetirement, { compact: true }) });
  if (inc.gratuity > 0) items.push({ key: "gratuity", label: t("m7.result.income.gratuity"), value: f.money(inc.gratuity, { compact: true }) });
  if (inc.publicPensionMonthly > 0) items.push({ key: "publicPension", label: t("m7.result.income.publicPension"), value: f.money(inc.publicPensionMonthly) });
  if (inc.fixedPensionsValue > 0) items.push({ key: "pensions", label: t("m7.result.income.pensions"), value: f.money(inc.fixedPensionsValue, { compact: true }) });
  if (inc.rentAtRetirementYearly > 0) items.push({ key: "rent", label: t("m7.result.income.rent"), value: f.money(inc.rentAtRetirementYearly, { compact: true }) });
  const shown = shownOnly(result, t, f);
  if (items.length === 0 && shown.length === 0) return null;
  return (
    <Card header={<h3 className="text-base font-semibold text-text">{t("m7.result.income.title")}</h3>} data-testid="m7-income">
      <FigureList items={[...items, ...shown]} />
    </Card>
  );
}

function ShownOnlyCard({ result }: { result: M7Result }) {
  const { t } = useT();
  const f = useFormat();
  const shown = shownOnly(result, t, f);
  if (shown.length === 0) return null;
  return (
    <Card data-testid="m7-income">
      <FigureList items={shown} />
    </Card>
  );
}

/** Old-age allowance and family support: listed with a "not counted" tag, never added to anything. */
function shownOnly(result: M7Result, t: ReturnType<typeof useT>["t"], f: ReturnType<typeof useFormat>): Figure[] {
  const out: Figure[] = [];
  const inc = result.income;
  if (inc.oldAgeAllowanceMonthly > 0)
    out.push({
      key: "allowance",
      label: t("m7.result.income.allowance"),
      hint: <NotCounted />,
      value: <span className="text-text-muted line-through decoration-text-faint">{f.money(inc.oldAgeAllowanceMonthly)}</span>,
    });
  if (inc.familySupportMonthly > 0)
    out.push({
      key: "family",
      label: t("m7.result.income.family"),
      hint: <NotCounted />,
      value: <span className="text-text-muted line-through decoration-text-faint">{f.money(inc.familySupportMonthly)}</span>,
    });
  return out;
}

function LifeTableCard({ rates }: { rates: ReturnType<typeof useCountryRates> }) {
  const { t } = useT();
  const f = useFormat();
  const row = rates.rows.life_table_remaining;
  const table = row?.valueJson as LifeTableRemaining | undefined;
  const support = rates.rows.support_ratio?.valueJson as SupportRatio | undefined;
  const rows = table?.rows ?? [];
  const hasMen = rows.some((r) => r.men != null);
  const hasWomen = rows.some((r) => r.women != null);
  const hasProjected = rows.some((r) => r.projected != null);
  const years = (n: number | null | undefined) => (n == null ? "—" : f.number(n, Number.isInteger(n) ? 0 : 1));
  const firstPoint = support?.points[0];
  const lastPoint = support && support.points.length > 1 ? support.points[support.points.length - 1] : undefined;
  if (rows.length === 0 && !firstPoint) return null;
  return (
    <Card header={<h3 className="text-base font-semibold text-text">{t("m7.lifeTable.title")}</h3>} data-testid="m7-life-table">
      {rows.length > 0 && (
        <>
          <p className="mb-3 text-sm text-text-muted">{t("m7.lifeTable.hint")}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="border-b border-line text-start text-xs text-text-muted">
                  <th scope="col" className="py-2 pe-2 text-start font-semibold">
                    {t("m7.lifeTable.age")}
                  </th>
                  <th scope="col" className="py-2 pe-2 text-end font-semibold">
                    {t("m7.lifeTable.total")}
                  </th>
                  {hasMen && (
                    <th scope="col" className="py-2 pe-2 text-end font-semibold">
                      {t("m7.lifeTable.men")}
                    </th>
                  )}
                  {hasWomen && (
                    <th scope="col" className="py-2 pe-2 text-end font-semibold">
                      {t("m7.lifeTable.women")}
                    </th>
                  )}
                  {hasProjected && (
                    <th scope="col" className="py-2 text-end font-semibold">
                      {t("m7.lifeTable.projected")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.age} className="border-b border-line last:border-0">
                    <th scope="row" className="py-2 pe-2 text-start font-semibold text-text">
                      {f.number(r.age)}
                    </th>
                    <td className="py-2 pe-2 text-end text-text">{years(r.total)}</td>
                    {hasMen && <td className="py-2 pe-2 text-end text-text-muted">{years(r.men)}</td>}
                    {hasWomen && <td className="py-2 pe-2 text-end text-text-muted">{years(r.women)}</td>}
                    {hasProjected && <td className="py-2 text-end text-text-muted">{years(r.projected)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {row && <p className="mt-2 text-xs text-text-faint">{t("m7.lifeTable.source", { source: row.sourceName, date: f.asOf(row.asOf) })}</p>}
        </>
      )}
      {firstPoint && lastPoint && (
        <p className="mt-3 text-sm leading-relaxed text-text-muted" data-testid="m7-support-ratio">
          {t("m7.supportRatio", { fromYear: f.number(firstPoint.year), fromValue: f.number(firstPoint.value), toYear: f.number(lastPoint.year), toValue: f.number(lastPoint.value) })}
        </p>
      )}
    </Card>
  );
}
