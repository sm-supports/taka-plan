import { ONBOARDING_STEPS } from "@/lib/onboarding/validate";
import { StepClient } from "./StepClient";

export function generateStaticParams() {
  return ONBOARDING_STEPS.map((step) => ({ step: String(step) }));
}

export default function StartStepPage() {
  return <StepClient />;
}
