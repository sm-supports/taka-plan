"use client";
/** Small hooks shared by the calculator pages. */
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { ISODate } from "@taka/engine";

/**
 * `?demo=1` shows a local fixture result instead of calling the engine (layout work while the engine
 * slices land). Any other value selects a named fixture variant (e.g. `?demo=freelance`); null = off.
 * Must be rendered under a <Suspense> boundary (useSearchParams).
 */
export function useDemoMode(): string | null {
  const params = useSearchParams();
  return params.get("demo");
}

/** Today as an ISO date, fixed per mount so a midnight tick does not re-render the page. */
export function useToday(): ISODate {
  const [today] = useState<ISODate>(() => new Date().toISOString().slice(0, 10));
  return today;
}
