import { beforeEach, describe, expect, it } from "vitest";
import { createJSONStorage, type StateStorage } from "zustand/middleware";
import { selectOnboardingDone, selectPlanOverrides, selectProfile } from "./selectors";
import { makeId, migrateState, useTakaStore } from "./store";
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
    expect(INITIAL_DATA.schemaVersion).toBe(2);
    expect(s.country).toBe("BD");
    expect(s.drafts).toEqual([]);
  });

  it("persists a round trip through the injected storage", async () => {
    useTakaStore.getState().setProfile({ age: 30, takeHome: 50000 });
    useTakaStore.getState().setLocale("en");
    const raw = mem.map.get("taka-plan.v1");
    expect(raw).toBeDefined();
    const persisted = JSON.parse(raw!) as { state: Record<string, unknown>; version: number };
    expect(persisted.version).toBe(2);
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

  it("selectPlanOverrides passes M2 / M6 / M7 answers only once the user has answered something there", () => {
    const st = useTakaStore.getState();
    st.setProfile({ age: 36, incomeType: "salaried", takeHome: 120000, essentials: 75000, dependents: ["partner"], hasDebt: false });
    const before = selectPlanOverrides(useTakaStore.getState());
    expect(before.m2).toBeUndefined();
    expect(before.m6).toBeUndefined();
    expect(before.m7).toBeUndefined();
    expect(before.m1.hasHealthInsurance).toBe(false);

    // An empty risk object or undefined values are not answers.
    st.setM6({ risk: {}, goldShare: undefined });
    expect(selectPlanOverrides(useTakaStore.getState()).m6).toBeUndefined();

    st.setM2({ smoker: false, existingHealthCover: 300000, existingLifeCover: undefined });
    st.setM6({ risk: { reaction: 2 }, horizonYears: 15 });
    st.setM7({ planToAge: 95, monthlySaving: 5000 });
    const o = selectPlanOverrides(useTakaStore.getState());
    expect(o.m2).toEqual({ smoker: false, existingHealthCover: 300000 });
    expect(o.m6).toEqual({ risk: { reaction: 2 }, horizonYears: 15 });
    expect(o.m7).toEqual({ planToAge: 95, monthlySaving: 5000 });
    // M2's existing health cover answers M1's question until the user answers it in M1.
    expect(o.m1.hasHealthInsurance).toBe(true);
    st.setM1({ hasHealthInsurance: false });
    expect(selectPlanOverrides(useTakaStore.getState()).m1.hasHealthInsurance).toBe(false);
  });

  it("addLoan / addCard flip profile.hasDebt to true", () => {
    const st = useTakaStore.getState();
    st.setProfile({ hasDebt: false });
    st.addCard({ id: "c-2", balance: 0, limit: 0, paysInFull: true });
    expect(useTakaStore.getState().profile.hasDebt).toBe(true);
  });

  it("migrates a v1 blob to v2 without losing answers", () => {
    const v1 = {
      schemaVersion: 1,
      locale: "en",
      onboarding: { step: 5, completed: true, disclaimerSeen: true },
      profile: { age: 30, incomeType: "salaried", takeHome: 50000, essentials: 30000, dependents: [], hasDebt: false },
      m1: { liquidSavings: 1000 },
      m3: { loans: [], cards: [] },
      m4: { payday: 1 },
      m5: { goals: [{ id: "g", name: "Bike", cost: 1, years: 2, type: "vehicle" }] },
    };
    const v2 = migrateState(v1, 1);
    expect(v2.schemaVersion).toBe(2);
    expect(v2.country).toBe("BD");
    expect(v2.profile).toEqual(v1.profile);
    expect(v2.m5).toEqual(v1.m5);
    expect(v2.onboarding).toEqual(v1.onboarding);
    expect(v2.m2).toEqual({});
    expect(v2.m6).toEqual({});
    expect(v2.m7).toEqual({});
    expect(v2.drafts).toEqual([]);
  });

  it("startOver keeps the old answers as one draft and never duplicates identical answers", () => {
    const st = useTakaStore.getState();
    const answer = () => {
      useTakaStore.getState().setProfile({ age: 28, incomeType: "salaried", takeHome: 50000, essentials: 30000, dependents: [], hasDebt: false });
      useTakaStore.getState().addGoal({ id: makeId("g"), name: "Bike", cost: 250000, years: 2, type: "vehicle" });
      useTakaStore.getState().completeOnboarding();
    };
    st.setCountry("IN");
    st.setLocale("en");
    st.markDisclaimerSeen();
    answer();
    useTakaStore.getState().startOver();
    let s = useTakaStore.getState();
    expect(s.drafts).toHaveLength(1);
    expect(s.profile).toEqual({});
    expect(s.m5.goals).toEqual([]);
    expect(s.onboarding).toEqual({ step: 1, completed: false, disclaimerSeen: true });
    expect(s.country).toBe("IN");
    expect(s.locale).toBe("en");

    // Same answers again (new goal id): still one draft.
    answer();
    useTakaStore.getState().startOver();
    s = useTakaStore.getState();
    expect(s.drafts).toHaveLength(1);

    // Empty answers are never saved.
    useTakaStore.getState().startOver();
    expect(useTakaStore.getState().drafts).toHaveLength(1);

    // Different answers: a second draft.
    useTakaStore.getState().setProfile({ age: 40 });
    useTakaStore.getState().startOver();
    expect(useTakaStore.getState().drafts).toHaveLength(2);
  });

  it("openDraft saves the current answers first and switching back and forth adds nothing", () => {
    const st = useTakaStore.getState();
    st.setProfile({ age: 28, incomeType: "salaried", takeHome: 50000, essentials: 30000, dependents: [], hasDebt: false });
    st.startOver();
    st.setProfile({ age: 45, incomeType: "business", takeHome: 90000, essentials: 60000, dependents: ["children"], hasDebt: true });
    const first = useTakaStore.getState().drafts[0]!.id;
    useTakaStore.getState().openDraft(first);
    let s = useTakaStore.getState();
    expect(s.profile.age).toBe(28);
    expect(s.onboarding.completed).toBe(true);
    expect(s.drafts).toHaveLength(2); // the age-45 answers were kept too
    const second = s.drafts.find((d) => d.answers.profile.age === 45)!.id;
    useTakaStore.getState().openDraft(second);
    useTakaStore.getState().openDraft(first);
    useTakaStore.getState().openDraft(second);
    s = useTakaStore.getState();
    expect(s.drafts).toHaveLength(2);
    expect(s.profile.age).toBe(45);
    useTakaStore.getState().renameDraft(first, "  Before the new job ");
    expect(useTakaStore.getState().drafts.find((d) => d.id === first)?.name).toBe("Before the new job");
    useTakaStore.getState().deleteDraft(first);
    expect(useTakaStore.getState().drafts).toHaveLength(1);
  });
});
