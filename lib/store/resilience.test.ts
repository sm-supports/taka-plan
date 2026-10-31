/** Review fixes ST-H3 (blocked or corrupted storage, shape checks), ST-H4 (other tabs), ST-H1 (switchCountry). */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Profile } from "@taka/engine";
import type { StateStorage } from "zustand/middleware";
import { CORRUPT_KEY, STORE_KEY, migrateState, onStorageEvent, resilientJSONStorage, safeLocalStorage, syncAcrossTabs, useTakaStore } from "./store";
import { INITIAL_DATA, type TakaData } from "./types";
import { sanitizeData } from "./validate";

function memStorage(): StateStorage & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) };
}

const PROFILE: Profile = { age: 28, incomeType: "salaried", takeHome: 50000, essentials: 30000, dependents: [], hasDebt: false };
const blob = (state: Partial<TakaData>, version = 2) => JSON.stringify({ state: { ...INITIAL_DATA, ...state }, version });

describe("resilient storage", () => {
  let mem: ReturnType<typeof memStorage>;
  beforeEach(() => {
    mem = memStorage();
    useTakaStore.persist.setOptions({ storage: resilientJSONStorage<TakaData>(() => mem) });
    useTakaStore.getState().reset();
  });

  it("a corrupted blob rehydrates as a fresh state (hydration finishes), and the broken text is kept aside", async () => {
    useTakaStore.getState().setProfile({ age: 44 });
    mem.map.set(STORE_KEY, '{"state":{"schemaVersion":2,"coun');
    await useTakaStore.persist.rehydrate();
    expect(useTakaStore.persist.hasHydrated()).toBe(true);
    expect(mem.map.get(CORRUPT_KEY)).toBe('{"state":{"schemaVersion":2,"coun');
    // Nothing usable stored: the state in memory stays, and the next write replaces the broken blob.
    useTakaStore.getState().setLocale("en");
    expect(JSON.parse(mem.map.get(STORE_KEY)!).state.locale).toBe("en");
  });

  it("a storage that throws on every call never breaks hydration or writes", async () => {
    const throwing: StateStorage = {
      getItem: () => {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
      setItem: () => {
        throw new DOMException("quota", "QuotaExceededError");
      },
      removeItem: () => {
        throw new Error("nope");
      },
    };
    useTakaStore.persist.setOptions({ storage: resilientJSONStorage<TakaData>(() => throwing) });
    await useTakaStore.persist.rehydrate();
    expect(useTakaStore.persist.hasHydrated()).toBe(true);
    expect(() => useTakaStore.getState().setProfile({ age: 33 })).not.toThrow();
    expect(useTakaStore.getState().profile.age).toBe(33);
  });

  it("safeLocalStorage falls back to memory when window.localStorage throws", () => {
    const g = globalThis as { window?: unknown };
    g.window = {
      get localStorage() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    };
    try {
      safeLocalStorage.setItem("k", "v");
      expect(safeLocalStorage.getItem("k")).toBe("v");
      safeLocalStorage.removeItem("k");
      expect(safeLocalStorage.getItem("k")).toBeNull();
    } finally {
      delete g.window;
    }
  });

  it("same-version blobs are shape-checked on rehydrate too", async () => {
    mem.map.set(STORE_KEY, JSON.stringify({ state: { country: "in", locale: "xx", profile: { age: "28", takeHome: 50000 }, m3: "nope", drafts: "x" }, version: 2 }));
    await useTakaStore.persist.rehydrate();
    const s = useTakaStore.getState();
    expect(s.country).toBe("BD");
    expect(s.locale).toBe("bn");
    expect(s.profile).toEqual({ takeHome: 50000 });
    expect(s.m3).toEqual({ loans: [], cards: [] });
    expect(s.drafts).toEqual([]);
    expect(typeof s.setProfile).toBe("function");
  });
});

describe("migrateState validation", () => {
  it("drops wrong types field by field and keeps the rest", () => {
    const out = migrateState(
      {
        country: "IN",
        locale: "en",
        onboarding: { step: 9, completed: "yes", disclaimerSeen: true },
        profile: { ...PROFILE, dependents: ["children", "aliens", 3], hasDebt: "no", extra: 1 },
        m1: { liquidSavings: Number.NaN, soleEarner: true },
        m2: { smoker: "true", healthCovered: ["self", "dog"], policy: { annualPremium: 1, termYears: "x" } },
        m3: {
          loans: [{ id: "l1", type: "home", outstanding: 1, annualRate: 0.1, emi: 1, monthsLeft: 2 }, { id: "l2", type: "home" }, "junk", { type: "car", outstanding: 1, annualRate: 0.1, emi: 1, monthsLeft: 2 }],
          cards: null,
          extraMonthly: 500,
        },
        m4: { last6Incomes: [1, "2", 3] },
        m5: { goals: [{ id: "g", name: "Bike", cost: 1, years: 2, type: "vehicle" }, { id: "g2", name: 5 }] },
        m6: { profileOverride: "yolo", risk: { reaction: 2, horizon: "long" } },
        m7: { mode: "retired", sources: { rentMonthly: 100, providentFund: "x" } },
        drafts: [{ id: "d1", updatedAt: "2026-10-30T00:00:00.000Z", hash: "forged", answers: { country: "BD", profile: { age: 40 } } }, { id: 7 }, null],
      },
      2,
    );
    expect(out.country).toBe("IN");
    expect(out.onboarding).toEqual({ step: 1, completed: false, disclaimerSeen: true });
    expect(out.profile).toEqual({ age: 28, incomeType: "salaried", takeHome: 50000, essentials: 30000, dependents: ["children"] });
    expect(out.m1).toEqual({ soleEarner: true });
    expect(out.m2).toEqual({ healthCovered: ["self"], policy: { annualPremium: 1 } });
    expect(out.m3.loans.map((l) => l.id)).toEqual(["l1"]);
    expect(out.m3.cards).toEqual([]);
    expect(out.m3.extraMonthly).toBe(500);
    expect(out.m4.last6Incomes).toEqual([1, 3]);
    expect(out.m5.goals.map((g) => g.id)).toEqual(["g"]);
    expect(out.m6).toEqual({ risk: { reaction: 2 } });
    expect(out.m7).toEqual({ mode: "retired", sources: { rentMonthly: 100 } });
    expect(out.drafts).toHaveLength(1);
    expect(out.drafts[0]!.hash).not.toBe("forged");
    expect(out.drafts[0]!.answers.profile).toEqual({ age: 40 });
    expect(out.drafts[0]!.createdAt).toBe("2026-10-30T00:00:00.000Z");
  });

  it("v1 keeps the answers with Bangladesh and empty M2/M6/M7; unknown versions and non-objects start fresh", () => {
    const v2 = migrateState({ locale: "en", profile: PROFILE, m2: { smoker: true }, drafts: [{}] }, 1);
    expect(v2.country).toBe("BD");
    expect(v2.profile).toEqual(PROFILE);
    expect(v2.m2).toEqual({});
    expect(v2.drafts).toEqual([]);
    expect(migrateState({ profile: PROFILE }, 0)).toEqual(INITIAL_DATA);
    expect(migrateState("garbage", 2)).toEqual({ ...INITIAL_DATA, drafts: [] });
    expect(migrateState(null, 2).m3).toEqual({ loans: [], cards: [] });
  });

  it("is idempotent and collapses drafts that hash the same (keeping a name)", () => {
    const answers = { country: "BD", locale: "en", profile: PROFILE };
    const out = sanitizeData({
      drafts: [
        { id: "a", updatedAt: "2026-10-30T00:00:00.000Z", answers },
        { id: "b", updatedAt: "2026-10-29T00:00:00.000Z", name: "Mine", answers: { ...answers, locale: "bn", profile: { ...PROFILE, age: 28.0 } } },
      ],
    });
    expect(out.drafts).toHaveLength(1);
    expect(out.drafts[0]).toMatchObject({ id: "a", name: "Mine" });
    expect(sanitizeData(out)).toEqual(out);
  });
});

describe("other tabs", () => {
  let mem: ReturnType<typeof memStorage>;
  beforeEach(() => {
    mem = memStorage();
    useTakaStore.persist.setOptions({ storage: resilientJSONStorage<TakaData>(() => mem) });
    useTakaStore.getState().reset();
  });

  it("a storage event for the store key rehydrates, so a stale tab picks up the other tab's drafts", async () => {
    // This tab: the old answers. Another tab started over and wrote a draft.
    useTakaStore.getState().setProfile(PROFILE);
    const other = sanitizeData({ profile: {}, drafts: [{ id: "d1", updatedAt: "2026-10-31T00:00:00.000Z", answers: { country: "BD", locale: "en", profile: PROFILE } }] });
    mem.map.set(STORE_KEY, JSON.stringify({ state: other, version: 2 }));

    const target = new EventTarget();
    const stop = syncAcrossTabs(target);
    const ev = Object.assign(new Event("storage"), { key: STORE_KEY });
    target.dispatchEvent(ev);
    await Promise.resolve();
    await Promise.resolve();
    expect(useTakaStore.getState().drafts).toHaveLength(1);
    expect(useTakaStore.getState().profile).toEqual({});
    // An edit in this tab now builds on the other tab's state: the draft survives.
    useTakaStore.getState().setM1({ liquidSavings: 12345 });
    expect(JSON.parse(mem.map.get(STORE_KEY)!).state.drafts).toHaveLength(1);
    stop();
  });

  it("ignores other keys", async () => {
    useTakaStore.getState().setProfile({ age: 50 });
    mem.map.set(STORE_KEY, blob({ profile: { age: 20 } }));
    onStorageEvent({ key: "taka-plan.rates" });
    await Promise.resolve();
    expect(useTakaStore.getState().profile.age).toBe(50);
    onStorageEvent({ key: STORE_KEY });
    await Promise.resolve();
    expect(useTakaStore.getState().profile.age).toBe(20);
  });
});

describe("switchCountry", () => {
  beforeEach(() => {
    useTakaStore.persist.setOptions({ storage: resilientJSONStorage<TakaData>(() => memStorage()) });
    useTakaStore.getState().reset();
  });
  afterEach(() => useTakaStore.getState().reset());

  it("keeps the answers as a draft of the old country, clears them and sets the new country", () => {
    const st = useTakaStore.getState();
    st.setLocale("en");
    st.markDisclaimerSeen();
    st.setProfile(PROFILE);
    st.completeOnboarding();
    useTakaStore.getState().switchCountry("IN");
    const s = useTakaStore.getState();
    expect(s.country).toBe("IN");
    expect(s.profile).toEqual({});
    expect(s.onboarding).toEqual({ step: 1, completed: false, disclaimerSeen: true });
    expect(s.drafts).toHaveLength(1);
    expect(s.drafts[0]!.answers.country).toBe("BD");
    expect(s.locale).toBe("en");
  });

  it("is a no-op for the same country, and saves no draft when there were no answers", () => {
    useTakaStore.getState().setProfile(PROFILE);
    useTakaStore.getState().switchCountry("BD");
    expect(useTakaStore.getState().profile).toEqual(PROFILE);
    useTakaStore.getState().reset();
    useTakaStore.getState().switchCountry("US");
    expect(useTakaStore.getState().country).toBe("US");
    expect(useTakaStore.getState().drafts).toEqual([]);
  });
});
