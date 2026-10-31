"use client";
/** Educational-use disclaimer: a one-line footer, or a modal sheet with an accept button for onboarding. */
import { useT } from "@/lib/i18n/useT";
import { Button } from "./Button";
import { Sheet } from "./Sheet";

export interface DisclaimerProps {
  variant: "footer" | "modal";
  onAccept?: () => void;
  /** Modal only: whether it is shown. Defaults to true. */
  open?: boolean;
}

export function Disclaimer({ variant, onAccept, open = true }: DisclaimerProps) {
  const { t } = useT();
  if (variant === "footer") {
    return (
      <p dir="auto" className="text-xs leading-relaxed text-text-faint">
        {t("common.disclaimer.short")}
      </p>
    );
  }
  const accept = onAccept ?? (() => undefined);
  return (
    <Sheet open={open} onClose={accept} title={t("common.disclaimer.title")}>
      <p dir="auto" className="whitespace-pre-line leading-relaxed">
        {t("common.disclaimer.body")}
      </p>
      <Button size="lg" fullWidth className="mt-5" onClick={accept}>
        {t("common.disclaimer.accept")}
      </Button>
    </Sheet>
  );
}
