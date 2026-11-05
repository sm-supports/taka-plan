"use client";
/**
 * The country-dependent parts of /{locale}/about, rendered from the selected country's overlaid
 * snapshot (useCountryRates): the after-tax / after-inflation example and the "Sources and
 * assumptions" list. Rows that do not apply to the country (snapshot.country.notApplicable) are
 * hidden; JSON-valued rows are shown as small tables or summaries by shape, never as raw JSON;
 * our own docs/ sources read "Taka Plan (our assumption)".
 */
import {
  BASE_COUNTRY,
  RATE_KEYS,
  displaySourceName,
  formatPercent,
  instrumentAfterTax,
  instrumentNominal,
  instrumentReal,
  isStale,
  jsonShapeOk,
  type AllocationProfiles,
  type Digits,
  type GratuityRule,
  type HealthCoverWeights,
  type HealthPremiumTable,
  type Instrument,
  type LifeTableRemaining,
  type OldAgeAllowanceEligibility,
  type PremiumBand,
  type PublicPensionScheme,
  type RateKey,
  type RateRow,
  type RatesSnapshot,
  type SupportRatio,
  type TaxSlab,
  type TermPremiumTable,
} from "@taka/engine";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { useCountryRates } from "@/lib/country/useCountry";
import { useFormat, type Formatters } from "@/lib/i18n/useFormat";
import { interpolate, useT, type TFunction } from "@/lib/i18n/useT";
import type { Dictionary } from "@/lib/i18n/types";
import { aboutTableCopy, RATE_GROUPS, type AboutTableCopy, type RateGroupId } from "./copy";

/** Instruments whose real return makes the "after tax, after inflation" point (PRD: +2.1% vs −1.5%); the first two available are shown. */
const EXAMPLE_CANDIDATES: readonly Instrument[] = ["sanchayapatra_5y", "fdr_1y", "tbond_5y", "savings_account"];

/** Percent with 1 dp, or 2 dp when the source value needs it (11.83% must not read as 11.8% in a sources table). */
function sourcePercent(value: number, digits: Digits): string {
  const hundredths = Math.round(value * 10000);
  return formatPercent(value, { digits, decimals: hundredths % 10 === 0 ? 1 : 2 });
}

function groupOf(key: RateKey): RateGroupId {
  for (const g of RATE_GROUPS) if ((g.keys as readonly string[]).includes(key)) return g.id;
  return "other";
}

function isBase(s: RatesSnapshot): boolean {
  return !s.country || s.country.code === BASE_COUNTRY;
}

/** The product's local name outside Bangladesh, else the dictionary's generic term. */
function instrumentName(s: RatesSnapshot, i: Instrument, locale: string, t: TFunction): string {
  const names = isBase(s) ? undefined : s.country?.instrumentNames[i];
  if (names) return (locale === "en" ? (names.en ?? names.local) : (names.local ?? names.en)) ?? t(`common.instrument.${i}`);
  return t(`common.instrument.${i}`);
}

export function ReturnsExample() {
  const snapshot = useCountryRates();
  const { t, locale } = useT();
  const f = useFormat();
  const unavailable = new Set(snapshot.country?.unavailable ?? []);
  const rows = EXAMPLE_CANDIDATES.filter((i) => !unavailable.has(i))
    .slice(0, 2)
    .flatMap((instrument) => {
      try {
        return [{ instrument, headline: instrumentNominal(snapshot, instrument).rate, afterTax: instrumentAfterTax(snapshot, instrument), real: instrumentReal(snapshot, instrument) }];
      } catch {
        return [];
      }
    });
  if (rows.length === 0) return null;
  return (
    <table className="mt-2 w-full table-fixed text-sm">
      <thead>
        <tr className="text-xs text-text-muted">
          {/* Equal columns under the headings; each product's name gets a full line, so a long one never squeezes the numbers. */}
          <th scope="col" className="py-1 pe-2 text-end align-bottom font-medium hyphens-auto [overflow-wrap:anywhere]">
            {t("common.headline")}
          </th>
          <th scope="col" className="py-1 pe-2 text-end align-bottom font-medium hyphens-auto [overflow-wrap:anywhere]">
            {t("common.afterTax")}
          </th>
          <th scope="col" className="py-1 text-end align-bottom font-medium hyphens-auto [overflow-wrap:anywhere]">
            {t("common.afterInflation")}
          </th>
        </tr>
      </thead>
      {rows.map((row) => (
        <tbody key={row.instrument} className="border-t border-line">
          <tr>
            <th scope="rowgroup" colSpan={3} className="pt-2 text-start font-medium text-text [overflow-wrap:anywhere]">
              <bdi>{instrumentName(snapshot, row.instrument, locale, t)}</bdi>
            </th>
          </tr>
          <tr>
            <td className="whitespace-nowrap pb-2 pe-2 pt-1 text-end tabular-nums">{sourcePercent(row.headline, f.digits)}</td>
            <td className="whitespace-nowrap pb-2 pe-2 pt-1 text-end tabular-nums">{f.percent(row.afterTax)}</td>
            <td className={`whitespace-nowrap pb-2 pt-1 text-end font-semibold tabular-nums ${row.real < 0 ? "text-status-red" : "text-status-green"}`}>{f.percent(row.real)}</td>
          </tr>
        </tbody>
      ))}
    </table>
  );
}

