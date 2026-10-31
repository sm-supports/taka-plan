import { describe, expect, it } from "vitest";
import { bn } from "@/lib/i18n/dictionaries/bn";
import { en } from "@/lib/i18n/dictionaries/en";
import { translate } from "@/lib/i18n/translate";
import { createFormatters } from "@/lib/i18n/useFormat";
import { upsertDraft } from "@/lib/store/drafts";
import { EMPTY_ANSWERS, INITIAL_DATA, type Draft, type DraftAnswers, type TakaData } from "@/lib/store/types";
import { PROFILE_DEFAULTS } from "@/lib/onboarding/validate";
import {
  autoDraftLabel,
  cleanDraftName,
  countryName,
  currentHash,
  DRAFT_NAME_MAX,
  draftFacts,
  draftLabel,
  draftUpdatedAt,
  hasAnswers,
  isoDatePart,
  onlyOnboardingDefaults,
  saveOutcome,
} from "./label";

const tEn = (k: string, p?: Record<string, string | number>) => translate(en, k, p);
const tBn = (k: string, p?: Record<string, string | number>) => translate(bn, k, p);
const fEn = { ...createFormatters("en"), locale: "en" as const };
const fBn = { ...createFormatters("bn"), locale: "bn" as const };

const base: DraftAnswers = { country: "BD", locale: "en", ...EMPTY_ANSWERS };
const goal = (id: string) => ({ id, name: "Bike", cost: 200000, years: 2, type: "vehicle" as const });
const full: DraftAnswers = {
  ...base,
  profile: { age: 28, incomeType: "salaried", takeHome: 50000, essentials: 30000, dependents: [], hasDebt: false },
  m5: { goals: [goal("g1"), goal("g2")] },
};

function stateWith(a: Partial<DraftAnswers>, drafts: Draft[] = []): TakaData {
  return { ...INITIAL_DATA, ...a, drafts };
}

describe("draft labels", () => {
  it("builds the auto label from country, age, take-home and goals", () => {
    expect(autoDraftLabel(full, tEn, fEn)).toBe("Bangladesh · Age 28 · ৳50,000/month · 2 goals");
    expect(autoDraftLabel({ ...full, m5: { goals: [goal("g1")] } }, tEn, fEn)).toBe("Bangladesh · Age 28 · ৳50,000/month · 1 goal");
    // The insurance check, asset mix and retirement plan are named once they hold answers.
    expect(autoDraftLabel({ ...full, m2: { smoker: true }, m6: { risk: {} }, m7: { planToAge: 90 } }, tEn, fEn)).toBe("Bangladesh · Age 28 · ৳50,000/month · 2 goals · Insurance · Retirement");
  });

  it("uses Bangla digits in Bangla", () => {
    const label = autoDraftLabel(full, tBn, fBn);
    expect(label).toBe("বাংলাদেশ · বয়স ২৮ · মাসে ৳৫০,০০০ · ২টি লক্ষ্য");
    expect(label).not.toMatch(/[0-9]/);
  });

  it("leaves out facts the draft does not have", () => {
    expect(autoDraftLabel({ ...base, country: "IN", profile: { age: 40 } }, tEn, fEn)).toBe("India · Age 40");
    expect(autoDraftLabel({ ...base, profile: { takeHome: 0 } }, tEn, fEn)).toBe("Bangladesh");
    expect(draftFacts({ ...base, profile: { age: Number.NaN } })).toEqual({ country: "BD", age: null, takeHome: null, goals: 0, m2: false, m6: false, m7: false });
  });

  it("prefers the user's name, ignoring blank names", () => {
    expect(draftLabel({ name: "  Before the raise ", answers: full }, tEn, fEn)).toBe("Before the raise");
    expect(draftLabel({ name: "   ", answers: full }, tEn, fEn)).toBe(autoDraftLabel(full, tEn, fEn));
    expect(draftLabel({ answers: full }, tEn, fEn)).toBe(autoDraftLabel(full, tEn, fEn));
  });

  it("cleans typed names: trims, collapses spaces, caps the length", () => {
    expect(cleanDraftName("  my   plan  ")).toBe("my plan");
    expect(cleanDraftName("x".repeat(60))).toHaveLength(DRAFT_NAME_MAX);
    expect(cleanDraftName("   ")).toBe("");
  });

  it("shows the day and time a draft was updated, with Bangla digits in Bangla", () => {
    expect(draftUpdatedAt("2026-10-31T09:12:00.000Z", "en", "UTC")).toBe("Oct 31, 2026, 09:12 AM");
    const bnText = draftUpdatedAt("2026-10-31T15:05:00.000Z", "bn", "UTC");
    expect(bnText).toContain("৩১");
    expect(bnText).toContain("১৫:০৫");
    expect(bnText).not.toMatch(/[0-9]|AM|PM/);
    expect(draftUpdatedAt("garbage", "en")).toBe("garbage");
  });

  it("names the country in the UI language", () => {
    expect(countryName("IN", "en")).toBe("India");
    expect(countryName("IN", "bn")).toBe("ভারত");
    expect(countryName("XK", "en")).toBe("Kosovo");
  });

  it("takes the ISO date part for the formatter", () => {
    expect(isoDatePart("2026-10-31T09:12:00.000Z")).toBe("2026-10-31");
    expect(fEn.asOf(isoDatePart("2026-10-31T09:12:00.000Z"))).toBe("Oct 2026");
  });
});

