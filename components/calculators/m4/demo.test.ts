/** The M4 demo fixtures are the engine run over the contract vectors. */
import { describe, expect, it } from "vitest";
import { M4_STEP_IDS, RATES_SEED, assertSnapshot, computeSaveFirst } from "@taka/engine";
import { bn } from "@/lib/i18n/dictionaries/bn";
import { en } from "@/lib/i18n/dictionaries/en";
import { getPath, translate } from "@/lib/i18n/translate";
import { createFormatters } from "@/lib/i18n/useFormat";
import { formatStepParams } from "@/components/explain/formatInputs";
import { M4_DEMO_INPUT, m4DemoInput, m4DemoResult } from "./demo";

const snapshot = assertSnapshot(RATES_SEED);
const today = "2026-10-30";
const slots = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!);

describe("m4 demo fixtures", () => {
  it.each(["salaried", "freelance"] as const)("%s variant matches the contract vector and the step ids", (variant) => {
    const r = m4DemoResult(snapshot, today, variant);
    expect(r).toEqual(computeSaveFirst(m4DemoInput(variant), snapshot, today));
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
        const params = formatStepParams(step, f, (id) => id);
        for (const dict of [en, bn]) {
          const body = getPath(dict, `explain.${step.id}.body`) as string;
          for (const slot of slots(body)) expect(params, `${step.id} needs {${slot}}`).toHaveProperty(slot);
          expect(translate(dict, `explain.${step.id}.body`, params)).not.toMatch(/\{\w+\}/);
        }
      }
    }
  });
});
