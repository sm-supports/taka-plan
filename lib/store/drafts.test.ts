import { describe, expect, it } from "vitest";
import { hashAnswers, isEmptyAnswers, MAX_DRAFTS, normalise, upsertDraft } from "./drafts";
import { EMPTY_ANSWERS, type DraftAnswers } from "./types";

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
    expect(upsertDraft([], base, "2026-10-31T00:00:00Z", () => "d1")).toEqual({ drafts: [], id: null });
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
