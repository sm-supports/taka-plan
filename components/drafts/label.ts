/**
 * Pure helpers for the drafts UI: the auto label a draft shows when the user has not named it, what
 * "Start from the beginning" will do with the current answers, and the "nothing typed yet" check.
 * No React and no store access, so the rules are unit-tested in components/drafts/label.test.ts.
 */
import { hashAnswers, isEmptyAnswers } from "@/lib/store/drafts";
import type { Draft, DraftAnswers, TakaData } from "@/lib/store/types";
import { PROFILE_DEFAULTS } from "@/lib/onboarding/validate";

/** The longest name a user can give a draft. */
export const DRAFT_NAME_MAX = 40;

/** Minimal formatter surface the label needs (a subset of useFormat()). */
export interface LabelFormat {
  money: (n: number) => string;
  number: (n: number) => string;
}
export type LabelT = (key: string, params?: Record<string, string | number>) => string;

/** The facts an auto label is built from; each is null when the draft does not have it. */
export interface DraftFacts {
  country: string;
  age: number | null;
  takeHome: number | null;
  goals: number;
}

export function draftFacts(a: DraftAnswers): DraftFacts {
  const age = typeof a.profile.age === "number" && Number.isFinite(a.profile.age) ? a.profile.age : null;
  const takeHome = typeof a.profile.takeHome === "number" && Number.isFinite(a.profile.takeHome) && a.profile.takeHome > 0 ? a.profile.takeHome : null;
  return { country: a.country, age, takeHome, goals: a.m5?.goals?.length ?? 0 };
}

/** "BD · Age 28 · ৳50,000/month · 2 goals": the country code, then whichever facts the draft has. */
export function autoDraftLabel(a: DraftAnswers, t: LabelT, f: LabelFormat): string {
  const x = draftFacts(a);
  const parts: string[] = [x.country];
  if (x.age !== null) parts.push(t("common.drafts.label.age", { age: f.number(x.age) }));
  if (x.takeHome !== null) parts.push(t("common.drafts.label.takeHome", { amount: f.money(x.takeHome) }));
  if (x.goals > 0) parts.push(t(x.goals === 1 ? "common.drafts.label.goalsOne" : "common.drafts.label.goalsOther", { count: f.number(x.goals) }));
  return parts.join(" · ");
}

/** The user's name for the draft when it has one, otherwise the auto label. */
export function draftLabel(d: Pick<Draft, "name" | "answers">, t: LabelT, f: LabelFormat): string {
  const name = d.name?.trim();
  return name ? name : autoDraftLabel(d.answers, t, f);
}

/** Trims and caps a typed draft name; an empty result means "no name" (the auto label shows). */
export function cleanDraftName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, DRAFT_NAME_MAX);
}

/**
 * What saving the current answers as a draft will do, using the store's own rule (lib/store/drafts.ts):
 * "new" adds a draft, "existing" only refreshes the draft with the same answers, "none" saves nothing.
 */
export type SaveOutcome = "new" | "existing" | "none";

/** The current answers, as a draft keeps them (same fields as answersOf in lib/store/store.ts). */
function answersOf(s: TakaData): DraftAnswers {
  const { country, locale, profile, m1, m2, m3, m4, m5, m6, m7 } = s;
  return { country, locale, profile, m1, m2, m3, m4, m5, m6, m7 };
}

export function saveOutcome(s: TakaData): SaveOutcome {
  const a = answersOf(s);
  if (isEmptyAnswers(a)) return "none";
  const hash = hashAnswers(a);
  return s.drafts.some((d) => d.hash === hash) ? "existing" : "new";
}

/** Hash of the current answers, or null when nothing has been answered (used to mark the open draft). */
export function currentHash(s: TakaData): string | null {
  const a = answersOf(s);
  return isEmptyAnswers(a) ? null : hashAnswers(a);
}

/**
 * True when the only answers are the onboarding defaults the first question writes on its own.
 * The store treats those as empty (lib/store/drafts.ts isEmptyAnswers), so they never become a draft.
 */
export function onlyOnboardingDefaults(a: DraftAnswers): boolean {
  return isEmptyAnswers(a);
}

/** "2026-10-31T09:12:00.000Z" → "2026-10-31" for useFormat().asOf. */
export function isoDatePart(iso: string): string {
  return iso.slice(0, 10);
}

/** True when there is anything to keep as a draft (the store never saves empty answers). */
export function hasAnswers(s: TakaData): boolean {
  return !isEmptyAnswers(answersOf(s));
}

export { answersOf as currentAnswers };
