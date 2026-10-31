/**
 * M2 (insurance & health) dictionary coverage: every explain step, note and check key the engine
 * can emit resolves in en and bn; explain placeholders are the step's real input names (+ result);
 * the Bangla m2 copy has no Latin digits.
 */
import { M2_CHECK_KEYS, M2_NOTE_KEYS, M2_STEP_IDS, RATES_SEED, assertSnapshot, computeInsurance, type M2Input } from "@taka/engine";
import { describe, expect, it } from "vitest";
import { bn } from "@/lib/i18n/dictionaries/bn";
import { en } from "@/lib/i18n/dictionaries/en";
import { getPath } from "@/lib/i18n/translate";

const dicts = { en, bn } as const;
type DictName = keyof typeof dicts;
const names = Object.keys(dicts) as DictName[];

const LATIN_DIGIT = /[0-9]/;
const slots = (s: string) => [...new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1] as string))];
const withoutSlots = (s: string) => s.replace(/\{\w+\}/g, "");

function leafPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => leafPaths(v, prefix ? `${prefix}.${k}` : k));
}

function expectString(dict: unknown, key: string, name: string): string {
  const v = getPath(dict, key);
  expect(typeof v, `${name}: ${key} should be a string`).toBe("string");
  expect((v as string).trim().length, `${name}: ${key} should not be empty`).toBeGreaterThan(0);
  return v as string;
}

/** Input names per step, read from a real engine run that emits every step (policy included). */
const stepInputs: Map<string, Set<string>> = (() => {
  const rates = assertSnapshot(RATES_SEED);
  const input: M2Input = {
    age: 35,
    dependents: ["partner", "children", "parents"],
    takeHome: 60000,
    smoker: true,
    liquidSavings: 50000,
    investments: 20000,
    existingLifeCover: 100000,
    debts: 200000,
    educationGoals: 300000,
    existingHealthCover: 50000,
    policy: { annualPremium: 30000, sumAssured: 500000, termYears: 15, yearsPaid: 5, expectedMaturity: 650000 },
  };
  const result = computeInsurance(input, rates, "2026-10-30");
  const map = new Map<string, Set<string>>();
  for (const step of result.explain.steps) map.set(step.id, new Set([...Object.keys(step.inputs), "result"]));
  return map;
})();

describe("M2 engine run", () => {
  it("emits every M2 step id", () => {
    expect([...stepInputs.keys()].sort()).toEqual([...M2_STEP_IDS].sort());
  });
});

describe.each(names)("M2 keys resolve in %s", (name) => {
  const dict = dicts[name];

  it.each([...M2_STEP_IDS])("explain.%s has title and body using only the step's inputs", (id) => {
    expectString(dict, `explain.${id}.title`, name);
    const body = expectString(dict, `explain.${id}.body`, name);
    const allowed = stepInputs.get(id) ?? new Set<string>();
    const unknown = slots(body).filter((s) => !allowed.has(s));
    expect(unknown, `${name}: explain.${id}.body placeholders`).toEqual([]);
  });

  it.each([...M2_NOTE_KEYS, ...M2_CHECK_KEYS])("%s", (key) => {
    expectString(dict, key, name);
  });

  it("check.claimSettlement carries {claimSettlement}", () => {
    expect(slots(expectString(dict, "m2.check.claimSettlement", name))).toContain("claimSettlement");
  });
});

describe("M2 Bangla copy", () => {
  it("bn m2 and explain.m2 contain no Latin digits (placeholders are fine)", () => {
    const offenders = [...leafPaths(bn.m2, "m2"), ...leafPaths(bn.explain.m2, "explain.m2")].filter((k) => LATIN_DIGIT.test(withoutSlots(getPath(bn, k) as string)));
    expect(offenders).toEqual([]);
  });

  it("bn m2 and explain.m2 have the English key set", () => {
    expect(leafPaths(bn.m2).sort()).toEqual(leafPaths(en.m2).sort());
    expect(leafPaths(bn.explain.m2).sort()).toEqual(leafPaths(en.explain.m2).sort());
  });
});
