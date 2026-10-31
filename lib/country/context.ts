"use client";
// React context for the selected country (shared by provider and hooks).
import { createContext } from "react";
import type { CountryCode, CountryContext, CountryProfile, RatesSnapshot, RegionDefaults } from "@taka/engine";
import type { CountrySource } from "./loader";

export interface CountryContextValue {
  /** The code the user chose (store.country). */
  code: CountryCode;
  /** The profile in use: the chosen country's, or Bangladesh while it loads or when it has no data. */
  profile: CountryProfile;
  /** `snapshot.country`: currency, rounding steps, unavailable product slots, local names, institutions. */
  context: CountryContext;
  /** The rates snapshot with the country applied (withCountry); what every calculator reads. */
  snapshot: RatesSnapshot;
  /** True while the network copy of `code` is still on its way. */
  loading: boolean;
  source: CountrySource;
  regions: RegionDefaults | null;
}

export const CountryReactContext = createContext<CountryContextValue | null>(null);
