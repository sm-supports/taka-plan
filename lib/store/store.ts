"use client";
// Zustand store persisted to localStorage; SSR-safe (no window access at module eval).
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { upsertDraft } from "./drafts";
import { EMPTY_ANSWERS, INITIAL_DATA, type DraftAnswers, type OnboardingState, type TakaData, type TakaState } from "./types";

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

/** Strip the action functions so only data is persisted. Every TakaData field must be listed here. */
export function partialize(s: TakaData): TakaData {
  const { schemaVersion, country, locale, onboarding, profile, m1, m2, m3, m4, m5, m6, m7, drafts } = s;
  return { schemaVersion, country, locale, onboarding, profile, m1, m2, m3, m4, m5, m6, m7, drafts };
}

/** The current answers, as a draft would keep them. */
export function answersOf(s: TakaData): DraftAnswers {
  const { country, locale, profile, m1, m2, m3, m4, m5, m6, m7 } = s;
  return { country, locale, profile, m1, m2, m3, m4, m5, m6, m7 };
}

const PROFILE_FIELDS = ["age", "incomeType", "takeHome", "essentials", "dependents", "hasDebt"] as const;

function nowIso(): string {
  return new Date().toISOString();
}

/** v1 → v2: Bangladesh as the country, empty M2/M6/M7 slices, no drafts. Unknown versions start fresh. */
export function migrateState(persisted: unknown, version: number): TakaData {
  const p = (persisted ?? {}) as Partial<TakaData> & Record<string, unknown>;
  if (version >= 2) return { ...INITIAL_DATA, ...p, schemaVersion: 2 } as TakaData;
  if (version === 1) {
    return {
      ...INITIAL_DATA,
      ...p,
      schemaVersion: 2,
      country: "BD",
      m2: {},
      m6: {},
      m7: {},
      drafts: [],
    } as TakaData;
  }
  return { ...INITIAL_DATA };
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
      setCountry: (country) => set({ country }),
      setM2: (patch) => set((s) => ({ m2: { ...s.m2, ...patch } })),
      setM6: (patch) => set((s) => ({ m6: { ...s.m6, ...patch } })),
      setM7: (patch) => set((s) => ({ m7: { ...s.m7, ...patch } })),
      startOver: () =>
        set((s) => {
          const { drafts } = upsertDraft(s.drafts, answersOf(s), nowIso(), () => makeId("draft"));
          const onboarding: OnboardingState = { step: 1, completed: false, disclaimerSeen: s.onboarding.disclaimerSeen };
          return { ...EMPTY_ANSWERS, drafts, onboarding };
        }),
      openDraft: (id) =>
        set((s) => {
          const target = s.drafts.find((d) => d.id === id);
          if (!target) return {};
          const { drafts } = upsertDraft(s.drafts, answersOf(s), nowIso(), () => makeId("draft"));
          const a = target.answers;
          const complete = PROFILE_FIELDS.every((k) => a.profile[k] !== undefined);
          const onboarding: OnboardingState = { step: complete ? 5 : 1, completed: complete, disclaimerSeen: s.onboarding.disclaimerSeen };
          return { ...EMPTY_ANSWERS, ...a, locale: s.locale, drafts, onboarding };
        }),
      renameDraft: (id, name) => set((s) => ({ drafts: s.drafts.map((d) => (d.id === id ? { ...d, name: name.trim() || undefined } : d)) })),
      deleteDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),
      reset: () => set({ ...INITIAL_DATA }),
    }),
    {
      // The key keeps its v1 name so existing users' answers are found and migrated in place.
      name: "taka-plan.v1",
      version: 2,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (s: TakaState): TakaData => partialize(s),
      // Actions are re-attached by persist after migration; only the data half is returned here.
      migrate: (persisted, version) => migrateState(persisted, version) as TakaState,
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
