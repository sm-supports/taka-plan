"use client";
/** M2 Insurance & health: placeholder until the m2 UI slice lands. */
import { useT } from "@/lib/i18n/useT";

export default function M2Page() {
  const { t } = useT();
  return <h1 className="text-2xl font-semibold">{t("m2.title")}</h1>;
}
