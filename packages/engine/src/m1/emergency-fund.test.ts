import { describe, expect, it, test } from "vitest";
import seed from "../data/rates.seed.json";
import { EngineError } from "../types";
import { assertSnapshot, type RateKey, type RatesSnapshot } from "../rates";
import { computeEmergencyFund, suggestMonths } from "./emergency-fund";
import { M1_NEXT_KEYS, M1_RULE_KEYS, M1_STEP_IDS, type M1Input } from "./types";

const rates = assertSnapshot(seed);
const today = "2026-10-30";

const M1_RATE_KEYS: readonly RateKey[] = [
  "emergency_base_months",
  "emergency_bump_irregular_income",
  "emergency_bump_sole_earner",
  "emergency_bump_no_health_insurance",
  "emergency_min_months",
  "emergency_max_months",
  "emergency_build_months_default",
  "emergency_large_buffer_threshold",
  "deposit_insurance_limit",
];

/** Snapshot with one numeric row changed (to reach the cap, which the seed values cannot). */
function withValue(s: RatesSnapshot, key: RateKey, value: number): RatesSnapshot {
  return { ...s, rows: { ...s.rows, [key]: { ...s.rows[key], value } } };
}

const vector: M1Input = {
  essentials: 25000,
  incomeType: "salaried",
  dependents: ["partner", "children"],
  soleEarner: true,
  hasHealthInsurance: false,
  liquidSavings: 50000,
};

describe("suggestMonths", () => {
  test.each<{ name: string; input: Parameters<typeof suggestMonths>[0]; expected: number }>([
    { name: "salaried sole earner with dependents, no insurance", input: vector, expected: 10 },
    { name: "freelancer, no dependents, insured", input: { incomeType: "freelance", dependents: [], soleEarner: true, hasHealthInsurance: true }, expected: 9 },
    { name: "freelancer + sole earner + dependents + no insurance", input: { incomeType: "freelance", dependents: ["partner"], soleEarner: true, hasHealthInsurance: false }, expected: 13 },
    { name: "business with every bump", input: { incomeType: "business", dependents: ["parents"], soleEarner: true, hasHealthInsurance: false }, expected: 13 },
    { name: "salaried, no bumps at all", input: { incomeType: "salaried", dependents: [], soleEarner: false, hasHealthInsurance: true }, expected: 6 },
    { name: "sole earner without dependents gets no sole-earner bump", input: { incomeType: "salaried", dependents: [], soleEarner: true, hasHealthInsurance: true }, expected: 6 },
    { name: "dependents but not sole earner gets no sole-earner bump", input: { incomeType: "salaried", dependents: ["children"], soleEarner: false, hasHealthInsurance: true }, expected: 6 },
  ])("$name → $expected", ({ input, expected }) => {
    expect(suggestMonths(input, rates)).toBe(expected);
  });

  it("caps at emergency_max_months (15) when every bump applies and the base is raised", () => {
    const raised = withValue(rates, "emergency_base_months", 10);
    const input = { incomeType: "business" as const, dependents: ["partner" as const], soleEarner: true, hasHealthInsurance: false };
    expect(suggestMonths(input, raised)).toBe(15);
    expect(computeEmergencyFund({ ...vector, ...input }, raised, today).suggestedMonths).toBe(15);
  });

  it("floors at emergency_min_months when the base is lowered", () => {
    const lowered = withValue(rates, "emergency_base_months", 1);
    expect(suggestMonths({ incomeType: "salaried", dependents: [], soleEarner: false, hasHealthInsurance: true }, lowered)).toBe(3);
  });
});

