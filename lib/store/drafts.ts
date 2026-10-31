/**
 * Drafts: earlier sets of answers kept when the user starts again from the beginning.
 * Pure functions (no React, no storage) so the de-duplication rules are easy to test.
 *
 * Rules
 * - A draft is identified by a hash of its canonical answers (canonicalAnswers): what the engine
 *   would compute from. So
 *   - list item ids, the UI language, key order and the order of list items are ignored;
 *   - strings are trimmed and inner spaces collapsed ("Bike " = "Bike");
 *   - a value equal to the default the plan would use anyway is the same as no value (age 30,
 *     salaried, non-smoker, no lump sum, "still working", sole earner = has dependents, ...);
 *   - empty objects and lists are no answer, except where an empty list means something
 *     (m2.healthCovered [] = "cover nobody", which differs from "not answered").
 * - Saving answers whose hash already exists only refreshes that draft's updatedAt; it never adds.
 * - Empty answers (nothing that differs from the defaults) are never saved.
 * - At most MAX_DRAFTS are kept: the least recently updated unnamed draft is dropped first, and a
 *   draft the user named is never dropped (draftDroppedBy tells the UI which one would go).
 */
import { PROFILE_DEFAULTS } from "../onboarding/validate";
import type { Draft, DraftAnswers } from "./types";

export const MAX_DRAFTS = 20;

/** Paths (dot-separated, from the answers root) where an empty list is an answer of its own. */
const MEANINGFUL_EMPTY = new Set(["m2.healthCovered"]);

/** Removes ids inside lists, undefined values, empty objects and empty arrays; sorts object keys; trims strings. */
export function normalise(x: unknown, inList = false, path = ""): unknown {
  if (Array.isArray(x)) {
    const items = x.map((v) => normalise(v, true, path)).filter((v) => v !== undefined);
    return items.length || MEANINGFUL_EMPTY.has(path) ? items : undefined;
  }
  if (x !== null && typeof x === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(x).sort()) {
      if (inList && k === "id") continue;
      const v = normalise((x as Record<string, unknown>)[k], false, inList ? "" : path ? `${path}.${k}` : k);
      if (v !== undefined) out[k] = v;
    }
    return Object.keys(out).length ? out : undefined;
  }
  if (x === undefined || (typeof x === "number" && !Number.isFinite(x))) return undefined;
  if (typeof x === "string") {
    const s = x.replace(/\s+/g, " ").trim();
    return s === "" ? undefined : s;
  }
  return x;
}

type Obj = Record<string, unknown>;

/** A copy of `o` without the keys whose value equals the given default. */
function dropDefaults(o: object | undefined, defaults: Obj): Obj {
  const out: Obj = {};
  for (const [k, v] of Object.entries(o ?? {})) {
    if (k in defaults && JSON.stringify(v) === JSON.stringify(defaults[k])) continue;
    out[k] = v;
  }
  return out;
}

/** Sorted copy (by canonical JSON) so the order the user added items in does not matter. */
function sortedByContent<T>(list: readonly T[] | undefined): unknown[] | undefined {
  if (!Array.isArray(list)) return undefined;
  return list
    .map((x) => normalise(x, true))
    .filter((x) => x !== undefined)
    .sort((a, b) => {
      const ja = JSON.stringify(a);
      const jb = JSON.stringify(b);
      return ja < jb ? -1 : ja > jb ? 1 : 0;
    });
}

function sortedStrings(list: readonly string[] | undefined): string[] | undefined {
  return Array.isArray(list) ? [...list].sort() : undefined;
}

/**
 * The answers as the engine would see them, minus everything that would not change a number:
 * defaults removed, lists sorted by content, ids dropped, strings trimmed. The UI language and the
 * country are left out here (the hash adds the country back).
 */
