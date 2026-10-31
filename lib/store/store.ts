"use client";
// Zustand store persisted to localStorage; SSR-safe (no window access at module eval).
// Resilient by design: a blocked or throwing localStorage falls back to memory, a corrupted blob
// starts fresh (and is kept aside under CORRUPT_KEY), every persisted field is shape-checked
// (lib/store/validate.ts), and another tab's writes are picked up through "storage" events.
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, type PersistStorage, type StateStorage, type StorageValue } from "zustand/middleware";
import { upsertDraft } from "./drafts";
import { EMPTY_ANSWERS, INITIAL_DATA, type DraftAnswers, type OnboardingState, type TakaData, type TakaState } from "./types";
import { sanitizeData } from "./validate";

/** localStorage key of the store. It keeps its v1 name so existing users' answers are found and migrated in place. */
export const STORE_KEY = "taka-plan.v1";
/** Where an unreadable blob is set aside (once) instead of being silently overwritten. */
export const CORRUPT_KEY = `${STORE_KEY}.corrupt`;

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

/** window.localStorage, or null on the server or when merely touching it throws (privacy modes, blocked site data). */
function local(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Resolves localStorage lazily so RSC/SSR never touches `window`. Every call is wrapped: when
 * localStorage is missing or throws (SecurityError, QuotaExceededError) the in-memory copy answers
 * instead, so the app keeps working for the rest of the visit.
 */
export const safeLocalStorage: StateStorage = {
  getItem: (k) => {
    try {
      const ls = local();
      if (ls) return ls.getItem(k);
    } catch {
      // fall through to memory
    }
    return fallback.getItem(k) as string | null;
  },
  setItem: (k, v) => {
    fallback.setItem(k, v);
    try {
      local()?.setItem(k, v);
    } catch {
      // quota or privacy mode: the memory copy holds it for this visit
    }
  },
  removeItem: (k) => {
    fallback.removeItem(k);
    try {
      local()?.removeItem(k);
    } catch {
      // ignore
    }
  },
};

/**
 * JSON storage over `raw` that never throws: an unparsable value reads as "nothing stored" (the
 * broken text is copied to CORRUPT_KEY first, once), and write errors are swallowed.
 */
export function resilientJSONStorage<S>(raw: () => StateStorage): PersistStorage<S> {
  return {
    getItem: (name) => {
      let text: string | null = null;
      try {
        text = raw().getItem(name) as string | null;
        if (text === null) return null;
        const parsed = JSON.parse(text) as unknown;
        if (typeof parsed !== "object" || parsed === null) throw new Error("not an object");
        return parsed as StorageValue<S>;
      } catch {
        try {
          if (text !== null && raw().getItem(CORRUPT_KEY) === null) raw().setItem(CORRUPT_KEY, text);
        } catch {
          // ignore
        }
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        raw().setItem(name, JSON.stringify(value));
      } catch {
        // ignore
      }
    },
    removeItem: (name) => {
      try {
        raw().removeItem(name);
      } catch {
        // ignore
      }
    },
  };
}

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

/**
 * Persisted blob → current TakaData. v1 → v2: Bangladesh as the country, empty M2/M6/M7 slices,
 * no drafts. v2 (and anything newer) keeps its answers. Every field is shape-checked either way
 * (lib/store/validate.ts): a field with the wrong type is dropped, a slice that is not an object
 * starts from its initial value. Unknown (older or missing) versions start fresh.
 */
export function migrateState(persisted: unknown, version: number): TakaData {
  const p = (typeof persisted === "object" && persisted !== null ? persisted : {}) as Record<string, unknown>;
  if (version >= 2) return sanitizeData(p);
  if (version === 1) return sanitizeData({ ...p, country: "BD", m2: {}, m6: {}, m7: {}, drafts: [] });
  return { ...INITIAL_DATA };
}

/* ---- hydration status ---- */

let hydrationFailed = false;
const failureListeners = new Set<() => void>();

/** Called by persist after every (re)hydration; an error still counts as "done", so the app never waits forever. */
function afterRehydrate(_state: unknown, error: unknown): void {
  if (!error) return;
  hydrationFailed = true;
  for (const cb of failureListeners) cb();
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
      switchCountry: (country) =>
        set((s) => {
          if (country === s.country) return {};
          const { drafts } = upsertDraft(s.drafts, answersOf(s), nowIso(), () => makeId("draft"));
          const onboarding: OnboardingState = { step: 1, completed: false, disclaimerSeen: s.onboarding.disclaimerSeen };
          return { ...EMPTY_ANSWERS, country, drafts, onboarding };
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
      name: STORE_KEY,
      version: 2,
      storage: resilientJSONStorage<TakaData>(() => safeLocalStorage),
      partialize: (s: TakaState): TakaData => partialize(s),
      // Actions are re-attached by persist after migration; only the data half is returned here.
      migrate: (persisted, version) => migrateState(persisted, version) as TakaState,
      // Same-version blobs skip `migrate`, so they are shape-checked here. Nothing stored → keep the current state.
      merge: (persisted, current) => (persisted === undefined || persisted === null ? current : { ...current, ...sanitizeData(persisted) }),
      onRehydrateStorage: () => afterRehydrate,
    },
  ),
);

/** True once persist has rehydrated from storage (or given up on it); false during SSR and first client render. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const done = () => setHydrated(true);
    const unsub = useTakaStore.persist.onFinishHydration(done);
    failureListeners.add(done);
    if (useTakaStore.persist.hasHydrated() || hydrationFailed) done();
    return () => {
      unsub();
      failureListeners.delete(done);
    };
  }, []);
  return hydrated;
}

/* ---- other tabs ---- */

/** Rehydrates when another tab wrote (or cleared) the store, so a stale tab never overwrites newer answers or drafts. */
export function onStorageEvent(e: Pick<StorageEvent, "key">): void {
  if (e.key === STORE_KEY || e.key === null) void useTakaStore.persist.rehydrate();
}

/** Listens for other tabs' writes on `target` (window in the app); returns the unsubscribe. */
export function syncAcrossTabs(target: Pick<EventTarget, "addEventListener" | "removeEventListener">): () => void {
  const handler = (e: Event) => onStorageEvent(e as StorageEvent);
  target.addEventListener("storage", handler);
  return () => target.removeEventListener("storage", handler);
}

if (typeof window !== "undefined") syncAcrossTabs(window);

/** Collision-resistant id for loans, cards and goals: prefix + time + random, base36. */
export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
