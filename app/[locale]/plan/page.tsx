"use client";
/**
 * The plan screen: one number at the top, then bucket cards in priority order.
 *
 * Query switches:
 *   ?why=<bucketKey>  opens that bucket's "Why this number?" drawer ("total" for the headline);
 *   ?term=<key>       opens the glossary sheet for that term;
 *   ?demo=1           renders the sample plan (components/plan/fixtures.ts: the engine run over a
 *                     fixed profile with the current rates) instead of the user's plan, so the screen
 *                     can be checked and screenshotted with known numbers. Harmless in production:
 *                     it never touches the store.
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";
import type { EngineError, Plan } from "@taka/engine";
import { BucketList } from "@/components/plan/BucketList";
import { PlanHeadline } from "@/components/plan/PlanHeadline";
import { PlanSummary } from "@/components/plan/PlanSummary";
import { calcErrorKey } from "@/components/calculators/shared/engineError";
import { samplePlan } from "@/components/plan/fixtures";
import { isTermKey } from "@/components/plan/terms";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { TermSheet } from "@/components/ui/Term";
import { useT } from "@/lib/i18n/useT";
import { useRates } from "@/lib/rates/useRates";
import { selectProfile } from "@/lib/store/selectors";
import { useTakaStore } from "@/lib/store/store";
import { usePlan } from "@/lib/store/usePlan";

const HEADLINE_WHY = "total";

export default function PlanPage() {
  return (
    <Suspense fallback={<Skeleton page />}>
      <PlanScreen />
    </Suspense>
  );
}

function PlanScreen() {
  const searchParams = useSearchParams();
  const demo = searchParams.get("demo") === "1";
  return demo ? <DemoPlan /> : <LivePlan />;
}

/** The sample plan: the engine over a fixed profile with the live rates snapshot; never touches the store. */
function DemoPlan() {
  const { locale } = useT();
  const { snapshot } = useRates();
  const plan = useMemo(() => samplePlan(locale, snapshot), [locale, snapshot]);
  return <PlanBody plan={plan} error={null} demo />;
}

/** The user's own plan: redirects to onboarding without a profile; shows an error card when the engine throws. */
function LivePlan() {
  const { locale } = useT();
  const router = useRouter();
  // selectProfile builds a new object per call; useShallow keeps zustand 5's useSyncExternalStore from looping.
  const profile = useTakaStore(useShallow(selectProfile));
  const { plan, error } = usePlan();

  const needsOnboarding = profile === null;
  useEffect(() => {
    if (needsOnboarding) router.replace(`/${locale}/start/1`);
  }, [needsOnboarding, locale, router]);

  if (needsOnboarding) return <Skeleton page />;
  return <PlanBody plan={plan} error={error} demo={false} />;
}

interface PlanBodyProps {
  plan: Plan | null;
  error: EngineError | Error | null;
  demo: boolean;
}

function PlanBody({ plan, error, demo }: PlanBodyProps) {
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const whyParam = searchParams.get("why");
  const termParam = searchParams.get("term");

  // Drawer state starts from the URL and follows it; closing clears the param.
  const [why, setWhy] = useState<string | null>(whyParam);
  useEffect(() => setWhy(whyParam), [whyParam]);

  const replaceParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null) next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const onWhyChange = useCallback(
    (key: string | null) => {
      setWhy(key);
      if (key === null && whyParam !== null) replaceParams({ why: null });
    },
    [whyParam, replaceParams],
  );

  const closeTerm = useCallback(() => replaceParams({ term: null }), [replaceParams]);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text">{t("plan.title")}</h1>
        {demo && (
          <p role="note" className="rounded-xl border border-status-amber/30 bg-status-amber-soft px-3 py-2 text-xs text-status-amber">
            {t("plan.demoBanner")}
          </p>
        )}
      </header>

      {error ? (
        <ErrorCard title={t("plan.error.title")} message={t(calcErrorKey(error))} />
      ) : plan ? (
        <>
          <PlanHeadline plan={plan} whyOpen={why === HEADLINE_WHY} onWhyOpenChange={(open) => onWhyChange(open ? HEADLINE_WHY : null)} />
          <BucketList plan={plan} why={why} onWhyChange={onWhyChange} />
          <PlanSummary plan={plan} />
        </>
      ) : (
        <Skeleton page />
      )}

      {isTermKey(termParam) && <TermSheet k={termParam} open onClose={closeTerm} />}
    </div>
  );
}
