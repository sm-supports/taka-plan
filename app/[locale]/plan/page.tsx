"use client";
/** Placeholder plan screen so the shell can be seen; the ui-plan slice replaces it. */
import { BigNumber } from "@/components/ui/BigNumber";
import { Card } from "@/components/ui/Card";
import { useT } from "@/lib/i18n/useT";

export default function PlanPage() {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-text">{t("common.appName")}</h1>
      <Card>
        <BigNumber value="—" caption={t("common.tagline")} />
      </Card>
    </div>
  );
}
