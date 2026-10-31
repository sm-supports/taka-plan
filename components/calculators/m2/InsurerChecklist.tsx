"use client";
/** "Check the insurer before the policy": every M2_CHECK_KEYS item, with the regulator and complaints links when the country has them. */
import { useState } from "react";
import type { Institution, M2ChecklistItem } from "@taka/engine";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { useCountry } from "@/lib/country/useCountry";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";

function InstitutionLink({ text, inst }: { text: string; inst: Institution }) {
  return (
    <a href={inst.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm font-medium text-brand-700 underline underline-offset-2">
      {text}
    </a>
  );
}

export function InsurerChecklist({ items }: { items: M2ChecklistItem[] }) {
  const { t } = useT();
  const f = useFormat();
  const { context } = useCountry();
  const regulator = context.institutions.insuranceRegulator ?? null;
  const complaints = context.institutions.insuranceComplaints ?? null;
  // Ticks are only a reading aid on this screen; they are not saved.
  const [ticked, setTicked] = useState<Set<string>>(() => new Set());

  return (
    <Card header={<h3 className="text-base font-bold text-text">{t("m2.checklist.title")}</h3>} data-testid="m2-checklist">
      <p className="text-sm leading-relaxed text-text-muted">{t("m2.checklist.intro")}</p>
      <ul className="mt-3 flex flex-col gap-3">
        {items.map((item) => {
          const claim = item.params.claimSettlement;
          const params = { claimSettlement: typeof claim === "number" ? f.percent(claim, 0) : String(claim ?? "") };
          const on = ticked.has(item.key);
          return (
            <li key={item.key} className="flex gap-3">
              <input
                id={`m2-check-${item.key}`}
                type="checkbox"
                checked={on}
                onChange={() =>
                  setTicked((s) => {
                    const next = new Set(s);
                    if (next.has(item.key)) next.delete(item.key);
                    else next.add(item.key);
                    return next;
                  })
                }
                className="mt-1 h-5 w-5 shrink-0 accent-brand-600"
              />
              <div className="min-w-0">
                <label htmlFor={`m2-check-${item.key}`} className={cn("text-sm leading-relaxed", on ? "text-text-muted line-through" : "text-text")}>
                  {t(item.key, params)}
                </label>
                {item.key === "m2.check.regulator" && regulator && <InstitutionLink text={t("m2.checklist.regulatorLink", { name: regulator.name })} inst={regulator} />}
                {item.key === "m2.check.complaints" && complaints && <InstitutionLink text={t("m2.checklist.complaintsLink", { name: complaints.name })} inst={complaints} />}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
