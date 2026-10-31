"use client";
/** M7 Retirement & family: placeholder until the m7 UI slice lands. */
import { useT } from "@/lib/i18n/useT";

export default function M7Page() {
  const { t } = useT();
  return <h1 className="text-2xl font-semibold">{t("m7.title")}</h1>;
}
