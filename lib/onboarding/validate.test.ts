import { describe, expect, it } from "vitest";
import {
  AGE_MAX,
  AGE_MIN,
  averageOfFilled,
  choicesToDependents,
  clampStep,
  decadeForAge,
  dependentsToChoices,
  firstIncompleteStep,
  parseAgeInput,
  parseStep,
  validateAge,
  validateEssentials,
  validateStep,
  validateTakeHome,
  withProfileDefaults,
} from "./validate";

describe("parseStep", () => {
  it("accepts 1..5 and rejects everything else", () => {
    expect(parseStep("1")).toBe(1);
    expect(parseStep("5")).toBe(5);
    expect(parseStep(["3"])).toBe(3);
    expect(parseStep("0")).toBeNull();
    expect(parseStep("6")).toBeNull();
    expect(parseStep("2.5")).toBeNull();
    expect(parseStep("abc")).toBeNull();
    expect(parseStep("")).toBeNull();
    expect(parseStep(undefined)).toBeNull();
    expect(parseStep("01")).toBeNull();
  });
});

describe("age", () => {
  it("parses Latin and Bangla digits", () => {
    expect(parseAgeInput("30")).toBe(30);
    expect(parseAgeInput("৩০")).toBe(30);
    expect(parseAgeInput(" 42 ")).toBe(42);
    expect(parseAgeInput("")).toBeNull();
    expect(parseAgeInput("3a")).toBeNull();
    expect(parseAgeInput("1000")).toBeNull();
  });

  it("validates the 15..100 range", () => {
    expect(validateAge(null)).toEqual({ ok: false, error: "required" });
    expect(validateAge(AGE_MIN - 1)).toEqual({ ok: false, error: "ageRange" });
    expect(validateAge(AGE_MAX + 1)).toEqual({ ok: false, error: "ageRange" });
    expect(validateAge(30.5)).toEqual({ ok: false, error: "number" });
    expect(validateAge(AGE_MIN).ok).toBe(true);
    expect(validateAge(AGE_MAX).ok).toBe(true);
    expect(validateAge(30).ok).toBe(true);
  });

  it("maps an age to its decade shortcut", () => {
    expect(decadeForAge(18)).toBe("under20");
    expect(decadeForAge(25)).toBe("twenties");
    expect(decadeForAge(39)).toBe("thirties");
    expect(decadeForAge(60)).toBe("sixtyPlus");
    expect(decadeForAge(100)).toBe("sixtyPlus");
    expect(decadeForAge(10)).toBeNull();
    expect(decadeForAge(null)).toBeNull();
  });
});

describe("money questions", () => {
  it("take-home must be a positive number", () => {
    expect(validateTakeHome(null)).toEqual({ ok: false, error: "required" });
    expect(validateTakeHome(0)).toEqual({ ok: false, error: "positiveAmount" });
    expect(validateTakeHome(-5)).toEqual({ ok: false, error: "positiveAmount" });
    expect(validateTakeHome(45000).ok).toBe(true);
  });

  it("essentials above take-home is a warning, not a block", () => {
    expect(validateEssentials(null, 50000)).toEqual({ ok: false, error: "required" });
    expect(validateEssentials(0, 50000)).toEqual({ ok: false, error: "positiveAmount" });
    expect(validateEssentials(30000, 50000)).toEqual({ ok: true });
    expect(validateEssentials(50000, 50000)).toEqual({ ok: true });
    expect(validateEssentials(60000, 50000)).toEqual({ ok: true, warning: "essentialsAboveIncome" });
    expect(validateEssentials(60000, undefined)).toEqual({ ok: true });
  });
});

describe("dependents", () => {
  it("shows [] as none and undefined as nothing picked", () => {
    expect(dependentsToChoices(undefined)).toEqual([]);
    expect(dependentsToChoices([])).toEqual(["none"]);
    expect(dependentsToChoices(["children"])).toEqual(["children"]);
  });

  it("none clears the others and a real pick drops none", () => {
    expect(choicesToDependents(["partner", "children"], ["partner", "children", "none"])).toEqual([]);
    expect(choicesToDependents(["none"], ["none", "parents"])).toEqual(["parents"]);
    expect(choicesToDependents(["parents"], ["parents", "partner"])).toEqual(["partner", "parents"]);
    expect(choicesToDependents(["partner", "parents"], ["parents"])).toEqual(["parents"]);
  });
});

describe("step flow", () => {
  it("validateStep and firstIncompleteStep walk the five questions", () => {
    expect(firstIncompleteStep({})).toBe(1);
    expect(firstIncompleteStep({ age: 30 })).toBe(2);
    expect(firstIncompleteStep({ age: 30, incomeType: "salaried" })).toBe(2);
    expect(firstIncompleteStep({ age: 30, incomeType: "salaried", takeHome: 50000 })).toBe(3);
    expect(firstIncompleteStep({ age: 30, incomeType: "salaried", takeHome: 50000, essentials: 30000 })).toBe(4);
    expect(firstIncompleteStep({ age: 30, incomeType: "salaried", takeHome: 50000, essentials: 30000, dependents: [] })).toBe(5);
    const full = { age: 30, incomeType: "salaried" as const, takeHome: 50000, essentials: 30000, dependents: [], hasDebt: false };
    expect(firstIncompleteStep(full)).toBeNull();
    expect(validateStep(3, { ...full, essentials: 80000 })).toEqual({ ok: true, warning: "essentialsAboveIncome" });
  });

  it("clampStep never lets a visitor skip past an unanswered question", () => {
    expect(clampStep(5, {})).toBe(1);
    expect(clampStep(4, { age: 30, incomeType: "freelance", takeHome: 90000 })).toBe(3);
    expect(clampStep(2, { age: 30 })).toBe(2);
    expect(clampStep(1, { age: 30, incomeType: "salaried", takeHome: 1, essentials: 1, dependents: [], hasDebt: true })).toBe(1);
  });

  it("withProfileDefaults fills everything except income and spending", () => {
    expect(withProfileDefaults({})).toEqual({ age: 30, incomeType: "salaried", dependents: [], hasDebt: false });
    expect(withProfileDefaults({ age: 44, dependents: ["partner"] })).toEqual({ age: 44, incomeType: "salaried", dependents: ["partner"], hasDebt: false });
    expect(withProfileDefaults({ takeHome: 1 }).takeHome).toBe(1);
    expect(withProfileDefaults({}).essentials).toBeUndefined();
  });
});

describe("averageOfFilled", () => {
  it("averages only the months that were filled in", () => {
    expect(averageOfFilled([40000, 60000, 30000, 70000, 50000, 50000])).toBe(50000);
    expect(averageOfFilled([null, 60000, null, null, null, 30000])).toBe(45000);
    expect(averageOfFilled([null, null, null, null, null, null])).toBeNull();
    expect(averageOfFilled([10000, 10001, null])).toBe(10001);
  });
});
