/**
 * Every key the engine can emit must resolve to a non-empty string in both dictionaries,
 * and the Bangla dictionary must have exactly the English key set.
 */
import {
  M1_NEXT_KEYS,
  M1_RULE_KEYS,
  M1_STEP_IDS,
  M3_PATH_KEYS,
  M3_STEP_IDS,
  M4_NOTE_KEYS,
  M4_STEP_IDS,
  M5_NOTE_KEYS,
  M5_STEP_IDS,
  PLAN_NEXT_KEYS,
  PLAN_REASON_KEYS,
  PLAN_STEP_IDS,
  type BucketInstrument,
  type DebtFlagId,
  type Dependent,
  type GoalType,
  type Horizon,
  type IncomeType,
  type Instrument,
  type LoanType,
  type Status,
  LOCALES,
} from "@taka/engine";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultLocale, isLocale, LOCALE_META, locales, type Locale } from "@/lib/i18n/config";
import { bangladeshEn } from "@/lib/i18n/dictionaries/en/bangladesh";
import { bn } from "@/lib/i18n/dictionaries/bn";
import { en } from "@/lib/i18n/dictionaries/en";
import { getDictionary } from "@/lib/i18n/server";
import { getPath, interpolate, resetMissingKeyWarnings, translate } from "@/lib/i18n/translate";
import { createFormatters } from "@/lib/i18n/useFormat";

const dicts = { en, bn } as const;
type DictName = keyof typeof dicts;
const names = Object.keys(dicts) as DictName[];

/** Exhaustive lists of the engine's union types (a compile error here means the union changed). */
const INSTRUMENTS: Instrument[] = ["savings_account", "fdr_3m", "fdr_1y", "dps", "sanchayapatra_5y", "tbill_91d", "tbond_5y", "tbond_10y", "equity_fund", "gold"];
const BUCKET_EXTRA: Exclude<BucketInstrument, Instrument>[] = ["loan_prepayment", "term_insurance"];
const DEBT_FLAGS: DebtFlagId[] = ["card_carried", "card_utilisation", "emi_ratio", "negative_capacity"];
const STATUSES: Status[] = ["red", "amber", "green"];
const INCOME_TYPES: IncomeType[] = ["salaried", "freelance", "business"];
const DEPENDENTS: Dependent[] = ["partner", "children", "parents"];
const GOAL_TYPES: GoalType[] = ["general", "education", "health", "wedding", "vehicle", "home", "travel"];
const LOAN_TYPES: LoanType[] = ["personal", "home", "car", "education", "other"];
const HORIZONS: Horizon[] = ["short", "medium", "long"];
const TERMS = ["fdr", "dps", "sanchayapatra", "bo_account", "sum_insured", "emi", "cib", "tbill", "tbond", "ladder", "real_return", "take_home", "grace_period"];

function leafPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => leafPaths(v, prefix ? `${prefix}.${k}` : k));
}

function expectString(dict: unknown, key: string, name: string) {
  const v = getPath(dict, key);
  expect(typeof v, `${name}: ${key} should be a string`).toBe("string");
  expect((v as string).trim().length, `${name}: ${key} should not be empty`).toBeGreaterThan(0);
}

/** "m1.target" → "explain.m1.target" */
const explainKey = (stepId: string) => `explain.${stepId}`;

describe("i18n config", () => {
  it("has bn as the default and the same twelve locales as the engine", () => {
    expect([...locales]).toEqual([...LOCALES]);
    expect(locales).toHaveLength(12);
    expect(defaultLocale).toBe("bn");
    expect(isLocale("bn")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    for (const l of locales) expect(LOCALE_META[l].nativeName.length).toBeGreaterThan(0);
    expect(LOCALE_META.ar.dir).toBe("rtl");
    expect(LOCALE_META.ur.dir).toBe("rtl");
  });

  it("getDictionary loads each locale", async () => {
    expect(await getDictionary("en")).toBe(en);
    expect(await getDictionary("bn")).toBe(bn);
    for (const l of locales) expect(await getDictionary(l)).toBeTruthy();
  });

  it("every locale's dictionary has exactly the English key set and placeholders", async () => {
    const enKeys = leafPaths(en).sort();
    const slots = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const l of locales) {
      const d = await getDictionary(l);
      expect(leafPaths(d).sort(), `${l} key set`).toEqual(enKeys);
      const bad = enKeys.filter((k) => JSON.stringify(slots(getPath(en, k) as string)) !== JSON.stringify(slots(getPath(d, k) as string)));
      expect(bad, `${l} placeholders`).toEqual([]);
    }
  });
});

