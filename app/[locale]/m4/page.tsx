"use client";
/** M4 Save-first budget page. Suspense because the calculator reads `?demo=` via useSearchParams. */
import { Suspense } from "react";
import { SaveFirstCalculator } from "@/components/calculators/m4/SaveFirstCalculator";
import { Skeleton } from "@/components/ui/Skeleton";

export default function M4Page() {
  return (
    <Suspense fallback={<Skeleton page />}>
      <SaveFirstCalculator />
    </Suspense>
  );
}
