"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { M5Calculator } from "@/components/calculators/m5/M5Calculator";
import { Skeleton } from "@/components/ui/Skeleton";

function Inner() {
  const sp = useSearchParams();
  return <M5Calculator demo={sp.get("demo") === "1"} />;
}

export default function Page() {
  return (
    <Suspense fallback={<Skeleton page />}>
      <Inner />
    </Suspense>
  );
}
