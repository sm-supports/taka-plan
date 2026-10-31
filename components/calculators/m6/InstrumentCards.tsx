"use client";
/**
 * F3 instrument map: one card per bucket the engine returns. The product shows as the country's
 * local name for the slot (useCountry().context.instrumentNames) or the generic term; a bucket
 * with no product slot here says so. Each card ends with the how-to text.
 */
import type { Instrument, InstrumentCard, M6Result } from "@taka/engine";
import { Card } from "@/components/ui/Card";
import { Term } from "@/components/ui/Term";
import { cn } from "@/components/ui/cn";
import { useCountry } from "@/lib/country/useCountry";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { BUCKET_COLOR } from "./MixBar";
import { weightDecimals } from "./input";

/** Glossary entry for a product slot, when there is one. */
function termFor(slot: Instrument): string | null {
  switch (slot) {
    case "fdr_1y":
    case "fdr_3m":
      return "fdr";
    case "dps":
      return "dps";
    case "sanchayapatra_5y":
      return "sanchayapatra";
    case "tbill_91d":
      return "tbill";
    case "tbond_5y":
    case "tbond_10y":
      return "tbond";
    default:
      return null;
  }
}

function useSlotName(): (slot: Instrument) => { label: string; local: string | null } {
  const { t, locale } = useT();
  const { context } = useCountry();
  return (slot) => {
    const generic = t(`common.instrument.${slot}`);
    const names = context.instrumentNames[slot];
    // English UI: the country's English product name; Bangla UI in Bangladesh: the Bangla name.
    const shown = (locale === "en" ? names?.en : locale === "bn" && context.code === "BD" ? names?.local : null) ?? generic;
    // The name as sold locally, when it differs from what is shown.
    const local = names?.local && names.local !== shown ? names.local : null;
    return { label: shown, local };
  };
}

function SlotName({ slot }: { slot: Instrument }) {
  const name = useSlotName()(slot);
  const term = termFor(slot);
  return term ? <Term k={term}>{name.label}</Term> : <>{name.label}</>;
}

export function InstrumentCards({ result }: { result: M6Result }) {
  const { t } = useT();
  const f = useFormat();
  const slotName = useSlotName();

  return (
    <div className="flex flex-col gap-3">
      {result.instruments.map((card: InstrumentCard) => {
        const w = result.weights[card.bucket];
        const local = card.primary ? slotName(card.primary).local : null;
        return (
          <Card
            key={card.bucket}
            data-testid="instrument-card"
            data-bucket={card.bucket}
            header={
              <h3 className="flex items-center gap-2 text-base font-bold text-text">
                <span className={cn("h-3 w-3 shrink-0 rounded-full", BUCKET_COLOR[card.bucket].dot)} aria-hidden="true" />
                {t("m6.instrument.title", { bucket: t(`m6.bucket.${card.bucket}`), share: f.percent(w, weightDecimals(w)) })}
              </h3>
            }
          >
            {card.primary ? (
              <>
                <p className="text-sm text-text-muted">{t("m6.instrument.primary")}</p>
                <p className="text-lg font-semibold text-text">
                  <SlotName slot={card.primary} />
                </p>
                {local && <p className="mt-0.5 text-sm text-text-muted">{t("m6.instrument.localName", { name: local })}</p>}
                {card.alternatives.length > 0 && (
                  <p className="mt-2 text-sm text-text">
                    <span className="text-text-muted">{t("m6.instrument.alternatives")}: </span>
                    {card.alternatives.map((a, i) => (
                      <span key={a}>
                        {i > 0 && ", "}
                        <SlotName slot={a} />
                      </span>
                    ))}
                  </p>
                )}
              </>
            ) : (
              <p className="rounded-xl bg-status-amber-soft px-3 py-2 text-sm font-medium text-status-amber">{t("m6.instrument.unavailable")}</p>
            )}
            {card.howToKeys.map((k) => (
              <p key={k} className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-text-muted">
                {t(k)}
              </p>
            ))}
          </Card>
        );
      })}
    </div>
  );
}
