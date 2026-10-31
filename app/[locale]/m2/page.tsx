"use client";
/** M2 Insurance & health page. Suspense because the calculator reads `?demo=` via useSearchParams. */
import { Suspense } from "react";
import { M2Calculator } from "@/components/calculators/m2/M2Calculator";
import { Skeleton } from "@/components/ui/Skeleton";

export default function M2Page() {
  return (
    <Suspense fallback={<Skeleton page />}>
      <M2Calculator />
    </Suspense>
  );
}
