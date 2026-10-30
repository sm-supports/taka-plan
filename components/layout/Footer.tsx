"use client";
/** Page footer with the short disclaimer and the rates version line. */
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { useRates } from "@/lib/rates/useRates";
import { Disclaimer } from "@/components/ui/Disclaimer";

export function Footer() {
  const { t } = useT();
  const { asOf, number } = useFormat();
  const { snapshot, version } = useRates();
  const publishedAt = snapshot.publishedAt;
  return (
    <footer className="mx-auto max-w-md px-4 pb-8 pt-6">
      <Disclaimer variant="footer" />
      <p className="mt-2 text-xs text-text-faint">{t("common.ratesVersion", { version: number(version), asOf: asOf(publishedAt) })}</p>
    </footer>
  );
}
