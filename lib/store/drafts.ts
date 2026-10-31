/**
 * Drafts: earlier sets of answers kept when the user starts again from the beginning.
 * Pure functions (no React, no storage) so the de-duplication rules are easy to test.
 *
 * Rules
 * - A draft is identified by a hash of its normalised answers: list item ids, empty values and the
 *   UI language are ignored, so the same answers typed again (or in another language) match.
 * - Saving answers whose hash already exists only refreshes that draft's updatedAt; it never adds.
 * - Empty answers (nothing filled in yet, or only the defaults question 1 writes on its own:
 *   age 30, salaried, no dependents, no debt) are never saved.
 * - At most MAX_DRAFTS are kept; the least recently updated is dropped first.
 */
import { PROFILE_DEFAULTS } from "../onboarding/validate";
import type { Draft, DraftAnswers } from "./types";

export const MAX_DRAFTS = 20;

/** Removes ids inside lists, undefined values, empty objects and empty arrays; sorts object keys. */
export function normalise(x: unknown, inList = false): unknown {
  if (Array.isArray(x)) {
    const items = x.map((v) => normalise(v, true)).filter((v) => v !== undefined);
    return items.length ? items : undefined;
  }
  if (x !== null && typeof x === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(x).sort()) {
      if (inList && k === "id") continue;
      const v = normalise((x as Record<string, unknown>)[k]);
      if (v !== undefined) out[k] = v;
    }
    return Object.keys(out).length ? out : undefined;
  }
  if (x === undefined || (typeof x === "number" && !Number.isFinite(x))) return undefined;
  if (typeof x === "string" && x.trim() === "") return undefined;
  return x;
}

/** The part of the answers that makes two drafts "the same" (the UI language is left out). */
function hashable(a: DraftAnswers): unknown {
  const { locale: _locale, ...rest } = a;
  return normalise(rest);
}

/** 64-bit FNV-1a over the canonical JSON, as 16 hex digits. Not cryptographic; collisions are irrelevant here. */
export function hashAnswers(a: DraftAnswers): string {
  const text = JSON.stringify(hashable(a)) ?? "";
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c ^ (i & 0xff), 0x5bd1e995) >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

/** The profile with the onboarding defaults removed (a default the user never changed is not an answer). */
function withoutDefaults(profile: DraftAnswers["profile"]): DraftAnswers["profile"] {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(profile)) {
    const d = (PROFILE_DEFAULTS as Record<string, unknown>)[k];
    if (d !== undefined && JSON.stringify(v) === JSON.stringify(d)) continue;
    out[k] = v;
  }
  return out as DraftAnswers["profile"];
}

/** True when nothing has been answered yet (the country, language and onboarding defaults alone do not count). */
export function isEmptyAnswers(a: DraftAnswers): boolean {
  const { locale: _l, country: _c, profile, ...rest } = a;
  return normalise({ ...rest, profile: withoutDefaults(profile) }) === undefined;
}

/**
 * Adds `answers` as a draft, or refreshes the existing draft with the same hash. Returns the new
 * list (most recently updated first) and the id of the draft that now holds the answers.
 */
export function upsertDraft(drafts: readonly Draft[], answers: DraftAnswers, now: string, newId: () => string): { drafts: Draft[]; id: string | null } {
  if (isEmptyAnswers(answers)) return { drafts: [...drafts], id: null };
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
  next.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0));
  return { drafts: next.slice(0, MAX_DRAFTS), id };
}
