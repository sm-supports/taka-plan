/**
 * M7 keys the engine can emit resolve in en and bn: one explain {title, body} per M7_STEP_IDS entry
 * whose placeholders are a subset of the step's input names (as the engine sends them, across the
 * working and retired paths) plus {result}; every M7_NOTE_KEYS and M7_OPTION_KEYS entry is a
 * non-empty string without placeholders (the WhyDrawer shows notes without params). Bangla m7 copy
 * has no Latin digits and uses আপনি.
 */
import { M7_NOTE_KEYS, M7_OPTION_KEYS, M7_STEP_IDS, RATES_SEED, assertSnapshot, computeRetirement, type M7Input } from "@taka/engine";
import { describe, expect, it } from "vitest";
import { bn } from "@/lib/i18n/dictionaries/bn";
import { en } from "@/lib/i18n/dictionaries/en";
import { getPath } from "@/lib/i18n/translate";

const dicts = { en, bn } as const;
const names = Object.keys(dicts) as (keyof typeof dicts)[];
const slots = (s: string) => [...new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!))];

function leafPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => leafPaths(v, prefix ? `${prefix}.${k}` : k));
}

/** Input names each step sends, gathered by running the engine on both paths with every source. */
function stepInputNames(): Map<string, Set<string>> {
  const snapshot = assertSnapshot(RATES_SEED);
  const today = "2026-10-30";
  const working: M7Input = {
    mode: "working",
    age: 30,
    sex: "female",
    retirementAge: 60,
    monthlySpending: 40_000,
    savings: 100_000,
    monthlySaving: 5_000,
    sources: {
      providentFund: { balance: 100_000, monthlyContribution: 5_000, rate: 0.09 },
      gratuity: { yearsOfService: 25, basicMonthly: 40_000 },
      publicPension: { monthlyContribution: 2_000 },
      fixedPensionMonthly: 3_000,
      rentMonthly: 5_000,
      oldAgeAllowanceEligible: true,
      familySupportMonthly: 2_000,
    },
  };
  const retired: M7Input = { mode: "retired", age: 62, monthlySpending: 40_000, savings: 5_000_000, monthlySaving: 0, otherMonthlyIncome: 5_000, retireeType: "government" };
  const out = new Map<string, Set<string>>();
  for (const input of [working, retired, { ...working, sources: undefined }]) {
    for (const step of computeRetirement(input, snapshot, today).explain.steps) {
      const set = out.get(step.id) ?? new Set<string>();
      for (const k of Object.keys(step.inputs)) set.add(k);
      out.set(step.id, set);
    }
  }
  return out;
}

const inputs = stepInputNames();

describe("the engine emits every M7 step", () => {
  it.each([...M7_STEP_IDS])("%s", (id) => {
    expect(inputs.has(id), `${id} not emitted by the sample inputs`).toBe(true);
  });
});

describe.each(names)("m7 keys resolve in %s", (name) => {
  const dict = dicts[name];

  it.each([...M7_STEP_IDS])("explain step %s: title and body, placeholders ⊆ input names + result", (id) => {
    const title = getPath(dict, `explain.${id}.title`);
    const body = getPath(dict, `explain.${id}.body`);
    expect(typeof title).toBe("string");
    expect(typeof body).toBe("string");
    expect((title as string).trim().length).toBeGreaterThan(0);
    expect((body as string).trim().length).toBeGreaterThan(0);
    expect(slots(title as string), `${id} title takes no params`).toEqual([]);
    const allowed = new Set([...(inputs.get(id) ?? []), "result"]);
    const extra = slots(body as string).filter((s) => !allowed.has(s));
    expect(extra, `${name} explain.${id}.body`).toEqual([]);
  });

  it.each([...M7_NOTE_KEYS, ...M7_OPTION_KEYS])("%s is a string without placeholders", (key) => {
    const v = getPath(dict, key);
    expect(typeof v, key).toBe("string");
    expect((v as string).trim().length).toBeGreaterThan(0);
    expect(slots(v as string)).toEqual([]);
  });

  it("explain.m7 has exactly one entry per step", () => {
    const keys = Object.keys(getPath(dict, "explain.m7") as object).sort();
    expect(keys).toEqual(M7_STEP_IDS.map((id) => id.split(".")[1]!).sort());
  });
});

describe("Bangla m7 copy", () => {
  const LATIN_DIGIT = /[0-9]/;
  const withoutSlots = (s: string) => s.replace(/\{\w+\}/g, "");
  const bnLeaves = [...leafPaths(bn.m7, "m7"), ...leafPaths(bn.explain.m7, "explain.m7")];

  it("has no Latin digits (placeholders are fine)", () => {
    expect(bnLeaves.filter((k) => LATIN_DIGIT.test(withoutSlots(getPath(bn, k) as string)))).toEqual([]);
  });

  it("uses the formal আপনি register", () => {
    const informal = /(^|[\s,।;—-])(তুমি|তোমার|তোমাকে|তুই|তোর|তোকে)([\s,।;—-]|$)/;
    expect(bnLeaves.filter((k) => informal.test(getPath(bn, k) as string))).toEqual([]);
  });

  it("ends sentences with the Bangla full stop, never a Latin one", () => {
    expect(bnLeaves.filter((k) => /[a-zঀ-৿]\.$/.test((getPath(bn, k) as string).trim()))).toEqual([]);
  });
});
