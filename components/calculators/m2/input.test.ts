import { describe, expect, it } from "vitest";
import { INITIAL_DATA, type TakaData } from "@/lib/store/types";
import { buildM2Input, defaultCovered, draftToPolicy, EMPTY_POLICY } from "./input";

const profile = { age: 30, incomeType: "salaried" as const, takeHome: 50000, essentials: 30000, dependents: ["partner" as const, "children" as const], hasDebt: false };

describe("m2 input", () => {
  it("defaultCovered is self plus the dependents in a fixed order", () => {
    expect(defaultCovered([])).toEqual(["self"]);
    expect(defaultCovered(["parents", "partner"])).toEqual(["self", "partner", "parent"]);
  });

  it("buildM2Input is null without a complete profile", () => {
    expect(buildM2Input(INITIAL_DATA)).toBeNull();
  });

  it("buildM2Input takes profile values and the m2 answers, defaults the rest", () => {
    const data: TakaData = { ...INITIAL_DATA, profile, m1: { liquidSavings: 40000 }, m2: { smoker: true, existingLifeCover: 100000 } };
    const input = buildM2Input(data);
    expect(input).toMatchObject({ age: 30, takeHome: 50000, dependents: ["partner", "children"], smoker: true, existingLifeCover: 100000, existingHealthCover: 0, liquidSavings: 40000, debts: 0 });
    // Empty slice: still an input (engine defaults), nothing written.
    expect(buildM2Input({ ...INITIAL_DATA, profile })).toMatchObject({ smoker: false, existingLifeCover: 0 });
  });

  it("draftToPolicy needs all five valid numbers", () => {
    expect(draftToPolicy(EMPTY_POLICY)).toBeNull();
    const full = { annualPremium: 30000, sumAssured: 500000, termYears: 15, yearsPaid: 5, expectedMaturity: 650000 };
    expect(draftToPolicy(full)).toEqual(full);
    expect(draftToPolicy({ ...full, yearsPaid: 16 })).toBeNull();
    expect(draftToPolicy({ ...full, termYears: 0 })).toBeNull();
    expect(draftToPolicy({ ...full, annualPremium: 0 })).toBeNull();
  });
});
