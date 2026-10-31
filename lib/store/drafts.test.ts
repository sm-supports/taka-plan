import { describe, expect, it } from "vitest";
import { capDrafts, dedupeDrafts, draftDroppedBy, hashAnswers, isEmptyAnswers, MAX_DRAFTS, normalise, upsertDraft } from "./drafts";
import { EMPTY_ANSWERS, type Draft, type DraftAnswers } from "./types";

const base: DraftAnswers = { country: "BD", locale: "bn", ...EMPTY_ANSWERS };
const filled = (age: number): DraftAnswers => ({ ...base, profile: { age, takeHome: 50000 } });

describe("drafts", () => {
  it("normalise drops list ids, empty values and sorts keys", () => {
    expect(normalise({ b: 1, a: [{ id: "x", n: 2 }], c: {}, d: [], e: undefined, f: " " })).toEqual({ a: [{ n: 2 }], b: 1 });
  });

  it("hash ignores the UI language, list ids and key order but not the country", () => {
    const a: DraftAnswers = { ...filled(30), m5: { goals: [{ id: "g1", name: "Bike", cost: 1, years: 2, type: "vehicle" }] } };
    const b: DraftAnswers = { ...a, locale: "en", m5: { goals: [{ type: "vehicle", years: 2, cost: 1, name: "Bike", id: "g2" }] } };
    expect(hashAnswers(a)).toBe(hashAnswers(b));
    expect(hashAnswers({ ...a, country: "IN" })).not.toBe(hashAnswers(a));
    expect(hashAnswers(filled(31))).not.toBe(hashAnswers(filled(30)));
    expect(hashAnswers(a)).toMatch(/^[0-9a-f]{16}$/);
  });

  it("empty answers are not saved", () => {
    expect(isEmptyAnswers(base)).toBe(true);
    expect(isEmptyAnswers({ ...base, country: "US" })).toBe(true);
    // The defaults question 1 writes on its own are not answers.
    expect(isEmptyAnswers({ ...base, profile: { age: 30, incomeType: "salaried", dependents: [], hasDebt: false } })).toBe(true);
    expect(isEmptyAnswers({ ...base, profile: { age: 31, incomeType: "salaried", dependents: [], hasDebt: false } })).toBe(false);
    expect(upsertDraft([], base, "2026-10-31T00:00:00Z", () => "d1")).toEqual({ drafts: [], id: null, dropped: null });
  });

  it("upsert refreshes an identical draft and keeps the newest first, at most MAX_DRAFTS", () => {
    let n = 0;
    const id = () => `d${++n}`;
    let { drafts } = upsertDraft([], filled(30), "2026-10-31T00:00:01Z", id);
    ({ drafts } = upsertDraft(drafts, filled(40), "2026-10-31T00:00:02Z", id));
    const again = upsertDraft(drafts, filled(30), "2026-10-31T00:00:03Z", id);
    expect(again.drafts).toHaveLength(2);
    expect(again.id).toBe("d1");
    expect(again.drafts[0]!.id).toBe("d1");
    expect(again.drafts[0]!.createdAt).toBe("2026-10-31T00:00:01Z");
    let many = again.drafts;
    for (let i = 0; i < MAX_DRAFTS + 5; i++) many = upsertDraft(many, filled(50 + i), `2026-10-31T01:${String(i).padStart(2, "0")}:00Z`, id).drafts;
    expect(many).toHaveLength(MAX_DRAFTS);
    expect(many.some((d) => d.id === "d1")).toBe(false);
  });
});

