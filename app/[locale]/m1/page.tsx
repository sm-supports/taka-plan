"use client";
/** M1 Emergency fund page. Suspense because the calculator reads `?demo=` via useSearchParams. */
import { Suspense } from "react";
import { EmergencyFundCalculator } from "@/components/calculators/m1/EmergencyFundCalculator";
import { Skeleton } from "@/components/ui/Skeleton";

export default function M1Page() {
  return (
    <Suspense fallback={<Skeleton page />}>
      <EmergencyFundCalculator />
    </Suspense>
  );
}
