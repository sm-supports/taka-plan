import { describe, expect, it } from "vitest";
import seed from "../data/rates.seed.json";
import { assertSnapshot } from "../rates";
import { EngineError } from "../types";
import { computeSaveFirst } from "./save-first";
import { M4_NOTE_KEYS, M4_STEP_IDS, type M4Input } from "./types";

const rates = assertSnapshot(seed);
const today = "2026-10-30";

const salaried = (over: Partial<M4Input> = {}): M4Input => ({ takeHome: 50000, essentials: 30000, incomeType: "salaried", ...over });

describe("computeSaveFirst", () => {
  it("50 000 / 30 000 salaried → 20% suggested, 10 000 saved, 40 000 to spend, green, fixed DPS", () => {
    const r = computeSaveFirst(salaried(), rates, today);
    expect(r.averageIncome).toBe(50000);
    expect(r.feasibleRate).toBeCloseTo(0.4, 9);
    expect(r.suggestedRate).toBeCloseTo(0.2, 9);
    expect(r.savingsRate).toBeCloseTo(0.2, 9);
    expect(r.savingsAmount).toBe(10000);
    expect(r.expensesAllowed).toBe(40000);
    expect(r.essentialsShortfall).toBe(0);
    expect(r.status).toBe("green");
    expect(r.mode).toBe("fixed");
    expect(r.percentOfEachPayment).toBeUndefined();
    expect(r.instrument).toBe("dps");
    expect(r.transferDay).toBeNull();
  });

  it("50 000 / 45 000 → feasible 10%, 5 000 saved, amber (squeezed below the suggestion)", () => {
    const r = computeSaveFirst(salaried({ essentials: 45000 }), rates, today);
    expect(r.feasibleRate).toBeCloseTo(0.1, 9);
    expect(r.suggestedRate).toBeCloseTo(0.1, 9);
    expect(r.savingsRate).toBeCloseTo(0.1, 9);
    expect(r.savingsAmount).toBe(5000);
    expect(r.expensesAllowed).toBe(45000);
    expect(r.status).toBe("amber");
  });

  it("50 000 / 50 000 → nothing feasible, 0 saved, red", () => {
    const r = computeSaveFirst(salaried({ essentials: 50000 }), rates, today);
    expect(r.feasibleRate).toBe(0);
    expect(r.suggestedRate).toBe(0);
    expect(r.savingsAmount).toBe(0);
    expect(r.expensesAllowed).toBe(50000);
    expect(r.essentialsShortfall).toBe(0);
    expect(r.status).toBe("red");
  });

  it("essentials above income → red with the shortfall reported", () => {
    const r = computeSaveFirst(salaried({ essentials: 60000 }), rates, today);
    expect(r.feasibleRate).toBe(0);
    expect(r.savingsAmount).toBe(0);
    expect(r.essentialsShortfall).toBe(10000);
    expect(r.status).toBe("red");
  });

  it("freelancer [40,60,30,70,50,50]k, essentials 30 000 → avg 50 000, 20% of each payment, 10 000", () => {
    const r = computeSaveFirst(
      { takeHome: 45000, essentials: 30000, incomeType: "freelance", last6Incomes: [40000, 60000, 30000, 70000, 50000, 50000] },
      rates,
      today,
    );
    expect(r.averageIncome).toBe(50000);
    expect(r.mode).toBe("percentOfEachPayment");
    expect(r.percentOfEachPayment).toBeCloseTo(0.2, 9);
    expect(r.savingsRate).toBeCloseTo(0.2, 9);
    expect(r.savingsAmount).toBe(10000);
    expect(r.expensesAllowed).toBe(40000);
    expect(r.status).toBe("green");
    const avg = r.explain.steps.find((s) => s.id === "m4.average");
    expect(avg?.inputs).toEqual({ months: 6, total: 300000 });
    expect(avg?.rounded).toBe(50000);
  });

  it("business income uses percentOfEachPayment too; an empty history falls back to take-home", () => {
    const r = computeSaveFirst({ takeHome: 80000, essentials: 40000, incomeType: "business", last6Incomes: [] }, rates, today);
    expect(r.averageIncome).toBe(80000);
    expect(r.mode).toBe("percentOfEachPayment");
    expect(r.percentOfEachPayment).toBeCloseTo(0.2, 9);
    expect(r.savingsAmount).toBe(16000);
  });

  it("average of irregular incomes is rounded to the taka at the boundary", () => {
    const r = computeSaveFirst({ takeHome: 0, essentials: 10000, incomeType: "freelance", last6Incomes: [30000, 30001, 30001] }, rates, today);
    expect(r.averageIncome).toBe(30001);
    const avg = r.explain.steps.find((s) => s.id === "m4.average");
    expect(avg?.raw).toBeCloseTo(30000.6667, 3);
    expect(avg?.rounded).toBe(30001);
  });

  it("payday 31 → transfer day 1; payday 15 → 16", () => {
    expect(computeSaveFirst(salaried({ payday: 31 }), rates, today).transferDay).toBe(1);
    expect(computeSaveFirst(salaried({ payday: 15 }), rates, today).transferDay).toBe(16);
    expect(computeSaveFirst(salaried({ payday: 1 }), rates, today).transferDay).toBe(2);
  });

  it("user rate 30% with feasible 40% → 15 000, green (not below the suggestion)", () => {
    const r = computeSaveFirst(salaried({ savingsRate: 0.3 }), rates, today);
    expect(r.feasibleRate).toBeCloseTo(0.4, 9);
    expect(r.savingsRate).toBeCloseTo(0.3, 9);
    expect(r.savingsAmount).toBe(15000);
    expect(r.expensesAllowed).toBe(35000);
    expect(r.status).toBe("green");
  });

  it("user rate below the suggestion → amber; user rate above feasible is capped at feasible", () => {
    const low = computeSaveFirst(salaried({ savingsRate: 0.1 }), rates, today);
    expect(low.savingsRate).toBeCloseTo(0.1, 9);
    expect(low.savingsAmount).toBe(5000);
    expect(low.status).toBe("amber");

    const high = computeSaveFirst(salaried({ savingsRate: 0.9 }), rates, today);
    expect(high.savingsRate).toBeCloseTo(0.4, 9);
    expect(high.savingsAmount).toBe(20000);
    expect(high.expensesAllowed).toBe(30000);
    expect(high.essentialsShortfall).toBe(0);
    expect(high.status).toBe("green");
  });

  it("explanation step ids equal M4_STEP_IDS, carry the template inputs, use the default-rate assumption and the DPS note", () => {
    for (const input of [salaried(), salaried({ incomeType: "freelance", last6Incomes: [40000, 60000] })]) {
      const r = computeSaveFirst(input, rates, today);
      expect(r.explain.steps.map((s) => s.id)).toEqual([...M4_STEP_IDS]);
      const byId = Object.fromEntries(r.explain.steps.map((s) => [s.id, s]));
      expect(Object.keys(byId["m4.average"]!.inputs).sort()).toEqual(["months", "total"]);
      expect(Object.keys(byId["m4.feasible"]!.inputs).sort()).toEqual(["average", "essentials"]);
      expect(Object.keys(byId["m4.amount"]!.inputs).sort()).toEqual(["average", "rate"]);
      expect(Object.keys(byId["m4.expenses"]!.inputs).sort()).toEqual(["average", "savings"]);
      expect(byId["m4.feasible"]!.unit).toBe("rate");
      expect(byId["m4.amount"]!.unit).toBe("bdt");
      expect(r.explain.assumptions.map((a) => a.key)).toEqual(["savings_rate_default"]);
      expect(r.explain.assumptions[0]?.isAppAssumption).toBe(true);
      expect(r.explain.notes).toEqual([...M4_NOTE_KEYS]);
    }
  });

  it("feasible step is rounded to 1 dp of a percent", () => {
    const r = computeSaveFirst(salaried({ takeHome: 30000, essentials: 20000 }), rates, today);
    const feasible = r.explain.steps.find((s) => s.id === "m4.feasible");
    expect(feasible?.raw).toBeCloseTo(1 / 3, 12);
    expect(feasible?.rounded).toBe(0.333);
  });

  it("does not mutate its input", () => {
    const input = salaried({ last6Incomes: [1, 2, 3], payday: 5 });
    const copy = structuredClone(input);
    computeSaveFirst(input, rates, today);
    expect(input).toEqual(copy);
  });

  describe("invalid inputs throw INVALID_INPUT", () => {
    const cases: Array<[string, M4Input]> = [
      ["zero income", salaried({ takeHome: 0 })],
      ["negative take-home", salaried({ takeHome: -1 })],
      ["NaN take-home", salaried({ takeHome: Number.NaN })],
      ["negative essentials", salaried({ essentials: -5 })],
      ["negative savings rate", salaried({ savingsRate: -0.1 })],
      ["savings rate above 1", salaried({ savingsRate: 1.5 })],
      ["payday 0", salaried({ payday: 0 })],
      ["payday 32", salaried({ payday: 32 })],
      ["fractional payday", salaried({ payday: 2.5 })],
      ["negative income in history", salaried({ incomeType: "freelance", last6Incomes: [40000, -1] })],
      ["all-zero history", salaried({ incomeType: "freelance", last6Incomes: [0, 0, 0] })],
      ["unknown income type", { ...salaried(), incomeType: "pension" as M4Input["incomeType"] }],
    ];
    for (const [name, input] of cases) {
      it(name, () => {
        let caught: unknown;
        try {
          computeSaveFirst(input, rates, today);
        } catch (e) {
          caught = e;
        }
        expect(caught).toBeInstanceOf(EngineError);
        expect((caught as EngineError).code).toBe("INVALID_INPUT");
      });
    }
  });
});
