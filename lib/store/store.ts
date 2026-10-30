"use client";
// Zustand store persisted to localStorage; SSR-safe (no window access at module eval).
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { INITIAL_DATA, type TakaData, type TakaState } from "./types";

/** In-memory Storage used on the server and when localStorage is unavailable. */
function memoryStorage(): StateStorage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

const fallback = memoryStorage();

/** Resolves localStorage lazily so RSC/SSR never touches `window`. */
export const safeLocalStorage: StateStorage = {
  getItem: (k) => (typeof window === "undefined" ? fallback.getItem(k) : window.localStorage.getItem(k)),
  setItem: (k, v) => (typeof window === "undefined" ? fallback.setItem(k, v) : window.localStorage.setItem(k, v)),
  removeItem: (k) => (typeof window === "undefined" ? fallback.removeItem(k) : window.localStorage.removeItem(k)),
};

/** Replace one item in a list by id, leaving others untouched. */
function patchById<T extends { id: string }>(list: T[], id: string, patch: Partial<T>): T[] {
  return list.map((x) => (x.id === id ? { ...x, ...patch, id } : x));
}

/** Strip the action functions so only data is persisted. */
function partialize(s: TakaState): TakaData {
  const { schemaVersion, locale, onboarding, profile, m1, m3, m4, m5 } = s;
  return { schemaVersion, locale, onboarding, profile, m1, m3, m4, m5 };
}

export const useTakaStore = create<TakaState>()(
  persist(
    (set) => ({
      ...INITIAL_DATA,
      setLocale: (locale) => set({ locale }),
      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      setOnboardingStep: (step) => set((s) => ({ onboarding: { ...s.onboarding, step } })),
      completeOnboarding: () => set((s) => ({ onboarding: { ...s.onboarding, completed: true } })),
      markDisclaimerSeen: () => set((s) => ({ onboarding: { ...s.onboarding, disclaimerSeen: true } })),
      setM1: (patch) => set((s) => ({ m1: { ...s.m1, ...patch } })),
      // Adding a loan or card means the user has debt, whatever onboarding said: the plan must include M3.
      addLoan: (l) => set((s) => ({ m3: { ...s.m3, loans: [...s.m3.loans, l] }, profile: { ...s.profile, hasDebt: true } })),
      updateLoan: (id, patch) => set((s) => ({ m3: { ...s.m3, loans: patchById(s.m3.loans, id, patch) } })),
      removeLoan: (id) => set((s) => ({ m3: { ...s.m3, loans: s.m3.loans.filter((l) => l.id !== id) } })),
      addCard: (c) => set((s) => ({ m3: { ...s.m3, cards: [...s.m3.cards, c] }, profile: { ...s.profile, hasDebt: true } })),
      updateCard: (id, patch) => set((s) => ({ m3: { ...s.m3, cards: patchById(s.m3.cards, id, patch) } })),
      removeCard: (id) => set((s) => ({ m3: { ...s.m3, cards: s.m3.cards.filter((c) => c.id !== id) } })),
      setM3: (patch) => set((s) => ({ m3: { ...s.m3, ...patch } })),
      setM4: (patch) => set((s) => ({ m4: { ...s.m4, ...patch } })),
      addGoal: (g) => set((s) => ({ m5: { goals: [...s.m5.goals, g] } })),
      updateGoal: (id, patch) => set((s) => ({ m5: { goals: patchById(s.m5.goals, id, patch) } })),
      removeGoal: (id) => set((s) => ({ m5: { goals: s.m5.goals.filter((g) => g.id !== id) } })),
      reset: () => set({ ...INITIAL_DATA }),
    }),
    {
      name: "taka-plan.v1",
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize,
      // Stub for future schema versions: today there is only v1.
      migrate: (persisted, _version) => persisted as TakaData,
    },
  ),
);

/** True once persist has rehydrated from storage; false during SSR and first client render. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useTakaStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useTakaStore.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}

/** Collision-resistant id for loans, cards and goals: prefix + time + random, base36. */
export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
