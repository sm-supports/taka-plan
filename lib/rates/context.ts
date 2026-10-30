"use client";
// React context for the active rates snapshot (shared by provider and hook).
import { createContext } from "react";
import type { RateKey, RatesSnapshot } from "@taka/engine";

export type RatesSource = "bundled" | "stored" | "network";

export interface RatesContextValue {
  snapshot: RatesSnapshot;
  source: RatesSource;
  version: number;
  /** Rows past their next-review date as of today. */
  staleKeys: RateKey[];
}

export const RatesContext = createContext<RatesContextValue | null>(null);
