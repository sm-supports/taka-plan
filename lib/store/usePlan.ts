"use client";
// Computes the plan from store + country-overlaid rates on the client; never throws (engine stubs may).
import { useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";
import { computePlan, profileToPlanInput, type EngineError, type ISODate, type M1Input, type Plan } from "@taka/engine";
import { useCountryRates } from "../country/useCountry";
import { selectPlanOverrides, selectProfile } from "./selectors";
import { useTakaStore } from "./store";
import type { TakaData } from "./types";

export interface UsePlanResult {
  plan: Plan | null;
  error: EngineError | Error | null;
  today: ISODate;
}

/** Every persisted slice (same list as partialize in store.ts), so any answer change recomputes the plan. */
function pickData(s: TakaData): TakaData {
  const { schemaVersion, country, locale, onboarding, profile, m1, m2, m3, m4, m5, m6, m7, drafts } = s;
  return { schemaVersion, country, locale, onboarding, profile, m1, m2, m3, m4, m5, m6, m7, drafts };
}

function todayISO(): ISODate {
  return new Date().toISOString().slice(0, 10);
}

export function usePlan(): UsePlanResult {
  // selectProfile builds a new (flat) object per call; useShallow keeps zustand 5's useSyncExternalStore from looping.
  const profile = useTakaStore(useShallow(selectProfile));
  // selectPlanOverrides nests fresh objects, so it cannot be shallow-compared: pick the persisted slices
  // (stable references until they change) and derive the overrides from them.
  const data = useTakaStore(useShallow(pickData));
  const overrides = useMemo(() => selectPlanOverrides(data), [data]);
  const snapshot = useCountryRates();
  // Fixed per mount so a midnight tick does not re-render the whole plan.
  const [today] = useState(todayISO);

  return useMemo(() => {
    if (!profile) return { plan: null, error: null, today };
    try {
      // overrides.m1 is Partial; with a complete profile every required field is present.
      const m1: M1Input = {
        essentials: profile.essentials,
        incomeType: profile.incomeType,
        dependents: profile.dependents,
        soleEarner: overrides.m1.soleEarner ?? profile.dependents.length > 0,
        hasHealthInsurance: overrides.m1.hasHealthInsurance ?? false,
        liquidSavings: overrides.m1.liquidSavings ?? 0,
        ...(overrides.m1.monthsOverride !== undefined ? { monthsOverride: overrides.m1.monthsOverride } : {}),
        ...(overrides.m1.buildMonths !== undefined ? { buildMonths: overrides.m1.buildMonths } : {}),
      };
      const input = profileToPlanInput(profile, { ...overrides, m1 });
      return { plan: computePlan(input, snapshot, today), error: null, today };
    } catch (e) {
      return { plan: null, error: e instanceof Error ? e : new Error(String(e)), today };
    }
  }, [profile, overrides, snapshot, today]);
}
