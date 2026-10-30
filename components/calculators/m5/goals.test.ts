import { RATES_SEED, assertSnapshot } from "@taka/engine";
import { describe, expect, it } from "vitest";
import { DEMO_M5_INPUT, buildDemoM5Result } from "./demo";
import { EMPTY_DRAFT, applyOneRed, draftToGoal, isValidDraft } from "./goals";

const snapshot = assertSnapshot(RATES_SEED);
const TODAY = "2026-10-30";

describe("isValidDraft (PRD: a goal needs name, cost and years)", () => {
  it("rejects a blank name, a missing or zero cost and years outside 1–40", () => {
    expect(isValidDraft(EMPTY_DRAFT)).toBe(false);
    expect(isValidDraft({ ...EMPTY_DRAFT, name: "Bike" })).toBe(false);
    expect(isValidDraft({ ...EMPTY_DRAFT, name: "Bike", cost: 0 })).toBe(false);
    expect(isValidDraft({ ...EMPTY_DRAFT, name: "   ", cost: 1000 })).toBe(false);
    expect(isValidDraft({ ...EMPTY_DRAFT, name: "Bike", cost: 1000, years: 0 })).toBe(false);
    expect(isValidDraft({ ...EMPTY_DRAFT, name: "Bike", cost: 1000, years: 41 })).toBe(false);
    expect(isValidDraft({ ...EMPTY_DRAFT, name: "Bike", cost: 1000, years: 2.5 })).toBe(false);
    expect(isValidDraft({ ...EMPTY_DRAFT, name: "Bike", cost: 1000, years: 2 })).toBe(true);
  });
  it("draftToGoal trims the name and keeps the id", () => {
    expect(draftToGoal({ name: " Bike ", cost: 250000, years: 2, type: "vehicle" }, "g-1")).toEqual({ id: "g-1", name: "Bike", cost: 250000, years: 2, type: "vehicle" });
  });
});

describe("applyOneRed", () => {
  it("keeps the first red and demotes later reds to amber with the caption flag", () => {
    expect(applyOneRed(["green", "red", "amber", "red"])).toEqual([
      { status: "green", demotedFromRed: false },
      { status: "red", demotedFromRed: false },
      { status: "amber", demotedFromRed: false },
      { status: "amber", demotedFromRed: true },
    ]);
    expect(applyOneRed([])).toEqual([]);
  });
});

describe("demo M5 fixture", () => {
  const r = buildDemoM5Result(DEMO_M5_INPUT, snapshot, TODAY);
  it("follows the contract: horizon, candidates, step ids, totals, notes", () => {
    const [edu, bike] = r.goals;
    expect(edu?.horizon).toBe("long");
    expect(edu?.candidates).toEqual(["sanchayapatra_5y", "tbond_10y"]);
    expect(edu?.instrument).toBe("sanchayapatra_5y");
    expect(edu?.inflation).toBe(0.1);
    expect(edu?.futureValue).toBe(3890500);
    expect(edu?.belowInflation).toBe(false);
    expect(edu?.status).toBe("green");
    expect(edu?.explain.notes).toEqual(["m5.note.noAllocationYet"]);
    expect(edu?.explain.steps.map((s) => s.id)).toEqual(["m5.fv", "m5.rate", "m5.monthly", "m5.real"]);
    expect(bike?.horizon).toBe("short");
    expect(bike?.instrument).toBe("dps");
    expect(bike?.belowInflation).toBe(true);
    expect(bike?.status).toBe("red");
    expect(bike?.explain.notes).toEqual(["m5.note.belowInflation"]);
    expect(r.totalMonthly).toBe((edu?.monthly.base ?? 0) + (bike?.monthly.base ?? 0));
    expect(r.usesAllocation).toBe(false);
  });
  it("reproduces the PRD vector: 5 lakh in 5 years at 8% → FV 7,34,500 and ~9,300 a month via Sanchayapatra", () => {
    const v = buildDemoM5Result({ age: 30, goals: [{ id: "g", name: "Test", cost: 500000, years: 5, type: "general" }] }, snapshot, TODAY);
    const g = v.goals[0];
    expect(g?.futureValue).toBe(734500);
    expect(g?.instrument).toBe("sanchayapatra_5y");
    expect(g?.monthly.base).toBe(9300);
    expect(Math.round((g?.real ?? 0) * 1000) / 1000).toBe(0.021);
  });
});
