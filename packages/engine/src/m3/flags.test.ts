import { describe, expect, it } from "vitest";
import { applyOneRedRule, buildFlags, isCarried, statusFromFlags } from "./flags";
import type { DebtFlag } from "./types";

const thresholds = { cardUtilisationAmber: 0.5, emiRatioRed: 0.4 };
const red = (id: DebtFlag["id"], value: number, ref?: string): DebtFlag => ({ id, status: "red", value, demotedFromRed: false, ...(ref ? { ref } : {}) });

describe("isCarried", () => {
  it("needs a positive balance and no pay-in-full", () => {
    expect(isCarried({ balance: 100, paysInFull: false })).toBe(true);
    expect(isCarried({ balance: 100, paysInFull: true })).toBe(false);
    expect(isCarried({ balance: 0, paysInFull: false })).toBe(false);
  });
});

describe("buildFlags", () => {
  it("lists only triggered flags, per card then household", () => {
    const flags = buildFlags(
      {
        cards: [
          { id: "c1", balance: 60000, limit: 100000, paysInFull: false },
          { id: "c2", balance: 20000, limit: 100000, paysInFull: true },
          { id: "c3", balance: 10000, limit: 0, paysInFull: false },
        ],
        emiRatio: 0.45,
        rawCapacity: -2500,
      },
      thresholds,
    );
    expect(flags.map((f) => [f.id, f.ref ?? null, f.status])).toEqual([
      ["card_carried", "c1", "red"],
      ["card_utilisation", "c1", "amber"],
      ["card_carried", "c3", "red"],
      ["emi_ratio", null, "red"],
      ["negative_capacity", null, "red"],
    ]);
    expect(flags[0]?.value).toBe(60000);
    expect(flags[1]?.value).toBeCloseTo(0.6, 10);
    expect(flags[3]?.value).toBe(0.45);
    expect(flags[4]?.value).toBe(2500);
  });

  it("is empty when nothing is triggered", () => {
    expect(buildFlags({ cards: [{ id: "c", balance: 0, limit: 50000, paysInFull: true }], emiRatio: 0.1, rawCapacity: 100 }, thresholds)).toEqual([]);
    expect(buildFlags({ cards: [], emiRatio: 0.4, rawCapacity: 0 }, thresholds)).toEqual([]);
  });
});

describe("applyOneRedRule", () => {
  it("keeps the most severe red and demotes the rest", () => {
    const { flags, primaryFlag } = applyOneRedRule([red("negative_capacity", 5000), red("emi_ratio", 0.5), red("card_carried", 1000, "c")]);
    expect(primaryFlag?.id).toBe("card_carried");
    expect(flags.map((f) => [f.id, f.status, f.demotedFromRed])).toEqual([
      ["negative_capacity", "amber", true],
      ["emi_ratio", "amber", true],
      ["card_carried", "red", false],
    ]);
    expect(flags.filter((f) => f.status === "red")).toHaveLength(1);
  });

  it("breaks ties by the larger value", () => {
    const { flags, primaryFlag } = applyOneRedRule([red("card_carried", 10000, "a"), red("card_carried", 25000, "b"), red("card_carried", 25000, "c")]);
    expect(primaryFlag?.ref).toBe("b");
    expect(flags.map((f) => f.status)).toEqual(["amber", "red", "amber"]);
  });

  it("leaves ambers alone and returns null without reds", () => {
    const amber: DebtFlag = { id: "card_utilisation", status: "amber", value: 0.6, demotedFromRed: false, ref: "c" };
    const out = applyOneRedRule([amber]);
    expect(out.primaryFlag).toBeNull();
    expect(out.flags).toEqual([amber]);
    expect(out.flags[0]).not.toBe(amber);
  });
});

describe("statusFromFlags", () => {
  it("red > amber > green", () => {
    const amber: DebtFlag = { id: "card_utilisation", status: "amber", value: 0.6, demotedFromRed: false };
    const primary = red("emi_ratio", 0.5);
    expect(statusFromFlags([primary, amber], primary)).toBe("red");
    expect(statusFromFlags([amber], null)).toBe("amber");
    expect(statusFromFlags([], null)).toBe("green");
  });
});
