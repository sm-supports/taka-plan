"use client";
// Computes the plan from store + rates on the client; never throws (engine stubs may).
import { useMemo, useState } from "react";
import { computePlan, profileToPlanInput, type EngineError, type ISODate, type M1Input, type Plan } from "@taka/engine";
import { useRates } from "../rates/useRates";
import { selectPlanOverrides, selectProfile } from "./selectors";
import { useTakaStore } from "./store";

export interface UsePlanResult {
  plan: Plan | null;
  error: EngineError | Error | null;
  today: ISODate;
}

function todayISO(): ISODate {
  return new Date().toISOString().slice(0, 10);
}

export function usePlan(): UsePlanResult {
  const profile = useTakaStore(selectProfile);
  const data = useTakaStore((s) => s);
  const overrides = useMemo(() => selectPlanOverrides(data), [data]);
  const { snapshot } = useRates();
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
