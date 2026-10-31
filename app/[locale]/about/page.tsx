/**
 * /{locale}/about — server component. The full disclaimer, how the plan is built (seven steps,
 * protect → save → grow, returns after tax and after inflation) and a "Sources and assumptions"
 * list. The figures follow the selected country, so the example table and the sources list are
 * client components (AboutRates.tsx) reading the overlaid snapshot; the static export renders
 * them with the Bangladesh defaults until the country loads.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RATES_SEED, assertSnapshot, formatNumber, formatPercent, type Digits } from "@taka/engine";
import { Card } from "@/components/ui/Card";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/server";
import { interpolate, translate } from "@/lib/i18n/translate";
import { ReturnsExample, SourcesList } from "./AboutRates";

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

/** Bangla digits in bn; Latin digits everywhere else. */
function digitsFor(locale: Locale): Digits {
  return locale === "bn" ? "bn" : "latn";
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: `${dict.about.title} · Taka Plan` };
}

export default async function AboutPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = (key: string, p?: Record<string, string | number>) => translate(dict, key, p);
  const copy = dict.about;
  const digits = digitsFor(locale);
  // App policy (the same in every country): the emergency fund's minimum share of the monthly amount.
  const minShare = assertSnapshot(RATES_SEED).rows.plan_emergency_min_share.value ?? 0;

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
        <p className="leading-relaxed text-text">{interpolate(copy.method.order, { share: formatPercent(minShare, { digits, decimals: 0 }) })}</p>

        <h3 className="mt-2 text-base font-semibold text-text">{copy.method.returnsHeading}</h3>
        <p className="leading-relaxed text-text">{copy.method.returns}</p>
        <Card>
          <p className="text-sm text-text-muted">{copy.method.exampleCaption}</p>
          <ReturnsExample />
        </Card>
        <p className="leading-relaxed text-text">{copy.method.rounding}</p>
        <p className="leading-relaxed text-text">{copy.method.onDevice}</p>
      </section>

      {/* 3. Sources and assumptions: every row the selected country's calculators read */}
      <section aria-labelledby="about-sources" className="flex flex-col gap-3">
        <h2 id="about-sources" className="text-lg font-semibold text-text">
          {copy.sources.heading}
        </h2>
        <SourcesList />
      </section>

      {/* One primary action */}
      <Link href={`/${locale}/plan`} className="tap inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-brand-600 px-6 text-lg font-semibold text-white hover:bg-brand-700 active:bg-brand-900">
        {t("common.button.seePlan")}
      </Link>
    </article>
  );
}
