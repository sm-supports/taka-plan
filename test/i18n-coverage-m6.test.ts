/**
 * M6 keys the engine emits resolve in en and bn: every M6 explain step has a title and body whose
 * placeholders are a subset of that step's input names (read from a real engine run) plus {result};
 * note / gate / how-to keys resolve and carry no placeholders (the UI passes none); Bangla copy has
 * no Latin digits.
 */
import { M6_GATE_KEYS, M6_HOWTO_KEYS, M6_NOTE_KEYS, M6_STEP_IDS, RATES_SEED, assertSnapshot, computeAllocation, type M6Input } from "@taka/engine";
import { describe, expect, it } from "vitest";
import { bn } from "@/lib/i18n/dictionaries/bn";
import { en } from "@/lib/i18n/dictionaries/en";
import { getPath } from "@/lib/i18n/translate";

const dicts = { en, bn } as const;
const names = Object.keys(dicts) as (keyof typeof dicts)[];

const slots = (s: string) => [...new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!))].sort();

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

/** One run that emits every step (holdings → m6.trade). */
const SAMPLE: M6Input = {
  age: 30,
  risk: { ageBand: 2, incomeStability: 2, horizon: 1, reaction: 0 },
  horizonYears: 20,
  lumpSum: 1000000,
  monthly: 10000,
  holdings: { equity: 550000, gold: 150000, fixedIncome: 300000 },
  newMoney: 0,
  propertyValue: 2000000,
  gate: { hasEmergencyFund: false, hasCardDebt: true },
};
const result = computeAllocation(SAMPLE, assertSnapshot(RATES_SEED), "2026-10-31");
const inputNames = new Map<string, string[]>(result.explain.steps.map((s) => [s.id, [...Object.keys(s.inputs), "result"]]));

describe("the sample run", () => {
  it("emits every M6 step", () => {
    expect([...inputNames.keys()].sort()).toEqual([...M6_STEP_IDS].sort());
  });
  it("matches the PRD rebalance example", () => {
    expect(result.weights).toEqual({ equity: 0.45, gold: 0.1, fixedIncome: 0.45 });
    expect(result.rebalance?.trades).toEqual({ equity: -100000, gold: -50000, fixedIncome: 150000 });
  });
});

describe.each(names)("M6 keys resolve in %s", (name) => {
  const dict = dicts[name];

  it.each([...M6_STEP_IDS])("explain step %s has title and body with known placeholders", (id) => {
    expectString(dict, `explain.${id}.title`, name);
    const body = expectString(dict, `explain.${id}.body`, name);
    const allowed = inputNames.get(id) ?? [];
    const unknown = slots(body).filter((s) => !allowed.includes(s));
    expect(unknown, `${name}: explain.${id}.body uses placeholders the step does not provide`).toEqual([]);
    expect(slots(expectString(dict, `explain.${id}.title`, name))).toEqual([]);
  });

  it.each([...M6_NOTE_KEYS, ...M6_GATE_KEYS, ...M6_HOWTO_KEYS])("%s", (key) => {
    const v = expectString(dict, key, name);
    expect(slots(v), `${name}: ${key} must not need params`).toEqual([]);
  });

  it("every engine note and how-to key in the sample run resolves", () => {
    for (const k of [...result.notes, ...result.gateWarnings, ...result.instruments.flatMap((c) => c.howToKeys)]) expectString(dict, k, name);
  });

  it("has the profile, bucket and answer labels the screens use", () => {
    for (const p of ["careful", "balanced", "growth"]) expectString(dict, `m6.profile.${p}`, name);
    for (const b of ["equity", "gold", "fixedIncome"]) expectString(dict, `m6.bucket.${b}`, name);
    for (const q of ["ageBand", "incomeStability", "horizon", "reaction"]) for (const a of ["0", "1", "2"]) expectString(dict, `m6.answer.${q}.${a}`, name);
  });
});

describe("M6 Bangla copy", () => {
  const withoutSlots = (s: string) => s.replace(/\{\w+\}/g, "");
  const bnLeaves = [...leafPaths(bn.m6, "m6"), ...leafPaths(bn.explain.m6, "explain.m6")];

  it("has the same key set and placeholders as English", () => {
    const enLeaves = [...leafPaths(en.m6, "m6"), ...leafPaths(en.explain.m6, "explain.m6")].sort();
    expect([...bnLeaves].sort()).toEqual(enLeaves);
    const bad = enLeaves.filter((k) => JSON.stringify(slots(getPath(en, k) as string)) !== JSON.stringify(slots(getPath(bn, k) as string)));
    expect(bad).toEqual([]);
  });

  it("contains no Latin digits", () => {
    expect(bnLeaves.filter((k) => /[0-9]/.test(withoutSlots(getPath(bn, k) as string)))).toEqual([]);
  });

  it("uses the formal আপনি register", () => {
    const informal = /(^|[\s,।;—-])(তুমি|তোমার|তোমাকে|তুই|তোর|তোকে)([\s,।;—-]|$)/;
    expect(bnLeaves.filter((k) => informal.test(getPath(bn, k) as string))).toEqual([]);
  });
});