describe("dictionary key parity", () => {
  it("bn has exactly the same key set as en", () => {
    const enKeys = leafPaths(en).sort();
    const bnKeys = leafPaths(bn).sort();
    const missingInBn = enKeys.filter((k) => !bnKeys.includes(k));
    const extraInBn = bnKeys.filter((k) => !enKeys.includes(k));
    expect(missingInBn, "keys missing in bn").toEqual([]);
    expect(extraInBn, "extra keys in bn").toEqual([]);
  });

  it.each(names)("%s has no empty strings anywhere", (name) => {
    const empty = leafPaths(dicts[name]).filter((k) => {
      const v = getPath(dicts[name], k);
      return typeof v !== "string" || v.trim().length === 0;
    });
    expect(empty).toEqual([]);
  });

  it("bn and en use the same placeholders in every string", () => {
    const slots = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const mismatched = leafPaths(en).filter((k) => {
      const a = slots(getPath(en, k) as string);
      const b = slots(getPath(bn, k) as string);
      return JSON.stringify(a) !== JSON.stringify(b);
    });
    expect(mismatched).toEqual([]);
  });
});

describe.each(names)("engine keys resolve in %s", (name) => {
  const dict = dicts[name];

  it.each([...M1_STEP_IDS, ...M3_STEP_IDS, ...M4_STEP_IDS, ...M5_STEP_IDS, ...PLAN_STEP_IDS])("explain step %s has title and body", (id) => {
    expectString(dict, `${explainKey(id)}.title`, name);
    expectString(dict, `${explainKey(id)}.body`, name);
  });

  it.each([...M1_RULE_KEYS, ...M1_NEXT_KEYS, ...M3_PATH_KEYS, ...M4_NOTE_KEYS, ...M5_NOTE_KEYS, ...PLAN_REASON_KEYS, ...PLAN_NEXT_KEYS])("%s", (key) => {
    expectString(dict, key, name);
  });

  it.each([...INSTRUMENTS, ...BUCKET_EXTRA])("common.instrument.%s", (i) => {
    expectString(dict, `common.instrument.${i}`, name);
  });

  it.each(DEBT_FLAGS)("m3.flag.%s has title and body", (id) => {
    expectString(dict, `m3.flag.${id}.title`, name);
    expectString(dict, `m3.flag.${id}.body`, name);
  });

  it.each(STATUSES)("common.status.%s", (s) => expectString(dict, `common.status.${s}`, name));
  it.each(INCOME_TYPES)("common.incomeType.%s", (s) => expectString(dict, `common.incomeType.${s}`, name));
  it.each([...DEPENDENTS, "none"])("common.dependent.%s", (s) => expectString(dict, `common.dependent.${s}`, name));
  it.each(GOAL_TYPES)("common.goalType.%s", (s) => expectString(dict, `common.goalType.${s}`, name));
  it.each(LOAN_TYPES)("common.loanType.%s", (s) => expectString(dict, `common.loanType.${s}`, name));
  it.each(HORIZONS)("common.horizon.%s", (s) => expectString(dict, `common.horizon.${s}`, name));

  it.each(TERMS)("terms.%s has title and body", (term) => {
    expectString(dict, `terms.${term}.title`, name);
    expectString(dict, `terms.${term}.body`, name);
  });

  it("has the fixed common / onboarding / plan / admin / errors keys other code depends on", () => {
    for (const key of [
      "common.appName",
      "common.tagline",
      "common.button.next",
      "common.button.back",
      "common.button.seePlan",
      "common.button.whyThisNumber",
      "common.alsoNeedsAttention",
      "common.unit.month",
      "common.unit.months",
      "common.unit.year",
      "common.unit.years",
      "common.unit.perMonth",
      "common.offline",
      "common.ratesVersion",
      "common.mayBeOutdated",
      "common.ourAssumption",
      "common.source",
      "common.asOf",
      "common.disclaimer.short",
      "common.disclaimer.title",
      "common.disclaimer.body",
      "common.disclaimer.accept",
      "common.language.bn",
      "common.language.en",
      "onboarding.languagePick.title",
      "onboarding.languagePick.subtitle",
      "onboarding.step.1.title",
      "onboarding.step.2.hintFreelance",
      "onboarding.step.3.hint",
      "onboarding.step.4.none",
      "onboarding.step.5.title",
      "onboarding.progress",
      "onboarding.cta.seePlan",
      "plan.headline",
      "plan.subhead",
      "plan.emptyGoals",
      "plan.summary.emergencyShare",
      "plan.summary.monthsToFull",
      "plan.summary.goalsShortfall",
      "plan.demoBanner",
      "plan.next.keepFull",
      "plan.reason.emergency",
      "plan.reason.debt",
      "explain.plan.emergencyShare.title",
      "explain.plan.emergencyShare.body",
      "explain.plan.goalAllocation.title",
      "explain.plan.goalAllocation.body",
      "m3.result.maxLoanNote",
      "admin.action.publish",
      "admin.preview.profile.first_job",
      "admin.preview.profile.freelancer",
      "admin.preview.profile.family_with_debt",
      "errors.generic",
      "errors.offline",
      "errors.engineNotReady",
      "errors.invalidInput",
      "errors.notFound",
      "errors.unauthorized",
    ]) {
      expectString(dict, key, name);
    }
    expect(getPath(dict, "common.language.bn")).toBe("বাংলা");
    expect(getPath(dict, "common.language.en")).toBe("English");
  });

  it("plan templates carry the contract placeholders", () => {
    const slots = (key: string) => [...new Set([...(getPath(dict, key) as string).matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();
    expect(slots("explain.plan.emergencyShare.body")).toEqual(["gap", "m1Monthly", "maxShare", "minShare", "result", "total"]);
    expect(slots("explain.plan.goalAllocation.body")).toEqual(["goalsNeed", "need", "remaining", "result"]);
    expect(slots("plan.reason.emergency")).toEqual(["amount", "covered", "instrument", "months"]);
    expect(slots("plan.reason.debt")).toEqual(["amount", "months", "rate"]);
    expect(slots("m3.result.maxLoanNote")).toEqual(["emi", "loan", "months", "rate"]);
    expect(getPath(dict, "plan.demoBanner")).not.toContain("?demo");
  });
});

describe("text every country sees does not assume Bangladesh", () => {
  // The currency's name in each language. Bangla is left out: there টাকা is simply the word for money.
  const TAKA_WORD: Partial<Record<Locale, RegExp>> = {
    en: /\btakas?\b/i,
    es: /\btakas?\b/i,
    fr: /\btakas?\b/i,
    pt: /\btakas?\b/i,
    id: /\btakas?\b/i,
    sw: /\btakas?\b/i,
    ar: /تاكا/,
    ur: /(?<![\u0600-\u06FF])ٹک(?:ا|ے|وں)(?![\u0600-\u06FF])/,
    hi: /(?<![\u0900-\u097F])ट(?:का|के)(?![\u0900-\u097F])/,
    zh: /塔卡/,
    ru: /(?<![а-яё-])так[аеиу](?![а-яё])/i,
  };
  // Allowed: the admin, the notice that really does fall back to taka, and the list shown only for Bangladesh.
  const allowed = (key: string) => key.startsWith("admin.") || key === "common.countryNotice.noData" || key.startsWith("about.sources.unverified");

  it("no text outside the allowed places names the taka", async () => {
    for (const l of locales) {
      const pattern = TAKA_WORD[l];
      if (!pattern) continue;
      const d = await getDictionary(l);
      const bad = leafPaths(d).filter((k) => !allowed(k) && pattern.test(String(getPath(d, k)).replace(/Taka Plan/g, "")));
      expect(bad, `${l} names the taka`).toEqual([]);
    }
  });

  // Bangla is left out: it keeps the names people in Bangladesh know, as its glossary test below requires.
  it("no text outside the allowed places uses Bangladeshi product names or institutions", async () => {
    const names = /\b(?:FDRs?|DPS|CIB|BO)\b|Sanchayapatra|سنچیاپترا|Bangladesh Bank|بنك بنغلاديش|बांग्लादेश बैंक|بنگلہ دیش بینک/;
    const allowedHere = (key: string) => allowed(key) || key.startsWith("about.sources.group");
    for (const l of locales) {
      if (l === "bn") continue;
      const d = await getDictionary(l);
      const bad = leafPaths(d).filter((k) => !allowedHere(k) && names.test(String(getPath(d, k))));
      expect(bad, `${l} uses Bangladeshi names`).toEqual([]);
    }
  });

  it("Bangladesh in English keeps a glossary entry for every name the generic text replaced", () => {
    expect(Object.keys(bangladeshEn.terms).sort()).toEqual(["bo_account", "cib", "dps", "fdr", "ladder", "real_return", "sanchayapatra", "tbill", "tbond"]);
    for (const [k, v] of Object.entries(bangladeshEn.terms)) expect(leafPaths(en), k).toContain(`terms.${k}.title`), expect(v.body.length).toBeGreaterThan(0);
    expect(bangladeshEn.terms.fdr.title).toMatch(/^FDR/);
    expect(bangladeshEn.terms.cib.body).toMatch(/Bangladesh Bank/);
  });

  it("the about page's opening line is not addressed to Bangladesh", async () => {
    expect(en.about.lead).not.toMatch(/Bangladesh/);
    for (const l of locales) expect((await getDictionary(l)).about.lead, `${l} lead`).not.toMatch(/\bBO\b|বিও/);
  });
});

describe("translate", () => {
  afterEach(() => {
    resetMissingKeyWarnings();
    vi.restoreAllMocks();
  });

  it("interpolates {params} with pre-formatted values", () => {
    expect(translate(en, "plan.headline", { amount: "৳9,000" })).toBe("Save ৳9,000 a month");
    expect(translate(bn, "plan.headline", { amount: "৳৯,০০০" })).toBe("মাসে ৳৯,০০০ সঞ্চয় করুন");
    expect(translate(en, "common.ratesVersion", { version: 3, asOf: "Oct 2026" })).toBe("Rates v3, Oct 2026");
  });

  it("leaves unknown slots visible and ignores extra params", () => {
    expect(interpolate("{a} and {b}", { a: "x" })).toBe("x and {b}");
    expect(interpolate("plain", { a: "x" })).toBe("plain");
  });

  it("returns the key itself for a missing key and warns once per key", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(translate(en, "nope.missing")).toBe("nope.missing");
    expect(translate(en, "nope.missing")).toBe("nope.missing");
    expect(translate(en, "m1")).toBe("m1"); // a sub-object, not a string
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("getPath walks nested objects and returns undefined for bad paths", () => {
    expect(getPath(en, "common.status.red")).toBe("Needs attention now");
    expect(getPath(en, "common.status.purple")).toBeUndefined();
    expect(getPath(en, "common.status.red.deeper")).toBeUndefined();
    expect(getPath(null, "a")).toBeUndefined();
  });
});

describe("createFormatters", () => {
  it("uses Bangla digits in bn and Latin digits in en", () => {
    const bnF = createFormatters("bn");
    const enF = createFormatters("en");
    expect(bnF.digits).toBe("bn");
    expect(enF.digits).toBe("latn");
    expect(enF.taka(1250000)).toBe("৳12,50,000");
    expect(bnF.taka(1250000)).toBe("৳১২,৫০,০০০");
    expect(enF.taka(1250000, { compact: true })).toBe("৳12.5 lakh");
    expect(bnF.percent(0.0834)).toBe("৮.৩%");
    expect(enF.months(1)).toBe("1 month");
    expect(bnF.months(8)).toBe("৮ মাস");
    expect(enF.asOf("2026-09-30")).toBe("Sep 2026");
    expect(bnF.asOf("2026-09-30")).toBe("সেপ্টেম্বর ২০২৬");
  });
});

/* ---- Bangla policy (i18n-bn slice; rules in docs/BANGLA-STYLE.md) ---- */

const LATIN_DIGIT = /[0-9]/;
/** Latin words that must never appear in a Bangla string: the formatters emit লাখ / কোটি / মাস instead. */
const LATIN_UNIT_WORDS = /\b(lakh|lakhs|lac|crore|crores|month|months)\b/i;
/** Namespaces the i18n-bn slice has reviewed against the full checklist; extend as other files pass review. */
const REVIEWED_BN_NAMESPACES = ["common", "onboarding", "plan", "m1", "m3", "m4", "m5", "explain", "terms", "admin", "errors", "about"] as const;

describe("Bangla digits and units", () => {
  const bnF = createFormatters("bn");

  it.each([
    ["taka grouped", bnF.taka(1250000)],
    ["taka small", bnF.taka(500)],
    ["taka zero", bnF.taka(0)],
    ["taka negative", bnF.taka(-17800)],
    ["taka signed", bnF.taka(9000, { sign: true })],
    ["taka compact lakh", bnF.taka(900000, { compact: true })],
    ["taka compact crore", bnF.taka(12_000_000, { compact: true })],
    ["taka compact below lakh", bnF.taka(99_999, { compact: true })],
    ["percent", bnF.percent(0.0834)],
    ["percent negative", bnF.percent(-0.0147)],
    ["percent 2dp", bnF.percent(0.1183, 2)],
    ["percent 0dp", bnF.percent(0.6, 0)],
    ["number", bnF.number(3)],
    ["number decimals", bnF.number(72.3, 1)],
    ["months whole", bnF.months(8)],
    ["months fraction", bnF.months(2.5)],
    ["asOf", bnF.asOf("2026-09-30")],
    ["asOf december", bnF.asOf("2027-12-31")],
  ])("%s → %s has no Latin digits", (_label, formatted) => {
    expect(formatted).not.toMatch(LATIN_DIGIT);
    expect(formatted).toMatch(/[০-৯]/);
  });

  it("compact Bangla amounts use লাখ / কোটি and months use মাস, never the Latin words", () => {
    expect(bnF.taka(900000, { compact: true })).toBe("৳৯.০ লাখ");
    expect(bnF.taka(12_000_000, { compact: true })).toBe("৳১.২ কোটি");
    expect(bnF.months(8)).toBe("৮ মাস");
    for (const s of [bnF.taka(900000, { compact: true }), bnF.taka(12_000_000, { compact: true }), bnF.months(8)]) {
      expect(s).not.toMatch(LATIN_UNIT_WORDS);
    }
  });

  it("no bn dictionary string contains the Latin words lakh / crore / month", () => {
    const withoutSlots = (s: string) => s.replace(/\{\w+\}/g, "");
    const offenders = leafPaths(bn).filter((k) => LATIN_UNIT_WORDS.test(withoutSlots(getPath(bn, k) as string)));
    expect(offenders).toEqual([]);
  });

  it("reviewed bn namespaces contain no Latin digits (placeholders such as {months} or {tier1} are fine)", () => {
    const withoutSlots = (s: string) => s.replace(/\{\w+\}/g, "");
    const offenders = REVIEWED_BN_NAMESPACES.flatMap((ns) => leafPaths(bn[ns], ns).filter((k) => LATIN_DIGIT.test(withoutSlots(getPath(bn, k) as string))));
    expect(offenders).toEqual([]);
  });

  it("reviewed bn namespaces use the formal আপনি register, never তুমি / তুই", () => {
    const informal = /(^|[\s,।;—-])(তুমি|তোমার|তোমাকে|তুই|তোর|তোকে)([\s,।;—-]|$)/;
    const offenders = REVIEWED_BN_NAMESPACES.flatMap((ns) => leafPaths(bn[ns], ns).filter((k) => informal.test(getPath(bn, k) as string)));
    expect(offenders).toEqual([]);
  });

  it("the 13 glossary terms carry the agreed Bangla names", () => {
    const expectedTitles: Record<string, string> = {
      fdr: "এফডিআর",
      dps: "ডিপিএস",
      sanchayapatra: "সঞ্চয়পত্র",
      bo_account: "বিও অ্যাকাউন্ট",
      sum_insured: "বিমা অঙ্ক",
      emi: "ইএমআই",
      cib: "সিআইবি",
      tbill: "ট্রেজারি বিল",
      tbond: "ট্রেজারি বন্ড",
      ladder: "এফডিআর ল্যাডার",
      real_return: "প্রকৃত মুনাফা",
      take_home: "টেক-হোম",
      grace_period: "গ্রেস পিরিয়ড",
    };
    for (const term of TERMS) {
      expect(getPath(bn, `terms.${term}.title`), term).toContain(expectedTitles[term]);
    }
  });
});
