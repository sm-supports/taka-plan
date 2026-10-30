"use client";
/** Renders a skeleton page until the persisted store has rehydrated, so SSR and first paint never disagree. */
import type { ReactNode } from "react";
import { useHydrated } from "@/lib/store/store";
import { Skeleton } from "@/components/ui/Skeleton";

export function HydrationGate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-md px-4">
        <Skeleton page />
      </div>
    );
  }
  return <>{children}</>;
}
