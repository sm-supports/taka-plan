"use client";
/**
 * Renders a skeleton page until the persisted store has rehydrated, so SSR and first paint never
 * disagree on store-dependent routes (locale root, start, plan, calculators). Server-rendered pages
 * that never read the store (/about) render immediately so their HTML is useful without JS.
 */
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { locales } from "@/lib/i18n/config";
import { useHydrated } from "@/lib/store/store";
import { Skeleton } from "@/components/ui/Skeleton";

/** Routes whose content does not depend on the persisted store, in every locale. */
const STORE_FREE = new RegExp(`^/(${locales.join("|")})/about(/|$)`);

export function HydrationGate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  if (!hydrated && !STORE_FREE.test(pathname ?? "")) {
    return (
      <div className="mx-auto max-w-md px-4">
        <Skeleton page />
      </div>
    );
  }
  return <>{children}</>;
}
