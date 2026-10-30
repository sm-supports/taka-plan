import { beforeEach, describe, expect, it } from "vitest";
import { createJSONStorage, type StateStorage } from "zustand/middleware";
import { selectOnboardingDone, selectPlanOverrides, selectProfile } from "./selectors";
import { makeId, useTakaStore } from "./store";
import { INITIAL_DATA } from "./types";

function memStorage(): StateStorage & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) };
}

describe("useTakaStore", () => {
  let mem: ReturnType<typeof memStorage>;
  beforeEach(() => {
    mem = memStorage();
    useTakaStore.persist.setOptions({ storage: createJSONStorage(() => mem) });
    useTakaStore.getState().reset();
  });

  it("starts from INITIAL_DATA", () => {
    const s = useTakaStore.getState();
    expect(s.locale).toBe("bn");
    expect(s.onboarding.step).toBe(1);
    expect(s.profile).toEqual({});
    expect(s.m5.goals).toEqual([]);
    expect(INITIAL_DATA.schemaVersion).toBe(1);
  });

  it("persists a round trip through the injected storage", async () => {
    useTakaStore.getState().setProfile({ age: 30, takeHome: 50000 });
    useTakaStore.getState().setLocale("en");
    const raw = mem.map.get("taka-plan.v1");
    expect(raw).toBeDefined();
    const persisted = JSON.parse(raw!) as { state: Record<string, unknown>; version: number };
    expect(persisted.version).toBe(1);
    expect(persisted.state.profile).toEqual({ age: 30, takeHome: 50000 });
    expect(Object.values(persisted.state).some((v) => typeof v === "function")).toBe(false);
    expect("setProfile" in persisted.state).toBe(false);

    // Wipe memory (persist writes the reset too), restore the earlier blob, then rehydrate.
    useTakaStore.setState({ ...INITIAL_DATA });
    expect(useTakaStore.getState().locale).toBe("bn");
    mem.map.set("taka-plan.v1", raw!);
    await useTakaStore.persist.rehydrate();
    expect(useTakaStore.getState().locale).toBe("en");
    expect(useTakaStore.getState().profile).toEqual({ age: 30, takeHome: 50000 });
    expect(useTakaStore.persist.hasHydrated()).toBe(true);
  });

  it("setProfile merges, addGoal/updateGoal/removeGoal edit the list, reset clears", () => {
    const st = useTakaStore.getState();
    st.setProfile({ age: 25 });
    st.setProfile({ incomeType: "salaried" });
    expect(useTakaStore.getState().profile).toEqual({ age: 25, incomeType: "salaried" });
    const id = makeId("g");
    expect(id).toMatch(/^g-[0-9a-z]+-[0-9a-z]+$/);
    st.addGoal({ id, name: "Bike", cost: 250000, years: 2, type: "vehicle" });
    st.updateGoal(id, { cost: 300000 });
    expect(useTakaStore.getState().m5.goals).toEqual([{ id, name: "Bike", cost: 300000, years: 2, type: "vehicle" }]);
    st.removeGoal(id);
    expect(useTakaStore.getState().m5.goals).toEqual([]);
    st.addLoan({ id: "l1", type: "home", outstanding: 1, annualRate: 0.1, emi: 1, monthsLeft: 1 });
    expect(useTakaStore.getState().profile.hasDebt).toBe(true);
    st.completeOnboarding();
    expect(selectOnboardingDone(useTakaStore.getState())).toBe(true);
    st.reset();
    expect(useTakaStore.getState().profile).toEqual({});
    expect(useTakaStore.getState().m3.loans).toEqual([]);
    expect(selectOnboardingDone(useTakaStore.getState())).toBe(false);
  });

  it("selectProfile is null until every answer is present and valid", () => {
    const st = useTakaStore.getState();
    expect(selectProfile(useTakaStore.getState())).toBeNull();
    st.setProfile({ age: 36, incomeType: "salaried", takeHome: 0, essentials: 75000, dependents: ["partner"] });
    expect(selectProfile(useTakaStore.getState())).toBeNull(); // takeHome 0, hasDebt missing
    st.setProfile({ takeHome: 120000 });
    expect(selectProfile(useTakaStore.getState())).toBeNull(); // hasDebt missing
    st.setProfile({ hasDebt: true });
    expect(selectProfile(useTakaStore.getState())).toEqual({ age: 36, incomeType: "salaried", takeHome: 120000, essentials: 75000, dependents: ["partner"], hasDebt: true });
    st.setProfile({ essentials: -1 });
    expect(selectProfile(useTakaStore.getState())).toBeNull();
  });

  it("selectPlanOverrides builds PlanInput sections for a familyWithDebt-like profile", () => {
    const st = useTakaStore.getState();
    st.setProfile({ age: 36, incomeType: "salaried", takeHome: 120000, essentials: 75000, dependents: ["partner", "children", "parents"], hasDebt: true });
    st.setM1({ liquidSavings: 100000, soleEarner: false });
    st.setM4({ payday: 5 });
    st.addLoan({ id: "l-home", type: "home", outstanding: 2500000, annualRate: 0.12, emi: 25000, monthsLeft: 180 });
    st.addCard({ id: "c-1", balance: 60000, limit: 100000, paysInFull: false });
    st.addGoal({ id: "g-edu", name: "Daughter's university", cost: 1500000, years: 10, type: "education" });

    const o = selectPlanOverrides(useTakaStore.getState());
    expect(o.m1).toEqual({ essentials: 75000, incomeType: "salaried", dependents: ["partner", "children", "parents"], soleEarner: false, hasHealthInsurance: false, liquidSavings: 100000 });
    expect(o.m4).toEqual({ takeHome: 120000, essentials: 75000, incomeType: "salaried", payday: 5 });
    expect(o.m3).toEqual({
      takeHome: 120000,
      essentials: 75000,
      savingsTarget: 24000,
      loans: [{ id: "l-home", type: "home", outstanding: 2500000, annualRate: 0.12, emi: 25000, monthsLeft: 180 }],
      cards: [{ id: "c-1", balance: 60000, limit: 100000, paysInFull: false }],
    });
    expect(o.m5).toEqual({ goals: [{ id: "g-edu", name: "Daughter's university", cost: 1500000, years: 10, type: "education" }], age: 36 });

    // Listed loans or cards feed the plan even when onboarding said "no debt" (P5); soleEarner defaults to dependents.length > 0.
    st.setProfile({ hasDebt: false });
    st.setM1({ soleEarner: undefined });
    const o2 = selectPlanOverrides(useTakaStore.getState());
    expect(o2.m3).toBeDefined();
    expect(selectProfile(useTakaStore.getState())?.hasDebt).toBe(true);
    expect(o2.m1.soleEarner).toBe(true);

    // With no loans or cards left, the onboarding answer stands.
    st.removeLoan("l-home");
    st.removeCard("c-1");
    expect(selectPlanOverrides(useTakaStore.getState()).m3).toBeUndefined();
    expect(selectProfile(useTakaStore.getState())?.hasDebt).toBe(false);
  });

  it("addLoan / addCard flip profile.hasDebt to true", () => {
    const st = useTakaStore.getState();
    st.setProfile({ hasDebt: false });
    st.addCard({ id: "c-2", balance: 0, limit: 0, paysInFull: true });
    expect(useTakaStore.getState().profile.hasDebt).toBe(true);
  });
});
