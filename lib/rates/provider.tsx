"use client";
// Supplies the rates snapshot: bundled seed first, then stored cache, then network if newer.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { RATES_SEED, assertSnapshot, staleKeys, type RatesSnapshot } from "@taka/engine";
import { fetchRates } from "./client";
import { RatesContext, type RatesContextValue, type RatesSource } from "./context";
import { loadStoredSnapshot, saveStoredSnapshot } from "./storage";

/** Validated once at module load; the seed ships inside the bundle so first paint never waits. */
const BUNDLED: RatesSnapshot = assertSnapshot(RATES_SEED);

export function RatesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ snapshot: RatesSnapshot; source: RatesSource }>({ snapshot: BUNDLED, source: "bundled" });

  useEffect(() => {
    const controller = new AbortController();
    let current = BUNDLED;
    const stored = loadStoredSnapshot();
    if (stored && stored.version > current.version) {
      current = stored;
      setState({ snapshot: stored, source: "stored" });
    }
    fetchRates({ signal: controller.signal })
      .then(({ snapshot }) => {
        if (snapshot.version > current.version) {
          saveStoredSnapshot(snapshot);
          setState({ snapshot, source: "network" });
        }
      })
      .catch(() => {
        // Offline or API down: keep whatever we have.
      });
    return () => controller.abort();
  }, []);

  const value = useMemo<RatesContextValue>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return { snapshot: state.snapshot, source: state.source, version: state.snapshot.version, staleKeys: staleKeys(state.snapshot, today) };
  }, [state]);

  return <RatesContext.Provider value={value}>{children}</RatesContext.Provider>;
}