describe("computeEmergencyFund (PRD vectors)", () => {
  test.each<{ name: string; input: M1Input; expected: Partial<ReturnType<typeof computeEmergencyFund>> & { banksNeeded?: number; sanchayapatraLayer?: boolean } }>([
    {
      name: "contract vector: 25 000 essentials, 10 months, 50 000 saved",
      input: vector,
      expected: {
        suggestedMonths: 10,
        months: 10,
        target: 250000,
        saved: 50000,
        gap: 200000,
        monthlySaving: 16700,
        monthsCovered: 2,
        monthsToFull: 12,
        status: "amber",
        banksNeeded: 2,
        sanchayapatraLayer: false,
        nextStep: "m1.next.fdrLadder",
      },
    },
    {
      name: "freelancer, no dependents, insured → 9 months",
      input: { essentials: 40000, incomeType: "freelance", dependents: [], soleEarner: true, hasHealthInsurance: true, liquidSavings: 0 },
      expected: { suggestedMonths: 9, months: 9, target: 360000, gap: 360000, monthlySaving: 30000, monthsCovered: 0, status: "red", nextStep: "m1.next.openSavings" },
    },
    {
      name: "freelancer + sole earner + dependents + no insurance → 13 months",
      input: { essentials: 50000, incomeType: "freelance", dependents: ["partner"], soleEarner: true, hasHealthInsurance: false, liquidSavings: 150000 },
      expected: { suggestedMonths: 13, months: 13, target: 650000, gap: 500000, monthlySaving: 41700, monthsCovered: 3, status: "amber", banksNeeded: 4 },
    },
    {
      name: "override 4 → target uses 4, suggestion still reported",
      input: { ...vector, monthsOverride: 4 },
      expected: { suggestedMonths: 10, months: 4, target: 100000, gap: 50000, monthlySaving: 4200, monthsToFull: 12, status: "amber" },
    },
    {
      name: "saved ≥ target → full",
      input: { ...vector, liquidSavings: 300000 },
      expected: { gap: 0, monthlySaving: 0, monthsToFull: null, monthsCovered: 12, status: "green", nextStep: "m1.next.full" },
    },
    {
      name: "saved exactly the target → full",
      input: { ...vector, liquidSavings: 250000 },
      expected: { gap: 0, monthlySaving: 0, monthsToFull: null, monthsCovered: 10, status: "green", nextStep: "m1.next.full" },
    },
    {
      name: "custom buildMonths changes the monthly amount",
      input: { ...vector, buildMonths: 24 },
      expected: { monthlySaving: 8400, monthsToFull: 24 },
    },
    {
      name: "savings past the insurance limit and more than one bank needed → split banks",
      input: { ...vector, liquidSavings: 210000 },
      expected: { gap: 40000, monthlySaving: 3400, banksNeeded: 2, status: "amber", nextStep: "m1.next.splitBanks" },
    },
    {
      name: "very large buffer → Sanchayapatra third layer",
      input: { essentials: 120000, incomeType: "salaried", dependents: ["partner"], soleEarner: true, hasHealthInsurance: false, liquidSavings: 100000 },
      expected: { months: 10, target: 1200000, banksNeeded: 6, sanchayapatraLayer: true, status: "red", nextStep: "m1.next.openSavings" },
    },
  ])("$name", ({ input, expected }) => {
    const r = computeEmergencyFund(input, rates, today);
    const { banksNeeded, sanchayapatraLayer, ...rest } = expected;
    expect(r).toMatchObject(rest);
    if (banksNeeded !== undefined) expect(r.tiers.banksNeeded).toBe(banksNeeded);
    if (sanchayapatraLayer !== undefined) expect(r.tiers.sanchayapatraLayer).toBe(sanchayapatraLayer);
    expect(M1_NEXT_KEYS).toContain(r.nextStep);
  });

  it("splits the target into one month in savings and the rest as a three-slice FDR ladder", () => {
    const r = computeEmergencyFund(vector, rates, today);
    expect(r.tiers).toEqual({ savingsAccount: 25000, fdrLadder: 225000, fdrPerSlice: 75000, banksNeeded: 2, sanchayapatraLayer: false });
  });

  it("rounds tier amounts at the output boundary only", () => {
    const r = computeEmergencyFund({ ...vector, essentials: 27300, monthsOverride: 7 }, rates, today);
    expect(r.target).toBe(191100);
    expect(r.tiers.savingsAccount).toBe(27300); // exactly one month of essentials
    expect(r.tiers.fdrLadder).toBe(163800);
    expect(r.tiers.fdrPerSlice).toBe(54500); // 54 600 → nearest ৳500
    expect(r.monthlySaving).toBe(11800); // (191 100 − 50 000) / 12 = 11 758.3 → up to ৳100
  });

  it("rounds the monthly saving up so the fund is full inside the build period", () => {
    const cases: M1Input[] = [vector, { ...vector, buildMonths: 24 }, { ...vector, liquidSavings: 210000 }, { ...vector, essentials: 27300, monthsOverride: 7 }];
    for (const input of cases) {
      const r = computeEmergencyFund(input, rates, today);
      const buildMonths = input.buildMonths ?? 12;
      expect(r.monthlySaving * buildMonths).toBeGreaterThanOrEqual(r.gap);
      expect(r.monthsToFull).not.toBeNull();
      expect(r.monthsToFull!).toBeLessThanOrEqual(buildMonths);
      expect(r.monthlySaving % 100).toBe(0);
    }
    expect(computeEmergencyFund({ ...vector, liquidSavings: 210000 }, rates, today).monthlySaving).toBe(3400); // 40 000 / 12 = 3 333.3 → 3 400
  });

  it("lists every rule, with the Sanchayapatra layer only for very large buffers", () => {
    const small = computeEmergencyFund(vector, rates, today);
    expect(small.rules).toEqual(M1_RULE_KEYS.filter((k) => k !== "m1.rule.sanchayapatraThirdLayer"));
    const large = computeEmergencyFund({ ...vector, essentials: 150000 }, rates, today);
    expect(large.rules).toEqual([...M1_RULE_KEYS]);
  });

  it("reads buildMonths from the rates table only when the caller leaves it out", () => {
    const withDefault = computeEmergencyFund(vector, rates, today);
    expect(withDefault.explain.assumptions.map((a) => a.key)).toContain("emergency_build_months_default");
    const custom = computeEmergencyFund({ ...vector, buildMonths: 6 }, rates, today);
    expect(custom.explain.assumptions.map((a) => a.key)).not.toContain("emergency_build_months_default");
  });
});

