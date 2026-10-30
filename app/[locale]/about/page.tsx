/**
 * /{locale}/about — server component. The full disclaimer, how the plan is built
 * (seven steps, protect → save → grow, returns after tax and after inflation), and a
 * "Sources and assumptions" list with EVERY row of the bundled rates seed, formatted by
 * unit with the locale's digits. No "use client": nothing here is interactive.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  RATES_SEED,
  RATE_KEYS,
  assertSnapshot,
  formatAsOf,
  formatNumber,
  formatPercent,
  formatTaka,
  getTaxSlabs,
  instrumentAfterTax,
  instrumentNominal,
  instrumentReal,
  isStale,
  type Digits,
  type Instrument,
  type RateKey,
  type RateRow,
  type RatesSnapshot,
} from "@taka/engine";
import { Card } from "@/components/ui/Card";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/server";
import { interpolate, translate } from "@/lib/i18n/translate";
import type { Dictionary } from "@/lib/i18n/types";
import { ABOUT_COPY, RATE_GROUPS, type RateGroupId } from "./copy";

type Params = { params: Promise<{ locale: string }> };

/** The seven episodes in order, with the phase each belongs to. */
const STEPS: ReadonlyArray<{ module: "m1" | "m2" | "m3" | "m4" | "m5" | "m6" | "m7"; phase: "protect" | "save" | "grow" }> = [
  { module: "m1", phase: "protect" },
  { module: "m2", phase: "protect" },
  { module: "m3", phase: "protect" },
  { module: "m4", phase: "save" },
  { module: "m5", phase: "grow" },
  { module: "m6", phase: "grow" },
  { module: "m7", phase: "grow" },
];

/** Two instruments whose real return makes the "after tax, after inflation" point (PRD: +2.1% vs −1.5%). */
const EXAMPLE_INSTRUMENTS: readonly Instrument[] = ["sanchayapatra_5y", "fdr_1y"];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Percent with 1 dp, or 2 dp when the source value needs it (11.83% must not read as 11.8% in a sources table). */
function sourcePercent(value: number, digits: Digits): string {
  const hundredths = Math.round(value * 10000);
  const decimals = hundredths % 10 === 0 ? 1 : 2;
  return formatPercent(value, { digits, decimals });
}

function formatValue(row: RateRow, snapshot: RatesSnapshot, locale: Locale, dict: Dictionary): string[] {
  const digits: Digits = locale === "bn" ? "bn" : "latn";
  const copy = ABOUT_COPY[locale];
  switch (row.unit) {
    case "json": {
      if (row.key !== "tax_slabs") return [JSON.stringify(row.valueJson)];
      return getTaxSlabs(snapshot).map((slab) =>
        slab.width === null
          ? interpolate(copy.sources.slabRest, { rate: sourcePercent(slab.rate, digits) })
          : interpolate(copy.sources.slabNext, { rate: sourcePercent(slab.rate, digits), width: formatTaka(slab.width, { digits }) }),
      );
    }
    case "rate":
    case "ratio":
      return [sourcePercent(row.value ?? 0, digits)];
    case "bdt":
      return [formatTaka(row.value ?? 0, { digits })];
    case "years":
      return [`${formatNumber(row.value ?? 0, { digits, decimals: Number.isInteger(row.value) ? 0 : 1 })} ${translate(dict, "common.unit.years")}`];
    case "months":
      return [`${formatNumber(row.value ?? 0, { digits })} ${translate(dict, "common.unit.months")}`];
    default:
      return [String(row.value ?? "")];
  }
}

function groupOf(key: RateKey): RateGroupId {
  for (const g of RATE_GROUPS) if ((g.keys as readonly string[]).includes(key)) return g.id;
  return "other";
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: `${ABOUT_COPY[locale].title} · Taka Plan` };
}