describe("save outcome (no duplicates)", () => {
  it("is none for empty answers, new for unseen answers, existing for the same answers", () => {
    expect(saveOutcome(stateWith({}))).toBe("none");
    expect(hasAnswers(stateWith({}))).toBe(false);
    expect(currentHash(stateWith({}))).toBeNull();

    const s = stateWith(full);
    expect(hasAnswers(s)).toBe(true);
    expect(saveOutcome(s)).toBe("new");

    const { drafts } = upsertDraft([], full, "2026-10-31T00:00:00Z", () => "d1");
    expect(saveOutcome(stateWith(full, drafts))).toBe("existing");
    // The same answers typed again (new goal ids, other UI language) are still the same draft.
    const retyped: DraftAnswers = { ...full, locale: "bn", m5: { goals: [goal("x1"), goal("x2")] } };
    expect(saveOutcome(stateWith(retyped, drafts))).toBe("existing");
    expect(currentHash(stateWith(retyped, drafts))).toBe(drafts[0]!.hash);
    // Different answers are a new draft.
    expect(saveOutcome(stateWith({ ...full, profile: { ...full.profile, takeHome: 80000 } }, drafts))).toBe("new");
  });
});

describe("onboarding defaults only", () => {
  it("is true for empty answers and for the defaults question 1 writes", () => {
    expect(onlyOnboardingDefaults(base)).toBe(true);
    expect(onlyOnboardingDefaults({ ...base, profile: { ...PROFILE_DEFAULTS } })).toBe(true);
    expect(onlyOnboardingDefaults({ ...base, profile: { ...PROFILE_DEFAULTS, takeHome: undefined } })).toBe(true);
  });

  it("is false once anything was typed or changed", () => {
    expect(onlyOnboardingDefaults({ ...base, profile: { ...PROFILE_DEFAULTS, age: 45 } })).toBe(false);
    expect(onlyOnboardingDefaults({ ...base, profile: { ...PROFILE_DEFAULTS, takeHome: 40000 } })).toBe(false);
    expect(onlyOnboardingDefaults({ ...base, profile: { ...PROFILE_DEFAULTS, dependents: ["parents"] } })).toBe(false);
    expect(onlyOnboardingDefaults({ ...base, profile: { ...PROFILE_DEFAULTS }, m1: { liquidSavings: 1000 } })).toBe(false);
    expect(onlyOnboardingDefaults(full)).toBe(false);
  });

  it("answers that are only the onboarding defaults leave nothing to save", () => {
    expect(saveOutcome(stateWith({ ...base, profile: { ...PROFILE_DEFAULTS } }))).toBe("none");
  });
});