describe("computeEmergencyFund (invalid input)", () => {
  test.each<{ name: string; input: M1Input }>([
    { name: "essentials 0", input: { ...vector, essentials: 0 } },
    { name: "essentials negative", input: { ...vector, essentials: -5000 } },
    { name: "essentials NaN", input: { ...vector, essentials: Number.NaN } },
    { name: "liquidSavings negative", input: { ...vector, liquidSavings: -1 } },
    { name: "monthsOverride 2 (below min)", input: { ...vector, monthsOverride: 2 } },
    { name: "monthsOverride 16 (above max)", input: { ...vector, monthsOverride: 16 } },
    { name: "monthsOverride 7.5 (not whole)", input: { ...vector, monthsOverride: 7.5 } },
    { name: "buildMonths 0", input: { ...vector, buildMonths: 0 } },
  ])("$name → INVALID_INPUT", ({ input }) => {
    let caught: unknown;
    try {
      computeEmergencyFund(input, rates, today);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(EngineError);
    expect((caught as EngineError).code).toBe("INVALID_INPUT");
  });

  it("throws MISSING_RATE when an M1 row is absent", () => {
    const { emergency_base_months: _drop, ...rest } = rates.rows;
    const broken = { ...rates, rows: rest } as unknown as RatesSnapshot;
    expect(() => computeEmergencyFund(vector, broken, today)).toThrow(/emergency_base_months/);
  });
});

describe("computeEmergencyFund (explanation)", () => {
  it("records the step ids in M1_STEP_IDS order with raw and rounded values", () => {
    const r = computeEmergencyFund(vector, rates, today);
    expect(r.explain.steps.map((s) => s.id)).toEqual([...M1_STEP_IDS]);
    for (const s of r.explain.steps) {
      expect(Number.isFinite(s.raw)).toBe(true);
      expect(Number.isFinite(s.rounded)).toBe(true);
    }
    const monthly = r.explain.steps.find((s) => s.id === "m1.monthly");
    expect(monthly?.raw).toBeCloseTo(16666.67, 2);
    expect(monthly?.rounded).toBe(16700);
    expect(monthly?.inputs).toEqual({ gap: 200000, buildMonths: 12 });
    const months = r.explain.steps.find((s) => s.id === "m1.months");
    expect(months?.inputs).toMatchObject({ base: 6, bumpIrregular: 0, bumpSoleEarner: 2, bumpNoHealth: 2, min: 3, max: 15, suggested: 10, source: "suggested" });
    expect(computeEmergencyFund({ ...vector, monthsOverride: 5 }, rates, today).explain.steps[0]?.inputs).toMatchObject({ source: "override", suggested: 10 });
  });

  it("uses only M1 rates rows as assumptions, and all of them by default", () => {
    const r = computeEmergencyFund(vector, rates, today);
    const keys = r.explain.assumptions.map((a) => a.key);
    for (const k of keys) expect(M1_RATE_KEYS).toContain(k);
    expect([...keys].sort()).toEqual([...M1_RATE_KEYS].sort());
    expect(new Set(keys).size).toBe(keys.length);
    for (const a of r.explain.assumptions) {
      expect(a.stale).toBe(false);
      expect(a.sourceUrl.length).toBeGreaterThan(0);
    }
    expect(r.explain.notes).toEqual([]);
  });

  it("is pure: the same input gives the same result and does not mutate the input", () => {
    const input: M1Input = { ...vector, dependents: [...vector.dependents] };
    const snapshot = JSON.stringify(input);
    const a = computeEmergencyFund(input, rates, today);
    const b = computeEmergencyFund(input, rates, today);
    expect(a).toEqual(b);
    expect(JSON.stringify(input)).toBe(snapshot);
  });
});
