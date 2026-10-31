/**
 * Pure helpers for the drafts UI: the auto label a draft shows when the user has not named it, when
 * it was last updated, what "Start from the beginning" will do with the current answers, and the
 * "nothing typed yet" check. No React and no store access, so the rules are unit-tested in
 * components/drafts/label.test.ts.
 */
import { hasOverrideAnswers } from "@taka/engine";
import { findCountry } from "@/lib/country/index-data";
import { LOCALE_META, type Locale } from "@/lib/i18n/config";
import { draftDroppedBy, hashAnswers, isEmptyAnswers } from "@/lib/store/drafts";
import type { Draft, DraftAnswers, TakaData } from "@/lib/store/types";

/** The longest name a user can give a draft. */
export const DRAFT_NAME_MAX = 40;

/** Minimal formatter surface the label needs (a subset of useFormat()). */
export interface LabelFormat {
  locale?: Locale;
  money: (n: number) => string;
  number: (n: number) => string;
}
export type LabelT = (key: string, params?: Record<string, string | number>) => string;

/** The facts an auto label is built from; each is null (or false) when the draft does not have it. */
export interface DraftFacts {
  country: string;
  age: number | null;
  takeHome: number | null;
  goals: number;
  /** The insurance check, asset mix and retirement plan hold answers of their own. */
  m2: boolean;
  m6: boolean;
  m7: boolean;
}

export function draftFacts(a: DraftAnswers): DraftFacts {
  const age = typeof a.profile.age === "number" && Number.isFinite(a.profile.age) ? a.profile.age : null;
  const takeHome = typeof a.profile.takeHome === "number" && Number.isFinite(a.profile.takeHome) && a.profile.takeHome > 0 ? a.profile.takeHome : null;
  return {
    country: a.country,
    age,
    takeHome,
    goals: a.m5?.goals?.length ?? 0,
    m2: hasOverrideAnswers(a.m2 ?? {}),
    m6: hasOverrideAnswers(a.m6 ?? {}),
    m7: hasOverrideAnswers(a.m7 ?? {}),
  };
}

/** BCP 47 tag of a UI locale ("bn" → "bn-BD"); English when unknown. */
function tagOf(locale: Locale | undefined): string {
  return (locale && LOCALE_META[locale]?.tag) || "en";
}

/** The country's name in the UI language ("IN" → "India", "ভারত"); the English name or the code when Intl has none. */
export function countryName(code: string, locale?: Locale): string {
  const fallback = findCountry(code)?.nameEn ?? code;
  try {
    return new Intl.DisplayNames([tagOf(locale)], { type: "region" }).of(code) ?? fallback;
  } catch {
    return fallback;
  }
}

/** "Bangladesh · Age 28 · ৳50,000/month · 2 goals · Insurance · Retirement": whichever facts the draft has. */
export function autoDraftLabel(a: DraftAnswers, t: LabelT, f: LabelFormat): string {
  const x = draftFacts(a);
  const parts: string[] = [countryName(x.country, f.locale)];
  if (x.age !== null) parts.push(t("common.drafts.label.age", { age: f.number(x.age) }));
  if (x.takeHome !== null) parts.push(t("common.drafts.label.takeHome", { amount: f.money(x.takeHome) }));
  if (x.goals > 0) parts.push(t(x.goals === 1 ? "common.drafts.label.goalsOne" : "common.drafts.label.goalsOther", { count: f.number(x.goals) }));
  for (const m of ["m2", "m6", "m7"] as const) if (x[m]) parts.push(t(`common.drafts.label.${m}`));
  return parts.join(" · ");
}

/** The user's name for the draft when it has one, otherwise the auto label. */
export function draftLabel(d: Pick<Draft, "name" | "answers">, t: LabelT, f: LabelFormat): string {
  const name = d.name?.trim();
  return name ? name : autoDraftLabel(d.answers, t, f);
}

/**
 * The day and time a draft was last updated, in the UI language ("Oct 31, 2026, 9:12 AM";
 * "৩১ অক্টো, ২০২৬, ০৯:১২" with Bangla digits and a 24-hour clock in Bangla). `timeZone` is for tests.
 */
export function draftUpdatedAt(iso: string, locale: Locale, timeZone?: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  const bn = locale === "bn";
  try {
    return new Intl.DateTimeFormat(tagOf(locale), {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...(bn ? { hourCycle: "h23" as const, numberingSystem: "beng" } : {}),
      ...(timeZone ? { timeZone } : {}),
    }).format(d);
  } catch {
    return iso.slice(0, 16).replace("T", " ");
  }
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

/** The draft that keeping the current answers would remove (the cap is reached), or null. */
export function draftToDrop(s: TakaData): Draft | null {
  return draftDroppedBy(s.drafts, answersOf(s));
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

/** Currency of a draft's country from the bundled country list (BDT when unknown). */
export function currencyCodeOf(country: string): string {
  return findCountry(country)?.currency ?? "BDT";
}

export { answersOf as currentAnswers };