function Lines({ lines }: { lines: string[] }) {
  if (lines.length === 1) return <>{lines[0]}</>;
  return (
    <ul className="flex flex-col">
      {lines.map((l, i) => (
        <li key={`${i}-${l}`}>{l}</li>
      ))}
    </ul>
  );
}

function BandsTable({ bands, c, f, caption }: { bands: PremiumBand[]; c: AboutTableCopy; f: Formatters; caption: string }) {
  return (
    <div>
      <p className="font-normal text-text-muted">{caption}</p>
      <table className="mt-1 w-full text-sm font-normal">
        <thead>
          <tr className="text-xs text-text-muted">
            <th scope="col" className="py-0.5 pe-2 text-start font-medium" />
            <th scope="col" className="py-0.5 pe-2 text-end font-medium">
              {c.low}
            </th>
            <th scope="col" className="py-0.5 text-end font-medium">
              {c.high}
            </th>
          </tr>
        </thead>
        <tbody>
          {bands.map((b) => (
            <tr key={b.maxAge} className="border-t border-line">
              <th scope="row" className="py-0.5 pe-2 text-start font-normal">
                {interpolate(c.upToAge, { age: f.number(b.maxAge) })}
              </th>
              <td className="py-0.5 pe-2 text-end">{f.number(b.low, Number.isInteger(b.low) ? 0 : 1)}</td>
              <td className="py-0.5 text-end">{f.number(b.high, Number.isInteger(b.high) ? 0 : 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const num = (f: Formatters, n: number) => f.number(n, Number.isInteger(n) ? 0 : 1);

/** A JSON-valued row as a small table or a few lines, by shape. */
function JsonValue({ row, f, c, dict }: { row: RateRow; f: Formatters; c: AboutTableCopy; dict: Dictionary }): ReactNode {
  const v = row.valueJson;
  // The overlay writes "None in <country>." when the research found the scheme does not exist.
  if (v === null || v === undefined) return row.note && /None in /.test(row.note) ? c.none : c.notFound;
  if (!jsonShapeOk(row.key, v)) return "—";
  const copy = dict.about.sources;
  switch (row.key) {
    case "tax_slabs":
      return (
        <Lines
          lines={(v as TaxSlab[]).map((slab) =>
            slab.width === null ? interpolate(copy.slabRest, { rate: sourcePercent(slab.rate, f.digits) }) : interpolate(copy.slabNext, { rate: sourcePercent(slab.rate, f.digits), width: f.money(slab.width) }),
          )}
        />
      );
    case "insurance_term_premium_table": {
      const table = v as TermPremiumTable;
      return (
        <>
          <BandsTable bands={table.bands} c={c} f={f} caption={interpolate(c.perCover, { per: f.money(table.per) })} />
          <span className="block font-normal text-text-muted">{interpolate(c.smoker, { times: num(f, table.smokerMultiplier) })}</span>
        </>
      );
    }
    case "health_premium_table": {
      const table = v as HealthPremiumTable;
      return <BandsTable bands={table.bands} c={c} f={f} caption={interpolate(c.perCover, { per: f.money(table.per) })} />;
    }
    case "health_cover_weights": {
      const w = v as HealthCoverWeights;
      return (
        <>
          <span className="block font-normal text-text-muted">{c.weightsCaption}</span>
          <Lines lines={(["self", "partner", "child", "parent"] as const).map((k) => `${c.weights[k]}: ${f.percent(w[k], 0)}`)} />
        </>
      );
    }
    case "allocation_profiles": {
      const p = v as AllocationProfiles;
      return <Lines lines={(["careful", "balanced", "growth"] as const).map((k) => interpolate(c.profileLine, { profile: c.profiles[k], e0: f.percent(p[k].e0, 0), emin: f.percent(p[k].emin, 0) }))} />;
    }
    case "gratuity_rule": {
      const g = v as GratuityRule;
      const lines = [interpolate(c.gratuity, { days: num(f, g.daysPerYear) })];
      if (g.daysPerYearAfter != null && g.afterYears != null) lines.push(interpolate(c.gratuityAfter, { days: num(f, g.daysPerYearAfter), years: num(f, g.afterYears) }));
      lines.push(interpolate(c.gratuityMonth, { days: num(f, g.daysPerMonth) }));
      return <Lines lines={lines} />;
    }
    case "public_pension_scheme": {
      const p = v as PublicPensionScheme;
      const lines: string[] = [];
      if (p.entryAgeMin != null && p.entryAgeMax != null) lines.push(interpolate(c.pensionEntry, { min: num(f, p.entryAgeMin), max: num(f, p.entryAgeMax) }));
      lines.push(interpolate(c.pensionFrom, { age: num(f, p.pensionFromAge) }));
      lines.push(p.inflationLinked ? c.pensionLinked : c.pensionFixed);
      if (p.taxFree != null) lines.push(p.taxFree ? c.pensionTaxFree : c.pensionTaxed);
      if (p.nomineeUntilAge != null) lines.push(interpolate(c.pensionNominee, { age: num(f, p.nomineeUntilAge) }));
      for (const x of p.projections ?? []) lines.push(interpolate(c.pensionExample, { contribution: f.money(x.monthlyContribution), years: num(f, x.years), pension: f.money(x.monthlyPension) }));
      return <Lines lines={lines} />;
    }
    case "old_age_allowance_eligibility": {
      const e = v as OldAgeAllowanceEligibility;
      const lines = [interpolate(c.eligibility, { men: num(f, e.menAge), women: num(f, e.womenAge) }), e.meansTested ? c.meansTested : c.notMeansTested];
      if (e.over90Monthly) lines.push(interpolate(c.over90, { amount: f.money(e.over90Monthly) }));
      return <Lines lines={lines} />;
    }
    case "life_table_remaining": {
      const lt = v as LifeTableRemaining;
      return (
        <Lines
          lines={lt.rows.map((r) => {
            const head = interpolate(c.lifeRow, { age: num(f, r.age), total: f.number(r.total, 1) });
            return r.men != null && r.women != null ? `${head} (${interpolate(c.lifeSplit, { men: f.number(r.men, 1), women: f.number(r.women, 1) })})` : head;
          })}
        />
      );
    }
    case "support_ratio": {
      const sr = v as SupportRatio;
      return (
        <>
          <span className="block font-normal text-text-muted">{c.supportCaption}</span>
          <Lines lines={sr.points.map((p) => interpolate(c.supportPoint, { year: f.number(p.year), value: f.number(p.value, 1) }))} />
        </>
      );
    }
    default:
      return "—";
  }
}

function formatValue(row: RateRow, f: Formatters, c: AboutTableCopy, t: TFunction): string {
  if (row.value === null || row.value === undefined || !Number.isFinite(row.value)) return c.notFound;
  switch (row.unit) {
    case "rate":
    case "ratio":
      return sourcePercent(row.value, f.digits);
    case "bdt":
      return f.money(row.value);
    case "years":
      return `${num(f, row.value)} ${t("common.unit.years")}`;
    case "months":
      return `${f.number(row.value)} ${t("common.unit.months")}`;
    default:
      return String(row.value);
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SourcesList() {
  const snapshot = useCountryRates();
  const { t, locale, dict } = useT();
  const f = useFormat();
  const c = aboutTableCopy(locale);
  const copy = dict.about;
  const today = todayIso();
  const base = isBase(snapshot);

  const notApplicable = new Set<RateKey>(snapshot.country?.notApplicable ?? []);
  const grouped = new Map<RateGroupId, RateRow[]>();
  for (const key of RATE_KEYS) {
    if (notApplicable.has(key)) continue;
    const row = snapshot.rows[key];
    if (!row) continue;
    const id = groupOf(key);
    grouped.set(id, [...(grouped.get(id) ?? []), row]);
  }
  const groupOrder: RateGroupId[] = [...RATE_GROUPS.map((g) => g.id), "other"];
  const groupTitle = (id: RateGroupId) => (!base && (id === "sanchayapatra" || id === "tax") ? c.group[id] : copy.sources.group[id]);

  return (
    <>
      <p className="leading-relaxed text-text">{interpolate(copy.sources.intro, { version: f.number(snapshot.version), date: f.asOf(snapshot.publishedAt) })}</p>

      {groupOrder.map((groupId) => {
        const rows = grouped.get(groupId);
        if (!rows || rows.length === 0) return null;
        return (
          <div key={groupId}>
            <h3 className="mb-2 mt-2 text-base font-semibold text-text">{groupTitle(groupId)}</h3>
            <ul className="flex flex-col gap-2">
              {rows.map((row) => {
                const stale = isStale(row, today);
                const label = locale === "bn" ? (row.labelBn ?? row.labelEn) : row.labelEn;
                const isHttp = /^https?:\/\//.test(row.sourceUrl);
                const sourceName = displaySourceName(row.sourceName, row.sourceUrl);
                return (
                  <li key={row.key}>
                    <Card className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 font-medium text-text [overflow-wrap:anywhere]">{label}</p>
                        <div className="flex shrink-0 flex-wrap justify-end gap-1">
                          {row.isAppAssumption && <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-xs text-text-muted">{t("common.ourAssumption")}</span>}
                          {stale && <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-xs text-text-muted">{t("common.mayBeOutdated")}</span>}
                        </div>
                      </div>
                      <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
                        <dt className="text-text-muted">{copy.sources.value}</dt>
                        <dd className="min-w-0 font-semibold text-text tabular-nums [overflow-wrap:anywhere]">
                          {row.unit === "json" ? <JsonValue row={row} f={f} c={c} dict={dict} /> : formatValue(row, f, c, t)}
                          {row.rangeLow != null && row.rangeHigh != null && (
                            <span className="block font-normal text-text-muted">{t("common.range", { low: sourcePercent(row.rangeLow, f.digits), high: sourcePercent(row.rangeHigh, f.digits) })}</span>
                          )}
                        </dd>
                        <dt className="sr-only">{copy.sources.dates}</dt>
                        <dd className="col-span-2 min-w-0 text-text-muted tabular-nums [overflow-wrap:anywhere]">
                          {t("common.asOf", { date: f.asOf(row.asOf) })} · {copy.sources.nextReview}: {f.asOf(row.nextReview)}
                        </dd>
                        <dt className="text-text-muted">{t("common.source")}</dt>
                        <dd className="min-w-0 text-text [overflow-wrap:anywhere]">
                          {isHttp ? (
                            <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center py-1 font-medium text-brand-700 underline decoration-dotted underline-offset-4">
                              <bdi>{sourceName}</bdi>
                            </a>
                          ) : (
                            <bdi>{sourceName}</bdi>
                          )}
                        </dd>
                        {row.note && (
                          <>
                            <dt className="text-text-muted">{copy.sources.note}</dt>
                            <dd className="min-w-0 text-text-muted [overflow-wrap:anywhere]" lang="en">
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

      {base && (
        <>
          <h3 className="mt-2 text-base font-semibold text-text">{copy.sources.unverifiedHeading}</h3>
          <p className="leading-relaxed text-text">{copy.sources.unverifiedIntro}</p>
          <ul className="list-disc space-y-1 ps-5 text-text">
            {copy.sources.unverified.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