describe("canonical hashing (review ST-M6)", () => {
  const P = { age: 28, incomeType: "salaried" as const, takeHome: 50000, essentials: 30000, dependents: [], hasDebt: false };
  const a: DraftAnswers = { ...base, profile: P };
  const h = (x: Partial<DraftAnswers>) => hashAnswers({ ...a, ...x });
  const g = (id: string, name: string, cost: number) => ({ id, name, cost, years: 2, type: "vehicle" as const });

  it("ignores list order, item ids and stray spaces", () => {
    expect(h({ m5: { goals: [g("a", "Bike", 1), g("b", "Car", 2)] } })).toBe(h({ m5: { goals: [g("x", "Car", 2), g("y", "Bike", 1)] } }));
    expect(h({ m5: { goals: [g("a", "Bike", 1)] } })).toBe(h({ m5: { goals: [g("a", "  Bike ", 1)] } }));
    expect(h({ profile: { ...P, dependents: ["parents", "partner"] } })).toBe(h({ profile: { ...P, dependents: ["partner", "parents"] } }));
    const loan = (id: string, outstanding: number) => ({ id, type: "home" as const, outstanding, annualRate: 0.1, emi: 1, monthsLeft: 2 });
    expect(h({ m3: { loans: [loan("1", 5), loan("2", 6)], cards: [] } })).toBe(h({ m3: { loans: [loan("9", 6), loan("8", 5)], cards: [] } }));
  });

  it("treats an accepted default as no answer", () => {
    expect(h({ m2: { smoker: false } })).toBe(h({}));
    expect(h({ m1: { soleEarner: false, liquidSavings: 0 } })).toBe(h({}));
    expect(h({ m1: { soleEarner: true } })).not.toBe(h({}));
    expect(h({ m7: { sources: {} } })).toBe(h({}));
    expect(h({ m7: { mode: "working", monthlySaving: 0, sources: { rentMonthly: 0 } } })).toBe(h({}));
    expect(h({ m7: { mode: "retired" } })).not.toBe(h({}));
    expect(h({ m6: { risk: {}, lumpSum: 0, directShares: false } })).toBe(h({}));
    expect(h({ profile: { ...P, age: 30 } })).toBe(h({ profile: { ...P, age: undefined } }));
    // With dependents, sole earner true is the default.
    expect(h({ profile: { ...P, dependents: ["children"] }, m1: { soleEarner: true } })).toBe(h({ profile: { ...P, dependents: ["children"] } }));
  });

  it("keeps values that change the plan, including meaningful empty lists", () => {
    expect(h({ m2: { healthCovered: [] } })).not.toBe(h({}));
    expect(h({ m2: { healthCovered: ["self", "partner"] } })).toBe(h({ m2: { healthCovered: ["partner", "self"] } }));
    // extraMonthly undefined = "use the headroom", 0 = "nothing extra": different plans.
    expect(h({ m3: { loans: [], cards: [], extraMonthly: 0 } })).not.toBe(h({}));
    expect(isEmptyAnswers({ ...base, m2: { healthCovered: [] } })).toBe(false);
    expect(isEmptyAnswers({ ...base, profile: { age: 30, incomeType: "salaried", dependents: [], hasDebt: false }, m7: { mode: "working" }, m2: { smoker: false } })).toBe(true);
  });
});

describe("cap (review ST-M8)", () => {
  let n = 0;
  const id = () => `c${++n}`;
  const at = (i: number) => `2026-10-31T01:${String(i).padStart(2, "0")}:00.000Z`;

  it("never drops a named draft and reports the one it drops", () => {
    let list: Draft[] = [];
    for (let i = 0; i < MAX_DRAFTS; i++) list = upsertDraft(list, filled(20 + i), at(i), id).drafts;
    const oldest = list[list.length - 1]!;
    list = list.map((d) => (d.id === oldest.id ? { ...d, name: "Precious" } : d));
    expect(draftDroppedBy(list, filled(90))?.id).toBe(list[list.length - 2]!.id);
    const r = upsertDraft(list, filled(90), at(40), id);
    expect(r.drafts).toHaveLength(MAX_DRAFTS);
    expect(r.drafts.some((d) => d.name === "Precious")).toBe(true);
    expect(r.dropped?.id).toBe(list[list.length - 2]!.id);
    // Refreshing an existing draft drops nothing.
    expect(draftDroppedBy(r.drafts, filled(90))).toBeNull();
    // All named: nothing is dropped, the list grows past the cap.
    const named = r.drafts.map((d) => ({ ...d, name: d.name ?? "n" }));
    const r2 = upsertDraft(named, filled(91), at(41), id);
    expect(r2.dropped).toBeNull();
    expect(r2.drafts).toHaveLength(MAX_DRAFTS + 1);
  });

  it("dedupeDrafts keeps the newest per hash and carries a name over; capDrafts drops oldest unnamed", () => {
    const d = (i: string, hash: string, updatedAt: string, name?: string): Draft => ({ id: i, hash, createdAt: updatedAt, updatedAt, answers: base, ...(name ? { name } : {}) });
    expect(dedupeDrafts([d("old", "h", at(1), "Named"), d("new", "h", at(2))])).toEqual([{ ...d("new", "h", at(2)), name: "Named" }]);
    expect(capDrafts([d("a", "1", at(3)), d("b", "2", at(2), "keep"), d("c", "3", at(1))], 1).map((x) => x.id)).toEqual(["b"]);
  });
});
