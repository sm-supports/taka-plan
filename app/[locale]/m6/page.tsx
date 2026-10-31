"use client";
/** M6 Asset mix page. Suspense because the calculator reads `?demo=` via useSearchParams. */
import { Suspense } from "react";
import { M6Calculator } from "@/components/calculators/m6/M6Calculator";
import { Skeleton } from "@/components/ui/Skeleton";

export default function M6Page() {
  return (
    <Suspense fallback={<Skeleton page />}>
      <M6Calculator />
    </Suspense>
  );
}
