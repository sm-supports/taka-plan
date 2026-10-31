"use client";
// Hooks for the selected country; render under <CountryProvider> (components/layout/Providers.tsx).
import { useContext } from "react";
import type { RatesSnapshot } from "@taka/engine";
import { useRates } from "../rates/useRates";
import { CountryReactContext, type CountryContextValue } from "./context";

/** The selected country: `{ code, profile, context, snapshot, loading, source, regions }`. */
export function useCountry(): CountryContextValue {
  const ctx = useContext(CountryReactContext);
  if (!ctx) throw new Error("useCountry() must be used inside <CountryProvider>");
  return ctx;
}

/**
 * The rates snapshot with the selected country applied (withCountry). Every calculator and the plan
 * read this one; keep useRates() for the published version and staleness badges. Outside a
 * <CountryProvider> it returns the plain (Bangladesh) snapshot.
 */
export function useCountryRates(): RatesSnapshot {
  const ctx = useContext(CountryReactContext);
  const { snapshot } = useRates();
  return ctx?.snapshot ?? snapshot;
}
