"use client";
// Supplies the selected country's profile and the overlaid rates snapshot. Order of sources for
// store.country: bundled BD (BD only), the localStorage copy, then the static file from the build
// and the D1 API together; the newest (researchedAt, then version) wins. Bangladesh is shown until
// a profile arrives, so rendering never waits.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { CountryCode, RegionDefaults } from "@taka/engine";
import { useRates } from "../rates/useRates";
import { useTakaStore } from "../store/store";
import { BUNDLED_BD } from "./bundled";
import { CountryReactContext, type CountryContextValue } from "./context";
import { BASE_CODE, fetchCountryProfile, fetchRegions, normaliseCode, pickNewest } from "./loader";
import { contextOf, mergeEntry, overlaySnapshot, resolveActive, type CountryEntry } from "./resolve";
import { loadStoredCountry, loadStoredRegions, saveStoredCountry, saveStoredRegions } from "./storage";

export function CountryProvider({ children }: { children: ReactNode }) {
  const chosen = useTakaStore((s) => s.country);
  const code: CountryCode = normaliseCode(chosen) ?? BASE_CODE;
  const { snapshot: base } = useRates();
  const [entries, setEntries] = useState<Record<CountryCode, CountryEntry>>({});
  const [regions, setRegions] = useState<RegionDefaults | null>(null);

  // Regional fallback figures: optional, loaded once.
  useEffect(() => {
    const controller = new AbortController();
    const stored = loadStoredRegions();
    if (stored) setRegions(stored);
    fetchRegions({ signal: controller.signal }).then((r) => {
      if (!r || controller.signal.aborted) return;
      saveStoredRegions(r);
      setRegions(r);
    });
    return () => controller.abort();
  }, []);

  // The chosen country: stored copy now, network copies when they answer.
  useEffect(() => {
    const controller = new AbortController();
    const stored = loadStoredCountry(code);
    setEntries((e) => ({ ...e, [code]: mergeEntry(e[code], stored, false) }));
    fetchCountryProfile(code, { signal: controller.signal })
      .catch(() => null)
      .then((net) => {
        if (controller.signal.aborted) return;
        // Keep the network copy for offline use when it is newer than what we already had.
        const before = pickNewest([code === BASE_CODE ? BUNDLED_BD : null, stored]);
        if (net && (before === null || pickNewest([before, net]) === net)) saveStoredCountry(net);
        setEntries((e) => ({ ...e, [code]: mergeEntry(e[code], net, true) }));
      });
    return () => controller.abort();
  }, [code]);

  const bd = useMemo(() => pickNewest([BUNDLED_BD, entries[BASE_CODE]?.best]) ?? BUNDLED_BD, [entries]);
  const active = useMemo(() => resolveActive(code, entries[code], bd), [code, entries, bd]);

  const value = useMemo<CountryContextValue>(() => {
    const snapshot = overlaySnapshot(base, active.profile, { regions, bd: bd.profile });
    return { code: active.code, profile: active.profile, context: contextOf(snapshot), snapshot, loading: active.loading, source: active.source, regions };
  }, [base, active, regions, bd]);

  return <CountryReactContext.Provider value={value}>{children}</CountryReactContext.Provider>;
}
