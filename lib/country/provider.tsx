"use client";
// Supplies the selected country's profile and the overlaid rates snapshot. Order of sources for
// store.country: bundled BD (BD only), the localStorage copy, then the static file from the build
// and the D1 API together; the newest wins (researchedAt, then version, then the source closest to
// the server: see isNewer). The localStorage copy is read synchronously on the first render, so a
// returning user never sees taka before their own currency; Bangladesh is shown only while a
// country with no stored copy loads. Rendering never waits.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { CountryCode, RegionDefaults } from "@taka/engine";
import { useRates } from "../rates/useRates";
import { useTakaStore } from "../store/store";
import { BUNDLED_BD } from "./bundled";
import { CountryReactContext, type CountryContextValue } from "./context";
import { BASE_CODE, fetchCountryProfile, fetchRegions, normaliseCode, pickNewest } from "./loader";
import { contextOf, mergeEntry, overlaySnapshot, resolveActive, type CountryEntry } from "./resolve";
import { initialEntries, loadStoredCountry, loadStoredRegions, pruneStoredCountries, saveStoredCountry, saveStoredRegions } from "./storage";

/** The store's country right now (not the render snapshot, which is the server's during hydration). */
function storeCode(): CountryCode {
  return normaliseCode(useTakaStore.getState().country) ?? BASE_CODE;
}

export function CountryProvider({ children }: { children: ReactNode }) {
  const chosen = useTakaStore((s) => s.country);
  const code: CountryCode = normaliseCode(chosen) ?? BASE_CODE;
  const { snapshot: base } = useRates();
  // Lazy initial state. During hydration the hook above still returns the server snapshot (the
  // initial store, Bangladesh), but the store itself has already rehydrated from localStorage, so
  // getState() names the user's country: seed its stored copy now, and the first real render shows
  // the right currency. On the server both are Bangladesh and storage is empty ({}).
  const [entries, setEntries] = useState<Record<CountryCode, CountryEntry>>(() => ({ ...initialEntries(code), ...initialEntries(storeCode()) }));
  const [regions, setRegions] = useState<RegionDefaults | null>(() => loadStoredRegions());

  // Regional fallback figures: optional, loaded once.
  useEffect(() => {
    const controller = new AbortController();
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
    // Only the current country and Bangladesh are kept offline. `code` can still be the hydration
    // snapshot's Bangladesh here, so the store's own country is always kept too.
    pruneStoredCountries([code, storeCode(), BASE_CODE]);
    fetchCountryProfile(code, { signal: controller.signal })
      .catch(() => null)
      .then((net) => {
        if (controller.signal.aborted) return;
        // Keep the network copy for offline use when it wins over what we already had (ties go to the network).
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
