"use client";
/**
 * "Complete your plan": one card per optional section (insurance & health, asset mix,
 * retirement & family). A section the user has not opened yet says "Start"; one with answers
 * says "Edit" and shows the amount the plan now reserves for it.
 */
import Link from "next/link";
import { hasOverrideAnswers, type Plan } from "@taka/engine";
import { useShallow } from "zustand/shallow";
import { Card } from "@/components/ui/Card";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";

type Section = "m2" | "m6" | "m7";
const SECTIONS: readonly Section[] = ["m2", "m6", "m7"];

/** Monthly amount the plan reserves for a section, when it has a bucket. */
function reserved(plan: Plan, s: Section): number | null {
  const id = s === "m2" ? "insurance" : s === "m7" ? "retirement" : null;
  if (id) return plan.buckets.find((b) => b.id === id)?.amount ?? null;
  return plan.buckets.filter((b) => b.module === "m6").reduce((t, b) => t + b.amount, 0) || null;
}

export function MoreSections({ plan }: { plan: Plan }) {
  const { t, locale } = useT();
  const f = useFormat();
  const started = useTakaStore(useShallow((s) => ({ m2: hasOverrideAnswers(s.m2), m6: hasOverrideAnswers(s.m6), m7: hasOverrideAnswers(s.m7) })));
  return (
    <section aria-labelledby="plan-more" className="flex flex-col gap-3">
      <h2 id="plan-more" className="text-lg font-semibold text-text">
        {t("plan.more.title")}
      </h2>
      <ul className="flex flex-col gap-3">
        {SECTIONS.map((s) => {
          const amount = started[s] ? reserved(plan, s) : null;
          return (
            <li key={s}>
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span dir="auto" className="text-base font-semibold text-text">
                      {t(`common.module.${s}`)}
                    </span>
                    <span dir="auto" className="text-sm text-text-muted">
                      {amount !== null ? t("plan.more.reserved", { amount: f.money(amount) }) : t(`plan.more.${s}.body`)}
                    </span>
                  </div>
                  <Link
                    href={`/${locale}/${s}`}
                    className="tap inline-flex min-h-12 shrink-0 items-center rounded-xl bg-brand-600 px-4 font-semibold text-white hover:bg-brand-700"
                  >
                    {started[s] ? t("plan.more.edit") : t("plan.more.start")}
                  </Link>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
