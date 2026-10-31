"use client";
/** The one number at the top: "Save ৳X a month", with its own "Why this number?". */
import type { Plan } from "@taka/engine";
import { WhyButton } from "@/components/explain/WhyButton";
import { iso } from "@/components/ui/bidi";
import { BigNumber } from "@/components/ui/BigNumber";
import { Card } from "@/components/ui/Card";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { headlineExplanation } from "./explanationFor";

export interface PlanHeadlineProps {
  plan: Plan;
  whyOpen?: boolean;
  onWhyOpenChange?: (open: boolean) => void;
}

export function PlanHeadline({ plan, whyOpen, onWhyOpenChange }: PlanHeadlineProps) {
  const { t } = useT();
  const { money } = useFormat();
  const amount = money(plan.monthlyTotal);
  return (
    <Card className="flex flex-col items-center gap-3">
      <BigNumber value={t("plan.headline", { amount: iso(amount) })} caption={t("plan.subhead")} />
      <WhyButton explanation={headlineExplanation(plan)} title={t("plan.why.headline", { amount })} open={whyOpen} onOpenChange={onWhyOpenChange} />
    </Card>
  );
}