export default async function AboutPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = (key: string, p?: Record<string, string | number>) => translate(dict, key, p);
  const copy = ABOUT_COPY[locale];
  const digits: Digits = locale === "bn" ? "bn" : "latn";
  const snapshot = assertSnapshot(RATES_SEED);
  const today = todayIso();

  const grouped = new Map<RateGroupId, RateRow[]>();
  for (const key of RATE_KEYS) {
    const row = snapshot.rows[key];
    const id = groupOf(key);
    const list = grouped.get(id) ?? [];
    list.push(row);
    grouped.set(id, list);
  }
  const groupOrder: RateGroupId[] = [...RATE_GROUPS.map((g) => g.id), "other"];

  const example = EXAMPLE_INSTRUMENTS.map((instrument) => ({
    instrument,
    headline: instrumentNominal(snapshot, instrument).rate,
    afterTax: instrumentAfterTax(snapshot, instrument),
    real: instrumentReal(snapshot, instrument),
  }));

  return (
    <article className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-text">{copy.title}</h1>
        <p className="mt-2 text-base text-text-muted">{copy.lead}</p>
      </header>

      {/* 1. Disclaimer, in full */}
      <section aria-labelledby="about-disclaimer">
        <h2 id="about-disclaimer" className="text-lg font-semibold text-text">
          {copy.disclaimer.heading}
        </h2>
        <Card className="mt-2">
          <p className="font-medium text-text">{t("common.disclaimer.title")}</p>
          <p className="mt-2 leading-relaxed text-text">{t("common.disclaimer.body")}</p>
          <p className="mt-3 text-sm text-text-muted">{t("common.disclaimer.short")}</p>
        </Card>
      </section>

      {/* 2. Methodology */}
      <section aria-labelledby="about-method" className="flex flex-col gap-3">
        <h2 id="about-method" className="text-lg font-semibold text-text">
          {copy.method.heading}
        </h2>
        <p className="leading-relaxed text-text">{copy.method.intro}</p>
        <Card>
          <ol className="flex flex-col gap-2">
            {STEPS.map((step, i) => (
              <li key={step.module} className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 tabular-nums" aria-hidden="true">
                  {formatNumber(i + 1, { digits })}
                </span>
                <span className="flex-1 font-medium text-text">{t(`common.module.${step.module}`)}</span>
                <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-text-muted">{copy.method.phase[step.phase]}</span>
              </li>
            ))}
          </ol>
        </Card>
        <p className="leading-relaxed text-text">{interpolate(copy.method.order, { share: formatPercent(snapshot.rows.plan_emergency_min_share.value ?? 0, { digits, decimals: 0 }) })}</p>

        <h3 className="mt-2 text-base font-semibold text-text">{copy.method.returnsHeading}</h3>
        <p className="leading-relaxed text-text">{copy.method.returns}</p>
        <Card>
          <p className="text-sm text-text-muted">{copy.method.exampleCaption}</p>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted">
                <th scope="col" className="py-1 pr-2 font-medium" />
                <th scope="col" className="py-1 pr-2 text-right font-medium">
                  {t("common.headline")}
                </th>
                <th scope="col" className="py-1 pr-2 text-right font-medium">
                  {t("common.afterTax")}
                </th>
                <th scope="col" className="py-1 text-right font-medium">
                  {t("common.afterInflation")}
                </th>
              </tr>
            </thead>
            <tbody>
              {example.map((row) => (
                <tr key={row.instrument} className="border-t border-line">
                  <th scope="row" className="py-2 pr-2 text-left font-medium text-text">
                    {t(`common.instrument.${row.instrument}`)}
                  </th>
                  <td className="py-2 pr-2 text-right tabular-nums">{sourcePercent(row.headline, digits)}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{formatPercent(row.afterTax, { digits })}</td>
                  <td className={`py-2 text-right font-semibold tabular-nums ${row.real < 0 ? "text-status-red" : "text-status-green"}`}>{formatPercent(row.real, { digits })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="leading-relaxed text-text">{copy.method.rounding}</p>
        <p className="leading-relaxed text-text">{copy.method.onDevice}</p>
      </section>

      {/* 3. Sources and assumptions: every seed row */}
      <section aria-labelledby="about-sources" className="flex flex-col gap-3">
        <h2 id="about-sources" className="text-lg font-semibold text-text">
          {copy.sources.heading}
        </h2>
        <p className="leading-relaxed text-text">{interpolate(copy.sources.intro, { version: formatNumber(snapshot.version, { digits }), date: formatAsOf(snapshot.publishedAt, locale) })}</p>

        {groupOrder.map((groupId) => {
          const rows = grouped.get(groupId);
          if (!rows || rows.length === 0) return null;
          return (
            <div key={groupId}>
              <h3 className="mb-2 mt-2 text-base font-semibold text-text">{copy.sources.group[groupId]}</h3>
              <ul className="flex flex-col gap-2">
                {rows.map((row) => {
                  const stale = isStale(row, today);
                  const label = locale === "bn" ? (row.labelBn ?? row.labelEn) : row.labelEn;
                  const values = formatValue(row, snapshot, locale, dict);
                  const isHttp = /^https?:\/\//.test(row.sourceUrl);
                  return (
                    <li key={row.key}>
                      <Card className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium text-text">{label}</p>
                          <div className="flex shrink-0 flex-wrap justify-end gap-1">
                            {row.isAppAssumption && <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-xs text-text-muted">{t("common.ourAssumption")}</span>}
                            {stale && <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-xs text-text-muted">{t("common.mayBeOutdated")}</span>}
                          </div>
                        </div>
                        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                          <dt className="text-text-muted">{copy.sources.value}</dt>
                          <dd className="font-semibold text-text tabular-nums">
                            {values.length === 1 ? (
                              values[0]
                            ) : (
                              <ul className="flex flex-col">
                                {values.map((v) => (
                                  <li key={v}>{v}</li>
                                ))}
                              </ul>
                            )}
                            {row.rangeLow != null && row.rangeHigh != null && (
                              <span className="block font-normal text-text-muted">
                                {t("common.range", { low: sourcePercent(row.rangeLow, digits), high: sourcePercent(row.rangeHigh, digits) })}
                              </span>
                            )}
                          </dd>
                          <dt className="sr-only">{copy.sources.dates}</dt>
                          <dd className="col-span-2 text-text-muted tabular-nums">
                            {t("common.asOf", { date: formatAsOf(row.asOf, locale) })} · {copy.sources.nextReview}: {formatAsOf(row.nextReview, locale)}
                          </dd>
                          <dt className="text-text-muted">{t("common.source")}</dt>
                          <dd className="min-w-0 break-words text-text">
                            {isHttp ? (
                              <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block py-1 font-medium text-brand-700 underline decoration-dotted underline-offset-4">
                                {row.sourceName}
                              </a>
                            ) : (
                              <span>{row.sourceName}</span>
                            )}
                          </dd>
                          {row.note && (
                            <>
                              <dt className="text-text-muted">{copy.sources.note}</dt>
                              <dd className="text-text-muted" lang="en">
                                {row.note}
                              </dd>
                            </>
                          )}
                        </dl>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        <h3 className="mt-2 text-base font-semibold text-text">{copy.sources.unverifiedHeading}</h3>
        <p className="leading-relaxed text-text">{copy.sources.unverifiedIntro}</p>
        <ul className="list-disc space-y-1 pl-5 text-text">
          {copy.sources.unverified.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {/* One primary action */}
      <Link href={`/${locale}/plan`} className="tap inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-brand-600 px-6 text-lg font-semibold text-white hover:bg-brand-700 active:bg-brand-900">
        {t("common.button.seePlan")}
      </Link>
    </article>
  );
}