export function canonicalAnswers(a: DraftAnswers): unknown {
  const profile: Obj = { ...a.profile, dependents: sortedStrings(a.profile?.dependents) };
  const dependents = (a.profile?.dependents ?? PROFILE_DEFAULTS.dependents).length;
  const m2: Obj = { ...a.m2, healthCovered: sortedStrings(a.m2?.healthCovered) };
  const m3: Obj = { ...a.m3, loans: sortedByContent(a.m3?.loans), cards: sortedByContent(a.m3?.cards) };
  const goals = (a.m5?.goals ?? []).map((g) => ({ ...g, name: typeof g.name === "string" ? g.name.replace(/\s+/g, " ").trim() : g.name }));
  const sources = a.m7?.sources ? dropDefaults(a.m7.sources, { fixedPensionMonthly: 0, rentMonthly: 0, familySupportMonthly: 0, oldAgeAllowanceEligible: false }) : undefined;
  return normalise({
    profile: dropDefaults(profile, PROFILE_DEFAULTS as unknown as Obj),
    m1: dropDefaults(a.m1, { soleEarner: dependents > 0, hasHealthInsurance: (a.m2?.existingHealthCover ?? 0) > 0, liquidSavings: 0 }),
    m2: dropDefaults(m2, { smoker: false, investments: 0, existingLifeCover: 0, existingHealthCover: 0 }),
    m3,
    m4: a.m4,
    m5: { goals: sortedByContent(goals) },
    m6: dropDefaults(a.m6, { lumpSum: 0, monthly: 0, newMoney: 0, propertyValue: 0, directShares: false }),
    m7: dropDefaults(
      { ...a.m7, sources },
      { mode: "working", monthlySaving: 0, otherMonthlyIncome: 0, savings: a.m1?.liquidSavings ?? 0, monthlySpending: a.profile?.essentials ?? null },
    ),
  });
}

/** 64-bit FNV-1a over the canonical JSON (with the country), as 16 hex digits. Not cryptographic. */
export function hashAnswers(a: DraftAnswers): string {
  const text = JSON.stringify({ country: a.country, answers: canonicalAnswers(a) }) ?? "";
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c ^ (i & 0xff), 0x5bd1e995) >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

/** True when nothing differs from the defaults (the country and language alone do not count). */
export function isEmptyAnswers(a: DraftAnswers): boolean {
  return canonicalAnswers(a) === undefined;
}

const newestFirst = (a: Draft, b: Draft) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0);

/**
 * Newest first, one draft per hash (the most recently updated one, which takes the user's name
 * from a duplicate when it has none).
 */
export function dedupeDrafts(list: readonly Draft[]): Draft[] {
  const byHash = new Map<string, Draft>();
  for (const d of [...list].sort(newestFirst)) {
    const kept = byHash.get(d.hash);
    if (!kept) byHash.set(d.hash, d);
    else if (kept.name === undefined && d.name !== undefined) byHash.set(d.hash, { ...kept, name: d.name });
  }
  return [...byHash.values()];
}

/** `list` (newest first) without its oldest unnamed drafts beyond `max`; named drafts, and the draft `keep` (the one just saved), always stay. */
export function capDrafts(list: readonly Draft[], max = MAX_DRAFTS, keep?: string): Draft[] {
  const out = [...list];
  for (let i = out.length - 1; i >= 0 && out.length > max; i--) if (out[i]!.name === undefined && out[i]!.id !== keep) out.splice(i, 1);
  return out;
}

export interface UpsertResult {
  drafts: Draft[];
  /** The draft that now holds the answers; null when they were empty (nothing saved). */
  id: string | null;
  /** The draft removed to stay within MAX_DRAFTS, if any. */
  dropped: Draft | null;
}

/**
 * Adds `answers` as a draft, or refreshes the existing draft with the same hash. Returns the new
 * list (most recently updated first), the id of the draft that now holds the answers and the
 * draft the cap removed.
 */
export function upsertDraft(drafts: readonly Draft[], answers: DraftAnswers, now: string, newId: () => string): UpsertResult {
  if (isEmptyAnswers(answers)) return { drafts: [...drafts], id: null, dropped: null };
  const hash = hashAnswers(answers);
  const existing = drafts.find((d) => d.hash === hash);
  let next: Draft[];
  let id: string;
  if (existing) {
    id = existing.id;
    next = drafts.map((d) => (d.id === id ? { ...d, updatedAt: now, answers } : d));
  } else {
    id = newId();
    next = [...drafts, { id, createdAt: now, updatedAt: now, hash, answers }];
  }
  next.sort(newestFirst);
  const capped = capDrafts(next, MAX_DRAFTS, id);
  const dropped = next.find((d) => !capped.includes(d)) ?? null;
  return { drafts: capped, id, dropped };
}

/** The draft that saving `answers` would remove (cap reached, a new draft, an unnamed oldest), else null. */
export function draftDroppedBy(drafts: readonly Draft[], answers: DraftAnswers): Draft | null {
  return upsertDraft(drafts, answers, "9999-12-31T23:59:59.999Z", () => "\u0000pending").dropped;
}
