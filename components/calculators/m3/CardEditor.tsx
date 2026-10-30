"use client";
/** One credit-card row: balance, limit, annual rate (defaults to the cap row), pays-in-full, remove. */
import type { Card } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { YesNo } from "@/components/ui/YesNo";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { RateInput } from "./RateInput";

export interface CardEditorProps {
  card: Card;
  index: number;
  /** credit_card_rate_cap from the rates snapshot, shown when the card has no rate of its own. */
  capRate: number;
  onChange: (patch: Partial<Card>) => void;
  onRemove: () => void;
}

export function CardEditor({ card, index, capRate, onChange, onRemove }: CardEditorProps) {
  const { t } = useT();
  const { number } = useFormat();
  const id = `card-${card.id}`;
  return (
    <fieldset className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4">
      <legend className="sr-only">
        {t("m3.input.cards.title")} {number(index + 1)}
      </legend>
      <MoneyInput id={`${id}-balance`} label={t("m3.input.cards.balance.label")} hint={t("m3.input.cards.balance.hint")} value={card.balance} min={0} onChange={(n) => n !== null && n >= 0 && onChange({ balance: n })} />
      <MoneyInput id={`${id}-limit`} label={t("m3.input.cards.limit.label")} hint={t("m3.input.cards.limit.hint")} value={card.limit} min={0} onChange={(n) => n !== null && n >= 0 && onChange({ limit: n })} />
      <RateInput
        id={`${id}-rate`}
        label={t("m3.input.cards.annualRate.label")}
        hint={t("m3.input.cards.annualRate.hint")}
        value={card.annualRate ?? capRate}
        onChange={(r) => onChange({ annualRate: r === null ? undefined : r })}
      />
      <YesNo label={t("m3.input.cards.paysInFull.label")} yesLabel={t("common.yes")} noLabel={t("common.no")} value={card.paysInFull} onChange={(v) => onChange({ paysInFull: v })} />
      <p className="-mt-2 text-sm text-text-muted">{t("m3.input.cards.paysInFull.hint")}</p>
      <Button variant="secondary" onClick={onRemove}>
        {t("m3.input.cards.remove")}
      </Button>
    </fieldset>
  );
}
