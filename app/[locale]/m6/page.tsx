"use client";
/** M6 Asset mix: placeholder until the m6 UI slice lands. */
import { useT } from "@/lib/i18n/useT";

export default function M6Page() {
  const { t } = useT();
  return <h1 className="text-2xl font-semibold">{t("m6.title")}</h1>;
}
