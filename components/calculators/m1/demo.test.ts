/** The M1 demo fixture must look exactly like what the engine will return, and the local suggestion must match the contract vectors. */
import { describe, expect, it } from "vitest";
import { M1_NEXT_KEYS, M1_RULE_KEYS, M1_STEP_IDS, RATES_SEED, assertSnapshot } from "@taka/engine";
import { bn } from "@/lib/i18n/dictionaries/bn";
import { en } from "@/lib/i18n/dictionaries/en";
import { getPath, translate } from "@/lib/i18n/translate";
import { createFormatters } from "@/lib/i18n/useFormat";
import { stepParams } from "../shared/explainFormat";
import { M1_DEMO_INPUT, m1DemoResult } from "./demo";
import { defaultBuildMonths, monthsBounds, suggestMonthsLocal } from "./suggest";

const snapshot = assertSnapshot(RATES_SEED);
const today = "2026-10-30";
const slots = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!);

describe("m1 demo fixture", () => {
  const r = m1DemoResult(snapshot, today);

  it("matches the contract vector", () => {
    expect(r.months).toBe(10);
    expect(r.target).toBe(250000);
    expect(r.monthlySaving).toBe(16700);
    expect(r.monthsCovered).toBe(2);
    expect(r.tiers.banksNeeded).toBe(2);
    expect(r.status).toBe("amber");
  });

  it("carries exactly the M1 step ids, in order, and known rule/next keys", () => {
    expect(r.explain.steps.map((s) => s.id)).toEqual([...M1_STEP_IDS]);
    for (const k of r.rules) expect(M1_RULE_KEYS).toContain(k);
    expect(M1_NEXT_KEYS).toContain(r.nextStep);
  });

  it("supplies every placeholder each explain template uses, in both locales", () => {
    const f = createFormatters("en");
    for (const step of r.explain.steps) {
      const params = stepParams(step, f, (id) => id);
      for (const dict of [en, bn]) {
        const body = getPath(dict, `explain.${step.id}.body`) as string;
        for (const slot of slots(body)) expect(params, `${step.id} needs {${slot}}`).toHaveProperty(slot);
        expect(translate(dict, `explain.${step.id}.body`, params)).not.toMatch(/\{\w+\}/);
      }
    }
  });

  it("records real rates rows as assumptions", () => {
    expect(r.explain.assumptions.map((a) => a.key)).toContain("deposit_insurance_limit");
    expect(r.explain.assumptions.every((a) => typeof a.asOf === "string" && a.sourceName.length > 0)).toBe(true);
  });
});

describe("suggestMonthsLocal", () => {
  it("reproduces the PRD vectors from the rates snapshot", () => {
    expect(suggestMonthsLocal(M1_DEMO_INPUT, snapshot)).toBe(10);
    expect(suggestMonthsLocal({ incomeType: "freelance", dependents: [], soleEarner: true, hasHealthInsurance: false }, snapshot)).toBe(11);
    expect(suggestMonthsLocal({ incomeType: "freelance", dependents: ["partner"], soleEarner: true, hasHealthInsurance: false }, snapshot)).toBe(13);
    expect(suggestMonthsLocal({ incomeType: "business", dependents: ["children"], soleEarner: true, hasHealthInsurance: false }, snapshot)).toBe(13);
    expect(suggestMonthsLocal({ incomeType: "salaried", dependents: [], soleEarner: false, hasHealthInsurance: true }, snapshot)).toBe(6);
  });

  it("never exceeds the snapshot bounds", () => {
    const { min, max } = monthsBounds(snapshot);
    expect(min).toBe(3);
    expect(max).toBe(15);
    expect(suggestMonthsLocal({ incomeType: "freelance", dependents: ["partner", "children"], soleEarner: true, hasHealthInsurance: false }, snapshot)).toBeLessThanOrEqual(max);
    expect(defaultBuildMonths(snapshot)).toBe(12);
  });
});
