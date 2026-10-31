"use client";
/** M7 Retirement & family ("Plan to 100"). Suspense because the calculator reads `?demo=` via useSearchParams. */
import { Suspense } from "react";
import { RetirementCalculator } from "@/components/calculators/m7/RetirementCalculator";
import { Skeleton } from "@/components/ui/Skeleton";

export default function M7Page() {
  return (
    <Suspense fallback={<Skeleton page />}>
      <RetirementCalculator />
    </Suspense>
  );
}
