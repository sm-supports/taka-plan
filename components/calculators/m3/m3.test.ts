import { RATES_SEED, assertSnapshot } from "@taka/engine";
import { describe, expect, it } from "vitest";
import { engineErrorKey } from "./engineError";
import { parsePercent } from "./percent";
import { DEMO_M3_INPUT, buildDemoM3Result } from "./demo";

const snapshot = assertSnapshot(RATES_SEED);
const TODAY = "2026-10-30";

describe("engineErrorKey", () => {
  it("maps stub, missing-rate, invalid-input and unknown errors", () => {
    expect(engineErrorKey(new Error("boom"))).toBe("errors.generic");
    expect(engineErrorKey(Object.assign(new Error("not implemented: computeDebtHealth"), { name: "EngineError", code: "INVALID_INPUT" }))).toBe("errors.engineNotReady");
    expect(engineErrorKey(Object.assign(new Error("x"), { name: "EngineError", code: "MISSING_RATE" }))).toBe("errors.missingRate");
    expect(engineErrorKey(Object.assign(new Error("x"), { name: "EngineError", code: "INVALID_INPUT" }))).toBe("errors.invalidInput");
  });
});

describe("parsePercent", () => {
  it("accepts Latin and Bangla digits, strips %, rejects out-of-range", () => {
    expect(parsePercent("12")).toBe(0.12);
    expect(parsePercent("12.5 %")).toBe(0.125);
    expect(parsePercent("১২")).toBe(0.12);
    expect(parsePercent("")).toBeNull();
    expect(parsePercent("abc")).toBeNull();
    expect(parsePercent("150")).toBeNull();
  });
});

describe("demo M3 fixture", () => {
  const r = buildDemoM3Result(DEMO_M3_INPUT, snapshot, TODAY);
  it("follows the contract: one red, demoted reds amber, step ids match M3_STEP_IDS", () => {
    expect(r.flags.filter((f) => f.status === "red")).toHaveLength(1);
    expect(r.primaryFlag?.id).toBe("card_carried");
    expect(r.flags.find((f) => f.id === "emi_ratio")).toMatchObject({ status: "amber", demotedFromRed: true });
    expect(r.flags.find((f) => f.id === "card_utilisation")).toMatchObject({ status: "amber", demotedFromRed: false });
    expect(r.explain.steps.map((s) => s.id)).toEqual(["m3.totalEmi", "m3.emiRatio", "m3.capacity", "m3.maxLoan", "m3.scenarioEmi", "m3.interestSaved"]);
    expect(r.totalEmi).toBe(29800);
    expect(r.emiCapacity).toBe(34500);
    expect(r.headroom).toBe(4700);
    expect(r.maxAffordableLoan % 500).toBe(0);
    expect(r.scenario.emi % 100).toBe(0);
    expect(r.avalanche.totalInterest).toBeLessThanOrEqual(r.snowball.totalInterest);
    expect(r.interestSaved).toBe(r.snowball.totalInterest - r.avalanche.totalInterest);
    expect(r.avalanche.order).toEqual(["demo-c1", "demo-l1", "demo-l2"]);
    expect(r.snowball.order).toEqual(["demo-c1", "demo-l2", "demo-l1"]);
    expect(r.debtTrapPath).toHaveLength(5);
  });
  it("reproduces the PRD vector: ৳20,000 headroom at 12% over 60 months ≈ 9.0 lakh", () => {
    const v = buildDemoM3Result({ takeHome: 100000, essentials: 55000, savingsTarget: 20000, loans: [], cards: [], scenario: { annualRate: 0.12, months: 60 } }, snapshot, TODAY);
    expect(v.headroom).toBe(20000);
    expect(v.maxAffordableLoan).toBe(899000);
    expect(v.scenario.emi).toBe(20000);
    expect(v.status).toBe("green");
    expect(v.flags).toEqual([]);
  });
});
