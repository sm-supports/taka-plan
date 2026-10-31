"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { M3Calculator } from "@/components/calculators/m3/M3Calculator";
import { Skeleton } from "@/components/ui/Skeleton";

function Inner() {
  const sp = useSearchParams();
  return <M3Calculator demo={sp.get("demo") === "1"} />;
}

export default function Page() {
  return (
    <Suspense fallback={<Skeleton page />}>
      <Inner />
    </Suspense>
  );
}
