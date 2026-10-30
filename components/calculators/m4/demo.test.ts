/** The M4 demo fixtures must look exactly like what the engine will return, and the local suggestion must match the contract vectors. */
import { describe, expect, it } from "vitest";
import { M4_STEP_IDS, RATES_SEED, assertSnapshot } from "@taka/engine";
import { bn } from "@/lib/i18n/dictionaries/bn";
import { en } from "@/lib/i18n/dictionaries/en";
import { getPath, translate } from "@/lib/i18n/translate";
import { createFormatters } from "@/lib/i18n/useFormat";
import { stepParams } from "../shared/explainFormat";
import { M4_DEMO_INPUT, M4_DEMO_INPUT_FREELANCE, m4DemoResult } from "./demo";
import { averageIncomeLocal, feasibleRateLocal, suggestedRateLocal } from "./suggest";

const snapshot = assertSnapshot(RATES_SEED);
const today = "2026-10-30";
const slots = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!);

describe("m4 demo fixtures", () => {
  it.each(["salaried", "freelance"] as const)("%s variant matches the contract vector and the step ids", (variant) => {
    const r = m4DemoResult(snapshot, today, variant);
    expect(r.averageIncome).toBe(50000);
    expect(r.savingsAmount).toBe(10000);
    expect(r.expensesAllowed).toBe(40000);
    expect(r.averageIncome - r.savingsAmount).toBe(r.expensesAllowed);
    expect(r.mode).toBe(variant === "freelance" ? "percentOfEachPayment" : "fixed");
    expect(r.instrument).toBe("dps");
    expect(r.explain.steps.map((s) => s.id)).toEqual([...M4_STEP_IDS]);
  });

  it("salaried transfer day is payday + 1; freelancer has none", () => {
    expect(m4DemoResult(snapshot, today, "salaried").transferDay).toBe((M4_DEMO_INPUT.payday ?? 0) + 1);
    expect(m4DemoResult(snapshot, today, "freelance").transferDay).toBeNull();
    expect(m4DemoResult(snapshot, today, "freelance").percentOfEachPayment).toBe(0.2);
  });

  it("supplies every placeholder each explain template uses, in both locales", () => {
    const f = createFormatters("bn");
    for (const variant of ["salaried", "freelance"] as const) {
      for (const step of m4DemoResult(snapshot, today, variant).explain.steps) {
        const params = stepParams(step, f, (id) => id);
        for (const dict of [en, bn]) {
          const body = getPath(dict, `explain.${step.id}.body`) as string;
          for (const slot of slots(body)) expect(params, `${step.id} needs {${slot}}`).toHaveProperty(slot);
          expect(translate(dict, `explain.${step.id}.body`, params)).not.toMatch(/\{\w+\}/);
        }
      }
    }
  });
});

describe("local savings-rate suggestion", () => {
  it("50,000 / 30,000 → 20% (the default, feasible 40%)", () => {
    expect(feasibleRateLocal(M4_DEMO_INPUT)).toBeCloseTo(0.4);
    expect(suggestedRateLocal(M4_DEMO_INPUT, snapshot)).toBeCloseTo(0.2);
  });

  it("50,000 / 45,000 → squeezed to 10%", () => {
    const squeezed = { takeHome: 50000, essentials: 45000 };
    expect(suggestedRateLocal(squeezed, snapshot)).toBeCloseTo(0.1);
  });

  it("freelancer average 50,000 from the six incomes; nothing feasible when essentials eat it all", () => {
    expect(averageIncomeLocal(M4_DEMO_INPUT_FREELANCE)).toBe(50000);
    expect(suggestedRateLocal(M4_DEMO_INPUT_FREELANCE, snapshot)).toBeCloseTo(0.2);
    expect(suggestedRateLocal({ takeHome: 30000, essentials: 30000 }, snapshot)).toBe(0);
    expect(suggestedRateLocal({ takeHome: 0, essentials: 0 }, snapshot)).toBe(0);
  });
});
